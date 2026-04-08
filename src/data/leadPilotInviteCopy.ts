/**
 * Single source of truth for pilot invite email / card marketing copy.
 * Per-store demo lines stay on LeadPilotInviteData (registry).
 */

export const BIZMIS_PRODUCT_NAME = "Bizmis \u2014 Voice Store Clerk";

export const PILOT_INVITE_EMAIL_COPY = {
  /** Salutation: \u201cDear\u201d + [first name] + comma */
  greetingDear: "Dear",
  /** After [STORE_NAME] in \u201cDear [STORE_NAME] team,\u201d */
  greetingStoreTeamSuffix: " team,",
  /** Before first \u201cBizmis\u201d \u2014 named contact (\u201cyou\u201d) */
  inviteSentenceLeadNamedBeforeBizmis: "We\u2019d love to invite you into ",
  /** Before first \u201cBizmis\u201d \u2014 matches deck: \u201cyour team\u201d */
  inviteSentenceLeadNoContactBeforeBizmis: "We\u2019d love to invite you into ",
  /** First \u201cBizmis\u201d only (anchors \u201cearly access\u201d); primary accent in HTML */
  inviteSentenceBizmisWord: "Bizmis",
  /** After first \u201cBizmis\u201d, before [STORE_NAME] */
  inviteSentenceAfterFirstBizmis: " early access for ",
  /** After [STORE_NAME]; second \u201cBizmis\u201d is plain body text in HTML */
  inviteSentenceAfterStore:
    ", where Bizmis voice-first store clerks can help you drive sales and ease your support workload while feeling like a natural extension of your team.",
  /** Editorial line above mockup; only `softCtaAboveMockupLinkPhrase` is linked in HTML (light primary) */
  softCtaAboveMockupLinkPhrase: "Join Bizmis early access",
  softCtaAboveMockupAfterLink: " at no cost and ",
  softCtaAboveMockupEmphasis: "shape the product roadmap around your store\u2019s needs.",
  subline:
    "Try Bizmis at no cost for 30 days on your Shopify store, and shape the product around your team\u2019s and customers\u2019 needs by sharing feedback as you go.",
  ctaLabel: "Install Bizmis with early access",
  /** Shown with the per-lead `couponCode` from the registry. */
  couponLabel: "Your early access code:",
  outcomes: ["Sell more", "Support faster", "Learn from replays"] as const,
  /** Uses U+2019 (right single quotation) for “you’ll”. */
  proofLine: "As an early-access store, you\u2019ll get direct influence on the Bizmis roadmap.",
  contactEmail: "hello@bizmis.ai",
  visitUsPrefix: "Visit us:",
  emailDocumentTitle: "Bizmis Pilot Invite",
  preheaderClosingPhrase: "Bizmis voice-first store clerks",
} as const;

export function buildPilotInvitePreheader(storeName: string, storeCap: number): string {
  return `Early access invite for ${storeName}. First ${storeCap} stores only — ${PILOT_INVITE_EMAIL_COPY.preheaderClosingPhrase}.`;
}

/** First whitespace-delimited token for salutation only (e.g. \u201cNick Martin\u201d \u2192 \u201cNick\u201d). */
export function pilotInviteGreetingFirstName(leadContactName: string | null): string | null {
  const t = leadContactName?.trim();
  if (!t) return null;
  const first = t.split(/\s+/)[0];
  return first.length > 0 ? first : null;
}

export function buildPilotInviteSalutationPlainText(
  storeName: string,
  leadContactName: string | null,
): string {
  const c = PILOT_INVITE_EMAIL_COPY;
  const contactFirst = pilotInviteGreetingFirstName(leadContactName);
  if (contactFirst) return `${c.greetingDear} ${contactFirst},`;
  return `${c.greetingDear} ${storeName}${c.greetingStoreTeamSuffix}`;
}

/** Invitation sentence; copy deck [STORE_NAME] \u2192 `storeName` (both slots). */
export function buildPilotInviteValueSentencePlainText(
  storeName: string,
  leadContactName: string | null,
): string {
  const c = PILOT_INVITE_EMAIL_COPY;
  const contactFirst = pilotInviteGreetingFirstName(leadContactName);
  const beforeBizmis = contactFirst
    ? c.inviteSentenceLeadNamedBeforeBizmis
    : c.inviteSentenceLeadNoContactBeforeBizmis;
  return `${beforeBizmis}${c.inviteSentenceBizmisWord}${c.inviteSentenceAfterFirstBizmis}${storeName}${c.inviteSentenceAfterStore}`;
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
