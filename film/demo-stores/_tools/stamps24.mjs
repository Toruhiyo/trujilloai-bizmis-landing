// Renders each v24 brand's logo as a transparent PNG for the avatar's shirt stamp (white, or dark on light shirts).
import { chromium } from '/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-landing/node_modules/playwright/index.mjs';
import fs from 'fs';
import { BRANDS } from '../_spec/brands24.mjs';
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const only = process.argv[2];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ deviceScaleFactor: 4 });
for (const b of BRANDS) {
  if (only && b.slug !== only) continue;
  const ink = b.stampDark ? '#111214' : '#FFFFFF';
  const html = `<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${b.fonts.q}&display=block"><style>html,body{margin:0;background:transparent}
  .s{display:inline-flex;align-items:center;gap:10px;color:${ink};padding:4px 6px;line-height:1}
  .s svg{width:34px;height:34px}.s i{font-style:italic;font-weight:400}.s small{font-size:.5em;letter-spacing:.2em;margin-left:6px;vertical-align:middle}</style></head>
  <body><span class="s"><svg viewBox="0 0 32 32" fill="currentColor">${b.logo.mark.replace(/var\(--(bg|hbg)\)/g, b.color)}</svg><span style="${b.logo.wordCss}">${b.logo.word}</span></span></body></html>`;
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(`${ROOT}/${b.slug}/img`, { recursive: true });
  await page.locator('.s').screenshot({ path: `${ROOT}/${b.slug}/img/stamp.png`, omitBackground: true });
  console.log('stamp', b.slug);
}
await browser.close();
