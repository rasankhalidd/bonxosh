/* ============================================================
   BONXOSH — Search + Seller profile
   ============================================================ */
(function () {
  const { Icon, Avatar, Stars, FragThumb, fmt } = window;
  const BX = window.BX;
  const fmtIQD = (n) => window.fmtIQD(n);
  const cityLabel = (tx, c) => window.cityLabel(tx, c);

  function fragMarket(fragId, listings, city){
    const ls = listings.filter(l => l.frag===fragId && (city==="All" || BX.sellers[l.seller].city===city));
    const prices = ls.filter(l => l.mode!=="trade").map(l=>l.priceIQD);
    return { count: ls.length, low: prices.length ? Math.min(...prices) : null };
  }

  /* ===================== SEARCH ===================== */
  function Search({ fragrances, sellers, listings, city, trendingSearches, onOpenFrag, onOpenSeller, seed }) {
    const { tx } = window.useT();
    const [q, setQ] = React.useState(seed || "");
    const [scope, setScope] = React.useState("top");
    const [remote, setRemote] = React.useState([]);
    const [rstate, setRstate] = React.useState("idle"); // idle | loading | done | unavail | error
    const [avail, setAvail] = React.useState(false);
    const s = q.trim().toLowerCase();
    const has = s.length>0;

    React.useEffect(() => { if (window.Fragella) window.Fragella.status().then(setAvail); }, []);
    React.useEffect(() => { setRemote([]); setRstate("idle"); }, [q]);

    function runRemote() {
      if (!window.Fragella || s.length < 3) return;
      setRstate("loading");
      window.Fragella.search(q.trim()).then((res) => {
        if (res.status === 200) {
          const localIds = new Set(fragrances.map((f) => f.id));
          setRemote(res.results.filter((f) => !localIds.has(f.id)));
          setRstate("done");
        } else if (res.error === "no_key") setRstate("unavail");
        else setRstate("error");
      });
    }

    const fragHits = has ? fragrances.filter(f =>
      f.name.toLowerCase().includes(s) || f.house.toLowerCase().includes(s) || f.accords.some(a=>a.includes(s))) : [];
    const sellerHits = has ? Object.values(sellers).filter(u =>
      u.id!=="you" && (u.name.toLowerCase().includes(s) || u.handle.toLowerCase().includes(s) || (u.bio||"").toLowerCase().includes(s))) : [];

    function FragHit({ f }){
      const m = fragMarket(f.id, listings, city);
      return (
        <button className="frag-row" onClick={()=>onOpenFrag(f.id)}>
          <div className="fr-thumb"><FragThumb frag={f}/></div>
          <div className="fr-main">
            <div className="fr-name">{f.name}</div>
            <div className="fr-house">{f.house} · {f.year}</div>
            <div className="fr-accords">{f.accords.slice(0,3).map(a=>(<span key={a} className="accord">{tx("accord."+a, a)}</span>))}</div>
          </div>
          <div className="fr-market">
            {m.count>0
              ? <>{m.low!=null && <div className="fr-from">{tx("fr.from","from")} <b>{fmtIQD(m.low)}</b></div>}<div className="fr-listings"><Icon name="tag" style={{width:12,height:12}}/> {m.count}</div></>
              : <div className="fr-nolistings">{tx("fr.noListings","No listings")}</div>}
          </div>
        </button>
      );
    }

    function SellerHit({ u }){
      return (
        <button className="res-person" onClick={()=>onOpenSeller(u.id)}>
          <Avatar user={u} size={48}/>
          <div style={{flex:1, minWidth:0, textAlign:"left"}}>
            <div style={{fontWeight:700, fontSize:15, display:"flex", gap:5, alignItems:"center"}}>
              {u.name}{u.verified && <Icon name="verify" style={{width:14,height:14,color:"var(--gold)"}}/>}
            </div>
            <div style={{display:"flex", gap:8, alignItems:"center", marginTop:2}}>
              <window.SellerBadge seller={u}/>
              <span className="lc-city"><Icon name="pin" style={{width:12,height:12}}/>{cityLabel(tx, u.city)}</span>
            </div>
            <div style={{color:"var(--ink-soft)", fontSize:13.5, marginTop:4}}>{u.bio}</div>
          </div>
          <div className="lc-rating"><Icon name="starSolid" style={{width:13,height:13,color:"var(--gold)"}}/>{u.rating.toFixed(1)}</div>
        </button>
      );
    }

    return (
      <div className="page narrow">
        <div className="big-search">
          <Icon name="search"/>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)}
            placeholder={tx("srch.ph","Search fragrances, houses, notes, shops…")} />
          {q && <button className="search-clear" onClick={()=>setQ("")}><Icon name="x" size={17}/></button>}
        </div>

        {!has && (
          <>
            <div className="sec-title">{tx("srch.trending","Trending searches")}</div>
            <div className="trend-chips">
              {trendingSearches.map(t=>(
                <button key={t} className="trend-chip" onClick={()=>setQ(t)}><Icon name="spark"/> {t}</button>
              ))}
            </div>
            <div className="sec-title">{tx("srch.mostListed","Most listed right now")}</div>
            <div className="frag-list">
              {fragrances.map(f=>({f, m:fragMarket(f.id, listings, city)}))
                .sort((a,b)=>b.m.count-a.m.count).slice(0,5)
                .map(({f})=>(<FragHit key={f.id} f={f}/>))}
            </div>
          </>
        )}

        {has && (
          <>
            <div className="search-tabs">
              {[["top",tx("srch.top","Top")],["fragrances",tx("srch.frag","Fragrances")],["sellers",tx("srch.sellers","Shops & sellers")]].map(([k,l])=>(
                <button key={k} className={scope===k?"on":""} onClick={()=>setScope(k)}>{l}</button>
              ))}
            </div>

            {(scope==="top"||scope==="fragrances") && fragHits.length>0 && (
              <>
                <div className="sec-title">{tx("srch.frag","Fragrances")}</div>
                <div className="frag-list">{fragHits.map(f=>(<FragHit key={f.id} f={f}/>))}</div>
              </>
            )}

            {(scope==="top"||scope==="sellers") && sellerHits.length>0 && (
              <>
                <div className="sec-title">{tx("srch.sellers","Shops & sellers")}</div>
                {sellerHits.map(u=>(<SellerHit key={u.id} u={u}/>))}
              </>
            )}

            {(scope==="top"||scope==="fragrances") && s.length>=3 && (
              <div className="global-cat">
                {rstate==="done" && remote.length>0 && (
                  <>
                    <div className="sec-title">{tx("srch.global","From the global catalog")} <span className="global-tag">Fragella · 74k+</span></div>
                    <div className="frag-list">{remote.map(f=>(<FragHit key={f.id} f={f}/>))}</div>
                  </>
                )}
                {rstate==="done" && remote.length===0 && (
                  <div className="global-note">{tx("srch.noGlobal","No more results in the global catalog.")}</div>
                )}
                {rstate==="loading" && <div className="global-note">{tx("srch.searching","Searching the global catalog…")}</div>}
                {rstate==="unavail" && <div className="global-note">{tx("srch.unavail","Global search isn't available yet — Fragella API key not set.")}</div>}
                {rstate==="error" && <div className="global-note">{tx("srch.error","Couldn't reach the global catalog. Try again.")}</div>}
                {(rstate==="idle" || rstate==="error") && (
                  <button className="global-btn" onClick={runRemote}>
                    <Icon name="search"/> {tx("srch.globalCta", `Search the full 74k catalog for "${q.trim()}"`, {q:q.trim()})}
                  </button>
                )}
              </div>
            )}

            {fragHits.length===0 && sellerHits.length===0 && remote.length===0 && rstate!=="loading" && (
              <div className="empty-search">
                <Icon name="search" className="glyph"/>
                <div>{tx("srch.noResults", `No results for "${q}"`, {q})}</div>
                <div style={{fontSize:13.5, marginTop:5}}>{tx("srch.noHint","Try a house, a note, or a shop name.")}</div>
              </div>
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
    const mine = listings.filter(l => l.seller===seller.id);
    const forSale = mine.filter(l => l.mode!=="trade");
    const forTrade = mine.filter(l => l.mode==="trade" || l.mode==="both");
    const isShop = seller.type==="shop";

    return (
      <div className="page">
        {!isMe && <button className="back-link" onClick={onBack}><Icon name="arrowLeft"/> {tx("prof.back","Back")}</button>}
        <div className="profile-banner sp-banner">
          <window.Placeholder cap={seller.name} glyph={isShop?"store":"image"} dark/>
        </div>
        <div className="profile-head">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
            <div className="sp-avatar"><Avatar user={seller} size={84}/></div>
            <div className="profile-actions">
              {isMe
                ? <button className="pill-btn sm" onClick={()=>onSell()}><Icon name="plus" style={{width:14,height:14}}/> {tx("prof.newListing","New listing")}</button>
                : <button className="ghost-btn"><Icon name="bell" style={{width:16,height:16}}/> {tx("prof.followShop","Follow shop")}</button>}
            </div>
          </div>
          <div className="profile-id">
            <h2>{seller.name}{seller.verified && <Icon name="verify" className="verify"/>}</h2>
            <div className="handle" style={{display:"flex", gap:8, alignItems:"center"}}>
              <window.SellerBadge seller={seller} size={14}/> @{seller.handle}
            </div>
          </div>
          <p className="profile-bio">{seller.bio}</p>
          <div className="profile-tags">
            <span><Icon name="pin"/> {cityLabel(tx, seller.city)}</span>
            {seller.joined && <span><Icon name="cal"/> {seller.joined}</span>}
          </div>
          <div className="profile-stats">
            <span><b>{seller.rating.toFixed(1)}</b> {tx("prof.rating","rating")}</span>
            <span><b>{fmt(seller.sales)}</b> {tx("prof.deals","deals")}</span>
            <span><b>{mine.length}</b> {tx("prof.active","active")}</span>
          </div>
        </div>

        <div className="profile-tabs">
          {[["listings",tx("prof.forSale","For sale")],["trades",tx("prof.trades","Trades")],["reviews",tx("prof.reviews","Reviews")]].map(([k,l])=>(
            <button key={k} className={tab===k?"on":""} onClick={()=>setTab(k)}>{l}</button>
          ))}
        </div>

        <div className="profile-body">
          {tab==="listings" && (
            forSale.length>0
              ? <div className="listing-list">{forSale.map(l=>(
                  <window.ListingCard key={l.id} listing={l} frag={BX.fById[l.frag]} showFrag
                    onBuy={isMe ? ()=>{} : onBuy} onOpenSeller={()=>{}}/>
                ))}</div>
              : <Empty icon="tag" text={isMe ? tx("prof.noMine","You have no active listings. Post one to start selling.") : tx("prof.noSale","No listings for sale right now.")}/>
          )}
          {tab==="trades" && (
            forTrade.length>0
              ? <div className="listing-list">{forTrade.map(l=>(
                  <window.ListingCard key={l.id} listing={l} frag={BX.fById[l.frag]} showFrag
                    onBuy={isMe ? ()=>{} : onBuy} onOpenSeller={()=>{}}/>
                ))}</div>
              : <Empty icon="swap" text={tx("prof.noTrades","No trade listings.")}/>
          )}
          {tab==="reviews" && (
            <Empty icon="star" text={tx("prof.reviewsSoon", `Buyer reviews for ${seller.name} will appear here.`, {name:seller.name})}/>
          )}
        </div>
      </div>
    );
  }
  function Empty({ icon, text }){
    return (<div className="empty-search"><Icon name={icon} className="glyph"/><div>{text}</div></div>);
  }
  window.SellerProfile = SellerProfile;
})();
