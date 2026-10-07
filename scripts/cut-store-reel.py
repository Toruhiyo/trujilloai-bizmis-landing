"""Cut the raw store-reel recordings (public/promo/stores/reel/*.mp4) into
tight vignettes for the film: the shopper's ask, then the agent's answer,
joined with short dissolves. Typing is sped up and muted; spoken parts keep
their own sound.

  python3 scripts/cut-store-reel.py      -> public/promo/stores/reel/cut/<name>.mp4
"""
import os, subprocess
SRC = 'public/promo/stores/reel'; OUT = os.path.join(SRC, 'cut'); os.makedirs(OUT, exist_ok=True)
XF = 0.2   # dissolve between segments, seconds
# name: [(start, end, speed)], speed > 1 = sped up and muted
CUTS = {
    '12-weather-outfitters-raincoat-phone': [(10.6, 13.9, 1.5), (22.4, 24.0, 1), (31.2, 37.6, 1)],
    'meridian-pocket-phone-desktop-voice': [(27.4, 31.0, 1), (46.15, 53.6, 1)],
    'paper-and-pine-books-novel-tablet': [(39.0, 42.2, 1.5), (43.6, 51.4, 1)],
    'pulse-forge-ps5-cart-phone': [(33.0, 35.8, 1.5), (36.4, 42.6, 1), (64.0, 66.6, 1)],
}
for name, segs in CUTS.items():
    src = os.path.join(SRC, name + '.mp4'); f = []; lens = []
    for i, (a, b, sp) in enumerate(segs):
        f.append(f'[0:v]trim={a}:{b},setpts=(PTS-STARTPTS)/{sp},fps=30,format=yuv420p[v{i}]')
        if sp == 1: f.append(f'[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo[a{i}]')
        else: f.append(f'anullsrc=r=48000:cl=stereo,atrim=0:{(b - a) / sp}[a{i}]')
        lens.append((b - a) / sp)
    v, au, t = '[v0]', '[a0]', lens[0]
    for i in range(1, len(segs)):
        f.append(f'{v}[v{i}]xfade=transition=fade:duration={XF}:offset={t - XF:.3f}[x{i}]'); v = f'[x{i}]'
        f.append(f'{au}[a{i}]acrossfade=d={XF}[y{i}]'); au = f'[y{i}]'
        t += lens[i] - XF
    f.append(f'{au}afade=t=in:d=0.08,afade=t=out:st={t - 0.3:.3f}:d=0.3[aout]')
    dst = os.path.join(OUT, name + '.mp4')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-filter_complex', ';'.join(f), '-map', v, '-map', '[aout]',
                    '-c:v', 'libx264', '-crf', '17', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                    '-c:a', 'aac', '-b:a', '192k', dst], check=True)
    print(f'{name}: {t:.2f}s')
