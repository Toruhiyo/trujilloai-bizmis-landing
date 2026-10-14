import { Check, ShoppingCart } from "lucide-react";
import { localeTag, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { BarWidget, Captions, NavBanner } from "../BizmisWidget";
import { ClayTile } from "../clay";
import { TabletFrame } from "../devices";
import { STORE_URL } from "../visuals";
import { useBeats, useOnScreen } from "./hooks";

/** waiting, adding (banner + the cart tool), added (the cart count ticks up). */
const BEATS = [1300, 2200, 4600];

/**
 * "They buy it", on a tablet with the widget in its BAR layout (a glass pill
 * centred on the page's foot, the head capping its left end): the agent adds
 * the item to the store's own cart ("Adding to cart" banner), the item flies
 * to the cart and its count ticks up, and the agent offers checkout.
 */
const BuyMockup = ({ play }: { play?: boolean }) => {
  const m = useMessages();
  const s = m.landing.sales;
  const locale = useLocale();
  const [ref, onScreen] = useOnScreen<HTMLDivElement>(0.4);
  const beat = useBeats(BEATS, play ?? onScreen);
  const adding = beat === 1;
  const added = beat === 2;
  const money = new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency: s.pulse.currency,
    maximumFractionDigits: 0,
  });

  return (
    <div ref={ref} className="sl-buy">
      <TabletFrame url={STORE_URL}>
        <div className="relative h-full px-7 pt-3">
          {/* the store's own header, with its cart */}
          <div
            aria-hidden="true"
            className="flex items-center gap-3 border-b border-[var(--bzl-border)] pb-3"
          >
            <span className="h-5 w-5 rounded-md bg-[#e2d9ce]" />
            <span className="bzl-tile-line h-2.5 w-16" />
            <span className="ml-auto flex items-center gap-4">
              <span className="bzl-tile-line w-10" />
              <span className="bzl-tile-line w-12" />
              <span
                className={cn(
                  "sl-buy-cart relative grid h-9 w-9 place-items-center rounded-full bg-[#f6efe7] text-[var(--bzl-fg)]",
                  added && "is-hit",
                )}
              >
                <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                <span
                  key={added ? "1" : "0"}
                  className={cn(
                    "absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold tabular-nums",
                    added
                      ? "bzl-cart-pop bg-[var(--bzl-orange-strong)] text-white"
                      : "bg-[#e9e1d7] text-[var(--bzl-muted)]",
                  )}
                >
                  {added ? 1 : 0}
                </span>
              </span>
            </span>
          </div>

          {/* the product page */}
          <div className="mt-5 grid grid-cols-[250px_1fr] gap-8" aria-hidden="true">
            <ClayTile shape="sphere" tint={added ? "orange" : "sand"} />
            <div className="space-y-3 pt-1">
              <div className="bzl-tile-line h-3.5 w-3/5" />
              <div className="bzl-tile-line w-2/5" />
              <div className="text-lg font-bold tabular-nums text-[var(--bzl-fg)]">
                {money.format(48)}
              </div>
              <div className="flex gap-1.5">
                {["S", "M", "L"].map((size) => (
                  <span
                    key={size}
                    className={cn(
                      "grid h-8 w-9 place-items-center rounded-lg border text-xs font-semibold transition-colors duration-300",
                      size === "M" && beat > 0
                        ? "border-[var(--bzl-fg)] text-[var(--bzl-fg)]"
                        : "border-[var(--bzl-border)] text-[var(--bzl-faint)]",
                    )}
                  >
                    {size}
                  </span>
                ))}
              </div>
              <div
                className={cn(
                  "sl-buy-button relative flex h-10 w-56 items-center justify-center gap-2 rounded-xl text-white",
                  adding && "is-pressing",
                  added && "is-added",
                )}
              >
                {added ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                )}
                {added && <span className="sl-buy-fly" />}
              </div>
              <div className="space-y-2 pt-3">
                <div className="bzl-tile-line w-full" />
                <div className="bzl-tile-line w-11/12" />
                <div className="bzl-tile-line w-2/3" />
              </div>
            </div>
          </div>

          {/* the agent's words, centred over the bar */}
          {added && (
            <div className="absolute inset-x-0 bottom-[112px] flex justify-center px-8">
              <Captions text={s.buyCaption} className="text-sm" />
            </div>
          )}

          <div className="absolute bottom-5 left-1/2 w-[480px] -translate-x-1/2">
            <BarWidget
              head="luca"
              speaking={added}
              working={adding}
              placeholder={m.landing.widget.placeholder}
              above={
                adding ? (
                  <NavBanner
                    heading={m.landing.widget.addingToCart}
                    target={m.landing.widget.cartItem}
                    cart
                  />
                ) : undefined
              }
            />
          </div>
        </div>
      </TabletFrame>
    </div>
  );
};

export default BuyMockup;
