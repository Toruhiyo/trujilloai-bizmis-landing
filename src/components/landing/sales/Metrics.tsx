import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * ?win=4..6: the win, told in the metrics a merchant already watches, drawn
 * in the funnel's white marker and only ever pointing the right way (no
 * figures: we have none). `k` is how far each stage is fixed (0 → 1); the
 * stage being shown (`focus`, 3 for the payoff) is drawn at full ink.
 *  4: a store-analytics card: conversion rate and orders bend up, abandoned
 *     carts bend down, each as its stage gets fixed (in a beat); at the
 *     payoff (`focus` 3), every line turns a notch further at every fix, so
 *     the three fixes add up in each (the payoff always shows this card);
 *  5: a conversion-rate gauge, its needle swinging up a notch per fix, the
 *     old reading left as a dashed ghost;
 *  6: an "orders today" sparkline that steepens with every fix; at the
 *     payoff, a before/after strip (flat dash → arrow) for the three.
 * The payoff's card alternatives (?card=2..4; 1 is the card, 4 above):
 *  7: bars, one per metric: the old length a dashed ghost, the bar itself
 *     growing (shrinking for abandoned carts) a third at every fix;
 *  8: orders week by week, as bars: the weeks after each fix stand taller;
 *  9: three small dials, each needle swinging the right way a notch per fix.
 */
const Metrics = ({
  variant,
  k,
  focus,
  className,
}: {
  variant: number;
  k: number[];
  focus: number;
  className?: string;
}) => {
  const m = useMessages().landing.sales.metrics;
  if (variant === 4) return <Card k={k} focus={focus} labels={[m.conversion, m.orders, m.abandoned]} className={className} />;
  if (variant === 7) return <Bars k={k} labels={[m.conversion, m.orders, m.abandoned]} className={className} />;
  if (variant === 8) return <Weeks k={k} label={m.orders} className={className} />;
  if (variant === 9) return <Dials k={k} labels={[m.conversion, m.orders, m.abandoned]} className={className} />;
  if (variant === 5) return <Gauge k={k} label={m.conversion} className={className} />;
  if (variant === 6)
    return focus >= 3 ? (
      <Strip k={k} labels={[m.conversion, m.orders, m.abandoned]} before={m.before} after={m.after} className={className} />
    ) : (
      <Spark k={k} label={m.ordersToday} className={className} />
    );
  return null;
};

/** A hand's wobble along a stroke: fixed per point, never boiling. */
const wob = (i: number, seed: number) => Math.sin(i * 1.7 + seed * 2.3) * 0.8 + Math.sin(i * 0.6 + seed) * 0.6;
const line = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
/** An arrow's head at (x, y), pointing at angle `a` (radians). */
const head = (x: number, y: number, a: number, s = 7) =>
  `M${(x - Math.cos(a - 0.55) * s).toFixed(1)} ${(y - Math.sin(a - 0.55) * s).toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)} L${(
    x - Math.cos(a + 0.55) * s
  ).toFixed(1)} ${(y - Math.sin(a + 0.55) * s).toFixed(1)}`;

/** Where each fix's step starts on the payoff card's lines (point index along a line). */
const PAYOFF_KNEES = [2, 5, 8];

