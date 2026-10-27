#!/usr/bin/env bash
# Encodes the /v2 Setup agent's charge-up (scripts/setup-charge-anim.py frames,
# f_0000.png .. f_0091.png, 720x1200, transparent) into public/landing/setup/:
#
# - charge/00.webp .. charge/91.webp: the clip as an image sequence, which
#   SetupSection scrubs from the section's scroll clock, forwards and backwards.
#   Seeking a video per frame stalls (one keyframe: every seek decodes from the
#   start, 40 to 100 ms in Chrome, and Safari's HEVC with alpha is worse), while a
#   decoded image draws on a canvas at once, the same in every browser. Each frame
#   is cropped to the box the figure moves in over the whole clip (CROP, the same
#   numbers as SetupSection's CHARGE.crop) and scaled to 70% (still sharp at the
#   agent's largest size on a 2x screen).
# - charge-poster.webp: the first frame, full size (the idle pose the clip starts
#   and ends on), shown until the frames are in.
#
#   scripts/encode-setup-charge.sh <frames dir>
set -euo pipefail
cd "$(dirname "$0")/.."
FRAMES=${1:?frames dir}
OUT=public/landing/setup
mkdir -p "$OUT/charge"

node - "$FRAMES" "$OUT" <<'JS'
const fs = require("fs");
const sharp = require("sharp");
const [frames, out] = process.argv.slice(2);
// left, top, width, height in the 720x1200 frame: the union of the figure over every frame
const CROP = { left: 104, top: 126, width: 504, height: 984 };
const SCALE = 0.7;
(async () => {
  const files = fs.readdirSync(frames).filter((f) => /^f_\d+\.png$/.test(f)).sort();
  let total = 0;
  for (const [i, f] of files.entries()) {
    const buf = await sharp(`${frames}/${f}`)
      .extract(CROP)
      .resize(Math.round(CROP.width * SCALE), Math.round(CROP.height * SCALE))
      .webp({ quality: 70, alphaQuality: 60, effort: 6 })
      .toBuffer();
    fs.writeFileSync(`${out}/charge/${String(i).padStart(2, "0")}.webp`, buf);
    total += buf.length;
  }
  await sharp(`${frames}/${files[0]}`).webp({ quality: 88 }).toFile(`${out}/charge-poster.webp`);
  console.log(`${files.length} frames, ${(total / 1024).toFixed(0)} KB`);
})();
JS
ls -la "$OUT"
