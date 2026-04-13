"""Logo preparation pipeline: resolve → convert → tint.

Handles three logo scenarios transparently:
  1. SVG source       → rasterised via Playwright (headless Chromium)
  2. Misidentified PNG → re-encoded to real PNG via Pillow
  3. Native PNG        → used directly

When a lead's ``logo_color_overlay`` is set, the resolved PNG is flat-tinted
to that colour (preserving alpha) to match the invite-card header behaviour.
"""

import logging
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

from ._config import CONVERTED_LOGOS_DIR, LEADS_DIR, TINTED_LOGOS_DIR

logger = logging.getLogger(__name__)

_SVG_RENDER_WIDTH = 1024


# Public:

def prepare_stamp(lead: dict) -> Path:
    """Return a render-ready stamp PNG for *lead*.

    Uses avatar-specific fields (``stamp_image``, ``stamp_color_overlay``)
    when present, falling back to the invite-card fields
    (``logo.png``, ``logo_color_overlay``).
    """
    lead_id = lead["id"]
    stamp_png = _resolve_stamp_png(lead)
    overlay = _resolve_stamp_overlay(lead)

    if overlay is None:
        return stamp_png

    tint_hex = overlay.lstrip("#")
    cached = TINTED_LOGOS_DIR / f"{lead_id}-stamp-{tint_hex}.png"
    if not cached.exists():
        tint_logo(stamp_png, overlay, cached)
    return cached


def resolve_logo_png(lead_id: str) -> Path:
    """Return a guaranteed-real-PNG logo for *lead_id*.

    Converts SVG sources and re-encodes non-PNG files that masquerade as
    ``.png`` (e.g. AVIF with a ``.png`` extension).
    """
    lead_dir = LEADS_DIR / lead_id
    svg = lead_dir / "logo.svg"
    png = lead_dir / "logo.png"

    if svg.exists():
        converted = CONVERTED_LOGOS_DIR / f"{lead_id}.png"
        if not converted.exists():
            svg_to_png(svg, converted)
        return converted

    if png.exists():
        return _ensure_real_png(png, lead_id)

    raise FileNotFoundError(f"No logo found for lead '{lead_id}' in {lead_dir}")


def tint_logo(
    logo_path: str | Path,
    color_hex: str,
    output_path: str | Path,
) -> Path:
    """Recolour a logo PNG to a flat *color_hex*, preserving alpha."""
    img = Image.open(logo_path).convert("RGBA")
    r, g, b = _hex_to_rgb(color_hex)
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            _, _, _, a = pixels[x, y]
            pixels[x, y] = (r, g, b, a)

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out)
    logger.info("Tinted logo → %s (%s)", out, color_hex)
    return out


def svg_to_png(
    svg_path: str | Path,
    output_path: str | Path,
    *,
    width: int = _SVG_RENDER_WIDTH,
) -> Path:
    """Rasterise an SVG file to a transparent PNG via headless Chromium."""
    svg_path = Path(svg_path)
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    svg_content = svg_path.read_text(encoding="utf-8")
    html = _svg_host_html(svg_content, width)

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": width, "height": width})
        page.set_content(html, wait_until="networkidle")

        bbox = page.locator("#svg-container svg").bounding_box()
        if bbox is None:
            bbox = {"x": 0, "y": 0, "width": width, "height": width}

        page.screenshot(path=str(output_path), clip=bbox, omit_background=True)
        browser.close()

    logger.info("SVG → PNG  %s  (%dpx wide)", output_path, width)
    return output_path


# Private:

def _resolve_stamp_png(lead: dict) -> Path:
    """Resolve the stamp image, using ``stamp_image`` override when present."""
    lead_id = lead["id"]
    custom = lead.get("stamp_image")
    if custom:
        custom_path = LEADS_DIR / lead_id / custom
        if custom_path.suffix.lower() == ".svg":
            converted = CONVERTED_LOGOS_DIR / f"{lead_id}-stamp.png"
            if not converted.exists():
                svg_to_png(custom_path, converted)
            return converted
        if custom_path.exists():
            return _ensure_real_png(custom_path, f"{lead_id}-stamp")
        raise FileNotFoundError(f"Stamp image '{custom}' not found for lead '{lead_id}'")
    return resolve_logo_png(lead_id)


def _resolve_stamp_overlay(lead: dict) -> str | None:
    """Return the tint hex for the stamp, preferring avatar-specific override."""
    if "stamp_color_overlay" in lead:
        return lead["stamp_color_overlay"]
    return lead.get("logo_color_overlay")


def _ensure_real_png(path: Path, lead_id: str) -> Path:
    """Re-encode to true PNG when the on-disk file is a different format."""
    try:
        img = Image.open(path)
        if img.format == "PNG":
            return path
    except Exception:
        return path

    converted = CONVERTED_LOGOS_DIR / f"{lead_id}.png"
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


def _svg_host_html(svg_content: str, width: int) -> str:
    return (
        "<!DOCTYPE html><html><head><style>"
        f"*{{margin:0;padding:0}}body{{background:transparent}}"
        f"#svg-container{{width:{width}px}}"
        f"#svg-container svg{{display:block;width:100%;height:auto}}"
        "</style></head>"
        f"<body><div id='svg-container'>{svg_content}</div></body></html>"
    )
