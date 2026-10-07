"""Cut the v11 store-reel heroes: only each take's best moment, sped up, each
shorter than the last (Fashion ~8 s -> Electronics ~6.5 -> Books ~5 -> Gaming ~4).

Each segment: (video start, end, speed, audio) where audio is 'same' (its own
sound, tempo-matched) or None (silent). Segments join with short dissolves and
the sound fades out before the end. A segment's shopper line can be re-spoken
with a natural voice ("shopper": text, ElevenLabs voice, start in the cut),
laid over a silent span; its words are timed for the film's pill (said.json).

  python3 scripts/cut-store-reel-v11.py [names...]  -> public/promo/stores/reel/v11/ (+ said.json)
"""
import os, sys, json, subprocess, uuid, urllib.request
OUT = 'public/promo/stores/reel/v11'; os.makedirs(OUT, exist_ok=True)
XF = 0.2; SR = 48000
CUTS = json.load(open('scripts/store-reel-v11-cuts.json'))
ENV = os.path.join('..', 'trujilloai-bizmis-project', '.env')
KEY = os.environ.get('ELEVENLABS_API_KEY') or next(l.split('=', 1)[1].strip().strip('"\'') for l in open(ENV) if l.startswith('ELEVENLABS_API_KEY='))

def tts(text, voice, dst):
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192', method='POST',
                                 data=json.dumps({'text': text, 'model_id': 'eleven_v3', 'voice_settings': {'stability': 0.5, 'similarity_boost': 0.8}}).encode(),
                                 headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
    r = json.load(urllib.request.urlopen(req, timeout=180))
    import base64
    open(dst, 'wb').write(base64.b64decode(r['audio_base64']))
    al = r['alignment']; words = []; cur = ''; st = None
    for ch, s in zip(al['characters'], al['character_start_times_seconds']):
        if ch.isspace():
            if cur: words.append([st, cur]); cur = ''
        else:
            if not cur: st = s
            cur += ch
    if cur: words.append([st, cur])
    return words

def atempo(sp):   # atempo takes 0.5..2 per stage
    return f'atempo={sp:.4f}'

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
        if au == 'same': f.append(f'[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aresample={SR},aformat=channel_layouts=stereo,{atempo(sp)},apad=whole_dur={n:.3f},atrim=0:{n:.3f}[a{i}]')
        else: f.append(f'anullsrc=r={SR}:cl=stereo,atrim=0:{n:.3f}[a{i}]')
        lens.append(n)
    v, au, t = '[v0]', '[a0]', lens[0]
    for i in range(1, len(segs)):
        f.append(f'{v}[v{i}]xfade=transition=fade:duration={XF}:offset={t - XF:.3f}[x{i}]'); v = f'[x{i}]'
        f.append(f'{au}[a{i}]acrossfade=d={XF}[y{i}]'); au = f'[y{i}]'
        t += lens[i] - XF
    inputs = ['-i', src]
    sh = spec.get('shopper')
    if sh:
        clip = f'tmp/reel-v11-shopper-{name}.mp3'
        words = tts(sh['text'], sh['voice'], clip)
        inputs += ['-i', clip]
        ms = int(sh['at'] * 1000)
        f.append(f'[1:a]aresample={SR},aformat=channel_layouts=stereo,adelay={ms}|{ms},apad=whole_dur={t:.3f},atrim=0:{t:.3f}[sh]')
        f.append(f'{au}[sh]amix=inputs=2:normalize=0[mx]'); au = '[mx]'
        said_all[name] = [[[round(w[0] + sh['at'], 2), w[1]] for w in words]]
        print('  said:', ' '.join(w[1] for w in words))
    else:
        said_all.pop(name, None)
    f.append(f'{au}afade=t=in:d=0.06,afade=t=out:st={t - 0.55:.3f}:d=0.55[aout]')
    dst = f'{OUT}/{name}.mp4'
    # short GOP: the film seeks these per frame (long GOPs froze Fashion in v9)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *inputs, '-filter_complex', ';'.join(f), '-map', v, '-map', '[aout]', '-t', f'{t:.3f}',
                    '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-g', '15', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '192k', dst], check=True)
    print(f'{name}: {t:.2f}s')
json.dump(said_all, open(said_path, 'w'), indent=1)
