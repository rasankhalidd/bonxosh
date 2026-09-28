/* ============================================================
   BONXOSH — Fragrances catalog (search engine) + Fragrance PAGE
   ============================================================ */
(function () {
  const { Icon, Avatar, Stars, RateStars, FragThumb, fmt } = window;
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
          <div className="fr-score-mini"><Icon name="starSolid" style={{width:12,height:12,color:"var(--gold)"}}/>{frag.rating.toFixed(1)}</div>
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
      if (sort==="rating") return b.rating - a.rating;
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
  function FragPage({ frag, fragrances, listings, city, ratings, onRate, onBack, onOpen,
                      onBuy, onOpenSeller, onSell }) {
    const { tx } = window.useT();
    React.useEffect(()=>{ window.scrollTo(0,0); }, [frag.id]);
    const my = ratings[frag.id];
    const eff = my ? ((frag.rating*frag.votes + my) / (frag.votes+1)) : frag.rating;
    const votes = my ? frag.votes+1 : frag.votes;
    const dist = frag.dist;
    const reviewers = [BX.sellers.dara, BX.sellers.oudhouse, BX.sellers.lana];
    const reviewScore = [5,4,5];
    const reviewText = [
      "Batch variation is real but my bottle performs beautifully — 8+ hours and an arm's-length cloud. A genuine signature-scent contender.",
      "We stock this constantly; it's our most-asked-for bottle. Authentic batches only, and the drydown is unmatched.",
      "Cozy without being cloying. My most-complimented cold-weather pick — strangers ask what it is.",
    ];
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
              <span><Icon name="starSolid" style={{width:14,height:14,color:"var(--gold)"}}/> {eff.toFixed(1)} ({tx("fp.ratings", `${fmt(votes)} ratings`, {n:fmt(votes)})})</span>
            </div>
          </div>
        </div>

        {/* ---- THE marketplace section ---- */}
        <window.ListingsSection frag={frag} listings={listings} city={city}
          onBuy={onBuy} onOpenSeller={onOpenSeller} onSell={()=>onSell(frag.id)} />

        <div className="fsection">
          <h3>{tx("fp.community","Community rating")}</h3>
          <div className="score-block">
            <div className="score-big">
              <div className="n">{eff.toFixed(1)}</div>
              <Stars value={eff} size={18}/>
              <div className="v">{tx("fp.ratings", `${fmt(votes)} ratings`, {n:fmt(votes)})}</div>
            </div>
            <div className="dist">
              {[5,4,3,2,1].map((s,i)=>(
                <div key={s} className="dist-row">
                  <span className="k">{s}★</span>
                  <span className="bar"><i style={{width:dist[i]+"%"}}/></span>
                  <span style={{width:34, textAlign:"right"}}>{dist[i]}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fsection">
          <h3>{tx("fp.performance","Performance")}</h3>
          <div className="meters">
            <Meter label="Longevity" v={frag.longevity} note={meterNote(frag.longevity, ["Weak","Moderate","Long","Eternal"])}/>
            <Meter label="Sillage" v={frag.sillage} note={meterNote(frag.sillage, ["Intimate","Moderate","Strong","Nuclear"])}/>
            <Meter label="Value" v={frag.value} note={meterNote(frag.value, ["Steep","Fair","Good","Steal"])}/>
          </div>
        </div>

        <div className="rate-card">
          <h3>{tx("fp.yourRating","Your rating")}</h3>
          <div className="rate-row">
            <RateStars value={my||0} onRate={(n)=>onRate(frag.id, n)} size={34}/>
            {my
              ? <span className="you-rated">{tx("fp.youRated", `You rated this ${my} / 5 — thanks for contributing.`, {n:my})}</span>
              : <span style={{color:"var(--ink-soft)", fontSize:14.5}}>{tx("fp.tapRate", `Tap a star to rate ${frag.name}.`, {frag:frag.name})}</span>}
          </div>
        </div>

        <div className="fsection">
          <h3>{tx("fp.pyramid","Note pyramid")}</h3>
          <div className="pyramid">
            {[["Top",frag.notes.top],["Heart",frag.notes.heart],["Base",frag.notes.base]].map(([lvl,arr])=>(
              <div key={lvl} className="pyr-row">
                <span className="lvl">{tx("pyr."+lvl, lvl)}</span>
                <div className="pyr-notes">{arr.map(n=>(<span key={n} className="note-tag">{n}</span>))}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="fsection">
          <h3>{tx("fp.reviews","Community reviews")}</h3>
          {reviewers.map((u,i)=>(
            <div key={u.id} className="review">
              <Avatar user={u} size={40}/>
              <div className="rv-body">
                <div className="rv-head">
                  <span className="name">{u.name}</span>
                  {u.verified && <Icon name="verify" style={{width:14,height:14,color:"var(--gold)"}}/>}
                  <span className="handle">@{u.handle}</span>
                  <span style={{marginLeft:"auto"}}><Stars value={reviewScore[i]} size={13}/></span>
                </div>
                <p className="rv-text">{reviewText[i]}</p>
              </div>
            </div>
          ))}
        </div>

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
                    <div className="rc-rate"><Icon name="starSolid"/>{f.rating.toFixed(1)}</div>
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
