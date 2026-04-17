/**
 * Full-width Shopify cover waveform as PNG for the early-access email banner.
 * Uses `buildShopifyCoverFullWidthWaveformSvg` — same bar math as the slides cover.
 *
 * A thick "X" mark is punched out of the centre of the rendered waveform using
 * sharp's Porter-Duff `dest-out` composite. Rendering the hole into the PNG
 * itself (instead of applying a CSS mask at runtime) keeps the erased-from-the-
 * wave effect consistent across every email client — including the ones that
 * strip or ignore `mask-composite`.
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

/** Side length of the X punch in SOURCE pixels (waveform is 560×128 before 2× density). Tuned so the crossed strokes read clearly without dominating the bar field. */
const X_PUNCH_SIDE_SOURCE_PX = 84;
/** Stroke thickness of the X punch in SOURCE pixels — chunky enough to read as a deliberate mark rather than a scratch. */
const X_PUNCH_STROKE_SOURCE_PX = 18;
/** Horizontal centre offset of the X punch, in SOURCE pixels. 280 = dead centre of the 560-wide waveform. */
const X_PUNCH_CX_SOURCE_PX = Math.round(EMAIL_BANNER_WAVEFORM_W_PX / 2);

const OUT_FILE = "public/images/early-access-email-banner-waveform.png";

const DENSITY = 2;

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

function buildXPunchSvg(sideSourcePx, strokeSourcePx) {
  const halfInset = strokeSourcePx / 2;
  const a = halfInset;
  const b = sideSourcePx - halfInset;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${sideSourcePx}" height="${sideSourcePx}" viewBox="0 0 ${sideSourcePx} ${sideSourcePx}">
  <g stroke="#000" stroke-width="${strokeSourcePx}" stroke-linecap="round">
    <line x1="${a}" y1="${a}" x2="${b}" y2="${b}" />
    <line x1="${b}" y1="${a}" x2="${a}" y2="${b}" />
  </g>
</svg>`;
}

async function buildXPunchEraserBuffer(canvasWidthPx, canvasHeightPx) {
  const scale = canvasWidthPx / EMAIL_BANNER_WAVEFORM_W_PX;
  const sidePx = Math.round(X_PUNCH_SIDE_SOURCE_PX * scale);
  const strokePx = Math.round(X_PUNCH_STROKE_SOURCE_PX * scale);
  const xSvg = buildXPunchSvg(sidePx, strokePx);
  const xPng = await sharp(Buffer.from(xSvg)).png().toBuffer();
  const cxPx = Math.round(X_PUNCH_CX_SOURCE_PX * scale);
  const leftPx = Math.round(cxPx - sidePx / 2);
  const topPx = Math.round(canvasHeightPx / 2 - sidePx / 2);
  return sharp({
    create: {
      width: canvasWidthPx,
      height: canvasHeightPx,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: xPng, left: leftPx, top: topPx }])
    .png()
    .toBuffer();
}

async function main() {
  const basePng = await renderBaseWaveformPng();
  const baseMeta = await sharp(basePng).metadata();
  const eraserPng = await buildXPunchEraserBuffer(baseMeta.width, baseMeta.height);
  const punchedPng = await sharp(basePng)
    .composite([{ input: eraserPng, blend: "dest-out" }])
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
  const outPath = join(ROOT, OUT_FILE);
  writeFileSync(outPath, punchedPng);
  const outMeta = await sharp(punchedPng).metadata();
  process.stdout.write(
    `[email-banner-waveform] Wrote ${outPath} (${punchedPng.length} bytes, ${outMeta.width}×${outMeta.height}, X punch ${X_PUNCH_SIDE_SOURCE_PX}px/${X_PUNCH_STROKE_SOURCE_PX}px@source cx=${X_PUNCH_CX_SOURCE_PX})\n`,
  );
}

await main();
