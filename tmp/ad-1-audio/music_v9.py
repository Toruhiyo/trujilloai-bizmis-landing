"""ad-1 v9 score: two cues composed to the picture (ElevenLabs Music, section
durations respected). The pain cue runs from 0 to the burst; the pitch cue from
the burst to the last frame. Every section boundary is a film event read from
the export's markers.json, so a re-cut re-times the score.

  python music_v9.py <export dir> <name> [pain|pitch|both] [takes]
"""
import json, os, sys, urllib.request, urllib.error, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__))
ENV = '/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-project/.env'
KEY = next(l.split('=', 1)[1].strip().strip('"\'') for l in open(ENV) if l.startswith('ELEVENLABS_API_KEY='))
EXP, NAME = sys.argv[1], sys.argv[2]
WHICH = sys.argv[3] if len(sys.argv) > 3 else 'both'
TAKES = int(sys.argv[4]) if len(sys.argv) > 4 else 2
M = json.load(open(os.path.join(EXP, 'markers.json')))
REP = json.load(open(os.path.join(EXP, 'report.json')))
DUR = REP['durationSeconds']
ev = sorted(M['sfx'], key=lambda e: e['at'])
first = lambda k: next(e['at'] / 1000 for e in ev if e['id'] == k)
allof = lambda k: [e['at'] / 1000 for e in ev if e['id'] == k]
voice = {v['src'].rsplit('/', 1)[-1].split('.')[0]: (v['atMs'] / 1000, v['endMs'] / 1000) for v in M['voice']}
lost = allof('lost-close'); beats = allof('climax-beat'); burst = first('burst')
t = {
    'lost1': lost[0], 'lost2': lost[1], 'climax': beats[0] - 0.3, 'climax_end': beats[-1] + 2.0,
    'switch': voice['t-switch'][0], 'flip': first('toggle'), 'burst': burst,
    'rewind': first('rewind'), 'install': next((e['at'] / 1000 for e in ev if e['id'] == 'install'), None) or first('clerk-in'), 'sold': first('sold'),   # v10: the drop-in has no 'install' tick
    'sync': voice['t-sync'][0] - 0.2, 'reel': first('reel-in'), 'whip': next((e['at'] / 1000 for e in ev if e['id'] in ('reel-quick', 'reel-whip')), None), 'slam1': next((e['at'] / 1000 for e in ev if e['id'] == 'reel-slam'), None), 'land': next((e['at'] / 1000 for e in ev if e['id'] == 'reel-land'), None), 'dive': first('dive'), 'ea': voice['t-ea'][0], 'end': DUR,
}
S = lambda name, a, b, pos, neg=(): {'section_name': name, 'duration_ms': int(round((b - a) * 1000)), 'lines': [],
                                     'positive_local_styles': list(pos), 'negative_local_styles': list(neg)}
