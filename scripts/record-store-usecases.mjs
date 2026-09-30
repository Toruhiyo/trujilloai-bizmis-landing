#!/usr/bin/env node
// BIZ-413: live Bizmis use-case videos on the dev stores.
// Shoppers type. Desktop keeps the caption overlay. Tablet and phone run the
// widget in mobile mode, where the sheet holds the clerk's words and captions
// are off. Waiting stretches (loading, thinking) ease up to 2x and back.
// The widget's sound is tapped in the page and paced with the picture.

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
const CART_FOLLOW_THROUGH_MS = 30000;
const NAVIGATION_SETTLE_MS = 20000;
const SOCKET_DROP_GRACE_MS = 20000;
const BROWSER_CLOSE_TIMEOUT_MS = 8000;
const KEY_DELAY_MIN_MS = 16;
const KEY_DELAY_SPREAD_MS = 38;
const KEY_HESITATION_CHANCE = 0.04;
const KEY_HESITATION_MIN_MS = 90;
const KEY_HESITATION_SPREAD_MS = 90;
const WAITING_SPEED = 2;
const PACE_RAMP_MS = 1500;
const PACE_STEP_MS = 20;
const OUTPUT_FPS = 30;
const AUDIO_RATE = 48000;
const AUDIO_GRAIN_SAMPLES = 1920;
const AUDIO_TAP_BUFFER = 4096;
const AUDIO_SILENCE_PEAK = 0.0001;
// The thinking loop sits near 0.075. The clerk's voice is louder, and that
// voice is the only sound that holds the video at normal speed.
const SPEECH_PEAK = 0.1;
const SPEECH_TAIL_MS = 900;
const GREETING_WAIT_MS = 20000;
const AUDIO_SNAP_SAMPLES = 4;
const AUDIO_BITRATE = '160k';
const COMPOSER_SELECTOR = [
  '#bizmis-avatar-embed textarea',
  '#bizmis-avatar-embed input[type="text"]',
  '.bizmis-viewport-portal-root textarea',
  '.bizmis-viewport-portal-root input[type="text"]',
].join(', ');

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

// The widget's own default is hybrid mode: the clerk speaks with captions
// and the shopper types. Seeding a session here used to open the text chat
// panel instead, so nothing is seeded. The caption bubble shows a history
// button while the pointer is over it, so the pointer stays clear of it.
function installPrefs() {
  localStorage.setItem('bizmis-subtitles', 'true');
  document.addEventListener('pointermove', (event) => {
    const caption = event.target instanceof Element
      && event.target.closest('.bizmis-subtitles-portal-root [data-caption-style]');
    if (!caption) return;
    caption.dispatchEvent(new PointerEvent('pointerout', { bubbles: true }));
    caption.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
  }, true);
}

// The widget picks mobile mode below 768px. Tablets are wider, so the
// recorder passes the widget's own isMobile option through its init call.
function installMobileWidget(page) {
  return page.addInitScript(() => {
    let api;
    Object.defineProperty(window, 'AvatarVoicechat', {
      configurable: true,
      get: () => api,
      set: (value) => {
        api = value;
        if (!value || typeof value.init !== 'function') return;
        const init = value.init.bind(value);
        value.init = (config) => init({ ...config, isMobile: true });
      },
    });
  });
}

