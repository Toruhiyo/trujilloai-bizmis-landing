import { useId, useLayoutEffect, useRef, useState } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { span, useRewindLoop } from "./useRewindLoop";
import { RewindMark } from "./RewindSign";

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

/* ── Support: the whole store's questions, round the clock ────────────────── */

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

const DW = 560; // the drawing's box (viewBox units ≈ px at desktop)
const DH = 280;
const CLOCK = { x: 96, y: 168, r: 58 }; // round the clock: questions come in at every hour
const AG = { x: 286, y: 150 }; // where the agent lands: on the questions' way to the inbox
const AG_R = 24;
const TRAY = { x: 414, y: 190, w: 112, h: 42 }; // the support inbox, an open tray
const TK_W = 80; // a ticket
const TK_H = 11;
const TK_STEP = 13.5;
const LOSS_N = 6; // questions before the agent lands: each one a ticket
const WIN_N = 5; // after: answered on the way, all but the rare one
const RARE = 3; // the one that truly needs the merchant: it still goes to the inbox
const FLY = 900; // a question's way from the clock to the inbox
const TO_AGENT = 560; // ... to the agent
const DRAIN_STEP = 170; // the backlog, answered one ticket after another
const DRAIN_FLY = 420;
const STAMP = 360; // the agent stamped on
const STRIKE = 320;
const TICK = 260;
const REVEAL = 600;
/** After the agent lands: the questions answered, then the label's last word (ms). */
const WIN_MIN = 3600;
const WIN_MAX = 5600;
const TAIL = 1300;

/**
 * The drawing's timeline in a scene whose agent lands at `fixAt` and that
 * lasts `duration` (ms): how long its "after" runs, and when it's all done.
 */
export const supportDayTimes = (fixAt: number, duration: number) => {
  const win = Math.min(WIN_MAX, Math.max(WIN_MIN, duration - fixAt - TAIL));
  return { fixAt, win, end: fixAt + win + TAIL };
};

const quad = (a: readonly number[], c: readonly number[], b: readonly number[], k: number) =>
  [mix(mix(a[0], c[0], k), mix(c[0], b[0], k), k), mix(mix(a[1], c[1], k), mix(c[1], b[1], k), k)] as const;

/** A question's way: from where it was asked on the clock, past the agent's spot, to `end`; u: 0 → 1 (0.5 at the agent). */
const route = (sx: number, sy: number, end: readonly number[], u: number) => {
  const c1 = [(sx + AG.x) / 2, Math.min(sy, AG.y) - 52];
  if (u <= 0.5) return quad([sx, sy], c1, [AG.x, AG.y], u * 2);
  // on through the agent's spot without a kink
  const c2 = [AG.x + (AG.x - c1[0]) * 0.55, AG.y + (AG.y - c1[1]) * 0.55];
  return quad([AG.x, AG.y], c2, end, (u - 0.5) * 2);
};

/** Where ticket `k` sits on the pile, and its tilt (the pile leans more the higher it gets). */
const slotOf = (k: number) => ({
  x: TRAY.x + TRAY.w / 2 + hand(k, 1) * 6,
  y: TRAY.y + TRAY.h - 9 - k * TK_STEP,
  tilt: hand(k, 2) * (3 + k * 0.9),
});

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

/** An answered one: a check popping up off the agent and fading (k: 0 → 1). */
const Answered = ({ k, side }: { k: number; side: number }) => {
  if (k <= 0 || k >= 1) return null;
  const s = spring(clamp01(k * 2.2));
  return (
    <g
      transform={`translate(${f(AG.x + side * 30)} ${f(AG.y - AG_R - 14 - 30 * easeOut(k))}) scale(${f(s)})`}
      opacity={f(1 - span(k, 0.55, 1))}
    >
      <path className="mk-main" d="M-9 0 L-3 6 L10 -8" />
    </g>
  );
};

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

type DayCopy = { label: string; problem: string; solution: string; inbox: string };

