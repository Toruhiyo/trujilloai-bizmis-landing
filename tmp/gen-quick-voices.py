"""v13b: the quick demo stores speak, each in its own language (agent lines),
written like the film's other voice lines (public/promo/voice/<id>.wav + .json)."""
import json, base64, subprocess, urllib.request
KEY = next(l.split('=', 1)[1].strip().strip('"\'') for l in open('../trujilloai-bizmis-project/.env') if l.startswith('ELEVENLABS_API_KEY='))
LINES = {   # id: (voice, text)   v18: a different short line each (shorter every store), biggest markets, Chinese last
    'quick-es': ('pFZP5JQG7iQjIQuC4Bku', '[excited] ¡Gran elección!'),   # Lily, Home & DIY (US / LatAm): "Great choice!"
    'quick-ja': ('XrExE9yKIg1WjnnlVkGX', '[excited] おすすめです！'),     # Matilda, Skincare (Japan): "I recommend it!"
    'quick-pt': ('cjVigY5qzO86Huf0OWal', 'Serve!'),                     # Eric, car parts (Brazil): "It fits!"
    'quick-zh': ('CwhRBWXzGAHq8TQ4Fs17', '[excited] 干杯！'),             # Roger, wine (China): "Cheers!"
}
for id_, (voice, text) in LINES.items():
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192', method='POST',
                                 data=json.dumps({'text': text, 'model_id': 'eleven_v4', 'voice_settings': {'stability': 0.35, 'similarity_boost': 0.8, 'speed': 1.15}}).encode(),
                                 headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
    r = json.load(urllib.request.urlopen(req, timeout=180))
    mp3 = f'tmp/{id_}.mp3'; open(mp3, 'wb').write(base64.b64decode(r['audio_base64']))
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', mp3, '-ar', '48000', '-ac', '2', f'public/promo/voice/{id_}.wav'], check=True)
    al = r['alignment']
    chars = [{'char': c, 'startMs': int(s * 1000), 'durMs': int((e - s) * 1000)} for c, s, e in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds'])]
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3], capture_output=True, text=True).stdout)
    json.dump({'id': id_, 'role': 'clerk', 'text': text, 'said': text, 'durationMs': int(dur * 1000), 'chars': chars}, open(f'public/promo/voice/{id_}.json', 'w'), ensure_ascii=False)
    print(id_, round(dur, 2))
