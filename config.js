/* ============================================================
   BONXOSH — public runtime config
   The Supabase URL and anon key are PUBLIC by design: row-level
   security only lets the anon role read the fragrance catalog.
   Never put the service-role key here — that one stays in
   scripts/ingest/.env.
   Leave these blank and the site runs on the data.js seed only.
   ============================================================ */
window.BX_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
};
