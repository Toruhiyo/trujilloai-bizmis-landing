import type { ReactNode } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import {
  CartPlusIcon,
  FindIcon,
  IconTile,
  LoyaltyIcon,
  TrendIcon,
} from "./AnimatedIcons";
import type { AnimatedIcon } from "./AnimatedIcons";
import Reveal from "./Reveal";
import { useStickyHead } from "./useStickyHead";
import { BundleVisual, OrderVisual, PickVisual } from "./visuals";

/**
 * One sub-benefit as a clay panel (a big soft tinted card with film grain):
 * its animated icon — the quick confirmation of the benefit — over the copy on
 * one side, the device mockup showing it on the other.
 */
export const Pillar = ({
  index,
  kicker,
  title,
  body,
  visual,
  icon,
  tint,
}: {
  index: number;
  kicker: string;
  title: string;
  body: string;
  visual: ReactNode;
  icon: AnimatedIcon;
  tint: string;
}) => (
  <div className="bzl-sub is-panel">
    <div
      className={cn(
        "bzl-panel bzl-grain grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-[clamp(2rem,4svh,3.5rem)]",
        tint,
      )}
    >
      <div className={cn(index % 2 === 1 && "lg:order-2")}>
        <Reveal>
          <IconTile icon={icon} size="lg" />
        </Reveal>
        <Reveal delay={60}>
          <p className="bzl-kicker mt-6">{kicker}</p>
        </Reveal>
        <Reveal delay={120}>
          <h3 className="bzl-statement-sm mt-3">{title}</h3>
        </Reveal>
        <Reveal delay={180}>
          <p className="bzl-lead mt-4 max-w-lg">{body}</p>
        </Reveal>
      </div>
      <Reveal
        delay={120}
        className={cn(
          // as wide as the remaining height allows, so the mockup always fits the screen
          "mx-auto w-full max-w-[min(560px,calc((100svh-var(--bzl-head,12rem)-7rem)*1.3))]",
          index % 2 === 1 && "lg:order-1",
        )}
      >
        {visual}
      </Reveal>
    </div>
  </div>
);

const PILLARS: { icon: AnimatedIcon; tint: string }[] = [
  { icon: FindIcon, tint: "t-peach" },
  { icon: CartPlusIcon, tint: "t-butter" },
  { icon: LoyaltyIcon, tint: "t-blush" },
];

/** Boost Sales — "Convert. Upsell. Retain." with the classic landing's three pillars. */
const SalesSection = () => {
  const sales = useMessages().benefits.sales;
  const { section, head, extra, stuck } = useStickyHead<
    HTMLElement,
    HTMLDivElement
  >();
  const visuals = [
    <PickVisual key="pick" />,
    <BundleVisual key="bundle" />,
    <OrderVisual key="order" />,
  ];
  return (
    <section id="benefits" ref={section} className="bzl-section bzl-stack">
      <div className="bzl-wrap">
        {/* the section's title stays put while its three benefits pass under it;
            the subtitle folds away once it sticks */}
        <div ref={head} className="bzl-head text-center">
          <Reveal>
            <p className="bzl-kicker inline-flex items-center gap-2.5">
              <IconTile icon={TrendIcon} size="sm" />
              {sales.badge}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-3 text-[clamp(2rem,min(4.4vw,6.4svh),3.75rem)] font-bold leading-[1.04] tracking-[-0.04em] text-[var(--bzl-fg)]">
              {sales.title}
            </h2>
          </Reveal>
          <div
            ref={extra}
            className="grid transition-[grid-template-rows,opacity] duration-500"
            style={{
              gridTemplateRows: stuck ? "0fr" : "1fr",
              opacity: stuck ? 0 : 1,
              transitionTimingFunction: "var(--bzl-ease)",
            }}
          >
            <div className="overflow-hidden">
              <Reveal delay={160}>
                <p className="bzl-lead mx-auto max-w-4xl pt-3">
                  {sales.leadLong}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
        <div className="mt-16 space-y-8 md:mt-0 md:space-y-0">
          {sales.pillars.map((p, i) => (
            <Pillar
              key={p.title}
              index={i}
              kicker={p.subtitle}
              title={p.title}
              body={p.body}
              visual={visuals[i]}
              icon={PILLARS[i].icon}
              tint={PILLARS[i].tint}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SalesSection;
