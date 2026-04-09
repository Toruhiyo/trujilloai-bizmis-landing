export const BIZMIS_PRODUCT_NAME = "Bizmis \u2014 Voice Store Clerk";

export const EARLY_ACCESS_TRIAL_USAGE_MINUTES_LIMIT = 120;

export const EARLY_ACCESS_EMAIL_COPY = {
  greetingDear: "Dear",
  greetingStoreTeamSuffix: " team,",
  inviteSentenceLeadNamedBeforeBizmis: "We\u2019d love to invite you into ",
  inviteSentenceLeadNoContactBeforeBizmis: "We\u2019d love to invite you into ",
  inviteSentenceBizmisWord: "Bizmis",
  inviteSentenceAfterFirstBizmis: " early access for ",
  inviteSentenceAfterStore:
    ", where Bizmis voice-first store clerks can help you drive sales and ease your support workload while feeling like a natural extension of your team.",
  softCtaAboveMockupLinkPhrase: "Join Bizmis early access",
  softCtaAboveMockupAfterLink: " at no cost and ",
  softCtaAboveMockupEmphasis: "shape the product roadmap around your store\u2019s needs.",
  subline:
    "Try Bizmis at no cost for 30 days on your Shopify store, and shape the product around your team\u2019s and customers\u2019 needs by sharing feedback as you go.",
  ctaLabel: "Install Bizmis with early access",
  couponLabel: "Your early access code:",
  montageClerkCueDefault: "Here are 3 good matches.",
  outcomes: ["Sell more", "Support faster", "Learn from replays"] as const,
  proofLine: "As an early-access store, you\u2019ll get direct influence on the Bizmis roadmap.",
  contactEmail: "hello@bizmis.ai",
  visitUsPrefix: "Visit us:",
  emailDocumentTitle: "Bizmis Early Access Invite",
  preheaderClosingPhrase: "Bizmis voice-first store clerks",
} as const;

export function buildEarlyAccessPreheader(storeName: string, storeCap: number): string {
  return `Early access invite for ${storeName}. First ${storeCap} stores only \u2014 ${EARLY_ACCESS_EMAIL_COPY.preheaderClosingPhrase}.`;
}

export function earlyAccessGreetingFirstName(leadContactName: string | null): string | null {
  const t = leadContactName?.trim();
  if (!t) return null;
  const first = t.split(/\s+/)[0];
  return first.length > 0 ? first : null;
}

export function buildEarlyAccessSalutationPlainText(
  storeName: string,
  leadContactName: string | null,
): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  const contactFirst = earlyAccessGreetingFirstName(leadContactName);
  if (contactFirst) return `${c.greetingDear} ${contactFirst},`;
  return `${c.greetingDear} ${storeName}${c.greetingStoreTeamSuffix}`;
}

export function buildEarlyAccessValueSentencePlainText(
  storeName: string,
  leadContactName: string | null,
): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  const contactFirst = earlyAccessGreetingFirstName(leadContactName);
  const beforeBizmis = contactFirst
    ? c.inviteSentenceLeadNamedBeforeBizmis
    : c.inviteSentenceLeadNoContactBeforeBizmis;
  return `${beforeBizmis}${c.inviteSentenceBizmisWord}${c.inviteSentenceAfterFirstBizmis}${storeName}${c.inviteSentenceAfterStore}`;
}

export function buildEarlyAccessChips(storeCap: number): readonly [string, string, string] {
  return [
    "30 days on us*. No commitment",
    "Shape the roadmap",
    `Limited to ${storeCap} stores only`,
  ] as const;
}

export function buildEarlyAccessTrialUsageFootnotePlainText(): string {
  return `* Up to ${EARLY_ACCESS_TRIAL_USAGE_MINUTES_LIMIT} minutes of included usage.`;
}

export function buildEarlyAccessFooterPlainText(): string {
  const { contactEmail } = EARLY_ACCESS_EMAIL_COPY;
  return `Questions? Just reply to this email (${contactEmail}).`;
}
