import type { MouseEvent } from "react";
import { usePostHog } from "posthog-js/react";
import { FaShopify } from "react-icons/fa";
import { useMessages } from "@/i18n/LocaleProvider";
import {
  BIZMIS_BOOK_A_CALL_GENERAL_URL,
  BIZMIS_SHOPIFY_APP_LISTING_URL,
  openBizmisShopifyAppListing,
} from "@/lib/bizmisUrls";
import Reveal from "./Reveal";

/** The closing call to install, in the style of the film's end card, with the classic landing's trust notes. */
const EndCard = () => {
  const messages = useMessages();
  const m = messages.landing.end;
  const posthog = usePostHog();

  const install = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisShopifyAppListing();
    posthog.capture("cta_clicked", { cta_type: "get_started", location: "end_card" });
  };

  return (
    <section className="bzl-section relative overflow-hidden text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[900px] max-w-[140vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(249,163,83,0.18),rgba(255,255,255,0))]"
      />
      <div className="bzl-wrap relative">
        <Reveal>
          <img src="/images/bizmis-logo-full-orange-transparent.png" alt="Bizmis" className="mx-auto h-8 w-auto sm:h-9" />
        </Reveal>
        <Reveal delay={100}>
          <h2 className="mt-10 flex items-center justify-center gap-[0.18em] text-[clamp(2.8rem,7vw,5.4rem)] font-bold leading-[1.02] tracking-[-0.045em] text-black">
            <FaShopify className="h-[0.78em] w-[0.78em] flex-shrink-0" aria-hidden="true" />
            {m.title}
          </h2>
        </Reveal>
        <Reveal delay={260}>
          <p className="bzl-script mt-3 inline-block -rotate-[1.5deg] text-[clamp(2.2rem,4.4vw,3.25rem)] leading-none">
            {m.script}
          </p>
        </Reveal>
        <Reveal delay={420}>
          <span className="bzl-stamp mt-5">{m.stamp}</span>
        </Reveal>
        <Reveal delay={520}>
          <ul className="mx-auto mt-12 flex max-w-5xl flex-wrap justify-center gap-x-8 gap-y-3 text-lg font-semibold text-[var(--bzl-ink-2)]">
            {m.checks.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="var(--bzl-orange-strong)" strokeWidth="2.2" aria-hidden="true">
                  <path d="M5 12.5l4.4 4.4L19 7.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {c}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={620}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <a
              href={BIZMIS_SHOPIFY_APP_LISTING_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={install}
              className="bzl-btn bzl-btn-primary"
            >
              <FaShopify className="h-5 w-5" aria-hidden="true" />
              {messages.common.installOnShopify}
            </a>
            <a
              href={BIZMIS_BOOK_A_CALL_GENERAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => posthog.capture("cta_clicked", { cta_type: "book_a_call", location: "end_card" })}
              className="bzl-btn bzl-btn-ghost"
            >
              {messages.common.bookACall}
            </a>
          </div>
          <p className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-[var(--bzl-faint)]">
            <span>{messages.finalCta.cancelAnytime}</span>
            <span aria-hidden="true">·</span>
            <span>{messages.finalCta.gdprReady}</span>
            <span aria-hidden="true">·</span>
            <span>{messages.finalCta.builtForShopify}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default EndCard;
