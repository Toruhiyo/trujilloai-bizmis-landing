import { useRef } from "react";
import type { ReactNode } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { RewindMark } from "./RewindSign";
import { span, useRewindLoop } from "./useRewindLoop";
import {
  Ask,
  CLARITY_MS,
  Flip,
  InsightsClarity,
  Hand,
  Sparkle,
  clamp01,
  drawn,
  easeInOut,
  easeOut,
  f,
  hand,
  hump,
  loop,
  mix,
  rrect,
  spring,
  useProbeWidths,
} from "./PillarMoments";
import type { DrawOption } from "./drawOptions";

/**
 * Store Insights' drawings: Why (1) by default, a different reason found
 * each replay; the other options by ?insights=2|3, the one shipped before
 * them (PillarMoments' InsightsClarity) by ?insights=old.
 * Each one is ONE insight for the merchant, in the Sales funnel's marker
 * (the band's marker ink, the Bizmis primary), no boxed tags: a loss
 * written, struck at the turn (FIX_AT), then the win written and ticked. As
 * long as InsightsClarity (CLARITY_MS), on the same clocks: the pinned
 * section's scroll, else its own rewind loop.
 *
 * 1 Why: a crowd of abandoned carts, a "?" over each; a magnifier draws in
 *   and takes them all in, and what was missing lights up in its lens (a
 *   size guide's ruler). Why no sale? Missing: size guide.
 * 2 Carts (1 and 3 together): a week of abandoned carts stacking up day by
 *   day; the magnifier runs along the week taking them in, then comes up
 *   with the one reason in its lens. Carts left all week. The reason: sizes.
 * 3 Week: a week of questions stacking up day by day, too many to read; they
 *   sort into one picture: what shoppers want, each want growing with the
 *   questions it gets, the biggest circled.
 */

const CW = 480;
const CH = 240;
const FIX_AT = 2300; // the turn: the loss struck, the insight coming in

type Copy = { label: string; problem: string; solution: string };
/** A drawing's frame: `t` along CLARITY_MS, whether it has drawn in once, and how many times it has replayed. */
type Props = { t: number; kept: boolean; replay: number };

/** The label: the loss, struck at the turn, then the win, fitted to the drawing's width. */
const Label = ({ t, copy }: { t: number; copy: Copy }) => {
  const [widths, probes] = useProbeWidths([copy.problem, copy.solution].join("|"));
  return (
    <>
      <g ref={probes} visibility="hidden">
        <text className="mk-hand is-label">{copy.problem}</text>
        <text className="mk-hand is-label">{copy.solution}</text>
      </g>
      <Flip
        x={CW / 2}
        y={38}
        room={CW - 20}
        problem={copy.problem}
        solution={copy.solution}
        wp={widths[0] ?? copy.problem.length * 12}
        ws={widths[1] ?? copy.solution.length * 12}
        t={t}
        writeAt={300}
        strikeAt={FIX_AT}
      />
    </>
  );
};

/* ── 1 Why: many sessions, one clear reason ───────────────────────────────── */

const WH_CARTS = [
  [48, 92], [118, 132], [40, 168], [96, 206], [160, 214], [154, 84], [332, 78],
  [420, 86], [356, 128], [440, 138], [322, 206], [394, 176], [448, 214], [24, 228],
] as const;
const WH_LENS = { x: 240, y: 146, r: 50 };

/** An abandoned cart, a "?" over it. */
const Cart = ({ t, i, q = true }: { t: number; i: number; q?: boolean }) => (
  <g>
    <path className="mk-mid" d="M-20 -14 H-14 L-9 6 H12 L17 -8 H-12" />
    <circle className="mk-dot" cx={-5} cy={13} r={3} />
    <circle className="mk-dot" cx={9} cy={13} r={3} />
    {q && (
      <Hand k={1} x={2} y={-22 + Math.sin(t / 380 + i) * 1.5} textAnchor="middle" className="is-small">
        ?
      </Hand>
    )}
  </g>
);

/** What was missing: a size guide's ruler, drawn in as `k` goes 0 → 1, tilted. */
const Ruler = ({ k, w = 64 }: { k: number; w?: number }) => {
  if (k <= 0) return null;
  const s = spring(k);
  const n = 7;
  return (
    <g transform={`rotate(-24) scale(${f(s)})`}>
      <path className="mk-mid mk-white" d={rrect(-w / 2, -10, w, 20, 3, 8)} />
      {Array.from({ length: n }, (_, j) => {
        const x = -w / 2 + ((j + 1) * w) / (n + 1);
        return <path key={j} className="mk-thin" d={`M${f(x)} -10 V${j % 2 ? -3 : 1}`} {...drawn(clamp01(k * 2.5 - j * 0.15))} />;
      })}
    </g>
  );
};

