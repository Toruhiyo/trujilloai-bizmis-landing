import { useMemo } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { salesAt } from "./model";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const f1 = (v: number) => v.toFixed(1);

/** How many sales fly out of the bag over the whole payoff (each one a small check). */
const SALES = 150;
/** Every check's flight, bag to bar (ms): always the same; more of them leave the bag after each fix. */
const FLIGHT = 750;
/** It lands on the bar's top and melts into it (ms). */
const MELT = 300;
/** The clock's sampling step for the sales curve (ms). */
const STEP = 50;

/**
 * The payoff's win as the film's (ad-1, "Visits turn into sales"): a Sales
 * bar beside the funnel, no frame round it, rising all through the payoff.
 * Each sale leaves the order bag as a small check at one steady speed and
 * lands on the bar, which rises a notch per check: more checks leave the bag
 * after every fix (the sales the funnel lets through, salesAt), so the bar
 * climbs faster. It tops out exactly as the payoff ends. All a frame of the
 * scroll's clock `t`, so it rewinds. `from` the bag, `box` the bar's room
 * (stage px); wider than tall, it grows sideways (phones).
 */
const SalesJar = ({
  t,
  starts,
  duration,
  from,
  box,
  label,
  on,
}: {
  t: number;
  starts: number[];
  duration: number;
  from: { x: number; y: number };
  box: { x: number; y: number; w: number; h: number };
  label: string;
  on: boolean;
}) => {
  // when each check leaves the bag: where the payoff's sales curve crosses each one's share
  const leave = useMemo(() => {
    const at: number[] = [];
    let i = 0;
    for (let x = 0; x <= duration && i < SALES; x += STEP) {
      const k = salesAt(x, starts, duration);
      while (i < SALES && k >= (i + 0.5) / SALES) at[i++] = x;
    }
    while (i < SALES) at[i++] = duration;
    return at;
  }, [starts, duration]);
  const side = box.w > box.h;
  // the bar: one check's worth per landing, topping out as the payoff ends
  const landed = leave.reduce((n, l) => n + (t >= l + FLIGHT ? 1 : 0), 0);
  const last = leave.filter((l) => l + FLIGHT <= duration).length || 1;
  const level = clamp(landed / last);
  const labelRoom = side ? 64 : 30;
  const track = side
    ? { x: box.x, y: box.y, w: box.w - labelRoom, h: box.h }
    : { x: box.x, y: box.y, w: box.w, h: box.h - labelRoom };
  const bar = side
    ? { x: track.x, y: track.y, w: track.w * level, h: track.h }
    : { x: track.x, y: track.y + track.h * (1 - level), w: track.w, h: track.h * level };
  const r = Math.min(14, (side ? track.h : track.w) * 0.2);
  const badge = clamp(Math.min(box.w, box.h) * 0.045, 5, 8);
  // where a check lands: on the bar's top, spread across it
  const land = (i: number, lv: number): [number, number] => {
    const across = ((i * 0.618) % 1) * 0.76 + 0.12;
    return side
      ? [track.x + track.w * lv, track.y + track.h * across]
      : [track.x + track.w * across, track.y + track.h * (1 - lv) - badge * 0.6];
  };
  const checks: ReactNode[] = [];
  for (let i = 0; i < SALES; i++) {
    const age = t - leave[i];
    if (age <= 0 || age >= FLIGHT + MELT) continue;
    // the bar's top as it lands
    const [lx, ly] = land(i, clamp((i + 1) / last));
    let x = lx;
    let y = ly;
    let o = 1;
    if (age < FLIGHT) {
      const p = age / FLIGHT;
      const e = 1 - (1 - p) * (1 - p);
      const arc = Math.max(40, Math.abs(lx - from.x) * 0.3);
      x = from.x + (lx - from.x) * e;
      y = from.y + (ly - from.y) * p * p - Math.sin(Math.PI * p) * arc;
      o = Math.min(1, p * 5);
    } else o = 1 - (age - FLIGHT) / MELT;
    checks.push(
      <g key={i} transform={`translate(${f1(x)} ${f1(y)})`} opacity={o.toFixed(2)}>
        <circle r={badge} className="sl-jar-badge" />
        <path
          className="sl-jar-tick"
          d={`M${f1(-badge * 0.42)} ${f1(badge * 0.02)} L${f1(-badge * 0.1)} ${f1(badge * 0.34)} L${f1(badge * 0.45)} ${f1(-badge * 0.32)}`}
        />
      </g>,
    );
  }
  // the bar's rounded growing end, its base square on the ground line
  const d = side
    ? `M${f1(bar.x)} ${f1(bar.y)} H${f1(Math.max(bar.x, bar.x + bar.w - r))} Q${f1(bar.x + bar.w)} ${f1(bar.y)} ${f1(bar.x + bar.w)} ${f1(bar.y + r)} V${f1(bar.y + bar.h - r)} Q${f1(bar.x + bar.w)} ${f1(bar.y + bar.h)} ${f1(Math.max(bar.x, bar.x + bar.w - r))} ${f1(bar.y + bar.h)} H${f1(bar.x)} Z`
    : `M${f1(bar.x)} ${f1(bar.y + bar.h)} V${f1(bar.y + r)} Q${f1(bar.x)} ${f1(bar.y)} ${f1(bar.x + r)} ${f1(bar.y)} H${f1(bar.x + bar.w - r)} Q${f1(bar.x + bar.w)} ${f1(bar.y)} ${f1(bar.x + bar.w)} ${f1(bar.y + r)} V${f1(bar.y + bar.h)} Z`;
  return (
    <svg className={cn("sl-g2-jar", on && "is-on")} aria-hidden="true">
      {level > 0.002 && <path className="sl-jar-fill" d={d} />}
      {/* the ground it rises from */}
      <path
        className="sl-jar-ground"
        d={
          side
            ? `M${f1(track.x)} ${f1(track.y - 6)} L${f1(track.x + 0.5)} ${f1(track.y + track.h + 6)}`
            : `M${f1(track.x - 10)} ${f1(track.y + track.h)} C ${f1(track.x + track.w * 0.3)} ${f1(track.y + track.h + 1.5)}, ${f1(track.x + track.w * 0.7)} ${f1(track.y + track.h - 1)}, ${f1(track.x + track.w + 10)} ${f1(track.y + track.h + 0.5)}`
        }
      />
      <text
        className="sl-jar-label"
        x={side ? box.x + box.w - labelRoom / 2 : box.x + box.w / 2}
        y={side ? box.y + box.h / 2 + 6 : box.y + box.h - 6}
        textAnchor="middle"
      >
        {label}
      </text>
      {checks}
    </svg>
  );
};

export default SalesJar;
