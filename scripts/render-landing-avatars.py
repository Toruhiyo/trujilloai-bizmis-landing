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
import hashlib
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
STUDIO = Path.home() / "Projects/Bizmis/trujilloai-bizmis-studio"
sys.path.insert(0, str(STUDIO))
from marketing.render import render_avatar  # noqa: E402

RAW = ROOT / "tmp/avatar-renders"
WEB = ROOT / "public/landing/agents"
# Original illustration with the selected S2-C wordmark, tightly framed.
# Keep the existing chest placement and scale; only the branding changes.
STAMP = str(ROOT / "scripts/assets/bizmis-logo-white-tight.png")
LOGO = dict(shirt_stamp=STAMP, shirt_stamp_scale=1.15)


def store_logo(name: str) -> dict:
    """A fictional merchant's logo, to show the agent wearing the store's brand.

    AI-generated (Higgsfield Z Image) on a flat chroma background, then cut out
    to transparency with scripts/key-logo.py: coined names, no real brands.
    """
    return dict(shirt_stamp=str(ROOT / f"scripts/assets/store-logos/{name}.png"), shirt_stamp_scale=1.15)
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
    # Personalization: each avatar wears a fictional store's AI-generated logo, and EITHER the shirt is
    # vivid with a one-colour logo OR the shirt is neutral (white, black, oat) with a multicolour logo,
    # never both. No Bizmis colour or logo here: this section is about the merchant's own brand.
    "style-teo": ("teo", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#F7F5F2"}, hat_color="#1F1F1F", **store_logo("fizzwick"), expression="smile")),
    "style-luca": ("luca", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#FFC93C"}, **store_logo("kumo"), expression="smile")),
    "style-kiran": ("kiran", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#EADFCC"}, **store_logo("bloom"), expression="smile")),
    "style-yue": ("yue", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#047857"}, **store_logo("aurelith"), expression="smile")),
    "style-echo": ("echo", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#E53935"}, **store_logo("ferro"),
                                shirt_stamp_offset_y=-0.08, expression="smile")),  # logo below the beard
    "style-mia": ("mia", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#38BDF8"}, **store_logo("papaya-white"), expression="smile")),
    "style-adrian": ("adrian", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#1C1C1E"}, **store_logo("zora"), expression="smile")),
    "style-victor": ("victor", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#2563EB"}, **store_logo("nubo"), expression="smile")),
    "style-yusuke": ("yusuke", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#A3E635"}, **store_logo("verda"), expression="smile")),
    "style-amber": ("amber", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#D946EF"}, **store_logo("solaro"), expression="smile")),
    "style-will": ("will", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#34D399"}, **store_logo("tidewell"), expression="smile")),
    "style-marc": ("marc", dict(framing="head_shoulders", mesh_colors={"Shirt_Color": "#7C3AED"}, **store_logo("pixora-white"), expression="smile")),
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
        # A changed Bizmis logo must invalidate the baked shirt render.
        stamp_key = (
            "-" + hashlib.sha256(Path(STAMP).read_bytes()).hexdigest()[:12]
            if kwargs.get("shirt_stamp") == STAMP else ""
        )
        out = RAW / f"{name}{stamp_key}.png"
        if not out.exists():
            kwargs = {"resolution": 2048, **kwargs}
            render_avatar(avatar, str(out), **kwargs)
        cut_sizes(name, out)
    write_manifest()


if __name__ == "__main__":
    main()
