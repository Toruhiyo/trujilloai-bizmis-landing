"""ElevenLabs credit guard for the Python film scripts (same rules as el-guard.mjs): nothing paid starts when the
billing period's usage is above 400,000 credits, and a run stops at 5,000 credits (estimated in characters of TTS or
seconds of generation). Overrides on purpose only: EL_CREDIT_CAP / EL_PERIOD_CEILING with EL_I_KNOW=1."""
import json, os, sys, urllib.request

PERIOD_CEILING = 400_000
RUN_CAP = 5_000


def limit(name, fallback, env=os.environ):
    if name not in env:
        return fallback
    if env.get('EL_I_KNOW') != '1':
        sys.exit(f'{name} changes a CFO guard: set EL_I_KNOW=1 to confirm')
    return int(env[name])


def preflight(key, fetch=None, ceiling=None):
    ceiling = limit('EL_PERIOD_CEILING', PERIOD_CEILING) if ceiling is None else ceiling
    def read():
        req = urllib.request.Request('https://api.elevenlabs.io/v1/user/subscription', headers={'xi-api-key': key})
        return json.load(urllib.request.urlopen(req, timeout=30))
    used = int((fetch or read)().get('character_count') or 0)
    if used > ceiling:
        sys.exit(f'NOT STARTED: ElevenLabs period usage {used:,} credits is above the test ceiling {ceiling:,}')
    return used


def assert_estimate(credits, what, cap=None):
    cap = limit('EL_CREDIT_CAP', RUN_CAP) if cap is None else cap
    if credits > cap:
        sys.exit(f'NOT STARTED: {what}: about {credits:,.0f} credits, over the run cap {cap:,}')
