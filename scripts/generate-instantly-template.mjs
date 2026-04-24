#!/usr/bin/env node
/**
 * Generate email-templates/invite-card.instantly.html.
 *
 * Navigates a headless Chromium to the dev server's
 * /email-renders/instantly-html endpoint, which builds the canonical
 * Gmail-safe invite HTML against a synthetic lead whose fields carry
 * unique placeholder tokens. The browser page exposes the rendered HTML
 * on `window.__bizmisExportedSafeHtml`; we read it, swap each token for
 * the corresponding Instantly merge tag, and write the result to
 * `email-templates/invite-card.instantly.html`.
 *
 * Requires the dev server (npm run dev) to be running.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEV_URL = process.env.BIZMIS_DEV_URL ?? "http://localhost:8080";
const EXPORT_URL = `${DEV_URL}/email-renders/instantly-html`;
const OUTPUT_FILE = join(ROOT, "email-templates", "invite-card.instantly.html");
const NAVIGATION_TIMEOUT_MS = 30_000;
const WINDOW_KEY_WAIT_MS = 10_000;

/**
 * Token → merge tag map. Tokens are defined in
 * src/data/leads/instantlyTemplate.ts (INSTANTLY_TEMPLATE_TOKENS) and
 * embedded into the synthetic lead JSON. Order matters only insofar as
 * each token must be unique within the rendered HTML.
 *
 * {{firstName}} is expected to be pre-normalized in the Instantly CSV:
 * either the real first name, or `<brand> team` when no contact name is
 * known. The template always emits `Dear {{firstName}},` as a single
 * line — no template-side branching.
 */
const SUBSTITUTIONS = [
  { token: "X7ZFIRSTNAME", mergeTag: "{{firstName}}" },
  { token: "X7ZLEADBRAND", mergeTag: "{{lead_brand}}" },
  { token: "x7zleadhandle", mergeTag: "{{lead_handle}}" },
  { token: "X7ZACCESSCODE", mergeTag: "{{access_code}}" },
  { token: "#AB1234", mergeTag: "{{store_accent_color}}" },
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

async function fetchRenderedHtml() {
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
    const html = await page.waitForFunction(
      () => window.__bizmisExportedSafeHtml ?? null,
      { timeout: WINDOW_KEY_WAIT_MS },
    ).then((handle) => handle.jsonValue());
    if (typeof html !== "string" || html.length === 0) {
      throw new Error("Empty HTML exported from the render page.");
    }
    return html;
  } finally {
    await browser.close();
  }
}

function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applySubstitutions(html) {
  let out = html;
  const report = [];
  for (const { token, mergeTag } of SUBSTITUTIONS) {
    const re = new RegExp(escapeRegExp(token), "g");
    const matches = out.match(re);
    const count = matches ? matches.length : 0;
    if (count === 0) {
      throw new Error(
        `Token "${token}" not found in rendered HTML. Check INSTANTLY_TEMPLATE_LEAD and the safe-email builder.`,
      );
    }
    out = out.replace(re, mergeTag);
    report.push({ token, mergeTag, count });
  }
  return { html: out, report };
}

function assertNoLeakedTokens(html) {
  const suspects = ["X7Z", "x7zleadhandle"];
  for (const s of suspects) {
    if (html.includes(s)) {
      throw new Error(`Rendered template still contains placeholder fragment "${s}" after substitution.`);
    }
  }
}

async function main() {
  await assertDevServerUp();
  console.log(`Using dev server at ${DEV_URL}`);
  console.log(`Fetching rendered safe HTML from ${EXPORT_URL} ...`);
  const rawHtml = await fetchRenderedHtml();
  console.log(`Rendered HTML: ${rawHtml.length} chars`);

  const { html: templateHtml, report } = applySubstitutions(rawHtml);
  assertNoLeakedTokens(templateHtml);

  mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
  writeFileSync(OUTPUT_FILE, templateHtml, "utf8");

  console.log("\nSubstitutions applied:");
  for (const row of report) {
    console.log(`  ${row.token.padEnd(16)} -> ${row.mergeTag}  (x${row.count})`);
  }
  console.log(`\nWrote ${OUTPUT_FILE} (${Buffer.byteLength(templateHtml, "utf8")} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
