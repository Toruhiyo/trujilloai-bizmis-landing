import { useState } from "react";
import type { MouseEvent } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  BadgePercent,
  CalendarDays,
  Compass,
  Gift,
  Headphones,
  PlayCircle,
  Store,
  Ticket,
} from "lucide-react";
import { FaShopify } from "react-icons/fa";
import { usePostHog } from "posthog-js/react";
import SitePage from "@/components/site/SitePage";
import PageHead from "@/components/site/PageHead";
import Reveal from "@/components/landing/Reveal";
import EarlyAccessHost from "@/components/site/EarlyAccessHost";
import Seo from "@/components/Seo";
import { EARLY_ACCESS_STORE_CAP } from "@/data/leads/_schema";
import {
  BIZMIS_BOOK_A_CALL_URL,
  BIZMIS_DEMO_STORE_URL,
  BIZMIS_SHOPIFY_APP_LISTING_URL,
  openBizmisDemoStore,
  openBizmisShopifyAppListing,
} from "@/lib/bizmisUrls";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

const BENEFIT_ICONS = [Gift, Compass, Headphones, BadgePercent];
/** The hero's three facts: the cap, free while open, the benefits kept. */
const LEAD_ICONS = [Store, Gift, BadgeCheck];

const EarlyAccess = () => {
  const messages = useMessages();
  const posthog = usePostHog();
  // Install calls out while Will points at it
  const [inviting, setInviting] = useState(false);
  const benefits = messages.earlyAccessPage.benefits.map((benefit, index) => ({
    ...benefit,
    icon: BENEFIT_ICONS[index],
  }));

  const handleInstallClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisShopifyAppListing();
    posthog.capture("cta_clicked", {
      location: "early_access",
      cta_type: "install",
    });
  };

  const handleViewDemoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisDemoStore();
    posthog.capture("cta_clicked", {
      location: "early_access",
      cta_type: "view_demo",
    });
  };

  const handleBookCallClick = () => {
    posthog.capture("cta_clicked", {
      location: "early_access",
      cta_type: "book_call",
    });
  };

  return (
    <SitePage>
      <Seo page="earlyAccess" />

      {/* The invitation: the head on the left, Will on the right (above it on phones); on desktop it fills the screen */}
      <div className="bzl-wrap bzl-site-hero bzl-ea-top">
        <div className="bzl-ea-hero">
          <div className="bzl-site-head">
            <Reveal>
              <p className="bzl-site-pill">
                <span className="bzl-site-pill-icon" aria-hidden="true">
                  <Ticket strokeWidth={2} />
                </span>
                <span>{messages.nav.earlyAccess}</span>
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="bzl-site-title">
                {messages.earlyAccessPage.titleLine1}{" "}
                {messages.earlyAccessPage.titleLine2}
              </h1>
            </Reveal>
            {/* by hand, as the landing's "Only 50 spots!" */}
            <Reveal delay={140} className="pb-2">
              <p className="bzl-site-hand bzl-site-underline text-[clamp(1.9rem,3vw,2.4rem)]">
                {messages.earlyAccessPage.badge(EARLY_ACCESS_STORE_CAP)}
                <svg viewBox="0 0 300 16" preserveAspectRatio="none" fill="none" aria-hidden="true">
                  <path d="M3 11 C 80 5, 190 4, 297 8" stroke="hsl(var(--primary))" strokeWidth="2.6" strokeLinecap="round" />
                  <path d="M40 14 C 120 10, 200 10, 262 12" stroke="hsl(var(--primary))" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
                </svg>
              </p>
            </Reveal>
            {/* the lead as three facts, the key words in ink */}
            <Reveal delay={200}>
              <ul className="bzl-ea-points">
                {messages.earlyAccessPage
                  .leadPoints(EARLY_ACCESS_STORE_CAP)
                  .map(({ strong, rest }, index) => {
                    const Icon = LEAD_ICONS[index] ?? BadgeCheck;
                    return (
                      <li key={strong}>
                        <span className="bzl-ea-point-icon" aria-hidden="true">
                          <Icon strokeWidth={2.2} />
                        </span>
                        <span>
                          <strong>{strong}</strong> {rest}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </Reveal>
            <Reveal delay={260}>
              <div className="mt-2 flex flex-col items-center gap-4 lg:items-start">
                <a
                  href={BIZMIS_SHOPIFY_APP_LISTING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleInstallClick}
                  className={cn("bzl-site-btn is-lg bzl-ea-install", inviting && "is-called")}
                >
                  <FaShopify aria-hidden="true" className="!h-5 !w-5" />
                  {messages.common.installOnYourStore}
                </a>
                <div className="flex flex-col items-center gap-2 text-[0.9375rem] sm:flex-row sm:gap-4">
                  <a
                    href={BIZMIS_DEMO_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleViewDemoClick}
                    className="bzl-site-link"
                  >
                    <PlayCircle className="h-4 w-4" aria-hidden="true" />
                    {messages.earlyAccessPage.seeLiveDemo}
                  </a>
                  <span className="hidden text-[var(--bzl-faint)] sm:inline" aria-hidden="true">
                    ·
                  </span>
                  <a
                    href={BIZMIS_BOOK_A_CALL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleBookCallClick}
                    className="bzl-site-link"
                  >
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    {messages.earlyAccessPage.bookFounderCall}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={120} className="bzl-ea-avatar">
            <EarlyAccessHost onInvite={setInviting} />
          </Reveal>
        </div>
      </div>

      {/* What members get, on the landing's cream sheet */}
      <section aria-labelledby="benefits-heading" className="bzl-site-sheet">
        <div className="bzl-wrap">
          <PageHead
            as="h2"
            id="benefits-heading"
            icon={BadgeCheck}
            eyebrow={messages.earlyAccessPage.benefitsBadge}
            title={messages.earlyAccessPage.benefitsTitle}
            lead={messages.earlyAccessPage.benefitsLead}
          />
          <Reveal delay={240} className="mt-[clamp(1.75rem,5svh,3rem)]">
            <ul className="bzl-ea-benefits">
              {benefits.map(({ icon: Icon, title, detail }) => {
                // "Free as a member*": the asterisk points at the footnote, set in the same card
                const noted = title.trim().endsWith("*");
                return (
                  <li key={title} className="bzl-site-card bzl-ea-benefit">
                    <span className="bzl-site-disc" aria-hidden="true">
                      <Icon strokeWidth={2} />
                    </span>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <h3 className="bzl-ea-benefit-title">
                        {noted ? title.trim().slice(0, -1) : title}
                        {noted && (
                          <sup className="bzl-ea-benefit-mark" aria-hidden="true">
                            *
                          </sup>
                        )}
                      </h3>
                      <p className="bzl-ea-benefit-body">{detail}</p>
                      {noted && (
                        <p className="bzl-ea-benefit-note">
                          {messages.earlyAccessPage.footnote}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Two ways in */}
      <section aria-labelledby="cta-heading" className="bzl-wrap bzl-site-section">
        <PageHead as="h2" id="cta-heading" title={messages.earlyAccessPage.ctaTitle} />
        <Reveal delay={160} className="mx-auto mt-[clamp(1.75rem,5svh,3rem)] grid max-w-4xl gap-4 sm:grid-cols-2 sm:gap-5">
          <a
            href={BIZMIS_SHOPIFY_APP_LISTING_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleInstallClick}
            className="bzl-site-card bzl-ea-way is-primary"
          >
            <span className="flex items-start justify-between gap-4">
              <span className="bzl-site-disc">
                <FaShopify aria-hidden="true" />
              </span>
              <span className="bzl-ea-way-arrow" aria-hidden="true">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </span>
            <span className="mt-auto flex flex-col gap-2">
              <span className="bzl-site-hand text-[1.75rem]">
                {messages.earlyAccessPage.fastestPath}
              </span>
              <h3 className="bzl-ea-way-title">{messages.common.installOnYourStore}</h3>
              <span className="text-[0.9375rem] leading-relaxed text-white/85">
                {messages.earlyAccessPage.installCardBody}
              </span>
            </span>
          </a>

          <a
            href={BIZMIS_BOOK_A_CALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleBookCallClick}
            className="bzl-site-card bzl-ea-way"
          >
            <span className="flex items-start justify-between gap-4">
              <span className="bzl-site-disc">
                <CalendarDays aria-hidden="true" />
              </span>
              <span className="bzl-ea-way-arrow" aria-hidden="true">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </span>
            <span className="mt-auto flex flex-col gap-2">
              <span className="bzl-site-hand text-[1.75rem]">
                {messages.earlyAccessPage.wantHelp}
              </span>
              <h3 className="bzl-ea-way-title">{messages.earlyAccessPage.bookCallTitle}</h3>
              <span className="text-[0.9375rem] leading-relaxed text-[var(--bzl-muted)]">
                {messages.earlyAccessPage.bookCallBody}
              </span>
            </span>
          </a>
        </Reveal>

        <div className="mt-6 flex justify-center">
          <a
            href={BIZMIS_DEMO_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleViewDemoClick}
            className="bzl-site-link is-strong"
          >
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            {messages.earlyAccessPage.seeDemoFirst}
          </a>
        </div>

        <p className="bzl-price-muted mt-12 text-center text-[0.9375rem]">
          {messages.earlyAccessPage.founderLed}{" "}
          <a
            href="mailto:hello@bizmis.ai"
            className="font-semibold text-[var(--site-ink)] hover:underline"
          >
            hello@bizmis.ai
          </a>
        </p>
      </section>
    </SitePage>
  );
};

export default EarlyAccess;
