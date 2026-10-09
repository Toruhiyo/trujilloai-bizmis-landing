#!/usr/bin/env bash
# Encodes the hero loop (BIZ-423) from the captured frames into public/hero/:
# two rungs per layout, MP4 (H.264, faststart) and WebM (VP9), 24 fps, no audio,
# plus the still (frame 0) that the page shows first.
#
#   node scripts/capture-hero-loop.mjs wide && node scripts/capture-hero-loop.mjs tall
#   scripts/encode-hero-loop.sh
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/hero
mkdir -p "$OUT"

enc() { # name height width frames-dir
  local name=$1 h=$2 w=$3 dir=$4
  local vf="scale=${w}:${h}:flags=lanczos,format=yuv420p"
  ffmpeg -loglevel error -y -framerate 24 -i "$dir/f_%04d.png" -vf "$vf" \
    -c:v libx264 -preset slow -crf 22 -profile:v high -movflags +faststart -an "$OUT/loop-${name}-${h}.mp4"
  ffmpeg -loglevel error -y -framerate 24 -i "$dir/f_%04d.png" -vf "$vf" \
    -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 -deadline good -an "$OUT/loop-${name}-${h}.webm"
}

enc wide 1080 1920 tmp/hero-loop/wide
enc wide 720 1280 tmp/hero-loop/wide
enc tall 1920 960 tmp/hero-loop/tall
enc tall 1280 640 tmp/hero-loop/tall
ffmpeg -loglevel error -y -i tmp/hero-loop/wide/f_0000.png -q:v 4 "$OUT/loop-wide-poster.jpg"
ffmpeg -loglevel error -y -i tmp/hero-loop/tall/f_0000.png -q:v 4 "$OUT/loop-tall-poster.jpg"
ls -la "$OUT"
