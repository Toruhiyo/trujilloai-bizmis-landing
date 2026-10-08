"""Note detection for generated tonal SFX: onsets (Hilbert envelope) then a
harmonic-product-spectrum pitch per note. python notes.py <files...>"""
import sys, subprocess, numpy as np
from scipy.signal import hilbert, find_peaks, butter, sosfilt
SR = 48000
NAMES = 'C C# D D# E F F# G G# A A# B'.split()
def load(p): return np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).copy()
def pitch(seg, lo=60, hi=3000):
    n = 1 << int(np.ceil(np.log2(max(len(seg), 4096)))); X = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), n * 4)); f = np.fft.rfftfreq(n * 4, 1 / SR)
    hps = X.copy()
    for h in (2, 3):
        d = X[::h]; hps[:len(d)] *= d
    k = (f > lo) & (f < hi); i = np.argmax(np.where(k, hps, 0)); return f[i]
def note(fr): m = 69 + 12 * np.log2(fr / 440); r = int(round(m)); return f'{NAMES[r % 12]}{r // 12 - 1}{(m - r) * 100:+.0f}c', m
def notes(x, lo=60, hi=3000):
    env = sosfilt(butter(2, 30, 'low', fs=SR, output='sos'), np.abs(hilbert(x))); e = env[::240]   # 5 ms steps
    pk, _ = find_peaks(e, distance=16, prominence=e.max() * 0.12)
    out = []
    for p in pk:
        a = p * 240 + int(0.015 * SR); seg = x[a:a + int(0.12 * SR)]
        if len(seg) > 2048: out.append((p * 0.005, *note(pitch(seg, lo, hi)), 20 * np.log10(e[p] / e.max())))
    return out
if __name__ == '__main__':
    for f in sys.argv[1:]:
        lo = 50 if 'lost' in f else 200
        print(f.split('/')[-1], '  '.join(f'{t:.2f}s {n} ({lv:.0f}dB)' for t, n, m, lv in notes(load(f), lo)))
