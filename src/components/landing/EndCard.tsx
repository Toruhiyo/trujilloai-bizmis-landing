import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { usePostHog } from "posthog-js/react";
import { ArrowRight } from "lucide-react";
import { FaShopify } from "react-icons/fa";
import { useLocaleHref, useMessages } from "@/i18n/LocaleProvider";
import {
  BIZMIS_BOOK_A_CALL_GENERAL_URL,
  BIZMIS_SHOPIFY_APP_LISTING_URL,
  openBizmisShopifyAppListing,
} from "@/lib/bizmisUrls";
import Reveal from "./Reveal";

/**
 * The classic landing's Early Access offer, composed like the film's closing
 * card: one big statement, the perks as a row of orange
 * checks, and a handwritten line with its underline — then the CTAs.
 */
const EndCard = () => {
  const messages = useMessages();
  const ea = messages.earlyAccessCard;
  const cta = messages.finalCta;
  const posthog = usePostHog();
  const navigate = useNavigate();
  const href = useLocaleHref();

  const install = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisShopifyAppListing();
    posthog.capture("cta_clicked", {
      cta_type: "get_started",
      location: "early_access_card",
    });
  };

  const claim = () => {
    posthog.capture("cta_clicked", {
      cta_type: "claim_early_bird",
      location: "early_access_card",
    });
    navigate(href("/pricing"));
  };

  return (
    <section className="bzl-section relative overflow-hidden text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[680px] w-[980px] max-w-[150vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(249,163,83,0.2),rgba(255,255,255,0))]"
      />
      <div className="bzl-wrap relative">
        <Reveal>
          <p className="bzl-kicker">{ea.badge}</p>
          <h2 className="mt-3 text-[clamp(2.8rem,7.4vw,5.8rem)] font-bold leading-[1.02] tracking-[-0.045em] text-black">
            {ea.titleLead}{" "}
            <span className="text-[var(--bzl-orange-strong)]">
              {ea.titleHighlight}
            </span>
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <p className="bzl-lead mx-auto mt-5 max-w-2xl">{ea.lead}</p>
        </Reveal>

        <Reveal delay={320}>
          <ul className="mx-auto mt-12 grid max-w-4xl gap-x-10 gap-y-6 sm:grid-cols-3">
            {ea.perks.map((perk) => (
              <li key={perk.title}>
                <p className="flex items-center justify-center gap-2 text-lg font-semibold text-[var(--bzl-fg)]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 flex-shrink-0"
                    fill="none"
                    stroke="var(--bzl-orange-strong)"
                    strokeWidth="2.2"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12.5l4.4 4.4L19 7.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {perk.title}
                </p>
                <p className="mt-1 text-sm text-[var(--bzl-muted)]">
                  {perk.caption}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={440}>
          <p className="bzl-script relative mx-auto mt-12 inline-block -rotate-[2.5deg] text-[clamp(2rem,3.6vw,2.8rem)] leading-none">
            {messages.landing.onlySpots}
            {/* the film's hand-drawn underline */}
            <svg
              viewBox="0 0 300 18"
              preserveAspectRatio="none"
              className="absolute -bottom-3 left-0 h-3 w-full"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 12 C 70 4, 160 3, 296 9"
                stroke="var(--bzl-orange-strong)"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M30 15 C 110 9, 190 9, 270 13"
                stroke="var(--bzl-orange-strong)"
                strokeWidth="2.4"
                strokeLinecap="round"
                opacity="0.85"
              />
            </svg>
          </p>
        </Reveal>

        <Reveal delay={540}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <a
              href={BIZMIS_SHOPIFY_APP_LISTING_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={install}
              aria-label={cta.installAria}
              className="bzl-btn bzl-btn-primary"
            >
              <FaShopify className="h-5 w-5" aria-hidden="true" />
              {messages.common.installOnShopify}
            </a>
            <button
              type="button"
              onClick={claim}
              className="bzl-btn bzl-btn-ghost"
            >
              {ea.cta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-[var(--bzl-faint)]">
            <span>{cta.cancelAnytime}</span>
            <span aria-hidden="true">·</span>
            <span>{cta.gdprReady}</span>
            <span aria-hidden="true">·</span>
            <span>{cta.builtForShopify}</span>
            <span aria-hidden="true">·</span>
            <a
              href={BIZMIS_BOOK_A_CALL_GENERAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                posthog.capture("cta_clicked", {
                  cta_type: "book_a_call",
                  location: "early_access_card",
                })
              }
              className="underline underline-offset-2 hover:text-[var(--bzl-orange-dark)]"
            >
              {messages.common.bookACall}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default EndCard;
