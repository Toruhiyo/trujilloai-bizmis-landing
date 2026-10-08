"""v13: land the pitch cue's final chord exactly on the film's closing hit.
The cadence (strongest onset in the cue's last 12 s of sound) is moved onto
the 'ea-final' marker by time-stretching (pitch kept) the stretch between the
last section's start and the cadence; the chord and its ring-out are kept as is.

  python music_land_final.py <pitch.wav> <plan.json> <export dir> <out.wav>
"""
import sys, json, subprocess, numpy as np
from scipy.signal import find_peaks
SR = 48000
src, plan_p, exp, out = sys.argv[1:5]
M = json.load(open(f'{exp}/markers.json'))
ev = M['sfx']
burst = next(e['at'] for e in ev if e['id'] == 'burst') / 1000
final = next(e['at'] for e in ev if e['id'] == 'ea-final') / 1000
secs = json.load(open(plan_p))['pitch']['sections']
last0 = sum(s['duration_ms'] for s in secs[:-1]) / 1000   # the last section's start, in cue time
x = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
hop = SR // 100
rms = np.sqrt(np.convolve(x.mean(1) ** 2, np.ones(hop) / hop, 'same')[::hop]); db = 20 * np.log10(rms + 1e-9)
audible = np.flatnonzero(db > db.max() - 40); last = audible[-1] / 100
flux = np.maximum(0, np.diff(db)); t0 = int((last - 12) * 100)
pk, _ = find_peaks(flux[t0:int(last * 100)], distance=40)
cad = (t0 + pk[np.argmax(flux[t0 + pk])]) / 100
import os
cad = float(os.environ.get('CAD', cad))   # the fit's own 'final chord at' when known
want = final - burst
print(f'cadence at {cad:.2f}s (film {burst + cad:.2f}s), hit at film {final:.2f}s -> shift {want - cad:+.2f}s')
a, b = int(last0 * SR), int(cad * SR)
factor = (want - last0) / (cad - last0)
assert 0.85 < factor < 1.18, f'stretch {factor:.3f} too large: re-fit the cue instead'
t = 1 / factor; chain = []
while t < 0.5: chain.append('atempo=0.5'); t /= 0.5
while t > 2.0: chain.append('atempo=2.0'); t /= 2.0
chain.append(f'atempo={t:.5f}')
seg = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', ','.join(chain), '-f', 'f32le', '-'],
                                   input=x[a:b].astype(np.float32).tobytes(), capture_output=True).stdout, np.float32).reshape(-1, 2)
n = int((want - last0) * SR); seg = seg[:n] if len(seg) >= n else np.concatenate([seg, np.zeros((n - len(seg), 2), np.float32)])
y = np.concatenate([x[:a], seg, x[b:]])
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', out], input=y.astype(np.float32).tobytes(), check=True)
print(f'stretch {(factor - 1) * 100:+.1f}% over the last section; wrote {out} {len(y) / SR:.2f}s')
