/**
 * Renders the early-access invite montage waveform as a flat PNG.
 * Heights are generated from overlapping sine waves for a smooth,
 * audio-like envelope. Regenerate after changing bar/layout constants.
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const TRACK_H = 82;
const BAR_COUNT = 64;
const CELL_W = 6;
const BAR_W = 3;
const PAD_X = 1;
const BAR_FILL_HEX = "#ffffff";
const MIN_BAR_H = 32;
const MAX_BAR_H = TRACK_H - 32;

function generateSinusoidalHeights(n) {
  const heights = [];
  const seed = 42;
  let rng = seed;
  function noise() {
    rng = (rng * 16807 + 0) % 2147483647;
    return (rng / 2147483647) * 2 - 1;
  }
  const FADE_BARS = 6;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const wave1 = Math.sin(t * Math.PI * 2 * 1.7 + 0.3) * 0.35;
    const wave2 = Math.sin(t * Math.PI * 2 * 3.1 + 1.2) * 0.22;
    const wave3 = Math.sin(t * Math.PI * 2 * 5.4 + 0.8) * 0.12;
    const raw = 0.45 + wave1 + wave2 + wave3 + noise() * 0.08;
    const fadeIn = Math.min(i / FADE_BARS, 1);
    const fadeOut = Math.min((n - 1 - i) / FADE_BARS, 1);
    const envelope = raw * fadeIn * fadeOut;
    const clamped = Math.max(0, Math.min(1, envelope));
    heights.push(Math.round(MIN_BAR_H + clamped * (MAX_BAR_H - MIN_BAR_H)));
  }
  return heights;
}

const HEIGHTS_PX = generateSinusoidalHeights(BAR_COUNT);
const IMG_W = CELL_W * BAR_COUNT;

const rects = HEIGHTS_PX.map((barH, i) => {
  const top = TRACK_H - barH;
  const x = i * CELL_W + PAD_X;
  const rx = Math.min(2, BAR_W / 2);
  return `<rect x="${x}" y="${top}" width="${BAR_W}" height="${barH}" rx="${rx}" fill="${BAR_FILL_HEX}"/>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${IMG_W}" height="${TRACK_H}">
  <g>${rects}</g>
</svg>`;

const outPath = join(ROOT, "public/images/early-access-montage-waveform.png");
const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9, effort: 10 }).toBuffer();
writeFileSync(outPath, png);
process.stdout.write(`Wrote ${outPath} (${png.length} bytes, ${IMG_W}×${TRACK_H})\n`);
