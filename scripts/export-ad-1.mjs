#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const FPS = 30;
const FRAME_CAP = 3600;
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
    '  --cta demo|ea|install|none     default demo',
    '  --part full|pain|pitch         default full',
    '  --resolution 1920x1080         or 3840x2160',
    '  --frames 0-59                  inclusive range, default the whole film',
    '  --codec ffv1|prores            default ffv1 (MKV). prores is ProRes 4444',
    '  --out <folder>                 default tmp/ad-1-export',
    '  --url http://127.0.0.1:8080/   dev server',
    '  --verify                       export the range twice and compare frames',
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

async function launchBrowser(chromium, scale) {
  return chromium.launch({
    headless: true,
    channel: process.env.PROMO_FRAMES_CHANNEL || 'chrome',
    args: [
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
      '--disable-gpu-rasterization',
      '--disable-features=PaintHolding',
      '--run-all-compositor-stages-before-draw',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-webgl',
    ],
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

async function main() {
  if (hasFlag('help')) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  const cta = (arg('cta', 'demo') || 'demo').trim().toLowerCase();
  const part = (arg('part', 'full') || 'full').trim().toLowerCase();
  const codec = (arg('codec', 'ffv1') || 'ffv1').trim().toLowerCase();
  const resolution = parseResolution(arg('resolution', '1920x1080'));
  const capture = captureSetup(resolution.width, resolution.height);
  const range = parseFrames(arg('frames', ''));
  const verify = hasFlag('verify');
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
  const browser = await launchBrowser(chromium, capture.scale);
  try {
    const run = async (folder) => {
      const framesDir = path.join(folder, 'frames');
      fs.rmSync(folder, { recursive: true, force: true });
      const exported = await exportRange(browser, options, framesDir);
      const visible = exported.markers.filter((marker) => marker.frame >= options.from && marker.frame <= exported.last);
      const ext = codec === 'prores' ? 'mov' : 'mkv';
      const video = path.join(folder, `ad-1-${part}-${cta}-${options.width}x${options.height}.${ext}`);
      if (exported.last >= options.from) {
        await encodeVideo(framesDir, video, codec, options.from);
      }
      const report = {
        fps: FPS,
        cta,
        part,
        codec,
        width: options.width,
        height: options.height,
        from: options.from,
        last: exported.last,
        frames: exported.last >= options.from ? exported.last - options.from + 1 : 0,
        durationSeconds: exported.last >= options.from ? (exported.last - options.from + 1) / FPS : 0,
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
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
