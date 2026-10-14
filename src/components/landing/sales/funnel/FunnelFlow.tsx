import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import AgentPin from "./AgentPin";
import { BAG, END, GATES, RAMP, STAGES, flows, ksAt, makeShoppers, rand, rate, startsFor } from "./model";

/** The status pills' row over the stages (px). */
const PILLS_H = 36;
/** A buyer's trip down the spout into the bag (s). */
const HOP = 0.45;
/** The fix moment's celebration (ms), from when the stage starts turning. */
const BURST = 1400;
/** The payoff's finale: how long before the end the bag bursts (ms). */
const FINALE = 1400;

type Geo = { W: number; H: number; cy: number; half: number; r: number; R: number; f: number[]; x0: number; xEnd: number };

const geometry = (W: number, H: number, k: number[]): Geo => {
  const top = PILLS_H + 8;
  const band = Math.max(80, H - top);
  const half = band * 0.4;
  return {
    W,
    H,
    cy: top + band * 0.46,
    half,
    r: Math.min(11, Math.max(5, band * 0.05)),
    R: Math.min(30, Math.max(17, half * 0.42)),
    f: flows(k),
    x0: STAGES[0][0] * W,
    xEnd: END * W,
  };
};

/**
 * The funnel's half-height at x (px): ALWAYS converging, from the wide mouth
 * on the left to the narrow spout on the right. A steady taper, times each
 * stage's share of the shoppers still in it (stepping down at each stage's
 * end, smoothly): both only ever shrink, so the funnel never flares. Past
 * the end, the spout keeps its width into the bag.
 */
const halfAt = (g: Geo, x: number) => {
  const u = Math.min(1, Math.max(0, (x - g.x0) / (g.xEnd - g.x0)));
  const taper = 1 - 0.48 * u;
  const seg = (j: number) => 0.5 + 0.5 * g.f[j];
  const blend = g.W * 0.03;
  let s = seg(0);
  GATES.forEach((gx, i) => {
    const t = Math.min(1, Math.max(0, (Math.min(x, g.xEnd) - (gx * g.W - blend)) / (2 * blend)));
    s += (seg(i + 1) - seg(i)) * t * t * (3 - 2 * t);
  });
  return Math.max(g.r * 1.6, g.half * taper * s);
};

const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};
const backOut = (k: number) => {
  const c = 2.2;
  return k <= 0 ? 0 : k >= 1 ? 1 : 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2;
};

export type FunnelCopy = { problems: string[]; solutions: string[] };

/** Any CSS colour as [r, g, b, a], via the canvas's own colour parser. */
const rgbaOf = (ctx: CanvasRenderingContext2D, color: string): number[] => {
  ctx.fillStyle = "#000";
  ctx.fillStyle = color;
  const v = String(ctx.fillStyle);
  if (v.startsWith("#")) return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16)).concat(1);
  const n = v.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  return [n[0], n[1], n[2], n[3] ?? 1];
};
const mix = (a: number[], b: number[], k: number) =>
  `rgb(${a
    .slice(0, 3)
    .map((v, i) => Math.round(v + (b[i] - v) * k))
    .join(" ")})`;

/**
 * The funnel's colours, from CSS variables on .sl-fn (a palette can restyle
 * it). The shoppers' mood is their colour: dim and grey when a stage fails
 * them (`--fn-sad`), warm gold when Bizmis helps (`--fn-glad`), brightest
 * and glowing as they buy (`--fn-buy`, `--fn-glow`).
 */
const palette = (el: HTMLElement, ctx: CanvasRenderingContext2D) => {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    sad: rgbaOf(ctx, v("--fn-sad", "rgb(128 112 102)")),
    glad: rgbaOf(ctx, v("--fn-glad", "rgb(255 226 150)")),
    buy: rgbaOf(ctx, v("--fn-buy", "rgb(255 251 236)")),
    glow: v("--fn-glow", "rgb(255 236 170)"),
    burst: v("--fn-burst", "white"),
    channel: v("--fn-channel", "rgb(255 255 255 / 0.1)"),
    fixed: v("--fn-fixed", "rgb(255 255 255 / 0.3)"),
    rim: v("--fn-rim", "rgb(255 255 255 / 0.85)"),
    rimBad: v("--fn-rim-bad", "rgb(255 255 255 / 0.4)"),
    shade: v("--fn-shade", "rgb(110 38 0 / 0.2)"),
  };
};

