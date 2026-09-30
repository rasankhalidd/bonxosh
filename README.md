# bonxosh
Kurdish Fragrance Reselling MarketPlace

## Stack

- **Frontend:** React, bundled by esbuild into one minified file under `dist/` and served as-is by GitHub Pages. The source is the `.jsx`/`.js` files in the repo root plus `styles.css`; the bundle entry is [`src/main.js`](src/main.js).
- **Fragrance catalog:** a Supabase (Postgres) `fragrances` table that the browser reads directly (`catalog.js`, `config.js`). The schema is in [`supabase/schema.sql`](supabase/schema.sql).
- **Catalog data:** scraped from Parfumo with [fragscrape](https://github.com/HurleySk/fragscrape). A GitHub Actions job runs the importer every 6 hours. See [`scripts/ingest`](scripts/ingest/README.md).
- **Seed data:** `data.js` holds the demo listings, sellers and shops.

## Local dev

```bash
npm install
npm run build        # or: npm run watch  (rebuilds on every save)
node serve.js        # → http://localhost:5173/
```

After changing any source file, run `npm run build` and commit `dist/` together with `index.html` and `Bonxosh.html`. The build gives each file a new content-hashed name, so browsers never mix old and new files. The "Build check" GitHub Action fails if the committed bundle is out of date.
