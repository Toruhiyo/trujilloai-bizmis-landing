"""ad-1 v14 score: a MULTI-CUE soundtrack. A single long composition could not
change character at the film's chapters (and drifted / dropped out over three
minutes), so each chapter is its own cue, composed to the picture (ElevenLabs
Music, section durations respected), all at 112 bpm in E-flat (the pain in
C minor) and sharing one motif, each opening on its chapter's hit:

  pain     0 -> burst             intimate, minor; the climax; a riser into the cut
  meet     burst -> sold          the theme revealed, bright; the shopper moments
  sold     sold -> reel-in        celebratory lift, then the sync charge-up
  stores   reel-in -> land        a new driving groove for the demo stores
  cta      land -> end            warm anthem under the CTA, the finale on the closing hit

  python music_v14.py <export dir> <name> [versions 1,2,3,4,5] [plan-only]   (env TAKES, TAKE0)
"""
import json, os, sys, urllib.request, urllib.error, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__)); LANDING = os.path.abspath(os.path.join(HERE, '..', '..'))
ENV = '/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-project/.env'
KEY = next(l.split('=', 1)[1].strip().strip('"\'') for l in open(ENV) if l.startswith('ELEVENLABS_API_KEY='))
EXP, NAME = sys.argv[1], sys.argv[2]
VERSIONS = [int(v) for v in (sys.argv[3] if len(sys.argv) > 3 else '1,2,3,4,5').split(',')]
PLAN_ONLY = len(sys.argv) > 4 and sys.argv[4] == 'plan-only'
TAKES = int(os.environ.get('TAKES', '2')); T0 = int(os.environ.get('TAKE0', '0'))
M = json.load(open(os.path.join(EXP, 'markers.json'))); DUR = json.load(open(os.path.join(EXP, 'report.json')))['durationSeconds']
ev = sorted(M['sfx'], key=lambda e: e['at'])
allof = lambda k: [e['at'] / 1000 for e in ev if e['id'] == k]; first = lambda k: (allof(k) or [None])[0]
voice = {v['src'].rsplit('/', 1)[-1].split('.')[0]: v['atMs'] / 1000 for v in M['voice']}
def word(line, phrase, edge='start'):
    d = json.load(open(os.path.join(LANDING, 'public', 'promo', 'voice', f'{line}.json')))
    words, cur, st, inb, end = [], '', 0, False, 0
    for c in d['chars']:
        if c['char'] == '[': inb = True; continue
        if c['char'] == ']': inb = False; continue
        if inb: continue
        if c['char'].isspace():
            if cur: words.append((cur, st, end)); cur = ''
        else:
            if not cur: st = c['startMs']
            cur += c['char']; end = c['startMs'] + c.get('durMs', 0)
    if cur: words.append((cur, st, end))
    toks = phrase.split()
    for i in range(len(words) - len(toks) + 1):
        if all(words[i + k][0].lower().startswith(toks[k].lower()) for k in range(len(toks))):
            return voice[line] + (words[i][1] if edge == 'start' else words[i + len(toks) - 1][2]) / 1000
    raise KeyError(phrase)
lost = allof('lost-close'); beats = allof('climax-beat'); slams = allof('reel-slam')
T = {'some': word('t-pain', 'Some get lost'), 'others': word('t-pain', 'Others get stuck'), 'chatbot': word('t-pain', 'A chatbot?'),
     'person': word('t-pain', 'A real person?'), 'later': word('t-pain', 'hours later.', 'end'), 'climax': beats[0] - 0.35,
     'switch': voice['t-switch'], 'built': word('t-switch', 'So we built'), 'burst': first('burst'), 'rewind': first('rewind'),
     'catalog': voice['t-lost'], 'compare': voice['clerk-compare'], 'doubt': voice['t-doubt'], 'upsell': voice['clerk-upsell'], 'sold': first('sold'),
     'sync': voice['t-sync'] - 0.2, 'reel': first('reel-in'), 'slam2': slams[1], 'slam3': slams[2], 'slam4': slams[3], 'quick': first('reel-quick'),
     'land': first('reel-land'), 'ea': voice['t-ea'], 'installs': word('t-ea', 'It installs'), 'scarce': word('t-ea', 'There are only'),
     'final': first('ea-final'), 'end': DUR}
def S(name, a, b, pos, neg=()):
    ta = T[a] if isinstance(a, str) else a; tb = T[b] if isinstance(b, str) else b
    return {'section_name': name, 'duration_ms': int(round((tb - ta) * 1000)), 'lines': [], 'positive_local_styles': list(pos), 'negative_local_styles': list(neg)}
