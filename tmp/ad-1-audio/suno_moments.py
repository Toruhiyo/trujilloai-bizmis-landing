"""Analyse Suno chapter takes against the film's moments: tempo/beat grid, per-moment
loudness/brightness/percussion, and the take's own biggest arrangement changes
(so the chain's extend points and the picture can be snapped to real bar lines).
  venv/python suno_moments.py <marks "t:name,t:name,..."> <files...>"""
import sys, numpy as np, librosa
marks = [(float(a), b) for a, b in (m.split(':', 1) for m in sys.argv[1].split(','))]
for f in sys.argv[2:]:
    y, sr = librosa.load(f, sr=22050); hop = 512; L = len(y) / sr
    on = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    tempo, beats = librosa.beat.beat_track(onset_envelope=on, sr=sr, hop_length=hop, start_bpm=112, tightness=300)
    bt = librosa.frames_to_time(beats, sr=sr, hop_length=hop); T = float(np.median(np.diff(bt)))
    lo = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop, fmax=200); ph = int(np.argmax([lo[beats[p::4]].mean() for p in range(4)])); bars = bt[ph::4]
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]; db = 20 * np.log10(rms + 1e-9); t = np.arange(len(rms)) * hop / sr
    cen = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop)[0]
    H, P = librosa.effects.hpss(y); pr = librosa.feature.rms(y=P, hop_length=hop)[0]
    print(f'{f.split("/")[-1]}  {L:.1f}s  {60 / T:.1f} bpm  first bar {bars[0]:.2f}s  bar {4 * T:.3f}s  quiet {np.sum(db < np.percentile(db, 95) - 35) * hop / sr:.1f}s')
    for (a, n), (b, _) in zip(marks, marks[1:] + [(L, '')]):
        m = (t >= a) & (t < min(b, L))
        if m.any(): print(f'   {n:10s} {a:5.1f}  {db[m].mean():6.1f}dB  bright {cen[m].mean():5.0f}  perc {pr[m].mean() / rms[m].mean():.2f}')
    def chg(x, w=1.5):
        a = (t >= x - w) & (t < x); b = (t >= x) & (t < x + w)
        return abs(db[b].mean() - db[a].mean()) / 3 + abs(np.log(cen[b].mean() / cen[a].mean())) * 2 + abs(np.log(pr[b].mean() / pr[a].mean()))
    xs = np.arange(1.5, L - 1.5, 0.1); c = np.array([chg(x) for x in xs]); keep = []
    for i in np.argsort(-c):
        if all(abs(xs[i] - k) > 2.5 for k in keep): keep.append(xs[i])
        if len(keep) >= 9: break
    print('   changes: ' + ', '.join(f'{k:.1f}' for k in sorted(keep)))
    print('   bars near 40.8: ' + ', '.join(f'{b:.2f}' for b in bars if 36 < b < 46))
