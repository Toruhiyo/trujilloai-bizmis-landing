"""Generate the ad-1 narrator lines for the pain section (before the switch)
with ElevenLabs Eleven v4, voice Sienna. Idempotent: skips lines that exist.
Lines and film times come from the b431 markers (public/promo/ad-1-script.md)."""
import json, os, sys, urllib.request, base64
HERE = os.path.dirname(os.path.abspath(__file__))
ENV = '/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-project/.env'
KEY = next(l.split('=', 1)[1].strip().strip('"\'') for l in open(ENV) if l.startswith('ELEVENLABS_API_KEY='))
VOICE, MODEL = 'oGZR5g7rlFABaB1ZfWkI', 'eleven_v4'   # Sienna
LINES = [
    ('two-places', 0.0, 'In every online store, a sale dies in two places.'),
    ('catalog', 7.167, 'Lost in the catalog.'),
    ('last-doubt', 20.467, 'Or stuck on the last doubt.'),
    ('salesperson', 23.900, 'In a physical store, a salesperson catches both.'),
    ('loses-both', 28.200, 'Online, a chatbot replies to both. And loses both.'),
    ('numbers-game', 38.700, "Online sales is a numbers game. And a chatbot doesn't play."),
]
if __name__ == '__main__':
    force = '--force' in sys.argv
    for i, (vid, t, text) in enumerate(LINES):
        dest = os.path.join(HERE, 'vo', f'{vid}.mp3')
        if os.path.exists(dest) and not force: print(vid, 'skip'); continue
        body = {'text': text, 'model_id': MODEL,
                'previous_text': LINES[i - 1][2] if i else None,
                'next_text': LINES[i + 1][2] if i + 1 < len(LINES) else None}
        req = urllib.request.Request(
            f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_192',
            data=json.dumps(body).encode(), method='POST',
            headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                d = json.load(r)
        except urllib.error.HTTPError as e:
            print(vid, 'HTTP', e.code, e.read()[:300]); continue
        open(dest, 'wb').write(base64.b64decode(d['audio_base64']))
        json.dump({'id': vid, 'at': t, 'text': text, 'alignment': d.get('alignment')},
                  open(dest[:-4] + '.json', 'w'))
        print(vid, 'ok')