/**
 * The flow: the store's traffic as a stream of shoppers (round dots) pouring
 * through a real funnel on the band, wide at the mouth, converging to the
 * spout over the order bag. Their COLOUR is how they feel: in a stage Bizmis
 * hasn't fixed they're dim, grey and drifting, and many drop out through the
 * leak in its floor and fade; in a fixed stage they're warm gold, bigger and
 * lively; the ones who buy glow brightest as they pour down the spout into
 * the bag, which bounces, glows and sparkles. Never lossless: a fixed stage
 * still loses a few.
 *
 * The hero is the fix: when Bizmis fixes the beat's stage, its agent (the
 * real head render) lands in the leak with a shockwave and a burst of
 * sparkles, the stage floods with light and turns warm, the shoppers in it
 * jump and light up, and its status pill flips big from the problem to the
 * solution. Earlier fixes stay quietly fixed; later stages stay poor.
 *
 * `focus` 0–2 is a beat (its stage fixed at `fixAt`, the ones before it
 * already fixed, the rest still bad); 3 is the payoff (the bad funnel fixed
 * stage by stage, then the bag bursts). All drawn from `t` (ms), so it plays
 * backwards as well as forwards.
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
  const buyers = useMemo(() => shoppers.filter((s) => s.out === 3).sort((a, b) => a.sold - b.sold), [shoppers]);
  const k = ksAt(t, starts);
  const geo = geometry(size.W, size.H, k);
  const sec = t / 1000;
  const finale = payoff ? (t - (duration - FINALE)) / 1000 : -1;
  /** 0..1 through each stage's fix celebration (only the beat's own stage, or all three in the payoff). */
  const burst = starts.map((s, i) =>
    payoff || i === focus ? Math.min(1, Math.max(0, (t - (s + RAMP * 0.3)) / BURST)) : 0,
  );

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

  // the bag: a bounce and a glow for each buyer landing in it
  let bounce = 0;
  let glow = 0;
  for (const s of buyers) {
    const age = sec - (s.sold + HOP);
    if (age < -HOP) break;
    if (age < 0) continue;
    if (age < 0.4) bounce += (1 - age / 0.4) * 0.2;
    glow += Math.exp(-age / 0.6);
  }
  if (finale > 0) {
    bounce += finale < 0.7 ? Math.sin((finale / 0.7) * Math.PI) * 0.5 : 0;
    glow += 2 * Math.min(1, finale / 0.4);
  }
  bounce = Math.min(0.55, bounce);
  glow = Math.min(2.5, glow);

  useLayoutEffect(() => {
    const cv = canvas.current;
    const el = wrap.current;
    const { W, H } = size;
    if (!cv || !el || W < 10) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const c = palette(el, ctx);
    const g = geo;
    const { cy, r, x0, xEnd } = g;
    const bx = BAG * W;
    const spout = bx - g.R * 0.85;
    const step = 3;

    // a beat's own stage: a soft light pooling behind it
    if (!payoff) {
      const [a, b] = STAGES[focus];
      const mx = ((a + b) / 2) * W;
      const rad = (b - a) * W * 0.9;
      const pool = ctx.createRadialGradient(mx, cy, rad * 0.1, mx, cy, rad);
      pool.addColorStop(0, "rgb(255 255 255 / 0.28)");
      pool.addColorStop(1, "rgb(255 255 255 / 0)");
      ctx.fillStyle = pool;
      ctx.fillRect(mx - rad, cy - rad, rad * 2, rad * 2);
    }

    // ── the funnel: glass, converging; brighter where a stage is fixed (it sweeps through) ──
    const outline = () => {
      ctx.beginPath();
      ctx.moveTo(x0, cy - halfAt(g, x0));
      for (let x = x0; x <= spout; x += step) ctx.lineTo(x, cy - halfAt(g, x));
      for (let x = spout; x >= x0; x -= step) ctx.lineTo(x, cy + halfAt(g, x));
      ctx.closePath();
    };
    const fixedTo = (i: number) => STAGES[i][0] * W + (STAGES[i][1] - STAGES[i][0]) * W * k[i];
    ctx.save();
    outline();
    ctx.clip();
    ctx.fillStyle = c.channel;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = c.fixed;
    STAGES.forEach(([a], i) => {
      if (k[i] > 0) ctx.fillRect(a * W, 0, fixedTo(i) - a * W + (k[i] >= 1 ? 1 : 0), H);
    });
    if (k[2] >= 1) ctx.fillRect(STAGES[2][1] * W, 0, W, H);
    // the fix moment: the stage floods with light
    STAGES.forEach(([a, b], i) => {
      const e = burst[i];
      if (e <= 0 || e >= 1) return;
      const fl = ctx.createLinearGradient(a * W, 0, b * W, 0);
      const al = 0.75 * Math.sin(Math.PI * Math.min(1, e * 1.6)) * (payoff ? 0.7 : 1);
      fl.addColorStop(0, `rgb(255 255 255 / ${(al * 0.4).toFixed(3)})`);
      fl.addColorStop(0.5, `rgb(255 255 255 / ${al.toFixed(3)})`);
      fl.addColorStop(1, `rgb(255 255 255 / ${(al * 0.4).toFixed(3)})`);
      ctx.fillStyle = fl;
      ctx.fillRect(a * W, 0, (b - a) * W, H);
    });
    ctx.restore();

    // the rim: solid where fixed, faint and dashed where it leaks; each stage's leak a gap in the floor
    const holeMax = Math.max(24, r * 3.4);
    const holes = GATES.map((gx, i) => ({ x: gx * W, w: holeMax * ((1 - rate(i, k[i])) / 0.7) }));
    const fixedAt = (x: number) => {
      const i = STAGES.findIndex(([a, b]) => x >= a * W - 1 && x <= b * W + 1);
      return i < 0 ? k[2] >= 1 : k[i] > 0 && x <= fixedTo(i);
    };
    ctx.lineCap = "round";
    const rim = (sign: 1 | -1, from: number, to: number) => {
      let x = from;
      while (x < to) {
        const good = fixedAt(x);
        let nx = x;
        while (nx < to && fixedAt(nx) === good) nx += step;
        nx = Math.min(nx, to);
        ctx.strokeStyle = good ? c.rim : c.rimBad;
        ctx.lineWidth = good ? 2.4 : 1.6;
        ctx.setLineDash(good ? [] : [4, 5]);
        ctx.beginPath();
        for (let px = x; px <= nx; px += step) ctx.lineTo(px, cy + sign * halfAt(g, px));
        ctx.stroke();
        x = nx;
      }
      ctx.setLineDash([]);
    };
    rim(-1, x0, spout);
    let from = x0;
    for (const h of [...holes, { x: spout + holeMax, w: 0 }]) {
      const to = Math.min(h.x - h.w / 2, spout);
      if (to > from) rim(1, from, to);
      from = h.x + h.w / 2;
    }
    // the mouth: a straight edge, the funnel's widest point
    ctx.strokeStyle = k[0] > 0.5 ? c.rim : c.rimBad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, cy - halfAt(g, x0));
    ctx.lineTo(x0, cy + halfAt(g, x0));
    ctx.stroke();

    // ── the shoppers: their colour, glow, size and motion are their mood ──
    const dot = (x: number, y: number, rr: number, rgb: string, alpha: number, shine: number) => {
      if (alpha <= 0.01) return;
      ctx.globalAlpha = alpha;
      if (shine > 0) {
        ctx.shadowColor = c.glow;
        ctx.shadowBlur = rr * 2.2 * shine;
      }
      ctx.fillStyle = rgb;
      ctx.beginPath();
      ctx.arc(x, y, rr, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (shine > 0) {
        // a little highlight: lively
        ctx.globalAlpha = alpha * 0.7 * Math.min(1, shine);
        ctx.fillStyle = "rgb(255 255 255)";
        ctx.beginPath();
        ctx.arc(x - rr * 0.32, y - rr * 0.32, rr * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    for (const s of shoppers) {
      const age = sec - s.at;
      if (age < 0) continue;
      const rr = r * (0.88 + s.size * 0.24);
      const lostAt = s.out < 3 ? s.gate[s.out] : Infinity;
      if (sec >= lostAt) {
        // lost: grey and dim, it slips out through the leak and fades away
        const dt = sec - lostAt;
        if (dt > 1.4) continue;
        const gx = GATES[s.out] * W;
        const y0 = cy + s.lane * Math.max(0, halfAt(g, gx) - rr * 1.3);
        const x = gx + (s.phase - 0.4) * 22 * dt;
        const y = y0 + 0.5 * (g.H * 1.5) * dt * dt;
        const fade = Math.min(1, Math.max(0, (g.H - y) / 24)) * (1 - Math.max(0, dt - 0.8) / 0.6);
        dot(x, y, rr * (0.85 - 0.25 * Math.min(1, dt)), mix(c.sad, c.sad, 0), 0.75 * fade, 0);
        continue;
      }
      if (sec < s.sold) {
        const x = age * s.v * W;
        if (x < x0 + rr * 0.5) continue;
        const passed = s.gate.filter((gt) => sec >= gt).length;
        // how its current stage treats it: 0 failed (grey) … 1 helped (gold); through all three, buying
        const m = passed >= 3 ? 1 : k[passed];
        const jump = passed < 3 ? Math.sin(Math.PI * burst[passed]) : 0;
        const hop = Math.abs(Math.sin(Math.PI * (age * 2.2 + s.phase))) * rr * (0.1 + 0.8 * m) + jump * rr * 2.2;
        const drift = (1 - m) * Math.sin(sec * 2.4 + s.phase * 9) * rr * 0.5;
        const y = cy + s.lane * Math.max(0, halfAt(g, x) - rr * 1.4) - hop + drift;
        const enter = Math.min(1, Math.max(0, (x - x0) / (rr * 2)));
        const color = passed >= 3 ? mix(c.glad, c.buy, 0.6) : mix(c.sad, c.glad, m);
        dot(x, y, rr * (0.86 + 0.2 * m + 0.25 * jump), color, enter * (0.7 + 0.3 * m), m * (passed >= 3 ? 1.3 : 0.8) + jump);
        continue;
      }
      // a buyer: brightest, down the spout into the bag
      const p = (sec - s.sold) / HOP;
      if (p > 1) continue;
      const fy = cy + s.lane * Math.max(0, halfAt(g, xEnd) - rr * 1.4);
      const x = xEnd + (bx - xEnd) * p;
      const y = fy + (cy - fy) * p;
      dot(x, y, rr * (1.15 - 0.5 * p * p), mix(c.buy, c.buy, 0), 1, 1.6);
    }

    // the fix moment, the hero: a shockwave and a burst of sparkles from the agent
    STAGES.forEach((_, i) => {
      const e = burst[i];
      if (e <= 0 || e >= 1) return;
      const scale = payoff ? 0.7 : 1;
      const px = GATES[i] * W;
      const py = cy + halfAt(g, px);
      const ease = 1 - (1 - e) ** 3;
      for (const [d, w] of [
        [0, 3],
        [0.18, 2],
      ]) {
        const ee = Math.max(0, (e - d) / (1 - d));
        if (ee <= 0) continue;
        ctx.strokeStyle = c.burst;
        ctx.globalAlpha = 0.9 * (1 - ee);
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.arc(px, py, (14 + (1 - (1 - ee) ** 3) * g.half * 0.95) * scale, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (let j = 0; j < 22; j++) {
        const a = (j / 22) * Math.PI * 2 + i;
        const dd = (16 + ease * (g.half * 0.7 + (j % 3) * 10)) * scale;
        star(ctx, px + Math.cos(a) * dd, py + Math.sin(a) * dd * 0.8, (j % 2 ? 3 : 4.6) * scale, j % 3 ? c.burst : c.glow, 1 - e);
      }
    });

    // the bag's glow, and a sparkle ring for each buyer landing
    if (glow > 0.02) {
      const rad = g.R * (1.6 + glow * 0.8);
      const halo = ctx.createRadialGradient(bx, cy, g.R * 0.5, bx, cy, rad);
      halo.addColorStop(0, c.glow);
      halo.addColorStop(1, "rgb(255 255 255 / 0)");
      ctx.globalAlpha = Math.min(0.85, 0.4 * glow);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(bx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    buyers.forEach((s, n) => {
      const age = sec - (s.sold + HOP);
      if (age < 0 || age > 0.7) return;
      const e = age / 0.7;
      ctx.strokeStyle = c.burst;
      ctx.globalAlpha = 0.8 * (1 - e);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bx, cy, g.R * (1 + e * 0.9), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      for (let j = 0; j < 6; j++) {
        const a = (j / 6) * Math.PI * 2 + rand(n, 30) * 6;
        const d = g.R * (1.1 + 1.3 * e);
        star(ctx, bx + Math.cos(a) * d, cy + Math.sin(a) * d, (j % 2 ? 2.4 : 3.4) * (1 - e * 0.5), j % 2 ? c.glow : c.burst, 1 - e);
      }
    });
    // the payoff's finale: the bag bursts
    if (finale > 0) {
      const f = Math.min(1, finale / 1.2);
      ctx.strokeStyle = c.burst;
      ctx.globalAlpha = 0.85 * (1 - f);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(bx, cy, g.R + f * W * 0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      for (let j = 0; j < 40; j++) {
        const a = Math.PI * 2 * rand(j, 90);
        const v = 90 + 170 * rand(j, 92);
        star(ctx, bx + Math.cos(a) * v * finale, cy + Math.sin(a) * v * finale + 80 * finale * finale, j % 3 ? 3.2 : 4.4, j % 2 ? c.glow : c.burst, Math.max(0, 1 - f));
      }
    }

    // a beat: the rest of the funnel steps back a little; its stage and the bag stay bright
    if (!payoff) {
      const [a, b] = STAGES[focus];
      const spots = [
        [a - 0.01, b + 0.015],
        [END - 0.02, 1.2],
      ];
      const edge = 0.035;
      const dim = ctx.createLinearGradient(0, 0, W, 0);
      for (let i = 0; i <= 60; i++) {
        const u = i / 60;
        let lit = 0;
        for (const [p, q] of spots) lit = Math.max(lit, smooth(p - edge, p + edge, u) * (1 - smooth(q - edge, q + edge, u)));
        dim.addColorStop(u, `rgb(0 0 0 / ${(0.34 * (1 - lit)).toFixed(3)})`);
      }
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = dim;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, size, shoppers, buyers]);

  const W = size.W;

  return (
    <div className={cn("sl-flow", payoff ? "is-payoff" : `is-focus-${focus}`, className)} aria-hidden="true">
      <div ref={wrap} className="sl-flow-stage">
        <canvas ref={canvas} className="sl-flow-canvas" />
        {W > 0 &&
          STAGES.map(([a, z], i) => {
            const fixed = k[i];
            const hero = payoff || i === focus;
            // the hero's pill flips big at the fix, then stays a little larger
            const e = burst[i];
            const flip = e > 0 && e < 1 ? Math.sin(Math.PI * Math.min(1, e * 1.4)) : 0;
            const scale = hero ? (fixed >= 0.5 ? 1.08 + 0.35 * flip * (payoff ? 0.6 : 1) : 1.04) : 0.92;
            return (
              <span
                key={i}
                className={cn("sl-flow-pill", fixed >= 0.5 ? "is-fixed" : "is-bad", hero ? "is-hero" : "is-dim")}
                style={{ left: ((a + z) / 2) * W, scale: `${scale}` }}
              >
                <span className="sl-flow-pill-dot" style={{ scale: `${fixed >= 0.5 ? backOut(Math.min(1, (fixed - 0.5) * 2)) : 1}` }}>
                  {fixed >= 0.5 && <Check strokeWidth={3.2} />}
                </span>
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
                size={Math.round(Math.max(26, Math.min(38, geo.half * 0.5)))}
                className={cn("sl-flow-pin", !payoff && i !== focus && "is-dim")}
                style={{ left: x, top: geo.cy + halfAt(geo, x), scale: `${backOut(Math.min(1, p))}` } as CSSProperties}
              />
            );
          })}
        {W > 0 && (
          <span
            className="sl-flow-bag"
            style={
              {
                left: BAG * W,
                top: geo.cy,
                width: geo.R * 2,
                height: geo.R * 2,
                scale: `${1 + bounce}`,
                "--glow": glow.toFixed(3),
              } as CSSProperties
            }
          >
            <ShoppingBag strokeWidth={2.3} />
          </span>
        )}
      </div>
    </div>
  );
};

/** A little four-point sparkle. */
const star = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string, alpha: number) => {
  if (alpha <= 0.01) return;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 1.6);
  ctx.quadraticCurveTo(x, y, x + s * 1.6, y);
  ctx.quadraticCurveTo(x, y, x, y + s * 1.6);
  ctx.quadraticCurveTo(x, y, x - s * 1.6, y);
  ctx.quadraticCurveTo(x, y, x, y - s * 1.6);
  ctx.fill();
  ctx.globalAlpha = 1;
};

export default FunnelFlow;
