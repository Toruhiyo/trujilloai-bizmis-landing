// Records each demo store as a deterministic frame sequence (virtual clock), then encodes H.264.
// v35: _shared/talk35.js makes the agent visibly talk over the loop (same 3.2 s, so the film's timing never moves).
// v36: _shared/flair36.js draws the widget highlight natively, on the beats in _plan/flair36.json ({slug: {T, beats}}):
// each clip may run longer than 3.2 s so the film can start it where its highlight lands on the card's own moment.
// node film/demo-stores/_tools/record36.mjs [slug,slug|all] [--stills]   (serve film/demo-stores on :8766 first)
import { chromium } from '/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-landing/node_modules/playwright/index.mjs';
import fs from 'fs';
import { execFileSync } from 'child_process';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
// the film's reel clips in this repo (REEL_CUT names a new folder for a new cut, e.g. v37; the engine's
// PROMO_REEL_STORES_V24 paths must then point at it)
const OUT = new URL(`../../../public/promo/stores/reel/${process.env.REEL_CUT || 'v36'}`, import.meta.url).pathname;
const PLAN = JSON.parse(fs.readFileSync(new URL('../_plan/flair36.json', import.meta.url), 'utf8'));
import { BRANDS as brands24 } from '../_spec/brands24.mjs';
const brands = [...brands24, { slug: 'copperleaf', device: 'desktop' }];   // v36: the v23 Cookware run card, same native highlight
const which = process.argv[2] || 'all';
const TALK_FROM0 = new Set(['halcyon-optics', 'kumo-tea', 'sora-ceramics', 'powderline', 'tidewater', 'maison-cacao', 'liora', 'grindline']);   // the tunnel
const stills = process.argv.includes('--stills');
const home = true;
const SUF = home ? '-home' : '';
const FPS = 30;
const SPEC = {
  desktop: { w: 1280, h: 800, dpr: 1.5, out: [1440, 900] },
  tablet: { w: 810, h: 1080, dpr: 4 / 3, out: [810, 1080] },
  phone: { w: 432, h: 912, dpr: 2.5, out: [540, 1140] },
};

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal', '--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none'] });
for (const b of brands) {
  if (which !== 'all' && !which.split(',').includes(b.slug)) continue;
  const s = SPEC[b.device];
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: s.dpr, isMobile: b.device === 'phone', hasTouch: b.device !== 'desktop' });
  await ctx.addInitScript({ path: `${ROOT}/_tools/clock.js` });
  // v35: remember every mesh three.js gives blend shapes to (the avatar's face), so talk35.js can drive its mouth
  await ctx.addInitScript(() => {
    window.__morphMeshes = [];
    Object.defineProperty(Object.prototype, 'morphTargetDictionary', {
      configurable: true,
      get() { return undefined; },
      set(v) { Object.defineProperty(this, 'morphTargetDictionary', { value: v, writable: true, configurable: true, enumerable: true }); window.__morphMeshes.push(this); },
    });
  });
  await ctx.addInitScript(() => { try { localStorage.setItem('bizmis-subtitles', 'false'); } catch (e) {} });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
  await page.route('**/*', (r) => {
    const u = new URL(r.request().url());
    if (u.hostname === 'cdn.bizmis.ai' && u.pathname.startsWith('/widget/locales/')) return r.fulfill({ path: `${ROOT}/_shared/widget${u.pathname.slice(7)}` });
    if (['localhost', '127.0.0.1'].includes(u.hostname) || /^(data|blob):/.test(u.protocol) || /fonts\.(googleapis|gstatic)\.com/.test(u.hostname)) return r.continue();
    return r.abort();
  });
  await page.goto(`http://127.0.0.1:8766/${b.slug}/home.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => !!document.querySelector('#bizmis-avatar-embed canvas, .bizmis-viewport-portal-root canvas'), null, { timeout: 20000 });
  if (b.device === 'tablet') await page.addStyleTag({ content: '.bizmis-mobile-lite-chat{zoom:1.35}' });   // v30 (operator): the tablet widget bigger, same search-bar layout
  await page.waitForTimeout(3500);
  if (TALK_FROM0.has(b.slug)) await page.evaluate(() => { window.__TALK_FROM0 = true; });   // v35: tunnel stores talk from frame one
  await page.addScriptTag({ path: `${ROOT}/_shared/talk35.js` });   // v35
  const plan = PLAN[b.slug] || {};
  await page.evaluate((p) => { window.__FLAIR = p.beats || []; if (p.T) window.__T = p.T; }, plan);
  await page.addScriptTag({ path: `${ROOT}/_shared/flair36.js` });   // v36
  await page.evaluate(() => window.__clock.freeze());
  const T = await page.evaluate(() => window.__T);
  const n = Math.round(T * FPS);
  const dir = `${ROOT}/_frames/${b.slug}${SUF}-v36`;
  fs.rmSync(dir, { recursive: true, force: true });   // (the recorder's own scratch frames)
  fs.mkdirSync(dir, { recursive: true });
  const t0 = Date.now();
  const picks = stills ? (plan.beats || []).flatMap((x) => [Math.round(x.at * FPS), Math.round((x.at + x.ms / 2000) * FPS)]).concat([0, n - 1]) : null;
  for (let i = 0; i < n; i++) {
    await page.evaluate((t) => window.__frame(t), i / FPS);
    await page.evaluate((ms) => window.__clock.step(ms), 1000 / FPS);
    if (picks && !picks.includes(i)) continue;
    await page.screenshot({ path: `${dir}/f${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 93 });
  }
  console.log(JSON.stringify(await page.evaluate(() => window.__talkState)));
  console.log(b.slug, b.device, `${n} frames`, `${Math.round((Date.now() - t0) / 1000)}s`, errors.length ? `errors: ${errors.join(' | ')}` : '');
  await ctx.close();
  if (stills) continue;
  fs.mkdirSync(OUT, { recursive: true });
  const [ow, oh] = s.out;
  const mp4 = `${OUT}/${b.slug}-${b.device}${SUF}.mp4`;
  const enc = (crf) => execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', `${dir}/f%03d.jpg`,
    '-vf', `scale=${ow}:${oh}:flags=lanczos:out_range=tv,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf),
    '-profile:v', 'high', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', '-an', mp4]);
  let crf = 20; enc(crf);
  while (fs.statSync(mp4).size > 1.45 * 1024 * 1024 && crf < 30) { crf += 2; enc(crf); }
  const poster = `${OUT}/${b.slug}-${b.device}${SUF}.jpg`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', `${dir}/f000.jpg`, '-vf', `scale=${ow}:${oh}:flags=lanczos`, '-q:v', '3', poster]);
  console.log('  ->', mp4.split('/').pop(), `${(fs.statSync(mp4).size / 1024).toFixed(0)} KB crf ${crf}`);
}
await Promise.race([browser.close(), new Promise((r) => setTimeout(r, 5000))]);
process.exit(0);
