/* ============================================================
   BONXOSH — shared UI primitives
   ============================================================ */
(function () {
  const { Icon } = window;

  // ---- Logo -----------------------------------------------------------
  // lowercase wordmark; the gold x is the brand mark
  function Logo({ size=26 }) {
    return (
      <span className="wordmark" style={{ fontSize:size }}>
        bon<span className="wordmark-x">x</span>osh
      </span>
    );
  }
  window.Logo = Logo;

  // ---- Avatar ---------------------------------------------------------
  function initials(name){
    const p = name.trim().split(/\s+/);
    return ((p[0]?.[0]||"") + (p[1]?.[0]||"")).toUpperCase();
  }
  function Avatar({ user, size=44, className="" }) {
    return (
      <span className={"avatar " + className} aria-hidden="true"
        style={{ width:size, height:size, fontSize:size*0.36, "--tone": user.tone || "#8c857a" }}>
        {initials(user.name)}
      </span>
    );
  }
  window.Avatar = Avatar;

  // ---- Fragrance image: product photo, or a typeset label -------------
  // Parfumo serves resized images via ?width=; small tiles don't need 720px.
  function sized(url, w){
    return /[?&]width=\d+/.test(url) ? url.replace(/([?&]width=)\d+/, "$1" + w) : url;
  }
  function FragThumb({ frag, large, mono }) {
    const [imgErr, setImgErr] = React.useState(false);
    const big = large || mono;
    if (frag.image && !imgErr) {
      return (
        <span className="fthumb">
          <img src={sized(frag.image, big ? 720 : 360)} alt={frag.name} loading="lazy"
            onError={()=>setImgErr(true)}/>
        </span>
      );
    }
    // no photo: an apothecary-style label instead of a broken image
    return (
      <span className={"fthumb fthumb-label" + (big ? " is-large" : "")} role="img" aria-label={frag.name}>
        <span className="fl-initial" aria-hidden="true">{frag.name[0]}</span>
        <span className="fl-house" aria-hidden="true">{frag.house}</span>
      </span>
    );
  }
  window.FragThumb = FragThumb;

  // ---- Verified seal --------------------------------------------------
  function Verified({ label }) {
    const { tx } = window.useT();
    const t = label || tx("badge.verified", "Verified");
    return <Icon name="seal" className="verified" title={t}/>;
  }
  window.Verified = Verified;

  // ---- Price: tabular figures, currency set small ----------------------
  function Price({ iqd, size }) {
    return (
      <span className={"price" + (size ? " price-" + size : "")}>
        <span className="price-n">{iqd.toLocaleString("en-US")}</span>
        <span className="price-c">IQD</span>
      </span>
    );
  }
  window.Price = Price;

  // ---- Section head ---------------------------------------------------
  function SectionHead({ eyebrow, title, sub, action, onAction, id }) {
    return (
      <div className="sec-head">
        <div className="sec-head-text">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 id={id}>{title}</h2>
          {sub && <p className="sec-sub">{sub}</p>}
        </div>
        {action && (
          <button className="text-link" onClick={onAction}>
            {action}<Icon name="arrowRight" className="flip-rtl"/>
          </button>
        )}
      </div>
    );
  }
  window.SectionHead = SectionHead;

  // ---- Empty state ----------------------------------------------------
  function Empty({ icon="bottle", title, text, children }) {
    return (
      <div className="empty">
        <span className="empty-mark"><Icon name={icon}/></span>
        {title && <p className="empty-title">{title}</p>}
        {text && <p className="empty-text">{text}</p>}
        {children}
      </div>
    );
  }
  window.Empty = Empty;

  // ---- Segmented control (single choice) -------------------------------
  function Segmented({ options, value, onChange, label, size }) {
    return (
      <div className={"seg" + (size ? " seg-" + size : "")} role="radiogroup" aria-label={label}>
        {options.map(([k, l]) => (
          <button key={k} type="button" role="radio" aria-checked={value === k}
            className={value === k ? "is-on" : ""} onClick={() => onChange(k)}>{l}</button>
        ))}
      </div>
    );
  }
  window.Segmented = Segmented;

  // ---- Native select, styled ------------------------------------------
  function Select({ value, onChange, options, label, icon, className="" }) {
    return (
      <label className={"select " + className}>
        <span className="sr-only">{label}</span>
        {icon && <Icon name={icon} className="select-icon"/>}
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <Icon name="chevDown" className="select-caret"/>
      </label>
    );
  }
  window.Select = Select;

  // ---- Stars (display) -----------------------------------------------
  function Stars({ value, size=14, className="" }) {
    const full = Math.floor(value);
    const half = value - full >= 0.25 && value - full < 0.85;
    const fullN = value - full >= 0.85 ? full+1 : full;
    const items = [];
    for (let i=0;i<5;i++){
      if (i < fullN) items.push(<Icon key={i} name="starSolid" className="st" style={{width:size,height:size}}/>);
      else if (i===fullN && half) items.push(<Icon key={i} name="starHalf" className="st" style={{width:size,height:size}}/>);
      else items.push(<Icon key={i} name="starSolid" className="st st-off" style={{width:size,height:size}}/>);
    }
    return <span className={"stars "+className} role="img" aria-label={value.toFixed(1) + " / 5"}>{items}</span>;
  }
  window.Stars = Stars;

  // ---- highlight a search match ----------------------------------------
  window.highlight = function (text, q) {
    const s = (q || "").trim();
    if (!s || !text) return text;
    const i = text.toLowerCase().indexOf(s.toLowerCase());
    if (i < 0) return text;
    return <>{text.slice(0, i)}<mark>{text.slice(i, i + s.length)}</mark>{text.slice(i + s.length)}</>;
  };

  // ---- number formatting ---------------------------------------------
  window.fmt = function(n){
    if (typeof n === "string") return n;
    if (n >= 1000) return (n/1000).toFixed(n%1000>=100?1:0).replace(/\.0$/,"") + "K";
    return ""+n;
  };
})();
