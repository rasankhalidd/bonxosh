-- ============================================================
-- BONXOSH — fragrance catalog schema (Supabase / Postgres)
-- Run once in the Supabase SQL editor. Safe to re-run.
-- Filled by scripts/ingest (fragscrape → Parfumo).
-- Scores (rating, longevity, sillage, price_value) are stored on
-- Parfumo's native 0–10 scale; catalog.js rescales for the UI.
-- ============================================================

create extension if not exists pg_trgm;

-- array_to_string is only STABLE; wrap it so generated columns can use it
create or replace function bx_join(arr text[]) returns text
  language sql immutable parallel safe
  as $$ select coalesce(array_to_string(arr, ' '), '') $$;

create table if not exists fragrances (
  id                text primary key,          -- slug, e.g. "creed-aventus"
  name              text not null,
  house             text not null,
  year              int,
  gender            text,                      -- male | female | unisex
  concentration     text,
  description       text,
  perfumer          text,
  accords           text[] not null default '{}',
  notes_top         text[] not null default '{}',
  notes_heart       text[] not null default '{}',
  notes_base        text[] not null default '{}',
  rating            numeric(4,2),              -- 0–10
  votes             int,
  longevity         numeric(4,2),              -- 0–10
  sillage           numeric(4,2),              -- 0–10
  price_value       numeric(4,2),              -- 0–10
  production_status text,
  rank              int,
  image_url         text,
  source            text not null default 'parfumo',
  source_url        text unique,
  scraped_at        timestamptz,
  updated_at        timestamptz not null default now(),
  search tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(house, '')), 'A') ||
    setweight(to_tsvector('simple', bx_join(accords)), 'B') ||
    setweight(to_tsvector('simple', bx_join(notes_top) || ' ' || bx_join(notes_heart) || ' ' || bx_join(notes_base)), 'C')
  ) stored
);

create index if not exists fragrances_search_idx on fragrances using gin (search);
create index if not exists fragrances_label_trgm on fragrances using gin ((name || ' ' || house) gin_trgm_ops);
create index if not exists fragrances_house_idx on fragrances (lower(house));
create index if not exists fragrances_votes_idx on fragrances (votes desc nulls last);

-- ---- access: browsers may read, only the service role may write ----
grant select on fragrances to anon, authenticated;
alter table fragrances enable row level security;
drop policy if exists "catalog is public" on fragrances;
create policy "catalog is public" on fragrances for select to anon, authenticated using (true);

-- ---- search: full-text + substring + typo-tolerant trigram ---------
-- "aventos" → Aventus, "khamra" → Khamrah, "lattafa" → all Lattafa
create or replace function search_fragrances(q text, lim int default 20)
returns setof fragrances
language sql stable
as $$
  with t as (select trim(q) as q)
  select f.*
  from fragrances f, t
  where length(t.q) >= 2 and (
       f.search @@ websearch_to_tsquery('simple', t.q)
    or (f.name || ' ' || f.house) ilike '%' || t.q || '%'
    or t.q <% (f.name || ' ' || f.house)
  )
  order by
    (f.name ilike t.q || '%') desc,
    ts_rank(f.search, websearch_to_tsquery('simple', t.q))
      + word_similarity(t.q, f.name || ' ' || f.house) desc,
    f.votes desc nulls last
  limit least(greatest(coalesce(lim, 20), 1), 50);
$$;

grant execute on function search_fragrances(text, int) to anon, authenticated;
