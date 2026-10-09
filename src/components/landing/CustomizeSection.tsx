import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useMessages } from "@/i18n/LocaleProvider";
import AgentImage from "./AgentImage";
import Reveal, { useInView } from "./Reveal";

// Real Bizmis avatars, each dressed for a different kind of store.
const LINEUP = [
  { name: "style-victor", tint: "#f28c38" },
  { name: "style-teo", tint: "#d1001a" },
  { name: "style-luca", tint: "#29573f" },
  { name: "style-kiran", tint: "#a855f7" },
  { name: "style-yue", tint: "#701c33" },
  { name: "style-echo", tint: "#1e293b" },
  { name: "style-mia", tint: "#e8b800" },
  { name: "style-adrian", tint: "#7fa83a" },
] as const;

const Waveform = () => (
  <span className="flex h-5 items-center gap-[3px]" aria-hidden="true">
    {[5, 11, 16, 9, 14, 6, 12, 18, 8, 13, 5].map((h, i) => (
      <i
        key={i}
        className="w-[3px] animate-pulse rounded-full bg-[var(--bzl-orange)]"
        style={{ height: h, animationDelay: `${i * 90}ms` } as CSSProperties}
      />
    ))}
  </span>
);

/**
 * Personalization — "Make It Truly Yours": appearance and voice. The line-up
 * idles (each avatar breathing on its own beat) while a spotlight walks the
 * grid, one look stepping forward at a time.
 */
const CustomizeSection = () => {
  const messages = useMessages();
  const m = messages.customization;
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const [spot, setSpot] = useState(-1);

  useEffect(() => {
    if (
      !inView ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const t = window.setInterval(
      () => setSpot((s) => (s + 1) % LINEUP.length),
      1400,
    );
    return () => window.clearInterval(t);
  }, [inView]);

  return (
    <section className="bzl-section">
      <div className="bzl-wrap grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="bzl-kicker">{m.badge}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="bzl-statement-sm mt-4">
              {m.titleLead}{" "}
              <span className="text-[var(--bzl-orange-strong)]">
                {m.titleHighlight}
              </span>
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="bzl-lead mt-5 max-w-lg">{m.lead}</p>
          </Reveal>
          <div className="mt-10 space-y-6">
            <Reveal delay={220}>
              <div className="border-l-2 border-[var(--bzl-orange)] pl-5">
                <h3 className="text-lg font-bold tracking-[-0.02em] text-[var(--bzl-fg)]">
                  {m.avatar.title}
                </h3>
                <p className="mt-1 text-[var(--bzl-muted)]">{m.avatar.body}</p>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="border-l-2 border-[var(--bzl-orange)] pl-5">
                <h3 className="flex items-center gap-3 text-lg font-bold tracking-[-0.02em] text-[var(--bzl-fg)]">
                  {m.voiceCloning.title}
                  <Waveform />
                  <span className="rounded-full bg-[color-mix(in_oklab,var(--bzl-orange)_16%,#fff)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--bzl-orange-dark)]">
                    {messages.common.soon}
                  </span>
                </h3>
                <p className="mt-1 text-[var(--bzl-muted)]">
                  {m.voiceCloning.body}
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        <div ref={ref} className="grid grid-cols-4 gap-3 sm:gap-4">
          {LINEUP.map((a, i) => (
            <Reveal key={a.name} delay={i * 70}>
              <div className="bzl-idle" style={{ "--i": i } as CSSProperties}>
                <div
                  className={cn(
                    "relative aspect-[3/4] overflow-hidden rounded-2xl transition-[transform,box-shadow] duration-700",
                    spot === i
                      ? "-translate-y-2 scale-[1.04] shadow-[0_26px_40px_-22px_rgba(28,24,20,0.55)]"
                      : "shadow-[0_14px_30px_-20px_rgba(28,24,20,0.45)]",
                  )}
                  style={{
                    background: `linear-gradient(180deg, color-mix(in oklab, ${a.tint} ${spot === i ? 30 : 14}%, #fff), #fff)`,
                    transitionTimingFunction: "var(--bzl-spring)",
                  }}
                >
                  <AgentImage
                    name={a.name}
                    alt=""
                    sizes="(min-width: 1024px) 160px, 24vw"
                    className="absolute left-1/2 top-[7%] w-[84%] -translate-x-1/2"
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomizeSection;
