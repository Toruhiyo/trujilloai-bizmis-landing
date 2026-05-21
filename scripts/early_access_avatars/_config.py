"""Paths, lead registry, and render defaults for early-access avatar generation.

All file-system paths are derived from LANDING_ROOT (this repo) and STUDIO_ROOT
(the sibling Blender repo).  The studio repo is never written to.
"""

import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# ── Repository roots ─────────────────────────────────────────────────

LANDING_ROOT = Path(__file__).resolve().parent.parent.parent
STUDIO_ROOT = Path("/Users/oriol/Projects/Bizmis/trujilloai-bizmis-studio")
STUDIO_VENV_PYTHON = STUDIO_ROOT / ".venv" / "bin" / "python"

# ── Filesystem layout ────────────────────────────────────────────────

LEADS_DIR = LANDING_ROOT / "public" / "invite-cards" / "leads"
CONVERTED_LOGOS_DIR = LEADS_DIR / "_converted-svgs"
TINTED_LOGOS_DIR = LEADS_DIR / "_tinted-logos"
SALES_AVATAR_FILENAME = "sales-avatar.png"
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
    "expression": "E",
    "resolution": 1024,
    "mobile": True,
    "widget_ui": True,
    "widget_state": "speaking",
    "show_wave": True,
    "show_card": False,
    "show_claim": False,
    "framing": "head",
    "lighting_preset": "studio",
    # Head-only: keep tilt at 0 — non-zero tilt causes strong perspective
    # foreshortening on the face (reads as "squashed" / deformed in a circle).
    "camera_tilt": 0,
    "shirt_stamp_scale": 1.0,
}

# Per-lead JSON (accent colours when primaryColor is #FFFFFF for the card UI).
LEAD_DATA_JSON_DIR = LANDING_ROOT / "src" / "data" / "leads"

# Fallback when no dark-enough hex is found (avoids studio default green ring).
_WIDGET_WAVE_FALLBACK_HEX = "#475569"

# Contrast thresholds — mirror leadEarlyAccessEmailHtml.ts exactly.
_MONTAGE_ACCENT_MIN_CONTRAST = 1.8
_CAPTION_MIN_CONTRAST = 2.4
_CAPTION_MAX_LIGHTNESS = 52.0
_CAPTION_MAX_SATURATION = 65.0


# ── Colour helpers ────────────────────────────────────────────────────


def _hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _relative_luminance(hex_color: str) -> float:
    try:
        r, g, b = (_c / 255.0 for _c in _hex_to_rgb(hex_color))
    except (ValueError, IndexError):
        return 1.0

    def linearize(c: float) -> float:
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)


def _contrast_ratio_on_white(hex_color: str) -> float:
    lum = _relative_luminance(hex_color)
    return (1.0 + 0.05) / (lum + 0.05)


def _hex_to_hsl(hex_color: str) -> tuple[float, float, float]:
    r, g, b = (_c / 255.0 for _c in _hex_to_rgb(hex_color))
    mx, mn = max(r, g, b), min(r, g, b)
    h = s = 0.0
    l_val = (mx + mn) / 2.0
    if mx != mn:
        d = mx - mn
        s = d / (2.0 - mx - mn) if l_val > 0.5 else d / (mx + mn)
        if mx == r:
            h = ((g - b) / d + (6.0 if g < b else 0.0)) / 6.0
        elif mx == g:
            h = ((b - r) / d + 2.0) / 6.0
        else:
            h = ((r - g) / d + 4.0) / 6.0
    return h * 360.0, s * 100.0, l_val * 100.0


def _hsl_to_hex(h: float, s: float, l_val: float) -> str:
    s_n = s / 100.0
    l_n = l_val / 100.0
    a = s_n * min(l_n, 1.0 - l_n)

    def _f(n: int) -> int:
        k = (n + h / 30.0) % 12
        return round(255 * max(0.0, min(1.0, l_n - a * max(min(k - 3, 9 - k, 1), -1))))

    return f"#{_f(0):02x}{_f(8):02x}{_f(4):02x}"


