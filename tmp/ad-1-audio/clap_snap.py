"""Snap the stores reel's accelerating cut ladder onto a Suno take's real clap hits.
Cut times are relative to the reel start = the extension's first sample (a bar line).
  venv/python clap_snap.py <takes...>   -> prints per-take snap errors + the snapped list (json)"""
import sys, json, numpy as np, librosa, scipy.signal as ss
BEAT = 60 / 112.3
LADDER = [7, 6, 5.5, 5.25, 4] + [2.5, 2.25, 2, 1.75, 1.5, 1.25, 1.25, 0.75, 0.75, 0.5, 0.5, 0.5, 0.5, 0.25, 0.25, 0.25, 0.25, 0.25]
# boundaries: tunnel(7) -> 4 heroes -> 18 run cards -> Your store  (cumulative beats)
cum = np.cumsum([0] + LADDER)[1:]   # the time of each cut after the reel start: first hero lands at 7 beats ... Your store last
out = {}
for f in sys.argv[1:]:
    y, sr = librosa.load(f, sr=22050); hop = 64
    S = np.abs(librosa.stft(y, n_fft=1024, hop_length=hop)); fr = librosa.fft_frequencies(sr=sr, n_fft=1024)
    band = S[(fr > 1500) & (fr < 6000)].sum(0); env = np.maximum(0, np.diff(np.log1p(band), prepend=0)); env = np.convolve(env, np.ones(5) / 5, 'same')
    t = np.arange(len(env)) * hop / sr
    pk, pr = ss.find_peaks(env, height=np.percentile(env, 85), distance=int(0.05 * sr / hop)); pt = t[pk]; ph = pr['peak_heights']
    def fit(phi):
        e = 0
        for c in cum * BEAT + phi:
            d = np.min(np.abs(pt - c)); e += min(d, 0.12)
        return e
    phi = min(np.arange(0, 2 * BEAT, 0.005), key=fit)
    snaps, errs = [], []
    for c in cum * BEAT + phi:
        m = np.abs(pt - c) < 0.16
        if m.any():   # the strongest clap near the planned cut
            i = np.argmax(np.where(m, ph, -1)); snaps.append(round(float(pt[i]), 3)); errs.append(abs(pt[i] - c))
        else: snaps.append(round(float(c), 3)); errs.append(0.2)
    gaps = np.diff([0] + snaps)
    mono = sum(1 for a, b in zip(gaps[5:], gaps[6:]) if b > a + 0.03)   # run gaps that grow (breaks the acceleration)
    print(f'{f.split("/")[-1]}: phase {phi:.3f}s, mean err {np.mean(errs) * 1000:.0f} ms, missed {sum(e >= 0.2 for e in errs)}, run gaps that grow {mono}, Your store at {snaps[-1]:.2f}s')
    out[f] = snaps
json.dump(out, open('music/suno/clap_snaps.json', 'w'), indent=1)
