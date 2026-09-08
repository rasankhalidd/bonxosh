/* ============================================================
   BONXOSH — seed data  (Iraq fragrance marketplace)
   ============================================================ */
(function () {
  // ---- Cities & payment rails ----------------------------------------
  const cities = ["Sulaymaniyah", "Erbil", "Baghdad"];
  // pay rails available in the prototype — backend will wire the real APIs
  const pay = {
    cod:      { label: "Cash on Delivery", short: "COD",      icon: "truck"  },
    zaincash: { label: "Zain Cash",        short: "Zain Cash", icon: "wallet" },
    fastpay:  { label: "FastPay",          short: "FastPay",   icon: "wallet" },
    fib:      { label: "FIB",              short: "FIB",       icon: "wallet" },
  };

  // ---- Sellers (resellers + verified perfume shops) ------------------
  // type: "reseller" | "shop"   ·   rating out of 5   ·   sales = completed deals
  const sellers = {
    you: {
      id: "you", name: "Rasan Mahmood", handle: "rasanscents", type: "reseller",
      city: "Erbil", tone: "#7a5c8f", verified: false, rating: 4.8, ratingN: 17, sales: 17,
      joined: "Joined 2025",
      bio: "Trimming the shelf — authentic bottles only, batch photos on request. Decants & full bottles.",
    },
    royalscents: {
      id: "royalscents", name: "Royal Scents", handle: "royalscents", type: "shop",
      city: "Baghdad", tone: "#8f6f3c", verified: true, rating: 4.9, ratingN: 1240, sales: 1240,
      joined: "Shop since 2014",
      bio: "Authorized designer & niche boutique in Karada, Baghdad. Sealed bottles, store warranty.",
    },
    oudhouse: {
      id: "oudhouse", name: "Oud House", handle: "oudhouse", type: "shop",
      city: "Erbil", tone: "#6b4a2a", verified: true, rating: 4.8, ratingN: 870, sales: 870,
      joined: "Shop since 2012",
      bio: "Oud, attars & Middle-Eastern luxury. Family-run on Gulan Street, Erbil.",
    },
    perfumesouk: {
      id: "perfumesouk", name: "Perfume Souk", handle: "perfumesouk", type: "shop",
      city: "Sulaymaniyah", tone: "#4f7a5a", verified: true, rating: 4.7, ratingN: 540, sales: 540,
      joined: "Shop since 2018",
      bio: "Designer fragrances at Slemani's best prices. Salim Street.",
    },
    dara: {
      id: "dara", name: "Dara A.", handle: "daraflips", type: "reseller",
      city: "Sulaymaniyah", tone: "#5b6b54", verified: false, rating: 4.9, ratingN: 34, sales: 34,
      bio: "Niche flipper. Tested-once bottles & decants. Trades welcome.",
    },
    zaid: {
      id: "zaid", name: "Zaid M.", handle: "zaidscent", type: "reseller",
      city: "Baghdad", tone: "#3f6b8a", verified: false, rating: 4.6, ratingN: 21, sales: 21,
      bio: "Designer fragrances, fair prices. Meet-ups in Baghdad or COD.",
    },
    lana: {
      id: "lana", name: "Lana K.", handle: "lanak", type: "reseller",
      city: "Erbil", tone: "#a4733e", verified: false, rating: 5.0, ratingN: 9, sales: 9,
      bio: "Downsizing my collection. Gourmands & florals, gently used.",
    },
  };

  // ---- Fragrances (the search-engine catalog) ------------------------
  // dist = [5,4,3,2,1] star vote proportions (sum ~100)
  const fragrances = [
    { id:"aventus", name:"Aventus", house:"Creed", year:2010, gender:"Masc-leaning",
      accords:["fruity","smoky","woody","fresh"], price:"$$$$",
      rating:4.5, votes:8124, dist:[64,24,7,3,2],
      longevity:78, sillage:72, value:54,
      blurb:"The blueprint for the modern fruity-smoky masculine. Pineapple and birch over a dry, ashy musk.",
      notes:{ top:["Pineapple","Bergamot","Blackcurrant","Apple"], heart:["Birch","Patchouli","Rose","Jasmine"], base:["Oakmoss","Musk","Ambergris","Vanilla"] } },
    { id:"br540", name:"Baccarat Rouge 540", house:"Maison Francis Kurkdjian", year:2015, gender:"Unisex",
      accords:["amber","sweet","woody","saffron"], price:"$$$$",
      rating:4.3, votes:9610, dist:[58,25,9,5,3],
      longevity:84, sillage:80, value:42,
      blurb:"Polarizing, transcendent, everywhere. A jammy saffron-amber that smells like burnt sugar and cedar.",
      notes:{ top:["Saffron","Jasmine"], heart:["Amberwood","Ambergris"], base:["Fir Resin","Cedar"] } },
    { id:"santal33", name:"Santal 33", house:"Le Labo", year:2011, gender:"Unisex",
      accords:["woody","leather","spicy","creamy"], price:"$$$$",
      rating:4.1, votes:5402, dist:[48,30,12,6,4],
      longevity:62, sillage:58, value:48,
      blurb:"The scent of every cool coffee shop. Dry sandalwood, cardamom and a smoky leather hum.",
      notes:{ top:["Cardamom","Iris","Violet"], heart:["Ambrox","Sandalwood"], base:["Leather","Cedar","Papyrus"] } },
    { id:"tobaccovanille", name:"Tobacco Vanille", house:"Tom Ford", year:2007, gender:"Unisex",
      accords:["sweet","spicy","tobacco","warm"], price:"$$$$",
      rating:4.4, votes:6731, dist:[60,26,8,4,2],
      longevity:80, sillage:70, value:46,
      blurb:"A spiced-rum fireside. Tobacco leaf wrapped in vanilla, tonka and dried fruit. Pure autumn.",
      notes:{ top:["Tobacco Leaf","Spices"], heart:["Tonka Bean","Tobacco Blossom"], base:["Vanilla","Cacao","Dried Fruits","Woods"] } },
    { id:"oudwood", name:"Oud Wood", house:"Tom Ford", year:2007, gender:"Unisex",
      accords:["woody","oud","spicy","creamy"], price:"$$$$",
      rating:4.3, votes:5188, dist:[57,27,9,4,3],
      longevity:66, sillage:54, value:44,
      blurb:"Approachable oud for people who don't like oud. Smooth, creamy, expensive-smelling.",
      notes:{ top:["Oud","Rosewood","Cardamom"], heart:["Sandalwood","Vetiver"], base:["Tonka Bean","Vanilla","Amber"] } },
    { id:"layton", name:"Layton", house:"Parfums de Marly", year:2016, gender:"Masc-leaning",
      accords:["sweet","spicy","fresh","vanilla"], price:"$$$$",
      rating:4.4, votes:7044, dist:[61,25,8,4,2],
      longevity:82, sillage:78, value:58,
      blurb:"Crowd-pleaser of the decade. Apple and lavender up top, a warm vanilla-cardamom drydown.",
      notes:{ top:["Apple","Bergamot","Lavender","Mandarin"], heart:["Geranium","Violet","Jasmine"], base:["Vanilla","Cardamom","Sandalwood","Guaiac Wood"] } },
    { id:"bdc", name:"Bleu de Chanel", house:"Chanel", year:2010, gender:"Masc",
      accords:["fresh","woody","citrus","aromatic"], price:"$$$",
      rating:4.2, votes:6890, dist:[52,30,11,4,3],
      longevity:64, sillage:56, value:70,
      blurb:"The safe-bet office king. Crisp citrus and incense over a polished cedar base.",
      notes:{ top:["Grapefruit","Lemon","Mint","Pink Pepper"], heart:["Ginger","Nutmeg","Jasmine"], base:["Incense","Cedar","Sandalwood","Labdanum"] } },
    { id:"delina", name:"Delina", house:"Parfums de Marly", year:2017, gender:"Fem-leaning",
      accords:["floral","rose","fruity","sweet"], price:"$$$$",
      rating:4.3, votes:4517, dist:[59,26,9,4,2],
      longevity:72, sillage:74, value:56,
      blurb:"A luminous Turkish rose with lychee and rhubarb. Feminine, radiant, compliment-magnet.",
      notes:{ top:["Rhubarb","Lychee","Bergamot"], heart:["Turkish Rose","Peony","Lily of the Valley"], base:["Vanilla","Musk","Cashmeran","Incense"] } },
    { id:"sauvage", name:"Sauvage", house:"Dior", year:2015, gender:"Masc",
      accords:["fresh","spicy","ambroxan","citrus"], price:"$$$",
      rating:3.8, votes:11203, dist:[42,28,16,8,6],
      longevity:70, sillage:74, value:74,
      blurb:"Ubiquitous and proud of it. Bergamot and pepper riding a wall of Ambroxan.",
      notes:{ top:["Bergamot","Pepper"], heart:["Sichuan Pepper","Lavender","Geranium"], base:["Ambroxan","Cedar","Labdanum"] } },
    { id:"khamrah", name:"Khamrah", house:"Lattafa", year:2022, gender:"Unisex",
      accords:["sweet","spicy","gourmand","amber"], price:"$",
      rating:4.2, votes:6320, dist:[55,27,10,5,3],
      longevity:76, sillage:72, value:92,
      blurb:"The value-king gourmand. Cinnamon, dates and praline — a dead-ringer for bottles 10x the price.",
      notes:{ top:["Cinnamon","Nutmeg","Bergamot"], heart:["Dates","Praline","Mahogany","Tuberose"], base:["Vanilla","Tonka Bean","Benzoin","Myrrh"] } },
    { id:"ombreleather", name:"Ombré Leather", house:"Tom Ford", year:2018, gender:"Unisex",
      accords:["leather","floral","spicy","warm"], price:"$$$$",
      rating:4.0, votes:3980, dist:[46,31,13,6,4],
      longevity:74, sillage:66, value:50,
      blurb:"Soft suede and blooming jasmine. A leather you can wear in summer without sweating.",
      notes:{ top:["Cardamom"], heart:["Leather","Jasmine"], base:["Patchouli","Amber","Moss"] } },
    { id:"goodgirl", name:"Good Girl", house:"Carolina Herrera", year:2016, gender:"Fem",
      accords:["sweet","floral","gourmand","almond"], price:"$$$",
      rating:3.9, votes:5611, dist:[45,30,14,7,4],
      longevity:74, sillage:72, value:66,
      blurb:"The stiletto-bottle icon. Tuberose and jasmine over a cocoa-tonka-almond base.",
      notes:{ top:["Almond","Coffee","Bergamot","Lemon"], heart:["Tuberose","Jasmine Sambac","Orris"], base:["Tonka Bean","Cocoa","Cedar","Praline"] } },
  ];

  const fById = Object.fromEntries(fragrances.map(f => [f.id, f]));

  // ---- Listings ------------------------------------------------------
  // mode: "sale" | "trade" | "both"   ·   condition: "new" | "used"
  // priceIQD in Iraqi dinar  ·  seek = fragrance ids wanted in a trade
  let _n = 0; const lid = () => "l" + (++_n);
  const listings = [
    // you (the logged-in reseller)
    { id:lid(), frag:"layton", seller:"you", mode:"both", condition:"used", fillPct:90, volume:125,
      priceIQD:205000, batch:"22B14", time:"5h", pay:["cod","fib"],
      note:"Tested a handful of times, ~90% full. Box included. Open to trades for Aventus.", seek:["aventus"] },
    { id:lid(), frag:"khamrah", seller:"you", mode:"sale", condition:"new", volume:100,
      priceIQD:50000, time:"1d", pay:["cod","zaincash","fib"],
      note:"Brand new, sealed. Extra from a bundle." },

    // Aventus
    { id:lid(), frag:"aventus", seller:"royalscents", mode:"sale", condition:"new", volume:100,
      priceIQD:425000, batch:"23C", time:"2h", pay:["cod","zaincash","fib"],
      note:"Sealed, current batch. Store warranty & authenticity guarantee." },
    { id:lid(), frag:"aventus", seller:"dara", mode:"both", condition:"used", fillPct:90, volume:100,
      priceIQD:285000, batch:"21A01", time:"6h", pay:["cod","fastpay"],
      note:"90% full, batch-checked. Will trade for Layton + cash or Oud Wood.", seek:["layton","oudwood"] },

    // Baccarat Rouge 540
    { id:lid(), frag:"br540", seller:"oudhouse", mode:"sale", condition:"new", volume:70,
      priceIQD:365000, time:"3h", pay:["cod","fastpay","fib"],
      note:"Genuine MFK, 70ml EDP. Sealed." },
    { id:lid(), frag:"br540", seller:"zaid", mode:"sale", condition:"used", fillPct:75, volume:70,
      priceIQD:210000, time:"1d", pay:["cod"],
      note:"About 75% left. No box, bottle only." },

    // Santal 33
    { id:lid(), frag:"santal33", seller:"perfumesouk", mode:"sale", condition:"new", volume:100,
      priceIQD:330000, time:"8h", pay:["cod","zaincash"],
      note:"Le Labo 100ml, sealed with label." },

    // Tobacco Vanille
    { id:lid(), frag:"tobaccovanille", seller:"oudhouse", mode:"sale", condition:"new", volume:100,
      priceIQD:390000, time:"2h", pay:["cod","fastpay","fib"],
      note:"Tom Ford Private Blend, 100ml sealed." },
    { id:lid(), frag:"tobaccovanille", seller:"lana", mode:"trade", condition:"used", fillPct:60, volume:50,
      priceIQD:175000, time:"2d", pay:["cod"],
      note:"60% full. Looking to trade for Delina or Good Girl.", seek:["delina","goodgirl"] },

    // Oud Wood
    { id:lid(), frag:"oudwood", seller:"royalscents", mode:"sale", condition:"new", volume:50,
      priceIQD:305000, time:"5h", pay:["cod","zaincash","fib"],
      note:"50ml sealed, store warranty." },

    // Layton
    { id:lid(), frag:"layton", seller:"perfumesouk", mode:"sale", condition:"new", volume:125,
      priceIQD:295000, time:"4h", pay:["cod","zaincash"],
      note:"PdM Layton 125ml, sealed." },

    // Bleu de Chanel
    { id:lid(), frag:"bdc", seller:"royalscents", mode:"sale", condition:"new", volume:100,
      priceIQD:175000, time:"7h", pay:["cod","zaincash","fib"],
      note:"Chanel EDP 100ml, sealed." },
    { id:lid(), frag:"bdc", seller:"zaid", mode:"sale", condition:"used", fillPct:80, volume:100,
      priceIQD:110000, time:"2d", pay:["cod"],
      note:"80% full, with box." },

    // Sauvage
    { id:lid(), frag:"sauvage", seller:"perfumesouk", mode:"sale", condition:"new", volume:100,
      priceIQD:165000, time:"9h", pay:["cod","zaincash","fastpay"],
      note:"Dior Sauvage EDT 100ml, sealed." },

    // Khamrah
    { id:lid(), frag:"khamrah", seller:"oudhouse", mode:"sale", condition:"new", volume:100,
      priceIQD:52000, time:"6h", pay:["cod","fastpay"],
      note:"Lattafa Khamrah 100ml, sealed. Best value gourmand." },
    { id:lid(), frag:"khamrah", seller:"lana", mode:"sale", condition:"used", fillPct:85, volume:100,
      priceIQD:33000, time:"3d", pay:["cod"],
      note:"85% full, sprayed a few times only." },

    // Delina
    { id:lid(), frag:"delina", seller:"royalscents", mode:"sale", condition:"new", volume:75,
      priceIQD:340000, time:"11h", pay:["cod","zaincash","fib"],
      note:"PdM Delina EDP 75ml, sealed." },

    // Good Girl
    { id:lid(), frag:"goodgirl", seller:"perfumesouk", mode:"sale", condition:"new", volume:80,
      priceIQD:155000, time:"1d", pay:["cod","zaincash"],
      note:"Carolina Herrera Good Girl 80ml, sealed." },

    // Ombré Leather
    { id:lid(), frag:"ombreleather", seller:"dara", mode:"both", condition:"used", fillPct:70, volume:100,
      priceIQD:230000, time:"2d", pay:["cod","fastpay"],
      note:"70% full. Trade considered for Santal 33.", seek:["santal33"] },
  ];

  // ---- Search helpers -------------------------------------------------
  const trendingSearches = ["Aventus","Khamrah","Baccarat Rouge 540","Oud","Layton","Under 100,000 IQD","Sealed designer"];

  window.BX = {
    cities, pay, sellers, fragrances, fById, listings, trendingSearches,
    ME: "you",
    // city id for the seller of a listing
    cityOf: (l) => (window.BX.sellers[l.seller] || {}).city,
  };
})();
