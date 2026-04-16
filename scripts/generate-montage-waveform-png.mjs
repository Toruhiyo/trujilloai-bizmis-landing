/**
 * Renders the early-access invite montage waveforms as flat PNGs.
 * Heights are generated from overlapping sine waves for a smooth,
 * audio-like envelope. Regenerate after changing bar/layout constants.
 *
 * Generates one PNG per preset defined in PRESETS.
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/** Edge taper: the first and last EDGE_TAPER_BARS bars scale down to EDGE_TAPER_MIN of minBarH. */
const EDGE_TAPER_BARS = 2;
const EDGE_TAPER_MIN = 0.35;

/** @typedef {{ trackH: number; barCount: number; cellW: number; barW: number; padX: number; minBarH: number; maxBarH: number; fadeBars: number; outFile: string }} WaveformPreset */

/** @type {Record<string, WaveformPreset>} */
const PRESETS = {
  desktop: {
    trackH: 82,
    barCount: 64,
    cellW: 6,
    barW: 5,
    padX: 0.5,
    minBarH: 32,
    maxBarH: 82 - 32,
    fadeBars: 6,
    outFile: "public/images/early-access-montage-waveform.png",
  },
  phone: {
    trackH: 74,
    barCount: 32,
    cellW: 6,
    barW: 5,
    padX: 0.5,
    minBarH: 38,
    maxBarH: 58,
    fadeBars: 5,
    outFile: "public/images/early-access-montage-waveform-phone.png",
  },
};

const BAR_FILL_HEX = "#ffffff";

function generateSinusoidalHeights(n, fadeBars) {
  const heights = [];
  const seed = 42;
  let rng = seed;
  function noise() {
    rng = (rng * 16807 + 0) % 2147483647;
    return (rng / 2147483647) * 2 - 1;
  }
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const wave1 = Math.sin(t * Math.PI * 2 * 1.7 + 0.3) * 0.35;
    const wave2 = Math.sin(t * Math.PI * 2 * 3.1 + 1.2) * 0.22;
    const wave3 = Math.sin(t * Math.PI * 2 * 5.4 + 0.8) * 0.12;
    const raw = 0.45 + wave1 + wave2 + wave3 + noise() * 0.08;
    const fadeIn = Math.min(i / fadeBars, 1);
    const fadeOut = Math.min((n - 1 - i) / fadeBars, 1);
    const envelope = raw * fadeIn * fadeOut;
    const clamped = Math.max(0, Math.min(1, envelope));
    heights.push(clamped);
  }
  return heights;
}

async function renderPreset(name, preset) {
  const { trackH, barCount, cellW, barW, padX, minBarH, maxBarH, fadeBars, outFile } = preset;
  const normalized = generateSinusoidalHeights(barCount, fadeBars);
  const imgW = cellW * barCount;

  const rects = normalized
    .map((n, i) => {
      const baseH = minBarH + n * (maxBarH - minBarH);
      const edgeIn = Math.min(i, barCount - 1 - i);
      const edgeScale = edgeIn >= EDGE_TAPER_BARS ? 1 : EDGE_TAPER_MIN + (1 - EDGE_TAPER_MIN) * (edgeIn / EDGE_TAPER_BARS);
      const barH = Math.round(baseH * edgeScale);
      const top = trackH - barH;
      const x = i * cellW + padX;
      const rx = barW / 2;
      return `<rect x="${x}" y="${top}" width="${barW}" height="${barH}" rx="${rx}" ry="${rx}" fill="${BAR_FILL_HEX}"/>`;
    })
    .join("");

  const density = 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imgW}" height="${trackH}" viewBox="0 0 ${imgW} ${trackH}"><g shape-rendering="crispEdges">${rects}</g></svg>`;

  const outPath = join(ROOT, outFile);
  const png = await sharp(Buffer.from(svg), { density: 72 * density })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
  writeFileSync(outPath, png);
  const meta = await sharp(png).metadata();
  process.stdout.write(`[${name}] Wrote ${outPath} (${png.length} bytes, ${meta.width}×${meta.height})\n`);
}

for (const [name, preset] of Object.entries(PRESETS)) {
  await renderPreset(name, preset);
}
