#!/usr/bin/env node

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'public/promo');
const FRAME_DIR = path.join(os.tmpdir(), 'promo-clip-rec');
const BASE_URL = process.env.PROMO_FRAMES_URL || 'http://127.0.0.1:8080/';
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const FPS = 10;
const FRAME_COUNT = 30;
const PAIN_ACTS = ['search-empty', 'filter-hop', 'variant-doubt', 'cart-abandon', 'back-bounce'];
const MOMENTS = [
  'moment-search-a',
  'moment-search-b',
  'moment-variant-a',
  'moment-variant-b',
  'moment-cart-a',
  'moment-cart-b',
  'moment-upsell-a',
  'moment-upsell-b',
];
const LOOKS = ['home-hero', 'collection-dense', 'lookbook', 'list'];
const LOOK_MOTIONS = ['scroll-up', 'scroll-down'];

const DEVICES = {
  desktop: { width: 800, height: 500 },
  phone: { width: 360, height: 780 },
  tablet: { width: 960, height: 720 },
};

function clipsFor(device) {
  const onlyMotion = (process.env.PROMO_CLIP_MOTION || '').trim();
  const onlyLook = (process.env.PROMO_CLIP_LOOK || '').trim();
  const onlyTone = (process.env.PROMO_CLIP_TONE || '').trim();
  const clips = [];
  if (!onlyLook || onlyLook === 'classic') {
    for (const motion of PAIN_ACTS) {
      for (const chat of [false, true]) {
        clips.push({ device, motion, chat, tone: 'pain', look: 'classic', moment: false });
      }
    }
    for (const motion of MOMENTS) {
      clips.push({ device, motion, chat: false, tone: 'pitch', look: 'classic', moment: true });
    }
  }
  for (const look of LOOKS) {
    if (onlyLook && onlyLook !== look) continue;
    for (const motion of LOOK_MOTIONS) {
      clips.push({ device, motion, chat: true, tone: 'pain', look, moment: false });
    }
    clips.push({ device, motion: 'moment-catalog-a', chat: false, tone: 'pitch', look, moment: true });
  }
  const keyed = clips.map((clip) => {
    const base = `${clip.tone}-${device}-${clip.motion}-${clip.chat ? '1' : '0'}`;
    const key = clip.look === 'classic' ? base : `${base}-${clip.look}`;
    return { ...clip, key };
  });
  return keyed.filter((clip) => {
    if (onlyMotion && clip.motion !== onlyMotion) return false;
    if (onlyTone && clip.tone !== onlyTone) return false;
    return true;
  });
}

function encodeClip(frames, dest) {
  return new Promise((resolve, reject) => {
    const child = spawn(FFMPEG, [
      '-y',
      '-framerate', String(FPS),
      '-i', path.join(frames, 'frame-%02d.jpg'),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-crf', '28',
      '-an',
      '-movflags', '+faststart',
      dest,
    ], { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    child.stderr.on('data', (chunk) => { err += chunk.toString(); });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(err.split('\n').slice(-8).join('\n')));
    });
  });
}

function rememberClip(key) {
  const assetsPath = path.join(OUT_DIR, 'film-assets.json');
  const assets = JSON.parse(fs.readFileSync(assetsPath, 'utf8'));
  assets.clips[key] = `/promo/promo-clip-${key}.mp4`;
  fs.writeFileSync(assetsPath, `${JSON.stringify(assets)}\n`);
}

async function recordDevice(browser, device) {
  const spec = DEVICES[device];
  const page = await browser.newPage({
    viewport: { width: spec.width, height: spec.height },
    deviceScaleFactor: 1,
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  if (device === 'phone') {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'innerWidth', { configurable: true, get: () => 1280 });
    });
  }
  const url = new URL(BASE_URL);
  url.searchParams.set('marketing', 'ad-1');
  url.searchParams.set('part', 'pain');
  url.searchParams.set('clip', '1');
  url.searchParams.set('device', device);
  url.searchParams.set('nocover', '1');
  await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(
    () => document.documentElement.classList.contains('is-promo-ready') && document.querySelector('[data-promo-clip-ready]'),
    null,
    { timeout: 60000 },
  );

  for (const clip of clipsFor(device)) {
    const frames = path.join(FRAME_DIR, clip.key);
    fs.rmSync(frames, { recursive: true, force: true });
    fs.mkdirSync(frames, { recursive: true });
    await page.evaluate((next) => {
      window.__promoOpeningFrames.showClip(next);
    }, clip);
    const needsClerk = clip.moment || (clip.device === 'phone' && clip.chat);
    if (needsClerk) {
      await page.waitForFunction(() => {
        const canvas = document.querySelector('#bizmis-avatar-embed canvas');
        return !!(canvas && canvas.width > 32);
      }, null, { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(900);
    } else {
      await page.waitForTimeout(40);
    }
    const frameMs = 1000 / FPS;
    for (let index = 0; index < FRAME_COUNT; index += 1) {
      const started = Date.now();
      const file = path.join(frames, `frame-${String(index).padStart(2, '0')}.jpg`);
      await page.screenshot({ path: file, type: 'jpeg', quality: 72, timeout: 15000 });
      const remain = frameMs - (Date.now() - started);
      if (remain > 0) await page.waitForTimeout(remain);
    }
    fs.copyFileSync(path.join(frames, 'frame-00.jpg'), path.join(OUT_DIR, `promo-still-${clip.key}.jpg`));
    await encodeClip(frames, path.join(OUT_DIR, `promo-clip-${clip.key}.mp4`));
    fs.rmSync(frames, { recursive: true, force: true });
    rememberClip(clip.key);
    process.stdout.write(`wrote promo-clip-${clip.key}.mp4\n`);
  }
  await page.close();
}

async function main() {
  fs.mkdirSync(FRAME_DIR, { recursive: true });
  const { chromium } = await import('/Users/toruhiyo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs');
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PROMO_FRAMES_CHANNEL || 'chrome',
  });
  const only = (process.env.PROMO_CLIP_DEVICE || '').trim();
  const devices = only ? [only] : Object.keys(DEVICES);
  for (const device of devices) await recordDevice(browser, device);
  await browser.close();
  process.stdout.write('clip recording done\n');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
