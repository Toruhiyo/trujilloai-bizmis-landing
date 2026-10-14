import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import AgentPin from "./AgentPin";
import { BAG, GATES, POUR, RAMP, flows, ksAt, makeShoppers, startsFor } from "./model";

/** Height of the step labels' row under the stream (px). */
const LABELS_H = 22;

type Geo = {
  W: number;
  /** The funnel's band: the stream and its leaks (the labels sit under it). */
  F: number;
  cy: number;
  half: number;
  r: number;
  f: number[];
};

const geometry = (W: number, H: number, funnel: number, k: number[]): Geo => {
  const F = Math.max(60, H * funnel - LABELS_H);
  return {
    W,
    F,
    cy: F * 0.42,
    half: F * 0.33,
    r: Math.min(11, Math.max(5, F * 0.05)),
    f: flows(k),
  };
};

/** The stream's half-height at x (px): each stage as wide as the shoppers still in it, rounding into the bag. */
const halfAt = (g: Geo, x: number) => {
  const seg = (j: number) => g.half * (0.3 + 0.7 * Math.sqrt(g.f[j]));
  const blend = g.W * 0.03;
  let h = seg(0);
  GATES.forEach((gx, i) => {
    const s = Math.min(1, Math.max(0, (x - (gx * g.W - blend)) / (2 * blend)));
    h += (seg(i + 1) - seg(i)) * s * s * (3 - 2 * s);
  });
  const end = (BAG - 0.07) * g.W;
  if (x > end) {
    const s = Math.min(1, (x - end) / (BAG * g.W - end));
    h += (bagR(g) * 0.75 - h) * s * s;
  }
  return h;
};

const bagR = (g: Geo) => Math.min(24, Math.max(13, g.half * 0.5));
const holeW = (g: Geo) => Math.max(16, g.r * 3.4);

/**
 * The flow: the store's traffic as a stream of round, bouncing shoppers
 * pouring left to right through three stages (found a fit, decided,
 * ordered). At the end of each stage there's a leak in the stream's floor
 * where some drop out and leave; the rest roll into the orders bag, which
 * bounces as they land. When a stage improves, the agent (the real head
 * render) pops into its leak and plugs it, with a little burst: fewer drop
 * out and the stream after it swells.
 *
 * Driven by the timeline's `t` (ms): `focus` 0–2 improves that stage, 3 all
 * three in turn. With `target`, orders don't stop at the bag: they hop on
 * into that element (the payoff's sales), drawn over `children` (overlays in
 * the stage, under the stream's band when `funnel` < 1).
 */
