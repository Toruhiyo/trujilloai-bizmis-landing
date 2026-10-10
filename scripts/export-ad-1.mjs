#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const FPS = 30;
let exportFps = FPS;
const FRAME_CAP = 6000;
const CAPTURE_CHUNK = 3600;
const STREAM_CHUNK = Number(process.env.STREAM_CHUNK || 400);   // --stream: frames on disk at once
const LAYOUT_WIDTH = 1920;
const LAYOUT_HEIGHT = 1080;
const QUAD_WIDTH = 1920;
const QUAD_HEIGHT = 1080;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1 || index + 1 >= process.argv.length) return fallback;
  return process.argv[index + 1];
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function usage() {
  return [
    'Usage: node scripts/export-ad-1.mjs [options]',
    '  --cta demo|ea|install|none     default install',
    '  --part full|pain|pitch|sync|reel|cta  default full (sync: the scene + its hand-off into the reel; reel: sync + the whole reel)',
    '  --resolution 1920x1080         or 3840x2160',
    '  --preview                      layout at 1920x1080, file is 960x540, 6fps',
    '  --frames 0-59                  inclusive range, default the whole film',
    '  --codec ffv1|prores|h264       default ffv1 (MKV). prores is ProRes 4444; h264 is CRF 12 (visually lossless, small)',
    '  --out <folder>                 default tmp/ad-1-export',
    '  --url http://127.0.0.1:8080/   dev server',
    '  --verify                       export the range twice and compare frames',
    '  --resume                       keep frames already in --out and continue',
    '  --widget local                 load public/promo/widget-local (a local widget build)',
    '  --stream                       h264 only: feed each finished chunk to the encoder and drop its PNGs (a 4K run on a nearly full disk)',
  ].join('\n');
}

function parseResolution(raw) {
  const match = /^(\d+)x(\d+)$/.exec(String(raw || '').trim());
  if (!match) throw new Error(`Resolution must look like 1920x1080. Got "${raw}".`);
  return { width: Number(match[1]), height: Number(match[2]) };
}

function captureSetup(width, height) {
  if (width === QUAD_WIDTH * 2 && height === QUAD_HEIGHT * 2 && process.platform === 'darwin') {
    // Chrome refuses BeginFrameControl on macOS. A single 4K framebuffer
    // drops tiles. Each quadrant is the 1920x1080 scale that already paints
    // completely, then the four are stitched. The film layout itself is 16:9,
    // 1920x1080.
    return {
      viewportWidth: QUAD_WIDTH,
      viewportHeight: QUAD_HEIGHT,
      scale: 1,
      quadrants: 2,
      beginFrame: false,
    };
  }
  const scaleX = width / LAYOUT_WIDTH;
  const scaleY = height / LAYOUT_HEIGHT;
  const sameScale = scaleX === scaleY && Number.isInteger(scaleX) && scaleX >= 1;
  if (sameScale && scaleX > 1 && process.platform === 'darwin') {
    return {
      viewportWidth: LAYOUT_WIDTH,
      viewportHeight: LAYOUT_HEIGHT,
      scale: 1,
      quadrants: scaleX,
      beginFrame: false,
    };
  }
  if (sameScale && scaleX > 1) {
    return {
      viewportWidth: LAYOUT_WIDTH,
      viewportHeight: LAYOUT_HEIGHT,
      scale: scaleX,
      quadrants: 1,
      beginFrame: true,
    };
  }
  if (sameScale) {
    return { viewportWidth: LAYOUT_WIDTH, viewportHeight: LAYOUT_HEIGHT, scale: scaleX, quadrants: 1, beginFrame: false };
  }
  return { viewportWidth: width, viewportHeight: height, scale: 1, quadrants: 1, beginFrame: false };
}

function headlessShellPath() {
  if (process.env.PROMO_HEADLESS_SHELL) return process.env.PROMO_HEADLESS_SHELL;
  const root = path.join(process.env.HOME || '', 'Library/Caches/ms-playwright');
  if (!fs.existsSync(root)) return '';
  const dirs = fs.readdirSync(root).filter((name) => name.startsWith('chromium_headless_shell-')).sort();
  const dir = dirs[dirs.length - 1];
  if (!dir) return '';
  const folder = fs.readdirSync(path.join(root, dir)).find((name) => name.startsWith('chrome-headless-shell'));
  if (!folder) return '';
  return path.join(root, dir, folder, 'chrome-headless-shell');
}

