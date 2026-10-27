import type { MouseEvent } from "react";
import { usePostHog } from "posthog-js/react";
import { CalendarDays } from "lucide-react";
import { FaShopify } from "react-icons/fa";
import { useMessages } from "@/i18n/LocaleProvider";
import {
  BIZMIS_BOOK_A_CALL_GENERAL_URL,
  BIZMIS_SHOPIFY_APP_LISTING_URL,
  openBizmisShopifyAppListing,
} from "@/lib/bizmisUrls";
import Reveal from "./Reveal";
import "@/styles/end-cta.css";

/**
 * The close, composed like the ad-1 film's end card: the title IS the call to
 * action ("Install now", in ink with a light sweeping across it, the Shopify
 * bag in the same ink), drawn as a button like the film's end-frame one (an
 * outlined pill with a light running round its border, end-cta.css), the handwritten "for Early Access benefits!" right
 * under it, the film's
 * perks in one row and the quieter extras under them, then by hand "Only 50
 * spots!", and a quiet way to talk to us.
 */
const EndCard = () => {
  const messages = useMessages();
  const cta = messages.finalCta;
  const end = messages.landing.endCard;
  const posthog = usePostHog();

  const install = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisShopifyAppListing();
    posthog.capture("cta_clicked", {
      cta_type: "get_started",
      location: "early_access_card",
    });
  };

  return (
    // bzl-endcard: the section's own name (the styles key on it, never on its place in the page)
    <section className="bzl-endcard bzl-section bzl-screen relative overflow-hidden text-center">
      <div
        aria-hidden="true"
        className="bzl-endcard-glow pointer-events-none absolute left-1/2 top-1/2 h-[680px] max-h-full w-[980px] max-w-[150vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(249,163,83,0.11),rgba(255,255,255,0))]"
      />
      <div className="bzl-wrap relative">
        {/* the title is the button */}
        <Reveal className="bzl-cta-wrap relative mx-auto w-fit">
          <h2 className="text-[clamp(3rem,min(8.4vw,12svh),6.75rem)] font-bold leading-[1.02] tracking-[-0.045em]">
            <a
              href={BIZMIS_SHOPIFY_APP_LISTING_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={install}
              aria-label={cta.installAria}
              className="bzl-cta-title bzl-cta-btn group inline-flex items-center gap-[0.2em] text-[var(--bzl-fg)] transition-colors duration-300 hover:text-[var(--bzl-orange-dark)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--bzl-orange)]/40"
            >
              {/* the bag in the title's own ink (and its hover orange), as in the film */}
              <FaShopify aria-hidden="true" className="h-[0.74em] w-[0.74em] flex-shrink-0" />
              <span className="bzl-cta-title-text">{end.install}</span>
            </a>
          </h2>
        </Reveal>

        {/* the Early Access invite, by hand, right under the title */}
        <Reveal delay={120} className="mx-auto mt-[2.4svh] w-fit">
          <p className="bzl-hand bzl-end-invite mx-auto text-[hsl(var(--primary))]">{end.invite}</p>
        </Reveal>

        {/* the film's perks, in one row */}
        <Reveal delay={240}>
          <ul className="mx-auto mt-[5svh] flex max-w-4xl flex-col items-center justify-center gap-x-10 gap-y-3 sm:flex-row sm:flex-wrap">
            {end.perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-lg font-semibold text-[var(--bzl-fg)] md:text-xl">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 flex-shrink-0"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2.2"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4.4 4.4L19 7.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {perk}
              </li>
            ))}
          </ul>
          {/* and the quieter extras */}
          <ul className="mx-auto mt-4 flex max-w-3xl flex-col items-center justify-center gap-x-3 gap-y-0.5 text-[0.9375rem] text-[var(--bzl-muted)] sm:flex-row sm:flex-wrap">
            {end.extras.map((extra, i) => (
              <li key={extra} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden="true" className="hidden text-[var(--bzl-faint)] sm:inline">·</span>}
                {extra}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* by hand, apart from the perks: 50 spots only */}
        <Reveal delay={360} className="relative mx-auto mt-[4.5svh] w-fit">
          <p className="bzl-hand bzl-end-note text-[hsl(var(--primary))]">{end.note}</p>
          <svg
            viewBox="0 0 300 16"
            preserveAspectRatio="none"
            className="pointer-events-none absolute -bottom-2 left-[-4%] h-3 w-[108%]"
            fill="none"
            aria-hidden="true"
          >
            <path d="M3 11 C 80 5, 190 4, 297 8" stroke="hsl(var(--primary))" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M40 14 C 120 10, 200 10, 262 12" stroke="hsl(var(--primary))" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
          </svg>
        </Reveal>

        <Reveal delay={480}>
          <div className="mt-[5.5svh] flex flex-col items-center gap-4">
            {/* the secondary way in: talk to us first */}
            <a
              href={BIZMIS_BOOK_A_CALL_GENERAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={cta.bookCallAria}
              onClick={() =>
                posthog.capture("cta_clicked", {
                  cta_type: "book_a_call",
                  location: "early_access_card",
                })
              }
              className="bzl-btn bzl-btn-ghost h-11 px-5 text-[0.9375rem]"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {messages.common.bookACall}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default EndCard;
