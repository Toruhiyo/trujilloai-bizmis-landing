import { useRef } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { RewindMark } from "./RewindSign";
import { span, useRewindLoop } from "./useRewindLoop";
import { useNow } from "./sales/hooks";
import {
  Flip,
  Hand,
  Sparkle,
  clamp01,
  drawn,
  easeInOut,
  easeOut,
  f,
  hand,
  loop,
  mix,
  rrect,
  spring,
  useProbeWidths,
} from "./PillarMoments";

/**
 * Store Insights' drawing: ONE insight for the merchant, in the Sales
 * funnel's marker (the band's marker ink, the Bizmis primary), no boxed
 * tags. A crowd of abandoned carts, a "?" over each; a magnifier draws in
 * and takes them all in, and what was missing lights up in its lens, a
 * different reason each replay (a size guide's ruler first). The label: the
 * loss ("Why no sale?") written, struck at the turn (FIX_AT), then the
 * reason found written and ticked. CLARITY_MS long, on the section's clocks:
 * the pinned section's scroll, else its own rewind loop.
 */

/** The drawing's length (ms): the section's pinned track and its own loop. */
export const CLARITY_MS = 4750;

const CW = 480;
const CH = 240;
const FIX_AT = 2300; // the turn: the loss struck, the insight coming in

type Copy = { label: string; problem: string; solution: string };
/** A drawing's frame: `t` along CLARITY_MS, whether it has drawn in once, how many times it has replayed, and `now`, real time (ms) for what stays alive at rest. */
type Props = { t: number; kept: boolean; replay: number; now: number };

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

/* ── Why: many sessions, one clear reason ───────────────────────────────── */

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

/**
 * The lens' "aha": short rays out of its rim, drawn in as `k` goes 0 → 1.
 * Once drawn they pulse on `now` (real time; `pulse` 0 → 1 easing it in),
 * each in turn, reaching out and back, so the found reason never sits frozen while it holds.
 */
