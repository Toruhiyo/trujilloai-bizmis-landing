"""ad-1 v2 mix: the export's own voice track (narrator, clerk, shopper) + music
+ SFX laid on the picture events the film logs (markers.json: sfx, voice).
Retimes re-sync on their own: nothing here is a hand-typed time.

  python mix2.py <export folder> [--music music/v2.mp3 --music-switch <s>]
"""
import os, sys, json, random, subprocess, numpy as np
from scipy.signal import butter, sosfilt
HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
EXP = os.path.abspath(sys.argv[1])
arg = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
M = json.load(open(os.path.join(EXP, 'markers.json')))
REP = json.load(open(os.path.join(EXP, 'report.json')))
DUR = REP['durationSeconds']; N = int(DUR * SR)
VIDEO = REP['video']

def load(path, start=None, dur=None):
    cmd = ['ffmpeg', '-loglevel', 'error']
    if start is not None: cmd += ['-ss', str(start)]
    if dur is not None: cmd += ['-t', str(dur)]
    cmd += ['-i', path, '-map', '0:a:0', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    raw = subprocess.run(cmd, capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def db(g): return 10 ** (np.asarray(g) / 20)
def place(bus, x, t):
    i = int(round(t * SR)); j = max(0, -i); i = max(0, i); n = min(len(x) - j, N - i)
    if n > 0: bus[i:i + n] += x[j:j + n]

_cache = {}
def sfx(name):
    if name not in _cache: _cache[name] = load(os.path.join(HERE, 'sfx', name + '.mp3'))
    return _cache[name]

# v6 LOST/SOLD stamps and the climax (stamps.py, in the cues' keys).
# LOST_SFX / SOLD_SFX / CLIMAX name ElevenLabs files in sfx/el (CLIMAX=sink:
# no drone, the music itself sinks). The pain music keeps playing under the climax.
sys.path.insert(0, HERE)
import stamps
LOST_SFX = os.environ.get('LOST_SFX', 'lost-laserthud1'); SOLD_SFX = os.environ.get('SOLD_SFX', 'sold-coin-b'); CLIMAX = os.environ.get('CLIMAX', 'bed:el11/pulse-clock')   # v11: P3 low pulse + quiet clock bed (or 'deep', 'sink', 'none')
def stamp_cue(bus, t, x, gain, pan=0.0, track='Sea stamps', label='stamp'):
    x = x * db(gain) * np.array([1 - max(0, pan), 1 + min(0, pan)])
    place(bus, x, t); CLIPS.append((t, track, label, x))
CLIPS = []   # (start_s, track, label, samples) — every sound as its own clip, for Resolve
def cue(bus, t, name, gain=0, align='onset', rate=1.0, lp=None, dur=None, pan=0.0, track='SFX'):
    x = sfx(name)
    if rate != 1.0:
        idx = np.arange(0, len(x) - 1, rate)
        x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in (0, 1)], 1)
    if lp: x = sosfilt(butter(2, lp, 'low', fs=SR, output='sos'), x, axis=0)
    x = x * (db(-1) / max(1e-6, np.abs(x).max()))
    a = np.abs(x).max(1)
    ref = int(np.argmax(a > a.max() * 0.1)) if align == 'onset' else int(np.argmax(a))
    if align == 'onset':
        pre = min(ref, int(0.01 * SR)); x = x[ref - pre:]; ref = pre
    if dur:
        x = x[:int((dur + ref / SR) * SR)].copy(); f = min(len(x), int(0.08 * SR)); x[-f:] *= np.linspace(1, 0, f)[:, None]
    x = x * db(gain) * np.array([1 - max(0, pan), 1 + min(0, pan)])
    place(bus, x, t - ref / SR)
    CLIPS.append((t - ref / SR, track, name, x))

# --- voices from the export (already placed by the film)
voice = np.zeros((N, 2), np.float32)
v = load(VIDEO)[:N]; voice[:len(v)] = v
spans = [(c['atMs'] / 1000, c['endMs'] / 1000) for c in M.get('voice', [])]
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
VOICE_CLIPS = []
for c in M.get('voice', []):
    f = os.path.join(ROOT, 'public', c['src'].lstrip('/')); d = (c['endMs'] - c['atMs']) / 1000
    x = load(f, c.get('fromSec', 0) or None, d)   # honour a cue's start offset (e.g. the quick stores' lines)
    if not len(x): continue
    fi, fo = int(0.15 * SR), int(0.25 * SR)
    x[:fi] *= np.linspace(0, 1, min(fi, len(x)))[:, None]; x[-fo:] *= np.linspace(1, 0, min(fo, len(x)))[:, None]
    base = os.path.basename(f)[:-4]
    track = 'Narrator' if base.startswith('n-') else 'Shopper' if base.startswith('shopper') else 'Clerk'
    VOICE_CLIPS.append((c['atMs'] / 1000, track, base, x * db(2)))

