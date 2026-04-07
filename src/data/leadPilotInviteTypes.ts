export type DemoProductCard = {
  title: string;
  price: string;
  tag: string;
};

export type LeadPilotInviteData = {
  id: string;
  storeName: string;
  storeDomain: string;
  /** Custom HTML or plain message; empty uses built-in pilot invite template */
  content: string;
  logoImagePath: string;
  /** Resolved public URL (extension chosen by sync-lead-product-manifest from disk) */
  productAImagePath: string;
  productBImagePath: string;
  productCImagePath: string;
  /** Hex, e.g. #1a2b3c */
  primaryColor: string;
  secondaryColor: string | null;
  /**
   * When set (hex), used for the highlighted store name in the card and email.
   * When null, falls back to primaryColor (e.g. set a dark hex when primary is too light for text).
   */
  textColor?: string | null;
  /**
   * When set (hex), the store header logo is recolored to this fill (CSS mask).
   * Use e.g. #ffffff when the asset matches the banner and would disappear.
   */
  logoColorOverlay?: string | null;
  /** One sentence explaining how Bizmis helps *this* store's shoppers. */
  pitchLine: string;
  /** Shopper voice prompt shown in storefront demo mockup. */
  demoShopperPrompt: string;
  /** Bizmis conversational reply in storefront demo mockup. */
  demoBizmisReply: string;
  /** Three product recommendations shown in storefront demo mockup. */
  demoProducts: [DemoProductCard, DemoProductCard, DemoProductCard];
  /** Optional explanatory footer line inside the storefront demo mockup. */
  demoFooterLine?: string;
  /** Unique per-store Shopify discount code for the pilot */
  couponCode: string;
  batch: number;
  wave: string;
  orderInBatch: number;
  country: string;
  vertical: string;
  subNiche: string;
};

export const PILOT_INVITE_TERMS = {
  pilotDays: 30,
  shopperCap: 500,
  storeCap: 25,
  shopifyAppUrl: "https://apps.shopify.com/bizmis",
} as const;

const HEX_OVERLAY = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

/** Resolved overlay color for masking, or null when unset / invalid. */
export function resolveLogoColorOverlay(lead: Pick<LeadPilotInviteData, "logoColorOverlay">): string | null {
  const v = lead.logoColorOverlay?.trim();
  if (!v) return null;
  return HEX_OVERLAY.test(v) ? v : null;
}

/** Color for highlighted store name; invalid textColor falls back to primaryColor. */
export function resolveStoreNameTextColor(
  lead: Pick<LeadPilotInviteData, "textColor" | "primaryColor">,
): string {
  const v = lead.textColor?.trim();
  if (v && HEX_OVERLAY.test(v)) return v;
  return lead.primaryColor;
}
