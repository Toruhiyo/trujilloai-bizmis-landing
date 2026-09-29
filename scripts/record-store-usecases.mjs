#!/usr/bin/env node
// BIZ-413: live Bizmis use-case videos on the dev stores.
// Shoppers type. Desktop and tablet keep the caption overlay. The phone
// sheet is the clerk's words, because the widget turns captions off under 768px.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/store-usecases.json'), 'utf8'));
const OUT_DIR = path.join(ROOT, 'public/promo/stores/videos');
const RESULTS_PATH = path.join(ROOT, 'scripts/store-usecase-results.json');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const FFPROBE = process.env.FFPROBE || 'ffprobe';
const PASSWORD = process.env.PROMO_STORE_PASSWORD || 'bizmis';
const FORCE = process.env.PROMO_FORCE === '1';
const MAX_TRIES = Math.max(1, Number(process.env.PROMO_TRIES || 3));
const TURN_TIMEOUT_MS = 75000;
// Longer than the widget's 3s navigation countdown, so a turn is not
// judged while the page is about to change.
const TURN_QUIET_MS = 4500;
const HOLD_AFTER_MS = 1500;
const NAVIGATION_GRACE_MS = 15000;
const NAVIGATION_SETTLE_MS = 20000;

const storeBySlug = new Map(SHOTS.stores.map((store) => [store.slug, store]));

function selectedJobs() {
  const onlySlug = (process.env.PROMO_STORE_SLUG || '').trim();
  const onlyDevice = (process.env.PROMO_DEVICE || '').trim();
  const onlyBeat = (process.env.PROMO_BEAT || '').trim();
  const jobs = [];
  for (const beat of SHOTS.beats) {
    if (onlySlug && beat.slug !== onlySlug) continue;
    if (onlyBeat && beat.beat !== onlyBeat) continue;
    for (const device of Object.keys(SHOTS.devices)) {
      if (onlyDevice && device !== onlyDevice) continue;
      jobs.push({ beat, device, spec: SHOTS.devices[device] });
    }
  }
  return jobs;
}

function fileName(job) {
  return `${job.beat.slug}-${job.beat.beat}-${job.device}.mp4`;
}

function loadResults() {
  if (!fs.existsSync(RESULTS_PATH)) return {};
  return JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
}

function saveResults(results) {
  fs.writeFileSync(RESULTS_PATH, `${JSON.stringify(results, null, 2)}\n`);
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (chunk) => { out += chunk.toString(); });
    child.stderr.on('data', (chunk) => { err += chunk.toString(); });
    child.on('exit', (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(err.split('\n').slice(-12).join('\n') || `${cmd} exited ${code}`));
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function groupsMatch(haystack, groups) {
  const text = haystack.toLowerCase();
  return (groups || []).every((group) => group.some((term) => text.includes(term.toLowerCase())));
}

function cartCovers(items, groups) {
  const texts = items.map((item) => `${item.title || ''} ${item.product_title || ''} ${item.variant_title || ''}`.toLowerCase());
  const used = new Set();
  for (const group of groups || []) {
    const index = texts.findIndex((text, itemIndex) => (
      !used.has(itemIndex) && group.some((term) => text.includes(term.toLowerCase()))
    ));
    if (index < 0) return false;
    used.add(index);
  }
  return true;
}

const MACOS_CURSOR_SVG = [
  "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='28' viewBox='0 0 20 28'>",
  "<path d='M2.2 1.4 L2.2 22.2 L7.1 17.4 L10.6 25.6 L14.1 24.1 L10.5 15.8 L17.4 15.6 Z' fill='black' stroke='white' stroke-width='1.6' stroke-linejoin='round'/>",
  '</svg>',
].join('');

function installHiddenCursor(page) {
  return page.addInitScript(() => {
    const style = document.createElement('style');
    style.textContent = 'html, html * { cursor: none !important; caret-color: transparent !important; }';
    const mount = () => document.documentElement.appendChild(style);
    if (document.documentElement) mount();
    else document.addEventListener('DOMContentLoaded', mount);
  });
}

function installPrefs() {
  localStorage.setItem('bizmis-subtitles', 'true');
  localStorage.setItem('bizmis-session', JSON.stringify({
    sessionId: '',
    lastActive: Date.now(),
    wasConnected: false,
    voiceEnabled: false,
    isClosed: false,
  }));
}

async function withPage(page, read) {
  let lastError = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await read();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!/Execution context was destroyed|navigation|Target closed/i.test(message)) throw error;
      await sleep(300);
    }
  }
  throw lastError;
}

