"""Early-access avatar generation pipeline.

Public API
----------
``generate_all()`` / ``generate_lead(lead_id)``
    Render clerk (sales) avatars — desktop widget format.

``generate_all_support()`` / ``generate_support_lead(lead_id)``
    Render support avatars — mobile widget format, opposite gender.

All functions resolve logos, apply tinting, merge per-lead colours into
render defaults, invoke the studio Blender renderer, and write to the
lead's invite-card folder.

Run with the **studio venv**::

    /Users/oriol/Projects/Bizmis/trujilloai-bizmis-studio/.venv/bin/python \\
        scripts/generate_early_access_avatars.py
"""

import logging
import sys
from pathlib import Path

from ._config import (
    DEFAULT_AVATAR_ID,
    DEFAULT_SUPPORT_AVATAR_ID,
    LEAD_REGISTRY,
    RENDER_DEFAULTS,
    SUPPORT_RENDER_DEFAULTS,
    STUDIO_ROOT,
    WAVE_COLOR_LUMINANCE_THRESHOLD,
    get_lead,
    lead_output_path,
    support_lead_output_path,
)
from ._logo import prepare_stamp

sys.path.insert(0, str(STUDIO_ROOT))
from marketing.render import render_avatar as _studio_render  # noqa: E402

logger = logging.getLogger(__name__)

__all__ = [
    "generate_all",
    "generate_lead",
    "generate_all_support",
    "generate_support_lead",
]


# Public:

def generate_all(*, avatar_id: str | None = None) -> list[Path]:
    """Render clerk avatars for every lead in the registry.

    Each lead uses its own ``avatar_id`` from the registry.  Pass
    *avatar_id* to force the same avatar for all leads (overrides the
    per-lead setting).

    Returns a list of output paths for successful renders.
    """
    results: list[Path] = []
    total = len(LEAD_REGISTRY)

    for i, lead in enumerate(LEAD_REGISTRY, 1):
        lead_id = lead["id"]
        chosen = avatar_id or lead.get("avatar_id") or DEFAULT_AVATAR_ID
        logger.info("[%d/%d] Rendering %s (avatar=%s) …", i, total, lead_id, chosen)
        try:
            out = _render_lead(lead, chosen)
            logger.info("[%d/%d] Done → %s", i, total, out)
            results.append(out)
        except Exception as exc:
            logger.error("[%d/%d] FAILED %s — %s", i, total, lead_id, exc)

    return results


def generate_lead(
    lead_id: str,
    *,
    avatar_id: str | None = None,
) -> Path:
    """Render the clerk avatar for a single *lead_id*.

    Uses the lead's ``avatar_id`` from the registry by default.  Pass
    *avatar_id* to override.

    Raises ``KeyError`` if the lead is not in the registry.
    """
    lead = get_lead(lead_id)
    chosen = avatar_id or lead.get("avatar_id") or DEFAULT_AVATAR_ID
    return _render_lead(lead, chosen)


def generate_all_support(*, avatar_id: str | None = None) -> list[Path]:
    """Render support avatars (mobile widget) for every lead."""
    results: list[Path] = []
    total = len(LEAD_REGISTRY)
    for i, lead in enumerate(LEAD_REGISTRY, 1):
        lead_id = lead["id"]
        chosen = avatar_id or lead.get("support_avatar_id") or DEFAULT_SUPPORT_AVATAR_ID
        logger.info("[%d/%d] Rendering support %s (avatar=%s) …", i, total, lead_id, chosen)
        try:
            out = _render_support_lead(lead, chosen)
            logger.info("[%d/%d] Done → %s", i, total, out)
            results.append(out)
        except Exception as exc:
            logger.error("[%d/%d] FAILED support %s — %s", i, total, lead_id, exc)
    return results


def generate_support_lead(
    lead_id: str,
    *,
    avatar_id: str | None = None,
) -> Path:
    """Render the support avatar for a single *lead_id*."""
    lead = get_lead(lead_id)
    chosen = avatar_id or lead.get("support_avatar_id") or DEFAULT_SUPPORT_AVATAR_ID
    return _render_support_lead(lead, chosen)


# Private:

def _render_support_lead(lead: dict, avatar_id: str) -> Path:
    stamp = prepare_stamp(lead)
    out = support_lead_output_path(lead["id"])
    shirt_color = lead.get("shirt_color") or lead["primary_color"]

    params = {
        **SUPPORT_RENDER_DEFAULTS,
        "shirt_stamp": str(stamp),
        "button_color": shirt_color,
        "mesh_colors": {"Shirt_Color": shirt_color},
    }

    if _relative_luminance(shirt_color) < WAVE_COLOR_LUMINANCE_THRESHOLD:
        params["wave_color"] = shirt_color

    _studio_render(avatar_id, str(out), **params)
    return out


def _render_lead(lead: dict, avatar_id: str) -> Path:
    stamp = prepare_stamp(lead)
    out = lead_output_path(lead["id"])
    shirt_color = lead.get("shirt_color") or lead["primary_color"]

    params = {
        **RENDER_DEFAULTS,
        "shirt_stamp": str(stamp),
        "button_color": shirt_color,
        "mesh_colors": {"Shirt_Color": shirt_color},
    }

    if _relative_luminance(shirt_color) < WAVE_COLOR_LUMINANCE_THRESHOLD:
        params["wave_color"] = shirt_color

    _studio_render(avatar_id, str(out), **params)
    return out


def _relative_luminance(hex_color: str) -> float:
    """Return sRGB relative luminance (0.0 = black, 1.0 = white)."""
    h = hex_color.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))

    def linearize(c: float) -> float:
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
