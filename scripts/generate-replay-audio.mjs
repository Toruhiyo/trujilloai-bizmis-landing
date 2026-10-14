#!/usr/bin/env node
// Voices the Store Insights session replays (src/components/landing/replaySessions.ts)
// on ElevenLabs eleven_v4: every line is spoken by its avatar's own preset voice or
// the session's shopper voice (scripts/replay-audio-lines.json), checked with
// scribe_v1 speech-to-text (rejecting garbled takes and audible laughs or other
// audio events), trimmed, levelled and laid end to end with natural turn gaps into
// public/landing/replay-audio/<session>.mp3. The audio is never stretched: the
// replay is re-timed to it instead. The per-line cue times land in
// scripts/replay-audio-timings.json (copy them into replaySessions.ts), and the
// finished file is transcribed again to check every cue against the real audio.
//
//   node scripts/generate-replay-audio.mjs [--only sale,support-failed] [--retake sale:4,sale:5]
//                                          [--work <dir>] [--verify-only]
// Needs ELEVENLABS_API_KEY (env, or ../trujilloai-bizmis-project/.env) and ffmpeg.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LINES = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'replay-audio-lines.json'), 'utf8'));
const OUT_DIR = path.join(ROOT, 'public', 'landing', 'replay-audio');
const TIMINGS = path.join(ROOT, 'scripts', 'replay-audio-timings.json');
const SR = 44100;
const MODEL = 'eleven_v4';
const MAX_TAKES = 4;
const PASS_SIM = 0.9;

// turn-taking (seconds): the agent picks up a touch faster than the shopper does
const LEAD_IN = 0.45;
const TAIL = 0.7;
const GAP = { 'customer>agent': 0.2, 'agent>customer': 0.32, 'agent>agent': 0.3, 'customer>customer': 0.32 };
const EVENT_AFTER = 0.22;          // the tool fires right as the line that triggers it ends
const EVENT_HOLD = { agent: 0.85, customer: 1.05 }; // the result shows, then the next speaker goes on

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 && i + 1 < process.argv.length ? process.argv[i + 1] : '';
};
const list = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
const only = list(arg('only'));
const retake = new Set(list(arg('retake')));
const verifyOnly = process.argv.includes('--verify-only');
const WORK = path.resolve(arg('work') || path.join(os.tmpdir(), 'bizmis-replay-audio'));

function apiKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const env = path.join(ROOT, '..', 'trujilloai-bizmis-project', '.env');
  const line = fs.readFileSync(env, 'utf8').split('\n').find((l) => l.startsWith('ELEVENLABS_API_KEY='));
  if (!line) throw new Error('ELEVENLABS_API_KEY not found');
  return line.split('=').slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
}
const KEY = apiKey();