async function samplePage(page) {
  return withPage(page, () => page.evaluate(() => {
    const captionWords = [...document.querySelectorAll('.bizmis-caption-word')];
    const captionText = captionWords.map((node) => node.textContent || '').join('');
    const bubble = document.querySelector('[data-caption-style]');
    const view = { width: window.innerWidth, height: window.innerHeight };
    const boxOf = (node) => {
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return null;
      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
      };
    };
    const overflow = (box) => {
      if (!box) return 0;
      return Math.max(0 - box.left, 0 - box.top, box.right - view.width, box.bottom - view.height);
    };
    const portal = document.querySelector('.bizmis-viewport-portal-root');
    const embed = document.querySelector('#bizmis-avatar-embed');
    const sheetText = `${portal ? portal.innerText : ''}\n${embed ? embed.innerText : ''}`;
    const reply = portal
      ? [...portal.querySelectorAll('div')].reverse().find((node) => (node.innerText || '').trim().length > 24)
      : null;
    const replyBox = boxOf(reply);
    return {
      captionText,
      captionBox: boxOf(bubble),
      captionOverflow: overflow(boxOf(bubble)),
      replyOverflow: overflow(replyBox),
      sheetText,
      title: document.title || '',
      path: location.pathname + location.search,
    };
  }));
}

function createCollector() {
  const state = {
    captions: '',
    sheet: '',
    title: '',
    path: '',
    captionClipped: false,
    replyClipped: false,
    sawCaption: false,
  };
  return {
    state,
    async ingest(page) {
      const snap = await samplePage(page);
      if (snap.captionText && !state.captions.endsWith(snap.captionText)) {
        state.captions = `${state.captions} ${snap.captionText}`.replace(/\s+/g, ' ').trim();
        state.sawCaption = true;
        if (snap.captionOverflow > 12) state.captionClipped = true;
      }
      if (snap.sheetText.length > state.sheet.length) state.sheet = snap.sheetText;
      if (snap.replyOverflow > 24) state.replyClipped = true;
      state.title = snap.title;
      state.path = snap.path;
      return snap;
    },
    haystack() {
      return `${state.captions}\n${state.sheet}\n${state.title}\n${state.path}`;
    },
    length() {
      return this.haystack().length;
    },
  };
}

async function readCart(page) {
  return withPage(page, () => page.evaluate(async () => {
    try {
      const response = await fetch('/cart.js', { credentials: 'same-origin' });
      if (!response.ok) return [];
      const cart = await response.json();
      return (cart.items || []).map((item) => ({
        title: item.title || '',
        product_title: item.product_title || '',
        variant_title: item.variant_title || '',
      }));
    } catch {
      return [];
    }
  }));
}

async function unlockStore(page, host) {
  const origin = `https://${host}/`;
  await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 45000 });
  if (!page.url().includes('/password')) return;
  const input = page.locator('input[type="password"]').first();
  await input.waitFor({ state: 'visible', timeout: 15000 });
  await input.fill(PASSWORD);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith('/password'), { timeout: 25000 }),
    page.locator('form[action*="/password"] button[type="submit"], form[action*="/password"] input[type="submit"], button[type="submit"]').first().click(),
  ]);
  await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 45000 });
}

