#!/usr/bin/env node
/* ============================================================
   BONXOSH — catalog ingestion
   Runs fragscrape (Parfumo scraper) as a local subprocess,
   crawls brands and/or the Parfumo rankings, and upserts every
   perfume into Supabase's `fragrances` table.

   Usage (from scripts/ingest):
     npm run ingest                                  # every brand in brands.txt
     npm run ingest -- --brands "Lattafa,Armaf" --limit 20
     npm run ingest -- --rankings 5                  # top 500 per gender
     npm run ingest -- --brands Creed --limit 3 --dry-run

   Re-runs are resumable: perfumes scraped within --refresh-days
   are skipped, and brand listings are cached in .cache/.
   ============================================================ */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { mapParfumo } = require("./map");

const PARFUMO = "https://www.parfumo.com";
const CACHE_DIR = path.join(__dirname, ".cache");
const STATE_FILE = path.join(CACHE_DIR, "ingest-state.json");
const BATCH = 50;

// ---- args -----------------------------------------------------------
function parseArgs(argv) {
  const a = { brands: null, rankings: 0, limit: Infinity, refreshDays: 30, delay: 1000, dryRun: false, port: 3799, maxPages: 200 };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], v = argv[i + 1];
    if (k === "--brands") { a.brands = v; i++; }
    else if (k === "--rankings") { a.rankings = +v; i++; }
    else if (k === "--limit") { a.limit = +v; i++; }
    else if (k === "--refresh-days") { a.refreshDays = +v; i++; }
    else if (k === "--delay") { a.delay = +v; i++; }
    else if (k === "--port") { a.port = +v; i++; }
    else if (k === "--max-pages") { a.maxPages = +v; i++; }
    else if (k === "--dry-run") a.dryRun = true;
    else if (k === "--help" || k === "-h") { console.log(fs.readFileSync(__filename, "utf8").split("*/")[0]); process.exit(0); }
    else { console.error(`Unknown argument: ${k}`); process.exit(1); }
  }
  if (a.brands == null && !a.rankings) a.brands = path.join(__dirname, "brands.txt");
  return a;
}

function readBrands(spec) {
  if (!spec) return [];
  const file = path.isAbsolute(spec) ? spec : path.join(process.cwd(), spec);
  const text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : spec.replace(/,/g, "\n");
  return text.split(/\r?\n/).map((l) => l.replace(/#.*/, "").trim()).filter(Boolean);
}

// ---- state ----------------------------------------------------------
function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); } catch (_) { return { brands: {} }; }
}
function saveState(state) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 1));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (ms) => ms + Math.floor(Math.random() * ms);

// ---- fragscrape subprocess ------------------------------------------
function startFragscrape(port) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const entry = require.resolve("fragscrape/dist/index.js");
  const child = spawn(process.execPath, [entry], {
    cwd: CACHE_DIR,                                  // its logs/ and data/ land in .cache
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: "production",
      DATABASE_PATH: path.join(CACHE_DIR, "fragscrape.db"),
      RATE_LIMIT_MAX_REQUESTS: "1000000",            // we are its only client
      LOG_LEVEL: process.env.LOG_LEVEL || "warn",
    },
    stdio: ["ignore", "ignore", "inherit"],
  });
  child.on("exit", (code) => { if (code && !child.killedByUs) console.error(`fragscrape exited (${code})`); });
  return child;
}

async function waitHealthy(base, ms = 60000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try { if ((await fetch(base + "/health")).ok) return; } catch (_) {}
    await sleep(500);
  }
  throw new Error("fragscrape did not become healthy in time");
}

function makeApi(base) {
  return async function api(p, opts = {}) {
    const r = await fetch(base + p, {
      method: opts.body ? "POST" : "GET",
      headers: opts.body ? { "Content-Type": "application/json" } : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j || j.success === false) throw new Error(`${r.status} ${(j && j.error) || "request failed"} (${p})`);
    return j.data;
  };
}

// ---- crawl: discover perfume URLs -----------------------------------
// Brand listings are plain HTML, so we read them directly: fragscrape's
// /api/brand sends ?page=, but Parfumo paginates with ?current_page=,
// which left it stuck on the first 20 perfumes of every brand.
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";

async function brandPage(slug, page) {
  const url = `${PARFUMO}/Perfumes/${encodeURIComponent(slug)}?current_page=${page}&v=grid&o=nr_desc&g_f=1&g_m=1&g_u=1`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en" } }).catch(() => null);
    const html = r ? await r.text().catch(() => "") : "";
    // Parfumo answers a rate-limit block with a small "Access Denied" page (status 404)
    const blocked = !r || /<title>Access Denied<\/title>/i.test(html);
    if (!blocked && r.status === 404) return [];     // brand really doesn't exist
    if (!blocked && r.ok && html.length > 10000) {   // a real listing page
      // <div class="name"><a href="…">Name…</a> <span class="release_year"><a …>(2022)</a></span>
      const re = /<div class="name">\s*<a href="([^"]+)"[\s\S]*?<\/a>\s*(?:<span class="release_year">\s*<a[^>]*>\((\d{4})\))?/g;
      return [...html.matchAll(re)].map((m) => ({
        url: m[1].startsWith("http") ? m[1] : PARFUMO + m[1],
        year: m[2] ? +m[2] : undefined,
      }));
    }
    const wait = 60000 * attempt;
    console.error(`    ${slug} page ${page}: ${blocked ? "blocked by Parfumo" : "bad response"} (${r ? r.status : "no response"}), retrying in ${wait / 1000}s…`);
    await sleep(wait);
  }
  throw new Error(`listing page ${page} kept failing`);
}

