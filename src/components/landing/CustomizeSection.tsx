import { useRef } from "react";
import type { CSSProperties } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import AvatarCarousel from "./AvatarCarousel";
import manifest from "./agents-manifest.json";
import type { CarouselAvatar } from "./AvatarCarousel";
import FeatureCard from "./FeatureCard";
import { AvatarIcon, VoiceIcon } from "./AnimatedIcons";
import Reveal from "./Reveal";

// Real Bizmis avatars, each wearing a (fictional, AI-generated) store's logo: either a vivid shirt
// with a one-colour logo, or a neutral shirt (white, black, oat) with a multicolour one. The tint is
// the store's colour (the shirt's, or the logo's on a neutral shirt) and tints the ambient light
// while that avatar is on stage. Ordered so neighbours never share a hue.
const LINEUP: readonly CarouselAvatar[] = [
  { name: "style-victor", label: "Victor", tint: "#2563eb" },
  { name: "style-teo", label: "Teo", tint: "#ef4444" },
  { name: "style-yusuke", label: "Yusuke", tint: "#65a30d" },
  { name: "style-marc", label: "Marc", tint: "#7c3aed" },
  { name: "style-luca", label: "Luca", tint: "#eab308" },
  { name: "style-mia", label: "Mia", tint: "#0ea5e9" },
  { name: "style-kiran", label: "Kiran", tint: "#e5487f" },
  { name: "style-yue", label: "Yue", tint: "#047857" },
  { name: "style-echo", label: "Echo", tint: "#e53935" },
  { name: "style-amber", label: "Amber", tint: "#d946ef" },
  { name: "style-will", label: "Will", tint: "#10b981" },
  { name: "style-adrian", label: "Adrian", tint: "#c0168f" },
];

// only avatars that have been rendered (an avatar added here before its render lands is skipped)
const SHOWN = LINEUP.filter((a) => a.name in manifest);

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
  const section = useRef<HTMLElement>(null);

  return (
    <section
      ref={section}
      className="bzl-section bzl-screen relative overflow-hidden"
    >
      {/* the carousel's ambient light, in the current avatar's colour (driven by AvatarCarousel) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ opacity: "var(--amb-glow, 0.6)" }}
      >
        {[
          "right-[-8%] top-[-12%] h-[85%] w-[52%]",
          "right-[22%] bottom-[-18%] h-[72%] w-[42%]",
          "right-[2%] bottom-[2%] h-[60%] w-[34%]",
        ].map((pos, k) => (
          <div
            key={pos}
            className={`absolute rounded-full blur-3xl ${pos}`}
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--amb-color, #f28c38) 78%, transparent), color-mix(in oklab, var(--amb-color, #f28c38) 22%, transparent) 55%, transparent 75%)",
              transform: `translate(var(--amb-x${k + 1}, 0), var(--amb-y${k + 1}, 0)) scale(var(--amb-s${k + 1}, 1))`,
            }}
          />
        ))}
      </div>
      <div className="bzl-wrap relative grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
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
                icon={AvatarIcon}
                title={m.avatar.title}
                body={m.avatar.body}
              />
            </Reveal>
            <Reveal delay={320}>
              <FeatureCard
                icon={VoiceIcon}
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
          <AvatarCarousel avatars={SHOWN} ambient={section} />
        </Reveal>
      </div>
    </section>
  );
};

export default CustomizeSection;
