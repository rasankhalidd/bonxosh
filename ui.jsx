/* ============================================================
   BONXOSH — shared UI primitives
   ============================================================ */
(function () {
  const { Icon } = window;

  // ---- Logo -----------------------------------------------------------
  // simplistic lowercase wordmark
  function Logo({ size=26 }) {
    return (
      <span className="brand-lockup" style={{ display:"flex", alignItems:"center" }}>
        <span className="wordmark" style={{ fontFamily:"var(--sans)", fontWeight:700,
          letterSpacing:"-0.045em", color:"var(--ink)", lineHeight:1, fontSize:size }}>
          bon<span style={{ color:"var(--gold)" }}>x</span>osh
        </span>
      </span>
    );
  }
  window.Logo = Logo;

  // ---- Avatar ---------------------------------------------------------
  function initials(name){
    const p = name.trim().split(/\s+/);
    return ((p[0]?.[0]||"") + (p[1]?.[0]||"")).toUpperCase();
  }
  function Avatar({ user, size=44 }) {
    const cls = size>=48 ? "s48" : size>=44 ? "s44" : "s38";
    const t = user.tone || "#8c857a";
    return (
      <div className={"av "+cls}
        style={{ width:size, height:size, fontSize:size*0.36,
          background:`linear-gradient(150deg, ${t}, ${shade(t,-18)})` }}>
        {initials(user.name)}
      </div>
    );
  }
  window.Avatar = Avatar;

  function shade(hex, amt){
    const n = parseInt(hex.slice(1),16);
    let r=(n>>16)&255, g=(n>>8)&255, b=n&255;
    r=Math.max(0,Math.min(255,r+amt)); g=Math.max(0,Math.min(255,g+amt)); b=Math.max(0,Math.min(255,b+amt));
    return "#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }

  // ---- Fragrance thumbnail (tasteful tinted monogram, not fake bottle) ----
  const accordTone = {
    woody:"#3a2c20", oud:"#2c2118", smoky:"#2a241c", tobacco:"#322a1d", leather:"#2e2620",
    amber:"#5e3f24", sweet:"#6b4a2a", gourmand:"#5a3c22", vanilla:"#6e5230", saffron:"#6b3f24",
    fresh:"#33433f", citrus:"#3a4a32", aromatic:"#34433a", ambroxan:"#3c463f",
    floral:"#5a3a48", rose:"#5e3540", fruity:"#5a3a30", spicy:"#5b3a26", creamy:"#5b4a36",
  };
  function fragTone(f){
    for (const a of f.accords){ if (accordTone[a]) return accordTone[a]; }
    return "#3a2c20";
  }
  function FragThumb({ frag, mono }) {
    const t = fragTone(frag);
    const [imgErr, setImgErr] = React.useState(false);
    const showImg = frag.image && !imgErr;
    return (
      <div style={{ width:"100%", height:"100%", position:"relative",
        background:`linear-gradient(165deg, ${shade(t,28)}, ${t} 62%, ${shade(t,-14)})`,
        display:"grid", placeItems:"center" }}>
        {showImg ? (
          <img src={frag.image} alt={frag.name} loading="lazy" onError={()=>setImgErr(true)}
            style={{ width:"100%", height:"100%", objectFit:"contain", padding:"6%" }}/>
        ) : (
          <>
            <span style={{ fontFamily:"var(--serif)", fontWeight:600, color:"rgba(245,242,236,.92)",
              fontSize: mono? 30:"min(46%,30px)", lineHeight:1, letterSpacing:".5px",
              textShadow:"0 1px 8px rgba(0,0,0,.25)" }}>
              {frag.name[0]}
            </span>
            <span style={{ position:"absolute", left:0, right:0, bottom:0, height:"34%",
              background:"linear-gradient(transparent, rgba(0,0,0,.28))" }}/>
            <span style={{ position:"absolute", top:"16%", left:"50%", transform:"translateX(-50%)",
              width:"34%", height:"5%", borderRadius:2, background:"rgba(245,242,236,.18)" }}/>
          </>
        )}
      </div>
    );
  }
  window.FragThumb = FragThumb;

  // ---- Placeholder (image stand-in) ----------------------------------
  function Placeholder({ cap, glyph="image", dark=false }) {
    return (
      <div className="ph" style={ dark ? {
        backgroundColor:"#2a2622",
        backgroundImage:"repeating-linear-gradient(45deg, rgba(245,242,236,.05) 0 12px, transparent 12px 24px)"
      } : undefined }>
        <Icon name={glyph} className="glyph" />
        <span className="cap" style={ dark? {color:"rgba(245,242,236,.55)"}:undefined }>{cap}</span>
      </div>
    );
  }
  window.Placeholder = Placeholder;

  // ---- Stars (display) -----------------------------------------------
  function Stars({ value, size=14, className="" }) {
    const full = Math.floor(value);
    const half = value - full >= 0.25 && value - full < 0.85;
    const fullN = value - full >= 0.85 ? full+1 : full;
    const items = [];
    for (let i=0;i<5;i++){
      if (i < fullN) items.push(<Icon key={i} name="starSolid" className="st" style={{width:size,height:size}}/>);
      else if (i===fullN && half) items.push(<Icon key={i} name="starHalf" className="st" style={{width:size,height:size}}/>);
      else items.push(<Icon key={i} name="starSolid" className="st empty" style={{width:size,height:size}}/>);
    }
    return <span className={"stars "+className}>{items}</span>;
  }
  window.Stars = Stars;

  // ---- Stars (interactive rating) ------------------------------------
  function RateStars({ value, onRate, size=30 }) {
    const [hover, setHover] = React.useState(0);
    const shown = hover || value || 0;
    return (
      <span className="stars rate-stars" onMouseLeave={()=>setHover(0)}>
        {[1,2,3,4,5].map(i=>(
          <button key={i} onMouseEnter={()=>setHover(i)} onClick={()=>onRate(i)} aria-label={i+" stars"}>
            <Icon name="starSolid" className={"st"+(i<=shown?"":" empty")} style={{width:size,height:size}}/>
          </button>
        ))}
      </span>
    );
  }
  window.RateStars = RateStars;

  // ---- number formatting ---------------------------------------------
  window.fmt = function(n){
    if (typeof n === "string") return n;
    if (n >= 1000) return (n/1000).toFixed(n%1000>=100?1:0).replace(/\.0$/,"") + "K";
    return ""+n;
  };
})();
