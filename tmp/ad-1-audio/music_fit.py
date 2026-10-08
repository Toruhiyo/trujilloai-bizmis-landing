"""ad-1 music for one export: compose ONE theme with ElevenLabs Music whose
sections follow the picture's own events (markers.json), then fit it so its
drop lands on the switch burst and it lasts to the end of the film.

  python music_fit.py <export folder> <name>     -> music/<name>.mp3, music/<name>-fit.wav
"""
import json, os, sys, subprocess, urllib.request, numpy as np
from scipy.signal import butter, sosfilt
HERE = os.path.dirname(os.path.abspath(__file__)); SR = 48000
EXP, NAME = os.path.abspath(sys.argv[1]), sys.argv[2]
M = json.load(open(os.path.join(EXP, 'markers.json'))); R = json.load(open(os.path.join(EXP, 'report.json')))
ev = lambda k: next((e['at'] / 1000 for e in M['sfx'] if e['id'] == k), None)
DUR = R['durationSeconds']
burst, sold, boost, store, end = ev('burst'), ev('sold'), ev('boost'), ev('store-switch'), ev('ea-logo') or DUR - 14
pitch = burst + 6.5
BUILD = 6.0     # the generated drop tends to land a little after its section start; fitted below
cuts = [('Unattended', 0, burst - BUILD), ('Build to the switch', burst - BUILD, burst), ('Drop and reveal', burst, pitch),
        ('The agent sells', pitch, sold), ('Sold', sold, boost), ('Boost sales', boost, store), ('Any store', store, end), ('Early Access', end, DUR + 4)]
style = {
    'Unattended': (['the main motif played sparse and muted', 'soft ticking pulse', 'curious, slightly tense, light', 'minimal, room for a voice-over'], ['sad', 'minor key', 'drums', 'loud']),
    'Build to the switch': (['rising build', 'filter opening', 'snare roll into a drop', 'anticipation'], ['breakdown']),
    'Drop and reveal': (['the full motif lands on the first beat', 'bright, warm, uplifting', 'claps'], ['fade in', 'slow intro']),
    'The agent sells': (['light playful groove', 'soft plucks and muted bass', 'low energy so dialogue sits on top', 'steady'], ['busy lead melody', 'loud drums']),
    'Sold': (['groove lifts', 'joyful, energetic, claps'], ['quiet']),
    'Boost sales': (['held warm chord', 'filtered, suspended'], ['drums']),
    'Any store': (['driving beat returns', 'building energy, accelerating feel'], ['breakdown']),
    'Early Access': (['warm resolved confident outro', 'gentle groove under a voice-over', 'ends on a final ringing major chord'], ['abrupt stop', 'new theme']),
}
plan = {'positive_global_styles': ['modern tech commercial', 'one recurring plucked-synth motif', '112 bpm', 'major key', 'instrumental', 'clean, confident, warm'],
        'negative_global_styles': ['vocals', 'sad', 'melancholic piano', 'cinematic drama', 'dubstep', 'aggressive'],
        'sections': [{'section_name': n, 'duration_ms': max(3000, int(round((b - a) * 1000))), 'lines': [],
                      'positive_local_styles': style[n][0], 'negative_local_styles': style[n][1]} for n, a, b in cuts]}
mp3 = os.path.join(HERE, 'music', f'{NAME}.mp3')
if not os.path.exists(mp3):
    key = next(l.split('=', 1)[1].strip().strip('"\'') for l in open('/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-project/.env') if l.startswith('ELEVENLABS_API_KEY='))
    req = urllib.request.Request('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192', method='POST',
                                 data=json.dumps({'composition_plan': plan, 'model_id': 'music_v1', 'respect_sections_durations': True}).encode(),
                                 headers={'xi-api-key': key, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=900) as r: open(mp3, 'wb').write(r.read())
x = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', mp3, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
m = x.mean(1)
# the drop: biggest jump in low end within +-4 s of the planned burst
lo = np.abs(m); w = int(0.05 * SR)   # broadband: builds often bring the bass in early; the drop is the full arrangement
env = np.array([np.sqrt(np.mean(lo[i:i + w] ** 2)) for i in range(0, len(lo) - w, w)])
# the drop: where the low end steps up most between the 2 s before and the 2 s after
lev = 20 * np.log10(env + 1e-6); k = 40
cands = range(max(k, int((burst - 4) / 0.05)), min(len(lev) - k, int((burst + 4) / 0.05)))
# ...and of those steps, the first that reaches the post-drop plateau (the build ramps up but stays below it)
plateau = max(lev[i:i + 20].mean() for i in cands)
drop = next(i for i in cands if lev[i:i + 20].mean() >= plateau - 1.5) * 0.05
# tempo and a seamless 4-bar loop before the generated ending, to reach the film's end
hop = 480; fr = np.abs(m[:len(m) // hop * hop]).reshape(-1, hop).mean(1); on = np.maximum(0, np.diff(fr)); seg = on[int(40 * 100):int(min(len(on) / 100 - 10, 100) * 100)]; seg = seg - seg.mean()
ac = np.correlate(seg, seg, 'full')[len(seg) - 1:]; lag = np.arange(len(ac)) / 100; bar = lag[np.argmax(ac * ((lag > 2.0) & (lag < 2.3)))]
start = drop - burst; need = DUR + start + 3 - len(x) / SR
if need > 0:
    loops = int(np.ceil(need / (4 * bar))); L = loops * 4 * bar; best = None
    for T in np.arange(len(x) / SR - 14, len(x) / SR - 7, 0.25):
        for l in np.arange(L - 0.04, L + 0.04, 0.0005):
            p, q = m[int(T * SR):int((T + 0.5) * SR)], m[int((T - l) * SR):int((T - l + 0.5) * SR)]
            c = np.dot(p, q) / (np.sqrt(np.dot(p, p) * np.dot(q, q)) + 1e-9)
            if best is None or c > best[0]: best = (c, T, l)
    c, T, l = best; S, LP, XF = int(T * SR), int(l * SR), int(0.03 * SR); ramp = np.linspace(0, 1, XF)[:, None]
    tail = x[S - LP:].copy(); tail[:XF] = x[S:S + XF] * (1 - ramp) + tail[:XF] * ramp; x = np.concatenate([x[:S], tail])
    print(f'extended {L:.2f}s at {T:.2f} (corr {c:.2f})')
i = int(round(start * SR)); y = x[i:] if i >= 0 else np.concatenate([np.zeros((-i, 2), np.float32), x])
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le',
                os.path.join(HERE, 'music', f'{NAME}-fit.wav')], input=y.astype(np.float32).tobytes(), check=True)
print(f'burst {burst:.2f}  drop in file {drop:.2f}  bpm {240 / bar:.1f}  fitted {len(y) / SR:.1f}s (film {DUR:.1f}s)')
