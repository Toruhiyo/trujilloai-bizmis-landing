#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const FPS = 30;
const FRAME_CAP = 3600;
const CAPTURE_CHUNK = 180;
const LAYOUT_WIDTH = 1920;
const LAYOUT_HEIGHT = 1080;
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
    '  --part full|pain|pitch         default full',
    '  --resolution 1920x1080         or 3840x2160',
    '  --frames 0-59                  inclusive range, default the whole film',
    '  --codec ffv1|prores            default ffv1 (MKV). prores is ProRes 4444',
    '  --out <folder>                 default tmp/ad-1-export',
    '  --url http://127.0.0.1:8080/   dev server',
    '  --verify                       export the range twice and compare frames',
    '  --resume                       keep frames already in --out and continue',
  ].join('\n');
}

function parseResolution(raw) {
  const match = /^(\d+)x(\d+)$/.exec(String(raw || '').trim());
  if (!match) throw new Error(`Resolution must look like 1920x1080. Got "${raw}".`);
  return { width: Number(match[1]), height: Number(match[2]) };
}

function captureSetup(width, height) {
  const scaleX = width / LAYOUT_WIDTH;
  const scaleY = height / LAYOUT_HEIGHT;
  const sameScale = scaleX === scaleY && Number.isInteger(scaleX) && scaleX >= 1;
  if (sameScale) {
    return { viewportWidth: LAYOUT_WIDTH, viewportHeight: LAYOUT_HEIGHT, scale: scaleX };
  }
  return { viewportWidth: width, viewportHeight: height, scale: 1 };
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
  const ff = frame % FPS;
  const total = Math.floor(frame / FPS);
  const ss = total % 60;
  const mm = Math.floor(total / 60) % 60;
  const hh = Math.floor(total / 3600);
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

function frameMs(frame) {
  return (frame * 1000) / FPS;
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
  url.searchParams.delete('auto');
  return url.toString();
}

function chromeArgs(scale) {
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
  if (scale <= 1) args.push('--disable-gpu-rasterization');
  // 4K compositing drops whole tile rows, so the orange field splits and the sea shows through.
  if (scale > 1) args.push('--disable-gpu-compositing');
  return args;
}

async function launchBrowser(chromium, scale) {
  return chromium.launch({
    headless: true,
    channel: process.env.PROMO_FRAMES_CHANNEL || 'chrome',
    args: chromeArgs(scale),
  });
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
  page.setDefaultTimeout(90000);
  await page.goto(filmUrl(options.url, options.cta, options.part), { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.classList.contains('is-promo-ready'));
  await page.evaluate(async () => {
    const clock = window.__promoClock;
    if (!clock) throw new Error('Export clock did not install. Open the page with export=1.');
    clock.arm();
    window.AvatarVoicechat?.destroy?.('bizmis-avatar-embed');
    window.__promoMountWidget?.();
    if (typeof window.__promoExportBoot !== 'function') {
      throw new Error('Film export boot is missing.');
    }
    await clock.ready();
    clock.reseed();
    window.__promoExportBoot();
  });
  return { context, page };
}

async function stepFrame(page, frame, framesDir, timeoutMs, write) {
  const state = await page.evaluate((ms) => {
    window.__promoClock.seek(ms);
    return { ended: window.__promoExportEnded === true };
  }, frameMs(frame));
  if (!write) return { ended: state.ended, timedOut: false };

  let timedOut = false;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = await page.evaluate((timeout) => window.__promoClock.settle(timeout), timeoutMs);
    timedOut = Boolean(result.timedOut);
    if (!timedOut) break;
  }

  const file = path.join(framesDir, `frame-${String(frame).padStart(6, '0')}.png`);
  await page.screenshot({ path: file, type: 'png' });
  return { ended: state.ended, timedOut, file };
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

  try {
    for (let frame = 0; frame <= limit; frame += 1) {
      const captured = await stepFrame(page, frame, framesDir, options.timeoutMs, frame >= from);
      if (frame >= from && options.scale > 1 && captured.file && frameIsTorn(captured.file)) {
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
    markerRows = await page.evaluate(() => window.__promoVoTimeline || []);
  } finally {
    await context.close();
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
      const file = path.join(framesDir, `frame-${String(frame).padStart(6, '0')}.png`);
      await again.page.screenshot({ path: file, type: 'png' });
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
    markers: markerRows.map((row) => {
      const frame = Math.max(0, Math.round((row.at / 1000) * FPS));
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

function encodeVideo(framesDir, dest, codec, startNumber) {
  const input = path.join(framesDir, 'frame-%06d.png');
  const args = ['-y', '-framerate', String(FPS), '-start_number', String(startNumber), '-i', input];
  if (codec === 'prores') {
    args.push('-c:v', 'prores_ks', '-profile:v', '4', '-pix_fmt', 'yuv444p10le');
  } else {
    args.push('-c:v', 'ffv1', '-level', '3', '-pix_fmt', 'rgb24', '-g', '1');
  }
  args.push('-an', dest);
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
  const seconds = count / FPS;
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
  let browser = await launchBrowser(chromium, options.scale);
  let cursor = options.from;
  const hardEnd = options.to;
  const merged = {
    from: options.from,
    last: cursor - 1,
    timeouts: [],
    rerendered: [],
    stillTimedOut: [],
    markers: [],
    endedEarly: false,
  };
  try {
    while (cursor <= FRAME_CAP) {
      const chunkEnd = options.scale > 1
        ? Math.min(hardEnd ?? FRAME_CAP, cursor + CAPTURE_CHUNK - 1)
        : (hardEnd ?? FRAME_CAP);
      if (options.scale > 1) process.stdout.write(`capture ${cursor} to ${chunkEnd}\n`);
      const exported = await exportRange(browser, { ...options, from: cursor, to: chunkEnd }, framesDir);
      if (exported.last >= cursor) {
        merged.last = exported.last;
        merged.timeouts.push(...exported.timeouts);
        merged.rerendered.push(...exported.rerendered);
        merged.stillTimedOut.push(...exported.stillTimedOut);
        merged.markers = exported.markers;
        merged.endedEarly = exported.endedEarly;
      }
      const reachedEnd = exported.endedEarly
        || exported.last < cursor
        || exported.last >= (hardEnd ?? FRAME_CAP)
        || options.scale <= 1;
      if (reachedEnd) break;
      cursor = exported.last + 1;
      await browser.close();
      browser = await launchBrowser(chromium, options.scale);
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
  const resolution = parseResolution(arg('resolution', '1920x1080'));
  const capture = captureSetup(resolution.width, resolution.height);
  const range = parseFrames(arg('frames', ''));
  const verify = hasFlag('verify');
  const resume = hasFlag('resume') && !verify;
  const outRoot = path.resolve(ROOT, arg('out', 'tmp/ad-1-export'));
  const options = {
    cta,
    part,
    codec,
    width: resolution.width,
    height: resolution.height,
    viewportWidth: capture.viewportWidth,
    viewportHeight: capture.viewportHeight,
    scale: capture.scale,
    from: range ? range.from : 0,
    to: range ? range.to : null,
    url: arg('url', 'http://127.0.0.1:8080/'),
    timeoutMs: 4000,
  };
  if (!['demo', 'ea', 'install', 'none'].includes(cta)) throw new Error(`Unknown cta "${cta}".`);
  if (!['full', 'pain', 'pitch'].includes(part)) throw new Error(`Unknown part "${part}".`);
  if (!['ffv1', 'prores'].includes(codec)) throw new Error(`Unknown codec "${codec}".`);

  const { chromium } = await loadPlaywright();
  const run = async (folder) => {
      const framesDir = path.join(folder, 'frames');
      if (!resume) fs.rmSync(folder, { recursive: true, force: true });
      fs.mkdirSync(framesDir, { recursive: true });
      if (resume && !range) options.from = firstGap(framesDir);
      const exported = await captureFilm(chromium, options, framesDir);
      const sequenceFrom = resume && fs.existsSync(path.join(framesDir, 'frame-000000.png')) ? 0 : options.from;
      const visible = exported.markers.filter((marker) => marker.frame >= sequenceFrom && marker.frame <= exported.last);
      const ext = codec === 'prores' ? 'mov' : 'mkv';
      const video = path.join(folder, `ad-1-${part}-${cta}-${options.width}x${options.height}.${ext}`);
      if (exported.last >= sequenceFrom) {
        await encodeVideo(framesDir, video, codec, sequenceFrom);
      }
      const count = exported.last >= sequenceFrom ? exported.last - sequenceFrom + 1 : 0;
      const report = {
        fps: FPS,
        cta,
        part,
        codec,
        width: options.width,
        height: options.height,
        from: sequenceFrom,
        last: exported.last,
        frames: count,
        durationSeconds: count / FPS,
        timeouts: exported.timeouts,
        rerendered: exported.rerendered,
        stillTimedOut: exported.stillTimedOut,
        markers: visible,
        video,
        framesDir,
      };
      fs.writeFileSync(path.join(folder, 'markers.json'), `${JSON.stringify({
        fps: FPS,
        cta,
        part,
        resolution: `${options.width}x${options.height}`,
        markers: visible,
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
