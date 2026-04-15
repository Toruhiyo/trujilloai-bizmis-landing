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
SUPPORT_AVATAR_FILENAME = "support-avatar.png"

# ── Default avatar ───────────────────────────────────────────────────

DEFAULT_AVATAR_ID = "yusuke"
DEFAULT_SUPPORT_AVATAR_ID = "amber"

# ── Render defaults ──────────────────────────────────────────────────
# Universal params applied to every lead.  Per-lead values (shirt color,
# stamp, button color) are merged on top at render time.

RENDER_DEFAULTS: dict = {
    "animation": "presenting_left",
    "animation_progress": 0.50,
    "expression": "E",
    "resolution": 1024,
    "widget_ui": True,
    "widget_state": "listening",
    "show_wave": True,
    "show_card": False,
    "show_claim": False,
    "framing": "upper_body",
    "lighting_preset": "studio",
    "camera_tilt": 5,
    "shirt_stamp_scale": 1.0,
}

SUPPORT_RENDER_DEFAULTS: dict = {
    "animation": "idle_neutral",
    "animation_progress": 0.50,
    "expression": "smile",
    "resolution": 1024,
    "mobile": True,
    "widget_ui": True,
    "widget_state": "speaking",
    "show_wave": True,
    "show_card": False,
    "show_claim": False,
    "framing": "head",
    "lighting_preset": "studio",
    "camera_tilt": 5,
    "shirt_stamp_scale": 1.0,
}

WAVE_COLOR_LUMINANCE_THRESHOLD = 0.85

# ── Lead registry ────────────────────────────────────────────────────
# Mirrors the per-lead JSON files at src/data/leads/<id>.json.
#
# Invite-card top bar:
# • primary_color       → accent colour (product card borders, browser dots,
#                          waveform). Also banner background unless overridden.
# • logo_color_overlay  → logo tint for the banner. NEVER set for
#                          multi-colour logos.
#
# Avatar characters:
# • avatar_id           → sales demo 3D avatar. Falls back to
#                          DEFAULT_AVATAR_ID when None.
# • support_avatar_id   → support demo 3D avatar (opposite gender from
#                          avatar_id). Falls back to DEFAULT_SUPPORT_AVATAR_ID.
#
# Avatar shirt (independent from the top bar):
# • shirt_color         → shirt mesh + widget button colour.
#                          Falls back to primary_color when None.
# • stamp_color_overlay → tint for the shirt stamp image.
#                          Falls back to logo_color_overlay when None.
# • stamp_image         → filename inside the lead folder (e.g. "icon.png").
#                          Falls back to "logo.png" when None.

