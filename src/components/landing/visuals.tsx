import type { ReactNode } from "react";
import { Check, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { useInView } from "./Reveal";
import BizmisWidget, {
  Captions,
  MobileWidget,
  NavBanner,
} from "./BizmisWidget";
import type { WidgetState } from "./BizmisWidget";
import type { AgentName } from "./AgentImage";
import { ClayCard, ClayTile, StoreWindow } from "./clay";
import { PhoneFrame, TabletFrame } from "./devices";

const STORE_URL = "yourstore.com";

/**
 * A store page with the real Bizmis widget floating in its corner, as it does
 * on a live storefront: the store keeps its own full-width layout and the
 * widget sits on top of it (its glass card shows the page through). Scaled
 * down the way it would sit on a page; optionally the widget's captions at
 * the page's foot.
 */
export const StoreWithWidget = ({
  children,
  agent,
  state,
  tool,
  above,
  caption,
  device = "desktop",
}: {
  children: ReactNode;
  agent: AgentName;
  state: WidgetState;
  tool?: LucideIcon;
  above?: ReactNode;
  caption?: string;
  /** A desktop browser window, or a tablet (the real widget keeps its desktop card from 768px up). */
  device?: "desktop" | "tablet";
}) => {
  const m = useMessages();
  const Frame = device === "tablet" ? TabletFrame : null;
  const inner = (
    <>
      {children}
      {caption && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center px-4 pr-[38%] sm:pr-[34%]">
          <Captions text={caption} className="text-[11px] sm:text-sm" />
        </div>
      )}
      <div
        className={`absolute bottom-3 right-3 z-10 origin-bottom-right ${device === "tablet" ? "" : "scale-[0.5] sm:scale-[0.62]"}`}
      >
        <BizmisWidget
          agent={agent}
          state={state}
          tool={tool}
          above={above}
          placeholder={m.landing.widget.placeholder}
        />
      </div>
    </>
  );
  if (Frame) return <Frame url={STORE_URL}>{inner}</Frame>;
  return <StoreWindow label={m.landing.yourStore}>{inner}</StoreWindow>;
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
        above={
          inView ? (
            <NavBanner
              heading={m.landing.widget.takingYouTo}
              target={m.landing.widget.searchResults}
            />
          ) : undefined
        }
      >
        <div className="grid grid-cols-3 gap-4 p-5 pb-12 sm:gap-5 sm:p-7 sm:pb-14">
          <ClayCard shape="capsule" tint="sage" />
          <ClayCard shape="sphere" tint="sand" picked={inView} />
          <ClayCard shape="cube" tint="warm" />
        </div>
      </StoreWithWidget>
    </div>
  );
};

/**
 * Upsell, on a phone: a mobile product page, the agent's "Adding to cart"
 * banner and captions above the real mobile widget bar.
 */
export const BundleVisual = () => {
  const m = useMessages();
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  return (
    <div ref={ref}>
      <PhoneFrame
        url={STORE_URL}
        className="h-[min(600px,calc(100svh-var(--bzl-head,12rem)-5rem))] max-h-[600px] min-h-[420px]"
      >
        <div className="space-y-3 px-4 pt-3">
          <ClayTile shape="sphere" tint="sand" className="w-full" />
          <div aria-hidden="true" className="space-y-2">
            <div className="bzl-tile-line h-3 w-3/4" />
            <div className="bzl-tile-line w-1/3" />
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-[var(--bzl-card)] p-2">
            <ClayTile
              shape="slab"
              tint="warm"
              picked={inView}
              className="w-12 flex-shrink-0 rounded-lg"
            />
            <div aria-hidden="true" className="flex-1 space-y-1.5">
              <div className="bzl-tile-line w-2/3" />
              <div className="bzl-tile-line w-1/3" />
            </div>
          </div>
        </div>
        <MobileWidget
          agent="style-mia"
          speaking
          placeholder={m.landing.widget.placeholder}
          above={
            inView ? (
              <>
                <NavBanner
                  heading={m.landing.widget.addingToCart}
                  target={m.landing.widget.bundle}
                  cart
                />
                <div className="flex justify-center">
                  <Captions
                    text={m.landing.switch.agentMessage}
                    className="text-[11px]"
                  />
                </div>
              </>
            ) : undefined
          }
        />
      </PhoneFrame>
    </div>
  );
};

/** Loyalty: the order lands, and Bizmis tells the shopper when it arrives. */
export const OrderVisual = () => {
  const m = useMessages().salesDemo;
  return (
    <StoreWithWidget
      agent="style-luca"
      state="speaking"
      caption={m.deliveryEstimate}
      device="tablet"
    >
      <div className="p-5 pb-16 sm:p-7 sm:pb-20">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--bzl-orange)] text-white">
            <Check className="h-5 w-5" strokeWidth={3} />
          </span>
          <div>
            <p className="font-bold tracking-[-0.02em] text-[var(--bzl-fg)]">
              {m.orderConfirmed}
            </p>
            <p className="text-sm text-[var(--bzl-muted)]">
              {m.deliveryEstimate}
            </p>
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
            <dd className="h-2.5 w-14 self-center rounded bg-[#efe5d9]" />
          </div>
          <div className="flex justify-between text-[var(--bzl-muted)]">
            <dt>{m.shipping}</dt>
            <dd className="font-semibold text-[var(--bzl-orange-dark)]">
              {m.free}
            </dd>
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
