import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import AgentPin from "./AgentPin";
import {
  CHAMBERS,
  FALL,
  HOP,
  PEEL,
  SPOUT,
  boundsFor,
  halfAtU,
  ksAt,
  leakU,
  makeShoppers,
  sAt,
  startsFor,
  uAt,
} from "./model";

export type FunnelCopy = { problems: string[]; solutions: string[] };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (k: number) => {
  const x = clamp(k);
  return x * x * (3 - 2 * x);
};
/** A springy 0 → 1 (overshoots a little, settles). */
const spring = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.exp(-6 * k) * Math.cos(9 * k));
/** A 0 → 1 → 0 bump over [0, 1]. */
const hump = (k: number) => (k <= 0 || k >= 1 ? 0 : Math.sin(Math.PI * k));

/** The funnel drawing itself in, the first time it plays (ms). */
const REVEAL = 650;
/** The fix: the head stamped on, the circle scribbled round it, the chamber redrawn, the doodles (ms). */
const STAMP = 360;
const CIRCLE = 520;
const REDRAW = 760;
const DOODLE = 1100;

/** The layout (px), from the stage box's size. */
type Geo = {
  W: number;
  H: number;
  /** The labels' row. */
  top: number;
  cy: number;
  /** The mouth's half-height. */
  h0: number;
  x0: number;
  run: number;
  /** The shoppers' radius. */
  r: number;
  /** The marker's width for the details (dots' rings, doodles, the bag). */
  lw: number;
  /** The funnel's outline: the thickest marker. */
  ow: number;
  /** The bag. */
  bx: number;
  by: number;
  R: number;
  /** The heads' size. */
  head: number;
};

const geometry = (W: number, H: number): Geo => {
  const top = Math.round(clamp(H * 0.15, 26, 40));
  const R = clamp(H * 0.09, 15, 25);
  const bx = W - R * 1.75 - 2;
  const xEnd = bx - R * 2.2;
  const x0 = 10;
  const run = xEnd - x0;
  const avail = H - top;
  const h0 = Math.min(avail * 0.29, run * 0.18);
  const cy = top + 10 + h0;
  return {
    W,
    H,
    top,
    cy,
    h0,
    x0,
    run,
    r: clamp(h0 * 0.072, 2.8, 4.4),
    lw: clamp(h0 * 0.072, 2.6, 5),
    ow: clamp(h0 * 0.115, 4, 7.5) * (W < 480 ? 0.85 : 1),
    bx,
    by: cy,
    R,
    head: Math.round(clamp(h0 * 0.44, 22, 32)),
  };
};

/** Any CSS colour as [r, g, b, a], via the canvas's own colour parser. */
const rgbaOf = (ctx: CanvasRenderingContext2D, color: string): number[] => {
  ctx.fillStyle = "#000";
  ctx.fillStyle = color;
  const v = String(ctx.fillStyle);
  if (v.startsWith("#")) return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16)).concat(1);
  const n = v.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  return [n[0], n[1], n[2], n[3] ?? 1];
};
const rgba = (c: number[], a: number) => `rgb(${c[0]} ${c[1]} ${c[2]} / ${clamp(a * (c[3] ?? 1)).toFixed(3)})`;
const mixc = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k);

/**
 * The hand's wobble: a smooth, FIXED offset for a point `s` along a stroke
 * (`seed` tells strokes apart). It depends on where, never on when, so the
 * drawing never boils as it moves.
 */
const wobble = (s: number, seed: number) =>
  Math.sin(s * 0.11 + seed * 1.7) * 0.55 + Math.sin(s * 0.037 + seed * 4.1) * 0.85 + Math.sin(s * 0.23 + seed) * 0.25;

/**
 * The drawing's inks, from CSS variables on .sl-fn (a palette can restyle
 * it): the marker (`--fn-line`, white), the shoppers (`--fn-dot`), the ones
 * bought (`--fn-buy`, a light cream). Nothing dark anywhere.
 */
