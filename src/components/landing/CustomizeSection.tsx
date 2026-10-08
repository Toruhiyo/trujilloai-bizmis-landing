import type { CSSProperties } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import AgentImage from "./AgentImage";
import Reveal from "./Reveal";

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

/** Personalization — "Make It Truly Yours": appearance and voice. */
const CustomizeSection = () => {
  const m = useMessages().customization;
  return (
    <section className="bzl-section">
      <div className="bzl-wrap grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="bzl-kicker">{m.badge}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="bzl-statement-sm mt-4">
              {m.titleLead} <span className="text-[var(--bzl-orange-strong)]">{m.titleHighlight}</span>
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="bzl-lead mt-5 max-w-lg">{m.lead}</p>
          </Reveal>
          <div className="mt-10 space-y-6">
            <Reveal delay={220}>
              <div className="border-l-2 border-[var(--bzl-orange)] pl-5">
                <h3 className="text-lg font-bold tracking-[-0.02em] text-[var(--bzl-fg)]">{m.avatar.title}</h3>
                <p className="mt-1 text-[var(--bzl-muted)]">{m.avatar.body}</p>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="border-l-2 border-[var(--bzl-orange)] pl-5">
                <h3 className="flex items-center gap-3 text-lg font-bold tracking-[-0.02em] text-[var(--bzl-fg)]">
                  {m.voiceCloning.title}
                  <Waveform />
                </h3>
                <p className="mt-1 text-[var(--bzl-muted)]">{m.voiceCloning.body}</p>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {LINEUP.map((a, i) => (
            <Reveal key={a.name} delay={i * 70}>
              <div
                className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-[0_14px_30px_-20px_rgba(28,24,20,0.45)] transition-transform duration-500 hover:-translate-y-1"
                style={{ background: `linear-gradient(180deg, color-mix(in oklab, ${a.tint} 14%, #fff), #fff)` }}
              >
                <AgentImage
                  name={a.name}
                  alt=""
                  sizes="(min-width: 1024px) 160px, 24vw"
                  className="absolute left-1/2 top-[7%] w-[84%] -translate-x-1/2"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomizeSection;
