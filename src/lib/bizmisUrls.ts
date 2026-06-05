/** Shopify App Store listing — single source for landing CTAs, emails, and lead tooling. */
export const BIZMIS_SHOPIFY_APP_LISTING_URL =
  "https://apps.shopify.com/bizmis" as const;

/** Founder-led early-access onboarding — primary CTA on invite cards. */
export const BIZMIS_BOOK_A_CALL_URL =
  "https://calendly.com/oriol-bizmis/bizmis-onboarding" as const;

/**
 * Demo storefront entry point. Routes through our `/demo` serverless redirect, which mints a
 * fresh App Store password-bypass token per request (Shopify's `_bt` tokens are short-lived, so
 * a hardcoded one rots). Falls back to the app listing if the bypass can't be resolved.
 */
export const BIZMIS_DEMO_STORE_URL = "/demo" as const;

/** Opens the listing in a new tab (use from click handlers; `target=_blank` alone is unreliable in some embeds). */
export function openBizmisShopifyAppListing(): Window | null {
  return window.open(BIZMIS_SHOPIFY_APP_LISTING_URL, "_blank", "noopener,noreferrer");
}
