const test = require("node:test");
const assert = require("node:assert");
const { mapParfumo, idFromUrl } = require("./map");

test("idFromUrl slugs brand + name from a Parfumo URL", () => {
  assert.strictEqual(idFromUrl("https://www.parfumo.com/Perfumes/Creed/Aventus"), "creed-aventus");
  assert.strictEqual(idFromUrl("https://www.parfumo.com/Perfumes/Parfums_de_Marly/Layton_Exclusif"), "parfums-de-marly-layton-exclusif");
  assert.strictEqual(idFromUrl("https://www.parfumo.com/Perfumes/Herm%C3%A8s/Terre_d_Herm%C3%A8s"), "hermes-terre-d-hermes");
});

test("mapParfumo converts a fragscrape Perfume into a DB row", () => {
  const row = mapParfumo({
    brand: "Lattafa", name: "Khamrah", year: 2022, gender: "unisex",
    url: "https://www.parfumo.com/Perfumes/Lattafa/khamrah",
    imageUrl: "https://images.parfumo.de/x.jpg", concentration: "Eau de Parfum",
    notes: { top: ["Cinnamon", "Nutmeg", "Cinnamon"], heart: ["Dates", " "], base: ["Vanilla"] },
    accords: ["Sweet", "Gourmand"], rating: 8.1, totalRatings: 2412,
    longevity: 8.4, sillage: 7.9, priceValue: 9.2, rank: 12, scrapedAt: "2026-09-01T00:00:00Z",
  });
  assert.strictEqual(row.id, "lattafa-khamrah");
  assert.strictEqual(row.house, "Lattafa");
  assert.deepStrictEqual(row.notes_top, ["Cinnamon", "Nutmeg"]);
  assert.deepStrictEqual(row.notes_heart, ["Dates"]);
  assert.deepStrictEqual(row.accords, ["sweet", "gourmand"]);
  assert.strictEqual(row.rating, 8.1);
  assert.strictEqual(row.votes, 2412);
  assert.strictEqual(row.price_value, 9.2);
  assert.strictEqual(row.rank, 12);
  assert.strictEqual(row.gender, "unisex");
});

test("mapParfumo drops out-of-range scores and rejects incomplete input", () => {
  const row = mapParfumo({ brand: "X", name: "Y", url: "https://www.parfumo.com/Perfumes/X/Y", rating: 42, gender: "other" });
  assert.strictEqual(row.rating, null);
  assert.strictEqual(row.gender, null);
  assert.deepStrictEqual(row.notes_base, []);
  assert.strictEqual(mapParfumo({ name: "no url" }), null);
});
