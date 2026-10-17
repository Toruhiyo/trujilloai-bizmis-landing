"""v30 final score, written to the picture (film = output time; no stretch).
  1. 0 -> SPLICE: the take-1 pitch fix (aee16931: 52-62 s replaced, so its tail runs 40 ms early)
  2. SPLICE -> END_AT: the final chain (15af8ac6: K2 pulse, stores S, ending T), read 40 ms ahead
     (aee(t) == final(t + 0.040) from 64.1 s to 86.3 s, so the splice is seamless)
  3. END_AT: straight onto the ending's big hit (its pickup cut out), ring-out to the end
  python build_final_v30.py <out.wav> [end hit s]"""
import sys, subprocess, numpy as np
SR = 48000; OFF = 0.040; SPLICE = 75.0; END_AT = float(sys.argv[2]) if len(sys.argv) > 2 else 124.87; HIT = 125.5076 - 0.004   # v31: the close moved to 125.40
def load(p): return np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2)
P, F = load('v30-pitchfix-aee16931.wav'), load('v30-final-15af8ac6.wav')
def xfade(a, b, n):
    r = np.linspace(0, 1, n)[:, None]; return np.concatenate([a[:-n], a[-n:] * (1 - r) + b[:n] * r, b[n:]])
s = int(SPLICE * SR); o = int(OFF * SR)
y = xfade(P[:s + 240], F[s + o:], 240)                     # 5 ms over identical audio
e = int(END_AT * SR); h = int(HIT * SR)
y = xfade(y[:e + 192], F[h:], 192)                         # 4 ms into the hit's own transient
t = int(2.0 * SR); y = y[:e + t]; g = int(0.4 * SR); y[-g:] *= np.linspace(1, 0, g)[:, None] ** 2
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', sys.argv[1]], input=y.astype(np.float32).tobytes(), check=True)
print(sys.argv[1], f'{len(y) / SR:.3f}s: splice {SPLICE}s (+{OFF * 1000:.0f} ms), end hit at {END_AT}s')