/**
 * The store's support at scale (ms along the scene, `t`), all in the
 * marker's orange. A clock turns, time-lapse; shoppers' questions pop off it
 * and fly to the support inbox, where each becomes a ticket: the pile grows
 * ("Tickets pile up"). Then the agent (drawn in marker, a headset on) lands
 * on the questions' way at `fixAt`, as the device starts answering, stamped
 * on like a Sales seal: it answers the backlog out loud, ticket after ticket
 * flying back to it, and every new question is answered as it reaches it, by
 * voice (arcs, a check; never a text reply). Only the rare one that needs the
 * merchant goes on to the inbox, left holding one ticket. The label flips:
 * struck, then "Answered right away", ticked. Every frame comes from `t`, so
 * it rewinds as it played.
 */
const SupportDayDrawing = ({ t, fixAt: F, win: W, copy, kept }: { t: number; fixAt: number; win: number; copy: DayCopy; kept: boolean }) => {
  const [widths, probes] = useProbeWidths([copy.problem, copy.solution].join("|"));
  const wp = widths[0] ?? copy.problem.length * 12;
  const ws = widths[1] ?? copy.solution.length * 12;
  const drawIn = kept ? 1 : easeOut(span(t, 0, REVEAL));

  // when things happen
  const lossGap = Math.max(140, (F - 350 - FLY - 60) / (LOSS_N - 1));
  const lossAt = (i: number) => 350 + i * lossGap;
  const landAt = (i: number) => lossAt(i) + FLY;
  const drainAt = (k: number) => F + 300 + (LOSS_N - 1 - k) * DRAIN_STEP;
  const winGap = (W - 1500 - FLY - 400) / (WIN_N - 1);
  const winAt = (i: number) => F + 1500 + i * winGap;
  // the clock, time-lapse: two turns before the agent lands, two after
  const turnsAt = (at: number) => 2 * span(at, 300, F) + 2 * span(at, F, F + W);
  const angAt = (at: number) => turnsAt(at) * Math.PI * 2 - Math.PI / 2 + Math.PI / 3;
  const rimAt = (at: number) => {
    const a = angAt(at);
    return [CLOCK.x + Math.cos(a) * (CLOCK.r + 6), CLOCK.y + Math.sin(a) * (CLOCK.r + 6)] as const;
  };
  const handAt = angAt(t);

  // what reaches the agent: the backlog (from the inbox, on its right), then the new questions (from the clock, on its left)
  const reach: { at: number; side: number }[] = [];
  for (let k = 0; k < LOSS_N; k++) reach.push({ at: drainAt(k) + DRAIN_FLY, side: 1 });
  for (let i = 0; i < WIN_N; i++) reach.push({ at: winAt(i) + (i === RARE ? FLY / 2 + 60 : TO_AGENT), side: -1 });
  const talk = reach.reduce((m, v) => Math.max(m, span(t, v.at - 160, v.at) * (1 - span(t, v.at + 260, v.at + 420))), 0);

  // the agent, stamped on
  const q = (t - F) / STAMP;
  const stamp = q > 0 ? (q < 1 ? 1.6 - 0.6 * spring(q) : 1) : 0;
  const sq = q > 0.25 && q < 1.6 ? 0.2 * Math.exp(-3.5 * (q - 0.25)) * Math.cos(6 * (q - 0.25)) : 0;
  const { x: ex, y: ey } = TRAY;

  return (
    <svg viewBox={`0 0 ${DW} ${DH}`} aria-hidden="true">
      {/* hidden probes: the label's widths */}
      <g ref={probes} visibility="hidden">
        <text className="mk-hand is-label">{copy.problem}</text>
        <text className="mk-hand is-label">{copy.solution}</text>
      </g>

      {/* the clock, its hand turning through the hours */}
      <path className="mk-main" d={loop(CLOCK.x, CLOCK.y, CLOCK.r, 4)} {...drawn(drawIn)} />
      {[0, 1, 2, 3].map((k) => {
        const a = (k / 4) * Math.PI * 2;
        return (
          <path
            key={k}
            className="mk-thin"
            opacity={f(drawIn)}
            d={`M${f(CLOCK.x + Math.cos(a) * (CLOCK.r - 14))} ${f(CLOCK.y + Math.sin(a) * (CLOCK.r - 14))} L${f(CLOCK.x + Math.cos(a) * (CLOCK.r - 7))} ${f(CLOCK.y + Math.sin(a) * (CLOCK.r - 7))}`}
          />
        );
      })}
      <path
        className="mk-main"
        opacity={f(drawIn)}
        d={`M${CLOCK.x} ${CLOCK.y} L${f(CLOCK.x + Math.cos(handAt) * (CLOCK.r - 20))} ${f(CLOCK.y + Math.sin(handAt) * (CLOCK.r - 20))}`}
      />
      <circle className="mk-dot" cx={CLOCK.x} cy={CLOCK.y} r={4.2} opacity={f(drawIn)} />

      {/* the support inbox: an open tray, and its name */}
      <path
        className="mk-main"
        d={`M${ex - 6} ${ey} L${ex} ${ey + TRAY.h - 8} Q${ex + 1} ${ey + TRAY.h} ${ex + 10} ${ey + TRAY.h} H${ex + TRAY.w - 10} Q${ex + TRAY.w - 1} ${ey + TRAY.h} ${ex + TRAY.w} ${ey + TRAY.h - 8} L${ex + TRAY.w + 6} ${ey}`}
        {...drawn(drawIn)}
      />
      <Hand k={kept ? 1 : writing(copy.inbox, t, 280)} x={ex + TRAY.w / 2} y={ey + TRAY.h + 30} textAnchor="middle" className="is-small">
        {copy.inbox}
      </Hand>

      {/* the pile: each question before the agent, a ticket; then flying back to the agent, answered */}
      {Array.from({ length: LOSS_N }, (_, i) => {
        const land = span(t, landAt(i) - 120, landAt(i) + 220);
        if (land <= 0) return null;
        const s0 = slotOf(i);
        const d = easeInOut(span(t, drainAt(i), drainAt(i) + DRAIN_FLY));
        if (d >= 1) return null;
        const x = mix(s0.x, AG.x + AG_R, d);
        const y = mix(s0.y - 14 * (1 - easeBack(land)), AG.y, d) - 30 * hump(d);
        return <Ticket key={`k${i}`} x={x} y={y} tilt={s0.tilt * (1 - d)} s={Math.min(1, land * 2) * (1 - 0.7 * d)} />;
      })}
      {/* the rare one: a ticket for the merchant, the only one left */}
      {(() => {
        const land = span(t, winAt(RARE) + FLY - 120, winAt(RARE) + FLY + 220);
        if (land <= 0) return null;
        const s0 = slotOf(0);
        return <Ticket x={s0.x} y={s0.y - 14 * (1 - easeBack(land))} tilt={s0.tilt} s={Math.min(1, land * 2)} />;
      })()}

      {/* the questions: before the agent, on to the inbox; after, answered as they reach it */}
      {Array.from({ length: LOSS_N }, (_, i) => {
        const at = lossAt(i);
        if (t < at || t > landAt(i) + 60) return null;
        const [sx, sy] = rimAt(at);
        const s0 = slotOf(i);
        const u = easeInOut(span(t, at + 140, landAt(i)));
        const [x, y] = route(sx, sy, [s0.x, s0.y - 12], u);
        return <Ask key={`a${i}`} x={x} y={y} s={spring(span(t, at, at + 300)) * (1 - easeIn(span(u, 0.82, 1)))} />;
      })}
      {Array.from({ length: WIN_N }, (_, i) => {
        const at = winAt(i);
        const rare = i === RARE;
        const end = at + (rare ? FLY : TO_AGENT);
        if (t < at || t > end + 60) return null;
        const [sx, sy] = rimAt(at);
        const u = (rare ? 1 : 0.5) * easeInOut(span(t, at + 140, end));
        const [x, y] = route(sx, sy, [slotOf(0).x, slotOf(0).y - 12], u);
        const shrink = rare ? easeIn(span(u, 0.82, 1)) : easeIn(span(t, end - 140, end));
        return <Ask key={`w${i}`} x={x} y={y} s={spring(span(t, at, at + 300)) * (1 - shrink)} />;
      })}

      {/* the agent: its voice toward what reaches it, a check for each one answered */}
      {reach.map((v, n) => {
        const on = span(t, v.at - 160, v.at) * (1 - span(t, v.at + 260, v.at + 420));
        if (on <= 0) return null;
        const dir = v.side > 0 ? -0.35 : Math.PI + 0.45;
        return [0, 1, 2].map((j) => {
          const beat = 0.5 + 0.5 * Math.sin((t - v.at) / 70 - j * 1.2);
          const r = AG_R + 10 + j * 8 + 2 * beat;
          const s = 0.42 - j * 0.06;
          const pt = (a: number) => `${f(AG.x + Math.cos(a) * r)} ${f(AG.y + Math.sin(a) * r)}`;
          return (
            <path
              key={`v${n}-${j}`}
              className={j === 1 ? "mk-mid" : "mk-thin"}
              d={`M${pt(dir - s)} A${f(r)} ${f(r)} 0 0 1 ${pt(dir + s)}`}
              opacity={f(on * (0.5 + 0.5 * beat))}
            />
          );
        });
      })}
      {reach.map((v, n) =>
        n === LOSS_N + RARE ? null : <Answered key={`c${n}`} k={span(t, v.at - 40, v.at + 760)} side={v.side * 0.6} />,
      )}
      {stamp > 0 && (
        <g
          opacity={f(clamp01(q * 3))}
          transform={`translate(${AG.x} ${AG.y}) rotate(${f(-5 + 4 * talk)}) scale(${f(stamp * (1 + sq))} ${f(stamp * (1 - sq))})`}
        >
          {/* a head with a headset on, in marker */}
          <path className="mk-main mk-white" d={loop(0, 0, AG_R, 5)} />
          <path className="mk-mid" d={`M${-AG_R - 5} 2 C${-AG_R - 7} ${-AG_R * 1.9} ${AG_R + 7} ${-AG_R * 1.9} ${AG_R + 5} 2`} />
          <path className="mk-mid mk-white" d={rrect(-AG_R - 10, -8, 11, 20, 5, 4)} />
          <path className="mk-mid mk-white" d={rrect(AG_R - 1, -8, 11, 20, 5, 6)} />
          <path className="mk-thin" d={`M${AG_R + 5} 12 Q${AG_R + 5} ${AG_R + 3} 9 ${AG_R + 1}`} />
          <circle className="mk-dot" cx={8} cy={AG_R + 1} r={3.2} />
          <circle className="mk-dot" cx={-8} cy={-4} r={2.5} />
          <circle className="mk-dot" cx={8} cy={-4} r={2.5} />
          <path
            className="mk-thin"
            d={`M-8 7 Q0 ${f(14 + 6 * talk * Math.abs(Math.sin(t / 62)))} 8 7` + (talk > 0.08 ? ` Q0 ${f(9 - talk)} -8 7` : "")}
          />
        </g>
      )}

      {/* the label: the loss, struck as the agent lands, then the win */}
      <Flip
        x={DW / 2}
        y={44}
        room={DW - 24}
        problem={copy.problem}
        solution={copy.solution}
        wp={wp}
        ws={ws}
        t={t}
        writeAt={300}
        strikeAt={F + 260}
      />
    </svg>
  );
};

