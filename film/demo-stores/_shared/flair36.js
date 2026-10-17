// v36: the widget highlight, drawn natively in the store page (the film used to fake it on the video's pixels).
// The real widget lifts (scale), a ring and a glow in the store's widget colour breathe around it, and a gloss
// sweeps across it. Driven by the recorder's virtual clock: window.__FLAIR = [{ at: s, ms }], one or more beats.
(() => {
  const S = window.__STORE || {};
  const beats = (window.__FLAIR || []).map((b) => ({ at: b.at, ms: b.ms || 900, k: b.strength || 1 }));
  if (!beats.length) return;
  const color = S.theme || '#F9A353';
  const n = parseInt(color.slice(1), 16);
  const rgb = `${n >> 16},${(n >> 8) & 255},${n & 255}`;
  const LIFT = 0.1;
  function target() {
    const card = document.querySelector('#bizmis-avatar-embed [class*="group/card"], .bizmis-viewport-portal-root [class*="group/card"]');
    if (card && card.getBoundingClientRect().width > 0) return { node: card, bar: false };
    const glass = [...document.querySelectorAll('#bizmis-avatar-embed .backdrop-blur-xl, .bizmis-viewport-portal-root .backdrop-blur-xl')]
      .find((g) => g.classList.contains('absolute') && g.getBoundingClientRect().height > 30 && g.getBoundingClientRect().height < 200);
    return glass ? { node: glass.parentElement, bar: true, glass } : null;
  }
  const top = 2147483000;
  const ring = document.createElement('div');
  Object.assign(ring.style, { position: 'fixed', pointerEvents: 'none', zIndex: String(top), opacity: '0' });
  const gloss = document.createElement('div');
  Object.assign(gloss.style, { position: 'fixed', pointerEvents: 'none', zIndex: String(top + 1), overflow: 'hidden', opacity: '0' });
  const band = document.createElement('i');
  Object.assign(band.style, { position: 'absolute', top: '-50%', bottom: '-50%', width: '45%',
    background: 'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,.85) 50%, rgba(255,255,255,0) 80%, transparent 100%)' });
  gloss.append(band);
  document.body.append(ring, gloss);
  let t0 = null;
  const orig = window.__frame;
  window.__frame = (t) => {
    orig(t);
    const tg = target();
    if (!tg) return;
    if (t0 === null) t0 = { origin: tg.node.style.transformOrigin, scale: tg.node.style.scale };
    const beat = beats.find((b) => t >= b.at && t <= b.at + b.ms / 1000);
    const u = beat ? (t - beat.at) / (beat.ms / 1000) : -1;
    const lift = beat ? Math.sin(Math.PI * u) : 0;
    // lifted from its docked corner (never out of the screen): the desktop card from its bottom-right, the
    // full-width phone/tablet bar from its bottom edge and a little less (it already spans the screen)
    tg.node.style.transformOrigin = tg.bar ? '50% 100%' : '100% 100%';
    const st = beat ? beat.k : 1;   // v36: a stronger beat for the small, fast tunnel cards
    const k = tg.bar ? Math.min(LIFT * 0.6 * st, Math.max(0.02, (window.innerWidth - 4) / Math.max(1, tg.node.offsetWidth) - 1)) : LIFT * Math.min(1.7, st);
    tg.node.style.scale = beat ? String((1 + k * lift).toFixed(4)) : (t0.scale || '');
    const r = tg.node.getBoundingClientRect();   // after the lift: the overlays sit on the lifted widget
    const rad = `${(tg.bar ? r.height / 2 : 12 * (r.width / (tg.node.offsetWidth || r.width))).toFixed(1)}px`;   // the card's 12 px corners, lifted
    [ring, gloss].forEach((el) => Object.assign(el.style, { left: `${r.left.toFixed(1)}px`, top: `${r.top.toFixed(1)}px`, width: `${r.width.toFixed(1)}px`, height: `${r.height.toFixed(1)}px`, borderRadius: rad }));
    const z = (Math.max(r.width, r.height) / 330) * st;
    ring.style.opacity = beat ? '1' : '0';
    ring.style.boxShadow = `0 ${(10 * z * lift).toFixed(1)}px ${(34 * z * lift).toFixed(1)}px rgba(${rgb},${(0.5 * lift).toFixed(3)}), 0 0 0 ${(4.5 * z * lift).toFixed(1)}px rgba(${rgb},${(0.95 * lift).toFixed(3)}), 0 0 ${(56 * z * lift).toFixed(1)}px rgba(${rgb},${(0.55 * lift).toFixed(3)})`;
    gloss.style.opacity = beat ? '1' : '0';
    band.style.left = `${(-50 + Math.min(1, Math.max(0, u) / 0.8) * 160).toFixed(1)}%`;
  };
})();
