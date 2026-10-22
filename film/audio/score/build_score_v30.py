"""v30 score: the Suno chain as-is (film = song, no stretch, no moves) plus the rewind:
tape-stop from the 'rewind' frame, silence, and the song comes back on its own restart hit.
  python build_score_v30.py <song.wav> <markers.json> <out.wav> [restart_s]"""
import sys, json, subprocess, numpy as np
SR = 48000; src, mk, out = sys.argv[1:4]; restart = float(sys.argv[4]) if len(sys.argv) > 4 else 44.82
x = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
rw = next(e['at'] for e in json.load(open(mk))['sfx'] if e['id'] == 'rewind') / 1000
a0, stop = int(rw * SR), int(0.75 * SR)
rate = np.cos(np.linspace(0, np.pi / 2, stop)) ** 1.6; pos = a0 + np.cumsum(rate)   # the band slows to a halt (pitch falls with it)
slow = np.stack([np.interp(pos, np.arange(len(x)), x[:, c]) for c in (0, 1)], 1) * np.linspace(1, 0, stop)[:, None] ** 0.6
b0 = int((restart - 0.02) * SR)
x[a0:a0 + stop] = slow; x[a0 + stop:b0] = 0
f = int(0.005 * SR); x[b0:b0 + f] *= np.linspace(0, 1, f)[:, None]
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', out], input=x.tobytes(), check=True)
print(out, f'tape-stop {rw:.2f}->{rw + 0.75:.2f}, back in at {restart - 0.02:.2f} (hit {restart:.2f})')
