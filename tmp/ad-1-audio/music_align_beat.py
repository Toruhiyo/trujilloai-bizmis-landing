"""v13: put the pitch cue's beat grid on the reel's cuts. The reel cuts land on
a 112 bpm grid counted from 'reel-in'; this finds the cue's strongest onset
within half a beat of the first 'reel-slam' and moves it exactly onto the
slam by time-stretching (pitch kept) the stretch from the 'One click'
section's start up to that onset. Everything after keeps its timing, so the
cue's own beats then fall on every later cut (same tempo, same phase).

  python music_align_beat.py <pitch.wav> <plan.json> <export dir> <out.wav>
"""
import sys, json, subprocess, numpy as np
SR = 48000
src, plan_p, exp, out = sys.argv[1:5]
ev = json.load(open(f'{exp}/markers.json'))['sfx']
burst = next(e['at'] for e in ev if e['id'] == 'burst') / 1000
slam = next(e['at'] for e in ev if e['id'] == 'reel-slam') / 1000 - burst   # in cue time
secs = json.load(open(plan_p))['pitch']['sections']
names = [s['section_name'] for s in secs]
start = sum(s['duration_ms'] for s in secs[:names.index('One click')]) / 1000
x = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
hop = SR // 200   # 5 ms
rms = np.sqrt(np.convolve(x.mean(1) ** 2, np.ones(hop) / hop, 'same')[::hop]); db = 20 * np.log10(rms + 1e-9)
flux = np.maximum(0, np.diff(db, prepend=db[0]))
beat = 60 / 112
lo, hi = int((slam - beat / 2) * 200), int((slam + beat / 2) * 200)
onset = (lo + int(np.argmax(flux[lo:hi]))) / 200
print(f'slam at cue {slam:.3f}s, nearest strong onset {onset:.3f}s ({(slam - onset) * 1000:+.0f} ms)')
factor = (slam - start) / (onset - start)
assert 0.9 < factor < 1.1, f'stretch {factor:.3f} too large'
t = 1 / factor
seg = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', f'atempo={t:.5f}', '-f', 'f32le', '-'],
                                   input=x[int(start * SR):int(onset * SR)].astype(np.float32).tobytes(), capture_output=True).stdout, np.float32).reshape(-1, 2)
n = int((slam - start) * SR); seg = seg[:n] if len(seg) >= n else np.concatenate([seg, np.zeros((n - len(seg), 2), np.float32)])
y = np.concatenate([x[:int(start * SR)], seg, x[int(onset * SR):]])
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', out], input=y.astype(np.float32).tobytes(), check=True)
print(f'stretched One click..onset by {(factor - 1) * 100:+.2f}%; wrote {out} {len(y) / SR:.2f}s')
