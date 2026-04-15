/** Shopify App Store listing — single source for landing CTAs, emails, and lead tooling. */
export const BIZMIS_SHOPIFY_APP_LISTING_URL =
  "https://apps.shopify.com/bizmis" as const;

/** Opens the listing in a new tab (use from click handlers; `target=_blank` alone is unreliable in some embeds). */
export function openBizmisShopifyAppListing(): Window | null {
  return window.open(BIZMIS_SHOPIFY_APP_LISTING_URL, "_blank", "noopener,noreferrer");
}
