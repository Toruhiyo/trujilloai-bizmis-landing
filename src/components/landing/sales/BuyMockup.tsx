import { Check, Lock, RotateCcw, ShoppingCart, Truck } from "lucide-react";
import { localeTag, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { span, typed } from "../useRewindLoop";
import { BarWidget, Captions, NavBanner, SentMessage, captionChunks, captionLength, captionVoice } from "../BizmisWidget";
import { ClayTile } from "../clay";
import { TabletFrame } from "../devices";
import { STORE_URL } from "../visuals";
import type { Messages } from "@/i18n/messages/en";
import { bump, easeOutBack, useScene } from "./hooks";
import { Sentinel } from "./scene";
import type { MockupProps } from "./scene";
import { useSalesCopy } from "./proto";

const PERKS = [Truck, RotateCcw];
const PRICE = 48;
/** The scene's timeline (ms): typing, send, a beat of thought, the answer. */
const T = { type: 350, send: 1300, work: 1600, speak: 2250 };
const MS_PER_WORD = 280;

/**
 * The scene's beats: checkout once the whole answer is out (both lines),
 * then the order; its funnel stage gets fixed as the first line of the
 * answer clears the doubt (shared with the beat's funnel, one clock).
 */
export const buyTimeline = (s: Messages["landing"]["sales"]) => {
  const go = T.speak + captionLength(s.buyCaption, MS_PER_WORD) - 500;
  const placed = go + 1500;
  const first = captionChunks(s.buyCaption)[0]?.length ?? 8;
  return { go, placed, first, duration: placed + 1700, fixAt: T.speak + (first + 1) * MS_PER_WORD };
};

/**
 * "They buy it" (checkout), on a tablet with the widget in its BAR layout (a
 * glass pill centred on the page's foot, the head capping its left end; on
 * phones the same tablet, scaled down): the shopper has it in the cart but stalls on
 * a last-minute question, typed into the bar (will it arrive in time?). The
 * agent answers out loud, every word of it (ships today, free returns, each
 * lighting up on the page as it's said), takes them to checkout, and the
 * cart becomes a placed order instead of an abandoned one. Follows the
 * scene's time (its own useScene, or its beat's shared clock), so it
 * rewinds as it played.
 */
const BuyMockup = ({ play, clock, active = true }: MockupProps) => {
  const m = useMessages();
  const s = useSalesCopy();
  const locale = useLocale();
  const { go, placed, first, duration } = buyTimeline(s);
  // its own loop, unless its beat's clock drives it (with the funnel beside it)
  const own = useScene(duration, clock ? false : play);
  const t = clock ? clock.t : own.t;
  // the perks light as the first line gets to them (about its middle and its end)
  const perkAt = [T.speak + Math.round(first * 0.5) * MS_PER_WORD, T.speak + first * MS_PER_WORD];

  const typing = t >= T.type - 200 && t < T.send;
  const draft = typing ? typed(s.buyQuery, t, T.type, 30) : undefined;
  const press = span(t, T.send - 170, T.send + 60);
  const sent = span(t, T.send, T.speak + 900);
  const speaking = t >= T.speak && t < go;
  const going = t >= go && t < placed;
  const done = span(t, placed, placed + 450);
  const money = new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency: s.pulse.currency,
    maximumFractionDigits: 0,
  });

  return (
    <div className="sl-buy relative">
      {!clock && <Sentinel ref={own.sentinel} off={own.off} />}
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
              <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[var(--bzl-primary-soft,#ffe7d0)] text-[var(--bzl-fg)]">
                <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[hsl(var(--primary))] px-1 text-[10px] font-bold tabular-nums text-white">
                  1
                </span>
              </span>
            </span>
          </div>

          {/* the cart page */}
          <div
            className="mt-5 grid grid-cols-[1fr_250px] gap-7"
            aria-hidden="true"
          >
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
              {/* what the agent says, lighting up on the page as it's said */}
              <div className="mt-4 flex flex-wrap gap-2">
                {PERKS.map((Icon, i) => {
                  const on = span(t, perkAt[i], perkAt[i] + 300);
                  const pop = bump(t, perkAt[i], 520);
                  return (
                    <span
                      key={i}
                      className={cn("sl-buy-perk", on > 0.5 && "is-on")}
                      style={{ scale: `${1 + 0.12 * pop}` }}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                      {s.cart.perks[i]}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* the order summary, then the placed order */}
            <div className="sl-buy-summary">
              <div className="sl-buy-summary-body" style={{ opacity: 1 - done }}>
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
                    t >= go && "is-go",
                  )}
                  style={{ boxShadow: `0 0 0 ${6 * bump(t, placed - 600, 600)}px hsl(var(--primary) / 0.4)` }}
                >
                  <Lock className="h-3.5 w-3.5" strokeWidth={2.4} />
                  {s.cart.checkout}
                </div>
              </div>
              <div
                className="sl-buy-done"
                style={{ opacity: Math.min(1, done * 2), scale: `${0.92 + 0.08 * easeOutBack(done)}` }}
              >
                <span
                  className="sl-buy-done-check"
                  style={{ scale: `${0.4 + 0.6 * easeOutBack(span(t, placed + 120, placed + 620))}` }}
                >
                  <Check className="h-6 w-6" strokeWidth={3} />
                </span>
                <span className="text-[15px] font-bold text-[var(--bzl-fg)]">{s.cart.placed}</span>
                <span className="text-[13px] font-semibold tabular-nums text-[var(--bzl-fg)]">
                  {money.format(PRICE)}
                </span>
              </div>
            </div>
          </div>

          <div className="sl-buy-bar absolute bottom-10 left-1/2">
            {/* the agent's words, centred over the bar */}
            {speaking && (
              <div className="mb-3 flex justify-center">
                <Captions
                  text={s.buyCaption}
                  at={t - T.speak}
                  msPerWord={MS_PER_WORD}
                  className="sl-cap sl-cap-buy"
                />
              </div>
            )}
            <BarWidget
              head="amber"
              live
              paused={!active}
              speaking={speaking && captionVoice(s.buyCaption, t - T.speak, MS_PER_WORD)}
              working={(t >= T.work && t < T.speak) || going}
              placeholder={m.landing.widget.placeholder}
              draft={draft}
              press={press}
              above={
                sent > 0 && sent < 1 ? (
                  <SentMessage text={s.buyQuery} k={sent} />
                ) : going ? (
                  <NavBanner
                    heading={m.landing.widget.takingYouTo}
                    target={s.cart.checkout}
                    progress={span(t, go, placed)}
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