/**
 * Support's moment at scale (see SupportDayDrawing), on its section's clock:
 * `t` ms along the scene, the agent landing at `fixAt`, its "after" `win`
 * long (supportDayTimes). ◀◀ while it rewinds.
 */
export const SupportDay = ({
  className,
  t,
  fixAt,
  win,
  rewinding = false,
}: {
  className?: string;
  t: number;
  fixAt: number;
  win: number;
  rewinding?: boolean;
}) => {
  const copy = useMessages().landing.support.day;
  // drawn in once; from then on the clock and the inbox stay, so a replay never starts blank
  const played = useRef(false);
  if (t >= REVEAL) played.current = true;
  return (
    <div role="img" aria-label={copy.label} className={cn("bzl-day bzl-mk", className)}>
      <SupportDayDrawing t={t} fixAt={fixAt} win={win} copy={copy} kept={played.current} />
      {/* ◀◀ while it rewinds */}
      <RewindMark on={rewinding} />
    </div>
  );
};

/* ── Insights: noise that sorts itself into an answer ─────────────────────── */

const CW = 480;
const CH = 240;
const BASE = 214; // the chart's baseline
const COLS = [96, 192, 288, 384]; // column centres
const HEIGHTS = [2, 3, 4, 6]; // a rising chart; the last column is the answer
const STEP = 22; // one dot's worth of bar
const BAR_W = 54;
const barH = (c: number) => HEIGHTS[c] * STEP;
const TOP_C = COLS.length - 1;

