#!/usr/bin/env node
// Generates the ad-1 narrator, shopper and extra clerk lines listed in
// public/promo/voice/film-lines.json with the ElevenLabs API (audio tags in the
// text are kept: they steer the read and get tiny slots in the timings), in the same
// shape the film already loads for the recorded clerk: <id>.wav plus <id>.json
// ({ id, text, said, durationMs, chars: [{ char, startMs, durMs }] }).
// The file is cut 180 ms after the last character so the film can wait on it.
//
//   node scripts/generate-film-voice.mjs [--only id1,id2] [--force]
// Needs ELEVENLABS_API_KEY (env, or ../trujilloai-bizmis-project/.env) and ffmpeg.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VOICE_DIR = path.join(ROOT, 'public', 'promo', 'voice');
const ROLES = {
  // Claudia on Eleven v4: whole takes with audio tags ([warm], [sighs], [short pause]…) driving the read.
  narrator: { voice: 'cw0sQ4mVjT9BbISUtO51', model: 'eleven_v4', settings: { stability: 0.4, similarity_boost: 0.8 } },
  shopper: { voice: 'r1KmysJdVYZjJCm4mL3b', model: 'eleven_v4' },                  // Jessica
  clerk: { voice: 'c6SfcYrb2t09NHXiT80T', model: 'eleven_v4',        // the live agent's voice (every film voice on Eleven v4)
    settings: { stability: 0.45, similarity_boost: 0.8 } },
};
const TAIL_MS = 180;

const arg = (name) => {
  const index = process.argv.indexOf(`--${name}`);
  return index > 0 && index + 1 < process.argv.length ? process.argv[index + 1] : '';
};
const only = arg('only').split(',').map((s) => s.trim()).filter(Boolean);
const force = process.argv.includes('--force');

function apiKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const env = path.join(ROOT, '..', 'trujilloai-bizmis-project', '.env');
  const line = fs.readFileSync(env, 'utf8').split('\n').find((l) => l.startsWith('ELEVENLABS_API_KEY='));
  if (!line) throw new Error('ELEVENLABS_API_KEY not found');
  return line.split('=').slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
}

const lines = JSON.parse(fs.readFileSync(path.join(VOICE_DIR, 'film-lines.json'), 'utf8'));
const key = apiKey();
for (const [index, line] of lines.entries()) {
  if (only.length && !only.includes(line.id)) continue;
  const wavPath = path.join(VOICE_DIR, `${line.id}.wav`);
  if (fs.existsSync(wavPath) && !force) { console.log(line.id, 'skip'); continue; }
  const role = ROLES[line.role];
  const sameRole = (i) => lines[i] && lines[i].role === line.role ? lines[i].text : undefined;
  // eleven_v3_conversational rejects previous_text / next_text.
  const context = role.model === 'eleven_v3_conversational' ? {} : { previous_text: sameRole(index - 1), next_text: sameRole(index + 1) };
  const body = { text: line.text, model_id: role.model, voice_settings: role.settings, ...context };
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${role.voice}/with-timestamps?output_format=mp3_44100_192`, {
    method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) { console.log(line.id, 'HTTP', res.status, (await res.text()).slice(0, 300)); continue; }
  const data = await res.json();
  const a = data.alignment;
  const chars = a.characters.map((char, i) => ({
    char,
    startMs: Math.round(a.character_start_times_seconds[i] * 1000),
    durMs: Math.round((a.character_end_times_seconds[i] - a.character_start_times_seconds[i]) * 1000),
  }));
  const durationMs = Math.round(a.character_end_times_seconds.at(-1) * 1000) + TAIL_MS;
  const mp3 = path.join(VOICE_DIR, `${line.id}.mp3`);
  fs.writeFileSync(mp3, Buffer.from(data.audio_base64, 'base64'));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', mp3, '-t', String(durationMs / 1000),
    '-af', `afade=t=out:st=${Math.max(0, durationMs - TAIL_MS) / 1000}:d=${TAIL_MS / 1000}`,
    '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s16le', wavPath]);
  fs.unlinkSync(mp3);
  fs.writeFileSync(path.join(VOICE_DIR, `${line.id}.json`),
    JSON.stringify({ id: line.id, role: line.role, text: line.text, said: line.text, durationMs, chars }));
  console.log(line.id, `${durationMs} ms`);
}
