import { useRef } from "react";
import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { span, useRewindLoop } from "./useRewindLoop";

/**
 * Each benefit pillar's "feel it" moment: a short animation (about 4 s) that
 * plays from its start the moment it scrolls into view, holds on the resolved
 * frame, rewinds (the same timeline, fast, backwards) and plays again
 * (useRewindLoop). Every frame is derived from the loop's time `t`, so the
 * rewind is the animation itself in reverse. Leaving the view resets it.
 * Reduced motion shows the final, resolved frame. The static look lives in
 * film-landing.css (.bzl-relief-*, .bzl-clarity-*); the motion lives here.
 */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
/** A spring-like settle: overshoots a little, then lands. */
const easeBack = (x: number, s = 1.7) =>
  x <= 0 ? 0 : x >= 1 ? 1 : 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/* ── Support: the inbox that empties itself ──────────────────────────────── */

// a slight tilt per ticket, so the stack reads as a pile, not a list
const TILTS = [-1.5, 1, -0.5, 1.5, -1, 0.5, -1.5, 1, -0.5] as const;
const N = TILTS.length;
const PEAK = 48; // the count the inbox climbs to while the pile grows
const ARRIVE_MS = 130; // a new ticket lands this often
const PILE_MS = ARRIVE_MS * N; // the pile is complete
const IN_MS = 420; // a ticket's landing
const MELT_AT = 1700; // Bizmis starts answering
const RESOLVE_MS = 170; // and clears one ticket this often, from the front
const OUT_MS = 600; // a ticket turning into a check and dissolving
const MELT_END = MELT_AT + RESOLVE_MS * N; // the last ticket is cleared
const CALM_MS = 900; // the calm check settling
const RELIEF_MS = MELT_END + CALM_MS + 200;
const landedAt = (i: number) => i * ARRIVE_MS;
const outAt = (i: number) => MELT_AT + (N - 1 - i) * RESOLVE_MS;
// the stack: the newest three read as a cascade (each older one shows its
// whole line above the next), the rest compress into a pile of edges behind
const READABLE = 3;
const LINE_Y = 27; // px a readable ticket sits above the one in front
const EDGE_Y = 6; // px each ticket deeper in the pile sits above the next
const DEPTH_S = 0.03; // and how much smaller each step back is
const liftY = (depth: number) =>
  depth <= READABLE - 1
    ? depth * LINE_Y
    : (READABLE - 1) * LINE_Y + (depth - READABLE + 1) * EDGE_Y;

/** How much ticket `j` is on the pile at `t` (0 → 1 as it lands, back to 0 as it's cleared). */
const presence = (j: number, t: number) =>
  easeBack(span(t, landedAt(j), landedAt(j) + 380), 1.2) *
  (1 - easeOut(span(t, outAt(j) + 120, outAt(j) + 500)));

/**
 * Relief: support tickets land one after another on a growing stack of
 * notifications (newest in front; older ones pushed back and up, the first
 * few still readable, the rest a pile of edges) while the waiting count
 * climbs. Then Bizmis clears them from the front, each turning into a check
 * and dissolving, the count drains to zero, and a calm check settles in their
 * place.
 */