LEAD_REGISTRY: list[dict] = [
    # ── Batch 1 ──
    {
        "id": "molekule",
        "primary_color": "#108849",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "kiran",
        "support_avatar_id": "mia",
    },
    {
        "id": "glowforge",
        "primary_color": "#27B8CE",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "kiran",
        "support_avatar_id": "amber",
    },
    {
        "id": "sennheiser",
        "primary_color": "#003746",
        "logo_color_overlay": None,
        "avatar_id": "echo",
        "support_avatar_id": "yue",
    },
    {
        "id": "sodastream",
        "primary_color": "#00205B",
        "logo_color_overlay": None,
        "avatar_id": "adrian",
        "support_avatar_id": "mia",
    },
    {
        "id": "peakdesign",
        "primary_color": "#1A1A1A",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "teo",
        "support_avatar_id": "amber",
    },
    {
        "id": "hodinkee",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "yusuke",
        "support_avatar_id": "yue",
    },
    {
        "id": "sixpenny",
        "primary_color": "#3C392D",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "amber",
        "support_avatar_id": "luca",
    },
    {
        "id": "shapermint",
        "primary_color": "#F8A08E",
        "logo_color_overlay": None,
        "avatar_id": "yue",
        "support_avatar_id": "luca",
    },
    {
        "id": "glossier",
        "primary_color": "#FEF116",
        "logo_color_overlay": None,
        "avatar_id": "mia",
        "support_avatar_id": "adrian",
    },
    {
        "id": "theproscloset",
        "primary_color": "#B8F986",
        "logo_color_overlay": None,
        "avatar_id": "victor",
        "support_avatar_id": "amber",
    },
    {
        "id": "nanoleaf",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "adrian",
        "support_avatar_id": "mia",
    },
    {
        "id": "bluetti",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "matt",
        "support_avatar_id": "yue",
    },
    {
        "id": "jackery",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "teo",
        "support_avatar_id": "amber",
    },
    {
        "id": "mactools",
        "primary_color": "#e31837",
        "logo_color_overlay": None,
        "avatar_id": "matt",
        "support_avatar_id": "mia",
    },
    # ── Batch 2 ──
    {
        "id": "emotiva",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "shirt_color": "#3a3a3a",
        "stamp_color_overlay": "#ffffff",
        "avatar_id": "adrian",
        "support_avatar_id": "amber",
    },
    {
        "id": "magnaflow",
        "primary_color": "#000000",
        "logo_color_overlay": None,
        "avatar_id": "victor",
        "support_avatar_id": "yue",
    },
    {
        "id": "burrow",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "luca",
        "support_avatar_id": "mia",
    },
    {
        "id": "uswatersystems",
        "primary_color": "#0054A6",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "matt",
        "support_avatar_id": "amber",
    },
    {
        "id": "jdmenginezone",
        "primary_color": "#1a1a1a",
        "logo_color_overlay": None,
        "avatar_id": "yusuke",
        "support_avatar_id": "yue",
    },
    {
        "id": "liveu",
        "primary_color": "#f1592b",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "kiran",
        "support_avatar_id": "amber",
    },
    {
        "id": "floyd",
        "primary_color": "#231e1e",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "will",
        "support_avatar_id": "mia",
    },
    {
        "id": "bulova",
        "primary_color": "#000000",
        "logo_color_overlay": None,
        "avatar_id": "matt",
        "support_avatar_id": "yue",
    },
    {
        "id": "urotuning",
        "primary_color": "#252525",
        "logo_color_overlay": None,
        "shirt_color": "#252525",
        "stamp_color_overlay": None,
        "avatar_id": "luca",
        "support_avatar_id": "amber",
    },
    {
        "id": "positivegrid",
        "primary_color": "#E02020",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "echo",
        "support_avatar_id": "mia",
    },
    {
        "id": "thehomesecuritysuperstore",
        "primary_color": "#1a1a1a",
        "logo_color_overlay": None,
        "avatar_id": "will",
        "support_avatar_id": "yue",
    },
    {
        "id": "pura",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "amber",
        "support_avatar_id": "yusuke",
    },
    {
        "id": "speedengineering",
        "primary_color": "#000000",
        "logo_color_overlay": None,
        "avatar_id": "teo",
        "support_avatar_id": "amber",
    },
    {
        "id": "gorjana",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "yue",
        "support_avatar_id": "luca",
    },
    {
        "id": "crownandcaliber",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "yusuke",
        "support_avatar_id": "yue",
    },
    {
        "id": "schoolhouse",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "amber",
        "support_avatar_id": "will",
    },
]

_LEAD_BY_ID: dict[str, dict] = {lead["id"]: lead for lead in LEAD_REGISTRY}


# Public:


def get_lead(lead_id: str) -> dict:
    """Return the registry entry for *lead_id*, or raise ``KeyError``."""
    return _LEAD_BY_ID[lead_id]


def lead_output_path(lead_id: str) -> Path:
    """Absolute path where the clerk (sales) avatar PNG should be written."""
    return LEADS_DIR / lead_id / CLERK_AVATAR_FILENAME


def support_lead_output_path(lead_id: str) -> Path:
    """Absolute path where the support avatar PNG should be written."""
    return LEADS_DIR / lead_id / SUPPORT_AVATAR_FILENAME
