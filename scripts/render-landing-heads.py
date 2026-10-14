"""Render the preset avatars' head images for the film landing's mockups (the
session replays' agent avatars, the widget's head circle), in the TRUE Bizmis
primary (#F9A353) with the Bizmis logo, with the studio's Blender renderer.

  ~/Projects/Bizmis/trujilloai-bizmis-studio/.venv/bin/python \
      scripts/render-landing-heads.py [avatar ...]

The app's own head images on cdn.bizmis.ai/common/avatars/images/<id>.png
wear a deeper orange (about #F06E20), so the landing serves its own copies,
same names and size: public/landing/heads/<id>.png, 512x512, transparent,
rendered head-and-shoulders and cropped to the app's framing (the head
filling most of the square, the shirt across the bottom). Raw renders are cached in
tmp/avatar-renders/heads/ (keyed by logo + colour), so a crashed run (Metal
can crash Blender) resumes where it stopped: just run it again.
"""
import hashlib
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
STUDIO = Path.home() / "Projects/Bizmis/trujilloai-bizmis-studio"
sys.path.insert(0, str(STUDIO))
from marketing.render import render_avatar  # noqa: E402

RAW = ROOT / "tmp/avatar-renders/heads"
WEB = ROOT / "public/landing/heads"
STAMP = ROOT / "scripts/assets/bizmis-logo-white-tight.png"
PRIMARY = "#F9A353"
SIZE = 512
# the replays' agents (replaySessions.ts) and the widget head circles' presets
AVATARS = ("amber", "will", "yue", "yusuke", "luca", "mia")


def square(src: Path, dst: Path) -> None:
    """Frame like the app's head images: the head (hair included) about 80%
    of the square's width, its top at the top edge, the shirt across the
    bottom. The head's width is read from the widest row in the top part of
    the silhouette, above the shoulders."""
    img = Image.open(src).convert("RGBA")
    img = img.crop(img.getbbox())
    alpha = img.getchannel("A")
    x0, x1 = 0, img.width
    widest = 0
    for y in range(0, round(img.height * 0.5), 4):
        row = alpha.crop((0, y, img.width, y + 1)).point(lambda v: 255 if v > 128 else 0).getbbox()
        if row and row[2] - row[0] > widest:
            widest, x0, x1 = row[2] - row[0], row[0], row[2]
    head_w = x1 - x0
    side = round(head_w / 0.8)
    cx = (x0 + x1) / 2
    left = round(cx - side / 2)
    img.crop((left, 0, left + side, side)).resize((SIZE, SIZE), Image.LANCZOS).save(dst, optimize=True)
    print(f"{dst.name}: head {head_w}px of {img.width}x{img.height}, square {side}")


def main() -> None:
    names = sys.argv[1:] or list(AVATARS)
    RAW.mkdir(parents=True, exist_ok=True)
    WEB.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha256(STAMP.read_bytes()).hexdigest()[:12] + "-" + PRIMARY.lstrip("#").lower()
    for name in names:
        out = RAW / f"{name}-{key}.png"
        if not out.exists():
            render_avatar(
                name,
                str(out),
                framing="head_shoulders",
                expression="smile",
                mesh_colors={"Shirt_Color": PRIMARY},
                shirt_stamp=str(STAMP),
                shirt_stamp_scale=1.15,
                resolution=1400,
            )
        square(out, WEB / f"{name}.png")


if __name__ == "__main__":
    main()
