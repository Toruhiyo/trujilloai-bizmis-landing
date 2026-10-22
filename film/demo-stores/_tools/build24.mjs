// v24: builds each demo store's HOME page (theme-style hero, no catalog) + its images + shirt stamp.
// node _tools/build24.mjs [slug]
import fs from 'fs';
import sharp from '/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-landing/node_modules/sharp/lib/index.js';
import { BRANDS } from '../_spec/brands24.mjs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const only = process.argv[2];
const VIEW = { desktop: { w: 1280, h: 800, dpr: 1.5 }, tablet: { w: 810, h: 1080, dpr: 4 / 3 }, phone: { w: 432, h: 912, dpr: 2.5 } };
// the generated hero/grid source images live in the film-production workspace (141 MB, not in git)
const GEN = process.env.DEMO_STORES_GEN || `${process.env.HOME}/Projects/Bizmis/film-production/ad-1/demo-stores-gen`;
const GRIDS = { landscape: `${GEN}/v24-landscape.png`, portrait: `${GEN}/v24-portrait.png` };

const I = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
};

// ---------- images ----------
const cellCache = {};
async function cells(kind) {
  if (cellCache[kind]) return cellCache[kind];
  const file = GRIDS[kind];
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const white = (x, y) => { const i = (y * w + x) * 3; return data[i] > 236 && data[i + 1] > 236 && data[i + 2] > 236; };
  const spans = (n, isGut) => { const out = []; let s = -1; for (let k = 0; k < n; k++) { const g = isGut(k); if (!g && s < 0) s = k; if (g && s >= 0) { if (k - s > 60) out.push([s, k]); s = -1; } } if (s >= 0 && n - s > 60) out.push([s, n]); return out; };
  const colGut = (x) => { let c = 0; for (let y = 0; y < h; y += 2) c += white(x, y); return c / (h / 2) > 0.93; };
  const cols = spans(w, colGut);
  const res = [];
  for (const [x0, x1] of cols) {
    const rowGut = (y) => { let c = 0; for (let x = x0; x < x1; x += 2) c += white(x, y); return c / ((x1 - x0) / 2) > 0.93; };
    for (const [y0, y1] of spans(h, rowGut)) res.push({ left: x0 + 3, top: y0 + 3, width: x1 - x0 - 6, height: y1 - y0 - 6 });
  }
  // reading order: rows then columns
  res.sort((a, b) => (Math.abs(a.top - b.top) > 80 ? a.top - b.top : a.left - b.left));
  cellCache[kind] = res;
  return res;
}
async function source(spec) {
  if (spec.cell) { const c = (await cells(spec.cell))[spec.i]; return sharp(GRIDS[spec.cell]).extract(c).toBuffer(); }
  if (spec.gen) return sharp(`${GEN}/${spec.gen}-hero.png`).toBuffer();
  return sharp(`${ROOT}/_img/${spec}.jpg`).toBuffer();
}
async function writeImg(spec, out, width, q = 86) {
  const buf = await source(spec);
  const m = await sharp(buf).metadata();
  await sharp(buf).resize({ width: Math.min(width, Math.round(m.width * 2)) }).jpeg({ quality: q, mozjpeg: true }).toFile(out);
  return m;
}
async function cornerColor(spec) {
  const buf = await source(spec);
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => [0, 1, 2].map((k) => data[(y * info.width + x) * 3 + k]);
  const pts = [px(6, 6), px(info.width - 7, 6), px(6, info.height - 7), px(info.width - 7, info.height - 7)];
  const c = [0, 1, 2].map((k) => Math.round(pts.reduce((a, p) => a + p[k], 0) / 4));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

// ---------- markup ----------
const logo = (b, cls = '') => `<span class="logo ${cls}"><svg class="logo__mark" viewBox="0 0 32 32" fill="currentColor">${b.logo.mark}</svg><span class="logo__word" style="${b.logo.wordCss}">${b.logo.word}</span></span>`;
function header(b, over) {
  const d = b.device;
  const nav = d === 'desktop' ? `<nav class="nav">${b.nav.map((n, i) => `<a${i === 0 ? ' class="is-on"' : ''}>${n}</a>`).join('')}</nav>` : '';
  const left = d === 'desktop' ? logo(b) : `<span class="icon">${I.menu}</span>`;
  const center = d !== 'desktop' ? logo(b, 'logo--center') : '';
  const icons = `<div class="icons"><span class="icon">${I.search}</span>${d === 'desktop' ? `<span class="icon">${I.user}</span>` : ''}<span class="icon">${I.bag}</span></div>`;
  return `<header class="header${over ? ' header--over' : ''}"><div class="header__l">${left}</div>${center}${nav}${icons}</header>`;
}
const ctas = (h, d, cls = '') => `<div class="ctas ${cls}"><a class="btn btn--primary cta-main">${h.cta}${d === 'desktop' ? ` <i class="btn__ar">${I.arrow}</i>` : ''}</a>${h.cta2 && d !== 'phone' ? `<a class="btn btn--ghost">${h.cta2}</a>` : ''}</div>`;
const text = (h, d, extra = '') => `<p class="eyebrow">${h.eyebrow}</p><h1>${h.title}</h1>${extra}<p class="sub">${h.sub}</p>${ctas(h, d)}`;
const marquee = (s) => `<div class="marquee"><div class="marquee__track"><span>${s.repeat(4)}</span><span>${s.repeat(4)}</span></div></div>`;

function hero(b, meta) {
  const h = b.hero; const d = b.device; const o = b.opts || {};
  const img = (cls = 'hero__bg', file = 'hero', pos = h.pos, push = '1,1.07') => `<div class="media ${cls}"><img src="img/${file}.jpg" style="object-position:${pos}" data-push="${push}" alt=""></div>`;
  switch (b.layout) {
    case 'overlay': {
      const caps = o.caps ? ' is-caps' : '';
      const wm = o.align === 'wordmark' ? `<div class="wordmark" data-rise="-6">${o.wordmark}</div>` : '';
      const vw = o.vword ? `<div class="vword">${h.vword}</div>` : '';
      const title = o.outline ? `<h1 class="stack">${h.title.replace(/<em>(.*?)<\/em>/, '@$1').split(' ').map((w) => (w.startsWith('@') ? `<span class="ol">${w.slice(1)}</span>` : `<span>${w}</span>`)).join('')}</h1>` : `<h1>${h.title}</h1>`;
      return `<section class="hero hero--overlay is-${o.align || 'bottom'}${caps}${o.light ? ' is-light' : ''}${o.duotone ? ' is-duo' : ''}">${img()}<div class="shade"></div>${vw}
        <div class="hero__text" data-rise="-6"><p class="eyebrow">${h.eyebrow}</p>${title}<p class="sub">${h.sub}</p>${ctas(h, d)}</div>${wm}${o.marquee ? marquee(o.marquee) : ''}</section>`;
    }
    case 'centered':
      return `<section class="hero hero--centered">${img()}<div class="shade"></div><div class="hero__text" data-rise="-6"><p class="eyebrow">${h.eyebrow}</p><h1>${h.title}</h1><p class="sub">${h.sub}</p>${ctas(h, d)}</div><div class="dots"><i class="is-on"></i><i></i><i></i></div></section>`;
    case 'spotlight':
      return `<section class="hero hero--spot"><div class="spot__glow" data-push="0.96,1.06"></div>
        <div class="hero__text">${text(h, d)}</div>
        <div class="spot__stage"><div class="spot__p spot__p--b" data-rise="10"><img src="img/prod-2.jpg" alt=""></div><div class="spot__p spot__p--a" data-push="1,1.06"><img src="img/prod-1.jpg" alt=""></div><span class="spot__tag">${h.tag}</span></div></section>`;
    case 'field':
      return `<section class="hero hero--field${o.playful ? ' is-playful' : ''}"><div class="field__panel"><div class="hero__text">${text(h, d)}</div>${o.playful ? '<i class="blob b1"></i><i class="blob b2"></i><i class="blob b3"></i>' : ''}${h.deco ? `<span class="deco" data-rise="8">${h.deco}</span>` : ''}</div>${img('field__img')}</section>`;
    case 'collage': {
      const tiles = Array.from({ length: 15 }, (_, i) => `<div class="tile"><img src="img/t-${i % meta.tiles}.jpg" alt=""></div>`).join('');
      return `<section class="hero hero--collage"><div class="collage" data-push="1.02,1.08"><div class="collage__in" data-drift="-26">${tiles}</div></div><div class="shade"></div><div class="hero__text">${text(h, d)}</div></section>`;
    }
    case 'inset':
      return `<section class="hero hero--inset">${img('inset__img')}<div class="hero__text"><p class="eyebrow">${h.eyebrow}</p><h1 data-drift="10">${h.title}</h1><div class="inset__foot"><p class="sub">${h.sub}</p>${ctas(h, d)}</div></div><span class="inset__label">Spring linen · 26</span></section>`;
    case 'arch':
      return `<section class="hero hero--arch"><div class="hero__text top"><p class="eyebrow">${h.eyebrow}</p><h1>${h.title}</h1></div><div class="arch__wrap"><i class="arch__ring"></i>${img('arch__img')}</div><div class="hero__text bot"><p class="sub">${h.sub}</p>${ctas(h, d)}</div></section>`;
    case 'portrait':
      return `<section class="hero hero--portrait${o.dark ? ' is-dark' : ''}">${img()}<div class="shade"></div><div class="hero__text" data-rise="-6">${text(h, d)}</div></section>`;
    case 'masthead':
      return `<section class="hero hero--mast"><div class="mast__word">${b.brand.split(' ')[0].toUpperCase()}</div>${img('mast__img')}<div class="mast__card">${text(h, d)}</div></section>`;
    case 'diptych': {
      const [w1, w2] = o.words;
      return `<section class="hero hero--dip"><div class="dip__half">${img('dip__img')}<span class="dip__word">${w1}</span></div><div class="dip__half">${img('dip__img', 'hero2', b.hero.pos2 || '50% 50%', '1.02,1.09')}<span class="dip__word">${w2}</span></div>
        <div class="dip__card"><p class="eyebrow">${h.eyebrow}</p><h1>${h.title}</h1>${ctas(h, d)}</div></section>`;
    }
  }
  throw new Error('layout ' + b.layout);
}

function page(b, meta) {
  const p = b.pal; const d = b.device; const v = VIEW[d];
  const overHeader = ['overlay', 'centered', 'portrait', 'diptych', 'collage'].includes(b.layout);
  const darkPage = ['centered'].includes(b.layout) || (b.layout === 'overlay') || (b.layout === 'portrait' && b.opts?.dark);
  const hbg = overHeader ? 'transparent' : (meta.bg || p.bg);
  const hink = overHeader ? (b.opts?.light ? p.ink : '#FFFFFF') : p.ink;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${b.brand}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${b.fonts.q}&display=block">
<link rel="stylesheet" href="/_shared/widget/avatar-widget-style.css">
<link rel="stylesheet" href="/_shared/store24.css">
<style>:root{--primary:${b.color};--on-primary:${p.onPrimary};--accent:${p.accent};--bg:${meta.bg || p.bg || '#fff'};--ink:${p.ink};--hbg:${hbg};--panel:${meta.panel || b.color};--hink:${hink};--display:'${b.fonts.display}';--display-w:${b.fonts.displayWeight};--body:'${b.fonts.body}';--vw:${v.w}px;--vh:${v.h}px}</style>
</head><body class="is-${d} is-home lay-${b.layout}${overHeader ? ' has-over' : ''}${darkPage ? ' is-darkpage' : ''}">
${header(b, overHeader)}
${hero(b, meta)}
<div class="cursor"><svg viewBox="0 0 28 28"><path d="M6 3.5v19.2l5-4.7 3.2 7.2 3.2-1.4-3.1-7h6.9z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg></div>
<div class="tap"></div>
<div id="bizmis-avatar-embed" class="bizmis-avatar-widget-root" style="position:fixed;z-index:9999;bottom:20px;right:20px"></div>
<script>window.__STORE=${JSON.stringify({ slug: b.slug, device: d, question: b.question, avatar: b.avatar, primary: b.color, theme: b.theme || b.color, mode: 'light', home: true, stamp: 'img/stamp.png' })};</script>
<script src="/_shared/widget/avatar-widget.js"></script>
<script src="/_shared/store24.js"></script>
</body></html>`;
}

// ---------- build ----------
for (const b of BRANDS) {
  if (only && b.slug !== only) continue;
  const dir = `${ROOT}/${b.slug}`;
  fs.mkdirSync(`${dir}/img`, { recursive: true });
  for (const f of fs.readdirSync(`${dir}/img`)) if (/^(hero|hero2|prod-\d|t-\d+)\.jpg$/.test(f)) fs.rmSync(`${dir}/img/${f}`);
  const v = VIEW[b.device];
  const px = Math.round(v.w * v.dpr * 1.12);
  const meta = {};
  if (b.hero.img) await writeImg(b.hero.img, `${dir}/img/hero.jpg`, b.layout === 'diptych' || b.layout === 'field' && b.device === 'desktop' ? Math.round(px * 0.7) : px);
  if (b.hero.img2) await writeImg(b.hero.img2, `${dir}/img/hero2.jpg`, Math.round(px * 0.6), 90);
  if (b.hero.products) {
    for (const [k, s] of b.hero.products.entries()) await writeImg(s, `${dir}/img/prod-${k + 1}.jpg`, 1100, 92);
    meta.bg = await cornerColor(b.hero.products[0]);
  }
  if (b.hero.tiles) {
    for (const [k, s] of b.hero.tiles.entries()) await writeImg(s.startsWith('gen:') ? { gen: s.slice(4) } : s, `${dir}/img/t-${k}.jpg`, 520, 84);
    meta.tiles = b.hero.tiles.length;
  }
  if (b.hero.rekey) {
    const bg = await cornerColor(b.hero.img); const hx = (x, i) => parseInt(x.slice(1 + 2 * i, 3 + 2 * i), 16);
    const B = [0, 1, 2].map((i) => hx(bg, i)); const P = [0, 1, 2].map((i) => hx(b.color, i));
    const { data, info } = await sharp(`${dir}/img/hero.jpg`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let k = 0; k < data.length; k += 3) {
      const r = data[k], g = data[k + 1], bl = data[k + 2];
      // chroma distance to the backdrop, luminance-normalised (so its shadows still count as backdrop)
      const L = (r + g + bl) / 3, LB = (B[0] + B[1] + B[2]) / 3, s2 = L / LB;
      const d = Math.hypot(r - B[0] * s2, g - B[1] * s2, bl - B[2] * s2);
      const w = Math.max(0, Math.min(1, 1 - (d - 14) / 40));
      for (let c = 0; c < 3; c++) data[k + c] = Math.round(data[k + c] * (1 - w) + Math.min(255, P[c] * s2) * w);
    }
    await sharp(data, { raw: info }).jpeg({ quality: 88, mozjpeg: true }).toFile(`${dir}/img/hero.rk.jpg`);
    fs.renameSync(`${dir}/img/hero.rk.jpg`, `${dir}/img/hero.jpg`);
  }
  if (false && b.layout === 'field' && b.device === 'desktop') {
    // the photo sits on the brand colour with multiply: the panel takes the product backdrop x brand colour (no seam)
    const c = await cornerColor(b.hero.img); const h2 = (x, i) => parseInt(x.slice(1 + 2 * i, 3 + 2 * i), 16);
    meta.panel = '#' + [0, 1, 2].map((i) => Math.round(h2(c, i) * h2(b.color, i) / 255).toString(16).padStart(2, '0')).join('');
  }
  fs.writeFileSync(`${dir}/home.html`, page(b, meta));
  console.log('built', b.slug, b.device, b.layout, meta.bg || '', meta.panel || '');
}
