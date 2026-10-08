import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { usePostHog } from "posthog-js/react";
import { ArrowRight } from "lucide-react";
import { FaGift, FaMapMarkedAlt, FaShopify, FaStar } from "react-icons/fa";
import { useLocaleHref, useMessages } from "@/i18n/LocaleProvider";
import {
  BIZMIS_BOOK_A_CALL_GENERAL_URL,
  BIZMIS_SHOPIFY_APP_LISTING_URL,
  openBizmisShopifyAppListing,
} from "@/lib/bizmisUrls";
import Reveal from "./Reveal";

const PERK_ICONS = [FaGift, FaMapMarkedAlt, FaStar];

const Check = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0" fill="none" stroke="var(--bzl-orange-strong)" strokeWidth="2.2" aria-hidden="true">
    <path d="M5 12.5l4.4 4.4L19 7.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * The closing section as on the classic landing — the install call to action
 * beside the Early Access offer card — in the film's style.
 */
const EndCard = () => {
  const messages = useMessages();
  const cta = messages.finalCta;
  const ea = messages.earlyAccessCard;
  const posthog = usePostHog();
  const navigate = useNavigate();
  const href = useLocaleHref();

  const install = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisShopifyAppListing();
    posthog.capture("cta_clicked", { cta_type: "get_started", location: "final_cta" });
  };

  const claim = () => {
    posthog.capture("cta_clicked", { cta_type: "claim_early_bird", location: "early_access_card" });
    navigate(href("/pricing"));
  };

  return (
    <section className="bzl-section relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-1/2 h-[720px] w-[720px] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(249,163,83,0.2),rgba(255,255,255,0))]"
      />
      <div className="bzl-wrap relative grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        {/* Install */}
        <div>
          <Reveal>
            <h2 className="bzl-statement-sm max-w-xl">{cta.title}</h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="bzl-lead mt-5 max-w-xl">{cta.lead}</p>
          </Reveal>
          <Reveal delay={180}>
            <ul className="mt-7 space-y-2.5">
              {cta.bullets.map((b) => (
                <li key={b} className="flex items-center gap-3 font-semibold text-[var(--bzl-ink-2)]">
                  <Check />
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={260}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
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
              <a
                href={BIZMIS_BOOK_A_CALL_GENERAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={cta.bookCallAria}
                onClick={() => posthog.capture("cta_clicked", { cta_type: "book_a_call", location: "final_cta" })}
                className="bzl-btn bzl-btn-ghost"
              >
                {messages.common.bookACall}
              </a>
            </div>
            <p className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--bzl-faint)]">
              <span>{cta.cancelAnytime}</span>
              <span aria-hidden="true">·</span>
              <span>{cta.gdprReady}</span>
              <span aria-hidden="true">·</span>
              <span>{cta.builtForShopify}</span>
            </p>
          </Reveal>
        </div>

        {/* Early Access offer */}
        <Reveal delay={150}>
          <div className="relative mx-auto max-w-md rounded-[28px] border border-white/70 bg-white/80 p-7 shadow-[0_40px_90px_-40px_rgba(236,119,9,0.55),0_12px_30px_-18px_rgba(28,24,20,0.25)] backdrop-blur-xl sm:p-9">
            <p className="bzl-kicker">{ea.badge}</p>
            <h3 className="mt-3 text-[clamp(2rem,4vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.035em] text-[var(--bzl-fg)]">
              {ea.titleLead} <span className="text-[var(--bzl-orange-strong)]">{ea.titleHighlight}</span>
            </h3>
            <p className="mt-4 leading-relaxed text-[var(--bzl-muted)]">{ea.lead}</p>
            <ul className="mt-7 space-y-4">
              {ea.perks.map((perk, i) => {
                const Icon = PERK_ICONS[i];
                return (
                  <li key={perk.title} className="flex gap-4">
                    <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[linear-gradient(180deg,var(--bzl-orange),var(--bzl-orange-strong))] text-white shadow-[0_10px_20px_-10px_rgba(236,119,9,0.7)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block font-bold tracking-[-0.01em] text-[var(--bzl-fg)]">{perk.title}</span>
                      <span className="block text-sm text-[var(--bzl-muted)]">{perk.caption}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="bzl-script mt-7 -rotate-[1.5deg] text-2xl leading-none">{ea.limitedSpots}</p>
            <button type="button" onClick={claim} className="bzl-btn bzl-btn-primary mt-5 w-full">
              {ea.cta}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default EndCard;
