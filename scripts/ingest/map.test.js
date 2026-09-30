const test = require("node:test");
const assert = require("node:assert");
const { mapParfumo, idFromUrl, splitBrand } = require("./map");

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

test("splitBrand strips a glued-on year and concentration", () => {
  assert.deepStrictEqual(splitBrand("Armaf 2015  Eau de Toilette"), { brand: "Armaf", year: 2015, concentration: "Eau de Toilette" });
  assert.deepStrictEqual(splitBrand("Orientica Eau de Parfum"), { brand: "Orientica", year: null, concentration: "Eau de Parfum" });
  assert.deepStrictEqual(splitBrand("Nishane 2014  Extrait de Parfum"), { brand: "Nishane", year: 2014, concentration: "Extrait de Parfum" });
  assert.strictEqual(splitBrand("Parfums de Marly").brand, "Parfums de Marly");
  assert.strictEqual(splitBrand("Ard Al Zaafaran Eau de Parfum").brand, "Ard Al Zaafaran");
  assert.strictEqual(splitBrand("Lattafa").brand, "Lattafa");
  assert.deepStrictEqual(splitBrand("Nabeel 2025 Concentrated Oil Perfume"), { brand: "Nabeel", year: 2025, concentration: "Concentrated Oil Perfume" });
  assert.deepStrictEqual(splitBrand("Nishane 2021 Hair Perfume"), { brand: "Nishane", year: 2021, concentration: "Hair Perfume" });
  assert.strictEqual(splitBrand("Al Haramain Perfume").brand, "Al Haramain");
  assert.strictEqual(splitBrand("Asdaaf All Over Spray").brand, "Asdaaf");
  assert.strictEqual(splitBrand("Afnan Perfumes").brand, "Afnan Perfumes");
  assert.strictEqual(splitBrand("Al Haramain Perfumes").brand, "Al Haramain Perfumes");
});

test("mapParfumo drops out-of-range scores and rejects incomplete input", () => {
  const row = mapParfumo({ brand: "X", name: "Y", url: "https://www.parfumo.com/Perfumes/X/Y", rating: 42, gender: "other" });
  assert.strictEqual(row.rating, null);
  assert.strictEqual(row.gender, null);
  assert.deepStrictEqual(row.notes_base, []);
  assert.strictEqual(mapParfumo({ name: "no url" }), null);
});
