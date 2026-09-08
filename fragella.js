/* ============================================================
   BONXOSH — Fragella client adapter
   Talks to our own /api/* proxy (never to Fragella directly,
   so the secret key stays server-side). Maps Fragella's data
   shape into Bonxosh's fragrance objects.
   ============================================================ */
(function () {
  const cacheById = {};            // mapped fragrances by slug id
  let _available = null;           // does the server have a key?

  // ---- field mappers --------------------------------------------------
  function tier(price) {
    const n = parseFloat(price);
    if (isNaN(n)) return "$$$";
    return n < 60 ? "$" : n < 120 ? "$$" : n < 250 ? "$$$" : "$$$$";
  }
  function genderMap(g) {
    g = String(g || "").toLowerCase();
    if (g.includes("unisex") || (g.includes("men") && g.includes("women"))) return "Unisex";
    if (g === "men" || g === "male") return "Masc";
    if (g === "women" || g === "female") return "Fem";
    return "Unisex";
  }
  function perfNum(s) {
    s = String(s || "").toLowerCase();
    if (s.includes("eternal") || s.includes("very long") || s.includes("nuclear")) return 92;
    if (s.includes("long") || s.includes("strong") || s.includes("heavy")) return 78;
    if (s.includes("moderate")) return 55;
    if (s.includes("weak") || s.includes("poor") || s.includes("intimate") || s.includes("soft")) return 30;
    return 55;
  }
  function valueNum(s) {
    s = String(s || "").toLowerCase();
    if (s.includes("great") || s.includes("excellent") || s.includes("steal")) return 92;
    if (s.includes("good")) return 72;
    if (s.includes("fair") || s.includes("ok")) return 55;
    if (s.includes("over")) return 32;
    return 55;
  }
  function popVotes(s) {
    s = String(s || "").toLowerCase();
    return s === "high" ? 8000 : s === "medium" ? 2500 : s === "low" ? 600 : 1200;
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
  function names(arr) {
    return (arr || []).map((n) => (typeof n === "string" ? n : (n && n.name))).filter(Boolean);
  }
  function buildBlurb(raw, accords) {
    const a = accords.slice(0, 3).join(", ");
    const ot = raw.OilType ? ` ${raw.OilType}.` : "";
    return `${raw.Brand || ""} ${raw.Name || ""}${raw.Year ? ` (${raw.Year})` : ""} — ${a || "a fragrance"}.${ot}`.trim();
  }

  function mapFragella(raw) {
    if (!raw || !raw._id) return null;
    const accords = (raw["Main Accords"] || []).map((a) => String(a).toLowerCase());
    const top = names(raw.Notes && raw.Notes.Top);
    const heart = names(raw.Notes && raw.Notes.Middle);
    const base = names(raw.Notes && raw.Notes.Base);
    const general = names(raw["General Notes"]);
    const rating = parseFloat(raw.rating) || 4.0;
    const f = {
      id: raw._id,
      name: raw.Name || raw._id,
      house: raw.Brand || "",
      year: parseInt(raw.Year) || "",
      gender: genderMap(raw.Gender),
      accords: accords.length ? accords : ["woody"],
      price: tier(raw.Price),
      priceUSD: parseFloat(raw.Price) || null,
      rating,
      votes: popVotes(raw.Popularity),
      dist: distFrom(rating),
      longevity: perfNum(raw.Longevity),
      sillage: perfNum(raw.Sillage),
      value: valueNum(raw["Price Value"]),
      blurb: buildBlurb(raw, accords),
      notes: {
        top: top.length ? top : general.slice(0, 3),
        heart: heart.length ? heart : general.slice(3, 6),
        base: base.length ? base : general.slice(6, 9),
      },
      image: raw["Image URL Transparent"] || raw["Image URL"] || null,
      remote: true,
    };
    cacheById[f.id] = f;
    return f;
  }

  // ---- transport ------------------------------------------------------
  async function getJSON(url) {
    try {
      const r = await fetch(url);
      const b = await r.json().catch(() => null);
      return { status: r.status, body: b };
    } catch (e) {
      return { status: 0, body: null };
    }
  }

  async function status() {
    const r = await getJSON("/api/status");
    _available = !!(r.body && r.body.hasKey);
    return _available;
  }

  async function search(q) {
    const r = await getJSON("/api/search?q=" + encodeURIComponent(q));
    if (r.status !== 200 || !r.body) {
      return { results: [], status: r.status, error: (r.body && r.body.error) || "error" };
    }
    const b = r.body;
    let arr = Array.isArray(b) ? b
      : Array.isArray(b.data) ? b.data
      : Array.isArray(b.results) ? b.results
      : Array.isArray(b.similar_fragrances) ? b.similar_fragrances
      : (b._id ? [b] : []);
    return { results: arr.map(mapFragella).filter(Boolean), status: 200 };
  }

  async function getFragrance(id) {
    if (cacheById[id]) return cacheById[id];
    const r = await getJSON("/api/fragrance?id=" + encodeURIComponent(id));
    if (r.status !== 200 || !r.body) return null;
    return mapFragella(r.body);
  }

  function cacheGet(id) { return cacheById[id] || null; }

  window.Fragella = { status, search, getFragrance, cacheGet, mapFragella, isAvailable: () => _available };
})();
