# bonxosh
Kurdish Fragrance Reselling MarketPlace

## Stack

- **Frontend:** static React (no build step), served by GitHub Pages. Entry points are `index.html` and `Bonxosh.html`.
- **Fragrance catalog:** a Supabase (Postgres) `fragrances` table that the browser reads directly (`catalog.js`, `config.js`). The schema is in [`supabase/schema.sql`](supabase/schema.sql).
- **Catalog data:** scraped from Parfumo with [fragscrape](https://github.com/HurleySk/fragscrape). See [`scripts/ingest`](scripts/ingest/README.md).
- **Seed data:** `data.js` holds the demo listings, sellers and shops. When `config.js` is empty, the site runs on this seed alone.

## Local dev

```bash
node serve.js   # → http://localhost:5173/Bonxosh.html
```
