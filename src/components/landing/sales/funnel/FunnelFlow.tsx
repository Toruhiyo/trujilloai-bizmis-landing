import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import AgentPin from "./AgentPin";
import { BAG, END, GATES, RAMP, STAGES, flows, ksAt, makeShoppers, rand, rate, startsFor } from "./model";

/** The status pills' row over the stages (px). */
const PILLS_H = 30;
/** A buyer's jump from the end of the stream into the bag (s). */
const HOP = 0.45;
/** The payoff's finale: how long before the end the bag bursts (ms). */
const FINALE = 1400;

type Geo = { W: number; H: number; cy: number; half: number; r: number; R: number; f: number[] };

const geometry = (W: number, H: number, k: number[]): Geo => {
  const top = PILLS_H + 6;
  const band = Math.max(80, H - top);
  const half = band * 0.34;
  const r = Math.min(13, Math.max(6, band * 0.065));
  return { W, H, cy: top + band * 0.42, half, r, R: Math.min(30, Math.max(17, half * 0.55)), f: flows(k) };
};

/** The stream's half-height at x (px): each stage as wide as the shoppers still in it; even fixed, it narrows. */
const halfAt = (g: Geo, x: number) => {
  const seg = (j: number) => g.half * (0.22 + 0.78 * g.f[j]);
  const blend = g.W * 0.025;
  let h = seg(0);
  GATES.forEach((gx, i) => {
    const s = Math.min(1, Math.max(0, (x - (gx * g.W - blend)) / (2 * blend)));
    h += (seg(i + 1) - seg(i)) * s * s * (3 - 2 * s);
  });
  // a soft mouth opening toward the bag
  const end = END * g.W;
  if (x > end - g.W * 0.05) h += (Math.min(1, (x - (end - g.W * 0.05)) / (g.W * 0.05)) ** 2) * g.r * 0.6;
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

export type FunnelCopy = { problems: string[]; solutions: string[] };

/** The funnel's colours, from CSS variables on .sl-fn (so a palette can restyle it). */
const palette = (el: HTMLElement) => {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    body: v("--fn-body", "white"),
    ink: v("--fn-ink", "rgb(60 40 25)"),
    joy: v("--fn-joy", "hsl(29 93% 65%)"),
    channel: v("--fn-channel", "rgb(255 255 255 / 0.14)"),
    fixed: v("--fn-fixed", "rgb(255 255 255 / 0.3)"),
    rim: v("--fn-rim", "rgb(255 255 255 / 0.75)"),
    rimBad: v("--fn-rim-bad", "rgb(255 255 255 / 0.4)"),
    shade: v("--fn-shade", "rgb(120 50 0 / 0.2)"),
  };
};

