"""ad-1 v17 score: ONE continuous track per variant (no cue joins, never
time-stretched), briefed from the operator's references (analysed locally):
  - Shopify Editions (Imaginary Forces): steady upbeat 112 bpm groove under VO,
    constant loudness, changes by arrangement and brightness, bright highs;
  - Notion AI: light, bouncy, lounge-like, warm bass, little drumming;
  - Apple 'Data Auction': a playful caper under narration, every moment scored.
Few broad sections (the model drops out on many short ones) + a 5 s overrun so it
never stops before the last frame. 112 bpm throughout (the film's grid).

  python music_v17.py <export dir> <name> [variants A,B,C] [plan-only]   (env TAKES, TAKE0)
"""
import json, os, sys, urllib.request, urllib.error, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__))
KEY = next(l.split('=', 1)[1].strip().strip('"\'') for l in open('/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-project/.env') if l.startswith('ELEVENLABS_API_KEY='))
EXP, NAME = sys.argv[1], sys.argv[2]
VARS = (sys.argv[3] if len(sys.argv) > 3 else 'A,B,C').split(',')
PLAN_ONLY = len(sys.argv) > 4 and sys.argv[4] == 'plan-only'
TAKES = int(os.environ.get('TAKES', '2')); T0 = int(os.environ.get('TAKE0', '0'))
M = json.load(open(os.path.join(EXP, 'markers.json'))); DUR = json.load(open(os.path.join(EXP, 'report.json')))['durationSeconds']
ev = sorted(M['sfx'], key=lambda e: e['at']); first = lambda k: next((e['at'] / 1000 for e in ev if e['id'] == k), None)
voice = {v['src'].rsplit('/', 1)[-1].split('.')[0]: v['atMs'] / 1000 for v in M['voice']}
T = {'switch': voice['t-switch'], 'burst': first('burst'), 'sold': first('sold'), 'reel': first('reel-in'), 'land': first('reel-land'),
     'final': first('ea-final'), 'end': DUR}
def S(name, a, b, pos, neg=()):
    return {'section_name': name, 'duration_ms': int(round((b - a) * 1000)), 'lines': [], 'positive_local_styles': list(pos), 'negative_local_styles': list(neg)}
def sections(lead):
    t = T
    return [
        S('Shoppers wander', 0, t['switch'], [f'a light, witty, playful caper on {lead}', 'curious and mischievous, a little cheeky, never dramatic or sad',
                                               'a soft steady groove from the first second', 'small playful accents, room for narration']),
        S('The turn', t['switch'], t['burst'], ['the groove lifts and brightens bar by bar', 'warm and hopeful, building momentum', 'a bright pickup into the next section']),
        S('Meet Bizmis', t['burst'], t['sold'], ['the main groove arrives on the first beat: upbeat, bright, confident and fun', 'steady and danceable under narration',
                                                  'the arrangement keeps evolving every few bars, never repetitive']),
        S('Visits become sales', t['sold'], t['reel'], ['a fuller, joyful lift with claps', 'the same groove, more layers']),
        S('Every store', t['reel'], t['land'], ['the groove drives forward, denser and brighter every bar', 'exciting, accelerating feel, building to a peak at the very end']),
        S('Early Access', t['land'], t['final'], ['a warm, confident version of the groove, a little lighter', 'rebuilding toward the finish']),
        S('Finale', t['final'], t['end'], ['one bright final hit on the first beat, the last chord rings', 'a clean, satisfying button']),
        S('Overrun', t['end'], t['end'] + 5.0, ['the final chord keeps ringing', 'no fade']),
    ]
COMMON = ['instrumental', '112 bpm', 'constant loudness and energy, it changes by arrangement and brightness, not by volume', 'no silences, no stops',
          'premium, polished, modern, clean mix', 'one continuous piece of music']
NEG = ['silence', 'long pauses', 'ending early', 'fade out', 'vocals', 'choir', 'dark', 'dramatic', 'sad', 'epic trailer', 'cinematic strings swell', 'EDM drop',
       'aggressive', 'cheesy corporate', 'stock music', 'ukulele', 'whistling', 'tempo change']
VARIANTS = {
    'A': {'title': 'Upbeat groove (Shopify Editions)', 'lead': 'funky clean electric guitar, slap bass and claps',
          'styles': ['upbeat feel-good funk-pop groove', 'clean funky electric guitar, round electric bass, crisp drums, handclaps, bright synth stabs', 'bright and catchy']},
    'B': {'title': 'Bouncy lounge (Notion AI)', 'lead': 'a bouncy Rhodes and warm upright bass',
          'styles': ['light bouncy lounge-pop', 'warm Rhodes electric piano, upright bass, brushed light percussion, vibraphone, playful little synth plucks', 'charming, cheerful, airy']},
    'C': {'title': 'Playful caper (Data Auction)', 'lead': 'pizzicato strings, marimba and a walking bass',
          'styles': ['playful caper with a swing, retro-modern', 'pizzicato strings, marimba, walking bass, light jazzy drums, muted brass hits, glockenspiel', 'witty, sly, then joyful']},
}
def compose(plan, dest):
    body = {'composition_plan': plan, 'model_id': 'music_v1', 'respect_sections_durations': True}
    for attempt in range(3):
        req = urllib.request.Request('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192', data=json.dumps(body).encode(), method='POST',
                                     headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=1500) as r: open(dest, 'wb').write(r.read())
            return dest
        except urllib.error.HTTPError as e:
            print('FAIL', dest, e.code, e.read()[:300])
            if e.code in (400, 401, 422): return None
    return None
plans, jobs = {'times': T}, []
for v in VARS:
    d = VARIANTS[v]; plan = {'positive_global_styles': COMMON + d['styles'], 'negative_global_styles': NEG, 'sections': sections(d['lead'])}
    plans[v] = {'title': d['title'], 'full': plan}
    jobs += [(plan, os.path.join(HERE, 'music', f'{NAME}-{v}-{k}.mp3')) for k in range(T0, T0 + TAKES)]
json.dump(plans, open(os.path.join(HERE, 'music', f'{NAME}-plan.json'), 'w'), indent=1)
print({k: round(x, 2) for k, x in T.items()}, f'{len(jobs)} compositions')
if not PLAN_ONLY:
    with cf.ThreadPoolExecutor(2) as ex:
        for f in ex.map(lambda j: compose(*j), jobs): print('wrote', f)
