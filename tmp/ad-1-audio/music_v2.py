"""ad-1 v2 music: ONE composition, one tempo and key, so the switch opens the
same theme instead of cutting to another track. Section lengths follow the v2b
picture (burst at 31.45 s). Run: python music_v2.py [name]"""
import json, os, sys, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
ENV = '/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-project/.env'
KEY = next(l.split('=', 1)[1].strip().strip('"\'') for l in open(ENV) if l.startswith('ELEVENLABS_API_KEY='))
S = lambda name, ms, pos, neg=(): {'section_name': name, 'duration_ms': ms, 'lines': [],
                                     'positive_local_styles': list(pos), 'negative_local_styles': list(neg)}
plan = {
    'positive_global_styles': ['modern tech commercial', 'one recurring plucked-synth motif', '112 bpm', 'major key', 'instrumental',
                               'clean, confident, warm'],
    'negative_global_styles': ['vocals', 'sad', 'melancholic piano', 'cinematic drama', 'dubstep', 'aggressive'],
    'sections': [
        S('Unattended', 25500, ['the main motif played sparse and muted', 'soft ticking pulse', 'curious, slightly tense, light',
                                'minimal, lots of space for a voice-over'], ['sad', 'minor key', 'drums', 'loud']),
        S('Build to the switch', 5950, ['rising build', 'filter opening', 'snare roll into a drop', 'anticipation'], ['breakdown']),
        S('Drop and reveal', 6550, ['the full motif lands on the first beat', 'bright, warm, uplifting', 'claps'], ['fade in', 'slow intro']),
        S('The agent sells', 33300, ['light playful groove', 'soft plucks and muted bass', 'low energy so dialogue sits on top', 'steady'],
          ['busy lead melody', 'loud drums']),
        S('Sold', 6700, ['groove lifts', 'joyful, energetic, claps'], ['quiet']),
        S('Boost sales', 4500, ['held warm chord', 'filtered, suspended'], ['drums']),
        S('Any store', 14500, ['driving beat returns', 'building energy, accelerating feel'], ['breakdown']),
        S('Early Access', 15200, ['warm resolved confident outro', 'gentle groove under a voice-over', 'ends on a final ringing major chord'],
          ['abrupt stop', 'new theme']),
    ],
}
name = sys.argv[1] if len(sys.argv) > 1 else 'v2'
dest = os.path.join(HERE, 'music', f'{name}.mp3')
req = urllib.request.Request('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192',
                             data=json.dumps({'composition_plan': plan, 'model_id': 'music_v1', 'respect_sections_durations': True}).encode(),
                             method='POST', headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
with urllib.request.urlopen(req, timeout=900) as r: open(dest, 'wb').write(r.read())
print('wrote', dest)
