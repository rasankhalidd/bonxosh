/* ============================================================
   BONXOSH — internationalization (i18n)
   English is the inline fallback everywhere; Kurdish (Sorani,
   کوردیی ناوەندی) is layered on top. Post content, bios, blurbs,
   reviews and proper nouns are intentionally NOT translated.

   Usage in a component:
     const { tx, lang, dir } = window.useT();
     tx("nav.home", "Home")                 // static string
     tx("frag.count", `${n} fragrances`, {n}) // with English fallback + vars
   ============================================================ */
(function () {

  // ---- Kurdish (Sorani) dictionary ----------------------------------
  const KU = {
    // nav / shell
    "nav.home":         "ماڵەوە",
    "nav.search":       "گەڕان",
    "nav.fragrances":   "بۆنەکان",
    "nav.account":      "هەژمار",
    "action.post":      "بڵاوکردنەوە",

    // composer / compose modal
    "compose.title":    "بڵاوکراوەی نوێ",
    "composer.placeholder": "ئەمڕۆ چ بۆنێکت لێداوە؟ پێداچوونەوە، بۆنی ئەمڕۆ، یان بۆچوونێک هاوبەش بکە…",
    "composer.photo":   "وێنە زیادبکە",
    "composer.tagFrag": "بۆنێک تاگ بکە",
    "composer.rating":  "هەڵسەنگاندن زیادبکە",
    "composer.poll":    "ڕاپرسی",
    "composer.emoji":   "ئیمۆجی",

    // stories rail
    "stories.you": "بۆنی ئەمڕۆت",

    // headers
    "header.search.sub":     "بۆن، خەڵک و بۆچوونەکان بدۆزەرەوە",
    "header.fragrances.sub": "هەڵسەنگاندن، پێداچوونەوە و گەشتن بەناو داتابەیسەکەدا",
    "header.account.sub":    "{reviews} پێداچوونەوە · {followers} شوێنکەوتوو",

    // home segmented
    "seg.forYou":    "بۆ تۆ",
    "seg.following": "شوێنکەوتووان",

    // right rail
    "rail.search":   "گەڕان لە بۆنخۆش",
    "rail.trending": "نۆتە بەناوبانگەکان",
    "rail.showMore": "زیاتر پیشانبدە",
    "rail.who":      "کێ شوێن بکەویت",
    "rail.exploreNotes": "گەشتن بەناو نۆتەکان",
    "rail.top":      "باشترین هەڵسەنگێندراوی ئەم هەفتەیە",
    "action.follow":    "شوێنکەوتن",
    "action.following": "شوێنکەوتوو",
    "foot.tagline":  "تۆڕی کۆمەڵایەتیی بۆن",
    "foot.about":    "دەربارە",
    "foot.notes":    "پێرستی نۆتەکان",
    "foot.houses":   "ماڵەکان",
    "foot.help":     "یارمەتی",
    "foot.copy":     "بۆنخۆش © ٢٠٢٦ · تۆڕی کۆمەڵایەتیی بۆن",

    // post kickers
    "kicker.sotd":       "بۆنی ئەمڕۆ",
    "kicker.review":     "پێداچوونەوە",
    "kicker.rec":        "داوای پێشنیار",
    "kicker.collection": "کۆکراوە",
    "post.more":         "زیاتر",
    "post.likes":        "{n} بەدڵبوون",
    "post.comments":     "بینینی هەموو {n} لێدوان",
    "unit.ratings":      "هەڵسەنگاندن",

    // fragrances tab — filters
    "filter.All":      "هەموو",
    "filter.Niche":    "نیتش",
    "filter.Designer": "دیزاینەر",
    "filter.Value":    "نرخی باش",
    "filter.Unisex":   "هاوبەش",
    "filter.Woody":    "دارین",
    "filter.Gourmand": "خۆراکی",
    "filter.Fresh":    "تازە",
    "filter.Floral":   "گوڵاوی",
    // fragrances tab — sort + misc
    "frag.pageSub": "هەڵسەنگاندن، پێداچوونەوە و گەشتن بەناو داتابەیسی کۆمەڵگادا — {n} و زیاتر.",
    "frag.search":  "گەڕان بۆ بۆن، ماڵ، نۆتە…",
    "sort.rating":  "باشترین هەڵسەنگاندن",
    "sort.popular": "زۆرترین هەڵسەنگاندن",
    "sort.value":   "باشترین نرخ",
    "sort.new":     "نوێترین",
    "frag.count":   "{n} ئەنجام",
    "frag.noMatch": "هیچ بۆنێک ناگونجێت لەگەڵ ئەوەدا.",
    "frag.you":     "تۆ",
    "unit.ratingsN":"{n} هەڵسەنگاندن",
    // full fragrance page
    "frag.back":            "هەموو بۆنەکان",
    "frag.communityRating": "هەڵسەنگاندنی کۆمەڵگا",
    "frag.performance":     "کارایی",
    "frag.alsoLike":        "لەوانەیە ئەمانەشت بەدڵ بێت",

    // fragrance detail
    "meter.Longevity": "بەردەوامی",
    "meter.Sillage":   "بڵاوبوونەوە",
    "meter.Value":     "نرخ",
    "mn.Weak":     "لاواز",
    "mn.Moderate": "مامناوەند",
    "mn.Long":     "درێژ",
    "mn.Eternal":  "هەتاهەتایی",
    "mn.Intimate": "نزیک",
    "mn.Strong":   "بەهێز",
    "mn.Nuclear":  "تەقینەوەیی",
    "mn.Steep":    "گران",
    "mn.Fair":     "ڕێک",
    "mn.Good":     "باش",
    "mn.Steal":    "کەسابی",
    "detail.yourRating": "هەڵسەنگاندنی تۆ",
    "detail.youRated":   "تۆ {n} / ٥ت پێدا — سوپاس بۆ بەشداریت.",
    "detail.tapRate":    "ئەستێرەیەک لێبدە بۆ هەڵسەنگاندنی {name}.",
    "detail.pyramid":    "هەرەمی نۆتەکان",
    "pyr.Top":   "سەرەوە",
    "pyr.Heart": "ناوەند",
    "pyr.Base":  "بنکە",
    "detail.community": "پێداچوونەوەی کۆمەڵگا",

    // search page
    "search.placeholder": "گەڕان لە بۆنخۆش — بۆن، خەڵک، نۆتە، بۆچوون…",
    "search.trending": "گەڕانە بەناوبانگەکان",
    "search.popular":  "ئێستا بەناوبانگ",
    "stab.top":         "سەرەکی",
    "stab.fragrances":  "بۆنەکان",
    "stab.people":      "خەڵک",
    "stab.posts":       "بڵاوکراوەکان",
    "sec.fragrances":   "بۆنەکان",
    "sec.people":       "خەڵک",
    "sec.posts":        "بڵاوکراوەکان",
    "search.noResults": "هیچ ئەنجامێک نییە بۆ «{q}»",
    "search.noHint":    "ماڵێک، نۆتەیەک، یان بۆچوونێک تاقیبکەرەوە.",

    // account
    "account.edit":       "دەستکاریی پرۆفایل",
    "account.following":  "شوێنکەوتوو",
    "account.followers":  "شوێنکەوتووان",
    "account.reviews":    "پێداچوونەوەکان",
    "ptab.posts":   "بڵاوکراوەکان",
    "ptab.reviews": "پێداچوونەوەکان",
    "ptab.shelf":   "ڕەفە",
    "ptab.likes":   "بەدڵبووەکان",
    "account.yourRating":  "هەڵسەنگاندنی تۆ",
    "account.yourReview":  "پێداچوونەکەت",
    "account.emptyPosts":  "هێشتا هیچت بڵاو نەکردووەتەوە. بۆنی ئەمڕۆت بڵاوبکەرەوە.",
    "account.emptyLikes":  "ئەو بڵاوکراوانەی بەدڵتن لێرە دەردەکەون.",
    "account.banner":      "بانێر · مووداوی بۆنەکانت",

    // toasts
    "toast.reposted":   "دووبارە بڵاوکرایەوە بۆ شوێنکەوتووانت",
    "toast.saved":      "پاشەکەوتکرا لە کۆکراوەکەت",
    "toast.unsaved":    "لابرا لە پاشەکەوتکراوەکان",
    "toast.posted":     "بڵاوکراوەکەت زیندووە",
    "toast.rated":      "{name}ت بە {n}★ هەڵسەنگاند",
    "toast.followed":   "شوێنکەوتنی @{handle}",
    "toast.unfollowed": "شوێنکەوتن لابرا @{handle}",

    // gender (catalogue category labels)
    "gender.Unisex":       "هاوبەش",
    "gender.Masc":         "پیاوانە",
    "gender.Fem":          "ژنانە",
    "gender.Masc-leaning": "زیاتر پیاوانە",
    "gender.Fem-leaning":  "زیاتر ژنانە",

    // accords (category chips / filters)
    "accord.fruity":    "میوەیی",
    "accord.smoky":     "دووکەڵاوی",
    "accord.woody":     "دارین",
    "accord.fresh":     "تازە",
    "accord.amber":     "عەنبەر",
    "accord.sweet":     "شیرین",
    "accord.saffron":   "زەعفەران",
    "accord.leather":   "چەرم",
    "accord.spicy":     "بەهاراتی",
    "accord.creamy":    "کرێمی",
    "accord.tobacco":   "تووتن",
    "accord.warm":      "گەرم",
    "accord.oud":       "عوود",
    "accord.vanilla":   "ڤانیلیا",
    "accord.floral":    "گوڵاوی",
    "accord.rose":      "گوڵی سوور",
    "accord.citrus":    "ترشاوی",
    "accord.aromatic":  "بۆنخۆش",
    "accord.ambroxan":  "ئەمبرۆکسان",
    "accord.gourmand":  "خۆراکی",
    "accord.almond":    "بادەم",

    // ---- marketplace: shell / nav ----
    "nav.browse":       "بەراوزکردن",
    "nav.sell":         "فرۆشتن",
    "shell.searchbar":  "گەڕان لە بۆنخۆش",
    "shell.sell":       "فرۆشتن",
    "city.All":         "هەموو شارەکان",
    "city.Sulaymaniyah":"سلێمانی",
    "city.Erbil":       "هەولێر",
    "city.Baghdad":     "بەغدا",
    "foot.mkt":         "بۆنخۆش © ٢٠٢٦ · بازاڕی بۆنی عێراق · سلێمانی · هەولێر · بەغدا",

    // ---- toasts ----
    "toast.tradeSent":  "پێشنیاری ئاڵوگۆڕ نێردرا بۆ {seller} لەسەر {frag}.",
    "toast.orderCod":   "داواکاری تۆمارکرا (پارەدان لە کاتی گەیاندن) — {seller} پشتڕاستی دەکاتەوە و بۆت دەنێرێت.",
    "toast.reserved":   "حیجزکرا بە {pay} — فرۆشیار ئاگادارکرایەوە.",
    "toast.listed":     "لیستەکەت بڵاوکرایەوە.",
    "toast.rated":      "{frag} هەڵسەنگێنرا بە {n}★",

    // ---- home / browse ----
    "home.allCities":   "سلێمانی، هەولێر و بەغدا",
    "home.heroTitle":   "بازاڕی بۆنی عێراق",
    "home.heroSub":     "هەر بۆنێک بگەڕێ، پاشان بیکڕە یان ئاڵوگۆڕی بکە لە دوکان و کۆکەرەوەکانی {city}.",
    "home.heroSearch":  "بۆنێک، کۆمپانیایەک یان تێبینییەک بگەڕێ…",
    "home.statFrag":    "بۆن",
    "home.statListings":"لیستەی چالاک",
    "home.statShops":   "دوکانی پشتڕاستکراو",
    "home.recent":      "دواین لیستەکان",
    "home.browseAll":   "هەموویان ببینە",
    "home.bestValue":   "باشترین نرخ ئێستا",
    "home.bestValueSub":"نزمترین نرخ بۆ هەر بۆنێک",
    "home.shops":       "دوکانەکانی بۆن",
    "home.seeAll":      "هەمووی ببینە",
    "home.openTrade":   "ئامادە بۆ ئاڵوگۆڕ",
    "home.openTradeSub":"بۆتڵێک بگۆڕەوە لەبری کڕین",
    "home.ctaTitle":    "بۆتڵێکت هەیە بۆ فرۆشتن یان ئاڵوگۆڕ؟",
    "home.ctaSub":      "لە کەمتر لە خولەکێکدا لیستی بکە. بگە بە کڕیاران لە هەر سێ شارەکە — پارەدان لە کاتی گەیاندن یان زەین کاش / فاستپەی / FIB.",
    "home.ctaBtn":      "بۆنێک لیست بکە",

    // ---- listing card ----
    "badge.shop":       "دوکان",
    "badge.reseller":   "فرۆشیار",
    "mode.sale":        "بۆ فرۆشتن",
    "mode.trade":       "بۆ ئاڵوگۆڕ",
    "mode.both":        "فرۆشتن یان ئاڵوگۆڕ",
    "cond.new":         "نوێ · پلۆمبکراو",
    "cond.used":        "بەکارهاتوو · {n}% پڕ",
    "lc.deals":         "مامەڵە",
    "lc.wants":         "دەیەوێت",
    "lc.buy":           "ئێستا بیکڕە",
    "lc.trade":         "پێشنیاری ئاڵوگۆڕ",
    "lc.ago":           "{t} لەمەوبەر",
    "lc.batch":         "بەتچ {b}",

    // ---- listings section ----
    "ls.available":     "ئێستا بەردەستە",
    "ls.sellYours":     "هی خۆت بفرۆشە",
    "ls.offers":        "{n} پێشکەش",
    "ls.fromWord":      "لە",
    "pay.cod.short":    "COD",
    "ls.noneCity":      "هیچ لیستەیەک نییە لە {city}.",
    "ls.anyCity":       "هیچ شارێک",
    "ls.firstCity":     "یەکەم کەس بە کە {frag} لە {city} لیست دەکات.",
    "ls.first":         "یەکەم کەس بە کە {frag} لیست دەکات.",
    "ls.listThis":      "ئەم بۆنە لیست بکە",
    "sort.priceLow":    "نزمترین نرخ",
    "sort.topSeller":   "باشترین فرۆشیار",
    "sort.newest":      "نوێترین",

    // ---- buy / trade modal ----
    "buy.proposeTrade": "پێشنیاری ئاڵوگۆڕ",
    "buy.placeOrder":   "داواکاری تۆمار بکە",
    "buy.offering":     "چی پێشکەش دەکەیت؟",
    "buy.offerPh":      "نموونە: {ex}",
    "buy.yourBottle":   "بۆتڵەکەت + پارە",
    "buy.lookingFor":   "فرۆشیار بەدوای: {list}",
    "buy.price":        "نرخ",
    "buy.payMethod":    "شێوازی پارەدان",
    "buy.codHint":      "لە کاتی گەیاندن پارە بە گەیەنەر دەدەیت. فرۆشیار پشتڕاستی دەکاتەوە و بۆ شارەکەت دەنێرێت.",
    "buy.protoHint":    "نموونە: پارەدانی {pay} لە قۆناغی باکێنددا بە API ڕاستەقینە دەبەسترێتەوە.",
    "buy.sendTrade":    "پێشنیاری ئاڵوگۆڕ بنێرە",
    "buy.confirmCod":   "پشتڕاستکردنەوەی داواکاری (COD)",
    "buy.continuePay":  "بەردەوامبە بۆ پارەدان",

    // ---- sell (post a listing) ----
    "sell.title":       "بۆنێک لیست بکە",
    "sell.sub":         "بۆتڵێک بفرۆشە یان بیگۆڕەوە بۆ کڕیاران لە سلێمانی، هەولێر و بەغدا.",
    "sell.which":       "کام بۆن؟",
    "sell.change":      "گۆڕین",
    "sell.searchCat":   "لە کەتەلۆگ بگەڕێ — ناو یان کۆمپانیا…",
    "sell.notInCat":    "هێشتا لە کەتەلۆگدا نییە — لە وەشانی ڕاستەقینەدا دەتوانیت بۆنی نوێ لێرە زیاد بکەیت.",
    "sell.type":        "جۆری لیستە",
    "sell.condition":   "دۆخ",
    "sell.condNew":     "نوێ / پلۆمبکراو",
    "sell.condUsed":    "بەکارهاتوو",
    "sell.approxFull":  "نزیکەی {n}% پڕ",
    "sell.size":        "قەبارەی بۆتڵ (مل)",
    "sell.priceIQD":    "نرخ (IQD)",
    "sell.cityLabel":   "شار",
    "sell.tradeFor":    "ئامادە بۆ ئاڵوگۆڕ بە (ئارەزوومەندانە)",
    "sell.payAccepted": "پارەدانی پەسەندکراو",
    "sell.notes":       "تێبینی (ئارەزوومەندانە)",
    "sell.notesPh":     "کۆدی بەتچ، سندوق لەگەڵدایە، هۆکاری فرۆشتن، شوێنی چاوپێکەوتن…",
    "sell.cancel":      "هەڵوەشاندنەوە",
    "sell.post":        "بڵاوکردنەوەی لیستە",
    "sell.forSale":     "بۆ فرۆشتن",
    "sell.saleOrTrade": "فرۆشتن یان ئاڵوگۆڕ",
    "sell.tradeOnly":   "تەنها ئاڵوگۆڕ",
    "pay.cod.full":     "پارەدان لە کاتی گەیاندن",

    // ---- fragrances catalog ----
    "fcat.title":       "بۆنەکان",
    "fcat.sub":         "لە کەتەلۆگ بگەڕێ، پاشان بیکڕە یان ئاڵوگۆڕی بکە — پێشکەشەکانی {city} پیشان دەدرێن.",
    "fcat.searchPh":    "بۆن، کۆمپانیا، تێبینی بگەڕێ…",
    "fcat.results":     "{n} ئەنجام",
    "fcat.noMatch":     "هیچ بۆنێک ناگونجێت.",
    "sort.mostListings":"زۆرترین لیستە",
    "sort.topRated":    "باشترین هەڵسەنگاندن",
    "sort.mostRated":   "زۆرترین هەڵسەنگاندن",
    "fr.from":          "لە",
    "fr.listing":       "لیستە",
    "fr.noListings":    "هیچ لیستەیەک نییە",

    // ---- fragrance page ----
    "fp.allFrag":       "هەموو بۆنەکان",
    "fp.community":     "هەڵسەنگاندنی کۆمەڵگا",
    "fp.ratings":       "{n} هەڵسەنگاندن",
    "fp.performance":   "کارایی",
    "fp.yourRating":    "هەڵسەنگاندنی تۆ",
    "fp.youRated":      "تۆ ئەمەت هەڵسەنگاند بە {n} / ٥ — سوپاس بۆ بەشداریت.",
    "fp.tapRate":       "ئەستێرەیەک لێبدە بۆ هەڵسەنگاندنی {frag}.",
    "fp.pyramid":       "هەرەمی تێبینییەکان",
    "fp.reviews":       "پێداچوونەوەکانی کۆمەڵگا",
    "fp.alsoLike":      "لەوانەیە ئەمانەشت بەدڵ بێت",

    // ---- search ----
    "srch.ph":          "بۆن، کۆمپانیا، تێبینی، دوکان بگەڕێ…",
    "srch.trending":    "گەڕانە بەناوبانگەکان",
    "srch.mostListed":  "زۆرترین لیستەکراو ئێستا",
    "srch.top":         "باشترین",
    "srch.frag":        "بۆنەکان",
    "srch.sellers":     "دوکان و فرۆشیارەکان",
    "srch.noResults":   "هیچ ئەنجامێک نییە بۆ «{q}»",
    "srch.noHint":      "کۆمپانیایەک، تێبینییەک، یان ناوی دوکانێک تاقیبکەوە.",
    "srch.global":      "لە کەتەلۆگی جیهانی",
    "srch.globalCta":   "گەڕان لە کەتەلۆگی تەواوی ٧٤هەزاری بۆ «{q}»",
    "srch.searching":   "گەڕان لە کەتەلۆگی جیهانی…",
    "srch.noGlobal":    "هیچ ئەنجامێکی زیاتر نییە لە کەتەلۆگی جیهانی.",
    "srch.unavail":     "گەڕانی جیهانی هێشتا بەردەست نییە — کلیلی Fragella دانەنراوە.",
    "srch.error":       "نەتوانرا بگەیت بە کەتەلۆگی جیهانی. دووبارە هەوڵبدەرەوە.",
    "frag.loading":     "بارکردن…",
    "frag.notFound":    "بۆنەکە نەدۆزرایەوە.",

    // ---- seller profile ----
    "prof.back":        "گەڕانەوە",
    "prof.followShop":  "دوکان فۆڵۆو بکە",
    "prof.newListing":  "لیستەی نوێ",
    "prof.rating":      "هەڵسەنگاندن",
    "prof.deals":       "مامەڵە",
    "prof.active":      "چالاک",
    "prof.forSale":     "بۆ فرۆشتن",
    "prof.trades":      "ئاڵوگۆڕەکان",
    "prof.reviews":     "پێداچوونەوەکان",
    "prof.noMine":      "هیچ لیستەیەکی چالاکت نییە. یەکێک بڵاوبکەرەوە بۆ دەستپێکردنی فرۆشتن.",
    "prof.noSale":      "هیچ لیستەیەک بۆ فرۆشتن نییە ئێستا.",
    "prof.noTrades":    "هیچ لیستەیەکی ئاڵوگۆڕ نییە.",
    "prof.reviewsSoon": "پێداچوونەوەی کڕیاران بۆ {name} لێرە دەردەکەوێت.",

    // language switch
    "lang.label": "زمان",
  };

  const DICT = { ku: KU };

  function interp(s, vars) {
    if (!vars || typeof s !== "string") return s;
    return s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  }

  // Build the i18n bundle for a given language.
  // tx(key, englishFallback, vars): returns the Kurdish string when one
  // exists, otherwise the (already-localized) English fallback.
  function makeI18n(lang) {
    const dir = lang === "ku" ? "rtl" : "ltr";
    const d = DICT[lang];
    function tx(key, fallback, vars) {
      const s = (d && d[key] != null) ? d[key] : fallback;
      return interp(s, vars);
    }
    return { lang, dir, tx };
  }

  const I18nContext = React.createContext(makeI18n("en"));

  window.I18nContext = I18nContext;
  window.makeI18n = makeI18n;
  window.useT = function () { return React.useContext(I18nContext); };
})();
