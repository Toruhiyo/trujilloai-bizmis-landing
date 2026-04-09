"""Read, write, and validate per-lead JSON files."""

import json
import logging
from pathlib import Path

from ._config import LEADS_JSON_DIR, REQUIRED_JSON_FIELDS

logger = logging.getLogger(__name__)


class LeadValidationError(ValueError):
    """Raised when a lead JSON file fails schema validation."""


# Public:

def read_lead(lead_id: str) -> dict:
    """Load and return the JSON data for *lead_id*, or raise ``FileNotFoundError``."""
    path = _lead_path(lead_id)
    data = json.loads(path.read_text(encoding="utf-8"))
    validate(data)
    return data


def write_lead(lead_id: str, data: dict) -> Path:
    """Validate *data* and write it to ``src/data/leads/<lead_id>.json``."""
    data["id"] = lead_id
    validate(data)

    path = _lead_path(lead_id)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    logger.info("Wrote lead JSON → %s", path)
    return path


def list_leads() -> list[str]:
    """Return a sorted list of existing lead IDs from JSON files on disk."""
    if not LEADS_JSON_DIR.is_dir():
        return []
    return sorted(
        p.stem
        for p in LEADS_JSON_DIR.glob("*.json")
        if not p.name.startswith("_")
    )


def validate(data: dict) -> None:
    """Raise ``LeadValidationError`` if *data* is missing required fields or has wrong types."""
    missing = [f for f in REQUIRED_JSON_FIELDS if f not in data]
    if missing:
        raise LeadValidationError(f"Missing required fields: {', '.join(missing)}")

    if not isinstance(data.get("id"), str) or not data["id"]:
        raise LeadValidationError("'id' must be a non-empty string")

    if not isinstance(data.get("primaryColor"), str):
        raise LeadValidationError("'primaryColor' must be a string")

    products = data.get("demoProducts")
    if not isinstance(products, list) or len(products) != 3:
        raise LeadValidationError("'demoProducts' must be an array of exactly 3 items")

    for i, p in enumerate(products):
        if not isinstance(p, dict):
            raise LeadValidationError(f"demoProducts[{i}] must be an object")
        for key in ("title", "price", "tag"):
            if key not in p:
                raise LeadValidationError(f"demoProducts[{i}] missing '{key}'")


# Private:

def _lead_path(lead_id: str) -> Path:
    return LEADS_JSON_DIR / f"{lead_id}.json"
