/**
 * /llms.txt and /llms-full.txt (https://llmstxt.org): what Bizmis is, for
 * language models and AI search, written at build time by
 * scripts/seo/prerender-plugin.ts next to the prerendered pages.
 *
 * Only the intro is hand-written (src/seo/llms-intro.md: the H1, the summary
 * and who it's for). Everything else comes from the sources the site renders:
 * the English dictionary (landing.*, pricing, earlyAccessPage, faqs.items,
 * seo.*), src/data/faqs.ts, src/data/planPrices.ts and the Early Access
 * constants. A copy or price change shows up here on the next build.
 */
import { buildFaqCategories, type FAQ } from "@/data/faqs";
import { FREE_PLAN_CONVERSATIONS_ALLOWANCE } from "@/data/leadEarlyAccessCopy";
import { EARLY_ACCESS_STORE_CAP } from "@/data/leads/_schema";
import {
  PLAN_EXTRA_SESSION_RATES,
  PLAN_INCLUDED_SESSIONS,
  PLAN_MONTHLY_PRICES,
  YEARLY_DISCOUNT_PERCENT,
  extraSessionSavingPercent,
} from "@/data/planPrices";
import {
  BIZMIS_BOOK_A_CALL_URL,
  BIZMIS_SHOPIFY_APP_LISTING_URL,
} from "@/lib/bizmisUrls";
import { DEFAULT_LOCALE, LOCALES, LOCALE_NAMES } from "@/i18n/locales";
import { getMessages, type Messages } from "@/i18n/messages";
import intro from "./llms-intro.md?raw";
import { absoluteUrl, getPageSeo, plainText, SITE_URL } from "./site";

type Plan = keyof typeof PLAN_MONTHLY_PRICES;
const PLANS: Plan[] = ["starter", "growth", "scale"];

/** The FAQs llms.txt quotes in full (llms-full.txt has every one). */
const KEY_FAQS = [
  "what-is-bizmis",
  "is-chatbot",
  "what-it-does",
  "how-fast-start",
  "place-orders",
  "how-much-cost",
  "free-plan",
  "early-access-offer",
  "billing-payment-method",
  "multi-language",
  "personalize-voice-avatar",
  "train-on-data",
  "shopify-only",
  "private-testing",
];

const usd = (value: number) =>
  `$${value.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

const count = (value: number) => value.toLocaleString("en-US");

/** A line of copy as plain text: no leading ellipsis, no footnote star. */
const clean = (text: string) =>
  plainText(text).replace(/^…\s*/, "").replace(/^\*+|\*+$/g, "").trim();

/** "a, b and c" */
const and = (items: string[]) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

/** Ends a fragment with a period unless it already has punctuation. */
const sentence = (text: string) => {
  const t = clean(text);
  return /[.!?:]$/.test(t) ? t : `${t}.`;
};

const bullets = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

const section = (title: string, ...blocks: (string | false | undefined)[]) =>
  [`## ${title}`, ...blocks.filter(Boolean)].join("\n\n");

const faqUrl = (id: string) => `${absoluteUrl("/faqs")}#${id}`;

/** An FAQ answer as Markdown: bold kept, each line its own paragraph. */
const answerMarkdown = (answer: string) =>
  answer
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n\n");

const faqById = (m: Messages): Map<string, FAQ> =>
  new Map(buildFaqCategories(m).flatMap((c) => c.faqs.map((f) => [f.id, f] as const)));

// --- Shared blocks ---------------------------------------------------------

const benefitLines = (m: Messages) => {
  const l = m.landing;
  return [
    `**${m.benefits.sales.badge}**: ${l.sales.titleParts.join(" ")} ${(l.sales.panels ?? []).map((p) => sentence(p.body)).join(" ")}`,
    `**${l.support.area}**: ${sentence(l.support.title)} ${sentence(l.support.titleTail)} ${sentence(l.support.lead)}`,
    `**${l.insights.area}**: ${sentence(l.insights.title)} ${sentence(l.insights.titleTail)} ${sentence(l.insights.lead)}`,
  ];
};

const setupLines = (m: Messages) => {
  const s = m.landing.setup;
  return [
    `**${s.title}**, ${clean(s.leadOn)} ${sentence(s.leadSync)}`,
    `**${s.alwaysInSync}**: ${s.cards.join(", ")}.`,
  ];
};

const personalizationLines = (m: Messages) => {
  const c = m.landing.customize;
  return [
    sentence(c.lead),
    `**${c.avatar.title}**: ${sentence(c.avatar.body)}`,
    `**${c.voice.title}** (${m.common.soon.toLowerCase()}): ${sentence(c.voice.body)}`,
  ];
};

