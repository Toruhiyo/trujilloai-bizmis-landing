"""Generate ElevenLabs sound effects from a prompt table, saving each prompt
next to its file (prompts.json), since API generations don't appear in the
web app's Sound Effects history.

  python el_sfx.py <out dir> <table.json>   table: {name: [prompt, seconds, takes]}
"""
import json, os, sys, time, urllib.request, concurrent.futures as cf
OUT, TABLE = sys.argv[1], json.load(open(sys.argv[2]))
KEY = next(l.split('=', 1)[1].strip().strip('"\'') for l in open('/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-project/.env') if l.startswith('ELEVENLABS_API_KEY='))
log_path = os.path.join(OUT, 'prompts.json'); log = json.load(open(log_path)) if os.path.exists(log_path) else {}
jobs = [(f'{k}{i or ""}', p, d) for k, (p, d, n) in TABLE.items() for i in range(n)]
def gen(job):
    name, prompt, secs = job; body = {'text': prompt, 'duration_seconds': secs, 'prompt_influence': 0.65}; err = None
    for a in range(4):
        try:
            req = urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192', method='POST',
                                         data=json.dumps(body).encode(), headers={'xi-api-key': KEY, 'Content-Type': 'application/json'})
            open(os.path.join(OUT, name + '.mp3'), 'wb').write(urllib.request.urlopen(req, timeout=180).read())
            return name, prompt, secs
        except Exception as e: err = e; time.sleep(4 + 4 * a)
    print('FAIL', name, err); return None
with cf.ThreadPoolExecutor(3) as ex:
    for r in ex.map(gen, jobs):
        if r: log[r[0]] = {'prompt': r[1], 'seconds': r[2], 'prompt_influence': 0.65}; print('ok', r[0])
json.dump(log, open(log_path, 'w'), indent=1)
