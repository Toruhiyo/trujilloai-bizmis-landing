#!/usr/bin/env node
/**
 * Email mockup screenshot pipeline.
 *
 * Default output is a single `mockup.png` per lead, containing the rich
 * email's desktop and phone mockups composed together (phone overlapping
 * the desktop's top-right corner) on a transparent background. The
 * isolated desktop and phone mockups remain available behind `--only`
 * for debugging.
 *
 * The dev-only route `/email-renders/:leadId/mockup/:which` renders
 * each variant alone on a transparent body via the same
 * `buildSalesMockupSceneHtml` / `buildSupportMockupSceneHtml` helpers
 * that feed the rich email, so no per-lead manual work is needed.
 *
 * Requires the dev server to be running (usually `npm run dev`). Set
 * `BIZMIS_DEV_URL` if it listens on something other than
 * http://localhost:8080.
 *
 * Usage:
 *   node scripts/generate-email-compositions.mjs molekule
 *   node scripts/generate-email-compositions.mjs molekule jackery
 *   node scripts/generate-email-compositions.mjs --all
 *   node scripts/generate-email-compositions.mjs molekule --only desktop-mockup
 *   node scripts/generate-email-compositions.mjs molekule --only phone-mockup
 */

import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEV_URL = process.env.BIZMIS_DEV_URL ?? "http://localhost:8080";
const DEVICE_SCALE_FACTOR = 2;
/**
 * Soft warning threshold. Images don't count toward Gmail's 102KB HTML
 * clip limit; this only flags a PNG that may be unusually heavy for what
 * it shows.
 */
const MAX_PNG_BYTES = 250 * 1024;
const NAVIGATION_TIMEOUT_MS = 30_000;
const POST_LOAD_SETTLE_MS = 500;
const SELECTOR_TIMEOUT_MS = 10_000;

/**
 * Mockup variants accepted by the `/email-renders/:leadId/mockup/:which`
 * route. `which` maps to the route segment, `outputName` is the PNG
 * filename (without extension), and the viewport just needs to be
 * comfortably larger than the rendered frame (including the shadow-safe
 * padding that MockupRenderPage adds around the mockup).
 */
const MOCKUPS = {
  "mockup-combined": {
    which: "combined",
    outputName: "mockup",
    cssWidth: 880,
    cssHeight: 680,
  },
  "desktop-mockup": {
    which: "desktop",
    outputName: "desktop-mockup",
    cssWidth: 720,
    cssHeight: 520,
  },
  "phone-mockup": {
    which: "phone",
    outputName: "phone-mockup",
    cssWidth: 420,
    cssHeight: 640,
  },
};

const DEFAULT_COMPOSITION_IDS = ["mockup-combined"];

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
    throw new Error(
      "Provide one or more lead IDs, or --all. Example: node scripts/generate-email-compositions.mjs molekule",
    );
  }
  const valid = new Set(listAllLeadIds());
  for (const id of args.leadIds) {
    if (!valid.has(id)) throw new Error(`Unknown lead id: ${id}`);
  }
  return args.leadIds;
}

function resolveCompositionIds(args) {
  const validIds = Object.keys(MOCKUPS);
  if (args.only) {
    if (!validIds.includes(args.only)) {
      throw new Error(`Unknown composition: ${args.only}. Valid: ${validIds.join(", ")}`);
    }
    return [args.only];
  }
  return DEFAULT_COMPOSITION_IDS;
}

async function assertDevServerUp() {
  try {
    const res = await fetch(DEV_URL, { signal: AbortSignal.timeout(3_000) });
    if (!res.ok && res.status >= 500) throw new Error(`dev server returned ${res.status}`);
  } catch (err) {
    throw new Error(
      `Dev server not reachable at ${DEV_URL}. Start it with \`npm run dev\` first.\nUnderlying error: ${err.message}`,
    );
  }
}

async function optimizePng(inputBuffer) {
  const optimized = await sharp(inputBuffer)
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  return optimized.length < inputBuffer.length ? optimized : inputBuffer;
}

function outputPathFor(leadId, outputName) {
  const outDir = join(ROOT, "public/invite-cards/leads", leadId, "email");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  return join(outDir, `${outputName}.png`);
}

function logResult(compositionId, bytes, outPath) {
  const sizeKb = (bytes / 1024).toFixed(1);
  const warn = bytes > MAX_PNG_BYTES ? " [over soft budget]" : "";
  const relPath = outPath.replace(`${ROOT}/`, "");
  console.log(`  ${compositionId}: ${sizeKb} KB -> ${relPath}${warn}`);
}

async function captureMockup(browser, leadId, compositionId) {
  const { which, outputName, cssWidth, cssHeight } = MOCKUPS[compositionId];
  const context = await browser.newContext({
    viewport: { width: cssWidth, height: cssHeight },
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
  });
  const page = await context.newPage();
  const url = `${DEV_URL}/email-renders/${leadId}/mockup/${which}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: NAVIGATION_TIMEOUT_MS });

  const frame = page.locator(`[data-email-mockup-frame="${which}"]`).first();
  await frame.waitFor({ state: "visible", timeout: SELECTOR_TIMEOUT_MS });
  await page.waitForTimeout(POST_LOAD_SETTLE_MS);

  const rawPng = await frame.screenshot({ type: "png", omitBackground: true });
  await context.close();

  const optimized = await optimizePng(rawPng);
  const outPath = outputPathFor(leadId, outputName);
  writeFileSync(outPath, optimized);
  logResult(compositionId, optimized.length, outPath);
  return optimized.length;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const leadIds = resolveLeadIds(args);
  const compositionIds = resolveCompositionIds(args);

  await assertDevServerUp();
  console.log(`Using dev server at ${DEV_URL}`);
  console.log(`Rendering ${compositionIds.length} mockup(s) for ${leadIds.length} lead(s)...\n`);

  const browser = await chromium.launch();
  try {
    for (const leadId of leadIds) {
      console.log(`[${leadId}]`);
      for (const compositionId of compositionIds) {
        await captureMockup(browser, leadId, compositionId);
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