const readPalette = (el: HTMLElement, ctx: CanvasRenderingContext2D) => {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    line: rgbaOf(ctx, v("--fn-line", "white")),
    dot: rgbaOf(ctx, v("--fn-dot", "white")),
    buy: rgbaOf(ctx, v("--fn-buy", "rgb(255 244 205)")),
  };
};
type Palette = ReturnType<typeof readPalette>;

/** The labels' handwriting (ms): problems written on as a beat starts, one after another; at a fix, the strike, then the solution and its tick. */
const WRITE_AT = 150;
const WRITE_STAGGER = 170;
const STRIKE_AT = 140;
const STRIKE = 260;
const SOLVE_AT = 640;
const TICK = 260;
/** How long writing `text` takes: a steady pen, a little quicker for short words. */
const writeMs = (text: string) => 220 + text.length * 38;
/** The pen's pace: off the mark gently, steady, easing at the end. */
const pen = (k: number) => {
  const x = clamp(k);
  return x < 0.15 ? (x / 0.15) ** 2 * 0.1 : 0.1 + 0.9 * (1 - (1 - (x - 0.15) / 0.85) ** 1.6);
};
/** The written-so-far part of a word: a left-to-right reveal. */
const reveal = (k: number) => (k >= 1 ? undefined : `inset(-30% ${((1 - k) * 100).toFixed(2)}% -30% -8%)`);

/** Text widths in the handwriting, measured once per word, size and font state. */
let measureCtx: CanvasRenderingContext2D | null = null;
const widths = new Map<string, number>();
const SCRIPT = '"Caveat", cursive';
/** The largest size (px, ≤ `max`) at which `text` fits `w` px in the handwriting. */
const fitSize = (text: string, max: number, w: number) => {
  if (typeof document === "undefined") return max;
  const ready = document.fonts?.check?.(`700 20px ${SCRIPT}`) ? 1 : 0;
  const key = `${ready}|${max}|${text}`;
  let tw = widths.get(key);
  if (tw === undefined) {
    measureCtx ??= document.createElement("canvas").getContext("2d");
    if (!measureCtx) return max;
    measureCtx.font = `700 ${max}px ${SCRIPT}`;
    tw = measureCtx.measureText(text).width;
    widths.set(key, tw);
  }
  return tw <= w ? max : Math.max(10, Math.floor((max * w) / tw));
};

