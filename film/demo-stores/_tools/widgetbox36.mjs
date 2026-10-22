// v36: find each device's visible widget root on a demo store (for the native highlight)
//   node _tools/widgetbox36.mjs slug,slug
import { chromium } from '/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-landing/node_modules/playwright/index.mjs';
const SPEC = { desktop: { w: 1280, h: 800, dpr: 1.5 }, tablet: { w: 810, h: 1080, dpr: 4 / 3 }, phone: { w: 432, h: 912, dpr: 2.5 } };
const { BRANDS } = await import('../_spec/brands24.mjs');
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-gpu', '--use-angle=metal', '--hide-scrollbars'] });
for (const slug of process.argv[2].split(',')) {
  const b = BRANDS.find((x) => x.slug === slug); const s = SPEC[b.device];
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: s.dpr, isMobile: b.device === 'phone', hasTouch: b.device !== 'desktop' });
  const page = await ctx.newPage();
  await page.route('**/*', (r) => { const u = new URL(r.request().url()); return ['localhost', '127.0.0.1'].includes(u.hostname) || /^(data|blob):/.test(u.protocol) || /fonts\./.test(u.hostname) ? r.continue() : r.abort(); });
  await page.goto(`http://127.0.0.1:8766/${slug}/home.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  const out = await page.evaluate(() => [...document.querySelectorAll('#bizmis-avatar-embed *, .bizmis-viewport-portal-root *')].map((n) => {
    const r = n.getBoundingClientRect(); const c = getComputedStyle(n);
    return { cls: String(n.className?.baseVal ?? n.className).slice(0, 70), tag: n.tagName, r: [r.left, r.top, r.width, r.height].map(Math.round), br: c.borderRadius, bg: c.backgroundColor, sh: c.boxShadow !== 'none' };
  }).filter((x) => x.r[2] > 120 && x.r[3] > 30 && (x.sh || x.bg !== 'rgba(0, 0, 0, 0)')).slice(0, 12));
  console.log(slug, b.device, JSON.stringify(out, null, 0));
  await ctx.close();
}
await browser.close();
