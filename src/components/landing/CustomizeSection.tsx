import { useLayoutEffect, useRef } from "react";
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

/**
 * The ambient light's three blobs, around the carousel's stage: their centres offset from the
 * stage's centre (dx, dy) and their sizes (w, h), all in stage widths. The big one behind the
 * avatars, a smaller one low on each side (where the right-anchored places had them at 1440).
 */
const GLOW = [
  { dx: 0.05, dy: -0.12, w: 1.25, h: 1.2 },
  { dx: -0.45, dy: 0.42, w: 1, h: 0.95 },
  { dx: 0.5, dy: 0.3, w: 0.9, h: 0.9 },
] as const;

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

  // where the carousel's stage sits in the section (its centre and width, px), for the ambient light
  useLayoutEffect(() => {
    const s = section.current;
    const stage = s?.querySelector<HTMLElement>(".bzl-cz-stage");
    if (!s || !stage || typeof ResizeObserver === "undefined") return;
    const place = () => {
      const a = s.getBoundingClientRect();
      const b = stage.getBoundingClientRect();
      if (!b.width) return;
      s.style.setProperty("--cz-x", `${(b.left + b.width / 2 - a.left).toFixed(1)}px`);
      s.style.setProperty("--cz-y", `${(b.top + b.height / 2 - a.top).toFixed(1)}px`);
      s.style.setProperty("--cz-r", `${b.width.toFixed(1)}px`);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(s);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

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
        {GLOW.map((b, k) => (
          <div
            key={k}
            className="absolute rounded-full blur-3xl"
            style={{
              // centred on the carousel's stage (--cz-x/-y, its size --cz-r, measured below), so the light stays
              // with the avatars however the section is laid out; the old right-anchored places as the fallback
              left: `calc(var(--cz-x, 70%) + ${b.dx} * var(--cz-r, 30%) - ${b.w / 2} * var(--cz-r, 30%))`,
              top: `calc(var(--cz-y, 55%) + ${b.dy} * var(--cz-r, 30%) - ${b.h / 2} * var(--cz-r, 30%))`,
              width: `calc(${b.w} * var(--cz-r, 30%))`,
              height: `calc(${b.h} * var(--cz-r, 30%))`,
              background:
                "radial-gradient(closest-side, color-mix(in oklab, hsl(var(--primary)) 30%, transparent), color-mix(in oklab, hsl(var(--primary)) 9%, transparent) 55%, transparent 75%)",
              transform: `translate(var(--amb-x${k + 1}, 0), var(--amb-y${k + 1}, 0)) scale(var(--amb-s${k + 1}, 1))`,
            }}
          />
        ))}
      </div>
      <div className="bzl-wrap relative">
        <SectionHead icon={Palette} eyebrow={c.eyebrow} title={c.title} lead={c.lead} />

        <div className="bzl-cz-grid mx-auto mt-[clamp(1rem,3svh,2rem)] grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
          {/* (phones: the carousel says it on its own; the cards would push it off the first screen) */}
          <div className="bzl-cz-cards order-2 mx-auto hidden w-full max-w-md items-start gap-2.5 sm:grid lg:order-1 lg:mr-0">
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

          <Reveal delay={120} className="bzl-cz-carousel order-1 lg:order-2">
            {/* never under 14rem (a phone on its side has no 23rem to spare: it sets the stage beside the head instead, landing-responsive.css) */}
            <AvatarCarousel
              avatars={SHOWN}
              ambient={section}
              stageClassName="bzl-cz-stage max-w-[min(30rem,max(14rem,calc(100svh-23rem)))]"
            />
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
