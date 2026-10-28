/**
 * The plans' list prices in USD a month, as the pricing page shows them
 * before the backend catalog loads (it overlays the same values). One source
 * for the page (components/Pricing.tsx) and the structured data that
 * describes it (seo/site.ts), so the two never disagree. Enterprise has no
 * list price: its pricing is custom (contact sales).
 */
export const PLAN_MONTHLY_PRICES = {
  starter: 79,
  growth: 199,
  scale: 499,
} as const;

export const PLAN_CURRENCY = "USD";

/** Sessions each paid plan includes a month (same fallback as the page). */
export const PLAN_INCLUDED_SESSIONS = {
  starter: 260,
  growth: 660,
  scale: 1650,
} as const;

/**
 * Price in USD of each session beyond the included ones, billed only up to
 * the spend cap the merchant sets. Bigger plans pay less per extra session
 * (same fallback as the page; the backend catalog overlays the live rates).
 */
export const PLAN_EXTRA_SESSION_RATES = {
  starter: 0.45,
  growth: 0.4,
  scale: 0.35,
} as const;

/**
 * How much cheaper an extra session is than on the base plan, in whole
 * percent (0 when it is not cheaper). 0.40 vs 0.45 -> 11.
 */
export const extraSessionSavingPercent = (rate: number, baseRate: number): number =>
  baseRate > 0 && rate < baseRate ? Math.round((1 - rate / baseRate) * 100) : 0;

/** Yearly billing is about this much off the monthly price (the pricing page's
 *  fallback when the backend catalog has no yearly price; the FAQs say "about
 *  20% off"). */
export const YEARLY_DISCOUNT_PERCENT = 20;
