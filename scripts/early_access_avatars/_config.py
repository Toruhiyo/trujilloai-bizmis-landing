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
    "widget_state": "listening",
    "show_wave": True,
    "show_card": False,
    "show_claim": False,
    "framing": "upper_body",
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
# Avatar character:
# • avatar_id           → which 3D avatar to use. Falls back to
#                          DEFAULT_AVATAR_ID when None.
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
        "avatar_id": "yusuke",
    },
    {
        "id": "glowforge",
        "primary_color": "#27B8CE",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "kiran",
    },
    {
        "id": "sennheiser",
        "primary_color": "#003746",
        "logo_color_overlay": None,
        "avatar_id": "luca",
    },
    {
        "id": "sodastream",
        "primary_color": "#00205B",
        "logo_color_overlay": None,
        "avatar_id": "will",
    },
    {
        "id": "peakdesign",
        "primary_color": "#1A1A1A",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "teo",
    },
    {
        "id": "hodinkee",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "yusuke",
    },
    {
        "id": "sixpenny",
        "primary_color": "#3C392D",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "amber",
    },
    {
        "id": "shapermint",
        "primary_color": "#F8A08E",
        "logo_color_overlay": None,
        "avatar_id": "yue",
    },
    {
        "id": "glossier",
        "primary_color": "#FEF116",
        "logo_color_overlay": None,
        "avatar_id": "amber",
    },
    {
        "id": "theproscloset",
        "primary_color": "#B8F986",
        "logo_color_overlay": None,
        "avatar_id": "echo",
    },
    {
        "id": "nanoleaf",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "kiran",
    },
    {
        "id": "bluetti",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "avatar_matt",
    },
    {
        "id": "jackery",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "teo",
    },
    {
        "id": "mactools",
        "primary_color": "#e31837",
        "logo_color_overlay": None,
        "avatar_id": "avatar_mathew",
    },
    # ── Batch 2 ──
    {
        "id": "emotiva",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "shirt_color": "#3a3a3a",
        "stamp_color_overlay": "#ffffff",
        "avatar_id": "echo",
    },
    {
        "id": "magnaflow",
        "primary_color": "#000000",
        "logo_color_overlay": None,
        "avatar_id": "teo",
    },
    {
        "id": "burrow",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "luca",
    },
    {
        "id": "uswatersystems",
        "primary_color": "#0054A6",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "avatar_mathew",
    },
    {
        "id": "jdmenginezone",
        "primary_color": "#1a1a1a",
        "logo_color_overlay": None,
        "avatar_id": "yusuke",
    },
    {
        "id": "liveu",
        "primary_color": "#f1592b",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "kiran",
    },
    {
        "id": "floyd",
        "primary_color": "#231e1e",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "will",
    },
    {
        "id": "bulova",
        "primary_color": "#000000",
        "logo_color_overlay": None,
        "avatar_id": "avatar_matt",
    },
    {
        "id": "urotuning",
        "primary_color": "#252525",
        "logo_color_overlay": None,
        "shirt_color": "#252525",
        "stamp_color_overlay": None,
        "avatar_id": "luca",
    },
    {
        "id": "positivegrid",
        "primary_color": "#E02020",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "echo",
    },
    {
        "id": "thehomesecuritysuperstore",
        "primary_color": "#1a1a1a",
        "logo_color_overlay": None,
        "avatar_id": "will",
    },
    {
        "id": "pura",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "amber",
    },
    {
        "id": "speedengineering",
        "primary_color": "#000000",
        "logo_color_overlay": None,
        "avatar_id": "teo",
    },
    {
        "id": "gorjana",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "yue",
    },
    {
        "id": "crownandcaliber",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "yusuke",
    },
    {
        "id": "schoolhouse",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "amber",
    },
]

_LEAD_BY_ID: dict[str, dict] = {lead["id"]: lead for lead in LEAD_REGISTRY}


# Public:


def get_lead(lead_id: str) -> dict:
    """Return the registry entry for *lead_id*, or raise ``KeyError``."""
    return _LEAD_BY_ID[lead_id]


def lead_output_path(lead_id: str) -> Path:
    """Absolute path where the clerk avatar PNG should be written."""
    return LEADS_DIR / lead_id / CLERK_AVATAR_FILENAME
