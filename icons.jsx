/* ============================================================
   BONXOSH — icon set (clean 1.7 stroke, Lucide-ish)
   <Icon name="home" /> ; some have a `fill` variant via `solid`
   ============================================================ */
(function () {
  const P = { fill:"none", stroke:"currentColor", strokeWidth:1.7, strokeLinecap:"round", strokeLinejoin:"round" };

  const paths = {
    home:        <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/></>,
    homeSolid:   <path d="M11.3 3.3a1 1 0 0 1 1.4 0l8 7.1a1 1 0 0 1 .3.75V20a1 1 0 0 1-1 1h-4.5v-5.5a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1V21H4a1 1 0 0 1-1-1v-8.85a1 1 0 0 1 .3-.75Z" fill="currentColor" stroke="none"/>,
    search:      <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></>,
    bottle:      <><path d="M9.5 3h5"/><path d="M10 3v2.2c0 .5-.2.9-.5 1.3L8 8.2A3 3 0 0 0 7.2 10v8.5A2.5 2.5 0 0 0 9.7 21h4.6a2.5 2.5 0 0 0 2.5-2.5V10a3 3 0 0 0-.8-2l-1.5-1.5a2 2 0 0 1-.5-1.3V3"/><path d="M7.3 12.5h9.4"/></>,
    bottleSolid: <path d="M9.5 2.25a.75.75 0 0 0 0 1.5h.75v1.45c0 .31-.12.6-.34.82L8.06 7.88A3.75 3.75 0 0 0 6.95 10.5v8a3.25 3.25 0 0 0 3.25 3.25h3.6A3.25 3.25 0 0 0 17.05 18.5v-8a3.75 3.75 0 0 0-1.11-2.66l-1.85-1.86a1.15 1.15 0 0 1-.34-.82V3.75h.75a.75.75 0 0 0 0-1.5Zm-2.2 9.5a.75.75 0 0 1 .75-.75h7.9a.75.75 0 0 1 0 1.5h-7.9a.75.75 0 0 1-.75-.75Z" fill="currentColor" stroke="none"/>,
    user:        <><circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></>,
    userSolid:   <><circle cx="12" cy="8" r="4.2" fill="currentColor" stroke="none"/><path d="M4.2 20.5a7.8 7.8 0 0 1 15.6 0 .9.9 0 0 1-.9 1.1H5.1a.9.9 0 0 1-.9-1.1Z" fill="currentColor" stroke="none"/></>,
    heart:       <path d="M12 20s-7-4.4-9.3-9C1.4 8.5 2.6 5.5 5.4 5c1.9-.3 3.6.7 4.6 2.2C11 5.7 12.7 4.7 14.6 5c2.8.5 4 3.5 2.7 6-2.3 4.6-9.3 9-9.3 9Z"/>,
    heartSolid:  <path d="M12 20s-7-4.4-9.3-9C1.4 8.5 2.6 5.5 5.4 5c1.9-.3 3.6.7 4.6 2.2C11 5.7 12.7 4.7 14.6 5c2.8.5 4 3.5 2.7 6-2.3 4.6-9.3 9-9.3 9Z" fill="currentColor" stroke="none"/>,
    comment:     <path d="M21 11.5a7.5 8.5 0 0 1-7.5 8.5 8.4 8.4 0 0 1-3.6-.8L4 21l1.4-4.3A8.6 8.6 0 0 1 4 11.5 7.5 8.5 0 0 1 11.5 3 7.5 8.5 0 0 1 21 11.5Z"/>,
    repost:      <><path d="M4 8.5 7 5.5l3 3"/><path d="M7 5.5v9a2 2 0 0 0 2 2h7"/><path d="M20 15.5 17 18.5l-3-3"/><path d="M17 18.5v-9a2 2 0 0 0-2-2H8"/></>,
    save:        <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4.2L5 20V5a1 1 0 0 1 1-1Z"/>,
    saveSolid:   <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4.2L5 20V5a1 1 0 0 1 1-1Z" fill="currentColor" stroke="none"/>,
    star:        <path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.2l1-5.9L3.5 9.2l5.9-.8Z"/>,
    starSolid:   <path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.2l1-5.9L3.5 9.2l5.9-.8Z" fill="currentColor" stroke="none"/>,
    starHalf:    <><defs><linearGradient id="bxhalf"><stop offset="50%" stopColor="currentColor"/><stop offset="50%" stopColor="transparent"/></linearGradient></defs><path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.2l1-5.9L3.5 9.2l5.9-.8Z" fill="url(#bxhalf)"/></>,
    verify:      <><path d="M12 2.5l2.1 1.5 2.6-.2 1 2.4 2.2 1.4-.6 2.5.6 2.5-2.2 1.4-1 2.4-2.6-.2L12 21.5l-2.1-1.5-2.6.2-1-2.4-2.2-1.4.6-2.5-.6-2.5 2.2-1.4 1-2.4 2.6.2Z" fill="currentColor" stroke="none"/><path d="m8.8 12 2.2 2.2 4.2-4.4" stroke="var(--paper)" strokeWidth="1.8"/></>,
    plus:        <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    feather:     <><path d="M20 4S15 3 10 8s-6 12-6 12 7 1 12-4 4-12 4-12Z"/><path d="M8 16 4 20"/><path d="M14 8l-6 6"/></>,
    image:       <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m4 18 5-5 4 3 3-3 4 4"/></>,
    smile:       <><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4 4 0 0 0 7 0"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></>,
    poll:        <><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></>,
    more:        <><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/></>,
    x:           <><path d="M6 6l12 12"/><path d="M18 6 6 18"/></>,
    check:       <path d="m5 12 4.5 4.5L19 7"/>,
    spark:       <path d="M12 3c.4 3.6 1.4 4.6 5 5-3.6.4-4.6 1.4-5 5-.4-3.6-1.4-4.6-5-5 3.6-.4 4.6-1.4 5-5Z" fill="currentColor" stroke="none"/>,
    flame:       <path d="M12 21c3.6 0 6-2.4 6-5.6 0-3.6-2.5-5-3.4-8.4-.2-.7-1-1-1.5-.5-1 .9-1.3 2.3-1.3 3.5 0 1-1 .5-1.3 0-.4-.7-.6-1.6-.5-2.4.05-.6-.6-1-1.1-.7C7 7.7 6 9.7 6 12.4 6 17 8.4 21 12 21Z"/>,
    pin:         <><path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z"/><circle cx="12" cy="11" r="2.2"/></>,
    cal:         <><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16"/><path d="M8 3v4M16 3v4"/></>,
    link:        <><path d="M9.5 13.5a3 3 0 0 0 4.2 0l3-3a3 3 0 1 0-4.2-4.2l-1.2 1.2"/><path d="M14.5 10.5a3 3 0 0 0-4.2 0l-3 3a3 3 0 1 0 4.2 4.2l1.2-1.2"/></>,
    bell:        <><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
    grid:        <><rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/></>,
    list:        <><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></>,
    chevron:     <path d="m9 5 7 7-7 7"/>,
    chevDown:    <path d="m6 9 6 6 6-6"/>,
    arrowLeft:   <><path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></>,
    tag:         <><path d="M3.6 11.4 11 4h6.4a2 2 0 0 1 2 2v6.4l-7.4 7.4a2 2 0 0 1-2.8 0l-4.6-4.6a2 2 0 0 1 0-2.8Z"/><circle cx="15" cy="8.5" r="1.25" fill="currentColor"/></>,
    tagSolid:    <><path d="M3.6 11.4 11 4h6.4a2 2 0 0 1 2 2v6.4l-7.4 7.4a2 2 0 0 1-2.8 0l-4.6-4.6a2 2 0 0 1 0-2.8Z" fill="currentColor" stroke="none"/><circle cx="15" cy="8.5" r="1.25" fill="var(--paper)" stroke="none"/></>,
    store:       <><path d="M4 9.5 5 4h14l1 5.5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0Z"/><path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"/><path d="M9.5 20v-5h5v5"/></>,
    wallet:      <><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10.5h18"/><circle cx="16.5" cy="14.8" r="1.15" fill="currentColor"/></>,
    truck:       <><rect x="2.5" y="7" width="11" height="9.5" rx="1"/><path d="M13.5 10.5H18l3 3v3h-7.5z"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></>,
    shield:      <><path d="M12 3 5 5.5V11c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V5.5Z"/><path d="m9 11.5 2 2 4-4"/></>,
    swap:        <><path d="M7 4 4 7l3 3"/><path d="M4 7h12a3 3 0 0 1 3 3"/><path d="m17 20 3-3-3-3"/><path d="M20 17H8a3 3 0 0 1-3-3"/></>,
    sliders:     <><path d="M4 7h9M18 7h2M4 17h2M11 17h9"/><circle cx="15.5" cy="7" r="2"/><circle cx="8.5" cy="17" r="2"/></>,
    arrowRight:  <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    arrowUpRight:<><path d="M7 17 17 7"/><path d="M8 7h9v9"/></>,
    clock:       <><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></>,
    box:         <><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5Z"/><path d="M3.5 7.5 12 12l8.5-4.5"/><path d="M12 12v9"/></>,
    message:     <><path d="M4 5.5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 3.5v-3.5H4a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z"/></>,
    seal:        <><path d="M12 2.5l2.1 1.5 2.6-.2 1 2.4 2.2 1.4-.6 2.5.6 2.5-2.2 1.4-1 2.4-2.6-.2L12 21.5l-2.1-1.5-2.6.2-1-2.4-2.2-1.4.6-2.5-.6-2.5 2.2-1.4 1-2.4 2.6.2Z" fill="currentColor" stroke="none"/><path d="m8.8 12 2.2 2.2 4.2-4.4" stroke="var(--paper)" strokeWidth="2"/></>,
    globe:       <><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5S9.6 5.9 12 3.5Z"/></>,
    coins:       <><ellipse cx="9" cy="6.5" rx="5.5" ry="2.7"/><path d="M3.5 6.5v4.3c0 1.5 2.5 2.7 5.5 2.7"/><path d="M9 13.3v3.2c0 1.5 2.5 2.7 5.5 2.7s5.5-1.2 5.5-2.7v-4.3"/><ellipse cx="14.5" cy="12.2" rx="5.5" ry="2.7"/></>,
  };

  // Decorative by default; pass `title` to make the icon announce itself.
  function Icon({ name, className, style, size, title }) {
    const d = paths[name] || null;
    const a11y = title ? { role:"img", "aria-label":title } : { "aria-hidden":"true" };
    return (
      <svg className={"ico " + (className||"")} style={style} viewBox="0 0 24 24"
           width={size} height={size} {...P} {...a11y}>
        {title && <title>{title}</title>}
        {d}
      </svg>
    );
  }
  window.Icon = Icon;
})();
