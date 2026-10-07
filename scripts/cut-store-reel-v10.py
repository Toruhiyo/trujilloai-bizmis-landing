"""Cut the v10 store-reel takes (tmp/reel-v10; agents re-voiced in revoiced/)
into the film's hero vignettes, then time the shopper's spoken words in each
cut (ElevenLabs speech-to-text, diarized: the shopper's known line marks the
shopper) for the film's live-call pill.

Each segment: (video start, end, speed, audio) where audio is 'same' (the
segment's own sound), None (silent), or (start, end) to lay another moment's
sound over it. Segments join with short dissolves.

  python3 scripts/cut-store-reel-v10.py [names...]  -> public/promo/stores/reel/v10/ (+ said.json)
"""
import os, sys, json, subprocess, uuid, urllib.request
SRC = 'tmp/reel-v10'; OUT = 'public/promo/stores/reel/v10'; os.makedirs(OUT, exist_ok=True)
XF = 0.2
CUTS = json.load(open('scripts/store-reel-v10-cuts.json'))
ENV = os.path.join('..', 'trujilloai-bizmis-project', '.env')
KEY = os.environ.get('ELEVENLABS_API_KEY') or next(l.split('=', 1)[1].strip().strip('"\'') for l in open(ENV) if l.startswith('ELEVENLABS_API_KEY='))

def stt(path):
    data = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-vn', '-ac', '1', '-ar', '16000', '-f', 'wav', '-'], capture_output=True).stdout
    b = uuid.uuid4().hex
    body = (f'--{b}\r\nContent-Disposition: form-data; name="model_id"\r\n\r\nscribe_v1\r\n--{b}\r\nContent-Disposition: form-data; name="diarize"\r\n\r\ntrue\r\n'
            f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="a.wav"\r\nContent-Type: audio/wav\r\n\r\n').encode() + data + f'\r\n--{b}--\r\n'.encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', data=body, headers={'xi-api-key': KEY, 'Content-Type': f'multipart/form-data; boundary={b}'})
    return json.load(urllib.request.urlopen(req, timeout=300))

norm = lambda s: ''.join(ch for ch in s.lower() if ch.isalnum() or ch == ' ').split()
ONLY = set(sys.argv[1:])
said_path = f'{OUT}/said.json'
said_all = json.load(open(said_path)) if os.path.exists(said_path) else {}
for name, spec in CUTS.items():
    if ONLY and name not in ONLY: continue
    src, segs = spec['src'], spec['segments']
    f = []; lens = []
    for i, (a, b, sp, au) in enumerate(segs):
        n = (b - a) / sp
        f.append(f'[0:v]trim={a}:{b},setpts=(PTS-STARTPTS)/{sp},fps=30,format=yuv420p[v{i}]')
        if au == 'same': f.append(f'[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo[a{i}]')
        elif au is None: f.append(f'anullsrc=r=48000:cl=stereo,atrim=0:{n:.3f}[a{i}]')
        else:
            c, d = au
            f.append(f'[0:a]atrim={c}:{d},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur={n:.3f},atrim=0:{n:.3f}[a{i}]')
        lens.append(n)
    v, au, t = '[v0]', '[a0]', lens[0]
    for i in range(1, len(segs)):
        f.append(f'{v}[v{i}]xfade=transition=fade:duration={XF}:offset={t - XF:.3f}[x{i}]'); v = f'[x{i}]'
        f.append(f'{au}[a{i}]acrossfade=d={XF}[y{i}]'); au = f'[y{i}]'
        t += lens[i] - XF
    f.append(f'{au}afade=t=in:d=0.06,afade=t=out:st={t - 0.25:.3f}:d=0.25[aout]')
    dst = f'{OUT}/{name}.mp4'
    # short GOP: the film seeks these per frame (long GOPs froze Fashion in v9)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-filter_complex', ';'.join(f), '-map', v, '-map', '[aout]',
                    '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-g', '15', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '192k', dst], check=True)
    print(f'{name}: {t:.2f}s')
    line = spec.get('shopper')
    if line:   # the shopper's words, timed in the cut
        r = stt(dst)
        words = [w for w in r['words'] if w['type'] == 'word']
        want = set(norm(line))
        spk = {}
        for w in words: spk.setdefault(w.get('speaker_id'), []).append(w)
        score = lambda ws: sum(1 for w in ws if norm(w['text']) and norm(w['text'])[0] in want) / max(1, len(ws))
        best = max(spk, key=lambda k: score(spk[k])) if spk else None
        lines = []
        for w in spk.get(best, []):   # a new pill after a pause (two asks = two pills)
            if not lines or w['start'] - lines[-1][-1][2] > 1.5: lines.append([])
            lines[-1].append([round(w['start'], 2), w['text'], w['end']])
        said_all[name] = [[[t, word] for t, word, _ in ln] for ln in lines]
        for ln in said_all[name]: print('  said:', ' '.join(x[1] for x in ln))
json.dump(said_all, open(said_path, 'w'), indent=1)