pain = {
    'positive_global_styles': ['premium tech product film score', 'felt piano and warm analog pad', 'D minor', '84 bpm',
                               'instrumental', 'intimate, restrained, elegant', 'clean modern mix', 'audible on laptop speakers'],
    'negative_global_styles': ['vocals', 'epic trailer', 'dubstep', 'distorted', 'cheesy', 'horror', 'loud drums', 'silence'],
    'sections': [
        S('Shoppers walk in', 0, t['lost1'], ['a simple, memorable felt-piano motif from the very first second', 'soft warm pad', 'gentle heartbeat-like pulse', 'curious, inviting, present']),
        S('Lost in the catalog', t['lost1'], t['lost2'], ['the motif continues with a light ticking pulse', 'slightly uneasy harmony', 'sparse, space for a voice-over']),
        S('So they leave', t['lost2'], t['climax'], ['thins out to piano and a suspended pad', 'quiet, wistful, unresolved']),
        S('Unattended visits', t['climax'], t['switch'], ['a low sustained swell under four slow captions', 'dark, serious, held pedal note', 'no rhythm', 'ends on a soft held chord, calm before a turn']),
        S('A good salesperson', t['switch'], t['burst'] - 3.0, ['hopeful anticipation building', 'pulse returns and grows', 'harmony brightens toward major', 'rising energy']),
        S('So we built one', t['burst'] - 3.0, t['burst'], ['a short tense riser and snare roll', 'everything builds to a hit at the very end', 'the last beat cuts to silence']),
    ],
}
pitch = {
    'positive_global_styles': ['premium tech product film score', 'modern, bright, optimistic', 'E-flat major', '112 bpm', 'instrumental',
                               'plucked synth and felt piano motif, soft claps, warm bass', 'polished tech product launch', 'clean modern mix'],
    'negative_global_styles': ['vocals', 'epic trailer', 'dubstep', 'aggressive', 'cheesy', 'EDM drop', 'busy lead melody'],
    'sections': [
        S('Meet Bizmis', t['burst'], t['rewind'], ['the full motif lands on the very first beat', 'bright, warm, uplifting, confident', 'claps and a pulsing bass']),
        S('Lets rewind', t['rewind'], t['install'], ['a tape-stop: the groove winds down and pauses', 'a soft reversed swell', 'then a single soft pluck']),
        S('The agent sells', t['install'], t['sold'], ['light playful groove under dialogue', 'soft plucks and muted bass', 'low energy so voices sit on top', 'small lifts every eight bars'],
          ['loud drums', 'busy melody']),
        S('Visits become sales', t['sold'], t['sync'], ['the groove lifts', 'joyful, celebratory, claps', 'the motif in full']),
        S('One click', t['sync'], t['reel'], ['a quick filtered build', 'charging-up energy', 'resolves into the next section']),
        *([S('Any store', t['reel'], t['whip'], ['opens with a fast two-bar riser that hits hard on the downbeat', 'then a powerful, punchy driving groove with strong accents every two beats',
                                               'epic, energetic, modern', 'room for recorded dialogue on top'],
             ['busy melody', 'distorted']),
           S('Every store', t['whip'], t['land'], ['a rising build that quickens, a hit on every beat', 'accelerating drums and fills', 'energy climbing fast toward a landing']),
           S('Your store', t['land'], t['ea'], ['the build lands on one big warm chord hit', 'then a short breath of anticipation'])]
          if t['whip'] and t['land'] and t['land'] - t['whip'] >= 3 and t['ea'] - t['land'] >= 3 else
          [S('Any store', t['reel'], t['ea'] - 3.0, ['driving light groove', 'steady, confident, forward motion', 'sparse enough for recorded dialogue on top', 'subtle variation every eight bars'],
             ['loud drums', 'busy melody']),
           S('Your store', t['ea'] - 3.0, t['ea'], ['a short lift and swell', 'anticipation'])]),
        # 1.5 s past the last frame: the model lands its final chord ~2 s before a section ends, so it now rings through the end
        S('Early Access', t['ea'], t['end'] + 1.5, ['warm, resolved, confident outro under a voice-over', 'gentle groove that keeps going to the end', 'a final ringing major chord in the last two seconds'],
          ['abrupt stop', 'new theme', 'fade out early']),
    ],
}
def compose(plan, dest):
    body = {'composition_plan': plan, 'model_id': 'music_v1', 'respect_sections_durations': True}
    req = urllib.request.Request('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192', data=json.dumps(body).encode(),
                                 method='POST', headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=1200) as r: open(dest, 'wb').write(r.read())
    except urllib.error.HTTPError as e:
        print('FAIL', dest, e.code, e.read()[:600]); return None
    return dest
jobs = []
for kind, plan in (('pain', pain), ('pitch', pitch)):
    if WHICH not in ('both', kind): continue
    for k in range(TAKES): jobs.append((plan, os.path.join(HERE, 'music', f'{NAME}-{kind}-{k}.mp3')))
json.dump({'times': t, 'pain': pain, 'pitch': pitch}, open(os.path.join(HERE, 'music', f'{NAME}-plan.json'), 'w'), indent=1)
with cf.ThreadPoolExecutor(2) as ex:   # the account allows 2 concurrent requests
    for f in ex.map(lambda j: compose(*j), jobs): print('wrote', f)
