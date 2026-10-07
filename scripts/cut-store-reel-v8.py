"""Cut the v8 store-reel takes (tmp/reel-v8, 4K masters; agents re-voiced in revoiced/)
into vignettes for the film, and copy the ambient carousel takes.

Each segment: (video start, end, speed, audio) where audio is 'same' (the
segment's own sound), None (silent: sped-up typing), or (start, end) to lay
another moment's sound over it (e.g. the clerk's line over the cart toasts
that follow it, when the screen in between shows clutter). Segments join
with short dissolves.

  python3 scripts/cut-store-reel-v8.py [names...]  -> public/promo/stores/reel/v8/

Ambient carousel takes are scaled down (cards play small); heroes stay 4K.
"""
import os, sys, subprocess, glob
SRC = 'tmp/reel-v8'; OUT = 'public/promo/stores/reel/v8'; os.makedirs(OUT, exist_ok=True)
XF = 0.2
CUTS = {
    # shopper asks aloud, the clerk answers over the results (its closing question cut: text and voice end together)
    'electronics': (f'{SRC}/meridian-pocket-phone-desktop-yusuke-voice.mp4', [(30.85, 36.6, 1, 'same'), (46.55, 49.6, 1, (46.55, 48.25))]),
    # typed ask (keys added in the film), the three options, "Opening the navy coat" (its voice laid where its bubble shows), the product page
    'fashion': (f'{SRC}/revoiced/fashion.mp4', [(10.0, 14.4, 1.25, None), (22.9, 28.9, 1, 'same'), (33.3, 34.7, 1, (32.15, 33.55)), (36.8, 39.4, 1, 'same')]),
    # the shopper's line without "and the travel case" (an old cached take), then "Adding it to your cart now" + the cart toast
    # context aware: the shopper asks on the book's page, the clerk answers "Ah, I see you're looking at The Midnight Library..." (opening re-spoken cleanly)
    'books': (f'{SRC}/revoiced/books-ctx.mp4', [(26.85, 30.8, 1, 'same'), (32.75, 42.75, 1, 'same')]),
    'gaming': (f'{SRC}/revoiced/gaming.mp4', [(27.45, 29.2, 1, 'same'), (30.22, 31.3, 1, 'same'), (81.0, 86.9, 1, 'same')]),
}
ONLY = set(sys.argv[1:])
for name, (src, segs) in CUTS.items():
    if ONLY and name not in ONLY: continue
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
for src in ([] if ONLY else sorted(glob.glob(f'{SRC}/*-ambient-*.mp4'))):
    slug = os.path.basename(src).split('-ambient-')[0]
    dst = f'{OUT}/ambient-{slug}.mp4'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-an', '-vf', 'scale=w=1440:h=1080:force_original_aspect_ratio=decrease:force_divisible_by=2', '-c:v', 'libx264', '-crf', '22', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dst], check=True)
    print('ambient', slug)
