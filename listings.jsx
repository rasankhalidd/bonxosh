/* ============================================================
   BONXOSH — Marketplace: listing tiles, the offers ledger on a
   fragrance page, the buy/trade dialog, and the Sell flow
   ============================================================ */
(function () {
  const { Icon, Avatar, FragThumb, Price, Verified, Segmented, Select, Empty, fmt } = window;
  const BX = window.BX;

  // ---- helpers --------------------------------------------------------
  const fmtIQD = (n) => n.toLocaleString("en-US") + " IQD";
  window.fmtIQD = fmtIQD;
  const cityLabel = (tx, c) => tx("city." + c, c);
  window.cityLabel = cityLabel;

  const modeLabel = (tx, m) => m === "trade" ? tx("mode.trade", "For trade")
    : m === "both" ? tx("mode.both", "Sale or trade") : tx("mode.sale", "For sale");
  const condText = (tx, l) => l.condition === "new"
    ? tx("cond.new", "New · sealed")
    : tx("cond.used", `Used · ${l.fillPct}% full`, { n: l.fillPct });
  const condShort = (tx, l) => l.condition === "new"
    ? tx("cond.sealed", "Sealed")
    : tx("cond.full", `${l.fillPct}% full`, { n: l.fillPct });
  window.condShort = condShort;
  const ago = (tx, t) => t === "now" ? tx("lc.justNow", "Just now") : tx("lc.ago", `${t} ago`, { t });

  function sellerKind(tx, s) {
    return s.type === "shop" ? tx("badge.shop", "Shop") : tx("badge.reseller", "Reseller");
  }
  window.sellerKind = sellerKind;

  // kept for callers that still want a compact kind label
  function SellerBadge({ seller }) {
    const { tx } = window.useT();
    return <span className={"kind kind-" + seller.type}>{sellerKind(tx, seller)}</span>;
  }
  window.SellerBadge = SellerBadge;

  // Payment methods as a quiet, readable line rather than a row of chips
  function PayList({ codes }) {
    const { tx } = window.useT();
    return (
      <span className="paylist">
        {codes.map((c) => {
          const m = BX.pay[c]; if (!m) return null;
          return (
            <span key={c} className="paylist-item">
              <Icon name={m.icon}/>{c === "cod" ? tx("pay.cod.short", "COD") : m.short}
            </span>
          );
        })}
      </span>
    );
  }
  window.PayChips = PayList;
  window.PayList = PayList;

  /* ---- Listing tile (grids: home, profile, sell preview) ------------- */
  function ListingTile({ listing, frag, onOpen, showSeller = true, preview }) {
    const { tx } = window.useT();
    const seller = BX.sellers[listing.seller];
    const isTrade = listing.mode === "trade";
    const wants = (listing.seek || []).map((id) => BX.fById[id]).filter(Boolean);
    const Name = preview ? "span" : "button";
    return (
      <article className={"tile" + (preview ? " is-preview" : "")}>
        <div className="tile-well">
          <FragThumb frag={frag} />
          {listing.mode !== "sale" && (
            <span className={"tile-flag" + (isTrade ? " is-trade" : "")}>
              <Icon name="swap"/>{modeLabel(tx, listing.mode)}
            </span>
          )}
        </div>
        <div className="tile-body">
          <h3 className="tile-name">
            <Name className="stretch" onClick={preview ? undefined : () => onOpen(frag.id)}>{frag.name}</Name>
          </h3>
          <p className="tile-house">{frag.house}</p>
          <div className="tile-price">
            {isTrade
              ? <span className="tile-wants">{wants.length
                  ? tx("lc.wantsList", `Wants ${wants.map((f) => f.name).join(", ")}`, { list: wants.map((f) => f.name).join(", ") })
                  : tx("lc.tradeOnly", "Trade only")}</span>
              : listing.priceIQD ? <Price iqd={listing.priceIQD}/> : <span className="tile-wants">—</span>}
          </div>
          <p className="tile-meta">
            <span className={"cond-dot cond-" + listing.condition} aria-hidden="true"/>
            {condShort(tx, listing)} · <bdi>{listing.volume} ml</bdi>
          </p>
          {showSeller && seller && (
            <p className="tile-seller">
              <span className="tile-seller-name">{seller.name}</span>
              {seller.verified && <Verified/>}
              <span className="dot-sep" aria-hidden="true">·</span>
              {cityLabel(tx, listing.city || seller.city)}
            </p>
          )}
        </div>
      </article>
    );
  }
  window.ListingTile = ListingTile;

  /* ---- One seller's offer on a fragrance page ------------------------ */
  function OfferRow({ listing, best, onBuy, onOpenSeller }) {
    const { tx } = window.useT();
    const seller = BX.sellers[listing.seller];
    const isTrade = listing.mode === "trade";
    const wants = (listing.seek || []).map((id) => BX.fById[id]).filter(Boolean);
    return (
      <li className={"offer" + (best ? " is-best" : "")}>
        <button className="offer-seller" onClick={() => onOpenSeller && onOpenSeller(seller.id)}>
          <Avatar user={seller} size={42}/>
          <span className="offer-seller-text">
            <span className="offer-seller-name">{seller.name}{seller.verified && <Verified/>}</span>
            <span className="offer-seller-sub">
              {sellerKind(tx, seller)} · {cityLabel(tx, seller.city)}
            </span>
            <span className="offer-seller-sub">
              <Icon name="starSolid" className="star-ico"/>{seller.rating.toFixed(1)}
              <span className="dot-sep" aria-hidden="true">·</span>
              {tx("lc.dealsN", `${fmt(seller.sales)} deals`, { n: fmt(seller.sales) })}
            </span>
          </span>
        </button>

        <div className="offer-detail">
          <p className="offer-spec">
            <span className={"cond cond-" + listing.condition}>{condText(tx, listing)}</span>
            <span><bdi>{listing.volume} ml</bdi></span>
            {listing.batch && <span className="mono">{tx("lc.batch", `Batch ${listing.batch}`, { b: listing.batch })}</span>}
          </p>
          {listing.note && <p className="offer-note">{listing.note}</p>}
          {listing.mode !== "sale" && (
            <p className="offer-wants">
              <Icon name="swap"/>
              {wants.length
                ? tx("lc.wantsList", `Wants ${wants.map((f) => f.name).join(", ")}`, { list: wants.map((f) => f.name).join(", ") })
                : tx("lc.openOffers", "Open to trade offers")}
            </p>
          )}
          <PayList codes={listing.pay}/>
        </div>

        <div className="offer-price">
          {best && <span className="best-tag">{tx("ls.best", "Lowest price")}</span>}
          {isTrade
            ? <span className="offer-tradeonly">{tx("lc.tradeOnly", "Trade only")}</span>
            : <Price iqd={listing.priceIQD} size="lg"/>}
          <span className="offer-time"><Icon name="clock"/>{ago(tx, listing.time)}</span>
        </div>

        <div className="offer-actions">
          {listing.mode !== "trade" && (
            <button className="btn btn-primary" onClick={() => onBuy(listing, "buy")}>{tx("lc.buy", "Buy now")}</button>
          )}
          {listing.mode !== "sale" && (
            <button className="btn btn-outline" onClick={() => onBuy(listing, "trade")}>
              <Icon name="swap"/>{tx("lc.trade", "Propose trade")}
            </button>
          )}
        </div>
      </li>
    );
  }

  /* ---- The offers section on a fragrance page ------------------------ */
  function ListingsSection({ frag, listings, city, onBuy, onOpenSeller, onSell }) {
    const { tx } = window.useT();
    const [sort, setSort] = React.useState("price");
    const [cityF, setCityF] = React.useState(city || "All");
    React.useEffect(() => { if (city) setCityF(city); }, [city]);

    const all = listings.filter((l) => l.frag === frag.id);
    let list = cityF === "All" ? all : all.filter((l) => BX.sellers[l.seller].city === cityF);
    list = [...list].sort((a, b) => {
      if (sort === "price") return (a.priceIQD || 1e12) - (b.priceIQD || 1e12);
      if (sort === "new") return list.indexOf(a) - list.indexOf(b);
      if (sort === "rating") return BX.sellers[b.seller].rating - BX.sellers[a.seller].rating;
      return 0;
    });

    const prices = list.filter((l) => l.mode !== "trade").map((l) => l.priceIQD);
    const low = prices.length ? Math.min(...prices) : null;
    const where = cityF === "All" ? tx("ls.anyCity", "any city") : cityLabel(tx, cityF);
    const countIn = (c) => c === "All" ? all.length : all.filter((l) => BX.sellers[l.seller].city === c).length;

    return (
      <section className="offers" id="offers" aria-labelledby="offers-title">
        <div className="offers-head">
          <div>
            <h2 id="offers-title">{tx("ls.available", "Available now")}</h2>
            <p className="offers-summary" aria-live="polite">
              {list.length > 0
                ? <>{tx("ls.offers", `${list.length} offer${list.length !== 1 ? "s" : ""}`, { n: list.length })}
                    {low != null && <> · {tx("ls.fromWord", "from")} <b>{fmtIQD(low)}</b></>}</>
                : tx("ls.noneCity", `No listings yet in ${where}.`, { city: where })}
            </p>
          </div>
          <button className="btn btn-ghost" onClick={onSell}><Icon name="plus"/>{tx("ls.sellYours", "Sell yours")}</button>
        </div>

        <div className="offers-tools">
          <Segmented label={tx("sell.cityLabel", "City")} value={cityF} onChange={setCityF}
            options={["All", ...BX.cities].map((c) => [c, <>{c === "All" ? tx("city.All", "All cities") : cityLabel(tx, c)}<span className="seg-count">{countIn(c)}</span></>])}/>
          <Select label={tx("ls.sortBy", "Sort by")} value={sort} onChange={setSort} icon="sliders"
            options={[["price", tx("sort.priceLow", "Lowest price")], ["rating", tx("sort.topSeller", "Top seller")], ["new", tx("sort.newest", "Newest")]]}/>
        </div>

        {list.length > 0 ? (
          <ul className="offer-list">
            {list.map((l) => (
              <OfferRow key={l.id} listing={l} best={low != null && l.priceIQD === low && list.length > 1}
                onBuy={onBuy} onOpenSeller={onOpenSeller}/>
            ))}
          </ul>
        ) : (
          <Empty icon="tag"
            text={cityF !== "All"
              ? tx("ls.firstCity", `Be the first to list ${frag.name} in ${cityLabel(tx, cityF)}.`, { frag: frag.name, city: cityLabel(tx, cityF) })
              : tx("ls.first", `Be the first to list ${frag.name}.`, { frag: frag.name })}>
            <button className="btn btn-primary" onClick={onSell}>{tx("ls.listThis", "List this fragrance")}</button>
          </Empty>
        )}
      </section>
    );
  }
  window.ListingsSection = ListingsSection;

  /* ---- Dialog shell: Esc closes, focus moves in, page doesn't scroll -- */
  function Dialog({ title, onClose, children, footer, labelId }) {
    const ref = React.useRef(null);
    React.useEffect(() => {
      const prev = document.activeElement;
      const onKey = (e) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", onKey);
      document.body.classList.add("no-scroll");
      const first = ref.current && ref.current.querySelector("textarea, [aria-checked='true'], button.btn");
      if (first) first.focus();
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.classList.remove("no-scroll");
        if (prev && prev.focus) prev.focus();
      };
    }, []);
    return (
      <div className="scrim" onMouseDown={onClose}>
        <div ref={ref} className="dialog" role="dialog" aria-modal="true" aria-labelledby={labelId}
          onMouseDown={(e) => e.stopPropagation()}>
          <header className="dialog-head">
            <h2 id={labelId}>{title}</h2>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x"/></button>
          </header>
          <div className="dialog-body">{children}</div>
          {footer && <footer className="dialog-foot">{footer}</footer>}
        </div>
      </div>
    );
  }
  window.Dialog = Dialog;

  /* ---- Buy / Trade dialog -------------------------------------------- */
  function BuyModal({ listing, intent, onClose, onConfirm }) {
    const { tx } = window.useT();
    const frag = BX.fById[listing.frag] || (window.Catalog && window.Catalog.cacheGet(listing.frag));
    const seller = BX.sellers[listing.seller];
    const isTrade = intent === "trade";
    const [payCode, setPayCode] = React.useState(listing.pay[0]);
    const [offer, setOffer] = React.useState("");
    const wants = (listing.seek || []).map((id) => BX.fById[id]).filter(Boolean);
    const seekNames = wants.map((f) => f.name).join(", ");
    const addToOffer = (name) => setOffer((o) => o.includes(name) ? o : (o.trim() ? o.trim() + ", " : "") + name);

    const cta = isTrade ? tx("buy.sendTrade", "Send trade offer")
      : payCode === "cod" ? tx("buy.confirmCod", "Confirm order (COD)") : tx("buy.continuePay", "Continue to pay");

    return (
      <Dialog labelId="buy-title" onClose={onClose}
        title={isTrade ? tx("buy.proposeTrade", "Propose a trade") : tx("buy.placeOrder", "Place order")}
        footer={
          <>
            {!isTrade && (
              <div className="total-row">
                <span>{tx("buy.total", "Total")}</span>
                <Price iqd={listing.priceIQD} size="lg"/>
              </div>
            )}
            <button className="btn btn-primary btn-block btn-lg" disabled={isTrade && !offer.trim()}
              onClick={() => onConfirm(listing, intent, isTrade ? { offer } : { payCode })}>{cta}</button>
          </>
        }>
        <div className="order-item">
          <span className="order-thumb"><FragThumb frag={frag}/></span>
          <div className="order-text">
            <p className="order-name">{frag.name}</p>
            <p className="order-house">{frag.house}</p>
            <p className="order-seller">
              <Avatar user={seller} size={20}/>{seller.name}{seller.verified && <Verified/>}
            </p>
          </div>
        </div>
        <dl className="facts">
          <div><dt>{tx("sell.condition", "Condition")}</dt><dd>{condText(tx, listing)}</dd></div>
          <div><dt>{tx("buy.size", "Size")}</dt><dd><bdi>{listing.volume} ml</bdi></dd></div>
          <div><dt>{tx("buy.shipsFrom", "Ships from")}</dt><dd>{cityLabel(tx, seller.city)}</dd></div>
        </dl>

        {isTrade ? (
          <div className="field">
            <label className="field-label" htmlFor="trade-offer">{tx("buy.offering", "What are you offering?")}</label>
            <textarea id="trade-offer" value={offer} onChange={(e) => setOffer(e.target.value)} rows={3}
              placeholder={tx("buy.offerPh", "e.g. " + (seekNames || tx("buy.yourBottle", "your bottle + cash")), { ex: seekNames || tx("buy.yourBottle", "your bottle + cash") })}/>
            {wants.length > 0 && (
              <div className="field-hint">
                <span>{tx("buy.sellerWants", "Seller is looking for")}:</span>
                {wants.map((f) => (
                  <button key={f.id} type="button" className="chip chip-sm" onClick={() => addToOffer(f.name)}>
                    <Icon name="plus"/>{f.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="field">
            <span className="field-label" id="pay-label">{tx("buy.payMethod", "Payment method")}</span>
            <div className="choice-list" role="radiogroup" aria-labelledby="pay-label">
              {listing.pay.map((c) => {
                const m = BX.pay[c];
                const on = payCode === c;
                return (
                  <button key={c} type="button" role="radio" aria-checked={on}
                    className={"choice" + (on ? " is-on" : "")} onClick={() => setPayCode(c)}>
                    <span className="choice-ico"><Icon name={m.icon}/></span>
                    <span className="choice-text">{c === "cod" ? tx("pay.cod.full", "Cash on Delivery") : m.label}</span>
                    <span className="choice-radio" aria-hidden="true"/>
                  </button>
                );
              })}
            </div>
            <p className="field-hint">
              {payCode === "cod"
                ? tx("buy.codHint", "You'll pay the courier on delivery. Seller confirms and ships to your city.")
                : tx("buy.protoHint", `Prototype: ${BX.pay[payCode].label} checkout will be wired to the real API in the backend phase.`, { pay: BX.pay[payCode].label })}
            </p>
          </div>
        )}
      </Dialog>
    );
  }
  window.BuyModal = BuyModal;

  /* ---- Sell: post a listing ----------------------------------------- */
  const SIZES = [30, 50, 75, 100, 125, 200];

  function Sell({ onCreate, onCancel, presetFrag }) {
    const { tx } = window.useT();
    const [frag, setFrag] = React.useState(presetFrag || "");
    const [fq, setFq] = React.useState("");
    const [mode, setMode] = React.useState("sale");
    const [condition, setCondition] = React.useState("new");
    const [fillPct, setFillPct] = React.useState(90);
    const [volume, setVolume] = React.useState(100);
    const [price, setPrice] = React.useState("");
    const [city, setCity] = React.useState(BX.sellers[BX.ME].city);
    const [pay, setPay] = React.useState(["cod"]);
    const [note, setNote] = React.useState("");
    const [seek, setSeek] = React.useState([]);
    const [tried, setTried] = React.useState(false);

    const [catMatches, setCatMatches] = React.useState([]);
    const localMatches = fq.trim()
      ? BX.fragrances.filter((f) => (f.name + " " + f.house).toLowerCase().includes(fq.toLowerCase())).slice(0, 6)
      : [];
    // top up with catalog hits (debounced), skipping seed duplicates
    React.useEffect(() => {
      setCatMatches([]);
      const q = fq.trim();
      if (q.length < 2 || !window.Catalog || !window.Catalog.isAvailable()) return;
      let live = true;
      const t = setTimeout(() => {
        window.Catalog.search(q, 8).then((res) => { if (live) setCatMatches(res.results); });
      }, 250);
      return () => { live = false; clearTimeout(t); };
    }, [fq]);
    const key = (f) => (f.name + "|" + f.house).toLowerCase();
    const localKeys = new Set(localMatches.map(key));
    const fragMatches = [...localMatches, ...catMatches.filter((f) => !localKeys.has(key(f)))].slice(0, 8);
    const chosen = frag ? (BX.fById[frag] || (window.Catalog && window.Catalog.cacheGet(frag))) : null;
    const needsPrice = mode !== "trade";
    const priceN = +String(price).replace(/\D/g, "");

    const checks = [
      [!!chosen, tx("sell.chkFrag", "Fragrance chosen")],
      [!needsPrice || priceN > 0, tx("sell.chkPrice", "Price set")],
      [pay.length > 0, tx("sell.chkPay", "At least one payment method")],
    ];
    const valid = checks.every(([ok]) => ok);

    const togglePay = (c) => setPay((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);
    const toggleSeek = (id) => setSeek((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

    const draft = {
      id: "draft", frag, seller: BX.ME, mode, condition,
      fillPct: condition === "used" ? +fillPct : undefined,
      volume: +volume || 0, priceIQD: needsPrice ? priceN : undefined,
      city, time: "now", pay, note: note.trim(),
      seek: mode !== "sale" ? seek : undefined,
    };

    function submit(e) {
      e.preventDefault();
      if (!valid) { setTried(true); return; }
      onCreate({ ...draft, id: "l" + Date.now() });
    }

    const previewFrag = chosen || { id: "", name: tx("sell.yourFrag", "Your fragrance"), house: tx("sell.house", "House"), accords: [] };

    return (
      <div className="page sell">
        <header className="page-head">
          <p className="eyebrow">{tx("sell.eyebrow", "Sell or trade")}</p>
          <h1>{tx("sell.title", "List a fragrance")}</h1>
          <p className="page-sub">{tx("sell.sub", "Sell or trade a bottle to buyers across Sulaymaniyah, Erbil & Baghdad.")}</p>
        </header>

        <div className="sell-layout">
          <form className="sell-form" onSubmit={submit} noValidate>
            {/* 1 — fragrance */}
            <fieldset className="step">
              <legend><span className="step-n">1</span>{tx("sell.which", "Which fragrance?")}</legend>
              {chosen ? (
                <div className="picked">
                  <span className="picked-thumb"><FragThumb frag={chosen}/></span>
                  <span className="picked-text">
                    <b>{chosen.name}</b>
                    <small>{[chosen.house, chosen.year].filter(Boolean).join(" · ")}</small>
                  </span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setFrag(""); setFq(""); }}>{tx("sell.change", "Change")}</button>
                </div>
              ) : (
                <div className="combo">
                  <div className={"input-icon" + (tried && !chosen ? " is-invalid" : "")}>
                    <Icon name="search"/>
                    <input autoFocus value={fq} onChange={(e) => setFq(e.target.value)}
                      aria-label={tx("sell.which", "Which fragrance?")}
                      placeholder={tx("sell.searchCat", "Search the catalog — name or house…")}/>
                  </div>
                  {fragMatches.length > 0 && (
                    <ul className="combo-list" role="listbox">
                      {fragMatches.map((f) => (
                        <li key={f.id}>
                          <button type="button" role="option" aria-selected="false" className="combo-row" onClick={() => { setFrag(f.id); setFq(""); }}>
                            <span className="combo-thumb"><FragThumb frag={f}/></span>
                            <span><b>{window.highlight(f.name, fq)}</b><small>{f.house}</small></span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {fq.trim() && fragMatches.length === 0 && (
                    <p className="field-hint">{tx("sell.notInCat", "Not in the catalog yet — in the live version you'll be able to add a new fragrance here.")}</p>
                  )}
                  {tried && !chosen && <p className="field-error">{tx("sell.errFrag", "Pick the fragrance you're listing.")}</p>}
                </div>
              )}
            </fieldset>

            {/* 2 — the bottle */}
            <fieldset className="step">
              <legend><span className="step-n">2</span>{tx("sell.bottle", "The bottle")}</legend>
              <div className="field">
                <span className="field-label">{tx("sell.type", "Listing type")}</span>
                <Segmented label={tx("sell.type", "Listing type")} value={mode} onChange={setMode}
                  options={[["sale", tx("sell.forSale", "For sale")], ["both", tx("sell.saleOrTrade", "Sale or trade")], ["trade", tx("sell.tradeOnly", "Trade only")]]}/>
              </div>
              <div className="field">
                <span className="field-label">{tx("sell.condition", "Condition")}</span>
                <Segmented label={tx("sell.condition", "Condition")} value={condition} onChange={setCondition}
                  options={[["new", tx("sell.condNew", "New / sealed")], ["used", tx("sell.condUsed", "Used")]]}/>
                {condition === "used" && (
                  <div className="range">
                    <label htmlFor="fill" className="range-label">
                      <span>{tx("sell.fillLevel", "Fill level")}</span>
                      <b className="mono">{fillPct}%</b>
                    </label>
                    <input id="fill" type="range" min="10" max="99" value={fillPct} onChange={(e) => setFillPct(e.target.value)}
                      style={{ "--fill": ((fillPct - 10) / 89 * 100) + "%" }}/>
                  </div>
                )}
              </div>
              <div className="field">
                <span className="field-label">{tx("sell.size", "Bottle size (ml)")}</span>
                <div className="size-pick">
                  {SIZES.map((s) => (
                    <button key={s} type="button" className={"chip" + (+volume === s ? " is-on" : "")} aria-pressed={+volume === s}
                      onClick={() => setVolume(s)}>{s}</button>
                  ))}
                  <input className="input input-sm" type="number" min="1" value={SIZES.includes(+volume) ? "" : volume}
                    placeholder={tx("sell.otherSize", "Other")} aria-label={tx("sell.size", "Bottle size (ml)")}
                    onChange={(e) => setVolume(e.target.value)}/>
                </div>
              </div>
            </fieldset>

            {/* 3 — price & payment */}
            <fieldset className="step">
              <legend><span className="step-n">3</span>{tx("sell.pricePay", "Price & payment")}</legend>
              {needsPrice && (
                <div className="field">
                  <label className="field-label" htmlFor="price">{tx("sell.priceIQD", "Price (IQD)")}</label>
                  <div className={"input-affix" + (tried && !(priceN > 0) ? " is-invalid" : "")}>
                    <input id="price" inputMode="numeric" value={priceN ? priceN.toLocaleString("en-US") : ""}
                      onChange={(e) => setPrice(e.target.value)} placeholder="175,000"/>
                    <span className="affix">IQD</span>
                  </div>
                  {tried && !(priceN > 0) && <p className="field-error">{tx("sell.errPrice", "Add an asking price.")}</p>}
                </div>
              )}
              <div className="field">
                <span className="field-label">{tx("sell.payAccepted", "Accepted payment")}</span>
                <div className="choice-grid">
                  {Object.entries(BX.pay).map(([c, m]) => {
                    const on = pay.includes(c);
                    return (
                      <button key={c} type="button" role="checkbox" aria-checked={on}
                        className={"choice" + (on ? " is-on" : "")} onClick={() => togglePay(c)}>
                        <span className="choice-ico"><Icon name={m.icon}/></span>
                        <span className="choice-text">{c === "cod" ? tx("pay.cod.full", "Cash on Delivery") : m.label}</span>
                        <span className="choice-check" aria-hidden="true"><Icon name="check"/></span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="field">
                <span className="field-label">{tx("sell.cityLabel", "City")}</span>
                <Segmented label={tx("sell.cityLabel", "City")} value={city} onChange={setCity}
                  options={BX.cities.map((c) => [c, cityLabel(tx, c)])}/>
              </div>
              {mode !== "sale" && (
                <div className="field">
                  <span className="field-label">{tx("sell.tradeFor", "Open to trade for (optional)")}</span>
                  <div className="chip-wrap">
                    {BX.fragrances.filter((f) => f.id !== frag).map((f) => (
                      <button key={f.id} type="button" className={"chip" + (seek.includes(f.id) ? " is-on" : "")}
                        aria-pressed={seek.includes(f.id)} onClick={() => toggleSeek(f.id)}>{f.name}</button>
                    ))}
                  </div>
                </div>
              )}
            </fieldset>

            {/* 4 — notes */}
            <fieldset className="step">
              <legend><span className="step-n">4</span>{tx("sell.notes", "Notes (optional)")}</legend>
              <textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                aria-label={tx("sell.notes", "Notes (optional)")}
                placeholder={tx("sell.notesPh", "Batch code, box included, reason for selling, meet-up area…")}/>
            </fieldset>

            <div className="sell-actions">
              <button type="button" className="btn btn-ghost" onClick={onCancel}>{tx("sell.cancel", "Cancel")}</button>
              <button type="submit" className="btn btn-primary btn-lg">{tx("sell.post", "Post listing")}</button>
            </div>
          </form>

          <aside className="sell-aside" aria-label={tx("sell.preview", "Preview")}>
            <p className="eyebrow">{tx("sell.preview", "Preview")}</p>
            <ListingTile listing={draft} frag={previewFrag} preview/>
            <ul className="checklist">
              {checks.map(([ok, label]) => (
                <li key={label} className={ok ? "is-done" : ""}>
                  <span className="check-mark"><Icon name="check"/></span>{label}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    );
  }
  window.Sell = Sell;
})();
