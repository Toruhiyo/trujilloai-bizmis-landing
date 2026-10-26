import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { TrendIcon } from "../AnimatedIcons";
import PillarIntro from "../PillarIntro";
import { buyTimeline } from "./BuyMockup";
import { findTimeline } from "./FindMockup";
import SalesTitle, { SalesHeading } from "./SalesTitle";
import { trustTimeline } from "./TrustMockup";
import { useSalesCopy } from "./proto";

/* What the section (SalesSpine) builds on: the pillar's opener and docked
   bar, the beats' timelines, a live size. */

/** The docked bar's ground: the band's own orange (its middle stop), barely frosted. */
const BAR = "color-mix(in oklab, #f0913e 95%, transparent)";

const TIMELINES = [findTimeline, trustTimeline, buyTimeline];

/**
 * After a beat's fix lands: the funnel's solution written and ticked, then
 * the words' loss → win (beatcopy/BeatHL's AFTER_LABEL), and a beat to read
 * it (ms).
 */
const FIXED = 4400;

/**
 * Each beat's timeline: how long it is (ms) and when its stage gets fixed.
 * It always ends on the stage fixed (FIXED after the fix lands). The section
 * maps its scroll onto these, so a beat's mockup and funnel move with the
 * scroll as one, back and forth.
 */
export const useBeatTimelines = () => {
  const s = useSalesCopy();
  return TIMELINES.map((tl) => {
    const x = tl(s);
    return { duration: Math.max(x.duration, x.fixAt + FIXED), fixAt: x.fixAt };
  });
};
/** A beat at a moment: where it is on its timeline (`t`, ms), its length and its fix. */
export type Beat = { t: number; duration: number; fixAt: number };


/**
 * The section in the orange band: "Boost Sales" huge with "Shoppers Find
 * it. Trust it. Buy it." under it, docking as the sticky bar with `lit`
 * lit and underlined; the grouping goes in `children`.
 */
export const SalesShell = ({
  lit,
  className,
  children,
}: {
  lit: number | "all" | null;
  className?: string;
  children: ReactNode;
}) => {
  const m = useMessages();
  return (
    <section id="benefits" className={cn("sl sl-c bzl-band bzl-pillar p-sales", className)}>
      <SalesHeading as="p" />
      <PillarIntro
        index="01"
        name={m.benefits.sales.badge}
        icon={<TrendIcon />}
        line={<SalesTitle active="all" layout="big" as="span" />}
        lineClassName="sl-big"
        accent={BAR}
        // the payoff lights every part, with no underline (a mark only ever points at one part)
        docked={<SalesTitle active={lit} layout="line" as="p" marks className="sl-c-title" />}
      >
        {children}
      </PillarIntro>
    </section>
  );
};

/** An element's size (px), live. */
export const useSize = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ W: 0, H: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setSize((s) => (s.W === width && s.H === height ? s : { W: width, H: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
};

/** The device frames' shapes (width / height): browser 16:10, phone 390:844, tablet 4:3. */
export const DEVICE_ASPECT = [1.6, 390 / 844, 1024 / 768];
