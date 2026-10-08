"""Mix ad-1 music + SFX + narrator onto the b431 picture (160.866 s, 30 fps).
Cue times are film seconds, read off the b431 frames. align: 'onset' puts the
sound's first transient on the time, 'peak' puts its loudest point there."""
import os, json, random, subprocess, numpy as np
from scipy.signal import butter, sosfilt
HERE = os.path.dirname(os.path.abspath(__file__))
SR, DUR = 48000, 160.866
N = int(DUR * SR)

def load(path):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()

_cache = {}
def sfx(name):
    if name not in _cache: _cache[name] = load(os.path.join(HERE, 'sfx', name + '.mp3'))
    return _cache[name]

def db(g): return 10 ** (g / 20)

def place(bus, x, start_s):
    i = int(round(start_s * SR)); j0 = max(0, -i); i = max(0, i)
    n = min(len(x) - j0, N - i)
    if n > 0: bus[i:i + n] += x[j0:j0 + n]

CLIPS = []  # (start_s, label, samples) for the editable Studio timeline
def cue(bus, t, name, gain=0, align='onset', rate=1.0, lp=None, dur=None, pan=0.0, group=None):
    x = sfx(name)
    if rate != 1.0:  # varispeed: pitch and length together
        idx = np.arange(0, len(x) - 1, rate)
        x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in (0, 1)], 1)
    if lp: x = sosfilt(butter(2, lp, 'low', fs=SR, output='sos'), x, axis=0)
    a = np.abs(x).max(1)
    ref = int(np.argmax(a > a.max() * 0.1)) if align == 'onset' else int(np.argmax(a))
    x = x[ref - min(ref, int(0.01 * SR)):] if align == 'onset' else x
    if align == 'onset': ref = min(ref, int(0.01 * SR))
    if dur:
        x = x[:int((dur + (ref / SR)) * SR)].copy(); f = min(len(x), int(0.08 * SR))
        x[-f:] *= np.linspace(1, 0, f)[:, None]
    x = x * db(gain) * np.array([1 - max(0, pan), 1 + min(0, pan)])
    place(bus, x, t - ref / SR)
    CLIPS.append((t - ref / SR, group or name, x, group))

sfxbus = np.zeros((N, 2), np.float32)
C = lambda *a, **k: cue(sfxbus, *a, **k)

# 1. Lost in the catalog (desktop)
C(0.15, 'whoosh_soft', -10)
C(2.47, 'ui_swoosh', -16)
C(4.20, 'click', -2); C(4.25, 'ui_swoosh', -18)
C(5.33, 'click', -4)
C(7.25, 'ui_swoosh', -20, rate=0.8)                      # scroll
C(8.20, 'click', -2); C(8.25, 'ui_swoosh', -18)
C(9.08, 'click', -4)
C(10.85, 'click', -1); C(10.92, 'ui_swoosh', -14, rate=0.9)
C(11.55, 'typing', -12, dur=1.45)
C(13.13, 'pop', -4)
C(14.03, 'pop', -6, rate=0.85)
C(17.35, 'click', -1)
C(18.08, 'click', -3); C(18.20, 'ui_swoosh', -16, rate=0.85)
C(18.57, 'lost_stamp', 4)
C(19.95, 'pan_whoosh', -6, align='peak')
# 2. The last doubt (phone)
C(21.83, 'tap', 12); C(21.88, 'ui_swoosh', -16, rate=0.9)
C(22.15, 'typing', -13, dur=0.8, rate=1.1)
C(23.00, 'pop', -4)
C(23.90, 'pop', -6, rate=0.85)
C(26.45, 'tap', 12)
C(26.87, 'lost_stamp', 4)
# 3. The dull sea: stamps land at random moments, quieter as they recede
C(29.0, 'pullback', -10, align='peak')                # under the narrator
rnd = random.Random(7); t = 29.6
while t < 44.0:
    C(t, 'lost_stamp', rnd.uniform(-10, -4) - (t - 29.6) * 0.35, rate=rnd.uniform(0.85, 1.12),
      lp=rnd.uniform(900, 2200), pan=rnd.uniform(-0.6, 0.6), group='sea_lost_stamps')
    t += rnd.uniform(0.28, 0.6)
for t, g in ((37.40, 12), (38.40, 8), (39.35, 8), (40.50, 6)):   # caption beats; the last three sit under the narrator
    C(t, 'pulse', g)
