"""Cut the v7 store-reel takes (tmp/reel-v7, agents re-voiced in revoiced/)
into vignettes for the film, and copy the ambient carousel takes.

Each segment: (video start, end, speed, audio) where audio is 'same' (the
segment's own sound), None (silent: sped-up typing), or (start, end) to lay
another moment's sound over it (e.g. the clerk's line over the cart toasts
that follow it, when the screen in between shows clutter). Segments join
with short dissolves.

  python3 scripts/cut-store-reel-v7.py  -> public/promo/stores/reel/v7/
"""
import os, subprocess, glob
SRC = 'tmp/reel-v7'; OUT = 'public/promo/stores/reel/v7'; os.makedirs(OUT, exist_ok=True)
XF = 0.2
CUTS = {
    'electronics': (f'{SRC}/meridian-pocket-phone-desktop-yusuke-voice.mp4', [(29.3, 34.05, 1, 'same'), (43.95, 52.1, 1, 'same')]),
    'fashion': (f'{SRC}/revoiced/fashion.mp4', [(10.0, 17.0, 1.6, None), (22.9, 26.9, 1, 'same'), (32.9, 34.4, 1, 'same'), (37.4, 39.9, 1, 'same')]),
    'books': (f'{SRC}/revoiced/books.mp4', [(28.1, 31.8, 1, 'same'), (33.4, 39.85, 1, 'same')]),
    'gaming': (f'{SRC}/revoiced/gaming.mp4', [(27.7, 31.25, 1, 'same'), (91.6, 96.0, 1, (82.6, 87.0))]),
}
for name, (src, segs) in CUTS.items():
    f = []; lens = []
    for i, (a, b, sp, au) in enumerate(segs):
        n = (b - a) / sp
        f.append(f'[0:v]trim={a}:{b},setpts=(PTS-STARTPTS)/{sp},fps=30,format=yuv420p[v{i}]')
        if au == 'same': f.append(f'[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo[a{i}]')
        elif au is None: f.append(f'anullsrc=r=48000:cl=stereo,atrim=0:{n:.3f}[a{i}]')
        else:
            c, d = au
            f.append(f'[0:a]atrim={c}:{d},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur={n:.3f},atrim=0:{n:.3f}[a{i}]')
        lens.append(n)
    v, au, t = '[v0]', '[a0]', lens[0]
    for i in range(1, len(segs)):
        f.append(f'{v}[v{i}]xfade=transition=fade:duration={XF}:offset={t - XF:.3f}[x{i}]'); v = f'[x{i}]'
        f.append(f'{au}[a{i}]acrossfade=d={XF}[y{i}]'); au = f'[y{i}]'
        t += lens[i] - XF
    f.append(f'{au}afade=t=in:d=0.06,afade=t=out:st={t - 0.25:.3f}:d=0.25[aout]')
    dst = f'{OUT}/{name}.mp4'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-filter_complex', ';'.join(f), '-map', v, '-map', '[aout]',
                    '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '192k', dst], check=True)
    print(f'{name}: {t:.2f}s')
for src in sorted(glob.glob(f'{SRC}/*-ambient-*.mp4')):
    slug = os.path.basename(src).split('-ambient-')[0]
    dst = f'{OUT}/ambient-{slug}.mp4'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-an', '-c:v', 'libx264', '-crf', '22', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dst], check=True)
    print('ambient', slug)
