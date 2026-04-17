/**
 * Full-width Shopify cover waveform as PNG for the early-access email banner.
 * Uses `buildShopifyCoverFullWidthWaveformSvg` — same bar math as the slides cover.
 *
 *   node scripts/generate-email-banner-waveform-png.mjs
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { buildShopifyCoverFullWidthWaveformSvg, SHOPIFY_COVER_FULL_WIDTH_TRACK_H_PX } from "./lib/shopifyCoverFullWidthWaveform.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/** Card inner width — match email wrapper table width. */
const EMAIL_BANNER_WAVEFORM_W_PX = 560;
/**
 * Fewer bars than the cover (200) so each bar stays ~4–6px wide at 560px; 200×2px gaps would be sub‑pixel hairlines.
 * Shape still follows the cover via progress sampling in `buildShopifyCoverFullWidthWaveformSvg`.
 */
const EMAIL_BANNER_WAVEFORM_BAR_COUNT = 88;

const OUT_FILE = "public/images/early-access-email-banner-waveform.png";

/** Pixel-density multiplier for the final PNG (source 560×128 → 3× = 1680×384). */
const DENSITY = 3;

async function renderBaseWaveformPng() {
  const svg = buildShopifyCoverFullWidthWaveformSvg({
    widthPx: EMAIL_BANNER_WAVEFORM_W_PX,
    trackHPx: SHOPIFY_COVER_FULL_WIDTH_TRACK_H_PX,
    barCount: EMAIL_BANNER_WAVEFORM_BAR_COUNT,
  });
  return sharp(Buffer.from(svg), { density: 72 * DENSITY })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
}

async function main() {
  const pngBuffer = await renderBaseWaveformPng();
  const outPath = join(ROOT, OUT_FILE);
  writeFileSync(outPath, pngBuffer);
  const outMeta = await sharp(pngBuffer).metadata();
  process.stdout.write(
    `[email-banner-waveform] Wrote ${outPath} (${pngBuffer.length} bytes, ${outMeta.width}×${outMeta.height})\n`,
  );
}

await main();
