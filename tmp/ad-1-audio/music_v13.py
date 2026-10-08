"""ad-1 v13 score: five soundtrack versions composed to the picture (ElevenLabs
Music, section durations respected). Every chapter of the film is its own
section (a variation of the theme, never the same loop running on), every
section boundary is a film event read from the export (markers + the voice
lines' word timings), and the whole film shares one 112 bpm grid (the demo-store
cuts are locked to it). Versions 1, 3, 4, 5 are one continuous score; version 2
is two cues (pain, then the rest from the toggle's hit).

  python music_v13.py <export dir> <name> [versions e.g. 1,2,3,4,5] [plan-only]
"""
import json, os, sys, urllib.request, urllib.error, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__))
LANDING = os.path.abspath(os.path.join(HERE, '..', '..'))
ENV = '/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-project/.env'
KEY = next(l.split('=', 1)[1].strip().strip('"\'') for l in open(ENV) if l.startswith('ELEVENLABS_API_KEY='))
EXP, NAME = sys.argv[1], sys.argv[2]
VERSIONS = [int(v) for v in (sys.argv[3] if len(sys.argv) > 3 else '1,2,3,4,5').split(',')]
PLAN_ONLY = len(sys.argv) > 4 and sys.argv[4] == 'plan-only'
TAKES = int(os.environ.get('TAKES', '2')); T0 = int(os.environ.get('TAKE0', '0'))   # TAKE0: number further takes after earlier ones
M = json.load(open(os.path.join(EXP, 'markers.json')))
DUR = json.load(open(os.path.join(EXP, 'report.json')))['durationSeconds']
ev = sorted(M['sfx'], key=lambda e: e['at'])
allof = lambda k: [e['at'] / 1000 for e in ev if e['id'] == k]
first = lambda k: (allof(k) or [None])[0]
voice = {v['src'].rsplit('/', 1)[-1].split('.')[0]: v['atMs'] / 1000 for v in M['voice']}

def word(line, phrase, edge='start'):
    """film time of a phrase in a voice line (its words' timings)"""
    d = json.load(open(os.path.join(LANDING, 'public', 'promo', 'voice', f'{line}.json')))
    words, cur, st, inb = [], '', 0, False
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
            ms = words[i][1] if edge == 'start' else words[i + len(toks) - 1][2]
            return voice[line] + ms / 1000
    raise KeyError(f'{line}: {phrase}')

lost = allof('lost-close'); beats = allof('climax-beat'); burst = first('burst')
T = {
    'some': word('t-pain', 'Some get lost'), 'lost1': lost[0], 'others': word('t-pain', 'Others get stuck'),
    'chatbot': word('t-pain', 'A chatbot?'), 'person': word('t-pain', 'A real person?'), 'later': word('t-pain', 'hours later.', 'end'),
    'lost2': lost[1], 'climax': beats[0] - 0.35, 'switch': voice['t-switch'], 'built': word('t-switch', 'So we built'), 'burst': burst,
    'rewind': first('rewind'), 'install': first('install') or first('clerk-in'), 'catalog': voice['t-lost'], 'doubt': voice['t-doubt'],
    'upsell': voice['clerk-upsell'], 'sold': first('sold'), 'sync': voice['t-sync'] - 0.2, 'reel': first('reel-in'),
    'quick': first('reel-quick'), 'land': first('reel-land'), 'ea': voice['t-ea'], 'scarce': word('t-ea', 'There are only'),
    'final': first('ea-final'), 'end': DUR, 'compare': voice['clerk-compare'], 'installs': word('t-ea', 'It installs'),
}
slams = allof('reel-slam'); T.update({'slam2': slams[1], 'slam3': slams[2], 'slam4': slams[3]})
S = lambda name, a, b, pos, neg=(): {'section_name': name, 'duration_ms': int(round((T[b] if isinstance(b, str) else b) * 1000 - (T[a] if isinstance(a, str) else a) * 1000)),
                                     'lines': [], 'positive_local_styles': list(pos), 'negative_local_styles': list(neg)}

