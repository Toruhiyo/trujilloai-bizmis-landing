export type LeadPilotInviteData = {
  id: string;
  storeName: string;
  storeDomain: string;
  /** Custom HTML or plain message; empty uses built-in pilot invite template */
  content: string;
  logoImagePath: string;
  productAImagePath: string;
  productBImagePath: string;
  productCImagePath: string;
  /** Hex, e.g. #1a2b3c */
  primaryColor: string;
  secondaryColor: string | null;
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
