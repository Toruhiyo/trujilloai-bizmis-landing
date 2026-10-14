import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import AgentPin from "./AgentPin";
import { END, GATES, PRIMARY, RAMP, STAGES, flows, ksAt, makeShoppers, rand, rate, startsFor } from "./model";

/** The status pills' row over the stages (px). */
const PILLS_H = 34;
/** The payoff's finale: how long before the end the shower of sales starts (ms), and how many. */
const FINALE = 1500;
const SHOWER = 26;
/** A sale's hop from the end of the stream into the Sales box (s). */
const HOP = 0.5;

type Geo = {
  W: number;
  H: number;
  cy: number;
  half: number;
  r: number;
  f: number[];
  bucket: { x0: number; x1: number; y0: number; y1: number; bar: number };
};

const geometry = (W: number, H: number, k: number[]): Geo => {
  const top = PILLS_H + 10;
  const band = Math.max(80, H - top - 8);
  const cy = top + band * 0.42;
  const half = band * 0.35;
  const r = Math.min(11, Math.max(5, band * 0.05));
  return {
    W,
    H,
    cy,
    half,
    r,
    f: flows(k),
    bucket: { x0: 0.795 * W, x1: 0.985 * W, y0: cy - half * 0.75, y1: H - 4, bar: Math.max(24, band * 0.15) },
  };
};

/** The stream's half-height at x (px): each stage as wide as the shoppers still in it. */
const halfAt = (g: Geo, x: number) => {
  // linear in the share still there: even fixed, the funnel visibly narrows
  const seg = (j: number) => g.half * (0.2 + 0.8 * g.f[j]);
  const blend = g.W * 0.025;
  let h = seg(0);
  GATES.forEach((gx, i) => {
    const s = Math.min(1, Math.max(0, (x - (gx * g.W - blend)) / (2 * blend)));
    h += (seg(i + 1) - seg(i)) * s * s * (3 - 2 * s);
  });
  return h;
};

const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};
const backOut = (k: number) => {
  const c = 2.2;
  return k <= 0 ? 0 : k >= 1 ? 1 : 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2;
};

/** Where the n-th sale sits in the Sales box: rows from the bottom, the mound rising past the rim when it overflows. */
const slot = (g: Geo, n: number) => {
  const { x0, x1, y1, bar } = g.bucket;
  const d = g.r * 2.1;
  const cols = Math.max(3, Math.floor((x1 - x0 - 8) / d));
  // a full box: later sales land (and pop) on the top of the mound instead of towering over it
  const rows = Math.max(3, Math.floor((y1 - bar - g.bucket.y0) / (g.r * 1.8)) + 1);
  const cap = cols * rows;
  const m = n < cap ? n : cap - 1 - ((n - cap) % (cols * 2));
  const row = Math.floor(m / cols);
  const c = m % cols;
  // fill from the middle out, so it heaps
  const mid = (cols - 1) / 2;
  const order = Array.from({ length: cols }, (_, i) => i).sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
  const col = order[c];
  const inset = Math.min(row, 2) * 0.5;
  const span = cols - 1 - inset * 2;
  const x = x0 + 4 + d / 2 + (inset + (col / (cols - 1)) * span) * d;
  return { x: Math.min(x1 - d / 2, x), y: y1 - bar - g.r * 1.1 - row * g.r * 1.8 };
};

export type FunnelCopy = { problems: string[]; solutions: string[]; sales: string };

/**
 * The flow, in the ad-1 film's language: the store's traffic as round clay
 * shoppers rolling left to right through the three stages. A stage that
 * isn't fixed is the film's problem world, grey and leaking, its status pill
 * grey ("Can't find it"): shoppers who drop there turn into white × marks
 * and fall out. When Bizmis fixes a stage it turns warm (the colour sweeps
 * through it), its agent (the real head render) lands in the leak and plugs
 * most of it, and its pill flips to the solution ("Found it", orange check).
 * Shoppers who make it through turn into orange ✓ marks and drop into the
 * Sales box, each with a little pop, piling up: few at first, many once
 * the stages are fixed. Never lossless: a fixed stage still loses some.
 *
 * `focus` 0–2 is a beat: the stages before it fixed already, its own in the
 * spotlight and fixed at `fixAt`, the later ones still bad. 3 is the
 * payoff: the bad funnel fixed stage by stage, then a shower of sales. All
 * drawn from `t` (ms), so it plays backwards as well as forwards.
 */
