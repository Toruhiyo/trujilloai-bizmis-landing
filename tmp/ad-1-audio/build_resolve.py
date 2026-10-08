"""Build a DaVinci Resolve timeline (FCPXML 1.9) for ad-1: the ProRes picture on
V1 and every sound from mix.py as its own clip on its exact frame. Each WAV is
padded with leading silence so its frame-rounded start keeps the sample-exact
sync. Import in Resolve: File > Import > Timeline..."""
import os, math, urllib.parse, numpy as np
import mix  # renders the mix and leaves mix.rows (start_s, label, samples)
from mix import SR, write

FPS, SPF = 30, 1600                       # 48000 / 30 samples per frame
FRAMES = 4826
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.expanduser('~/Movies/ad-1-resolve')  # Resolve (App Store build) is sandboxed to ~/Movies
MEDIA = os.path.join(OUT, 'media')
VIDEO = os.path.join(MEDIA, 'ad-1-b431-3840x2160-prores422hq.mov')
os.makedirs(MEDIA, exist_ok=True)
# Never delete here: a live Resolve project may still reference older files.

# Track groups, top to bottom under the picture
import vo
GROUPS = [
 ('VO', {'vo_' + v for v, _, _ in vo.LINES}),
 ('Music', {'music_cold', 'music_warm'}),
 ('Stamps', {'lost_stamp', 'sea_lost_stamps', 'tag_stamp', 'pulse'}),
 ('Whooshes', {'whoosh_soft', 'ui_swoosh', 'pan_whoosh', 'pullback', 'riser', 'burst', 'logo_in', 'fly_in',
               'switch_flick', 'dive', 'focus_pull', 'swell'}),
 ('UI', {'click', 'tap', 'pop', 'typing', 'glass_tick', 'toggle', 'check', 'appear_pop', 'bubble_pops'}),
 ('Sparkle & sale', {'sparkle', 'dust', 'add_cart', 'cart_ding', 'sold', 'sea_sold_chimes', 'shine', 'pen_strike',
                     'handwriting'}),
]
group_of = {name: g for g, names in GROUPS for name in names}

clips = []
for k, (start, label, x) in enumerate(mix.rows, 1):
    start = max(0.0, start)
    s = int(round(start * SR)); f0 = s // SPF; pad = s - f0 * SPF
    y = np.concatenate([np.zeros((pad, 2), np.float32), x.astype(np.float32)])
    nfr = math.ceil(len(y) / SPF); nfr = min(nfr, FRAMES - f0)
    y = np.concatenate([y, np.zeros((nfr * SPF - len(y), 2), np.float32)])[:nfr * SPF] if nfr * SPF >= len(y) else y[:nfr * SPF]
    fname = f'{k:02d}_{f0:04d}f_{label}.wav'
    write(os.path.join(MEDIA, fname), y)
    clips.append({'k': k, 'label': label, 'file': fname, 'f0': f0, 'n': nfr, 'group': group_of[label]})

# lanes: greedy within each group so clips never overlap on a track
lane, names = -1, []
for gname, _ in GROUPS:
    tracks = []                            # end frame per track
    for c in [c for c in clips if c['group'] == gname]:
        for i, end in enumerate(tracks):
            if c['f0'] >= end: tracks[i] = c['f0'] + c['n']; c['t'] = i; break
        else:
            tracks.append(c['f0'] + c['n']); c['t'] = len(tracks) - 1
    for i in range(len(tracks)):
        names.append(f'{gname} {i + 1}' if len(tracks) > 1 else gname)
    for c in clips:
        if c['group'] == gname: c['lane'] = lane - c['t']
    lane -= len(tracks)

def url(p): return 'file://' + urllib.parse.quote(p)
def esc(s): return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

res = [f'<format id="r0" name="FFVideoFormat2160p30" frameDuration="1/{FPS}s" width="3840" height="2160" colorSpace="1-1-1 (Rec. 709)"/>',
       f'<asset id="v1" name="ad-1 b431 picture" start="0s" duration="{FRAMES}/{FPS}s" hasVideo="1" hasAudio="0" format="r0" videoSources="1">'
       f'<media-rep kind="original-media" src="{url(VIDEO)}"/></asset>']
conn = []
for c in clips:
    aid = f'a{c["k"]}'
    res.append(f'<asset id="{aid}" name="{esc(c["file"][:-4])}" start="0s" duration="{c["n"]}/{FPS}s" hasAudio="1" audioSources="1" '
               f'audioChannels="2" audioRate="48000"><media-rep kind="original-media" src="{url(os.path.join(MEDIA, c["file"]))}"/></asset>')
    role = 'music' if c['group'] == 'Music' else 'effects'
    conn.append(f'<asset-clip ref="{aid}" lane="{c["lane"]}" offset="{c["f0"]}/{FPS}s" start="0s" duration="{c["n"]}/{FPS}s" '
                f'name="{esc(c["file"][:-4])}" audioRole="{role}"/>')
xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
  <resources>
    {chr(10).join('    ' + r for r in res).strip()}
  </resources>
  <library>
    <event name="ad-1">
      <project name="ad-1 b431 music + SFX">
        <sequence format="r0" duration="{FRAMES}/{FPS}s" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
          <spine>
            <asset-clip ref="v1" name="ad-1 b431 picture" offset="0s" start="0s" duration="{FRAMES}/{FPS}s" format="r0" tcFormat="NDF">
              {chr(10).join('              ' + c for c in conn).strip()}
            </asset-clip>
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
'''
open(os.path.join(OUT, 'ad-1-b431-music-sfx.fcpxml'), 'w').write(xml)
with open(os.path.join(OUT, 'tracks.txt'), 'w') as t:
    for i, n in enumerate(names, 1): t.write(f'A{i}  {n}\n')
print(len(clips), 'clips on', len(names), 'tracks'); print(open(os.path.join(OUT, 'tracks.txt')).read())
