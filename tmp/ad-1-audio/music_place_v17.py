"""Place each one-track take on the picture by a whole-beat shift only (no edits):
the beat phase puts the store slams on the beat, then the shift (k beats) is the one
that best lands the take's own final hit on the EA final and its own biggest change
near the burst on the burst. Writes music/<take>-score.wav and prints residuals.
  venv/python music_place_v17.py <name> <export dir> <glob>"""
import sys, os, glob, json, subprocess, numpy as np, librosa
HERE = os.path.dirname(os.path.abspath(__file__)); SR = 48000
NAME, EXP, PAT = sys.argv[1:4]
M = json.load(open(os.path.join(EXP, 'markers.json')))['sfx']; DUR = json.load(open(os.path.join(EXP, 'report.json')))['durationSeconds']
A = lambda k: sorted(e['at'] / 1000 for e in M if e['id'] == k)
BURST, FINAL, SLAMS, LAND = A('burst')[0], A('ea-final')[0], A('reel-slam')[:8], A('reel-land')[0]
def load(f): return np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
def save(x, f): subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', f], input=x.astype(np.float32).tobytes(), check=True)
res = []
for f in sorted(glob.glob(os.path.join(HERE, 'music', f'{NAME}-{PAT}.mp3'))):
    x = load(f); y = librosa.resample(x.mean(1), orig_sr=SR, target_sr=22050); sr = 22050; hop = 256
    on = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop); ot = librosa.frames_to_time(np.arange(len(on)), sr=sr, hop_length=hop)
    _, bf = librosa.beat.beat_track(onset_envelope=on, sr=sr, hop_length=hop, start_bpm=112, tightness=400); bt = librosa.frames_to_time(bf, sr=sr, hop_length=hop)
    T = float(np.median(np.diff(bt)))
    lo = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop, fmax=250)
    def hit(a, b, env=on):   # strongest (low-weighted) onset in [a, b] music time
        m = (ot >= a) & (ot <= b); w = env[m] + lo[m]; return float(ot[m][np.argmax(w)])
    fin = hit(FINAL - 3.5, FINAL + 3.5)
    # biggest arrangement change near the burst: rms jump over 2 s windows
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]; c = np.arange(len(rms)) * hop / sr
    def jump(t): a = rms[(c >= t - 2) & (c < t)].mean(); b = rms[(c >= t) & (c < t + 2)].mean(); return 20 * np.log10((b + 1e-9) / (a + 1e-9))
    cand = np.arange(BURST - 4, BURST + 4, 0.05); bj = max(cand, key=jump); bst = hit(bj - 0.3, bj + 0.3)
    # beat phase vs the slams (film = music + o)
    def slam_err(o): return np.mean([np.min(np.abs(bt + o - s)) for s in SLAMS])
    ph = min(np.arange(0, T, 0.002), key=slam_err)
    best = None
    for k in range(-8, 9):
        o = ph + k * T
        if o > 1.2: continue
        e = 2 * abs(fin + o - FINAL) + abs(bst + o - BURST)
        if best is None or e < best[0]: best = (e, o)
    o = best[1]; n0 = int(round(o * SR)); z = np.concatenate([np.zeros((n0, 2), np.float32), x]) if n0 > 0 else x[-n0:]
    e_ = int(DUR * SR); z = np.concatenate([z, np.zeros((max(0, e_ - len(z)), 2), np.float32)])[:e_]; g = int(0.3 * SR); z[e_ - g:] *= np.linspace(1, 0, g)[:, None]
    tag = os.path.basename(f)[:-4]; save(z, os.path.join(HERE, 'music', f'{tag}-score.wav'))
    r = {'take': tag, 'bpm': round(60 / T, 2), 'offset': round(float(o), 3), 'slams_ms': round(float(slam_err(o)) * 1000), 'final_ms': round(float(fin + o - FINAL) * 1000),
         'burst_ms': round(float(bst + o - BURST) * 1000), 'burst_jump_db': round(float(jump(bj)), 1), 'land_beat_ms': round(float(np.min(np.abs(bt + o - LAND))) * 1000)}
    res.append(r); print(json.dumps(r))
json.dump(res, open(os.path.join(HERE, 'music', f'{NAME}-placement.json'), 'w'), indent=1)
