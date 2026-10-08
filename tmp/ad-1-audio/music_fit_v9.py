"""Fit a composed pitch cue's ending to the film: the model lands its final
cadence a few seconds early, so the bars just before the cadence repeat (whole
bars, on the beat grid) until the final chord rings through the last frame.

  python music_fit_v9.py <in.mp3> <film seconds the cue must cover> <out.wav>
"""
import os, sys, subprocess, numpy as np
from scipy.signal import find_peaks
SR = 48000
src, need, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
x = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
mono = np.abs(x).mean(1); hop = SR // 100
env = np.array([mono[i:i + hop].max() for i in range(0, len(mono) - hop, hop)])
lead = int(np.argmax(env > env[:300].max() * 0.4)) * hop - SR // 100
x = x[max(0, lead):]
rms = np.sqrt(np.convolve((x.mean(1) ** 2), np.ones(hop) / hop, 'same')[::hop])
db = 20 * np.log10(rms + 1e-9)
audible = np.flatnonzero(db > db.max() - 40); last = audible[-1] / 100
# beat period from the onset envelope's autocorrelation (90-140 bpm), over the last 40 s
flux = np.maximum(0, np.diff(db)); seg = flux[-4000:] - flux[-4000:].mean()
ac = np.correlate(seg, seg, 'full')[len(seg) - 1:]
BPM = [float(v) for v in sys.argv[4].split('-')] if len(sys.argv) > 4 else [90, 140]   # e.g. 105-122 when the cue's tempo is known
lo, hi = int(60 / BPM[1] * 100), int(60 / BPM[0] * 100) + 1
beat = (lo + int(np.argmax(ac[lo:hi]))) / 100
# the final cadence: the strongest onset in the last 12 s of sound
tail0 = int((last - 12) * 100); pk, _ = find_peaks(flux[tail0:int(last * 100)], distance=int(beat * 100 * 0.8))
cad = (tail0 + pk[np.argmax(flux[tail0 + pk])]) / 100
short = need - last
target = float(os.environ.get('TARGET', need - 1.8))   # v13: TARGET = where the film's closing hit is, in cue seconds
bars = min((0, 2, 4, 6), key=lambda n: abs(cad + n * 4 * beat - target))   # whole phrases (even bars)   # whole bars: the final chord lands ~1.2 s before the last frame and rings through it
bars = int(os.environ.get("FIT_BARS", bars))   # FIT_BARS=0 when a native take already rings through the end
span = bars * 4 * beat
a, b = int((cad - span) * SR), int(cad * SR)
f = int(0.025 * SR)   # seams are equal-power crossfades (no dip on the downbeat)
fi = np.sin(np.linspace(0, np.pi / 2, f))[:, None]; fo = np.cos(np.linspace(0, np.pi / 2, f))[:, None]
def join(p, q):
    return np.concatenate([p[:-f], p[-f:] * fo + q[:f] * fi, q[f:]])
y = join(join(x[:b + f], x[a:b + f]), x[b:]) if span > 0 else x.copy()
y = y[:int(need * SR)]; g = int(0.35 * SR); y[-g:] *= np.linspace(1, 0, g)[:, None] ** 1.5
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', out], input=y.astype(np.float32).tobytes(), check=True)
print(f'lead {lead / SR:.2f}s, beat {beat:.3f}s ({60 / beat:.1f} bpm), cadence at {cad:.2f}s, sound until {last:.1f}s; '
      f'need {need:.1f}s -> repeated {bars} bars ({span:.2f}s) before the cadence; final chord at {cad + span:.2f}s')