/**
 * The flow: the store's traffic as round little shoppers with faces, rolling
 * through the three stages on the band, and their HAPPINESS is the measure.
 * In a stage Bizmis hasn't fixed they're unhappy and confused (worried brows,
 * a frown, a "?"), they drift, and many drop out sadly through the leak in
 * its floor. When Bizmis fixes a stage (its status pill flips from the
 * problem to the solution) its agent (the real head render) lands in the
 * leak and plugs most of it, and the shoppers in it light up: big smiles,
 * little hops. The ones who make it all the way are the happiest: they jump
 * into the order bag at the funnel's mouth with a sparkle, and the bag
 * bounces, glows and bursts. Never lossless: a fixed stage still loses some.
 *
 * `focus` 0–2 is a beat: the stages before it already fixed, its own in a
 * soft spotlight and fixed at `fixAt`, the later ones still bad. 3 is the
 * payoff: the bad funnel fixed stage by stage, then the bag bursts. All
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
  const buyers = useMemo(() => shoppers.filter((s) => s.out === 3).sort((a, b) => a.sold - b.sold), [shoppers]);
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

  // the bag: a bounce and a glow for each buyer landing in it
  let bounce = 0;
  let glow = 0;
  for (const s of buyers) {
    const age = sec - (s.sold + HOP);
    if (age < -HOP) break;
    if (age < 0) continue;
    if (age < 0.4) bounce += (1 - age / 0.4) * 0.22;
    glow += Math.exp(-age / 0.6);
  }
  if (finale > 0) {
    bounce += finale < 0.7 ? Math.sin((finale / 0.7) * Math.PI) * 0.5 : 0;
    glow += 2 * Math.min(1, finale / 0.4);
  }
  bounce = Math.min(0.6, bounce);
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
    const c = palette(el);
    const g = geo;
    const { cy, r } = g;
    const x0 = STAGES[0][0] * W + g.half * 0.4;
    const xEnd = END * W;
    const bx = BAG * W;
    const step = 3;

    // a beat's own stage: a soft light pooling behind it
    if (!payoff) {
      const [a, b] = STAGES[focus];
      const mx = ((a + b) / 2) * W;
      const rad = (b - a) * W * 0.85;
      const pool = ctx.createRadialGradient(mx, cy, rad * 0.1, mx, cy, rad);
      pool.addColorStop(0, "rgb(255 255 255 / 0.3)");
      pool.addColorStop(1, "rgb(255 255 255 / 0)");
      ctx.globalAlpha = Math.min(1, t / 500);
      ctx.fillStyle = pool;
      ctx.fillRect(mx - rad, cy - rad, rad * 2, rad * 2);
      ctx.globalAlpha = 1;
    }

    // ── the stream: glass on the band, brighter where a stage is fixed (it sweeps through) ──
    const channel = () => {
      ctx.beginPath();
      ctx.moveTo(x0, cy - halfAt(g, x0));
      for (let x = x0; x <= xEnd; x += step) ctx.lineTo(x, cy - halfAt(g, x));
      for (let x = xEnd; x >= x0; x -= step) ctx.lineTo(x, cy + halfAt(g, x));
      ctx.arc(x0, cy, halfAt(g, x0), Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
    };
    const fixedTo = (i: number) => STAGES[i][0] * W + (STAGES[i][1] - STAGES[i][0]) * W * k[i];
    ctx.save();
    channel();
    ctx.clip();
    ctx.fillStyle = c.channel;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = c.fixed;
    STAGES.forEach(([a], i) => {
      if (k[i] > 0) ctx.fillRect(i === 0 ? 0 : a * W, 0, fixedTo(i) - (i === 0 ? 0 : a * W) + (k[i] >= 1 ? 1 : 0), H);
    });
    if (k[2] >= 1) ctx.fillRect(STAGES[2][1] * W, 0, W, H);
    ctx.restore();

    // its rim: solid where fixed, faint and dashed where it leaks; the floor broken by each leak
    const holeMax = Math.max(26, r * 3.6);
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
        ctx.lineWidth = good ? 2.2 : 1.6;
        ctx.setLineDash(good ? [] : [4, 5]);
        ctx.beginPath();
        for (let px = x; px <= nx; px += step) ctx.lineTo(px, cy + sign * halfAt(g, px));
        ctx.stroke();
        x = nx;
      }
      ctx.setLineDash([]);
    };
    rim(-1, x0, xEnd);
    let from = x0;
    for (const h of [...holes, { x: xEnd + holeMax, w: 0 }]) {
      const to = Math.min(h.x - h.w / 2, xEnd);
      if (to > from) rim(1, from, to);
      from = h.x + h.w / 2;
    }
    ctx.strokeStyle = c.rimBad;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(x0, cy, halfAt(g, x0), Math.PI / 2, -Math.PI / 2);
    ctx.stroke();

    // ── the shoppers: a face, and its mood (-1 lost … 0 unsure … 1 delighted) ──
    const face = (x: number, y: number, rr: number, mood: number, alpha: number, puzzled: boolean) => {
      if (alpha <= 0.01) return;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = c.shade;
      ctx.beginPath();
      ctx.ellipse(x, y + rr * 0.95, rr * 0.8, rr * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c.body;
      ctx.beginPath();
      ctx.arc(x, y, rr, 0, Math.PI * 2);
      ctx.fill();
      // cheeks when happy
      if (mood > 0.4) {
        ctx.globalAlpha = alpha * Math.min(1, (mood - 0.4) * 1.6) * 0.55;
        ctx.fillStyle = c.joy;
        ctx.beginPath();
        ctx.arc(x - rr * 0.5, y + rr * 0.18, rr * 0.17, 0, Math.PI * 2);
        ctx.arc(x + rr * 0.5, y + rr * 0.18, rr * 0.17, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha;
      }
      ctx.strokeStyle = c.ink;
      ctx.fillStyle = c.ink;
      ctx.lineCap = "round";
      ctx.lineWidth = Math.max(1.2, rr * 0.13);
      const ex = rr * 0.32;
      const ey = y - rr * 0.14;
      if (mood > 0.6) {
        // delighted: eyes closed in a smile (^ ^)
        for (const sx of [-1, 1]) {
          ctx.beginPath();
          ctx.arc(x + sx * ex, ey + rr * 0.06, rr * 0.13, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.arc(x - ex, ey, rr * 0.1, 0, Math.PI * 2);
        ctx.arc(x + ex, ey, rr * 0.1, 0, Math.PI * 2);
        ctx.fill();
        if (mood < -0.1) {
          // worried brows: inner ends up
          ctx.lineWidth = Math.max(1, rr * 0.1);
          for (const sx of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(x + sx * (ex + rr * 0.16), ey - rr * 0.22);
            ctx.lineTo(x + sx * (ex - rr * 0.14), ey - rr * 0.34);
            ctx.stroke();
          }
          ctx.lineWidth = Math.max(1.2, rr * 0.13);
        }
      }
      // the mouth: a smile, a flat line or a frown
      const my = y + rr * 0.32;
      const w = rr * (0.3 + 0.08 * Math.max(0, mood));
      ctx.beginPath();
      ctx.moveTo(x - w, my);
      ctx.quadraticCurveTo(x, my + mood * rr * 0.42, x + w, my);
      ctx.stroke();
      if (puzzled && mood < -0.2) {
        ctx.font = `800 ${Math.round(rr * 1.1)}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = c.body;
        ctx.textAlign = "center";
        ctx.fillText("?", x + rr * 0.95, y - rr * 0.85);
      }
      ctx.globalAlpha = 1;
    };
    const time = sec;
    for (const s of shoppers) {
      const age = sec - s.at;
      if (age < 0) continue;
      const rr = r * (0.9 + s.size * 0.22);
      const lostAt = s.out < 3 ? s.gate[s.out] : Infinity;
      if (sec >= lostAt) {
        // lost: sad, it slips out through the leak and drifts away
        const dt = sec - lostAt;
        if (dt > 1.4) continue;
        const gx = GATES[s.out] * W;
        const y0 = cy + s.lane * Math.max(0, halfAt(g, gx) - rr * 1.3);
        const x = gx + (s.phase - 0.4) * 22 * dt;
        const y = y0 + 0.5 * (g.H * 1.6) * dt * dt;
        const fade = Math.min(1, Math.max(0, (g.H - y) / 24)) * (1 - Math.max(0, dt - 1) / 0.4);
        face(x, y, rr * (1 - 0.2 * Math.min(1, dt)), -1, fade, false);
        continue;
      }
      if (sec < s.sold) {
        const x = age * s.v * W;
        if (x < x0 - rr) continue;
        const passed = s.gate.filter((gt) => sec >= gt).length;
        // the mood: how its current stage treats it; through all three, delighted
        const mood = passed >= 3 ? 1 : -0.75 + 1.6 * k[passed];
        const happy = Math.max(0, mood);
        const hop = Math.abs(Math.sin(Math.PI * (age * 2.2 + s.phase))) * rr * (0.15 + 0.85 * happy);
        const wobble = (1 - happy) * Math.sin(time * 3 + s.phase * 9) * rr * 0.35;
        const y = cy + s.lane * Math.max(0, halfAt(g, x) - rr * 1.3) - hop + wobble;
        const enter = Math.min(1, Math.max(0, (x - x0 + rr) / (rr * 2)));
        face(x, y, rr * (0.6 + 0.4 * enter), mood, enter, rand(Math.round(s.at * 100), 9) < 0.4);
        continue;
      }
      // a buyer: a joyful jump into the bag
      const p = (sec - s.sold) / HOP;
      if (p > 1) continue;
      const fy = cy + s.lane * Math.max(0, halfAt(g, xEnd) - rr * 1.3);
      const x = xEnd + (bx - xEnd) * p;
      const y = fy + (cy - fy) * p - (g.R + 18) * 4 * p * (1 - p);
      face(x, y, rr * (1 - 0.45 * p * p), 1, 1, false);
    }

    // the bag's glow, and a sparkle for each buyer landing
    if (glow > 0.02) {
      const rad = g.R * (1.6 + glow * 0.8);
      const halo = ctx.createRadialGradient(bx, cy, g.R * 0.5, bx, cy, rad);
      halo.addColorStop(0, `rgb(255 245 220 / ${Math.min(0.8, 0.4 * glow)})`);
      halo.addColorStop(1, "rgb(255 245 220 / 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(bx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    buyers.forEach((s, n) => {
      const age = sec - (s.sold + HOP);
      if (age < 0 || age > 0.7) return;
      const e = age / 0.7;
      ctx.strokeStyle = `rgb(255 255 255 / ${0.8 * (1 - e)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bx, cy, g.R * (1 + e * 0.9), 0, Math.PI * 2);
      ctx.stroke();
      for (let j = 0; j < 7; j++) {
        const a = (j / 7) * Math.PI * 2 + rand(n, 30) * 6;
        const d = g.R * (1.1 + 1.3 * e);
        star(ctx, bx + Math.cos(a) * d, cy + Math.sin(a) * d, (j % 2 ? 2.4 : 3.4) * (1 - e * 0.5), j % 2 ? c.joy : c.body, 1 - e);
      }
    });
    // the payoff's finale: the bag bursts
    if (finale > 0) {
      const f = Math.min(1, finale / 1.2);
      ctx.strokeStyle = `rgb(255 255 255 / ${0.85 * (1 - f)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(bx, cy, g.R + f * W * 0.2, 0, Math.PI * 2);
      ctx.stroke();
      for (let j = 0; j < 40; j++) {
        const a = Math.PI * 2 * rand(j, 90);
        const v = 90 + 170 * rand(j, 92);
        const tt = finale;
        star(ctx, bx + Math.cos(a) * v * tt, cy + Math.sin(a) * v * tt + 80 * tt * tt, j % 3 ? 3.2 : 4.4, j % 2 ? c.joy : c.body, Math.max(0, 1 - f));
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
        dim.addColorStop(u, `rgb(0 0 0 / ${(0.42 * (1 - lit)).toFixed(3)})`);
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
                size={Math.round(Math.max(26, Math.min(38, geo.half * 0.55)))}
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