# --- SFX from the picture's own events
bus = np.zeros((N, 2), np.float32)
rnd = random.Random(7)
ev = sorted(M.get('sfx', []), key=lambda e: e['at'])
T = lambda e: e['at'] / 1000
CLIMAX_BEATS = [T(e) for e in ev if e['id'] == 'climax-beat']
# v5 palette: soft, warm, low; bright sounds get a low-pass. Gains are after peak-normalising.
MAP = {   # event -> (sound, gain dB, kwargs)
    'click': ('v5_click', -20, {'lp': 3000}), 'page': ('v5_swish', -24, {'lp': 3200}), 'panel': ('v5_swish', -22, {'lp': 3200}),
    'send': ('v5_pop', -16, {}), 'reply': ('v5_pop', -18, {'rate': 0.9}),
    'pan': ('v5_whoosh', -14, {'align': 'peak'}),
    'pullback': ('v5_whoosh', -11, {'align': 'peak', 'rate': 0.85}), 'recap': ('v5_whoosh', -18, {}),
    'switch-in': ('v5_pop', -22, {}), 'toggle': ('v5_toggle', -14, {'lp': 3200}),
    'burst': ('v5_hit', -4, {}), 'logo-in': ('v5_whoosh', -16, {}), 'appear': ('v5_pop', -20, {}),
    'strike': ('el10/strike-marker2', -19, {'align': 'peak', 'lp': 5200}),   # v10: a soft felt marker (was strident)
    'pose-row': ('v5_swish', -20, {'lp': 3200}), 'pose-choice': ('v5_pop', -21, {}), 'pose-doubt': ('v5_swish', -20, {'lp': 3200}),
    'pose-close': ('v5_chime', -18, {}), 'pose-extra': ('v5_swish', -21, {'lp': 3200}), 'pose-bundle': ('v5_pop', -21, {}),
    'cart': ('el8/add-cart', -14, {'lp': 7000}), 'boost': ('v5_whoosh', -15, {}),
    'store-switch': ('v5_swish', -19, {'align': 'peak', 'lp': 3200}), 'dive': ('v5_whoosh', -11, {'align': 'peak'}),
    'ea-logo': ('v5_whoosh', -18, {}), 'ea-action': ('v5_whoosh', -14, {}), 'ea-write': ('handwriting', -17, {'lp': 3000}),
    'ea-stamp': ('v5_stamp', -15, {'lp': 3000}), 'ea-tick': ('v5_pop', -16, {}), 'ea-hero': ('v5_chime', -17, {}),
    'call-start': ('v5_toggle', -17, {'lp': 3000}),
    'recap-bubble': ('v5_pop', -20, {}), 'chapter': ('el8/label-in1', -19, {'lp': 6000}), 'chapter-tick': ('el8/label-tick', -18, {'lp': 5500}),
    'doubt-poof': ('el8/bubble-poof2', -14, {'lp': 7000}), 'flip-pop': ('el9/flip-hit', -9, {'lp': 9000}),
    'sync-flow': ('el8/sync-flow1', -17, {'lp': 6000}), 'sync-done': ('el8/sync-done2', -12, {}), 'install': ('v5_pop', -17, {}),
    'clerk-in': ('el9/install-morph', -12, {'lp': 9000}), 'install-fly': ('v5_whoosh', -17, {'lp': 6000}), 'carousel-tick': ('el9/carousel-tick', -16, {'lp': 8000}),
    'xsell-land': ('el9/carousel-tick1', -20, {'align': 'peak', 'lp': 8000}), 'reel-in': ('el13b/reel-rush1', -19, {'lp': 9000}),   # v13: the tunnel's rush 'reel-switch': ('v5_swish', -21, {'lp': 3200}),
    'reel-out': ('v5_whoosh', -20, {}),
    'rewind': ('el8/vhs-rewind', -10, {'lp': 9000}), 'rewind-land': ('v5_whoosh', -18, {}),
    # v10
    # 'lost-bell' removed (v10 review: the chime read as weird)
    'install-grab': ('el10/grab1', -17, {'lp': 8000}), 'install-drag': ('el10/carry', -21, {'lp': 7000}), 'install-release': ('v5_pop', -23, {}),
    'reel-push': ('v5_whoosh', -18, {'lp': 7000}), 'reel-whip': ('el10/whip', -21, {'lp': 7000}), 'reel-land': ('el10/reel-land', -17, {'lp': 7000}),
    'ea-morph': ('el10/ui-tick', -20, {'lp': 8000}),
    # v11
    'xsell-scan': ('v5_swish', -22, {'lp': 4200, 'rate': 0.8}), 'xsell-stop': ('el10/ui-tick', -21, {'lp': 7000}),
    'xsell-morph': ('v5_whoosh', -20, {'lp': 6000}), 'ui-tick': ('el10/ui-tick', -21, {'lp': 7000}),
    'order-in': ('el10/ui-tick', -26, {'lp': 7500}), 'visitor-left': ('el10/ui-tick', -30, {'lp': 3500, 'rate': 0.8}),
    # v12c: the claims' week (one sound per day) and walking into the store
    'week-lost': ('el12/week-lost', -21, {'lp': 4200}), 'store-enter': ('el12/store-enter1', -16, {'lp': 8000}),
    # v13: the human reply's clock, the skeleton burst's ticks, each store landing, the handwritten scarcity
    'clock-ff': ('el13/clock-ff1', -17, {'lp': 9000}), 'reel-tick': ('el13/reel-tick1', -27, {'lp': 8000}),
    'reel-store': ('el12/store-enter2', -23, {'lp': 7500}), 'hand-write': ('el13/hand-write2', -18, {'lp': 6000}),
    'ea-close': ('v5_whoosh', -24, {'lp': 5000}), 'ea-final': ('v5_chime', -22, {}),
    'reel-slam': ('el13b/reel-slam', -18, {'align': 'peak', 'lp': 10000}),   # v13: every store lands on a hit
    # v14: the whoosh into each cut, the strobe's ticks, the violent landing on "Your store"
    'reel-pre': ('el14/pre-cut-whoosh1', -22, {'lp': 9000}), 'strobe-tick': ('el14/strobe-tick1', -27, {'lp': 9000}),
    'yourstore-hit': ('el14/yourstore-hit', -11, {'align': 'peak'}),
}
BARE = os.environ.get('SEA_BASE')   # audition base: everything except the LOST/SOLD stamp sounds
for e in ev:
    t = T(e); k = e['id']
    if BARE and k in ('lost-close', 'sold', 'climax-beat', 'sold-beat', 'lost-sea', 'sold-sea'): continue
    if k == 'lost-wind':   # a low desolate wind under the empty cart, faded in and out
        w = sfx('el10/wind'); need = max(1.0, e.get('ms', 6000) / 1000); w = w[:int(need * SR)].copy()
        fi = int(0.9 * SR); fo = int(1.4 * SR); w[:fi] *= np.linspace(0, 1, min(fi, len(w)))[:, None]; w[-fo:] *= np.linspace(1, 0, min(fo, len(w)))[:, None]
        w = sosfilt(butter(2, 2500, 'low', fs=SR, output='sos'), w, axis=0) * (db(-26) / max(1e-6, np.abs(w).max()))
        place(bus, w, t); CLIPS.append((t, 'Whooshes', 'lost-wind', w)); continue
    if k == 'clerk-in':   # v10: the dropped clerk lands (a soft thud) as its card forms
        cue(bus, t, 'el10/land', -15, lp=6000, track='Whooshes')
    if k in ('typing', 'tapping'):   # the keys (or a phone's taps) run exactly as long as the text types
        need = max(0.4, e.get('ms', 1000) / 1000); keys = sfx('el10/tap' if k == 'tapping' else 'el9/typing'); x = keys
        while len(x) < need * SR: x = np.concatenate([x, keys])
        k_ = x[:int(need * SR)].copy(); f = int(0.06 * SR); k_[-f:] *= np.linspace(1, 0, f)[:, None]; k_[:f] *= np.linspace(0, 1, f)[:, None]
        k_ = sosfilt(butter(2, 6000, 'low', fs=SR, output='sos'), k_, axis=0) * (db(-17) / max(1e-6, np.abs(k_).max()))
        place(bus, k_, t); CLIPS.append((t, 'UI', 'typing', k_)); continue
    if k == 'week-sold':   # v12c: one warm glass note per day, each a step higher (the week climbs)
        cue(bus, t, 'el12/week-sold2', -19, rate=1 + 0.045 * e.get('index', 0), lp=9000, track='UI')
        continue
    if k == 'orb-absorb':   # one charge-up for the whole stream of orbs
        if e.get('index', 0) == 0: cue(bus, t - 0.15, 'el9/orb-absorb', -15, lp=9000, track='Whooshes')
        continue
    if k == 'lost-close':
        stamp_cue(bus, t, stamps.lost_hit(LOST_SFX), -10, track='Stamps & hits', label=k); continue   # v9: was the loudest sound in the film
    if k in ('sold', 'recap-sold'):
        stamp_cue(bus, t, stamps.sold_hit(SOLD_SFX), -6 if k == 'sold' else -11, track='Stamps & hits', label=k); continue
    if k in ('climax-beat', 'sold-beat'): continue
    if k in ('lost-sea', 'sold-sea'):   # long LOST notes thin into a grave chord; coins into a sparkle
        pan = (e.get('x', 0.5) - 0.5) * 1.3
        last = globals().setdefault('sea_last', {})
        if t - last.get(k, -1) < (0.34 if k == 'lost-sea' else 0.16): continue
        last[k] = t
        if k == 'lost-sea':
            g = -22 + rnd.uniform(-5, 0) - (9 if CLIMAX != 'sink' and CLIMAX_BEATS and CLIMAX_BEATS[0] - 0.3 <= t < CLIMAX_BEATS[-1] + 2 else 0)
            stamp_cue(bus, t, stamps.lost_hit(LOST_SFX, sea=True), g, pan, label=k)
        else:
            stamp_cue(bus, t, stamps.sold_hit(SOLD_SFX), -18 + rnd.uniform(-5, 0), pan, label=k)
        continue
    # v23: the sales-bar climaxes. ✕ chips clip the rim (and, in the pain, settle on the floor), ✓ marks land in the bar
    if k in ('mark-hit', 'mark-miss', 'mark-floor'):
        burst_t = next((T(x) for x in ev if x['id'] == 'burst'), None)
        pain = burst_t is None or t < burst_t
        last = globals().setdefault('mark_last', {})
        if t - last.get(k, -1) < (0.06 if k == 'mark-hit' and not pain else 0.09): continue
        last[k] = t; pan = rnd.uniform(-0.35, 0.35)
        if k == 'mark-miss': cue(bus, t, 'el15/chip-miss1', -27 + rnd.uniform(-3, 0), lp=9000, pan=pan, track='UI')
        elif k == 'mark-floor': cue(bus, t, 'el15/chip-floor1', -29 + rnd.uniform(-3, 0), lp=7000, pan=pan, track='UI')
        elif pain: cue(bus, t, 'el15/pain-hit', -21, lp=6000, pan=pan, track='UI')
        else: cue(bus, t, 'el15/sold-drop1', -25 + rnd.uniform(-2, 0), rate=min(1.22, 1 + 0.006 * e.get('index', 0)), lp=10000, pan=pan, track='UI')
        continue
    if k == 'bar-exit':
        cue(bus, t, 'el15/bar-rise1', -17, align='peak', lp=9000, track='Whooshes'); continue
    if k == 'bar-widen':
        cue(bus, t, 'el15/bar-widen1', -15, lp=9000, track='Whooshes'); continue
    if k in MAP:
        name, g, kw = MAP[k]
        track = 'UI' if k in ('click', 'send', 'reply', 'panel', 'page', 'toggle', 'cart', 'appear', 'pose-choice', 'pose-bundle', 'ea-tick', 'switch-in') \
            else 'Stamps & hits' if k in ('lost-close', 'sold', 'burst', 'ea-stamp', 'strike') else 'Whooshes'
        cue(bus, t, name, g, track=track, **kw)
