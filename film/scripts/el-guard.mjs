// ElevenLabs credit guard for the film scripts here (same rules as bizmis-film demo/el-guard.mjs; repo-local on
// purpose, these two repos share nothing). Why (CFO, 2026-10-28): film and demo production used 274k credits in live
// sessions not flagged as test plus 24k of TTS/STT through the API key, on a plan with no fixed ceiling.
//   - pre-flight: nothing paid starts when the billing period's usage is above 400,000 credits
//   - cap: 5,000 credits per script run (characters for TTS; a live recording: the account's delta, or 400 credits
//     per minute if that is more); over it the run stops
//   - overrides, on purpose only: EL_CREDIT_CAP=<n> / EL_PERIOD_CEILING=<n> need EL_I_KNOW=1
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const PERIOD_CEILING = 400_000;
export const RUN_CAP = 5_000;
export const VOICE_CREDITS_PER_MIN = 400;
export const TOKEN_FILE = path.join(os.homedir(), 'Projects/Bizmis/film-production/.test-token');
export const TOKEN_STORAGE_KEY = 'bizmis_test_token';   // the widget's tester switch (utils/testerSession.ts)

export function limit(name, fallback, env = process.env) {
  if (env[name] === undefined) return fallback;
  if (env.EL_I_KNOW !== '1') throw new Error(`${name} changes a CFO guard: set EL_I_KNOW=1 to confirm`);
  return Number(env[name]);
}

function apiKey() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const env = fs.readFileSync(path.join(os.homedir(), 'Projects/Bizmis/trujilloai-bizmis-project/.env'), 'utf8');
  return env.split('\n').find((l) => l.startsWith('ELEVENLABS_API_KEY=')).split('=').slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
}

export async function readUsed(fetchImpl = fetch) {
  const res = await fetchImpl('https://api.elevenlabs.io/v1/user/subscription', { headers: { 'xi-api-key': apiKey() } });
  if (!res.ok) throw new Error(`cannot read the ElevenLabs subscription (${res.status}); not starting`);
  return Number((await res.json()).character_count) || 0;
}

export function assertUnderCeiling(used, ceiling = limit('EL_PERIOD_CEILING', PERIOD_CEILING)) {
  if (used > ceiling) throw new Error(`ElevenLabs period usage ${used.toLocaleString('en')} credits is above the test ceiling ${ceiling.toLocaleString('en')}; not starting`);
  return used;
}

export const preflight = async (fetchImpl = fetch) => assertUnderCeiling(await readUsed(fetchImpl));

export function assertEstimate(credits, what, cap = limit('EL_CREDIT_CAP', RUN_CAP)) {
  if (credits > cap) throw new Error(`${what}: about ${Math.round(credits).toLocaleString('en')} credits, over the run cap ${cap.toLocaleString('en')}`);
}

export const runSpent = (usedDelta, elapsedMs) => Math.max(usedDelta, (elapsedMs / 60000) * VOICE_CREDITS_PER_MIN);

// The signed tester token (subject `film`): env BIZMIS_FILM_TEST_TOKEN or TOKEN_FILE. Live recordings refuse to start
// without it: the backend then marks the session is_test, test_by=film.
export function filmTesterToken(env = process.env, file = TOKEN_FILE) {
  const token = (env.BIZMIS_FILM_TEST_TOKEN || (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '')).trim();
  if (!token.startsWith('bt1.')) throw new Error(`no film tester token: a recording must be flagged as ours. Mint one (film/README.md) into ${file}`);
  return token;
}

export function installTesterToken(token, key = TOKEN_STORAGE_KEY) {
  try { window.sessionStorage.setItem(key, token); } catch { /* about:blank */ }
}
