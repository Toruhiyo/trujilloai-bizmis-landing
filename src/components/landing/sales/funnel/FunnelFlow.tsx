import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import AgentPin from "./AgentPin";
import type { ConceptProps } from "./model";
import { flows, rate, seeded, useEased } from "./model";

/** Where the three stage gates stand, and where the orders land (fractions of the width). */
const GATES = [0.25, 0.5, 0.75];
const END = 0.88;
const BAG = 0.95;
/** The stream's centre line and its widest half-height (fractions of the height). */
const CY = 0.4;
const HALF = 0.3;
const MAX = 2400;

type Geo = { W: number; H: number; f: number[] };

/** The channel's half-height at x: each stage's width follows how many shoppers are still in it. */
const half = ({ W, H, f }: Geo, x: number) => {
  const seg = (j: number) => H * HALF * (0.26 + 0.74 * Math.sqrt(f[j]));
  const blend = W * 0.035;
  let h = seg(0);
  GATES.forEach((g, i) => {
    const t = Math.min(1, Math.max(0, (x - (g * W - blend)) / (2 * blend)));
    const s = t * t * (3 - 2 * t);
    h += (seg(i + 1) - seg(i)) * s;
  });
  if (x > END * W) h *= Math.max(0, 1 - (x - END * W) / ((BAG - END) * W));
  return h;
};

/**
 * Concept 1, the flow: the store's traffic as a stream of hundreds of
 * shoppers pouring left to right through three gates (found a fit, decided,
 * ordered). At each gate some drip out of the stream and leave; the ones who
 * make it through pour into the orders bag, which glows with how fast they
 * land. With Bizmis on a stage, its agent stands at that gate, the leak thins
 * and the stream after it swells. A canvas, paused off screen; reduced
 * motion draws one settled frame.
 */
const FunnelFlow = ({ boost, focus, play, reduced, steps, left }: ConceptProps) => {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pins = useRef<(HTMLSpanElement | null)[]>([]);
  const bag = useRef<HTMLSpanElement>(null);
  const { cur, tgt, step } = useEased(boost);
  const sim = useRef<ReturnType<typeof makeSim> | null>(null);
  const redraw = useRef<() => void>(() => {});

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let W = 0;
    let H = 0;
    let raf = 0;
    let last = 0;

    const place = () => {
      const geo = { W, H, f: flows(cur.current) };
      GATES.forEach((g, i) => {
        const pin = pins.current[i];
        if (!pin) return;
        pin.style.left = `${g * 100}%`;
        pin.style.top = `${((H * CY + half(geo, g * W)) / H) * 100}%`;
      });
      const glow = sim.current ? Math.min(1, sim.current.glow / (W * 0.17)) : 0;
      bag.current?.style.setProperty("--glow", glow.toFixed(3));
    };

    const draw = () => {
      if (!sim.current) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      sim.current.draw(ctx, cur.current);
      place();
    };

    const resize = () => {
      const r = el.getBoundingClientRect();
      if (r.width < 10) return;
      W = r.width;
      H = r.height;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      sim.current = makeSim(W, H);
      if (reduced) cur.current = tgt.current.slice();
      sim.current.warm(cur.current, reduced ? 7 : 4);
      draw();
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      step(dt);
      sim.current?.update(dt, cur.current);
      draw();
      raf = requestAnimationFrame(tick);
    };

    redraw.current = draw;
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    if (play && !reduced) raf = requestAnimationFrame(tick);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, reduced]);

  // reduced motion: a settled frame for each new state
  useEffect(() => {
    if (!reduced || !sim.current) return;
    cur.current = boost.slice();
    sim.current = makeSim(sim.current.W, sim.current.H);
    sim.current.warm(cur.current, 7);
    redraw.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, boost.join()]);

  const labelX = [GATES[0] / 2, (GATES[0] + GATES[1]) / 2, (GATES[1] + GATES[2]) / 2, (GATES[2] + BAG) / 2];

  return (
    <div className="sl-flow" aria-hidden="true">
      <div ref={wrap} className="sl-flow-stage">
        <canvas ref={canvas} className="sl-flow-canvas" />
        {GATES.map((_, i) => (
          <AgentPin
            key={i}
            ref={(n) => {
              pins.current[i] = n;
            }}
            stage={i}
            on={boost[i] > 0}
            focus={focus === i || focus >= 3}
            size={26}
            className="sl-flow-pin"
          />
        ))}
        <span ref={bag} className="sl-flow-bag" style={{ left: `${BAG * 100}%`, top: `${CY * 100}%` }}>
          <ShoppingBag className="h-[46%] w-[46%]" strokeWidth={2.2} />
        </span>
        <span className="sl-flow-left" style={{ left: `${(GATES[0] + 0.03) * 100}%` }}>
          {left}
        </span>
      </div>
      {steps.map((label, i) => (
        <span
          key={label}
          className={cn(
            "sl-flow-label",
            (i === focus + 1 || (focus >= 3 && i > 0)) && "is-focus",
          )}
          style={{ left: `${labelX[i] * 100}%` } as CSSProperties}
        >
          {label}
        </span>
      ))}
    </div>
  );
};

