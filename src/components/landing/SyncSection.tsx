import type { CSSProperties } from "react";
import { FaShopify } from "react-icons/fa";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import Reveal, { useInView } from "./Reveal";

/**
 * "It all takes one click. Your whole store, in sync." — the store's data
 * sources tick into sync one by one around the Bizmis mark.
 */
const SyncSection = () => {
  const messages = useMessages();
  const m = messages.landing.sync;
  const setup = messages.setup;
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  return (
    <section id="setup" className="bzl-section overflow-hidden">
      <div className="bzl-wrap text-center">
        <Reveal>
          <h2 className="bzl-statement">
            {m.title}
            <br />
            <span className="bzl-tail">{m.titleTail}</span>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="bzl-lead mx-auto mt-6 max-w-2xl">{setup.lead}</p>
        </Reveal>

        <div ref={ref} className="relative mx-auto mt-16 max-w-5xl">
          {/* The warm orb behind the sync, as in the film. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,#fff4e8,rgba(255,255,255,0))]"
          />
          <div className="relative mx-auto mb-10 flex w-fit items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-[#95bf47] text-white shadow-[0_14px_30px_-12px_rgba(149,191,71,0.7)]">
              <FaShopify className="h-8 w-8" />
            </span>
            <span className="flex gap-1.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <i
                  key={i}
                  className={cn("h-1.5 w-1.5 rounded-full bg-[var(--bzl-orange)]", inView && "animate-pulse")}
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </span>
            <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-white shadow-[0_14px_30px_-12px_rgba(242,140,56,0.6)] ring-1 ring-[var(--bzl-border)]">
              <img src="/images/bizmis-logo-orange-transparent.png" alt="Bizmis" className="h-9 w-9" />
            </span>
          </div>

          <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {setup.dataCards.map((card, i) => (
              <div
                key={card.title}
                className="flex items-center gap-4 rounded-2xl border border-[var(--bzl-border)] bg-white/90 p-4 text-left shadow-[0_10px_30px_-18px_rgba(28,24,20,0.3)] backdrop-blur"
              >
                <span
                  className={cn(
                    "grid h-9 w-9 flex-shrink-0 place-items-center rounded-full transition-all duration-500",
                    inView ? "bg-[var(--bzl-orange)] text-white" : "bg-[var(--bzl-card)] text-transparent"
                  )}
                  style={{ transitionDelay: `${400 + i * 220}ms`, transitionTimingFunction: "var(--bzl-spring)" } as CSSProperties}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
                    <path d="M5 12.5l4.4 4.4L19 7.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>
                  <span className="block font-semibold text-[var(--bzl-fg)]">{card.title}</span>
                  <span className="block text-sm text-[var(--bzl-muted)]">{card.description}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="relative mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-semibold text-[var(--bzl-ink-2)]">
            {[setup.badges.oneClick, setup.badges.alwaysSynced, setup.badges.readyInMinutes].map((b) => (
              <span key={b} className="flex items-center gap-2">
                <i className="h-1.5 w-1.5 rounded-full bg-[var(--bzl-orange)]" />
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SyncSection;
