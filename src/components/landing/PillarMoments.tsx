import { useId, useRef } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { span, useRewindLoop } from "./useRewindLoop";

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
 * Timing: a useRewindLoop timeline. It plays from its start the moment it
 * scrolls into view, rewinds straight away (the same frames, fast,
 * backwards) and plays again; leaving the view resets it. Every frame is
 * derived from the loop's time `t`. Reduced motion shows the final frame.
 */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const easeIn = (x: number) => Math.pow(clamp01(x), 2);
const easeInOut = (x: number) =>
  x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
/** A spring-like settle: overshoots a little, then lands. */
const easeBack = (x: number, s = 1.7) =>
  x <= 0 ? 0 : x >= 1 ? 1 : 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
/** A springy 0 → 1 with a wobble, for things that pop. */
const spring = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.exp(-6 * k) * Math.cos(9 * k));
/** 0 → 1 → 0 over [0, 1]: a squash's bump. */
const hump = (k: number) => (k <= 0 || k >= 1 ? 0 : Math.sin(Math.PI * k));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const f = (n: number) => n.toFixed(2);

/** The hand: a FIXED tiny offset per point (never per frame, so nothing boils). */
const hand = (seed: number, k: number) => Math.sin(seed * 12.9898 + k * 78.233) * 0.6;

/** A rounded rectangle as one marker stroke, a hair off true. */
const rrect = (x: number, y: number, w: number, h: number, r: number, seed = 0) => {
  const j = (k: number) => hand(seed, k);
  return (
    `M${f(x + r + j(1))} ${f(y + j(2))} H${f(x + w - r + j(3))} Q${f(x + w)} ${f(y)} ${f(x + w + j(4))} ${f(y + r)} ` +
    `V${f(y + h - r + j(5))} Q${f(x + w)} ${f(y + h)} ${f(x + w - r + j(6))} ${f(y + h + j(7))} ` +
    `H${f(x + r + j(8))} Q${f(x)} ${f(y + h)} ${f(x + j(9))} ${f(y + h - r)} V${f(y + r + j(10))} ` +
    `Q${f(x)} ${f(y)} ${f(x + r + j(1))} ${f(y + j(2))}`
  );
};