/** The lens' "aha": short rays out of its rim, drawn in as `k` goes 0 → 1. */
const LensRays = ({ x, y, r, k }: { x: number; y: number; r: number; k: number }) => (
  <>
    {[-2.5, -2.05, -1.57, -1.09, -0.64].map((a, j) => (
      <path
        key={j}
        className="mk-thin"
        d={`M${f(x + Math.cos(a) * (r + 9))} ${f(y + Math.sin(a) * (r + 9))} L${f(x + Math.cos(a) * (r + 19))} ${f(y + Math.sin(a) * (r + 19))}`}
        {...drawn(clamp01(k * 2 - j * 0.2))}
      />
    ))}
  </>
);

/** The magnifier: its glass (white inside, hiding what it took in), its rim and its handle. */
const Magnifier = ({ x, y, r, k, handle }: { x: number; y: number; r: number; k: number; handle: number }) => (
  <>
    <circle className="mk-white" cx={x} cy={y} r={r - 2} style={{ stroke: "none" }} opacity={f(k)} />
    <path className="mk-main" d={loop(x, y, r, 7)} {...drawn(k)} />
    <path className="mk-main is-heavy" d={`M${f(x + r * 0.72)} ${f(y + r * 0.72)} L${f(x + r * 1.3)} ${f(y + r * 1.3)}`} {...drawn(handle)} />
  </>
);

/**
 * The reasons the lens finds, one a replay, in the order of
 * landing.insights.options.why.reasons: the size guide (a ruler), the
 * shipping cost (a truck), the delivery time (a calendar), the returns
 * policy (a return arrow). Each pops in as `k` goes 0 → 1.
 */
export const REASONS = 4;
const Reason = ({ c, k }: { c: number; k: number }) => {
  if (k <= 0) return null;
  if (c === 0) return <Ruler k={k} />;
  const s = spring(k);
  const d = (j: number) => drawn(clamp01(k * 2.2 - j * 0.25));
  return (
    <g transform={`rotate(${f(-8 * (1 - s))}) scale(${f(s)})`}>
      {c === 1 && (
        <g transform="translate(1 -3)">
          <path className="mk-mid mk-white" d={rrect(-30, -16, 34, 26, 4, 2)} />
          <path className="mk-mid mk-white" d="M4 -6 H17 L28 5 V10 H4 Z" />
          <path className="mk-thin" d="M10 -1 H16 L21 4" {...d(1)} />
          <circle className="mk-mid mk-white" cx={-18} cy={14} r={5.5} />
          <circle className="mk-mid mk-white" cx={16} cy={14} r={5.5} />
        </g>
      )}
      {c === 2 && (
        <g transform="translate(0 1)">
          <path className="mk-mid mk-white" d={rrect(-24, -20, 48, 42, 6, 4)} />
          <path className="mk-thin" d="M-24 -8 H24" {...d(1)} />
          <path className="mk-mid" d="M-12 -26 V-14 M12 -26 V-14" />
          {[-12, 0, 12].flatMap((x, i) =>
            [2, 13].map((y, j) => <circle key={`${i}${j}`} className="mk-dot" cx={x} cy={y} r={2.3} opacity={f(clamp01(k * 3 - i * 0.3 - j * 0.2))} />),
          )}
          <path className="mk-thin" d={loop(12, 13, 7, 2)} {...d(3)} />
        </g>
      )}
      {c === 3 && (
        <g transform="translate(2 -8)">
          <path className="mk-main" d="M-20 -8 H6 A15 15 0 0 1 6 22 H-10" {...d(0)} />
          <path className="mk-main" d="M-2 14 L-10 22 L-2 30" {...d(2)} />
        </g>
      )}
    </g>
  );
};

