"""Render the film's "Let's rewind." moment as a video: the pain section played
backwards like a VHS tape (fast scan that eases into a stop), with analog
artifacts (tracking band, colour bleed, scanlines, noise, fade) and a
"◀◀ REW" OSD. It slows to a stop on the pain's first store frame, the same
window the pitch then installs Bizmis into, and the effect clears as it lands.

  python scripts/render-vhs-rewind.py <export>/frames <fps> public/promo/rewind/pain-rewind.mp4
      [--from 36 --to 2 --seconds 3.6]

Previews render from the preview frames; the 4K master needs it re-rendered
from the 4K export's frames.
"""
import sys, glob, os, subprocess, random, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
frames_dir, src_fps, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
arg = lambda k, d: float(sys.argv[sys.argv.index(k) + 1]) if k in sys.argv else d
T1, T0, DUR, FPS = arg('--from', 36.0), arg('--to', 2.0), arg('--seconds', 3.6), 30
STRENGTH = arg('--strength', 1.0)   # 1 = full VHS; ~0.45 = only slightly retro
MODERN = '--modern' in sys.argv   # v9: a clean reverse scrub (motion smear, faint chroma, soft dip), no OSD/bands/scanlines
files = sorted(glob.glob(os.path.join(frames_dir, 'frame-*.png')))
W, H = Image.open(files[0]).size
rng = np.random.default_rng(3); rnd = random.Random(3)
font = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', int(H * 0.055), index=1)
def ease(u):   # tape speed: spins up, races, then slows to a stop
    return 0.5 - 0.5 * np.cos(np.pi * u) if u < 1 else 1.0
def frame_at(t):
    i = min(len(files) - 1, max(0, int(round(t * src_fps))))
    return np.asarray(Image.open(files[i]).convert('RGB'), np.float32)