// where each dot starts, scattered (x, y)
const SCATTER = [
  [38, 30], [130, 134], [341, 20], [432, 82], [226, 56], [67, 98], [298, 144],
  [168, 16], [394, 150], [264, 102], [20, 152], [365, 62], [192, 120], [106, 64],
  [446, 26],
] as const;
// extra noise that only lives in the scatter, then fades away
const NOISE = [
  [86, 168], [149, 42], [211, 182], [322, 86], [413, 120], [53, 70], [278, 28],
  [355, 176], [240, 136], [460, 160],
] as const;
// the shoppers' questions, as little bubbles, while it's still noise
const BUBBLES = [
  [30, 6],
  [262, 0],
  [118, 82],
  [292, 112],
] as const;

const segments = HEIGHTS.flatMap((h, c) => Array.from({ length: h }, (_, k) => ({ c, k })));

const SORT_AT = 1300; // the noise sorts itself
const AHA_AT = 2450; // the answer lights up
export const CLARITY_MS = AHA_AT + 2300; // room for a long top ask to finish writing

/** A restless wobble while it's noise, from the time itself (so it runs backwards on the rewind too). */
const jitter = (t: number, period: number, phase: number, amp = 1) => {
  const a = 2 * Math.PI * (t / period + phase);
  return [3 * Math.sin(a) * amp, 4 * Math.sin(a * 2 + 1.3) * amp] as const;
};

