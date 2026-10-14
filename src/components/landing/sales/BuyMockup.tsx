import type { CSSProperties } from "react";
import { Check, Lock, RotateCcw, ShoppingCart, Truck } from "lucide-react";
import { localeTag, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { BarWidget, Captions, NavBanner, SentMessage } from "../BizmisWidget";
import { ClayTile } from "../clay";
import { TabletFrame } from "../devices";
import { STORE_URL } from "../visuals";
import { useBeats, useOnScreen } from "./hooks";

/** idle in the cart, the last-minute question, the answer, off to checkout, the order placed. */
const BEATS = [1200, 1700, 3300, 2300, 3600];
const PERKS = [Truck, RotateCcw];
const PRICE = 48;

/**
 * "They buy it" (checkout), on a tablet with the widget in its BAR layout (a
 * glass pill centred on the page's foot, the head capping its left end): the
 * shopper has it in the cart but stalls on a last-minute question (will it
 * arrive in time?). The agent answers out loud (ships today, free returns,
 * each lighting up on the page), takes them to checkout, and the cart
 * becomes a placed order instead of an abandoned one.
 */
const BuyMockup = ({ play }: { play?: boolean }) => {
  const m = useMessages();
  const s = m.landing.sales;
  const locale = useLocale();
  const [ref, onScreen] = useOnScreen<HTMLDivElement>(0.4);
  const beat = useBeats(BEATS, play ?? onScreen);
  const asking = beat === 1;
  const answered = beat >= 2;
  const going = beat === 3;
  const placed = beat === 4;
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
              <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[#ffe6cf] text-[var(--bzl-fg)]">
                <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[var(--bzl-orange-strong)] px-1 text-[10px] font-bold tabular-nums text-white">
                  1
                </span>
              </span>
            </span>
          </div>

          {/* the cart page */}
          <div className="mt-5 grid grid-cols-[1fr_250px] gap-7" aria-hidden="true">
            <div>
              <div className="text-[17px] font-bold tracking-tight text-[var(--bzl-fg)]">
                {s.cart.title}
              </div>
              <div className="mt-3 flex items-center gap-4 rounded-2xl border border-[var(--bzl-border)] p-3">
                <ClayTile shape="sphere" tint="sand" className="w-[92px] flex-shrink-0" />
                <div className="min-w-0 flex-1 space-y-2.5">
                  <div className="bzl-tile-line h-3 w-3/5" />
                  <span className="inline-grid h-6 w-7 place-items-center rounded-md border border-[var(--bzl-fg)] text-[11px] font-semibold text-[var(--bzl-fg)]">
                    M
                  </span>
                </div>
                <div className="pr-1 text-[15px] font-bold tabular-nums text-[var(--bzl-fg)]">
                  {money.format(PRICE)}
                </div>
              </div>
              {/* what the agent just answered, lighting up on the page */}
              <div className="mt-4 flex flex-wrap gap-2">
                {PERKS.map((Icon, i) => (
                  <span
                    key={i}
                    className={cn("sl-buy-perk", answered && "is-on")}
                    style={{ "--i": i } as CSSProperties}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                    {s.cart.perks[i]}
                  </span>
                ))}
              </div>
            </div>

            {/* the order summary, then the placed order */}
            <div className={cn("sl-buy-summary", placed && "is-placed")}>
              <div className="sl-buy-summary-body">
                <div className="flex items-center justify-between text-[13px] text-[var(--bzl-muted)]">
                  <span>{s.cart.subtotal}</span>
                  <span className="font-semibold tabular-nums text-[var(--bzl-fg)]">
                    {money.format(PRICE)}
                  </span>
                </div>
                <div className="mt-2 space-y-1.5">
                  <div className="bzl-tile-line w-4/5" />
                  <div className="bzl-tile-line w-3/5" />
                </div>
                <div
                  className={cn(
                    "sl-buy-button mt-4 flex h-10 items-center justify-center gap-2 rounded-xl text-[13px] font-semibold text-white",
                    going && "is-pressing",
                  )}
                >
                  <Lock className="h-3.5 w-3.5" strokeWidth={2.4} />
                  {s.cart.checkout}
                </div>
              </div>
              <div className="sl-buy-done">
                <span className="sl-buy-done-check">
                  <Check className="h-6 w-6" strokeWidth={3} />
                </span>
                <span className="text-[15px] font-bold text-[var(--bzl-fg)]">{s.cart.placed}</span>
                <span className="text-[13px] font-semibold tabular-nums text-[var(--bzl-orange-dark)]">
                  {money.format(PRICE)}
                </span>
              </div>
            </div>
          </div>

          {/* the agent's words, centred over the bar */}
          {(beat === 2 || going) && (
            <div className="absolute inset-x-0 bottom-[140px] flex justify-center px-8">
              <Captions text={s.buyCaption} className="text-sm" />
            </div>
          )}

          <div className="absolute bottom-5 left-1/2 w-[480px] -translate-x-1/2">
            <BarWidget
              head="luca"
              speaking={beat === 2}
              working={going}
              placeholder={m.landing.widget.placeholder}
              above={
                asking ? (
                  <SentMessage text={s.buyQuery} />
                ) : going ? (
                  <NavBanner heading={m.landing.widget.takingYouTo} target={s.cart.checkout} />
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