export const SupportRelief = ({ className }: { className?: string }) => {
  const r = useMessages().landing.support.relief;
  const ref = useRef<HTMLDivElement>(null);
  const { t, active } = useRewindLoop(ref, {
    duration: RELIEF_MS,
    rewind: 900,
    threshold: 0.45,
    tick: 0,
  });

  const count =
    t < PILE_MS
      ? Math.round(PEAK * easeOut(t / PILE_MS))
      : t < MELT_AT
        ? PEAK
        : // drains with the pile, so it reads 0 only as the last ticket goes
          Math.round(PEAK * Math.pow(1 - span(t, MELT_AT, MELT_END), 1.5));
  const calm = t >= MELT_END;
  const calmK = span(t, MELT_END, MELT_END + CALM_MS);
  const pres = TILTS.map((_, j) => presence(j, t));

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`${r.label}: ${r.done}`}
      className={cn("bzl-relief", (active || t > 0) && !calm && "is-on", calm && "is-calm", className)}
    >
      <div className="bzl-relief-head" aria-hidden="true">
        <span className="bzl-relief-label">
          <span className="bzl-relief-led" />
          {r.label}
        </span>
        <span className="bzl-relief-count">
          {r.waiting.replace("{n}", String(count))}
        </span>
      </div>
      <div className="bzl-relief-stage" aria-hidden="true">
        {TILTS.map((tilt, i) => {
          // how deep in the pile: the tickets on it in front of this one
          let depth = 0;
          for (let j = i + 1; j < N; j++) depth += pres[j];
          const behind = clamp01(depth - (READABLE - 1));
          // landing: rises in from below with a little spring
          const kIn = span(t, landedAt(i), landedAt(i) + IN_MS);
          const sIn = easeBack(kIn);
          // clearing: a beat as a check, then up and away into a blur
          const kOut = span(t, outAt(i), outAt(i) + OUT_MS);
          const beat = clamp01(kOut / 0.35);
          const away = easeInOut(clamp01((kOut - 0.35) / 0.65));
          const opacity = easeOut(clamp01(kIn * 1.6)) * (1 - away);
          const y = 34 * (1 - sIn) - 18 * away;
          const scale = (0.92 + 0.08 * sIn) * mix(1 + 0.03 * beat, 0.6, away);
          return (
            <span
              key={i}
              className="bzl-tk-slot"
              style={{
                zIndex: i + 1,
                transform: `translateX(-50%) translateY(${(-liftY(depth)).toFixed(2)}px) scale(${(1 - depth * DEPTH_S).toFixed(4)})`,
                opacity: clamp01(8 - depth),
              }}
            >
              <span
                className="bzl-tk"
                style={
                  {
                    "--behind": behind.toFixed(3),
                    opacity,
                    transform: `translateY(${y.toFixed(2)}px) scale(${scale.toFixed(4)}) rotate(${(tilt * (1 - beat)).toFixed(2)}deg)`,
                    filter: away > 0 ? `blur(${(6 * away).toFixed(2)}px)` : undefined,
                  } as CSSProperties
                }
              >
                <span className="bzl-tk-dot" style={{ opacity: 1 - behind }} />
                <span className="bzl-tk-text" style={{ opacity: 1 - behind }}>
                  {r.tickets[i % r.tickets.length]}
                </span>
                <span className="bzl-tk-unread" style={{ opacity: 1 - behind }} />
                <span className="bzl-tk-check" style={{ opacity: clamp01(kOut / 0.25) }}>
                  <Check strokeWidth={3} />
                </span>
              </span>
            </span>
          );
        })}
        <span
          className="bzl-relief-calm"
          style={{
            opacity: easeOut(clamp01(calmK * 1.3)),
            transform: `scale(${(0.85 + 0.15 * easeBack(calmK)).toFixed(4)})`,
          }}
        >
          <span className="bzl-relief-check">
            <Check strokeWidth={2.6} />
          </span>
          <span className="bzl-relief-done">{r.done}</span>
        </span>
      </div>
    </div>
  );
};

/* ── Insights: noise that sorts itself into an answer ─────────────────────── */

const COLS = [20, 40, 60, 80]; // column centres, % of the stage
const HEIGHTS = [2, 3, 4, 6]; // a rising chart; the last column is the answer
const STAGE = 150; // px
const BASE = 12; // the baseline's distance from the bottom
const STEP = 13; // a segment plus its gap

// where each dot starts, scattered (left %, top px)
const SCATTER = [
  [8, 22], [27, 96], [71, 14], [90, 58], [47, 40], [14, 70], [62, 102],
  [35, 12], [82, 104], [55, 72], [4, 108], [76, 44], [40, 84], [22, 46],
  [93, 18],
] as const;
// extra noise that only lives in the scatter, then fades away (left %, top px)
const NOISE = [
  [18, 118], [31, 30], [44, 128], [67, 60], [86, 84], [11, 50], [58, 20],
  [74, 124], [50, 96], [96, 112],
] as const;
// where each question floats while it's still noise (left %, top px)
const SNIPPETS = [
  [3, 4],
  [55, 0],
  [24, 56],
  [60, 88],
] as const;
// the dots' greys while they're noise
const GREYS = ["#cdbfb1", "#e3c99a", "#b9aa9b"] as const;
const SORTED = "color-mix(in oklab, var(--acc, #d99a1c) 45%, #fff)";

const segments = HEIGHTS.flatMap((h, c) =>
  Array.from({ length: h }, (_, k) => ({ c, k })),
);
const colTop = (c: number) => STAGE - BASE - HEIGHTS[c] * STEP;

const SNIP_EVERY = 190; // the questions pop in one after another
const SORT_AT = 1300; // the noise starts sorting itself
const AHA_AT = 2450; // the answer lights up
const CLARITY_MS = AHA_AT + 1750;

/** A restless wobble, from the time itself (so it runs backwards on the rewind too). */
const jitter = (t: number, period: number, phase: number, amp = 1) => {
  const a = 2 * Math.PI * (t / period + phase);
  return [3 * Math.sin(a) * amp, 4 * Math.sin(a * 2 + 1.3) * amp] as const;
};

/**
 * Clarity: scattered questions and dots jitter like noise, then fly into a
 * clean rising chart; the tallest bar lights up and names the top ask.
 */
