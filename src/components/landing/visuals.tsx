import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Check, Search, ShoppingCart } from "lucide-react";
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

/** Find: the agent searches the catalog and takes the shopper to the results. */
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

/** The spec rows under a compared product: a bullet and a placeholder line each. */
const SpecRows = ({ on }: { on: boolean }) => (
  <ul aria-hidden="true" className="space-y-2.5 pt-1">
    {["w-4/5", "w-3/5", "w-2/3"].map((w) => (
      <li key={w} className="flex items-center gap-2">
        <span
          className={`grid h-4 w-4 flex-shrink-0 place-items-center rounded-full transition-colors duration-500 ${on ? "bg-[var(--bzl-orange)] text-white" : "bg-[#efe5d9] text-transparent"}`}
        >
          <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
        </span>
        <span className={`bzl-tile-line ${w}`} />
      </li>
    ))}
  </ul>
);

/**
 * Trust, on a phone: two products side by side, the agent weighing them out
 * loud (captions above the real mobile widget bar), and the better fit for
 * this shopper lighting up.
 */
export const CompareVisual = () => {
  const m = useMessages();
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  const [picked, setPicked] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(() => setPicked(true), 900);
    return () => window.clearTimeout(t);
  }, [inView]);
  return (
    <div ref={ref}>
      <PhoneFrame
        url={STORE_URL}
        className="h-[min(600px,calc(100svh-7rem))] max-h-[600px] min-h-[420px]"
      >
        {/* the store's compare page: its heading, then the two products */}
        <div aria-hidden="true" className="space-y-2 px-5 pt-5">
          <div className="bzl-tile-line h-3.5 w-1/2" />
          <div className="bzl-tile-line w-1/4" />
        </div>
        <div className="grid grid-cols-2 gap-3 px-4 pt-5">
          {(
            [
              ["capsule", "sage", false],
              ["sphere", "sand", true],
            ] as const
          ).map(([shape, tint, best]) => (
            <div
              key={shape}
              className={`relative space-y-3 rounded-2xl p-2.5 transition-[box-shadow,background-color] duration-500 ${best && picked ? "bg-[var(--bzl-orange-wash)] shadow-[0_0_0_2px_var(--bzl-orange),0_16px_32px_-18px_rgba(236,119,9,0.6)]" : "bg-[#faf6f1]"}`}
            >
              <ClayTile
                shape={shape}
                tint={tint}
                className="w-full !aspect-[3/4]"
              />
              <div aria-hidden="true" className="space-y-1.5">
                <div className="bzl-tile-line h-2.5 w-3/4" />
                <div className="bzl-tile-line w-1/3" />
              </div>
              <SpecRows on={best && picked} />
              {/* sizes: the one this shopper needs is only in stock on the better fit */}
              <div aria-hidden="true" className="flex gap-1 pt-1">
                {["S", "M", "L"].map((size) => {
                  const out = !best && size === "M";
                  const on = best && picked && size === "M";
                  return (
                    <span
                      key={size}
                      className={`grid h-6 flex-1 place-items-center rounded-md border text-[10px] font-semibold transition-colors duration-500 ${on ? "border-[var(--bzl-orange)] bg-white text-[var(--bzl-orange-dark)]" : out ? "border-dashed border-[#e3d8cb] text-[#cbbfb2] line-through" : "border-[var(--bzl-border)] bg-white/70 text-[var(--bzl-faint)]"}`}
                    >
                      {size}
                    </span>
                  );
                })}
              </div>
              {best && (
                <span
                  aria-hidden="true"
                  className={`absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-[var(--bzl-orange)] text-white shadow transition-[opacity,transform] duration-500 ${picked ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
                  style={{ transitionTimingFunction: "var(--bzl-spring)" }}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              )}
            </div>
          ))}
        </div>
        <MobileWidget
          agent="style-mia"
          speaking={picked}
          placeholder={m.landing.widget.placeholder}
          above={
            picked ? (
              <div className="flex justify-center">
                <Captions
                  text={m.landing.sales.compareCaption}
                  className="text-[11px]"
                />
              </div>
            ) : undefined
          }
        />
      </PhoneFrame>
    </div>
  );
};

// the add-to-cart moment: waiting, adding (banner + the cart tool on the laser), added (the count ticks up)
const BUY_STEPS_MS = [1400, 2600, 4200];

/**
 * Buy, on a tablet: the shopper says yes, the agent adds ONE item to the
 * store's own cart ("Adding to cart" banner) and the store's cart count
 * ticks up, then it offers to take them to checkout.
 */
export const BuyVisual = () => {
  const m = useMessages();
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(2);
      return;
    }
    const t = window.setTimeout(
      () => setStep((s) => (s + 1) % BUY_STEPS_MS.length),
      BUY_STEPS_MS[step],
    );
    return () => window.clearTimeout(t);
  }, [inView, step]);
  const added = step === 2;
  return (
    <div ref={ref}>
      <StoreWithWidget
        agent="style-luca"
        state={step === 1 ? "working" : added ? "speaking" : "idle"}
        tool={ShoppingCart}
        device="tablet"
        caption={added ? m.landing.sales.buyCaption : undefined}
        above={
          step === 1 ? (
            <NavBanner
              heading={m.landing.widget.addingToCart}
              target={m.landing.widget.cartItem}
              cart
            />
          ) : undefined
        }
      >
        <div className="px-6 pb-16 pt-4">
          {/* the store's own header, with its cart */}
          <div className="flex items-center gap-3 border-b border-[var(--bzl-border)] pb-3">
            <span className="h-5 w-5 rounded-md bg-[#d9d4cc]" aria-hidden="true" />
            <span className="bzl-tile-line h-2.5 w-16" aria-hidden="true" />
            <span className="ml-auto flex items-center gap-4" aria-hidden="true">
              <span className="bzl-tile-line w-10" />
              <span className="bzl-tile-line w-12" />
              <span className="relative grid h-8 w-8 place-items-center rounded-full bg-[#f6efe7] text-[var(--bzl-fg)]">
                <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                <span
                  key={added ? "1" : "0"}
                  className={`absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold tabular-nums ${added ? "bzl-cart-pop bg-[var(--bzl-orange)] text-white" : "bg-[#e9e1d7] text-[var(--bzl-muted)]"}`}
                >
                  {added ? 1 : 0}
                </span>
              </span>
            </span>
          </div>
          {/* the product page */}
          <div className="mt-6 grid w-[420px] grid-cols-[220px_1fr] gap-5">
            <ClayTile shape="sphere" tint={added ? "orange" : "sand"} />
            <div className="space-y-2.5 pt-1" aria-hidden="true">
              <div className="bzl-tile-line h-3 w-4/5" />
              <div className="bzl-tile-line w-2/5" />
              <div className="h-4 w-14 rounded-md bg-[#d9d4cc]" />
              <div className="flex gap-1.5 pt-1">
                {["S", "M", "L"].map((size) => (
                  <span
                    key={size}
                    className={`grid h-7 w-8 place-items-center rounded-lg border text-[11px] font-semibold ${size === "M" ? "border-[var(--bzl-fg)] text-[var(--bzl-fg)]" : "border-[var(--bzl-border)] text-[var(--bzl-faint)]"}`}
                  >
                    {size}
                  </span>
                ))}
              </div>
              <div
                className={`mt-2 flex h-9 items-center justify-center gap-2 rounded-xl text-xs font-semibold text-white transition-colors duration-500 ${added ? "bg-[var(--bzl-orange-strong)]" : "bg-[color-mix(in_oklab,var(--bzl-fg)_85%,transparent)]"}`}
              >
                {added && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </div>
            </div>
          </div>
        </div>
      </StoreWithWidget>
    </div>
  );
};
