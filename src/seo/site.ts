/**
 * The site's search and social metadata, in one place.
 *
 * Pure data and string builders, no React and no DOM: the <Seo> component
 * renders these tags through react-helmet-async in the browser, and the build
 * (scripts/seo/prerender-plugin.ts) writes the very same tags into each
 * route's static HTML, so a crawler that never runs JavaScript sees what a
 * browser ends up with. Each tag carries data-rh="true", so helmet adopts the
 * prerendered ones instead of duplicating them.
 */
import { buildAllFaqs } from "@/data/faqs";
import {
  PLAN_CURRENCY,
  PLAN_MONTHLY_PRICES,
} from "@/data/planPrices";
import { BIZMIS_SHOPIFY_APP_LISTING_URL } from "@/lib/bizmisUrls";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
import { getMessages, type Messages } from "@/i18n/messages";
import { localizePath } from "@/i18n/paths";

export const SITE_URL = "https://www.bizmis.ai";
export const SITE_NAME = "Bizmis";
export const TWITTER_HANDLE = "@bizmis_ai";
const SAME_AS = ["https://twitter.com/bizmis_ai"];
const LOGO_URL = `${SITE_URL}/web-app-manifest-512x512.png`;

/** hreflang values: language only, so every region of a language is covered. */
export const HREFLANG: Record<Locale, string> = {
  en: "en",
  es: "es",
  fr: "fr",
  it: "it",
  ca: "ca",
};

/** og:locale values (language_TERRITORY). */
const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
  it: "it_IT",
  ca: "ca_ES",
};

export type PageKey =
  | "home"
  | "pricing"
  | "faqs"
  | "earlyAccess"
  | "contact"
  | "privacy"
  | "terms"
  | "v1"
  | "notFound";

interface PageDef {
  /** Locale-free path. */
  path: string;
  /** Served in every locale (false: English only, the legal texts). */
  localized: boolean;
  /** Kept out of search results. */
  noIndex?: boolean;
  /** Canonical path when it isn't the page's own (localized like the page). */
  canonicalPath?: string;
  /** Social preview image (the per-locale file under /og). */
  ogImage: "home" | "pricing" | "faqs" | "early-access" | "contact";
  /** Listed in sitemap.xml. */
  sitemap?: { priority: number; changefreq: "weekly" | "monthly" | "yearly" };
}

export const PAGES: Record<PageKey, PageDef> = {
  home: { path: "/", localized: true, ogImage: "home", sitemap: { priority: 1, changefreq: "weekly" } },
  pricing: { path: "/pricing", localized: true, ogImage: "pricing", sitemap: { priority: 0.9, changefreq: "weekly" } },
  earlyAccess: { path: "/early-access", localized: true, ogImage: "early-access", sitemap: { priority: 0.8, changefreq: "monthly" } },
  faqs: { path: "/faqs", localized: true, ogImage: "faqs", sitemap: { priority: 0.7, changefreq: "monthly" } },
  contact: { path: "/contact", localized: true, ogImage: "contact", sitemap: { priority: 0.5, changefreq: "yearly" } },
  privacy: { path: "/privacy", localized: false, ogImage: "home", sitemap: { priority: 0.3, changefreq: "yearly" } },
  terms: { path: "/terms", localized: false, ogImage: "home", sitemap: { priority: 0.3, changefreq: "yearly" } },
  // The classic landing: still served, never indexed, pointing at the live one.
  v1: { path: "/v1", localized: true, noIndex: true, canonicalPath: "/", ogImage: "home" },
  notFound: { path: "/404", localized: true, noIndex: true, ogImage: "home" },
};

/** Absolute URL of a locale-free path in a locale. */
export const absoluteUrl = (path: string, locale: Locale = DEFAULT_LOCALE) =>
  `${SITE_URL}${localizePath(path, locale)}`;

/** The locales a page is published in. */
export const pageLocales = (page: PageKey): Locale[] =>
  PAGES[page].localized ? [...LOCALES] : [DEFAULT_LOCALE];

export const ogImageUrl = (page: PageKey, locale: Locale) =>
  `${SITE_URL}/og/${PAGES[page].ogImage}-${PAGES[page].localized ? locale : DEFAULT_LOCALE}.png`;

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

const LEGAL_SEO = {
  privacy: {
    title: "Privacy Policy | Bizmis",
    description:
      "How Bizmis collects, uses, and protects shopper and merchant data inside Shopify storefronts.",
    name: "Privacy Policy",
  },
  terms: {
    title: "Terms of Service | Bizmis",
    description:
      "The terms governing your use of Bizmis, the voice-first sales agent for Shopify stores.",
    name: "Terms of Service",
  },
} as const;

/** Markdown-ish answer text (**bold**, line breaks) as plain text. */
export const plainText = (text: string) =>
  text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\s*\n+\s*/g, " ").trim();

