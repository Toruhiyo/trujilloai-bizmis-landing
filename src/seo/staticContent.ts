/**
 * The text of each page as plain, semantic HTML, written into the route's
 * static file at build time (scripts/seo/prerender-plugin.ts) for crawlers
 * and link previews that don't run JavaScript. Browsers that do never show
 * it: index.html hides #prerender-content once JS is on, and React replaces
 * #root's children on its first render (createRoot, no hydration), so it
 * can't flash or clash with the live page.
 *
 * Everything comes from the same dictionaries and data the pages render.
 */
import { buildFaqCategories } from "@/data/faqs";
import { FREE_PLAN_CONVERSATIONS_ALLOWANCE } from "@/data/leadEarlyAccessCopy";
import { EARLY_ACCESS_STORE_CAP } from "@/data/leads/_schema";
import {
  PLAN_EXTRA_SESSION_RATES,
  PLAN_INCLUDED_SESSIONS,
  PLAN_MONTHLY_PRICES,
  extraSessionSavingPercent,
} from "@/data/planPrices";
import {
  BIZMIS_BOOK_A_CALL_URL,
  BIZMIS_SHOPIFY_APP_LISTING_URL,
} from "@/lib/bizmisUrls";
import { LOCALES, LOCALE_NAMES, LOCALE_TAGS, type Locale } from "@/i18n/locales";
import { getMessages, type Messages } from "@/i18n/messages";
import { localizePath } from "@/i18n/paths";
import { escapeHtml as esc, HREFLANG, PAGES, pageName, type PageKey } from "./site";

/** **bold** and line breaks, as the FAQ page renders them. */
const richText = (text: string) =>
  text
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line) => esc(line).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"))
    .join("<br />");

const usd = (value: number, locale: Locale) =>
  `$${value.toLocaleString("en-US")}`;

const link = (href: string, text: string, external = false) =>
  `<a href="${esc(href)}"${external ? ' rel="noopener"' : ""}>${esc(text)}</a>`;

