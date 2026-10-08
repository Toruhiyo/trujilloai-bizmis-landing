"""Where the take's arrangement really changes near each planned section boundary
(MFCC+chroma checkerboard novelty, peak within +-2.5 s), and the strongest onset
near it. Music time == film time when offset 0.
  venv/python music_sections_v17.py <name> <glob>"""
import sys, os, glob, json, numpy as np, librosa
HERE = os.path.dirname(os.path.abspath(__file__)); NAME, PAT = sys.argv[1], sys.argv[2]
P = json.load(open(os.path.join(HERE, 'music', f'{NAME}-plan.json'))); secs = P['A']['full']['sections']
bounds, t = [], 0
for s, nx in zip(secs[:-1], secs[1:]): t += s['duration_ms'] / 1000; bounds.append((nx['section_name'], round(t, 2)))
for f in sorted(glob.glob(os.path.join(HERE, 'music', f'{NAME}-{PAT}.mp3'))):
    y, sr = librosa.load(f, sr=22050); hop = 512
    F = np.vstack([librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13, hop_length=hop), librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)])
    F = (F - F.mean(1, keepdims=True)) / (F.std(1, keepdims=True) + 1e-6)
    fps = sr / hop; L = int(2 * fps)   # 2 s half-kernel
    Fs = librosa.util.sync(F, np.arange(0, F.shape[1], 4)); fs = fps / 4; L = int(2 * fs)
    Fn = Fs / (np.linalg.norm(Fs, axis=0, keepdims=True) + 1e-9); S = np.nan_to_num(Fn.T @ Fn); n = len(S); g = np.outer(np.r_[-np.ones(L), np.ones(L)], np.r_[-np.ones(L), np.ones(L)])
    nov = np.array([np.sum(S[i - L:i + L, i - L:i + L] * g) if L <= i < n - L else 0 for i in range(n)]); nov /= nov.max()
    on = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop); ot = librosa.frames_to_time(np.arange(len(on)), sr=sr, hop_length=hop)
    row = []
    for name, b in bounds:
        k = np.arange(n) / fs; m = (k > b - 2.5) & (k < b + 2.5)
        pk = float(k[m][np.argmax(nov[m])]); mo = (ot > pk - 0.6) & (ot < pk + 0.6); oo = float(ot[mo][np.argmax(on[mo])])
        row.append(f'{name[:12]}@{b:.2f}: change {pk - b:+.2f} (nov {nov[m].max():.2f}) onset {oo - b:+.2f}')
    print(os.path.basename(f)); print('   ' + '\n   '.join(row))
    # the track's own strongest changes, anywhere (peaks >= 4 s apart)
    k = np.arange(n) / fs; pk = [i for i in range(1, n - 1) if nov[i] >= nov[i - 1] and nov[i] > nov[i + 1] and nov[i] > 0.3]
    pk = sorted(pk, key=lambda i: -nov[i]); keep = []
    for i in pk:
        if all(abs(k[i] - k[j]) >= 4 for j in keep): keep.append(i)
    print('   peaks: ' + ', '.join(f'{k[i]:.1f}({nov[i]:.2f})' for i in sorted(keep[:14])))
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]; rt = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
    print('   dB/8s: ' + ' '.join(f'{20*np.log10(rms[(rt>=a)&(rt<a+8)].mean()+1e-9):.0f}' for a in range(0, 176, 8)))
