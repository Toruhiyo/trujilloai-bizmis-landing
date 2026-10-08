"""v13: finish the composed takes into one score per version: pick the take with
the least silence (outside the intended ones), lock its hits to the picture
(music_align_hits.py), fill what dropouts remain (music_fill_gaps.py).

  python music_finish_v13.py <name> <export dir>
  writes music/<name>-v<N>-final.wav (one score) or -final-pain.wav/-final-pitch.wav (v2)
"""
import sys, os, glob, json, subprocess, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); PY = sys.executable
NAME, EXP = sys.argv[1], sys.argv[2]
M = json.load(open(os.path.join(EXP, 'markers.json')))['sfx']
A = lambda k: [e['at'] / 1000 for e in sorted(M, key=lambda e: e['at']) if e['id'] == k]
burst = A('burst')[0]; rewind, install = A('rewind')[0], (A('install') or A('clerk-in'))[0]
KEEP = [(burst - 1.0, burst + 0.3), (rewind, install + 0.2)]   # the cut before the hit; the tape-stop
pain_t = [[t, 0.35, f'climax{i + 1}'] for i, t in enumerate(A('climax-beat'))]
pitch_t = [[A('sold')[0], 0.45, 'sold']] + [[t, 0.3, f'slam{i + 1}'] for i, t in enumerate(A('reel-slam')[:4])] + [[A('reel-land')[0], 0.35, 'land'], [A('ea-final')[0], 0.6, 'final']]
SR = 22050
def silence(path, offset, end=None):
    x = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
    h = SR // 4; db = np.array([20 * np.log10(np.sqrt(np.mean(x[i:i + h] ** 2)) + 1e-9) for i in range(0, len(x) - h, h)])
    q = db < db.max() - 40; total = 0.0; run = 0
    for k, v in enumerate(q):
        t = k * 0.25 + offset
        if end and t > end: break
        if v and not any(a <= t <= b for a, b in KEEP): run += 1
        else:
            if run * 0.25 >= 0.75: total += run * 0.25
            run = 0
    return total + (run * 0.25 if run * 0.25 >= 0.75 else 0)
def tj(name, data):
    p = os.path.join(HERE, 'music', name); json.dump(data, open(p, 'w')); return p
keeparg = ','.join(f'{a:.2f}-{b:.2f}' for a, b in KEEP)
def run(*args): print(subprocess.run([PY, *args], cwd=HERE, capture_output=True, text=True).stdout.strip())
def runenv(env, *args): print(subprocess.run([PY, *args], cwd=HERE, capture_output=True, text=True, env={**os.environ, **env}).stdout.strip())
for v in (1, 2, 3, 4, 5):
    fulls = sorted(glob.glob(os.path.join(HERE, 'music', f'{NAME}-v{v}-full-*.mp3')))
    if fulls:
        scored = sorted((silence(f, 0, None), f) for f in fulls)
        print(f'v{v}: takes ' + ', '.join(f'{os.path.basename(f)}={s:.1f}s silent' for s, f in scored))
        best = scored[0][1]; al = os.path.join(HERE, 'music', f'{NAME}-v{v}-aligned.wav'); fin = os.path.join(HERE, 'music', f'{NAME}-v{v}-final.wav')
        patched = os.path.join(HERE, 'music', f'{NAME}-v{v}-patched.wav')
        if len(scored) > 1: runenv({'ALT': scored[1][1]}, 'music_fill_gaps.py', best, patched, '0', keeparg)   # dropouts first from the other take
        else: patched = best
        run('music_align_hits.py', patched, al, '0', tj(f'{NAME}-targets-full.json', pain_t + [[burst, 0.45, 'burst']] + pitch_t))
        run('music_fill_gaps.py', al, fin, '0', keeparg)
        continue
    pains = sorted(glob.glob(os.path.join(HERE, 'music', f'{NAME}-v{v}-pain-*.mp3'))); pitches = sorted(glob.glob(os.path.join(HERE, 'music', f'{NAME}-v{v}-pitch-*.mp3')))
    if not pains or not pitches: continue
    bp = sorted((silence(f, 0, burst - 1.2), f) for f in pains)[0][1]
    # the pitch cue: trim its quiet lead-in so its first hit is the burst
    def trimmed(f):
        x = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f, '-ac', '2', '-ar', '48000', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2)
        a = np.abs(x).max(1); w = 480; lev = np.array([a[i:i + w].max() for i in range(0, 3 * 48000 - w, w)])
        first = max(0, int(np.argmax(lev > lev.max() * 0.4)) * w - 480); out = f.replace('.mp3', '-trim.wav')
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', '48000', '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', out], input=x[first:].tobytes(), check=True); return out
    tps = [trimmed(f) for f in pitches]
    sq = sorted((silence(f, burst, None), f) for f in tps); bq = sq[0][1]
    if len(sq) > 1:
        pq = bq.replace('-trim.wav', '-patched.wav'); runenv({'ALT': sq[1][1]}, 'music_fill_gaps.py', bq, pq, f'{burst:.4f}', keeparg); bq = pq
    print(f'v{v}: pain {os.path.basename(bp)}, pitch {os.path.basename(bq)}')
    run('music_align_hits.py', bp, os.path.join(HERE, 'music', f'{NAME}-v{v}-pain-aligned.wav'), '0', tj(f'{NAME}-targets-pain.json', pain_t))
    run('music_fill_gaps.py', os.path.join(HERE, 'music', f'{NAME}-v{v}-pain-aligned.wav'), os.path.join(HERE, 'music', f'{NAME}-v{v}-final-pain.wav'), '0', keeparg)
    run('music_align_hits.py', bq, os.path.join(HERE, 'music', f'{NAME}-v{v}-pitch-aligned.wav'), f'{burst:.4f}', tj(f'{NAME}-targets-pitch.json', pitch_t))
    run('music_fill_gaps.py', os.path.join(HERE, 'music', f'{NAME}-v{v}-pitch-aligned.wav'), os.path.join(HERE, 'music', f'{NAME}-v{v}-final-pitch.wav'), f'{burst:.4f}', keeparg)
