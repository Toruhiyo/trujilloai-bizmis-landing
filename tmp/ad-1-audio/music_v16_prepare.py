"""v16: carry the v15 cues over to the v16 picture. pain, intro and cta keep
their timing relative to their cuts (copied); the meet cue is re-timed section
by section to the v16 plan (atempo, pitch kept); only the drive cue (the store
run changed) is composed anew (music_v15.py ONLY_CUES=drive).

  python music_v16_prepare.py      (after: music_v15.py <v16 export> v16 ... plan-only)
"""
import os, json, shutil, subprocess, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); M = os.path.join(HERE, 'music'); SR = 48000
old = json.load(open(os.path.join(M, 'v15-plan.json'))); new = json.load(open(os.path.join(M, 'v16-plan.json')))
def stretch(seg, factor):
    if abs(factor - 1) < 0.002: return seg
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', f'atempo={1 / factor:.5f}', '-f', 'f32le', '-'],
                       input=seg.astype(np.float32).tobytes(), capture_output=True).stdout
    return np.frombuffer(r, np.float32).reshape(-1, 2)
for v in range(1, 6):
    for cue in ('pain', 'intro', 'cta'):
        for k in range(4):
            src = os.path.join(M, f'v15-v{v}-{cue}-{k}.mp3')
            if os.path.exists(src): shutil.copyfile(src, os.path.join(M, f'v16-v{v}-{cue}-{k}.mp3'))
    so = old[f'v{v}']['meet']['sections'] + [{'section_name': 'Overrun', 'duration_ms': 5000}]   # takes 2, 3 were composed with the overrun
    sn = new[f'v{v}']['meet']['sections']
    for k in (2, 3):
        src = os.path.join(M, f'v15-v{v}-meet-{k}.mp3')
        if not os.path.exists(src): continue
        x = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).reshape(-1, 2)
        parts, a = [], 0
        for a_sec, b_sec in zip(so, sn):
            b = a + int(a_sec['duration_ms'] / 1000 * SR); want = int(b_sec['duration_ms'] / 1000 * SR)
            seg = stretch(x[a:b], want / max(1, b - a)); seg = seg[:want] if len(seg) >= want else np.concatenate([seg, np.zeros((want - len(seg), 2), np.float32)])
            parts.append(seg); a = b
        y = np.concatenate(parts + [x[a:]])
        dst = os.path.join(M, f'v16-v{v}-meet-{k}.mp3')
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '320k', dst], input=y.astype(np.float32).tobytes(), check=True)
        print(f'v{v} meet-{k}: ' + ', '.join(f"{a_['section_name'][:10]} {(b_['duration_ms'] / max(1, a_['duration_ms']) - 1) * 100:+.1f}%" for a_, b_ in zip(so, sn)))