const Card = ({ k, focus, labels, className }: { k: number[]; focus: number; labels: string[]; className?: string }) => {
  const W = 330;
  const H = 168;
  const rows = [0, 1, 2];
  return (
    <svg className={cn("sl-met", className)} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {/* the card, by hand */}
      <path
        className="sl-met-soft"
        d="M14 4 C 120 2.5, 220 5, 316 3.5 Q 326 4, 326 14 C 327.5 60, 325 110, 326.5 154 Q 326 164, 316 164 C 210 165.5, 110 163, 14 164.5 Q 4 164, 4 154 C 2.5 110, 5 60, 3.5 14 Q 4 4, 14 4 Z"
      />
      {rows.map((r) => {
        const y0 = 34 + r * 48;
        const up = r < 2;
        const all = focus >= 3;
        // in a beat its own stage's fix; at the payoff, any fix so far
        const kk = all ? Math.min(1, k[0] + k[1] + k[2]) : k[r];
        const pts: [number, number][] = [];
        for (let j = 0; j < 12; j++) {
          const x = 168 + j * 10;
          // the payoff: a step per fix (from j 2, 5, 8), each lifting the rest of the line a notch
          const bend = all
            ? PAYOFF_KNEES.reduce((b, kn, i) => b + Math.min(1, Math.max(0, (j - kn) / 3)) * 8 * k[i], 0)
            : j >= 6
              ? ((j - 5) / 6) * 20 * kk
              : 0;
          pts.push([x, y0 + wob(j, r) * 1.6 + (up ? -bend : bend) + (up ? 2 : -2)]);
        }
        const [ex, ey] = pts[pts.length - 1];
        const on = focus >= 3 || focus === r;
        return (
          <g key={r} style={{ opacity: on ? 1 : 0.5 }}>
            <text className="sl-met-label" x={16} y={y0 + 6}>
              {labels[r]}
            </text>
            <path className="sl-met-ink" d={line(pts)} />
            <path
              className="sl-met-ink"
              d={`M${ex + 12} ${ey + (up ? 9 : -9)} L${ex + 26} ${ey + (up ? -9 : 9)} ${head(ex + 26, ey + (up ? -9 : 9), up ? -0.9 : 0.9)}`}
              style={{ opacity: kk }}
            />
          </g>
        );
      })}
    </svg>
  );
};

const Gauge = ({ k, label, className }: { k: number[]; label: string; className?: string }) => {
  const cx = 130;
  const cy = 122;
  const R = 96;
  const v0 = 0.2;
  const v = v0 + 0.23 * (k[0] + k[1] + k[2]);
  const at = (val: number, r: number): [number, number] => [cx - Math.cos(Math.PI * val) * r, cy - Math.sin(Math.PI * val) * r];
  const arc: [number, number][] = [];
  for (let j = 0; j <= 40; j++) {
    const [x, y] = at(j / 40, R + wob(j, 3) * 0.8);
    arc.push([x, y]);
  }
  const ticks = Array.from({ length: 9 }, (_, j) => {
    const [x0, y0] = at(j / 8, R - 4);
    const [x1, y1] = at(j / 8, R - (j % 2 ? 12 : 18));
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }).join(" ");
  const [gx, gy] = at(v0, R - 26);
  const [nx, ny] = at(v, R - 22);
  // the swing so far, drawn as a little arc outside the dial
  const swing: [number, number][] = [];
  for (let j = 0; j <= 16; j++) swing.push(at(v0 + ((v - v0) * j) / 16, R + 12));
  return (
    <svg className={cn("sl-met", className)} viewBox="0 0 260 168" aria-hidden="true">
      <path className="sl-met-ink" d={line(arc)} />
      <path className="sl-met-thin" d={ticks} />
      <path className="sl-met-ghost" d={`M${cx} ${cy} L${gx.toFixed(1)} ${gy.toFixed(1)}`} />
      <path className="sl-met-ink is-bold" d={`M${cx} ${cy} L${nx.toFixed(1)} ${ny.toFixed(1)}`} />
      <circle className="sl-met-dot" cx={cx} cy={cy} r={6} />
      {v > v0 + 0.02 && (
        <path
          className="sl-met-ink"
          d={`${line(swing)} ${head(swing[16][0], swing[16][1], Math.atan2(swing[16][1] - swing[14][1], swing[16][0] - swing[14][0]), 8)}`}
        />
      )}
      <text className="sl-met-label" x={cx} y={cy + 32} textAnchor="middle">
        {label}
      </text>
    </svg>
  );
};

