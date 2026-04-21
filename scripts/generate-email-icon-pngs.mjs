/**
 * Rasterize every small decorative icon used in the early-access invite email
 * as a transparent black PNG, so the email can render them via
 * `<img>` + mask-image + background-color instead of inline <svg> tags.
 *
 * Gmail strips inline <svg> silently; this moves every icon onto a path that
 * renders everywhere the existing benefit-card icons already render.
 *
 *   node scripts/generate-email-icon-pngs.mjs
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const OUT_DIR_REL = "public/images";
const SOURCE_VIEWBOX_PX = 24;
const RENDER_SIZE_PX = 64;
const ICON_STROKE_COLOR = "#000000";
const ICON_FILL_COLOR = "#000000";

const STROKE_COMMON_ATTRS =
  `fill="none" stroke="${ICON_STROKE_COLOR}" stroke-linecap="round" stroke-linejoin="round"`;

function svgWrap(inner, { viewBox = `0 0 ${SOURCE_VIEWBOX_PX} ${SOURCE_VIEWBOX_PX}` } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${RENDER_SIZE_PX}" height="${RENDER_SIZE_PX}" viewBox="${viewBox}">${inner}</svg>`;
}

function strokeIcon(paths, strokeWidth = 2) {
  return svgWrap(`<g ${STROKE_COMMON_ATTRS} stroke-width="${strokeWidth}">${paths}</g>`);
}

function fillIcon(paths, viewBox) {
  return svgWrap(`<g fill="${ICON_FILL_COLOR}">${paths}</g>`, viewBox ? { viewBox } : undefined);
}

const ICON_SPECS = [
  {
    file: "early-access-icon-sync-website.png",
    svg: strokeIcon(
      `<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/>` +
        `<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`,
      1.5,
    ),
  },
  {
    file: "early-access-icon-sync-catalog.png",
    svg: fillIcon(
      `<path d="M0 252.118V48C0 21.49 21.49 0 48 0h204.118a48 48 0 0 1 33.941 14.059l211.882 211.882c18.745 18.745 18.745 49.137 0 67.882L293.823 497.941c-18.745 18.745-49.137 18.745-67.882 0L14.059 286.059A48 48 0 0 1 0 252.118zM112 64c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48z"/>`,
      "0 0 512 512",
    ),
  },
  {
    file: "early-access-icon-sync-discounts.png",
    svg: strokeIcon(
      `<line x1="19" y1="5" x2="5" y2="19"/>` +
        `<circle cx="6.5" cy="6.5" r="2.5"/>` +
        `<circle cx="17.5" cy="17.5" r="2.5"/>`,
      1.5,
    ),
  },
  {
    file: "early-access-icon-sync-customers.png",
    svg: strokeIcon(
      `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>` +
        `<circle cx="9" cy="7" r="4"/>` +
        `<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>` +
        `<path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
      1.5,
    ),
  },
  {
    file: "early-access-icon-sync-orders.png",
    svg: fillIcon(
      `<path d="M50.7 58.5L0 160H208V32H93.7C75.5 32 58.9 42.3 50.7 58.5zM240 160H448L397.3 58.5C389.1 42.3 372.5 32 354.3 32H240V160zm208 32H0V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192z"/>`,
      "0 0 448 512",
    ),
  },
  {
    file: "early-access-icon-insights-play.png",
    svg: svgWrap(
      `<g ${STROKE_COMMON_ATTRS} stroke-width="2">` +
        `<circle cx="12" cy="12" r="10"/>` +
        `<polygon points="10 8 16 12 10 16" fill="${ICON_FILL_COLOR}" stroke="none"/>` +
        `</g>`,
    ),
  },
  {
    file: "early-access-icon-insights-tag.png",
    svg: strokeIcon(
      `<path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>` +
        `<line x1="7" y1="7" x2="7.01" y2="7"/>`,
    ),
  },
  {
    file: "early-access-icon-insights-funnel.png",
    svg: strokeIcon(`<polygon points="22 3 2 3 10 12 10 19 14 21 14 12 22 3"/>`),
  },
  {
    file: "early-access-icon-support-bolt.png",
    svg: strokeIcon(`<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>`),
  },
  {
    file: "early-access-icon-support-shield.png",
    svg: strokeIcon(`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`),
  },
  {
    file: "early-access-icon-support-heart.png",
    svg: strokeIcon(
      `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
    ),
  },
  {
    file: "early-access-icon-policy-filecheck.png",
    svg: strokeIcon(
      `<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/>` +
        `<path d="M14 2v5a1 1 0 0 0 1 1h5"/>` +
        `<path d="m9 15 2 2 4-4"/>`,
      3,
    ),
  },
];

async function renderIcon(spec) {
  const buffer = await sharp(Buffer.from(spec.svg), {
    density: 384,
  })
    .resize(RENDER_SIZE_PX, RENDER_SIZE_PX, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  const outPath = join(ROOT, OUT_DIR_REL, spec.file);
  writeFileSync(outPath, buffer);
  console.log(`  wrote ${OUT_DIR_REL}/${spec.file} (${buffer.length} bytes)`);
}

for (const spec of ICON_SPECS) {
  await renderIcon(spec);
}

console.log(`Done. Rendered ${ICON_SPECS.length} icons at ${RENDER_SIZE_PX}x${RENDER_SIZE_PX}.`);
