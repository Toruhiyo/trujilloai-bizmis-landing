"""Per-section profile of each one-track take (planned sections, music time):
loudness, brightness, onset density, percussive share; silences; and the
biggest real change near each boundary (so the picture can be snapped to it).
  venv/python music_profile_v18.py <name> <glob>"""
import sys, os, glob, json, numpy as np, librosa
HERE = os.path.dirname(os.path.abspath(__file__)); NAME, PAT = sys.argv[1], sys.argv[2]
P = json.load(open(os.path.join(HERE, 'music', f'{NAME}-plan.json'))); secs = P['full']['sections']
b, t = [], 0
for s in secs: b.append((s['section_name'], t, t + s['duration_ms'] / 1000)); t += s['duration_ms'] / 1000
for f in sorted(glob.glob(os.path.join(HERE, 'music', f'{NAME}-{PAT}.mp3'))):
    y, sr = librosa.load(f, sr=22050); hop = 512
    H, Pc = librosa.effects.hpss(y)
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]; prm = librosa.feature.rms(y=Pc, hop_length=hop)[0]
    cen = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop)[0]
    on = librosa.onset.onset_detect(y=y, sr=sr, hop_length=hop, units='time')
    ft = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
    db = 20 * np.log10(rms + 1e-9); sil = np.sum(db < np.percentile(db, 95) - 35) * hop / sr
    print(os.path.basename(f), f'len {len(y) / sr:.1f}s, quiet {sil:.1f}s')
    for n, a, e in b[:-1]:
        m = (ft >= a) & (ft < e)
        print(f'   {n[:24]:24s} {a:6.1f} {np.mean(db[m]):6.1f}dB  bright {np.mean(cen[m]):5.0f}  onsets/s {np.sum((on >= a) & (on < e)) / (e - a):4.1f}  perc {np.mean(prm[m]) / np.mean(rms[m]):.2f}')
    # the loudness jump near the burst (2 s windows) and its best spot
    def jump(x): return np.mean(db[(ft >= x) & (ft < x + 2)]) - np.mean(db[(ft >= x - 2) & (ft < x)])
    xs = np.arange(44, 56, 0.1); j = [jump(x) for x in xs]; k = int(np.argmax(j))
    print(f'   biggest lift 44-56 s: {xs[k]:.1f} s (+{j[k]:.1f} dB); at the planned 50.0: {jump(50.0):+.1f} dB')
