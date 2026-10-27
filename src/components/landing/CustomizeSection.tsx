import { useRef } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import AvatarCarousel from "./AvatarCarousel";
import manifest from "./agents-manifest.json";
import palette from "./brand-palette.json";
import type { CarouselAvatar } from "./AvatarCarousel";
import FeatureCard from "./FeatureCard";
import { AvatarIcon, VoiceIcon } from "./AnimatedIcons";
import { Palette } from "lucide-react";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { MarkerEdge, useSep } from "./SectionSep";

// Real Bizmis avatars, each wearing a (fictional, AI-generated) store's logo: either a vivid shirt
// with a one-colour logo, or a neutral or pale shirt with a multicolour one. Every shirt follows its
// brand's name (sky-blue KUMO, "cloud"; coral papaya; sun-yellow SOLARO…); the palette lives in
// scripts/render-landing-avatars.py, which writes brand-palette.json, so the spotlight's colour always
// matches the shirt. Ordered so neighbours never share a hue or a warmth; it opens on Luca.
const brandColor = (name: string) =>
  (palette as Record<string, { glow: string }>)[name]?.glow;
const LINEUP: readonly CarouselAvatar[] = (
  [
    { name: "style-luca", label: "Luca" }, // KUMO, sky blue
    { name: "style-mia", label: "Mia" }, // papaya, coral
    { name: "style-will", label: "Will" }, // TIDEWELL, ocean teal
    { name: "style-yue", label: "Yue" }, // AURELITH, wine and gold
    { name: "style-amber", label: "Amber" }, // SOLARO, sun yellow
    { name: "style-victor", label: "Victor" }, // NUBO, royal blue
    { name: "style-kiran", label: "Kiran" }, // bloom, blossom pink
    { name: "style-yusuke", label: "Yusuke" }, // VERDA, leaf lime
    { name: "style-echo", label: "Echo" }, // FERRO & CO., gunmetal
    { name: "style-marc", label: "Marc" }, // PIXORA, electric violet
    { name: "style-teo", label: "Teo" }, // fizzwick, white (soda-blue glow)
    { name: "style-adrian", label: "Adrian" }, // ZORA, black (magenta glow)
  ] as const
).map((a) => ({ ...a, color: brandColor(a.name) }));

// only avatars that have been rendered (an avatar added here before its render lands is skipped)
const SHOWN = LINEUP.filter((a) => a.name in manifest);

/**
 * Personalization, "Make it truly yours": appearance and voice, with the
 * avatars shown one at a time in a carousel. Composed as One-Click Setup:
 * the centred header (as the pillars' openers, SectionHead), then on one
 * centre line the two feature cards and the carousel, each half the stage.
 * The page's two colours, but for one: the ambient light stays the primary,
 * while the spotlight under the centre avatar (and a muted tint of the big
 * name above it) takes that avatar's brand colour, crossfading as the ring
 * turns. Besides that only the avatars' own shirts bring other colours.
 */
const CustomizeSection = () => {
  const messages = useMessages();
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
      {/* the carousel's ambient light, in the primary (drifting and breathing with the ring, AvatarCarousel);
          feathered out at the section's edges (bzl-customize-glow), so no seam ever cuts it */}
      <div
        aria-hidden="true"
        className="bzl-customize-glow pointer-events-none absolute inset-0"
        style={{ opacity: "var(--amb-glow, 0.6)" }}
      >
        {[
          "right-[8%] top-[24%] h-[62%] w-[40%]",
          "right-[24%] bottom-[4%] h-[50%] w-[32%]",
          "right-[4%] bottom-[10%] h-[46%] w-[28%]",
        ].map((pos, k) => (
          <div
            key={pos}
            className={`absolute rounded-full blur-3xl ${pos}`}
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, hsl(var(--primary)) 30%, transparent), color-mix(in oklab, hsl(var(--primary)) 9%, transparent) 55%, transparent 75%)",
              transform: `translate(var(--amb-x${k + 1}, 0), var(--amb-y${k + 1}, 0)) scale(var(--amb-s${k + 1}, 1))`,
            }}
          />
        ))}
      </div>
      <div className="bzl-wrap relative">
        <SectionHead icon={Palette} eyebrow={c.eyebrow} title={c.title} lead={c.lead} />

        <div className="mx-auto mt-[clamp(1rem,3svh,2rem)] grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
          {/* (phones: the carousel says it on its own; the cards would push it off the first screen) */}
          <div className="order-2 mx-auto hidden w-full max-w-md items-start gap-2.5 sm:grid lg:order-1 lg:mr-0">
            <Reveal delay={220}>
              <FeatureCard icon={AvatarIcon} title={c.avatar.title} body={c.avatar.body} />
            </Reveal>
            <Reveal delay={320}>
              <FeatureCard
                icon={VoiceIcon}
                title={c.voice.title}
                badge={
                  <span className="rounded-full bg-[var(--bzl-primary-soft,var(--bzl-orange-wash))] px-2.5 py-0.5 text-xs font-semibold text-[var(--bzl-fg)]">
                    {messages.common.soon}
                  </span>
                }
                body={c.voice.body}
              />
            </Reveal>
          </div>

          <Reveal delay={120} className="order-1 lg:order-2">
            <AvatarCarousel avatars={SHOWN} ambient={section} stageClassName="max-w-[min(30rem,calc(100svh-23rem))]" />
          </Reveal>
        </div>
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
