"""Turn a multicolour store logo into a one-colour one (e.g. white, for a vivid shirt).

Keeps only the logo's coloured fills (saturated, not too dark): outlines, sticker
borders and dark details (seeds, shadows) drop out and become gaps, so the mark
keeps its shapes in a single ink.

  python scripts/mono-logo.py scripts/assets/store-logos/pixora.png pixora-white.png [#ffffff]
"""
import colorsys
import sys

from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
ink = sys.argv[3] if len(sys.argv) > 3 else "#ffffff"
im = Image.open(src).convert("RGBA")
keep = Image.new("L", im.size, 0)
px, kp = im.load(), keep.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = px[x, y]
        _, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        kp[x, y] = a if (s > 0.38 and v > 0.42) else 0
keep = keep.filter(ImageFilter.MedianFilter(3))
mono = Image.new("RGBA", im.size, ink)
mono.putalpha(keep)
mono = mono.crop(keep.point(lambda v: 255 if v > 96 else 0).getbbox())
mono.save(out)
