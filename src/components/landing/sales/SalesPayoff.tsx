import { useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import { ShoppingBag } from "lucide-react";
import { localeTag, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import FunnelFlow from "./funnel/FunnelFlow";
import { landings, makeShoppers, startsFor } from "./funnel/model";
import { useScene } from "./hooks";
import { Sentinel } from "./shared";

/** The payoff's timeline: the three stages improve in turn, then the orders pour in. */
const DURATION = 8600;
/** Where the day's sales stood before the surge. */
const FROM = 980;
/** The chart's window (s) and its resolution. */
const WINDOW = 7;
const SAMPLES = 48;
const SPARKS = Array.from({ length: 10 }, (_, i) => ({ a: (i / 10) * 360 + (i % 2 ? 14 : 0), d: 26 + (i % 3) * 9 }));

/**
 * The pillar's payoff, as one picture: the whole funnel with all three stages
 * improving at once (discovery, decision, checkout, one after another, each
 * plugged by its agent), the fuller stream pouring its orders out of the bag
 * and down into the day's sales, where each one lands on the live line and
 * the total. So the growth reads as what the funnel makes, not a separate
 * card. A rewind loop (useScene; `play: false` holds it at the start); at
 * the end the total pops. Reduced motion
 * shows the finished day.
 */
const SalesPayoff = ({ play, className }: { play?: boolean; className?: string }) => {
  const m = useMessages();
  const s = m.landing.sales;
  const locale = useLocale();
  const { t, sentinel, off, cycle } = useScene(DURATION, play, { hold: 2800, threshold: 0.35 });
  const tip = useRef<HTMLSpanElement>(null);
  const orders = useMemo(() => landings(makeShoppers(DURATION, startsFor(3))), []);

  const total = (sec: number) => {
    if (sec < 0) return FROM * (1 + sec * 0.012);
    let v = FROM;
    for (const o of orders) {
      if (o.at > sec) break;
      v += o.amount;
    }
    return v;
  };
  const sec = t / 1000;
  const now = total(sec);
  const top = total(DURATION / 1000);
  const lo = FROM * 0.86;
  const hi = top * 1.04;
  const yOf = (v: number) => 92 - ((v - lo) / (hi - lo)) * 82;
  const pts = Array.from({ length: SAMPLES }, (_, j) => {
    const at = sec - WINDOW + (j / (SAMPLES - 1)) * WINDOW;
    return [(j / (SAMPLES - 1)) * 300, yOf(total(at))] as const;
  });
  const line = pts.map(([x, y], j) => `${j ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const tipY = pts[pts.length - 1][1];
  const done = t >= DURATION - 250;
  const money = new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency: s.pulse.currency,
    maximumFractionDigits: 0,
  });

  return (
    <div className={cn("sl-pay relative", done && "is-done", className)}>
      <Sentinel ref={sentinel} off={off} />
      <div className="sl-fn sl-pay-box">
        <span className="sl-fn-eyebrow">{s.funnel.eyebrow}</span>
        <FunnelFlow t={t} duration={DURATION} focus={3} labels={s.funnel.steps} funnel={0.56} target={tip}>
          <div className="sl-pay-card">
            <div className="sl-pay-figures">
              <div className="sl-pay-head">
                <span className="sl-pay-icon" aria-hidden="true">
                  <ShoppingBag className="h-4 w-4" strokeWidth={2} />
                </span>
                {s.pulse.label}
                <span className="sl-pay-live" aria-hidden="true" />
              </div>
              <p className="sl-pay-amount tabular-nums" aria-label={money.format(top)}>
                <span key={done ? cycle : -1} aria-hidden="true">
                  {money.format(Math.round(now))}
                </span>
              </p>
            </div>
            <div className="sl-pay-chart">
              <svg viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="sl-pay-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f28c38" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#f28c38" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${line} L300 100 L0 100 Z`} fill="url(#sl-pay-fill)" />
                <path d={line} className="sl-pay-line" vectorEffect="non-scaling-stroke" />
              </svg>
              <span ref={tip} className="sl-pay-tip" style={{ top: `${tipY}%` }} aria-hidden="true">
                <span className="sl-pay-dot" />
                {done && (
                  <span key={cycle} className="sl-pay-burst">
                    {SPARKS.map((p, i) => (
                      <i key={i} style={{ "--a": `${p.a}deg`, "--d": `${p.d}px` } as CSSProperties} />
                    ))}
                  </span>
                )}
              </span>
            </div>
          </div>
        </FunnelFlow>
      </div>
    </div>
  );
};

export default SalesPayoff;