def _pick_montage_accent(primary_hex: str, text_color: str | None) -> str:
    if _contrast_ratio_on_white(primary_hex) >= _MONTAGE_ACCENT_MIN_CONTRAST:
        return primary_hex
    if (
        text_color
        and _contrast_ratio_on_white(text_color) >= _MONTAGE_ACCENT_MIN_CONTRAST
    ):
        return text_color
    return primary_hex


def _load_lead_json(lead_id: str) -> dict:
    try:
        raw = (LEAD_DATA_JSON_DIR / f"{lead_id}.json").read_text(encoding="utf-8")
        return json.loads(raw)
    except (OSError, json.JSONDecodeError) as exc:
        logger.warning("Could not read lead JSON (%s): %s", lead_id, exc)
        return {}


def resolve_raw_montage_accent_hex(lead: dict) -> str:
    """Pre-caption brand accent (primary vs textColor pick only).

    Used for Blender widget chrome (``button_color``): must stay the raw brand
    colour. Wave rings use ``resolve_widget_wave_color`` (contrast-corrected).
    """
    data = _load_lead_json(lead["id"])
    primary = lead.get("primary_color", "#FFFFFF")
    tc = data.get("textColor")
    text_color = tc if isinstance(tc, str) else None
    return _pick_montage_accent(primary, text_color)


def _apply_caption_correction(hex_color: str) -> str:
    if _contrast_ratio_on_white(hex_color) >= _CAPTION_MIN_CONTRAST:
        return hex_color
    h, s, l_val = _hex_to_hsl(hex_color)
    return _hsl_to_hex(
        h, min(s, _CAPTION_MAX_SATURATION), min(l_val, _CAPTION_MAX_LIGHTNESS)
    )


def resolve_widget_wave_color(lead: dict) -> str:
    """Hex for ``--wave-color`` only (audio ring / pulse): contrast-corrected.

    Matches ``deriveMontagePalette`` caption/wave path in TS (not the raw UI hex).
    Widget chrome uses ``resolve_raw_montage_accent_hex`` → ``button_color``.

    1. Pick accent: primaryColor (if enough contrast) → textColor → primaryColor.
    2. Apply caption correction: if still low contrast, clamp HSL lightness/saturation.
    3. Final fallback if result is still too light.
    """
    data = _load_lead_json(lead["id"])
    primary = lead.get("primary_color", "#FFFFFF")
    tc = data.get("textColor")
    text_color = tc if isinstance(tc, str) else None
    accent = _pick_montage_accent(primary, text_color)
    corrected = _apply_caption_correction(accent)

    if _relative_luminance(corrected) > 0.85:
        return _WIDGET_WAVE_FALLBACK_HEX
    return corrected


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
#
# Avatar accessories (applied silently when the avatar actually wears them):
# • hat_color           → hex applied to all Hat_Color* materials. Falls back
#                          to the raw brand accent used by the recommended
#                          product card (resolve_raw_montage_accent_hex).
# • glasses_color       → hex applied to all Glasses_Color* materials. Same
#                          fallback as hat_color.
# Set per-lead only when the brand accent is not the right pick for the
# accessory (otherwise leave unset — the fallback is correct).