async function acceptCookies(page) {
  await page.evaluate(() => {
    if (window.__promoCookiesAccepted) return;
    const inWidget = (node) => !!node.closest('#bizmis-avatar-embed, .bizmis-viewport-portal-root, .bizmis-subtitles-portal-root, [class*="bizmis"]');
    const banner = document.querySelector('#shopify-pc__banner__btn-accept, #shopify-pc__banner__btn-accept-all');
    if (banner && !inWidget(banner)) {
      banner.click();
      window.__promoCookiesAccepted = true;
      return;
    }
    const buttons = [...document.querySelectorAll('button, a, input[type="submit"]')];
    const match = buttons.find((node) => {
      if (inWidget(node)) return false;
      const text = (node.innerText || node.value || '').replace(/\s+/g, ' ').trim().toLowerCase();
      return text === 'accept' || text === 'accept all' || text === 'allow all' || text === 'i agree';
    });
    if (!match) return;
    match.click();
    window.__promoCookiesAccepted = true;
  }).catch(() => {});
}

async function prepareWidget(page) {
  await acceptCookies(page);
  const reopen = page.getByRole('button', { name: /reopen assistant/i });
  if (await reopen.count()) {
    await reopen.first().click().catch(() => {});
  }
  const composer = page.locator('#bizmis-avatar-embed textarea, #bizmis-avatar-embed input[type="text"], .bizmis-viewport-portal-root textarea, .bizmis-viewport-portal-root input[type="text"]').first();
  await composer.waitFor({ state: 'visible', timeout: 45000 });
  const accept = page.locator('#bizmis-avatar-embed button, .bizmis-viewport-portal-root button').filter({ hasText: /^Accept$/ });
  if (await accept.count()) await accept.first().click().catch(() => {});
  await acceptCookies(page);
  await sleep(400);
  await composer.click({ force: true });
  return composer;
}

async function clickAddToCart(page) {
  const button = page.locator([
    'button[name="add"]',
    'form[action*="/cart/add"] button[type="submit"]',
    'product-form button[type="submit"]',
  ].join(', ')).first();
  const visible = await button.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
  if (!visible) return false;
  await button.scrollIntoViewIfNeeded().catch(() => {});
  const box = await button.boundingBox();
  if (!box) return false;
  const x = Math.round(box.x + Math.min(box.width * 0.45, 80));
  const y = Math.round(box.y + box.height / 2);
  await page.evaluate(async ({ x: tipX, y: tipY, svg }) => {
    const cursor = document.createElement('div');
    cursor.setAttribute('data-promo-cursor', '');
    const image = `url("data:image/svg+xml;utf8,${svg}")`;
    cursor.style.cssText = [
      'position:fixed',
      'width:20px',
      'height:28px',
      'z-index:2147483646',
      'pointer-events:none',
      'opacity:0',
      `background:${image} no-repeat`,
      'background-size:20px 28px',
    ].join(';');
    document.body.appendChild(cursor);
    const startX = Math.max(12, tipX - 160);
    const startY = Math.max(12, tipY - 110);
    const frames = 18;
    for (let step = 1; step <= frames; step += 1) {
      const t = step / frames;
      const ease = t * t * (3 - 2 * t);
      cursor.style.left = `${startX + (tipX - startX) * ease}px`;
      cursor.style.top = `${startY + (tipY - startY) * ease}px`;
      cursor.style.opacity = '1';
      await new Promise((resolve) => setTimeout(resolve, 16));
    }
    await new Promise((resolve) => setTimeout(resolve, 140));
  }, { x, y, svg: MACOS_CURSOR_SVG });
  await button.evaluate((node) => node.click());
  await sleep(700);
  await page.evaluate(() => {
    document.querySelector('[data-promo-cursor]')?.remove();
  });
  return true;
}

async function typeLine(page, line) {
  const composer = page.locator('#bizmis-avatar-embed textarea, #bizmis-avatar-embed input[type="text"], .bizmis-viewport-portal-root textarea, .bizmis-viewport-portal-root input[type="text"]').first();
  await composer.waitFor({ state: 'visible', timeout: 20000 });
  await composer.click();
  for (const char of line) {
    await page.keyboard.type(char);
    const pause = Math.random() < 0.08 ? 160 + Math.random() * 160 : 32 + Math.random() * 78;
    await sleep(pause);
  }
  await sleep(180);
  await page.keyboard.press('Enter');
  await sleep(400);
  const leftover = await composer.inputValue().catch(() => '');
  if (leftover.trim()) {
    const send = page.locator('#bizmis-avatar-embed button[aria-label="Send"], .bizmis-viewport-portal-root button[aria-label="Send"]').first();
    if (await send.count()) await send.click({ force: true });
    else await page.keyboard.press('Enter');
  }
  const still = await composer.inputValue().catch(() => '');
  process.stdout.write(`typed "${line}" leftover="${still.replace(/\s+/g, ' ').slice(0, 80)}"\n`);
}