const list = (items: string[]) =>
  `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;

const header = (page: PageKey, m: Messages, locale: Locale) => {
  const href = (path: string) => localizePath(path, locale);
  const nav = [
    link(href("/"), "Bizmis"),
    link(href("/early-access"), m.nav.earlyAccess),
    link(href("/pricing"), m.nav.pricing),
    link(href("/faqs"), m.nav.faqs),
    link(href("/contact"), m.footer.links.contact),
  ].join("\n            ");
  // The same page in the other languages (English only for the legal texts).
  const languages = PAGES[page].localized
    ? `<nav aria-label="${esc(m.languageSwitcher.label)}">${LOCALES.map(
        (alt) =>
          `<a href="${localizePath(PAGES[page].path, alt)}" hreflang="${HREFLANG[alt]}" lang="${LOCALE_TAGS[alt]}">${esc(LOCALE_NAMES[alt])}</a>`,
      ).join(" ")}</nav>`
    : "";
  return `<header>
          <nav aria-label="Bizmis">
            ${nav}
          </nav>
          ${languages}
        </header>`;
};

const footer = (m: Messages, locale: Locale) => {
  const href = (path: string) => localizePath(path, locale);
  return `<footer>
          <p>${esc(m.footer.tagline)}</p>
          <nav aria-label="${esc(m.footer.columns.product)}">
            ${link(href("/pricing"), m.footer.links.pricing)}
            ${link(href("/faqs"), m.footer.links.faqs)}
            ${link(href("/early-access"), m.nav.earlyAccess)}
            ${link(href("/contact"), m.footer.links.contact)}
            ${link("/privacy", m.footer.links.privacy)}
            ${link("/terms", m.footer.links.terms)}
          </nav>
          <p>${esc(m.footer.copyright(new Date().getFullYear()))}</p>
        </footer>`;
};

const home = (m: Messages) => {
  const l = m.landing;
  return `<section>
            <h1>${esc(`${m.hero.titleLine1} ${m.hero.titleLine2}`)}</h1>
            <p>${esc(l.heroLine.join(" "))}</p>
            <p><strong>${esc(m.hero.pitchLead)}</strong> ${esc(m.hero.pitchShort)}</p>
            <p>${link(BIZMIS_SHOPIFY_APP_LISTING_URL, m.common.installOnShopify, true)}. ${esc(l.installSubline)}.</p>
          </section>
          <section>
            <h2>${esc(l.sales.titleParts.join(" "))}</h2>
            ${l.sales.panels.map((p) => `<h3>${esc(p.title)}</h3><p>${esc(p.body)}</p>`).join("\n            ")}
            <p><strong>${esc(l.sales.payoff.title)}</strong> ${esc(l.sales.payoff.body)}</p>
          </section>
          <section>
            <h2>${esc(`${l.support.title} ${l.support.titleTail}`)}</h2>
            <p>${esc(l.support.lead)}</p>
          </section>
          <section>
            <h2>${esc(`${l.insights.title} ${l.insights.titleTail}`)}</h2>
            <p>${esc(l.insights.lead)}</p>
          </section>
          <section>
            <h2>${esc(l.setup.title)}</h2>
            <p>${esc(l.setup.leadOn.replace(/^…/, ""))} ${esc(l.setup.leadSync)}</p>
            ${list(l.setup.cards)}
          </section>
          <section>
            <h2>${esc(l.customize.title)}</h2>
            <p>${esc(l.customize.lead)}</p>
            <h3>${esc(l.customize.avatar.title)}</h3><p>${esc(l.customize.avatar.body)}</p>
            <h3>${esc(l.customize.voice.title)}</h3><p>${esc(l.customize.voice.body)}</p>
          </section>
          <section>
            <h2>${esc(`${l.endCard.install} ${l.endCard.invite}`)}</h2>
            ${list([...l.endCard.perks, ...l.endCard.extras])}
            <p>${link(BIZMIS_SHOPIFY_APP_LISTING_URL, m.common.installOnShopify, true)}</p>
          </section>`;
};

const pricing = (m: Messages, locale: Locale) => {
  const p = m.pricing;
  const extraSessions = (key: keyof typeof PLAN_MONTHLY_PRICES) => {
    const percent = extraSessionSavingPercent(
      PLAN_EXTRA_SESSION_RATES[key],
      PLAN_EXTRA_SESSION_RATES.starter,
    );
    return p.extraConversations(
      `$${PLAN_EXTRA_SESSION_RATES[key].toFixed(2)}`,
      percent > 0 ? { percent, plan: p.plans.starter.name } : undefined,
    );
  };
  const plan = (key: keyof typeof PLAN_MONTHLY_PRICES) => `<section>
            <h2>${esc(p.plans[key].name)}</h2>
            <p>${usd(PLAN_MONTHLY_PRICES[key], locale)}${esc(p.perMonth)}. ${PLAN_INCLUDED_SESSIONS[key].toLocaleString(LOCALE_TAGS[locale])} ${esc(p.conversationsPerMonth)}. ${esc(extraSessions(key))}.</p>
            ${list(p.plans[key].features)}
          </section>`;
  return `<h1>${esc(p.title)}</h1>
          <p>${esc(p.lead)}</p>
          <section>
            <h2>${esc(p.free.name)}</h2>
            <p>$0. ${esc(p.free.description(FREE_PLAN_CONVERSATIONS_ALLOWANCE.toLocaleString(LOCALE_TAGS[locale])))}</p>
          </section>
          ${plan("starter")}
          ${plan("growth")}
          ${plan("scale")}
          <section>
            <h2>${esc(p.enterprise.name)}</h2>
            <p>${esc(p.enterprise.customPrice)}. ${esc(p.enterprise.description)}</p>
            <p>${esc(p.enterprise.everythingInScale)}</p>
            ${list(p.enterprise.features)}
          </section>
          <p>${esc(p.conversationDefinition)}</p>
          ${list([p.guarantees.spendLimit, p.guarantees.cancelAnytime, p.guarantees.moneyBack])}
          <p>${link(localizePath("/faqs", locale), p.viewAllFaqs)}</p>`;
};

const faqs = (m: Messages) =>
  `<h1>${esc(m.faqsPage.title)}</h1>
          <p>${esc(m.faqsPage.lead)}</p>
          ${buildFaqCategories(m)
            .map(
              (category) => `<section id="${category.id}">
            <h2>${esc(category.name)}</h2>
            ${category.faqs
              .map((faq) => `<h3 id="faq-${faq.id}">${esc(faq.question)}</h3>\n            <p>${richText(faq.answer)}</p>`)
              .join("\n            ")}
          </section>`,
            )
            .join("\n          ")}`;

const earlyAccess = (m: Messages) => {
  const e = m.earlyAccessPage;
  return `<h1>${esc(`${e.titleLine1} ${e.titleLine2}`)}</h1>
          <p>${esc(e.badge(EARLY_ACCESS_STORE_CAP))}</p>
          <ul>${e
            .leadPoints(EARLY_ACCESS_STORE_CAP)
            .map((point) => `<li><strong>${esc(point.strong)}</strong> ${esc(point.rest)}</li>`)
            .join("")}</ul>
          <p>${link(BIZMIS_SHOPIFY_APP_LISTING_URL, m.common.installOnShopify, true)}</p>
          <section>
            <h2>${esc(e.benefitsTitle)}</h2>
            <p>${esc(e.benefitsLead)}</p>
            ${e.benefits.map((b) => `<h3>${esc(b.title)}</h3><p>${esc(b.detail)}</p>`).join("\n            ")}
            <p>${esc(e.footnote)}</p>
          </section>
          <section>
            <h2>${esc(e.ctaTitle)}</h2>
            <p>${esc(e.installCardBody)} ${link(BIZMIS_SHOPIFY_APP_LISTING_URL, m.common.installOnShopify, true)}</p>
            <h3>${esc(e.bookCallTitle)}</h3>
            <p>${esc(e.bookCallBody)} ${link(BIZMIS_BOOK_A_CALL_URL, e.bookFounderCall, true)}</p>
          </section>`;
};

const contact = (m: Messages) =>
  `<h1>${esc(m.contact.title)}</h1>
          <p>${esc(m.contact.lead)}</p>
          <p>${esc(m.contact.orEmailUs)} ${link(`mailto:${m.common.email}`, m.common.email)}</p>`;

const notFound = (m: Messages, locale: Locale) =>
  `<h1>${esc(m.notFound.message)}</h1>
          <p>${link(localizePath("/", locale), m.notFound.backHome)}</p>`;

/**
 * The page's main text. `legalHtml` is the legal page's own body, rendered
 * from its component at build time; without it the page gets a short summary.
 */
export const buildStaticBody = (
  page: PageKey,
  locale: Locale,
  legalHtml?: string,
): string => {
  const m = getMessages(PAGES[page].localized ? locale : "en");
  const main = (() => {
    switch (page) {
      case "home":
      case "v1":
        return home(m);
      case "pricing":
        return pricing(m, locale);
      case "faqs":
        return faqs(m);
      case "earlyAccess":
        return earlyAccess(m);
      case "contact":
        return contact(m);
      case "privacy":
      case "terms":
        return legalHtml ?? `<h1>${esc(pageName(page, m))}</h1>`;
      case "notFound":
        return notFound(m, locale);
    }
  })();
  return `<div id="prerender-content">
        ${header(page, m, locale)}
        <main>
          ${main}
        </main>
        ${footer(m, locale)}
      </div>`;
};
