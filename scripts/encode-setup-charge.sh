#!/usr/bin/env bash
# Encodes the /v2 Setup agent's charge-up (scripts/setup-charge-anim.py frames) into
# public/landing/setup/: transparent video in two flavours, since no single format
# carries alpha everywhere: VP9 WebM (Chrome, Firefox, Edge) and HEVC with alpha in
# a .mov (Safari). Plus the poster (the first frame, the idle pose the clip starts
# and ends on) as WebP.
#
#   scripts/encode-setup-charge.sh <frames dir>
set -euo pipefail
cd "$(dirname "$0")/.."
FRAMES=${1:?frames dir}
OUT=public/landing/setup
mkdir -p "$OUT"

ffmpeg -loglevel error -y -framerate 24 -i "$FRAMES/f_%04d.png" \
  -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 32 -row-mt 1 -deadline good -an "$OUT/charge.webm"
ffmpeg -loglevel error -y -framerate 24 -i "$FRAMES/f_%04d.png" \
  -c:v hevc_videotoolbox -alpha_quality 0.8 -q:v 60 -tag:v hvc1 -pix_fmt bgra -an "$OUT/charge.mov"
node -e "require('sharp')(process.argv[1]).webp({ quality: 88 }).toFile(process.argv[2])" "$FRAMES/f_0000.png" "$OUT/charge-poster.webp"
ls -la "$OUT"