const FunnelFlow = ({
  t,
  duration,
  focus,
  labels,
  funnel = 1,
  target,
  children,
  className,
}: {
  t: number;
  duration: number;
  focus: number;
  labels: string[];
  /** The share of the stage's height the stream takes (the rest is for `children`). */
  funnel?: number;
  target?: RefObject<HTMLElement>;
  children?: ReactNode;
  className?: string;
}) => {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ W: 0, H: 0 });
  const starts = useMemo(() => startsFor(focus), [focus]);
  const shoppers = useMemo(() => makeShoppers(duration, starts), [duration, starts]);
  const k = ksAt(t, starts);
  const geo = geometry(size.W, size.H, funnel, k);
  const sec = t / 1000;

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setSize((s) => (s.W === width && s.H === height ? s : { W: width, H: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // orders landing in the bag just now: it bounces
  let bounce = 0;
  for (const s of shoppers) {
    if (s.out !== 3) continue;
    const age = sec - s.bag;
    if (age >= 0 && age < 0.32) bounce += (1 - age / 0.32) * 0.11;
  }
  bounce = Math.min(0.32, bounce);

  useLayoutEffect(() => {
    const cv = canvas.current;
    const { W, H } = size;
    if (!cv || W < 10) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const g = geo;
    const { cy, r } = g;
    const bx = BAG * W;
    const x0 = r * 1.2;

    // where poured orders land (payoff): the target's centre, in the canvas
    let land: { x: number; y: number } | null = null;
    if (target?.current && wrap.current) {
      const a = wrap.current.getBoundingClientRect();
      const b = target.current.getBoundingClientRect();
      land = { x: b.left + b.width / 2 - a.left, y: b.top + b.height / 2 - a.top };
    }

    // the stream: a soft rounded channel
    const step = 3;
    ctx.beginPath();
    ctx.moveTo(x0, cy - halfAt(g, x0));
    for (let x = x0; x <= bx; x += step) ctx.lineTo(x, cy - halfAt(g, x));
    for (let x = bx; x >= x0; x -= step) ctx.lineTo(x, cy + halfAt(g, x));
    ctx.arc(x0, cy, halfAt(g, x0), Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    const fill = ctx.createLinearGradient(0, 0, W, 0);
    fill.addColorStop(0, "rgba(255,255,255,0.13)");
    fill.addColorStop(1, "rgba(255,247,232,0.3)");
    ctx.fillStyle = fill;
    ctx.fill();

    // its rim, with a gap in the floor at each stage's leak (closing as it improves)
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(x0, cy, halfAt(g, x0), -Math.PI / 2, Math.PI / 2, true);
    ctx.stroke();
    ctx.beginPath();
    for (let x = x0; x <= bx; x += step) ctx.lineTo(x, cy - halfAt(g, x));
    ctx.stroke();
    const holes = GATES.map((gx, i) => ({ x: gx * W, w: holeW(g) * (1 - k[i]) }));
    let from = x0;
    for (const h of [...holes, { x: bx + holeW(g), w: 0 }]) {
      const to = h.x - h.w / 2;
      if (to > from) {
        ctx.beginPath();
        for (let x = from; x <= Math.min(to, bx); x += step) ctx.lineTo(x, cy + halfAt(g, x));
        ctx.stroke();
      }
      from = h.x + h.w / 2;
    }
    // the stage dividers: faint, brighter once improved
    GATES.forEach((gx, i) => {
      const x = gx * W;
      const h = halfAt(g, x);
      ctx.strokeStyle = `rgba(255,255,255,${0.22 + 0.4 * k[i]})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      ctx.moveTo(x, cy - h + 4);
      ctx.lineTo(x, cy + h - 4);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // the shoppers
    const dot = (x: number, y: number, rr: number, color: string, alpha: number, eyes: boolean) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(150,58,0,0.16)";
      ctx.beginPath();
      ctx.ellipse(x, y + rr * 0.85, rr * 0.8, rr * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, rr, 0, Math.PI * 2);
      ctx.fill();
      if (eyes && rr > 3.5) {
        ctx.fillStyle = "rgba(156,66,6,0.85)";
        const ex = x + rr * 0.22;
        const ey = y - rr * 0.12;
        ctx.beginPath();
        ctx.arc(ex - rr * 0.3, ey, rr * 0.13, 0, Math.PI * 2);
        ctx.arc(ex + rr * 0.3, ey, rr * 0.13, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const bottom = g.F + LABELS_H - 4;
    for (const s of shoppers) {
      const age = sec - s.at;
      if (age < 0) continue;
      const rr = r * (0.88 + s.size * 0.28);
      const x = age * s.v * W;
      const leakAt = s.out < 3 ? s.gate[s.out] : Infinity;
      if (sec >= leakAt) {
        // out through the leak: a little hop, then down and gone
        const dt = sec - leakAt;
        if (dt > 1.1) continue;
        const gx = GATES[s.out] * W;
        const y0 = cy + s.lane * Math.max(0, halfAt(g, gx) - rr * 1.3);
        const lx = gx + s.v * W * 0.22 * dt + (rand01(s.phase) - 0.5) * 10 * dt;
        const ly = y0 - 40 * dt + 0.5 * (g.F * 3.2) * dt * dt;
        const fade = Math.max(0, 1 - dt / 1.1) * Math.max(0, Math.min(1, (bottom - ly) / 20));
        dot(lx, ly, rr * 0.9, "rgba(255,236,220,1)", 0.85 * fade, false);
        continue;
      }
      if (sec < s.bag) {
        const passed = s.gate.filter((gt) => sec >= gt).length;
        const hop = Math.abs(Math.sin(Math.PI * (age * 2.1 + s.phase))) * rr * 0.9;
        const y = cy + s.lane * Math.max(0, halfAt(g, x) - rr * 1.3) - hop;
        // they roll in from the stream's rounded mouth
        const enter = Math.min(1, Math.max(0, (x - x0 * 0.4) / (rr * 2.4)));
        dot(x, y, rr * (0.6 + 0.4 * enter), passed >= 3 ? "#fff1cf" : "#ffffff", enter, true);
        continue;
      }
      // ordered: into the bag, or on into the sales
      if (!land) continue;
      const p = (sec - s.bag) / POUR;
      if (p > 1) continue;
      const lift = Math.abs(land.y - cy) * 0.35 + 26;
      const px = bx + (land.x - bx) * p;
      const py = cy + (land.y - cy) * p - lift * 4 * p * (1 - p);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      dot(px, py, rr * 0.92, "#ffd27a", 1, false);
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px, py, rr * 0.92, 0, Math.PI * 2);
      ctx.stroke();
    }

    // the moment a stage improves: a burst of sparks around its agent
    GATES.forEach((gx, i) => {
      const b = (t - (starts[i] + RAMP * 0.6)) / 900;
      if (b <= 0 || b >= 1) return;
      const px = gx * W;
      const py = cy + halfAt(g, px);
      const e = 1 - (1 - b) ** 3;
      ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - b)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 14 + e * 34, 0, Math.PI * 2);
      ctx.stroke();
      for (let j = 0; j < 12; j++) {
        const a = (j / 12) * Math.PI * 2 + i;
        const d = 18 + e * (30 + (j % 3) * 9);
        ctx.globalAlpha = 1 - b;
        ctx.fillStyle = j % 3 === 0 ? "#ffe2b0" : "#ffffff";
        ctx.beginPath();
        ctx.arc(px + Math.cos(a) * d, py + Math.sin(a) * d, (j % 2 ? 2.6 : 3.6) * (1 - b * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, size, funnel, shoppers]);

  const W = size.W;
  const labelX = [GATES[0] / 2, (GATES[0] + GATES[1]) / 2, (GATES[1] + GATES[2]) / 2, (GATES[2] + BAG) / 2];
  const r = bagR(geo);

  return (
    <div className={cn("sl-flow", className)} aria-hidden="true">
      <div ref={wrap} className="sl-flow-stage">
        {children}
        <canvas ref={canvas} className="sl-flow-canvas" />
        {W > 0 &&
          GATES.map((gx, i) => {
            const pop = (t - starts[i]) / 520;
            if (pop <= 0) return null;
            const x = gx * W;
            return (
              <AgentPin
                key={i}
                stage={i}
                on
                focus
                size={Math.round(Math.max(24, Math.min(34, geo.half * 0.62)))}
                className="sl-flow-pin"
                style={
                  {
                    left: x,
                    top: geo.cy + halfAt(geo, x),
                    scale: `${backOut(Math.min(1, pop))}`,
                  } as CSSProperties
                }
              />
            );
          })}
        {W > 0 && (
          <span
            className="sl-flow-bag"
            style={{
              left: BAG * W,
              top: geo.cy,
              width: r * 2,
              height: r * 2,
              scale: `${1 + bounce}`,
            }}
          >
            <ShoppingBag className="h-[48%] w-[48%]" strokeWidth={2.3} />
          </span>
        )}
        {W > 0 &&
          labels.map((label, i) => {
            const on = i === 0 ? 0 : k[i - 1];
            return (
              <span
                key={label}
                className={cn("sl-flow-label", on > 0.5 && "is-up")}
                style={{ left: labelX[i] * W, top: geo.F + 4 }}
              >
                {label}
              </span>
            );
          })}
      </div>
    </div>
  );
};

const backOut = (k: number) => {
  const c = 2.2;
  return k <= 0 ? 0 : 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2;
};
/** A stable jitter from a 0..1 seed. */
const rand01 = (x: number) => Math.abs(Math.sin(x * 9301 + 49297) * 233280) % 1;

export default FunnelFlow;
