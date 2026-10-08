"""Transcribe the agent's speech in each store recording (ElevenLabs speech-to-text, word timings)."""
import os, json, subprocess, urllib.request, uuid, glob
KEY = next(l.split('=', 1)[1].strip().strip('"\'') for l in open('/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-project/.env') if l.startswith('ELEVENLABS_API_KEY='))
V = '/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-landing/public/promo/stores/videos'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'stores')
for f in sorted(glob.glob(f'{V}/*-desktop.mp4')):
    name = os.path.basename(f)[:-4]; dest = os.path.join(OUT, name + '.json')
    if os.path.exists(dest): continue
    wav = os.path.join(OUT, name + '.mp3')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f, '-vn', '-ac', '1', '-ar', '22050', '-b:a', '64k', wav], check=True)
    b = uuid.uuid4().hex
    body = (f'--{b}\r\nContent-Disposition: form-data; name="model_id"\r\n\r\nscribe_v1\r\n'
            f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="a.mp3"\r\nContent-Type: audio/mpeg\r\n\r\n').encode() + open(wav, 'rb').read() + f'\r\n--{b}--\r\n'.encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', data=body, method='POST',
                                 headers={'xi-api-key': KEY, 'Content-Type': f'multipart/form-data; boundary={b}'})
    d = json.load(urllib.request.urlopen(req, timeout=300)); json.dump(d, open(dest, 'w'))
    print(name, '|', d.get('text', '')[:400].replace('\n', ' '))
