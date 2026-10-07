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
