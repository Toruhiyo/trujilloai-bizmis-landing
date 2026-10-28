import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * The payoff's store-analytics card (stacked payoff, SalesPayoff), in the
 * funnel's white marker and only ever pointing the right way (no figures:
 * we have none). `k` is how far each stage is fixed (0 → 1); at the payoff
 * (`focus` 3) every line (conversion rate and orders bend up, abandoned
 * carts bend down) turns a notch further at every fix, so the three fixes
 * add up in each.
 */
const Metrics = ({ k, focus, className }: { k: number[]; focus: number; className?: string }) => {
  const m = useMessages().landing.sales.metrics;
  return <Card k={k} focus={focus} labels={[m.conversion, m.orders, m.abandoned]} className={className} />;
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

export default Metrics;
