#!/usr/bin/env node
// Voices the Early Access host's perks (messages.earlyAccessPage.host.perks, src/i18n/messages/<locale>.ts) in
// Will's own preset voice (scripts/replay-audio-lines.json "will") on ElevenLabs eleven_v4, one take per locale
// (a second only when the first fails its checks), with the API's character timestamps turned into the captions'
// word times. Writes public/landing/early-access/perks-<locale>.mp3 (mono, 64 kbps) and
// src/data/earlyAccessPerksVoice.ts. The audio is never stretched or edited beyond trimming its silences.
//
//   node scripts/generate-ea-perks-audio.mjs [--only en,es] [--dry-run]
// Needs ELEVENLABS_API_KEY (env, or ../trujilloai-bizmis-project/.env) and ffmpeg. Goes through the CFO credit
// guard (film/scripts/el-guard.mjs): nothing paid starts above the period ceiling, and a run over its cap stops.

import { assertEstimate, preflight, readUsed } from '../film/scripts/el-guard.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES = ['en', 'es', 'fr', 'it', 'ca'];
const MODEL = 'eleven_v4';
const VOICE = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'replay-audio-lines.json'), 'utf8')).voices.will.id;
const MAX_TAKES = 2;
const OUT_DIR = path.join(ROOT, 'public', 'landing', 'early-access');
const DATA = path.join(ROOT, 'src', 'data', 'earlyAccessPerksVoice.ts');
const WORK = path.join(os.tmpdir(), 'bizmis-ea-perks');
// a take passes when it reads at a natural pace with no long silence inside (seconds)
const PACE = [1.6, 4.2];          // words per second
const MAX_PAUSE = 1.3;
const LEAD_IN = 0.08;             // kept before the first word and after the last
const TAIL = 0.35;

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 && i + 1 < process.argv.length ? process.argv[i + 1] : '';
};
const only = arg('only').split(',').map((s) => s.trim()).filter(Boolean);
const dryRun = process.argv.includes('--dry-run');
const locales = only.length ? only : LOCALES;

function apiKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const env = path.join(ROOT, '..', 'trujilloai-bizmis-project', '.env');
  const line = fs.readFileSync(env, 'utf8').split('\n').find((l) => l.startsWith('ELEVENLABS_API_KEY='));
  if (!line) throw new Error('ELEVENLABS_API_KEY not found');
  return line.split('=').slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
}

// the captions' words (src/components/landing/captionParts.ts captionWords): split on spaces, a lone mark kept
// on the word before it
const captionWords = (line) =>
  line.trim().split(/\s+/).reduce((all, w) => {
    if (all.length && /^[!?:;»]+$/.test(w)) all[all.length - 1] += `\u00a0${w}`;
    else all.push(w);
    return all;
  }, []);

const cap = Number(/EARLY_ACCESS_STORE_CAP = (\d+)/.exec(fs.readFileSync(path.join(ROOT, 'src/data/leads/_schema.ts'), 'utf8'))[1]);
const scripts = {};
for (const locale of locales) {
  if (!LOCALES.includes(locale)) throw new Error(`unknown locale ${locale}`);
  const mod = await import(path.join(ROOT, 'src', 'i18n', 'messages', `${locale}.ts`));
  scripts[locale] = mod[locale].earlyAccessPage.host.perks(cap);
}
const textOf = (lines) => lines.join(' ');
const estimate = locales.reduce((n, l) => n + textOf(scripts[l]).length, 0) * MAX_TAKES;
console.log(`voice ${VOICE} on ${MODEL}; ${locales.join(', ')}: ${estimate / MAX_TAKES} characters a take, at most ${estimate}`);
if (dryRun) {
  for (const l of locales) console.log(`  ${l} (${textOf(scripts[l]).length}): ${textOf(scripts[l])}`);
  process.exit(0);
}
assertEstimate(estimate, 'the perks voice run');
const before = await preflight();
const KEY = apiKey();

async function tts(text, locale) {
  const body = {
    text,
    model_id: MODEL,
    language_code: locale,
    voice_settings: { stability: 0.45, similarity_boost: 0.8 },
  };
  for (let i = 0; ; i++) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) return res.json();
    const err = `TTS HTTP ${res.status} ${(await res.text()).slice(0, 300)}`;
    // a refusal is not retried (it would only spend again); a server hiccup once
    if (res.status < 500 || i >= 1) throw new Error(err);
    console.log(`  ${err}, retrying`);
    await new Promise((r) => setTimeout(r, 3000));
  }
}

/** Each caption word's [start, end] from the character alignment of `text`. */
function wordTimes(text, alignment) {
  const chars = alignment.characters;
  const starts = alignment.character_start_times_seconds;
  const ends = alignment.character_end_times_seconds;
  if (chars.join('') !== text) throw new Error('the alignment is not the text sent');
  const times = [];
  let at = 0;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const i = text.indexOf(word, at);
    const j = i + word.length - 1;
    at = j + 1;
    if (/^[!?:;»]+$/.test(word) && times.length) times[times.length - 1][1] = ends[j];
    else times.push([starts[i], ends[j]]);
  }
  return times;
}