/**
 * The flow, as a playful marker drawing in white on the band: one funnel of
 * three chambers (the stages), always converging from the straight mouth to
 * the spout over the order bag. The store's shoppers stream through it as
 * white dots in calm lanes. Each chamber has a leak, a gap in its floor:
 * the shoppers it loses go hollow, drop out of it and fade, a waterfall
 * whose thickness IS the stage's loss. A bad stage also chokes its exit.
 *
 * The fix, drawn: the beat's chamber at full ink (the others at ~40%); its
 * agent's head is stamped onto the leak and circled with a scribble, a pen
 * redraws the chamber as its exit widens (the next entries follow, and a
 * double arrow marks the wider exit), little "pop" strokes and a star
 * doodle burst out, the leak shrinks to a slit, the waterfall thins to a
 * trickle, the label's problem is struck through and the solution written in its place,
 * and the shoppers in the fixed chamber bounce along. More of them reach
 * the bag, which squashes as each lands, and grows rays as orders keep
 * coming. Earlier fixes stay as they are; later stages keep leaking. Never
 * lossless.
 *
 * `focus` 0–2 is a beat (its stage fixed at `fixAt`, the ones before it
 * already fixed, the rest still bad); 3 is the payoff (the bad funnel,
 * fixed stage by stage in quick succession). All drawn from `t` (ms), so it
 * plays backwards as well as forwards.
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
  const pal = useRef<{ key: string; c: Palette } | null>(null);
  const drawn = useRef(false);
  const [size, setSize] = useState({ W: 0, H: 0 });
  const payoff = focus >= 3;
  const starts = useMemo(() => startsFor(focus, fixAt), [focus, fixAt]);
  const shoppers = useMemo(() => makeShoppers(duration, starts), [duration, starts]);
  const arrivals = useMemo(
    () => shoppers.filter((s) => s.out === 3).map((s) => s.exit + HOP).sort((a, b) => a - b),
    [shoppers],
  );
  const k = ksAt(t, starts);
  const bounds = boundsFor(k);
  const geo = geometry(size.W, size.H);
  const sec = t / 1000;
  // one size for all three labels: the largest at which every problem and solution (with its tick) fits its chamber
  const labelSize = Math.round(clamp(geo.top * 0.78, 18, 28));
  const labelRoom = Math.max(40, Math.min(...CHAMBERS.map(([a, b]) => b - a)) * geo.run - 8);
  const labelFit = Math.min(
    labelSize,
    ...copy.problems.map((p) => fitSize(p, labelSize, labelRoom)),
    ...copy.solutions.map((p) => fitSize(p, labelSize, labelRoom - labelSize * 0.95)),
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

  // the bag: a squash as each order lands; rays as they keep coming
  let squash = 0;
  let heat = 0;
  for (const at of arrivals) {
    const age = sec - at;
    if (age < 0) break;
    if (age < 0.45) squash += Math.exp(-age * 9) * Math.cos(age * 22) * 0.1;
    heat += Math.exp(-age / 2.6);
  }
  squash = clamp(squash, -0.12, 0.16);
  const bagScale = { x: 1 + squash, y: 1 - squash * 0.9 };

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
    const key = `${W}x${H}`;
    if (pal.current?.key !== key) pal.current = { key, c: readPalette(el, ctx) };
    const c = pal.current.c;
    const g = geo;
    const { cy, h0, r, lw, ow } = g;
    const X = (u: number) => g.x0 + u * g.run;
    const half = (u: number) => h0 * halfAtU(u, bounds);
    const floorAt = (u: number) => cy + half(u);
    const xEnd = X(1);
    const ink = (a: number) => rgba(c.line, a);
    const amp = 0.45;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    /** How far the outline has drawn itself in (u): once, the first time the funnel plays; after that it stays drawn through every rewind and replay. */
    if (t >= REVEAL) drawn.current = true;
    const reveal = drawn.current ? 1.06 : 1.06 * smooth(t / REVEAL);

    /** Each stage's leak: where it is, and how wide it's open now. */
    const leaks = [0, 1, 2].map((i) => {
      const u = leakU(i);
      const cw = (CHAMBERS[i][1] - CHAMBERS[i][0]) * g.run;
      const open = Math.min(cw * 0.19, 24);
      const slit = ow * 0.5;
      return { u, x: X(u), open, gap: open + (slit - open) * k[i] };
    });
    /** A lost shopper's drop point across a leak, `kk` fixed: the wide gap, or the slit past the head. */
    const dropX = (i: number, spread: number, kk: number) => {
      const L = leaks[i];
      const wide = L.x + spread * L.open * 0.75;
      const slit = L.x + g.head * 0.5 + lw + 2 + spread * 1.2;
      return wide + (slit - wide) * kk;
    };

    // ── the outline, in marker: per chamber, the top and the floor (broken at the leak) ──
    const stroke = (side: 1 | -1, u0: number, u1: number) => {
      const hi = Math.min(u1, reveal);
      if (hi <= u0) return;
      const steps = Math.max(2, Math.ceil(((hi - u0) * g.run) / 4));
      ctx.beginPath();
      for (let n = 0; n <= steps; n++) {
        const u = u0 + ((hi - u0) * n) / steps;
        const x = X(u);
        ctx.lineTo(x, cy + side * half(u) + amp * wobble(x, side > 0 ? 3 : 7));
      }
      ctx.stroke();
    };
    const sectionK = (i: number) => (i < 3 ? k[i] : Math.min(k[0], k[1], k[2]));
    for (let i = 0; i < 4; i++) {
      const [a, b] = i < 3 ? CHAMBERS[i] : SPOUT;
      const kk = sectionK(i);
      // full ink everywhere (overlapping ends stay seamless); a fixed stage's marker is bolder
      ctx.strokeStyle = ink(1);
      ctx.lineWidth = ow * (0.72 + 0.28 * kk);
      stroke(-1, a, b);
      if (i < 3) {
        const L = leaks[i];
        stroke(1, a, L.u - L.gap / g.run);
        stroke(1, L.u + L.gap / g.run, b);
      } else stroke(1, a, b);
    }
    // the mouth: straight (well, by hand)
    if (reveal > 0) {
      ctx.strokeStyle = ink(1);
      ctx.lineWidth = ow * (0.72 + 0.28 * k[0]);
      const m = smooth(reveal / 0.08);
      ctx.beginPath();
      for (let n = 0; n <= 12; n++) {
        const y = cy - h0 + 2 * h0 * m * (n / 12);
        ctx.lineTo(g.x0 + amp * wobble(y, 11), y);
      }
      ctx.stroke();
    }
    // the seams between chambers: a light dashed scribble
    ctx.lineWidth = Math.max(1.5, lw * 0.4);
    ctx.setLineDash([lw * 0.9, lw * 1.6]);
    for (const [i, u] of [CHAMBERS[1][0], CHAMBERS[2][0], SPOUT[0]].entries()) {
      if (u > reveal) continue;
      const hh = half(u) - ow * 1.2;
      ctx.strokeStyle = ink(0.45 + 0.35 * k[i]);
      ctx.beginPath();
      ctx.moveTo(X(u), cy - hh);
      ctx.lineTo(X(u) + 1, cy + hh);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // ── the fix, drawn ──
    for (let i = 0; i < 3; i++) {
      const since = t - starts[i];
      if (!(since > 0)) continue;
      const L = leaks[i];
      const fy = floorAt(L.u);
      const hr = g.head * 0.5;
      const [a, b] = CHAMBERS[i];
      // a pen retraces the chamber's new outline as its exit widens
      const e = since / REDRAW;
      if (e < 1.2) {
        const pen = a + (b - a) * smooth(Math.min(1, e));
        ctx.strokeStyle = ink(1);
        ctx.lineWidth = ow * (1.15 - 0.15 * smooth((e - 1) / 0.2));
        stroke(-1, a, pen);
        stroke(1, a, Math.min(pen, L.u - L.gap / g.run));
        stroke(1, L.u + L.gap / g.run, pen);
      }
      // the scribbled circle round the agent: a loop and a bit, like circling it on paper
      const ce = smooth((since - 80) / CIRCLE);
      if (ce > 0) {
        ctx.strokeStyle = ink(0.95);
        ctx.lineWidth = Math.max(1.8, lw * 0.6);
        ctx.beginPath();
        const turns = 2.25 * Math.PI * ce;
        for (let n = 0; n <= 48; n++) {
          const th = -Math.PI * 0.75 + (turns * n) / 48;
          const rr = hr + lw * 0.9 + 2 + (n / 48) * lw * 0.9 + Math.sin(th * 3 + i) * 1.2;
          ctx.lineTo(L.x + Math.cos(th) * rr, fy + Math.sin(th) * rr * 0.96);
        }
        ctx.stroke();
      }
      // the wider exit: a double arrow drawn across it
      const ae = smooth((since - 250) / 500);
      if (ae > 0) {
        const x = X(b) - ow * 1.8;
        const hh = (half(b) - ow * 1.6) * ae;
        if (hh > 2) {
          ctx.strokeStyle = ink(0.95);
          ctx.lineWidth = Math.max(1.8, lw * 0.6);
          const head = Math.min(hh * 0.5, lw * 1.6 + 2);
          ctx.beginPath();
          ctx.moveTo(x, cy - hh);
          ctx.lineTo(x + 0.8, cy + hh);
          for (const s of [-1, 1]) {
            ctx.moveTo(x - head * 0.8, cy + s * (hh - head));
            ctx.lineTo(x, cy + s * hh);
            ctx.lineTo(x + head * 0.8, cy + s * (hh - head));
          }
          ctx.stroke();
        }
      }
      // the pop: little strokes bursting out round the head, and a star doodle
      const de = (since - STAMP * 0.7) / DOODLE;
      if (de > 0 && de < 1) {
        const out = smooth(de / 0.35);
        const gone = smooth((de - 0.55) / 0.45);
        ctx.strokeStyle = ink(1 - gone);
        ctx.lineWidth = Math.max(2, lw * 0.7);
        for (let j = 0; j < 5; j++) {
          const th = Math.PI * (1.05 + j * 0.225);
          const r0 = hr + lw * 2.6 + out * lw * 1.2;
          const r1 = r0 + lw * (0.6 + 1.8 * out) * (1 - gone * 0.6);
          ctx.beginPath();
          ctx.moveTo(L.x + Math.cos(th) * r0, fy + Math.sin(th) * r0);
          ctx.lineTo(L.x + Math.cos(th) * r1, fy + Math.sin(th) * r1);
          ctx.stroke();
        }
        const sx = L.x + hr + lw * 4;
        const sy = fy - hr - lw * 4.5 - out * lw;
        star(ctx, sx, sy, (lw * 1.6 + 2) * spring(de / 0.45) * (1 - gone), de * 2);
      }
    }

    // ── the shoppers: white dots in their lanes (bouncing along once their stage is fixed); the lost ones hollow ──
    const pad = r * 1.6 + ow;
    const laneY = (u: number, lane: number) => cy + lane * Math.max(0, half(u) - pad);
    const blob = (x: number, y: number, rx: number, ry: number, col: number[], alpha: number) => {
      if (alpha <= 0.01) return;
      ctx.fillStyle = rgba(col, alpha);
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    const ring = (x: number, y: number, rx: number, ry: number, w: number, alpha: number) => {
      if (alpha <= 0.01) return;
      ctx.strokeStyle = ink(alpha);
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    };
    /** Which chamber `u` is in (3 past the last). */
    const stageAt = (u: number) => (u < CHAMBERS[1][0] ? 0 : u < CHAMBERS[2][0] ? 1 : u < SPOUT[0] ? 2 : 3);
    const ringW = Math.max(1.6, lw * 0.5);
    for (const s of shoppers) {
      const age = sec - s.at;
      if (age <= 0) continue;
      const enter = (x: number) => clamp((x - g.x0) / (r * 4));
      if (s.out < 3) {
        const i = s.out;
        const kk = ksAt(s.exit * 1000, starts)[i];
        const xd = dropX(i, s.spread, kk);
        const ud = (xd - g.x0) / g.run;
        const td = s.at + sAt(ud, s.v);
        if (sec < td) {
          // it slides down to the leak, going hollow as it goes
          const u = uAt(age, s.v);
          const x = X(u);
          if (x < g.x0 + r) continue;
          const span = Math.min(PEEL * (ud - CHAMBERS[i][0]), 0.13);
          const p = smooth((u - (ud - span)) / span);
          const y = laneY(u, s.lane) + (floorAt(ud) - laneY(u, s.lane)) * p * p;
          // solid as it enters (the full stream at the mouth), hollow only as it nears the leak
          const hollow = smooth((p - 0.35) / 0.5);
          blob(x, y, r, r, c.dot, enter(x) * (1 - hollow));
          ring(x, y, r * 1.1, r * 1.1, ringW, enter(x) * hollow);
          continue;
        }
        // lost: a hollow circle dropping out, stretching as it speeds up, thinning and fading
        const p = (sec - td) / FALL;
        if (p >= 1) continue;
        const y0 = floorAt(ud);
        const D = H - y0 + r * 4;
        const x = xd + (1 - (1 - p) ** 2) * (3 + 5 * (1 - kk));
        const y = y0 + D * (0.4 * p + 0.6 * p * p);
        const st = 0.25 * p;
        ring(x, y, r * 1.15 * (1 - st * 0.4), r * 1.15 * (1 + st), ringW * (1 - 0.5 * p), 1 - smooth((p - 0.35) / 0.65));
        continue;
      }
      if (sec < s.exit) {
        const u = uAt(age, s.v);
        const x = X(u);
        if (x < g.x0 + r) continue;
        // in a fixed chamber they bounce along: a hop, squashed at each landing
        const fk = stageAt(u) < 3 ? k[stageAt(u)] : 0;
        const ph = (age * 2.3 + s.spread * 0.5 + 2) % 1;
        const hop = Math.sin(Math.PI * ph);
        const land = 1 - smooth(Math.min(ph, 1 - ph) / 0.12);
        const sq = 0.22 * land * fk;
        blob(x, laneY(u, s.lane) - hop * r * 1.3 * fk + sq * r, r * (1 + sq), r * (1 - sq), c.dot, enter(x));
        continue;
      }
      // bought: out of the spout, a little arc, into the bag
      const p = (sec - s.exit) / HOP;
      if (p >= 1) continue;
      const y0 = laneY(1, s.lane);
      const x = xEnd + (g.bx - xEnd) * p;
      const y = y0 + (g.by - y0) * smooth(p) - hump(p) * r * 2.5;
      const sv = 0.18 * hump(p);
      blob(x, y, r * (1 - sv), r * (1 + sv), mixc(c.dot, c.buy, smooth(p / 0.4)), 1 - smooth((p - 0.8) / 0.2));
    }

    // ── the bag: a marker circle that squashes as orders land, a ring per order, rays as they keep coming ──
    ctx.save();
    ctx.translate(g.bx, g.by);
    ctx.scale(bagScale.x, bagScale.y);
    ctx.strokeStyle = ink(1);
    ctx.lineWidth = lw * 0.9;
    ctx.beginPath();
    for (let n = 0; n <= 40; n++) {
      const th = -Math.PI / 2 + (Math.PI * 2.08 * n) / 40;
      const rr = g.R + Math.sin(th * 2 + 1) * 0.8 + (n / 40) * 1.2;
      ctx.lineTo(Math.cos(th) * rr, Math.sin(th) * rr);
    }
    ctx.stroke();
    ctx.restore();
    for (const at of arrivals) {
      const age = sec - at;
      if (age < 0) break;
      if (age > 0.55) continue;
      const e = age / 0.55;
      ctx.strokeStyle = rgba(c.buy, 0.6 * (1 - e) ** 1.5);
      ctx.lineWidth = Math.max(1.5, lw * 0.45) * (1 - e * 0.5);
      ctx.beginPath();
      ctx.arc(g.bx, g.by, g.R + lw + e * g.R * 0.45, 0, Math.PI * 2);
      ctx.stroke();
    }
    const fullness = smooth(heat / 26);
    if (fullness > 0.02) {
      const n = 12;
      ctx.strokeStyle = rgba(c.buy, 0.95);
      ctx.lineWidth = Math.max(2, lw * 0.6);
      const shown = n * fullness;
      for (let j = 0; j < Math.ceil(shown); j++) {
        const grow = clamp(shown - j);
        const a = -Math.PI / 2 + (j / n) * Math.PI * 2;
        const r0 = g.R + lw * 1.6 + 2;
        const r1 = r0 + (lw * 1.2 + 3) * grow;
        ctx.beginPath();
        ctx.moveTo(g.bx + Math.cos(a) * r0, g.by + Math.sin(a) * r0);
        ctx.lineTo(g.bx + Math.cos(a) * r1, g.by + Math.sin(a) * r1);
        ctx.stroke();
      }
    }

    // ── a beat: the other stages at ~40%; its own and the bag at full ink ──
    if (!payoff) {
      const [a, b] = CHAMBERS[focus];
      const lo = X(a) - ow;
      const hi = X(b) + ow;
      const soft = 8;
      const dim = ctx.createLinearGradient(0, 0, W, 0);
      const stops: [number, number][] = [
        [0, 0.6],
        [lo - soft, 0.6],
        [lo + soft, 0],
        [hi - soft, 0],
        [hi + soft, 0.6],
        [xEnd - 4, 0.45],
        [xEnd + 10, 0],
        [W, 0],
      ];
      for (const [x, al] of stops) dim.addColorStop(clamp(x / W), `rgb(0 0 0 / ${al})`);
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = dim;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, size, shoppers]);

  const W = size.W;
  const X = (u: number) => geo.x0 + u * geo.run;

  return (
    <div className={cn("sl-flow", payoff ? "is-payoff" : `is-focus-${focus}`, className)} aria-hidden="true">
      <div ref={wrap} className="sl-flow-stage">
        <canvas ref={canvas} className="sl-flow-canvas" />
        {W > 0 &&
          CHAMBERS.map(([a, b], i) => {
            // the label, written in marker: the problem written on as the beat starts; at the fix, struck
            // through, then the solution written in its place and ticked. Earlier fixes: written already.
            const since = t - starts[i];
            const dim = !payoff && i !== focus;
            const fixed = starts[i] === -Infinity;
            const problem = copy.problems[i];
            const solution = copy.solutions[i];
            const writeP = fixed ? 1 : pen((t - (WRITE_AT + i * WRITE_STAGGER)) / writeMs(problem));
            const strike = pen((since - STRIKE_AT) / STRIKE);
            const away = smooth((since - STRIKE_AT - STRIKE - 60) / 200);
            const writeS = fixed ? 1 : pen((since - SOLVE_AT) / writeMs(solution));
            const tick = fixed ? 1 : pen((since - SOLVE_AT - writeMs(solution) - 40) / TICK);
            return (
              <span
                key={i}
                className={cn("sl-flow-label", writeS > 0 && "is-fixed", dim && "is-dim")}
                style={{ left: X(a), width: X(b) - X(a), height: geo.top, fontSize: labelFit }}
              >
                {away < 1 && (
                  <span className="sl-flow-label-text" style={{ opacity: 1 - away }}>
                    <span className="sl-flow-write" style={{ clipPath: reveal(writeP) }}>
                      {problem}
                    </span>
                    {strike > 0 && (
                      <svg className="sl-flow-strike" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
                        <path d="M-2 13 C 20 9, 40 12, 60 9 S 90 8, 102 6" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - strike} />
                      </svg>
                    )}
                  </span>
                )}
                {writeS > 0 && (
                  <span className="sl-flow-label-text is-solution">
                    <span className="sl-flow-write" style={{ clipPath: reveal(writeS) }}>
                      {solution}
                    </span>
                    <svg className="sl-flow-tick" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 13.5 L9.5 19 L21 5" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - tick} />
                    </svg>
                  </span>
                )}
              </span>
            );
          })}
        {W > 0 &&
          CHAMBERS.map((_, i) => {
            // the agent, stamped onto the leak: in big, pressed down with a squash, settled
            const q = (t - starts[i]) / STAMP;
            if (!(q > 0)) return null;
            const u = leakU(i);
            const s = q < 1 ? 1.6 - 0.6 * spring(q) : 1;
            const sq = q > 0.25 && q < 1.6 ? 0.2 * Math.exp(-3.5 * (q - 0.25)) * Math.cos(6 * (q - 0.25)) : 0;
            return (
              <AgentPin
                key={i}
                stage={i}
                size={geo.head}
                className={cn("sl-flow-pin", !payoff && i !== focus && "is-dim")}
                style={
                  {
                    left: X(u),
                    top: geo.cy + geo.h0 * halfAtU(u, bounds),
                    opacity: clamp(q * 3),
                    transform: `translate(-50%, -50%) scale(${s * (1 + sq)}, ${s * (1 - sq)})`,
                  } as CSSProperties
                }
              />
            );
          })}
        {W > 0 && (
          <span
            className="sl-flow-bag"
            style={
              {
                left: geo.bx,
                top: geo.by,
                width: geo.R * 2,
                height: geo.R * 2,
                transform: `translate(-50%, -50%) scale(${bagScale.x}, ${bagScale.y})`,
              } as CSSProperties
            }
          >
            <ShoppingBag strokeWidth={2.6} />
          </span>
        )}
      </div>
    </div>
  );
};

/** A little hand-drawn star doodle (five points), outlined in marker. */
const star = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, spin: number) => {
  if (s <= 0.5) return;
  ctx.beginPath();
  for (let n = 0; n <= 10; n++) {
    const a = -Math.PI / 2 + spin * 0.4 + (n * Math.PI) / 5;
    const rr = n % 2 ? s * 0.45 : s;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.stroke();
};

export default FunnelFlow;
