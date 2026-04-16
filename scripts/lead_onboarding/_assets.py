"""Download and optimise product/logo images with Pillow."""

import logging
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image

from ._config import (
    DEFAULT_USER_AGENT,
    LEADS_ASSETS_DIR,
    PRODUCT_IMAGE_MAX_WIDTH,
    PRODUCT_IMAGE_QUALITY,
)

logger = logging.getLogger(__name__)


# Public:

def download_logo(lead_id: str, url: str | None = None, svg_source: str | None = None) -> Path | None:
    """Download or save a logo for *lead_id*.

    When *svg_source* is provided, it is saved directly as an SVG file.
    When *url* is provided, it is downloaded.  Returns the saved file path.
    """
    lead_dir = LEADS_ASSETS_DIR / lead_id
    lead_dir.mkdir(parents=True, exist_ok=True)

    if svg_source:
        svg_path = lead_dir / "logo.svg"
        svg_path.write_text(svg_source, encoding="utf-8")
        logger.info("Saved SVG logo → %s", svg_path)
        return svg_path

    if url:
        ext = _guess_ext(url, default="png")
        out = lead_dir / f"logo.{ext}"
        _download(url, out)
        return out

    return None


def crop_logo_transparency(lead_id: str) -> bool:
    """Crop strictly-transparent pixels from the lead's logo.png.

    Returns True if the image was cropped (or already tight), False if
    the file is missing or has no alpha channel.  Never removes any pixel
    that is not fully transparent (alpha == 0).
    """
    logo_path = LEADS_ASSETS_DIR / lead_id / "logo.png"
    if not logo_path.is_file():
        logger.warning("No logo.png for %s — skipping crop", lead_id)
        return False

    img = Image.open(logo_path)

    if img.mode not in ("RGBA", "LA", "PA"):
        img = img.convert("RGBA")

    alpha = img.getchannel("A")
    bbox = alpha.getbbox()

    if bbox is None:
        logger.warning("Logo for %s is fully transparent — skipping", lead_id)
        return False

    if bbox == (0, 0, img.width, img.height):
        logger.info("Logo for %s already tight — no crop needed", lead_id)
        return True

    cropped = img.crop(bbox)
    cropped.save(logo_path, format="PNG")
    logger.info(
        "Cropped %s logo: %dx%d → %dx%d",
        lead_id, img.width, img.height, cropped.width, cropped.height,
    )
    return True


def crop_all_logos() -> dict[str, bool]:
    """Crop transparent padding from every lead's logo.png.

    Returns a dict mapping lead_id → whether it was processed.
    """
    results: dict[str, bool] = {}
    for lead_dir in sorted(LEADS_ASSETS_DIR.iterdir()):
        if not lead_dir.is_dir():
            continue
        lead_id = lead_dir.name
        logo = lead_dir / "logo.png"
        if not logo.is_file():
            continue
        results[lead_id] = crop_logo_transparency(lead_id)
    return results


def download_product_images(lead_id: str, image_urls: list[str]) -> list[Path]:
    """Download product images for *lead_id*, optimising each."""
    lead_dir = LEADS_ASSETS_DIR / lead_id
    lead_dir.mkdir(parents=True, exist_ok=True)

    slots = ["a", "b", "c"]
    downloaded: list[Path] = []

    for i, url in enumerate(image_urls[:3]):
        slot = slots[i]
        ext = _guess_ext(url, default="webp")
        dest = lead_dir / f"product-{slot}.{ext}"

        try:
            _download(url, dest)
            _optimise_image(dest)
            downloaded.append(dest)
        except Exception as exc:
            logger.error("Failed to download product image %s: %s", url, exc)

    return downloaded


# Private:

def _download(url: str, dest: Path) -> None:
    logger.info("Downloading %s → %s", url, dest.name)
    req = Request(url, headers={"User-Agent": DEFAULT_USER_AGENT})
    with urlopen(req, timeout=30) as resp:
        dest.write_bytes(resp.read())


def _optimise_image(path: Path) -> None:
    try:
        img = Image.open(path)
    except Exception:
        return

    if img.width > PRODUCT_IMAGE_MAX_WIDTH:
        ratio = PRODUCT_IMAGE_MAX_WIDTH / img.width
        new_h = int(img.height * ratio)
        img = img.resize((PRODUCT_IMAGE_MAX_WIDTH, new_h), Image.LANCZOS)

    fmt = img.format or "WEBP"
    save_kwargs: dict = {}
    if fmt in ("JPEG", "WEBP"):
        save_kwargs["quality"] = PRODUCT_IMAGE_QUALITY
    if fmt == "WEBP":
        save_kwargs["method"] = 4

    img.save(path, format=fmt, **save_kwargs)
    logger.info("Optimised %s (%dx%d)", path.name, img.width, img.height)


def _guess_ext(url: str, *, default: str = "webp") -> str:
    clean = url.split("?")[0].split("#")[0].lower()
    for ext in ("png", "jpg", "jpeg", "webp", "svg", "gif", "avif"):
        if clean.endswith(f".{ext}"):
            return "jpg" if ext == "jpeg" else ext
    return default
