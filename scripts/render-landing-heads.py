"""Render the preset avatars' head images: ONLY the face with the hair (no
neck, no shoulders, no shirt), smiling, with the studio's Blender renderer.

  ~/Projects/Bizmis/trujilloai-bizmis-studio/.venv/bin/python \
      scripts/render-landing-heads.py [--raw DIR] [--out DIR] [avatar ...]

Default: the landing's six (the session replays' agents, the widget's head
circles, the funnel's agent badges) into public/landing/heads/<id>.png.
The same images serve the app's presets on
cdn.bizmis.ai/common/avatars/images/<id>.png: pass `--out` with that folder
(trujilloai-bizmis-project/terraform/assets/common/avatars/images) and all
13 names (or `all`).

The renderer's "head" framing shows only the HEAD_* meshes (hair, hat,
glasses, face) and points a closer camera at the head, so the face is sharp.
It renders at 2048 and is cut to a 512x512 transparent square: the face
centred left to right, hair top to chin centred top to bottom, sized so both
fit with a small margin, and grown if anything would fall outside the
inscribed circle (most consumers crop the image round), so buns, headphones
and caps are never cut.

Raw renders are cached in --raw (default tmp/avatar-renders/heads-only), so a
crashed run (Metal can crash Blender) resumes where it stopped: run it again.
"""
import argparse
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
STUDIO = Path.home() / "Projects/Bizmis/trujilloai-bizmis-studio"
sys.path.insert(0, str(STUDIO))
from marketing.render import render_avatar  # noqa: E402

PRIMARY = "#F9A353"
SIZE = 512
RES = 2048
# the replays' agents (replaySessions.ts), the widget head circles' presets
# and the funnel's agent badges (AgentPin.tsx)
LANDING = ("amber", "will", "yue", "yusuke", "luca", "mia")
ALL = ("adrian", "amber", "echo", "kiran", "luca", "marc", "matt", "mia",
       "teo", "victor", "will", "yue", "yusuke")
# caps, headphones and beanies wear the primary on Hat_Color (only that
# material: the others are the cap's peak, the cushions, the band)
HATS = ("echo", "teo", "victor")
# margins: hair top and chin at MARGIN_Y of the side from the edges, the
# widest point at most WIDTH of the side
MARGIN_Y = 0.035
WIDTH = 0.90
# the face's centre column in the raw render (fraction of its width)
FACE_X = 0.503
# a see-through patch inside the silhouette this small (px at 2048) is a
# mesh pinhole, not a gap
MAX_PINHOLE = 400


def fill_pinholes(img: Image.Image) -> int:
    """Close the see-through specks inside the silhouette (mia's hair has a
    pinhole at the crown): any not-quite-opaque pixel the outside can't
    reach gets the surrounding colour, fully opaque. Returns the count."""
    alpha = img.getchannel("A")
    mask = alpha.point(lambda v: 0 if v < 250 else 255)
    ImageDraw.floodfill(mask, (0, 0), 128)
    # enclosed see-through regions: 255. Only specks are holes; a big one is
    # a real gap (inside echo's headphone band, between a strand and a cheek)
    regions = mask.point(lambda v: 255 if v == 0 else 0)
    filled_px = 0
    while (box := regions.point(lambda v: 255 if v == 255 else 0).getbbox()):
        row = regions.crop((box[0], box[1], box[2], box[1] + 1))
        x = box[0] + next(i for i in range(row.width) if row.getpixel((i, 0)) == 255)
        ImageDraw.floodfill(regions, (x, box[1]), 100)
        size = regions.histogram()[100]
        speck = size <= MAX_PINHOLE
        filled_px += size if speck else 0
        regions = regions.point(lambda v, s=speck: (50 if s else 20) if v == 100 else v)
    if not filled_px:
        return 0
    holes = regions.point(lambda v: 255 if v == 50 else 0)
    rgb = img.convert("RGB").filter(ImageFilter.MedianFilter(9))
    filled = Image.merge("RGBA", (*rgb.split(), Image.new("L", img.size, 255)))
    img.paste(filled, (0, 0), holes)
    return filled_px


def square(src: Path, dst: Path) -> None:
    img = Image.open(src).convert("RGBA")
    holes = fill_pinholes(img)
    alpha = img.getchannel("A")
    x0, y0, x1, y1 = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
    w, h = x1 - x0, y1 - y0
    # the face's own centre line, not the silhouette's: caps' peaks, buns
    # and swept hair stick out to one side. Every preset shares the head
    # mesh, pose and camera, so the face sits on the same column in all.
    cx, cy = FACE_X * img.width, (y0 + y1) / 2
    side = max(h / (1 - 2 * MARGIN_Y), 2 * max(cx - x0, x1 - cx) / WIDTH)
    # the inscribed circle must hold every opaque pixel (1% breathing room)
    small = alpha.resize((alpha.width // 8, alpha.height // 8), Image.BILINEAR)
    px = small.load()
    far = 0.0
    for y in range(small.height):
        for x in range(small.width):
            if px[x, y] > 128:
                far = max(far, math.hypot(x * 8 + 4 - cx, y * 8 + 4 - cy))
    side = max(side, far * 2 * 1.01)
    side = round(side)
    left, top = round(cx - side / 2), round(cy - side / 2)
    out = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    out.paste(img.crop((left, top, left + side, top + side)), (0, 0))
    head = out.resize((SIZE, SIZE), Image.LANCZOS)
    head.save(dst, optimize=True)
    # the landing shows the WebP (a seventh of the PNG's weight); the PNG stays for the CDN and the widget
    head.save(dst.with_suffix(".webp"), quality=90, method=6)
    print(f"{dst.name}: head {w}x{h}px, square {side} "
          f"(width {w / side:.0%}, height {h / side:.0%}, pinholes {holes}px)")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", type=Path, default=ROOT / "tmp/avatar-renders/heads-only")
    ap.add_argument("--out", type=Path, default=ROOT / "public/landing/heads")
    ap.add_argument("avatars", nargs="*")
    args = ap.parse_args()
    names = list(ALL) if args.avatars == ["all"] else (args.avatars or list(LANDING))
    args.raw.mkdir(parents=True, exist_ok=True)
    args.out.mkdir(parents=True, exist_ok=True)
    for name in names:
        raw = args.raw / f"{name}-head-{RES}.png"
        if not raw.exists():
            render_avatar(
                name,
                str(raw),
                framing="head",
                expression="smile",
                mesh_colors={"Hat_Color": PRIMARY} if name in HATS else None,
                resolution=RES,
            )
        square(raw, args.out / f"{name}.png")


if __name__ == "__main__":
    main()
