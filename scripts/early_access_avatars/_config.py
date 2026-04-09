"""Paths, lead registry, and render defaults for early-access avatar generation.

All file-system paths are derived from LANDING_ROOT (this repo) and STUDIO_ROOT
(the sibling Blender repo).  The studio repo is never written to.
"""

from pathlib import Path

# ── Repository roots ─────────────────────────────────────────────────

LANDING_ROOT = Path(__file__).resolve().parent.parent.parent
STUDIO_ROOT = Path("/Users/oriol/Projects/Bizmis/trujilloai-bizmis-studio")
STUDIO_VENV_PYTHON = STUDIO_ROOT / ".venv" / "bin" / "python"

# ── Filesystem layout ────────────────────────────────────────────────

LEADS_DIR = LANDING_ROOT / "public" / "invite-cards" / "leads"
CONVERTED_LOGOS_DIR = LEADS_DIR / "_converted-svgs"
TINTED_LOGOS_DIR = LEADS_DIR / "_tinted-logos"
CLERK_AVATAR_FILENAME = "clerk-avatar.png"

# ── Default avatar ───────────────────────────────────────────────────

DEFAULT_AVATAR_ID = "yusuke"

# ── Render defaults ──────────────────────────────────────────────────
# Universal params applied to every lead.  Per-lead values (shirt color,
# stamp, button color) are merged on top at render time.

RENDER_DEFAULTS: dict = {
    "animation": "presenting_left",
    "animation_progress": 0.50,
    "expression": "E",
    "resolution": 1024,
    "widget_ui": True,
    "widget_state": "speaking",
    "theme": "light",
    "show_claim": False,
    "framing": "upper_body",
    "lighting_preset": "studio",
    "camera_tilt": 5,
    "shirt_stamp_scale": 1.0,
}

# ── Lead registry ────────────────────────────────────────────────────
# Mirrors the per-lead JSON files at src/data/leads/<id>.json.
#
# • primary_color   → shirt mesh color + widget button color
# • logo_color_overlay → when set, the logo stamp is tinted to this hex
#   (matching the invite-card header behavior); when None the native logo
#   colors are used as-is.

LEAD_REGISTRY: list[dict] = [
    {"id": "molekule",      "primary_color": "#108849", "logo_color_overlay": "#ffffff"},
    {"id": "glowforge",     "primary_color": "#27B8CE", "logo_color_overlay": "#ffffff"},
    {"id": "sennheiser",    "primary_color": "#003746", "logo_color_overlay": None},
    {"id": "sodastream",    "primary_color": "#00205B", "logo_color_overlay": None},
    {"id": "peakdesign",    "primary_color": "#1A1A1A", "logo_color_overlay": "#ffffff"},
    {"id": "hodinkee",      "primary_color": "#FFFFFF", "logo_color_overlay": None},
    {"id": "sixpenny",      "primary_color": "#3C392D", "logo_color_overlay": "#ffffff"},
    {"id": "shapermint",    "primary_color": "#F8A08E", "logo_color_overlay": None},
    {"id": "glossier",      "primary_color": "#FEF116", "logo_color_overlay": None},
    {"id": "theproscloset", "primary_color": "#B8F986", "logo_color_overlay": None},
]

_LEAD_BY_ID: dict[str, dict] = {lead["id"]: lead for lead in LEAD_REGISTRY}


# Public:

def get_lead(lead_id: str) -> dict:
    """Return the registry entry for *lead_id*, or raise ``KeyError``."""
    return _LEAD_BY_ID[lead_id]


def lead_output_path(lead_id: str) -> Path:
    """Absolute path where the clerk avatar PNG should be written."""
    return LEADS_DIR / lead_id / CLERK_AVATAR_FILENAME
