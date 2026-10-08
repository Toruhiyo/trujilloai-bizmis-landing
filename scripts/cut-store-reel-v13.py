"""v13b store-reel hero cuts (public/promo/stores/reel/v13): speech always at its own
speed (1.0; only silent waits may run faster), and segments join with clean hard
cuts on a pause plus a subtle alternating punch-in (an edit, not a dissolve).

Each segment: (video start, end, speed, audio) where audio is 'same' (its own
sound, tempo-matched) or None (silent). Speed is the playback rate (<= 2, and
only above ~1.2 on waiting stretches). Segments join with short dissolves and
the sound fades out before the end.

Shopper words for the film's pill (said.json):
  "shopper": {text, voice, at}  re-speaks the line with a natural voice
                                 (eleven_v4) laid over a silent span, timed
                                 from the TTS alignment (as v11);
  "said": "the shopper's line"   times the shopper's own words already in the
                                 cut's audio (diarized speech-to-text, as v10).

  python3 tmp/reel-v13/cut-store-reel-v13.py [names...]  -> tmp/reel-v13/cut/ (+ tmp/reel-v13/said.json)
"""
import os, sys, json, subprocess, uuid, urllib.request, base64
OUT = 'public/promo/stores/reel/v13'; os.makedirs(OUT, exist_ok=True)
PUNCH = 1.035   # every other segment is framed this much tighter (centred a little low, on the widget)
XF = 0.2; SR = 48000
CUTS = json.load(open(os.environ.get('CUTS', 'scripts/store-reel-v14-cuts.json')))
ENV = os.path.join('..', 'trujilloai-bizmis-project', '.env')
KEY = os.environ.get('ELEVENLABS_API_KEY') or next(l.split('=', 1)[1].strip().strip('"\'') for l in open(ENV) if l.startswith('ELEVENLABS_API_KEY='))

def tts(text, voice, dst):
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192', method='POST',
                                 data=json.dumps({'text': text, 'model_id': 'eleven_v4', 'voice_settings': {'stability': 0.5, 'similarity_boost': 0.8}}).encode(),
                                 headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
    r = json.load(urllib.request.urlopen(req, timeout=180))
    open(dst, 'wb').write(base64.b64decode(r['audio_base64']))
    al = r['alignment']; words = []; cur = ''; st = None
    for ch, s in zip(al['characters'], al['character_start_times_seconds']):
        if ch.isspace():
            if cur: words.append([st, cur]); cur = ''
        else:
            if not cur: st = s
            cur += ch
    if cur: words.append([st, cur])
    # audio tags ([curious] ...) are not spoken words
    return [w for w in words if not (w[1].startswith('[') or w[1].endswith(']'))]

def stt(path):
    data = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-vn', '-ac', '1', '-ar', '16000', '-f', 'wav', '-'], capture_output=True).stdout
    b = uuid.uuid4().hex
    body = (f'--{b}\r\nContent-Disposition: form-data; name="model_id"\r\n\r\nscribe_v1\r\n--{b}\r\nContent-Disposition: form-data; name="diarize"\r\n\r\ntrue\r\n'
            f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="a.wav"\r\nContent-Type: audio/wav\r\n\r\n').encode() + data + f'\r\n--{b}--\r\n'.encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', data=body, headers={'xi-api-key': KEY, 'Content-Type': f'multipart/form-data; boundary={b}'})
    return json.load(urllib.request.urlopen(req, timeout=300))

norm = lambda s: ''.join(ch for ch in s.lower() if ch.isalnum() or ch == ' ').split()

