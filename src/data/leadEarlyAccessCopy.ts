export const BIZMIS_PRODUCT_NAME = "Bizmis \u2014 Voice Store Clerk";

export const EARLY_ACCESS_TRIAL_USAGE_MINUTES_LIMIT = 120;

export const EARLY_ACCESS_EMAIL_COPY = {
  greetingDear: "Dear",
  greetingStoreTeamSuffix: " team,",
  inviteIntroBeforeBizmis: "I\u2019m Oriol, founder of ",
  inviteIntroAfterBizmis:
    ", voice-first store clerks for Shopify. ",
  /**
   * Curated/scarce hook leading into the store name. Kept identical for
   * both the named-contact and team-only paths so the voice stays warm
   * and personal regardless of whether we know a first name.
   */
  inviteSentenceLeadNamedBeforeBizmis:
    "We\u2019re hand-picking a small group of Shopify stores for early access and I\u2019d really like ",
  inviteSentenceLeadNoContactBeforeBizmis:
    "We\u2019re hand-picking a small group of Shopify stores for early access and I\u2019d really like ",
  inviteSentenceBizmisWord: "Bizmis",
  /** Follows the store name (e.g. "...Acme to be one of them. "). */
  inviteSentenceAfterFirstBizmis: " to be one of them. ",
  /**
   * Immediately follows the second "Bizmis" word in the pitch so the
   * pair reads "Bizmis clerks help your store ...". The plural "clerks"
   * is intentional.
   */
  inviteSentenceAfterStorePreValue: " clerks help your store ",
  inviteSentenceValueDriveSales: "drive more sales",
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
    "Claim your early access spot while the list is still open. Install Bizmis on your Shopify store for 30 days on us and help shape the product around your team\u2019s and customers\u2019 needs with your feedback.",
  ctaLabel: "Install Bizmis with early access",
  /** Gmail-safe invite mixes the install CTA + soft "join early access" into a single primary action. */
  ctaMixedButtonLabel: "Install Bizmis and join early access",
  /**
   * Gmail-safe CTA urgency (above the dashed box). Reads as a
   * continuation of the invite lead paragraph: same body typography,
   * same emphasis treatment on key phrases ("one-click setup",
   * "at no cost*", "shape the product's roadmap"). Closes with a
   * light scarcity note. Concatenate in order for plain text.
   */
  ctaMixedUrgencyLead: "You can install ",
  ctaMixedUrgencyBizmisWord: "Bizmis",
  ctaMixedUrgencyAfterBizmis: " with ",
  ctaMixedUrgencyOneClickSetup: "one-click setup",
  ctaMixedUrgencyBetweenSetupAndCost: ", run it ",
  /** Asterisk references the trial-usage minutes footnote under the button. */
  ctaMixedUrgencyNoCost: "at no cost*",
  ctaMixedUrgencyBeforeRoadmap: ", and help ",
  ctaMixedUrgencyRoadmapPhrase: "shape the product\u2019s roadmap",
  ctaMixedUrgencyAfterRoadmap:
    " around your team\u2019s and customers\u2019 needs with your feedback. Your early access spot is still open.",
  couponLabel: "Your early access code:",
  /** Inline heading on the Gmail-safe invite card: "Early Access Invite · bizmis × {StoreName}". */
  inviteTitleEyebrow: "Early Access Invite",
  inviteTitleEyebrowSeparator: "\u00b7",
  inviteTitleBrandLead: "bizmis",
  inviteTitleBrandLeadSeparator: "\u00d7",
  salesMockupTitle: "Boost Sales",
  salesMockupSubtitle:
    "Convert, upsell and retain by guiding every shopper like a great store clerk would.",
  supportMockupTitle: "Save Support Hours",
  supportMockupSubtitle: "Reduce support load with instant 24/7 answers and emotional intelligence that turns frustrated customers into satisfied advocates.",
  /** Icon+text chips under the support benefit body (matches landing capability row). */
  supportPairInstant247: "24/7 Instant Support",
  supportPairProblemResolution: "Store Knowledge",
  supportPairEmotionalIntelligence: "Emotional Intelligence",
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
  /** Signature block shown at the end of the invite body (above the footer). */
  signatureClosing: "Looking forward,",
  signatureName: "Oriol Trujillo",
  signatureRoleBeforeBizmis: "Founder of ",
  signatureRoleBizmisWord: "Bizmis",
} as const;

export function buildCtaMixedUrgencyPlainText(): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  return (
    c.ctaMixedUrgencyLead +
    c.ctaMixedUrgencyBizmisWord +
    c.ctaMixedUrgencyAfterBizmis +
    c.ctaMixedUrgencyOneClickSetup +
    c.ctaMixedUrgencyBetweenSetupAndCost +
    c.ctaMixedUrgencyNoCost +
    c.ctaMixedUrgencyBeforeRoadmap +
    c.ctaMixedUrgencyRoadmapPhrase +
    c.ctaMixedUrgencyAfterRoadmap
  );
}

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
  return `${c.inviteIntroBeforeBizmis}${c.inviteSentenceBizmisWord}${c.inviteIntroAfterBizmis}${beforeBizmis}${storeName}${c.inviteSentenceAfterFirstBizmis}${c.inviteSentenceBizmisWord}${c.inviteSentenceAfterStorePreValue}${c.inviteSentenceValueDriveSales}${c.inviteSentenceValueJoiner}${c.inviteSentenceValueEaseSupport}${c.inviteSentenceAfterStorePostValue}`;
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
