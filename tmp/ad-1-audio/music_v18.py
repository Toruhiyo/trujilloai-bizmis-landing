"""ad-1 v18 score: ONE continuous track (never spliced, never time-stretched) that
evolves with the film: the pain is a light, mischievous caper/lounge (v17 B + C:
little disasters, never dramatic), Bizmis arrives with v17 A's upbeat groove, and
each chapter gets its own arrangement (ups and downs, same tempo, no silences).
Section times = the v16 picture, everything from the reel on +1 beat (v18 reel ladder).

  python music_v18.py <name> [plan-only]    (env TAKES, TAKE0, SHIFT_AFTER_REEL)
"""
import json, os, sys, urllib.request, urllib.error, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__))
KEY = next(l.split('=', 1)[1].strip().strip('"\'') for l in open('/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-project/.env') if l.startswith('ELEVENLABS_API_KEY='))
NAME = sys.argv[1]; PLAN_ONLY = len(sys.argv) > 2 and sys.argv[2] == 'plan-only'
TAKES = int(os.environ.get('TAKES', '4')); T0 = int(os.environ.get('TAKE0', '0'))
D = float(os.environ.get('SHIFT_AFTER_REEL', str(60 / 112)))
R = lambda t: t + D   # times after the reel starts moving
CUTS = [   # (start, name, styles)
    (0.0, 'Lost in the catalog', ['a light, quirky, mischievous caper: pizzicato strings, marimba, bouncy upright bass, a warm Rhodes', 'curious and cheeky, little playful missteps', 'soft but already grooving from the first second']),
    (12.3, 'Stuck, looking for help', ['playful little mishaps, comic and charming, a cheeky ticking figure', 'the same caper, a few muted brass blips like small oops moments', 'a touch busier, never tense']),
    (26.0, 'They leave quietly', ['the caper thins out to a light, wistful, slightly deflated version', 'sparse Rhodes and pizzicato over the bass, still in tempo', 'gentle, never sad or dramatic']),
    (40.83, 'The turn', ['hopeful: the groove rebuilds bar by bar, brighter', 'a clean funky guitar enters', 'momentum building into the next section']),
    (50.0, 'Meet Bizmis', ['the big arrival on the first beat: an upbeat feel-good funk-pop groove', 'clean funky electric guitar, round electric bass, crisp drums, handclaps, bright synth stabs', 'confident, bright, catchy']),
    (58.0, 'Rewind', ['the groove pulls back to bass, drums and claps for a moment', 'playful, same tempo']),
    (63.3, 'The sales agent at work', ['the main groove, steady and danceable, light enough for dialogue on top', 'the arrangement keeps evolving every few bars, never repetitive']),
    (94.7, 'The add-on', ['a playful lift: guitar licks and synth sparkles join', 'smiling, light']),
    (106.2, 'Visits become sales', ['a fuller, joyful lift with claps and a bright hook', 'the same groove, more layers']),
    (121.0, 'Every store', ['the groove drives forward, denser and brighter every bar', 'exciting, accelerating feel, building to a peak at the very end']),
    (R(145.33), 'Early Access', ['a warm, confident version of the groove, a little lighter', 'rebuilding toward the finish']),
    (R(170.5), 'Finale', ['one bright final hit on the first beat, the last chord rings', 'a clean, satisfying button']),
    (R(173.5), 'Overrun', ['the final chord keeps ringing', 'no fade']),
]
END = R(173.5) + 5.0
secs = [{'section_name': n, 'duration_ms': int(round(((CUTS[i + 1][0] if i + 1 < len(CUTS) else END) - a) * 1000)), 'lines': [],
         'positive_local_styles': st, 'negative_local_styles': []} for i, (a, n, st) in enumerate(CUTS)]
plan = {'positive_global_styles': ['instrumental', '112 bpm', 'one continuous piece of music that evolves from a playful quirky caper into an upbeat funk-pop groove',
                                   'steady tempo throughout, no silences, no stops', 'changes by arrangement and brightness', 'premium, polished, modern, clean mix'],
        'negative_global_styles': ['silence', 'long pauses', 'ending early', 'fade out', 'vocals', 'choir', 'dark', 'dramatic', 'sad', 'epic trailer', 'cinematic strings swell',
                                   'EDM drop', 'aggressive', 'cheesy corporate', 'stock music', 'ukulele', 'whistling', 'tempo change'],
        'sections': secs}
json.dump({'times': {n: round(a, 3) for a, n, _ in CUTS}, 'full': plan}, open(os.path.join(HERE, 'music', f'{NAME}-plan.json'), 'w'), indent=1)
print([(s['section_name'], s['duration_ms']) for s in secs])
def compose(dest):
    body = {'composition_plan': plan, 'model_id': 'music_v1', 'respect_sections_durations': True}
    for attempt in range(4):
        req = urllib.request.Request('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192', data=json.dumps(body).encode(), method='POST',
                                     headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=1500) as r: open(dest, 'wb').write(r.read())
            return dest
        except urllib.error.HTTPError as e:
            print('FAIL', dest, e.code, e.read()[:300], flush=True)
            if e.code in (400, 401, 422): return None
    return None
if not PLAN_ONLY:
    with cf.ThreadPoolExecutor(2) as ex:
        for f in ex.map(compose, [os.path.join(HERE, 'music', f'{NAME}-{k}.mp3') for k in range(T0, T0 + TAKES)]): print('wrote', f, flush=True)