# 4. The switch
C(45.45, 'glass_tick', -6, rate=0.8)
C(46.90, 'toggle', -3)
C(48.68, 'riser', -5, align='peak')
C(48.70, 'burst', -4.5)                     # generated file peaks at +3.4 dBFS
# 5. The reveal
C(50.72, 'logo_in', -7, align='peak')
C(51.40, 'appear_pop', -9)
C(52.73, 'fly_in', -14)
C(54.60, 'pen_strike', 2, align='peak')
C(54.87, 'sparkle', -7)
# 6. One desktop, sold
C(56.37, 'whoosh_soft', -9, align='peak')
C(59.60, 'typing', -13, dur=2.2)
C(62.30, 'pop', -6)
C(64.03, 'ui_swoosh', -7)
for k, t in enumerate((70.10, 70.22, 70.34)): C(t, 'glass_tick', -2, rate=1 + k * 0.08)
C(71.95, 'glass_tick', 0, rate=1.3)
C(76.40, 'ui_swoosh', -7)
C(78.75, 'bubble_pops', -9)
C(79.30, 'typing', -13, dur=1.4)
C(80.90, 'pop', -6)
C(88.25, 'dust', -5)
C(89.85, 'add_cart', -5)
C(90.15, 'cart_ding', 4)
C(93.00, 'ui_swoosh', -8)
C(93.37, 'appear_pop', -12)
C(98.85, 'add_cart', -5)
C(99.05, 'cart_ding', 4, rate=1.12)
C(99.67, 'sold', -1)
# 7. The selling sea
C(102.2, 'pullback', -7, align='peak', rate=1.1)
rnd = random.Random(11); t = 103.0
while t < 112.6:
    C(t, 'sold_light', rnd.uniform(-15, -9), rate=rnd.uniform(0.9, 1.3), pan=rnd.uniform(-0.6, 0.6), group='sea_sold_chimes')
    t += rnd.uniform(0.3, 0.7)
C(113.4, 'swell', -7, align='peak')
C(118.40, 'focus_pull', -6, align='peak')
# 8. Other stores, into the slot: each switch lands on the light
for k, t in enumerate((122.90, 125.23, 127.83, 129.20, 130.40, 131.47, 132.20, 133.03)):
    C(t, 'switch_flick', -9 + k * 0.4, align='peak', rate=1 + k * 0.025, pan=(-0.3 if k % 2 else 0.3))
C(134.50, 'dive', -5, align='peak')
# 9. End card (ea)
C(135.45, 'fly_in', -10)
C(136.43, 'fly_in', -5)
C(137.00, 'shine', -12)
C(138.10, 'handwriting', -4)
C(140.35, 'tag_stamp', -5)
for t in (141.85, 143.40, 144.90, 146.40): C(t, 'check', -8)
for t in (143.60, 151.0, 155.2): C(t, 'shine', -16)

# Narrator, pain section only (Eleven v4, Sienna; vo.py writes vo/<id>.mp3 + .json).
# Each line is trimmed to 20 ms before its first syllable and levelled to the
# same RMS over the voiced part; its first syllable lands on the marker time.
import vo as _vo
VO_RMS = -17.0                                   # dBFS RMS of the voiced part
VO_AT = {'two-places': 0.40}                     # breathe in after the window opens
vobus = np.zeros((N, 2), np.float32); VO_SPANS = []
for vid, at, _ in _vo.LINES:
    x = load(os.path.join(HERE, 'vo', vid + '.mp3')); a = np.abs(x).max(1)
    on = int(np.argmax(a > a.max() * 0.05)); off = len(a) - int(np.argmax(a[::-1] > a.max() * 0.02))
    pre = min(on, int(0.02 * SR)); x = x[on - pre:off + int(0.25 * SR)].copy()
    voiced = x[np.abs(x).max(1) > a.max() * 0.05]
    x *= db(VO_RMS - 20 * np.log10(np.sqrt(np.mean(voiced ** 2))))
    f = int(0.25 * SR); x[-f:] *= np.linspace(1, 0, f)[:, None]
    start = VO_AT.get(vid, at) - pre / SR
    place(vobus, x, start); VO_SPANS.append((start, start + len(x) / SR))
    CLIPS.append((start, 'vo_' + vid, x, None))

