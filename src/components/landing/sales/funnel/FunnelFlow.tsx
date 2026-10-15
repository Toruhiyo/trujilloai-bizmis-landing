import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNow } from "../hooks";
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
  shoppersBetween,
  sAt,
  startsFor,
  uAt,
} from "./model";

export type FunnelCopy = {
  problems: string[];
  solutions: string[];
  /** The word at the open mouth: the dots are store visits. */
  visits?: string;
};

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

/** Room left of the open mouth, where the visits stream in from outside (px). */
/** The "visits" word's size, from the stage box's height (as its labels'). */
const visitsSize = (H: number) => Math.round(clamp(Math.round(clamp(H * 0.18, 30, 48)) * 0.62, 15, 26));
/** Room before the open mouth: the word "visits", then its arrow into the mouth (or a little, without it). */
const leadFor = (W: number, H: number, word?: string) =>
  word ? Math.min(W * 0.3, textWidth(word, visitsSize(H)) + visitsSize(H) * 2 + 8) : clamp(W * 0.05, 16, 56);

const geometry = (W: number, H: number, lead = leadFor(W, H)): Geo => {
  const top = Math.round(clamp(H * 0.18, 30, 48));
  const R = clamp(H * 0.09, 15, 25);
  const bx = W - R * 1.75 - 2;
  const xEnd = bx - R * 2.2;
  const x0 = lead;
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

/**
 * The funnel's half-height (px) at `u`: the model's shape, never pinched
 * thinner than the marker can draw as an open pipe (a constant floor, so it
 * still only ever narrows).
 */
const halfPx = (g: Geo, u: number, bounds: number[]) => Math.max(g.h0 * halfAtU(u, bounds), g.ow * 1.25 + g.r);

/**
 * Where the funnel's parts sit in a stage box of W x H px (for a layout that
 * points at them, e.g. a callout popping out of a stage): each chamber's x
 * span and centre, the labels' row, the funnel's centre line, its top edge
 * over each chamber (stages fixed by `k`, 0 → 1 each), the mouth and the bag.
 */
export const funnelAnchors = (W: number, H: number, k: number[] = [0, 0, 0], visits?: string) => {
  const g = geometry(W, H, leadFor(W, H, visits));
  const b = boundsFor(k);
  const X = (u: number) => g.x0 + u * g.run;
  return {
    labels: g.top,
    cy: g.cy,
    mouth: { x: g.x0, top: g.cy - g.h0, bottom: g.cy + g.h0 },
    bag: { x: g.bx, y: g.by, r: g.R },
    chambers: CHAMBERS.map(([a, c]) => ({
      xa: X(a),
      xb: X(c),
      xc: X((a + c) / 2),
      top: g.cy - halfPx(g, (a + c) / 2, b),
      floor: g.cy + halfPx(g, (a + c) / 2, b),
    })),
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
const WRITE_STAGGER = 120;
const STRIKE_AT = 140;
const STRIKE = 260;
const SOLVE_AT = 640;
const TICK = 300;
/** How long writing `text` takes: a steady pen, a little quicker for short words. */
const writeMs = (text: string) => 160 + text.length * 30;
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
/** `text`'s width (px) in the handwriting at `size` px. */
const textWidth = (text: string, size: number) => {
  if (typeof document === "undefined") return text.length * size * 0.42;
  const ready = document.fonts?.check?.(`700 20px ${SCRIPT}`) ? 1 : 0;
  const key = `${ready}|${text}`;
  let tw = widths.get(key);
  if (tw === undefined) {
    measureCtx ??= document.createElement("canvas").getContext("2d");
    if (!measureCtx) return text.length * size * 0.42;
    measureCtx.font = `700 100px ${SCRIPT}`;
    tw = measureCtx.measureText(text).width;
    widths.set(key, tw);
  }
  return (tw * size) / 100;
};
/** The room the tick after a solved label takes, beyond the word (em). */
const TICK_ROOM = 1.12;
/** A label's box width at `size`: its longer state (the problem, or the solution and its tick). */
const labelWidth = (problem: string, solution: string, size: number) =>
  Math.max(textWidth(problem, size), textWidth(solution, size) + TICK_ROOM * size);

/**
 * Where the three labels go and how big: the beat's own label big (it may
 * spill past its chamber), the other two smaller, pushed aside so none
 * overlap and all stay inside the box; in the payoff all three equal, each
 * in its own share of the width.
 */
const layoutLabels = (
  copy: FunnelCopy,
  centers: number[],
  W: number,
  big: number,
  focus: number,
): { left: number; width: number; size: number }[] => {
  const gap = 8;
  const w = (i: number, size: number) => labelWidth(copy.problems[i], copy.solutions[i], size);
  const fit = (i: number, size: number, room: number) => {
    const ww = w(i, size);
    return ww <= room ? size : Math.max(10, Math.floor((size * room) / ww));
  };
  if (focus >= 3) {
    const mids = [0, (centers[0] + centers[1]) / 2, (centers[1] + centers[2]) / 2, W];
    const size = Math.min(...[0, 1, 2].map((i) => fit(i, big, mids[i + 1] - mids[i] - gap)));
    return [0, 1, 2].map((i) => {
      const width = w(i, size);
      const left = clamp(centers[i] - width / 2, mids[i] + (i ? gap / 2 : 0), mids[i + 1] - width - gap / 2);
      return { left, width, size };
    });
  }
  const out: { left: number; width: number; size: number }[] = [];
  const fSize = fit(focus, big, W * 0.5);
  const fW = w(focus, fSize);
  out[focus] = { left: clamp(centers[focus] - fW / 2, 0, W - fW), width: fW, size: fSize };
  // the labels on one side of the beat's own: one smaller size that fits them all together in [from, to]
  const small = Math.round(big * 0.6);
  const side = (idx: number[], from: number, to: number) => {
    if (!idx.length) return;
    const room = to - from - gap * (idx.length - 1);
    const need = idx.reduce((sum, i) => sum + w(i, small), 0);
    const size = need <= room ? small : Math.max(10, Math.floor((small * room) / need));
    const pos = idx.map((i) => ({ i, width: w(i, size), left: centers[i] - w(i, size) / 2 }));
    // as centred over their chambers as they can be, inside [from, to], never overlapping
    let x = from;
    for (const p of pos) {
      p.left = Math.max(p.left, x);
      x = p.left + p.width + gap;
    }
    x = to;
    for (const p of [...pos].reverse()) {
      p.left = Math.min(p.left, x - p.width);
      x = p.left - gap;
    }
    for (const p of pos) out[p.i] = { left: p.left, width: p.width, size };
  };
  side([0, 1, 2].filter((i) => i < focus), 0, out[focus].left - gap);
  side([0, 1, 2].filter((i) => i > focus), out[focus].left + fW + gap, W);
  return out;
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
  rewind = false,
  className,
}: {
  t: number;
  duration: number;
  focus: number;
  fixAt?: number;
  copy: FunnelCopy;
  /** Scrolled back: the marker ◀◀ over the funnel. */
  rewind?: boolean;
  className?: string;
}) => {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pal = useRef<{ key: string; c: Palette } | null>(null);
  const drawn = useRef(false);
  const [size, setSize] = useState({ W: 0, H: 0 });
  const payoff = focus >= 3;
  const starts = useMemo(() => startsFor(focus, fixAt), [focus, fixAt]);
  // Two clocks. The fix (stamp, label, chamber, leak) follows `t`, the scroll; the stream of visits
  // flows on in real time (`now`), obeying each fix from the real moment the scroll lands it.
  const now = useNow();
  const born = useRef<number | null>(null);
  if (born.current === null && now > 0) born.current = now;
  const real = useRef({ key: "", at: [] as number[] });
  const key = `${focus}|${fixAt}`;
  if (real.current.key !== key) real.current = { key, at: starts.map((st) => (st === -Infinity ? -Infinity : Infinity)) };
  starts.forEach((st, i) => {
    if (!Number.isFinite(st)) return;
    const at = real.current.at;
    if (t >= st && at[i] === Infinity) at[i] = now;
    else if (t < st) at[i] = Infinity;
  });
  const realStarts = real.current.at;
  const sec = now / 1000;
  const shoppers = shoppersBetween(sec - 6.5, sec + 0.3, realStarts);
  const arrivals = shoppers
    .filter((s) => s.out === 3)
    .map((s) => s.exit + HOP)
    .sort((a, b) => a - b);
  const k = ksAt(t, starts);
  const bounds = boundsFor(k);
  const geo = geometry(size.W, size.H, leadFor(size.W, size.H, copy.visits));
  // one size for all three labels: the largest at which every problem and solution (with its tick) fits its chamber
  // the labels: the beat's own big (desktop ~36px), the others smaller; all fitting, none overlapping
  const labels = layoutLabels(
    copy,
    CHAMBERS.map(([a, b]) => geo.x0 + ((a + b) / 2) * geo.run),
    size.W,
    Math.round(clamp(geo.top * 0.9, 20, 36)),
    focus,
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
    const half = (u: number) => halfPx(g, u, bounds);
    const floorAt = (u: number) => cy + half(u);
    const xEnd = X(1);
    const ink = (a: number) => rgba(c.line, a);
    const amp = 0.45;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    /** How far the outline has drawn itself in (u): once, the first time the funnel plays; after that it stays drawn through every rewind and replay. */
    const life = now - (born.current ?? now);
    if (life >= REVEAL) drawn.current = true;
    const reveal = drawn.current ? 1.06 : 1.06 * smooth(life / REVEAL);

    /** Each stage's leak: where it is, and how wide it's open now. */
    const leaks = [0, 1, 2].map((i) => {
      const u = leakU(i);
      const cw = (CHAMBERS[i][1] - CHAMBERS[i][0]) * g.run;
      // the leak (and so the waterfall) scales with the stage itself: more traffic, same stage
      const open = clamp(half(u) * 0.42, 5, Math.min(cw * 0.22, 30));
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
    // the mouth: open (no line across it), its lips flaring out a touch: the visits stream in from outside
    if (reveal > 0) {
      ctx.strokeStyle = ink(1);
      ctx.lineWidth = ow * (0.72 + 0.28 * k[0]);
      const fl = Math.min(g.x0 * 0.6, ow * 2.4);
      for (const side of [-1, 1]) {
        const y = cy + side * half(0);
        ctx.beginPath();
        ctx.moveTo(g.x0 + 1, y);
        ctx.quadraticCurveTo(g.x0 - fl * 0.45, y, g.x0 - fl, y + side * fl * 0.7);
        ctx.stroke();
      }
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
    // lanes always spread over most of the chamber (they never collapse into a crowd in a narrow one)
    const padFor = (hh: number) => Math.min(r * 1.6 + ow, hh * 0.3);
    const laneY = (u: number, lane: number) => {
      const hh = half(u);
      return cy + lane * Math.max(0, hh - padFor(hh));
    };
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
    /** Where a shopper is `age` s after reaching the mouth (negative: still outside, streaming in). */
    const uOf = (age: number, v: number) => (age >= 0 ? uAt(age, v) : -uAt(-age, v));
    /** How long before the mouth a shopper shows (s): from the box's left edge. */
    const pre = (v: number) => sAt(g.x0 / g.run, v);
    const visit = blob;
    for (const s of shoppers) {
      const age = sec - s.at;
      if (age <= -pre(s.v)) continue;
      // they come into view just before the mouth, clear of the "visits" word and its arrow
      const enter = (x: number) => clamp((x - (g.x0 - r * 7)) / (r * 5));
      if (s.out < 3) {
        const i = s.out;
        const kk = ksAt(s.exit * 1000, realStarts)[i];
        const xd = dropX(i, s.spread, kk);
        const ud = (xd - g.x0) / g.run;
        const td = s.at + sAt(ud, s.v);
        if (sec < td) {
          // it slides down to the leak, going hollow as it goes
          const u = uOf(age, s.v);
          const x = X(u);
          if (x < r) continue;
          const span = Math.min(PEEL * (ud - CHAMBERS[i][0]), 0.13);
          const p = smooth((u - (ud - span)) / span);
          const y = laneY(u, s.lane) + (floorAt(ud) - laneY(u, s.lane)) * p * p;
          // solid as it enters (the full stream at the mouth), hollow only as it nears the leak
          const hollow = smooth((p - 0.35) / 0.5);
          visit(x, y, r, r, c.dot, enter(x) * (1 - hollow));
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
        // sealed: the ones already lost before the agent landed clear away at once (the change is instant)
        const gone = s.exit * 1000 < realStarts[i] ? smooth((now - realStarts[i]) / 220) : 0;
        ring(x, y, r * 1.15 * (1 - st * 0.4), r * 1.15 * (1 + st), ringW * (1 - 0.5 * p), (1 - smooth((p - 0.35) / 0.65)) * (1 - gone));
        continue;
      }
      if (sec < s.exit) {
        const u = uOf(age, s.v);
        const x = X(u);
        if (x < r) continue;
        // in a fixed chamber they bounce along: a hop, squashed at each landing
        const fk = u >= 0 && stageAt(u) < 3 ? k[stageAt(u)] : 0;
        const ph = (age * 2.3 + s.spread * 0.5 + 2) % 1;
        const hop = Math.sin(Math.PI * ph);
        const land = 1 - smooth(Math.min(ph, 1 - ph) / 0.12);
        const sq = 0.22 * land * fk;
        visit(x, laneY(u, s.lane) - hop * r * 1.3 * fk + sq * r, r * (1 + sq), r * (1 - sq), c.dot, enter(x));
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

    // ── "visits": the word left of the open mouth, centred on it, a straight marker arrow pointing in ──
    if (copy.visits && reveal > 0.2) {
      const fs = visitsSize(H);
      ctx.font = `700 ${fs}px ${SCRIPT}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = ink(1);
      // Caveat sits a touch high on its middle line
      ctx.fillText(copy.visits, 2, cy + fs * 0.06);
      const tw = ctx.measureText(copy.visits).width;
      ctx.strokeStyle = ink(0.95);
      ctx.lineWidth = Math.max(2.2, lw * 0.62);
      const sx = 2 + tw + fs * 0.35;
      const ex = g.x0 + r * 1.5;
      // nearly straight: the faintest hand along it
      ctx.beginPath();
      ctx.moveTo(sx, cy + 0.6);
      ctx.quadraticCurveTo((sx + ex) / 2, cy - 1.1, ex, cy);
      ctx.stroke();
      const hl = Math.min(fs * 0.42, (ex - sx) * 0.45);
      ctx.beginPath();
      ctx.moveTo(ex - hl, cy - hl * 0.62);
      ctx.lineTo(ex, cy);
      ctx.lineTo(ex - hl * 0.95, cy + hl * 0.66);
      ctx.stroke();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, size, now]);

  const W = size.W;
  const X = (u: number) => geo.x0 + u * geo.run;

  return (
    <div className={cn("sl-flow", payoff ? "is-payoff" : `is-focus-${focus}`, className)} aria-hidden="true">
      <div ref={wrap} className="sl-flow-stage">
        <canvas ref={canvas} className="sl-flow-canvas" />
        {W > 0 &&
          CHAMBERS.map((_, i) => {
            // the label, written in marker: the problem written on as the beat starts; at the fix, struck
            // through, then the solution written in its place and ticked. Earlier fixes: done already.
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
            // the fixed moment: once ticked, the solution is underlined with a swoosh and pops
            const party = fixed ? 0 : pen((since - SOLVE_AT - writeMs(solution) - 40 - TICK - 60) / 420);
            const L = labels[i];
            return (
              <span
                key={i}
                className={cn("sl-flow-label", writeS > 0 && "is-fixed", dim && "is-dim")}
                style={{
                  left: L.left,
                  width: L.width,
                  height: geo.top,
                  fontSize: L.size,
                  scale: party > 0 && party < 1 ? `${1 + 0.1 * Math.sin(Math.PI * party)}` : undefined,
                }}
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
                      <path
                        d="M3.5 13.5 L9.5 19.5 L21.5 4.5"
                        pathLength={1}
                        strokeDasharray="1 1"
                        strokeDashoffset={1 - tick}
                        opacity={tick > 0 ? 1 : 0}
                      />
                    </svg>
                    {party > 0 && (
                      <svg
                        className="sl-flow-swoosh"
                        viewBox="0 0 100 12"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                        style={{ clipPath: `inset(-50% ${((1 - party) * 100).toFixed(1)}% -50% -5%)` }}
                      >
                        <path d="M2 8 C 30 3.5, 62 3, 98 6.5" />
                      </svg>
                    )}
                  </span>
                )}
              </span>
            );
          })}
        {W > 0 && <Seals t={t} starts={starts} focus={focus} geo={geo} bounds={bounds} />}
        {/* scrolled back: a marker ◀◀ over the funnel, while it rewinds */}
        <svg
          className={cn("sl-flow-rewind", rewind && "is-on")}
          viewBox="0 0 64 36"
          style={{ left: 2, top: 2, width: Math.round(clamp(geo.top * 1.15, 34, 52)) }}
          aria-hidden="true"
        >
          <path d="M30.5 5.5 C 24 10.5, 15.5 15, 6.5 18.2 C 15 21.5, 23.5 26, 30.2 30.8 C 29.6 22.5, 29.8 13.5, 30.5 5.5 Z" />
          <path d="M57.5 5.2 C 51 10.2, 42.5 14.8, 33.5 18 C 42 21.4, 50.5 26.2, 57.3 30.6 C 56.7 22.3, 56.9 13.4, 57.5 5.2 Z" />
        </svg>
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

/**
 * The seals: on each leak, as its fix lands (`starts`), the store's one agent
 * in that stage's pose, pressed down with a squash and tilted its own way,
 * the stage's action (search, compare, cart) landing on it as a badge.
 */
const Seals = ({
  t,
  starts,
  focus,
  geo,
  bounds,
}: {
  t: number;
  starts: number[];
  focus: number;
  geo: Geo;
  bounds: number[];
}) => {
  const payoff = focus >= 3;
  return (
    <>
      {CHAMBERS.map((_, i) => {
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
            badge={clamp(q * 1.6 - 0.8)}
            className={cn("sl-flow-pin", !payoff && i !== focus && "is-dim")}
            style={
              {
                left: geo.x0 + u * geo.run,
                top: geo.cy + halfPx(geo, u, bounds),
                opacity: clamp(q * 3),
                transform: `translate(-50%, -50%) scale(${s * (1 + sq)}, ${s * (1 - sq)})`,
              } as CSSProperties
            }
          />
        );
      })}
    </>
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
