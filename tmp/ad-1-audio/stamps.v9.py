"""The film's LOST / SOLD stamps and the climax drone: ElevenLabs-generated
sounds only (sfx/el/*.mp3, prompts in the session notes), processed here:
trimmed, optionally pitched (NAME@-7 = 7 semitones down), the climax sound
re-shaped so it swells on each caption line. Never synthesize tones, never
saturate (operator: synthesized/saturated sounds "sound like farts").
Stereo float32 arrays at 48 kHz."""
import os, random, subprocess, numpy as np
from scipy.signal import butter, sosfilt
SR = 48000; HERE = os.path.dirname(os.path.abspath(__file__)); rnd = random.Random(4)
def filt(x, f, kind, o=2): return sosfilt(butter(o, f, kind, fs=SR, output='sos'), x, axis=0)
def db(g): return 10 ** (np.asarray(g) / 20)
def norm(x): return x / max(1e-6, np.abs(x).max())
def load(name):
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', os.path.join(HERE, 'sfx', 'el', name + '.mp3'), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(r, np.float32).reshape(-1, 2).copy()
def trim(x):
    a = np.abs(x).max(1); i = int(np.argmax(a > a.max() * 0.05)); j = len(a) - int(np.argmax(a[::-1] > a.max() * 0.01))
    return x[max(0, i - int(0.005 * SR)):j]
def smooth(x, lo, hi, att):
    """Less strident at both ends: gentle cuts below lo and above hi, a softer attack."""
    x = filt(filt(x, lo, 'high'), hi, 'low'); n = int(att * SR); x = x.copy(); x[:n] *= np.linspace(0, 1, n)[:, None] ** 0.7
    return norm(x)
_c = {}
def sound(spec):
    if spec not in _c:
        name, _, shift = spec.partition('@')
        x = trim(norm(load(name)))
        x = smooth(x, 70, 3000, 0.015) if name.startswith('lost') else smooth(x, 280, 5500, 0.006) if name.startswith(('sold', 'coin')) else norm(filt(x, 35, 'high'))
        if shift: x = norm(rate(x, 2 ** (float(shift) / 12)))
        _c[spec] = x.astype(np.float32)
    return _c[spec]
def rate(x, r):
    idx = np.arange(0, len(x) - 1, r); return np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in (0, 1)], 1).astype(np.float32)
NOTE = {n: i for i, n in enumerate('C C# D D# E F F# G G# A A# B'.split())}
NOTE.update({'Db': 1, 'Eb': 3, 'Gb': 6, 'Ab': 8, 'Bb': 10})
def midi(name): return 12 * (int(name[-1]) + 1) + NOTE[name[:-1]]
def source_pitch(x):
    """the generated note's own pitch (harmonic product spectrum, just after the attack)"""
    seg = x[int(0.015 * SR):int(0.165 * SR)].mean(1); n = 1 << 15
    X = np.abs(np.fft.rfft(seg * np.hanning(len(seg)), n)); f = np.fft.rfftfreq(n, 1 / SR); hps = X.copy()
    for h in (2, 3):
        d = X[::h]; hps[:len(d)] *= d
    k = (f > 60) & (f < 3000); return 69 + 12 * np.log2(f[np.argmax(np.where(k, hps, 0))] / 440)
