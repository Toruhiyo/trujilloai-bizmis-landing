#!/usr/bin/env python3
"""Generate clerk-avatar images for all early-access invite leads.

Usage (studio venv):
    /Users/oriol/Projects/Bizmis/trujilloai-bizmis-studio/.venv/bin/python \\
        scripts/generate_early_access_avatars.py

Each lead gets a clerk-avatar.png placed in its invite-cards folder:
    public/invite-cards/leads/<id>/clerk-avatar.png
"""

import logging

from early_access_avatars import generate_all

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    generate_all()