const WhyDrawing = ({ t, replay }: Props) => {
  const lens = easeOut(span(t, 1250, 1650));
  const handle = easeOut(span(t, 1550, 1750));
  const found = span(t, FIX_AT + 120, FIX_AT + 620);
  const rays = span(t, FIX_AT + 600, FIX_AT + 950);
  const { x: lx, y: ly, r: lr } = WH_LENS;
  return (
    <>
      {/* the sessions that ended without a sale: a crowd of carts left behind */}
      {WH_CARTS.map(([x, y], i) => {
        const kIn = span(t, 100 + i * 70, 440 + i * 70);
        if (kIn <= 0) return null;
        const fly = easeInOut(span(t, 1600 + i * 40, 2150 + i * 40));
        if (fly >= 1) return null;
        const sway = Math.sin(t / 520 + i * 1.3) * 2 * (1 - fly);
        const tx = mix(x, lx, fly) + sway;
        const ty = mix(y, ly, fly);
        const s = 0.8 * spring(kIn) * (1 - 0.75 * fly);
        return (
          <g key={i} transform={`translate(${f(tx)} ${f(ty)}) rotate(${f(hand(i, 3) * 8 + sway)}) scale(${f(s)})`} opacity={f(1 - span(fly, 0.75, 1))}>
            <Cart t={t} i={i} />
          </g>
        );
      })}
      {/* looked into at once: a magnifier; what was missing (this replay's reason), lit up in its lens */}
      <Magnifier x={lx} y={ly} r={lr} k={lens} handle={handle} />
      <g transform={`translate(${lx} ${ly})`}>
        <Reason c={replay % REASONS} k={found} />
      </g>
      <LensRays x={lx} y={ly} r={lr} k={rays} />
      <Sparkle x={lx + lr + 30} y={ly - lr + 6} k={span(t, FIX_AT + 1500, FIX_AT + 1850)} size={8} />
      <Sparkle x={lx - lr - 28} y={ly - lr + 18} k={span(t, FIX_AT + 1650, FIX_AT + 2000)} size={6} spin={20} />
    </>
  );
};

/* ── 2 Carts: a week of abandoned carts, one reason ───────────────────────── */

const CA_BASE = 220;
const CA_DAYS = Array.from({ length: 7 }, (_, i) => 72 + i * 56);
const CA_COUNTS = [2, 1, 2, 3, 2, 2, 3];
const caCarts = CA_COUNTS.flatMap((n, d) => Array.from({ length: n }, (_, j) => ({ d, j })));
const CA_SWEEP = [1450, FIX_AT - 120]; // the magnifier running along the week
const CA_LENS = { y: 146, r: 34 };
const CA_END = { x: 240, y: 136, r: 50 };

const CartsDrawing = ({ t, kept }: Props) => {
  const base = kept ? 1 : easeOut(span(t, 0, 500));
  const lens = easeOut(span(t, 1150, 1500));
  const handle = easeOut(span(t, 1400, 1600));
  const x0 = CA_DAYS[0] - 8;
  const x1 = CA_DAYS[6] + 8;
  const sweep = easeInOut(span(t, CA_SWEEP[0], CA_SWEEP[1]));
  const up = easeInOut(span(t, FIX_AT, FIX_AT + 420));
  const lx = mix(mix(x0, x1, sweep), CA_END.x, up);
  const ly = mix(CA_LENS.y, CA_END.y, up) - 6 * hump(up);
  const lr = mix(CA_LENS.r, CA_END.r, up);
  // when the magnifier passes a day
  const passAt = (x: number) => mix(CA_SWEEP[0], CA_SWEEP[1], clamp01((x - x0) / (x1 - x0)));
  const found = span(t, FIX_AT + 380, FIX_AT + 860);
  const rays = span(t, FIX_AT + 820, FIX_AT + 1150);
  return (
    <>
      {/* the week: a line, a tick a day */}
      <path className="mk-mid" d={`M36 ${CA_BASE} H444`} {...drawn(base)} />
      {CA_DAYS.map((x, i) => (
        <path key={`d${i}`} className="mk-thin" d={`M${x} ${CA_BASE - 6} V${CA_BASE + 6}`} opacity={f(clamp01(base * 7 - i))} />
      ))}
      {/* the carts left, day by day; taken in as the magnifier passes */}
      {caCarts.map(({ d, j }, n) => {
        const at = 140 + d * 170 + j * 70;
        const kIn = span(t, at, at + 340);
        if (kIn <= 0) return null;
        const x = CA_DAYS[d] + hand(n, 1) * 5;
        const y = CA_BASE - 22 - j * 30;
        const p = passAt(x);
        const fly = easeInOut(span(t, p - 120, p + 200));
        if (fly >= 1) return null;
        const s = 0.68 * spring(kIn) * (1 - 0.7 * fly);
        return (
          <g
            key={n}
            transform={`translate(${f(mix(x, lx, fly))} ${f(mix(y, ly, fly))}) rotate(${f(hand(n, 3) * 7)}) scale(${f(s)})`}
            opacity={f(1 - span(fly, 0.7, 1))}
          >
            <Cart t={t} i={n} />
          </g>
        );
      })}
      {/* the magnifier, along the week and up with the reason in its lens */}
      <Magnifier x={lx} y={ly} r={lr} k={lens} handle={handle} />
      <g transform={`translate(${f(lx)} ${f(ly)})`}>
        <Ruler k={found} />
      </g>
      <LensRays x={lx} y={ly} r={lr} k={rays} />
      <Sparkle x={CA_END.x + CA_END.r + 30} y={CA_END.y - CA_END.r + 6} k={span(t, FIX_AT + 1550, FIX_AT + 1900)} size={8} />
      <Sparkle x={CA_END.x - CA_END.r - 28} y={CA_END.y - CA_END.r + 18} k={span(t, FIX_AT + 1700, FIX_AT + 2050)} size={6} spin={20} />
    </>
  );
};

