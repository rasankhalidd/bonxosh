/* ============================================================
   BONXOSH — public runtime config
   The Supabase URL and anon key are PUBLIC by design: row-level
   security only lets the anon role read the fragrance catalog.
   Never put the service-role key here — that one stays in
   scripts/ingest/.env.
   Leave these blank and the site runs on the data.js seed only.
   ============================================================ */
window.BX_CONFIG = {
  SUPABASE_URL: "https://tiggijeszrzjnxynwphy.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpZ2dpamVzenJ6am54eW53cGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1ODQ4NjksImV4cCI6MjEwNjE2MDg2OX0.HOxw7SzN3FWsX0Uio8pYZ8l7x8ZarYjvbMxWlQESFac",
};
