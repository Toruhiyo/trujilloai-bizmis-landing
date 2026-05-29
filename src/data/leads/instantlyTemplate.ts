import type { LeadEarlyAccessData, LeadEarlyAccessJson } from "./_schema";
import { hydrateLead } from ".";

/**
 * Stable placeholder tokens embedded in the synthetic lead. They are pure
 * ASCII alphanumerics (plus a single "#" for the hex one) so they survive
 * `escapeHtml` and `encodeURIComponent` unchanged when the safe-email
 * builder renders them. The Playwright-driven generator in the
 * bizmis-skills repo later swaps each token for the corresponding
 * Instantly merge tag.
 */
export const INSTANTLY_TEMPLATE_TOKENS = {
  firstName: "X7ZFIRSTNAME",
  leadBrand: "X7ZLEADBRAND",
  leadHandle: "x7zleadhandle",
  accessCode: "X7ZACCESSCODE",
  storeAccentHex: "#AB1234",
  utmCampaign: "X7ZUTMCAMPAIGN",
  unsubSig: "x7zunsubsig",
} as const;

/**
 * Synthetic lead data used to render the Instantly merge-tag template.
 * Inlined here (instead of loaded from a generated JSON) so the landing
 * repo builds without the bizmis-skills sibling repo.
 */
const INSTANTLY_TEMPLATE_RAW: LeadEarlyAccessJson = {
  id: INSTANTLY_TEMPLATE_TOKENS.leadHandle,
  couponCode: INSTANTLY_TEMPLATE_TOKENS.accessCode,
  storeName: INSTANTLY_TEMPLATE_TOKENS.leadBrand,
  storeDomain: "example.com",
  leadContactName: INSTANTLY_TEMPLATE_TOKENS.firstName,
  leadContactLastName: null,
  content: "",
  primaryColor: INSTANTLY_TEMPLATE_TOKENS.storeAccentHex,
  secondaryColor: null,
  textColor: null,
  logoColorOverlay: null,
  avatarShirtColor: null,
  avatarStampColorOverlay: null,
  pitchLine: "Synthetic lead for generating the Instantly merge-tag template.",
  salesShopperPrompt: "Placeholder shopper prompt.",
  salesBizmisReply: "Placeholder Bizmis reply.",
  salesProducts: [
    { title: "Placeholder product A", price: "$0", tag: "Tag" },
    { title: "Placeholder product B", price: "$0", tag: "Tag" },
    { title: "Placeholder product C", price: "$0", tag: "Tag" },
  ],
  salesRecommendedIndex: 0,
  salesFooterLine: "Placeholder footer line.",
  montageShopperCue: "Placeholder shopper cue.",
  montageClerkCue: "Placeholder product A is a placeholder cue.",
  supportShopperCue: "Placeholder support cue.",
  supportClerkCue: "Placeholder clerk support reply.",
  supportPolicyName: "Warranty Policy",
  supportProductName: "Placeholder product A",
  country: "Internal",
  vertical: "instantly_template",
  subNiche: "",
};

export const INSTANTLY_TEMPLATE_LEAD: LeadEarlyAccessData = hydrateLead(
  INSTANTLY_TEMPLATE_RAW,
  0,
);
