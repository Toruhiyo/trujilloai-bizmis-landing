import { useRef } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import AvatarCarousel from "./AvatarCarousel";
import manifest from "./agents-manifest.json";
import type { CarouselAvatar } from "./AvatarCarousel";
import FeatureCard from "./FeatureCard";
import { AvatarIcon, VoiceIcon } from "./AnimatedIcons";
import Reveal from "./Reveal";
import { MarkerEdge, useSep } from "./SectionSep";

// Real Bizmis avatars, each wearing a (fictional, AI-generated) store's logo: either a vivid shirt
// with a one-colour logo, or a neutral shirt (white, black, oat) with a multicolour one. The tint is
// the store's colour (the shirt's, or the logo's on a neutral shirt) and tints the ambient light
// while that avatar is on stage. Ordered so neighbours never share a hue; it opens on Luca's
// soft yellow (a blue first frame sat too hard against the warm page).
const LINEUP: readonly CarouselAvatar[] = [
  { name: "style-luca", label: "Luca", tint: "#eab308" },
  { name: "style-mia", label: "Mia", tint: "#0ea5e9" },
  { name: "style-kiran", label: "Kiran", tint: "#e5487f" },
  { name: "style-yue", label: "Yue", tint: "#047857" },
  { name: "style-echo", label: "Echo", tint: "#e53935" },
  { name: "style-amber", label: "Amber", tint: "#d946ef" },
  { name: "style-will", label: "Will", tint: "#10b981" },
  { name: "style-adrian", label: "Adrian", tint: "#c0168f" },
  { name: "style-victor", label: "Victor", tint: "#2563eb" },
  { name: "style-teo", label: "Teo", tint: "#ef4444" },
  { name: "style-yusuke", label: "Yusuke", tint: "#65a30d" },
  { name: "style-marc", label: "Marc", tint: "#7c3aed" },
];

// only avatars that have been rendered (an avatar added here before its render lands is skipped)
const SHOWN = LINEUP.filter((a) => a.name in manifest);

/**
 * Personalization — "Make It Truly Yours": appearance and voice, with the
 * avatars shown one at a time in a carousel, each in its store's colour.
 */
const CustomizeSection = () => {
  const messages = useMessages();
  const m = messages.customization;
  const c = messages.landing.customize;
  const section = useRef<HTMLElement>(null);
  const sep = useSep();

  return (
    <section
      ref={section}
      // bzl-customize: the section's own name (the styles key on it, never on its place in the page);
      // x clipped only, so ?sep=3's marker edges can sit just outside it (the glow is masked to it)
      className="bzl-customize bzl-section bzl-screen relative overflow-x-clip"
    >
      {/* the carousel's ambient light, in the current avatar's colour (driven by AvatarCarousel);
          feathered out at the section's top and bottom (bzl-customize-glow), so no seam ever cuts it */}
      <div
        aria-hidden="true"
        className="bzl-customize-glow pointer-events-none absolute inset-0"
        style={{ opacity: "var(--amb-glow, 0.6)" }}
      >
        {[
          "right-[-8%] top-[4%] h-[80%] w-[52%]",
          "right-[22%] bottom-[0%] h-[66%] w-[42%]",
          "right-[2%] bottom-[8%] h-[56%] w-[34%]",
        ].map((pos, k) => (
          <div
            key={pos}
            className={`absolute rounded-full blur-3xl ${pos}`}
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--amb-color, hsl(var(--primary))) 78%, transparent), color-mix(in oklab, var(--amb-color, hsl(var(--primary))) 22%, transparent) 55%, transparent 75%)",
              transform: `translate(var(--amb-x${k + 1}, 0), var(--amb-y${k + 1}, 0)) scale(var(--amb-s${k + 1}, 1))`,
            }}
          />
        ))}
      </div>
      <div className="bzl-wrap relative grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          {/* its own header, the kicker over the title */}
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
            <p className="bzl-lead mt-4 max-w-md">{c.lead}</p>
          </Reveal>
          {/* (phones: the carousel says it on its own; the cards would push it off the first screen) */}
          <div className="mt-8 hidden max-w-md items-start gap-2.5 sm:grid">
            <Reveal delay={220}>
              <FeatureCard
                icon={AvatarIcon}
                title={c.avatar.title}
                body={c.avatar.body}
              />
            </Reveal>
            <Reveal delay={320}>
              <FeatureCard
                icon={VoiceIcon}
                title={c.voice.title}
                badge={
                  <span className="rounded-full bg-[var(--bzl-primary-soft,var(--bzl-orange-wash))] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--bzl-orange-dark)]">
                    {messages.common.soon}
                  </span>
                }
                body={c.voice.body}
              />
            </Reveal>
          </div>
        </div>

        <Reveal delay={120}>
          <AvatarCarousel avatars={SHOWN} ambient={section} />
        </Reveal>
      </div>
      {/* ?sep=3: the band's hand-drawn way in and out */}
      {sep === "3" && (
        <>
          <MarkerEdge side="top" seed={3} />
          <MarkerEdge side="bottom" seed={4} />
        </>
      )}
    </section>
  );
};

export default CustomizeSection;
