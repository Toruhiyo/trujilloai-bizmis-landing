"""SVG → PNG rasterizer using Playwright (headless Chromium).

Uses Playwright (already in the studio venv) to render SVGs at arbitrary
resolution with transparent background.  No extra native deps required.

Usage:
    from svg_to_png import svg_to_png

    png_path = svg_to_png("logo.svg", "logo.png", width=1024)
"""

import logging
from pathlib import Path

from playwright.sync_api import sync_playwright

logger = logging.getLogger(__name__)

_DEFAULT_RENDER_WIDTH = 1024


# Public:

def svg_to_png(
    svg_path: str | Path,
    output_path: str | Path,
    *,
    width: int = _DEFAULT_RENDER_WIDTH,
) -> Path:
    """Rasterize an SVG file to a transparent PNG.

    Args:
        svg_path: Path to the source SVG.
        output_path: Destination PNG path (created if missing).
        width: Desired pixel width; height is derived from the SVG aspect ratio.

    Returns:
        The resolved output Path.
    """
    svg_path = Path(svg_path)
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    svg_content = svg_path.read_text(encoding="utf-8")

    html = _build_html(svg_content, width)

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": width, "height": width})

        page.set_content(html, wait_until="networkidle")

        bbox = page.locator("#svg-container svg").bounding_box()
        if bbox is None:
            bbox = {"x": 0, "y": 0, "width": width, "height": width}

        page.screenshot(
            path=str(output_path),
            clip=bbox,
            omit_background=True,
        )
        browser.close()

    logger.info("SVG → PNG  %s  (%dpx wide)", output_path, width)
    return output_path


# Private:

def _build_html(svg_content: str, width: int) -> str:
    return f"""<!DOCTYPE html>
<html><head><style>
  * {{ margin: 0; padding: 0; }}
  body {{ background: transparent; }}
  #svg-container {{ width: {width}px; }}
  #svg-container svg {{ display: block; width: 100%; height: auto; }}
</style></head>
<body><div id="svg-container">{svg_content}</div></body></html>"""
