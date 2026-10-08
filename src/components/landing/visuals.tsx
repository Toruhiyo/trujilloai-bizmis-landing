import { Check, Plus } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { useInView } from "./Reveal";
import AgentImage from "./AgentImage";
import type { AgentName } from "./AgentImage";
import { ClayCard, ClayTile, StoreWindow } from "./clay";

/** The agent widget in a store window's corner. */
export const CornerAgent = ({ name }: { name: AgentName }) => (
  <div className="absolute -bottom-5 -right-3 w-[30%] max-w-[170px] overflow-hidden rounded-2xl border border-[var(--bzl-border)] bg-[linear-gradient(180deg,#fff7ee,#fff)] shadow-[0_16px_40px_-14px_rgba(242,140,56,0.55)] sm:-right-6">
    <AgentImage name={name} alt="" sizes="170px" className="mx-auto w-[82%] translate-y-[8%]" />
  </div>
);

/** Convert: out of three, the agent picks the right one. */
export const PickVisual = () => {
  const m = useMessages();
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  return (
    <div ref={ref} className="relative">
      <StoreWindow label={m.landing.yourStore}>
        <div className="grid grid-cols-3 gap-4 p-5 pb-10 sm:gap-6 sm:p-8 sm:pb-12">
          <ClayCard shape="capsule" tint="sage" />
          <div className="relative">
            <ClayCard shape="sphere" tint="sand" picked={inView} />
            <span
              className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--bzl-orange)] px-2.5 py-1 text-[11px] font-semibold text-white shadow-[0_8px_18px_-8px_rgba(236,119,9,0.7)] transition-all duration-500 ${
                inView ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              {m.salesDemo.recommended}
            </span>
          </div>
          <ClayCard shape="cube" tint="warm" />
        </div>
      </StoreWindow>
      <CornerAgent name="style-victor" />
    </div>
  );
};

/** Upsell: the pair goes into the cart. */
export const BundleVisual = () => {
  const m = useMessages();
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  return (
    <div ref={ref} className="relative">
      <StoreWindow label={m.landing.yourStore}>
        <div className="relative flex items-center justify-center gap-4 p-6 pb-12 sm:gap-6 sm:p-10 sm:pb-14">
          <ClayCard shape="sphere" picked className="w-[34%]" />
          <Plus className="h-7 w-7 flex-shrink-0 text-[color-mix(in_oklab,var(--bzl-orange)_80%,#8a5a2b)]" strokeWidth={1.6} />
          <div className="relative w-[34%]">
            <ClayCard shape="slab" tint="warm" picked={inView} />
            <span
              className={`absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-[var(--bzl-orange-dark)] shadow transition-all duration-500 ${
                inView ? "scale-100 opacity-100" : "scale-75 opacity-0"
              }`}
              style={{ transitionDelay: "700ms", transitionTimingFunction: "var(--bzl-spring)" }}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
              {m.salesDemo.added}
            </span>
          </div>
        </div>
      </StoreWindow>
      <CornerAgent name="style-mia" />
    </div>
  );
};

/** Loyalty: the order lands, and the shopper knows when it arrives. */
export const OrderVisual = () => {
  const m = useMessages().salesDemo;
  return (
    <div className="relative">
      <StoreWindow label={useMessages().landing.yourStore}>
        <div className="p-5 pb-12 sm:p-8 sm:pb-14">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--bzl-orange)] text-white">
              <Check className="h-5 w-5" strokeWidth={3} />
            </span>
            <div>
              <p className="font-bold tracking-[-0.02em] text-[var(--bzl-fg)]">{m.orderConfirmed}</p>
              <p className="text-sm text-[var(--bzl-muted)]">{m.deliveryEstimate}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-[72px_1fr] items-center gap-4 sm:grid-cols-[96px_1fr]">
            <ClayTile shape="sphere" tint="orange" />
            <div className="space-y-2">
              <div className="bzl-tile-line w-3/4" />
              <div className="bzl-tile-line w-1/3" />
            </div>
          </div>
          <dl className="mt-6 space-y-1.5 border-t border-[var(--bzl-border)] pt-4 text-sm">
            <div className="flex justify-between text-[var(--bzl-muted)]">
              <dt>{m.subtotal}</dt>
              <dd className="h-2.5 w-14 self-center rounded bg-[#e8e8ed]" />
            </div>
            <div className="flex justify-between text-[var(--bzl-muted)]">
              <dt>{m.shipping}</dt>
              <dd className="font-semibold text-[var(--bzl-orange-dark)]">{m.free}</dd>
            </div>
            <div className="flex justify-between font-semibold text-[var(--bzl-fg)]">
              <dt>{m.total}</dt>
              <dd className="h-3 w-16 self-center rounded bg-[#d9d4cc]" />
            </div>
          </dl>
        </div>
      </StoreWindow>
      <CornerAgent name="style-luca" />
    </div>
  );
};