function parseFrames(raw) {
  if (!raw) return null;
  const match = /^(\d+)-(\d+)$/.exec(String(raw).trim());
  if (!match) throw new Error(`Frame range must look like 0-59. Got "${raw}".`);
  const from = Number(match[1]);
  const to = Number(match[2]);
  if (to < from) throw new Error('Frame range ends before it starts.');
  return { from, to };
}

function timecode(frame) {
  const ff = frame % exportFps;
  const total = Math.floor(frame / exportFps);
  const ss = total % 60;
  const mm = Math.floor(total / 60) % 60;
  const hh = Math.floor(total / 3600);
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

function frameMs(frame) {
  return (frame * 1000) / exportFps;
}

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    return import('file:///Users/toruhiyo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs');
  }
}

function filmUrl(base, cta, part) {
  const url = new URL(base);
  url.searchParams.set('marketing', 'ad-1');
  url.searchParams.set('export', '1');
  url.searchParams.set('cta', cta);
  url.searchParams.set('part', part);
  url.searchParams.set('nocover', '1');
  if (arg('widget', '') === 'local') url.searchParams.set('widget', 'local');
  url.searchParams.delete('auto');
  return url.toString();
}

function chromeArgs(scale, heavy, beginFrame) {
  const args = [
    '--font-render-hinting=none',
    '--disable-lcd-text',
    '--disable-font-subpixel-positioning',
    '--force-color-profile=srgb',
    `--force-device-scale-factor=${scale}`,
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-checker-imaging',
    '--disable-threaded-animation',
    '--disable-threaded-scrolling',
    '--disable-partial-raster',
    '--disable-features=PaintHolding',
    '--run-all-compositor-stages-before-draw',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
  ];
  // Software raster at 4K leaves blank tiles that flicker. 1080p keeps it so frames stay bit-stable.
  // Quadrant captures stay at device scale 1, then the picture is scaled in CSS.
  // That scaled layer is bigger than the software tile budget, so software raster
  // skips tiles (the "Your" in "Your store" vanished on a white header).
  if (scale <= 1 && !heavy) args.push('--disable-gpu-rasterization');
  // 4K compositing drops whole tile rows, so the orange field splits and the sea shows through.
  if (scale > 1) args.push('--disable-gpu-compositing');
  // A 4K sea is bigger than Chrome's default tile budget, so tiles are skipped, not slow.
  if (heavy || scale > 1 || beginFrame) args.push('--force-gpu-mem-available-mb=8192');
  if (beginFrame) {
    args.push('--deterministic-mode', '--enable-begin-frame-control');
  }
  return args;
}

function launchOptions(chromium, scale, heavy, beginFrame) {
  const shell = headlessShellPath();
  const options = {
    headless: shell ? false : true,
    args: chromeArgs(scale, heavy, beginFrame),
  };
  if (shell) options.executablePath = shell;
  else options.channel = process.env.PROMO_FRAMES_CHANNEL || 'chrome';
  return { chromium, options, shell: Boolean(shell) };
}

async function launchBrowser(chromium, scale, heavy, beginFrame) {
  const launch = launchOptions(chromium, scale, heavy, beginFrame);
  return chromium.launch(launch.options);
}

