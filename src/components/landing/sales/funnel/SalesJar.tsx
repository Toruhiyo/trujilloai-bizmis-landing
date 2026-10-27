import { useId } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const f1 = (v: number) => v.toFixed(1);

/** How many sales fly in over the whole payoff (each one a check). */
const SALES = 72;
/** Each check's flight, in sales: it lands as the next few leave the bag. */
const FLIGHT = 3;
/** Then it sits on the pile of checks on the fill's surface while this many more land, and melts in. */
const REST = 9;

/**
 * The payoff's win as the film's (ad-1, "Visits turn into sales"): a tall
 * glass column labelled Sales that keeps filling, each sale flying out of the
 * funnel's order bag as a check and dropping into it. On the band: the glass
 * a soft white, the fill white, the checks white discs with an orange tick.
 * `k` (0 → 1) is how far the payoff's sales have added up (salesAt, on the
 * scroll's clock, so it rewinds); `from` the bag, `box` the column (stage
 * px); wider than tall, it fills sideways (phones).
 */
const SalesJar = ({
  k,
  from,
  box,
  label,
  on,
}: {
  k: number;
  from: { x: number; y: number };
  box: { x: number; y: number; w: number; h: number };
  label: string;
  on: boolean;
}) => {
  const id = `sl-jar${useId().replace(/:/g, "")}`;
  const side = box.w > box.h;
  const r = Math.min(26, Math.min(box.w, box.h) * 0.22);
  const pad = 6;
  // the label's room, under the fill (beside it when sideways)
  const foot = side ? 0 : 40;
  const inner = side
    ? { x: box.x + pad, y: box.y + pad, w: box.w - 2 * pad - 70, h: box.h - 2 * pad }
    : { x: box.x + pad, y: box.y + pad, w: box.w - 2 * pad, h: box.h - 2 * pad - foot };
  const level = clamp(k);
  const fill = side
    ? { x: inner.x, y: inner.y, w: inner.w * level, h: inner.h }
    : { x: inner.x, y: inner.y + inner.h * (1 - level), w: inner.w, h: inner.h * level };
  const badge = clamp(Math.min(box.w, box.h) * 0.11, 9, 15);
  const n = level * SALES;
  // the pile on the surface: the checks that landed lately, in a heap (a few across, rows going up)
  const across = Math.max(3, Math.floor((side ? inner.h : inner.w) / (badge * 2.1)));
  const slot = (j: number): [number, number] => {
    const row = Math.floor(j / across);
    const col = j % across;
    const off = row % 2 ? 0.5 : 0;
    const t = (col + 0.5 + off) / (across + 0.5);
    return side
      ? [inner.x + inner.w * level - badge * (1 + row * 1.7), inner.y + inner.h * t]
      : [inner.x + inner.w * t, inner.y + inner.h * (1 - level) - badge * (0.85 + row * 1.6)];
  };
  const checks: ReactNode[] = [];
  const draw = (i: number, x: number, y: number, o: number) =>
    checks.push(
      <g key={i} transform={`translate(${f1(x)} ${f1(y)})`} opacity={o.toFixed(2)}>
        <circle r={badge} className="sl-jar-badge" />
        <path
          className="sl-jar-tick"
          d={`M${f1(-badge * 0.42)} ${f1(badge * 0.02)} L${f1(-badge * 0.1)} ${f1(badge * 0.34)} L${f1(badge * 0.45)} ${f1(-badge * 0.32)}`}
        />
      </g>,
    );
  for (let i = 0; i < SALES; i++) {
    const age = n - i;
    if (age <= 0) continue;
    // its place in the pile: newest on top
    const [sx, sy] = slot(Math.floor(i % (across * 2)));
    if (age < FLIGHT) {
      // flying out of the bag in an arc, onto the pile
      const p = age / FLIGHT;
      const e = 1 - (1 - p) * (1 - p);
      const arc = Math.max(50, Math.abs(sx - from.x) * 0.35);
      const x = from.x + (sx - from.x) * e;
      const y = from.y + (sy - from.y) * p * p - Math.sin(Math.PI * Math.min(1, p * 1.1)) * arc;
      draw(i, x, y, Math.min(1, p * 4));
    } else if (age < FLIGHT + REST || level >= 0.999) {
      // on the pile, melting into the fill as the newer ones land (all of them stay once it's full)
      const q = (age - FLIGHT) / REST;
      draw(i, sx, sy, level >= 0.999 ? 1 : q > 0.75 ? (1 - q) / 0.25 : 1);
    }
  }
  return (
    <svg className={cn("sl-g2-jar", on && "is-on")} aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <rect x={inner.x} y={inner.y} width={inner.w} height={inner.h} rx={Math.max(4, r - pad)} />
        </clipPath>
      </defs>
      <rect className="sl-jar-glass" x={box.x} y={box.y} width={box.w} height={box.h} rx={r} />
      <g clipPath={`url(#${id})`}>
        <rect className="sl-jar-fill" x={fill.x} y={fill.y} width={Math.max(0, fill.w)} height={Math.max(0, fill.h)} />
        {/* the surface, a hand's wobble along the fill's top */}
        {level > 0.01 && !side && (
          <path
            className="sl-jar-surface"
            d={`M${f1(inner.x)} ${f1(fill.y)} C ${f1(inner.x + inner.w * 0.3)} ${f1(fill.y - 3)}, ${f1(inner.x + inner.w * 0.65)} ${f1(fill.y + 3)}, ${f1(inner.x + inner.w)} ${f1(fill.y)}`}
          />
        )}
      </g>
      <text
        className="sl-jar-label"
        x={side ? box.x + box.w - 38 : box.x + box.w / 2}
        y={side ? box.y + box.h / 2 + 7 : box.y + box.h - 14}
        textAnchor="middle"
      >
        {label}
      </text>
      {checks}
    </svg>
  );
};

export default SalesJar;