function check(times, duration) {
  const pace = times.length / (times.at(-1)[1] - times[0][0]);
  const pause = Math.max(...times.slice(1).map((t, i) => t[0] - times[i][1]));
  const problems = [];
  if (pace < PACE[0] || pace > PACE[1]) problems.push(`pace ${pace.toFixed(2)} words/s`);
  if (pause > MAX_PAUSE) problems.push(`a ${pause.toFixed(2)} s pause`);
  if (times.some(([s, e]) => !(e >= s) || e > duration + 0.05)) problems.push('word times out of order');
  return { pace, pause, problems };
}

fs.mkdirSync(WORK, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });
const voiced = {};
let spent = 0;
for (const locale of locales) {
  const lines = scripts[locale];
  const text = textOf(lines);
  const words = lines.flatMap(captionWords);
  let pick = null;
  for (let take = 1; take <= MAX_TAKES && !pick; take++) {
    const r = await tts(text, locale);
    spent += text.length;
    const raw = path.join(WORK, `${locale}-take${take}.mp3`);
    fs.writeFileSync(raw, Buffer.from(r.audio_base64, 'base64'));
    const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', raw]).toString());
    const times = wordTimes(text, r.alignment);
    if (times.length !== words.length) throw new Error(`${locale}: ${times.length} timed words for ${words.length} caption words`);
    const { pace, pause, problems } = check(times, duration);
    console.log(`  ${locale} take ${take}: ${duration.toFixed(2)} s, ${pace.toFixed(2)} words/s, longest pause ${pause.toFixed(2)} s${problems.length ? `: ${problems.join(', ')}` : ''}`);
    if (!problems.length || take === MAX_TAKES) pick = { raw, times, duration, take, problems };
  }
  if (pick.problems.length) console.log(`  !! ${locale}: kept take ${pick.take} with ${pick.problems.join(', ')} (listen to it)`);
  // trim to the speech, mono 64 kbps; the word times move with the cut
  const from = Math.max(0, pick.times[0][0] - LEAD_IN);
  const to = Math.min(pick.duration, pick.times.at(-1)[1] + TAIL);
  const out = path.join(OUT_DIR, `perks-${locale}.mp3`);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', from.toFixed(3), '-to', to.toFixed(3), '-i', pick.raw,
    '-af', `afade=t=out:st=${(to - from - 0.12).toFixed(3)}:d=0.12`, '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '64k', out]);
  const hash = crypto.createHash('sha1').update(fs.readFileSync(out)).digest('hex').slice(0, 8);
  const round = (x) => Math.round(x * 1000) / 1000;
  voiced[locale] = {
    src: `/landing/early-access/perks-${locale}.mp3?v=${hash}`,
    lines,
    words: pick.times.map(([s, e]) => [round(s - from), round(e - from)]),
  };
  console.log(`  ${locale}: ${path.relative(ROOT, out)} (${(fs.statSync(out).size / 1024).toFixed(0)} KB, ${(to - from).toFixed(2)} s)`);
}

// merge into the data file (the other locales as they were)
const current = fs.existsSync(DATA)
  ? JSON.parse((/EA_PERKS_VOICE: [^=]+= (\{[\s\S]*\});\s*$/.exec(fs.readFileSync(DATA, 'utf8')) ?? [, '{}'])[1])
  : {};
const all = { ...current, ...voiced };
const ordered = Object.fromEntries(LOCALES.filter((l) => all[l]).map((l) => [l, all[l]]));
const json = JSON.stringify(ordered, null, 2).replace(/\[\n\s+(-?[\d.]+),\n\s+(-?[\d.]+)\n\s+\]/g, '[$1, $2]');
fs.writeFileSync(DATA, `// GENERATED by scripts/generate-ea-perks-audio.mjs: do not edit by hand.
import type { Locale } from "@/i18n/locales";

/**
 * The Early Access host's spoken perks, per locale: the recording, the lines it
 * says (messages.earlyAccessPage.host.perks, as voiced) and each word's start
 * and end in seconds (ElevenLabs' character alignment), the words split as the
 * captions split them (captionWords). A locale is missing until it's voiced, and
 * the control only shows where the lines voiced are the lines on the page.
 */
export type PerksVoice = {
  src: string;
  lines: string[];
  words: [number, number][];
};

export const EA_PERKS_VOICE: Partial<Record<Locale, PerksVoice>> = ${json};
`);
const after = await readUsed().catch(() => NaN);
console.log(`characters sent: ${spent}; the account's period usage ${before.toLocaleString('en')} -> ${after.toLocaleString('en')}`);
