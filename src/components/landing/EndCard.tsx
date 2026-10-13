import type { MouseEvent } from "react";
import { usePostHog } from "posthog-js/react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { FaShopify } from "react-icons/fa";
import { useMessages } from "@/i18n/LocaleProvider";
import {
  BIZMIS_BOOK_A_CALL_GENERAL_URL,
  BIZMIS_SHOPIFY_APP_LISTING_URL,
  openBizmisShopifyAppListing,
} from "@/lib/bizmisUrls";
import Reveal from "./Reveal";

/**
 * The close, composed like the ad-1 film's end card: the title IS the call to
 * action ("Install now", a light sweeping across it), and a handwritten note
 * floating beside it says the Early Access perks need no claiming: they apply
 * on their own to the first 50 installs. Then the perks, and a quiet way to
 * talk to us first.
 */
const EndCard = () => {
  const messages = useMessages();
  const ea = messages.earlyAccessCard;
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
    <section className="bzl-section bzl-screen relative overflow-hidden text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[680px] w-[980px] max-w-[150vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(249,163,83,0.2),rgba(255,255,255,0))]"
      />
      <div className="bzl-wrap relative">
        <Reveal>
          <p className="bzl-kicker">{ea.badge}</p>
        </Reveal>

        {/* the title is the button */}
        <Reveal delay={80} className="relative mx-auto mt-4 w-fit">
          <div className="relative">
            <h2 className="text-[clamp(3rem,min(8.4vw,12svh),6.75rem)] font-bold leading-[1.02] tracking-[-0.045em]">
              <a
                href={BIZMIS_SHOPIFY_APP_LISTING_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={install}
                aria-label={cta.installAria}
                className="bzl-cta-title group inline-flex items-center gap-[0.22em] rounded-[0.3em] px-[0.12em] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--bzl-orange)]/40"
              >
                <FaShopify
                  aria-hidden="true"
                  className="h-[0.74em] w-[0.74em] flex-shrink-0 text-[var(--bzl-fg)] transition-colors duration-300 group-hover:text-[#5e8e3e]"
                />
                <span className="bzl-cta-title-text">{end.install}</span>
                <span
                  aria-hidden="true"
                  className="grid h-[0.66em] w-[0.66em] flex-shrink-0 place-items-center rounded-full bg-[linear-gradient(180deg,var(--bzl-orange),var(--bzl-orange-strong))] text-white shadow-[0_14px_30px_-12px_rgba(236,119,9,0.7)] transition-transform duration-500 group-hover:translate-x-[0.12em]"
                  style={{ transitionTimingFunction: "var(--bzl-spring)" }}
                >
                  <ArrowRight
                    className="h-[0.4em] w-[0.4em]"
                    strokeWidth={2.6}
                  />
                </span>
              </a>
            </h2>
            {/* the hand-drawn underline under the button-title */}
            <svg
              viewBox="0 0 300 18"
              preserveAspectRatio="none"
              className="bzl-cta-underline pointer-events-none absolute -bottom-[0.35rem] left-[6%] h-3 w-[88%]"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 12 C 70 4, 160 3, 296 9"
                stroke="var(--bzl-orange-strong)"
                strokeWidth="3.2"
                strokeLinecap="round"
                pathLength={1}
              />
            </svg>
          </div>
          {/* the handwritten note, floating beside the title (under it on a phone) */}
          <p className="bzl-hand bzl-end-note mx-auto mt-7 max-w-[19rem] text-[clamp(1.6rem,2.3vw,2.1rem)] leading-[1.05] text-[var(--bzl-orange-dark)] xl:absolute xl:left-[calc(100%+1.5rem)] xl:top-[-1.4rem] xl:mt-0 xl:w-[16rem] xl:max-w-none xl:text-left">
            <svg
              viewBox="0 0 60 40"
              fill="none"
              aria-hidden="true"
              className="absolute -left-16 top-10 hidden h-10 w-14 text-[var(--bzl-orange-strong)] xl:block"
            >
              <path
                d="M56 6 C 40 4, 18 10, 8 30"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
              <path
                d="M4 20 L 8 31 L 18 26"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {end.note}
          </p>
        </Reveal>

        <Reveal delay={200}>
          <p className="bzl-lead mx-auto mt-6 max-w-2xl xl:mt-8">{ea.lead}</p>
        </Reveal>

        <Reveal delay={320}>
          <ul className="mx-auto mt-[5svh] grid max-w-4xl gap-x-10 gap-y-6 sm:grid-cols-3">
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
          <div className="mt-[5svh] flex flex-col items-center gap-4">
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
            <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-[var(--bzl-faint)]">
              <span>{cta.cancelAnytime}</span>
              <span aria-hidden="true">·</span>
              <span>{cta.gdprReady}</span>
              <span aria-hidden="true">·</span>
              <span>{cta.builtForShopify}</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default EndCard;