function clerkHasReplied(collector, marker) {
  const openedProduct = collector.state.path.includes('/products/') && collector.state.path !== marker.path;
  if (openedProduct) return true;
  const sheetAdded = collector.state.sheet.length - marker.sheet - marker.line.length;
  if (marker.device === 'phone' || sheetAdded > 24) return sheetAdded > 24;
  const added = collector.state.captions.slice(marker.captions).toLowerCase().replace(marker.line.toLowerCase(), '');
  return added.replace(/\s+/g, ' ').trim().length > 12;
}

async function waitForTurn(page, collector, sockets, marker) {
  await collector.ingest(page);
  const started = Date.now();
  let socketDownSince = 0;
  let lastLength = collector.length();
  let lastPath = collector.state.path;
  let lastCartCount = (await readCart(page)).length;
  let lastChange = Date.now();
  while (Date.now() - started < TURN_TIMEOUT_MS) {
    await collector.ingest(page);
    const cart = await readCart(page);
    const pathChanged = collector.state.path !== lastPath;
    const changed = collector.length() !== lastLength
      || pathChanged
      || cart.length !== lastCartCount;
    if (changed) {
      lastLength = collector.length();
      lastPath = collector.state.path;
      lastCartCount = cart.length;
      lastChange = Date.now();
    }
    const replied = clerkHasReplied(collector, marker);
    const quiet = Date.now() - lastChange > TURN_QUIET_MS;
    const navigationPending = sockets
      && sockets.leavingAt > started
      && collector.state.path === marker.path
      && Date.now() - sockets.leavingAt < NAVIGATION_GRACE_MS;
    if (navigationPending) {
      await page.waitForLoadState('domcontentloaded', { timeout: NAVIGATION_GRACE_MS }).catch(() => {});
    }
    if (replied && quiet && Date.now() - started > 4000 && !navigationPending) {
      const said = collector.state.captions.replace(/\s+/g, ' ').slice(-180);
      process.stdout.write(`turn settled path=${collector.state.path} captions="${said}"\n`);
      return cart;
    }
    const navigating = sockets
      && Date.now() - Math.max(sockets.navigatedAt, sockets.leavingAt) < NAVIGATION_SETTLE_MS;
    if (sockets && sockets.open < 1 && !replied && !navigating) {
      if (!socketDownSince) socketDownSince = Date.now();
      if (Date.now() - socketDownSince > 8000) {
        const tail = (sockets.recent || []).slice(-4).join(' || ');
        throw new Error(`clerk socket dropped${tail ? ` | ${tail}` : ''}`);
      }
    } else {
      socketDownSince = 0;
    }
    await sleep(350);
  }
  const clip = collector.haystack().replace(/\s+/g, ' ').slice(0, 700);
  const debug = await withPage(page, () => page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button[aria-pressed]')].map((node) => ({
      label: node.getAttribute('aria-label'),
      pressed: node.getAttribute('aria-pressed'),
    }));
    return {
      buttons,
      captions: document.querySelectorAll('.bizmis-caption-word').length,
      embed: (document.querySelector('#bizmis-avatar-embed')?.innerText || '').replace(/\s+/g, ' ').slice(0, 400),
    };
  })).catch((error) => String(error));
  await page.screenshot({ path: path.join(os.tmpdir(), 'bizmis-fail-timeout.png'), fullPage: false }).catch(() => {});
  throw new Error(`clerk turn timed out | path=${collector.state.path} | ${clip} | ${JSON.stringify(debug)}`);
}

