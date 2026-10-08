"""v14: finish the multi-cue takes into one score per version.
Per cue: the take with the least silence, dropouts patched from the other take,
its opening hit trimmed onto the chapter's cut, its accents locked to the picture
(music_align_hits.py), residue filled; then the cues are joined at the cuts
(each one plays to the next cue's first frame, a 40 ms seam) into
music/<name>-v<N>-score.wav.

  python music_finish_v14.py <name> <export dir> [versions]
"""
import sys, os, glob, json, subprocess, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); PY = sys.executable; SR = 48000
NAME, EXP = sys.argv[1], sys.argv[2]
VERS = [int(v) for v in (sys.argv[3] if len(sys.argv) > 3 else '1,2,3,4,5').split(',')]
P = json.load(open(os.path.join(HERE, 'music', f'{NAME}-plan.json'))); T = P['times']; CUES = P['cues']
M = json.load(open(os.path.join(EXP, 'markers.json')))['sfx']
A = lambda k: [e['at'] / 1000 for e in sorted(M, key=lambda e: e['at']) if e['id'] == k]
DUR = json.load(open(os.path.join(EXP, 'report.json')))['durationSeconds']
start = lambda c: 0.0 if CUES[c][0] == '0' else T[CUES[c][0]]
stop = lambda c: DUR + 1.5 if CUES[c][1] == 'end' else T[CUES[c][1]]
TARGETS = {'pain': [[t, 0.35, f'climax{i + 1}'] for i, t in enumerate(A('climax-beat'))],
           'stores': [[t, 0.3, f'slam{i + 1}'] for i, t in enumerate(A('reel-slam')[:4])],
           'cta': [[A('ea-final')[0], 0.6, 'final']]}
KEEP = {'pain': [(T['burst'] - 1.0, T['burst'] + 0.3)], 'meet': [(T['rewind'], T['catalog'] + 0.2)]}
def load(f):
    return np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
def save(x, f): subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', f], input=x.astype(np.float32).tobytes(), check=True)
def silence(x, keep, off):
    h = SR // 4; m = x.mean(1); db = np.array([20 * np.log10(np.sqrt(np.mean(m[i:i + h] ** 2)) + 1e-9) for i in range(0, len(m) - h, h)])
    q = db < db.max() - 40; return sum(0.25 for k, v in enumerate(q) if v and not any(a <= k * 0.25 + off <= b for a, b in keep))
def run(env, *args):
    r = subprocess.run([PY, *args], cwd=HERE, capture_output=True, text=True, env={**os.environ, **env}); out = (r.stdout + r.stderr).strip()
    if out: print('   ', out.replace('\n', '\n    '))
def lead_trim(x):   # the cue's first strong onset (within 1.5 s) becomes its first sample
    a = np.abs(x).max(1); w = SR // 100; lev = np.array([a[i:i + w].max() for i in range(0, int(1.5 * SR) - w, w)])
    return max(0, int(np.argmax(lev > lev.max() * 0.4)) * w - SR // 200)
for v in VERS:
    score = np.zeros((int((DUR + 2) * SR), 2), np.float32); placed = []
    for cue in CUES:
        takes = sorted(glob.glob(os.path.join(HERE, 'music', f'{NAME}-v{v}-{cue}-*.mp3')))
        if not takes: print(f'v{v} {cue}: no takes'); continue
        s0, s1 = start(cue), stop(cue); keep = KEEP.get(cue, [])
        raw = []
        for f in takes:
            x = load(f)
            if cue != 'pain': x = x[lead_trim(x):]
            raw.append((silence(x[:int((s1 - s0) * SR)], keep, s0), f, x))
        raw.sort(key=lambda r: r[0])
        print(f'v{v} {cue}: ' + ', '.join(f'{os.path.basename(f)}={s:.1f}s silent' for s, f, _ in raw))
        work = os.path.join(HERE, 'music', f'{NAME}-v{v}-{cue}-work.wav'); save(raw[0][2], work)
        keeparg = ','.join(f'{a:.2f}-{b:.2f}' for a, b in keep)
        for _, f, x in raw[1:]:
            alt = os.path.join(HERE, 'music', f'{NAME}-v{v}-{cue}-alt.wav'); save(x, alt)
            run({'ALT': alt, 'NO_LOOP': '1'}, 'music_fill_gaps.py', work, work + '.p.wav', f'{s0:.4f}', keeparg); os.replace(work + '.p.wav', work)
        tg = [t for t in TARGETS.get(cue, []) if s0 < t[0] < s1]
        if tg:
            tp = os.path.join(HERE, 'music', f'{NAME}-targets-{cue}.json'); json.dump(tg, open(tp, 'w'))
            run({}, 'music_align_hits.py', work, work + '.a.wav', f'{s0:.4f}', tp); os.replace(work + '.a.wav', work)
        run({}, 'music_fill_gaps.py', work, work + '.f.wav', f'{s0:.4f}', keeparg); os.replace(work + '.f.wav', work)
        x = load(work); n = int((s1 - s0) * SR); x = x[:n]
        f = int(0.04 * SR)
        if cue != 'cta' and len(x) > f: x[-f:] *= np.linspace(1, 0, f)[:, None]
        a = int(s0 * SR); score[a:a + len(x)] += x; placed.append((cue, s0, len(x) / SR))
    e = int(DUR * SR); g = int(0.3 * SR); score[e - g:e] *= np.linspace(1, 0, g)[:, None]; score[e:] = 0
    out = os.path.join(HERE, 'music', f'{NAME}-v{v}-score.wav'); save(score, out)
    # a cue that ends early leaves a gap before the next chapter's hit: the last bar vamps into it
    vk = f"{T['burst'] - 0.35:.2f}-{T['burst'] + 0.3:.2f},{T['rewind']:.2f}-{T['catalog'] + 0.2:.2f},{DUR - 0.2:.2f}-{DUR + 2:.2f}"
    run({}, 'music_fill_gaps.py', out, out + '.v.wav', '0', vk); os.replace(out + '.v.wav', out)
    print(f'v{v}: {out}  cues ' + ', '.join(f'{c}@{s:.2f}+{d:.1f}s' for c, s, d in placed))