def figure(name, notes, gap, fade=0.08, src=None):
    """A sampler, not a synth: ONE generated note (an ElevenLabs file) retuned
    to each note of a short figure (e.g. a coin's rising fourth), every note
    but the last cut as the next one starts."""
    m0 = midi(src[:-2]) + float(src[-2:]) / 100 if isinstance(src, str) and src[-3] in '+-' else (src if src is not None else None)
    src = sound(name); m0 = source_pitch(src) if m0 is None else m0; parts = []
    for i, nm in enumerate(notes):
        x = rate(src, 2 ** ((midi(nm) - m0) / 12))
        if i < len(notes) - 1:
            n = int((gap + fade) * SR); x = x[:n].copy(); f = int(fade * SR); x[-f:] *= np.linspace(1, 0, f)[:, None]
        parts.append(x)
    out = np.zeros((int(gap * SR) * (len(notes) - 1) + len(parts[-1]) + SR // 10, 2), np.float32)
    for i, x in enumerate(parts): j = int(i * gap * SR); out[j:j + len(x)] += x
    return norm(out).astype(np.float32)
def lost(name, sea=False): x = sound(name); return rate(x, rnd.uniform(0.96, 1.03)) if sea else x
def sold(name, sea=False): x = sound(name); return rate(x, rnd.uniform(0.95, 1.07)) if sea else x
CAPTION_PEAK = 0.10   # each caption part fades in over 350 ms: the hit peaks as the words read
def climax(name, beats):
    """ONE generated take with a run of soft impacts (prompted as several slow
    hits): its first four hits are cut apart at the quiet valleys between them
    and each is placed so its loudest point lands as its caption part appears,
    building slightly to the last. Returns (start_s, audio)."""
    from scipy.signal import hilbert, find_peaks
    x = trim(norm(load(name))); x = smooth(x, 45, 4500, 0.002); m = x.mean(1)
    w = int(0.01 * SR); e = filt(np.abs(hilbert(m)), 15, 'low', 2)[::w]
    for pr in (0.12, 0.05, 0.02):   # takes whose hits decay need a finer prominence (only hits within -24 dB count)
        pk, _ = find_peaks(e, distance=30, prominence=e.max() * pr); pk = [k for k in pk if e[k] > e.max() * 0.063][:4]
        if len(pk) >= 4: break
    if len(pk) < 4: raise ValueError(f'{name}: needs 4 hits, found {len(pk)}')
    cuts = [0] + [pk[k - 1] + int(np.argmin(e[pk[k - 1]:pk[k]])) for k in range(1, 4)] + [len(e)]
    t0 = beats[0] - 0.3; n = int((beats[-1] + 2.6 - t0) * SR); out = np.zeros((n, 2), np.float32)
    for k in range(4):
        start = max(cuts[k], pk[k] - 12)          # at most 120 ms of run-up: no stray bump before the hit
        seg = x[start * w:cuts[k + 1] * w].copy(); seg = seg / max(1e-6, np.abs(seg).max())
        f = min(len(seg) // 3, int(0.12 * SR)) if k < 3 else min(len(seg) // 2, int(0.8 * SR)); seg[-f:] *= np.linspace(1, 0, f)[:, None]
        g = min(len(seg) // 4, int(0.03 * SR)); seg[:g] *= np.linspace(0, 1, g)[:, None]
        i0 = int((beats[k] + CAPTION_PEAK - (pk[k] - start) * w / SR - t0) * SR); L = min(len(seg), n - i0)
        out[i0:i0 + L] += seg[:L] * db([-4, -3, -2, 0][k])
    return t0, norm(out).astype(np.float32)
def music_dip(m, beats, g=-7):
    a, b = beats[0] - 0.4, beats[-1] + 2.5; t = np.arange(len(m)) / SR
    return (m * db(np.interp(t, [a - 0.3, a, b, b + 1.0], [0, g, g, 0], left=0, right=0))[:, None]).astype(np.float32)
def music_sink(m, beats):
    """The music itself sinks a step on each caption line (darker, quieter), then recovers."""
    cuts, levels = [None, 1800, 900, 520, 330], [0, -2, -4, -6, -8]
    vers = [m] + [filt(m, c, 'low') for c in cuts[1:]]; t = np.arange(len(m)) / SR
    sel = np.searchsorted(np.array(beats), t, side='right'); sel[t > beats[-1] + 3.0] = 0
    out = np.zeros_like(m)
    for k in range(len(vers)): out += vers[k] * (filt((sel == k).astype(float), 12, 'low', 1) * db(levels[k]))[:, None]
    return out.astype(np.float32)


# The stamps as played in the film: SOLD = a coin (a note, then a fourth up)
# in the pitch cue's key (Eb); LOST = its mirror, low and falling, in the pain
# cue's key (D minor). In the seas the figures move between chord tones so
# overlapping stamps stay consonant.
SOURCE_NOTE = {'sold-g': midi('E5') + 0.07, 'coin-a1': midi('G6') + 0.09}
SOLD_FIGS = {'low': [['Bb4', 'Eb5'], ['Bb4', 'Eb5'], ['Eb5', 'Bb5']], 'high': [['Bb5', 'Eb6'], ['Bb5', 'Eb6'], ['Eb6', 'Bb6']]}
def sold_figure(name, sea=False):
    figs = SOLD_FIGS['high' if name == 'coin-a1' else 'low']
    return figure(name, rnd.choice(figs) if sea else figs[0], 0.075, src=SOURCE_NOTE.get(name))
def lost_figure(name, sea=False):
    return figure(name, rnd.choice([['F3', 'D3'], ['A3', 'F3']]) if sea else ['F3', 'D3'], 0.28)


# v8 (operator picks, 2026-10-07): LOST = one muted low "laser thud" (no
# figure, not a note); SOLD = the coin clink 7 semitones down (Bb3, the pitch
# cue's dominant), softened; in the seas every copy keeps the same pitch
# (detuned copies clashed), only timing and level vary.
def lost_hit(name, sea=False):
    x = _c.get(('hit', name))
    if x is None:
        x = _c[('hit', name)] = smooth(trim(norm(load(name))), 40, 3000, 0.004).astype(np.float32)
    return rate(x, rnd.uniform(0.985, 1.015)) if sea else x
def sold_hit(name, shift=-7, sea=False):
    key = ('sold', name, shift)
    if key not in _c:
        x = trim(norm(load(name))); x = rate(x, 2 ** (shift / 12))
        _c[key] = smooth(norm(x), 220, 3600, 0.006).astype(np.float32)
    return _c[key]
def stretch(x, factor):
    """time-stretch without changing pitch (ffmpeg atempo chain); factor > 1 = longer"""
    t = 1 / factor; chain = []
    while t < 0.5: chain.append('atempo=0.5'); t /= 0.5
    chain.append(f'atempo={t:.5f}')
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', ','.join(chain), '-f', 'f32le', '-'],
                       input=x.astype(np.float32).tobytes(), capture_output=True).stdout
    return np.frombuffer(r, np.float32).reshape(-1, 2).copy()
def climax_riser(beats, pad='climax-ui1', glass='climax-glass'):
    """ONE quiet riser across the four caption lines (operator: 'perfectly timed, less
    dramatic, software premium Apple-like'): a soft pad + a glassy shimmer, each take's
    rise stretched (pitch kept) so it peaks as the last line reads, a small lift as each
    line appears, then the takes' own release. Returns (start_s, audio)."""
    from scipy.signal import hilbert
    t0 = beats[0] - 0.35; land = beats[-1] + CAPTION_PEAK; layers = []
    for name, g, lo, hi in ((pad, 0, 120, 5000), (glass, -7, 900, 7000)):
        x = smooth(trim(norm(load(name))), lo, hi, 0.05)
        e = filt(np.abs(hilbert(x.mean(1))), 6, 'low', 2); pk = int(np.argmax(e))
        rise = stretch(x[:pk], (land - t0) / (pk / SR)); tail = x[pk:].copy()
        f = min(len(tail), int(1.6 * SR)); tail = tail[:f] * np.linspace(1, 0, f)[:, None] ** 1.4
        layers.append(np.concatenate([rise, tail]) * db(g))
    n = max(len(l) for l in layers); y = np.zeros((n, 2), np.float32)
    for l in layers: y[:len(l)] += l
    tt = t0 + np.arange(n) / SR; lift = np.zeros(n)
    for k, b in enumerate(beats):   # a gentle lift as each line appears (bigger on the last)
        lift += (1.6 if k < 3 else 2.4) * np.exp(-np.maximum(0, tt - b - CAPTION_PEAK) / 0.35) * np.clip((tt - b) / 0.1, 0, 1)
    y *= db(lift)[:, None]
    return t0, norm(y).astype(np.float32)
