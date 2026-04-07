#!/usr/bin/env node
/**
 * Downloads logo + 3 product images per lead into public/invite-cards/leads/{id}/.
 * Normalizes to logo.png + product-{a,b,c}.jpg via sharp.
 *
 * Uses explicit overrides per store for reliability. Falls back to
 * Shopify products.json for product images on Shopify stores.
 *
 * Run: node scripts/fetch-lead-pilot-assets.mjs
 * Finishes by running sync-lead-product-manifest.mjs (extension-agnostic product URLs).
 */
import { execSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_LEADS = path.join(ROOT, "public", "invite-cards", "leads");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const MAX_LOGO_KB = 30;
const MAX_PRODUCT_KB = 40;

const gstatic = (domain) =>
  `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=256`;

/**
 * Each lead specifies:
 * - logoUrls: ordered list of candidate URLs for the logo (first success wins)
 * - logoSvg: optional filename in the lead folder (e.g. logo.svg) to rasterize to logo.png
 * - productUrls: explicit product image URLs (null = auto-detect via Shopify products.json)
 */
const leads = [
  {
    id: "molekule",
    domain: "molekule.com",
    logoUrls: [
      "https://molekule.com/cdn/shop/files/Molekule_Logo_DarkGray1200_1200x.png?v=1674229165",
      gstatic("molekule.com"),
    ],
    productUrls: null,
  },
  {
    id: "glowforge",
    domain: "glowforge.com",
    logoSvg: "logo.svg",
    logoUrls: [
      gstatic("glowforge.com"),
    ],
    productUrls: [
      "https://cdn.glowforge.com/dotcom/home_page_craft.png",
      "https://cdn.glowforge.com/dotcom/home_page_craft.png",
      "https://cdn.glowforge.com/dotcom/home_page_craft.png",
    ],
  },
  {
    id: "sennheiser",
    domain: "sennheiser.com",
    logoSvg: "logo.svg",
    logoUrls: [
      "https://www.sennheiser.com//og/SennheiserDefaultOg.jpg",
      gstatic("sennheiser.com"),
    ],
    productUrls: [
      "https://assets.sennheiser.com/assets/Mega_Menu_Headphones.png/Zz03MmNiYjEwYWU3ZDExMWYwOTdlYWVhNTViNWQyZmI4Ng==?width=400",
      "https://assets.sennheiser.com/assets/Mega_Menu_Microphones.png/Zz03N2UyMzJhZWU3ZDExMWYwYjk1OWNlM2Q3NWM0MGYwNw==?width=400",
      "https://assets.sennheiser.com/assets/Mega_Menu_Wireless_2.png/Zz03YzAxNmEzMGU3ZDExMWYwODhkYjc2OGVlOGU5N2FlYQ==?width=400",
    ],
  },
  {
    id: "sodastream",
    domain: "sodastream.com",
    logoUrls: [
      "https://sodastream.com/cdn/shop/files/LogoPreview_2_1.png?v=1764753179&width=400",
      gstatic("sodastream.com"),
    ],
    productUrls: null,
  },
  {
    id: "peakdesign",
    domain: "peakdesign.com",
    logoSvg: "logo.svg",
    logoUrls: [
      "https://cdn.shopify.com/oxygen-v2/32489/26104/54312/3270263/assets/favicon-FcJqlOB-.png",
      gstatic("peakdesign.com"),
    ],
    productUrls: null,
  },
  {
    id: "hodinkee",
    domain: "hodinkee.com",
    logoSvg: "logo.svg",
    logoUrls: [
      gstatic("hodinkee.com"),
    ],
    productUrls: [
      "https://hodinkee-production.s3.amazonaws.com/uploads/images/a4099a08-4a17-4bd7-a895-960d2930f0f8/TeaserArticleHeroImage.jpg",
      "https://hodinkee-production.s3.amazonaws.com/uploads/images/83d15edd-3309-4e72-93f4-2ef0ba204229/credorheader.jpg",
      "https://hodinkee-production.s3.amazonaws.com/uploads/images/574eca61-dee1-4bce-bf53-923d2dfaff9f/DSCF5999.jpg",
    ],
  },
  {
    id: "sixpenny",
    domain: "sixpenny.com",
    logoSvg: "logo.svg",
    logoUrls: [gstatic("sixpenny.com")],
    productUrls: null,
  },
  {
    id: "shapermint",
    domain: "shapermint.com",
    logoUrls: [
      "https://cdn.shapermint.com/assets/shapermint/images/shapermint_logo_black.svg",
      gstatic("shapermint.com"),
    ],
    productUrls: [
      "https://cdn.shapermint.com/assets/shapermint/images/header/shapewear/shapewear-cover.png",
      "https://cdn.shopify.com/s/files/1/0021/4889/2732/files/bodysuits-shapermint-essentials-smooth-waist-trainer-31794454167686.jpg?v=1762182081",
      "https://cdn.shopify.com/s/files/1/0021/4889/2732/products/leggings-black-s-shapermint-essentials-high-waisted-layering-leggings-30375376650374.jpg?v=1762182030",
    ],
  },
  {
    id: "glossier",
    domain: "glossier.com",
    logoUrls: [
      gstatic("glossier.com"),
    ],
    productUrls: null,
  },
  {
    id: "theproscloset",
    domain: "theproscloset.com",
    logoSvg: "logo.svg",
    logoUrls: [gstatic("theproscloset.com")],
    productUrls: null,
  },
];

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*;q=0.8" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function toLogoPng(buf, outPath) {
  let result = await sharp(buf)
    .resize(200, 200, { fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
  if (result.byteLength > MAX_LOGO_KB * 1024) {
    result = await sharp(buf)
      .resize(140, 140, { fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9, effort: 10 })
      .toBuffer();
  }
  await writeFile(outPath, result);
  console.log(`    logo size: ${(result.byteLength / 1024).toFixed(1)}KB`);
}

async function toProductJpeg(buf, outPath) {
  let q = 72;
  let result = await sharp(buf)
    .resize(200, 200, { fit: "cover", position: "center" })
    .jpeg({ quality: q, mozjpeg: true })
    .toBuffer();
  while (result.byteLength > MAX_PRODUCT_KB * 1024 && q > 40) {
    q -= 10;
    result = await sharp(buf)
      .resize(200, 200, { fit: "cover", position: "center" })
      .jpeg({ quality: q, mozjpeg: true })
      .toBuffer();
  }
  await writeFile(outPath, result);
  console.log(`    product size: ${(result.byteLength / 1024).toFixed(1)}KB`);
}

async function fetchShopifyProducts(domain) {
  const urls = [];
  try {
    const pjUrl = `https://${domain}/products.json?limit=8`;
    const pr = await fetch(pjUrl, { headers: { "User-Agent": UA } });
    if (pr.ok) {
      const data = await pr.json();
      for (const p of data.products || []) {
        const src = p?.images?.[0]?.src;
        if (src && !urls.includes(src)) urls.push(src);
        if (urls.length >= 3) break;
      }
    }
  } catch {
    /* not Shopify or blocked */
  }
  return urls.length >= 3 ? urls.slice(0, 3) : null;
}

async function main() {
  for (const lead of leads) {
    const { id, domain, logoUrls, logoSvg, productUrls: manualProducts } = lead;
    const dir = path.join(PUBLIC_LEADS, id);
    await mkdir(dir, { recursive: true });

    console.log(`\n${id} (${domain})`);

    // --- Logo ---
    let logoOk = false;
    if (logoSvg) {
      try {
        const svgBuf = await readFile(path.join(dir, logoSvg));
        await toLogoPng(svgBuf, path.join(dir, "logo.png"));
        console.log(`  logo: ${logoSvg} (rasterized)`);
        logoOk = true;
      } catch (e) {
        console.warn("  logoSvg skip:", logoSvg, e.message);
      }
    }
    for (const url of logoUrls) {
      if (logoOk) break;
      try {
        const buf = await fetchBuffer(url);
        await toLogoPng(buf, path.join(dir, "logo.png"));
        console.log("  logo:", url.slice(0, 80));
        logoOk = true;
        break;
      } catch (e) {
        console.warn("  logo skip:", url.slice(0, 60), e.message);
      }
    }
    if (!logoOk) console.warn("  NO LOGO SAVED");

    // --- Products ---
    let productSources = manualProducts;
    if (!productSources) {
      const shopify = await fetchShopifyProducts(domain);
      if (shopify) {
        productSources = shopify;
      } else {
        console.warn("  no Shopify products found, using gstatic fallback");
        productSources = [gstatic(domain), gstatic(domain), gstatic(domain)];
      }
    }

    const labels = ["a", "b", "c"];
    for (let i = 0; i < 3; i++) {
      const url = productSources[i];
      if (!url) {
        console.warn(`  missing product-${labels[i]}`);
        continue;
      }
      const out = path.join(dir, `product-${labels[i]}.jpg`);
      try {
        const buf = await fetchBuffer(url);
        await toProductJpeg(buf, out);
        console.log(`  product-${labels[i]}: ok`);
      } catch (e) {
        console.warn(`  product-${labels[i]}: FAILED`, e.message);
      }
    }
  }

  console.log("\nDone.");
  try {
    execSync("node scripts/sync-lead-product-manifest.mjs", {
      cwd: ROOT,
      stdio: "inherit",
    });
  } catch (e) {
    console.warn("sync-lead-product-manifest failed:", e?.message ?? e);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
