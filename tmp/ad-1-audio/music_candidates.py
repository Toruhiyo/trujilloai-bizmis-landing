"""Three 40 s pitch-music directions to choose from by ear."""
import json, os, urllib.request, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__))
KEY = next(l.split('=', 1)[1].strip().strip('"\'') for l in open('/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-project/.env') if l.startswith('ELEVENLABS_API_KEY='))
NEG = ['corporate', 'stock music', 'explainer video music', 'ukulele', 'whistling', 'hand claps', 'generic', 'cheesy', 'vocals', 'dubstep', 'epic trailer']
C = {
 'A-minimal-electronic': ['minimal sophisticated electronic', 'deep warm sub bass', 'crisp restrained drums', 'airy glassy synth chords', 'cool, confident, premium', 'keynote product reveal', '110 bpm', 'instrumental'],
 'B-organic-indie': ['organic indie electronic', 'muted electric guitar plucks', 'finger snaps and soft kick', 'warm round bass', 'light, optimistic, understated, stylish', '104 bpm', 'instrumental'],
 'C-piano-pop': ['modern minimal piano-led pop', 'punchy felt piano chords', 'tight dry drums', 'deep bass', 'elegant, uplifting, restrained', '100 bpm', 'instrumental'],
}
def gen(item):
    name, styles = item
    plan = {'positive_global_styles': styles, 'negative_global_styles': NEG, 'sections': [
        {'section_name': 'Drop', 'duration_ms': 12000, 'lines': [], 'positive_local_styles': ['starts on the downbeat at full groove'], 'negative_local_styles': ['fade in', 'intro']},
        {'section_name': 'Groove', 'duration_ms': 18000, 'lines': [], 'positive_local_styles': ['steady, room for a voice-over'], 'negative_local_styles': ['busy lead']},
        {'section_name': 'Lift', 'duration_ms': 10000, 'lines': [], 'positive_local_styles': ['lifts, then a clean resolved ending'], 'negative_local_styles': ['abrupt stop']}]}
    req = urllib.request.Request('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192', method='POST',
        data=json.dumps({'composition_plan': plan, 'model_id': 'music_v1', 'respect_sections_durations': True}).encode(),
        headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
    dest = os.path.join(HERE, 'music', f'cand-{name}.mp3')
    if os.path.exists(dest): return dest
    with urllib.request.urlopen(req, timeout=900) as r: open(dest, 'wb').write(r.read())
    return dest
with cf.ThreadPoolExecutor(1) as ex:
    for d in ex.map(gen, C.items()): print('wrote', d)
