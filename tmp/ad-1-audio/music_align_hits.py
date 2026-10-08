"""v13: lock a composed score's accents onto the picture. For each target
(film time + search window), the strongest onset of the score inside the
window is found, then the score is re-timed piecewise (time-stretch, pitch
kept) so every found onset lands exactly on its target. Segments between
anchors stretch by at most MAX_STRETCH; a target whose stretch would exceed it
is skipped (reported). The cue starts at film time OFFSET (0 for a full score,
the burst for a pitch cue).

  python music_align_hits.py <in.wav> <out.wav> <offset s> <targets.json>
  targets.json: [[film_s, window_s, label], ...]
"""
import sys, json, os, subprocess, numpy as np
SR = 48000
MAX_STRETCH = float(os.environ.get('MAX_STRETCH', '0.12'))
src, out, offset, tpath = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
targets = sorted(json.load(open(tpath)))
x = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
hop = SR // 200
rms = np.sqrt(np.convolve(x.mean(1) ** 2, np.ones(hop) / hop, 'same')[::hop]); db = 20 * np.log10(rms + 1e-9)
flux = np.maximum(0, np.diff(db, prepend=db[0]))
anchors = [(0.0, 0.0)]   # (source s, target s), in cue time
for film, win, label in targets:
    t = film - offset
    lo, hi = max(0, int((t - win) * 200)), min(len(flux) - 1, int((t + win) * 200))
    if hi <= lo: continue
    src_t = (lo + int(np.argmax(flux[lo:hi]))) / 200
    ps, pt = anchors[-1]
    if src_t <= ps + 0.25 or t <= pt + 0.25: print(f'skip {label}: too close to the previous anchor'); continue
    f = (t - pt) / (src_t - ps)
    if abs(f - 1) > MAX_STRETCH: print(f'skip {label}: stretch {f:.3f}'); continue
    anchors.append((src_t, t)); print(f'{label:16s} onset {src_t + offset:7.3f}s -> {film:7.3f}s ({(t - src_t) * 1000:+5.0f} ms, stretch {(f - 1) * 100:+.1f}%)')
def stretch(seg, factor):
    if abs(factor - 1) < 0.0015: return seg
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', f'atempo={1 / factor:.5f}', '-f', 'f32le', '-'],
                       input=seg.astype(np.float32).tobytes(), capture_output=True).stdout
    return np.frombuffer(r, np.float32).reshape(-1, 2)
parts = []
for (s0, t0), (s1, t1) in zip(anchors, anchors[1:]):
    seg = stretch(x[int(s0 * SR):int(s1 * SR)], (t1 - t0) / (s1 - s0)); n = int(round((t1 - t0) * SR))
    parts.append(seg[:n] if len(seg) >= n else np.concatenate([seg, np.zeros((n - len(seg), 2), np.float32)]))
parts.append(x[int(anchors[-1][0] * SR):])   # after the last anchor: as composed
y = np.concatenate(parts)
f = int(0.004 * SR)   # tiny crossfades are implicit in atempo's windows; just guard the very start
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', out], input=y.astype(np.float32).tobytes(), check=True)
print(f'{len(anchors) - 1} anchors; wrote {out} {len(y) / SR:.2f}s')