async function shopperTurn(page, collector, sockets, job, line) {
  await typeLine(page, line);
  await collector.ingest(page);
  const marker = {
    captions: collector.state.captions.length,
    sheet: collector.state.sheet.length,
    path: collector.state.path,
    line,
    device: job.device,
  };
  const cart = await waitForTurn(page, collector, sockets, marker);
  return { cart, marker };
}

function latestReply(collector, marker) {
  const added = marker.device === 'phone'
    ? collector.state.sheet.slice(marker.sheet)
    : collector.state.captions.slice(marker.captions);
  return added.replace(marker.line, '').replace(/\s+/g, ' ').trim();
}

function clerkAskedBack(job, collector, marker) {
  if (!latestReply(collector, marker).endsWith('?')) return false;
  const expected = job.beat.kind === 'catalog' ? job.beat.mustMatch : job.beat.cartMustMatch;
  return !groupsMatch(collector.haystack(), expected);
}

function openedProduct(path, title, hints) {
  if (!path.includes('/products/')) return false;
  const text = `${path} ${title}`.toLowerCase();
  return (hints || []).some((hint) => text.includes(hint.toLowerCase()));
}

function judge(job, collector, cart) {
  const reasons = [];
  const haystack = collector.haystack();
  if (collector.state.path.includes('/password')) reasons.push('password page');
  if (/something went wrong/i.test(haystack)) reasons.push('error toast');
  if (job.device === 'phone') {
    if (collector.state.sheet.trim().length < 24 && !collector.state.sawCaption) reasons.push('no phone reply');
    if (collector.state.replyClipped && !collector.state.sawCaption) reasons.push('phone reply clipped');
  } else {
    if (!collector.state.sawCaption) reasons.push('no captions');
    if (collector.state.captionClipped) reasons.push('captions clipped');
  }
  if (job.beat.kind === 'catalog') {
    if (!groupsMatch(haystack, job.beat.mustMatch)) reasons.push('missing products in the reply');
    if (!openedProduct(collector.state.path, collector.state.title, job.beat.productUrlIncludes)) {
      reasons.push('product page did not open');
    }
  } else if (!cartCovers(cart, job.beat.cartMustMatch)) {
    reasons.push(`cart missing items (${cart.map((item) => item.title).join(' | ') || 'empty'})`);
  }
  return reasons;
}

function startScreencast(page, spec, framesDir) {
  const frames = [];
  const writes = [];
  let index = 0;
  let client = null;
  const castParams = {
    format: 'jpeg',
    quality: 82,
    maxWidth: spec.cssWidth * spec.scale,
    maxHeight: spec.cssHeight * spec.scale,
    everyNthFrame: 1,
  };
  const onFrame = (frame) => {
    const file = path.join(framesDir, `frame-${String(index).padStart(6, '0')}.jpg`);
    index += 1;
    frames.push({ file, timestamp: frame.metadata?.timestamp ?? null });
    writes.push(fs.promises.writeFile(file, Buffer.from(frame.data, 'base64')));
    client.send('Page.screencastFrameAck', { sessionId: frame.sessionId }).catch(() => {});
  };
  const attach = async () => {
    client = await page.context().newCDPSession(page);
    client.on('Page.screencastFrame', onFrame);
    await client.send('Page.startScreencast', castParams);
  };
  return {
    frames,
    start: attach,
    async restart() {
      if (!client) return;
      try {
        await client.send('Page.startScreencast', castParams);
      } catch {
        await attach();
      }
    },
    async stop() {
      if (client) await client.send('Page.stopScreencast').catch(() => {});
      await Promise.all(writes);
    },
  };
}

