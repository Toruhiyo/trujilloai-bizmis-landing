import json, subprocess, uuid, urllib.request
KEY = next(l.split('=', 1)[1].strip().strip('"\'') for l in open('../trujilloai-bizmis-project/.env') if l.startswith('ELEVENLABS_API_KEY='))
for name in ['fashion', 'electronics', 'books', 'gaming']:
    data = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f'public/promo/stores/reel/v13/{name}.mp4', '-vn', '-ac', '1', '-ar', '16000', '-f', 'wav', '-'], capture_output=True).stdout
    b = uuid.uuid4().hex
    body = (f'--{b}\r\nContent-Disposition: form-data; name="model_id"\r\n\r\nscribe_v1\r\n--{b}\r\nContent-Disposition: form-data; name="file"; filename="a.wav"\r\nContent-Type: audio/wav\r\n\r\n').encode() + data + f'\r\n--{b}--\r\n'.encode()
    r = json.load(urllib.request.urlopen(urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', data=body, headers={'xi-api-key': KEY, 'Content-Type': f'multipart/form-data; boundary={b}'}), timeout=300))
    ws = [w for w in r['words'] if w['type'] == 'word']
    print(name, ' '.join(f"{w['text']}@{w['start']:.2f}" for w in ws))
