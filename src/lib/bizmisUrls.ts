/** Shopify App Store listing — single source for landing CTAs, emails, and lead tooling. */
export const BIZMIS_SHOPIFY_APP_LISTING_URL =
  "https://apps.shopify.com/bizmis" as const;

/** Founder-led early-access onboarding — primary CTA on invite cards. */
export const BIZMIS_BOOK_A_CALL_URL =
  "https://calendly.com/oriol-bizmis/bizmis-onboarding" as const;

/** General "book a call" scheduling page — lets landing visitors pick the right event type. */
export const BIZMIS_BOOK_A_CALL_GENERAL_URL =
  "https://calendly.com/oriol-bizmis" as const;

/** Dedicated call for merchants who want Bizmis on a custom (non-Shopify) website. */
export const BIZMIS_CUSTOM_INTEGRATION_CALL_URL =
  "https://calendly.com/oriol-bizmis/bizmis-custom-integration" as const;

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

/** Opens the demo storefront through the self-healing `/demo` redirect. */
export function openBizmisDemoStore(): Window | null {
  return window.open(BIZMIS_DEMO_STORE_URL, "_blank", "noopener,noreferrer");
}

/** Opens the custom-website integration scheduling page in a new tab. */
export function openBizmisCustomIntegrationCall(): Window | null {
  return window.open(
    BIZMIS_CUSTOM_INTEGRATION_CALL_URL,
    "_blank",
    "noopener,noreferrer"
  );
}
