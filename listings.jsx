/* ============================================================
   BONXOSH — Marketplace: listing cards, listings section,
   buy/trade modal, and the "post a listing" (Sell) flow
   ============================================================ */
(function () {
  const { Icon, Avatar, FragThumb, Stars, fmt } = window;
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

  function SellerBadge({ seller, size = 13 }) {
    const { tx } = window.useT();
    const isShop = seller.type === "shop";
    return (
      <span className={"seller-badge " + (isShop ? "shop" : "reseller")}>
        <Icon name={isShop ? "store" : "user"} style={{ width: size, height: size }} />
        {isShop ? tx("badge.shop", "Shop") : tx("badge.reseller", "Reseller")}
        {seller.verified && <Icon name="shield" className="bv" style={{ width: size, height: size }} />}
      </span>
    );
  }
  window.SellerBadge = SellerBadge;

  function PayChips({ codes, max }) {
    const { tx } = window.useT();
    const list = max ? codes.slice(0, max) : codes;
    return (
      <span className="pay-chips">
        {list.map((c) => {
          const m = BX.pay[c]; if (!m) return null;
          return (
            <span key={c} className="pay-chip" title={m.label}>
              <Icon name={m.icon} style={{ width: 12, height: 12 }} />{c === "cod" ? tx("pay.cod.short", "COD") : m.short}
            </span>
          );
        })}
      </span>
    );
  }
  window.PayChips = PayChips;

  /* ---- A single listing card ---------------------------------------- */
  function ListingCard({ listing, frag, onBuy, onOpenSeller, showFrag }) {
    const { tx } = window.useT();
    const seller = BX.sellers[listing.seller];
    const isTrade = listing.mode === "trade";
    return (
      <div className="listing-card">
        {showFrag && frag && (
          <div className="lc-frag">
            <div className="lc-thumb"><FragThumb frag={frag} /></div>
            <div className="lc-fragmeta">
              <div className="lc-fragname">{frag.name}</div>
              <div className="lc-fraghouse">{frag.house}</div>
            </div>
          </div>
        )}

        <div className="lc-top">
          <button className="lc-seller" onClick={() => onOpenSeller && onOpenSeller(seller.id)}>
            <Avatar user={seller} size={36} />
            <div className="lc-sellermeta">
              <div className="lc-sellername">
                {seller.name}{seller.verified && <Icon name="verify" className="verify" />}
              </div>
              <div className="lc-sub">
                <SellerBadge seller={seller} />
                <span className="lc-city"><Icon name="pin" style={{ width: 12, height: 12 }} />{cityLabel(tx, seller.city)}</span>
              </div>
            </div>
          </button>
          <div className="lc-rating">
            <Icon name="starSolid" style={{ width: 13, height: 13, color: "var(--gold)" }} />
            {seller.rating.toFixed(1)}
            <span className="lc-sales">{fmt(seller.sales)} {tx("lc.deals", "deals")}</span>
          </div>
        </div>

        <div className="lc-body">
          <div className="lc-specs">
            <span className={"cond-pill " + listing.condition}>{condText(tx, listing)}</span>
            <span className="spec">{listing.volume} ml</span>
            <span className={"mode-pill " + listing.mode}>
              <Icon name={listing.mode === "sale" ? "tag" : "swap"} style={{ width: 12, height: 12 }} />
              {modeLabel(tx, listing.mode)}
            </span>
            {listing.batch && <span className="spec batch">{tx("lc.batch", `Batch ${listing.batch}`, { b: listing.batch })}</span>}
          </div>
          {listing.note && <p className="lc-note">{listing.note}</p>}
          {isTrade ? (
            <div className="lc-trade">
              <span className="lc-tradelbl">{tx("lc.wants", "Wants")}</span>
              {(listing.seek || []).map((id) => BX.fById[id] && (
                <span key={id} className="seek-chip">{BX.fById[id].name}</span>
              ))}
            </div>
          ) : (
            <div className="lc-price">{fmtIQD(listing.priceIQD)}</div>
          )}
          <PayChips codes={listing.pay} />
        </div>

        <div className="lc-actions">
          {listing.mode !== "trade" && (
            <button className="buy-btn" onClick={() => onBuy(listing, "buy")}>
              <Icon name="tag" style={{ width: 16, height: 16 }} /> {tx("lc.buy", "Buy now")}
            </button>
          )}
          {(listing.mode === "trade" || listing.mode === "both") && (
            <button className="trade-btn" onClick={() => onBuy(listing, "trade")}>
              <Icon name="swap" style={{ width: 16, height: 16 }} /> {tx("lc.trade", "Propose trade")}
            </button>
          )}
          <span className="lc-time">{tx("lc.ago", `${listing.time} ago`, { t: listing.time })}</span>
        </div>
      </div>
    );
  }
  window.ListingCard = ListingCard;

  /* ---- The "Available now" section on a fragrance page --------------- */
  function ListingsSection({ frag, listings, city, onBuy, onOpenSeller, onSell }) {
    const { tx } = window.useT();
    const [sort, setSort] = React.useState("price");
    const [cityF, setCityF] = React.useState(city || "All");
    React.useEffect(() => { if (city) setCityF(city); }, [city]);

    let list = listings.filter((l) => l.frag === frag.id);
    if (cityF !== "All") list = list.filter((l) => BX.sellers[l.seller].city === cityF);
    list = [...list].sort((a, b) => {
      if (sort === "price") return (a.priceIQD || 1e12) - (b.priceIQD || 1e12);
      if (sort === "new") return list.indexOf(a) - list.indexOf(b);
      if (sort === "rating") return BX.sellers[b.seller].rating - BX.sellers[a.seller].rating;
      return 0;
    });

    const prices = list.filter((l) => l.mode !== "trade").map((l) => l.priceIQD);
    const low = prices.length ? Math.min(...prices) : null;

    return (
      <div className="fsection listings-sec">
        <div className="listings-head">
          <h3>{tx("ls.available", "Available now")}</h3>
          <button className="mini-sell" onClick={onSell}><Icon name="plus" style={{ width: 14, height: 14 }} /> {tx("ls.sellYours", "Sell yours")}</button>
        </div>
        <div className="listings-summary">
          {list.length > 0
            ? <>{tx("ls.offers", `${list.length} offer${list.length !== 1 ? "s" : ""}`, { n: list.length })}{low != null && <> · {tx("ls.fromWord", "from")} <b>{fmtIQD(low)}</b></>}</>
            : tx("ls.noneCity", `No listings yet in ${cityF === "All" ? tx("ls.anyCity", "any city") : cityLabel(tx, cityF)}.`, { city: cityF === "All" ? tx("ls.anyCity", "any city") : cityLabel(tx, cityF) })}
        </div>

        <div className="listings-toolbar">
          <div className="city-chips">
            {["All", ...BX.cities].map((c) => (
              <button key={c} className={"city-chip" + (cityF === c ? " on" : "")} onClick={() => setCityF(c)}>
                {cityLabel(tx, c)}
              </button>
            ))}
          </div>
          <div className="sortby small">
            {[["price", tx("sort.priceLow", "Lowest price")], ["rating", tx("sort.topSeller", "Top seller")], ["new", tx("sort.newest", "Newest")]].map(([k, l]) => (
              <button key={k} className={sort === k ? "on" : ""} onClick={() => setSort(k)}>{l}</button>
            ))}
          </div>
        </div>

        {list.length > 0 ? (
          <div className="listing-list">
            {list.map((l) => (
              <ListingCard key={l.id} listing={l} frag={frag} onBuy={onBuy} onOpenSeller={onOpenSeller} />
            ))}
          </div>
        ) : (
          <div className="empty-search">
            <Icon name="tag" className="glyph" />
            <div>{cityF !== "All"
              ? tx("ls.firstCity", `Be the first to list ${frag.name} in ${cityLabel(tx, cityF)}.`, { frag: frag.name, city: cityLabel(tx, cityF) })
              : tx("ls.first", `Be the first to list ${frag.name}.`, { frag: frag.name })}</div>
            <button className="pill-btn" style={{ marginTop: 14 }} onClick={onSell}>{tx("ls.listThis", "List this fragrance")}</button>
          </div>
        )}
      </div>
    );
  }
  window.ListingsSection = ListingsSection;

  /* ---- Buy / Trade modal -------------------------------------------- */
  function BuyModal({ listing, intent, onClose, onConfirm }) {
    const { tx } = window.useT();
    const frag = BX.fById[listing.frag];
    const seller = BX.sellers[listing.seller];
    const isTrade = intent === "trade";
    const [payCode, setPayCode] = React.useState(listing.pay[0]);
    const [offer, setOffer] = React.useState("");
    const seekNames = (listing.seek || []).map(id => BX.fById[id]?.name).filter(Boolean).join(", ");

    return (
      <div className="overlay" onClick={onClose}>
        <div className="modal buy-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <h3>{isTrade ? tx("buy.proposeTrade", "Propose a trade") : tx("buy.placeOrder", "Place order")}</h3>
            <button className="modal-close" onClick={onClose}><Icon name="x" size={18} /></button>
          </div>

          <div className="buy-frag">
            <div className="buy-thumb"><FragThumb frag={frag} /></div>
            <div>
              <div className="buy-name">{frag.name}</div>
              <div className="buy-house">{frag.house} · {listing.volume} ml · {condText(tx, listing)}</div>
              <div className="buy-seller">
                <Avatar user={seller} size={22} /> {seller.name}
                {seller.verified && <Icon name="verify" className="verify" />}
                <span className="lc-city"><Icon name="pin" style={{ width: 11, height: 11 }} />{cityLabel(tx, seller.city)}</span>
              </div>
            </div>
          </div>

          {isTrade ? (
            <div className="buy-block">
              <label className="buy-label">{tx("buy.offering", "What are you offering?")}</label>
              <textarea autoFocus value={offer} onChange={(e) => setOffer(e.target.value)}
                placeholder={tx("buy.offerPh", "e.g. " + (seekNames || tx("buy.yourBottle", "your bottle + cash")), { ex: seekNames || tx("buy.yourBottle", "your bottle + cash") })} />
              {seekNames && (
                <div className="buy-hint">{tx("buy.lookingFor", `Seller is looking for: ${seekNames}`, { list: seekNames })}</div>
              )}
            </div>
          ) : (
            <>
              <div className="buy-price-row">
                <span>{tx("buy.price", "Price")}</span><b>{fmtIQD(listing.priceIQD)}</b>
              </div>
              <div className="buy-block">
                <label className="buy-label">{tx("buy.payMethod", "Payment method")}</label>
                <div className="pay-options">
                  {listing.pay.map((c) => {
                    const m = BX.pay[c];
                    return (
                      <button key={c} className={"pay-option" + (payCode === c ? " on" : "")} onClick={() => setPayCode(c)}>
                        <Icon name={m.icon} style={{ width: 17, height: 17 }} />
                        <span>{c === "cod" ? tx("pay.cod.full", "Cash on Delivery") : m.label}</span>
                        {payCode === c && <Icon name="check" className="po-check" />}
                      </button>
                    );
                  })}
                </div>
                <div className="buy-hint">
                  {payCode === "cod"
                    ? tx("buy.codHint", "You'll pay the courier on delivery. Seller confirms and ships to your city.")
                    : tx("buy.protoHint", `Prototype: ${BX.pay[payCode].label} checkout will be wired to the real API in the backend phase.`, { pay: BX.pay[payCode].label })}
                </div>
              </div>
            </>
          )}

          <button className="pill-btn full"
            disabled={isTrade && !offer.trim()}
            onClick={() => onConfirm(listing, intent, isTrade ? { offer } : { payCode })}>
            {isTrade ? tx("buy.sendTrade", "Send trade offer")
              : payCode === "cod" ? tx("buy.confirmCod", "Confirm order (COD)") : tx("buy.continuePay", "Continue to pay")}
          </button>
        </div>
      </div>
    );
  }
  window.BuyModal = BuyModal;

  /* ---- Sell: post a listing ----------------------------------------- */
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
    const valid = frag && (!needsPrice || (price && +price > 0)) && pay.length > 0;

    const togglePay = (c) => setPay((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);
    const toggleSeek = (id) => setSeek((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

    function submit() {
      onCreate({
        id: "l" + Date.now(), frag, seller: BX.ME, mode, condition,
        fillPct: condition === "used" ? +fillPct : undefined,
        volume: +volume, priceIQD: needsPrice ? +price : undefined,
        city, time: "now", pay, note: note.trim(),
        seek: mode !== "sale" ? seek : undefined,
      });
    }

    return (
      <div className="page narrow sell-page">
        <div className="page-head">
          <h1>{tx("sell.title", "List a fragrance")}</h1>
          <div className="sub">{tx("sell.sub", "Sell or trade a bottle to buyers across Sulaymaniyah, Erbil & Baghdad.")}</div>
        </div>

        {/* fragrance picker */}
        <div className="sell-field">
          <label className="buy-label">{tx("sell.which", "Which fragrance?")}</label>
          {chosen ? (
            <div className="picked-frag">
              <div className="lc-thumb"><FragThumb frag={chosen} /></div>
              <div className="lc-fragmeta">
                <div className="lc-fragname">{chosen.name}</div>
                <div className="lc-fraghouse">{chosen.house} · {chosen.year}</div>
              </div>
              <button className="ghost-btn" onClick={() => { setFrag(""); setFq(""); }}>{tx("sell.change", "Change")}</button>
            </div>
          ) : (
            <>
              <div className="search-field">
                <Icon name="search" />
                <input autoFocus value={fq} onChange={(e) => setFq(e.target.value)} placeholder={tx("sell.searchCat", "Search the catalog — name or house…")} />
              </div>
              {fragMatches.length > 0 && (
                <div className="frag-picklist">
                  {fragMatches.map((f) => (
                    <button key={f.id} className="frag-pickrow" onClick={() => { setFrag(f.id); setFq(""); }}>
                      <div className="lc-thumb sm"><FragThumb frag={f} /></div>
                      <div><div className="lc-fragname">{f.name}</div><div className="lc-fraghouse">{f.house}</div></div>
                    </button>
                  ))}
                </div>
              )}
              {fq.trim() && fragMatches.length === 0 && (
                <div className="buy-hint">{tx("sell.notInCat", "Not in the catalog yet — in the live version you'll be able to add a new fragrance here.")}</div>
              )}
            </>
          )}
        </div>

        {/* mode */}
        <div className="sell-field">
          <label className="buy-label">{tx("sell.type", "Listing type")}</label>
          <div className="seg-pick">
            {[["sale", tx("sell.forSale", "For sale")], ["both", tx("sell.saleOrTrade", "Sale or trade")], ["trade", tx("sell.tradeOnly", "Trade only")]].map(([k, l]) => (
              <button key={k} className={mode === k ? "on" : ""} onClick={() => setMode(k)}>{l}</button>
            ))}
          </div>
        </div>

        {/* condition */}
        <div className="sell-field">
          <label className="buy-label">{tx("sell.condition", "Condition")}</label>
          <div className="seg-pick">
            {[["new", tx("sell.condNew", "New / sealed")], ["used", tx("sell.condUsed", "Used")]].map(([k, l]) => (
              <button key={k} className={condition === k ? "on" : ""} onClick={() => setCondition(k)}>{l}</button>
            ))}
          </div>
          {condition === "used" && (
            <div className="fill-row">
              <span>{tx("sell.approxFull", `Approx. ${fillPct}% full`, { n: fillPct })}</span>
              <input type="range" min="10" max="99" value={fillPct} onChange={(e) => setFillPct(e.target.value)} />
            </div>
          )}
        </div>

        {/* volume + price */}
        <div className="sell-grid">
          <div className="sell-field">
            <label className="buy-label">{tx("sell.size", "Bottle size (ml)")}</label>
            <input className="text-in" type="number" value={volume} onChange={(e) => setVolume(e.target.value)} />
          </div>
          {needsPrice && (
            <div className="sell-field">
              <label className="buy-label">{tx("sell.priceIQD", "Price (IQD)")}</label>
              <input className="text-in" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="175000" />
            </div>
          )}
        </div>

        {/* city */}
        <div className="sell-field">
          <label className="buy-label">{tx("sell.cityLabel", "City")}</label>
          <div className="seg-pick">
            {BX.cities.map((c) => (
              <button key={c} className={city === c ? "on" : ""} onClick={() => setCity(c)}>{cityLabel(tx, c)}</button>
            ))}
          </div>
        </div>

        {/* trade wants */}
        {mode !== "sale" && (
          <div className="sell-field">
            <label className="buy-label">{tx("sell.tradeFor", "Open to trade for (optional)")}</label>
            <div className="seek-pick">
              {BX.fragrances.filter((f) => f.id !== frag).map((f) => (
                <button key={f.id} className={"seek-chip pick" + (seek.includes(f.id) ? " on" : "")} onClick={() => toggleSeek(f.id)}>
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* payment */}
        <div className="sell-field">
          <label className="buy-label">{tx("sell.payAccepted", "Accepted payment")}</label>
          <div className="pay-pick">
            {Object.entries(BX.pay).map(([c, m]) => (
              <button key={c} className={"pay-option" + (pay.includes(c) ? " on" : "")} onClick={() => togglePay(c)}>
                <Icon name={m.icon} style={{ width: 16, height: 16 }} />
                <span>{c === "cod" ? tx("pay.cod.full", "Cash on Delivery") : m.label}</span>
                {pay.includes(c) && <Icon name="check" className="po-check" />}
              </button>
            ))}
          </div>
        </div>

        {/* note */}
        <div className="sell-field">
          <label className="buy-label">{tx("sell.notes", "Notes (optional)")}</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)}
            placeholder={tx("sell.notesPh", "Batch code, box included, reason for selling, meet-up area…")} />
        </div>

        <div className="sell-actions">
          <button className="ghost-btn" onClick={onCancel}>{tx("sell.cancel", "Cancel")}</button>
          <button className="pill-btn" disabled={!valid} onClick={submit}>{tx("sell.post", "Post listing")}</button>
        </div>
      </div>
    );
  }
  window.Sell = Sell;
})();
