import { useEffect, useState } from "react";
import { AudioLines, Palette, Volume2 } from "lucide-react";
import AgentImage from "@/components/landing/AgentImage";
import LiveAvatar from "@/components/landing/LiveAvatar";
import type { AgentName } from "@/components/landing/AgentImage";
import { ShotCard } from "./listingParts";
import { listingAsset } from "./listingAssets";

/** Meridian's Customize > Avatar (Welcome intro on), captured 2026-11-03. */
const SCREENSHOT_SRC = listingAsset("admin-customize-avatar.png");

/** The Bizmis primary, as the real widget themes its buttons. */
const ORANGE = "#F9A353";
/** The landing v2 ink and muted text (film-landing.css --bzl-fg, --bzl-muted). */
const INK = "#3b2416";
const MUTED = "#75695e";

/**
 * Three fictional stores' widgets, as on the landing's Make it truly yours
 * (scripts/render-landing-avatars.py PALETTE): each shirt follows its brand, a
 * vivid shirt with a one-colour logo or a black one with a multicolour logo,
 * no two hues alike and none near the Bizmis orange. Each avatar is frozen
 * partway through a different gesture; `holdMs` is how long after the model is
 * drawn the pose is held.
 */
const POSED_WIDGETS: {
  model: string;
  still: AgentName;
  shirt: string;
  logo: string;
  gesture: string;
  holdMs: number;
  dark: boolean;
  placeholder: string;
}[] = [
  // KUMO ("cloud"): sky blue, its navy wordmark
  { model: "luca", still: "style-luca", shirt: "#6EC8F5", logo: "kumo", gesture: "waving", holdMs: 1700, dark: false, placeholder: "A tea for slow mornings?" },
  // ZORA (a lightning bolt): black, the neon lime and magenta logo
  { model: "adrian", still: "style-adrian", shirt: "#1C1C1E", logo: "zora", gesture: "presenting_left", holdMs: 1300, dark: false, placeholder: "Which size fits me?" },
  // SOLARO (the sun): sun yellow, the navy sun mark, on the widget's dark theme
  { model: "amber", still: "style-amber", shirt: "#FFD23F", logo: "solaro-navy", gesture: "thumbsup", holdMs: 1100, dark: true, placeholder: "Will it arrive by Friday?" },
];

/** The real widget's glass card, light or dark (widget.css theme-bg-glassy and theme-border-glassy). */
const cardStyle = (dark: boolean) =>
  dark
    ? {
        borderColor: "rgba(255, 255, 255, 0.12)",
        backgroundColor: "rgba(14, 14, 17, 0.92)",
        boxShadow: "0 1px 0 rgba(255, 255, 255, 0.08) inset, 0 28px 60px -24px rgba(0, 0, 0, 0.55)",
      }
    : {
        borderColor: "rgba(255, 255, 255, 0.9)",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        boxShadow: "0 1px 0 rgba(255, 255, 255, 0.9) inset, 0 28px 60px -24px rgba(59, 36, 22, 0.3)",
      };

/** A storefront widget card whose live avatar plays one gesture, then holds that frame for the export. */
const PosedWidget = ({ model, still, shirt, logo, gesture, holdMs, dark, placeholder }: (typeof POSED_WIDGETS)[number]) => {
  const [live, setLive] = useState(false);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (!live) return;
    const t = window.setTimeout(() => setHeld(true), holdMs);
    return () => window.clearTimeout(t);
  }, [live, holdMs]);
  return (
    <div
      data-pose-pending={held ? undefined : ""}
      className="relative h-[19rem] w-[16.5rem] rounded-2xl border backdrop-blur-xl"
      style={cardStyle(dark)}
    >
      <span
        className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full border"
        style={{ borderColor: `${ORANGE}4d`, background: `${ORANGE}24`, color: ORANGE }}
        aria-hidden
      >
        <Volume2 className="h-4 w-4" />
      </span>
      <div className="relative h-[14.75rem] overflow-hidden rounded-t-2xl">
        <LiveAvatar
          model={model}
          shirtColor={shirt}
          logoUrl={listingAsset(`logos/${logo}.png`)}
          greet={false}
          gesture={live ? { name: gesture, key: 1 } : null}
          paused={held}
          onStatus={(status) => {
            if (status === "live") setLive(true);
          }}
          fallback={
            <AgentImage
              name={still}
              alt=""
              sizes="160px"
              className="absolute bottom-0 left-1/2 h-[14rem] w-auto -translate-x-1/2"
            />
          }
        />
      </div>
      <div className="px-3 pb-3 pt-1">
        <div
          className="flex h-[2.75rem] items-center rounded-2xl border py-1.5 pl-4 pr-1.5"
          style={
            dark
              ? { background: "rgba(255, 255, 255, 0.06)", borderColor: "rgba(255, 255, 255, 0.14)" }
              : { background: "rgba(255, 255, 255, 0.6)", borderColor: "rgba(0, 0, 0, 0.08)" }
          }
        >
          <span className={`min-w-0 flex-1 truncate text-sm ${dark ? "text-white/55" : "text-neutral-400"}`}>
            {placeholder}
          </span>
          <span
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-white shadow-sm"
            style={{ background: ORANGE }}
            aria-hidden
          >
            <AudioLines className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </div>
  );
};

/** Landing v2's section head (SectionHead, film-landing.css .bzl-shead): pill eyebrow, Inter 800 title, muted lead. */
const LandingHead = () => (
  <div className="flex flex-col items-center gap-4 text-center" style={{ fontFamily: "Inter, sans-serif" }}>
    <p
      className="inline-flex items-center gap-[0.6em] whitespace-nowrap rounded-full bg-white py-[0.38em] pl-[0.38em] pr-[1.15em] text-[1.2rem] font-bold leading-[1.1] tracking-[-0.02em]"
      style={{ color: INK, boxShadow: "inset 0 0 0 1px rgb(59 36 22 / 0.09)" }}
    >
      <span className="grid aspect-square w-[2.3em] place-items-center rounded-full bg-[#fff3e7]" style={{ color: ORANGE }}>
        <Palette className="h-[56%] w-[56%]" strokeWidth={2} />
      </span>
      Personalization
    </p>
    <h2 className="m-0 text-[5rem] font-extrabold leading-none tracking-[-0.05em]" style={{ color: INK }}>
      Make it truly yours
    </h2>
    <p className="m-0 text-[1.5rem] leading-[1.45] tracking-[-0.005em]" style={{ color: MUTED }}>
      Pick its look, put your logo on its shirt, and choose a light or dark widget.
    </p>
  </div>
);

const BrandPersonalizationSlide = () => (
  <div className="relative flex h-full w-full flex-col overflow-visible pt-4">
    <LandingHead />
    <div className="relative mt-10 flex-1">
      {/* the orange ambient light behind the widgets, as on the landing's Customize */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[8%] top-[-10%] h-[120%] w-[60%] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgb(249 163 83 / 0.28), rgb(249 163 83 / 0.08) 55%, transparent 75%)" }}
      />
      <ShotCard
        src={SCREENSHOT_SRC}
        alt="Customize in the Bizmis admin: avatar, outfit color, logo and welcome intro"
        className="absolute left-[2%] top-2 z-10 aspect-[1506/778] w-[47%]"
      />
      <div className="absolute bottom-0 right-[1%] z-20 flex items-end gap-5">
        {POSED_WIDGETS.map((w, i) => (
          <div key={w.model} className={i === 1 ? "mb-10" : undefined}>
            <PosedWidget {...w} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default BrandPersonalizationSlide;
