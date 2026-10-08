import type { ReactNode } from "react";
import { Check, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { useInView } from "./Reveal";
import BizmisWidget, { Captions, NavBanner } from "./BizmisWidget";
import type { WidgetState } from "./BizmisWidget";
import type { AgentName } from "./AgentImage";
import { ClayCard, ClayTile, StoreWindow } from "./clay";

/**
 * A store page with the real Bizmis widget in its corner (scaled down, as it
 * would sit on a page), optionally the widget's captions at the page's foot.
 */
export const StoreWithWidget = ({
  children,
  agent,
  state,
  tool,
  above,
  caption,
}: {
  children: ReactNode;
  agent: AgentName;
  state: WidgetState;
  tool?: LucideIcon;
  above?: ReactNode;
  caption?: string;
}) => {
  const m = useMessages();
  return (
    <div className="relative pb-8 pr-[22%]">
      <StoreWindow label={m.landing.yourStore}>
        {children}
        {caption && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center px-4 pr-[22%]">
            <Captions text={caption} className="whitespace-nowrap text-[11px] sm:text-sm" />
          </div>
        )}
      </StoreWindow>
      <div className="absolute bottom-0 right-0 origin-bottom-right scale-[0.5] sm:scale-[0.7]">
        <BizmisWidget agent={agent} state={state} tool={tool} above={above} placeholder={m.landing.widget.placeholder} />
      </div>
    </div>
  );
};

/** Convert: the agent searches the catalog and takes the shopper to the results. */
export const PickVisual = () => {
  const m = useMessages();
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  return (
    <div ref={ref}>
      <StoreWithWidget
        agent="style-victor"
        state={inView ? "working" : "idle"}
        tool={Search}
        above={inView ? <NavBanner heading={m.landing.widget.takingYouTo} target={m.landing.widget.searchResults} /> : undefined}
      >
        <div className="grid grid-cols-3 gap-4 p-5 pb-12 pr-[17%] sm:gap-5 sm:p-7 sm:pb-14 sm:pr-[19%]">
          <ClayCard shape="capsule" tint="sage" />
          <ClayCard shape="sphere" tint="sand" picked={inView} />
          <ClayCard shape="cube" tint="warm" />
        </div>
      </StoreWithWidget>
    </div>
  );
};

/** Upsell: the pairing goes into the cart. */
export const BundleVisual = () => {
  const m = useMessages();
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  return (
    <div ref={ref}>
      <StoreWithWidget
        agent="style-mia"
        state="speaking"
        above={inView ? <NavBanner heading={m.landing.widget.addingToCart} target={m.landing.widget.bundle} cart /> : undefined}
      >
        <div className="flex items-center gap-4 p-6 pb-12 pr-[17%] sm:gap-6 sm:p-8 sm:pb-14 sm:pr-[19%]">
          <ClayCard shape="sphere" picked className="w-1/2" />
          <span className="text-2xl font-light text-[color-mix(in_oklab,var(--bzl-orange)_80%,#8a5a2b)]">+</span>
          <ClayCard shape="slab" tint="warm" picked={inView} className="w-1/2" />
        </div>
      </StoreWithWidget>
    </div>
  );
};

/** Loyalty: the order lands, and Bizmis tells the shopper when it arrives. */
export const OrderVisual = () => {
  const m = useMessages().salesDemo;
  return (
    <StoreWithWidget agent="style-luca" state="speaking" caption={m.deliveryEstimate}>
      <div className="p-5 pb-16 pr-[17%] sm:p-7 sm:pb-20 sm:pr-[19%]">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--bzl-orange)] text-white">
            <Check className="h-5 w-5" strokeWidth={3} />
          </span>
          <div>
            <p className="font-bold tracking-[-0.02em] text-[var(--bzl-fg)]">{m.orderConfirmed}</p>
            <p className="text-sm text-[var(--bzl-muted)]">{m.deliveryEstimate}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-[64px_1fr] items-center gap-4 sm:grid-cols-[84px_1fr]">
          <ClayTile shape="sphere" tint="orange" />
          <div className="space-y-2">
            <div className="bzl-tile-line w-3/4" />
            <div className="bzl-tile-line w-1/3" />
          </div>
        </div>
        <dl className="mt-5 space-y-1.5 border-t border-[var(--bzl-border)] pt-4 text-sm">
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
    </StoreWithWidget>
  );
};
