"""Early-access avatar generation pipeline.

Public API
----------
``generate_all()`` / ``generate_lead(lead_id)``
    Render assisted-sales avatars — desktop widget format.

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
    get_lead,
    lead_output_path,
    resolve_raw_montage_accent_hex,
    resolve_widget_wave_color,
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
    """Render assisted-sales avatars for every lead in the registry.

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
    """Render the assisted-sales avatar for a single *lead_id*.

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
        logger.info(
            "[%d/%d] Rendering support %s (avatar=%s) …", i, total, lead_id, chosen
        )
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
        "button_color": resolve_raw_montage_accent_hex(lead),
        "mesh_colors": {"Shirt_Color": shirt_color},
        "wave_color": resolve_widget_wave_color(lead),
    }
    if "stamp_scale" in lead:
        params["shirt_stamp_scale"] = float(lead["stamp_scale"])

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
        "wave_color": resolve_widget_wave_color(lead),
    }
    if "stamp_scale" in lead:
        params["shirt_stamp_scale"] = float(lead["stamp_scale"])

    _studio_render(avatar_id, str(out), **params)
    return out
