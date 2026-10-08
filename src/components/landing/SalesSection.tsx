import type { ReactNode } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";
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
  <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
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
    <Reveal delay={120} className={cn("mx-auto w-full max-w-[560px]", index % 2 === 1 && "lg:order-1")}>
      {visual}
    </Reveal>
  </div>
);

/** Boost Sales — "Convert. Upsell. Retain." with the classic landing's three pillars. */
const SalesSection = () => {
  const sales = useMessages().benefits.sales;
  const visuals = [<PickVisual key="pick" />, <BundleVisual key="bundle" />, <OrderVisual key="order" />];
  return (
    <section id="benefits" className="bzl-section">
      <div className="bzl-wrap">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="bzl-kicker">{sales.badge}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="bzl-statement mt-4">{sales.title}</h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="bzl-lead mx-auto mt-6 max-w-2xl">{sales.leadLong}</p>
          </Reveal>
        </div>
        <div className="mt-20 space-y-28 sm:mt-28 sm:space-y-36">
          {sales.pillars.map((p, i) => (
            <Pillar key={p.title} index={i} kicker={p.subtitle} title={p.title} body={p.body} visual={visuals[i]} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SalesSection;
