export const BIZMIS_PRODUCT_NAME = "Bizmis \u2014 Voice Store Clerk";

export const EARLY_ACCESS_TRIAL_USAGE_MINUTES_LIMIT = 120;

export const EARLY_ACCESS_EMAIL_COPY = {
  greetingDear: "Dear",
  greetingStoreTeamSuffix: " team,",
  inviteSentenceLeadNamedBeforeBizmis: "We\u2019d love to invite you into ",
  inviteSentenceLeadNoContactBeforeBizmis: "We\u2019d love to invite you into ",
  inviteSentenceBizmisWord: "Bizmis",
  inviteSentenceAfterFirstBizmis: " early access for ",
  inviteSentenceAfterStorePreValue:
    " Shopify store, where Bizmis voice-first store clerks can help you ",
  inviteSentenceValueDriveSales: "drive sales",
  inviteSentenceValueJoiner: " and ",
  inviteSentenceValueEaseSupport: "ease your support workload",
  inviteSentenceAfterStorePostValue:
    " while feeling like a natural extension of your team.",
  /** Above mockup: primary tap target (same URL as install CTA). */
  softCtaAboveMockupPrimaryLine: "Join Bizmis early access",
  /** Short muted tagline continuing the soft CTA link: roadmap shaped around their store + free + scarcity. */
  softCtaAboveMockupInlineTagline:
    "and shape the roadmap around your store, at no cost. Claim your spot before we close the list.",
  subline:
    "Try Bizmis at no cost for 30 days on your Shopify store, and shape the product around your team\u2019s and customers\u2019 needs by sharing your feedback with us.",
  ctaLabel: "Install Bizmis with early access",
  couponLabel: "Your early access code:",
  salesMockupTitle: "Boost Sales",
  salesMockupSubtitle:
    "Convert, upsell and retain by guiding every shopper like a great store clerk would.",
  supportMockupTitle: "Save Support Hours",
  supportMockupSubtitle: "Reduce support load with instant 24/7 answers and emotional intelligence that turns frustrated customers into satisfied advocates.",
  insightsTitle: "Replays to Unlock Growth",
  insightsSubtitle:
    "Review store insights and voice replays to spot friction, sharpen conversion, and uncover your next wins.",
  insightsPairSessionReplays: "Session replays",
  insightsPairAutoTaggedChats: "Auto-Tagged Sessions",
  insightsPairFunnelInsights: "Funnel insights",
  setupTitle: "Plug and Play",
  setupSubtitle: "Go live in one click and start selling and supporting right away\u2014always synced and ready in minutes.",
  proofLine: "As an early-access store, you\u2019ll get direct influence on the Bizmis roadmap.",
  contactEmail: "hello@bizmis.ai",
  visitUsPrefix: "Visit us:",
  emailDocumentTitle: "Bizmis Early Access Invite",
  preheaderClosingPhrase: "Bizmis voice-first store clerks",
  bannerBadgeTitle: "Early Access Invite",
  bannerBadgeLimitPrefix: "Limited to the first",
  bannerBadgeLimitSuffix: "stores",
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
  return `${beforeBizmis}${c.inviteSentenceBizmisWord}${c.inviteSentenceAfterFirstBizmis}${storeName}${c.inviteSentenceAfterStorePreValue}${c.inviteSentenceValueDriveSales}${c.inviteSentenceValueJoiner}${c.inviteSentenceValueEaseSupport}${c.inviteSentenceAfterStorePostValue}`;
}

export function buildEarlyAccessChips(storeCap: number): readonly [string, string, string] {
  return [
    "30 days on us*. No commitment",
    "Shape the roadmap",
    `Limited to ${storeCap} stores`,
  ] as const;
}

export function buildSoftCtaPlainText(shopifyAppUrl: string, storeCap: number): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  const chips = buildEarlyAccessChips(storeCap);
  return `${c.softCtaAboveMockupPrimaryLine} ${shopifyAppUrl} — ${c.softCtaAboveMockupInlineTagline} — ${chips.join(" · ")}`;
}

export function buildEarlyAccessTrialUsageFootnotePlainText(): string {
  return `* Up to ${EARLY_ACCESS_TRIAL_USAGE_MINUTES_LIMIT} minutes of included usage.`;
}

export function buildEarlyAccessFooterPlainText(): string {
  const { contactEmail } = EARLY_ACCESS_EMAIL_COPY;
  return `Questions? Just reply to this email (${contactEmail}).`;
}

/** Before the recommended product name in the default montage waveform cue (body color). */
export const MONTAGE_CLERK_CUE_BEFORE_PRODUCT_NAME = "The " as const;

/** After the recommended product name in the default montage waveform cue (body color). */
export const MONTAGE_CLERK_CUE_AFTER_PRODUCT_NAME = " sounds right for you." as const;

export function buildMontageClerkCuePlainText(productTitle: string): string {
  return `${MONTAGE_CLERK_CUE_BEFORE_PRODUCT_NAME}${productTitle}${MONTAGE_CLERK_CUE_AFTER_PRODUCT_NAME}`;
}
