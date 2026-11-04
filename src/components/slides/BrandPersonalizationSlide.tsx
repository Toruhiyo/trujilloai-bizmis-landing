import { useEffect, useState } from "react";
import { FaBook, FaPalette, FaUserAlt, FaWindowMaximize } from "react-icons/fa";
import { AudioLines, Volume2 } from "lucide-react";
import AgentImage from "@/components/landing/AgentImage";
import LiveAvatar from "@/components/landing/LiveAvatar";
import type { AgentName } from "@/components/landing/AgentImage";
import { FeatureCard, ShotCard, Stains, TitleBlock } from "./listingParts";
import { listingAsset } from "./listingAssets";

/** Meridian's Customize > Avatar (Welcome intro on), captured 2026-11-03. */
const SCREENSHOT_SRC = listingAsset("admin-customize-avatar.png");

/** The Bizmis primary, as the real widget themes its buttons. */
const ORANGE = "#F9A353";

/**
 * Three stores' widgets (shirt colours from the landing's brand palette), each
 * avatar frozen partway through a different gesture of the shared clips.
 * `holdMs` is how long after the model is drawn the pose is held.
 */
const POSED_WIDGETS: {
  model: string;
  still: AgentName;
  shirt: string;
  gesture: string;
  holdMs: number;
  dark: boolean;
  placeholder: string;
}[] = [
  { model: "mia", still: "style-mia", shirt: "#FF6F61", gesture: "waving", holdMs: 1700, dark: false, placeholder: "Help me find a gift." },
  { model: "will", still: "style-will", shirt: "#2EC4B6", gesture: "presenting_left", holdMs: 1300, dark: true, placeholder: "Which size fits me?" },
  { model: "kiran", still: "style-kiran", shirt: "#F7CFD8", gesture: "thumbsup", holdMs: 1100, dark: false, placeholder: "Will it arrive by Friday?" },
];

/** The real widget's glass card, light or dark (widget.css theme-bg-glassy and theme-border-glassy). */
const cardStyle = (dark: boolean) =>
  dark
    ? {
        borderColor: "rgba(255, 255, 255, 0.12)",
        backgroundColor: "rgba(14, 14, 17, 0.92)",
        boxShadow: "0 1px 0 rgba(255, 255, 255, 0.08) inset, 0 20px 48px -24px rgba(0, 0, 0, 0.6)",
      }
    : {
        borderColor: "rgba(255, 255, 255, 0.8)",
        backgroundColor: "rgba(255, 255, 255, 0.78)",
        boxShadow: "0 1px 0 rgba(255, 255, 255, 0.9) inset, 0 20px 48px -24px rgba(28, 24, 20, 0.28)",
      };

/** A storefront widget card whose live avatar plays one gesture, then holds that frame for the export. */
const PosedWidget = ({ model, still, shirt, gesture, holdMs, dark, placeholder }: (typeof POSED_WIDGETS)[number]) => {
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
      className="relative h-[18.5rem] w-[16rem] rounded-xl border backdrop-blur-xl"
      style={cardStyle(dark)}
    >
      <span
        className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full border"
        style={{ borderColor: `${ORANGE}4d`, background: `${ORANGE}24`, color: ORANGE }}
        aria-hidden
      >
        <Volume2 className="h-4 w-4" />
      </span>
      <div className="relative h-[14.375rem] overflow-hidden rounded-t-xl">
        <LiveAvatar
          model={model}
          shirtColor={shirt}
          logo={false}
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

const BrandPersonalizationSlide = () => (
  <div className="relative grid h-full w-full grid-cols-[1.35fr_0.85fr] gap-x-12 overflow-visible">
    <div className="relative h-full min-h-0 min-w-0 overflow-visible">
      <Stains />
      <ShotCard
        src={SCREENSHOT_SRC}
        alt="Customize in the Bizmis admin: avatar, outfit color, logo and welcome intro"
        className="absolute left-0 top-6 z-10 aspect-[1506/778] w-[86%]"
      />
      <div className="absolute bottom-4 right-[-28px] z-20 flex items-end gap-4">
        {POSED_WIDGETS.map((w, i) => (
          <div key={w.model} className={i === 1 ? "mb-10" : undefined}>
            <PosedWidget {...w} />
          </div>
        ))}
      </div>
    </div>
    <div className="flex min-w-0 flex-col justify-center gap-8">
      <TitleBlock
        Icon={FaPalette}
        eyebrow="Customize"
        title={
          <>
            Make It
            <br />
            Truly Yours
          </>
        }
        lead="Pick its avatar, put your logo on its shirt, and set what it knows and how it sells."
      />
      <div className="flex flex-col gap-3">
        <FeatureCard Icon={FaUserAlt} title="Avatar and welcome intro">
          Your outfit color and logo, and a greeting when shoppers arrive.
        </FeatureCard>
        <FeatureCard Icon={FaWindowMaximize} title="Widget and chat">
          Light or dark, where it sits on the page and how it starts the chat.
        </FeatureCard>
        <FeatureCard Icon={FaBook} title="Knowledge and guidelines">
          Your store's words, and the way you want it to sell.
        </FeatureCard>
      </div>
    </div>
  </div>
);

export default BrandPersonalizationSlide;