yy = np.arange(H)[:, None]
vign = 1 - 0.28 * (((np.arange(W)[None, :] - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / 2
proc = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                         '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
if '--clean' in sys.argv:
    # v24: an unmistakable rewind in the film's clean look (no OSD, bands, grain or
    # scanlines; the ◀◀ glyph, scrubber and frame shrink live in the DOM, frame-stepped).
    # The pain races backwards: spin-up, a fast run, then it decelerates onto the first
    # store frame by --scrub seconds and holds it to the clip's end. Each output frame is a
    # real shutter of the source frames it sweeps past (a trailing smear toward where it
    # came from), with a faint chroma split and a few soft speed streaks only at speed.
    #   /usr/bin/python3 scripts/render-vhs-rewind.py <full-film export>/frames 30 public/promo/rewind/pain-rewind-clean.mp4 --clean
    #     (v24 clip: the 4K master's frames, tmp/ad-1-v23c-4k/frames, downscaled; a 6 fps preview works with --unstamp)
    #     --from 58.4 --to 1.2 --jump 54.2:40.8 --jump-at 0.1 --scrub 1.3 --seconds 2.2 --size 1920x1080
    #     --hi <1080p30 pain export>/frames --hi-until 3.0 --unstamp
    #     --tail <1080p30 pitch export>/frames --tail-anchor 58.3:262 --tail-from 54.0
    #     --land <pitch export>/frames/frame-000322.png --land-affine 1.116,-112,-38 --land-box 216,142,1702,1002
    SCRUB = arg('--scrub', 1.3)
    A, D = 0.14, 0.34                                   # spin-up / slow-down shares of the scrub
    VMAX = 1 / (A / 2 + (1 - A - D) + D / 2)
    def ease_clean(u):   # MUST match promoRewindEase() in public/promo/film-engine.js
        if u <= 0: return 0.0
        if u >= 1: return 1.0
        if u < A: return VMAX * u * u / (2 * A)
        if u < 1 - D: return VMAX * (A / 2 + (u - A))
        r = 1 - u
        return 1 - VMAX * r * r / (2 * D)
    # --jump A:B leaves the tape at A and picks it up again at B at --jump-at of the scrub's
    # progress (e.g. skip the switch scene and its orange flash: 58.4 -> 54.2 | 40.8 -> 1.2)
    JUMP = [float(v) for v in sys.argv[sys.argv.index('--jump') + 1].split(':')] if '--jump' in sys.argv else None
    PJ = arg('--jump-at', 0.1)
    def warp(p):
        if not JUMP: return T1 - (T1 - T0) * p
        if p < PJ: return T1 - (T1 - JUMP[0]) * p / PJ
        return JUMP[1] - (JUMP[1] - T0) * (p - PJ) / (1 - PJ)
    def p_at(c): return ease_clean(c / SCRUB)
    def t_at(c): return warp(p_at(c))
    # sources: the main frames (any fps, upscaled to the --size) and, below --hi-until
    # seconds, sharper --hi frames (the store the tape lands on must be crisp)
    HI = sys.argv[sys.argv.index('--hi') + 1] if '--hi' in sys.argv else None
    hi_files = sorted(glob.glob(os.path.join(HI, 'frame-*.png'))) if HI else []
    HI_FPS, HI_UNTIL = arg('--hi-fps', 30.0), arg('--hi-until', 0.0)
    if '--size' in sys.argv:
        W, H = [int(v) for v in sys.argv[sys.argv.index('--size') + 1].split('x')]
    # --tail DIR --tail-anchor T:FRAME --tail-from T2: 30 fps frames of the scene the rewind
    # starts from (e.g. a fresh pitch export), so its first frame is the live frame exactly
    TAIL = sys.argv[sys.argv.index('--tail') + 1] if '--tail' in sys.argv else None
    tail_files = sorted(glob.glob(os.path.join(TAIL, 'frame-*.png'))) if TAIL else []
    TA_T, TA_F = [float(v) for v in sys.argv[sys.argv.index('--tail-anchor') + 1].split(':')] if TAIL else (0, 0)
    TAIL_FROM = arg('--tail-from', 1e9)
    STAMP = '--unstamp' in sys.argv   # preview frames carry a burnt-in timecode, bottom left: patch it out
    cache = {}
    def load(path, unstamp=False):
        if path not in cache:
            if len(cache) > 90: cache.pop(next(iter(cache)))
            im = Image.open(path).convert('RGB')
            if unstamp:
                w0, h0 = im.size; a = np.asarray(im).copy()
                y0, y1, x1 = int(h0 * 0.958), int(h0 * 0.994), int(w0 * 0.05)
                a[y0:y1, :x1] = a[2 * y0 - y1:y0, :x1]   # the strip just above it
                im = Image.fromarray(a)
            if im.size != (W, H): im = im.resize((W, H), Image.LANCZOS)
            cache[path] = np.asarray(im, np.float32)
        return cache[path]
    def frame_t(t):   # blends neighbours when the source fps is coarse
        if tail_files and t >= TAIL_FROM:
            i = min(len(tail_files) - 1, max(0, int(round(TA_F + (t - TA_T) * 30))))
            return load(tail_files[i])
        if hi_files and t < HI_UNTIL:
            i = min(len(hi_files) - 1, max(0, int(round(t * HI_FPS))))
            return load(hi_files[i])
        x = t * src_fps; i = int(np.floor(x)); f = x - i
        a = load(files[min(len(files) - 1, max(0, i))], STAMP)
        if f < 0.02: return a
        return a * (1 - f) + load(files[min(len(files) - 1, max(0, i + 1))], STAMP) * f
    proc.stdin.close(); proc.wait()
    proc = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                             '-c:v', 'libx264', '-crf', '14', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    # --land FRAME --land-affine s,tx,ty --land-box x0,y0,x1,y1 --land-ms 0.26 (px at the --size)
    LAND = sys.argv[sys.argv.index('--land') + 1] if '--land' in sys.argv else None
    if LAND:
        land_img = np.asarray(Image.open(LAND).convert('RGB').resize((W, H), Image.LANCZOS), np.float32)
        LAND_AFF = [float(v) for v in sys.argv[sys.argv.index('--land-affine') + 1].split(',')]
        LAND_BOX = [int(v) for v in sys.argv[sys.argv.index('--land-box') + 1].split(',')]
        LAND_MS = arg('--land-ms', 0.26)
    srng = random.Random(11)
    streaks = [(srng.uniform(0.08, 0.92), srng.uniform(0.18, 0.42), srng.uniform(0, 1), srng.uniform(0.6, 1.0)) for _ in range(9)]
    xs = np.arange(W)[None, :].astype(np.float32)
    n = int(DUR * FPS)
    for k in range(n + 1):
        c = k / FPS
        t = t_at(c)
        p0 = p_at(c); p1 = p_at(c - 0.6 / FPS) if c > 0 else p0     # what a 216° shutter sweeps (in tape progress)
        span = abs(warp(p1) - t) if not (JUMP and (p0 >= PJ) != (p1 >= PJ)) else abs(p0 - p1) * (JUMP[1] - T0) / (1 - PJ)
        speed = min(1.0, (abs(p_at(c - 0.5 / FPS) - p_at(c + 0.5 / FPS)) * FPS) / (VMAX / SCRUB)) if c < SCRUB else 0.0
        taps = int(min(14, max(1, round(span * 30 / 2.2))))
        if taps <= 1:
            img = frame_t(t).copy()
        else:
            acc = None; wsum = 0.0
            for j in range(taps):
                w = (1 - j / taps) ** 1.6                       # a comet: crisp head, fading trail
                f = frame_t(warp(p0 + (p1 - p0) * j / taps))
                acc = f * w if acc is None else acc + f * w; wsum += w
            img = acc / wsum
        if speed > 0.05:
            d = int(round(2.0 * speed * W / 1920))
            if d: img[:, d:, 0] = img[:, :-d, 0].copy(); img[:, :-d, 2] = img[:, d:, 2].copy()   # no wrap-around at the edges
            for (y, length, phase, a) in streaks:   # soft white speed lines racing right to left
                cx = (1.25 - ((phase + c * 1.9) % 1.0) * 1.5) * W
                L = length * W * (0.4 + 0.6 * speed)
                yy0 = int(y * H); th = max(1, int(round(H / 540)))
                u = np.clip((xs - cx) / L, 0, 1)                 # bright head at cx, tail to the right
                prof = np.where((xs >= cx) & (xs <= cx + L), (1 - u) ** 1.5, 0.0) * (0.22 * a * speed)
                band = img[yy0:yy0 + th]
                img[yy0:yy0 + th] = band + (255 - band) * prof[..., None]
        if LAND and c > SCRUB:
            # the pain's store and the pitch's store share the window but not the grid's
            # scale: inside the window the stopped frame zooms onto the live layout while it
            # cross-dissolves into the live frame, so the overlay's final fade is seamless
            r = min(1.0, (c - SCRUB) / LAND_MS)
            z = min(1.0, r / 0.6); z = z * z * (3 - 2 * z)                      # first the zoom settles...
            w = max(0.0, min(1.0, (r - 0.5) / 0.5)); w = w * w * (3 - 2 * w)    # ...then, aligned, it dissolves
            s_, tx_, ty_ = 1 + (LAND_AFF[0] - 1) * z, LAND_AFF[1] * z, LAND_AFF[2] * z
            zoomed = np.asarray(Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).transform(
                (W, H), Image.AFFINE, (1 / s_, 0, -tx_ / s_, 0, 1 / s_, -ty_ / s_), resample=Image.BICUBIC), np.float32)
            x0, y0, x1, y1 = LAND_BOX
            img[y0:y1, x0:x1] = zoomed[y0:y1, x0:x1]
            img = img * (1 - w) + land_img * w
        pic = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
        proc.stdin.write(pic.tobytes())
    proc.stdin.close(); proc.wait()
    print(f'{out}: {n + 1} frames, {W}x{H}, {DUR}s, clean scrub {T1:.2f}s -> {T0:.2f}s in {SCRUB}s')
    sys.exit(0)
n = int(DUR * FPS)
for k in range(n + 1):
    u = k / n; t = T1 - (T1 - T0) * ease(u)
    I = (1.0 if u < 0.78 else max(0.0, 1 - (u - 0.78) / 0.22)) * STRENGTH   # the analog look clears as it lands
    img = frame_at(t)
    if MODERN:
        # motion smear: the frames the tape races through, blended
        speed = abs(np.sin(np.pi * u)) if u < 1 else 0
        taps = [frame_at(t + d * speed * 0.9) for d in (0.35, 0.7)]
        img = img * 0.72 + taps[0] * 0.2 + taps[1] * 0.08 if speed > 0.05 else img   # a hint of smear, not stacked ghosts
        w = float(0.5 * STRENGTH * min(1.0, speed * 1.4))
        if w > 0.01:
            g = img.mean(2, keepdims=True); img = img * (1 - 0.25 * w) + g * 0.25 * w   # a little faded
            d = int(round(2.5 * w * W / 960))
            if d: img[:, :, 0] = np.roll(img[:, :, 0], d, 1); img[:, :, 2] = np.roll(img[:, :, 2], -d, 1)
            img = img * (1 - 0.06 * w) + 255 * 0.06 * w   # a soft lift toward white
        pic = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
        if w > 0.01: pic = pic.filter(ImageFilter.GaussianBlur(1.2 * w))
        proc.stdin.write(pic.tobytes()); continue
    if I > 0:
        # colour: faded, warm, lifted blacks
        g = img.mean(2, keepdims=True); img = img * (1 - 0.35 * I) + g * 0.35 * I
        img = img * (1 - 0.08 * I) + np.array([18, 10, 0], np.float32) * I + 10 * I
        # line jitter + a rolling tracking band
        shift = (rng.normal(0, 1.2 * I, H)).astype(int)
        band = ((u * 2.6) % 1.0) * H * 1.2 - 0.1 * H; bh = 0.09 * H
        inband = np.abs(np.arange(H) - band) < bh
        shift[inband] += (18 * I * np.sin(np.arange(H)[inband] * 0.35)).astype(int) + int(22 * I)
        img = np.stack([np.roll(img[y], shift[y], axis=0) for y in range(H)])
        img[inband] = img[inband] * 0.85 + 60 * I + rng.normal(0, 25 * I, img[inband].shape)
        # colour bleed: red and blue drift apart
        d = int(round(4 * I * W / 960))
        if d: img[:, :, 0] = np.roll(img[:, :, 0], d, 1); img[:, :, 2] = np.roll(img[:, :, 2], -d, 1)
        img[::2] *= 1 - 0.13 * I                                           # scanlines
        img += rng.normal(0, 7 * I, img.shape)                            # tape noise
        img *= (1 - I) + I * vign[..., None]
    pic = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    if I > 0:
        pic = pic.filter(ImageFilter.GaussianBlur(0.6 * I))
        osd = Image.new('RGBA', pic.size, (0, 0, 0, 0)); d = ImageDraw.Draw(osd); a = int(235 * min(1.0, I / max(STRENGTH, 1e-6)))
        blink = (k // 8) % 2 == 0 or u > 0.7
        if blink:
            for dx, dy, col in ((3, 3, (0, 0, 0, a // 2)), (0, 0, (255, 255, 255, a))):
                d.text((W * 0.06 + dx, H * 0.08 + dy), '◀◀ REW', font=font, fill=col)
        secs = max(0, int(t)); tc = f'0:00:{secs:02d}'
        for dx, dy, col in ((3, 3, (0, 0, 0, a // 2)), (0, 0, (255, 255, 255, a))):
            d.text((W * 0.94 - d.textlength(tc, font=font) + dx, H * 0.86 + dy), tc, font=font, fill=col)
        pic = Image.alpha_composite(pic.convert('RGBA'), osd).convert('RGB')
    proc.stdin.write(pic.tobytes())
proc.stdin.close(); proc.wait()
print(f'{out}: {n + 1} frames, {W}x{H}, {DUR}s, tape {T1:.1f}s -> {T0:.1f}s')
