"""Jog points: add the film's chapters (blue) and key moments (green: hits,
cuts, stamps) as timeline markers on every Resolve timeline whose name starts
with the given prefix, timed from that export's markers.json + VO alignment.
Existing markers on those timelines are replaced.

  ~/Projects/tools/davinci-resolve-mcp/venv/bin/python resolve_markers.py <export dir> "<timeline prefix>"
"""
import os, sys, json
sys.path.insert(0, os.path.expanduser('~/Projects/tools/davinci-resolve-mcp'))
from src.utils.resolve_bridge_client import connect
EXP, PREFIX = sys.argv[1], sys.argv[2]
VOICE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'promo', 'voice')
M = json.load(open(os.path.join(EXP, 'markers.json')))
sfx = sorted(M['sfx'], key=lambda e: e['at'])
first = lambda k, n=0: ([e['at'] / 1000 for e in sfx if e['id'] == k] + [None] * (n + 1))[n]
takes = {v['src'].rsplit('/', 1)[-1].split('.')[0]: v['atMs'] / 1000 for v in M['voice']}
def said(take, phrase):
    if take not in takes: return None
    try: j = json.load(open(os.path.join(VOICE, f'{take}.json')))
    except OSError: return takes[take]
    text = ''.join(c['char'] for c in j['chars']); i = text.find(phrase)
    return takes[take] + j['chars'][i]['startMs'] / 1000 if i >= 0 else takes[take]
CH, MO = 'Blue', 'Green'
marks = [
    (0.0, CH, 'PAIN: shoppers walk in'), (said('t-pain', 'Some get lost'), CH, 'Lost in the catalog'),
    (said('t-pain', 'Others get stuck'), CH, 'Stuck on a question'), (said('t-pain', 'A chatbot'), MO, 'Chatbot: wall of text'),
    (said('t-pain', 'A real person'), MO, 'Real person: hours later'), (first('clock-ff'), MO, 'Clock fast-forward'),
    (said('t-pain', 'Either way'), CH, 'They leave'), (first('lost-sea'), MO, 'Sea of lost cards'),
    (first('climax-beat'), CH, 'Pain climax'), (takes.get('t-switch'), CH, 'THE TURN: physical store'),
    (said('t-switch', 'So we built'), MO, 'So we built one'), (first('burst'), CH, 'BIZMIS: burst'),
    (takes.get('t-reveal'), MO, 'Meet Bizmis'), (first('rewind'), CH, 'Rewind: same store'),
    (takes.get('t-lost'), CH, 'Lost -> the right one'), (takes.get('clerk-compare'), MO, 'Compare'),
    (takes.get('t-doubt'), CH, 'Doubt -> answered'), (takes.get('clerk-answer'), MO, 'Answer'),
    (takes.get('clerk-upsell'), CH, 'The add-on'), (first('sold'), CH, 'SOLD: visits become sales'),
    (takes.get('t-sync'), CH, 'One click, in sync'), (first('reel-in'), CH, 'DEMO STORES: tunnel'),
    *[(t, MO, f'Store {i + 1}') for i, t in enumerate([e['at'] / 1000 for e in sfx if e['id'] == 'reel-slam'][:4])],
    (first('reel-quick'), CH, 'Fast run: languages'), (first('reel-strobe'), MO, 'Strobe'),
    (first('reel-land'), CH, 'Your store'), (takes.get('t-ea'), CH, 'EARLY ACCESS CTA'),
    (first('hand-write'), MO, 'Only 50 spots'), (first('ea-final'), CH, 'Final hit'),
]
marks = [m for m in marks if m[0] is not None]
r = connect(require_enabled=False, timeout=300); p = r.GetProjectManager().GetCurrentProject()
fps = float(p.GetSetting('timelineFrameRate') or 30)
done = 0
for i in range(1, p.GetTimelineCount() + 1):
    tl = p.GetTimelineByIndex(i)
    if not tl.GetName().startswith(PREFIX): continue
    for f in list((tl.GetMarkers() or {}).keys()): tl.DeleteMarkerAtFrame(f)
    used = set(); ok = 0
    for t, color, name in marks:
        f = int(round(t * fps))
        while f in used: f += 1
        used.add(f); ok += bool(tl.AddMarker(f, color, name, '', 1))
    print(tl.GetName(), f'{ok}/{len(marks)} markers'); done += 1
r.GetProjectManager().SaveProject()
print(f'{done} timelines, fps {fps}')
