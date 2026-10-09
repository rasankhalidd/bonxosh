/* ============================================================
   BONXOSH — App: nav, hash routing, marketplace state
   ============================================================ */
(function () {
  const { Icon, Logo, Avatar, Home, Fragrances, FragPage, Search, SellerProfile, Sell, BuyModal, Select, Empty } = window;
  const BX = window.BX;

  const NAV = [
    { key:"home",       txk:"nav.browse",     label:"Browse",     icon:"home",   solid:"homeSolid" },
    { key:"fragrances", txk:"nav.fragrances", label:"Fragrances", icon:"bottle", solid:"bottleSolid" },
    { key:"sell",       txk:"nav.sell",       label:"Sell",       icon:"plus",   solid:"plus" },
    { key:"search",     txk:"nav.search",     label:"Search",     icon:"search", solid:"search" },
    { key:"account",    txk:"nav.account",    label:"Account",    icon:"user",   solid:"userSolid" },
  ];

  // #/f/<id> fragrance · #/s/<id> seller · #/search/<query> · #/<tab>
  function parseHash(){
    const h = (location.hash||"").replace(/^#\/?/, "");
    const parts = h.split("/").filter(Boolean);
    if (parts[0]==="f" && parts[1]) return { name:"fragrance", id:parts[1] };
    if (parts[0]==="s" && parts[1] && BX.sellers[parts[1]]) return { name:"seller", id:parts[1] };
    if (parts[0]==="search") return { name:"search", q: parts[1] ? decodeURIComponent(parts[1]) : "" };
    if (["home","fragrances","sell","account"].includes(parts[0])) return { name:parts[0] };
    return { name:"home" };
  }

  // Resolves a fragrance by id: local seed first, then the catalog
  // runtime cache, then a one-shot fetch from Supabase.
  function FragRoute({ id, ...props }) {
    const { tx } = window.useT();
    const resolve = () => BX.fById[id] || (window.Catalog && window.Catalog.cacheGet(id)) || null;
    const [frag, setFrag] = React.useState(resolve);
    const [loading, setLoading] = React.useState(!frag);

    React.useEffect(() => {
      let live = true;
      const found = resolve();
      if (found) { setFrag(found); setLoading(false); return; }
      if (!window.Catalog) { setFrag(null); setLoading(false); return; }
      setLoading(true);
      window.Catalog.getFragrance(id).then((f) => { if (live) { setFrag(f); setLoading(false); } });
      return () => { live = false; };
    }, [id]);

    if (loading) return (
      <div className="page fpage" aria-busy="true" aria-label={tx("frag.loading", "Loading…")}>
        <div className="fp-hero fp-skeleton">
          <div className="fp-media"><div className="fp-well shimmer"/></div>
          <div className="fp-info"><i className="shimmer w30"/><i className="shimmer w70 tall"/><i className="shimmer w50"/><i className="shimmer w90"/><i className="shimmer w80"/></div>
        </div>
      </div>
    );
    if (!frag) return (
      <div className="page"><Empty icon="bottle" title={tx("frag.notFound", "Fragrance not found.")}>
        <button className="btn btn-outline" onClick={props.onBack}>{tx("fp.allFrag","All fragrances")}</button>
      </Empty></div>
    );
    return <FragPage frag={frag} {...props} />;
  }

  function HeaderSearch({ onSubmit }) {
    const { tx } = window.useT();
    const [q, setQ] = React.useState("");
    return (
      <form className="topbar-search" role="search" onSubmit={(e)=>{ e.preventDefault(); onSubmit(q.trim()); setQ(""); }}>
        <Icon name="search"/>
        <input value={q} onChange={(e)=>setQ(e.target.value)} aria-label={tx("shell.searchbar","Search Bonxosh")}
          placeholder={tx("shell.searchbar","Search Bonxosh")}/>
        <kbd aria-hidden="true">/</kbd>
      </form>
    );
  }

  function App() {
    const [route, setRoute] = React.useState(parseHash);
    const [listings, setListings] = React.useState(() => BX.listings.map(l=>({...l})));
    const [city, setCity] = React.useState("All");
    const [buy, setBuy] = React.useState(null);       // { listing, intent }
    const [sellPreset, setSellPreset] = React.useState("");
    const [toasts, setToasts] = React.useState([]);
    const [lang, setLang] = React.useState("en");
    const [, setPhotos] = React.useState(0);          // bumps once demo fragrances get their photos
    const me = BX.sellers[BX.ME];

    React.useEffect(()=>{
      // typeof check: a browser can briefly mix this file with an older cached catalog.js
      if (window.Catalog && typeof window.Catalog.enrichSeed === "function")
        window.Catalog.enrichSeed().then(n=>{ if (n) setPhotos(n); }).catch(()=>{});
    }, []);

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
      const hash = name==="fragrance" ? "#/f/"+id
                 : name==="seller" ? "#/s/"+id
                 : name==="search" && id ? "#/search/"+encodeURIComponent(id)
                 : "#/"+name;
      if (location.hash === hash) setRoute(parseHash());
      else location.hash = hash;
      window.scrollTo(0,0);
    }
    const openFrag = (id)=> go("fragrance", id);
    const openSeller = (id)=> id===BX.ME ? go("account") : go("seller", id);

    // "/" jumps to search from anywhere that isn't a text field
    React.useEffect(()=>{
      const onKey = (e)=>{
        if (e.key!=="/" || e.metaKey || e.ctrlKey || e.altKey) return;
        const t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
        e.preventDefault();
        const box = document.querySelector(".topbar-search input");
        if (box && box.offsetParent) box.focus(); else go("search");
      };
      document.addEventListener("keydown", onKey);
      return ()=> document.removeEventListener("keydown", onKey);
    }, []);

    function toast(msg){
      const id = Math.random().toString(36).slice(2);
      setToasts(t=>[...t,{id,msg}]);
      setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)), 3200);
    }

    function onSell(presetFragId){ setSellPreset(presetFragId||""); go("sell"); }
    function onBuy(listing, intent){ setBuy({ listing, intent }); }

    function confirmBuy(listing, intent, extra){
      const seller = BX.sellers[listing.seller];
      const frag = BX.fById[listing.frag] || (window.Catalog && window.Catalog.cacheGet(listing.frag)) || { name:"" };
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

    const tab = route.name==="fragrance" ? "fragrances"
              : route.name==="seller" ? "" : route.name;
    const pageKey = route.name + ":" + (route.id || "");

    return (
      <window.I18nContext.Provider value={i18n}>
      <div className="app">
        <a className="skip-link" href="#main">{tx("shell.skip","Skip to content")}</a>

        {/* ---------- Top bar ---------- */}
        <header className="topbar">
          <div className="topbar-inner">
            <button className="brand" onClick={()=>go("home")} aria-label="Bonxosh"><Logo size={25}/></button>
            <nav className="mainnav" aria-label="Primary">
              {NAV.filter(n=>n.key==="home"||n.key==="fragrances").map(n=>(
                <button key={n.key} className={"mainnav-link"+(tab===n.key?" is-active":"")}
                  aria-current={tab===n.key ? "page" : undefined} onClick={()=>go(n.key)}>
                  {tx(n.txk, n.label)}
                </button>
              ))}
            </nav>
            {route.name!=="search" ? <HeaderSearch onSubmit={(q)=>go("search", q)}/> : <span className="topbar-spacer"/>}
            <div className="topbar-tools">
              <Select className="select-quiet city-pick" label={tx("shell.city","Showing offers in")} icon="pin"
                value={city} onChange={setCity}
                options={[["All", tx("city.All","All cities")], ...BX.cities.map(c=>[c, tx("city."+c, c)])]}/>
              <button className="lang-btn" onClick={()=>setLang(lang==="en"?"ku":"en")}
                aria-label={lang==="en" ? "Switch to Kurdish" : "Switch to English"}
                lang={lang==="en" ? "ckb" : "en"}>
                <Icon name="globe"/>{lang==="en" ? "کوردی" : "English"}
              </button>
              <button className="btn btn-primary btn-sm topbar-sell" onClick={()=>onSell()}>
                <Icon name="plus"/><span>{tx("shell.sell","Sell")}</span>
              </button>
              <button className={"topbar-avatar"+(tab==="account"?" is-active":"")} onClick={()=>go("account")} aria-label={tx("nav.account","Account")}>
                <Avatar user={me} size={36}/>
              </button>
            </div>
          </div>
        </header>

        {/* ---------- Routed content ---------- */}
        <main id="main" className="main" key={pageKey} tabIndex={-1}>
          {route.name==="home" && (
            <Home listings={listings} city={city} onOpenFrag={openFrag} onBuy={onBuy}
              onOpenSeller={openSeller} onSell={()=>onSell()}
              goSearch={(q)=>go("search", q)} goFragrances={()=>go("fragrances")}/>
          )}

          {route.name==="fragrances" && (
            <Fragrances fragrances={BX.fragrances} listings={listings} city={city} onOpen={openFrag}/>
          )}

          {route.name==="fragrance" && (
            <FragRoute id={route.id} fragrances={BX.fragrances} listings={listings} city={city}
              onBack={()=>go("fragrances")} onOpen={openFrag}
              onBuy={onBuy} onOpenSeller={openSeller} onSell={onSell}/>
          )}

          {route.name==="search" && (
            <Search fragrances={BX.fragrances} sellers={BX.sellers} listings={listings} city={city} seed={route.q}
              trendingSearches={BX.trendingSearches} onOpenFrag={openFrag} onOpenSeller={openSeller}/>
          )}

          {route.name==="sell" && (
            <Sell key={sellPreset} onCreate={onCreateListing} onCancel={()=>go("home")} presetFrag={sellPreset}/>
          )}

          {route.name==="account" && (
            <SellerProfile seller={me} isMe listings={listings}
              onOpenFrag={openFrag} onBuy={onBuy} onSell={onSell}/>
          )}

          {route.name==="seller" && (
            <SellerProfile seller={BX.sellers[route.id]} isMe={false} listings={listings}
              onOpenFrag={openFrag} onBuy={onBuy} onSell={onSell} onBack={()=>history.length>1 ? history.back() : go("home")}/>
          )}
        </main>

        {/* ---------- Footer ---------- */}
        <footer className="site-foot">
          <div className="foot-inner">
            <div className="foot-brand">
              <Logo size={26}/>
              <p>{tx("foot.blurb","Iraq's marketplace for authentic fragrances — from verified perfume shops and private collectors.")}</p>
            </div>
            <nav className="foot-col" aria-label={tx("foot.market","Marketplace")}>
              <h2>{tx("foot.market","Marketplace")}</h2>
              <button onClick={()=>go("home")}>{tx("nav.browse","Browse")}</button>
              <button onClick={()=>go("fragrances")}>{tx("nav.fragrances","Fragrances")}</button>
              <button onClick={()=>onSell()}>{tx("home.ctaBtn","List a fragrance")}</button>
            </nav>
            <nav className="foot-col" aria-label={tx("foot.cities","Cities")}>
              <h2>{tx("foot.cities","Cities")}</h2>
              {BX.cities.map(c=>(
                <button key={c} onClick={()=>{ setCity(c); go("home"); }}>{tx("city."+c, c)}</button>
              ))}
            </nav>
            <div className="foot-col">
              <h2>{tx("foot.pay","Payment")}</h2>
              {Object.entries(BX.pay).map(([c,m])=>(
                <span key={c}><Icon name={m.icon}/>{c==="cod" ? tx("pay.cod.full","Cash on Delivery") : m.label}</span>
              ))}
            </div>
          </div>
          <p className="foot-base">{tx("foot.mkt","bonxosh © 2026 · Iraq's fragrance marketplace · Sulaymaniyah · Erbil · Baghdad")}</p>
        </footer>

        {/* ---------- Bottom tab bar (phones) ---------- */}
        <nav className="tabbar" aria-label="Main">
          {NAV.map(n=>(
            <button key={n.key} className={"tab"+(tab===n.key?" is-active":"")+(n.key==="sell"?" tab-sell":"")}
              aria-current={tab===n.key ? "page" : undefined}
              onClick={()=> n.key==="sell" ? onSell() : go(n.key)}>
              <span className="tab-ico"><Icon name={tab===n.key ? n.solid : n.icon}/></span>
              <span className="tab-label">{tx(n.txk, n.label)}</span>
            </button>
          ))}
        </nav>

        {/* ---------- Buy / trade dialog ---------- */}
        {buy && <BuyModal listing={buy.listing} intent={buy.intent}
          onClose={()=>setBuy(null)} onConfirm={confirmBuy}/>}

        {/* ---------- Toasts ---------- */}
        <div className="toasts" role="status" aria-live="polite">
          {toasts.map(t=>(<div key={t.id} className="toast"><span className="toast-ico"><Icon name="check"/></span>{t.msg}</div>))}
        </div>
      </div>
      </window.I18nContext.Provider>
    );
  }

  // Last line of defence: an uncaught render/effect error would otherwise
  // unmount everything and leave a blank page. Sits outside the i18n
  // provider, so the message is shown in both languages.
  class ErrorBoundary extends React.Component {
    constructor(props){ super(props); this.state = { failed:false }; }
    static getDerivedStateFromError(){ return { failed:true }; }
    componentDidCatch(err){ console.error("Bonxosh crashed:", err); }
    render(){
      if (!this.state.failed) return this.props.children;
      return (
        <div className="page"><div className="empty">
          <span className="empty-mark"><Icon name="bottle"/></span>
          <p className="empty-title">Something went wrong. · <span lang="ckb" dir="rtl">هەڵەیەک ڕوویدا.</span></p>
          <button className="btn btn-primary" onClick={()=>location.reload()}>
            Reload · <span lang="ckb">دووبارە بارکردنەوە</span>
          </button>
        </div></div>
      );
    }
  }

  ReactDOM.createRoot(document.getElementById("root")).render(<ErrorBoundary><App/></ErrorBoundary>);
})();