const Spark = ({ k, label, className }: { k: number[]; label: string; className?: string }) => {
  const W = 330;
  const H = 150;
  const x0 = 14;
  const x1 = 290;
  const yb = 128;
  const n = 28;
  const val = (x: number) => 0.14 * x + [0.25, 0.5, 0.72].reduce((s, xi, i) => s + k[i] * 0.85 * Math.max(0, x - xi), 0);
  const top = val(1) > 0.6 ? val(1) : 0.6;
  const pts: [number, number][] = [];
  for (let j = 0; j <= n; j++) {
    const x = j / n;
    pts.push([x0 + x * (x1 - x0), yb - 8 - (val(x) / top) * 82 + wob(j, 5) * 1.4]);
  }
  const [ex, ey] = pts[n];
  return (
    <svg className={cn("sl-met", className)} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <text className="sl-met-label" x={x0} y={22}>
        {label}
      </text>
      <path className="sl-met-thin" d={`M${x0} ${yb} C 100 ${yb + 1.5}, 200 ${yb - 1}, ${x1 + 12} ${yb + 0.5}`} />
      <path className="sl-met-ink" d={line(pts)} />
      <circle className="sl-met-dot" cx={ex} cy={ey} r={5} />
      {/* each fix, a tick on the timeline where the line turns up */}
      {[0.25, 0.5, 0.72].map((xi, i) => (
        <path
          key={i}
          className="sl-met-thin"
          d={`M${(x0 + xi * (x1 - x0)).toFixed(1)} ${yb - 5} l0 10`}
          style={{ opacity: k[i] }}
        />
      ))}
    </svg>
  );
};

const Strip = ({
  k,
  labels,
  before,
  after,
  className,
}: {
  k: number[];
  labels: string[];
  before: string;
  after: string;
  className?: string;
}) => (
  <svg className={cn("sl-met", className)} viewBox="0 0 640 96" aria-hidden="true">
    <text className="sl-met-label is-small" x={444} y={14} textAnchor="middle">
      {before}
    </text>
    <text className="sl-met-label is-small" x={560} y={14} textAnchor="middle">
      {after}
    </text>
    {labels.map((l, r) => {
      const y = 36 + r * 26;
      const up = r < 2;
      const kk = k[r];
      return (
        <g key={r}>
          <text className="sl-met-label" x={8} y={y + 6}>
            {l}
          </text>
          <path className="sl-met-ghost" d={`M424 ${y} L464 ${y + 0.5}`} />
          <path
            className="sl-met-ink"
            d={`M544 ${y + (up ? 8 : -8)} L576 ${y + (up ? -8 : 8)} ${head(576, y + (up ? -8 : 8), up ? -0.46 : 0.46)}`}
            style={{ opacity: kk }}
          />
        </g>
      );
    })}
  </svg>
);

/** The card's hand-drawn frame (330 x 168), shared by the payoff's card alternatives. */
const FRAME =
  "M14 4 C 120 2.5, 220 5, 316 3.5 Q 326 4, 326 14 C 327.5 60, 325 110, 326.5 154 Q 326 164, 316 164 C 210 165.5, 110 163, 14 164.5 Q 4 164, 4 154 C 2.5 110, 5 60, 3.5 14 Q 4 4, 14 4 Z";
/** A box by hand, (x, y) w x h: its sides a hair off straight. */
const box = (x: number, y: number, w: number, h: number, seed: number) => {
  const j = (i: number) => wob(i, seed) * 0.5;
  return `M${(x + j(1)).toFixed(1)} ${(y + h).toFixed(1)} L${(x + j(2)).toFixed(1)} ${(y + j(3)).toFixed(1)} L${(x + w + j(4)).toFixed(1)} ${(y + j(5)).toFixed(1)} L${(x + w + j(6)).toFixed(1)} ${(y + h).toFixed(1)}`;
};

