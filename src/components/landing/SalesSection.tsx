import type { ReactNode } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { TrendIcon } from "./AnimatedIcons";
import PillarChip from "./PillarChip";
import Reveal from "./Reveal";
import { BuyVisual, CompareVisual, PickVisual } from "./visuals";

/**
 * One sub-benefit, straight on its pillar's band (no card of its own): a
 * quiet eyebrow in the pillar's accent, the copy on one side and the device
 * mockup showing the feature on the other, alternating sides down the band.
 */
const SubBenefit = ({
  index,
  kicker,
  title,
  body,
  visual,
}: {
  index: number;
  kicker: string;
  title: string;
  body: string;
  visual: ReactNode;
}) => (
  <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-2 lg:gap-20">
    <div className={cn(index % 2 === 1 && "lg:order-2")}>
      <Reveal>
        <p className="bzl-kicker bzl-sub-eyebrow">{kicker}</p>
      </Reveal>
      <Reveal delay={80}>
        <h3 className="bzl-statement-sm mt-4">{title}</h3>
      </Reveal>
      <Reveal delay={160}>
        <p className="bzl-lead mt-4 max-w-lg">{body}</p>
      </Reveal>
    </div>
    <Reveal
      delay={120}
      className={cn(
        // never taller than the screen under the nav
        "relative mx-auto w-full max-w-[min(580px,calc((100svh-8rem)*1.3))]",
        index % 2 === 1 && "lg:order-1",
      )}
    >
      {visual}
    </Reveal>
  </div>
);

/**
 * Boost Sales — one promise ("More visits end in a purchase"), proven in the
 * three moments a sale gets lost, the hero's find it / trust it / buy it. All
 * on one band in the Sales colours (Bizmis orange and apricot, with the
 * hero's grain). Its copy lives in `landing.sales` (the classic landing keeps
 * `benefits.sales`).
 */
const SalesSection = () => {
  const messages = useMessages();
  const badge = messages.benefits.sales.badge;
  const sales = messages.landing.sales;
  const visuals = [
    <PickVisual key="find" />,
    <CompareVisual key="trust" />,
    <BuyVisual key="buy" />,
  ];
  return (
    <section id="benefits" className="bzl-section bzl-band bzl-pillar p-sales">
      <div className="bzl-wrap">
        <div className="text-center">
          <Reveal>
            <PillarChip icon={TrendIcon} label={badge} />
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 text-[clamp(2.25rem,min(4.8vw,7svh),4rem)] font-bold leading-[1.04] tracking-[-0.04em] text-[var(--bzl-fg)]">
              {sales.title}
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="bzl-lead mx-auto mt-4 max-w-3xl">{sales.lead}</p>
          </Reveal>
        </div>
        <div className="mt-16 space-y-20 md:mt-[clamp(4rem,10svh,7rem)] md:space-y-[clamp(5rem,14svh,9rem)]">
          {sales.panels.map((p, i) => (
            <SubBenefit
              key={p.title}
              index={i}
              kicker={p.eyebrow}
              title={p.title}
              body={p.body}
              visual={visuals[i]}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SalesSection;
