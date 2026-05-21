#!/usr/bin/env python3
"""Generate assisted-sales and support avatar images for all early-access invite leads.

Usage (studio venv):
    /Users/oriol/Projects/Bizmis/trujilloai-bizmis-studio/.venv/bin/python \\
        scripts/generate_early_access_avatars.py

Each lead gets two avatars placed in its invite-cards folder:
    public/invite-cards/leads/<id>/sales-avatar.png
    public/invite-cards/leads/<id>/support-avatar.png
"""

import logging

from early_access_avatars import generate_all, generate_all_support

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    generate_all()
    generate_all_support()
