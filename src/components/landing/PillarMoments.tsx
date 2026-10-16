import { useId, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from "react";
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

/* ── Support: questions answered live, by voice ──────────────────────────── */

/**
 * The handwriting's real widths (in the drawing's units), so the bubbles fit
 * their words in whatever size the page's look sets: measured off hidden
 * probes of the same texts (a <g> of <text>s in the SVG), again once the
 * marker font is in.
 */
const useProbeWidths = (key: string) => {
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
    document.fonts?.load("700 24px Caveat").then(measure).catch(() => undefined);
    return () => {
      live = false;
    };
  }, [key]);
  return [w, probes] as const;
};

const LW = 480; // the drawing's box (viewBox units ≈ px at desktop)
const LH = 256;
const AGENT = { x: 50, y: 108 }; // the agent's head (headset on), at the left
const LANE_Y = 192; // where answered questions settle, in a row
const ENV = { x: 404, y: 190, w: 80, h: 54 }; // the support email, at the right
const ROW_A = 28; // question bubbles' centres, two staggered rows up top
const ROW_B = 84;
const Q_H = 40;
const SLOT_W = 46;
const SLOT_H = 34;
const Q_WRITE = 560; // shoppers write fast
const ANSWER_AFTER = 720; // the agent starts talking once the question's up
const WAVE_MS = 520; // one ripple of voice, from the agent to the bubble
const VOICE_MS = 900; // how long the agent talks to one question
const CONVERT_AFTER = 480; // the voice reaches it: the bubble turns into a check
const CONVERT_MS = 540;

/** The four questions: when each pops up, where, and the slot its check settles in. */
type Question = { at: number; x: number; y: number; slot: number; ticket?: boolean };
const QUESTIONS: readonly Question[] = [
  { at: 300, x: 215, y: ROW_A, slot: 126 },
  { at: 1000, x: 338, y: ROW_B, slot: 182 },
  { at: 1950, x: 330, y: ROW_A, slot: 294, ticket: true }, // the ticket that never was
  { at: 3150, x: 200, y: ROW_B, slot: 238 },
];
const answerAt = (i: number) => QUESTIONS[i].at + ANSWER_AFTER + (QUESTIONS[i].ticket ? 80 : 0);
const convertAt = (i: number) => answerAt(i) + CONVERT_AFTER;
// the ticket: it heads for the support email, and is answered on the way
const TK = 2;
const FLY_AT = QUESTIONS[TK].at + 600;
const FLY_END = FLY_AT + 800;
const CATCH_AT = convertAt(TK);
const OPEN_AT = FLY_AT + 220; // the envelope opens for it
const CLOSE_AT = CATCH_AT + 60; // and closes again, empty
const DONE_AT = convertAt(QUESTIONS.length - 1) + 420;
export const LIVE_MS = DONE_AT + 1050;

/** How much the agent is talking at `t` (0 → 1, mouth opening and closing). */
const talking = (t: number) => {
  const on = QUESTIONS.some((_, i) => t > answerAt(i) && t < answerAt(i) + VOICE_MS);
  return on ? Math.abs(Math.sin(t / 62)) : 0;
};

/**
 * The agent's voice toward a point, while it answers (from `from`): a
 * speaking glyph at its mouth (three arcs, pulsing out) and ripples
 * travelling to the bubble.
 */
const Voice = ({ t, from, to }: { t: number; from: number; to: readonly [number, number] }) => {
  const dx = to[0] - AGENT.x;
  const dy = to[1] - AGENT.y;
  const a = Math.atan2(dy, dx);
  const reach = Math.max(80, Math.hypot(dx, dy) - 26);
  const on = span(t, from - 40, from + 120) * (1 - span(t, from + VOICE_MS - 120, from + VOICE_MS));
  if (on <= 0) return null;
  const arc = (r: number, s: number) => {
    const pt = (ang: number) => `${f(AGENT.x + Math.cos(ang) * r)} ${f(AGENT.y + Math.sin(ang) * r)}`;
    return `M${pt(a - s)} A${f(r)} ${f(r)} 0 0 1 ${pt(a + s)}`;
  };
  return (
    <g>
      {/* the speaking glyph: ))) at the mouth, each arc pulsing in turn */}
      {[0, 1, 2].map((j) => {
        const beat = 0.5 + 0.5 * Math.sin((t - from) / 95 - j * 1.1);
        return (
          <path
            key={`g${j}`}
            className={j === 1 ? "mk-main" : "mk-mid"}
            d={arc(44 + j * 12 + 2 * beat, 0.34 - j * 0.04)}
            opacity={f(on * (0.55 + 0.45 * beat))}
          />
        );
      })}
      {/* ripples on their way to the question */}
      {[0, 1, 2].map((j) => {
        const p = span(t, from + j * 150, from + j * 150 + WAVE_MS);
        if (p <= 0 || p >= 1) return null;
        const r = mix(82, reach, easeOut(p));
        return <path key={`r${j}`} className="mk-mid" d={arc(r, Math.min(0.3, 24 / r))} opacity={f(Math.min(1, p * 5) * (1 - Math.pow(p, 2.5)))} />;
      })}
    </g>
  );
};

