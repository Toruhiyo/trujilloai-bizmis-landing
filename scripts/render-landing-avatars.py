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
import os
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
STUDIO = Path.home() / "Projects/Bizmis/trujilloai-bizmis-studio"
sys.path.insert(0, str(STUDIO))
from marketing.render import render_avatar  # noqa: E402

# AVATAR_RAW moves the raw renders elsewhere (e.g. a scratch dir), tmp/avatar-renders/ by default.
RAW = Path(os.environ.get("AVATAR_RAW", ROOT / "tmp/avatar-renders"))
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
# The true Bizmis primary (the app's hsl(var(--primary)), the widget's colour), not the film's
# deeper #F28C38.
ORANGE = "#F9A353"
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
}

# Personalization ("Make it truly yours"): each avatar wears a fictional store's AI-generated logo, and
# EITHER the shirt is vivid with a one-colour logo OR the shirt is neutral (white, black) or pale with a
# multicolour logo, never both. No Bizmis colour or logo here: this section is about the merchant's own brand.
#
# The palette: every shirt follows its brand's name and meaning, each brand has its own hue (the
# lineup reads as one spread of colours, no two alike), and none is the Bizmis orange (#F9A353) or
# close to it, so the brands sit next to the page's orange rather than in it (papaya leans coral, a
# pink-orange; the sun is a clear yellow, not amber). `glow` is the brand colour the carousel's spotlight
# takes under the centre avatar: the shirt itself when it is vivid, the logo's own accent when the
# shirt is neutral or pale. This palette is written to src/components/landing/brand-palette.json on
# every run, so the page's colours always match the shirts.
#   avatar: (brand, logo file, shirt, glow, logo colour on the shirt, extra render kwargs)
PALETTE = {
    # KUMO, "cloud" in Japanese: a clear sky blue, its navy wordmark on it.
    "luca": ("KUMO", "kumo", "#6EC8F5", "#4DB8F0", "navy", {}),
    # papaya: the fruit's flesh, a coral (pink-orange, well off the Bizmis orange), the logo in white.
    "mia": ("papaya", "papaya-white", "#FF6F61", "#FF6F61", "white", {}),
    # bloom: a blossom-pink shirt, pale, so its own pink flower and plum wordmark carry the colour.
    "kiran": ("bloom", "bloom", "#F7CFD8", "#EC6F96", "multicolour (pink flower, plum wordmark)", {}),
    # AURELITH (aurum, gold: jewellery): deep wine, the gold wordmark as on velvet.
    "yue": ("AURELITH", "aurelith", "#6B1F3E", "#A33A66", "gold", {"Shirt_Color_Dress": "#6B1F3E"}),
    # FERRO & CO., "iron", an anvil: gunmetal, the cream mark as on worn steel.
    "echo": ("FERRO & CO.", "ferro", "#4A5462", "#6E7C92", "cream", {}),
    # SOLARO, the sun: a clear sun yellow, the sun mark in deep navy (white would vanish on yellow).
    "amber": ("SOLARO", "solaro-navy", "#FFD23F", "#FFCC2E", "navy", {}),
    # TIDEWELL, the sea: an ocean teal, its navy wordmark on it.
    "will": ("TIDEWELL", "tidewell", "#2EC4B6", "#22B8AA", "navy", {}),
    # ZORA, a lightning bolt: black, the neon lime and magenta logo; the glow is its magenta.
    "adrian": ("ZORA", "zora", "#1C1C1E", "#D42BB0", "multicolour (lime, magenta)", {}),
    # NUBO, "cloud" again (Spanish nube), the storm side: a deep royal blue, the white cloud mark on it.
    "victor": ("NUBO", "nubo", "#2563EB", "#2563EB", "white", {}),
    # fizzwick, fizzy sweets: white, the candy-coloured wordmark; the glow is its soda blue.
    "teo": ("fizzwick", "fizzwick", "#F7F5F2", "#1FAFC4", "multicolour (candy)", {}),
    # VERDA, "green": a fresh leaf lime, the deep green wordmark.
    "yusuke": ("VERDA", "verda", "#A3E635", "#7CCF1F", "deep green", {}),
    # PIXORA, pixels and play: an electric violet, the logo in white.
    "marc": ("PIXORA", "pixora-white", "#7C3AED", "#7C3AED", "white", {}),
}
for _avatar, (_brand, _logo, _shirt, _glow, _ink, _extra) in PALETTE.items():
    RENDERS[f"style-{_avatar}"] = (_avatar, dict(
        framing="head_shoulders",
        mesh_colors={"Shirt_Color": _shirt, **_extra},
        **store_logo(_logo),
        **({"hat_color": "#1F1F1F"} if _avatar == "teo" else {}),
        **({"shirt_stamp_offset_y": -0.08} if _avatar == "echo" else {}),  # logo below the beard
        expression="smile",
    ))


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


def write_palette() -> None:
    """The brands' colours, read by the carousel (its spotlight and the names above the heads)."""
    pal = {f"style-{a}": {"brand": b, "shirt": s, "glow": g} for a, (b, _, s, g, _, _) in PALETTE.items()}
    (ROOT / "src/components/landing/brand-palette.json").write_text(json.dumps(pal, indent=2) + "\n")


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
        # A changed logo or shirt colour must invalidate the baked shirt render.
        stamp = kwargs.get("shirt_stamp")
        stamp_key = (
            "-" + hashlib.sha256(Path(stamp).read_bytes()).hexdigest()[:12]
            + "-" + kwargs.get("mesh_colors", {}).get("Shirt_Color", "").lstrip("#").lower()
            if stamp else ""
        )
        out = RAW / f"{name}{stamp_key}.png"
        if not out.exists():
            kwargs = {"resolution": 2048, **kwargs}
            render_avatar(avatar, str(out), **kwargs)
        cut_sizes(name, out)
    write_manifest()
    write_palette()


if __name__ == "__main__":
    main()
