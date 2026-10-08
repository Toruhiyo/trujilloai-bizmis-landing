"""Write one take as a film score at a fixed offset (film = music + offset; no edits,
no stretch), cut at the film's end with a 0.3 s tail.
  python music_score_at.py <take.mp3> <offset s> <export dir> <out.wav>"""
import sys, json, os, subprocess, numpy as np
SR = 48000; src, off, exp, out = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4]
DUR = json.load(open(os.path.join(exp, 'report.json')))['durationSeconds']
x = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
n0 = int(round(off * SR)); z = np.concatenate([np.zeros((n0, 2), np.float32), x]) if n0 > 0 else x[-n0:]
e = int(DUR * SR); z = np.concatenate([z, np.zeros((max(0, e - len(z)), 2), np.float32)])[:e]; g = int(0.3 * SR); z[e - g:] *= np.linspace(1, 0, g)[:, None]
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', out], input=z.tobytes(), check=True)
print(out, f'{DUR:.2f}s, offset {off:+.3f}')
