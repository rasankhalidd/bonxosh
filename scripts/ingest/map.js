/* Maps a fragscrape Perfume (Parfumo) into a row of the
   `fragrances` table (see supabase/schema.sql). Scores stay on
   Parfumo's 0–10 scale. */

function slugify(s) {
  return String(s || "")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// https://www.parfumo.com/Perfumes/Creed/Aventus → "creed-aventus"
function idFromUrl(url) {
  const parts = new URL(url).pathname.split("/").filter(Boolean).map(decodeURIComponent);
  const i = parts.indexOf("Perfumes");
  const tail = i >= 0 ? parts.slice(i + 1) : parts;
  return slugify(tail.join("-").replace(/_/g, " "));
}

function num(v, max = 10) {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) && n >= 0 && n <= max ? Math.round(n * 100) / 100 : null;
}
function int(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
function list(arr) {
  return Array.isArray(arr)
    ? [...new Set(arr.map((x) => String(x || "").trim()).filter(Boolean))]
    : [];
}

// fragscrape sometimes returns the brand with the year and concentration
// glued on: "Armaf 2015  Eau de Toilette", "Orientica Eau de Parfum".
const CONC = /\s+(Eau de Parfum|Eau de Toilette|Eau de Cologne|Extrait de Parfum|Parfum|Cologne|Perfume Oil|Attar|Body Mist)\b.*$/i;
function splitBrand(raw) {
  let brand = String(raw || "").replace(/\s+/g, " ").trim();
  const c = brand.match(CONC);
  const concentration = c ? c[1] : null;
  if (c) brand = brand.slice(0, c.index).trim();
  const y = brand.match(/\s+((?:19|20)\d{2})$/);
  if (y) brand = brand.slice(0, y.index).trim();
  return { brand, year: y ? +y[1] : null, concentration };
}

function mapParfumo(p, extra = {}) {
  if (!p || !p.url || !p.name || !p.brand) return null;
  const notes = p.notes || {};
  const b = splitBrand(p.brand);
  return {
    id: idFromUrl(p.url),
    name: String(p.name).trim(),
    house: b.brand,
    year: int(p.year ?? extra.year ?? b.year),
    gender: ["male", "female", "unisex"].includes(p.gender) ? p.gender : null,
    concentration: p.concentration || b.concentration,
    description: p.description ? String(p.description).trim().slice(0, 2000) : null,
    perfumer: p.perfumer || null,
    accords: list(p.accords).map((a) => a.toLowerCase()),
    notes_top: list(notes.top),
    notes_heart: list(notes.heart),
    notes_base: list(notes.base),
    rating: num(p.rating),
    votes: int(p.totalRatings),
    longevity: num(p.longevity),
    sillage: num(p.sillage),
    price_value: num(p.priceValue),
    production_status: p.productionStatus || null,
    rank: int(p.rank ?? extra.rank),
    image_url: p.imageUrl || null,
    source: "parfumo",
    source_url: p.url,
    scraped_at: p.scrapedAt ? new Date(p.scrapedAt).toISOString() : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

module.exports = { mapParfumo, idFromUrl, slugify, splitBrand };
