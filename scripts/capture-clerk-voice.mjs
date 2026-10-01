#!/usr/bin/env node
// Records the live Bizmis agent saying each line in public/promo/voice/lines.json,
// through the real widget and backend, for the ad-1 film. Each line is sent as a
// hidden "Say this" message; the agent's audio chunks and their alignment are
// tapped from the widget's websocket and saved as <id>.wav plus <id>.json
// (characters with start and duration in ms, from the start of the file).
//
//   node scripts/capture-clerk-voice.mjs [--only id1,id2] [--url http://127.0.0.1:8080/]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VOICE_DIR = path.join(ROOT, 'public', 'promo', 'voice');
const arg = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`);
  return index > 0 && index + 1 < process.argv.length ? process.argv[index + 1] : fallback;
};
const base = arg('url', 'http://127.0.0.1:8080/');
const only = (arg('only', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const lines = JSON.parse(fs.readFileSync(path.join(VOICE_DIR, 'lines.json'), 'utf8'))
  .filter((line) => !only.length || only.includes(line.id));

const SILENCE_DONE_MS = 1800;
const LINE_TIMEOUT_MS = 30000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function wav(samples, rate) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((value, index) => data.writeInt16LE(value, index * 2));
  const head = Buffer.alloc(44);
  head.write('RIFF', 0);
  head.writeUInt32LE(36 + data.length, 4);
  head.write('WAVE', 8);
  head.write('fmt ', 12);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(1, 22);
  head.writeUInt32LE(rate, 24);
  head.writeUInt32LE(rate * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write('data', 36);
  head.writeUInt32LE(data.length, 40);
  return Buffer.concat([head, data]);
}

function readAlignment(raw) {
  if (!raw) return null;
  const chars = raw.chars || [];
  const starts = raw.char_start_times_ms || raw.charStartTimesMs || [];
  const durs = raw.char_durations_ms || raw.charDurationsMs || [];
  return chars.map((char, index) => ({ char, startMs: starts[index] || 0, durMs: durs[index] || 0 }));
}

// Joins the chunks of one line: PCM back to back, alignment shifted by the
// running length of the audio before each chunk.
function assemble(chunks, rate) {
  const samples = [];
  const chars = [];
  for (const chunk of chunks) {
    const offsetMs = (samples.length / rate) * 1000;
    const bytes = Buffer.from(chunk.audio, 'base64');
    for (let index = 0; index + 1 < bytes.length; index += 2) samples.push(bytes.readInt16LE(index));
    (readAlignment(chunk.alignment) || []).forEach((entry) => {
      chars.push({ char: entry.char, startMs: Math.round(offsetMs + entry.startMs), durMs: Math.round(entry.durMs) });
    });
  }
  return { samples, chars, durationMs: Math.round((samples.length / rate) * 1000) };
}

// Trims silence at both ends (keeps a short tail), and shifts the alignment.
function trim(clip, rate) {
  const threshold = 300;
  let first = clip.samples.findIndex((value) => Math.abs(value) > threshold);
  if (first < 0) return clip;
  let last = clip.samples.length - 1;
  while (last > first && Math.abs(clip.samples[last]) <= threshold) last -= 1;
  first = Math.max(0, first - Math.round(rate * 0.04));
  last = Math.min(clip.samples.length - 1, last + Math.round(rate * 0.12));
  const shiftMs = (first / rate) * 1000;
  const samples = clip.samples.slice(first, last + 1);
  return {
    samples,
    chars: clip.chars.map((entry) => ({ ...entry, startMs: Math.max(0, Math.round(entry.startMs - shiftMs)) })),
    durationMs: Math.round((samples.length / rate) * 1000),
  };
}

const { chromium } = await import('/Users/toruhiyo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs');
const browser = await chromium.launch({
  headless: true,
  channel: 'chrome',
  args: ['--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(new URL('/promo/voice-capture.html', base).toString(), { waitUntil: 'domcontentloaded' });
const composer = page.locator('#bizmis-avatar-embed textarea, #bizmis-avatar-embed input[type="text"], .bizmis-viewport-portal-root textarea').first();
await composer.waitFor({ state: 'visible', timeout: 60000 });
await composer.click();
await page.keyboard.type('Hi');
await page.keyboard.press('Enter');

// Wait out the greeting and the reply to "Hi".
const quietFor = async (ms, timeout) => {
  const started = Date.now();
  let seen = await page.evaluate(() => window.__voice.chunks.length);
  let changedAt = Date.now();
  while (Date.now() - started < timeout) {
    await sleep(250);
    const now = await page.evaluate(() => window.__voice.chunks.length);
    if (now !== seen) {
      seen = now;
      changedAt = Date.now();
    } else if (seen > 0 && Date.now() - changedAt > ms) {
      return true;
    }
  }
  return false;
};
await quietFor(2500, 45000);
const meta = await page.evaluate(() => window.__voice.status.at(-1)?.meta || {});
const format = String(meta.agent_output_audio_format || 'pcm_16000');
const rate = Number((format.match(/pcm_(\d+)/) || [])[1]) || 16000;
process.stdout.write(`agent audio ${format}\n`);

fs.mkdirSync(VOICE_DIR, { recursive: true });
for (const line of lines) {
  const from = await page.evaluate(() => window.__voice.chunks.length);
  const sent = await page.evaluate((text) => window.AvatarVoicechat.sendHiddenMessage(`Say this exactly, nothing else: "${text}"`), line.text);
  if (!sent) throw new Error('sendHiddenMessage refused: is debug mode on?');
  const started = Date.now();
  while (Date.now() - started < LINE_TIMEOUT_MS) {
    await sleep(200);
    if ((await page.evaluate(() => window.__voice.chunks.length)) > from) break;
  }
  await quietFor(SILENCE_DONE_MS, LINE_TIMEOUT_MS);
  const chunks = await page.evaluate((index) => window.__voice.chunks.slice(index), from);
  if (!chunks.length) {
    process.stdout.write(`${line.id}: NO AUDIO\n`);
    continue;
  }
  const clip = trim(assemble(chunks, rate), rate);
  const said = clip.chars.map((entry) => entry.char).join('').replace(/\s+/g, ' ').trim();
  fs.writeFileSync(path.join(VOICE_DIR, `${line.id}.wav`), wav(clip.samples, rate));
  fs.writeFileSync(path.join(VOICE_DIR, `${line.id}.json`), `${JSON.stringify({ id: line.id, text: line.text, said, durationMs: clip.durationMs, chars: clip.chars })}\n`);
  process.stdout.write(`${line.id}: ${clip.durationMs}ms "${said}"\n`);
  await sleep(600);
}
await browser.close();
