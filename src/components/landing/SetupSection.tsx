import type { CSSProperties, MouseEvent } from "react";
import { usePostHog } from "posthog-js/react";
import { FaBolt, FaBox, FaGlobe, FaPercent, FaShieldAlt, FaShopify, FaShoppingCart, FaSync, FaTag, FaUsers } from "react-icons/fa";
import { useMessages } from "@/i18n/LocaleProvider";
import { BIZMIS_SHOPIFY_APP_LISTING_URL, openBizmisShopifyAppListing } from "@/lib/bizmisUrls";
import AgentImage from "./AgentImage";
import Reveal, { useInView } from "./Reveal";

// Same order as messages.setup.dataCards (as on the classic landing).
const ICONS = [FaGlobe, FaTag, FaPercent, FaShieldAlt, FaUsers, FaBox];

/**
 * Setup, laid out as on the classic landing — your Shopify store data on one
 * side, streaming into the agent on the other — in the film's style, with a
 * real Bizmis avatar render.
 */
const SetupSection = () => {
  const messages = useMessages();
  const setup = messages.setup;
  const posthog = usePostHog();
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const n = setup.dataCards.length;

  const install = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisShopifyAppListing();
    posthog.capture("cta_clicked", { cta_type: "get_started", location: "setup" });
  };

  return (
    <section id="setup" className="bzl-section overflow-hidden bg-[linear-gradient(180deg,#fff,#fff8f0_45%,#fff)]">
      <div className="bzl-wrap">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="bzl-kicker">{setup.badge}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="bzl-statement-sm mt-4">{setup.title}</h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="bzl-lead mx-auto mt-5 max-w-2xl">{setup.lead}</p>
          </Reveal>
        </div>

        <div ref={ref} className="relative mt-16 grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(100px,0.5fr)_minmax(0,0.7fr)] md:gap-0">
          {/* Your Shopify store data */}
          <Reveal className="rounded-[var(--bzl-radius-card)] border border-[var(--bzl-border)] bg-white/80 p-4 shadow-[0_24px_60px_-34px_rgba(28,24,20,0.35)] backdrop-blur sm:p-5">
            <p className="flex items-center justify-center gap-2 pb-3 text-sm font-semibold text-[var(--bzl-orange-dark)]">
              <FaShopify className="h-4 w-4" />
              {setup.storeDataTitle}
            </p>
            <ul className="space-y-2">
              {setup.dataCards.map((card, i) => {
                const Icon = ICONS[i];
                return (
                  <li key={card.title} className="flex items-center gap-3 rounded-xl bg-[var(--bzl-card)] px-3 py-2.5">
                    <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-white text-[var(--bzl-orange-strong)] shadow-sm">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[var(--bzl-fg)]">{card.title}</span>
                      <span className="block truncate text-xs text-[var(--bzl-muted)]">{card.description}</span>
                    </span>
                    <span
                      className={`ml-auto h-2 w-2 flex-shrink-0 rounded-full transition-colors duration-500 ${inView ? "bg-[var(--bzl-orange)]" : "bg-[#dcdce0]"}`}
                      style={{ transitionDelay: `${300 + i * 200}ms` }}
                    />
                  </li>
                );
              })}
            </ul>
          </Reveal>

          {/* The store data flowing into the agent */}
          <svg
            viewBox={`0 0 100 ${n * 20}`}
            preserveAspectRatio="none"
            className="hidden h-[78%] w-full self-center md:block"
            aria-hidden="true"
          >
            {setup.dataCards.map((_, i) => {
              const y = i * 20 + 10;
              const end = n * 10;
              return (
                <path
                  key={i}
                  d={`M0 ${y} C 55 ${y}, 45 ${end}, 100 ${end}`}
                  fill="none"
                  stroke="var(--bzl-orange)"
                  strokeOpacity={0.55}
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  className={inView ? "bzl-flow" : ""}
                  style={{ "--bzl-delay": `${i * 160}ms` } as CSSProperties}
                />
              );
            })}
          </svg>

          <Reveal delay={150} className="relative mx-auto w-[62%] max-w-[300px] md:mx-0 md:-ml-[6%] md:w-full">
            <div aria-hidden="true" className="absolute inset-x-[-20%] bottom-[-4%] h-[14%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(236,119,9,0.28),transparent)]" />
            <AgentImage name="setup-will" alt={messages.landing.agentAlt} sizes="(min-width: 768px) 300px, 60vw" className="relative" />
          </Reveal>
        </div>

        <Reveal className="mt-14 text-center">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-semibold text-[var(--bzl-ink-2)]">
            {[
              { Icon: FaBolt, label: setup.badges.oneClick },
              { Icon: FaSync, label: setup.badges.alwaysSynced },
              { Icon: FaShoppingCart, label: setup.badges.readyInMinutes },
            ].map(({ Icon, label }) => (
              <span key={label} className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-[var(--bzl-orange-strong)]" />
                {label}
              </span>
            ))}
          </div>
          <a href={BIZMIS_SHOPIFY_APP_LISTING_URL} target="_blank" rel="noopener noreferrer" onClick={install} className="bzl-btn bzl-btn-primary mt-8">
            <FaShopify className="h-5 w-5" aria-hidden="true" />
            {messages.common.installBizmisOnShopify}
          </a>
          <p className="mt-3 text-sm text-[var(--bzl-faint)]">{setup.ctaNote}</p>
        </Reveal>
      </div>
    </section>
  );
};

export default SetupSection;
