/**
 * Build-time entry (loaded by scripts/seo/prerender-plugin.ts through Vite's
 * SSR loader, never bundled into the app): every public route in every
 * locale, its head tags and static text, plus sitemap.xml and robots.txt.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS, type Locale } from "@/i18n/locales";
import { localizePath } from "@/i18n/paths";
import {
  absoluteUrl,
  buildHeadTags,
  getPageSeo,
  headTagsToHtml,
  HREFLANG,
  PAGES,
  pageLocales,
  SITE_URL,
  type PageKey,
} from "./site";
import { buildStaticBody } from "./staticContent";

export interface PrerenderedRoute {
  /** URL path, e.g. "/es/pricing". */
  url: string;
  /** Output file relative to the build's outDir. */
  file: string;
  lang: string;
  head: string;
  body: string;
}

/** Pages written as their own static file, one per locale. */
const PRERENDERED_PAGES: PageKey[] = [
  "home",
  "pricing",
  "faqs",
  "earlyAccess",
  "contact",
  "privacy",
  "terms",
  "v1",
];

const fileFor = (url: string) =>
  url === "/" ? "index.html" : `${url.replace(/^\//, "")}/index.html`;

/**
 * The legal pages' own text, rendered from their components (English only),
 * from the h1 to the end of the article: crawlers get the full policy.
 */
const renderLegal = async (page: "privacy" | "terms"): Promise<string | undefined> => {
  try {
    const module =
      page === "privacy"
        ? await import("@/pages/PrivacyPolicy")
        : await import("@/pages/Terms");
    const Page = module.default;
    const html = renderToStaticMarkup(
      <HelmetProvider>
        <MemoryRouter initialEntries={[PAGES[page].path]}>
          <LocaleProvider locale={DEFAULT_LOCALE}>
            <Page />
          </LocaleProvider>
        </MemoryRouter>
      </HelmetProvider>,
    );
    const start = html.indexOf("<h1");
    const end = html.indexOf("<footer");
    if (start < 0 || end < start) return undefined;
    let body = html
      .slice(start, end)
      .replace(/\s(class|style|data-[\w-]+)="[^"]*"/g, "");
    // Drop the closing tags of the wrappers that opened before the h1.
    const opens = (body.match(/<div[\s>]/g) ?? []).length;
    let extra = (body.match(/<\/div>/g) ?? []).length - opens;
    while (extra > 0 && body.trimEnd().endsWith("</div>")) {
      body = body.trimEnd().slice(0, -"</div>".length);
      extra -= 1;
    }
    return body;
  } catch (error) {
    console.warn(`[seo] couldn't render ${page} for the static HTML:`, error);
    return undefined;
  }
};

export const renderRoutes = async (): Promise<PrerenderedRoute[]> => {
  const legal = {
    privacy: await renderLegal("privacy"),
    terms: await renderLegal("terms"),
  };
  const routes: PrerenderedRoute[] = [];
  for (const page of PRERENDERED_PAGES) {
    for (const locale of pageLocales(page)) {
      const url = localizePath(PAGES[page].path, locale);
      routes.push({
        url,
        file: fileFor(url),
        lang: LOCALE_TAGS[locale],
        head: headTagsToHtml(buildHeadTags(getPageSeo(page, locale))),
        body: buildStaticBody(
          page,
          locale,
          page === "privacy" || page === "terms" ? legal[page] : undefined,
        ),
      });
    }
  }
  return routes;
};

/** The 404 page (Vercel serves 404.html, with a 404 status, for unknown paths). */
export const renderNotFound = (): Omit<PrerenderedRoute, "url"> => ({
  file: "404.html",
  lang: LOCALE_TAGS[DEFAULT_LOCALE],
  head: headTagsToHtml(buildHeadTags(getPageSeo("notFound", DEFAULT_LOCALE))),
  body: buildStaticBody("notFound", DEFAULT_LOCALE),
});

/**
 * Head for the bare app shell (app-shell.html): routes that only make sense
 * with JavaScript (admin, email renders, unsubscribe, /v2). Never indexed.
 */
export const renderAppShellHead = (): string =>
  headTagsToHtml([
    { tag: "title", text: "Bizmis" },
    { tag: "meta", attrs: { name: "robots", content: "noindex, follow" } },
  ]);

/** sitemap.xml: every indexable page in every locale, with its alternates. */
export const renderSitemap = (lastmod: Record<string, string>): string => {
  const urls: string[] = [];
  for (const page of Object.keys(PAGES) as PageKey[]) {
    const def = PAGES[page];
    if (!def.sitemap || def.noIndex) continue;
    const locales: Locale[] = pageLocales(page);
    for (const locale of locales) {
      const alternates =
        locales.length > 1
          ? [
              ...locales.map(
                (alt) =>
                  `    <xhtml:link rel="alternate" hreflang="${HREFLANG[alt]}" href="${absoluteUrl(def.path, alt)}" />`,
              ),
              `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(def.path, DEFAULT_LOCALE)}" />`,
            ]
          : [];
      urls.push(
        [
          "  <url>",
          `    <loc>${absoluteUrl(def.path, locale)}</loc>`,
          ...(lastmod[page] ? [`    <lastmod>${lastmod[page]}</lastmod>`] : []),
          `    <changefreq>${def.sitemap.changefreq}</changefreq>`,
          `    <priority>${def.sitemap.priority.toFixed(1)}</priority>`,
          ...alternates,
          "  </url>",
        ].join("\n"),
      );
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
};

/**
 * AI crawlers named on purpose: the training and the search/answer bots of
 * OpenAI, Anthropic, Perplexity, Google (Gemini), Apple and Common Crawl are
 * all welcome, with the same rules as everyone else. (A named group replaces
 * the * group for that bot, so it repeats the rules.)
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

const ROBOTS_RULES = `Allow: /
Disallow: /admin/
Disallow: /email-renders/`;

export const renderRobots = (): string => `# https://www.bizmis.ai
User-agent: *
${ROBOTS_RULES}

# AI crawlers and answer engines: welcome. Start at /llms.txt
${AI_CRAWLERS.map((bot) => `User-agent: ${bot}`).join("\n")}
${ROBOTS_RULES}

Sitemap: ${SITE_URL}/sitemap.xml
`;

/** Source files whose last change dates each page (sitemap lastmod). */
export const PAGE_SOURCES: Partial<Record<PageKey, string[]>> = {
  home: ["src/pages/FilmLanding.tsx", "src/components/Hero.tsx", "src/components/landing"],
  pricing: ["src/components/Pricing.tsx", "src/data/planPrices.ts"],
  faqs: ["src/data/faqs.ts", "src/pages/FAQs.tsx"],
  earlyAccess: ["src/pages/EarlyAccess.tsx"],
  contact: ["src/pages/Contact.tsx"],
  privacy: ["src/pages/PrivacyPolicy.tsx"],
  terms: ["src/pages/Terms.tsx"],
};

export { LOCALES };
export { findDashes, renderLlmsFullTxt, renderLlmsTxt } from "./llms";