# What each chapter does (shared by every version; the palette is the version's)
def pain_sections(p):
    return [
        S('Shoppers walk in', 0, 'some', [f'the main theme stated simply and memorably from the very first second on {p["lead"]}', 'curious, inviting, intimate', 'half-time feel']),
        S('Lost in the catalog', 'some', 'others', ['the theme continues over a light ticking, searching pulse', 'clicking, scrolling motion in the rhythm', 'slightly unresolved harmony', 'space for a voice-over',
                                                    'ends on one soft low accent as the shopper gives up']),
        S('One last question', 'others', 'chatbot', ['a hesitant, questioning variation of the theme', 'gentle suspense', 'a small rising figure at the end']),
        S('The chatbot', 'chatbot', 'person', ['a stiff, mechanical, slightly ironic figure', 'staccato, robotic, deadpan', 'light and witty, not comic']),
        S('Waiting for a person', 'person', 'later', ['a clock-like ticking that speeds up, time passing fast', 'patient, then restless', 'ends on a small hopeful lift']),
        S('Too late, they leave', 'later', 'climax', ['the lift falls away in a descending, deflating phrase', 'one soft low accent about two seconds in', 'then wistful, sparse, unresolved, the theme fragmented', 'keeps playing softly throughout']),
        S('Unattended visits', 'climax', 'switch', ['four slow, deep, warm, evenly spaced hits under four captions, each a little bigger', 'a held low pedal between them', 'serious but not dark, no rhythm', 'a sustained pad keeps sounding between the hits',
                                                    'ends on one soft held chord']),
        S('The best salesperson', 'switch', 'built', ['hope arrives: the harmony turns to major', 'the pulse returns and grows', 'warm and human']),
        S('So we built one', 'built', 'burst', ['a short build and riser', 'everything rises to a hit at the very end', 'the last half-beat cuts to silence']),
    ]
def pitch_sections(p):
    return [
        S('Meet Bizmis', 'burst', 'rewind', [f'opens on one big, bright downbeat hit: the main theme in full on {p["lead"]}', 'confident, joyful, premium', 'full groove']),
        S('Lets rewind, one click', 'rewind', 'catalog', ['the groove slows and softens', 'a soft reversed swell', 'ends on one crisp, bright click-like pluck as it installs', 'keeps playing throughout']),
        S('Found the right one', 'catalog', 'compare', ['an inquisitive, nimble variation of the theme', 'light plucks under dialogue', 'low energy so voices sit on top']),
        S('Compared for you', 'compare', 'doubt', ['a thoughtful, slightly more confident turn', 'gentle forward motion', 'resolves on a satisfied cadence']),
        S('Doubt cleared', 'doubt', 'upsell', ['softer and reassuring', 'warm sustained chords, fewer drums', 'a relieved lift at the end']),
        S('Paired perfectly', 'upsell', 'sold', ['bright and playful, a bouncy variation', 'conversational', 'small pickups between phrases']),
        S('Visits become sales', 'sold', 'sync', ['opens on a big celebratory hit', 'the theme in full with claps, joyful lift', 'the strongest moment so far, still light and elegant']),
        S('One click sync', 'sync', 'reel', ['a quick filtered build, charging up', 'tension rising toward a launch', 'resolves into the next section']),
        S('Any store', 'reel', 'slam2', ['a smooth, airy two-bar riser (not frantic) that lands clearly on the downbeat', 'then a new, punchy, driving variation with a strong accent every two beats',
                                          'energetic, modern, room for recorded dialogue', 'different instrumentation from earlier sections'], ['busy melody']),
        S('Second store', 'slam2', 'slam3', ['the arrangement changes on the first beat: a new drum pattern and a new lead colour', 'a hit on the first beat', 'room for dialogue'], ['busy melody']),
        S('Third store', 'slam3', 'slam4', ['changes again on the first beat: lighter, sparkling, airy', 'a hit on the first beat', 'room for dialogue'], ['busy melody']),
        S('Fourth store', 'slam4', 'quick', ['changes again on the first beat: the fullest, most energetic variation so far', 'a hit on the first beat', 'room for dialogue'], ['busy melody']),
        S('Every store', 'quick', 'land', ['four quick cuts, a crisp hit on each, short spoken lines on top', 'light, playful, international flavour', 'building toward a landing'], ['busy melody']),
        S('Your store', 'land', 'ea', ['lands on one big warm chord hit', 'the chord rings while a soft pulse continues', 'anticipation, keeps playing']),
        S('Early Access', 'ea', 'installs', ['a fresh, warm, anthemic final section with a new texture', 'gentle and confident under a voice-over'], ['same groove as before', 'abrupt stop']),
        S('No commitment', 'installs', 'scarce', ['light rolling pulses, a soft accent every two beats', 'rebuilding steadily', 'airy and reassuring'], ['abrupt stop']),
        S('Only fifty spots', 'scarce', 'final', ['a lift: brighter, more urgent, building', 'the last two seconds swell straight into the finale'], ['abrupt stop']),
        S('Finale', 'final', T['end'] + 1.5, ['opens with one big, bright, resolving final chord hit on its very first beat', 'then the chord rings out and lingers to the end', 'nothing new after the hit'],
          ['new melody', 'fade in', 'drums after the hit']),
    ]

