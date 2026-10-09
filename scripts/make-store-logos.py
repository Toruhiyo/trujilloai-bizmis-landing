"""Fictional store logos for the landing's personalization avatars: white marks
on transparent, stamped on the shirts by render-landing-avatars.py to show a
merchant's own logo on their agent. Invented names only, no real brands.

  ~/Projects/Bizmis/trujilloai-bizmis-studio/.venv/bin/python scripts/make-store-logos.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent / "assets/store-logos"
SUP = "/System/Library/Fonts/Supplemental"
SYS = "/System/Library/Fonts"
W = (255, 255, 255, 255)
H = 300  # cap height scale


def font(path, size, index=0):
    return ImageFont.truetype(path, size, index=index)


def mark_and_text(name, text, fnt, icon=None, gap=40, tracking=0):
    """An optional drawn icon to the left of a wordmark."""
    img = Image.new("RGBA", (4200, 900), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x = 60
    if icon:
        x = icon(d, x) + gap
    for ch in text:
        d.text((x, 200), ch, font=fnt, fill=W)
        x += d.textlength(ch, font=fnt) + tracking
    img = img.crop(img.getbbox())
    img.save(OUT / f"{name}.png", optimize=True)
    print(name, img.size)


def mountain(d, x):
    d.polygon([(x, 600), (x + 190, 260), (x + 290, 430), (x + 350, 340), (x + 480, 600)], fill=W)
    return x + 480


def star(d, x):
    import math
    cx, cy, r1, r2 = x + 150, 430, 150, 58
    pts = [(cx + (r1 if i % 2 == 0 else r2) * math.sin(i * math.pi / 4), cy - (r1 if i % 2 == 0 else r2) * math.cos(i * math.pi / 4)) for i in range(8)]
    d.polygon(pts, fill=W)
    return x + 300


def bolt(d, x):
    d.polygon([(x + 170, 220), (x, 470), (x + 130, 470), (x + 70, 680), (x + 260, 400), (x + 130, 400), (x + 210, 220)], fill=W)
    return x + 260


def flower(d, x):
    import math
    cx, cy = x + 170, 440
    for i in range(5):
        a = i * 2 * math.pi / 5
        px, py = cx + 95 * math.sin(a), cy - 95 * math.cos(a)
        d.ellipse([px - 80, py - 80, px + 80, py + 80], fill=W)
    d.ellipse([cx - 45, cy - 45, cx + 45, cy + 45], fill=(0, 0, 0, 0))
    return x + 340


def ring(d, x):
    d.ellipse([x, 260, x + 360, 620], outline=W, width=70)
    return x + 360


def leaf(d, x):
    d.chord([x, 240, x + 420, 660], 200, 20, fill=W)
    d.line([(x + 60, 600), (x + 360, 300)], fill=(0, 0, 0, 0), width=26)
    return x + 380


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    mark_and_text("nordkap", "NORDKAP", font(f"{SUP}/Futura.ttc", H, 4), icon=mountain, tracking=24)
    mark_and_text("lumen", "Lumen", font(f"{SUP}/Didot.ttc", H + 40, 2), icon=star)
    mark_and_text("papaya", "papaya", font(f"{SYS}/Avenir Next.ttc", H + 20, 2), icon=leaf)
    mark_and_text("ferro", "FERRO & CO.", font(f"{SUP}/GillSans.ttc", H - 30, 1), icon=bolt, tracking=18)
    mark_and_text("bloom", "bloom", font(f"{SYS}/Avenir Next.ttc", H + 20, 8), icon=flower)
    mark_and_text("atlas", "ATLAS", font(f"{SUP}/Futura.ttc", H, 2), icon=ring, tracking=30)
    mark_and_text("rally", "RALLY", font(f"{SYS}/Avenir Next.ttc", H + 30, 9), tracking=10)
