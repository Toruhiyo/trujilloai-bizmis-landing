import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { span } from "./useRewindLoop";

/**
 * Each benefit pillar's "feel it" moment, drawn like the Sales funnel: flat
 * "blueprint drawn with a marker" line art straight on the band. Thick round
 * strokes that draw themselves in, no fills, no gradients, no glows, bouncy
 * squash-and-stretch on the small parts and a little doodle on the payoff;
 * labels handwritten in marker (Caveat), written on at a pen's pace. The
 * marker's ink comes from CSS variables (--mk-line, --mk-ink, --mk-tint on
 * .bzl-mk, film-landing.css), set from
 * the pillar's own colours so it reads on its band and on every palette.
 *
 * Timing: every frame is derived from a time `t`, so a rewind is the same
 * frames running backwards. Support's runs on its section's clock (the
 * scroll's, with the device beside it); Insights' on that clock when pinned,
 * else its own useRewindLoop (plays from its start the moment it scrolls
 * into view, rewinds, plays again; leaving the view resets it). Reduced
 * motion shows the final frame.
 */

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeIn = (x: number) => Math.pow(clamp01(x), 2);
export const easeInOut = (x: number) =>
  x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
/** A spring-like settle: overshoots a little, then lands. */
export const easeBack = (x: number, s = 1.7) =>
  x <= 0 ? 0 : x >= 1 ? 1 : 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
/** A springy 0 → 1 with a wobble, for things that pop. */
export const spring = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.exp(-6 * k) * Math.cos(9 * k));
/** 0 → 1 → 0 over [0, 1]: a squash's bump. */
export const hump = (k: number) => (k <= 0 || k >= 1 ? 0 : Math.sin(Math.PI * k));
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const f = (n: number) => n.toFixed(2);

/** The hand: a FIXED tiny offset per point (never per frame, so nothing boils). */
export const hand = (seed: number, k: number) => Math.sin(seed * 12.9898 + k * 78.233) * 0.6;

/** A rounded rectangle as one marker stroke, a hair off true. */
export const rrect = (x: number, y: number, w: number, h: number, r: number, seed = 0) => {
  const j = (k: number) => hand(seed, k);
  return (
    `M${f(x + r + j(1))} ${f(y + j(2))} H${f(x + w - r + j(3))} Q${f(x + w)} ${f(y)} ${f(x + w + j(4))} ${f(y + r)} ` +
    `V${f(y + h - r + j(5))} Q${f(x + w)} ${f(y + h)} ${f(x + w - r + j(6))} ${f(y + h + j(7))} ` +
    `H${f(x + r + j(8))} Q${f(x)} ${f(y + h)} ${f(x + j(9))} ${f(y + h - r)} V${f(y + r + j(10))} ` +
    `Q${f(x)} ${f(y)} ${f(x + r + j(1))} ${f(y + j(2))}`
  );
};

/** A hand-drawn circle: one loop that runs a little past its start. */
export const loop = (cx: number, cy: number, r: number, seed = 0) => {
  const pts: string[] = [];
  const n = 56;
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2 * 1.07;
    const rr = r + Math.sin(a * 3 + seed) * 0.9 - (i / n) * 2.4;
    pts.push(`${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)}`);
  }
  return `M${pts.join(" L")}`;
};

/** A stroke drawing itself in (k: 0 → 1), via a unit dash. */
export const drawn = (k: number) => ({
  pathLength: 1,
  strokeDasharray: "1 1",
  strokeDashoffset: f(1 - clamp01(k)),
  opacity: k > 0 ? 1 : 0,
});

