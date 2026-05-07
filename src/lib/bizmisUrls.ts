/** Shopify App Store listing — single source for landing CTAs, emails, and lead tooling. */
export const BIZMIS_SHOPIFY_APP_LISTING_URL =
  "https://apps.shopify.com/bizmis" as const;

/** Demo storefront (Paper & Pine Books) — `?_bt` preserves storefront preview/session access. */
export const BIZMIS_DEMO_STORE_URL =
  "https://paper-and-pine-books.myshopify.com/?_bt=BAh7BkkiC19yYWlscwY6BkVUewhJIglkYXRhBjsAVEkiJ3BhcGVyLWFuZC1waW5lLWJvb2tzLm15c2hvcGlmeS5jb20GOwBGSSIIZXhwBjsAVEkiHTIwMjYtMDUtMDdUMTc6MTI6MjUuNDM0WgY7AFRJIghwdXIGOwBUSSIecGVybWFuZW50X3Bhc3N3b3JkX2J5cGFzcwY7AEY%3D--80808056a1a1351c22fd3ad6dd80534feecf5799" as const;

/** Opens the listing in a new tab (use from click handlers; `target=_blank` alone is unreliable in some embeds). */
export function openBizmisShopifyAppListing(): Window | null {
  return window.open(BIZMIS_SHOPIFY_APP_LISTING_URL, "_blank", "noopener,noreferrer");
}