// Headless Chrome cannot record its own output, so every sound the widget
// sends to a speaker is copied to Node with the wall time it plays at.
// Plain <audio> elements are routed through Web Audio first. The CDN allows
// CORS, and crossOrigin must be set before the source loads.
function installAudioTap(page, chunks) {
  return page.exposeBinding('__promoAudio', (_source, chunk) => { chunks.push(chunk); })
    .then(() => page.addInitScript(({ bufferSize, silencePeak }) => {
      const connect = AudioNode.prototype.connect;
      const taps = new Map();
      const routedElements = new WeakSet();
      let elementContext = null;
      const toBase64 = (samples) => {
        const pcm = new Int16Array(samples.length);
        for (let index = 0; index < samples.length; index += 1) {
          pcm[index] = Math.max(-1, Math.min(1, samples[index])) * 0x7fff;
        }
        const bytes = new Uint8Array(pcm.buffer);
        let binary = '';
        for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
        return btoa(binary);
      };
      const tapFor = (context) => {
        if (taps.has(context)) return taps.get(context);
        const contextId = `${Date.now()}-${taps.size}-${Math.random()}`;
        const tap = context.createScriptProcessor(bufferSize, 1, 1);
        tap.onaudioprocess = (event) => {
          const samples = event.inputBuffer.getChannelData(0);
          let peak = 0;
          for (let index = 0; index < samples.length; index += 1) peak = Math.max(peak, Math.abs(samples[index]));
          if (peak < silencePeak) return;
          const stamp = context.getOutputTimestamp();
          const at = performance.timeOrigin + stamp.performanceTime + (event.playbackTime - stamp.contextTime) * 1000;
          window.__promoAudio({
            contextId,
            at,
            rate: context.sampleRate,
            peak,
            samples: samples.length,
            pcm: toBase64(samples),
          });
        };
        connect.call(tap, context.destination);
        taps.set(context, tap);
        return tap;
      };
      AudioNode.prototype.connect = function connectAndTap(target, ...rest) {
        const result = connect.call(this, target, ...rest);
        if (target instanceof AudioDestinationNode) connect.call(this, tapFor(this.context));
        return result;
      };
      const createSource = AudioContext.prototype.createMediaElementSource;
      AudioContext.prototype.createMediaElementSource = function markRouted(element) {
        routedElements.add(element);
        return createSource.call(this, element);
      };
      const NativeAudio = window.Audio;
      window.Audio = function CorsAudio(url) {
        const element = new NativeAudio();
        element.crossOrigin = 'anonymous';
        if (url !== undefined) element.src = url;
        return element;
      };
      window.Audio.prototype = NativeAudio.prototype;
      const play = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function playThroughTap(...args) {
        if (!routedElements.has(this)) {
          try {
            elementContext = elementContext || new AudioContext();
            elementContext.createMediaElementSource(this).connect(elementContext.destination);
          } catch {
            routedElements.add(this);
          }
        }
        return play.apply(this, args);
      };
    }, { bufferSize: AUDIO_TAP_BUFFER, silencePeak: AUDIO_SILENCE_PEAK }));
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
  return withPage(page, () => page.evaluate((composerSelector) => {
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
    const clerkBubbles = [...document.querySelectorAll(
      '.bizmis-viewport-portal-root div.select-text > div, #bizmis-avatar-embed div.select-text > div',
    )].filter((node) => !node.classList.contains('bizmis-user-message'));
    const clerkMessages = clerkBubbles.map((node) => (node.innerText || '').trim()).filter(Boolean);
    const replyBox = boxOf(clerkBubbles[clerkBubbles.length - 1]);
    return {
      captionText,
      captionBox: boxOf(bubble),
      captionOverflow: overflow(boxOf(bubble)),
      replyOverflow: overflow(replyBox),
      clerkMessages,
      widgetReady: [...document.querySelectorAll(composerSelector)].some((node) => !!boxOf(node)),
      title: document.title || '',
      path: location.pathname + location.search,
    };
  }, COMPOSER_SELECTOR));
}

// The sheet re-renders its history on every page. Keeping each clerk
// message once, and letting a streaming message grow in place, gives an
// append-only transcript whose offsets survive navigation.
function mergeClerkMessages(known, seen) {
  for (const message of seen) {
    if (known.includes(message)) continue;
    const growing = known.findIndex((existing) => message.startsWith(existing));
    if (growing >= 0) known[growing] = message;
    else known.push(message);
  }
  return known;
}

