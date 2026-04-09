"""Reusable helpers for avatar marketing renders.

Run with the studio venv:
    /Users/oriol/Projects/Bizmis/trujilloai-bizmis-studio/.venv/bin/python

Never writes to the studio repo — only imports from it.
"""

import logging
import sys
import tempfile
from pathlib import Path

from PIL import Image

STUDIO_ROOT = Path("/Users/oriol/Projects/Bizmis/trujilloai-bizmis-studio")
sys.path.insert(0, str(STUDIO_ROOT))
from marketing.render import render_avatar  # noqa: E402

from svg_to_png import svg_to_png  # noqa: E402

logger = logging.getLogger(__name__)

LANDING_ROOT = Path(__file__).resolve().parent.parent
LEADS_LOGO_DIR = LANDING_ROOT / "public" / "invite-cards" / "leads"
CONVERTED_SVG_DIR = LANDING_ROOT / "public" / "invite-cards" / "leads" / "_converted-svgs"
TINTED_LOGO_DIR = LANDING_ROOT / "public" / "invite-cards" / "leads" / "_tinted-logos"

LEAD_REGISTRY: list[dict] = [
    {"id": "molekule",       "primary_color": "#108849", "logo_color_overlay": "#ffffff"},
    {"id": "glowforge",      "primary_color": "#27B8CE", "logo_color_overlay": "#ffffff"},
    {"id": "sennheiser",     "primary_color": "#003746", "logo_color_overlay": None},
    {"id": "sodastream",     "primary_color": "#00205B", "logo_color_overlay": None},
    {"id": "peakdesign",     "primary_color": "#1A1A1A", "logo_color_overlay": "#ffffff"},
    {"id": "hodinkee",       "primary_color": "#FFFFFF", "logo_color_overlay": None},
    {"id": "sixpenny",       "primary_color": "#3C392D", "logo_color_overlay": "#ffffff"},
    {"id": "shapermint",     "primary_color": "#F8A08E", "logo_color_overlay": None},
    {"id": "glossier",       "primary_color": "#FEF116", "logo_color_overlay": None},
    {"id": "theproscloset",  "primary_color": "#B8F986", "logo_color_overlay": None},
]

AVATAR_RENDER_DEFAULTS = dict(
    animation="presenting_left",
    animation_progress=0.50,
    expression="E",
    resolution=1024,
    widget_ui=True,
    widget_state="speaking",
    theme="light",
    show_claim=False,
    framing="upper_body",
    lighting_preset="studio",
    camera_tilt=5,
    shirt_stamp_scale=1.0,
)

CLERK_AVATAR_FILENAME = "clerk-avatar.png"


# Public:

def lead_output_path(lead_id: str) -> Path:
    return LEADS_LOGO_DIR / lead_id / CLERK_AVATAR_FILENAME


def prepare_lead_stamp(lead: dict) -> Path:
    """Return a ready-to-use stamp PNG for a lead.

    If logo_color_overlay is set, tints the logo to that color (matching
    the invite-cards header behavior). Otherwise returns the original logo.
    """
    lead_id = lead["id"]
    logo_png = resolve_lead_logo_png(lead_id)
    overlay = lead.get("logo_color_overlay")

    if overlay is None:
        return logo_png

    tint_hex = overlay.lstrip("#")
    tinted_path = TINTED_LOGO_DIR / f"{lead_id}-{tint_hex}.png"
    if not tinted_path.exists():
        tint_logo(logo_png, overlay, tinted_path)
    return tinted_path


def tint_logo(logo_path: str | Path, color_hex: str, output_path: str | Path | None = None) -> Path:
    """Recolor a logo PNG to a flat color, preserving alpha."""
    img = Image.open(logo_path).convert("RGBA")
    r, g, b = _hex_to_rgb(color_hex)
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            _, _, _, a = pixels[x, y]
            pixels[x, y] = (r, g, b, a)

    if output_path is None:
        tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
        output_path = tmp.name
        tmp.close()

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out)
    logger.info("Tinted logo → %s (%s)", out, color_hex)
    return out


def resolve_lead_logo_png(lead_id: str) -> Path:
    """Return a guaranteed-real-PNG logo for a lead.

    Handles SVG→PNG conversion and re-encodes non-PNG files
    that masquerade as .png (e.g. AVIF with a .png extension).
    """
    lead_dir = LEADS_LOGO_DIR / lead_id
    svg = lead_dir / "logo.svg"
    png = lead_dir / "logo.png"

    if svg.exists():
        converted = CONVERTED_SVG_DIR / f"{lead_id}.png"
        if not converted.exists():
            svg_to_png(svg, converted, width=1024)
        return converted

    if png.exists():
        return _ensure_real_png(png, lead_id)

    raise FileNotFoundError(f"No logo found for lead '{lead_id}' in {lead_dir}")


# Private:

def _ensure_real_png(path: Path, lead_id: str) -> Path:
    """Re-encode to true PNG if the file is a different format disguised as .png."""
    try:
        img = Image.open(path)
        if img.format == "PNG":
            return path
    except Exception:
        return path

    converted = CONVERTED_SVG_DIR / f"{lead_id}.png"
    if not converted.exists():
        converted.parent.mkdir(parents=True, exist_ok=True)
        img.convert("RGBA").save(converted, format="PNG")
        logger.info("Re-encoded %s (%s → PNG) → %s", path, img.format, converted)
    return converted


def _hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
