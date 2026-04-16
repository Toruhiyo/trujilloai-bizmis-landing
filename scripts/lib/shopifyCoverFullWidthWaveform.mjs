/**
 * Shopify deck cover full-width waveform — same math as:
 * - `src/pages/slides/ShopifyDeck.tsx` (`ShopifyHeroContent` row: 200 bars, gap 2px, h-32, bg-white/30, mask gradient, per-bar opacity).
 * - `src/components/slides/slideWaveformHeights.ts` (SHOPIFY_COVER_* + shopifyCoverFullWidthWaveBarOpacity).
 *
 * If you change the cover, update this file and regenerate banner/montage PNGs that depend on it.
 */

/** @type {readonly number[]} Same as `WAVEFORM_HEIGHTS` / SHOPIFY_COVER_WAVEFORM_HEIGHTS. */
export const SHOPIFY_COVER_WAVEFORM_HEIGHTS = [
  65, 55, 45, 52, 38, 62, 78, 88, 68, 55, 72, 90, 75, 48, 58, 82, 65, 42, 55, 70,
  85, 92, 78, 62, 48, 65, 72, 58, 80, 68, 45, 52, 75, 88, 60, 42, 55, 70, 65, 48,
  58, 45, 50, 46, 42, 38, 44, 54, 50, 65, 78, 55, 42, 68, 85, 72, 58, 45, 62,
  38, 52, 70, 82, 60, 48, 55, 75, 90, 68, 42, 58, 80, 65, 45, 52, 72, 88, 55, 38,
  62, 48, 70, 85, 58, 42, 65, 78, 50, 35, 55, 68, 45, 60, 72, 52, 38, 82, 65, 48,
  28, 42, 58, 75, 62, 45, 55, 70, 80, 52, 38, 65, 48, 58, 42, 35, 28, 22, 18, 12,
];

export const SHOPIFY_COVER_FULL_WIDTH_BAR_COUNT = 200;

/** `gap-[2px]` between bars on the cover. */
export const SHOPIFY_COVER_FULL_WIDTH_GAP_PX = 2;

/** Cover row uses Tailwind `h-32` (8rem = 128px at default config). */
export const SHOPIFY_COVER_FULL_WIDTH_TRACK_H_PX = 128;

const EYEBROW_CENTER = 0.28;
const EYEBROW_FADE_HALF_WIDTH = 0.28;
const EYEBROW_MIN_OPACITY = 0.3;

/** Opacity vs horizontal position along the strip (0 → left, 1 → right), same as `waveBarOpacity` on the cover. */
export function shopifyCoverFullWidthWaveOpacityAtProgress(progress) {
  const dist = Math.abs(progress - EYEBROW_CENTER) / EYEBROW_FADE_HALF_WIDTH;
  if (dist >= 1) return 1;
  return EYEBROW_MIN_OPACITY + (1 - EYEBROW_MIN_OPACITY) * dist * dist;
}

/** Same as `waveBarOpacity` in ShopifyDeck and `shopifyCoverFullWidthWaveBarOpacity` in slideWaveformHeights (n = 200). */
export function shopifyCoverFullWidthWaveBarOpacity(barIndex) {
  const n = SHOPIFY_COVER_FULL_WIDTH_BAR_COUNT;
  const progress = n > 1 ? barIndex / (n - 1) : 0;
  return shopifyCoverFullWidthWaveOpacityAtProgress(progress);
}

/**
 * Horizontal mask from ShopifyDeck: `linear-gradient(to right, transparent 2%, black 10%, black 90%, transparent 98%)`.
 * Returns opacity multiplier in [0, 1] for a point at horizontal position `t` in [0, 1].
 */
export function shopifyCoverFullWidthWaveformMaskAt(t) {
  if (t <= 0.02) return 0;
  if (t < 0.1) return (t - 0.02) / (0.1 - 0.02);
  if (t <= 0.9) return 1;
  if (t < 0.98) return (0.98 - t) / (0.98 - 0.9);
  return 0;
}

/** `bg-white/18` — subtler than the slide's 0.3 for the email banner context. */
const BAR_FILL_BASE_ALPHA = 0.18;

/**
 * Renders the full-width cover waveform as an SVG string (transparent background).
 * Geometry: n bars, fixed gap, bar width = (widthPx - (n-1)*gap) / n (same as flex-1 on the cover row).
 *
 * On a narrow width (e.g. 560px email card), 200 bars + 2px gaps yield sub‑pixel bar widths; pass a smaller
 * `barCount` (~72–96) so bars stay readable while heights/opacity follow the same strip progress as the cover.
 *
 * @param {{ widthPx: number; trackHPx?: number; gapPx?: number; barCount?: number }} opts
 * @returns {string}
 */
export function buildShopifyCoverFullWidthWaveformSvg(opts) {
  const widthPx = opts.widthPx;
  const trackHPx = opts.trackHPx ?? SHOPIFY_COVER_FULL_WIDTH_TRACK_H_PX;
  const gapPx = opts.gapPx ?? SHOPIFY_COVER_FULL_WIDTH_GAP_PX;
  const heights = SHOPIFY_COVER_WAVEFORM_HEIGHTS;
  const n = opts.barCount ?? SHOPIFY_COVER_FULL_WIDTH_BAR_COUNT;
  const barW = (widthPx - (n - 1) * gapPx) / n;
  const coverN = SHOPIFY_COVER_FULL_WIDTH_BAR_COUNT;

  const rects = [];
  for (let i = 0; i < n; i++) {
    const progress = n > 1 ? i / (n - 1) : 0;
    const coverBarIndex = Math.round(progress * (coverN - 1));
    const hPct = heights[coverBarIndex % heights.length];
    const barH = Math.max(2, Math.round((hPct / 100) * trackHPx));
    const top = (trackHPx - barH) / 2;
    const x = i * (barW + gapPx);
    const op = shopifyCoverFullWidthWaveOpacityAtProgress(progress);
    const t = (x + barW / 2) / widthPx;
    const mask = shopifyCoverFullWidthWaveformMaskAt(t);
    const a = BAR_FILL_BASE_ALPHA * op * mask;
    const rx = Math.min(barW, barH) / 2;
    rects.push(
      `<rect x="${x}" y="${top}" width="${barW}" height="${barH}" rx="${rx}" ry="${rx}" fill="rgba(255,255,255,${a.toFixed(5)})"/>`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${widthPx}" height="${trackHPx}" viewBox="0 0 ${widthPx} ${trackHPx}">${rects.join("")}</svg>`;
}
