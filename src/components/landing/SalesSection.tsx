import type { ReactNode } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";
import { useStickyHead } from "./useStickyHead";
import { BundleVisual, OrderVisual, PickVisual } from "./visuals";

/** One benefit: copy on one side, its store mockup on the other. */
export const Pillar = ({
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
  <div className="bzl-sub grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
    <div className={cn(index % 2 === 1 && "lg:order-2")}>
      <Reveal>
        <p className="bzl-kicker">{kicker}</p>
      </Reveal>
      <Reveal delay={80}>
        <h3 className="bzl-statement-sm mt-3">{title}</h3>
      </Reveal>
      <Reveal delay={160}>
        <p className="bzl-lead mt-5 max-w-lg">{body}</p>
      </Reveal>
    </div>
    <Reveal
      delay={120}
      className={cn(
        // as wide as the remaining height allows, so the mockup always fits the screen
        "mx-auto w-full max-w-[min(560px,calc((100svh-var(--bzl-head,12rem)-4rem)*1.3))]",
        index % 2 === 1 && "lg:order-1",
      )}
    >
      {visual}
    </Reveal>
  </div>
);

/** Boost Sales — "Convert. Upsell. Retain." with the classic landing's three pillars. */
const SalesSection = () => {
  const sales = useMessages().benefits.sales;
  const { section, head } = useStickyHead<HTMLElement, HTMLDivElement>();
  const visuals = [
    <PickVisual key="pick" />,
    <BundleVisual key="bundle" />,
    <OrderVisual key="order" />,
  ];
  return (
    <section id="benefits" ref={section} className="bzl-section bzl-stack">
      <div className="bzl-wrap">
        {/* the section's title stays put while its three benefits pass under it */}
        <div ref={head} className="bzl-head text-center">
          <Reveal>
            <p className="bzl-kicker">{sales.badge}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-3 text-[clamp(2rem,min(4.4vw,6.4svh),3.75rem)] font-bold leading-[1.04] tracking-[-0.04em] text-[var(--bzl-fg)]">
              {sales.title}
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="bzl-lead mx-auto mt-3 max-w-4xl">{sales.leadLong}</p>
          </Reveal>
        </div>
        <div className="mt-16 space-y-24 md:mt-0 md:space-y-0">
          {sales.pillars.map((p, i) => (
            <Pillar
              key={p.title}
              index={i}
              kicker={p.subtitle}
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
