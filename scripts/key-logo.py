"""Cut an AI-generated logo out of its flat chroma background (magenta, white…)
into a transparent PNG trimmed to the mark, for stamping on avatar shirts.

  ~/Projects/Bizmis/trujilloai-bizmis-studio/.venv/bin/python scripts/key-logo.py in.png out.png [--soft 90]

Pillow only. The background colour is the median of the image's border; each
pixel's alpha comes from its (L1) colour distance to it, on a soft ramp that
keeps anti-aliased edges; the alpha is then pulled in by one pixel so no
background-tinted fringe is left around the mark on the shirt.
"""
import statistics
import sys

from PIL import Image, ImageChops, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
soft = float(sys.argv[sys.argv.index("--soft") + 1]) if "--soft" in sys.argv else 90.0

img = Image.open(src).convert("RGB")
w, h = img.size
px = img.load()
border = [px[x, y] for x in range(0, w, 7) for y in (2, h - 3)] + [px[x, y] for y in range(0, h, 7) for x in (2, w - 3)]
bg = tuple(int(statistics.median(c[i] for c in border)) for i in range(3))

diff = ImageChops.difference(img, Image.new("RGB", img.size, bg))
r, g, b = diff.split()
dist = ImageChops.add(ImageChops.add(r, g, scale=1.0), b, scale=1.0)  # saturates at 255: fine, we only need the low end
lo, hi = soft * 0.4, soft
alpha = dist.point(lambda v: 0 if v <= lo else 255 if v >= hi else int(255 * (v - lo) / (hi - lo)))
alpha = alpha.filter(ImageFilter.MinFilter(3))

out = img.copy()
out.putalpha(alpha)
out = out.crop(alpha.getbbox())
out.save(dst, optimize=True)
print(dst, out.size, "bg", bg)
