"""Render the real Bizmis 3D avatars used by the film landing (/v2) with the
studio's Blender marketing renderer, then cut each into responsive sizes.

  ~/Projects/Bizmis/trujilloai-bizmis-studio/.venv/bin/python \
      scripts/render-landing-avatars.py [name ...]

Raw renders (transparent PNG) go to tmp/avatar-renders/ (not committed).
Web sizes go to public/landing/agents/<name>-<w>.{avif,webp}: 360, 720 and
1080 px wide, so the page's <picture> serves each screen the smallest file
that looks sharp, plus a small 360 px PNG fallback and a tiny blurred placeholder
(<name>-lqip.webp) shown while the real image loads on slow connections.
"""
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
STUDIO = Path.home() / "Projects/Bizmis/trujilloai-bizmis-studio"
sys.path.insert(0, str(STUDIO))
from marketing.render import render_avatar  # noqa: E402

RAW = ROOT / "tmp/avatar-renders"
WEB = ROOT / "public/landing/agents"
# The v1 white wordmark, trimmed to its ink and at full resolution: the studio's
# 308 px copy carries ~20% transparent padding, which printed the logo small and
# soft. 1.15 is the largest a wordmark this wide can be before the renderer's
# wrap-around ceiling clamps it.
STAMP = str(ROOT / "scripts/assets/bizmis-logo-white-tight.png")
LOGO = dict(shirt_stamp=STAMP, shirt_stamp_scale=1.15)
ORANGE = "#F28C38"
WIDTHS = (360, 720, 1080)
FALLBACK_W = 360  # PNG only at one small size: AVIF/WebP cover nearly every browser

# name: (avatar, render kwargs)
RENDERS = {
    # Setup: the agent charged up by your store's data (v1's setup pose), in Bizmis orange.
    "setup-will": ("will", dict(animation="charge_up", animation_progress=0.62, framing="full_body",
                                mesh_colors={"Shirt_Color": ORANGE}, **LOGO, resolution=2560)),
    # "This isn't a chatbot": the agent greeting a shopper.
    "greet-amber": ("amber", dict(animation="waving", animation_progress=0.45, framing="upper_body",
                                  mesh_colors={"Shirt_Color": ORANGE}, **LOGO, expression="smile")),
    # Support: listening, warm.
    "support-yusuke": ("yusuke", dict(animation="nod", animation_progress=0.35, framing="head_shoulders",
                                      mesh_colors={"Shirt_Color": ORANGE}, **LOGO, expression="smile")),
    # Personalization: real avatars in many store colours, always with the Bizmis logo.
    "style-teo": ("teo", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#D1001A"}, hat_color="#D1001A", **LOGO, expression="smile")),
    "style-luca": ("luca", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#29573F"}, **LOGO, expression="smile")),
    "style-kiran": ("kiran", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#A855F7"}, **LOGO, expression="smile")),
    "style-yue": ("yue", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#701C33"}, **LOGO, expression="smile")),
    "style-echo": ("echo", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#1E293B"}, **LOGO,
                                shirt_stamp_offset_y=-0.08, expression="smile")),  # logo below the beard
    "style-mia": ("mia", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#D99A00"}, **LOGO, expression="smile")),
    "style-adrian": ("adrian", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#7FA83A"}, **LOGO, expression="smile")),
    "style-victor": ("victor", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": ORANGE}, **LOGO, expression="smile")),
}


def cut_sizes(name: str, src: Path) -> None:
    img = Image.open(src).convert("RGBA")
    # Trim the transparent margin so every size is all avatar.
    img = img.crop(img.getbbox())
    WEB.mkdir(parents=True, exist_ok=True)
    for w in WIDTHS:
        h = round(img.height * w / img.width)
        im = img.resize((w, h), Image.LANCZOS)
        im.save(WEB / f"{name}-{w}.avif", quality=55)
        im.save(WEB / f"{name}-{w}.webp", quality=80, method=6)
        if w == FALLBACK_W:
            im.save(WEB / f"{name}-{w}.png", optimize=True)
    lq = img.resize((24, round(img.height * 24 / img.width)), Image.LANCZOS)
    lq.save(WEB / f"{name}-lqip.webp", quality=40)
    print(f"{name}: trimmed {img.width}x{img.height}, aspect {img.width / img.height:.4f}")


def write_manifest() -> None:
    """Aspect ratios for every cut avatar, read by the page to reserve space."""
    sizes = {}
    for f in sorted(WEB.glob("*-720.webp")):
        with Image.open(f) as im:
            sizes[f.name.removesuffix("-720.webp")] = [im.width, im.height]
    (ROOT / "src/components/landing/agents-manifest.json").write_text(json.dumps(sizes, indent=2) + "\n")


def main() -> None:
    names = sys.argv[1:] or list(RENDERS)
    RAW.mkdir(parents=True, exist_ok=True)
    for name in names:
        avatar, kwargs = RENDERS[name]
        out = RAW / f"{name}.png"
        if not out.exists():
            kwargs = {"resolution": 2048, **kwargs}
            render_avatar(avatar, str(out), **kwargs)
        cut_sizes(name, out)
    write_manifest()


if __name__ == "__main__":
    main()
