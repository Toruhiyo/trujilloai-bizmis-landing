"""v13: repair the dropouts a composed score sometimes has (the model stops,
then starts again a few seconds later). Each silent stretch (longer than
MIN_GAP, quieter than the cue's peak -40 dB) outside the intended silences is
filled by continuing the music right before it: the last bar (4 beats at
112 bpm) is repeated, so the meter carries on, with equal-power crossfades
at both seams.

  python music_fill_gaps.py <in.wav> <out.wav> <offset s> [keep_from-keep_to,...]
  (keep windows in film seconds: silences there are left as they are)
"""
import sys, os, subprocess, numpy as np
SR = 48000
src, out, offset = sys.argv[1], sys.argv[2], float(sys.argv[3])
keep = [tuple(float(v) for v in w.split('-')) for w in (sys.argv[4].split(',') if len(sys.argv) > 4 and sys.argv[4] else [])]
MIN_GAP = float(os.environ.get('MIN_GAP', '0.6'))
ALT = os.environ.get('ALT')   # another take of the same plan: a dropout is patched with its music at the same time (same tempo, key, sections)
BAR = 4 * 60 / 112
x = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
hop = SR // 20
db = np.array([20 * np.log10(np.sqrt(np.mean(x[i:i + hop] ** 2)) + 1e-9) for i in range(0, len(x) - hop, hop)])
quiet = db < db.max() - 40
gaps, i = [], 0
while i < len(quiet):
    if quiet[i]:
        j = i
        while j < len(quiet) and quiet[j]: j += 1
        a, b = i * hop / SR, j * hop / SR
        if b - a >= MIN_GAP and a > 1.0 and j < len(quiet) and not any(k0 <= a + offset <= k1 or k0 <= b + offset <= k1 for k0, k1 in keep): gaps.append((a, b))
        i = j
    else: i += 1
f = int(0.06 * SR); fi = np.sin(np.linspace(0, np.pi / 2, f))[:, None]; fo = np.cos(np.linspace(0, np.pi / 2, f))[:, None]
alt = None
if ALT:
    alt = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', ALT, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
    alt *= np.sqrt(np.mean(x ** 2) / max(1e-12, np.mean(alt ** 2)))   # level-matched
for a, b in gaps:
    if alt is not None and int(b * SR) + f < len(alt):
        p0, p1 = int(a * SR) - f, int(b * SR) + f
        seg = alt[p0:p1]
        lvl = 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9)
        if lvl > db.max() - 30:   # the other take plays there: use it, with crossfades both ends
            out_ = x[p0:p1].copy(); out_[:f] = out_[:f] * fo + seg[:f] * fi; out_[f:-f] = seg[f:-f]; out_[-f:] = seg[-f:] * fo + x[p1 - f:p1] * fi
            x[p0:p1] = out_; print(f'patched {a + offset:6.1f}-{b + offset:6.1f}s ({b - a:.1f}s) from the other take'); continue
    if os.environ.get('NO_LOOP'): continue   # patch-only pass
    L = BAR if a > BAR + 0.1 else BAR / 2
    s0 = int((a - L) * SR); s1 = int(a * SR); e = int(b * SR)
    block = x[s0:s1]
    need = e - s1 + f
    fill = np.concatenate([block] * (need // len(block) + 1))[:need]
    seg = x[s1:e + f].copy()
    seg[:f] = seg[:f] * fo + fill[:f] * fi                # into the repeat
    seg[f:e - s1] = fill[f:e - s1]
    seg[e - s1:] = fill[e - s1:] * fo[:len(seg) - (e - s1)] + x[e:e + f][:len(seg) - (e - s1)] * fi[:len(seg) - (e - s1)]   # back into the score
    x[s1:e + f] = seg
    print(f'filled {a + offset:6.1f}-{b + offset:6.1f}s ({b - a:.1f}s) with the previous {L:.2f}s')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', out], input=x.astype(np.float32).tobytes(), check=True)
print(f'{len(gaps)} gaps filled -> {out}')
