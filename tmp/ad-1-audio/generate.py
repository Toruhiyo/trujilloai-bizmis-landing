"""Generate ad-1 SFX + music with the ElevenLabs API. Idempotent: skips files that exist."""
import json, os, sys, urllib.request, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__))
ENV = '/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-project/.env'
KEY = next(l.split('=', 1)[1].strip().strip('"\'') for l in open(ENV) if l.startswith('ELEVENLABS_API_KEY='))

def post(url, body, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 1000:
        return dest, 'skip'
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method='POST',
                                 headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            open(dest, 'wb').write(r.read())
        return dest, 'ok'
    except urllib.error.HTTPError as e:
        return dest, f'HTTP {e.code}: {e.read()[:400]!r}'

SFX = {
 'whoosh_soft':   (1.5, 'soft airy whoosh of a window smoothly opening on a computer screen, gentle, clean, modern UI'),
 'click':         (0.5, 'single soft mouse click on a trackpad, clean, close, dry'),
 'pop':           (0.5, 'tiny soft UI pop of a chat message bubble appearing, clean, subtle'),
 'typing':        (2.5, 'quiet laptop keyboard typing, soft keystrokes, steady relaxed pace, close, dry'),
 'lost_stamp':    (1.2, 'heavy dull rubber stamp slamming onto paper on a desk, low muffled thud, grey and deflating'),
 'pan_whoosh':    (1.0, 'fast smooth camera pan whoosh, airy swish left to right'),
 'tap':           (0.5, 'soft finger tap on a glass phone screen, subtle'),
 'pullback':      (3.5, 'slow airy cinematic whoosh pulling back and away, wide, soft, cold'),
 'pulse':         (1.2, 'deep low muted sub bass pulse hit, like a slow heartbeat, dark, minimal'),
 'toggle':        (0.6, 'crisp satisfying toggle switch flip click, small plastic switch, clean'),
 'riser':         (2.0, 'short tense riser sweep building up quickly to a drop, airy rising noise and tone'),
 'burst':         (3.0, 'bright warm whoosh impact burst explosion of color, uplifting, energetic swoosh boom, modern'),
 'logo_in':       (1.2, 'smooth swoosh as a logo slides into place with a soft clean tick at the end'),
 'appear_pop':    (0.6, 'soft bouncy pop as a cartoon character appears, playful, clean'),
 'pen_strike':    (0.8, 'quick marker pen strike-through line drawn on paper, single stroke'),
 'sparkle':       (1.5, 'magical bright sparkle chime shimmer, positive, like a transformation, glittery'),
 'ui_swoosh':     (0.8, 'quick clean UI swoosh as cards rearrange on a screen, subtle'),
 'glass_tick':    (0.5, 'tiny crisp glass tick, small chip appearing, delicate'),
 'bubble_pops':   (1.0, 'several small soft bubble pops in quick succession, playful'),
 'dust':          (1.8, 'soft magical dissolve into glittering dust, airy sparkle fading away'),
 'add_cart':      (1.2, 'button press click followed by a quick swoosh of an item flying into a shopping cart'),
 'cart_ding':     (1.0, 'pleasant bright two-note notification ding, cart badge, positive, clean'),
 'sold':          (2.0, 'satisfying success sound, warm bright chime with a soft stamp, sale completed, rewarding'),
 'sold_light':    (0.8, 'small bright positive chime blip, success, light and short'),
 'swell':         (3.0, 'warm soft rising tonal swell, glowing, uplifting, smooth'),
 'focus_pull':    (2.0, 'reverse whoosh resolving into focus, soft airy suck-in, cinematic'),
 'switch_flick':  (0.8, 'quick light flick whoosh transition with a tiny shimmer, like a slide changing'),
 'dive':          (2.0, 'big fast cinematic whoosh diving forward into bright white light'),
 'fly_in':        (1.0, 'soft swoosh of text flying in toward the camera and settling, elegant'),
 'shine':         (1.5, 'subtle metallic shine glint shimmer sweep, polished metal gleam'),
 'handwriting':   (1.3, 'quick handwriting with a marker pen on paper, a short phrase written'),
 'tag_stamp':     (0.7, 'light crisp paper tag stamp, small and satisfying, clean thump'),
 'check':         (0.5, 'soft pen tick check mark drawn quickly, with a tiny bright pop'),
}

MUSIC = {
 'cold': {
  'positive_global_styles': ['minimal cinematic underscore', 'muted felt piano', 'soft ticking pulse', 'cold, grey, neutral, slightly uneasy', 'sparse', 'instrumental', '84 bpm'],
  'negative_global_styles': ['vocals', 'drums kit', 'uplifting', 'epic', 'happy'],
  'sections': [
   {'section_name': 'Lost in the catalog', 'duration_ms': 18500, 'lines': [],
    'positive_local_styles': ['very sparse muted felt piano notes', 'quiet clock-like tick', 'lots of space', 'curious but empty'],
    'negative_local_styles': ['loud', 'bass drops']},
   {'section_name': 'The last doubt', 'duration_ms': 9700, 'lines': [],
    'positive_local_styles': ['same piano motif', 'low sustained pad enters', 'slight tension', 'hesitant'],
    'negative_local_styles': ['loud']},
   {'section_name': 'The dull sea', 'duration_ms': 15300, 'lines': [],
    'positive_local_styles': ['repetitive mechanical ostinato', 'building tension', 'pulsing low synth', 'cold, monotonous, relentless'],
    'negative_local_styles': ['resolution', 'warm']},
   {'section_name': 'Fade to silence', 'duration_ms': 3000, 'lines': [],
    'positive_local_styles': ['everything stops', 'single low note decaying', 'near silence'],
    'negative_local_styles': ['new melody']},
  ]},
 'warm': {
  'positive_global_styles': ['modern upbeat tech commercial', 'warm, bright, optimistic, confident', 'plucked synths, soft claps, warm bass', 'instrumental', '112 bpm', 'major key'],
  'negative_global_styles': ['vocals', 'aggressive', 'dark', 'dubstep'],
  'sections': [
   {'section_name': 'Burst and reveal', 'duration_ms': 7700, 'lines': [],
    'positive_local_styles': ['immediate bright drop on the first beat', 'warm uplifting chords', 'shimmering'],
    'negative_local_styles': ['slow intro', 'fade in']},
   {'section_name': 'The agent sells', 'duration_ms': 43200, 'lines': [],
    'positive_local_styles': ['light playful minimal groove', 'soft plucks and muted bass', 'low energy so dialogue sits on top', 'steady'],
    'negative_local_styles': ['busy lead melody', 'loud drums']},
   {'section_name': 'Sold and the selling sea', 'duration_ms': 13400, 'lines': [],
    'positive_local_styles': ['full groove kicks in', 'joyful, energetic', 'claps and bright plucks'],
    'negative_local_styles': ['quiet']},
   {'section_name': 'Boost sales', 'duration_ms': 5300, 'lines': [],
    'positive_local_styles': ['held warm chord', 'filtered, suspended', 'anticipation'],
    'negative_local_styles': ['drums']},
   {'section_name': 'Any store', 'duration_ms': 15200, 'lines': [],
    'positive_local_styles': ['driving beat returns', 'building energy', 'accelerating feel', 'rising'],
    'negative_local_styles': ['breakdown']},
   {'section_name': 'End card', 'duration_ms': 27400, 'lines': [],
    'positive_local_styles': ['warm resolved confident outro', 'gentle groove', 'ends on a final ringing major chord'],
    'negative_local_styles': ['abrupt stop', 'new theme']},
  ]},
}

jobs = []
for name, (dur, text) in SFX.items():
    jobs.append(('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192',
                 {'text': text, 'duration_seconds': dur, 'prompt_influence': 0.55},
                 os.path.join(HERE, 'sfx', f'{name}.mp3')))
for name, plan in MUSIC.items():
    jobs.append(('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192',
                 {'composition_plan': plan, 'model_id': 'music_v1', 'respect_sections_durations': True},
                 os.path.join(HERE, 'music', f'{name}.mp3')))
only = set(sys.argv[1:])
if only: jobs = [j for j in jobs if os.path.basename(j[2]).split('.')[0] in only]
with cf.ThreadPoolExecutor(3) as ex:
    for dest, status in ex.map(lambda j: post(*j), jobs):
        print(os.path.basename(dest), status, flush=True)