MOTIF = 'a simple, memorable rising three-note motif (the Bizmis motif)'
CUES = {
    'pain': ('0', 'burst', lambda p: [
        S('Shoppers walk in', 0, 'some', [f'{MOTIF} played softly on {p["pain_lead"]}', 'curious, intimate, half-time feel']),
        S('Lost in the catalog', 'some', 'others', ['a light ticking, searching pulse', 'slightly unresolved harmony', 'ends on one soft low accent']),
        S('One last question', 'others', 'chatbot', ['a hesitant, questioning variation of the motif', 'gentle suspense']),
        S('The chatbot', 'chatbot', 'person', ['a stiff, mechanical, slightly ironic figure', 'staccato, deadpan, witty']),
        S('Waiting for a person', 'person', 'later', ['a clock-like ticking that speeds up', 'restless']),
        S('Too late, they leave', 'later', 'climax', ['a descending, deflating phrase', 'wistful, sparse, keeps playing softly']),
        S('Unattended visits', 'climax', 'switch', ['four slow, deep, warm hits, evenly spaced, each bigger', 'a sustained pad between them', 'serious but never dark']),
        S('The best salesperson', 'switch', 'built', ['hope arrives: the harmony warms, the pulse returns and grows']),
        S('So we built one', 'built', 'burst', ['a short build and riser into a hit at the very end', 'the last half-beat cuts to silence']),
    ], 'pain'),
    'meet': ('burst', 'sold', lambda p: [
        S('Meet Bizmis', 'burst', 'rewind', [f'opens on one big, bright downbeat hit on the very first beat', f'the motif in full, bright and confident on {p["lead"]}', 'a completely new, brighter world than before']),
        S('Lets rewind, one click', 'rewind', 'catalog', ['the groove slows and softens', 'a soft reversed swell', 'one crisp bright pluck at the end', 'keeps playing']),
        S('Found the right one', 'catalog', 'compare', ['a nimble, inquisitive variation', 'light under dialogue']),
        S('Compared for you', 'compare', 'doubt', ['a more confident turn', 'resolves on a satisfied cadence']),
        S('Doubt cleared', 'doubt', 'upsell', ['softer, reassuring, warm sustained chords', 'a relieved lift at the end']),
        S('Paired perfectly', 'upsell', 'sold', ['bright, bouncy, conversational', 'builds a little toward a celebration']),
    ], 'pitch'),
    'sold': ('sold', 'reel', lambda p: [
        S('Visits become sales', 'sold', 'sync', ['opens on one big celebratory hit on the very first beat', 'the motif in full with claps, joyful', 'the strongest, happiest moment so far']),
        S('One click sync', 'sync', 'reel', ['a filtered build, charging up', 'tension rising toward a launch', 'ends right on the cut']),
    ], 'pitch'),
    'stores': ('reel', 'land', lambda p: [
        S('Any store', 'reel', 'slam2', ['a smooth, airy two-bar riser that lands clearly on a big downbeat', 'then a fresh, punchy, driving groove', 'room for recorded dialogue']),
        S('Second store', 'slam2', 'slam3', ['the arrangement changes on the first beat, a hit', 'new drum pattern, new lead colour']),
        S('Third store', 'slam3', 'slam4', ['changes again on the first beat: lighter, sparkling']),
        S('Fourth store', 'slam4', 'quick', ['changes again on the first beat: the fullest so far']),
        S('Every store', 'quick', 'land', ['four quick cuts, a crisp hit on each', 'light, international flavour', 'building to a landing at the very end']),
    ], 'pitch'),
    'cta': ('land', 'end', lambda p: [
        S('Your store', 'land', 'ea', ['opens on one big warm chord hit on the very first beat', 'then the chord rings with a soft pulse, anticipation']),
        S('Early Access', 'ea', 'installs', ['a warm, anthemic new texture under a voice-over', 'the motif returns, gentle and confident']),
        S('No commitment', 'installs', 'scarce', ['light rolling pulses, rebuilding steadily']),
        S('Only fifty spots', 'scarce', 'final', ['a lift: brighter, more urgent, building', 'swells straight into the final hit']),
        S('Finale', 'final', T['end'] + 1.5, ['one big, bright, resolving final chord hit on the very first beat', 'the chord rings out to the end', 'nothing new after the hit'], ['new melody', 'drums after the hit']),
    ], 'pitch'),
}
NEG = ['silence', 'long pauses', 'ending early', 'fade out', 'vocals', 'choir', 'epic trailer', 'dark', 'horror', 'dubstep', 'EDM drop', 'aggressive', 'cheesy corporate', 'stock music', 'ukulele', 'whistling']
PAL = {   # per version: pain palette (intimate), pitch palette (bright); same family, same motif
    1: {'title': 'Glass & Light', 'pain_lead': 'felt piano', 'lead': 'glassy plucked synth and felt piano',
        'pain': ['felt piano, soft warm pads, subtle glassy textures', 'C minor', '112 bpm half-time feel'],
        'pitch': ['glassy plucked synths, felt piano, warm sub-bass, tasteful modern percussion', 'E-flat major', '112 bpm']},
    2: {'title': 'Intimate to Bright', 'pain_lead': 'piano and soft strings', 'lead': 'plucked synths and sparkling arpeggios',
        'pain': ['intimate piano and soft string ensemble', 'C minor', '112 bpm half-time feel'],
        'pitch': ['bright modern electronic pop: plucked synths, warm synth bass, crisp claps, sparkling arpeggios', 'E-flat major', '112 bpm']},
    3: {'title': 'Strings & Pizzicato', 'pain_lead': 'solo cello and piano', 'lead': 'pizzicato strings and celesta',
        'pain': ['solo cello, piano, soft string pads', 'C minor', '112 bpm half-time feel'],
        'pitch': ['orchestral pop: pizzicato strings, light string ensemble, piano, celesta, soft claps', 'E-flat major', '112 bpm']},
    4: {'title': 'Warm Groove', 'pain_lead': 'a lonely Rhodes electric piano', 'lead': 'a warm Rhodes and round sub-bass',
        'pain': ['sparse Rhodes electric piano, soft pads, distant textures', 'C minor', '112 bpm half-time feel'],
        'pitch': ['warm Rhodes, deep round sub-bass, crisp minimal electronic drums, airy pads, subtle guitar', 'E-flat major', '112 bpm']},
    5: {'title': 'Indie Pop', 'pain_lead': 'a soft clean electric guitar', 'lead': 'clean electric guitars and glockenspiel',
        'pain': ['soft clean electric guitar, felt piano, gentle pads', 'C minor', '112 bpm half-time feel'],
        'pitch': ['feel-good indie pop band: clean electric guitars, bass, tight live drums, handclaps, glockenspiel, piano', 'E-flat major', '112 bpm']},
}
COMMON = ['premium product film score', 'instrumental', 'polished, elegant, modern', 'clean mix']
def compose(plan, dest):
    body = {'composition_plan': plan, 'model_id': 'music_v1', 'respect_sections_durations': True}
    for attempt in range(3):
        req = urllib.request.Request('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192', data=json.dumps(body).encode(),
                                     method='POST', headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=1500) as r: open(dest, 'wb').write(r.read())
            return dest
        except urllib.error.HTTPError as e:
            print('FAIL', dest, e.code, e.read()[:300])
            if e.code in (400, 401, 422): return None
    return None