burst = next((T(e) for e in ev if e['id'] == 'burst'), None)
if burst:
    cue(bus, burst - 0.02, 'riser', -16, align='peak', lp=4000, track='Whooshes')
    cue(bus, burst, 'v5_whoosh', -13, track='Whooshes')

if CLIMAX not in ('sink', 'none') and not CLIMAX.startswith('bed:') and CLIMAX_BEATS and not BARE:   # none: the music dips, no hits (audition bed)
    t0, hits = stamps.climax_deep(CLIMAX_BEATS) if CLIMAX == 'deep' else stamps.climax_riser(CLIMAX_BEATS) if CLIMAX == 'riser' else stamps.climax(CLIMAX, CLIMAX_BEATS)
    stamp_cue(bus, t0, hits, -5 if CLIMAX == 'deep' else -7 if CLIMAX == 'riser' else -4, track='Stamps & hits', label='climax-riser' if CLIMAX in ('riser', 'deep') else 'climax-hits')
bus = sosfilt(butter(1, 7000, 'low', fs=SR, output='sos'), bus, axis=0).astype(np.float32)

# --- music
def fit_to_end(x, need):
    """The cue's own ending must land on the film's end: cut whatever follows
    its last decay (generated cues can trail silence and a stray drone), then
    lengthen it by whole bars from inside its groove, spliced where it matches."""
    m = x.mean(1); w = SR // 4
    lev = np.array([20 * np.log10(np.sqrt(np.mean(m[i:i + w] ** 2)) + 1e-9) for i in range(0, len(m) - w, w)])
    loud = lev > lev.max() - 30
    run, end = 0, len(lev)
    for i in range(int(20 * 4), len(lev)):       # first second-long hole after 20 s = the cue's real end
        run = run + 1 if not loud[i] else 0
        if run >= 4: end = i - 3; break
    x = x[:end * w].copy(); m = m[:len(x)]
    extra = need - len(x) / SR
    if extra <= 0.5: return x
    hop = 480; fr = np.abs(m[:len(m) // hop * hop]).reshape(-1, hop).mean(1); on = np.maximum(0, np.diff(fr))
    seg = on[2000:min(len(on) - 1000, 8000)]; seg = seg - seg.mean()
    ac = np.correlate(seg, seg, 'full')[len(seg) - 1:]; lag = np.arange(len(ac)) / 100
    bar = lag[np.argmax(ac * ((lag > 1.9) & (lag < 2.7)))]
    bars = max(1, int(round(extra / bar))); L = bars * bar
    body_end = len(x) / SR - 10                    # splice before the ending phrase
    best = None
    for T in np.arange(body_end - 6, body_end, 0.05):
        if T - L < 4: continue
        for l in np.arange(L - 0.05, L + 0.05, 0.001):
            i0, j0, n4 = int(T * SR), int((T - l) * SR), int(0.4 * SR)
            p_, q_ = m[i0:i0 + n4], m[j0:j0 + n4]
            c = np.dot(p_, q_) / (np.sqrt(np.dot(p_, p_) * np.dot(q_, q_)) + 1e-9)
            if best is None or c > best[0]: best = (c, T, l)
    if best is None: return x
    c, T, l = best; S, LP, XF = int(T * SR), int(l * SR), int(0.03 * SR); ramp = np.linspace(0, 1, XF)[:, None]
    tail = x[S - LP:].copy(); tail[:XF] = x[S:S + XF] * (1 - ramp) + tail[:XF] * ramp
    y = np.concatenate([x[:S], tail])
    print(f'music: cue ends {end * w / SR:.1f}s, +{bars} bars ({l:.2f}s at {T:.1f}s, corr {c:.2f}) -> {len(y) / SR:.1f}s for {need:.1f}s')
    return y
music = np.zeros((N, 2), np.float32)
# two cues: the pain cue eases out into the burst, the pitch cue starts on it
pain_path, pitch_path = arg('--music-pain'), arg('--music-pitch')
COMPOSED = '--composed' in sys.argv   # v9 score: cues written to the picture play as written (no lift, no fitting)
if pain_path and burst and COMPOSED:
    pm = load(os.path.join(HERE, pain_path)); b = int(burst * SR); n = min(len(pm), b)
    seg = pm[:n].copy(); f = int(0.03 * SR)
    if not os.environ.get('SCORE_SPLIT'): seg[n - f:n] *= np.linspace(1, 0, f)[:, None]   # a single score split at the burst plays straight through
    # shape the arc: hushed under "So they leave. Quietly.", then a swell into the switch's hit
    lost2 = ([T(e) for e in ev if e['id'] == 'lost-close'] or [0, 0])[-1]; sw = next((v['atMs'] / 1000 for v in M['voice'] if 't-switch' in v.get('src', '')), burst - 9)
    ts = np.arange(n) / SR
    shape = np.interp(ts, [0, lost2 + 0.8, lost2 + 1.8, sw - 0.5, sw + 0.5, burst - 0.1], [0, 0, -3.5, -3.5, 0, 2.5])
    music[:n] += seg * db(shape + 3.0)[:, None].astype(np.float32)   # the pain score is felt from the first second
    pain_path = None
if pain_path and burst:
    pm = load(os.path.join(HERE, pain_path)); b = int(burst * SR); n = min(len(pm), b)
    # the generated cue opens very quietly: ride its level up (at most +12 dB,
    # slowly) so the music is there from the first frame, not from ~20 s
    w = SR // 2; lev = np.array([20 * np.log10(np.sqrt(np.mean(pm[i:i + w] ** 2)) + 1e-9) for i in range(0, len(pm), w)])
    lev = np.convolve(lev, np.ones(5) / 5, 'same'); lift = np.clip(-21.0 - lev, 0, 15)   # audible from the first second; the sidechain keeps it under the VO
    pm = pm * db(np.interp(np.arange(len(pm)) / SR, np.arange(len(lift)) * 0.5 + 0.25, lift))[:, None].astype(np.float32)
    climax = next((T(e) for e in ev if e['id'] == 'climax-beat' and e.get('index') == 0), None)
    if climax and os.environ.get('CLIMAX_MUSIC', 'keep') == 'cut':
        n = min(n, int((climax + 0.5) * SR))   # silence under "Unattended visits cost you sales..."
    else: climax = None
    seg = pm[:n].copy(); f = min(n, int((0.6 if climax else 1.4) * SR)); seg[n - f:n] *= np.linspace(1, 0, f)[:, None] ** 1.5
    music[:n] += seg
if pitch_path and burst and COMPOSED:
    qm = load(os.path.join(HERE, pitch_path)); a = np.abs(qm).max(1)
    w = int(0.01 * SR); lev = np.array([a[i:i + w].max() for i in range(0, min(len(a), 3 * SR) - w, w)])
    first = 0 if os.environ.get('SCORE_SPLIT') else max(0, int(np.argmax(lev > lev.max() * 0.4)) * w - int(0.01 * SR))   # the downbeat hit lands on the burst frame
    q = qm[first:].copy()
    rel = lambda k: next((T(e) for e in ev if e['id'] == k), None)
    rw, ins, sold_t, reel_t = rel('rewind'), rel('install'), rel('sold'), rel('reel-in')
    if rw and ins and not (0 < ins - rw < 10): ins = None   # v22: only the install right after the rewind (the sync scene's 'install' is not it)
    sync_t = next((v['atMs'] / 1000 for v in M['voice'] if 't-sync' in v.get('src', '')), None)
    if rw and ins and ins > rw:   # "Let's rewind": the score itself tape-stops, then comes back in on the install
        a0, stop = int((rw - burst) * SR), int(0.75 * SR)
        rate = np.cos(np.linspace(0, np.pi / 2, stop)) ** 1.6; pos = a0 + np.cumsum(rate)
        slow = np.stack([np.interp(pos, np.arange(len(q)), q[:, c]) for c in (0, 1)], 1) * np.linspace(1, 0, stop)[:, None] ** 0.6
        b0 = int((ins - burst - 0.12) * SR); q[a0:a0 + stop] = slow; q[a0 + stop:b0] = 0
        f = int(0.12 * SR); q[b0:b0 + f] *= np.linspace(0, 1, f)[:, None]
    # the arc: the groove sits back under the moments, lifts for the sold sea
    tq = np.arange(len(q)) / SR + burst
    pts = [(0, 0)]
    if ins and sold_t: pts += [(ins + 0.5, 0), (ins + 2.0, -2.0), (sold_t - 0.6, -2.0), (sold_t, 2.5)]
    if sync_t: pts += [(sync_t - 0.4, 2.5), (sync_t + 0.6, 0.5)]
    if reel_t: pts += [(reel_t, 0.0)]
    xs, ys = zip(*sorted(pts)); q *= db(np.interp(tq, xs, ys))[:, None].astype(np.float32)
    place(music, q, burst)
    print('composed pitch cue: downbeat at', round(first / SR, 3), 's in its file; tape-stop at', rw)
    pitch_path = None
if pitch_path and burst:
    qm = load(os.path.join(HERE, pitch_path)); a = np.abs(qm).max(1)
    w = int(0.05 * SR); lev = np.array([a[i:i + w].max() for i in range(0, len(a) - w, w)])
    first = int(np.argmax(lev > lev[:int(4 / 0.05)].max() * 0.5)) * w   # the first beat of the drop
    qm = fit_to_end(qm[first:], DUR - burst)
    place(music, qm, burst)
    print('pitch cue first beat at', round(first / SR, 2), 's in its file')
mpath = arg('--music')
if mpath:
    m = load(os.path.join(HERE, mpath)); onset = float(arg('--music-switch', '0'))
    place(music, m, (burst or 0) - onset)
    nz = np.flatnonzero(np.abs(music).max(1) > 1e-4)
    if len(nz) and nz[0] > 0:   # the fitted cue starts after a gap: ease it in
        f = min(len(music) - nz[0], int(1.2 * SR)); music[nz[0]:nz[0] + f] *= np.linspace(0, 1, f)[:, None]
    # pain half: the same groove behind a wall (low-passed, quieter) until the burst
    if burst:
        b = int(burst * SR); pain = sosfilt(butter(2, 2600, 'low', fs=SR, output='sos'), music[:b], axis=0)   # behind a wall, but still audible on laptops
        music[:b] = pain * db(-2)
if CLIMAX_BEATS and not BARE and not COMPOSED and os.environ.get('CLIMAX_MUSIC', 'keep') != 'cut':   # the composed score writes its own climax
    music = stamps.music_sink(music, CLIMAX_BEATS) if CLIMAX == 'sink' else stamps.music_dip(music, CLIMAX_BEATS)
tt = np.arange(N) / SR
# Sidechain duck from the voice stem itself (narrator, clerk, shopper AND the store
# recordings): while anyone speaks, the music sits GAP dB under the voice, with a
# fast attack and a slow release; between lines it comes back to its own level.
GAP = float(os.environ.get('DUCK_GAP', '12'))
hop = SR // 100
def env_db(x, smooth_s):
    m = x.mean(1) if x.ndim == 2 else x
    r = np.sqrt(np.convolve(m[:len(m) // hop * hop].reshape(-1, hop).__pow__(2).mean(1), np.ones(max(1, int(smooth_s * 100))) / max(1, int(smooth_s * 100)), 'same'))
    return 20 * np.log10(r + 1e-9)
v_db = env_db(voice * db(2), 0.08); m_db = env_db(music * db(-6), 0.25)
L = min(len(v_db), len(m_db)); v_db, m_db = v_db[:L], m_db[:L]
speaking = v_db > -38
gap_t = np.where(np.arange(L) / 100.0 < (burst or 0), GAP - (5 if COMPOSED else 3), GAP)   # the pain sits closer: the music is felt from the first second
reel_in = next((T(e) for e in ev if e['id'] == 'reel-in'), None); reel_out = next((T(e) for e in ev if e['id'] == 'dive'), None)
if reel_in and reel_out:   # v10: the recorded stores speak a little clearer over the reel groove
    tc = np.arange(L) / 100.0; gap_t = np.where((tc >= reel_in) & (tc < reel_out), GAP + 3, gap_t)
want = np.where(speaking, np.minimum(0.0, (v_db - gap_t) - m_db), 0.0)
want = np.maximum(want, -20.0)
# attack ~60 ms, release ~450 ms (one-pole, run on the 100 Hz control signal)
g = np.zeros(L); cur = 0.0
for i in range(L):
    a = 0.15 if want[i] < cur else 0.022
    cur += (want[i] - cur) * a; g[i] = cur
duck = np.interp(tt, np.arange(L) / 100.0, g)
# v21: the Bizmis drop must be OBVIOUS: a breath before it (the music dips over the last beat),
# the drop a touch louder, and the voice duck kept shallow for its first bars (it used to bury it)
if burst and COMPOSED:
    beat = 60 / 112.3; dip = float(os.environ.get('DROP_DIP', '8')); lift = float(os.environ.get('DROP_LIFT', '3'))
    duck = np.where((tt >= burst) & (tt < burst + 4 * beat), np.maximum(duck, -1.5), duck)
    duck = np.where((tt >= burst + 4 * beat) & (tt < burst + 12 * beat), np.maximum(duck, -7.0), duck)
    duck = duck + np.interp(tt, [0, burst - beat, burst - 0.03, burst, burst + 4 * beat, burst + 8 * beat, DUR], [0, 0, -dip, lift, lift, 0, 0])
fade = np.interp(tt, [0, DUR - (0.35 if COMPOSED else 1.2), DUR], [0, 0, -40])   # the cue resolves on its own; this only cleans the last frame
music *= db(duck + fade)[:, None].astype(np.float32)
if (os.environ.get('CLIMAX_DUCK') or CLIMAX.startswith('bed:')) and CLIMAX_BEATS:   # the score steps back under the climax
    d = float(os.environ.get('CLIMAX_DUCK', '14')); c0, c1 = CLIMAX_BEATS[0] - 0.5, CLIMAX_BEATS[-1] + 2.4
    curve = np.interp(tt, [0, c0 - 0.6, c0, c1, c1 + 1.2, DUR], [0, 0, -d, -d, 0, 0])
    music *= db(curve)[:, None].astype(np.float32)

if CLIMAX.startswith('bed:') and CLIMAX_BEATS and not BARE:
    # v11 climax (P3): a low pulse with a quiet ticking clock under the four
    # pain beats, faded in/out, gained so the window sits at -22 LUFS premaster.
    def _lufs(x):
        r = subprocess.run(['ffmpeg', '-hide_banner', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'loudnorm=print_format=summary', '-f', 'null', '-'],
                           input=x.astype(np.float32).tobytes(), capture_output=True).stderr.decode()
        import re as _re; return float(_re.search(r'Input Integrated:\s+(-?[\d.]+)', r).group(1))
    b0, b1 = CLIMAX_BEATS[0] - 0.45, CLIMAX_BEATS[-1] + 2.6
    b = sfx(CLIMAX[4:]); b = b / max(1e-6, np.abs(b).max()); b = b[:int((b1 - b0) * SR)].copy()
    fi, fo = int(0.35 * SR), int(1.6 * SR); b[:fi] *= np.linspace(0, 1, fi)[:, None]; b[-fo:] *= (np.linspace(1, 0, fo) ** 1.5)[:, None]
    i0 = int(b0 * SR); pre_w = (voice * db(2) + music * db(-6) + bus)[i0:i0 + len(b)]; bg = 0.0
    for _ in range(3): bg += -22.0 - _lufs(pre_w + b[:len(pre_w)] * db(bg))
    stamp_cue(bus, b0, b, bg, track='Stamps & hits', label='climax-bed'); print(f'climax bed {CLIMAX[4:]} {bg:+.1f} dB')

OUT = os.environ.get('MIX_OUT') or os.path.join(HERE, 'v2'); os.makedirs(OUT, exist_ok=True)
def write(path, x, codec='pcm_s24le'):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', codec, path],
                   input=x.astype(np.float32).tobytes(), check=True)
for name, x in (('stem-voice', voice), ('stem-music', music), ('stem-sfx', bus)):
    write(os.path.join(OUT, f'{name}.wav'), x)
pre = voice * db(2) + music * db(-6) + bus
write(os.path.join(OUT, 'premaster.wav'), pre, 'pcm_f32le')

# --- Resolve: every sound as its own frame-aligned clip, plus a manifest
FPS, SPF = 30, SR // 30
TAG = arg('--tag')
if TAG:
    import math
    RES = os.path.expanduser(f'~/Movies/ad-1-resolve/{TAG}'); os.makedirs(RES, exist_ok=True)
    picture = os.path.join(RES, f'ad-1-{TAG}-picture.mov')
    pic_codec = ['-c:v', 'libx264', '-crf', '14', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-g', '30'] if os.environ.get('PICTURE_CODEC') == 'h264' \
        else ['-c:v', 'prores_ks', '-profile:v', '0', '-pix_fmt', 'yuv422p10le']   # h264 for the 4K master (disk)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', VIDEO, '-an', '-vf', f'fps={FPS}', *pic_codec, picture], check=True)
    frames = int(round(DUR * FPS))
    sea = {}
    for st, tr, lb, x in [c for c in CLIPS if c[1] == 'Sea stamps']:
        sea.setdefault(lb, []).append((st, x))
    merged = []
    for lb, parts in sea.items():
        s0 = min(a for a, _ in parts); n = max(int(round((a - s0) * SR)) + len(x) for a, x in parts)
        buf = np.zeros((n, 2), np.float32)
        for a, x in parts:
            i = int(round((a - s0) * SR)); buf[i:i + len(x)] += x
        merged.append((s0, 'Sea stamps', 'sea_' + lb, buf))
    items = [(0.0, 'Music', 'music', music * db(-6))] + VOICE_CLIPS + [c for c in CLIPS if c[1] != 'Sea stamps'] + merged
    rows = []
    for k, (start, track, label, x) in enumerate(sorted(items, key=lambda r: r[0]), 1):
        s0 = int(round(max(0.0, start) * SR)); f0 = s0 // SPF; pad = s0 - f0 * SPF
        y = np.concatenate([np.zeros((pad, 2), np.float32), x.astype(np.float32)])
        n = max(1, min(math.ceil(len(y) / SPF), frames - f0))
        y = np.concatenate([y, np.zeros((max(0, n * SPF - len(y)), 2), np.float32)])[:n * SPF]
        path = os.path.join(RES, f"{k:03d}_{f0:04d}f_{label.replace('/', '-')}.wav"); write(path, y)
        rows.append({'path': path, 'frame': f0, 'frames': n, 'track': track})
    order = ['Narrator', 'Clerk', 'Shopper', 'Music', 'Stamps & hits', 'Sea stamps', 'Whooshes', 'UI']
    json.dump({'timeline': f'ad-1 {TAG}', 'fps': FPS, 'frames': frames, 'picture': picture, 'tracks': order, 'clips': rows},
              open(os.path.join(RES, 'manifest.json'), 'w'), indent=1)
    print('resolve clips', len(rows), '->', RES)
print('events', len(ev), 'voice spans', len(spans), 'dur', DUR, 'peak', 20 * np.log10(np.abs(pre).max()))