async function encode(frames, spec, dest) {
  const existing = frames.filter((frame) => fs.existsSync(frame.file));
  if (existing.length < 8) throw new Error(`only ${existing.length} frames`);
  const midpoint = existing[Math.floor(existing.length / 2)].file;
  const midRaw = await run(FFPROBE, [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height',
    '-of', 'csv=p=0',
    midpoint,
  ]);
  process.stdout.write(`capture ${midRaw.trim()} frames ${existing.length}\n`);
  const stamps = existing.map((frame) => frame.timestamp).filter((stamp) => typeof stamp === 'number');
  const span = stamps.length > 1 ? stamps[stamps.length - 1] - stamps[0] : existing.length / 15;
  const measured = Math.max(8, Math.min(30, (existing.length - 1) / Math.max(span, 0.5)));
  await run(FFMPEG, [
    '-y',
    '-framerate', measured.toFixed(3),
    '-i', path.join(path.dirname(existing[0].file), 'frame-%06d.jpg'),
    '-r', '30',
    '-vf', `scale=${spec.masterWidth}:${spec.masterHeight}:flags=lanczos`,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    '-crf', '18',
    '-an',
    '-movflags', '+faststart',
    dest,
  ]);
}

async function probe(file) {
  const raw = await run(FFPROBE, [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,duration',
    '-of', 'json',
    file,
  ]);
  const stream = JSON.parse(raw).streams?.[0] || {};
  return {
    width: Number(stream.width),
    height: Number(stream.height),
    duration: Number(stream.duration || JSON.parse(raw).format?.duration || 0),
  };
}

async function recordTake(browser, job) {
  const store = storeBySlug.get(job.beat.slug);
  const spec = job.spec;
  const dest = path.join(OUT_DIR, fileName(job));
  const framesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bizmis-store-'));
  const context = await browser.newContext({
    viewport: { width: spec.cssWidth, height: spec.cssHeight },
    screen: { width: spec.cssWidth, height: spec.cssHeight },
    deviceScaleFactor: spec.scale,
    locale: 'en-US',
    hasTouch: job.device !== 'desktop',
    isMobile: job.device === 'phone',
  });
  const page = await context.newPage();
  await page.addInitScript(installPrefs);
  await installHiddenCursor(page);
  const sockets = { open: 0, navigatedAt: 0, leavingAt: 0, recent: [] };
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() !== 'error' && !/websocket|connection/i.test(text)) return;
    const line = `console ${message.type()}: ${text.slice(0, 180)}`;
    sockets.recent.push(line);
    if (sockets.recent.length > 12) sockets.recent.shift();
    process.stdout.write(`${line}\n`);
  });
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      sockets.leavingAt = Date.now();
    }
  });
  page.on('websocket', (socket) => {
    sockets.open += 1;
    process.stdout.write(`websocket ${socket.url().slice(0, 80)}\n`);
    socket.on('close', () => {
      sockets.open = Math.max(0, sockets.open - 1);
      process.stdout.write('websocket closed\n');
    });
  });
  page.on('framenavigated', (frame) => {
    if (frame !== page.mainFrame()) return;
    sockets.navigatedAt = Date.now();
    process.stdout.write(`nav ${frame.url()}\n`);
    if (capture) capture.restart().catch(() => {});
  });
  let capture = null;
  try {
    await unlockStore(page, store.host);
    if (page.url().includes('/password')) throw new Error('still on the password page');
    const view = await withPage(page, () => page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })));
    if (view.width !== spec.cssWidth || view.height !== spec.cssHeight) {
      throw new Error(`viewport ${view.width}x${view.height}, wanted ${spec.cssWidth}x${spec.cssHeight}`);
    }
    await acceptCookies(page);
    await prepareWidget(page);
    const warmup = createCollector();
    const warmStarted = Date.now();
    let last = 0;
    let lastChange = Date.now();
    while (Date.now() - warmStarted < 20000) {
      await warmup.ingest(page);
      if (warmup.length() !== last) {
        last = warmup.length();
        lastChange = Date.now();
      }
      if (warmup.state.sawCaption && Date.now() - lastChange > TURN_QUIET_MS) break;
      await sleep(300);
    }
    capture = startScreencast(page, spec, framesDir);
    await capture.start();
    const socketWaitStarted = Date.now();
    while (sockets.open < 1 && Date.now() - socketWaitStarted < 20000) await sleep(200);
    await sleep(1200);
    if (sockets.open < 1) throw new Error('clerk socket did not stay open');
    await sleep(800);
    const collector = createCollector();
    const say = (line) => shopperTurn(page, collector, sockets, job, line);
    let cart = [];
    for (let index = 0; index < job.beat.lines.length; index += 1) {
      const isLastLine = index === job.beat.lines.length - 1;
      let turn = await say(job.beat.lines[index]);
      if (isLastLine && job.beat.clarify && clerkAskedBack(job, collector, turn.marker)) {
        turn = await say(job.beat.clarify);
      }
      cart = turn.cart;
      const needsOpen = job.beat.kind === 'catalog'
        && isLastLine
        && job.beat.followUp
        && !collector.state.path.includes('/products/');
      if (needsOpen) cart = (await say(job.beat.followUp)).cart;
    }
    if (job.beat.kind === 'cart') {
      const clicked = await clickAddToCart(page);
      if (!clicked) throw new Error('add to cart button was not on screen');
      cart = await readCart(page);
      await sleep(900);
    }
    await sleep(HOLD_AFTER_MS);
    await capture.stop();
    const reasons = judge(job, collector, cart);
    if (reasons.length) {
      const clip = collector.haystack().replace(/\s+/g, ' ').slice(0, 700);
      await page.screenshot({ path: path.join(os.tmpdir(), `bizmis-fail-${fileName(job)}.png`) }).catch(() => {});
      throw new Error(`${reasons.join('; ')} | path=${collector.state.path} | ${clip}`);
    }
    fs.mkdirSync(OUT_DIR, { recursive: true });
    await encode(capture.frames, spec, dest);
    const info = await probe(dest);
    if (info.width !== spec.masterWidth || info.height !== spec.masterHeight) {
      throw new Error(`size ${info.width}x${info.height}`);
    }
    if (!(info.duration >= 8)) throw new Error(`too short (${info.duration}s)`);
    return { ok: true, file: fileName(job), duration: info.duration, width: info.width, height: info.height };
  } finally {
    if (capture) await capture.stop().catch(() => {});
    await context.close().catch(() => {});
    fs.rmSync(framesDir, { recursive: true, force: true });
  }
}