NEG = ['silence', 'long pauses', 'ending early', 'fade out', 'vocals', 'choir', 'epic trailer', 'dark', 'horror', 'dubstep', 'EDM drop', 'aggressive', 'cheesy corporate', 'stock music', 'ukulele', 'whistling']
VERSIONS_DEF = {
    1: {'title': 'Glass & Light', 'lead': 'felt piano and a glassy plucked synth',
        'styles': ['premium product film score', 'felt piano and glassy plucked synth motif', 'warm analog pads', 'soft sub-bass pulse', 'tasteful modern percussion',
                   'starts in C minor, turns to E-flat major at the turn', '112 bpm', 'instrumental', 'cinematic but light, elegant, uplifting', 'clean, airy modern mix']},
    2: {'title': 'Two cues: Intimate to Bright', 'lead': 'piano and soft strings', 'split': True,
        'pain': ['premium product film score', 'intimate piano and soft string ensemble', 'C minor', '112 bpm half-time feel', 'instrumental', 'restrained, elegant, human', 'clean mix'],
        'pitch': ['premium product film score', 'bright modern electronic pop', 'plucked synths, warm synth bass, crisp claps, sparkling arpeggios', 'E-flat major', '112 bpm', 'instrumental',
                  'optimistic, confident, polished', 'clean, punchy modern mix'], 'lead2': 'plucked synths and sparkling arpeggios'},
    3: {'title': 'Strings & Pizzicato', 'lead': 'pizzicato strings and celesta',
        'styles': ['premium product film score', 'orchestral pop: pizzicato strings, light string ensemble, piano, celesta, soft claps and light percussion',
                   'starts in C minor, turns to E-flat major at the turn', '112 bpm', 'instrumental', 'warm, witty, uplifting, never bombastic', 'clean intimate mix']},
    4: {'title': 'Warm Groove', 'lead': 'a warm Rhodes electric piano',
        'styles': ['premium product film score', 'warm Rhodes electric piano, deep round sub-bass, crisp minimal electronic drums, airy synth pads, subtle guitar licks',
                   'starts in C minor, turns to E-flat major at the turn', '112 bpm', 'instrumental', 'stylish, smooth, confident, modern', 'clean, warm, punchy mix']},
    5: {'title': 'Indie Pop', 'lead': 'clean electric guitar and glockenspiel',
        'styles': ['premium product film score', 'feel-good indie pop band: clean electric guitars, bass, tight live drums, handclaps, glockenspiel, piano',
                   'starts in C minor, turns to E-flat major at the turn', '112 bpm', 'instrumental', 'bright, human, joyful, playful', 'clean, lively mix']},
}

def compose(plan, dest):
    body = {'composition_plan': plan, 'model_id': 'music_v1', 'respect_sections_durations': True}
    for attempt in range(3):
        req = urllib.request.Request('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192', data=json.dumps(body).encode(),
                                     method='POST', headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=1500) as r: open(dest, 'wb').write(r.read())
            return dest
        except urllib.error.HTTPError as e:
            print('FAIL', dest, e.code, e.read()[:600])
            if e.code in (400, 422): return None
    return None

plans, jobs = {'times': T}, []
for v in VERSIONS:
    d = VERSIONS_DEF[v]
    if d.get('split'):
        pain = {'positive_global_styles': d['pain'], 'negative_global_styles': NEG, 'sections': pain_sections(d)}
        pitch = {'positive_global_styles': d['pitch'], 'negative_global_styles': NEG, 'sections': pitch_sections({**d, 'lead': d['lead2']})}
        plans[f'v{v}'] = {'title': d['title'], 'pain': pain, 'pitch': pitch}
        jobs += [(pain, os.path.join(HERE, 'music', f'{NAME}-v{v}-pain-{k}.mp3')) for k in range(T0, T0 + TAKES)] + [(pitch, os.path.join(HERE, 'music', f'{NAME}-v{v}-pitch-{k}.mp3')) for k in range(T0, T0 + TAKES)]
    else:
        full = {'positive_global_styles': d['styles'], 'negative_global_styles': NEG, 'sections': pain_sections(d) + pitch_sections(d)}
        plans[f'v{v}'] = {'title': d['title'], 'full': full}
        jobs += [(full, os.path.join(HERE, 'music', f'{NAME}-v{v}-full-{k}.mp3')) for k in range(T0, T0 + TAKES)]
for k, p in plans.items():
    if k == 'times': continue
    for part in ('full', 'pain', 'pitch'):
        if part in p:
            short = [s['section_name'] for s in p[part]['sections'] if s['duration_ms'] < 3000]
            if short: print(f'WARN {k} {part}: sections under 3 s: {short}')
json.dump(plans, open(os.path.join(HERE, 'music', f'{NAME}-plan.json'), 'w'), indent=1)
print({k: round(v, 2) for k, v in T.items()})
if not PLAN_ONLY:
    with cf.ThreadPoolExecutor(2) as ex:   # the account allows 2 concurrent requests
        for f in ex.map(lambda j: compose(*j), jobs): print('wrote', f)
