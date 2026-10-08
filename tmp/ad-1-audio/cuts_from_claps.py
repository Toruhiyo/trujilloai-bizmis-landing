"""Choose the stores reel's cut times FROM a Suno take's real clap hits (picture follows the
music): every cut sits exactly on a detected clap; gaps never grow (continuous acceleration);
hero / quick-voice windows keep their minimum lengths; "Your store" lands on the take's
biggest impact. Times are relative to the reel start (= the extension's first sample).
  venv/python cuts_from_claps.py <take.mp3> [out.json]"""
import sys, json, numpy as np, librosa, scipy.signal as ss
f = sys.argv[1]; BEAT = 60 / 112.3
MINS = [3.2, 3.0, 2.85, 1.95] + [1.35, 0.15, 1.0, 0.15, 0.75, 0.12, 0.62] + [0.1] * 11   # 4 heroes, quick/flash x7, 11 more cards
TARGET = [6, 5.5, 5.25, 4, 2.5, 2.25, 2, 1.75, 1.5, 1.25, 1.25, 0.75, 0.75, 0.5, 0.5, 0.5, 0.5, 0.25, 0.25, 0.25, 0.25, 0.25]
y, sr = librosa.load(f, sr=22050); hop = 64
S = np.abs(librosa.stft(y, n_fft=1024, hop_length=hop)); fr = librosa.fft_frequencies(sr=sr, n_fft=1024)
band = S[(fr > 1500) & (fr < 6000)].sum(0); env = np.maximum(0, np.diff(np.log1p(band), prepend=0)); env = np.convolve(env, np.ones(5) / 5, 'same')
t = np.arange(len(env)) * hop / sr
pk, pr = ss.find_peaks(env, height=np.percentile(env, 80), distance=int(0.05 * sr / hop)); pt = t[pk]; ph = pr['peak_heights'] / pr['peak_heights'].max()
rms = librosa.feature.rms(y=y, hop_length=256)[0]; rt = np.arange(len(rms)) * 256 / sr
lo = librosa.onset.onset_strength(y=y, sr=sr, hop_length=256, fmax=250)
win = (rt > 20) & (rt < 29); imp = float(rt[win][np.argmax((lo[:len(rt)] * rms)[win])])   # the biggest low-end hit around the planned Your store
first = 7 * BEAT   # the tunnel's length (first hero lands here)
c0 = pt[np.argmin(np.abs(pt - first) - 0.3 * ph)]
cuts = [float(c0)]; prev_gap = 99
budget = imp - c0; scale = budget / sum(TARGET) * 1 / BEAT   # stretch the planned ladder so its last cut is the impact
for i, (tg, mn) in enumerate(zip(TARGET, MINS)):
    want = cuts[-1] + tg * BEAT * scale
    lo_t = cuts[-1] + mn; hi_t = cuts[-1] + min(prev_gap, max(mn, tg * BEAT * scale * 1.35)) + 1e-6
    if i == len(TARGET) - 1: cand = np.array([imp])
    else:
        m = (pt >= lo_t) & (pt <= hi_t); cand = pt[m]
        if not len(cand): cand = np.array([max(lo_t, min(want, hi_t))])
    sc = -np.abs(cand - want) / BEAT + 0.4 * (np.interp(cand, pt, ph) if len(pt) else 0)
    c = float(cand[np.argmax(sc)]); prev_gap = c - cuts[-1]; cuts.append(c)
gaps = np.diff(cuts)
print(f'{f.split("/")[-1]}: first hero {cuts[0]:.3f}s, Your store (impact) {imp:.3f}s, cuts {len(cuts)}')
print('   gaps (s):  ' + ' '.join(f'{g:.2f}' for g in gaps))
print('   on a detected clap: ' + ''.join('x' if np.min(np.abs(pt - c)) < 0.01 else '.' for c in cuts))
if len(sys.argv) > 2: json.dump({'take': f, 'cuts_s': [round(c, 3) for c in cuts], 'impact_s': round(imp, 3)}, open(sys.argv[2], 'w'), indent=1)