async function bootPage(browser, options) {
  const context = await browser.newContext({
    viewport: { width: options.viewportWidth, height: options.viewportHeight },
    deviceScaleFactor: options.scale,
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'light',
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(Number(process.env.EXPORT_TIMEOUT_MS) || 90000);   // a busy machine needs longer
  await page.goto(filmUrl(options.url, options.cta, options.part), { waitUntil: 'domcontentloaded' });
  if (options.beginFrame) {
    const client = await context.newCDPSession(page);
    page.__beginFrame = client;
    page.__beginTicks = 1000;
    await client.send('HeadlessExperimental.enable').catch(() => {});
    for (let pump = 0; pump < 40; pump += 1) {
      const ready = await page.evaluate(() => document.documentElement.classList.contains('is-promo-ready')).catch(() => false);
      if (ready) break;
      await client.send('HeadlessExperimental.beginFrame', {
        frameTimeTicks: page.__beginTicks,
        interval: 1000 / FPS,
        noDisplayUpdates: true,
      });
      page.__beginTicks += 1000 / FPS;
    }
  }
  await page.waitForFunction(() => document.documentElement.classList.contains('is-promo-ready'));
  await page.evaluate(async (final) => {
    const clock = window.__promoClock;
    if (!clock) throw new Error('Export clock did not install. Open the page with export=1.');
    if (final) document.documentElement.classList.add('is-promo-final');
    clock.arm();
    window.AvatarVoicechat?.destroy?.('bizmis-avatar-embed');
    window.__promoMountWidget?.();
    if (typeof window.__promoExportBoot !== 'function') {
      throw new Error('Film export boot is missing.');
    }
    await clock.ready();
    clock.reseed();
    window.__promoExportBoot();
  }, !options.preview);
  return { context, page };
}

const QUAD_ORIGINS = ['0% 0%', '100% 0%', '0% 100%', '100% 100%'];
const CAPTURE_ATTEMPTS = 4;
let captureAttempts = CAPTURE_ATTEMPTS;
const DIFF_CHANNEL = 18;
const DIFF_FRACTION = 0.0025;

async function setQuadrant(page, origin) {
  await page.evaluate((value) => {
    const root = document.documentElement;
    if (!value) {
      root.classList.remove('is-export-quad');
      root.style.removeProperty('--export-quad-origin');
      return;
    }
    root.classList.add('is-export-quad');
    root.style.setProperty('--export-quad-origin', value);
  }, origin || '');
}

function rawFrame(file, width, height) {
  return execFileSync(process.env.FFMPEG || 'ffmpeg', [
    '-v', 'error', '-i', file, '-vf', `scale=${width}:${height}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-',
  ], { maxBuffer: width * height * 3 + 4096 });
}

function framesDiffer(leftFile, rightFile) {
  const width = 160;
  const height = 90;
  const left = rawFrame(leftFile, width, height);
  const right = rawFrame(rightFile, width, height);
  const total = width * height;
  let diff = 0;
  for (let index = 0; index < total; index += 1) {
    const offset = index * 3;
    const red = Math.abs(left[offset] - right[offset]);
    const green = Math.abs(left[offset + 1] - right[offset + 1]);
    const blue = Math.abs(left[offset + 2] - right[offset + 2]);
    if (red > DIFF_CHANNEL || green > DIFF_CHANNEL || blue > DIFF_CHANNEL) diff += 1;
  }
  return diff / total > DIFF_FRACTION;
}

function frameHasHole(file) {
  const width = 160;
  const height = 90;
  const block = 10;
  const cols = width / block;
  const rows = height / block;
  const raw = rawFrame(file, width, height);
  const white = [];
  const blockLuma = [];
  for (let by = 0; by < rows; by += 1) {
    for (let bx = 0; bx < cols; bx += 1) {
      let count = 0;
      let luma = 0;
      for (let y = 0; y < block; y += 1) {
        for (let x = 0; x < block; x += 1) {
          const offset = ((by * block + y) * width + (bx * block + x)) * 3;
          const red = raw[offset];
          const green = raw[offset + 1];
          const blue = raw[offset + 2];
          luma += (red + green + blue) / 3;
          if (red > 248 && green > 248 && blue > 248) count += 1;
        }
      }
      const area = block * block;
      white.push(count / area > 0.92);
      blockLuma.push(luma / area);
    }
  }
  const seen = new Set();
  const indexOf = (x, y) => y * cols + x;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const start = indexOf(x, y);
      if (!white[start] || seen.has(start)) continue;
      const stack = [start];
      seen.add(start);
      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      let count = 0;
      let touchesEdge = false;
      let darkestBeside = 255;
      while (stack.length) {
        const current = stack.pop();
        const cx = current % cols;
        const cy = (current - cx) / cols;
        count += 1;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        if (cx <= 1 || cy <= 1 || cx >= cols - 2 || cy >= rows - 2) touchesEdge = true;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) return;
          const next = indexOf(nx, ny);
          if (!white[next]) {
            darkestBeside = Math.min(darkestBeside, blockLuma[next]);
            return;
          }
          if (seen.has(next)) return;
          seen.add(next);
          stack.push(next);
        });
      }
      const spanX = maxX - minX + 1;
      const spanY = maxY - minY + 1;
      const box = spanX * spanY;
      const aspect = Math.max(spanX, spanY) / Math.min(spanX, spanY);
      const maxHole = Math.round(cols * rows * 0.2);
      const hardEdge = darkestBeside < 220;
      const minHoleSpan = 4;
      if (hardEdge && !touchesEdge && count >= 6 && count <= maxHole && count / box > 0.95 && aspect <= 2.2 && Math.min(spanX, spanY) >= minHoleSpan) {
        return true;
      }
    }
  }
  return false;
}

async function grabPng(page, file) {
  if (page.__beginFrame) {
    const result = await page.__beginFrame.send('HeadlessExperimental.beginFrame', {
      frameTimeTicks: page.__beginTicks,
      interval: 1000 / FPS,
      screenshot: { format: 'png' },
    });
    page.__beginTicks += 1000 / FPS;
    if (!result.screenshotData) throw new Error('beginFrame returned no pixels.');
    fs.writeFileSync(file, Buffer.from(result.screenshotData, 'base64'));
    return;
  }
  await page.screenshot({ path: file, type: 'png' });
}

async function captureStable(page, dest, timeoutMs) {
  if (captureAttempts <= 1) {
    await grabPng(page, dest);
    return;
  }
  let reason = 'unpainted block';
  for (let attempt = 0; attempt < captureAttempts; attempt += 1) {
    const left = `${dest}.a.png`;
    const right = `${dest}.b.png`;
    await grabPng(page, left);
    await grabPng(page, right);
    const differ = framesDiffer(left, right);
    const hole = frameHasHole(left);
    if (!differ && !hole) {
      fs.renameSync(left, dest);
      fs.rmSync(right, { force: true });
      return;
    }
    reason = differ ? 'two captures of the same time differ' : 'unpainted block';
    fs.rmSync(left, { force: true });
    fs.rmSync(right, { force: true });
    await page.evaluate((timeout) => window.__promoClock.settle(timeout), timeoutMs);
  }
  throw new Error(reason);
}

function stitchQuadrants(parts, dest) {
  execFileSync(process.env.FFMPEG || 'ffmpeg', [
    '-y', '-v', 'error',
    '-i', parts[0], '-i', parts[1], '-i', parts[2], '-i', parts[3],
    '-filter_complex', '[0:v][1:v]hstack[top];[2:v][3:v]hstack[bottom];[top][bottom]vstack',
    dest,
  ]);
}

async function writeFrame(page, frame, framesDir, timeoutMs, quadrants) {
  let timedOut = false;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = await page.evaluate((timeout) => window.__promoClock.settle(timeout), timeoutMs);
    timedOut = Boolean(result.timedOut);
    if (!timedOut) break;
  }

  const file = path.join(framesDir, `frame-${String(frame).padStart(6, '0')}.png`);
  const quadCount = quadrants > 1 ? quadrants * quadrants : 1;
  if (quadCount === 1) {
    await captureStable(page, file, timeoutMs);
    return { timedOut, file };
  }

  const parts = [];
  try {
    for (let index = 0; index < quadCount; index += 1) {
      await setQuadrant(page, QUAD_ORIGINS[index]);
      await page.evaluate((timeout) => window.__promoClock.settle(Math.min(timeout, 800)), timeoutMs);
      const part = path.join(framesDir, `quad-${String(frame).padStart(6, '0')}-${index}.png`);
      await captureStable(page, part, timeoutMs);
      parts.push(part);
    }
    const stitched = `${file}.stitch.png`;
    stitchQuadrants(parts, stitched);
    if (frameHasHole(stitched)) {
      fs.rmSync(stitched, { force: true });
      throw new Error('unpainted block');
    }
    fs.renameSync(stitched, file);
  } catch (error) {
    fs.rmSync(file, { force: true });
    throw new Error(`Frame ${frame} is not finished: ${error instanceof Error ? error.message : error}`);
  } finally {
    parts.forEach((part) => fs.rmSync(part, { force: true }));
    await setQuadrant(page, '');
  }
  return { timedOut, file };
}

async function stepFrame(page, frame, framesDir, timeoutMs, write, quadrants) {
  await setQuadrant(page, '');
  const state = await page.evaluate((ms) => {
    window.__promoClock.seek(ms);
    return { ended: window.__promoExportEnded === true };
  }, frameMs(frame));
  if (!write) return { ended: state.ended, timedOut: false };
  const written = await writeFrame(page, frame, framesDir, timeoutMs, quadrants);
  return { ended: state.ended, timedOut: written.timedOut, file: written.file };
}

function frameIsTorn(file) {
  const raw = execFileSync(process.env.FFMPEG || 'ffmpeg', [
    '-v', 'error', '-i', file, '-vf', 'scale=80:45', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-',
  ], { maxBuffer: 200_000 });
  const width = 80;
  const band = (y0, y1) => {
    let orange = 0;
    let white = 0;
    let total = 0;
    for (let y = y0; y < y1; y += 1) {
      for (let x = 0; x < width; x += 2) {
        const offset = (y * width + x) * 3;
        const red = raw[offset];
        const green = raw[offset + 1];
        const blue = raw[offset + 2];
        total += 1;
        if (Math.abs(red - 249) + Math.abs(green - 163) + Math.abs(blue - 83) < 60) orange += 1;
        else if (red > 240 && green > 240 && blue > 240) white += 1;
      }
    }
    return { orange: orange / total, white: white / total };
  };
  const top = band(0, 14);
  const bottom = band(31, 45);
  return top.orange > 0.65 && bottom.orange < 0.25 && bottom.white > 0.28;
}

async function exportRange(browser, options, framesDir) {
  fs.mkdirSync(framesDir, { recursive: true });
  const { context, page } = await bootPage(browser, options);
  const from = options.from;
  const limit = options.to == null ? FRAME_CAP : options.to;
  const timeouts = [];
  let last = -1;
  let endedEarly = false;
  let markerRows = [];
  let audioCues = [];
  let sfxRows = [];
  let unfinished = null;

  try {
    for (let frame = 0; frame <= limit; frame += 1) {
      let captured;
      try {
        captured = await stepFrame(
          page,
          frame,
          framesDir,
          options.timeoutMs,
          frame >= from,
          options.quadrants || 1,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes('is not finished')) throw error;
        unfinished = { frame, message };
        break;
      }
      if (frame >= from && captured.file && frameIsTorn(captured.file)) {
        fs.unlinkSync(captured.file);
        throw new Error(`Frame ${frame} is torn: the orange field is split. Stopped so no more frames are written.`);
      }
      if (frame >= from) {
        last = frame;
        if (captured.timedOut) timeouts.push(frame);
        if ((frame - from) % 15 === 0 || captured.ended) {
          process.stdout.write(`frame ${frame} ${timecode(frame)}\n`);
        }
      }
      if (captured.ended) {
        endedEarly = frame < limit;
        break;
      }
    }
    if (!unfinished) markerRows = await page.evaluate(() => window.__promoVoTimeline || []);
    if (!unfinished) sfxRows = await page.evaluate(() => window.__promoSfxTimeline || []);
    if (!unfinished) {
      audioCues = await page.evaluate(() => (window.__promoAudioCues || []).map((cue) => ({
        src: cue.src,
        atMs: cue.atMs,
        fromSec: cue.fromSec,
        endMs: cue.endMs == null ? window.__promoClock.now() : cue.endMs,
        fadeIn: cue.fadeIn,
        fadeOut: cue.fadeOut,
      })));
    }
  } finally {
    await context.close();
  }

  if (unfinished) {
    return {
      from,
      last,
      timeouts,
      rerendered: [],
      stillTimedOut: [],
      endedEarly: false,
      unfinished,
      markers: [],
    };
  }

  const rerendered = [];
  const stillTimedOut = [];
  for (const frame of timeouts) {
    process.stdout.write(`re-render frame ${frame}\n`);
    const again = await bootPage(browser, options);
    let still = false;
    try {
      for (let index = 0; index <= frame; index += 1) {
        await again.page.evaluate((ms) => {
          window.__promoClock.seek(ms);
        }, frameMs(index));
      }
      const result = await again.page.evaluate((timeout) => {
        return window.__promoClock.settle(timeout);
      }, options.timeoutMs * 2);
      still = Boolean(result.timedOut);
      await writeFrame(again.page, frame, framesDir, options.timeoutMs, options.quadrants || 1);
    } finally {
      await again.context.close();
    }
    rerendered.push(frame);
    if (still) stillTimedOut.push(frame);
  }

  return {
    from,
    last,
    timeouts,
    rerendered,
    stillTimedOut,
    endedEarly,
    audioCues,
    // Picture events the sound design follows (film-engine.js promoSfx).
    sfx: sfxRows.map((row) => ({ ...row, frame: Math.max(0, Math.round((row.at / 1000) * exportFps)) })),
    markers: markerRows.map((row) => {
      const frame = Math.max(0, Math.round((row.at / 1000) * exportFps));
      return {
        scene: row.scene,
        id: row.id,
        line: row.line,
        ms: row.at,
        frame,
        timecode: timecode(frame),
      };
    }),
  };
}

// Store clips play with their own sound in the film. Each cue is a stretch
// of one clip: film time atMs..endMs, starting fromSec into the file.
function audioCueArgs(cues, startNumber) {
  const offsetMs = (startNumber / exportFps) * 1000;
  const usable = (cues || [])
    .map((cue) => ({ ...cue, file: path.join(ROOT, 'public', decodeURI(String(cue.src || '').replace(/^\//, ''))) }))
    .filter((cue) => cue.src && cue.endMs > cue.atMs && cue.atMs >= offsetMs && fs.existsSync(cue.file));
  if (!usable.length) return null;
  const inputs = [];
  const chains = [];
  usable.forEach((cue, index) => {
    const seconds = ((cue.endMs - cue.atMs) / 1000).toFixed(3);
    inputs.push('-ss', String(cue.fromSec), '-t', seconds, '-i', cue.file);
    const delay = Math.max(0, Math.round(cue.atMs - offsetMs));
    const fadeIn = cue.fadeIn ?? 0.15; const fadeOut = cue.fadeOut ?? 0.25;   // a clipped quick-store line fades out short
    chains.push(`[${index + 1}:a]afade=t=in:d=${fadeIn},afade=t=out:st=${Math.max(0, seconds - fadeOut).toFixed(3)}:d=${fadeOut},adelay=${delay}|${delay}[a${index}]`);
  });
  const mix = `${usable.map((_, index) => `[a${index}]`).join('')}amix=inputs=${usable.length}:normalize=0[aout]`;
  return { inputs, filter: `${chains.join(';')};${mix}` };
}

function encodeVideo(framesDir, dest, codec, startNumber, audioCues) {
  const input = path.join(framesDir, 'frame-%06d.png');
  const args = ['-y', '-framerate', String(exportFps), '-start_number', String(startNumber), '-i', input];
  const audio = audioCueArgs(audioCues, startNumber);
  if (audio) args.push(...audio.inputs, '-filter_complex', audio.filter, '-map', '0:v', '-map', '[aout]');
  if (codec === 'prores') {
    args.push('-c:v', 'prores_ks', '-profile:v', '4', '-pix_fmt', 'yuv444p10le');
  } else if (codec === 'h264') {
    // visually lossless and ~10x smaller than ffv1 at 4K (the master fits on a nearly full disk)
    args.push('-c:v', 'libx264', '-crf', '12', '-preset', 'slow', '-tune', 'film', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-g', '30');
  } else {
    args.push('-c:v', 'ffv1', '-level', '3', '-pix_fmt', 'rgb24', '-g', '1');
  }
  if (audio) args.push('-c:a', 'pcm_s16le', '-ar', '48000');
  else args.push('-an');
  args.push(dest);
  return new Promise((resolve, reject) => {
    const child = spawn(process.env.FFMPEG || 'ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    child.stderr.on('data', (chunk) => { err += chunk.toString(); });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(err.split('\n').slice(-12).join('\n')));
    });
  });
}

// --stream: one h264 encoder fed PNG frames in order through a pipe; each frame
// is dropped from disk once the encoder has it (the run never holds the film)
function openStream(dest) {
  const child = spawn(process.env.FFMPEG || 'ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(exportFps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-crf', '12', '-preset', 'slow', '-tune', 'film', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-g', '30', '-an', dest],
  { stdio: ['pipe', 'ignore', 'pipe'] });
  let err = '';
  child.stderr.on('data', (chunk) => { err += chunk.toString(); if (err.length > 20000) err = err.slice(-8000); });
  const done = new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(err.split('\n').slice(-12).join('\n')))));
  });
  let next = null;
  const write = (buf) => new Promise((resolve) => { if (child.stdin.write(buf)) resolve(); else child.stdin.once('drain', resolve); });
  return {
    async feed(framesDir, from, to) {
      if (next === null) next = from;
      for (let frame = Math.max(next, from); frame <= to; frame += 1) {
        const file = path.join(framesDir, `frame-${String(frame).padStart(6, '0')}.png`);
        if (!fs.existsSync(file)) throw new Error(`--stream: frame ${frame} is missing`);
        await write(fs.readFileSync(file));
        fs.rmSync(file, { force: true });
        next = frame + 1;
      }
      process.stdout.write(`streamed frames ${from} to ${to}\n`);
    },
    async close() { child.stdin.end(); await done; },
  };
}

function hashFile(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function compareFrames(leftDir, rightDir) {
  const left = fs.readdirSync(leftDir).filter((name) => name.endsWith('.png')).sort();
  const right = fs.readdirSync(rightDir).filter((name) => name.endsWith('.png')).sort();
  const mismatches = [];
  if (left.length !== right.length || left.some((name, index) => name !== right[index])) {
    mismatches.push(`frame lists differ (${left.length} vs ${right.length})`);
  }
  const shared = left.filter((name) => right.includes(name));
  shared.forEach((name) => {
    const a = hashFile(path.join(leftDir, name));
    const b = hashFile(path.join(rightDir, name));
    if (a !== b) mismatches.push(name);
  });
  return { count: shared.length, mismatches };
}

function printReport(report) {
  const count = report.last >= report.from ? report.last - report.from + 1 : 0;
  const seconds = count / exportFps;
  process.stdout.write('\n');
  process.stdout.write(`Frames: ${count}\n`);
  process.stdout.write(`Duration: ${seconds.toFixed(3)} s (${timecode(count)})\n`);
  process.stdout.write(`Range: ${report.from} to ${report.last} at ${report.width}x${report.height}\n`);
  process.stdout.write(`Video: ${report.video}\n`);
  process.stdout.write(`Frames folder: ${report.framesDir}\n`);
  if (!report.timeouts.length) process.stdout.write('Settling timeouts: none\n');
  else {
    process.stdout.write(`Settling timeouts: ${report.timeouts.join(', ')}\n`);
    process.stdout.write(`Re-rendered: ${report.rerendered.join(', ') || 'none'}\n`);
    process.stdout.write(`Still timed out: ${report.stillTimedOut.join(', ') || 'none'}\n`);
  }
  process.stdout.write('Markers:\n');
  if (!report.markers.length) process.stdout.write('  (none in this range)\n');
  report.markers.forEach((marker) => {
    process.stdout.write(`  ${marker.timecode}  f${String(marker.frame).padStart(4, '0')}  ${marker.id}  ${marker.line}\n`);
  });
  if (report.verify) {
    if (report.verify.mismatches.length) {
      process.stdout.write(`Determinism: ${report.verify.mismatches.length} mismatch(es)\n`);
      report.verify.mismatches.slice(0, 12).forEach((name) => process.stdout.write(`  ${name}\n`));
    } else {
      process.stdout.write(`Determinism: ${report.verify.count} frames identical\n`);
    }
  }
}

function firstGap(framesDir) {
  let frame = 0;
  while (fs.existsSync(path.join(framesDir, `frame-${String(frame).padStart(6, '0')}.png`))) frame += 1;
  return frame;
}

async function captureFilm(chromium, options, framesDir) {
  fs.mkdirSync(framesDir, { recursive: true });
  let browser = await launchBrowser(chromium, options.scale, (options.quadrants || 1) > 1, options.beginFrame);
  let cursor = options.from;
  const hardEnd = options.to;
  let unfinishedRetries = 0;
  const merged = {
    from: options.from,
    last: cursor - 1,
    timeouts: [],
    rerendered: [],
    stillTimedOut: [],
    markers: [],
    audioCues: [],
    sfx: [],
    endedEarly: false,
  };
  try {
    while (cursor <= FRAME_CAP) {
      const chunk = options.stream ? STREAM_CHUNK : CAPTURE_CHUNK;
      const chunkEnd = options.scale > 1
        ? Math.min(hardEnd ?? FRAME_CAP, cursor + chunk - 1)
        : (hardEnd ?? FRAME_CAP);
      if (options.scale > 1) process.stdout.write(`capture ${cursor} to ${chunkEnd}\n`);
      const exported = await exportRange(browser, { ...options, from: cursor, to: chunkEnd }, framesDir);
      if (exported.unfinished) {
        unfinishedRetries += 1;
        if (unfinishedRetries > 8) throw new Error(exported.unfinished.message);
        process.stdout.write(`${exported.unfinished.message} Retrying that frame in a fresh browser.\n`);
        await browser.close();
        browser = await launchBrowser(chromium, options.scale, (options.quadrants || 1) > 1, options.beginFrame);
        cursor = exported.unfinished.frame;
        continue;
      }
      unfinishedRetries = 0;
      if (exported.last >= cursor) {
        merged.last = exported.last;
        merged.timeouts.push(...exported.timeouts);
        merged.rerendered.push(...exported.rerendered);
        merged.stillTimedOut.push(...exported.stillTimedOut);
        merged.markers = exported.markers;
        merged.audioCues = exported.audioCues || [];
        merged.sfx = exported.sfx || [];
        merged.endedEarly = exported.endedEarly;
        if (options.stream) await options.stream.feed(framesDir, cursor, exported.last);
      }
      const reachedEnd = exported.endedEarly
        || exported.last < cursor
        || exported.last >= (hardEnd ?? FRAME_CAP)
        || options.scale <= 1;
      if (reachedEnd) break;
      cursor = exported.last + 1;
      await browser.close();
      browser = await launchBrowser(chromium, options.scale, (options.quadrants || 1) > 1, options.beginFrame);
    }
  } finally {
    await browser.close();
  }
  return merged;
}

async function main() {
  if (hasFlag('help')) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  const cta = (arg('cta', 'install') || 'install').trim().toLowerCase();
  const part = (arg('part', 'full') || 'full').trim().toLowerCase();
  const codec = (arg('codec', 'ffv1') || 'ffv1').trim().toLowerCase();
  const preview = hasFlag('preview');
  const resolution = preview
    ? { width: 960, height: 540 }
    : parseResolution(arg('resolution', '1920x1080'));
  captureAttempts = preview ? 1 : CAPTURE_ATTEMPTS;
  exportFps = preview ? 6 : FPS;
  const capture = preview
    ? { viewportWidth: 1920, viewportHeight: 1080, scale: 0.5, quadrants: 1, beginFrame: false }
    : captureSetup(resolution.width, resolution.height);
  const range = parseFrames(arg('frames', ''));
  const verify = hasFlag('verify');
  const resume = hasFlag('resume') && !verify;
  const outRoot = path.resolve(ROOT, arg('out', preview ? 'tmp/ad-1-preview' : 'tmp/ad-1-export'));
  const options = {
    cta,
    part,
    codec,
    width: resolution.width,
    height: resolution.height,
    viewportWidth: capture.viewportWidth,
    viewportHeight: capture.viewportHeight,
    scale: capture.scale,
    quadrants: capture.quadrants,
    beginFrame: capture.beginFrame,
    from: range ? range.from : 0,
    to: range ? range.to : null,
    url: arg('url', 'http://127.0.0.1:8080/'),
    timeoutMs: 4000,
    preview,
  };
  if (!['demo', 'ea', 'install', 'none'].includes(cta)) throw new Error(`Unknown cta "${cta}".`);
  if (!['full', 'pain', 'pitch', 'sync', 'reel', 'cta', 'climax-pain', 'climax-pitch'].includes(part)) throw new Error(`Unknown part "${part}".`);
  if (!['ffv1', 'prores', 'h264'].includes(codec)) throw new Error(`Unknown codec "${codec}".`);
  if (options.beginFrame) {
    process.stdout.write('Capture: HeadlessExperimental.beginFrame, one composited frame at a time.\n');
  } else if ((options.quadrants || 1) > 1) {
    process.stdout.write('Capture: four 1920x1080 quadrants stitched to 4K. BeginFrameControl is not supported on macOS.\n');
  }

  const { chromium } = await loadPlaywright();
  const run = async (folder) => {
      const framesDir = path.join(folder, 'frames');
      if (!resume) fs.rmSync(folder, { recursive: true, force: true });
      fs.mkdirSync(framesDir, { recursive: true });
      if (resume && !range) options.from = firstGap(framesDir);
      const ext = codec === 'prores' ? 'mov' : 'mkv';
      const video = path.join(folder, `ad-1-${part}-${cta}-${options.width}x${options.height}.${ext}`);
      if (hasFlag('stream')) {
        if (codec !== 'h264') throw new Error('--stream needs --codec h264');
        options.stream = openStream(video);
      }
      const exported = await captureFilm(chromium, options, framesDir);
      const sequenceFrom = options.stream ? options.from : (resume && fs.existsSync(path.join(framesDir, 'frame-000000.png')) ? 0 : options.from);
      const visible = exported.markers.filter((marker) => marker.frame >= sequenceFrom && marker.frame <= exported.last);
      if (options.stream) await options.stream.close();
      else if (exported.last >= sequenceFrom) {
        await encodeVideo(framesDir, video, codec, sequenceFrom, exported.audioCues);
      }
      const count = exported.last >= sequenceFrom ? exported.last - sequenceFrom + 1 : 0;
      const report = {
        fps: exportFps,
        cta,
        part,
        codec,
        width: options.width,
        height: options.height,
        from: sequenceFrom,
        last: exported.last,
        frames: count,
        durationSeconds: count / exportFps,
        timeouts: exported.timeouts,
        rerendered: exported.rerendered,
        stillTimedOut: exported.stillTimedOut,
        markers: visible,
        video,
        framesDir,
      };
      fs.writeFileSync(path.join(folder, 'markers.json'), `${JSON.stringify({
        fps: exportFps,
        cta,
        part,
        resolution: `${options.width}x${options.height}`,
        markers: visible,
        // Every recorded line in the film (narrator, clerk, shopper), in film ms.
        voice: (exported.audioCues || []).map((cue) => ({ src: cue.src, atMs: Math.round(cue.atMs), endMs: Math.round(cue.endMs), fromSec: cue.fromSec || 0, ...(cue.fadeOut != null ? { fadeIn: cue.fadeIn, fadeOut: cue.fadeOut } : {}) })),
        sfx: exported.sfx || [],
      }, null, 2)}\n`);
      fs.writeFileSync(path.join(folder, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
      return report;
    };

    if (!verify) {
      const report = await run(outRoot);
      printReport(report);
      return;
    }

    const first = await run(path.join(outRoot, 'run-a'));
    const second = await run(path.join(outRoot, 'run-b'));
    const compared = compareFrames(first.framesDir, second.framesDir);
    first.verify = compared;
    printReport(first);
    if (compared.mismatches.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