/** A little sparkle scribble that pops in with a spring (k: 0 → 1). */
export const Sparkle = ({ x, y, k, size = 10, spin = 0 }: { x: number; y: number; k: number; size?: number; spin?: number }) => {
  if (k <= 0) return null;
  const s = spring(k);
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(spin + 25 * (1 - s))}) scale(${f(s)} ${f(s * (1 + 0.25 * hump(k)))})`}>
      <path className="mk-thin" d={`M0 ${-size} V${size} M${-size} 0 H${size}`} />
    </g>
  );
};

/* ── Handwriting: labels written on in marker (Caveat, bold), like the Sales
   funnel's: left to right at a pen's pace, driven by the loop's t, so they
   un-write on the rewind. ── */

/** How long writing `text` takes: a steady pen, a little quicker for short words. */
export const writeMs = (text: string) => 160 + text.length * 30;
/** The pen's pace: off the mark gently, steady, easing at the end. */
export const pen = (k: number) => {
  const x = clamp01(k);
  return x < 0.15 ? (x / 0.15) ** 2 * 0.1 : 0.1 + 0.9 * (1 - (1 - (x - 0.15) / 0.85) ** 1.6);
};
/** How much of `text` is written at `t` when the pen starts at `from` (0 → 1). */
export const writing = (text: string, t: number, from: number) => pen((t - from) / writeMs(text));
/** The written-so-far part: a left-to-right reveal of the text's own box. */
export const reveal = (k: number) => (k >= 1 ? undefined : `inset(-30% ${((1 - k) * 100).toFixed(2)}% -30% -8%)`);

/** A handwritten label, written on as `k` goes 0 → 1. */
export const Hand = ({
  k,
  className,
  children,
  ...at
}: {
  k: number;
  className?: string;
  children: string;
  x: number;
  y: number;
  textAnchor?: "start" | "middle" | "end";
}) =>
  k <= 0 ? null : (
    <text {...at} className={cn("mk-hand", className)} style={{ clipPath: reveal(k) }}>
      {children}
    </text>
  );

/* ── The pieces Customer Support's and Store Insights' drawings share ── */

/**
 * The handwriting's real widths (in the drawing's units), so a label fits
 * its room in whatever size the page's look sets: measured off hidden
 * probes of the same texts (a <g> of <text>s in the SVG), again once the
 * marker font is in.
 */
export const useProbeWidths = (key: string) => {
  const probes = useRef<SVGGElement>(null);
  const [w, setW] = useState<number[]>([]);
  useLayoutEffect(() => {
    let live = true;
    const measure = () => {
      const g = probes.current;
      if (!g || !live) return;
      setW(Array.from(g.querySelectorAll("text"), (el) => el.getComputedTextLength()));
    };
    measure();
    // again once the marker font is in (whichever face the page's look writes in)
    document.fonts?.load("700 24px Caveat").then(measure).catch(() => undefined);
    document.fonts?.ready.then(measure).catch(() => undefined);
    document.fonts?.addEventListener?.("loadingdone", measure);
    return () => {
      live = false;
      document.fonts?.removeEventListener?.("loadingdone", measure);
    };
  }, [key]);
  return [w, probes] as const;
};

const TK_W = 80; // a ticket
const TK_H = 11;
const STRIKE = 320; // the label's strike
const TICK = 260; // its tick

/** A shopper's question: a little bubble with a "?" (s: its size, 0 → 1). */
export const Ask = ({ x, y, s }: { x: number; y: number; s: number }) =>
  s <= 0.01 ? null : (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`}>
      <path className="mk-mid" d={`${rrect(-14, -13, 28, 22, 8, 3)} M-6 9 L-9 16 L1 9`} />
      <text className="mk-hand is-ask" x={0} y={5} textAnchor="middle">
        ?
      </text>
    </g>
  );

/** A ticket waiting in the inbox: a slip with a line on it. */
export const Ticket = ({ x, y, tilt, s = 1 }: { x: number; y: number; tilt: number; s?: number }) =>
  s <= 0.01 ? null : (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(tilt)}) scale(${f(s)})`}>
      <path className="mk-thin mk-white" d={rrect(-TK_W / 2, -TK_H / 2, TK_W, TK_H, 3.5, 11)} />
      <path className="mk-thin" d={`M${-TK_W / 2 + 12} 0 H${TK_W / 2 - 14}`} opacity={0.6} />
    </g>
  );

/**
 * The label in marker, as the Sales funnel's: the loss written on, struck
 * through at the fix, then the win written in its place and ticked, with a
 * swoosh under it. Fitted to `room` (units) from its measured widths.
 */
export const Flip = ({
  x,
  y,
  room,
  problem,
  solution,
  wp,
  ws,
  t,
  writeAt,
  strikeAt,
}: {
  x: number;
  y: number;
  room: number;
  problem: string;
  solution: string;
  wp: number;
  ws: number;
  t: number;
  writeAt: number;
  strikeAt: number;
}) => {
  const writeP = pen((t - writeAt) / writeMs(problem));
  const strike = pen((t - strikeAt) / STRIKE);
  const away = easeInOut(span(t, strikeAt + STRIKE + 60, strikeAt + STRIKE + 280));
  const solveAt = strikeAt + STRIKE + 180;
  const writeS = pen((t - solveAt) / writeMs(solution));
  const tick = pen((t - solveAt - writeMs(solution) - 40) / TICK);
  const party = span(t, solveAt + writeMs(solution) + TICK + 80, solveAt + writeMs(solution) + TICK + 520);
  const TR = 30; // the tick's room after the win
  const sp = Math.min(1, room / Math.max(1, wp + 12));
  const ss = Math.min(1, room / Math.max(1, ws + TR));
  return (
    <g>
      {writeP > 0 && away < 1 && (
        <g transform={`translate(${f(x)} ${f(y)}) scale(${f(sp)})`} opacity={f(1 - away)}>
          <text className="mk-hand is-label" textAnchor="middle" style={{ clipPath: reveal(writeP) }}>
            {problem}
          </text>
          <path className="mk-mid" d={`M${f(-wp / 2 - 6)} -8 C${f(-wp / 4)} -12 ${f(wp / 4)} -6 ${f(wp / 2 + 6)} -12`} {...drawn(strike)} />
        </g>
      )}
      {writeS > 0 && (
        <g transform={`translate(${f(x - (TR * ss) / 2)} ${f(y)}) scale(${f(ss * (1 + 0.08 * hump(party)))})`}>
          <text className="mk-hand is-label" textAnchor="middle" style={{ clipPath: reveal(writeS) }}>
            {solution}
          </text>
          <path className="mk-main" d={`M${f(ws / 2 + 7)} -9 L${f(ws / 2 + 13)} -2 L${f(ws / 2 + 27)} -21`} {...drawn(tick)} />
          <path className="mk-thin" d={`M${f(-ws / 2 - 4)} 10 C${f(-ws / 6)} 5 ${f(ws / 6)} 5 ${f(ws / 2 + 6)} 8`} {...drawn(party)} />
        </g>
      )}
    </g>
  );
};
