import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { TrendIcon } from "../AnimatedIcons";
import PillarIntro from "../PillarIntro";
import { buyTimeline } from "./BuyMockup";
import { findTimeline } from "./FindMockup";
import { useScene } from "./hooks";
import SalesTitle, { SalesHeading } from "./SalesTitle";
import { trustTimeline } from "./TrustMockup";
import { useSalesCopy } from "./proto";

/* What the grouping prototypes (?grp=2..4, SalesSection) share with the
   stage (SalesC): the pillar's opener and docked bar, and a beat's clock. */

/** The docked bar's ground: the band's own orange (its middle stop), barely frosted. */
const BAR = "color-mix(in oklab, #f0913e 95%, transparent)";

const TIMELINES = [findTimeline, trustTimeline, buyTimeline];

/**
 * A beat's one clock: its mockup and its funnel both run on it (same
 * duration, same rewind), so the pair plays and rewinds as one. Its
 * sentinel goes over the beat; `play: false` holds it at the start.
 */
export const useBeat = (i: number, play?: boolean) => {
  const s = useSalesCopy();
  const tl = TIMELINES[i](s);
  const scene = useScene(tl.duration, play);
  return { ...scene, duration: tl.duration, fixAt: tl.fixAt };
};
export type Beat = ReturnType<typeof useBeat>;

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
        docked={<SalesTitle active={lit} layout="line" as="p" marks={lit !== "all"} className="sl-c-title" />}
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
