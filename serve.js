/* Bonxosh dev server — plain static files.
   Run: node serve.js  →  http://localhost:5173/Bonxosh.html

   The fragrance catalog is read straight from Supabase by the
   browser (see catalog.js + config.js), so no API proxy is needed. */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = 5173;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".jsx":  "text/babel; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
};

http.createServer((req, res) => {
  const u = new URL(req.url, "http://localhost");
  let rel = decodeURIComponent(u.pathname);
  if (rel === "/") rel = "/Bonxosh.html";
  const file = path.join(ROOT, path.normalize(rel));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end("forbidden"); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(buf);
  });
}).listen(PORT, () =>
  console.log(`Bonxosh at http://localhost:${PORT}/Bonxosh.html`)
);