const pricingLines = (m: Messages, full: boolean) => {
  const p = m.pricing;
  const extraSessions = (key: Plan) => {
    const percent = extraSessionSavingPercent(PLAN_EXTRA_SESSION_RATES[key], PLAN_EXTRA_SESSION_RATES.starter);
    return sentence(
      p.extraConversations(
        usd(PLAN_EXTRA_SESSION_RATES[key]),
        percent > 0 ? { percent, plan: p.plans.starter.name } : undefined,
      ),
    );
  };
  const plan = (key: Plan) => {
    const features = p.plans[key].features;
    return `**${p.plans[key].name}**: ${usd(PLAN_MONTHLY_PRICES[key])}${p.perMonth}, ${count(PLAN_INCLUDED_SESSIONS[key])} ${p.conversationsPerMonth}. ${full ? features.map(sentence).join(" ") : sentence(features.join("; "))} ${extraSessions(key)}`;
  };
  return [
    `**${p.free.name}**: $0. ${p.free.description(count(FREE_PLAN_CONVERSATIONS_ALLOWANCE))}`,
    ...PLANS.map(plan),
    `**${p.enterprise.name}**: ${sentence(p.enterprise.customPrice)} ${sentence(p.enterprise.description)}${full ? ` ${p.enterprise.everythingInScale} ${p.enterprise.features.map(sentence).join(" ")}` : ""} ${m.common.contactSales}: ${absoluteUrl("/contact")}`,
    `Billed monthly, or yearly for about ${YEARLY_DISCOUNT_PERCENT}% off. ${sentence(p.guarantees.moneyBack)} ${sentence(p.guarantees.cancelAnytime)} ${sentence(p.guarantees.spendLimit)}`,
    sentence(p.conversationDefinition),
  ];
};

const earlyAccessLines = (m: Messages, full: boolean) => {
  const e = m.earlyAccessPage;
  const end = m.landing.endCard;
  const lines = [
    ...e.leadPoints(EARLY_ACCESS_STORE_CAP).map((pt) => sentence(`${pt.strong} ${pt.rest}`)),
    `Member benefits: ${[...end.perks, ...end.extras].map((x, i) => (i === 0 ? x : x.charAt(0).toLowerCase() + x.slice(1))).join(", ")}.`,
  ];
  if (full) {
    lines.push(...e.benefits.map((b) => `**${clean(b.title)}**: ${sentence(b.detail)}`));
  }
  lines.push(sentence(clean(e.footnote)));
  return lines;
};

const pageLines = (m: Messages) => {
  const page = (name: string, path: string, key: "home" | "pricing" | "faqs" | "earlyAccess" | "contact") =>
    `[${name}](${absoluteUrl(path)}): ${getPageSeo(key, DEFAULT_LOCALE).description}`;
  return [
    page("Home", "/", "home"),
    page(m.nav.pricing, "/pricing", "pricing"),
    page(m.nav.earlyAccess, "/early-access", "earlyAccess"),
    page(m.nav.faqs, "/faqs", "faqs"),
    page(m.footer.links.contact, "/contact", "contact"),
    `[${m.common.installBizmisOnShopify}](${BIZMIS_SHOPIFY_APP_LISTING_URL}): the Bizmis app on the Shopify App Store.`,
    `[${m.common.liveDemo}](${SITE_URL}/demo): a Shopify demo store with Bizmis running.`,
  ];
};

const languageLines = () =>
  LOCALES.map((locale) => {
    const paths = ["/pricing", "/faqs", "/early-access", "/contact"].map((p) => absoluteUrl(p, locale));
    return `[${LOCALE_NAMES[locale]}](${absoluteUrl("/", locale)}): the site in ${LOCALE_NAMES_EN[locale]}, also ${paths.join(", ")}`;
  });

const LOCALE_NAMES_EN: Record<(typeof LOCALES)[number], string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  it: "Italian",
  ca: "Catalan",
};

const contactLines = (m: Messages) => [
  `[Email](mailto:${m.common.email}): ${m.common.email}`,
  `[${m.footer.links.contact}](${absoluteUrl("/contact")}): ${sentence(m.contact.lead)}`,
  `[${m.earlyAccessPage.bookCallTitle}](${BIZMIS_BOOK_A_CALL_URL}): ${sentence(m.earlyAccessPage.bookCallBody)}`,
  `[X (Twitter)](https://twitter.com/bizmis_ai): @bizmis_ai`,
];

const legalLines = () => [
  `[Privacy Policy](${absoluteUrl("/privacy")}): ${getPageSeo("privacy", DEFAULT_LOCALE).description}`,
  `[Terms of Service](${absoluteUrl("/terms")}): ${getPageSeo("terms", DEFAULT_LOCALE).description}`,
];

// --- The two files ---------------------------------------------------------

