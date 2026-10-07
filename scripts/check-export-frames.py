"""Find broken frames in an ad-1 export: any frame with transparency (a layer
not composited: it flashes black or white in the video) or a near-duplicate
blank. Prints frame numbers to re-render with --frames.

  python scripts/check-export-frames.py <export>/frames
"""
import sys, glob, os
from PIL import Image
bad = []
for path in sorted(glob.glob(os.path.join(sys.argv[1], 'frame-*.png'))):
    im = Image.open(path)
    if im.mode in ('RGBA', 'LA') or 'transparency' in im.info:
        lo, hi = im.getchannel('A').getextrema() if im.mode in ('RGBA', 'LA') else (0, 255)
        if lo < 255: bad.append(int(os.path.basename(path)[6:12]))
print('frames with transparency:', bad if bad else 'none')
