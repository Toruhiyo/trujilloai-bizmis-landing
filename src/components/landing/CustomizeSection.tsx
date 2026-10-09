import type { CSSProperties } from "react";
import { AudioLines, UserRound } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import AvatarCarousel from "./AvatarCarousel";
import type { CarouselAvatar } from "./AvatarCarousel";
import FeatureCard from "./FeatureCard";
import Reveal from "./Reveal";

// Real Bizmis avatars, each dressed in a different store's colour, Bizmis logo on the shirt.
const LINEUP: readonly CarouselAvatar[] = [
  { name: "style-victor", label: "Victor", tint: "#f28c38" },
  { name: "style-teo", label: "Teo", tint: "#d1001a" },
  { name: "style-luca", label: "Luca", tint: "#29573f" },
  { name: "style-kiran", label: "Kiran", tint: "#a855f7" },
  { name: "style-yue", label: "Yue", tint: "#701c33" },
  { name: "style-echo", label: "Echo", tint: "#1e293b" },
  { name: "style-mia", label: "Mia", tint: "#e8b800" },
  { name: "style-adrian", label: "Adrian", tint: "#7fa83a" },
];

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
 * Personalization — "Make It Truly Yours": appearance and voice, with the
 * avatars shown one at a time in a carousel, each in its store's colour.
 */
const CustomizeSection = () => {
  const messages = useMessages();
  const m = messages.customization;

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
          <div className="mt-10 grid max-w-md items-start gap-3">
            <Reveal delay={220}>
              <FeatureCard
                icon={UserRound}
                title={m.avatar.title}
                body={m.avatar.body}
              />
            </Reveal>
            <Reveal delay={320}>
              <FeatureCard
                icon={AudioLines}
                title={m.voiceCloning.title}
                badge={
                  <span className="rounded-full bg-[color-mix(in_oklab,var(--bzl-orange)_16%,#fff)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--bzl-orange-dark)]">
                    {messages.common.soon}
                  </span>
                }
                front={<Waveform />}
                body={m.voiceCloning.body}
              />
            </Reveal>
          </div>
        </div>

        <Reveal delay={120}>
          <AvatarCarousel avatars={LINEUP} />
        </Reveal>
      </div>
    </section>
  );
};

export default CustomizeSection;