const spoken = (text) => text.replace(/\[[^\]]*\]\s*/g, '').trim();
const NUM = { two: '2', five: '5', seven: '7', twelve: '12', fifty: '50', 'seventy-five': '75', seventyfive: '75' };
const words = (s) => s.toLowerCase()
  .replace(/[$€]/g, ' ').replace(/\b(dollars?|euros?)\b/g, ' ')
  .replace(/seventy[\s-]five/g, '75').replace(/vs\.?/g, 'versus')
  .replace(/[^a-z0-9'\s-]/g, ' ').replace(/-/g, ' ')
  .split(/\s+/).filter(Boolean).map((w) => NUM[w] ?? w.replace(/'/g, ''));
function similarity(a, b) {
  const x = words(a), y = words(b);
  const dp = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
  for (let i = 1; i <= x.length; i++)
    for (let j = 1; j <= y.length; j++)
      dp[i][j] = x[i - 1] === y[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return (2 * dp[x.length][y.length]) / Math.max(1, x.length + y.length);
}

async function retry(fn, label) {
  for (let i = 0; ; i++) {
    try { return await fn(); } catch (e) {
      if (i >= 3) throw e;
      console.log(`  ${label}: ${e.message.slice(0, 160)}, retrying`);
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

async function tts(voice, text, previous, next) {
  const body = {
    text, model_id: MODEL, language_code: 'en',
    voice_settings: { stability: 0.45, similarity_boost: 0.8 },
    ...(previous ? { previous_text: previous } : {}), ...(next ? { next_text: next } : {}),
  };
  return retry(async () => {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_192`, {
      method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`TTS HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    return Buffer.from(await res.arrayBuffer());
  }, 'tts');
}

async function stt(file, diarize = false) {
  return retry(async () => {
    const form = new FormData();
    form.append('model_id', 'scribe_v1');
    form.append('language_code', 'en');
    form.append('tag_audio_events', 'true');
    form.append('timestamps_granularity', 'word');
    if (diarize) form.append('diarize', 'true');
    form.append('file', new Blob([fs.readFileSync(file)]), path.basename(file));
    const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': KEY }, body: form });
    if (!res.ok) throw new Error(`STT HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    return res.json();
  }, 'stt');
}

const decode = (file) => {
  const buf = execFileSync('ffmpeg', ['-loglevel', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4).slice();
};
const writeWav = (file, x) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', '-',
  '-c:a', 'pcm_s16le', file], { input: Buffer.from(x.buffer, x.byteOffset, x.byteLength) });

/** Cut the take to its speech (short pre-roll, a breath of tail) and level it. */
function trimAndLevel(x) {
  const F = Math.round(SR * 0.01);
  const rms = [];
  for (let i = 0; i + F <= x.length; i += F) {
    let s = 0; for (let j = i; j < i + F; j++) s += x[j] * x[j];
    rms.push(Math.sqrt(s / F));
  }
  const peak = Math.max(...rms);
  const on = rms.map((r) => r > peak * 0.06);
  const first = on.indexOf(true), last = on.lastIndexOf(true);
  const a = Math.max(0, (first - 4) * F), b = Math.min(x.length, (last + 14) * F);
  const y = x.slice(a, b);
  const active = rms.filter((r) => r > peak * 0.15);
  const level = Math.sqrt(active.reduce((s, r) => s + r * r, 0) / active.length);
  let gain = 0.1 / level; // ≈ -20 dBFS speech
  const p = y.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  if (p * gain > 0.95) gain = 0.95 / p;
  const fi = Math.round(SR * 0.012), fo = Math.round(SR * 0.08);
  for (let i = 0; i < y.length; i++) {
    let g = gain;
    if (i < fi) g *= i / fi;
    if (i > y.length - fo) g *= (y.length - i) / fo;
    y[i] *= g;
  }
  return { y, offset: a / SR };
}

async function voiceLine(session, line, index) {
  const dir = path.join(WORK, session.id);
  fs.mkdirSync(dir, { recursive: true });
  const choiceFile = path.join(dir, `${line.id}.choice.json`);
  const key = `${session.id}:${line.id}`;
  if (fs.existsSync(choiceFile) && !retake.has(key)) {
    const c = JSON.parse(fs.readFileSync(choiceFile, 'utf8'));
    if (c.text === line.text) return c;
  }
  const voice = LINES.voices[line.role === 'agent' ? session.agent : session.customer].id;
  const said = session.lines.filter((l) => l.role !== 'event');
  const k = said.indexOf(line);
  const previous = said.slice(Math.max(0, k - 2), k).map((l) => spoken(l.text)).join(' ');
  const next = said[k + 1] ? spoken(said[k + 1].text) : '';
  const existing = fs.readdirSync(dir).filter((f) => f.startsWith(`${line.id}-take`) && f.endsWith('.wav')).length;
  let best = null;
  for (let t = existing + 1; t <= existing + MAX_TAKES; t++) {
    const base = path.join(dir, `${line.id}-take${t}`);
    fs.writeFileSync(`${base}.mp3`, await tts(voice, line.text, previous, next));
    const { y } = trimAndLevel(decode(`${base}.mp3`));
    writeWav(`${base}.wav`, y);
    const r = await stt(`${base}.wav`);
    const events = (r.words || []).filter((w) => w.type === 'audio_event').map((w) => w.text);
    const ws = (r.words || []).filter((w) => w.type === 'word');
    const sim = similarity(spoken(line.text), r.text || '');
    const take = { text: line.text, take: t, wav: `${base}.wav`, duration: y.length / SR, sim, events, heard: r.text,
      firstWord: ws[0]?.start ?? 0, lastWord: ws.at(-1)?.end ?? y.length / SR };
    console.log(`  ${key} take ${t}: ${take.duration.toFixed(2)}s sim ${sim.toFixed(3)}${events.length ? ` events ${events.join(' ')}` : ''}`);
    if (!events.length && (!best || sim > best.sim)) best = take;
    if (!events.length && sim >= PASS_SIM) break;
  }
  if (!best) throw new Error(`${key}: every take had audio events`);
  if (best.sim < PASS_SIM) console.log(`  !! ${key}: best take only ${best.sim.toFixed(3)} (heard "${best.heard}")`);
  fs.writeFileSync(choiceFile, JSON.stringify(best, null, 1));
  return best;
}

function encode(x, file) {
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', '-',
    '-c:a', 'libmp3lame', '-b:a', '64k', '-ac', '1', '-ar', String(SR), file], { input: Buffer.from(x.buffer, x.byteOffset, x.byteLength) });
}

/** Transcribe the finished file and find where each line really starts. */
async function verify(session, timing) {
  const r = await stt(path.join(OUT_DIR, `${session.id}.mp3`), true);
  const heard = (r.words || []).filter((w) => w.type === 'word').map((w) => ({ ...w, n: words(w.text)[0] }));
  const events = (r.words || []).filter((w) => w.type === 'audio_event').map((w) => `${w.text}@${w.start}`);
  let cursor = 0;
  const report = [];
  for (const line of session.lines) {
    if (line.role === 'event') continue;
    const target = words(spoken(line.text)).slice(0, 3);
    let found = -1;
    for (let i = cursor; i < heard.length && found < 0; i++)
      if (target.every((w, j) => heard[i + j]?.n === w) || (heard[i].n === target[0] && Math.abs(heard[i].start - timing.at[line.id]) < 1)) found = i;
    const start = found >= 0 ? heard[found].start : NaN;
    if (found >= 0) cursor = found + 1;
    report.push({ id: line.id, cue: timing.at[line.id], heard: start, delta: +(start - timing.at[line.id]).toFixed(3), speaker: heard[found]?.speaker_id });
  }
  return { report, events };
}

const timings = fs.existsSync(TIMINGS) ? JSON.parse(fs.readFileSync(TIMINGS, 'utf8')) : {};
fs.mkdirSync(OUT_DIR, { recursive: true });
for (const session of LINES.sessions) {
  if (only.length && !only.includes(session.id)) continue;
  console.log(session.id);
  if (!verifyOnly) {
    const parts = [];
    let t = LEAD_IN, prevRole = null, prevEnd = LEAD_IN, hold = 0;
    const at = {}, lines = {};
    for (const [index, line] of session.lines.entries()) {
      if (line.role === 'event') {
        const ev = +(prevEnd + EVENT_AFTER).toFixed(2);
        at[line.id] = ev;
        const next = session.lines.slice(index + 1).find((l) => l.role !== 'event');
        hold = ev + EVENT_HOLD[next?.role ?? 'agent'];
        continue;
      }
      const take = await voiceLine(session, line, index);
      const start = prevRole ? Math.max(prevEnd + GAP[`${prevRole}>${line.role}`], hold) : LEAD_IN;
      parts.push({ start, wav: take.wav });
      at[line.id] = +(start + Math.max(0, take.firstWord - 0.04)).toFixed(2);
      lines[line.id] = { role: line.role, text: spoken(line.text), take: take.take, sim: +take.sim.toFixed(3), duration: +take.duration.toFixed(2) };
      prevEnd = start + take.duration;
      prevRole = line.role;
      hold = 0;
      t = prevEnd;
    }
    const duration = +(t + TAIL).toFixed(2);
    const mix = new Float32Array(Math.ceil(duration * SR));
    for (const p of parts) {
      const y = decode(p.wav);
      mix.set(y.subarray(0, mix.length - Math.round(p.start * SR)), Math.round(p.start * SR));
    }
    encode(mix, path.join(OUT_DIR, `${session.id}.mp3`));
    // the replay's waveform: 40 bars of the call's real loudness (quiet turns show as low bars)
    const BARS = 40, per = Math.floor(mix.length / BARS);
    const env = Array.from({ length: BARS }, (_, b) => {
      let s = 0; for (let i = b * per; i < (b + 1) * per; i++) s += mix[i] * mix[i];
      return Math.sqrt(s / per);
    });
    const top = Math.max(...env);
    const wave = env.map((e) => Math.round(18 + 82 * Math.min(1, e / top)));
    timings[session.id] = { duration, at, wave, lines };
  }
  const v = await verify(session, timings[session.id]);
  timings[session.id].verify = v.report;
  const worst = Math.max(...v.report.map((r) => Math.abs(r.delta) || 99));
  const size = fs.statSync(path.join(OUT_DIR, `${session.id}.mp3`)).size;
  console.log(`  ${session.id}: ${timings[session.id].duration}s, ${(size / 1024).toFixed(0)} KB, worst cue drift ${worst.toFixed(2)}s${v.events.length ? `, audio events: ${v.events.join(' ')}` : ''}`);
  for (const r of v.report) console.log(`    ${r.id.padStart(2)} cue ${r.cue.toFixed(2)} heard ${Number.isNaN(r.heard) ? '??' : r.heard.toFixed(2)} (${r.delta >= 0 ? '+' : ''}${r.delta}) spk ${r.speaker}`);
}
fs.writeFileSync(TIMINGS, JSON.stringify(timings, null, 1) + '\n');