# Music: cold half under the pain, warm half drops on the switch burst (48.70)
music = np.zeros((N, 2), np.float32)
cold = load(os.path.join(HERE, 'music', 'cold.mp3'))
place(music, cold, 0.0)
warm = load(os.path.join(HERE, 'music', 'warm.mp3'))
# The generated cue starts its final decay at 104 s, which leaves the end card
# bare. Replay two bars (112 bpm) from 100.5 s so the last chord rings under it.
SPLICE, LOOP, XF = int(100.5 * SR), int(4.2865 * SR), int(0.03 * SR)
ramp = np.linspace(0, 1, XF)[:, None]
tail = warm[SPLICE - LOOP:].copy()
tail[:XF] = warm[SPLICE:SPLICE + XF] * (1 - ramp) + tail[:XF] * ramp
warm = np.concatenate([warm[:SPLICE], tail])
WARM_ONSET = 1.100                                          # first note in warm.mp3
place(music, warm, 48.70 - WARM_ONSET)
# level automation (film seconds, dB), linear between points
pts = [(0, 2), (37.5, 2), (38.4, -2), (44.0, -2), (46.6, -40), (48.6, -40), (48.70, 0), (55.8, 0), (57.2, -8), (99.0, -8), (99.67, 0),
       (112.6, 0), (113.4, -4), (117.8, -4), (118.6, 0), (133.5, 0), (135.4, -3), (160.5, -3), (160.866, -40)]
tt = np.arange(N) / SR
ENV = np.interp(tt, [p[0] for p in pts], [p[1] for p in pts])
# duck the music 12 dB under the narrator: 250 ms down before a line, 500 ms back up after
DUCK = np.zeros(N)
for s0, s1 in VO_SPANS:
    DUCK = np.minimum(DUCK, np.interp(tt, [s0 - 0.25, s0, s1, s1 + 0.5], [0, -12, -12, 0], left=0, right=0))
ENV = ENV + DUCK
music *= db(ENV)[:, None].astype(np.float32)

def write(path, x, codec='pcm_s24le'):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-',
                    '-c:a', codec, path], input=x.astype(np.float32).tobytes(), check=True)

os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
write(os.path.join(HERE, 'out', 'stem-music.wav'), music)
write(os.path.join(HERE, 'out', 'stem-sfx.wav'), sfxbus)
write(os.path.join(HERE, 'out', 'stem-vo.wav'), vobus)
write(os.path.join(HERE, 'out', 'premaster.wav'), music * db(-2) + sfxbus + vobus, 'pcm_f32le')  # float: overs go to the limiter, not a hard clip
print('peak music', 20 * np.log10(np.abs(music).max()), 'sfx', 20 * np.log10(np.abs(sfxbus).max()))

# Studio clips: one file per sound, named by its start time; the two random
# stamp scatters are one clip each. Music gets the same -2 dB as the mix.
studio = os.path.join(HERE, 'studio', 'clips')
os.makedirs(studio, exist_ok=True)
for f in os.listdir(studio): os.remove(os.path.join(studio, f))
groups, rows = {}, []
for start, label, x, group in CLIPS:
    if group:
        groups.setdefault(group, []).append((start, x)); continue
    rows.append((start, label, x))
for group, items in groups.items():
    s0 = min(a for a, _ in items); n = max(int((a - s0) * SR) + len(x) for a, x in items)
    buf = np.zeros((n, 2), np.float32)
    for a, x in items:
        i = int((a - s0) * SR); buf[i:i + len(x)] += x
    rows.append((s0, group, buf))
warm_start = 48.70 - WARM_ONSET
def lvl(t0, n):  # the music's level automation + ducking for a clip starting at t0
    i0 = int(round(t0 * SR)); e = np.full(n, ENV[-1]); k = min(n, N - i0); e[:k] = ENV[i0:i0 + k]
    return db(e)[:, None] * db(-2)
rows.append((0.0, 'music_cold', cold * lvl(0.0, len(cold))))
wn = min(len(warm), N - int(warm_start * SR))
rows.append((warm_start, 'music_warm', warm[:wn] * lvl(warm_start, wn)))
rows.sort(key=lambda r: r[0])
with open(os.path.join(HERE, 'studio', 'cue-sheet.csv'), 'w') as cs:
    cs.write('n,start_s,timecode,file\n')
    for k, (start, label, x) in enumerate(rows, 1):
        start = max(0.0, start)
        fname = f'{k:02d} {start:07.3f} {label}.wav'
        write(os.path.join(studio, fname), x)
        fr = int(round(start * 30)); tc = f'{fr // 1800:02d}:{fr // 30 % 60:02d}:{fr % 30:02d}'
        cs.write(f'{k},{start:.3f},{tc},{fname}\n')
print(len(rows), 'studio clips')
