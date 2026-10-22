"""Rebuild an export's voice track from its markers.json (the --stream 4K export
writes picture only) and mux it into a copy of the video, the way
export-ad-1.mjs's audioCueArgs places each cue: from fromSec into the file,
for endMs-atMs, fade in (default 0.15 s) and out (default 0.25 s), at atMs.
Then points report.json's video at the muxed copy (the original is kept).

  python voice_from_markers.py <export dir>
"""
import os, sys, json, subprocess, numpy as np
EXP = sys.argv[1]; SR = 48000
PUB = os.environ.get('VOICE_PUBLIC') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public')
R = json.load(open(os.path.join(EXP, 'report.json'))); M = json.load(open(os.path.join(EXP, 'markers.json')))
N = int(round(R['durationSeconds'] * SR)); bus = np.zeros((N, 2), np.float32)
def load(path, start, dur):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-ss', str(start), '-t', f'{dur:.4f}', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
for c in M['voice']:
    dur = (c['endMs'] - c['atMs']) / 1000
    if dur <= 0: continue
    x = load(os.path.join(PUB, c['src'].lstrip('/')), c.get('fromSec', 0) or 0, dur)
    # exactly like the exporter's afade: the fade-out sits at the end of the CUE window (dur), which runs past the
    # recording's end, so it fades the silence after the line, never the line's last word (fading the recording's
    # own last 0.25 s clipped every tightly trimmed v25 line)
    n = int(round(dur * SR)); x = np.concatenate([x, np.zeros((max(0, n - len(x)), 2), np.float32)])[:n]
    fi = int((c.get('fadeIn') if c.get('fadeIn') is not None else 0.15) * SR); fo = int((c.get('fadeOut') if c.get('fadeOut') is not None else 0.25) * SR)
    fi = min(fi, len(x)); fo = min(fo, len(x))
    if fi: x[:fi] *= np.linspace(0, 1, fi)[:, None]
    if fo: x[len(x) - fo:] *= np.linspace(1, 0, fo)[:, None]
    a = int(round(c['atMs'] / 1000 * SR)); b = min(N, a + len(x)); bus[a:b] += x[:b - a]
wav = os.path.join(EXP, 'voice.wav')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', wav], input=bus.tobytes(), check=True)
src = R.get('videoNoVoice') or R['video']; base, ext = os.path.splitext(src); out = base + '-voice' + ext   # a re-run rebuilds from the picture-only file
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'pcm_s24le', out], check=True)
R['videoNoVoice'] = src; R['video'] = out
json.dump(R, open(os.path.join(EXP, 'report.json'), 'w'), indent=1)
print(len(M['voice']), 'voice cues ->', R['video'], f'peak {np.abs(bus).max():.3f}')
