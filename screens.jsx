/* ============================================================
   BONXOSH — Search + Seller profile
   ============================================================ */
(function () {
  const { Icon, Avatar, FragThumb, Price, Verified, Empty, ListingTile, fmt } = window;
  const BX = window.BX;
  const cityLabel = (tx, c) => window.cityLabel(tx, c);
  const hl = (t, q) => window.highlight(t, q);

  /* ---- one fragrance as a ledger row ---- */
  function FragRow({ f, listings, city, q, onOpenFrag }){
    const { tx } = window.useT();
    const m = window.marketFor(f.id, listings, city);
    return (
      <li>
        <button className="result-row" onClick={()=>onOpenFrag(f.id)}>
          <span className="result-thumb"><FragThumb frag={f}/></span>
          <span className="result-main">
            <b>{hl(f.name, q)}</b>
            <small>{hl(f.house, q)}{f.year ? " · " + f.year : ""}</small>
            <span className="result-accords">{f.accords.slice(0,3).map(a=>tx("accord."+a, a)).join(" · ")}</span>
          </span>
          <span className="result-market">
            {m.count>0
              ? <>{m.low!=null && <Price iqd={m.low}/>}<small>{tx("ls.offers", `${m.count} offer${m.count!==1?"s":""}`, {n:m.count})}</small></>
              : <small className="muted">{tx("fr.noListings","No listings")}</small>}
          </span>
          <Icon name="chevron" className="result-chev flip-rtl"/>
        </button>
      </li>
    );
  }

  /* ===================== SEARCH ===================== */
  function Search({ fragrances, sellers, listings, city, trendingSearches, onOpenFrag, onOpenSeller, seed }) {
    const { tx } = window.useT();
    const [q, setQ] = React.useState(seed || "");
    const [scope, setScope] = React.useState("top");
    const [remote, setRemote] = React.useState([]);
    const [rstate, setRstate] = React.useState("idle"); // idle | loading | done | unavail | error
    const [catCount, setCatCount] = React.useState(null);
    const [retry, setRetry] = React.useState(0);
    const inputRef = React.useRef(null);
    const s = q.trim().toLowerCase();
    const has = s.length>0;

    React.useEffect(() => { setQ(seed || ""); }, [seed]);
    React.useEffect(() => { if (window.Catalog) window.Catalog.count().then(setCatCount); }, []);

    // catalog search as you type (debounced); stale responses are dropped
    React.useEffect(() => {
      setRemote([]);
      if (s.length < 2) { setRstate("idle"); return; }
      if (!window.Catalog || !window.Catalog.isAvailable()) { setRstate("unavail"); return; }
      let live = true;
      setRstate("loading");
      const t = setTimeout(() => {
        window.Catalog.search(q.trim()).then((res) => {
          if (!live) return;
          if (res.status === 503) { setRstate("unavail"); return; }
          if (res.status !== 200) { setRstate("error"); return; }
          // hide catalog rows that duplicate a seed fragrance
          const key = (f) => (f.name + "|" + f.house).toLowerCase();
          const local = new Set(fragrances.map(key));
          setRemote(res.results.filter((f) => !local.has(key(f))));
          setRstate("done");
        });
      }, 250);
      return () => { live = false; clearTimeout(t); };
    }, [s, retry]);

    const fragHits = has ? fragrances.filter(f =>
      f.name.toLowerCase().includes(s) || f.house.toLowerCase().includes(s) || f.accords.some(a=>a.includes(s))) : [];
    const sellerHits = has ? Object.values(sellers).filter(u =>
      u.id!=="you" && (u.name.toLowerCase().includes(s) || u.handle.toLowerCase().includes(s) || (u.bio||"").toLowerCase().includes(s))) : [];
    const showFrags = scope==="top" || scope==="fragrances";
    const showSellers = scope==="top" || scope==="sellers";

    return (
      <div className="page page-narrow search">
        <form className="searchbox" role="search" onSubmit={e=>e.preventDefault()}>
          <Icon name="search"/>
          <input ref={inputRef} autoFocus value={q} onChange={e=>setQ(e.target.value)} enterKeyHint="search"
            aria-label={tx("srch.ph","Search fragrances, houses, notes, shops…")}
            placeholder={tx("srch.ph","Search fragrances, houses, notes, shops…")} />
          {q && <button type="button" className="icon-btn" onClick={()=>{ setQ(""); inputRef.current && inputRef.current.focus(); }} aria-label="Clear"><Icon name="x"/></button>}
        </form>

        {!has && (
          <>
            <section className="search-block">
              <h2 className="block-title">{tx("srch.trending","Trending searches")}</h2>
              <div className="chip-wrap">
                {trendingSearches.map(t=>(
                  <button key={t} className="chip" onClick={()=>setQ(t)}><Icon name="spark"/>{t}</button>
                ))}
              </div>
            </section>
            <section className="search-block">
              <h2 className="block-title">{tx("srch.mostListed","Most listed right now")}</h2>
              <ol className="result-list">
                {fragrances.map(f=>({f, n:window.marketFor(f.id, listings, city).count}))
                  .sort((a,b)=>b.n-a.n).slice(0,5)
                  .map(({f})=>(<FragRow key={f.id} f={f} listings={listings} city={city} onOpenFrag={onOpenFrag}/>))}
              </ol>
            </section>
          </>
        )}

        {has && (
          <>
            <div className="tabs" role="tablist" aria-label={tx("srch.scope","Result type")}>
              {[["top",tx("srch.top","Top"), null],["fragrances",tx("srch.frag","Fragrances"), fragHits.length + remote.length],["sellers",tx("srch.sellers","Shops & sellers"), sellerHits.length]].map(([k,l,n])=>(
                <button key={k} role="tab" aria-selected={scope===k} className={scope===k?"is-on":""} onClick={()=>setScope(k)}>
                  {l}{n!=null && <span className="tab-count">{n}</span>}
                </button>
              ))}
            </div>

            {showFrags && fragHits.length>0 && (
              <section className="search-block">
                <h2 className="block-title">{tx("srch.frag","Fragrances")}</h2>
                <ol className="result-list">{fragHits.map(f=>(<FragRow key={f.id} f={f} q={q} listings={listings} city={city} onOpenFrag={onOpenFrag}/>))}</ol>
              </section>
            )}

            {showSellers && sellerHits.length>0 && (
              <section className="search-block">
                <h2 className="block-title">{tx("srch.sellers","Shops & sellers")}</h2>
                <ul className="result-list">
                  {sellerHits.map(u=>(
                    <li key={u.id}>
                      <button className="result-row" onClick={()=>onOpenSeller(u.id)}>
                        <Avatar user={u} size={48}/>
                        <span className="result-main">
                          <b>{hl(u.name, q)}{u.verified && <Verified/>}</b>
                          <small>{window.sellerKind(tx, u)} · {cityLabel(tx, u.city)}</small>
                          <span className="result-accords">{u.bio}</span>
                        </span>
                        <span className="result-market">
                          <span className="tile-rating"><Icon name="starSolid" className="star-ico"/>{u.rating.toFixed(1)}</span>
                          <small>{tx("lc.dealsN", `${fmt(u.sales)} deals`, {n:fmt(u.sales)})}</small>
                        </span>
                        <Icon name="chevron" className="result-chev flip-rtl"/>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {showFrags && s.length>=2 && (
              <section className="search-block">
                {rstate==="done" && remote.length>0 && (
                  <>
                    <h2 className="block-title">
                      {tx("srch.global","From the global catalog")}
                      <span className="source-tag">Parfumo{catCount ? " · " + catCount.toLocaleString("en-US") : ""}</span>
                    </h2>
                    <ol className="result-list">{remote.map(f=>(<FragRow key={f.id} f={f} q={q} listings={listings} city={city} onOpenFrag={onOpenFrag}/>))}</ol>
                  </>
                )}
                {rstate==="done" && remote.length===0 && (fragHits.length>0 || sellerHits.length>0) && (
                  <p className="status-note">{tx("srch.noGlobal","No more results in the global catalog.")}</p>
                )}
                {rstate==="loading" && (
                  <div className="skeleton-list" aria-label={tx("srch.searching","Searching the global catalog…")}>
                    {[0,1,2].map(i=>(<div key={i} className="skeleton-row"><i/><span><i/><i/></span></div>))}
                  </div>
                )}
                {rstate==="unavail" && <p className="status-note">{tx("srch.unavail","The global catalog isn't connected yet.")}</p>}
                {rstate==="error" && (
                  <p className="status-note">
                    {tx("srch.error","Couldn't reach the global catalog. Try again.")}{" "}
                    <button className="text-link" onClick={()=>setRetry(r=>r+1)}>{tx("srch.retry","Try again")}</button>
                  </p>
                )}
              </section>
            )}

            {fragHits.length===0 && sellerHits.length===0 && remote.length===0 && rstate!=="loading" && (
              <Empty icon="search" title={tx("srch.noResults", `No results for "${q}"`, {q})}
                text={tx("srch.noHint","Try a house, a note, or a shop name.")}/>
            )}
          </>
        )}
      </div>
    );
  }
  window.Search = Search;

  /* ===================== SELLER PROFILE ===================== */
  function SellerProfile({ seller, isMe, listings, onOpenFrag, onBuy, onSell, onBack }) {
    const { tx } = window.useT();
    const [tab, setTab] = React.useState("listings");
    const [following, setFollowing] = React.useState(false);
    const mine = listings.filter(l => l.seller===seller.id);
    const forSale = mine.filter(l => l.mode!=="trade");
    const forTrade = mine.filter(l => l.mode==="trade" || l.mode==="both");
    const isShop = seller.type==="shop";
    const frag = (l) => BX.fById[l.frag] || (window.Catalog && window.Catalog.cacheGet(l.frag));
    const shown = (tab==="listings" ? forSale : forTrade).filter(frag);

    return (
      <div className="profile">
        <div className="profile-cover" style={{ "--tone": seller.tone || "#8c857a" }}>
          <span className="cover-mark" aria-hidden="true">{seller.name[0]}</span>
          {!isMe && (
            <div className="cover-inner">
              <button className="crumb-back" onClick={onBack}><Icon name="arrowLeft" className="flip-rtl"/>{tx("prof.back","Back")}</button>
            </div>
          )}
        </div>
        <div className="page profile-page">

          <header className="profile-head">
            <Avatar user={seller} size={104} className="profile-avatar"/>
            <div className="profile-id">
              <p className="eyebrow">{isShop ? tx("prof.kindShop","Perfume shop") : tx("prof.kindReseller","Reseller")}</p>
              <h1>{seller.name}{seller.verified && <Verified/>}</h1>
              <p className="profile-handle">@{seller.handle}</p>
            </div>
            <div className="profile-actions">
              {isMe
                ? <button className="btn btn-primary" onClick={()=>onSell()}><Icon name="plus"/>{tx("prof.newListing","New listing")}</button>
                : <button className={"btn " + (following ? "btn-outline" : "btn-primary")} aria-pressed={following} onClick={()=>setFollowing(f=>!f)}>
                    <Icon name={following ? "check" : "bell"}/>{following ? tx("prof.followingShop","Following") : tx("prof.followShop","Follow shop")}
                  </button>}
            </div>
          </header>

          <div className="profile-about">
            <p className="profile-bio">{seller.bio}</p>
            <ul className="profile-facts">
              <li><Icon name="pin"/>{cityLabel(tx, seller.city)}</li>
              {seller.joined && <li><Icon name="cal"/>{seller.joined}</li>}
            </ul>
          </div>

          <dl className="profile-stats">
            <div><dt>{tx("prof.rating","rating")}</dt><dd><Icon name="starSolid" className="star-ico"/>{seller.rating.toFixed(1)}</dd></div>
            <div><dt>{tx("prof.deals","deals")}</dt><dd>{fmt(seller.sales)}</dd></div>
            <div><dt>{tx("prof.active","active")}</dt><dd>{mine.length}</dd></div>
          </dl>

          <div className="tabs" role="tablist" aria-label={seller.name}>
            {[["listings",tx("prof.forSale","For sale"),forSale.length],["trades",tx("prof.trades","Trades"),forTrade.length],["reviews",tx("prof.reviews","Reviews"),null]].map(([k,l,n])=>(
              <button key={k} role="tab" aria-selected={tab===k} className={tab===k?"is-on":""} onClick={()=>setTab(k)}>
                {l}{n!=null && <span className="tab-count">{n}</span>}
              </button>
            ))}
          </div>

          <div className="profile-body" role="tabpanel">
            {tab!=="reviews" && (shown.length>0
              ? <div className="tile-grid">{shown.map(l=>(
                  <ListingTile key={l.id} listing={l} frag={frag(l)} onOpen={onOpenFrag} showSeller={false}/>
                ))}</div>
              : tab==="listings"
                ? <Empty icon="tag" text={isMe ? tx("prof.noMine","You have no active listings. Post one to start selling.") : tx("prof.noSale","No listings for sale right now.")}>
                    {isMe && <button className="btn btn-primary" onClick={()=>onSell()}>{tx("home.ctaBtn","List a fragrance")}</button>}
                  </Empty>
                : <Empty icon="swap" text={tx("prof.noTrades","No trade listings.")}/>)}
            {tab==="reviews" && (
              <Empty icon="star" text={tx("prof.reviewsSoon", `Buyer reviews for ${seller.name} will appear here.`, {name:seller.name})}/>
            )}
          </div>
        </div>
      </div>
    );
  }
  window.SellerProfile = SellerProfile;
})();