/** An outlined bar standing on the baseline, open at the bottom. */
const bar = (cx: number, h: number) => {
  const x = cx - BAR_W / 2;
  const y = BASE - h;
  const rr = Math.min(9, h / 2);
  return `M${f(x)} ${BASE} V${f(y + rr)} Q${f(x)} ${f(y)} ${f(x + rr)} ${f(y)} H${f(x + BAR_W - rr)} Q${f(x + BAR_W)} ${f(y)} ${f(x + BAR_W)} ${f(y + rr)} V${BASE}`;
};

/** A five-point star, outlined. */
export const star = (r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${f(Math.cos(a) * rr)} ${f(Math.sin(a) * rr)}`);
  }
  return `M${pts.join(" L")} Z`;
};

/**
 * Clarity: outlined dots and little question bubbles jitter like noise, then
 * fly into a drawn bar chart; the bars grow, a marker trend arrow climbs
 * over them, and a drawn callout names the top ask, with a star doodle.
 * Left alone it runs its own rewind loop; given `t` it shows that frame.
 */
export const InsightsClarity = ({
  className,
  t: at,
  rewinding: rewindingAt = false,
}: {
  className?: string;
  /** Driven from outside (ms along CLARITY_MS, e.g. the pinned section's scroll); else its own rewind loop. */
  t?: number;
  rewinding?: boolean;
}) => {
  const cl = useMessages().landing.insights.clarity;
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  const own = useRewindLoop(ref, {
    duration: CLARITY_MS,
    hold: 0,
    rewind: 900,
    rest: 450,
    threshold: 0.45,
    tick: 0,
    paused: at !== undefined,
  });
  const t = at ?? own.t;
  const rewinding = at !== undefined ? rewindingAt : own.rewinding;

  const shown = span(t, 0, 400);
  const fadeNoise = span(t, SORT_AT, SORT_AT + 500);
  const growOf = (c: number) => easeBack(span(t, SORT_AT + 260 + c * 110, SORT_AT + 960 + c * 110), 1.4);
  const base = easeOut(span(t, SORT_AT, SORT_AT + 520));
  const aha = span(t, AHA_AT, AHA_AT + 420);
  const hatch = easeOut(span(t, AHA_AT, AHA_AT + 520));
  const trend = easeInOut(span(t, AHA_AT + 150, AHA_AT + 900));
  const head = easeOut(span(t, AHA_AT + 860, AHA_AT + 1060));
  const box = easeOut(span(t, AHA_AT + 950, AHA_AT + 1350));
  const askAt = AHA_AT + 1150;
  const pointer = easeOut(span(t, AHA_AT + 1250, AHA_AT + 1500));

  const tops = COLS.map((x, c) => [x, BASE - barH(c) - 18] as const);
  const [px, py] = tops[TOP_C];
  // the trend arrow's head, along its last segment
  const [qx, qy] = tops[TOP_C - 1];
  const ang = Math.atan2(py - qy, px - qx);
  const arm = (a: number) => `${f(px + Math.cos(ang + a) * 15)} ${f(py + Math.sin(ang + a) * 15)}`;

  // the callout, to the left of the answer's peak
  const cw = 32 + cl.topAsk.length * 8.3;
  const cxr = px - 42;
  const cxl = cxr - cw;
  const topBarSq = hump(aha);

  return (
    <div ref={ref} role="img" aria-label={cl.topAsk} className={cn("bzl-clarity bzl-mk", className)}>
      <svg viewBox={`0 0 ${CW} ${CH}`} aria-hidden="true">
        <defs>
          <clipPath id={`${uid}-top`}>
            <rect x={COLS[TOP_C] - BAR_W / 2 + 4} y={BASE - barH(TOP_C) + 4} width={BAR_W - 8} height={barH(TOP_C) - 4} />
          </clipPath>
        </defs>

        {/* the noise: questions in little bubbles, and stray dots */}
        {BUBBLES.map(([x, y], i) => {
          const kIn = span(t, i * 190, i * 190 + 420);
          if (kIn <= 0) return null;
          const fly = easeInOut(span(t, SORT_AT + i * 40, SORT_AT + 600 + i * 40));
          const [jx, jy] = jitter(t, 1600, i * 0.25, 1 - fly);
          const tx = mix(x, COLS[TOP_C] - 20, fly) + jx;
          const ty = mix(y, BASE - barH(TOP_C) * 0.5, fly) + jy;
          const s = spring(kIn) * (1 - 0.85 * fly);
          if (s <= 0.02 || fly >= 1) return null;
          return (
            <g key={`b${i}`} transform={`translate(${f(tx + 20)} ${f(ty + 15)}) scale(${f(s)}) translate(-20 -15)`}>
              <path className="mk-mid" d={`${rrect(0, 0, 40, 28, 10, 20 + i)} M10 28 L6 37 L18 28`} />
              <Hand k={clamp01(kIn * 1.6)} x={20} y={22} textAnchor="middle">
                ?
              </Hand>
            </g>
          );
        })}
        {NOISE.map(([x, y], i) => {
          const o = shown * (1 - fadeNoise);
          if (o <= 0) return null;
          const [jx, jy] = jitter(t, 900 + (i % 4) * 270, (i % 5) * 0.21);
          return (
            <circle
              key={`n${i}`}
              className="mk-thin"
              cx={f(x + jx)}
              cy={f(y + jy)}
              r={f(5.5 * (1 - 0.7 * fadeNoise))}
              opacity={f(o)}
            />
          );
        })}

        {/* the chart: a baseline, and bars that grow as the dots fly in */}
        <path className="mk-mid" d={`M24 ${BASE} H${CW - 24}`} {...drawn(base)} />
        {COLS.map((x, c) => {
          const g = growOf(c);
          if (g <= 0) return null;
          const isTop = c === TOP_C;
          const sx = isTop ? 1 - 0.06 * topBarSq : 1;
          const sy = isTop ? 1 + 0.08 * topBarSq : 1;
          return (
            <g key={`bar${c}`} transform={`translate(${x} ${BASE}) scale(${f(sx)} ${f(sy)}) translate(${-x} ${-BASE})`}>
              {isTop && aha > 0 && (
                <path d={`${bar(x, barH(c) * g)} Z`} className="mk-tint" opacity={f(aha)} />
              )}
              <path className="mk-main" d={bar(x, barH(c) * g)} />
            </g>
          );
        })}
        {/* the answer, hatched in */}
        <g clipPath={`url(#${uid}-top)`}>
          {[0, 1, 2, 3, 4, 5, 6].map((k) => {
            const x0 = COLS[TOP_C] - BAR_W / 2;
            const y0 = BASE - 10 - k * 21;
            return (
              <path
                key={k}
                className="mk-thin"
                d={`M${x0} ${y0} L${x0 + BAR_W} ${y0 - BAR_W * 0.55}`}
                {...drawn(clamp01(hatch * 7 - k))}
              />
            );
          })}
        </g>

        {/* the dots, flying into their bars */}
        {segments.map(({ c, k }, i) => {
          const [sx, sy] = SCATTER[i % SCATTER.length];
          const d = SORT_AT + (c * 4 + k) * 35;
          const move = easeBack(span(t, d, d + 760), 1.1);
          const gone = span(t, d + 560, d + 820); // absorbed into the bar
          const o = shown * (1 - gone);
          if (o <= 0) return null;
          const [jx, jy] = jitter(t, 1100 + (i % 5) * 230, (i % 7) * 0.17, 1 - span(t, d, d + 200));
          const tx = mix(sx, COLS[c], move);
          const ty = mix(sy, BASE - (k + 0.5) * STEP, move);
          return (
            <circle
              key={`${c}-${k}`}
              className={k % 3 === 1 ? "mk-dot" : "mk-thin"}
              cx={f(tx + jx)}
              cy={f(ty + jy)}
              r={f(6 * (1 - 0.6 * gone))}
              opacity={f(o)}
            />
          );
        })}

        {/* the trend: a marker arrow climbing over the bars */}
        <path className="mk-mid is-trend" d={`M${tops.map(([x, y]) => `${x} ${y}`).join(" L")}`} {...drawn(trend)} />
        <path className="mk-mid is-trend" d={`M${arm(Math.PI - 0.55)} L${f(px)} ${f(py)} L${arm(Math.PI + 0.55)}`} {...drawn(head)} />

        {/* the callout: the top ask, in a drawn box pointing at the peak */}
        <path className="mk-thin" d={rrect(cxl, 4, cw, 38, 13, 9)} {...drawn(box)} />
        <Hand k={writing(cl.topAsk, t, askAt)} x={(cxl + cxr) / 2} y={30} textAnchor="middle">
          {cl.topAsk}
        </Hand>
        <path className="mk-thin" d={`M${f(cxr + 4)} 26 Q${f(px - 14)} 26 ${f(px - 10)} ${f(py - 12)}`} {...drawn(pointer)} />
        <g opacity={f(clamp01(span(t, AHA_AT + 1450, AHA_AT + 1600) * 3))}>
          {(() => {
            const k = span(t, AHA_AT + 1450, AHA_AT + 1850);
            const s = spring(k);
            return (
              <g transform={`translate(${f(px + 42)} ${f(py - 30)}) rotate(${f(-20 * (1 - s))}) scale(${f(s * (1 + 0.2 * hump(k)))} ${f(s)})`}>
                <path className="mk-thin" d={star(12)} />
              </g>
            );
          })()}
        </g>
        <Sparkle x={px + 20} y={py - 52} k={span(t, AHA_AT + 1600, AHA_AT + 1950)} size={6} />
      </svg>
      {/* ◀◀ while it rewinds */}
      <RewindMark on={rewinding} />
    </div>
  );
};
