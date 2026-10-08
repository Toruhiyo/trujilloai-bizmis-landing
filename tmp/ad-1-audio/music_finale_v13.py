"""v13: give a score its finale when the composed take stopped early. The score's
own downbeat hit from the reveal (the burst: the main theme's first big hit) is
placed exactly on the film's closing hit ('ea-final') and rings out; the music
before it ducks into it with a short crossfade. Optionally (REPRISE=1) a silent
CTA is first filled with a reprise of the score's own celebratory section
(from the SOLD hit, whole bars), so the theme carries the voice-over.

  python music_finale_v13.py <in.wav> <out.wav> <export dir>
"""
import sys, os, json, subprocess, numpy as np
SR = 48000
src, out, exp = sys.argv[1:4]
M = json.load(open(os.path.join(exp, 'markers.json')))
A = lambda k: [e['at'] / 1000 for e in sorted(M['sfx'], key=lambda e: e['at']) if e['id'] == k]
burst, sold, final = A('burst')[0], A('sold')[0], A('ea-final')[0]
ea = next(v['atMs'] / 1000 for v in M['voice'] if 't-ea' in v['src'])
DUR = json.load(open(os.path.join(exp, 'report.json')))['durationSeconds']
x = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
need = int((DUR + 1.0) * SR)
if len(x) < need: x = np.concatenate([x, np.zeros((need - len(x), 2), np.float32)])
BAR = 4 * 60 / 112
xf = int(0.08 * SR); fi = np.sin(np.linspace(0, np.pi / 2, xf))[:, None]; fo = np.cos(np.linspace(0, np.pi / 2, xf))[:, None]
def paste(at, seg):
    a = int(at * SR); b = min(len(x), a + len(seg)); seg = seg[:b - a].copy()
    seg[:xf] = x[a:a + xf] * fo + seg[:xf] * fi
    x[a:b] = seg
if os.environ.get('REPRISE'):
    bars = x[int(sold * SR):int((sold + 4 * BAR) * SR)]           # four bars from the SOLD hit
    span = final - ea; reps = np.concatenate([bars] * (int(span / (4 * BAR)) + 2))[:int(span * SR)]
    reps[-int(0.6 * SR):] *= np.linspace(1, 0.35, int(0.6 * SR))[:, None]   # leans back into the finale
    paste(ea, reps); print(f'reprise {ea:.2f}-{final:.2f}s from the SOLD section')
hit = x[int((burst - 0.03) * SR):int((burst + 3.6) * SR)].copy()
ring = np.linspace(0, 1, len(hit)); hit *= (1 - ring ** 1.6)[:, None]          # the hit rings and settles
# the bars before the hit duck into it
pre = int(0.35 * SR); a = int((final - 0.03) * SR)
x[a - pre:a] *= np.linspace(1, 0.25, pre)[:, None]
x[a:] = 0
x[a:a + len(hit)] += hit
f = int(0.3 * SR); end = int(DUR * SR); x[end - f:end] *= np.linspace(1, 0, f)[:, None]; x[end:] = 0
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', out], input=x.astype(np.float32).tobytes(), check=True)
print(f'finale: the reveal hit ({burst:.2f}s) placed on {final:.2f}s, rings to {DUR:.2f}s -> {out}')
