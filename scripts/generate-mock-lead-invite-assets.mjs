#!/usr/bin/env node
/**
 * Refreshes public assets for `mock-lead-invite-card`:
 *  - logo.png: store wordmark on transparent (sharp from SVG).
 *  - Three retail-style product photos from Unsplash (direct CDN URLs;
 *    product still-life shots, not random Picsum landscapes).
 *
 * Unsplash content is used per https://unsplash.com/license (free use).
 *
 * Run: node scripts/generate-mock-lead-invite-assets.mjs
 * Then: node scripts/sync-lead-product-manifest.mjs
 * Then (studio venv): generate sales + support avatars for this lead only.
 * Then: node scripts/generate-email-compositions.mjs --all
 */

import { existsSync, readdirSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");
const MOCK_DIR = join(ROOT, "public", "invite-cards", "leads", "mock-lead-invite-card");

const LOGO_W = 160;
const LOGO_H = 72;
const PRODUCT_PX = 720;

/** Unsplash CDN: watch, headphones, espresso machine (product photography). */
const UNSPLASH_PRODUCT_SOURCES = [
  {
    slot: "a",
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
  },
  {
    slot: "b",
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    slot: "c",
    url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85",
  },
];

/** White glyphs so `logoColorOverlay` + CSS mask in email reads correctly on the banner. */
const MOCK_LOGO_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${LOGO_W}" height="${LOGO_H}" viewBox="0 0 ${LOGO_W} ${LOGO_H}" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
    font-family="ui-sans-serif,system-ui,Segoe UI,Helvetica,Arial,sans-serif"
    font-size="52" font-weight="800" fill="#ffffff" letter-spacing="-0.01em">Mock</text>
</svg>`;

async function writeMockLogo() {
  const out = join(MOCK_DIR, "logo.png");
  await sharp(Buffer.from(MOCK_LOGO_SVG)).png({ compressionLevel: 9 }).toFile(out);
  console.log(`Wrote ${out.replace(`${ROOT}/`, "")}`);
}

function removeOldProductFiles() {
  if (!existsSync(MOCK_DIR)) {
    throw new Error(`Missing mock lead dir: ${MOCK_DIR}`);
  }
  for (const ent of readdirSync(MOCK_DIR, { withFileTypes: true })) {
    if (!ent.isFile()) continue;
    const n = ent.name.toLowerCase();
    if (n.startsWith("product-a.") || n.startsWith("product-b.") || n.startsWith("product-c.")) {
      unlinkSync(join(MOCK_DIR, ent.name));
      console.log(`Removed ${ent.name}`);
    }
  }
}

async function fetchUnsplashWebp(url, outPath) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Image fetch failed ${res.status} ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .resize(PRODUCT_PX, PRODUCT_PX, { fit: "cover" })
    .webp({ quality: 88 })
    .toFile(outPath);
}

async function writeProductImages() {
  for (const { slot, url } of UNSPLASH_PRODUCT_SOURCES) {
    const outPath = join(MOCK_DIR, `product-${slot}.webp`);
    await fetchUnsplashWebp(url, outPath);
    console.log(`Wrote ${outPath.replace(`${ROOT}/`, "")}`);
  }
}

async function main() {
  await writeMockLogo();
  removeOldProductFiles();
  await writeProductImages();
  console.log("\nDone. Run: node scripts/sync-lead-product-manifest.mjs");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
