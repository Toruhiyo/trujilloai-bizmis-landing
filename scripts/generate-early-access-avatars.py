"""Generate clerk-avatar images for all early-access invite leads.

Run with the studio venv:
    /Users/oriol/Projects/Bizmis/trujilloai-bizmis-studio/.venv/bin/python \
        scripts/generate-early-access-avatars.py

Each lead gets a clerk-avatar.png placed directly in its invite-cards folder:
    public/invite-cards/leads/<id>/clerk-avatar.png

The studio repo is only imported — never written to.
"""

import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from render_helpers import (  # noqa: E402
    AVATAR_RENDER_DEFAULTS,
    LEAD_REGISTRY,
    lead_output_path,
    prepare_lead_stamp,
    render_avatar,
)

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)

AVATAR = "yusuke"


def render_lead(lead: dict) -> Path:
    lead_id = lead["id"]
    primary_color = lead["primary_color"]

    stamp = prepare_lead_stamp(lead)
    out = lead_output_path(lead_id)

    params = {
        **AVATAR_RENDER_DEFAULTS,
        "shirt_stamp": str(stamp),
        "button_color": primary_color,
        "mesh_colors": {"Shirt_Color": primary_color},
    }

    render_avatar(AVATAR, str(out), **params)
    return out


def main():
    total = len(LEAD_REGISTRY)
    for i, lead in enumerate(LEAD_REGISTRY, 1):
        lead_id = lead["id"]
        logger.info("[%d/%d] Rendering %s …", i, total, lead_id)
        try:
            out = render_lead(lead)
            logger.info("[%d/%d] Done → %s", i, total, out)
        except Exception as e:
            logger.error("[%d/%d] FAILED %s — %s", i, total, lead_id, e)


if __name__ == "__main__":
    main()
