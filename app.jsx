/* ============================================================
   BONXOSH — App: nav, hash routing, marketplace state
   ============================================================ */
(function () {
  const { Icon, Logo, Avatar, Home, Fragrances, FragPage, Search, SellerProfile, Sell, BuyModal } = window;
  const BX = window.BX;

  const NAV = [
    { key:"home",       txk:"nav.browse",     label:"Browse",     icon:"home",   solid:"homeSolid" },
    { key:"fragrances", txk:"nav.fragrances", label:"Fragrances", icon:"bottle", solid:"bottleSolid" },
    { key:"sell",       txk:"nav.sell",       label:"Sell",       icon:"tag",    solid:"tagSolid" },
    { key:"account",    txk:"nav.account",    label:"Account",    icon:"user",   solid:"userSolid" },
  ];

  function parseHash(){
    const h = (location.hash||"").replace(/^#\/?/, "");
    const parts = h.split("/").filter(Boolean);
    if (parts[0]==="f" && parts[1]) return { name:"fragrance", id:parts[1] };
    if (parts[0]==="s" && parts[1] && BX.sellers[parts[1]]) return { name:"seller", id:parts[1] };
    if (["home","fragrances","search","sell","account"].includes(parts[0])) return { name:parts[0] };
    return { name:"home" };
  }

  // Resolves a fragrance by id: local seed first, then the Fragella
  // runtime cache, then a one-shot fetch through our proxy.
  function FragRoute({ id, ...props }) {
    const { tx } = window.useT();
    const resolve = () => BX.fById[id] || (window.Fragella && window.Fragella.cacheGet(id)) || null;
    const [frag, setFrag] = React.useState(resolve);
    const [loading, setLoading] = React.useState(!frag);

    React.useEffect(() => {
      let live = true;
      const found = resolve();
      if (found) { setFrag(found); setLoading(false); return; }
      if (!window.Fragella) { setFrag(null); setLoading(false); return; }
      setLoading(true);
      window.Fragella.getFragrance(id).then((f) => { if (live) { setFrag(f); setLoading(false); } });
      return () => { live = false; };
    }, [id]);

    if (loading) return (
      <div className="page"><div className="frag-loading"><Icon name="bottle" className="glyph"/>{tx("frag.loading", "Loading…")}</div></div>
    );
    if (!frag) return (
      <div className="page"><div className="empty-search"><Icon name="bottle" className="glyph"/><div>{tx("frag.notFound", "Fragrance not found.")}</div></div></div>
    );
    return <FragPage frag={frag} {...props} />;
  }

  function App() {
    const [route, setRoute] = React.useState(parseHash);
    const [listings, setListings] = React.useState(() => BX.listings.map(l=>({...l})));
    const [ratings, setRatings] = React.useState({});
    const [city, setCity] = React.useState("All");
    const [buy, setBuy] = React.useState(null);       // { listing, intent }
    const [sellPreset, setSellPreset] = React.useState("");
    const [toasts, setToasts] = React.useState([]);
    const [lang, setLang] = React.useState("en");
    const me = BX.sellers[BX.ME];

    const i18n = React.useMemo(()=>({ ...window.makeI18n(lang), setLang }), [lang]);
    const { tx, dir } = i18n;

    React.useEffect(()=>{
      document.documentElement.dir = dir;
      document.documentElement.lang = lang==="ku" ? "ckb" : "en";
    }, [dir, lang]);

    React.useEffect(()=>{
      const onHash = ()=> setRoute(parseHash());
      window.addEventListener("hashchange", onHash);
      return ()=> window.removeEventListener("hashchange", onHash);
    }, []);

    function go(name, id){
      const hash = name==="fragrance" ? "#/f/"+id : name==="seller" ? "#/s/"+id : "#/"+name;
      if (location.hash === hash) { setRoute(parseHash()); window.scrollTo(0,0); }
      else location.hash = hash;
      window.scrollTo(0,0);
    }
    const openFrag = (id)=> go("fragrance", id);
    const openSeller = (id)=> id===BX.ME ? go("account") : go("seller", id);

    function toast(msg){
      const id = Math.random().toString(36).slice(2);
      setToasts(t=>[...t,{id,msg}]);
      setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)), 2800);
    }

    function onSell(presetFragId){ setSellPreset(presetFragId||""); go("sell"); }
    function onBuy(listing, intent){ setBuy({ listing, intent }); }

    function confirmBuy(listing, intent, extra){
      const seller = BX.sellers[listing.seller];
      const frag = BX.fById[listing.frag];
      setBuy(null);
      if (intent==="trade"){
        toast(tx("toast.tradeSent", `Trade offer sent to ${seller.name} for ${frag.name}.`, {seller:seller.name, frag:frag.name}));
      } else if (extra.payCode==="cod"){
        toast(tx("toast.orderCod", `Order placed (COD) — ${seller.name} will confirm & ship to you.`, {seller:seller.name}));
      } else {
        toast(tx("toast.reserved", `Reserved with ${BX.pay[extra.payCode].label} — seller notified.`, {pay:BX.pay[extra.payCode].label}));
      }
    }

    function onCreateListing(listing){
      setListings(ls=>[listing, ...ls]);
      toast(tx("toast.listed","Your listing is live."));
      go("fragrance", listing.frag);
    }

    function onRate(fragId, n){
      setRatings(r=>({...r,[fragId]:n}));
      toast(tx("toast.rated", `Rated ${BX.fById[fragId].name} ${n}★`, {frag:BX.fById[fragId].name, n}));
    }

    const tab = route.name==="fragrance" ? "fragrances"
              : route.name==="seller" ? "" : route.name;

    return (
      <window.I18nContext.Provider value={i18n}>
      <div className="app">
        {/* ---------- Top nav ---------- */}
        <header className="topnav">
          <div className="topnav-inner">
            <button className="brand-btn" onClick={()=>go("home")} aria-label="Bonxosh home"><Logo size={25}/></button>
            <nav className="nav-links">
              {NAV.map(n=>(
                <button key={n.key} className={"nav-link"+(tab===n.key?" active":"")} onClick={()=>go(n.key)}>
                  <Icon name={tab===n.key?n.solid:n.icon}/><span>{tx(n.txk, n.label)}</span>
                </button>
              ))}
            </nav>
            <div className="nav-search" onClick={()=>go("search")}>
              <Icon name="search"/>
              <input readOnly placeholder={tx("shell.searchbar","Search Bonxosh")}/>
            </div>
            <div className="nav-right">
              <label className="city-select" title={tx("sell.cityLabel","City")}>
                <Icon name="pin"/>
                <select value={city} onChange={e=>setCity(e.target.value)}>
                  <option value="All">{tx("city.All","All cities")}</option>
                  {BX.cities.map(c=>(<option key={c} value={c}>{tx("city."+c, c)}</option>))}
                </select>
                <Icon name="chevDown" className="cs-caret"/>
              </label>
              <div className="lang-switch" role="group" aria-label="Language">
                <button className={lang==="en"?"on":""} onClick={()=>setLang("en")}>EN</button>
                <button className={lang==="ku"?"on":""} onClick={()=>setLang("ku")} lang="ckb">کوردی</button>
              </div>
              <button className="compose-btn" onClick={()=>onSell()}>
                <Icon name="plus"/><span>{tx("shell.sell","Sell")}</span>
              </button>
              <button className="nav-avatar" onClick={()=>go("account")} aria-label="Your account">
                <Avatar user={me} size={38}/>
              </button>
            </div>
          </div>
        </header>

        {/* ---------- Routed content ---------- */}
        {route.name==="home" && (
          <div className="page-wrap">
            <Home listings={listings} city={city} onOpenFrag={openFrag} onBuy={onBuy}
              onOpenSeller={openSeller} onSell={()=>onSell()}
              goSearch={()=>go("search")} goFragrances={()=>go("fragrances")}/>
          </div>
        )}

        {route.name==="fragrances" && (
          <Fragrances fragrances={BX.fragrances} listings={listings} city={city} onOpen={openFrag}/>
        )}

        {route.name==="fragrance" && (
          <FragRoute id={route.id} fragrances={BX.fragrances} listings={listings} city={city}
            ratings={ratings} onRate={onRate} onBack={()=>go("fragrances")} onOpen={openFrag}
            onBuy={onBuy} onOpenSeller={openSeller} onSell={onSell}/>
        )}

        {route.name==="search" && (
          <Search fragrances={BX.fragrances} sellers={BX.sellers} listings={listings} city={city}
            trendingSearches={BX.trendingSearches} onOpenFrag={openFrag} onOpenSeller={openSeller}/>
        )}

        {route.name==="sell" && (
          <Sell onCreate={onCreateListing} onCancel={()=>go("home")} presetFrag={sellPreset}/>
        )}

        {route.name==="account" && (
          <SellerProfile seller={me} isMe listings={listings}
            onOpenFrag={openFrag} onBuy={onBuy} onSell={onSell}/>
        )}

        {route.name==="seller" && (
          <SellerProfile seller={BX.sellers[route.id]} isMe={false} listings={listings}
            onOpenFrag={openFrag} onBuy={onBuy} onSell={onSell} onBack={()=>go("home")}/>
        )}

        {/* ---------- Buy / trade modal ---------- */}
        {buy && <BuyModal listing={buy.listing} intent={buy.intent}
          onClose={()=>setBuy(null)} onConfirm={confirmBuy}/>}

        {/* ---------- Toasts ---------- */}
        <div className="toast-wrap">
          {toasts.map(t=>(<div key={t.id} className="toast"><Icon name="check"/>{t.msg}</div>))}
        </div>

        {/* ---------- Footer ---------- */}
        <footer className="mkt-foot">
          <Logo size={20}/>
          <span>{tx("foot.mkt","bonxosh © 2026 · Iraq's fragrance marketplace · Sulaymaniyah · Erbil · Baghdad")}</span>
        </footer>
      </div>
      </window.I18nContext.Provider>
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
})();