/* ── 3 Week: a week of questions, one picture of what shoppers want ──────── */

const WK_BASE = 216;
const WK_DAYS = Array.from({ length: 7 }, (_, i) => 72 + i * 56);
const WK_COUNTS = [4, 3, 5, 4, 5, 6, 4];
const WK_ICONS = [
  { x: 150, y: 128, s: 1.3 },
  { x: 274, y: 140, s: 1 },
  { x: 374, y: 152, s: 0.72 },
];
const wkBubbles = WK_COUNTS.flatMap((n, i) => Array.from({ length: n }, (_, j) => ({ i, j })));
/** What a question is about: mostly the first want (shipping), then sizes, then gifts. */
const wkCat = (n: number) => ([0, 1, 0, 2, 0, 1, 0][n % 7]);

/** The wants, drawn: a parcel, a shirt, a gift. */
const Want = ({ c }: { c: number }) =>
  c === 0 ? (
    <g>
      <path className="mk-mid mk-white" d={rrect(-26, -16, 52, 38, 4, 3)} />
      <path className="mk-mid" d="M-26 -16 L-18 -28 H18 L26 -16" />
      <path className="mk-thin" d="M-5 -28 L-6 -16 V-4 H6 V-16 L5 -28" />
    </g>
  ) : c === 1 ? (
    <path className="mk-mid mk-white" d="M-9 -24 Q0 -16 9 -24 L26 -15 L20 -1 L13 -5 V24 H-13 V-5 L-20 -1 L-26 -15 Z" />
  ) : (
    <g>
      <path className="mk-mid mk-white" d={rrect(-20, -6, 40, 28, 4, 5)} />
      <path className="mk-mid mk-white" d={rrect(-24, -16, 48, 10, 3, 6)} />
      <path className="mk-thin" d="M0 -16 V22" />
      <path className="mk-thin" d="M0 -16 C-12 -30 -20 -18 0 -16 C12 -30 20 -18 0 -16" />
    </g>
  );