/** Where question `i`'s bubble is at `t` (before it turns into a check), and its tilt. */
const bubbleAt = (i: number, w: number, t: number) => {
  const q = QUESTIONS[i];
  const x = Math.min(LW - w / 2 - 4, Math.max(102 + w / 2, q.x));
  if (!q.ticket) return { x, y: q.y, tilt: 0, fly: 0 };
  const fly = easeIn(span(Math.min(t, CATCH_AT), FLY_AT, FLY_END));
  // caught: a little wobble where it stopped
  const caught = span(t, CATCH_AT, CATCH_AT + 360);
  return {
    x: mix(x, ENV.x, fly),
    y: mix(q.y, ENV.y - ENV.h / 2 - 18, fly) - 22 * Math.sin(Math.PI * fly) * 0.6,
    tilt: 14 * fly - 10 * hump(caught) * Math.sin(caught * Math.PI * 3),
    fly,
  };
};

type LiveCopy = { label: string; questions: readonly string[]; email: string; done: string };

/**
 * The drawing at a given time `t` (ms along LIVE_MS). Shoppers' questions pop
 * up in handwritten bubbles; the agent (a head with a headset) answers each
 * out loud: ripples of voice reach the bubble, which turns into a happy check
 * and settles in a row. One question heads for the support email instead (a
 * ticket in the making), is answered mid-flight and never gets there: the
 * envelope closes again, empty. Then: "Answered on the spot".
 */