export const InsightsClarity = ({ className }: { className?: string }) => {
  const cl = useMessages().landing.insights.clarity;
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useRewindLoop(ref, {
    duration: CLARITY_MS,
    rewind: 900,
    threshold: 0.45,
    tick: 0,
  });
  const tops = COLS.map((x, c) => `${x},${colTop(c) - 7}`).join(" ");
  const shown = span(t, 0, 400); // the noise fading in
  const fadeNoise = span(t, SORT_AT, SORT_AT + 500);
  const aha = span(t, AHA_AT, AHA_AT + 450);
  const line = easeInOut(span(t, AHA_AT, AHA_AT + 900));
  const peak = span(t, AHA_AT + 750, AHA_AT + 1250);
  const callout = span(t, AHA_AT + 950, AHA_AT + 1550);
  return (
    <div
      ref={ref}
      role="img"
      aria-label={cl.topAsk}
      className={cn("bzl-clarity", className)}
    >
      <div className="bzl-clarity-stage" aria-hidden="true">
        {cl.snippets.map((s, i) => {
          const kIn = span(t, i * SNIP_EVERY, i * SNIP_EVERY + 400);
          const out = easeInOut(span(t, SORT_AT, SORT_AT + 600));
          const [jx, jy] = jitter(t, 1600, i * 0.25);
          const [sx, sy] = SNIPPETS[i % SNIPPETS.length];
          return (
            <span
              key={s}
              className="bzl-clarity-snip"
              style={{
                left: `${sx}%`,
                top: `${sy}px`,
                opacity: clamp01(kIn * 1.5) * (1 - out),
                transform: `translate(${jx.toFixed(2)}px, ${(jy + 20 * out).toFixed(2)}px) scale(${((0.7 + 0.3 * easeBack(kIn)) * (1 - 0.4 * out)).toFixed(4)})`,
                filter: out > 0 ? `blur(${(4 * out).toFixed(2)}px)` : undefined,
              }}
            >
              {s}
            </span>
          );
        })}
        {NOISE.map(([x, y], i) => {
          const [jx, jy] = jitter(t, 900 + (i % 4) * 270, (i % 5) * 0.21);
          return (
            <span
              key={`n${i}`}
              className="bzl-clarity-dot"
              style={{
                left: `${x}%`,
                top: `${y}px`,
                background: GREYS[i % GREYS.length],
                opacity: shown * (1 - fadeNoise),
                transform: `translate(${jx.toFixed(2)}px, ${jy.toFixed(2)}px) scale(${(1 - 0.7 * fadeNoise).toFixed(3)})`,
              }}
            />
          );
        })}
        {segments.map(({ c, k }, i) => {
          const [sx, sy] = SCATTER[i % SCATTER.length];
          const d = SORT_AT + (c * 4 + k) * 35;
          const move = easeBack(span(t, d, d + 850), 1.1); // flies into place, with a little spring
          const shape = easeInOut(span(t, d, d + 500)); // dot → bar segment
          const [jx, jy] = jitter(t, 1100 + (i % 5) * 230, (i % 7) * 0.17, 1 - span(t, d, d + 200));
          const isTop = c === COLS.length - 1;
          const bg = `color-mix(in oklab, ${SORTED} ${(shape * 100).toFixed(1)}%, ${GREYS[i % GREYS.length]})`;
          return (
            <span
              key={`${c}-${k}`}
              className="bzl-clarity-dot"
              style={{
                left: `calc(${mix(sx, COLS[c], move).toFixed(3)}% - ${move.toFixed(4)} * var(--seg-w) / 2)`,
                top: `${mix(sy, STAGE - BASE - (k + 1) * STEP, move).toFixed(2)}px`,
                width: `calc(9px + (var(--seg-w) - 9px) * ${shape.toFixed(4)})`,
                height: `${(9 + shape).toFixed(2)}px`,
                borderRadius: `${(999 - 995 * shape).toFixed(1)}px`,
                background: isTop
                  ? `color-mix(in oklab, var(--acc, #d99a1c) ${(aha * 100).toFixed(1)}%, ${bg})`
                  : bg,
                boxShadow:
                  isTop && aha > 0
                    ? `0 0 ${(14 * aha).toFixed(1)}px 1px color-mix(in oklab, var(--acc, #d99a1c) ${(55 * aha).toFixed(1)}%, transparent)`
                    : undefined,
                opacity: shown,
                transform: `translate(${jx.toFixed(2)}px, ${jy.toFixed(2)}px)`,
              }}
            />
          );
        })}
        <svg
          className="bzl-clarity-line"
          viewBox={`0 0 100 ${STAGE}`}
          preserveAspectRatio="none"
          style={{
            clipPath: `inset(-10px ${((1 - line) * 100).toFixed(2)}% -10px -10px)`,
            opacity: line > 0 ? 1 : 0,
          }}
        >
          <polyline points={tops} />
        </svg>
        <span
          className="bzl-clarity-peak"
          style={{
            left: `${COLS[COLS.length - 1]}%`,
            top: `${colTop(COLS.length - 1) - 7}px`,
            opacity: clamp01(peak * 1.7),
            scale: easeBack(peak).toFixed(4),
          }}
        />
        <span
          className="bzl-clarity-callout"
          style={{
            right: `calc(${100 - COLS[COLS.length - 1]}% + 1.6rem)`,
            top: "6px",
            opacity: clamp01(callout * 1.5),
            transform: `translateY(${(6 * (1 - easeBack(callout))).toFixed(2)}px) scale(${(0.9 + 0.1 * easeBack(callout)).toFixed(4)})`,
          }}
        >
          {cl.topAsk}
        </span>
        <span
          className="bzl-clarity-base"
          style={{
            bottom: `${BASE - 4}px`,
            opacity: span(t, SORT_AT + 400, SORT_AT + 1000),
          }}
        />
      </div>
    </div>
  );
};
