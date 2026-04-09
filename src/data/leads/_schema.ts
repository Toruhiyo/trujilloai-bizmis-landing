export type DemoProductCard = {
  title: string;
  price: string;
  tag: string;
};

/**
 * Per-lead JSON data stored in `src/data/leads/<id>.json`.
 *
 * Fields that can be derived from convention (logo path, avatar path,
 * product image paths) are NOT stored here — they are added by the
 * aggregating loader in `src/data/leads/index.ts`.
 */
export type LeadEarlyAccessJson = {
  id: string;
  storeName: string;
  storeDomain: string;
  leadContactName: string | null;
  leadContactLastName: string | null;
  content: string;
  primaryColor: string;
  secondaryColor: string | null;
  textColor?: string | null;
  logoColorOverlay?: string | null;
  leadLogoScale?: number;
  pitchLine: string;
  demoShopperPrompt: string;
  demoBizmisReply: string;
  demoProducts: [DemoProductCard, DemoProductCard, DemoProductCard];
  demoFooterLine?: string;
  montageClerkCue?: string | null;
  country: string;
  vertical: string;
  subNiche: string;
};

/**
 * Full lead data with derived paths (produced by the loader).
 * This is the type consumed by the email builder, admin pages, etc.
 */
export type LeadEarlyAccessData = LeadEarlyAccessJson & {
  couponCode: string;
  orderInBatch: number;
  logoImagePath: string;
  clerkAvatarImagePath: string;
  productAImagePath: string;
  productBImagePath: string;
  productCImagePath: string;
};

export const EARLY_ACCESS_TERMS = {
  trialDays: 30,
  shopperCap: 500,
  storeCap: 25,
  shopifyAppUrl: "https://apps.shopify.com/bizmis",
} as const;

const HEX_OVERLAY = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

export function resolveLogoColorOverlay(lead: Pick<LeadEarlyAccessData, "logoColorOverlay">): string | null {
  const v = lead.logoColorOverlay?.trim();
  if (!v) return null;
  return HEX_OVERLAY.test(v) ? v : null;
}

export function resolveLeadLogoScale(lead: Pick<LeadEarlyAccessData, "leadLogoScale">): number {
  const s = lead.leadLogoScale;
  if (typeof s !== "number" || !Number.isFinite(s) || s <= 0) return 1;
  return s;
}

export function resolveStoreNameTextColor(
  lead: Pick<LeadEarlyAccessData, "textColor" | "primaryColor">,
): string {
  const v = lead.textColor?.trim();
  if (v && HEX_OVERLAY.test(v)) return v;
  return lead.primaryColor;
}
