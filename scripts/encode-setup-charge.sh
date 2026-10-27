#!/usr/bin/env bash
# Encodes the /v2 Setup agent (scripts/setup-charge-anim.py frames, f_0000.png ..
# f_0143.png, 800x1200, transparent) into public/landing/setup/:
#
# - charge-idle/00.webp .. 47.webp: the open stance, filling up with each breath, a
#   seamless 2 s loop that SetupSection plays in real time whenever the burst isn't
#   playing;
# - charge-burst/00.webp .. 95.webp: the happy burst (4 s), which it scrubs
#   from the section's scroll clock, forwards and backwards. Seeking a video per
#   frame stalls (one keyframe: every seek decodes from the start, 40 to 100 ms in
#   Chrome, and Safari's HEVC with alpha is worse), while a decoded image draws on
#   a canvas at once, the same in every browser.
# - charge-stance.webp: the first frame, the page's 720x1200 (the stance the loop
#   and the burst start on), shown until the frames are in.
#
# The page places the agent on a 720x1200 grid (his box); the frames are rendered
# wider (the same camera, so the same scale), centred on it, so the cheer's and the
# gather's hands have room. Each frame is cropped to the box the figure moves in over
# every frame (computed here and printed, in the grid's pixels, so it may overhang
# it: SetupSection's CHARGE.crop must be the same numbers) and scaled to 65% (still
# sharp at the agent's largest size on a 2x screen), within the 2.5 MB budget.
#
#   scripts/encode-setup-charge.sh <frames dir>
set -euo pipefail
cd "$(dirname "$0")/.."
FRAMES=${1:?frames dir}
OUT=public/landing/setup
mkdir -p "$OUT/charge-idle" "$OUT/charge-burst"

node - "$FRAMES" "$OUT" <<'JS'
const fs = require("fs");
const sharp = require("sharp");
const [frames, out] = process.argv.slice(2);
const LOOP = 48;
const SCALE = 0.65;
const PAD = 6;
const GRID = 720; // the page's grid (CHARGE.w), centred on the frames
(async () => {
  const files = fs.readdirSync(frames).filter((f) => /^f_\d+\.png$/.test(f)).sort();
  if (files.length !== 144) throw new Error(`expected 144 frames, found ${files.length}`);
  // the union of the figure (alpha > 8) over every frame, padded, on even pixels
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, W = 0, H = 0;
  for (const f of files) {
    const { data, info } = await sharp(`${frames}/${f}`).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
    W = info.width;
    H = info.height;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++)
        if (data[y * W + x] > 8) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
  }
  const left = Math.max(0, (x0 - PAD) & ~1);
  const top = Math.max(0, (y0 - PAD) & ~1);
  const crop = {
    left,
    top,
    width: Math.min(W, (x1 + PAD + 2) & ~1) - left,
    height: Math.min(H, (y1 + PAD + 2) & ~1) - top,
  };
  if (left === 0 || crop.left + crop.width === W || top === 0) throw new Error(`the figure touches the frame's edge: ${JSON.stringify(crop)}`);
  const shift = (W - GRID) / 2;
  let total = 0;
  for (const [i, f] of files.entries()) {
    const buf = await sharp(`${frames}/${f}`)
      .extract(crop)
      .resize(Math.round(crop.width * SCALE), Math.round(crop.height * SCALE))
      .webp({ quality: 56, alphaQuality: 45, effort: 6 })
      .toBuffer();
    const dest = i < LOOP ? `charge-idle/${String(i).padStart(2, "0")}` : `charge-burst/${String(i - LOOP).padStart(2, "0")}`;
    fs.writeFileSync(`${out}/${dest}.webp`, buf);
    total += buf.length;
  }
  await sharp(`${frames}/${files[0]}`)
    .extract({ left: shift, top: 0, width: GRID, height: H })
    .webp({ quality: 88 })
    .toFile(`${out}/charge-stance.webp`);
  console.log(`${files.length} frames, ${(total / 1024).toFixed(0)} KB`);
  console.log(`crop (SetupSection's CHARGE.crop): ${JSON.stringify({ ...crop, left: crop.left - shift })}`);
})();
JS
ls -la "$OUT"
