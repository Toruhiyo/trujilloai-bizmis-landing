"""ad-1 v19 score: ONE continuous track (never spliced, never time-stretched)
that follows the story MOMENT BY MOMENT: 22 sections, each a clearly different
arrangement / mood / instrumentation (operator: v18 was monotonous; the Bizmis
arrival must be a real change, not the same music louder). Musical transitions
(fills, pickups, risers), never silence. 112 bpm grid (half-time feels allowed).
Times = the v18b picture (the pain phrases from its VO).

  python music_v19.py <name> [plan-only]    (env TAKES, TAKE0)
"""
import json, os, sys, urllib.request, urllib.error, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__))
KEY = next(l.split('=', 1)[1].strip().strip('"\'') for l in open('/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-project/.env') if l.startswith('ELEVENLABS_API_KEY='))
NAME = sys.argv[1]; PLAN_ONLY = len(sys.argv) > 2 and sys.argv[2] == 'plan-only'
TAKES = int(os.environ.get('TAKES', '6')); T0 = int(os.environ.get('TAKE0', '0'))
NO_DRUMS = ['drum kit', 'four-on-the-floor', 'big drums']
CUTS = [   # (start s, name, positive local styles, negative local styles)
    (0.0, 'Shoppers walk in', ['a light, curious, optimistic opening: celesta and soft pizzicato, a gentle door-chime motif', 'small and intimate'], NO_DRUMS),
    (4.2, 'Lost in the catalog', ['restless and wandering: quick pizzicato strings and marimba running in circles, slightly confused, playful', 'a looping figure that never resolves'], NO_DRUMS),
    (12.3, 'Stuck on one question', ['hesitant and suspended: a music box plays a little question-like phrase that hangs unresolved', 'everything else drops away'], NO_DRUMS + ['pizzicato']),
    (16.5, 'The chatbot', ['comic and robotic: a stiff, monotonous mechanical beat with glitchy computer bleeps and a square-wave synth', 'deadpan, sarcastic'], ['strings', 'warm']),
    (20.2, 'Waiting for a person', ['comic waiting-room elevator muzak: a cheesy slow bossa nova on vibraphone and nylon guitar, a ticking clock', 'bored, endless waiting'], ['synth bleeps']),
    (23.2, 'Hours pass', ['a quick time-lapse whirl: the muzak spins faster in a swirling flurry of harp and clock ticks', 'a dizzy rush'], []),
    (26.2, 'Sale lost', ['deflated: the music sinks to one lonely Rhodes chord and a soft low thud, a little descending sigh', 'sparse, quiet but still musical, a touch sad but light, never dramatic'], NO_DRUMS + ['strings swell']),
    (30.0, 'Lost at scale', ['tension of scale: a pulsing low synth ostinato and a ticking that keeps accelerating, many small falling blips', 'building, unsettling but not dark, no melody'], ['vocals', 'choir']),
    (40.8, 'The turn', ['warm and hopeful: acoustic piano and soft strings, a human, physical-store warmth', 'building bar by bar into a pickup'], ['synth bleeps', 'glitch']),
    (50.0, 'Meet Bizmis', ['THE ARRIVAL: a totally new, big, bright upbeat modern funk-pop groove on the first beat: full punchy drums, slap bass, funky guitar, brass stabs, bright synths, handclaps',
                            'a new key, euphoric and confident, the biggest change in the piece'], ['pizzicato', 'music box', 'celesta', 'sparse']),
    (58.0, 'Rewind', ['a playful tape-rewind stop, then the groove restarts from just bass and claps', 'light'], []),
    (63.3, 'Finds the right one', ['the groove light and bouncy under dialogue: plucked synths and guitar, a searching figure that lands on a sparkly found moment', 'smiling'], ['brass']),
    (80.2, 'The doubt, answered', ['the groove pauses on a suspended question chord with soft keys, then resolves into a warm reassuring bounce', 'tender, then relieved'], []),
    (94.7, 'The add-on', ['cheeky and bright: muted brass stabs, guitar licks and a little cart-pop sparkle on the groove', 'fun'], []),
    (106.2, 'Visits become sales', ['euphoric lift: the full groove with big claps, a bright hook and rising synth arpeggios', 'celebration'], []),
    (114.7, 'One click, in sync', ['clean and precise: a crisp electronic pulse with glassy plucks, tidy and techy', 'calm confidence, lighter'], ['brass']),
    (121.0, 'Into the stores', ['a rising filtered riser and drum roll, sucking the energy in', 'anticipation'], []),
    (124.8, 'Every store', ['a driving dance groove, denser and brighter every bar, accelerating feel, house piano stabs and claps', 'thrilling, building to a peak at the very end'], []),
    (145.3, 'Your store', ['a big landing hit, then the groove drops to a warm breathing pad and soft bass', 'a breath'], []),
    (149.5, 'Early Access', ['a warm, confident version of the main groove, lighter under narration, rebuilding with claps toward the finish', 'inviting'], []),
    (170.0, 'Finale', ['one big bright final hit on the first beat, the last chord rings out', 'a clean, satisfying button'], []),
    (173.0, 'Overrun', ['the final chord keeps ringing', 'no fade'], []),
]
END = 178.0
secs = [{'section_name': n, 'duration_ms': int(round(((CUTS[i + 1][0] if i + 1 < len(CUTS) else END) - a) * 1000)), 'lines': [],
         'positive_local_styles': pos, 'negative_local_styles': neg} for i, (a, n, pos, neg) in enumerate(CUTS)]
plan = {'positive_global_styles': ['instrumental film score for a premium brand film', '112 bpm grid (half-time feels allowed)',
                                   'follows the story moment by moment: every section has its own clearly different arrangement, mood and instrumentation',
                                   'strong contrasts between sections, connected by musical transitions (fills, pickups, risers)', 'no silences, no stops', 'premium, polished, modern, clean mix'],
        'negative_global_styles': ['silence', 'long pauses', 'ending early', 'fade out', 'vocals', 'choir', 'epic trailer', 'monotonous', 'repetitive', 'the same arrangement throughout',
                                   'cheesy corporate', 'stock music', 'ukulele', 'whistling'],
        'sections': secs}
json.dump({'times': {n: round(a, 3) for a, n, _, _ in CUTS}, 'full': plan}, open(os.path.join(HERE, 'music', f'{NAME}-plan.json'), 'w'), indent=1)
print(len(secs), 'sections', [(s['section_name'][:14], s['duration_ms']) for s in secs])
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