/** /llms.txt: the summary, the key facts, the key FAQ answers and the links. */
export const renderLlmsTxt = (): string => {
  const m = getMessages(DEFAULT_LOCALE);
  const faqs = faqById(m);
  const languagesFaq = faqs.get("multi-language");
  const keyFaqs = KEY_FAQS.map((id) => faqs.get(id))
    .filter((f): f is FAQ => Boolean(f))
    .map((f) => `[${f.question}](${faqUrl(f.id)}): ${plainText(f.answer)}`);

  return [
    intro.trim(),
    section("Benefits", bullets(benefitLines(m))),
    section("Setup", bullets(setupLines(m))),
    section(m.landing.customize.eyebrow, bullets(personalizationLines(m))),
    section(
      "Languages",
      bullets([
        ...(languagesFaq ? [plainText(languagesFaq.answer).replace(/^Yes\.\s*/, "")] : []),
        `The website is in ${and(LOCALES.map((l) => LOCALE_NAMES_EN[l]))}.`,
      ]),
    ),
    section("Pricing", `Full details: [${m.nav.pricing}](${absoluteUrl("/pricing")})`, bullets(pricingLines(m, false))),
    section(
      m.nav.earlyAccess,
      `Details: [${m.nav.earlyAccess}](${absoluteUrl("/early-access")})`,
      bullets(earlyAccessLines(m, false)),
    ),
    section("Key FAQs", bullets(keyFaqs)),
    section("Pages", bullets(pageLines(m))),
    section("Languages of the site", bullets(languageLines())),
    section(m.footer.links.contact, bullets(contactLines(m))),
    section(
      "Optional",
      bullets([
        `[llms-full.txt](${SITE_URL}/llms-full.txt): everything above plus every FAQ and plan feature, in plain text.`,
        ...legalLines(),
      ]),
    ),
  ].join("\n\n") + "\n";
};

/** /llms-full.txt: the whole product story in plain text, every FAQ included. */
export const renderLlmsFullTxt = (): string => {
  const m = getMessages(DEFAULT_LOCALE);
  const l = m.landing;
  const s = l.sales;
  const stages = (s.openers ?? []).map((opener, i) => {
    const problem = s.funnel?.problems?.[i];
    const solution = s.funnel?.solutions?.[i];
    return problem && solution ? `${opener}: "${problem}" becomes "${solution}".` : sentence(opener);
  });
  const faqs = buildFaqCategories(m)
    .map(
      (category) =>
        `### ${category.name}\n\n` +
        category.faqs
          .map((f) => `#### ${f.question}\n\n${answerMarkdown(f.answer)}\n\nLink: ${faqUrl(f.id)}`)
          .join("\n\n"),
    )
    .join("\n\n");

  return [
    intro.trim(),
    section(
      m.benefits.sales.badge,
      `${s.titleParts.join(" ")}`,
      bullets((s.panels ?? []).map((p) => `**${p.title}**: ${sentence(p.body)}`)),
      stages.length > 0 && `Along the sales funnel:\n\n${bullets(stages)}`,
      `${sentence(s.payoff.title)} ${sentence(s.payoff.body)}`,
    ),
    section(l.support.area, `${sentence(l.support.title)} ${sentence(l.support.titleTail)}`, sentence(l.support.lead)),
    section(l.insights.area, `${sentence(l.insights.title)} ${sentence(l.insights.titleTail)}`, sentence(l.insights.lead)),
    section(
      "Setup",
      bullets(setupLines(m)),
      sentence(m.landing.installSubline),
    ),
    section(l.customize.eyebrow, `${l.customize.title}.`, bullets(personalizationLines(m))),
    section(
      "Pricing",
      `${sentence(m.pricing.title)} ${sentence(m.pricing.lead)} Prices in USD. Details: ${absoluteUrl("/pricing")}`,
      bullets(pricingLines(m, true)),
      sentence(m.pricing.guarantees.bannerBody),
    ),
    section(
      m.nav.earlyAccess,
      `${m.earlyAccessPage.titleLine1} ${m.earlyAccessPage.titleLine2}: ${sentence(m.earlyAccessPage.badge(EARLY_ACCESS_STORE_CAP))} Details: ${absoluteUrl("/early-access")}`,
      bullets(earlyAccessLines(m, true)),
      `${m.earlyAccessPage.ctaTitle}: ${sentence(m.earlyAccessPage.installCardBody)} ${m.common.installOnShopify}: ${BIZMIS_SHOPIFY_APP_LISTING_URL}. ${sentence(m.earlyAccessPage.bookCallTitle)} ${sentence(m.earlyAccessPage.bookCallBody)} ${BIZMIS_BOOK_A_CALL_URL}`,
    ),
    section(m.nav.faqs, faqs),
    section("Pages", bullets(pageLines(m))),
    section("Languages of the site", bullets(languageLines())),
    section(m.footer.links.contact, bullets(contactLines(m))),
    section("Legal", bullets(legalLines())),
  ].join("\n\n") + "\n";
};

/** Copy rule for these files: no em or en dashes. Returns the offending lines. */
export const findDashes = (text: string): string[] =>
  text.split("\n").filter((line) => /[—–]/.test(line));
