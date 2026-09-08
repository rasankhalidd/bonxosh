/* Bonxosh dev server + Fragella API proxy.
   Run: node serve.js  →  http://localhost:5173/Bonxosh.html

   The Fragella secret key is read server-side from either:
     • the FRAGELLA_API_KEY environment variable, or
     • a local one-line file named  fragella.key  (git-ignored)
   It is NEVER sent to the browser. The browser only ever calls /api/*. */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = 5173;
const FRAGELLA_BASE = "https://api.fragella.com/api/v1";
const CACHE_FILE = path.join(ROOT, ".cache", "fragella-cache.json");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".jsx":  "text/babel; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
};

// ---- API key (server-side only) ------------------------------------
function clean(k) { return k.replace(/^﻿/, "").trim(); } // strip BOM + whitespace
function loadKey() {
  if (process.env.FRAGELLA_API_KEY && clean(process.env.FRAGELLA_API_KEY))
    return clean(process.env.FRAGELLA_API_KEY);
  // accept fragella.key, or the common Notepad mistake fragella.key.txt
  for (const name of ["fragella.key", "fragella.key.txt"]) {
    try {
      const k = clean(fs.readFileSync(path.join(ROOT, name), "utf8"));
      if (k) return k;
    } catch (_) {}
  }
  return null;
}
const API_KEY = loadKey();

// ---- persistent disk cache (fragrance data is static → cache forever)
let cache = {};
try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); } catch (_) {}
let saveTimer = null;
function saveCache() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
    } catch (_) {}
  }, 200);
}

async function fragella(reqPath, opts = {}) {
  if (!opts.noCache && cache[reqPath])
    return { status: 200, body: cache[reqPath], cached: true };
  if (!API_KEY) return { status: 503, body: { error: "no_key" } };
  try {
    const r = await fetch(FRAGELLA_BASE + reqPath, { headers: { "x-api-key": API_KEY } });
    const text = await r.text();
    let body; try { body = JSON.parse(text); } catch (_) { body = { raw: text }; }
    if (r.ok && !opts.noCache) { cache[reqPath] = body; saveCache(); }
    return { status: r.status, body };
  } catch (e) {
    return { status: 502, body: { error: "fetch_failed", message: String(e) } };
  }
}

function sendJSON(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}

http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://localhost");
  const p = u.pathname;

  // ---------- API proxy ----------
  if (p.startsWith("/api/")) {
    if (p === "/api/status") return sendJSON(res, 200, { hasKey: !!API_KEY });

    if (p === "/api/search") {
      const q = (u.searchParams.get("q") || "").trim();
      if (q.length < 3) return sendJSON(res, 400, { error: "min_3" });
      const out = await fragella(`/fragrances?search=${encodeURIComponent(q)}&limit=10`);
      return sendJSON(res, out.status, out.body);
    }
    if (p === "/api/fragrance") {
      const id = (u.searchParams.get("id") || "").trim();
      if (!id) return sendJSON(res, 400, { error: "no_id" });
      const out = await fragella(`/fragrances/${encodeURIComponent(id)}`);
      return sendJSON(res, out.status, out.body);
    }
    if (p === "/api/similar") {
      const name = (u.searchParams.get("name") || "").trim();
      if (!name) return sendJSON(res, 400, { error: "no_name" });
      const out = await fragella(`/fragrances/similar?name=${encodeURIComponent(name)}&limit=6`);
      return sendJSON(res, out.status, out.body);
    }
    if (p === "/api/usage") {
      const out = await fragella(`/usage`, { noCache: true }); // quota must be live
      return sendJSON(res, out.status, out.body);
    }
    return sendJSON(res, 404, { error: "unknown_endpoint" });
  }

  // ---------- static files ----------
  let rel = decodeURIComponent(p);
  if (rel === "/") rel = "/Bonxosh.html";
  const file = path.join(ROOT, path.normalize(rel));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("forbidden"); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(buf);
  });
}).listen(PORT, () =>
  console.log(`Bonxosh at http://localhost:${PORT}/Bonxosh.html  ·  Fragella key: ${API_KEY ? "loaded ✓" : "NOT set (using seed data only)"}`)
);
