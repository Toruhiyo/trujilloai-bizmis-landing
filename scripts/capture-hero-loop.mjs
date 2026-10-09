// Records the hero loop's frames (BIZ-423): scripts/hero-scene/scene.html draws
// frame f on the studio stage (the avatar frames from scripts/hero-avatar-anim.py,
// plus the widget moments); this screenshots every frame for encode-hero-loop.sh.
//
//   node scripts/capture-hero-loop.mjs wide   # 1920×1080 → tmp/hero-loop/wide/
//   node scripts/capture-hero-loop.mjs tall   # 1080×2160 → tmp/hero-loop/tall/
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const layout = process.argv[2] || "wide";
const [W, H] = layout === "wide" ? [1920, 1080] : [1080, 2160];
const frames = pathToFileURL(resolve(ROOT, "tmp/hero-anim/frames2")).href;
const out = resolve(ROOT, "tmp/hero-loop", layout);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on("pageerror", (e) => console.error("page error:", e.message));
const scene = pathToFileURL(resolve(ROOT, "scripts/hero-scene/scene.html")).href;
await page.goto(`${scene}?layout=${layout}&frames=${encodeURIComponent(frames)}`);
const n = await page.evaluate(() => window.N);
for (let f = 0; f < n; f++) {
  await page.evaluate((f) => window.renderFrame(f), f);
  await page.screenshot({ path: `${out}/f_${String(f).padStart(4, "0")}.png`, clip: { x: 0, y: 0, width: W, height: H } });
  if (f % 52 === 0) console.log(`${layout}: frame ${f}/${n}`);
}
await browser.close();
console.log(`${layout}: ${n} frames in ${out}`);
