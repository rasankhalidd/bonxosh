/* ============================================================
   BONXOSH — Fragrances catalog (search engine) + Fragrance PAGE
   ============================================================ */
(function () {
  const { Icon, Stars, FragThumb, fmt } = window;
  const BX = window.BX;
  const fmtIQD = (n) => window.fmtIQD(n);
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

  function marketFor(fragId, listings, city){
    const ls = listings.filter(l => l.frag===fragId && (city==="All" || BX.sellers[l.seller].city===city));
    const prices = ls.filter(l => l.mode!=="trade").map(l=>l.priceIQD);
    return { count: ls.length, low: prices.length ? Math.min(...prices) : null };
  }

  function FragRow({ frag, rank, mkt, onOpen }) {
    const { tx } = window.useT();
    return (
      <button className="frag-row" onClick={()=>onOpen(frag.id)}>
        <span className="rank">{rank}</span>
        <div className="fr-thumb"><FragThumb frag={frag}/></div>
        <div className="fr-main">
          <div className="fr-name">{frag.name}</div>
          <div className="fr-house">{[frag.house, frag.year, tx("gender."+frag.gender, frag.gender)].filter(Boolean).join(" · ")}</div>
          <div className="fr-accords">
            {frag.accords.slice(0,4).map(a=>(<span key={a} className="accord">{tx("accord."+a, a)}</span>))}
          </div>
        </div>
        <div className="fr-market">
          {mkt.count>0 ? (
            <>
              {mkt.low!=null && <div className="fr-from">{tx("fr.from","from")} <b>{fmtIQD(mkt.low)}</b></div>}
              <div className="fr-listings"><Icon name="tag" style={{width:12,height:12}}/> {mkt.count} {tx("fr.listing","listings")}</div>
            </>
          ) : (
            <div className="fr-nolistings">{tx("fr.noListings","No listings")}</div>
          )}
          {frag.rating!=null && <div className="fr-score-mini"><Icon name="starSolid" style={{width:12,height:12,color:"var(--gold)"}}/>{frag.rating.toFixed(1)}</div>}
        </div>
      </button>
    );
  }

  function Fragrances({ fragrances, listings, city, onOpen }) {
    const { tx } = window.useT();
    const [filter, setFilter] = React.useState("All");
    const [sort, setSort] = React.useState("listings");
    const [q, setQ] = React.useState("");

    let list = fragrances.filter(f => matchFilter(f, filter));
    if (q.trim()){
      const s = q.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(s) || f.house.toLowerCase().includes(s)
        || f.accords.some(a=>a.includes(s)));
    }
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
      <div className="page">
        <div className="page-head">
          <h1>{tx("fcat.title","Fragrances")}</h1>
          <div className="sub">{tx("fcat.sub", `Search the catalog, then buy or trade — showing offers in ${cityName}.`, {city:cityName})}</div>
        </div>
        <div className="frag-toolbar">
          <div className="search-field">
            <Icon name="search"/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder={tx("fcat.searchPh","Search fragrances, houses, notes…")} />
            {q && <button className="search-clear" onClick={()=>setQ("")}><Icon name="x" size={15}/></button>}
          </div>
          <div className="chips">
            {FILTERS.map(f=>(
              <button key={f} className={"chip"+(filter===f?" on":"")} onClick={()=>setFilter(f)}>{tx("filter."+f, f)}</button>
            ))}
          </div>
        </div>
        <div className="sortrow">
          <span className="count">{tx("fcat.results", `${list.length} result${list.length!==1?"s":""}`, {n:list.length})}</span>
          <div className="sortby">
            {[["listings",tx("sort.mostListings","Most listings")],["priceLow",tx("sort.priceLow","Lowest price")],["rating",tx("sort.topRated","Top rated")],["popular",tx("sort.mostRated","Most rated")]].map(([k,l])=>(
              <button key={k} className={sort===k?"on":""} onClick={()=>setSort(k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="frag-list">
          {list.map((f,i)=>(
            <FragRow key={f.id} frag={f} rank={i+1} mkt={mkt[f.id]} onOpen={onOpen} />
          ))}
          {list.length===0 && (
            <div className="empty-search">
              <Icon name="bottle" className="glyph"/>
              <div>{tx("fcat.noMatch","No fragrances match that.")}</div>
            </div>
          )}
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
      f.accords.some(a=>frag.accords.includes(a))).slice(0,3);

    return (
      <div className="fpage" data-screen-label={"fragrance-"+frag.id}>
        <button className="back-link" onClick={onBack}><Icon name="arrowLeft"/> {tx("fp.allFrag","All fragrances")}</button>

        <div className="fhero">
          <div className="fhero-thumb"><FragThumb frag={frag} mono/></div>
          <div className="fhero-info">
            <div className="eyebrow">{frag.house}</div>
            <h1>{frag.name}</h1>
            <div className="house">{[frag.year, tx("gender."+frag.gender, frag.gender), frag.price].filter(Boolean).join(" · ")}</div>
            <p className="blurb">{frag.blurb}</p>
            <div className="meta-row">{frag.accords.map(a=>(<span key={a} className="accord">{tx("accord."+a, a)}</span>))}</div>
            <div className="fhero-meta">
              {hasRating && <span><Icon name="starSolid" style={{width:14,height:14,color:"var(--gold)"}}/> {frag.rating.toFixed(1)} ({tx("fp.ratings", `${fmt(frag.votes)} ratings`, {n:fmt(frag.votes)})})</span>}
              {frag.perfumer && <span>{tx("fp.perfumer","Perfumer")}: {frag.perfumer}</span>}
            </div>
          </div>
        </div>

        {/* ---- THE marketplace section ---- */}
        <window.ListingsSection frag={frag} listings={listings} city={city}
          onBuy={onBuy} onOpenSeller={onOpenSeller} onSell={()=>onSell(frag.id)} />

        {hasRating && (
          <div className="fsection">
            <h3>{tx("fp.community","Community rating")}</h3>
            <div className="score-block">
              <div className="score-big">
                <div className="n">{frag.rating.toFixed(1)}</div>
                <Stars value={frag.rating} size={18}/>
                <div className="v">{tx("fp.ratingsOn", `${fmt(frag.votes)} ratings on Parfumo`, {n:fmt(frag.votes)})}</div>
              </div>
            </div>
          </div>
        )}

        {meters.length>0 && (
          <div className="fsection">
            <h3>{tx("fp.performance","Performance")}</h3>
            <div className="meters">
              {meters.map(([label, v, notes])=>(<Meter key={label} label={label} v={v} note={meterNote(v, notes)}/>))}
            </div>
          </div>
        )}

        {pyramid.length>0 && (
          <div className="fsection">
            <h3>{tx("fp.pyramid","Note pyramid")}</h3>
            <div className="pyramid">
              {pyramid.map(([lvl,arr])=>(
                <div key={lvl} className="pyr-row">
                  <span className="lvl">{tx("pyr."+lvl, lvl)}</span>
                  <div className="pyr-notes">{arr.map(n=>(<span key={n} className="note-tag">{n}</span>))}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {frag.sourceUrl && (
          <p className="source-note">
            {tx("fp.source","Fragrance data from Parfumo.")}{" "}
            <a href={frag.sourceUrl} target="_blank" rel="noopener noreferrer">{tx("fp.viewParfumo","View on Parfumo")}</a>
          </p>
        )}

        {related.length>0 && (
          <div className="fsection">
            <h3>{tx("fp.alsoLike","You might also like")}</h3>
            <div className="related-grid">
              {related.map(f=>(
                <button key={f.id} className="related-card" onClick={()=>onOpen(f.id)}>
                  <div className="rc-img"><FragThumb frag={f}/></div>
                  <div className="rc-body">
                    <div className="rc-name">{f.name}</div>
                    <div className="rc-house">{f.house}</div>
                    {f.rating!=null && <div className="rc-rate"><Icon name="starSolid"/>{f.rating.toFixed(1)}</div>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  window.FragPage = FragPage;

  function Meter({ label, v, note }){
    const { tx } = window.useT();
    return (
      <div className="meter">
        <div className="ml"><span>{tx("meter."+label, label)}</span><span className="mv">{tx("mn."+note, note)}</span></div>
        <div className="track"><i style={{width:v+"%"}}/></div>
      </div>
    );
  }
  function meterNote(v, labels){
    const i = v>=80?3 : v>=60?2 : v>=40?1 : 0;
    return labels[i];
  }
})();
