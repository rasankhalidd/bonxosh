/* ============================================================
   BONXOSH — Home / Browse: marketplace landing
   ============================================================ */
(function () {
  const { Icon, Avatar, FragThumb, Price, Verified, SectionHead, ListingTile, fmt } = window;
  const BX = window.BX;
  const cityLabel = (tx, c) => window.cityLabel(tx, c);

  function Home({ listings, city, onOpenFrag, onBuy, onOpenSeller, onSell, goSearch, goFragrances }) {
    const { tx } = window.useT();
    const [fragCount, setFragCount] = React.useState(BX.fragrances.length);
    const [q, setQ] = React.useState("");
    React.useEffect(() => {
      if (window.Catalog) window.Catalog.count().then((n) => { if (n) setFragCount(n); });
    }, []);
    const inCity = (l) => city === "All" || BX.sellers[l.seller].city === city;
    const visible = listings.filter(inCity);
    const frag = (l) => BX.fById[l.frag] || (window.Catalog && window.Catalog.cacheGet(l.frag));

    const fresh = visible.filter(frag).slice(0, 8);
    const board = visible.filter((l) => l.mode !== "trade" && frag(l)).slice(0, 5);

    const byFrag = {};
    visible.filter((l) => l.mode !== "trade" && frag(l)).forEach((l) => {
      if (!byFrag[l.frag] || l.priceIQD < byFrag[l.frag].priceIQD) byFrag[l.frag] = l;
    });
    const deals = Object.values(byFrag).sort((a, b) => a.priceIQD - b.priceIQD).slice(0, 6);

    const shops = Object.values(BX.sellers).filter((s) => s.type === "shop");
    const tradeable = visible.filter((l) => (l.mode === "trade" || l.mode === "both") && frag(l)).slice(0, 3);
    const cityName = city === "All"
      ? tx("home.allCities", "Sulaymaniyah, Erbil & Baghdad")
      : cityLabel(tx, city);

    const submit = (e) => { e.preventDefault(); goSearch(q.trim()); };

    return (
      <div className="home">
        {/* ---------- hero ---------- */}
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">{tx("home.heroTitle", "Iraq's fragrance marketplace")}</p>
            <h1 className="hero-title">
              {tx("home.h1a", "Every bottle in Iraq,")}{" "}
              <em>{tx("home.h1b", "one search away.")}</em>
            </h1>
            <p className="hero-sub">
              {tx("home.heroSub", `Search any fragrance, then buy or trade from shops & collectors in ${cityName}.`, { city: cityName })}
            </p>
            <form className="hero-search" role="search" onSubmit={submit}>
              <Icon name="search"/>
              <input value={q} onChange={(e) => setQ(e.target.value)}
                aria-label={tx("home.heroSearch", "Search a fragrance, house or note…")}
                placeholder={tx("home.heroSearch", "Search a fragrance, house or note…")}/>
              <button type="submit" className="btn btn-primary">{tx("home.searchBtn", "Search")}</button>
            </form>
            <div className="hero-popular">
              <span>{tx("home.popular", "Popular")}</span>
              {BX.trendingSearches.slice(0, 5).map((t) => (
                <button key={t} className="link-chip" onClick={() => goSearch(t)}>{t}</button>
              ))}
            </div>
          </div>

          {/* live price board */}
          <aside className="board" aria-labelledby="board-title">
            <div className="board-head">
              <span className="live-dot" aria-hidden="true"/>
              <h2 id="board-title">{tx("home.boardTitle", "Live on the market")}</h2>
              <span className="board-city">{city === "All" ? tx("city.All", "All cities") : cityLabel(tx, city)}</span>
            </div>
            <ol className="board-rows">
              {board.map((l) => {
                const f = frag(l);
                return (
                  <li key={l.id}>
                    <button className="board-row" onClick={() => onOpenFrag(f.id)}>
                      <span className="board-thumb"><FragThumb frag={f}/></span>
                      <span className="board-name">
                        <b>{f.name}</b>
                        <small>{window.condShort(tx, l)} · {cityLabel(tx, BX.sellers[l.seller].city)}</small>
                      </span>
                      <Price iqd={l.priceIQD}/>
                    </button>
                  </li>
                );
              })}
            </ol>
            <dl className="board-stats">
              <div><dt>{tx("home.statFrag", "fragrances")}</dt><dd>{fragCount.toLocaleString("en-US")}</dd></div>
              <div><dt>{tx("home.statListings", "live listings")}</dt><dd>{visible.length}</dd></div>
              <div><dt>{tx("home.statShops", "verified shops")}</dt><dd>{shops.length}</dd></div>
            </dl>
          </aside>
        </section>

        {/* ---------- how it works ---------- */}
        <section className="steps" aria-label={tx("home.howTitle", "How Bonxosh works")}>
          {[
            ["search", tx("home.step1t", "Find the bottle"), tx("home.step1", "Search the full Parfumo catalog by name, house or note.")],
            ["store", tx("home.step2t", "Compare sellers"), tx("home.step2", "See every offer side by side — condition, batch, price and city.")],
            ["truck", tx("home.step3t", "Pay your way"), tx("home.step3", "Cash on delivery, Zain Cash, FastPay or FIB. Or trade a bottle instead.")],
          ].map(([icon, t, d], i) => (
            <div key={icon} className="step-item">
              <span className="step-num">0{i + 1}</span>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ---------- fresh listings ---------- */}
        <section className="sec">
          <SectionHead eyebrow={tx("home.freshEyebrow", "Just listed")} title={tx("home.recent", "Recently listed")}
            action={tx("home.browseAll", "Browse all")} onAction={goFragrances}/>
          <div className="tile-grid">
            {fresh.map((l) => (
              <ListingTile key={l.id} listing={l} frag={frag(l)} onOpen={onOpenFrag}/>
            ))}
          </div>
        </section>

        {/* ---------- price ledger ---------- */}
        {deals.length > 0 && (
          <section className="sec sec-split">
            <div className="split-intro">
              <SectionHead eyebrow={tx("home.ledgerEyebrow", "Price ledger")} title={tx("home.bestValue", "Best value right now")}
                sub={tx("home.bestValueSub", "Lowest price per fragrance")}/>
            </div>
            <ol className="ledger">
              {deals.map((l, i) => {
                const f = frag(l);
                return (
                  <li key={l.id}>
                    <button className="ledger-row" onClick={() => onOpenFrag(f.id)}>
                      <span className="ledger-rank">{String(i + 1).padStart(2, "0")}</span>
                      <span className="ledger-thumb"><FragThumb frag={f}/></span>
                      <span className="ledger-name"><b>{f.name}</b><small>{f.house}</small></span>
                      <span className="ledger-meta">{window.condShort(tx, l)}<small>{cityLabel(tx, BX.sellers[l.seller].city)}</small></span>
                      <Price iqd={l.priceIQD}/>
                      <Icon name="chevron" className="ledger-chev flip-rtl"/>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* ---------- shops ---------- */}
        <section className="sec">
          <SectionHead eyebrow={tx("home.shopsEyebrow", "Verified storefronts")} title={tx("home.shops", "Perfume shops")}/>
          <div className="shop-grid">
            {shops.map((s) => {
              const n = listings.filter((l) => l.seller === s.id).length;
              return (
                <button key={s.id} className="shop-card" onClick={() => onOpenSeller(s.id)}>
                  <span className="shop-top">
                    <Avatar user={s} size={52}/>
                    <span className="shop-rating"><Icon name="starSolid" className="star-ico"/>{s.rating.toFixed(1)}</span>
                  </span>
                  <span className="shop-name">{s.name}<Verified/></span>
                  <span className="shop-meta"><Icon name="pin"/>{cityLabel(tx, s.city)}{s.joined && <> · {s.joined}</>}</span>
                  <span className="shop-bio">{s.bio}</span>
                  <span className="shop-foot">
                    <span>{tx("lc.dealsN", `${fmt(s.sales)} deals`, { n: fmt(s.sales) })} · {tx("home.listingsN", `${n} listings`, { n })}</span>
                    <Icon name="arrowRight" className="flip-rtl"/>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ---------- trades ---------- */}
        {tradeable.length > 0 && (
          <section className="sec">
            <SectionHead eyebrow={tx("home.tradeEyebrow", "Swap, don't spend")} title={tx("home.openTrade", "Open to trade")}
              sub={tx("home.openTradeSub", "Swap a bottle instead of buying")}/>
            <div className="trade-grid">
              {tradeable.map((l) => <TradeCard key={l.id} listing={l} frag={frag(l)} onOpenFrag={onOpenFrag} onBuy={onBuy}/>)}
            </div>
          </section>
        )}

        {/* ---------- sell CTA ---------- */}
        <section className="cta-band">
          <div className="cta-copy">
            <h2>{tx("home.ctaTitle", "Have a bottle to sell or trade?")}</h2>
            <p>{tx("home.ctaSub", "List it in under a minute. Reach buyers in all three cities — cash on delivery or Zain Cash / FastPay / FIB.")}</p>
          </div>
          <button className="btn btn-gold btn-lg" onClick={onSell}><Icon name="plus"/>{tx("home.ctaBtn", "List a fragrance")}</button>
        </section>
      </div>
    );
  }

  function TradeCard({ listing, frag, onOpenFrag, onBuy }) {
    const { tx } = window.useT();
    const seller = BX.sellers[listing.seller];
    const wants = (listing.seek || []).map((id) => BX.fById[id]).filter(Boolean);
    return (
      <article className="trade-card">
        <div className="trade-swap">
          <button className="trade-side" onClick={() => onOpenFrag(frag.id)}>
            <span className="trade-thumb"><FragThumb frag={frag}/></span>
            <span className="label">{tx("lc.has", "Has")}</span>
            <b>{frag.name}</b>
            <small>{window.condShort(tx, listing)} · <bdi>{listing.volume} ml</bdi></small>
          </button>
          <span className="trade-arrow" aria-hidden="true"><Icon name="swap"/></span>
          <div className="trade-side is-wants">
            <span className="label">{tx("lc.wants", "Wants")}</span>
            {wants.length
              ? wants.map((f) => (
                  <button key={f.id} className="trade-want" onClick={() => onOpenFrag(f.id)}>
                    <span className="trade-thumb sm"><FragThumb frag={f}/></span>{f.name}
                  </button>
                ))
              : <p className="trade-open">{tx("lc.openOffers", "Open to trade offers")}</p>}
          </div>
        </div>
        <div className="trade-foot">
          <span className="trade-seller">
            <Avatar user={seller} size={26}/>
            <span>{seller.name}<small>{cityLabel(tx, seller.city)}</small></span>
          </span>
          <button className="btn btn-outline btn-sm" onClick={() => onBuy(listing, "trade")}>{tx("lc.trade", "Propose trade")}</button>
        </div>
      </article>
    );
  }

  window.Home = Home;
})();