LEAD_REGISTRY: list[dict] = [
    # Internal preview lead (grey shirt + white stamp; see mock-lead-invite-card.json).
    {
        "id": "mock-lead-invite-card",
        "primary_color": "#6B7280",
        "logo_color_overlay": None,
        "shirt_color": "#6B7280",
        "stamp_color_overlay": "#ffffff",
        "avatar_id": "kiran",
        "support_avatar_id": "mia",
        "stamp_scale": 2.0,
    },
    # ── Batch 1 ──
    {
        "id": "molekule",
        "primary_color": "#108849",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "kiran",
        "support_avatar_id": "mia",
        "stamp_scale": 1.85,
    },
    {
        "id": "glowforge",
        "primary_color": "#27B8CE",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "kiran",
        "support_avatar_id": "amber",
        "stamp_scale": 1.6,
    },
    {
        "id": "sennheiser",
        "primary_color": "#003746",
        "logo_color_overlay": None,
        "avatar_id": "echo",
        "support_avatar_id": "yue",
        "stamp_scale": 1.15,
    },
    {
        "id": "sodastream",
        "primary_color": "#00205B",
        "logo_color_overlay": None,
        "avatar_id": "adrian",
        "support_avatar_id": "mia",
        "stamp_scale": 1.85,
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
        "stamp_scale": 0.95,
    },
    {
        "id": "sixpenny",
        "primary_color": "#3C392D",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "amber",
        "support_avatar_id": "luca",
        "stamp_scale": 1.2,
    },
    {
        "id": "shapermint",
        "primary_color": "#F8A08E",
        "logo_color_overlay": None,
        "avatar_id": "yue",
        "support_avatar_id": "luca",
        "stamp_scale": 0.9,
    },
    {
        "id": "glossier",
        "primary_color": "#FEF116",
        "logo_color_overlay": None,
        "avatar_id": "mia",
        "support_avatar_id": "adrian",
        "stamp_scale": 1.7,
    },
    {
        "id": "theproscloset",
        "primary_color": "#B8F986",
        "logo_color_overlay": None,
        "avatar_id": "victor",
        "support_avatar_id": "amber",
        "stamp_scale": 1.6,
    },
    {
        "id": "nanoleaf",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "adrian",
        "support_avatar_id": "mia",
        "stamp_scale": 1.4,
    },
    {
        "id": "bluetti",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "shirt_color": "#00A2E4",
        "stamp_color_overlay": "#FFFFFF",
        "avatar_id": "kiran",
        "support_avatar_id": "yue",
        "stamp_scale": 1.7,
    },
    {
        "id": "jackery",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "teo",
        "support_avatar_id": "amber",
        "stamp_scale": 1.3,
    },
    {
        "id": "mactools",
        "primary_color": "#e31837",
        "logo_color_overlay": None,
        "avatar_id": "teo",
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
        "stamp_scale": 1.3,
    },
    {
        "id": "burrow",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "luca",
        "support_avatar_id": "mia",
        "stamp_scale": 1.35,
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
        "stamp_scale": 1.7,
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
        "stamp_scale": 1.0,
    },
    {
        "id": "positivegrid",
        "primary_color": "#E02020",
        "logo_color_overlay": "#ffffff",
        "avatar_id": "echo",
        "support_avatar_id": "mia",
        "stamp_scale": 1.15,
    },
    {
        "id": "thehomesecuritysuperstore",
        "primary_color": "#1a1a1a",
        "logo_color_overlay": None,
        "avatar_id": "will",
        "support_avatar_id": "yue",
        "stamp_scale": 1.2,
    },
    {
        "id": "pura",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "amber",
        "support_avatar_id": "yusuke",
        "stamp_scale": 1.3,
    },
    {
        "id": "speedengineering",
        "primary_color": "#000000",
        "logo_color_overlay": None,
        "avatar_id": "teo",
        "support_avatar_id": "amber",
        "stamp_scale": 1.2,
    },
    {
        "id": "gorjana",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "yue",
        "support_avatar_id": "luca",
        "stamp_scale": 1.1,
    },
    {
        "id": "crownandcaliber",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "yusuke",
        "support_avatar_id": "yue",
        "stamp_scale": 1.1,
    },
    {
        "id": "schoolhouse",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "avatar_id": "amber",
        "support_avatar_id": "will",
        "stamp_scale": 1.05,
    },
    # ── Batch 3 ──
    {
        "id": "upscale-audio",
        "primary_color": "#FFFFFF",
        "logo_color_overlay": None,
        "shirt_color": "#1a1a1a",
        "stamp_color_overlay": None,
        "avatar_id": "echo",
        "support_avatar_id": "amber",
    },
]

_LEAD_BY_ID: dict[str, dict] = {lead["id"]: lead for lead in LEAD_REGISTRY}


# Public:


def get_lead(lead_id: str) -> dict:
    """Return the registry entry for *lead_id*, or raise ``KeyError``."""
    return _LEAD_BY_ID[lead_id]


def lead_output_path(lead_id: str) -> Path:
    """Absolute path where the assisted-sales avatar PNG should be written."""
    return LEADS_DIR / lead_id / SALES_AVATAR_FILENAME


def support_lead_output_path(lead_id: str) -> Path:
    """Absolute path where the support avatar PNG should be written."""
    return LEADS_DIR / lead_id / SUPPORT_AVATAR_FILENAME
