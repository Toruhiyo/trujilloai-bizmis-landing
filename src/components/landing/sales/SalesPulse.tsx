import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ShoppingBag } from "lucide-react";
import { localeTag, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { useInView } from "../Reveal";
import { useReducedMotion } from "./hooks";

/** The day's sales, from where the morning left them to where the agent takes them. */
const FROM = 980;
const TO = 4286;
const RUN_MS = 2600;
/** When each new order lands (fraction of the run): further apart, then faster. */
const ORDERS = [
  { at: 0.42, amount: 64 },
  { at: 0.7, amount: 118 },
  { at: 0.88, amount: 89 },
];
/** A slow morning, then the surge. */
const LINE =
  "M0 80 C18 79 30 83 46 78 S76 76 92 72 S122 76 138 69 S168 66 184 60 S214 56 228 47 S262 28 300 6";
const AREA = `${LINE} L300 90 L0 90 Z`;
const SPARKS = Array.from({ length: 10 }, (_, i) => ({
  a: (i / 10) * 360 + (i % 2 ? 14 : 0),
  d: 26 + (i % 3) * 9,
}));

/**
 * The Sales pillar's feeling: the store's sales for the day climbing as you
 * watch. The total rolls up slowly, then surges with the line; new orders
 * drop in faster and faster; at the peak, a warm burst and the total pops.
 * Plays once, when it scrolls in. Reduced motion shows where it ends.
 */
const SalesPulse = ({ className }: { className?: string }) => {
  const p = useMessages().landing.sales.pulse;
  const locale = useLocale();
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>(0.55);
  const [t, setT] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setT(1);
      return;
    }
    const start = performance.now() + 250;
    const tick = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - start) / RUN_MS));
      setT(k);
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [inView, reduced]);

  const money = new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency: p.currency,
    maximumFractionDigits: 0,
  });
  // slow, then surging, like the line
  const value = FROM + (TO - FROM) * Math.pow(t, 2.3);
  const done = t >= 1;

  return (
    <div
      ref={ref}
      className={cn("sl-pulse", done && "is-done", reduced && "is-still", className)}
      style={{ "--p": t } as CSSProperties}
    >
      <div className="sl-pulse-card">
        <div className="sl-pulse-head">
          <span className="sl-pulse-icon" aria-hidden="true">
            <ShoppingBag className="h-4 w-4" strokeWidth={2} />
          </span>
          {p.label}
          <span className="sl-pulse-live" aria-hidden="true" />
        </div>
        <p className="sl-pulse-amount tabular-nums" aria-label={money.format(TO)}>
          <span aria-hidden="true">{money.format(Math.round(value))}</span>
        </p>
        <div className="sl-pulse-chart">
          <svg viewBox="0 0 300 90" aria-hidden="true">
            <defs>
              <linearGradient id="sl-pulse-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f28c38" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#f28c38" stopOpacity="0" />
              </linearGradient>
              <clipPath id="sl-pulse-clip">
                <rect x="0" y="0" width={300 * t} height="90" />
              </clipPath>
            </defs>
            <path d={AREA} fill="url(#sl-pulse-fill)" clipPath="url(#sl-pulse-clip)" />
            <path
              d={LINE}
              pathLength={1}
              className="sl-pulse-line"
              strokeDasharray="1"
              strokeDashoffset={1 - t}
            />
          </svg>
          <span className="sl-pulse-peak" aria-hidden="true">
            <span className="sl-pulse-dot" />
            {done && !reduced && (
              <span className="sl-pulse-burst">
                {SPARKS.map((s, i) => (
                  <i
                    key={i}
                    style={{ "--a": `${s.a}deg`, "--d": `${s.d}px` } as CSSProperties}
                  />
                ))}
              </span>
            )}
          </span>
        </div>
      </div>
      <ul className="sl-pulse-orders" aria-hidden="true">
        {ORDERS.map((o, i) =>
          t >= o.at ? (
            <li key={i} className="sl-pulse-order" style={{ "--i": i } as CSSProperties}>
              <span className="sl-pulse-order-dot" />
              {p.order}
              <b className="tabular-nums">+{money.format(o.amount)}</b>
            </li>
          ) : null,
        )}
      </ul>
    </div>
  );
};

export default SalesPulse;
