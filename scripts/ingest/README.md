# Bonxosh catalog ingestion

Fills the Bonxosh fragrance database (Supabase) with perfumes from
[Parfumo](https://www.parfumo.com), using the
[fragscrape](https://github.com/HurleySk/fragscrape) scraper.

```
fragscrape (headless Chrome → parfumo.com)
        │  local HTTP, started by ingest.js
        ▼
ingest.js ── map.js ──► Supabase `fragrances` table ◄── website (catalog.js, read-only)
```

The website never scrapes. It only reads the database, so it stays fast
and Parfumo never sees your visitors' traffic.

## One-time setup

1. **Create a Supabase project** at https://supabase.com (the free tier is fine).
2. **Create the table.** Open Supabase → SQL Editor, paste all of
   [`supabase/schema.sql`](../../supabase/schema.sql), and click Run.
   It's safe to run again later.
3. **Connect the website.** Supabase → Project Settings → API. Copy the
   *Project URL* and the **anon / public** key into [`config.js`](../../config.js),
   then commit. The anon key is public by design, because the database only
   lets browsers read.
4. **Give the importer its secret key.** Copy `.env.example` to `.env` in
   this folder. Fill in `SUPABASE_URL` and the **service_role** key, which
   is secret. `.env` is git-ignored; never commit it or put it in `config.js`.
5. **Install:** `cd scripts/ingest && npm install` (needs Node 18+; this
   also downloads the Chrome that fragscrape uses).

## Running

```bash
# try it: scrape 3 Lattafa perfumes, print them, write nothing
npm run ingest -- --brands Lattafa --limit 3 --dry-run

# small real batch
npm run ingest -- --brands "Lattafa,Armaf,Rasasi" --limit 50

# every brand in brands.txt (takes hours: ~3–5 s per perfume)
npm run ingest

# Parfumo's most popular perfumes: N pages × 100, for men, women and unisex
npm run ingest -- --rankings 5
```

| Flag | Default | Meaning |
|---|---|---|
| `--brands <file or "A,B">` | `brands.txt` | Brands to crawl, spelled as on Parfumo |
| `--rankings <pages>` | 0 | Also crawl the popularity rankings |
| `--limit <n>` | no limit | Max perfumes to scrape this run |
| `--refresh-days <n>` | 30 | Re-scrape perfumes older than this; skip fresher ones |
| `--delay <ms>` | 1000 | Extra polite delay between perfumes, on top of fragscrape's own 1.5–3 s |
| `--dry-run` | off | Print instead of writing to Supabase |

- **Resumable:** stop anytime with Ctrl-C. Anything already scraped is
  saved, and the next run skips perfumes that are still fresh. Brand
  listings are cached in `.cache/`.
- **Brand spelling:** the log shows `← check the Parfumo brand spelling`
  for any brand that returns 0 perfumes. Look up the brand on parfumo.com
  and copy its name from the URL, e.g. `parfumo.com/Perfumes/Parfums_de_Marly`
  becomes `Parfums de Marly`.
- **If Parfumo blocks you** (the run stops after 10 failures in a row):
  wait a few hours, raise `--delay`, or set `DECODO_PROXY_URL` in `.env`
  to use a rotating proxy.

## Notes

- Scores (`rating`, `longevity`, `sillage`, `price_value`) are stored on
  Parfumo's 0–10 scale. `catalog.js` converts them to the site's stars and
  meters.
- Parfumo's terms of use don't allow automated scraping. Keep the crawl
  slow, and treat this as a way to bootstrap the catalog rather than a
  permanent feed.
- Tests: `npm test` (checks the Parfumo → database mapping).