const FunnelFlow = ({
  t,
  duration,
  focus,
  fixAt,
  copy,
  className,
}: {
  t: number;
  duration: number;
  focus: number;
  fixAt?: number;
  copy: FunnelCopy;
  className?: string;
}) => {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ W: 0, H: 0 });
  const payoff = focus >= 3;
  const starts = useMemo(() => startsFor(focus, fixAt), [focus, fixAt]);
  const shoppers = useMemo(() => makeShoppers(duration, starts), [duration, starts]);
  // the sales, in the order they land (the ones from before 0 already in the box)
  const sales = useMemo(() => shoppers.filter((s) => s.out === 3).sort((a, b) => a.sold - b.sold), [shoppers]);
  const k = ksAt(t, starts);
  const geo = geometry(size.W, size.H, k);
  const sec = t / 1000;
  const finale = payoff ? (t - (duration - FINALE)) / 1000 : -1;

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

  // the Sales box glows with each sale landing
  let glow = 0;
  for (const s of sales) {
    const age = sec - (s.sold + HOP);
    if (age < -HOP) break;
    if (age >= 0) glow += Math.exp(-age / 0.5);
  }
  if (finale > 0) glow += 2 * Math.min(1, finale / 0.6);
  glow = Math.min(2.5, glow);

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
    const x0 = STAGES[0][0] * W;
    const xEnd = END * W;
    const step = 3;

    // ── the stream: one channel, grey where a stage leaks, warm where it's fixed (the colour sweeps through) ──
    const channel = () => {
      ctx.beginPath();
      ctx.moveTo(x0, cy - halfAt(g, x0));
      for (let x = x0; x <= xEnd; x += step) ctx.lineTo(x, cy - halfAt(g, x));
      for (let x = xEnd; x >= x0; x -= step) ctx.lineTo(x, cy + halfAt(g, x));
      ctx.closePath();
    };
    const fixedTo = (i: number) => STAGES[i][0] * W + (STAGES[i][1] - STAGES[i][0]) * W * k[i];
    ctx.save();
    channel();
    ctx.clip();
    ctx.fillStyle = "#ebe3d9";
    ctx.fillRect(0, 0, W, H);
    STAGES.forEach(([a], i) => {
      if (k[i] <= 0) return;
      const grad = ctx.createLinearGradient(a * W, 0, Math.max(a * W + 1, fixedTo(i)), 0);
      grad.addColorStop(0, "#fde3c6");
      grad.addColorStop(1, "#fcd4a8");
      ctx.fillStyle = grad;
      ctx.fillRect(a * W, 0, fixedTo(i) - a * W + (k[i] >= 1 ? 2 : 0), H);
    });
    ctx.restore();

    // its rim, the floor broken by each stage's leak (as wide as the share it loses)
    const holeMax = Math.max(24, r * 4.6);
    const holes = GATES.map((gx, i) => ({ x: gx * W, w: holeMax * ((1 - rate(i, k[i])) / 0.7) }));
    const rimColor = (x: number) => {
      const i = STAGES.findIndex(([a, b]) => x >= a * W && x <= b * W + 1);
      return i >= 0 && k[i] > 0 && x <= fixedTo(i) ? PRIMARY : "#cbbfb0";
    };
    const rim = (sign: 1 | -1, from: number, to: number) => {
      for (let x = from; x < to; x += step) {
        const nx = Math.min(to, x + step);
        ctx.strokeStyle = rimColor(x);
        ctx.beginPath();
        ctx.moveTo(x, cy + sign * halfAt(g, x));
        ctx.lineTo(nx, cy + sign * halfAt(g, nx));
        ctx.stroke();
      }
    };
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    rim(-1, x0, xEnd);
    let from = x0;
    for (const h of [...holes, { x: xEnd + holeMax, w: 0 }]) {
      const to = Math.min(h.x - h.w / 2, xEnd);
      if (to > from) rim(1, from, to);
      from = h.x + h.w / 2;
    }
    ctx.strokeStyle = "#cbbfb0";
    ctx.beginPath();
    ctx.moveTo(x0, cy - halfAt(g, x0));
    ctx.lineTo(x0, cy + halfAt(g, x0));
    ctx.stroke();

    // a beat's own stage, in the spotlight: an orange frame around it
    if (!payoff) {
      const [a, b] = STAGES[focus];
      const hMax = Math.max(halfAt(g, a * W + 4), halfAt(g, b * W - 4));
      ctx.save();
      ctx.globalAlpha = Math.min(1, t / 400);
      ctx.strokeStyle = PRIMARY;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "rgba(249,163,83,0.55)";
      ctx.shadowBlur = 14 * (0.6 + 0.4 * k[focus]);
      roundRect(ctx, a * W - 4, cy - hMax - 8, (b - a) * W + 8, hMax * 2 + 16, 14);
      ctx.stroke();
      ctx.restore();
    }

    // ── the shoppers ──
    const clay = (x: number, y: number, rr: number, warm: number, alpha = 1) => {
      if (alpha <= 0.01) return;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(90,60,30,0.2)";
      ctx.beginPath();
      ctx.ellipse(x, y + rr * 0.9, rr * 0.85, rr * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      const grad = ctx.createRadialGradient(x - rr * 0.35, y - rr * 0.4, rr * 0.1, x, y, rr);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(1, warm > 0.5 ? "#f3c48f" : "#c9bcac");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, rr, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };
    /** The film's marks: a white × disc (lost) or an orange ✓ disc (sold). */
    const mark = (x: number, y: number, rr: number, sold: boolean, alpha = 1, scale = 1) => {
      if (alpha <= 0.01) return;
      const R = rr * scale;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = sold ? "rgba(194,100,20,0.22)" : "rgba(60,40,20,0.12)";
      ctx.beginPath();
      ctx.arc(x, y + R * 0.18, R * 1.02, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = sold ? PRIMARY : "#ffffff";
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fill();
      if (!sold) {
        ctx.strokeStyle = "#e6ded4";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.strokeStyle = sold ? "#ffffff" : "#5f5650";
      ctx.lineWidth = Math.max(1.4, R * 0.2);
      ctx.lineCap = "round";
      ctx.beginPath();
      if (sold) {
        ctx.moveTo(x - R * 0.42, y + R * 0.02);
        ctx.lineTo(x - R * 0.1, y + R * 0.34);
        ctx.lineTo(x + R * 0.45, y - R * 0.3);
      } else {
        const q = R * 0.32;
        ctx.moveTo(x - q, y - q);
        ctx.lineTo(x + q, y + q);
        ctx.moveTo(x + q, y - q);
        ctx.lineTo(x - q, y + q);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    for (const s of shoppers) {
      const age = sec - s.at;
      if (age < 0) continue;
      const rr = r * (0.9 + s.size * 0.25);
      const lostAt = s.out < 3 ? s.gate[s.out] : Infinity;
      if (sec >= lostAt) {
        // lost: it turns into a × and drops out through the leak
        const dt = sec - lostAt;
        if (dt > 1.25) continue;
        const gx = GATES[s.out] * W;
        const y0 = cy + s.lane * Math.max(0, halfAt(g, gx) - rr * 1.3);
        const flip = Math.min(1, dt / 0.16);
        const x = gx + (s.phase - 0.35) * 18 * dt;
        const y = y0 + (dt > 0.18 ? 0.5 * (g.H * 2.6) * (dt - 0.18) ** 2 : 0) - 10 * Math.sin(Math.min(1, dt / 0.3) * Math.PI);
        const fade = Math.min(1, Math.max(0, (g.H - y) / 30)) * (1 - Math.max(0, dt - 0.9) / 0.35);
        if (flip < 1) clay(x, y, rr, 0, 1 - flip);
        mark(x, y, rr * 0.92, false, fade * flip, 0.7 + 0.3 * backOut(flip));
        continue;
      }
      if (sec < s.sold) {
        const x = age * s.v * W;
        const passed = s.gate.filter((gt) => sec >= gt).length;
        const hop = Math.abs(Math.sin(Math.PI * (age * 2 + s.phase))) * rr * 0.55;
        const y = cy + s.lane * Math.max(0, halfAt(g, x) - rr * 1.3) - hop;
        const enter = Math.min(1, Math.max(0, (x - x0 * 0.2) / (rr * 2.2)));
        const warm = passed > 0 && k[passed - 1] > 0.5 ? 1 : 0;
        clay(x, y, rr * (0.6 + 0.4 * enter), warm, enter);
      }
    }

    // ── the sales: each one turns into a ✓, hops into the Sales box with a pop, and stays ──
    const land = (x: number, y: number, age: number, idx: number) => {
      if (age >= 0 && age < 0.6) {
        const e = age / 0.6;
        ctx.strokeStyle = `rgba(249,163,83,${0.85 * (1 - e)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, r * (1.1 + e * 1.8), 0, Math.PI * 2);
        ctx.stroke();
        for (let j = 0; j < 5; j++) {
          const a = -Math.PI * (0.1 + 0.8 * rand(idx, 50 + j));
          const d = r * (1.4 + 2.2 * e);
          ctx.globalAlpha = 1 - e;
          ctx.fillStyle = j % 2 ? PRIMARY : "#ffd9a8";
          ctx.beginPath();
          ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      const pop = age >= 0 && age < 0.35 ? 1 + 0.35 * Math.sin((age / 0.35) * Math.PI) : 1;
      mark(x, y, r, true, 1, pop);
    };
    let n = 0;
    for (const s of sales) {
      const age = sec - s.sold;
      if (age < 0) break;
      const to = slot(g, n);
      const p = Math.min(1, age / HOP);
      const fy = cy + s.lane * Math.max(0, halfAt(g, xEnd) - r * 1.3);
      const x = xEnd + (to.x - xEnd) * p;
      const y = fy + (to.y - fy) * p - (26 + Math.max(0, fy - to.y) * 0.4) * 4 * p * (1 - p);
      if (p < 1) mark(x, y, r, true, 1, 0.75 + 0.25 * Math.min(1, age / 0.15));
      else land(to.x, to.y, age - HOP, n);
      n++;
    }
    // the payoff's finale: a shower of sales into the box, overflowing it
    if (finale > 0) {
      for (let j = 0; j < SHOWER; j++) {
        const age = finale - j * 0.04;
        if (age < 0) continue;
        const to = slot(g, n + j);
        const fx = g.bucket.x0 - W * 0.25 + rand(j, 70) * W * 0.45;
        const fall = Math.min(1, age / 0.55);
        const x = fx + (to.x - fx) * fall;
        const y = -20 + (to.y + 20) * fall * fall;
        if (fall < 1) mark(x, y, r, true, 1, 0.9);
        else land(to.x, to.y, age - 0.55, n + j);
      }
    }

    // a beat: the rest of the funnel steps back (fades into the card); its stage and the Sales stay lit
    if (!payoff) {
      const [a, b] = STAGES[focus];
      const spots = [
        [a - 0.012, b + 0.012],
        [0.775, 1.2],
      ];
      const edge = 0.02;
      const dim = ctx.createLinearGradient(0, 0, W, 0);
      for (let i = 0; i <= 60; i++) {
        const u = i / 60;
        let lit = 0;
        for (const [p, q] of spots) lit = Math.max(lit, smooth(p - edge, p + edge, u) * (1 - smooth(q - edge, q + edge, u)));
        dim.addColorStop(u, `rgba(0,0,0,${(0.38 * (1 - lit)).toFixed(3)})`);
      }
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = dim;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, size, shoppers, sales]);

  const W = size.W;
  const b = geo.bucket;

  return (
    <div className={cn("sl-flow", payoff ? "is-payoff" : `is-focus-${focus}`, className)} aria-hidden="true">
      <div ref={wrap} className="sl-flow-stage">
        {W > 0 && (
          <span
            className="sl-flow-sales"
            style={
              {
                left: b.x0,
                top: b.y0,
                width: b.x1 - b.x0,
                height: b.y1 - b.y0,
                "--glow": glow.toFixed(3),
                "--bar": `${b.bar}px`,
              } as CSSProperties
            }
          >
            <span className="sl-flow-sales-bar">{copy.sales}</span>
          </span>
        )}
        <canvas ref={canvas} className="sl-flow-canvas" />
        {W > 0 &&
          STAGES.map(([a, z], i) => {
            const fixed = k[i];
            const lit = payoff || i === focus;
            const pop = backOut(Math.min(1, Math.max(0, (t - starts[i] - RAMP * 0.45) / 450)));
            return (
              <span
                key={i}
                className={cn("sl-flow-pill", fixed >= 0.5 ? "is-fixed" : "is-bad", !lit && "is-dim")}
                style={{
                  left: ((a + z) / 2) * W,
                  scale: fixed >= 0.5 && fixed < 1 ? `${0.85 + 0.15 * pop}` : undefined,
                }}
              >
                <span className="sl-flow-pill-dot">{fixed >= 0.5 && <Check strokeWidth={3.2} />}</span>
                {fixed >= 0.5 ? copy.solutions[i] : copy.problems[i]}
              </span>
            );
          })}
        {W > 0 &&
          GATES.map((gx, i) => {
            const p = (t - starts[i]) / 560;
            if (!(p > 0)) return null;
            const x = gx * W;
            return (
              <AgentPin
                key={i}
                stage={i}
                on
                focus={payoff || i === focus}
                size={Math.round(Math.max(26, Math.min(36, geo.half * 0.6)))}
                className={cn("sl-flow-pin", !payoff && i !== focus && "is-dim")}
                style={
                  {
                    left: x,
                    top: geo.cy + halfAt(geo, x),
                    scale: `${backOut(Math.min(1, p))}`,
                  } as CSSProperties
                }
              />
            );
          })}
      </div>
    </div>
  );
};

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rad: number) => {
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
};

export default FunnelFlow;
