"""v13b: the quick demo stores speak, each in its own language (agent lines),
written like the film's other voice lines (public/promo/voice/<id>.wav + .json)."""
import json, base64, subprocess, urllib.request
KEY = next(l.split('=', 1)[1].strip().strip('"\'') for l in open('../trujilloai-bizmis-project/.env') if l.startswith('ELEVENLABS_API_KEY='))
LINES = {   # id: (voice, text)   voices used nowhere else in the film
    'quick-es': ('XrExE9yKIg1WjnnlVkGX', '[warm] ¡Este sérum te va a encantar!'),          # Matilda, skincare
    'quick-fr': ('pFZP5JQG7iQjIQuC4Bku', '[warm] Parfait pour votre salon !'),            # Lily, home
    'quick-de': ('cjVigY5qzO86Huf0OWal', '[confident] Passt perfekt zu Ihrem Auto!'),    # Eric, car parts
    'quick-it': ('CwhRBWXzGAHq8TQ4Fs17', '[warm] Perfetto con la cena!'),                 # Roger, wine
}
for id_, (voice, text) in LINES.items():
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192', method='POST',
                                 data=json.dumps({'text': text, 'model_id': 'eleven_v3', 'voice_settings': {'stability': 0.5, 'similarity_boost': 0.8}}).encode(),
                                 headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
    r = json.load(urllib.request.urlopen(req, timeout=180))
    mp3 = f'tmp/{id_}.mp3'; open(mp3, 'wb').write(base64.b64decode(r['audio_base64']))
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', mp3, '-ar', '48000', '-ac', '2', f'public/promo/voice/{id_}.wav'], check=True)
    al = r['alignment']
    chars = [{'char': c, 'startMs': int(s * 1000), 'durMs': int((e - s) * 1000)} for c, s, e in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds'])]
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3], capture_output=True, text=True).stdout)
    json.dump({'id': id_, 'role': 'clerk', 'text': text, 'said': text, 'durationMs': int(dur * 1000), 'chars': chars}, open(f'public/promo/voice/{id_}.json', 'w'), ensure_ascii=False)
    print(id_, round(dur, 2))
