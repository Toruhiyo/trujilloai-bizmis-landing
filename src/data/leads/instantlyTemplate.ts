import type { LeadEarlyAccessData, LeadEarlyAccessJson } from "./_schema";
import { hydrateLead } from "./index";
import rawInstantlyTemplate from "./__instantly-template.json";

/**
 * Stable placeholder tokens embedded in the synthetic lead. They are pure
 * ASCII alphanumerics (plus a single "#" for the hex one) so they survive
 * `escapeHtml` and `encodeURIComponent` unchanged when the safe-email
 * builder renders them. The Playwright-driven generator in
 * `scripts/generate-instantly-template.mjs` later swaps each token for
 * the corresponding Instantly merge tag.
 */
export const INSTANTLY_TEMPLATE_TOKENS = {
  firstName: "X7ZFIRSTNAME",
  leadBrand: "X7ZLEADBRAND",
  leadHandle: "x7zleadhandle",
  accessCode: "X7ZACCESSCODE",
  storeAccentHex: "#AB1234",
} as const;

export const INSTANTLY_TEMPLATE_LEAD: LeadEarlyAccessData = hydrateLead(
  rawInstantlyTemplate as LeadEarlyAccessJson,
  0,
);