export const SupportLiveDrawing = ({
  t,
  copy,
  kept,
}: {
  t: number;
  copy: LiveCopy;
  /** Keep the agent and the envelope drawn (after the first play), so the drawing never goes blank. */
  kept: boolean;
}) => {
  // the agent: a head with a headset, a smile, talking while it answers
  const agent = kept ? 1 : easeOut(span(t, 0, 520));
  const headset = kept ? 1 : easeOut(span(t, 180, 620));
  const talk = talking(t);
  const { x: ax, y: ay } = AGENT;

  // the support email: an envelope that opens for the ticket and closes again, empty
  const env = kept ? 1 : easeOut(span(t, 160, 640));
  const open = easeOut(span(t, OPEN_AT, OPEN_AT + 260)) * (1 - easeInOut(span(t, CLOSE_AT, CLOSE_AT + 320)));
  const shake = span(t, CLOSE_AT + 200, CLOSE_AT + 760);
  const ex = ENV.x - ENV.w / 2;
  const ey = ENV.y - ENV.h / 2;
  const flapY = mix(ey + ENV.h * 0.56, ey - ENV.h * 0.36, open);

  const [widths, probes] = useProbeWidths([...copy.questions, copy.done, copy.email].join("|"));
  const bubbleW = (i: number) => (widths[i] ?? copy.questions[i].length * 11) + 30;
  const doneW = widths[copy.questions.length] ?? copy.done.length * 15;
  const emailW = widths[copy.questions.length + 1] ?? copy.email.length * 10;
  const emailX = Math.min(ENV.x, LW - emailW / 2 - 2);
  const doneX = 288;
  const doneY = 64;

  return (
    <svg viewBox={`0 0 ${LW} ${LH}`} aria-hidden="true">
      {/* hidden probes: the words' widths, for the bubbles */}
      <g ref={probes} visibility="hidden">
        {copy.questions.map((q, i) => (
          <text key={i} className="mk-hand is-q">
            {q}
          </text>
        ))}
        <text className="mk-hand is-big">{copy.done}</text>
        <text className="mk-hand is-small">{copy.email}</text>
      </g>
      {/* the agent */}
      <path className="mk-main" d={loop(ax, ay, 25, 5)} {...drawn(agent)} />
      <path
        className="mk-mid"
        d={`M${ax - 30} ${ay + 2} C${ax - 33} ${ay - 46} ${ax + 33} ${ay - 46} ${ax + 30} ${ay + 2}`}
        {...drawn(headset)}
      />
      {headset > 0.6 && (
        <g opacity={f(clamp01((headset - 0.6) / 0.4))}>
          <path className="mk-mid" d={rrect(ax - 36, ay - 8, 11, 20, 5, 4)} />
          <path className="mk-mid" d={rrect(ax + 25, ay - 8, 11, 20, 5, 6)} />
          <path className="mk-thin" d={`M${ax + 31} ${ay + 12} Q${ax + 31} ${ay + 27} ${ax + 14} ${ay + 26}`} />
          <circle className="mk-dot" cx={ax + 12} cy={ay + 26} r={3.2} />
        </g>
      )}
      {agent > 0.5 && (
        <g opacity={f(clamp01((agent - 0.5) * 2))}>
          <circle className="mk-dot" cx={ax - 9} cy={ay - 4} r={2.4} />
          <circle className="mk-dot" cx={ax + 8} cy={ay - 4} r={2.4} />
          {/* a smile, that opens as it talks */}
          <path
            className="mk-thin"
            d={
              `M${ax - 8} ${ay + 8} Q${ax} ${f(ay + 15 + 6 * talk)} ${ax + 8} ${ay + 8}` +
              (talk > 0.08 ? ` Q${ax} ${f(ay + 10 - 1.5 * talk)} ${ax - 8} ${ay + 8}` : "")
            }
          />
        </g>
      )}

      {/* the support email: it stays empty */}
      <g
        transform={`rotate(${f(5 * hump(shake) * Math.sin(shake * Math.PI * 4))} ${ENV.x} ${ENV.y + ENV.h / 2})`}
      >
        <path className="mk-main" d={rrect(ex, ey, ENV.w, ENV.h, 8, 7)} {...drawn(env)} />
        {/* open: the pocket's seams show under the lifted flap */}
        {open > 0.02 && (
          <path
            className="mk-thin"
            d={`M${ex + 5} ${ey + 4} L${ENV.x} ${f(ey + ENV.h * 0.5)} L${ex + ENV.w - 5} ${ey + 4}`}
            opacity={f(clamp01(open * 2))}
          />
        )}
        <path
          className="mk-mid"
          d={`M${ex + 4} ${ey + 3} L${ENV.x} ${f(flapY)} L${ex + ENV.w - 4} ${ey + 3}`}
          {...drawn(kept ? 1 : easeOut(span(t, 420, 800)))}
        />
      </g>
      <Hand k={kept ? 1 : writing(copy.email, t, 600)} x={emailX} y={ENV.y + ENV.h / 2 + 30} textAnchor="middle" className="is-small">
        {copy.email}
      </Hand>

      {/* the voice, rippling out to each question */}
      {QUESTIONS.map((_, i) => {
        const tgt = bubbleAt(i, bubbleW(i), Math.min(t, convertAt(i)));
        return <Voice key={`v${i}`} t={t} from={answerAt(i)} to={[tgt.x, tgt.y]} />;
      })}

      {/* the questions: written in a bubble, answered, a check settling in the row */}
      {QUESTIONS.map((q, i) => {
        const pop = span(t, q.at, q.at + 440);
        if (pop <= 0) return null;
        const text = copy.questions[i] ?? "";
        const W = bubbleW(i);
        const b = bubbleAt(i, W, t);
        const kc = span(t, convertAt(i), convertAt(i) + CONVERT_MS);
        const m = easeInOut(kc);
        const shrink = easeInOut(span(kc, 0.08, 0.55));
        const w = mix(W, SLOT_W, shrink);
        const h = mix(Q_H, SLOT_H, shrink);
        // it hops from where it was answered down into its slot
        const cx = mix(b.x, q.slot, m);
        const cy = mix(b.y, LANE_Y, m) - 34 * hump(kc);
        const tilt = b.tilt * (1 - m);
        const s = spring(pop);
        // landing squash
        const land = hump(span(t, convertAt(i) + CONVERT_MS * 0.85, convertAt(i) + CONVERT_MS + 260));
        const sx = s * (1 + 0.14 * land);
        const sy = s * (1 - 0.2 * land);
        const x0 = cx - w / 2;
        const y0 = cy - h / 2;
        const tail = `M${f(x0 + 15)} ${f(y0 + h)} L${f(x0 + 9)} ${f(y0 + h + 9)} L${f(x0 + 25)} ${f(y0 + h)}`;
        const check = easeOut(span(kc, 0.35, 0.85));
        // a ticket in the making: speed lines while it flies
        const speed = q.ticket && t < CATCH_AT ? clamp01(b.fly * 3) * (1 - kc) : 0;
        return (
          <g
            key={`q${i}`}
            transform={
              `translate(${f(x0 + 15)} ${f(y0 + h + 9)}) rotate(${f(tilt)}) scale(${f(sx)} ${f(sy)}) ` +
              `translate(${f(-(x0 + 15))} ${f(-(y0 + h + 9))})`
            }
          >
            {speed > 0.02 && (
              <g opacity={f(speed)}>
                <path className="mk-thin" d={`M${f(x0 - 10)} ${f(y0 + 6)} l-22 -14`} />
                <path className="mk-thin" d={`M${f(x0 - 12)} ${f(y0 + h - 8)} l-28 -16`} />
              </g>
            )}
            <path className="mk-mid" d={`${rrect(x0, y0, w, h, Math.min(14, h / 2), 20 + i)} ${tail}`} />
            {kc < 0.25 && (
              <g opacity={f(1 - kc / 0.25)}>
                <Hand k={pen(span(t, q.at + 100, q.at + 100 + Q_WRITE))} x={cx} y={cy + 8} textAnchor="middle" className="is-q">
                  {text}
                </Hand>
              </g>
            )}
            <path
              className="mk-mid"
              d={`M${f(cx - 10)} ${f(cy + 1)} L${f(cx - 3)} ${f(cy + 8)} L${f(cx + 11)} ${f(cy - 8)}`}
              {...drawn(check)}
            />
          </g>
        );
      })}

      {/* answered on the spot */}
      <Hand k={writing(copy.done, t, DONE_AT)} x={doneX} y={doneY} textAnchor="middle" className="is-big">
        {copy.done}
      </Hand>
      <Sparkle x={doneX + doneW / 2 + 18} y={doneY - 30} k={span(t, DONE_AT + 520, DONE_AT + 900)} />
      <Sparkle x={doneX - doneW / 2 - 18} y={doneY - 14} k={span(t, DONE_AT + 640, DONE_AT + 1020)} size={8} spin={45} />
    </svg>
  );
};

