/**
 * Full-bleed granular noise PNG for the early-access email header banner.
 *
 * Matches the invite card max width (560px) at native resolution so
 * `background-size: 100% 100%` does not visibly stretch a small tile.
 * Semi-transparent luminance noise, tuned for overlay on the lead→Bizmis
 * gradient.
 *
 *   node scripts/generate-email-banner-noise-png.mjs
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/** Pixels — must match typical banner row aspect (card width 560). */
const BANNER_NOISE_W = 560;
const BANNER_NOISE_H = 120;

const OUT_FILE = "public/images/early-access-banner-noise-grain.png";

/** Deterministic PRNG (same family as waveform script). */
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function fillBannerNoiseRgba(buf, w, h, seed) {
  const rnd = makeRng(seed);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const n0 = rnd();
      const n1 = rnd();
      const n2 = rnd();
      const blend = n0 * 0.5 + n1 * 0.35 + n2 * 0.15;
      const lum = Math.floor(188 + blend * 67);
      const a = Math.floor(5 + rnd() * 22);
      buf[i] = lum;
      buf[i + 1] = lum;
      buf[i + 2] = lum;
      buf[i + 3] = a;
    }
  }
}

const raw = Buffer.alloc(BANNER_NOISE_W * BANNER_NOISE_H * 4);
fillBannerNoiseRgba(raw, BANNER_NOISE_W, BANNER_NOISE_H, 0x62d3f7c1);

const outPath = join(ROOT, OUT_FILE);
const png = await sharp(raw, {
  raw: { width: BANNER_NOISE_W, height: BANNER_NOISE_H, channels: 4 },
})
  .blur(0.55)
  .png({ compressionLevel: 9, effort: 10 })
  .toBuffer();

writeFileSync(outPath, png);
process.stdout.write(
  `[banner-noise] Wrote ${outPath} (${png.length} bytes, ${BANNER_NOISE_W}×${BANNER_NOISE_H})\n`,
);
