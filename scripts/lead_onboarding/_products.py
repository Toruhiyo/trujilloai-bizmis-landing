"""Fetch product catalog from a Shopify store."""

import json
import logging
from typing import TypedDict
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from ._config import DEFAULT_USER_AGENT, SHOPIFY_PRODUCTS_JSON_LIMIT

logger = logging.getLogger(__name__)


class ProductInfo(TypedDict):
    title: str
    price: str
    product_type: str
    image_url: str | None
    handle: str
    vendor: str
    variant_count: int


# Public:

def fetch_products(store_url: str) -> list[ProductInfo]:
    """Fetch products from a Shopify store via the public products.json endpoint.

    Falls back gracefully when the endpoint is unavailable (non-Shopify or
    restricted stores).
    """
    base = _normalise_url(store_url)
    url = f"{base}/products.json?limit={SHOPIFY_PRODUCTS_JSON_LIMIT}"
    logger.info("Fetching products from %s …", url)

    try:
        req = Request(url, headers={"User-Agent": DEFAULT_USER_AGENT})
        with urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except HTTPError as exc:
        logger.warning("products.json unavailable (%s) — store may not be Shopify or endpoint is restricted", exc)
        return []
    except Exception as exc:
        logger.warning("Failed to fetch products: %s", exc)
        return []

    raw_products = data.get("products", [])
    logger.info("Fetched %d products", len(raw_products))

    return [_parse_product(p) for p in raw_products if isinstance(p, dict)]


# Private:

def _parse_product(raw: dict) -> ProductInfo:
    variants = raw.get("variants", [])
    price = _best_price(variants)
    image = raw.get("images", [{}])
    image_url = image[0].get("src") if image else None

    return ProductInfo(
        title=raw.get("title", ""),
        price=price,
        product_type=raw.get("product_type", ""),
        image_url=image_url,
        handle=raw.get("handle", ""),
        vendor=raw.get("vendor", ""),
        variant_count=len(variants),
    )


def _best_price(variants: list) -> str:
    prices: list[float] = []
    for v in variants:
        raw = v.get("price")
        if raw is None:
            continue
        try:
            prices.append(float(raw))
        except (ValueError, TypeError):
            continue

    if not prices:
        return ""

    min_price = min(prices)
    if min_price == int(min_price):
        return f"${int(min_price)}"
    return f"${min_price:.2f}"


def _normalise_url(url: str) -> str:
    url = url.strip().rstrip("/")
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    return url
