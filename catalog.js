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
  function meter(v) {
    const n = parseFloat(v);
    return isNaN(n) ? 55 : Math.round(Math.max(0, Math.min(10, n)) * 10);
  }
  function distFrom(r) {
    // synthesize a plausible [5,4,3,2,1] %% spread from a 0–5 rating
    const five = Math.max(8, Math.min(80, Math.round((r - 2.5) * 32)));
    const four = Math.round((100 - five) * 0.5);
    const three = Math.round((100 - five - four) * 0.55);
    const two = Math.round((100 - five - four - three) * 0.6);
    const one = Math.max(0, 100 - five - four - three - two);
    return [five, four, three, two, one];
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
    const rating = row.rating != null ? Math.round((row.rating / 2) * 10) / 10 : 4.0;
    const f = {
      id: row.id,
      name: row.name,
      house: row.house,
      year: row.year || "",
      gender: genderMap(row.gender),
      accords: accords.length ? accords : ["woody"],
      price: null,                  // Parfumo has no retail price
      rating,
      votes: row.votes || 0,
      dist: distFrom(rating),
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

  function cacheGet(id) { return cacheById[id] || null; }

  window.Catalog = { status, search, getFragrance, count, cacheGet, mapRow, isAvailable: () => !!client };
})();
