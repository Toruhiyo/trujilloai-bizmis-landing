/**
 * Single source of truth for pilot invite email / card marketing copy.
 * Per-store demo lines stay on LeadPilotInviteData (registry).
 */

export const PILOT_INVITE_EMAIL_COPY = {
  eyebrowPrefix: "Early access invite for",
  headline: "Drive sales and cut support load with Bizmis voice-first store clerks.",
  subline:
    "Greets shoppers, recommends the right products, answers support questions, and helps more visitors buy with confidence.",
  ctaLabel: "Install Bizmis with early access",
  mockupClerkLabel: "Bizmis voice-first store clerk",
  voiceListeningLabel: "Listening",
  voiceWidgetCta: "Ask by voice",
  outcomes: ["Sell more", "Support faster", "Learn from sessions"] as const,
  /** Uses U+2019 (right single quotation) for “you’ll”. */
  proofLine: "As an early-access store, you\u2019ll get direct access to us and help shape the roadmap.",
  footerLine: "Questions? Just reply to this email.",
  visitUsPrefix: "Visit us:",
  emailDocumentTitle: "Bizmis Pilot Invite",
  preheaderClosingPhrase: "Bizmis voice-first store clerks",
} as const;

export function buildPilotInvitePreheader(storeName: string, storeCap: number): string {
  return `Early access invite for ${storeName}. First ${storeCap} stores only — ${PILOT_INVITE_EMAIL_COPY.preheaderClosingPhrase}.`;
}

/** Two intentional lines per chip (no natural wrap). Third chip uses `storeCap`. */
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