/** A hand-drawn circle: one loop that runs a little past its start. */
const loop = (cx: number, cy: number, r: number, seed = 0) => {
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
const drawn = (k: number) => ({
  pathLength: 1,
  strokeDasharray: "1 1",
  strokeDashoffset: f(1 - clamp01(k)),
  opacity: k > 0 ? 1 : 0,
});

/** A little sparkle scribble that pops in with a spring (k: 0 → 1). */
const Sparkle = ({ x, y, k, size = 10, spin = 0 }: { x: number; y: number; k: number; size?: number; spin?: number }) => {
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
const writeMs = (text: string) => 160 + text.length * 30;
/** The pen's pace: off the mark gently, steady, easing at the end. */
const pen = (k: number) => {
  const x = clamp01(k);
  return x < 0.15 ? (x / 0.15) ** 2 * 0.1 : 0.1 + 0.9 * (1 - (1 - (x - 0.15) / 0.85) ** 1.6);
};
/** How much of `text` is written at `t` when the pen starts at `from` (0 → 1). */
const writing = (text: string, t: number, from: number) => pen((t - from) / writeMs(text));
/** The written-so-far part: a left-to-right reveal of the text's own box. */
const reveal = (k: number) => (k >= 1 ? undefined : `inset(-30% ${((1 - k) * 100).toFixed(2)}% -30% -8%)`);

/** A handwritten label, written on as `k` goes 0 → 1. */
const Hand = ({
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

/* ── Support: the inbox that empties itself ──────────────────────────────── */

const RW = 480; // the drawing's box (viewBox units ≈ px at desktop)
const RH = 256;
const N = 9; // tickets
const TILTS = [-1, 0.8, -0.4, 1, -0.7, 0.4, -1, 0.7, -0.4] as const; // a pile, not a list
const LINES = [150, 118, 168, 104, 140, 126, 158, 112, 134] as const; // each ticket's "text"
const PEAK = 48; // the count the inbox climbs to while the pile grows
const ARRIVE_MS = 130; // a new ticket lands this often
const PILE_MS = ARRIVE_MS * N; // the pile is complete
const IN_MS = 440; // a ticket's landing
const MELT_AT = 1700; // Bizmis starts answering
const RESOLVE_MS = 170; // and ticks one off this often, from the front
const OUT_MS = 620; // a ticket ticked and swept away
const MELT_END = MELT_AT + RESOLVE_MS * N; // the last one is gone
const RELIEF_MS = MELT_END + 1500; // the calm check draws, the sparkles pop
const landedAt = (i: number) => i * ARRIVE_MS;
const outAt = (i: number) => MELT_AT + (N - 1 - i) * RESOLVE_MS;
// the pile: the front ticket, then each older one peeking out above the next
const TK_W = 316;
const TK_H = 46;
const BOTTOM = 246; // the front ticket's bottom edge
const READABLE = 3;
const LINE_Y = 27; // a readable ticket peeks out this much above the one in front
const EDGE_Y = 7; // deeper in the pile, only an edge
const liftY = (depth: number) =>
  depth <= READABLE - 1 ? depth * LINE_Y : (READABLE - 1) * LINE_Y + (depth - READABLE + 1) * EDGE_Y;

/** How much ticket `j` is on the pile at `t` (0 → 1 as it lands, back to 0 as it's swept away). */
const presence = (j: number, t: number) =>
  easeBack(span(t, landedAt(j), landedAt(j) + 380), 1.2) *
  (1 - easeOut(span(t, outAt(j) + 220, outAt(j) + 560)));

/**
 * Relief: support tickets (outlined cards, a line of "text" each) land one
 * after another on a growing pile while the drawn badge counts them up.
 * Then Bizmis ticks them off from the front, each swept away, the count
 * drains to zero, and a big check draws itself in a circle: "All caught up",
 * with a few sparkles.
 */
export const SupportRelief = ({ className }: { className?: string }) => {
  const r = useMessages().landing.support.relief;
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  const { t, rewinding, cycle } = useRewindLoop(ref, { duration: RELIEF_MS, hold: 0, rewind: 900, rest: 450, threshold: 0.45, tick: 0 });
  // the inbox's head (its name, the badge) is written once, on the first play; after that it stays
  // through every rewind and reset, so the drawing never goes blank between loops
  const kept = cycle > 1 || rewinding;

  const count =
    t < PILE_MS
      ? Math.round(PEAK * easeOut(t / PILE_MS))
      : t < MELT_AT
        ? PEAK
        : Math.round(PEAK * Math.pow(1 - span(t, MELT_AT, MELT_END), 1.5));
  const pres = Array.from({ length: N }, (_, j) => presence(j, t));
  const depthOf = (i: number) => {
    let d = 0;
    for (let j = i + 1; j < N; j++) d += pres[j];
    return d;
  };
  const kInOf = (i: number) => span(t, landedAt(i), landedAt(i) + IN_MS);
  const topOf = (i: number) => BOTTOM - TK_H - liftY(depthOf(i)) + 40 * (1 - easeBack(kInOf(i)));

  // the badge: a drawn pill, bouncing as the pile tops out and as it empties
  const badgeText = r.waiting.replace("{n}", String(count));
  const bw = 32 + badgeText.length * 8.3; // Caveat runs about 8 units a character here
  const bx = RW - 4 - bw;
  const bump =
    0.14 * hump(span(t, PILE_MS - 60, PILE_MS + 340)) + 0.14 * hump(span(t, MELT_END - 40, MELT_END + 360));

  // the calm: a check in a circle, drawing itself, then the words and sparkles
  const cx = RW / 2;
  const cy = 132;
  const ring = easeOut(span(t, MELT_END, MELT_END + 520));
  const tick = easeOut(span(t, MELT_END + 380, MELT_END + 700));
  const doneAt = MELT_END + 560;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`${r.label}: ${r.done}`}
      className={cn("bzl-relief bzl-mk", className)}
    >
      <svg viewBox={`0 0 ${RW} ${RH}`} aria-hidden="true">
        <defs>
          {TILTS.map((_, i) => {
            // a ticket shows only above the one in front of it
            let clipY = 1000;
            for (let j = i + 1; j < N; j++) {
              if (pres[j] >= 0.5 && span(t, outAt(j), outAt(j) + OUT_MS) < 0.45) {
                clipY = topOf(j) - 5;
                break;
              }
            }
            return (
              <clipPath key={i} id={`${uid}-tk${i}`}>
                <rect x={-200} y={-200} width={RW + 400} height={clipY + 200} />
              </clipPath>
            );
          })}
        </defs>

        {/* the head: the inbox's name, and its count in a drawn badge */}
        <Hand k={kept ? 1 : writing(r.label, t, 0)} x={4} y={30}>
          {r.label}
        </Hand>
        <g
          transform={`translate(${f(bx + bw / 2)} 22) scale(${f(1 + bump)} ${f(1 - bump * 0.7)}) translate(${f(-(bx + bw / 2))} -22)`}
        >
          <path className="mk-mid" d={rrect(bx, 4, bw, 36, 18, 3)} {...drawn(kept ? 1 : easeOut(span(t, 0, 380)))} />
          {/* written once; the count then just changes its digits */}
          <Hand k={kept ? 1 : writing(badgeText, t, 200)} x={bx + bw / 2} y={30} textAnchor="middle">
            {badgeText}
          </Hand>
        </g>

        {/* the pile */}
        {TILTS.map((tilt, i) => {
          const kIn = kInOf(i);
          if (kIn <= 0) return null;
          const depth = depthOf(i);
          const kOut = span(t, outAt(i), outAt(i) + OUT_MS);
          const ticked = clamp01(kOut / 0.42);
          const away = easeIn(clamp01((kOut - 0.42) / 0.58));
          const opacity = clamp01(kIn * 2.2) * (1 - away) * clamp01(8 - depth);
          if (opacity <= 0.001) return null;
          const w = TK_W - Math.min(depth, 8) * 7;
          const x = cx - w / 2;
          const y = topOf(i);
          const my = y + TK_H / 2;
          // landing squash: wide and low as it lands, then springs back
          const sq = hump(clamp01(kIn * 1.25 - 0.1));
          const sx = 1 + 0.07 * sq;
          const sy = 1 - 0.16 * sq;
          const content = 1 - ticked;
          return (
            <g key={i} clipPath={`url(#${uid}-tk${i})`} opacity={f(opacity)}>
              <g
                transform={
                  `translate(${f(150 * away)} ${f(-26 * away)}) rotate(${f(tilt + 12 * away)} ${f(cx)} ${f(my)}) ` +
                  `translate(${f(cx)} ${f(y + TK_H)}) scale(${f(sx)} ${f(sy)}) translate(${f(-cx)} ${f(-(y + TK_H))})`
                }
              >
                <path className="mk-main" d={rrect(x, y, w, TK_H, 13, i)} />
                <g opacity={f(content)}>
                  <circle className="mk-thin" cx={x + 25} cy={my} r={8.5} />
                  <path className="mk-mid" d={`M${f(x + 46)} ${f(my + hand(i, 3) * 0.6)} H${f(x + 46 + Math.min(LINES[i], w - 96))}`} />
                  <circle className="mk-dot" cx={x + w - 24} cy={my} r={5} />
                </g>
                {/* ticked off: a big tick drawn across the card */}
                <path
                  className="mk-main"
                  d={`M${f(cx - 24)} ${f(my + 1)} L${f(cx - 7)} ${f(my + 15)} L${f(cx + 26)} ${f(my - 15)}`}
                  {...drawn(ticked)}
                />
              </g>
            </g>
          );
        })}

        {/* all caught up */}
        <path className="mk-main" d={loop(cx, cy, 46, 2)} {...drawn(ring)} />
        <path
          className="mk-main is-heavy"
          d={`M${cx - 21} ${cy + 1} L${cx - 6} ${cy + 16} L${cx + 23} ${cy - 15}`}
          {...drawn(tick)}
        />
        <Hand k={writing(r.done, t, doneAt)} x={cx} y={cy + 92} textAnchor="middle" className="is-big">
          {r.done}
        </Hand>
        <Sparkle x={cx + 76} y={cy - 38} k={span(t, MELT_END + 640, MELT_END + 1040)} />
        <Sparkle x={cx - 78} y={cy - 22} k={span(t, MELT_END + 760, MELT_END + 1160)} size={8} spin={45} />
        <Sparkle x={cx + 64} y={cy + 36} k={span(t, MELT_END + 880, MELT_END + 1280)} size={7} />
      </svg>
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
const CLARITY_MS = AHA_AT + 2300; // room for a long top ask to finish writing

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
const star = (r: number) => {
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
 */
export const InsightsClarity = ({ className }: { className?: string }) => {
  const cl = useMessages().landing.insights.clarity;
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  const { t } = useRewindLoop(ref, { duration: CLARITY_MS, hold: 0, rewind: 900, rest: 450, threshold: 0.45, tick: 0 });

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
    </div>
  );
};