type JsonLd = Record<string, unknown>;

const organization = (messages: Messages): JsonLd => ({
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: {
    "@type": "ImageObject",
    url: LOGO_URL,
    width: 512,
    height: 512,
  },
  email: messages.common.email,
  sameAs: SAME_AS,
});

const website = (): JsonLd => ({
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  inLanguage: LOCALES.map((l) => HREFLANG[l]),
  publisher: { "@id": `${SITE_URL}/#organization` },
});

const monthlyOffer = (name: string, price: number, url: string): JsonLd => ({
  "@type": "Offer",
  name,
  price,
  priceCurrency: PLAN_CURRENCY,
  url,
  availability: "https://schema.org/InStock",
  priceSpecification: {
    "@type": "UnitPriceSpecification",
    price,
    priceCurrency: PLAN_CURRENCY,
    unitText: "MONTH",
    billingDuration: "P1M",
  },
});

/** Bizmis the product, priced as the pricing page shows it (list prices, monthly). */
const softwareApplication = (messages: Messages, locale: Locale): JsonLd => {
  const pricingUrl = absoluteUrl("/pricing", locale);
  const plans = messages.pricing.plans;
  return {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: SITE_NAME,
    description: messages.seo.home.jsonLdDescription,
    url: absoluteUrl("/", locale),
    image: ogImageUrl("home", locale),
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Shopify app",
    operatingSystem: "Web",
    installUrl: BIZMIS_SHOPIFY_APP_LISTING_URL,
    inLanguage: HREFLANG[locale],
    publisher: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: PLAN_CURRENCY,
      lowPrice: 0,
      // Free, Starter, Growth, Scale and Enterprise (custom pricing, so no price and no highPrice)
      offerCount: 5,
      offers: [
        monthlyOffer(messages.pricing.free.name, 0, pricingUrl),
        monthlyOffer(plans.starter.name, PLAN_MONTHLY_PRICES.starter, pricingUrl),
        monthlyOffer(plans.growth.name, PLAN_MONTHLY_PRICES.growth, pricingUrl),
        monthlyOffer(plans.scale.name, PLAN_MONTHLY_PRICES.scale, pricingUrl),
        {
          "@type": "Offer",
          name: messages.pricing.enterprise.name,
          url: absoluteUrl("/contact", locale),
        },
      ],
    },
  };
};

/** The FAQs exactly as the page shows them (bold and line breaks flattened). */
const faqPage = (messages: Messages, locale: Locale): JsonLd => ({
  "@type": "FAQPage",
  "@id": `${absoluteUrl("/faqs", locale)}#faqpage`,
  inLanguage: HREFLANG[locale],
  mainEntity: buildAllFaqs(messages).map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: plainText(faq.answer) },
  })),
});

/** The name a page goes by in the breadcrumb and the static nav. */
export const pageName = (page: PageKey, messages: Messages): string => {
  switch (page) {
    case "pricing":
      return messages.nav.pricing;
    case "faqs":
      return messages.nav.faqs;
    case "earlyAccess":
      return messages.nav.earlyAccess;
    case "contact":
      return messages.footer.links.contact;
    case "privacy":
      return LEGAL_SEO.privacy.name;
    case "terms":
      return LEGAL_SEO.terms.name;
    default:
      return SITE_NAME;
  }
};

const breadcrumb = (page: PageKey, messages: Messages, locale: Locale): JsonLd => ({
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: SITE_NAME, item: absoluteUrl("/", locale) },
    {
      "@type": "ListItem",
      position: 2,
      name: pageName(page, messages),
      item: absoluteUrl(PAGES[page].path, locale),
    },
  ],
});

export interface PageSeo {
  page: PageKey;
  locale: Locale;
  title: string;
  description: string;
  /** Locale-free path the page is served on. */
  path: string;
  /** Absolute canonical URL, or null for none (the 404). */
  canonical: string | null;
  noIndex: boolean;
  /** Locales to list as hreflang alternates (empty: none). */
  alternates: Locale[];
  image: string;
  imageAlt: string;
  jsonLd: JsonLd[];
}