const WeekDrawing = ({ t, kept }: Props) => {
  const base = kept ? 1 : easeOut(span(t, 0, 500));
  const circle = easeOut(span(t, FIX_AT + 1000, FIX_AT + 1450));
  const flyOf = (n: number) => easeInOut(span(t, FIX_AT - 80 + n * 15, FIX_AT + 420 + n * 15));
  // each want grows with the questions it takes in (all in: its full size)
  const got = [0, 0, 0];
  const all = [0, 0, 0];
  wkBubbles.forEach((_, n) => {
    all[wkCat(n)] += 1;
    got[wkCat(n)] += span(flyOf(n), 0.75, 1);
  });
  return (
    <>
      {/* the week: a line, a tick a day */}
      <path className="mk-mid" d={`M36 ${WK_BASE} H444`} {...drawn(base)} />
      {WK_DAYS.map((x, i) => (
        <path key={`d${i}`} className="mk-thin" d={`M${x} ${WK_BASE - 6} V${WK_BASE + 6}`} opacity={f(clamp01(base * 7 - i))} />
      ))}
      {/* the wants, each as big as the questions it got */}
      {WK_ICONS.map(({ x, y, s }, c) => {
        const k = span(t, FIX_AT + 60 + c * 90, FIX_AT + 420 + c * 90);
        if (k <= 0) return null;
        const grow = s * (0.4 + 0.6 * (got[c] / all[c])) * spring(k);
        const gulp = 1 + 0.08 * Math.sin((got[c] * Math.PI) % Math.PI);
        return (
          <g key={`w${c}`} transform={`translate(${x} ${y}) scale(${f(grow * gulp)} ${f(grow / gulp)})`}>
            <Want c={c} />
          </g>
        );
      })}
      {/* the questions, a stack a day, too many to read; then sorted into the wants */}
      {wkBubbles.map(({ i, j }, n) => {
        const at = 120 + i * 220 + j * 55;
        const kIn = span(t, at, at + 320);
        if (kIn <= 0) return null;
        const fly = flyOf(n);
        if (fly >= 1) return null;
        const h = WK_COUNTS[i];
        const sway = Math.sin(t / 300 + i) * (j / Math.max(1, h - 1)) * 4 * (1 - fly);
        const sx = WK_DAYS[i] + hand(n, 1) * 4 + sway;
        const sy = WK_BASE - 20 - j * 18;
        const dst = WK_ICONS[wkCat(n)];
        const tx = mix(sx, dst.x, fly);
        const ty = mix(sy, dst.y, fly) - 26 * hump(fly);
        return (
          <g key={n} opacity={f(1 - span(fly, 0.7, 1))}>
            <Ask x={tx} y={ty} s={0.66 * spring(kIn) * (1 - 0.6 * fly)} />
          </g>
        );
      })}
      {/* the biggest want, circled */}
      <path className="mk-mid" d={loop(WK_ICONS[0].x, WK_ICONS[0].y - 2, 54, 3)} {...drawn(circle)} />
      <Sparkle x={WK_ICONS[0].x + 60} y={WK_ICONS[0].y - 52} k={span(t, FIX_AT + 1400, FIX_AT + 1750)} size={8} />
      <Sparkle x={WK_ICONS[0].x - 62} y={WK_ICONS[0].y - 40} k={span(t, FIX_AT + 1550, FIX_AT + 1900)} size={6} spin={20} />
    </>
  );
};

const DRAWINGS: Record<Exclude<DrawOption, "old">, { key: "why" | "carts" | "week"; Drawing: (p: Props) => ReactNode }> = {
  default: { key: "why", Drawing: WhyDrawing },
  1: { key: "why", Drawing: WhyDrawing },
  2: { key: "carts", Drawing: CartsDrawing },
  3: { key: "week", Drawing: WeekDrawing },
};

/**
 * Store Insights' drawing, the option picked by ?insights= (none: Why, a new
 * reason each replay; "old": InsightsClarity). Given `t` (ms along
 * CLARITY_MS, the pinned section's scroll) it shows that frame, `replay` the
 * times that clock came back round; else it runs its own rewind loop.
 */
export const InsightsDrawing = ({
  option,
  className,
  t: at,
  replay,
  rewinding: rewindingAt = false,
}: {
  option: DrawOption;
  className?: string;
  t?: number;
  replay?: number;
  rewinding?: boolean;
}) => {
  if (option === "old") return <InsightsClarity className={className} t={at} rewinding={rewindingAt} />;
  return <InsightsOption option={option} className={className} t={at} replay={replay} rewinding={rewindingAt} />;
};

const InsightsOption = ({
  option,
  className,
  t: at,
  replay: replayAt,
  rewinding: rewindingAt,
}: {
  option: Exclude<DrawOption, "old">;
  className?: string;
  t?: number;
  replay?: number;
  rewinding: boolean;
}) => {
  const options = useMessages().landing.insights.options;
  const ref = useRef<HTMLDivElement>(null);
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
  const replay = Math.max(0, at !== undefined ? (replayAt ?? 0) : own.cycle - 1);
  // drawn in once; from then on the scenery stays, so a replay never starts blank
  const played = useRef(false);
  if (t >= 600) played.current = true;
  // (guarded: an unknown option falls back to the default drawing)
  const { key, Drawing } = DRAWINGS[option] ?? DRAWINGS[1];
  const why = options.why;
  const copy: Copy =
    key === "why" ? { label: why.label, problem: why.problem, solution: why.reasons[replay % why.reasons.length] } : options[key];
  return (
    <div ref={ref} role="img" aria-label={copy.label} className={cn("bzl-clarity bzl-mk", className)}>
      <svg viewBox={`0 0 ${CW} ${CH}`} aria-hidden="true">
        <Drawing t={t} kept={played.current} replay={replay} />
        <Label t={t} copy={copy} />
      </svg>
      <RewindMark on={rewinding} />
    </div>
  );
};
