/**
 * Half-wave bars on benefit slides use the same height sequence and per-bar
 * opacity curve as the Shopify deck cover hero (`ShopifyDeck` waveform), scaled
 * to `HALF_WAVE_BAR_COUNT` bars — no separate smoothing/resampling pipeline.
 *
 * Full-width cover PNG for email: `scripts/lib/shopifyCoverFullWidthWaveform.mjs` (keep in sync).
 */

/** Same sequence as `WAVEFORM_HEIGHTS` in `src/pages/slides/ShopifyDeck.tsx`. */
export const SHOPIFY_COVER_WAVEFORM_HEIGHTS = [
  65, 55, 45, 52, 38, 62, 78, 88, 68, 55, 72, 90, 75, 48, 58, 82, 65, 42, 55, 70,
  85, 92, 78, 62, 48, 65, 72, 58, 80, 68, 45, 52, 75, 88, 60, 42, 55, 70, 65, 48,
  58, 45, 50, 46, 42, 38, 44, 54, 50, 65, 78, 55, 42, 68, 85, 72, 58, 45, 62,
  38, 52, 70, 82, 60, 48, 55, 75, 90, 68, 42, 58, 80, 65, 45, 52, 72, 88, 55, 38,
  62, 48, 70, 85, 58, 42, 65, 78, 50, 35, 55, 68, 45, 60, 72, 52, 38, 82, 65, 48,
  28, 42, 58, 75, 62, 45, 55, 70, 80, 52, 38, 65, 48, 58, 42, 35, 28, 22, 18, 12,
] as const;

export const HALF_WAVE_BAR_COUNT = 80;

const EYEBROW_CENTER = 0.28;
const EYEBROW_FADE_HALF_WIDTH = 0.28;
const EYEBROW_MIN_OPACITY = 0.3;

/** Same as `WAVEFORM_FULL_WIDTH_BAR_COUNT` in `src/pages/slides/ShopifyDeck.tsx`. */
export const SHOPIFY_COVER_FULL_WIDTH_BAR_COUNT = 200;

/**
 * Same as `waveBarOpacity` on the Shopify deck cover full-width waveform row
 * (`ShopifyHeroContent`).
 */
export function shopifyCoverFullWidthWaveBarOpacity(barIndex: number): number {
  const n = SHOPIFY_COVER_FULL_WIDTH_BAR_COUNT;
  const progress = n > 1 ? barIndex / (n - 1) : 0;
  const dist = Math.abs(progress - EYEBROW_CENTER) / EYEBROW_FADE_HALF_WIDTH;
  if (dist >= 1) return 1;
  return EYEBROW_MIN_OPACITY + (1 - EYEBROW_MIN_OPACITY) * dist * dist;
}

/** Bottom row starts mid-sequence so it differs from the top while staying on-cover. */
const BOTTOM_PHASE_OFFSET = 40;

export function halfWaveBarHeightPercent(
  barIndex: number,
  row: "top" | "bottom",
): number {
  const heights = SHOPIFY_COVER_WAVEFORM_HEIGHTS;
  const n = heights.length;
  const phase = row === "top" ? 0 : BOTTOM_PHASE_OFFSET;
  return heights[(barIndex + phase) % n];
}

/** Matches `waveBarOpacity` on the cover, with progress along `HALF_WAVE_BAR_COUNT` bars. */
export function halfWaveBarOpacity(barIndex: number): number {
  const barCount = HALF_WAVE_BAR_COUNT;
  const progress = barCount > 1 ? barIndex / (barCount - 1) : 0;
  const dist = Math.abs(progress - EYEBROW_CENTER) / EYEBROW_FADE_HALF_WIDTH;
  if (dist >= 1) return 1;
  return EYEBROW_MIN_OPACITY + (1 - EYEBROW_MIN_OPACITY) * dist * dist;
}
