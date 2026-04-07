/**
 * Single source of truth for pilot invite email / card marketing copy.
 * Per-store demo lines stay on LeadPilotInviteData (registry).
 */

export const BIZMIS_PRODUCT_NAME = "Bizmis \u2014 Voice Store Clerk";

export const PILOT_INVITE_EMAIL_COPY = {
  invitePrefix: "We\u2019d love to invite",
  inviteJoiner: "to join",
  inviteSuffix: "early access.",
  headline:
    "Join Bizmis early to drive sales and cut support load with voice-first store clerks.",
  subline:
    "Try Bizmis at no cost for 30 days on your Shopify store and shape the product around your team\u2019s and customers\u2019 needs by sharing feedback as you go.",
  ctaLabel: "Install Bizmis with early access",
  mockupClerkLabel: "Bizmis voice-first store clerk",
  voiceListeningLabel: "Listening",
  voiceWidgetCta: "Ask by voice",
  outcomes: ["Sell more", "Support faster", "Learn from sessions"] as const,
  /** Uses U+2019 (right single quotation) for “you’ll”. */
  proofLine: "As an early-access store, you\u2019ll get direct access to us and help shape the roadmap.",
  contactEmail: "hello@bizmis.ai",
  visitUsPrefix: "Visit us:",
  emailDocumentTitle: "Bizmis Pilot Invite",
  preheaderClosingPhrase: "Bizmis voice-first store clerks",
} as const;

export function buildPilotInvitePreheader(storeName: string, storeCap: number): string {
  return `Early access invite for ${storeName}. First ${storeCap} stores only — ${PILOT_INVITE_EMAIL_COPY.preheaderClosingPhrase}.`;
}

export function buildPilotInviteGreetingPlainText(storeName: string): string {
  const c = PILOT_INVITE_EMAIL_COPY;
  return `${c.invitePrefix} ${storeName} ${c.inviteJoiner} ${BIZMIS_PRODUCT_NAME} ${c.inviteSuffix}`;
}

/** Three single-line pilot value phrases; third uses `storeCap`. */
export function buildPilotInviteChips(storeCap: number): readonly [string, string, string] {
  return [
    "30 days on us. No commitment",
    "Shape the roadmap",
    `Limited to ${storeCap} stores only`,
  ] as const;
}


export function buildPilotInviteFooterPlainText(): string {
  const { contactEmail } = PILOT_INVITE_EMAIL_COPY;
  return `Questions? Just reply to this email (${contactEmail}).`;
}
