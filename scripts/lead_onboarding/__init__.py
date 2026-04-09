"""Lead onboarding extraction toolkit.

Public API
----------
- ``extract_store_data(store_url)`` — scrape brand, logo, and product data
- ``save_lead(lead_id, data)``      — validate and persist a lead JSON file
- ``download_lead_assets(lead_id, logo_url=None, svg_source=None, product_image_urls=None)``
                                      — download logo and product images
- ``refresh_lead(lead_id, store_url)`` — re-extract and merge into existing data

Usage (from landing repo root, using studio venv for Pillow)::

    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
    from lead_onboarding import extract_store_data, save_lead, download_lead_assets

Or run the individual extraction steps manually for cognitive review.
"""

import logging
from pathlib import Path

from ._brand import BrandData, extract_brand
from ._logo import LogoCandidate, extract_logos
from ._products import ProductInfo, fetch_products
from ._assets import download_logo, download_product_images
from ._json_io import list_leads, read_lead, validate, write_lead

logger = logging.getLogger(__name__)

__all__ = [
    "extract_store_data",
    "save_lead",
    "download_lead_assets",
    "refresh_lead",
    "list_leads",
    "read_lead",
    "write_lead",
    "validate",
    "BrandData",
    "LogoCandidate",
    "ProductInfo",
]


class StoreData:
    """Container for all raw extraction results from a single store."""

    def __init__(
        self,
        store_url: str,
        brand: BrandData,
        logos: list[LogoCandidate],
        products: list[ProductInfo],
    ) -> None:
        self.store_url = store_url
        self.brand = brand
        self.logos = logos
        self.products = products

    def summary(self) -> str:
        lines = [
            f"Store URL: {self.store_url}",
            f"Store name: {self.brand.get('store_name', '?')}",
            f"Theme color: {self.brand.get('theme_color', 'none')}",
            f"CSS color candidates: {self.brand.get('css_color_candidates', [])}",
            f"Logo candidates: {len(self.logos)}",
        ]
        for i, logo in enumerate(self.logos[:5]):
            lines.append(f"  [{i}] score={logo['score']} source={logo['source']} url={logo.get('url', 'inline SVG')}")
        lines.append(f"Products fetched: {len(self.products)}")
        for p in self.products[:10]:
            lines.append(f"  - {p['title']} ({p['price']}) [{p['product_type']}]")
        if len(self.products) > 10:
            lines.append(f"  ... and {len(self.products) - 10} more")
        return "\n".join(lines)


# Public:

def extract_store_data(store_url: str) -> StoreData:
    """Run brand, logo, and product extraction on *store_url*.

    Returns a ``StoreData`` object whose ``.summary()`` method produces a
    human-readable overview for LLM review before curation.
    """
    brand = extract_brand(store_url)
    logos = extract_logos(store_url)
    products = fetch_products(store_url)

    return StoreData(
        store_url=store_url,
        brand=brand,
        logos=logos,
        products=products,
    )


def save_lead(lead_id: str, data: dict) -> Path:
    """Validate and persist *data* as ``src/data/leads/<lead_id>.json``."""
    return write_lead(lead_id, data)


def download_lead_assets(
    lead_id: str,
    *,
    logo_url: str | None = None,
    svg_source: str | None = None,
    product_image_urls: list[str] | None = None,
) -> dict[str, list[Path] | Path | None]:
    """Download logo and product images for *lead_id*."""
    logo_path = download_logo(lead_id, url=logo_url, svg_source=svg_source)

    product_paths: list[Path] = []
    if product_image_urls:
        product_paths = download_product_images(lead_id, product_image_urls)

    return {"logo": logo_path, "products": product_paths}


def refresh_lead(lead_id: str, store_url: str) -> StoreData:
    """Re-extract data for an existing lead.

    Does NOT overwrite the JSON automatically — returns fresh ``StoreData``
    for the LLM to review and selectively merge.
    """
    existing = read_lead(lead_id)
    logger.info("Refreshing lead '%s' (existing data loaded)", lead_id)
    return extract_store_data(store_url)
