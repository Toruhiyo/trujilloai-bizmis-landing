#!/usr/bin/env node
/**
 * Renders the full Bizmis brand mark (avatar + "bizmis" wordmark) as two
 * transparent PNGs:
 *
 *   - public/images/bizmis-logo-full-white-transparent.png   (white silhouette)
 *   - public/images/bizmis-logo-full-orange-transparent.png  (brand primary)
 *
 * The white version is the canonical mask: the landing uses it via CSS
 * `mask-image` + `background-color` to tint the logo to whatever colour the
 * surrounding context needs (white on the hero, primary on light surfaces…).
 *
 * Both files share the exact same alpha channel: the orange variant is the
 * white render flat-tinted to brand primary via sharp, so swapping between
 * them is pixel-aligned.
 *
 * Run:  node scripts/generate-bizmis-logo-full.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const IMAGES_DIR = join(ROOT, "public", "images");

const SOURCE_AVATAR_WHITE = join(IMAGES_DIR, "bizmis-logo-white-transparent.png");
const OUT_WHITE = join(IMAGES_DIR, "bizmis-logo-full-white-transparent.png");
const OUT_ORANGE = join(IMAGES_DIR, "bizmis-logo-full-orange-transparent.png");

// Source render dimensions (high-res; downscales cleanly to Navbar/Footer sizes).
const AVATAR_PX = 320;
const WORDMARK_FONT_PX = Math.round(AVATAR_PX * 0.62);
const GAP_PX = Math.round(AVATAR_PX * 0.18);
const VIEWPORT_W = AVATAR_PX * 6;
const VIEWPORT_H = AVATAR_PX * 2;

// Brand primary, matches `--primary: 29 93% 65%` in src/index.css.
const PRIMARY_HSL = { h: 29, s: 93, l: 65 };

function buildHostHtml(avatarDataUri) {
  return `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: transparent; }
    body { display: flex; align-items: flex-start; justify-content: flex-start; }
    #logo {
      display: inline-flex;
      align-items: center;
      gap: ${GAP_PX}px;
      padding: 0;
      color: #ffffff;
    }
    #logo img {
      height: ${AVATAR_PX}px;
      width: auto;
      display: block;
    }
    #logo span {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      font-weight: 800;
      letter-spacing: -0.02em;
      font-size: ${WORDMARK_FONT_PX}px;
      line-height: 1;
      color: inherit;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div id="logo">
    <img src="${avatarDataUri}" alt="">
    <span>bizmis</span>
  </div>
</body></html>`;
}

async function renderWhiteFullLogo() {
  const avatarBase64 = readFileSync(SOURCE_AVATAR_WHITE).toString("base64");
  const avatarDataUri = `data:image/png;base64,${avatarBase64}`;
  const html = buildHostHtml(avatarDataUri);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: VIEWPORT_W, height: VIEWPORT_H },
      deviceScaleFactor: 2,
    });
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const handle = await page.locator("#logo");
    const buffer = await handle.screenshot({ omitBackground: true, type: "png" });
    writeFileSync(OUT_WHITE, buffer);
    console.log(`Wrote ${OUT_WHITE} (${buffer.length} bytes)`);
  } finally {
    await browser.close();
  }
}

function hslToRgb({ h, s, l }) {
  const sN = s / 100;
  const lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;
  if (hp < 1) [r1, g1, b1] = [c, x, 0];
  else if (hp < 2) [r1, g1, b1] = [x, c, 0];
  else if (hp < 3) [r1, g1, b1] = [0, c, x];
  else if (hp < 4) [r1, g1, b1] = [0, x, c];
  else if (hp < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  const m = lN - c / 2;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

async function renderOrangeFromWhite() {
  const { r, g, b } = hslToRgb(PRIMARY_HSL);
  const { data, info } = await sharp(OUT_WHITE)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = data[i + 3];
  }

  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(OUT_ORANGE);

  console.log(`Wrote ${OUT_ORANGE}  (rgb ${r},${g},${b})`);
}

await renderWhiteFullLogo();
await renderOrangeFromWhite();