/** Everything the head says about a page in a locale. */
export const getPageSeo = (
  page: PageKey,
  locale: Locale,
  overrides: Partial<Pick<PageSeo, "path" | "noIndex">> = {},
): PageSeo => {
  const def = PAGES[page];
  const effectiveLocale = def.localized ? locale : DEFAULT_LOCALE;
  const messages = getMessages(effectiveLocale);
  const path = overrides.path ?? def.path;
  const noIndex = overrides.noIndex ?? def.noIndex ?? false;

  const copy = (() => {
    switch (page) {
      case "privacy":
      case "terms":
        return LEGAL_SEO[page];
      case "v1":
        return messages.seo.home;
      default:
        return messages.seo[page];
    }
  })();

  const jsonLd: JsonLd[] = (() => {
    switch (page) {
      case "home":
        return [organization(messages), website(), softwareApplication(messages, effectiveLocale)];
      case "pricing":
        return [softwareApplication(messages, effectiveLocale), breadcrumb(page, messages, effectiveLocale)];
      case "faqs":
        return [faqPage(messages, effectiveLocale), breadcrumb(page, messages, effectiveLocale)];
      case "earlyAccess":
      case "contact":
      case "privacy":
      case "terms":
        return [breadcrumb(page, messages, effectiveLocale)];
      default:
        return [];
    }
  })().map((schema) => ({ "@context": "https://schema.org", ...schema }));

  const canonical =
    page === "notFound"
      ? null
      : absoluteUrl(def.canonicalPath ?? path, effectiveLocale);

  return {
    page,
    locale: effectiveLocale,
    title: copy.title,
    description: copy.description,
    path,
    canonical,
    noIndex,
    // Alternates only where the page itself is the indexable version.
    alternates: noIndex || !def.localized ? [] : [...LOCALES],
    image: ogImageUrl(page, effectiveLocale),
    imageAlt: messages.seo.ogImageAlt,
    jsonLd,
  };
};

export type HeadTag =
  | { tag: "title"; text: string }
  | { tag: "meta"; attrs: Record<string, string> }
  | { tag: "link"; attrs: Record<string, string> }
  | { tag: "script"; attrs: Record<string, string>; text: string };

/** The head tags for a page, in order. */
export const buildHeadTags = (seo: PageSeo): HeadTag[] => {
  const url = seo.canonical ?? absoluteUrl(seo.path, seo.locale);
  const tags: HeadTag[] = [
    { tag: "title", text: seo.title },
    { tag: "meta", attrs: { name: "description", content: seo.description } },
  ];
  if (seo.noIndex) {
    tags.push({ tag: "meta", attrs: { name: "robots", content: "noindex, follow" } });
  }
  if (seo.canonical) {
    tags.push({ tag: "link", attrs: { rel: "canonical", href: seo.canonical } });
  }
  for (const alt of seo.alternates) {
    tags.push({
      tag: "link",
      attrs: { rel: "alternate", hreflang: HREFLANG[alt], href: absoluteUrl(seo.path, alt) },
    });
  }
  if (seo.alternates.length > 0) {
    tags.push({
      tag: "link",
      attrs: { rel: "alternate", hreflang: "x-default", href: absoluteUrl(seo.path, DEFAULT_LOCALE) },
    });
  }
  const meta = (key: "property" | "name", name: string, content: string) =>
    tags.push({ tag: "meta", attrs: { [key]: name, content } });

  meta("property", "og:site_name", SITE_NAME);
  meta("property", "og:type", "website");
  meta("property", "og:title", seo.title);
  meta("property", "og:description", seo.description);
  meta("property", "og:url", url);
  meta("property", "og:image", seo.image);
  meta("property", "og:image:type", "image/png");
  meta("property", "og:image:width", String(OG_IMAGE_WIDTH));
  meta("property", "og:image:height", String(OG_IMAGE_HEIGHT));
  meta("property", "og:image:alt", seo.imageAlt);
  meta("property", "og:locale", OG_LOCALE[seo.locale]);
  for (const alt of seo.alternates) {
    if (alt !== seo.locale) meta("property", "og:locale:alternate", OG_LOCALE[alt]);
  }
  meta("name", "twitter:card", "summary_large_image");
  meta("name", "twitter:site", TWITTER_HANDLE);
  meta("name", "twitter:title", seo.title);
  meta("name", "twitter:description", seo.description);
  meta("name", "twitter:image", seo.image);
  meta("name", "twitter:image:alt", seo.imageAlt);

  for (const schema of seo.jsonLd) {
    tags.push({
      tag: "script",
      attrs: { type: "application/ld+json" },
      // "<" escaped so no string inside can close the script element.
      text: JSON.stringify(schema).replace(/</g, "\\u003c"),
    });
  }
  return tags;
};

const escapeAttr = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The head tags as static HTML, each marked for helmet to adopt (data-rh). */
export const headTagsToHtml = (tags: HeadTag[]): string =>
  tags
    .map((t) => {
      if (t.tag === "title") return `<title>${escapeHtml(t.text)}</title>`;
      const attrs = Object.entries(t.attrs)
        .map(([k, v]) => `${k}="${escapeAttr(v)}"`)
        .join(" ");
      if (t.tag === "script") return `<script ${attrs} data-rh="true">${t.text}</script>`;
      return `<${t.tag} ${attrs} data-rh="true" />`;
    })
    .join("\n    ");
