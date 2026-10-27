import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The payoff's sales piling up by the order bag (?pile=…): a heap of orders, or a receipt that keeps printing. */
export type PileLook = { kind: "heap" | "receipt"; side: "above" | "below" };

/**
 * ?pile=1a / 1b: a heap of orders on top of the bag (overflowing it) or
 * under it (dropping out of it); ?pile=4a / 4b: a receipt printing up out of
 * the bag or unrolling down from it. A bare 1 or 4 is the "below" one.
 * Anything else: none.
 */
export const pileLook = (q: string | null): PileLook | null => {
  const m = /^([14])([ab])?$/.exec(q ?? "");
  if (!m) return null;
  return { kind: m[1] === "1" ? "heap" : "receipt", side: m[2] === "a" ? "above" : "below" };
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const f1 = (v: number) => v.toFixed(1);

/** The heap's rows, bottom up: a mound narrowing as it grows. */
const ROWS = [9, 8, 7, 6, 5, 4, 3];
const HEAP = ROWS.reduce((a, b) => a + b, 0);

/**
 * The sales the payoff's funnel lets through, piling up beside its order
 * bag, to the right of the funnel (stage px): `k` (0 → 1) of the payoff's
 * whole pile so far (pileAt, on the scroll's clock, so it rewinds), `bag`
 * the bag's centre and radius, `room` how far it may grow (px) on its side.
 * In the buyers' warm white, by hand.
 */
const SalesPile = ({
  look,
  k,
  bag,
  room,
  on,
}: {
  look: PileLook;
  k: number;
  bag: { x: number; y: number; r: number };
  room: number;
  on: boolean;
}) => {
  const up = look.side === "above" ? -1 : 1;
  const edge = bag.y + up * (bag.r + 4);
  let body: ReactNode;
  if (look.kind === "heap") {
    // each order drops out of the bag (or pops up out of it) onto its place in the mound
    const d = clamp(Math.min(bag.r * 0.56, room / (ROWS.length * 0.86 + 1.2)), 6, 15);
    const ground = up > 0 ? edge + d * (ROWS.length * 0.86 + 0.6) : edge - d * 0.5;
    const src = { x: bag.x, y: bag.y + up * bag.r * 0.4 };
    const n = k * HEAP;
    const dots: ReactNode[] = [];
    let i = 0;
    ROWS.forEach((cap, row) => {
      for (let j = 0; j < cap; j++, i++) {
        const p = clamp(n - i);
        if (p <= 0) continue;
        const sx = bag.x + (j - (cap - 1) / 2) * d + Math.sin(i * 2.3) * d * 0.12;
        const sy = ground - row * d * 0.86;
        // below: a fall (gravity, a little bounce at the end); above: a hop up and over
        const e = up > 0 ? p * p : 1 - (1 - p) * (1 - p);
        const x = src.x + (sx - src.x) * e;
        const y = src.y + (sy - src.y) * e - (up < 0 ? Math.sin(Math.PI * p) * d * 1.4 : 0);
        dots.push(<circle key={i} cx={f1(x)} cy={f1(y)} r={f1(d * 0.4 * (0.75 + 0.25 * p))} opacity={Math.min(1, p * 3)} />);
      }
    });
    body = <g className="sl-pile-dots">{dots}</g>;
  } else {
    // the receipt: a strip printing out of the bag, a ticked line per order, its end torn
    const w = bag.r * 1.9;
    const x0 = bag.x - w / 2;
    const len = Math.max(0, room * 0.8 * k);
    const end = edge + up * len;
    const wav = (y: number, side: number) => x0 + (side > 0 ? w : 0) + Math.sin((y - edge) * 0.05 + side) * 1.2;
    const steps = Math.max(2, Math.ceil(len / 8));
    const side = (s: number) =>
      Array.from({ length: steps + 1 }, (_, n) => {
        const y = edge + (up * len * n) / steps;
        return `${f1(wav(y, s))} ${f1(y)}`;
      });
    const L = side(-1);
    const R = side(1).reverse();
    const teeth = 7;
    const torn = Array.from({ length: teeth + 1 }, (_, j) => `${f1(x0 + (w * j) / teeth)} ${f1(end + up * (j % 2 ? 4 : 0))}`);
    const strip = len > 1 ? `M${L.join(" L ")} L ${torn.join(" L ")} L ${R.join(" L ")}` : "";
    const step = clamp(bag.r * 0.5, 8, 13);
    const lines: ReactNode[] = [];
    for (let y = step * 0.8, i = 0; y < len - 5; y += step, i++) {
      const yy = edge + up * y;
      lines.push(
        <path
          key={i}
          d={
            `M${f1(x0 + w * 0.16)} ${f1(yy)} L ${f1(x0 + w * (0.52 + 0.1 * Math.sin(i * 1.9)))} ${f1(yy)}` +
            ` M${f1(x0 + w * 0.68)} ${f1(yy - 1)} L ${f1(x0 + w * 0.75)} ${f1(yy + 2.5)} L ${f1(x0 + w * 0.86)} ${f1(yy - 3)}`
          }
        />,
      );
    }
    body = (
      <g className="sl-pile-receipt">
        {strip && <path className="sl-pile-strip" d={strip} />}
        {lines}
      </g>
    );
  }
  return (
    <svg className={cn("sl-g2-pile", on && "is-on")} aria-hidden="true">
      {body}
    </svg>
  );
};

export default SalesPile;