const LensRays = ({ x, y, r, k, now = 0, pulse = 0 }: { x: number; y: number; r: number; k: number; now?: number; pulse?: number }) => (
  <>
    {[-2.5, -2.05, -1.57, -1.09, -0.64].map((a, j) => {
      const beat = now ? pulse * (0.5 + 0.5 * Math.sin(now / 240 - j * 0.9)) : 0;
      const r0 = r + 9 + 2 * beat;
      const r1 = r + 19 + 7 * beat;
      return (
        <path
          key={j}
          className="mk-thin"
          d={`M${f(x + Math.cos(a) * r0)} ${f(y + Math.sin(a) * r0)} L${f(x + Math.cos(a) * r1)} ${f(y + Math.sin(a) * r1)}`}
          {...drawn(clamp01(k * 2 - j * 0.2))}
          opacity={k > 0 ? f(1 - 0.35 * beat) : 0}
        />
      );
    })}
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
 * What the lens finds got in the way of the sale, as a session replay shows
 * it: one a replay, in the order of landing.insights.options.why.reasons. A
 * pop-up over the Add to cart button; a search bar with nothing under it;
 * the shipping (a truck) showing up too late; a slow page (an hourglass); a
 * coupon sending them off to hunt for codes. Each pops in as `k` goes 0 → 1.
 */
export const REASONS = 5;
const Reason = ({ c, k }: { c: number; k: number }) => {
  if (k <= 0) return null;
  const s = spring(k);
  const d = (j: number) => drawn(clamp01(k * 2.2 - j * 0.25));
  return (
    <g transform={`rotate(${f(-8 * (1 - s))}) scale(${f(s)})`}>
      {c === 0 && (
        <g>
          {/* the Add to cart button, peeking out from under the pop-up */}
          <path className="mk-mid mk-white" d={rrect(-20, 12, 40, 14, 7, 3)} />
          <path className="mk-main mk-white" d={rrect(-28, -26, 50, 40, 5, 6)} />
          <path className="mk-mid" d="M10 -18 L17 -11 M17 -18 L10 -11" {...d(1)} />
          <path className="mk-thin" d="M-20 -10 H2 M-20 0 H-4" {...d(2)} />
        </g>
      )}
      {c === 1 && (
        <g>
          {/* a search bar, and nothing found under it */}
          <path className="mk-mid mk-white" d={rrect(-32, -22, 64, 20, 10, 2)} />
          <path className="mk-thin" d={`${loop(-19, -12, 5, 1)} M-15 -8 L-11 -4`} />
          <path className="mk-thin" d="M-4 -12 H20" {...d(1)} />
          <path className="mk-thin" d={rrect(-26, 6, 52, 22, 5, 4)} style={{ strokeDasharray: "5 6" }} opacity={f(clamp01(k * 2 - 0.6))} />
        </g>
      )}
      {c === 2 && (
        <g transform="translate(1 -3)">
          {/* the shipping, a truck, only at the end */}
          <path className="mk-mid mk-white" d={rrect(-30, -16, 34, 26, 4, 2)} />
          <path className="mk-mid mk-white" d="M4 -6 H17 L28 5 V10 H4 Z" />
          <path className="mk-thin" d="M10 -1 H16 L21 4" {...d(1)} />
          <circle className="mk-mid mk-white" cx={-18} cy={14} r={5.5} />
          <circle className="mk-mid mk-white" cx={16} cy={14} r={5.5} />
        </g>
      )}
      {c === 3 && (
        <g>
          {/* a slow page: an hourglass */}
          <path className="mk-main" d="M-16 -26 H16 M-16 26 H16" />
          <path className="mk-mid" d="M-12 -26 C-12 -8 -3 -6 -3 0 C-3 6 -12 8 -12 26 M12 -26 C12 -8 3 -6 3 0 C3 6 12 8 12 26" {...d(0)} />
          <path className="mk-thin" d="M-7 21 Q0 12 7 21 M0 2 V12" {...d(2)} />
        </g>
      )}
      {c === 4 && (
        <g>
          {/* a coupon to hunt for */}
          <path className="mk-mid mk-white" d="M-30 -16 H30 V-6 A6 6 0 0 0 30 6 V16 H-30 V6 A6 6 0 0 0 -30 -6 Z" />
          <path className="mk-thin" d="M-12 -12 V12" style={{ strokeDasharray: "4 5" }} />
          <text className="mk-hand" x={9} y={9} textAnchor="middle" style={{ clipPath: k >= 1 ? undefined : `inset(0 ${f((1 - clamp01(k * 1.5)) * 100)}% 0 0)` }}>
            %
          </text>
        </g>
      )}
    </g>
  );
};

const WhyDrawing = ({ t, replay, now }: Props) => {
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
      <LensRays x={lx} y={ly} r={lr} k={rays} now={now} pulse={span(t, FIX_AT + 950, FIX_AT + 1500)} />
      <Sparkle x={lx + lr + 30} y={ly - lr + 6} k={span(t, FIX_AT + 1500, FIX_AT + 1850)} size={8} />
      <Sparkle x={lx - lr - 28} y={ly - lr + 18} k={span(t, FIX_AT + 1650, FIX_AT + 2000)} size={6} spin={20} />
    </>
  );
};

/**
 * Store Insights' drawing. Given `t` (ms along CLARITY_MS, the pinned
 * section's scroll) it shows that frame, `replay` the times that clock came
 * back round; else it runs its own rewind loop.
 */
export const InsightsDrawing = ({
  className,
  t: at,
  replay: replayAt,
  rewinding: rewindingAt = false,
  active = false,
}: {
  className?: string;
  t?: number;
  replay?: number;
  rewinding?: boolean;
  /** On screen on the section's clock: what stays alive at rest (the lens' rays pulsing) runs. */
  active?: boolean;
}) => {
  const why = useMessages().landing.insights.options.why;
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
  // real time, only once the reason is found (the rays pulsing through the hold)
  const now = useNow(active && t >= FIX_AT + 950);
  // drawn in once; from then on the scenery stays, so a replay never starts blank
  const played = useRef(false);
  if (t >= 600) played.current = true;
  const copy: Copy = { label: why.label, problem: why.problem, solution: why.reasons[replay % why.reasons.length] };
  return (
    <div ref={ref} role="img" aria-label={copy.label} className={cn("bzl-clarity bzl-mk", className)}>
      <svg viewBox={`0 0 ${CW} ${CH}`} aria-hidden="true">
        <WhyDrawing t={t} kept={played.current} replay={replay} now={now} />
        <Label t={t} copy={copy} />
      </svg>
      <RewindMark on={rewinding} />
    </div>
  );
};
