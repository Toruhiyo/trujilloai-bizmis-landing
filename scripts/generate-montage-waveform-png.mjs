/**
 * Renders the pilot-invite montage waveform as a flat PNG so the email HTML
 * stays small (avoids hundreds of nested table cells). Regenerate after changing
 * the bar pattern — keep in sync: 3px bars, 1px gap each side, track height below,
 * two cycles of the base pattern, horizontal edge fade via SVG mask.
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/** Taller track vs original 36px design */
const TRACK_H = 42;
/** 1px pad + bar + 1px pad */
const CELL_W = 5;
const BAR_W = 3;
const PAD_X = 1;
/** Heights were authored for a 36px track; scale into TRACK_H */
const HEIGHT_SOURCE_TRACK = 36;
/** Slightly stronger than 0.14 — rgba(249,163,83,~0.17) composited on #ffffff */
const BAR_FILL_HEX = "#FEEFE2";

const BASE_HEIGHTS_PX = [
  22, 14, 27, 18, 12, 25, 15, 29, 17, 14, 23, 28, 11, 20, 14, 26, 19, 9, 24, 16, 30, 15, 22, 13, 20, 31, 18, 25, 12, 17, 23, 14, 28, 19, 10, 26, 20, 15, 27, 16, 29, 14, 22, 12, 25, 18, 21, 17,
];

const HEIGHTS_PX = [...BASE_HEIGHTS_PX, ...BASE_HEIGHTS_PX];
const IMG_W = CELL_W * HEIGHTS_PX.length;

function scaledBarHeight(h) {
  const scaled = Math.round((h * TRACK_H) / HEIGHT_SOURCE_TRACK);
  return Math.min(Math.max(scaled, 2), TRACK_H);
}

const rects = HEIGHTS_PX.map((h, i) => {
  const barH = scaledBarHeight(h);
  const top = (TRACK_H - barH) / 2;
  const x = i * CELL_W + PAD_X;
  const rx = Math.min(2, BAR_W / 2);
  return `<rect x="${x}" y="${top}" width="${BAR_W}" height="${barH}" rx="${rx}" fill="${BAR_FILL_HEX}"/>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${IMG_W}" height="${TRACK_H}">
  <defs>
    <linearGradient id="waveEdgeFade" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="14%" stop-color="#ffffff"/>
      <stop offset="86%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
    <mask id="waveformFade" maskUnits="userSpaceOnUse" x="0" y="0" width="${IMG_W}" height="${TRACK_H}">
      <rect x="0" y="0" width="${IMG_W}" height="${TRACK_H}" fill="url(#waveEdgeFade)"/>
    </mask>
  </defs>
  <rect width="100%" height="100%" fill="#ffffff"/>
  <g mask="url(#waveformFade)">${rects}</g>
</svg>`;

const outPath = join(ROOT, "public/images/pilot-invite-montage-waveform.png");
const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9, effort: 10 }).toBuffer();
writeFileSync(outPath, png);
process.stdout.write(`Wrote ${outPath} (${png.length} bytes, ${IMG_W}×${TRACK_H})\n`);
