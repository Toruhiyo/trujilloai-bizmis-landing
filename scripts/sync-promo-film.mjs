/**
 * Copy the ad film from shopify-theme-crimson-index into public/promo.
 * Reads the theme. Does not write to it.
 *
 * The engine is theme.js with init() reduced to the film boot, so the
 * animation code stays the theme's code.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const LANDING = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const THEME = path.resolve(LANDING, '../ShopifyThemes/shopify-theme-crimson-index');
const OUT = path.join(LANDING, 'public/promo');
const ASSET = path.join(THEME, 'assets');

function rewriteLiquid(source) {
  let html = source;
  html = html.replaceAll('{{ promo_logo_url }}', '/promo/bizmis-logo-full-white-transparent.png');
  html = html.replace(/\{\{\s*'([^']+)'\s*\|\s*asset_url\s*\|\s*json\s*\}\}/g, '"/promo/$1"');
  html = html.replace(/\{\{\s*'([^']+)'\s*\|\s*asset_url\s*\}\}/g, '/promo/$1');
  html = html.replace(/\{\{\s*promo_red\s*\|\s*json\s*\}\}/g, '"#D1001A"');
  const leftover = html.match(/\{\{[^}]+\}\}|\{%[^%]+%\}/);
  if (leftover) throw new Error(`Unreplaced Liquid: ${leftover[0]}`);
  return html;
}

function filmMarkup() {
  const liquid = fs.readFileSync(path.join(THEME, 'layout/theme.liquid'), 'utf8');
  const start = liquid.indexOf('<div class="promo-opening"');
  const end = liquid.indexOf('<div class="loader" id="page-loader"');
  if (start < 0 || end < 0 || end <= start) throw new Error('Promo markup markers were not found in theme.liquid');
  return rewriteLiquid(liquid.slice(start, end).trim()) + '\n';
}

function filmEngine() {
  const source = fs.readFileSync(path.join(ASSET, 'theme.js'), 'utf8');
  const start = source.indexOf('  function init() {');
  const end = source.indexOf('  function dismissLoader() {');
  if (start < 0 || end < 0 || end <= start) throw new Error('init() markers were not found in theme.js');
  const boot = `  function init() {
    if (promoVideo === 'opening') {
      const opening = document.querySelector('[data-promo-opening]');
      if (opening) {
        const openingController = new PromoOpening(opening, () => {});
        window.__promoOpeningFrames = openingController;
      }
    }
    propagatePromoVideoParam();
  }

`;
  return source.slice(0, start) + boot + source.slice(end);
}

function copyAssets() {
  fs.mkdirSync(OUT, { recursive: true });
  const names = fs.readdirSync(ASSET).filter((name) => (
    name.startsWith('promo-')
    || name === 'logo-white.png'
    || name === 'logo-transparent.png'
    || name === 'logo-mono.png'
    || name === 'bizmis-logo-full-white-transparent.png'
  ));
  names.forEach((name) => {
    fs.copyFileSync(path.join(ASSET, name), path.join(OUT, name));
  });
  for (const css of ['promo-ad.css', 'promo-ad-tokens.css']) {
    fs.copyFileSync(path.join(ASSET, css), path.join(OUT, css));
  }
  return names.length;
}

function assetMap() {
  const clips = {};
  const clay = {};
  fs.readdirSync(OUT).forEach((name) => {
    if (name.startsWith('promo-clip-') && name.endsWith('.mp4')) {
      clips[name.slice('promo-clip-'.length, -'.mp4'.length)] = `/promo/${name}`;
    }
    if (name.startsWith('promo-product-') && name.endsWith('.png')) {
      clay[name.slice('promo-product-'.length, -'.png'.length)] = `/promo/${name}`;
    }
  });
  return {
    clips,
    clay,
    pitchLead: '/promo/promo-pitch-grid-lead.jpg',
    stamp: '/promo/bizmis-logo-full-white-transparent.png',
  };
}

const copied = copyAssets();
const markup = filmMarkup();
const engine = filmEngine();
fs.writeFileSync(path.join(OUT, 'film-markup.html'), markup);
fs.writeFileSync(path.join(OUT, 'film-engine.js'), engine);
const map = assetMap();
fs.writeFileSync(path.join(OUT, 'film-assets.json'), JSON.stringify(map));

const referenced = [...markup.matchAll(/\/promo\/[A-Za-z0-9._-]+/g)].map((match) => match[0].slice('/promo/'.length));
const missing = [...new Set(referenced)].filter((name) => !fs.existsSync(path.join(OUT, name)));
if (missing.length) throw new Error(`Markup references missing files: ${missing.join(', ')}`);
if (!map.clips['pain-desktop-scroll-up-1']) throw new Error('Clip map is missing a known pain clip');
if (!fs.existsSync(path.join(OUT, 'promo-pitch-grid-lead.jpg'))) throw new Error('Pitch lead still was not copied');

const check = spawnSync(process.execPath, ['--check', path.join(OUT, 'film-engine.js')], { encoding: 'utf8' });
if (check.status !== 0) {
  throw new Error(check.stderr || 'film-engine.js failed node --check');
}

console.log(JSON.stringify({
  copied,
  clips: Object.keys(map.clips).length,
  clay: Object.keys(map.clay).length,
  markupBytes: Buffer.byteLength(markup),
  engineBytes: Buffer.byteLength(engine),
}, null, 2));