plans, jobs = {'times': T, 'cues': {k: (v[0], v[1]) for k, v in CUES.items()}}, []
ONLY = {c for c in os.environ.get('ONLY_CUES', '').split(',') if c}   # e.g. ONLY_CUES=pain: re-compose just those cues
for v in VERSIONS:
    p = PAL[v]; plans[f'v{v}'] = {'title': p['title']}
    for cue, (a, b, secs, kind) in CUES.items():
        if ONLY and cue not in ONLY: continue
        plan = {'positive_global_styles': COMMON + p[kind], 'negative_global_styles': NEG, 'sections': secs(p)}
        short = [s['section_name'] for s in plan['sections'] if s['duration_ms'] < 3000]
        if short: print(f'WARN v{v} {cue}: sections under 3 s: {short}')
        plans[f'v{v}'][cue] = plan
        jobs += [(plan, os.path.join(HERE, 'music', f'{NAME}-v{v}-{cue}-{k}.mp3')) for k in range(T0, T0 + TAKES)]
if not ONLY: json.dump(plans, open(os.path.join(HERE, 'music', f'{NAME}-plan.json'), 'w'), indent=1)
print(f'{len(jobs)} compositions')
if not PLAN_ONLY:
    with cf.ThreadPoolExecutor(2) as ex:
        for f in ex.map(lambda j: compose(*j), jobs): print('wrote', f)