/** The particle simulation: plain arrays, no allocation per frame. */
const makeSim = (W: number, H: number) => {
  const rnd = seeded(7);
  const x = new Float32Array(MAX);
  const y = new Float32Array(MAX);
  const lane = new Float32Array(MAX);
  const speed = new Float32Array(MAX);
  const phase = new Float32Array(MAX);
  const size = new Float32Array(MAX);
  const u = new Float32Array(MAX * 3);
  const vx = new Float32Array(MAX);
  const vy = new Float32Array(MAX);
  const life = new Float32Array(MAX);
  const passed = new Uint8Array(MAX);
  // 0 free, 1 flowing, 2 leaking
  const mode = new Uint8Array(MAX);
  const perSec = Math.max(140, W * 0.56);
  let carry = 0;
  let time = 0;
  let glow = 0;

  const spawn = () => {
    const i = mode.indexOf(0);
    if (i < 0) return;
    mode[i] = 1;
    x[i] = -4;
    lane[i] = (rnd() * 2 - 1) * 0.92;
    speed[i] = (W / 3.3) * (0.8 + rnd() * 0.4);
    phase[i] = rnd() * Math.PI * 2;
    size[i] = 0.95 + rnd() * 0.85;
    u[i * 3] = rnd();
    u[i * 3 + 1] = rnd();
    u[i * 3 + 2] = rnd();
    passed[i] = 0;
    life[i] = 1;
  };

  const update = (dt: number, k: number[]) => {
    time += dt;
    const geo = { W, H, f: flows(k) };
    carry += perSec * dt;
    while (carry >= 1) {
      spawn();
      carry -= 1;
    }
    let hits = 0;
    for (let i = 0; i < MAX; i++) {
      if (mode[i] === 1) {
        x[i] += speed[i] * dt;
        const g = passed[i];
        if (g < 3 && x[i] >= GATES[g] * W) {
          if (u[i * 3 + g] < rate(g, k[g])) passed[i] = g + 1;
          else {
            mode[i] = 2;
            vx[i] = speed[i] * (0.25 + u[i * 3 + g] * 0.3);
            vy[i] = H * (0.08 + rnd() * 0.18);
            continue;
          }
        }
        const wob = Math.sin(time * 1.7 + phase[i]) * 0.05;
        y[i] = H * CY + (lane[i] + wob) * half(geo, x[i]);
        if (x[i] >= BAG * W) {
          mode[i] = 0;
          hits++;
        }
      } else if (mode[i] === 2) {
        x[i] += vx[i] * dt;
        vy[i] += H * 0.7 * dt;
        y[i] += vy[i] * dt;
        life[i] -= dt / 1.6;
        if (life[i] <= 0 || y[i] > H + 4) mode[i] = 0;
      }
    }
    // how fast orders land, smoothed
    glow += (hits / Math.max(dt, 1e-3) - glow) * Math.min(1, dt / 0.9);
  };

  const draw = (ctx: CanvasRenderingContext2D, k: number[]) => {
    const geo = { W, H, f: flows(k) };
    // the channel
    ctx.beginPath();
    for (let px = 0; px <= BAG * W; px += 4) ctx.lineTo(px, H * CY - half(geo, px));
    for (let px = BAG * W; px >= 0; px -= 4) ctx.lineTo(px, H * CY + half(geo, px));
    ctx.closePath();
    const fill = ctx.createLinearGradient(0, 0, W, 0);
    fill.addColorStop(0, "rgba(255,255,255,0.05)");
    fill.addColorStop(1, "rgba(255,246,228,0.2)");
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 1;
    ctx.stroke();
    // the gates: brighter with Bizmis on
    GATES.forEach((g, i) => {
      const h = half(geo, g * W);
      const on = k[i];
      if (on > 0.02) {
        const glowG = ctx.createRadialGradient(g * W, H * CY, 0, g * W, H * CY, h * 1.4);
        glowG.addColorStop(0, `rgba(255,248,232,${0.32 * on})`);
        glowG.addColorStop(1, "rgba(255,248,232,0)");
        ctx.fillStyle = glowG;
        ctx.fillRect(g * W - h * 1.4, H * CY - h * 1.4, h * 2.8, h * 2.8);
      }
      ctx.strokeStyle = `rgba(255,255,255,${0.3 + 0.55 * on})`;
      ctx.lineWidth = 1.5 + on;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(g * W, H * CY - h - 3);
      ctx.lineTo(g * W, H * CY + h + 3);
      ctx.stroke();
      ctx.setLineDash([]);
    });
    // the shoppers
    for (let i = 0; i < MAX; i++) {
      if (mode[i] === 0) continue;
      if (mode[i] === 2) {
        ctx.fillStyle = `rgba(255,240,225,${0.75 * Math.max(0, life[i])})`;
        ctx.beginPath();
        ctx.arc(x[i], y[i], size[i] * 0.85, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      const p = passed[i];
      ctx.fillStyle =
        p >= 3 ? "#fff3d6" : p === 2 ? "rgba(255,255,255,0.98)" : p === 1 ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.arc(x[i], y[i], size[i] * (p >= 3 ? 1.35 : 1), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const warm = (k: number[], seconds: number) => {
    for (let t = 0; t < seconds; t += 1 / 30) update(1 / 30, k);
  };

  return {
    W,
    H,
    update,
    draw,
    warm,
    get glow() {
      return glow;
    },
  };
};

export default FunnelFlow;
