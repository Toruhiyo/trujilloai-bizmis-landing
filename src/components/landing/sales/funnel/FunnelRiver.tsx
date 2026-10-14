import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import AgentPin from "./AgentPin";
import type { ConceptProps } from "./model";
import { flows, seeded, useEased } from "./model";

const VW = 420;
const VH = 236;
const NX = [4, 132, 260, 388];
const NW = 7;
const CY = 98;
const T0 = 132;
const LANES = 9;
const LANE_SPEED = (() => {
  const rnd = seeded(5);
  return Array.from({ length: LANES + 3 }, () => 0.34 + rnd() * 0.22);
})();

const ribbon = (xa: number, a0: number, a1: number, xb: number, b0: number, b1: number) => {
  const m = (xa + xb) / 2;
  return `M${xa} ${a0}C${m} ${a0} ${m} ${b0} ${xb} ${b0}L${xb} ${b1}C${m} ${b1} ${m} ${a1} ${xa} ${a1}Z`;
};

/** A leak: the bottom of the stream peeling off and falling out of the store. */
const leak = (xa: number, top: number, bottom: number) => {
  const w = bottom - top;
  const xo = xa + 22 + w;
  const xi = xa + 22;
  return `M${xa} ${top}C${xo} ${top} ${xo} ${top} ${xo} ${VH + 2}L${xi} ${VH + 2}C${xi} ${bottom} ${xi} ${bottom} ${xa} ${bottom}Z`;
};

/**
 * Concept 3, the river: the whole funnel as one flowing band, visits on the
 * left, orders on the right. At each stage part of the band peels off and
 * falls away (shoppers who leave); with Bizmis on a stage, its agent sits on
 * that leak, the leak narrows and the band after it widens, all the way to a
 * fuller orders bag. Shoppers stream along it as dots.
 */
const FunnelRiver = ({ boost, focus, play, reduced, steps, left }: ConceptProps) => {
  const { cur, step } = useEased(boost);
  const [k, setK] = useState(boost);

  useEffect(() => {
    if (reduced) {
      cur.current = boost.slice();
      setK(boost);
      return;
    }
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      const moving = step(dt);
      setK(cur.current.slice());
      if (moving) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boost.join(), reduced]);

  const f = flows(k);
  const T = f.map((v) => T0 * v);
  const top = (i: number) => CY - T[i] / 2;
  const lane = (v: number) => {
    let d = `M0 ${top(0) + v * T[0]}`;
    for (let i = 0; i < 4; i++) {
      const y = top(i) + v * T[i];
      if (i > 0) {
        const m = (NX[i - 1] + NW + NX[i]) / 2;
        const yp = top(i - 1) + v * T[i - 1];
        d += `C${m} ${yp} ${m} ${y} ${NX[i]} ${y}`;
      }
      d += `L${NX[i] + NW} ${y}`;
    }
    return d;
  };
  const bagSize = 0.34 + 0.66 * Math.min(1, T[3] / (T0 * 0.32));

  return (
    <div className={cn("sl-river", play && !reduced && "is-playing")} aria-hidden="true">
      <div className="sl-river-stage">
        <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="sl-river-svg">
          <defs>
            <linearGradient id="sl-river-band" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0.42" />
              <stop offset="1" stopColor="#fff6e6" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="sl-river-leak" gradientUnits="userSpaceOnUse" x1="0" y1={CY - 20} x2="0" y2={VH}>
              <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2].map((i) => (
            <path
              key={`l${i}`}
              d={leak(NX[i] + NW, top(i) + T[i + 1], top(i) + T[i])}
              fill="url(#sl-river-leak)"
            />
          ))}
          {[0, 1, 2].map((i) => (
            <path
              key={`b${i}`}
              d={ribbon(
                NX[i] + NW,
                top(i),
                top(i) + T[i + 1],
                NX[i + 1],
                top(i + 1),
                top(i + 1) + T[i + 1],
              )}
              fill="url(#sl-river-band)"
            />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={`n${i}`}
              x={NX[i]}
              y={top(i)}
              width={NW}
              height={Math.max(2, T[i])}
              rx={3}
              className={cn("sl-river-node", (i === focus + 1 || (focus >= 3 && i > 0)) && "is-focus")}
            />
          ))}
          {/* shoppers streaming along the band, and dripping out of the leaks */}
          <g className="sl-river-dots">
            {Array.from({ length: LANES }, (_, j) => (
              <path
                key={`d${j}`}
                d={lane((j + 0.5) / LANES)}
                style={{ "--dur": `${LANE_SPEED[j]}s` } as CSSProperties}
              />
            ))}
          </g>
          <g className="sl-river-drips">
            {[0, 1, 2].map((i) => {
              const xa = NX[i] + NW;
              const a = top(i) + T[i + 1];
              const b = top(i) + T[i];
              const mid = (a + b) / 2;
              const xm = xa + 22 + (b - a) / 2;
              return (
                <path
                  key={`r${i}`}
                  d={`M${xa} ${mid}C${xm} ${mid} ${xm} ${mid} ${xm} ${VH}`}
                  style={{ "--dur": `${LANE_SPEED[LANES + i] * 2.2}s`, opacity: Math.min(1, (b - a) / 10) } as CSSProperties}
                />
              );
            })}
          </g>
        </svg>
        {[0, 1, 2].map((i) => {
          // the agent sits where the leak peels off
          const mid = top(i) + (T[i + 1] + T[i]) / 2;
          return (
            <AgentPin
              key={i}
              stage={i}
              on={boost[i] > 0}
              focus={focus === i || focus >= 3}
              size={26}
              className="sl-river-pin"
              style={{ left: `${((NX[i] + NW + 12) / VW) * 100}%`, top: `${(mid / VH) * 100}%` }}
            />
          );
        })}
        <span
          className="sl-river-bag"
          style={{ "--s": bagSize.toFixed(3), top: `${(CY / VH) * 100}%` } as CSSProperties}
        >
          <ShoppingBag className="h-1/2 w-1/2" strokeWidth={2.2} />
        </span>
        <span className="sl-river-left" style={{ left: `${((NX[0] + NW + 52) / VW) * 100}%` }}>
          {left}
        </span>
      </div>
      {steps.map((label, i) => (
        <span
          key={label}
          className={cn("sl-river-label", (i === focus + 1 || (focus >= 3 && i > 0)) && "is-focus")}
          style={{ left: `${((NX[i] + NW / 2) / VW) * 100}%` }}
        >
          {label}
        </span>
      ))}
    </div>
  );
};

export default FunnelRiver;
