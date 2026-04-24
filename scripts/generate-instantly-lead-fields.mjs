#!/usr/bin/env node
/**
 * Generate per-lead Instantly merge-field JSON files.
 *
 * Navigates a headless Chromium to the dev server's
 * /email-renders/instantly-lead-fields endpoint, which computes the
 * merge values for every real lead via the canonical TypeScript
 * projection (`buildInstantlyMergeFields` in
 * src/lib/leadEarlyAccessInstantlyExport.ts) and publishes the map on
 * `window.__bizmisInstantlyLeadFields`. We serialize one JSON file per
 * lead to `email-templates/leads/<leadId>.json`.
 *
 * Each file's shape matches the per-lead `{{...}}` merge tags in
 * email-templates/invite-card.instantly.html (lead_handle, lead_brand,
 * firstName, access_code, store_accent_color). Per-batch tags like
 * {{utm_campaign}} are intentionally not in these files.
 *
 * If the template's merge-tag set changes, update the TypeScript
 * `InstantlyMergeFields` type + projection; this script then emits the
 * new shape on the next run.
 *
 * Requires the dev server (npm run dev) to be running.
 */

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEV_URL = process.env.BIZMIS_DEV_URL ?? "http://localhost:8080";
const EXPORT_URL = `${DEV_URL}/email-renders/instantly-lead-fields`;
const OUTPUT_DIR = join(ROOT, "email-templates", "leads");
const NAVIGATION_TIMEOUT_MS = 30_000;
const WINDOW_KEY_WAIT_MS = 10_000;
const EXPECTED_FIELD_KEYS = [
  "lead_handle",
  "lead_brand",
  "firstName",
  "access_code",
  "store_accent_color",
];

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

async function fetchLeadFieldsPayload() {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on("pageerror", (err) => {
      console.error(`Browser page error: ${err.message}`);
    });
    await page.goto(EXPORT_URL, {
      waitUntil: "networkidle",
      timeout: NAVIGATION_TIMEOUT_MS,
    });
    const payload = await page.waitForFunction(
      () => window.__bizmisInstantlyLeadFields ?? null,
      { timeout: WINDOW_KEY_WAIT_MS },
    ).then((handle) => handle.jsonValue());
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("Empty or malformed lead-fields payload from export page.");
    }
    return payload;
  } finally {
    await browser.close();
  }
}

function assertShape(payload) {
  const leadIds = Object.keys(payload);
  if (leadIds.length === 0) {
    throw new Error("Lead-fields payload contains no leads.");
  }
  for (const leadId of leadIds) {
    const row = payload[leadId];
    if (!row || typeof row !== "object") {
      throw new Error(`Lead "${leadId}" has no merge fields.`);
    }
    const keys = Object.keys(row).sort();
    const expected = [...EXPECTED_FIELD_KEYS].sort();
    if (keys.length !== expected.length || keys.some((k, i) => k !== expected[i])) {
      throw new Error(
        `Lead "${leadId}" merge-field keys mismatch.\n  expected: ${expected.join(", ")}\n  got:      ${keys.join(", ")}\n`
        + `Update scripts/generate-instantly-lead-fields.mjs EXPECTED_FIELD_KEYS to match src/lib/leadEarlyAccessInstantlyExport.ts.`,
      );
    }
    for (const [key, value] of Object.entries(row)) {
      if (typeof value !== "string" || value.length === 0) {
        throw new Error(`Lead "${leadId}" field "${key}" is empty or non-string.`);
      }
    }
  }
}

function rewriteOutputDir(payload) {
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const leadIds = Object.keys(payload).sort();
  for (const leadId of leadIds) {
    const outFile = join(OUTPUT_DIR, `${leadId}.json`);
    writeFileSync(outFile, `${JSON.stringify(payload[leadId], null, 2)}\n`, "utf8");
  }
  return leadIds;
}

async function main() {
  await assertDevServerUp();
  console.log(`Using dev server at ${DEV_URL}`);
  console.log(`Fetching lead-fields payload from ${EXPORT_URL} ...`);
  const payload = await fetchLeadFieldsPayload();
  assertShape(payload);

  const leadIds = rewriteOutputDir(payload);
  console.log(`Wrote ${leadIds.length} lead files to ${OUTPUT_DIR}:`);
  for (const leadId of leadIds) {
    console.log(`  ${leadId}.json`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
