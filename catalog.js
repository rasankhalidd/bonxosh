/* ============================================================
   BONXOSH — fragrance catalog client (Supabase)
   Reads the `fragrances` table that scripts/ingest fills from
   Parfumo (via fragscrape). Talks to Supabase directly with the
   public anon key — RLS makes the table read-only for browsers.
   Maps DB rows into Bonxosh's fragrance objects.
   ============================================================ */
(function () {
  const cfg = window.BX_CONFIG || {};
  const client = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase
    ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, { auth: { persistSession: false } })
    : null;

  const cacheById = {};            // mapped fragrances by id
  let _count = null;

  // ---- field mappers --------------------------------------------------
  // Parfumo scores are 0–10; Bonxosh shows stars 0–5 and meters 0–100.
  function genderMap(g) {
    return g === "male" ? "Masc" : g === "female" ? "Fem" : "Unisex";
  }
  // unknown stays null so the page can hide it rather than show a guess
  function meter(v) {
    const n = parseFloat(v);
    return isNaN(n) ? null : Math.round(Math.max(0, Math.min(10, n)) * 10);
  }
  function stars(v) {
    const n = parseFloat(v);
    return isNaN(n) ? null : Math.round((n / 2) * 10) / 10;
  }
  function buildBlurb(row, accords) {
    if (row.description) return row.description;
    const a = accords.slice(0, 3).join(", ");
    const c = row.concentration ? ` ${row.concentration}.` : "";
    return `${row.house} ${row.name}${row.year ? ` (${row.year})` : ""} — ${a || "a fragrance"}.${c}`;
  }

  function mapRow(row) {
    if (!row || !row.id) return null;
    const accords = (row.accords || []).map((a) => String(a).toLowerCase());
    const f = {
      id: row.id,
      name: row.name,
      house: row.house,
      year: row.year || "",
      gender: genderMap(row.gender),
      accords: accords.length ? accords : ["woody"],
      price: null,                  // Parfumo has no retail price
      rating: stars(row.rating),
      votes: row.votes || 0,
      longevity: meter(row.longevity),
      sillage: meter(row.sillage),
      value: meter(row.price_value),
      blurb: buildBlurb(row, accords),
      notes: {
        top: row.notes_top || [],
        heart: row.notes_heart || [],
        base: row.notes_base || [],
      },
      image: row.image_url || null,
      perfumer: row.perfumer || null,
      sourceUrl: row.source_url || null,
      remote: true,
    };
    cacheById[f.id] = f;
    // make catalog picks resolvable everywhere the app looks up BX.fById
    if (window.BX && !window.BX.fById[f.id]) window.BX.fById[f.id] = f;
    return f;
  }

  // ---- queries --------------------------------------------------------
  async function status() { return !!client; }

  async function search(q, limit = 20) {
    if (!client) return { results: [], status: 503, error: "no_config" };
    const { data, error } = await client.rpc("search_fragrances", { q, lim: limit });
    // schema not installed yet (unknown function/table) → treat as not connected
    if (error && /^(PGRST20[25]|42P01|42883)$/.test(error.code || "")) return { results: [], status: 503, error: "no_schema" };
    if (error) return { results: [], status: 500, error: error.message };
    return { results: (data || []).map(mapRow).filter(Boolean), status: 200 };
  }

  async function getFragrance(id) {
    if (cacheById[id]) return cacheById[id];
    if (!client) return null;
    const { data, error } = await client.from("fragrances").select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;
    return mapRow(data);
  }

  async function count() {
    if (_count != null) return _count;
    if (!client) return null;
    const { count: n, error } = await client.from("fragrances").select("id", { count: "estimated", head: true });
    if (error) return null;
    return (_count = n);
  }

  // The data.js demo fragrances carry hand-written numbers and no photos.
  // Once each one's catalog twin (same name + house, most-rated if several)
  // has been imported, replace those with the twin's real Parfumo data.
  async function enrichSeed() {
    const seed = (window.BX && window.BX.fragrances) || [];
    const need = seed.filter((f) => !f.enriched);
    if (!client || !need.length) return 0;
    const { data, error } = await client.from("fragrances")
      .select("*")
      .in("name", [...new Set(need.map((f) => f.name))]);
    if (error || !data) return 0;
    const key = (name, house) => (name + "|" + house).toLowerCase();
    const best = {};
    data.forEach((r) => {
      const k = key(r.name, r.house);
      if (!best[k] || (r.votes || 0) > (best[k].votes || 0)) best[k] = r;
    });
    let n = 0;
    need.forEach((f) => {
      const r = best[key(f.name, f.house)];
      if (!r) return;
      const accords = (r.accords || []).map((a) => String(a).toLowerCase());
      Object.assign(f, {
        image: r.image_url || f.image || null,
        rating: stars(r.rating),
        votes: r.votes || 0,
        longevity: meter(r.longevity),
        sillage: meter(r.sillage),
        value: meter(r.price_value),
        year: r.year || f.year,
        gender: r.gender ? genderMap(r.gender) : f.gender,
        perfumer: r.perfumer || null,
        sourceUrl: r.source_url || null,
        enriched: true,
      });
      if (accords.length) f.accords = accords;
      if ((r.notes_top || []).length + (r.notes_heart || []).length + (r.notes_base || []).length)
        f.notes = { top: r.notes_top || [], heart: r.notes_heart || [], base: r.notes_base || [] };
      n++;
    });
    return n;
  }

  function cacheGet(id) { return cacheById[id] || null; }

  window.Catalog = { status, search, getFragrance, count, cacheGet, mapRow, enrichSeed, isAvailable: () => !!client };
})();