function describePage(snap) {
  const readablePath = snap.path.replace(/\+/g, ' ').replace(/%([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  return `${readablePath} ${snap.title}`;
}

function createCollector() {
  const state = {
    captions: '',
    sheet: '',
    said: '',
    trail: '',
    title: '',
    path: '',
    captionClipped: false,
    replyClipped: false,
    sawCaption: false,
    widgetReady: false,
  };
  const clerkMessages = [];
  return {
    state,
    async ingest(page) {
      const snap = await samplePage(page);
      if (snap.captionText && !state.captions.endsWith(snap.captionText)) {
        state.captions = `${state.captions} ${snap.captionText}`.replace(/\s+/g, ' ').trim();
        state.sawCaption = true;
        if (snap.captionOverflow > 12) state.captionClipped = true;
      }
      state.sheet = mergeClerkMessages(clerkMessages, snap.clerkMessages).join('\n');
      state.said = `${state.said}\n${snap.clerkMessages.join('\n')}`;
      if (snap.replyOverflow > 24) state.replyClipped = true;
      if (snap.path !== state.path) state.trail = `${state.trail}\n${describePage(snap)}`;
      state.widgetReady = snap.widgetReady;
      state.title = snap.title;
      state.path = snap.path;
      return snap;
    },
    haystack() {
      return `${state.captions}\n${state.said}\n${state.trail}\n${state.title}\n${state.path}`;
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
  const composer = page.locator(COMPOSER_SELECTOR).first();
  await composer.waitFor({ state: 'visible', timeout: 45000 });
  const accept = page.locator('#bizmis-avatar-embed button, .bizmis-viewport-portal-root button').filter({ hasText: /^Accept$/ });
  if (await accept.count()) await accept.first().click().catch(() => {});
  await acceptCookies(page);
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

function keyDelay() {
  if (Math.random() < KEY_HESITATION_CHANCE) return KEY_HESITATION_MIN_MS + Math.random() * KEY_HESITATION_SPREAD_MS;
  return KEY_DELAY_MIN_MS + Math.random() * KEY_DELAY_SPREAD_MS;
}

async function typeLine(page, line) {
  const composer = page.locator(COMPOSER_SELECTOR).first();
  await composer.waitFor({ state: 'visible', timeout: 20000 });
  await composer.click();
  for (const char of line) {
    await page.keyboard.type(char);
    await sleep(keyDelay());
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
  const sheetAdded = collector.state.sheet.length - marker.sheet;
  if (marker.mobileWidget || sheetAdded > 24) return sheetAdded > 24;
  const added = collector.state.captions.slice(marker.captions).toLowerCase().replace(marker.line.toLowerCase(), '');
  return added.replace(/\s+/g, ' ').trim().length > 12;
}

// Loud chunks are the clerk talking. Gaps inside one reply stay part of it,
// so a breath between sentences is not a moment to type or to speed up.
function createSpeech(chunks) {
  const spans = () => {
    const raw = chunks
      .filter((chunk) => chunk.peak >= SPEECH_PEAK)
      .map((chunk) => [chunk.at, chunk.at + (chunk.samples / chunk.rate) * 1000])
      .sort((left, right) => left[0] - right[0]);
    const merged = [];
    for (const span of raw) {
      const last = merged[merged.length - 1];
      if (last && span[0] - last[1] < SPEECH_TAIL_MS) last[1] = Math.max(last[1], span[1]);
      else merged.push([...span]);
    }
    return merged;
  };
  return {
    covers(at) {
      return spans().some(([start, end]) => at >= start && at < end);
    },
    lastEndSince(since) {
      let end = 0;
      for (const [start, stop] of spans()) {
        if (start >= since && stop > end) end = stop;
      }
      return end;
    },
  };
}

// Wall-clock stretches where nothing is said or typed: page and widget
// loading, and the clerk thinking. The encoder plays them faster.
// The clerk's own voice is never part of one of these stretches.
function createPace() {
  const windows = [];
  let hurryingSince = 0;
  return {
    hurry() {
      if (!hurryingSince) hurryingSince = Date.now();
    },
    relax() {
      if (!hurryingSince) return;
      windows.push([hurryingSince, Date.now()]);
      hurryingSince = 0;
    },
    speedAt(at) {
      const open = hurryingSince ? [[hurryingSince, Infinity]] : [];
      const lifts = [...windows, ...open].map(([start, end]) => (
        Math.min(1, (at - start) / PACE_RAMP_MS, (end - at) / PACE_RAMP_MS)
      ));
      return 1 + (WAITING_SPEED - 1) * Math.max(0, ...lifts);
    },
  };
}

// Maps wall-clock ms to seconds of finished video and back.
function buildTimeline(pace, speech, startMs, endMs) {
  const steps = Math.max(1, Math.ceil((endMs - startMs) / PACE_STEP_MS));
  const paced = new Float64Array(steps + 1);
  for (let index = 0; index < steps; index += 1) {
    const middle = startMs + (index + 0.5) * PACE_STEP_MS;
    const speed = speech.covers(middle) ? 1 : pace.speedAt(middle);
    paced[index + 1] = paced[index] + PACE_STEP_MS / 1000 / speed;
  }
  const toPaced = (ms) => {
    const position = Math.min(steps, Math.max(0, (ms - startMs) / PACE_STEP_MS));
    const index = Math.min(steps - 1, Math.floor(position));
    return paced[index] + (paced[index + 1] - paced[index]) * (position - index);
  };
  const toWall = (seconds) => {
    let low = 0;
    let high = steps;
    while (high - low > 1) {
      const middle = (low + high) >> 1;
      if (paced[middle] <= seconds) low = middle;
      else high = middle;
    }
    const span = paced[low + 1] - paced[low];
    const fraction = span > 0 ? Math.min(1, Math.max(0, (seconds - paced[low]) / span)) : 0;
    return startMs + (low + fraction) * PACE_STEP_MS;
  };
  return { toPaced, toWall, duration: paced[steps] };
}

function isLoading(collector, sockets) {
  const requestPending = sockets.leavingAt > sockets.navigatedAt;
  const widgetBooting = Date.now() - sockets.navigatedAt < NAVIGATION_SETTLE_MS && !collector.state.widgetReady;
  return requestPending || widgetBooting;
}

// Resolves once the clerk has spoken and the voice has been quiet for the
// tail. The next shopper line is typed on that resolve.
async function waitForSpeechTail(speech, since, pace, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (speech.covers(Date.now())) pace.relax();
    const end = speech.lastEndSince(since);
    if (end > 0 && !speech.covers(Date.now()) && Date.now() - end >= SPEECH_TAIL_MS) {
      pace.relax();
      return true;
    }
    await sleep(200);
  }
  return false;
}

async function waitForTurn(page, collector, sockets, marker, pace, speech) {
  await collector.ingest(page);
  const started = Date.now();
  let socketDownSince = 0;
  let lastReplyLength = collector.state.captions.length + collector.state.sheet.length;
  let lastPath = collector.state.path;
  let lastCartCount = (await readCart(page)).length;
  let lastReplyChange = Date.now();
  while (Date.now() - started < TURN_TIMEOUT_MS) {
    await collector.ingest(page);
    const cart = await readCart(page);
    const pathChanged = collector.state.path !== lastPath;
    const replyLength = collector.state.captions.length + collector.state.sheet.length;
    if (replyLength !== lastReplyLength || pathChanged || cart.length !== lastCartCount) {
      lastReplyLength = replyLength;
      lastPath = collector.state.path;
      lastCartCount = cart.length;
      lastReplyChange = Date.now();
    }
    const replied = clerkHasReplied(collector, marker);
    const speechEnd = speech.lastEndSince(started);
    const speaking = speech.covers(Date.now()) || (speechEnd > 0 && Date.now() - speechEnd < SPEECH_TAIL_MS);
    if (speaking) pace.relax();
    else if (!replied || isLoading(collector, sockets)) pace.hurry();
    else pace.relax();
    const quiet = Date.now() - lastReplyChange > TURN_QUIET_MS;
    const speechDone = speechEnd > 0 && !speech.covers(Date.now()) && Date.now() - speechEnd >= SPEECH_TAIL_MS;
    const navigationPending = sockets
      && sockets.leavingAt > started
      && collector.state.path === marker.path
      && Date.now() - sockets.leavingAt < NAVIGATION_GRACE_MS;
    if (navigationPending) {
      await page.waitForLoadState('domcontentloaded', { timeout: NAVIGATION_GRACE_MS }).catch(() => {});
    }
    const heardSpeech = speechEnd > 0;
    const replyDone = heardSpeech ? speechDone : quiet && Date.now() - started > 4000;
    if (replied && replyDone && !navigationPending) {
      const said = collector.state.captions.replace(/\s+/g, ' ').slice(-180);
      process.stdout.write(`turn settled path=${collector.state.path} speech=${heardSpeech} captions="${said}"\n`);
      pace.relax();
      return cart;
    }
    const navigating = sockets
      && Date.now() - Math.max(sockets.navigatedAt, sockets.leavingAt) < NAVIGATION_SETTLE_MS;
    // Headless Chrome fires pagehide on its own, and the widget closes its
    // socket on that and reconnects. A drop only ends the take once it has
    // stayed down long enough to be a real disconnect, and no reply came.
    if (sockets && sockets.open < 1 && !replied && !navigating) {
      if (!socketDownSince) socketDownSince = Date.now();
      if (Date.now() - socketDownSince > SOCKET_DROP_GRACE_MS) {
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

// After showing products the clerk resumes on the new page and adds them
// there, so a cart take is judged only once that resumed turn is over.
async function waitForCartFollowThrough(page, collector, speech, pace, job) {
  const started = Date.now();
  let cart = await readCart(page);
  while (Date.now() - started < CART_FOLLOW_THROUGH_MS) {
    await collector.ingest(page);
    cart = await readCart(page);
    if (cartCovers(cart, job.beat.cartMustMatch)) break;
    if (speech.covers(Date.now())) pace.relax();
    else pace.hurry();
    const speechEnd = speech.lastEndSince(started);
    const spokeThenQuiet = speechEnd > 0
      && !speech.covers(Date.now())
      && Date.now() - speechEnd >= TURN_QUIET_MS;
    if (spokeThenQuiet) break;
    await sleep(300);
  }
  pace.relax();
  process.stdout.write(`cart follow-through ${Date.now() - started}ms items=${cart.length}\n`);
  return cart;
}

async function shopperTurn(page, collector, sockets, pace, speech, job, line) {
  pace.relax();
  await typeLine(page, line);
  await collector.ingest(page);
  const marker = {
    captions: collector.state.captions.length,
    sheet: collector.state.sheet.length,
    path: collector.state.path,
    line,
    mobileWidget: job.spec.mobileWidget,
  };
  const cart = await waitForTurn(page, collector, sockets, marker, pace, speech);
  return { cart, marker };
}

function latestReply(collector, marker) {
  const added = marker.mobileWidget
    ? collector.state.sheet.slice(marker.sheet)
    : collector.state.captions.slice(marker.captions);
  return added.replace(marker.line, '').replace(/\s+/g, ' ').trim();
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
  if (job.spec.mobileWidget) {
    if (collector.state.sheet.trim().length < 24 && !collector.state.sawCaption) reasons.push('no sheet reply');
  } else {
    if (!collector.state.sawCaption) reasons.push('no captions');
    if (collector.state.captionClipped) reasons.push('captions clipped');
  }
  if (job.beat.kind === 'catalog') {
    const shown = job.beat.mustMatch.length > 1 && openedProduct(collector.state.path, collector.state.title, job.beat.productUrlIncludes)
      ? job.beat.mustMatch.slice(0, 1)
      : job.beat.mustMatch;
    if (!groupsMatch(haystack, shown)) reasons.push('missing products in the reply');
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
    const swappedAt = frame.metadata?.timestamp;
    frames.push({ file, at: typeof swappedAt === 'number' ? swappedAt * 1000 : Date.now() });
    writes.push(fs.promises.writeFile(file, Buffer.from(frame.data, 'base64')));
    client.send('Page.screencastFrameAck', { sessionId: frame.sessionId }).catch(() => {});
  };
  const attach = async () => {
    client = await page.context().newCDPSession(page);
    client.on('Page.screencastFrame', onFrame);
    await fitScreen();
    await client.send('Page.startScreencast', castParams);
  };
  const fitScreen = async () => {
    const session = client || await page.context().newCDPSession(page);
    client = session;
    await session.send('Emulation.setDeviceMetricsOverride', {
      width: spec.cssWidth,
      height: spec.cssHeight,
      deviceScaleFactor: spec.scale,
      mobile: false,
      screenWidth: spec.cssWidth,
      screenHeight: spec.cssHeight,
    }).catch(() => {});
  };
  return {
    frames,
    fitScreen,
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

// Each output slot shows the latest capture at that paced moment. The
// screencast only emits frames on change, so real timestamps keep still
// moments at their true length before the timeline shortens waiting stretches.
function linkPacedFrames(frames, timeline, framesDir) {
  const pacedDir = path.join(framesDir, 'paced');
  fs.mkdirSync(pacedDir);
  const pacedAt = frames.map((frame) => timeline.toPaced(frame.at));
  const slots = Math.max(1, Math.round(timeline.duration * OUTPUT_FPS));
  let current = 0;
  for (let slot = 0; slot < slots; slot += 1) {
    const seconds = slot / OUTPUT_FPS;
    while (current + 1 < frames.length && pacedAt[current + 1] <= seconds) current += 1;
    fs.linkSync(frames[current].file, path.join(pacedDir, `slot-${String(slot).padStart(6, '0')}.jpg`));
  }
  return path.join(pacedDir, 'slot-%06d.jpg');
}

function decodePcm(base64) {
  const bytes = Buffer.from(base64, 'base64');
  return new Int16Array(bytes.buffer, bytes.byteOffset, bytes.length / 2);
}

// Chunks from one audio context are contiguous. Snapping a start that lands
// a few samples off the previous end avoids clicks from timestamp rounding.
function wallAudioTrack(chunks, startMs, endMs) {
  const track = new Float32Array(Math.ceil(((endMs - startMs) / 1000) * AUDIO_RATE));
  const endByContext = new Map();
  for (const chunk of chunks) {
    const pcm = decodePcm(chunk.pcm);
    const step = chunk.rate / AUDIO_RATE;
    const length = Math.floor(pcm.length / step);
    const measured = Math.round(((chunk.at - startMs) / 1000) * AUDIO_RATE);
    const previousEnd = endByContext.get(chunk.contextId);
    const offset = previousEnd !== undefined && Math.abs(measured - previousEnd) <= AUDIO_SNAP_SAMPLES
      ? previousEnd
      : measured;
    endByContext.set(chunk.contextId, offset + length);
    for (let index = 0; index < length; index += 1) {
      const target = offset + index;
      if (target < 0 || target >= track.length) continue;
      const position = index * step;
      const before = Math.floor(position);
      const after = Math.min(before + 1, pcm.length - 1);
      const sample = pcm[before] + (pcm[after] - pcm[before]) * (position - before);
      track[target] += sample / 0x8000;
    }
  }
  return track;
}

// Overlap-add time stretch. Pitch stays put, and at 1x the Hann grains sum
// back to the original signal, so the clerk's speech is untouched.
function pacedAudioTrack(track, timeline, startMs) {
  const hop = AUDIO_GRAIN_SAMPLES / 2;
  const grain = Float32Array.from({ length: AUDIO_GRAIN_SAMPLES }, (_, index) => (
    0.5 - 0.5 * Math.cos((2 * Math.PI * index) / AUDIO_GRAIN_SAMPLES)
  ));
  const paced = new Float32Array(Math.ceil(timeline.duration * AUDIO_RATE));
  for (let outStart = -hop; outStart < paced.length; outStart += hop) {
    const centerSeconds = (outStart + hop) / AUDIO_RATE;
    const sourceCenter = Math.round(((timeline.toWall(centerSeconds) - startMs) / 1000) * AUDIO_RATE);
    const sourceStart = sourceCenter - hop;
    for (let index = 0; index < AUDIO_GRAIN_SAMPLES; index += 1) {
      const out = outStart + index;
      const source = sourceStart + index;
      if (out < 0 || out >= paced.length || source < 0 || source >= track.length) continue;
      paced[out] += track[source] * grain[index];
    }
  }
  for (let index = 0; index < paced.length; index += 1) paced[index] = Math.max(-1, Math.min(1, paced[index]));
  return paced;
}

function writePacedAudio(chunks, timeline, startMs, endMs, framesDir) {
  if (!chunks.length) throw new Error('no audio captured');
  const audioFile = path.join(framesDir, 'audio.f32');
  const paced = pacedAudioTrack(wallAudioTrack(chunks, startMs, endMs), timeline, startMs);
  fs.writeFileSync(audioFile, Buffer.from(paced.buffer));
  return audioFile;
}

async function verifyCaptureSize(frames, spec) {
  const midpoint = frames[Math.floor(frames.length / 2)].file;
  const size = (await run(FFPROBE, [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height',
    '-of', 'csv=p=0',
    midpoint,
  ])).trim();
  process.stdout.write(`capture ${size} frames ${frames.length}\n`);
  const wanted = `${spec.cssWidth * spec.scale},${spec.cssHeight * spec.scale}`;
  if (size !== wanted) throw new Error(`capture ${size}, wanted ${wanted}`);
}

async function encode(frames, audioChunks, spec, pace, framesDir, dest) {
  const existing = frames.filter((frame) => fs.existsSync(frame.file));
  if (existing.length < 8) throw new Error(`only ${existing.length} frames`);
  await verifyCaptureSize(existing, spec);
  const startMs = existing[0].at;
  const endMs = existing[existing.length - 1].at + 1000 / OUTPUT_FPS;
  const timeline = buildTimeline(pace, createSpeech(audioChunks), startMs, endMs);
  const slotPattern = linkPacedFrames(existing, timeline, framesDir);
  const audioFile = writePacedAudio(audioChunks, timeline, startMs, endMs, framesDir);
  process.stdout.write(`paced ${((endMs - startMs) / 1000).toFixed(1)}s -> ${timeline.duration.toFixed(1)}s, audio chunks ${audioChunks.length}\n`);
  await run(FFMPEG, [
    '-y',
    '-framerate', String(OUTPUT_FPS),
    '-i', slotPattern,
    '-f', 'f32le',
    '-ar', String(AUDIO_RATE),
    '-ac', '1',
    '-i', audioFile,
    '-map', '0:v',
    '-map', '1:a',
    '-vf', `scale=${spec.masterWidth}:${spec.masterHeight}:flags=lanczos`,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    '-crf', '18',
    '-c:a', 'aac',
    '-b:a', AUDIO_BITRATE,
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

async function recordTake(browser, job, dest) {
  const store = storeBySlug.get(job.beat.slug);
  const spec = job.spec;
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
  if (spec.mobileWidget) await installMobileWidget(page);
  const audioChunks = [];
  await installAudioTap(page, audioChunks);
  const pace = createPace();
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
    if (capture) capture.fitScreen().then(() => capture.restart()).catch(() => {});
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
    while (Date.now() - warmStarted < 20000) {
      await warmup.ingest(page);
      if (warmup.state.widgetReady) break;
      await sleep(300);
    }
    capture = startScreencast(page, spec, framesDir);
    const speech = createSpeech(audioChunks);
    pace.hurry();
    await capture.fitScreen();
    await capture.start();
    await waitForSpeechTail(speech, 0, pace, GREETING_WAIT_MS);
    const collector = createCollector();
    const say = (line) => shopperTurn(page, collector, sockets, pace, speech, job, line);
    let cart = [];
    let clarified = false;
    const answerIfAsked = async (turn, stillMissing) => {
      if (clarified || !job.beat.clarify || !stillMissing()) return turn;
      if (!latestReply(collector, turn.marker).includes('?')) return turn;
      clarified = true;
      return say(job.beat.clarify);
    };
    const onProductPage = () => collector.state.path.includes('/products/');
    for (let index = 0; index < job.beat.lines.length; index += 1) {
      const isLastLine = index === job.beat.lines.length - 1;
      let turn = await say(job.beat.lines[index]);
      const stillMissing = job.beat.kind === 'cart'
        ? () => !cartCovers(turn.cart, job.beat.cartMustMatch)
        : () => collector.state.path === turn.marker.path;
      if (isLastLine) turn = await answerIfAsked(turn, stillMissing);
      cart = turn.cart;
      const needsOpen = job.beat.kind === 'catalog'
        && isLastLine
        && job.beat.followUp
        && !onProductPage();
      if (needsOpen) {
        turn = await answerIfAsked(await say(job.beat.followUp), () => !onProductPage());
        cart = turn.cart;
      }
    }
    // The clerk often finishes talking and then changes the page. The next
    // shopper line already went out when the voice stopped. This wait is
    // only so the landing page is on screen before the take is judged.
    const pathBeforeLanding = collector.state.path;
    const landingMark = Date.now();
    while (Date.now() - landingMark < NAVIGATION_GRACE_MS) {
      await collector.ingest(page);
      const left = sockets.leavingAt >= landingMark - 1000;
      const arrived = collector.state.path !== pathBeforeLanding
        && Date.now() - sockets.navigatedAt > HOLD_AFTER_MS;
      if (left && arrived && !isLoading(collector, sockets)) break;
      if (!left && Date.now() - landingMark > TURN_QUIET_MS) break;
      await sleep(300);
    }
    if (job.beat.kind === 'cart' && !cartCovers(cart, job.beat.cartMustMatch)) {
      cart = await waitForCartFollowThrough(page, collector, speech, pace, job);
    }
    const shopperMustAdd = job.beat.kind === 'cart'
      && !cartCovers(cart, job.beat.cartMustMatch)
      && onProductPage();
    if (shopperMustAdd && await clickAddToCart(page)) {
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
    await encode(capture.frames, audioChunks, spec, pace, framesDir, dest);
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

// The screencast records the browser window, not the emulated viewport, so
// each take gets a window of the device's exact size and pixel ratio.
async function launchForDevice(chromium, spec) {
  return chromium.launch({
    headless: process.env.PROMO_HEADED !== '1',
    channel: process.env.PROMO_FRAMES_CHANNEL || 'chrome',
    args: [
      `--window-size=${spec.cssWidth},${spec.cssHeight}`,
      `--force-device-scale-factor=${spec.scale}`,
      '--autoplay-policy=no-user-gesture-required',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });
}

async function closeBrowser(browser) {
  const closed = browser.close().then(() => 'closed').catch(() => 'close-failed');
  await Promise.race([closed, sleep(BROWSER_CLOSE_TIMEOUT_MS)]);
}

// A finished video is only replaced once a new take has passed, and it is
// written under a temporary name first. A failing take, or another run
// recording the same beat, can never wipe a video that already exists.
async function recordJob(chromium, job) {
  const name = fileName(job);
  const dest = path.join(OUT_DIR, name);
  const staging = path.join(OUT_DIR, `.recording-${name}`);
  if (!FORCE && fs.existsSync(dest)) {
    process.stdout.write(`skip ${name}\n`);
    return { ok: true, file: name };
  }
  let lastError = 'unknown';
  for (let attempt = 1; attempt <= MAX_TRIES; attempt += 1) {
    const browser = await launchForDevice(chromium, job.spec);
    try {
      const result = await recordTake(browser, job, staging);
      fs.renameSync(staging, dest);
      process.stdout.write(`pass ${name} (${result.duration.toFixed(1)}s, try ${attempt})\n`);
      return { ...result, attempt };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      process.stdout.write(`fail ${name} try ${attempt}: ${lastError}\n`);
      if (fs.existsSync(staging)) fs.rmSync(staging, { force: true });
    } finally {
      await closeBrowser(browser);
    }
  }
  return { ok: false, file: name, error: lastError };
}

async function main() {
  const jobs = selectedJobs();
  if (!jobs.length) throw new Error('no jobs selected');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const { chromium } = await import('playwright');
  const concurrency = Math.max(1, Number(process.env.PROMO_CONCURRENCY || 1));
  const outcomes = new Array(jobs.length);
  let cursor = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const index = cursor;
      cursor += 1;
      outcomes[index] = await recordJob(chromium, jobs[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, () => worker()));
  const results = loadResults();
  jobs.forEach((job, index) => { results[fileName(job)] = outcomes[index]; });
  saveResults(results);
  const failed = outcomes.filter((item) => !item.ok);
  process.stdout.write(`done ${jobs.length - failed.length}/${jobs.length}\n`);
  if (failed.length) process.exitCode = 1;
  process.exit(process.exitCode || 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
