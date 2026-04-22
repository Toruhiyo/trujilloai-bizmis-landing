#!/usr/bin/env node
/**
 * Email composition screenshot pipeline.
 *
 * Renders each composition (hero-banner, desktop-mockup, phone-mockup,
 * plug-and-play) via the Vite dev server at `/email-renders/:leadId/:composition`
 * and saves a 2x-density PNG to
 * `public/invite-cards/leads/<leadId>/email/<composition>.png`.
 *
 * Requires the dev server to be running (usually `npm run dev`). Set
 * `BIZMIS_DEV_URL` if it listens on something other than http://localhost:8080.
 *
 * Usage:
 *   node scripts/generate-email-compositions.mjs molekule
 *   node scripts/generate-email-compositions.mjs molekule jackery
 *   node scripts/generate-email-compositions.mjs --all
 *   node scripts/generate-email-compositions.mjs molekule --only hero-banner
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEV_URL = process.env.BIZMIS_DEV_URL ?? "http://localhost:8080";
const DEVICE_SCALE_FACTOR = 2;
const MAX_PNG_BYTES = 80 * 1024;
const NAVIGATION_TIMEOUT_MS = 30_000;
const POST_LOAD_SETTLE_MS = 250;

const COMPOSITION_VIEWPORTS = {
  "hero-banner": { cssWidth: 560, cssHeight: 180 },
  "desktop-mockup": { cssWidth: 540, cssHeight: 360 },
  "phone-mockup": { cssWidth: 360, cssHeight: 480 },
  "plug-and-play": { cssWidth: 560, cssHeight: 400 },
};

function parseArgs(argv) {
  const args = { leadIds: [], all: false, only: null };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === "--all") {
      args.all = true;
    } else if (token === "--only") {
      args.only = argv[++i];
    } else if (!token.startsWith("--")) {
      args.leadIds.push(token);
    }
  }
  return args;
}

function listAllLeadIds() {
  const leadsDir = join(ROOT, "src/data/leads");
  return readdirSync(leadsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .sort();
}

function resolveLeadIds(args) {
  if (args.all) return listAllLeadIds();
  if (args.leadIds.length === 0) {
    throw new Error("Provide one or more lead IDs, or --all. Example: node scripts/generate-email-compositions.mjs molekule");
  }
  const valid = new Set(listAllLeadIds());
  for (const id of args.leadIds) {
    if (!valid.has(id)) throw new Error(`Unknown lead id: ${id}`);
  }
  return args.leadIds;
}

function resolveCompositionIds(args) {
  if (args.only) {
    if (!(args.only in COMPOSITION_VIEWPORTS)) {
      throw new Error(`Unknown composition: ${args.only}. Valid: ${Object.keys(COMPOSITION_VIEWPORTS).join(", ")}`);
    }
    return [args.only];
  }
  return Object.keys(COMPOSITION_VIEWPORTS);
}

async function assertDevServerUp() {
  try {
    const res = await fetch(DEV_URL, { signal: AbortSignal.timeout(3_000) });
    if (!res.ok && res.status >= 500) throw new Error(`dev server returned ${res.status}`);
  } catch (err) {
    throw new Error(`Dev server not reachable at ${DEV_URL}. Start it with \`npm run dev\` first.\nUnderlying error: ${err.message}`);
  }
}

async function optimizePng(inputBuffer) {
  const optimized = await sharp(inputBuffer).png({ compressionLevel: 9, palette: true }).toBuffer();
  return optimized.length < inputBuffer.length ? optimized : inputBuffer;
}

async function renderComposition(browser, leadId, compositionId) {
  const viewport = COMPOSITION_VIEWPORTS[compositionId];
  const context = await browser.newContext({
    viewport: { width: viewport.cssWidth, height: viewport.cssHeight },
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
  });
  const page = await context.newPage();
  const url = `${DEV_URL}/email-renders/${leadId}/${compositionId}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: NAVIGATION_TIMEOUT_MS });
  await page.waitForSelector(`[data-email-composition="${compositionId}"]`, { timeout: 10_000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(POST_LOAD_SETTLE_MS);

  const rawPng = await page.screenshot({
    type: "png",
    omitBackground: false,
    clip: { x: 0, y: 0, width: viewport.cssWidth, height: viewport.cssHeight },
  });
  await context.close();

  const optimized = await optimizePng(rawPng);
  const outDir = join(ROOT, "public/invite-cards/leads", leadId, "email");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `${compositionId}.png`);
  writeFileSync(outPath, optimized);

  const sizeKb = (optimized.length / 1024).toFixed(1);
  const warn = optimized.length > MAX_PNG_BYTES ? " [over 80KB budget]" : "";
  const relPath = outPath.replace(`${ROOT}/`, "");
  console.log(`  ${compositionId}: ${sizeKb} KB -> ${relPath}${warn}`);
  return optimized.length;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const leadIds = resolveLeadIds(args);
  const compositionIds = resolveCompositionIds(args);

  await assertDevServerUp();
  console.log(`Using dev server at ${DEV_URL}`);
  console.log(`Rendering ${compositionIds.length} composition(s) for ${leadIds.length} lead(s)...\n`);

  const browser = await chromium.launch();
  try {
    for (const leadId of leadIds) {
      console.log(`[${leadId}]`);
      for (const compositionId of compositionIds) {
        await renderComposition(browser, leadId, compositionId);
      }
    }
  } finally {
    await browser.close();
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
