"""Re-time a composed cue to a re-cut picture: each section of the cue (its
plan's boundaries) is time-stretched (pitch kept, ffmpeg atempo) onto the new
plan's boundaries, so every musical turn still lands on its film event.

  python music_warp_v9.py <cue> <old plan.json> <new plan.json> <pain|pitch> <out.wav>
"""
import sys, json, subprocess, numpy as np
SR = 48000
src, old_p, new_p, kind, out = sys.argv[1:6]
old, new = json.load(open(old_p))[kind]['sections'], json.load(open(new_p))[kind]['sections']
assert [s['section_name'] for s in old] == [s['section_name'] for s in new]
x = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2)
def stretch(seg, factor):
    if abs(factor - 1) < 0.002: return seg
    t = 1 / factor; chain = []
    while t < 0.5: chain.append('atempo=0.5'); t /= 0.5
    while t > 2.0: chain.append('atempo=2.0'); t /= 2.0
    chain.append(f'atempo={t:.5f}')
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', ','.join(chain), '-f', 'f32le', '-'],
                       input=seg.astype(np.float32).tobytes(), capture_output=True).stdout
    return np.frombuffer(r, np.float32).reshape(-1, 2)
parts, a = [], 0
for so, sn in zip(old, new):
    b = a + int(so['duration_ms'] / 1000 * SR); want = int(sn['duration_ms'] / 1000 * SR)
    seg = stretch(x[a:b], want / max(1, b - a))
    seg = seg[:want] if len(seg) >= want else np.concatenate([seg, np.zeros((want - len(seg), 2), np.float32)])
    parts.append(seg); print(f"{so['section_name'][:22]:22s} {so['duration_ms'] / 1000:6.2f}s -> {sn['duration_ms'] / 1000:6.2f}s ({(want / max(1, b - a) - 1) * 100:+.1f}%)")
    a = b
y = np.concatenate(parts + [x[a:]])   # whatever follows the last section (a tail) is kept
f = int(0.01 * SR)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', out], input=y.astype(np.float32).tobytes(), check=True)
print('wrote', out, f'{len(y) / SR:.2f}s')
