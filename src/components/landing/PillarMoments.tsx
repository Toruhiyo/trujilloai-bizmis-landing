import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { useInView } from "./Reveal";

/**
 * Each benefit pillar's "feel it" moment: a short animation (about 3.5 s)
 * that plays once when it scrolls into view, so the benefit lands as a
 * feeling before it's read. Reduced motion shows the final, resolved frame.
 * The motion lives in film-landing.css (.bzl-relief-*, .bzl-clarity-*).
 */

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Plays once in view: "idle" → each timed phase in turn. */
const usePhases = <P extends string>(
  threshold: number,
  steps: readonly (readonly [P, number])[],
  idle: P,
) => {
  const [ref, inView] = useInView<HTMLDivElement>(threshold);
  const [phase, setPhase] = useState<P>(idle);
  useEffect(() => {
    if (!inView) return;
    if (reducedMotion()) {
      setPhase(steps[steps.length - 1][0]);
      return;
    }
    const timers = steps.map(([p, at]) =>
      window.setTimeout(() => setPhase(p), at),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
    // steps are static per component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  return [ref, phase, inView] as const;
};

/* ── Support: the inbox that empties itself ──────────────────────────────── */

// a slight tilt per ticket, so the stack reads as a pile, not a list
const TILTS = [-1.5, 1, -0.5, 1.5, -1, 0.5, -1.5, 1, -0.5] as const;
const N = TILTS.length;
const PEAK = 48; // the count the inbox climbs to while the pile grows
const ARRIVE_MS = 130; // a new ticket lands this often
const PILE_MS = ARRIVE_MS * N; // the pile is complete
const MELT_AT = 1700; // Bizmis starts answering
const RESOLVE_MS = 170; // and clears one ticket this often
const MELT_END = MELT_AT + RESOLVE_MS * N; // the last ticket is gone
// the stack: the newest three read as a cascade (each older one shows its
// whole line above the next), the rest compress into a pile of edges behind
const READABLE = 3;
const LINE_Y = 27; // px a readable ticket sits above the one in front
const EDGE_Y = 6; // px each ticket deeper in the pile sits above the next
const DEPTH_S = 0.03; // and how much smaller each step back is
const liftY = (depth: number) =>
  depth < READABLE
    ? depth * LINE_Y
    : (READABLE - 1) * LINE_Y + (depth - READABLE + 1) * EDGE_Y;

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

/**
 * Relief: support tickets land one after another on a growing stack of
 * notifications (newest in front; older ones pushed back and up, the first
 * few still readable, the rest a pile of edges) while the waiting count climbs. Then Bizmis clears them
 * from the front, each turning into a check and dissolving, the count drains
 * to zero, and a calm check settles in their place.
 */
export const SupportRelief = ({ className }: { className?: string }) => {
  const r = useMessages().landing.support.relief;
  const [ref, inView] = useInView<HTMLDivElement>(0.45);
  const [count, setCount] = useState(0);
  const [arrived, setArrived] = useState(0);
  const [resolved, setResolved] = useState(0);
  const [calm, setCalm] = useState(false);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion()) {
      setCalm(true);
      return;
    }
    setOn(true);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = now - start;
      setArrived(Math.min(N, Math.floor(t / ARRIVE_MS) + 1));
      setResolved(
        t < MELT_AT ? 0 : Math.min(N, Math.floor((t - MELT_AT) / RESOLVE_MS) + 1),
      );
      if (t < PILE_MS) setCount(Math.round(PEAK * easeOut(t / PILE_MS)));
      else if (t < MELT_AT) setCount(PEAK);
      else if (t < MELT_END)
        setCount(
          Math.round(PEAK * (1 - easeOut((t - MELT_AT) / (MELT_END - MELT_AT)))),
        );
      else {
        setCount(0);
        setCalm(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  // the ticket in front: the newest that has landed and isn't cleared yet
  const front = Math.min(arrived, N - resolved) - 1;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`${r.label}: ${r.done}`}
      className={cn(
        "bzl-relief",
        on && "is-on",
        calm && "is-calm",
        className,
      )}
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
          const landed = i < arrived;
          const out = i >= N - resolved;
          const depth = out ? 0 : Math.max(0, front - i);
          return (
            <span
              key={i}
              className={cn(
                "bzl-tk-slot",
                landed && "is-in",
                out && "is-out",
                depth >= READABLE && "is-behind",
              )}
              style={
                {
                  zIndex: i + 1,
                  "--r": `${tilt}deg`,
                  transform: `translateX(-50%) translateY(${-liftY(depth)}px) scale(${1 - depth * DEPTH_S})`,
                  opacity: depth > 7 ? 0 : 1,
                } as CSSProperties
              }
            >
              <span className="bzl-tk">
                <span className="bzl-tk-dot" />
                <span className="bzl-tk-text">
                  {r.tickets[i % r.tickets.length]}
                </span>
                <span className="bzl-tk-unread" />
                <span className="bzl-tk-check">
                  <Check strokeWidth={3} />
                </span>
              </span>
            </span>
          );
        })}
        <span className="bzl-relief-calm">
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

const segments = HEIGHTS.flatMap((h, c) =>
  Array.from({ length: h }, (_, k) => ({ c, k })),
);
const colTop = (c: number) => STAGE - BASE - HEIGHTS[c] * STEP;

type ClarityPhase = "idle" | "noise" | "sort" | "aha";
const CLARITY_STEPS = [
  ["noise", 0],
  ["sort", 1300],
  ["aha", 2450],
] as const;

/**
 * Clarity: scattered questions and dots jitter like noise, then fly into a
 * clean rising chart; the tallest bar lights up and names the top ask.
 */
export const InsightsClarity = ({ className }: { className?: string }) => {
  const cl = useMessages().landing.insights.clarity;
  const [ref, phase] = usePhases<ClarityPhase>(0.45, CLARITY_STEPS, "idle");
  const sorted = phase === "sort" || phase === "aha";
  const tops = COLS.map((x, c) => `${x},${colTop(c) - 7}`).join(" ");
  return (
    <div
      ref={ref}
      role="img"
      aria-label={cl.topAsk}
      className={cn("bzl-clarity", `is-${phase}`, className)}
    >
      <div className="bzl-clarity-stage" aria-hidden="true">
        {cl.snippets.map((s, i) => (
          <span
            key={s}
            className="bzl-clarity-snip"
            style={
              {
                "--i": i,
                left: `${SNIPPETS[i % SNIPPETS.length][0]}%`,
                top: `${SNIPPETS[i % SNIPPETS.length][1]}px`,
              } as CSSProperties
            }
          >
            {s}
          </span>
        ))}
        {NOISE.map(([x, y], i) => (
          <span
            key={`n${i}`}
            className="bzl-clarity-dot is-noise"
            style={
              {
                "--d": "0ms",
                "--j": `${0.9 + (i % 4) * 0.27}s`,
                "--jd": `${-(i % 5) * 0.21}s`,
                left: `${x}%`,
                top: `${y}px`,
              } as CSSProperties
            }
          />
        ))}
        {segments.map(({ c, k }, i) => {
          const [sx, sy] = SCATTER[i % SCATTER.length];
          return (
            <span
              key={`${c}-${k}`}
              className={cn("bzl-clarity-dot", c === COLS.length - 1 && "is-top")}
              style={
                {
                  "--d": `${(c * 4 + k) * 35}ms`,
                  "--j": `${1.1 + (i % 5) * 0.23}s`,
                  "--jd": `${-(i % 7) * 0.17}s`,
                  left: sorted ? `calc(${COLS[c]}% - var(--seg-w) / 2)` : `${sx}%`,
                  top: sorted ? `${STAGE - BASE - (k + 1) * STEP}px` : `${sy}px`,
                } as CSSProperties
              }
            />
          );
        })}
        <svg
          className="bzl-clarity-line"
          viewBox={`0 0 100 ${STAGE}`}
          preserveAspectRatio="none"
        >
          <polyline points={tops} />
        </svg>
        <span
          className="bzl-clarity-peak"
          style={{ left: `${COLS[COLS.length - 1]}%`, top: `${colTop(COLS.length - 1) - 7}px` }}
        />
        <span
          className="bzl-clarity-callout"
          style={{ right: `calc(${100 - COLS[COLS.length - 1]}% + 1.6rem)`, top: "6px" }}
        >
          {cl.topAsk}
        </span>
        <span className="bzl-clarity-base" style={{ bottom: `${BASE - 4}px` }} />
      </div>
    </div>
  );
};
