import { BIZMIS_BOOK_A_CALL_URL, BIZMIS_DEMO_STORE_URL, BIZMIS_SHOPIFY_APP_LISTING_URL } from "@/lib/bizmisUrls";

export const SUPPORT_POLICY_TYPES = [
  "Troubleshooting Guide",
  "Care Guide",
  "Warranty Policy",
  "Installation Guide",
  "Setup Guide",
  "Shipping Support",
  "Service Guide",
] as const;

export type SupportPolicyType = (typeof SUPPORT_POLICY_TYPES)[number];

export type SalesProductCard = {
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
  /** When set, used as the install / email code instead of `BIZMIS-EARLY-ACCESS-<ID>`. */
  couponCode?: string;
  storeName: string;
  storeDomain: string;
  leadContactName: string | null;
  leadContactLastName: string | null;
  content: string;
  primaryColor: string;
  secondaryColor: string | null;
  /** Banner background hex. Falls back to primaryColor when omitted. */
  bannerColor?: string | null;
  textColor?: string | null;
  logoColorOverlay?: string | null;
  /** Avatar shirt hex. Falls back to primaryColor when omitted. */
  avatarShirtColor?: string | null;
  /** Hex tint for the shirt stamp. null = native colours. */
  avatarStampColorOverlay?: string | null;
  /** Filename inside the lead folder used as shirt stamp (e.g. "icon.png"). Falls back to logo.png. */
  avatarStampImage?: string | null;
  pitchLine: string;
  salesShopperPrompt: string;
  salesBizmisReply: string;
  salesProducts: [SalesProductCard, SalesProductCard, SalesProductCard];
  /** 0-based index into salesProducts identifying the clerk's recommended pick. */
  salesRecommendedIndex: 0 | 1 | 2;
  salesFooterLine?: string;
  /** Shopper cue for the montage. Vague exploring intent, max ~80 chars. */
  montageShopperCue?: string | null;
  /** Full clerk recommendation for the montage, including product name and reason. */
  montageClerkCue?: string | null;
  /** Customer support demo: shopper question, max 60 chars. */
  supportShopperCue?: string | null;
  /** Customer support demo: Bizmis response, max 60 chars. Contains supportProductName. */
  supportClerkCue?: string | null;
  /** Policy name for the support tool chip. Must be one of SUPPORT_POLICY_TYPES. */
  supportPolicyName?: SupportPolicyType | null;
  /** Product name referenced in the support demo, highlighted in both cues. */
  supportProductName?: string | null;
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
  salesAvatarImagePath: string;
  supportAvatarImagePath: string;
  productAImagePath: string;
  productBImagePath: string;
  productCImagePath: string;
};

/** Single source for early-access store count (invite copy, mockup banner, Instantly template). */
export const EARLY_ACCESS_STORE_CAP = 50;

export const EARLY_ACCESS_TERMS = {
  trialDays: 30,
  shopperCap: 500,
  storeCap: EARLY_ACCESS_STORE_CAP,
  shopifyAppUrl: BIZMIS_SHOPIFY_APP_LISTING_URL,
  bookACallUrl: BIZMIS_BOOK_A_CALL_URL,
  /** Live demo storefront path (BIZ-127 single CTA). Absolutized per-email. */
  demoPath: BIZMIS_DEMO_STORE_URL,
} as const;

const HEX_OVERLAY = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

export function resolveLogoColorOverlay(lead: Pick<LeadEarlyAccessData, "logoColorOverlay">): string | null {
  const v = lead.logoColorOverlay?.trim();
  if (!v) return null;
  return HEX_OVERLAY.test(v) ? v : null;
}

export function resolveStoreNameTextColor(
  lead: Pick<LeadEarlyAccessData, "textColor" | "primaryColor">,
): string {
  const v = lead.textColor?.trim();
  if (v && HEX_OVERLAY.test(v)) return v;
  return lead.primaryColor;
}