async function brandUrls(brand, args, state) {
  const cached = state.brands[brand];
  if (cached && cached.complete && Date.now() - cached.at < args.refreshDays * 864e5) return cached;
  const slug = brand.replace(/\s+/g, "_");
  const years = {};                                  // url → release year
  for (let page = 1; page <= args.maxPages; page++) {
    const links = await brandPage(slug, page);
    const before = Object.keys(years).length;
    links.forEach((l) => { if (!(l.url in years)) years[l.url] = l.year || null; });
    if (Object.keys(years).length === before) break; // empty or repeated page → done
    await sleep(jitter(2000));
  }
  const result = { at: Date.now(), complete: true, urls: Object.keys(years), years };
  if (result.urls.length) { state.brands[brand] = result; saveState(state); }  // never cache an empty listing
  return result;
}

async function rankingUrls(api, pages) {
  const out = new Map();                              // url → rank
  for (const category of ["mens", "womens", "unisex"]) {
    for (let page = 1; page <= pages; page++) {
      const res = await api(`/api/rankings?category=${category}&page=${page}&limit=100`);
      const items = (res && res.items) || [];
      items.forEach((it) => {
        const url = it.url.startsWith("http") ? it.url : PARFUMO + it.url;
        if (!out.has(url)) out.set(url, it.rank);
      });
      if (items.length === 0) break;
    }
  }
  return out;
}

// ---- main -----------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv.slice(2));
  let db = null;
  if (!args.dryRun) {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in scripts/ingest/.env (or use --dry-run).");
      process.exit(1);
    }
    const { createClient } = require("@supabase/supabase-js");
    db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  }

  const base = `http://127.0.0.1:${args.port}`;
  const api = makeApi(base);
  const child = startFragscrape(args.port);
  const state = loadState();
  let pending = [];
  let saved = 0, failed = 0, stopping = false;

  async function flush() {
    if (!pending.length) return;
    const rows = pending; pending = [];
    if (args.dryRun) { saved += rows.length; return; }
    const { error } = await db.from("fragrances").upsert(rows, { onConflict: "id" });
    if (error) { console.error("upsert failed:", error.message); failed += rows.length; }
    else saved += rows.length;
  }
  async function shutdown(code) {
    stopping = true;
    await flush().catch((e) => console.error(e.message));
    saveState(state);
    child.killedByUs = true;
    child.kill();
    console.log(`\nDone — ${saved} ${args.dryRun ? "mapped (dry run)" : "saved"}, ${failed} failed.`);
    process.exit(code);
  }
  process.on("SIGINT", () => { console.log("\nStopping…"); shutdown(130); });

  try {
    await waitHealthy(base);
    console.log("fragscrape ready.");

    // 1. discover
    const targets = new Map();                        // url → { rank, year }
    for (const brand of readBrands(args.brands)) {
      try {
        const { urls, years = {} } = await brandUrls(brand, args, state);
        urls.forEach((u) => targets.has(u) || targets.set(u, { year: years[u] }));
        console.log(`  ${brand}: ${urls.length} perfumes${urls.length ? "" : "  ← check the Parfumo brand spelling"}`);
      } catch (e) { console.error(`  ${brand}: ${e.message}`); }
    }
    if (args.rankings) {
      const ranked = await rankingUrls(api, args.rankings);
      ranked.forEach((rank, u) => targets.set(u, { ...targets.get(u), rank }));
      console.log(`  rankings: ${ranked.size} perfumes`);
    }

    // 2. skip fresh rows already in Supabase
    let todo = [...targets.keys()];
    if (db && todo.length) {
      const cutoff = Date.now() - args.refreshDays * 864e5;
      const fresh = new Set();
      for (let i = 0; i < todo.length; i += 150) {
        const { data, error } = await db.from("fragrances").select("source_url, scraped_at").in("source_url", todo.slice(i, i + 150));
        if (error) throw new Error("Supabase read failed: " + error.message);
        (data || []).forEach((r) => { if (new Date(r.scraped_at).getTime() > cutoff) fresh.add(r.source_url); });
      }
      todo = todo.filter((u) => !fresh.has(u));
      console.log(`${targets.size} found, ${fresh.size} already fresh, ${todo.length} to scrape.`);
    }
    todo = todo.slice(0, args.limit);

    // 3. scrape details + upsert
    let streak = 0;
    for (let i = 0; i < todo.length && !stopping; i++) {
      const url = todo[i];
      try {
        const p = await api("/api/perfume/by-url?cache=true", { body: { url } });
        const row = mapParfumo(p, targets.get(url));
        if (!row) throw new Error("unmappable response");
        if (args.dryRun && saved + pending.length < 3) console.log(JSON.stringify(row, null, 2));
        pending.push(row);
        streak = 0;
        console.log(`[${i + 1}/${todo.length}] ${row.house} — ${row.name}`);
      } catch (e) {
        failed++; streak++;
        console.error(`[${i + 1}/${todo.length}] ${url}: ${e.message}`);
        if (streak >= 10) throw new Error("10 failures in a row — Parfumo is probably blocking us. Try later or set DECODO_PROXY_URL.");
        if (streak >= 3) { console.error("backing off 60s…"); await sleep(60000); }
      }
      if (pending.length >= BATCH) await flush();
      await sleep(jitter(args.delay));
    }
    await shutdown(0);
  } catch (e) {
    console.error(e.message);
    await shutdown(1);
  }
}

main();
