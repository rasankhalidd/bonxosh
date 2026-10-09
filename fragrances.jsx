/* ============================================================
   BONXOSH — Fragrances catalog (search engine) + Fragrance PAGE
   ============================================================ */
(function () {
  const { Icon, Stars, FragThumb, Price, Select, Empty, fmt } = window;
  const BX = window.BX;
  const cityLabel = (tx, c) => window.cityLabel(tx, c);

  const FILTERS = ["All","Niche","Designer","Value","Unisex","Woody","Gourmand","Fresh","Floral"];
  function matchFilter(f, filter){
    switch(filter){
      case "All": return true;
      case "Niche": return f.price==="$$$$";
      case "Designer": return f.price==="$$$" || f.price==="$$";
      case "Value": return f.value>=70;
      case "Unisex": return f.gender==="Unisex";
      case "Woody": return f.accords.some(a=>["woody","oud","leather","smoky"].includes(a));
      case "Gourmand": return f.accords.some(a=>["gourmand","sweet","vanilla","amber"].includes(a));
      case "Fresh": return f.accords.some(a=>["fresh","citrus","aromatic","ambroxan"].includes(a));
      case "Floral": return f.accords.some(a=>["floral","rose"].includes(a));
      default: return true;
    }
  }
  function matchQuery(f, q){
    const s = q.trim().toLowerCase();
    return !s || f.name.toLowerCase().includes(s) || f.house.toLowerCase().includes(s) || f.accords.some(a=>a.includes(s));
  }

  function marketFor(fragId, listings, city){
    const ls = listings.filter(l => l.frag===fragId && (city==="All" || BX.sellers[l.seller].city===city));
    const prices = ls.filter(l => l.mode!=="trade").map(l=>l.priceIQD);
    return { count: ls.length, low: prices.length ? Math.min(...prices) : null };
  }
  window.marketFor = marketFor;

  /* ---- catalog tile ---- */
  function FragTile({ frag, mkt, onOpen, q }) {
    const { tx } = window.useT();
    return (
      <article className="tile">
        <div className="tile-well">
          <FragThumb frag={frag}/>
          {mkt.count>0 && <span className="tile-flag is-live">{tx("ls.offers", `${mkt.count} offer${mkt.count!==1?"s":""}`, {n:mkt.count})}</span>}
        </div>
        <div className="tile-body">
          <h3 className="tile-name"><button className="stretch" onClick={()=>onOpen(frag.id)}>{window.highlight(frag.name, q)}</button></h3>
          <p className="tile-house">{[frag.house, frag.year].filter(Boolean).join(" · ")}</p>
          <div className="tile-row">
            {mkt.low!=null
              ? <span className="tile-from"><small>{tx("fr.from","from")}</small><Price iqd={mkt.low}/></span>
              : <span className="tile-none">{mkt.count>0 ? tx("lc.tradeOnly","Trade only") : tx("fr.noListings","No listings")}</span>}
            {frag.rating!=null && <span className="tile-rating"><Icon name="starSolid" className="star-ico"/>{frag.rating.toFixed(1)}</span>}
          </div>
        </div>
      </article>
    );
  }
  window.FragTile = FragTile;

  function Fragrances({ fragrances, listings, city, onOpen }) {
    const { tx } = window.useT();
    const [filter, setFilter] = React.useState("All");
    const [sort, setSort] = React.useState("listings");
    const [q, setQ] = React.useState("");

    const byQuery = fragrances.filter(f => matchQuery(f, q));
    let list = byQuery.filter(f => matchFilter(f, filter));
    const mkt = {}; list.forEach(f => mkt[f.id] = marketFor(f.id, listings, city));
    list = [...list].sort((a,b)=>{
      if (sort==="listings") return mkt[b.id].count - mkt[a.id].count;
      if (sort==="priceLow") return (mkt[a.id].low ?? 1e12) - (mkt[b.id].low ?? 1e12);
      if (sort==="rating") return (b.rating ?? -1) - (a.rating ?? -1);
      if (sort==="popular") return b.votes - a.votes;
      return 0;
    });
    const cityName = city==="All" ? tx("city.All","all cities") : cityLabel(tx, city);

    return (
      <div className="page catalog">
        <header className="page-head">
          <p className="eyebrow">{tx("fcat.eyebrow","The catalog")}</p>
          <h1>{tx("fcat.title","Fragrances")}</h1>
          <p className="page-sub">{tx("fcat.sub", `Search the catalog, then buy or trade — showing offers in ${cityName}.`, {city:cityName})}</p>
        </header>

        <div className="catalog-layout">
          <aside className="facets" aria-label={tx("fcat.filters","Filters")}>
            <div className="input-icon">
              <Icon name="search"/>
              <input value={q} onChange={e=>setQ(e.target.value)} aria-label={tx("fcat.searchPh","Search fragrances, houses, notes…")}
                placeholder={tx("fcat.searchPh","Search fragrances, houses, notes…")}/>
              {q && <button className="icon-btn icon-btn-sm" onClick={()=>setQ("")} aria-label="Clear"><Icon name="x"/></button>}
            </div>
            <p className="facet-title">{tx("fcat.family","Browse by")}</p>
            <ul className="facet-list">
              {FILTERS.map(f=>{
                const n = byQuery.filter(x=>matchFilter(x, f)).length;
                return (
                  <li key={f}>
                    <button className={"facet"+(filter===f?" is-on":"")} aria-pressed={filter===f}
                      disabled={n===0 && filter!==f} onClick={()=>setFilter(f)}>
                      <span>{tx("filter."+f, f)}</span><span className="facet-count">{n}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="catalog-results">
            <div className="results-bar">
              <p className="results-count" aria-live="polite">
                {tx("fcat.results", `${list.length} result${list.length!==1?"s":""}`, {n:list.length})}
                {filter!=="All" && (
                  <button className="active-filter" onClick={()=>setFilter("All")} aria-label={tx("fcat.clear","Clear filter")}>
                    {tx("filter."+filter, filter)}<Icon name="x"/>
                  </button>
                )}
              </p>
              <Select label={tx("ls.sortBy","Sort by")} value={sort} onChange={setSort} icon="sliders"
                options={[["listings",tx("sort.mostListings","Most listings")],["priceLow",tx("sort.priceLow","Lowest price")],["rating",tx("sort.topRated","Top rated")],["popular",tx("sort.mostRated","Most rated")]]}/>
            </div>
            {list.length>0 ? (
              <div className="tile-grid tile-grid-3">
                {list.map(f=>(<FragTile key={f.id} frag={f} mkt={mkt[f.id]} onOpen={onOpen} q={q}/>))}
              </div>
            ) : (
              <Empty icon="bottle" text={tx("fcat.noMatch","No fragrances match that.")}>
                <button className="btn btn-outline" onClick={()=>{ setQ(""); setFilter("All"); }}>{tx("fcat.reset","Reset filters")}</button>
              </Empty>
            )}
          </div>
        </div>
      </div>
    );
  }
  window.Fragrances = Fragrances;

  /* ============================================================
     FULL FRAGRANCE PAGE  (canonical — listings + info)
     ============================================================ */
  function FragPage({ frag, fragrances, listings, city, onBack, onOpen,
                      onBuy, onOpenSeller, onSell }) {
    const { tx } = window.useT();
    React.useEffect(()=>{ window.scrollTo(0,0); }, [frag.id]);
    const hasRating = frag.rating!=null && frag.votes>0;
    const meters = [["Longevity", frag.longevity, ["Weak","Moderate","Long","Eternal"]],
                    ["Sillage", frag.sillage, ["Intimate","Moderate","Strong","Nuclear"]],
                    ["Value", frag.value, ["Steep","Fair","Good","Steal"]]].filter(([,v])=>v!=null);
    const pyramid = [["Top",frag.notes.top],["Heart",frag.notes.heart],["Base",frag.notes.base]].filter(([,arr])=>arr && arr.length);
    const related = fragrances.filter(f => f.id!==frag.id &&
      f.accords.some(a=>frag.accords.includes(a))).slice(0,4);
    const mkt = marketFor(frag.id, listings, city);
    const cityName = city==="All" ? tx("city.All","All cities") : cityLabel(tx, city);
    const toOffers = ()=> {
      const el = document.getElementById("offers");
      if (el) el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block:"start" });
    };

    return (
      <div className="page fpage" data-screen-label={"fragrance-"+frag.id}>
        <nav className="crumbs" aria-label="Breadcrumb">
          <button onClick={onBack}>{tx("fcat.title","Fragrances")}</button>
          <Icon name="chevron" className="flip-rtl"/>
          <span>{frag.house}</span>
        </nav>

        <section className="fp-hero">
          <div className="fp-media">
            <div className="fp-well"><FragThumb frag={frag} large/></div>
          </div>

          <div className="fp-info">
            <p className="eyebrow">{frag.house}</p>
            <h1 className="fp-name">{frag.name}</h1>
            <p className="fp-meta">
              {[frag.year, tx("gender."+frag.gender, frag.gender), frag.price].filter(Boolean).join(" · ")}
            </p>
            {hasRating && (
              <p className="fp-rating">
                <Stars value={frag.rating} size={15}/>
                <b>{frag.rating.toFixed(1)}</b>
                <span>{tx("fp.ratings", `${fmt(frag.votes)} ratings`, {n:fmt(frag.votes)})}</span>
              </p>
            )}
            <p className="fp-blurb">{frag.blurb}</p>
            <AccordBar accords={frag.accords}/>
            {frag.perfumer && <p className="fp-perfumer"><span>{tx("fp.perfumer","Perfumer")}</span> {frag.perfumer}</p>}

            <div className="buybox">
              <div className="buybox-price">
                <span className="label">{tx("fp.lowestIn", `Lowest price · ${cityName}`, {city:cityName})}</span>
                {mkt.low!=null
                  ? <Price iqd={mkt.low} size="xl"/>
                  : <span className="buybox-none">{mkt.count>0 ? tx("lc.tradeOnly","Trade only") : tx("fp.noOffers","No offers yet")}</span>}
              </div>
              <div className="buybox-actions">
                {mkt.count>0 && (
                  <button className="btn btn-primary btn-lg" onClick={toOffers}>
                    {tx("fp.seeOffers", `See ${mkt.count} offer${mkt.count!==1?"s":""}`, {n:mkt.count})}<Icon name="arrowRight" className="flip-rtl"/>
                  </button>
                )}
                <button className={"btn btn-lg " + (mkt.count>0 ? "btn-outline" : "btn-primary")} onClick={()=>onSell(frag.id)}>
                  <Icon name="plus"/>{tx("ls.sellYours","Sell yours")}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ---- THE marketplace section ---- */}
        <window.ListingsSection frag={frag} listings={listings} city={city}
          onBuy={onBuy} onOpenSeller={onOpenSeller} onSell={()=>onSell(frag.id)} />

        {(pyramid.length>0 || meters.length>0 || hasRating) && (
          <section className="fp-details">
            {pyramid.length>0 && (
              <div className="detail-block detail-pyramid">
                <h2>{tx("fp.pyramid","Note pyramid")}</h2>
                <ol className="pyramid">
                  {pyramid.map(([lvl,arr])=>(
                    <li key={lvl} className={"tier tier-"+lvl.toLowerCase()}>
                      <span className="tier-label">{tx("pyr."+lvl, lvl)}</span>
                      <span className="tier-notes">{arr.map((n,i)=>(<span key={n}>{n}{i<arr.length-1 && <i aria-hidden="true"> · </i>}</span>))}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {meters.length>0 && (
              <div className="detail-block">
                <h2>{tx("fp.performance","Performance")}</h2>
                <ul className="meters">
                  {meters.map(([label, v, notes])=>(<Meter key={label} label={label} v={v} notes={notes}/>))}
                </ul>
              </div>
            )}

            {hasRating && (
              <div className="detail-block">
                <h2>{tx("fp.community","Community rating")}</h2>
                <div className="score">
                  <span className="score-n">{frag.rating.toFixed(1)}</span>
                  <span className="score-side">
                    <Stars value={frag.rating} size={16}/>
                    <small>{tx("fp.ratingsOn", `${fmt(frag.votes)} ratings on Parfumo`, {n:fmt(frag.votes)})}</small>
                  </span>
                </div>
                {Array.isArray(frag.dist) && frag.dist.length===5 && (
                  <ul className="dist">
                    {frag.dist.map((p,i)=>(
                      <li key={i}>
                        <span className="dist-k">{5-i}<Icon name="starSolid"/></span>
                        <span className="dist-bar"><i style={{width:p+"%"}}/></span>
                        <span className="dist-v">{p}%</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        )}

        {frag.sourceUrl && (
          <p className="source-note">
            {tx("fp.source","Fragrance data from Parfumo.")}{" "}
            <a href={frag.sourceUrl} target="_blank" rel="noopener noreferrer">{tx("fp.viewParfumo","View on Parfumo")}<Icon name="arrowUpRight"/></a>
          </p>
        )}

        {related.length>0 && (
          <section className="sec">
            <window.SectionHead title={tx("fp.alsoLike","You might also like")}/>
            <div className="tile-grid">
              {related.map(f=>(<FragTile key={f.id} frag={f} mkt={marketFor(f.id, listings, city)} onOpen={onOpen}/>))}
            </div>
          </section>
        )}
      </div>
    );
  }
  window.FragPage = FragPage;

  // Accords in Parfumo order, strongest first — drawn as one proportional bar
  const ACCORD_W = [30, 23, 17, 12, 9, 6, 3];
  function AccordBar({ accords }){
    const { tx } = window.useT();
    const list = accords.slice(0, 6);
    if (!list.length) return null;
    return (
      <div className="accords">
        <div className="accord-bar" aria-hidden="true">
          {list.map((a,i)=>(<i key={a} className={"acc-"+i} style={{flexGrow:ACCORD_W[i]}}/>))}
        </div>
        <ul className="accord-keys">
          {list.map((a,i)=>(<li key={a}><span className={"acc-dot acc-"+i}/>{tx("accord."+a, a)}</li>))}
        </ul>
      </div>
    );
  }

  // Four-step meter: reads at a glance, and the word says what the step means
  function Meter({ label, v, notes }){
    const { tx } = window.useT();
    const i = v>=80?3 : v>=60?2 : v>=40?1 : 0;
    return (
      <li className="meter">
        <span className="meter-label">{tx("meter."+label, label)}</span>
        <span className="meter-steps" role="img" aria-label={tx("mn."+notes[i], notes[i])}>
          {[0,1,2,3].map(k=>(<i key={k} className={k<=i?"on":""}/>))}
        </span>
        <span className="meter-word">{tx("mn."+notes[i], notes[i])}</span>
      </li>
    );
  }
})();
