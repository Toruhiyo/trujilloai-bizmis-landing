#!/usr/bin/env node
/**
 * Export the Shopify App Store listing slides (/admin/slides/shopify) as 1600×900 PNGs.
 *
 * The deck is the source of the listing screenshots; this replaces the per-slide
 * "Download PNG" button so a retake is one command:
 *
 *   npx vite --port 8093 &                       # any dev or preview server
 *   node scripts/export-shopify-listing-slides.mjs http://localhost:8093 out/
 *
 * The admin area's password gate is client-side (sessionStorage), so the script
 * sets the flag the gate reads instead of typing the password. Local servers only.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const SLIDE_WIDTH = 1600;
const SLIDE_HEIGHT = 900;
const FILENAME_PREFIX = "bizmis-shopify";
const ADMIN_SESSION_KEY = "bizmis_admin_authenticated";

const [baseUrl = "http://localhost:8093", outDir = "out/shopify-listing"] = process.argv.slice(2);

if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(baseUrl.replace(/\/$/, ""))) {
  console.error(`Refusing ${baseUrl}: export from a local server only.`);
  process.exit(1);
}

const slugify = (label) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

mkdirSync(outDir, { recursive: true });

// PLAYWRIGHT_CHANNEL=chrome uses the installed Chrome when Playwright's own browser is not downloaded.
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
const page = await browser.newPage({
  viewport: { width: 1800, height: 1100 },
  deviceScaleFactor: 1,
});
await page.addInitScript((key) => sessionStorage.setItem(key, "true"), ADMIN_SESSION_KEY);
await page.goto(`${baseUrl.replace(/\/$/, "")}/admin/slides/shopify`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

const slides = page.locator(`div.w-\\[${SLIDE_WIDTH}px\\].h-\\[${SLIDE_HEIGHT}px\\]`);
const labels = page.locator("span.font-mono");
const count = await slides.count();
if (count === 0) throw new Error("No slides found on /admin/slides/shopify");

for (let i = 0; i < count; i++) {
  const slide = slides.nth(i);
  await slide.scrollIntoViewIfNeeded();
  await slide.evaluate((el) =>
    Promise.all([...el.querySelectorAll("img")].map((img) => img.decode().catch(() => {}))),
  );
  const raw = (await labels.nth(i).textContent()) ?? `slide-${i + 1}`;
  const label = raw.split("—").slice(1).join("—").trim() || raw;
  const file = join(outDir, `${FILENAME_PREFIX}-${i + 1}-${slugify(label)}-${SLIDE_WIDTH}w.png`);
  await slide.screenshot({ path: file });
  console.log(file);
}

await browser.close();
