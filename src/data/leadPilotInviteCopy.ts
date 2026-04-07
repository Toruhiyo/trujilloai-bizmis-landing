/**
 * Single source of truth for pilot invite email / card marketing copy.
 * Per-store demo lines stay on LeadPilotInviteData (registry).
 */

export const PILOT_INVITE_EMAIL_COPY = {
  eyebrowPrefix: "Early access invite for",
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

/** Invitation line; pass HTML-escaped store name for email body, or raw for plain text. */
export function buildPilotInviteInviteLine(storeName: string): string {
  return `We\u2019d love to invite ${storeName} to join Bizmis early access.`;
}

/** Two fixed lines per chip (`white-space:nowrap` in email); third line uses `storeCap`. */
export function buildPilotInviteChips(
  storeCap: number,
): readonly [readonly [string, string], readonly [string, string], readonly [string, string]] {
  return [
    ["30 days on us", "No commitment"],
    ["Shape the roadmap", "With feedback"],
    ["Limited to", `${storeCap} stores only`],
  ] as const;
}

export function buildPilotInvitePlainTextEyebrow(storeName: string): string {
  return `${PILOT_INVITE_EMAIL_COPY.eyebrowPrefix} ${storeName}`.toUpperCase();
}

export function buildPilotInviteFooterPlainText(): string {
  const { contactEmail } = PILOT_INVITE_EMAIL_COPY;
  return `Questions? Just reply to this email (${contactEmail}).`;
}
