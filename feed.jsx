/* ============================================================
   BONXOSH — Home / Browse: marketplace landing
   ============================================================ */
(function () {
  const { Icon, Avatar, FragThumb, Stars, fmt } = window;
  const BX = window.BX;
  const fmtIQD = (n) => window.fmtIQD(n);
  const cityLabel = (tx, c) => window.cityLabel(tx, c);

  function Home({ listings, city, onOpenFrag, onBuy, onOpenSeller, onSell, goSearch, goFragrances }) {
    const { tx } = window.useT();
    const inCity = (l) => city === "All" || BX.sellers[l.seller].city === city;
    const visible = listings.filter(inCity);

    const recent = visible.slice(0, 6);

    const byFrag = {};
    visible.filter((l) => l.mode !== "trade").forEach((l) => {
      if (!byFrag[l.frag] || l.priceIQD < byFrag[l.frag].priceIQD) byFrag[l.frag] = l;
    });
    const deals = Object.values(byFrag).sort((a, b) => a.priceIQD - b.priceIQD).slice(0, 6);

    const shops = Object.values(BX.sellers).filter((s) => s.type === "shop");
    const tradeable = visible.filter((l) => l.mode === "trade" || l.mode === "both").slice(0, 4);
    const cityName = city === "All"
      ? tx("home.allCities", "Sulaymaniyah, Erbil & Baghdad")
      : cityLabel(tx, city);

    return (
      <div className="home-mkt">
        {/* hero */}
        <section className="mkt-hero">
          <h1>{tx("home.heroTitle", "Iraq's fragrance marketplace")}</h1>
          <p>{tx("home.heroSub", `Search any fragrance, then buy or trade from shops & collectors in ${cityName}.`, { city: cityName })}</p>
          <button className="hero-search" onClick={goSearch}>
            <Icon name="search" />
            <span>{tx("home.heroSearch", "Search a fragrance, house or note…")}</span>
          </button>
          <div className="hero-stats">
            <span><b>{BX.fragrances.length}</b> {tx("home.statFrag", "fragrances")}</span>
            <span><b>{visible.length}</b> {tx("home.statListings", "live listings")}</span>
            <span><b>{shops.length}</b> {tx("home.statShops", "verified shops")}</span>
          </div>
        </section>

        {/* recently listed */}
        <Section title={tx("home.recent", "Recently listed")} action={tx("home.browseAll", "Browse all")} onAction={goFragrances}>
          <div className="listing-list two-col">
            {recent.map((l) => (
              <window.ListingCard key={l.id} listing={l} frag={BX.fById[l.frag]} showFrag
                onBuy={onBuy} onOpenSeller={onOpenSeller} />
            ))}
          </div>
        </Section>

        {/* best value */}
        <Section title={tx("home.bestValue", "Best value right now")} sub={tx("home.bestValueSub", "Lowest price per fragrance")}>
          <div className="deal-row">
            {deals.map((l) => {
              const f = BX.fById[l.frag];
              return (
                <button key={l.id} className="deal-card" onClick={() => onOpenFrag(f.id)}>
                  <div className="deal-thumb"><FragThumb frag={f} /></div>
                  <div className="deal-name">{f.name}</div>
                  <div className="deal-house">{f.house}</div>
                  <div className="deal-price">{fmtIQD(l.priceIQD)}</div>
                  <div className="deal-city"><Icon name="pin" style={{ width: 11, height: 11 }} />{cityLabel(tx, BX.sellers[l.seller].city)}</div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* verified shops */}
        <Section title={tx("home.shops", "Perfume shops")} action={tx("home.seeAll", "See all")} onAction={goSearch}>
          <div className="shop-row">
            {shops.map((s) => (
              <button key={s.id} className="shop-card" onClick={() => onOpenSeller(s.id)}>
                <Avatar user={s} size={52} />
                <div className="shop-name">{s.name}<Icon name="verify" className="verify" /></div>
                <div className="shop-city"><Icon name="pin" style={{ width: 11, height: 11 }} />{cityLabel(tx, s.city)}</div>
                <div className="shop-rating">
                  <Icon name="starSolid" style={{ width: 12, height: 12, color: "var(--gold)" }} />
                  {s.rating.toFixed(1)} · {fmt(s.sales)} {tx("lc.deals", "deals")}
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* open to trade */}
        {tradeable.length > 0 && (
          <Section title={tx("home.openTrade", "Open to trade")} sub={tx("home.openTradeSub", "Swap a bottle instead of buying")}>
            <div className="listing-list two-col">
              {tradeable.map((l) => (
                <window.ListingCard key={l.id} listing={l} frag={BX.fById[l.frag]} showFrag
                  onBuy={onBuy} onOpenSeller={onOpenSeller} />
              ))}
            </div>
          </Section>
        )}

        {/* sell CTA */}
        <section className="sell-cta">
          <div>
            <h3>{tx("home.ctaTitle", "Have a bottle to sell or trade?")}</h3>
            <p>{tx("home.ctaSub", "List it in under a minute. Reach buyers in all three cities — cash on delivery or Zain Cash / FastPay / FIB.")}</p>
          </div>
          <button className="pill-btn" onClick={onSell}><Icon name="plus" style={{ width: 15, height: 15 }} /> {tx("home.ctaBtn", "List a fragrance")}</button>
        </section>
      </div>
    );
  }

  function Section({ title, sub, action, onAction, children }) {
    return (
      <section className="mkt-sec">
        <div className="mkt-sec-head">
          <div>
            <h2>{title}</h2>
            {sub && <span className="mkt-sec-sub">{sub}</span>}
          </div>
          {action && <button className="see-all-inline" onClick={onAction}>{action} <Icon name="chevron" style={{ width: 14, height: 14 }} /></button>}
        </div>
        {children}
      </section>
    );
  }

  window.Home = Home;
})();
