#!/usr/bin/env node
/**
 * Renders the social preview images (Open Graph / Twitter, 1200x630) for the
 * main pages in all 5 locales into public/og/<page>-<locale>.png, from the
 * pages' own titles in src/i18n/messages and the 3D avatar renders in
 * public/landing/agents. src/seo/site.ts points og:image at these files.
 *
 *   node scripts/seo/render-og-images.mjs            # all
 *   node scripts/seo/render-og-images.mjs home es    # one page, one locale
 *
 * Run it again after changing a page's title or the brand look; the build
 * doesn't (it needs Chrome).
 */
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { chromium } from "playwright";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(root, "public/og");
const [onlyPage, onlyLocale] = process.argv.slice(2);

const vite = await createServer({
  root,
  configFile: false,
  logLevel: "error",
  appType: "custom",
  server: { middlewareMode: true, hmr: false, ws: false },
  resolve: { alias: { "@": path.join(root, "src") } },
  optimizeDeps: { noDiscovery: true, include: [] },
});
const { getMessages } = await vite.ssrLoadModule("/src/i18n/messages/index.ts");
const { LOCALES } = await vite.ssrLoadModule("/src/i18n/locales.ts");
const { EARLY_ACCESS_STORE_CAP } = await vite.ssrLoadModule("/src/data/leads/_schema.ts");
await vite.close();

const dataUri = async (file, mime) =>
  `data:${mime};base64,${(await readFile(path.join(root, file))).toString("base64")}`;

const logo = await dataUri("public/images/bizmis-logo-full-orange-transparent.svg", "image/svg+xml");
const agents = {
  amber: await dataUri("public/landing/agents/greet-amber-1080.webp", "image/webp"),
  will: await dataUri("public/landing/agents/setup-will-1080.webp", "image/webp"),
  yusuke: await dataUri("public/landing/agents/support-yusuke-1080.webp", "image/webp"),
};

/** Each page: its avatar, its headline (the page's h1) and a line under it. */
const PAGES = {
  home: (m) => ({
    agent: "amber",
    title: `${m.hero.titleLine1} ${m.hero.titleLine2}`,
    lineParts: m.landing.heroLine,
  }),
  pricing: (m) => ({ agent: "will", title: m.pricing.title, line: m.pricing.lead }),
  faqs: (m) => ({ agent: "yusuke", title: m.faqsPage.title, line: m.faqsPage.lead }),
  "early-access": (m) => ({
    agent: "will",
    title: `${m.earlyAccessPage.titleLine1} ${m.earlyAccessPage.titleLine2}`,
    line: m.earlyAccessPage.badge(EARLY_ACCESS_STORE_CAP),
  }),
  contact: (m) => ({ agent: "yusuke", title: m.contact.title, line: m.contact.lead }),
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const html = ({ agent, title, line, lineParts }, lang) => `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;800&display=swap" />
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    font-family: Inter, system-ui, sans-serif; color: #3b2416;
    background: radial-gradient(120% 140% at 0% 0%, #ffffff 0%, #fffaf3 55%, #fff1e2 100%);
    position: relative;
  }
  .disc {
    position: absolute; right: -160px; top: 40px; width: 640px; height: 640px; border-radius: 50%;
    background: radial-gradient(circle at 40% 35%, #fcc48c 0%, #f9a353 60%, #f7963d 100%);
  }
  .ring { position: absolute; right: -220px; top: -20px; width: 760px; height: 760px; border-radius: 50%;
    border: 2px solid rgb(249 163 83 / 0.28); }
  .agent { position: absolute; right: -10px; bottom: -6px; height: 540px; filter: drop-shadow(0 18px 30px rgb(59 36 22 / 0.22)); }
  .copy { position: absolute; left: 72px; top: 64px; width: 560px; height: 502px; display: flex; flex-direction: column; }
  .logo { height: 54px; width: auto; align-self: flex-start; }
  .text { margin-top: auto; margin-bottom: auto; }
  h1 { font-weight: 800; font-size: ${title.length > 34 ? 52 : 64}px; line-height: 1.04; letter-spacing: -0.03em; text-wrap: balance; }
  p { margin-top: 22px; font-weight: 500; font-size: 25px; line-height: 1.34; color: rgb(59 36 22 / 0.78); text-wrap: balance; }
  p .win { color: #3b2416; font-weight: 800; box-shadow: inset 0 -0.38em 0 #f9a353; }
  .url { font-weight: 600; font-size: 22px; color: rgb(59 36 22 / 0.7); display: flex; align-items: center; gap: 10px; }
  .url::before { content: ""; width: 10px; height: 10px; border-radius: 50%; background: #f9a353; }
</style></head>
<body>
  <div class="ring"></div><div class="disc"></div>
  <img class="agent" src="${agents[agent]}" alt="" />
  <div class="copy">
    <img class="logo" src="${logo}" alt="Bizmis" />
    <div class="text">
      <h1>${esc(title)}</h1>
      <p>${
        lineParts
          ? lineParts
              .map((part, i) => (i === lineParts.length - 1 ? `<span class="win">${esc(part)}</span>` : esc(part)))
              .join(" ")
          : esc(line)
      }</p>
    </div>
    <div class="url">bizmis.ai</div>
  </div>
</body></html>`;

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const [key, build] of Object.entries(PAGES)) {
  if (onlyPage && onlyPage !== key) continue;
  for (const locale of LOCALES) {
    if (onlyLocale && onlyLocale !== locale) continue;
    await page.setContent(html(build(getMessages(locale)), locale), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot({ type: "png" });
    const file = path.join(outDir, `${key}-${locale}.png`);
    await sharp(png).png({ compressionLevel: 9, palette: true, quality: 92, effort: 10 }).toFile(file);
    console.log("wrote", path.relative(root, file));
  }
}
await browser.close();
