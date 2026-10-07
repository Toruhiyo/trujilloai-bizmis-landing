"""Re-voice the agent in a store-reel take with the avatar's own preset voice.

The voice server only accepts some preset voices as call overrides, so some
takes are recorded with the avatar's look but the agent's default voice
(the film's clerk voice, which must never repeat). This keeps the take's
picture and the shopper's voice, finds the agent's utterances (diarized
speech-to-text, the shopper's known line marks the shopper), re-speaks each
one with the avatar's voice, fits it to the original span (so the mouth and
the on-screen text still match) and swaps it into the audio.

  python scripts/revoice-agent.py <take.mp4> <voice_id> <out.mp4> [--shopper "the shopper's line"]
"""
import sys, os, json, subprocess, urllib.request, uuid, numpy as np
take, voice, out = sys.argv[1], sys.argv[2], sys.argv[3]
shopper = sys.argv[sys.argv.index('--shopper') + 1] if '--shopper' in sys.argv else ''
SR = 48000
ENV = os.path.join(os.path.dirname(__file__), '..', '..', 'trujilloai-bizmis-project', '.env')
KEY = os.environ.get('ELEVENLABS_API_KEY') or next(l.split('=', 1)[1].strip().strip('"\'') for l in open(ENV) if l.startswith('ELEVENLABS_API_KEY='))
def pcm(path):
    return np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-vn', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32).copy()
def stt(path):
    data = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-vn', '-ac', '1', '-ar', '16000', '-f', 'wav', '-'], capture_output=True).stdout
    b = uuid.uuid4().hex
    body = (f'--{b}\r\nContent-Disposition: form-data; name="model_id"\r\n\r\nscribe_v1\r\n--{b}\r\nContent-Disposition: form-data; name="diarize"\r\n\r\ntrue\r\n'
            f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="a.wav"\r\nContent-Type: audio/wav\r\n\r\n').encode() + data + f'\r\n--{b}--\r\n'.encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', data=body, headers={'xi-api-key': KEY, 'Content-Type': f'multipart/form-data; boundary={b}'})
    return json.load(urllib.request.urlopen(req, timeout=300))
def tts(text):
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_192', method='POST',
                                 data=json.dumps({'text': text, 'model_id': 'eleven_multilingual_v2', 'voice_settings': {'stability': 0.5, 'similarity_boost': 0.8}}).encode(),
                                 headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
    mp3 = urllib.request.urlopen(req, timeout=180).read()
    y = np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', '-', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], input=mp3, capture_output=True).stdout, np.float32).copy()
    a = np.abs(y); on = np.flatnonzero(a > a.max() * 0.02)
    return y[max(0, on[0] - int(0.01 * SR)):on[-1] + int(0.05 * SR)] if len(on) else y
def fit(y, seconds):
    ratio = (len(y) / SR) / max(0.2, seconds)
    ratio = min(1.25, max(0.85, ratio))
    if abs(ratio - 1) < 0.02: return y
    return np.frombuffer(subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-af', f'atempo={ratio:.4f}', '-f', 'f32le', '-'],
                                        input=y.astype(np.float32).tobytes(), capture_output=True).stdout, np.float32).copy()
x = pcm(take); r = stt(take)
words = [w for w in r['words'] if w['type'] == 'word']
norm = lambda s: ''.join(ch for ch in s.lower() if ch.isalnum() or ch == ' ').split()
shop_words = set(norm(shopper))
speakers = {}
for w in words: speakers.setdefault(w.get('speaker_id'), []).append(w)
def shopper_score(ws): return sum(1 for w in ws if norm(w['text']) and norm(w['text'])[0] in shop_words) / max(1, len(ws))
shopper_id = max(speakers, key=lambda k: shopper_score(speakers[k])) if shopper and len(speakers) > 1 else None
agent = [w for w in words if w.get('speaker_id') != shopper_id]
utts = []
for w in agent:
    if utts and w['start'] - utts[-1]['end'] < 0.7: utts[-1]['end'] = w['end']; utts[-1]['text'] += ' ' + w['text']
    else: utts.append({'start': w['start'], 'end': w['end'], 'text': w['text']})
y = x.copy(); f = int(0.03 * SR)
for u in utts:
    a, b = int((u['start'] - 0.06) * SR), int((u['end'] + 0.12) * SR)
    a, b = max(0, a), min(len(y), b)
    L = b - a; k = min(f, L // 2); gain = np.zeros(L)          # the original agent words fade out, the span goes quiet
    if k: gain[:k] = np.linspace(1, 0, k); gain[L - k:] = np.linspace(0, 1, k)
    y[a:b] *= gain
    said = fit(tts(u['text']), u['end'] - u['start'] + 0.1)
    said *= (np.sqrt(np.mean(x[a:b] ** 2)) + 1e-6) / (np.sqrt(np.mean(said ** 2)) + 1e-6)
    j = int(u['start'] * SR); n = min(len(said), len(y) - j); y[j:j + n] += said[:n]
    print(f"{u['start']:6.2f}-{u['end']:6.2f}  {u['text']}")
y = np.clip(y, -1, 1)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', take, '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-map', '0:v', '-map', '1:a',
                '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ac', '2', out], input=y.astype(np.float32).tobytes(), check=True)
print(f'{out}: {len(utts)} agent utterances re-voiced (shopper speaker {shopper_id})')
