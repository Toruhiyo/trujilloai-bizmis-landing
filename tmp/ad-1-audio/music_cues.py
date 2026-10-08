"""ad-1 music as two cues so the mood flips exactly on the switch burst:
  pain  - minimal, polished, curious (not sad), room for the narrator
  pitch - bright, clean, confident modern product-film pop, drop on its first beat
  python music_cues.py pain <name> <seconds>
  python music_cues.py pitch <name> <export folder>      (sections follow the picture's events)
"""
import json, os, sys, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
KEY = next(l.split('=', 1)[1].strip().strip('"\'') for l in open('/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-project/.env') if l.startswith('ELEVENLABS_API_KEY='))
G_NEG = ['piano melody', 'lead melody', 'ukulele', 'hand claps', 'corporate', 'explainer video music', 'vocals', 'sad', 'melancholic', 'dramatic', 'cinematic trailer', 'dubstep', 'aggressive', 'weird', 'atonal', 'detuned', 'sci-fi', 'eerie']
sec = lambda name, ms, pos, neg=(): {'section_name': name, 'duration_ms': int(ms), 'lines': [], 'positive_local_styles': list(pos), 'negative_local_styles': list(neg)}
kind, name = sys.argv[1], sys.argv[2]
if kind == 'pain':
    total = float(sys.argv[3]) * 1000
    plan = {'positive_global_styles': ['minimal polished modern tech product film score', 'soft felt piano', 'warm analog pads', 'gentle pulsing synth',
                                       'light glassy textures', 'clean, airy, high-end', 'intimate and thoughtful, curious', '96 bpm', 'major key', 'instrumental'],
            'negative_global_styles': G_NEG + ['drums kit', 'loud'],
            'sections': [sec('Every day', total * 0.45, ['sparse felt piano motif', 'soft pulse', 'curious, light']),
                         sec('Lost and doubt', total * 0.35, ['the motif repeats, gentle tension', 'subtle ticking texture'], ['resolution']),
                         sec('They leave', total * 0.20, ['thins out to a held soft pad', 'a quiet breath before something new'], ['drums', 'build'])]}
else:
    exp = os.path.abspath(sys.argv[3])
    M = json.load(open(os.path.join(exp, 'markers.json'))); R = json.load(open(os.path.join(exp, 'report.json')))
    ev = lambda k: next((e['at'] / 1000 for e in M['sfx'] if e['id'] == k), None)
    dur = R['durationSeconds']; burst, sold, boost, store = ev('burst'), ev('sold'), ev('boost'), ev('store-switch')
    end = ev('ea-logo') or dur - 14
    cuts = [('Reveal', burst, burst + 8, ['the full groove lands on the very first beat', 'bright, warm, confident', 'tight claps, snappy kick'], ['fade in', 'intro']),
            ('The agent sells', burst + 8, sold, ['light playful groove', 'warm electric piano chords, bouncy synth bass', 'low energy so dialogue sits on top'], ['busy lead']),
            ('Sold', sold, store, ['groove lifts, joyful', 'claps and bright plucks'], []),
            ('Any store', store, end, ['driving, building, accelerating feel'], ['breakdown']),
            ('Early Access', end, dur + 4, ['warm, resolved, confident outro under a voice-over', 'ends on a final ringing major chord'], ['abrupt stop'])]
    # direction C, rhythm-led: the groove carries it, piano only as sparse stabs
    plan = {'positive_global_styles': ['rhythm-led minimal modern pop', 'tight dry punchy drums and a deep bass groove', 'sparse piano chord stabs as accents only',
                                       'percussive, very little melody', 'elegant, restrained, confident', '104 bpm', 'major key', 'instrumental'],
            'negative_global_styles': G_NEG,
            'sections': [sec(n, max(3000, (b - a) * 1000), p, q) for n, a, b, p, q in cuts]}
req = urllib.request.Request('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192', method='POST',
                             data=json.dumps({'composition_plan': plan, 'model_id': 'music_v1', 'respect_sections_durations': True}).encode(),
                             headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
dest = os.path.join(HERE, 'music', f'{name}.mp3')
with urllib.request.urlopen(req, timeout=900) as r: open(dest, 'wb').write(r.read())
print('wrote', dest)