async function recordJob(browser, job, results) {
  const name = fileName(job);
  const dest = path.join(OUT_DIR, name);
  if (!FORCE && results[name]?.ok && fs.existsSync(dest)) {
    process.stdout.write(`skip ${name}\n`);
    return results[name];
  }
  let lastError = 'unknown';
  for (let attempt = 1; attempt <= MAX_TRIES; attempt += 1) {
    try {
      const result = await recordTake(browser, job);
      results[name] = { ...result, attempt };
      saveResults(results);
      process.stdout.write(`pass ${name} (${result.duration.toFixed(1)}s, try ${attempt})\n`);
      return results[name];
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      process.stdout.write(`fail ${name} try ${attempt}: ${lastError}\n`);
      if (fs.existsSync(dest)) fs.rmSync(dest, { force: true });
    }
  }
  results[name] = { ok: false, file: name, error: lastError };
  saveResults(results);
  return results[name];
}

async function main() {
  const jobs = selectedJobs();
  if (!jobs.length) throw new Error('no jobs selected');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const results = loadResults();
  const { chromium } = await import('playwright');
  // Headless keeps the viewport at the exact CSS size. A headed window gets
  // clipped by the display and the aspect ratio slips.
  const browser = await chromium.launch({
    headless: process.env.PROMO_HEADED !== '1',
    channel: process.env.PROMO_FRAMES_CHANNEL || 'chrome',
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });
  const concurrency = Math.max(1, Number(process.env.PROMO_CONCURRENCY || 1));
  let cursor = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor];
      cursor += 1;
      await recordJob(browser, job, results);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, () => worker()));
  const failed = Object.values(results).filter((item) => jobs.some((job) => fileName(job) === item.file) && !item.ok);
  process.stdout.write(`done ${jobs.length - failed.length}/${jobs.length}\n`);
  if (failed.length) process.exitCode = 1;
  const closed = browser.close().then(() => 'closed').catch(() => 'close-failed');
  await Promise.race([closed, sleep(8000)]);
  process.exit(process.exitCode || 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