ONLY = set(sys.argv[1:])
said_path = 'public/promo/stores/reel/v13/said.json'
said_all = json.load(open(said_path)) if os.path.exists(said_path) else {}
for name, spec in CUTS.items():
    if name.startswith('_') or (ONLY and name not in ONLY): continue
    src, segs = spec['src'], spec['segments']
    SW, SH = (int(v) for v in subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout.strip().split(','))
    f = []; lens = []
    for i, (a, b, sp, au) in enumerate(segs):
        assert sp <= 2.0, f'{name}: speed {sp} > 2'
        n = (b - a) / sp
        if au == 'same': assert sp == 1.0, f'{name}: speech must play at its own speed'
        k = PUNCH if i % 2 else 1.0
        zoom = f',crop=iw/{k}:ih/{k}:(iw-ow)/2:(ih-oh)*0.62,scale={SW}:{SH}:flags=lanczos' if k != 1.0 else ''
        f.append(f'[0:v]trim={a}:{b},setpts=(PTS-STARTPTS)/{sp},fps=30{zoom},setsar=1,format=yuv420p[v{i}]')
        if au == 'same': f.append(f'[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aresample={SR},aformat=channel_layouts=stereo,atempo={sp:.4f},apad=whole_dur={n:.3f},atrim=0:{n:.3f}[a{i}]')
        else: f.append(f'anullsrc=r={SR}:cl=stereo,atrim=0:{n:.3f}[a{i}]')
        lens.append(n)
    # hard cuts (concat), the sound joined with a tiny crossfade so no click
    f.append(''.join(f'[v{i}]' for i in range(len(segs))) + f'concat=n={len(segs)}:v=1:a=0[vc]'); v = '[vc]'
    au, t = '[a0]', lens[0]
    for i in range(1, len(segs)):
        f.append(f'{au}[a{i}]acrossfade=d=0.03[y{i}]'); au = f'[y{i}]'
        t += lens[i] - 0.03
    inputs = ['-i', src]
    sh = spec.get('shopper')
    if sh:
        clip = f'tmp/reel-v13/cut/shopper-{name}.mp3'; os.makedirs('tmp/reel-v13/cut', exist_ok=True)
        words = tts(sh['text'], sh['voice'], clip)
        inputs += ['-i', clip]
        ms = int(sh['at'] * 1000)
        f.append(f'[1:a]aresample={SR},aformat=channel_layouts=stereo,adelay={ms}|{ms},apad=whole_dur={t:.3f},atrim=0:{t:.3f}[sh]')
        f.append(f'{au}[sh]amix=inputs=2:normalize=0[mx]'); au = '[mx]'
        said_all[name] = [[[round(w[0] + sh['at'], 2), w[1]] for w in words]]
        print('  said:', ' '.join(w[1] for w in words))
    for k, (vf, at) in enumerate(spec.get('voice', [])):   # v4 agent lines laid at their times (the take's own audio is off)
        idx = len(inputs) // 2; inputs += ['-i', vf]; ms = int(at * 1000)
        f.append(f'[{idx}:a]aresample={SR},aformat=channel_layouts=stereo,adelay={ms}|{ms},apad=whole_dur={t:.3f},atrim=0:{t:.3f}[vo{k}]')
        f.append(f'{au}[vo{k}]amix=inputs=2:normalize=0[vm{k}]'); au = f'[vm{k}]'
    f.append(f'{au}afade=t=in:d=0.04,afade=t=out:st={t - 0.35:.3f}:d=0.35[aout]')
    dst = f'{OUT}/{name}.mp4'
    # short GOP: the film seeks these per frame (long GOPs froze Fashion in v9)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *inputs, '-filter_complex', ';'.join(f), '-map', v, '-map', '[aout]', '-t', f'{t:.3f}',
                    '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-g', '15', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '192k', dst], check=True)
    print(f'{name}: {t:.2f}s')
    line = spec.get('said')
    if line and not sh:   # the shopper's own words in the cut, timed by STT
        r = stt(dst)
        ws = [w for w in r['words'] if w['type'] == 'word']
        want = set(norm(line))
        spk = {}
        for w in ws: spk.setdefault(w.get('speaker_id'), []).append(w)
        score = lambda xs: sum(1 for w in xs if norm(w['text']) and norm(w['text'])[0] in want) / max(1, len(xs))
        best = max(spk, key=lambda k: score(spk[k])) if spk else None
        lines = []
        for w in spk.get(best, []):
            if not lines or w['start'] - lines[-1][-1][2] > 1.5: lines.append([])
            lines[-1].append([round(w['start'], 2), w['text'], w['end']])
        said_all[name] = [[[tt, word] for tt, word, _ in ln] for ln in lines]
        for ln in said_all[name]: print('  said:', ' '.join(x[1] for x in ln))
    elif not sh:
        said_all[name] = []   # the shopper says nothing in this cut (e.g. the agent's opener)
json.dump(said_all, open(said_path, 'w'), indent=1)