const Bars = ({ k, labels, className }: { k: number[]; labels: string[]; className?: string }) => {
  // a third of the way per fix
  const kk = (k[0] + k[1] + k[2]) / 3;
  return (
    <svg className={cn("sl-met", className)} viewBox="0 0 330 168" aria-hidden="true">
      <path className="sl-met-soft" d={FRAME} />
      {labels.map((l, r) => {
        const y = 22 + r * 48;
        const up = r < 2;
        const x0 = 16;
        const was = up ? 120 : 250;
        const now = up ? was + 160 * kk : was - 150 * kk;
        return (
          <g key={r}>
            <text className="sl-met-label is-small" x={x0} y={y + 4}>
              {l}
            </text>
            {/* before: a dashed ghost of the old length */}
            <path className="sl-met-ghost" d={`M${x0} ${y + 18} L${x0 + was} ${y + 18.5}`} />
            {/* now: the bar, filled */}
            <path className="sl-met-bar" d={`${box(x0, y + 12, now, 13, r)} Z`} />
          </g>
        );
      })}
    </svg>
  );
};

const Weeks = ({ k, label, className }: { k: number[]; label: string; className?: string }) => {
  const n = 10;
  const base = 146;
  const knees = [3, 5, 7];
  return (
    <svg className={cn("sl-met", className)} viewBox="0 0 330 168" aria-hidden="true">
      <path className="sl-met-soft" d={FRAME} />
      <text className="sl-met-label" x={16} y={30}>
        {label}
      </text>
      <path className="sl-met-thin" d={`M16 ${base} C 110 ${base + 1.5}, 220 ${base - 1}, 312 ${base + 0.5}`} />
      {Array.from({ length: n }, (_, j) => {
        const lift = knees.reduce((a, kn, i) => a + (j >= kn ? k[i] * 26 : 0), 0);
        const h = 22 + wob(j, 2) * 3 + lift;
        const x = 24 + j * 29;
        return <path key={j} className="sl-met-bar" d={`${box(x, base - h, 17, h, j)} Z`} />;
      })}
      {/* where each fix landed: a tick under the timeline */}
      {knees.map((kn, i) => (
        <path key={i} className="sl-met-thin" d={`M${24 + kn * 29 - 6} ${base + 6} l0 9`} style={{ opacity: k[i] }} />
      ))}
    </svg>
  );
};

const Dials = ({ k, labels, className }: { k: number[]; labels: string[]; className?: string }) => {
  const kk = (k[0] + k[1] + k[2]) / 3;
  return (
    <svg className={cn("sl-met", className)} viewBox="0 0 330 168" aria-hidden="true">
      <path className="sl-met-soft" d={FRAME} />
      {labels.map((l, r) => {
        const cx = 56 + r * 109;
        const cy = 92;
        const R = 38;
        const up = r < 2;
        const v0 = up ? 0.25 : 0.75;
        const v = up ? v0 + 0.5 * kk : v0 - 0.5 * kk;
        const at = (val: number, rr: number): [number, number] => [cx - Math.cos(Math.PI * val) * rr, cy - Math.sin(Math.PI * val) * rr];
        const arc: [number, number][] = [];
        for (let j = 0; j <= 24; j++) arc.push(at(j / 24, R + wob(j, r + 3) * 0.6));
        const [gx, gy] = at(v0, R - 10);
        const [nx, ny] = at(v, R - 8);
        return (
          <g key={r}>
            <path className="sl-met-ink" d={line(arc)} />
            <path className="sl-met-ghost" d={`M${cx} ${cy} L${gx.toFixed(1)} ${gy.toFixed(1)}`} />
            <path className="sl-met-ink is-bold" d={`M${cx} ${cy} L${nx.toFixed(1)} ${ny.toFixed(1)}`} />
            <circle className="sl-met-dot" cx={cx} cy={cy} r={4.5} />
            <text className="sl-met-label is-tiny" x={cx} y={cy + 32} textAnchor="middle">
              {l}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default Metrics;