const LiveFrame = ({
  className,
  copy,
  children,
  rewinding,
  frameRef,
}: {
  className?: string;
  copy: LiveCopy;
  children: ReactNode;
  rewinding: boolean;
  frameRef?: Ref<HTMLDivElement>;
}) => (
  <div ref={frameRef} role="img" aria-label={`${copy.label}: ${copy.done}`} className={cn("bzl-live bzl-mk", className)}>
    {children}
    {/* ◀◀ while it rewinds */}
    <RewindMark on={rewinding} />
  </div>
);

/** On its own clock: plays when it comes into view, holds the end, rewinds, plays again. */
const SupportLiveLoop = ({ className }: { className?: string }) => {
  const copy = useMessages().landing.support.live;
  const ref = useRef<HTMLDivElement>(null);
  const { t, rewinding, cycle } = useRewindLoop(ref, { duration: LIVE_MS, hold: 2600, rewind: 900, rest: 450, threshold: 0.45, tick: 0 });
  return (
    <LiveFrame className={className} copy={copy} rewinding={rewinding} frameRef={ref}>
      <SupportLiveDrawing t={t} copy={copy} kept={cycle > 1 || rewinding} />
    </LiveFrame>
  );
};

/**
 * Support's moment, "questions answered live" (see SupportLiveDrawing). Left
 * alone it runs its own rewind loop; given `t` (ms along LIVE_MS, e.g. from
 * the pinned section's scroll) it just shows that frame.
 */
export const SupportLive = ({ className, t, rewinding = false }: { className?: string; t?: number; rewinding?: boolean }) => {
  const copy = useMessages().landing.support.live;
  if (t === undefined) return <SupportLiveLoop className={className} />;
  return (
    <LiveFrame className={className} copy={copy} rewinding={rewinding}>
      <SupportLiveDrawing t={t} copy={copy} kept={false} />
    </LiveFrame>
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
