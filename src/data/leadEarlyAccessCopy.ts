import { EARLY_ACCESS_STORE_CAP, EARLY_ACCESS_TERMS } from "@/data/leads/_schema";

export const BIZMIS_PRODUCT_NAME = "Bizmis \u2014 Voice Store Clerk";

export const EARLY_ACCESS_TRIAL_USAGE_CREDITS_LIMIT = 1200;

export const EARLY_ACCESS_EMAIL_COPY = {
  greetingDear: "Dear",
  greetingStoreTeamSuffix: " team,",
  inviteIntroBeforeBizmis: "I\u2019m Oriol, founder of ",
  inviteIntroAfterBizmis:
    ". We\u2019ve built voice-first AI store associates for Shopify that bring the in-store shopping experience to e-commerce. This isn\u2019t a chatbot. It welcomes shoppers, answers their questions, and guides them to buy with confidence, just like your best in-store salesperson would, helping your store ",
  inviteSentenceBizmisWord: "Bizmis",
  inviteSentenceValueDriveSales: "drive more sales",
  inviteSentenceValueJoiner: " and ",
  inviteSentenceValueEaseSupport: "ease your support workload",
  /** Above mockup: primary tap target (same URL as install CTA). */
  softCtaAboveMockupPrimaryLine: "Join Bizmis early access",
  /** Short muted tagline continuing the soft CTA link: roadmap shaped around their store + free + scarcity. */
  softCtaAboveMockupInlineTagline:
    "and shape the roadmap around your store, at no cost. Claim your spot before we close the list.",
  subline:
    "Claim your early access spot while the list is still open. Book a 30-minute setup call and help shape the Bizmis roadmap around your team\u2019s goals, customer questions, and storefront needs.",
  ctaLabel: "Book a 30-min call with me",
  /** Small caps kicker above the primary button — signals scheduling, not install. */
  ctaScheduleKicker: "Schedule a call",
  /** Primary invite CTA (founder onboarding call). */
  ctaPrimaryButtonLabel: "Book a 30-min call with me",
  /** Secondary text link under the primary button (Shopify install). */
  ctaSecondaryInstallLinkLabel: "Or try it first \u2014 install link here",
  /**
   * Gmail-safe paragraph above the dashed CTA box. Emphasis phrases are
   * bolded in HTML via `buildCtaUrgencyHtml`.
   */
  /** Second body paragraph: EA invite + scarcity; `{storeCap}` at build time. */
  ctaUrgencyEaOpenBeforeCap: "We\u2019re opening early access to just ",
  ctaUrgencyEaOpenAfterCapBeforeStore: " Shopify stores \u2014 I\u2019d really like ",
  ctaUrgencyEaOpenAfterStoreName:
    " to be one of them. Join before the spots close and you\u2019d have ",
  /**
   * CTA urgency paragraph (after EA open). Structure:
   *   **{em1}** {between1-2} **{storeName}{afterStoreName}** {between2-3} **{em3}** {after3}
   */
  ctaUrgencyEmphasis1: "priority input on the Bizmis roadmap",
  ctaUrgencyBetweenEmphasis1And2:
    " \u2014 early-access stores get a real say in what gets built, and what we learn from ",
  ctaUrgencyStoreFallback: "your store",
  ctaUrgencyAfterStoreName: " informs what comes next",
  ctaUrgencyBetweenEmphasis2And3:
    ". Book the call and I\u2019ll personally get Bizmis live on your storefront with you. ",
  ctaUrgencyEmphasis3: "No card, free during early access",
  ctaUrgencyAfterEmphasis3: ", no obligation after.",
  couponLabel: "Your early access code:",
  /** Inline heading on the Gmail-safe invite card: "Early Access Invite · bizmis × {StoreName}". */
  inviteTitleEyebrow: "Early Access Invite",
  inviteTitleEyebrowSeparator: "\u00b7",
  inviteTitleBrandLead: "bizmis",
  inviteTitleBrandLeadSeparator: "\u00d7",
  salesMockupTitle: "Boost Sales",
  salesMockupSubtitle:
    "Bring the warmth and guidance of a great in-store associate online — convert, upsell, and retain by guiding every shopper like someone on your floor would.",
  supportMockupTitle: "Save Support Hours",
  supportMockupSubtitle:
    "Give shoppers the helpful, human feel of asking someone in your store — instant 24/7 answers and emotional intelligence that turns frustrated customers into satisfied advocates.",
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
  preheaderClosingPhrase: "Bizmis brings the in-store experience to Shopify",
  bannerBadgeTitle: "Early Access Invite",
  bannerBadgeLimitPrefix: "Limited to the first",
  bannerBadgeLimitSuffix: "stores",
  /** Signature block shown at the end of the invite body (above the footer). */
  signatureClosing: "Looking forward,",
  signatureName: "Oriol Trujillo",
  signatureRoleBeforeBizmis: "Founder of ",
  signatureRoleBizmisWord: "Bizmis",
} as const;

export function buildCtaUrgencyPlainText(
  storeName?: string,
  storeCap: number = EARLY_ACCESS_STORE_CAP,
): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  const inviteStoreName = storeName?.trim() || c.ctaUrgencyStoreFallback;
  const roadmapStoreName = inviteStoreName;
  return (
    c.ctaUrgencyEaOpenBeforeCap +
    String(storeCap) +
    c.ctaUrgencyEaOpenAfterCapBeforeStore +
    inviteStoreName +
    c.ctaUrgencyEaOpenAfterStoreName +
    c.ctaUrgencyEmphasis1 +
    c.ctaUrgencyBetweenEmphasis1And2 +
    roadmapStoreName +
    c.ctaUrgencyAfterStoreName +
    c.ctaUrgencyBetweenEmphasis2And3 +
    c.ctaUrgencyEmphasis3 +
    c.ctaUrgencyAfterEmphasis3
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

/**
 * Resolves the merge value for the `{{firstName}}` Instantly tag.
 *
 * The template always emits `Dear {{firstName}},` as a single line —
 * intake-side data normalization decides whether to use the real first
 * name or the `<brand> team` fallback. This helper produces the exact
 * string that the safe-email salutation would render, with the trailing
 * punctuation from `greetingStoreTeamSuffix` stripped so the template's
 * own comma isn't doubled up.
 */
export function earlyAccessFirstNameMergeValue(
  storeName: string,
  leadContactName: string | null,
): string {
  const first = earlyAccessGreetingFirstName(leadContactName);
  if (first) return first;
  const suffix = EARLY_ACCESS_EMAIL_COPY.greetingStoreTeamSuffix
    .replace(/^\s+/, "")
    .replace(/[.,;:!?]+$/, "")
    .trim();
  return suffix.length > 0 ? `${storeName} ${suffix}` : storeName;
}

export function buildInviteLeadParagraphPlainText(): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  return `${c.inviteIntroBeforeBizmis}${c.inviteSentenceBizmisWord}${c.inviteIntroAfterBizmis}${c.inviteSentenceValueDriveSales}${c.inviteSentenceValueJoiner}${c.inviteSentenceValueEaseSupport}.`;
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
  return `* Up to ${EARLY_ACCESS_TRIAL_USAGE_CREDITS_LIMIT.toLocaleString()} credits of included usage (~${EARLY_ACCESS_TRIAL_USAGE_CREDITS_LIMIT / 10} voice min or ~${EARLY_ACCESS_TRIAL_USAGE_CREDITS_LIMIT.toLocaleString()} text msgs).`;
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
