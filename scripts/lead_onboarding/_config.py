"""Paths and constants for the lead onboarding extraction toolkit."""

from pathlib import Path

LANDING_ROOT = Path(__file__).resolve().parent.parent.parent

LEADS_JSON_DIR = LANDING_ROOT / "src" / "data" / "leads"
LEADS_ASSETS_DIR = LANDING_ROOT / "public" / "invite-cards" / "leads"

REQUIRED_JSON_FIELDS = [
    "id",
    "storeName",
    "storeDomain",
    "leadContactName",
    "leadContactLastName",
    "content",
    "primaryColor",
    "secondaryColor",
    "pitchLine",
    "demoShopperPrompt",
    "demoBizmisReply",
    "demoProducts",
    "country",
    "vertical",
    "subNiche",
]

OPTIONAL_JSON_FIELDS = [
    "textColor",
    "logoColorOverlay",
    "demoFooterLine",
    "montageClerkCue",
]

PRODUCT_IMAGE_MAX_WIDTH = 800
PRODUCT_IMAGE_QUALITY = 85

SHOPIFY_PRODUCTS_JSON_LIMIT = 250

DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
