/**
 * The plans' list prices in USD a month, as the pricing page shows them
 * before the backend catalog loads (it overlays the same values). One source
 * for the page (components/Pricing.tsx) and the structured data that
 * describes it (seo/site.ts), so the two never disagree.
 */
export const PLAN_MONTHLY_PRICES = {
  starter: 79,
  growth: 199,
  scale: 499,
} as const;

/** Enterprise starts here; the final price is custom (contact sales). */
export const ENTERPRISE_FROM_MONTHLY_PRICE = 1500;

export const PLAN_CURRENCY = "USD";

/** Sessions each paid plan includes a month (same fallback as the page). */
export const PLAN_INCLUDED_SESSIONS = {
  starter: 260,
  growth: 660,
  scale: 1650,
} as const;
