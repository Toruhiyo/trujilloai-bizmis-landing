import { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import BeatCopy from "./BeatCopy";
import { arrLook, endsLook, openerLook, useBeatStyle } from "./beatcopy/style";
import { arrange, arrangeOpener } from "./arrange";
import type { EndsLook } from "./beatcopy/style";
import FunnelFlow, { funnelAnchors } from "./funnel/FunnelFlow";
import FunnelScale from "./funnel/FunnelScale";
import { ksAt, startsFor } from "./funnel/model";
import { useActivePanel, useMedia, usePinProgress, useRewinding, useScrollPlay, useScrollThrough } from "./hooks";
import Metrics from "./Metrics";
import RewindScreen from "./RewindScreen";
import { useSalesProto } from "./proto";
import SalesPayoff, { PAYOFF_DURATION } from "./SalesPayoff";
import { DEVICE_ASPECT, SalesShell, useBeatTimelines, useSize } from "./SalesShell";
import { Device, PanelCopy } from "./shared";

/**
 * Boost Sales, "the funnel as the spine": the marker funnel of the whole
 * store's visits is the section's big central picture, and each part's one
 * conversation pops out of its own stage like a callout (Find's desktop out
 * of Discovery, Trust's phone out of Decision, Buy's tablet out of
 * Checkout), joined to its chamber by a zoom cone, so the one shopper and
 * the whole store are one drawing. It's one shopper's journey with the
 * store's one agent, who seals each stage's leak as it solves it in the
 * device; the fixes add up (one funnel, never lossless); then the devices
 * fold back into the funnel and it grows for the payoff, its bag filling,
 * with the merchant's metric card beside it turning the right way at each fix.
 *
 * Driven by the scroll's position, not by time: each beat (and the payoff)
 * has its own stretch of the pinned track, and its timeline (typing, the
 * agent's answer, the stage's fix, its solution written and ticked) maps
 * onto that stretch, ending on a hold on the fixed state, so it's always
 * reached; scrolling back rewinds it (the device's screen goes analog, a
 * tape rewinding, and the funnel shows its marker ◀◀ while it does). The visits
 * keep flowing in real time. Phones (and short screens): the beats stack,
 * each funnel with its device hanging off its stage, each mapped to its own
 * scroll through the screen.
 */
const SalesSpine = () => {
  const pin = useMedia("(min-width: 1024px) and (min-height: 640px)");
  return pin ? <Pinned /> : <Stacked />;
};

/** The payoff's stretch of scroll, in beats' stretches; the whole track's. */
const PAYOFF_SPAN = 1.8;
const SPAN = 3 + PAYOFF_SPAN;
/** Of a beat's stretch of scroll: a short lead-in, then its timeline, then a hold on its fixed state. */
const LEAD = 0.05;
const RUN = 0.75;
/** Where a beat is on its timeline (ms), `p` (0 → 1) through its stretch of scroll. */
const timeAt = (p: number, duration: number) => Math.min(1, Math.max(0, (p - LEAD) / RUN)) * duration;

/** How far each stage is fixed (0 → 1) in beat `focus` (3: the payoff) at `t`: for the metrics. */
const fixedAt = (focus: number, t: number, fixAt?: number) => ksAt(t, startsFor(focus, fixAt)).map((v) => Math.min(1, v));

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** The funnel's box, width : height, the payoff's: the beats' funnels keep it too, scaled down to fit under the device. */
const FUNNEL_ASPECT = 2.6;
/** ?beat=9b's funnel (the beats' and the payoff's alike): taller, as it has a column of its own to fill. */
const OPENER_FUNNEL_ASPECT = 2.05;
/** A beat's funnel's height for an H px stage (a little more of it than a flat funnel took, so its narrower box still reads). */
const beatFnH = (H: number) => clamp(H * 0.36, 180, 300);
/** The metric card's height : width (Metrics' card, 168 / 330). */
const CARD_ASPECT = 168 / 330;

/**
 * ?beat=7a..7e: where the words stand on the funnel and how big: over the
 * stage's chamber (medium, big, compact), a banner centred over the whole
 * funnel, or beside the device. `w`: width [share of the stage, min, max];
 * `fs`: font size [share of the stage's width, of its height, min, max].
 */
const ENDS_SPEC: Record<EndsLook | "o", { at: "chamber" | "funnel" | "device"; w: [number, number, number]; fs: [number, number, number, number] }> = {
  a: { at: "chamber", w: [0.4, 360, 540], fs: [0.022, 0.04, 24, 36] },
  b: { at: "chamber", w: [0.52, 460, 740], fs: [0.03, 0.054, 28, 48] },
  c: { at: "chamber", w: [0.27, 280, 390], fs: [0.016, 0.03, 19, 26] },
  d: { at: "funnel", w: [0.66, 560, 900], fs: [0.03, 0.054, 28, 46] },
  e: { at: "device", w: [0.34, 300, 470], fs: [0.022, 0.04, 24, 34] },
  // ?beat=9 (the default): the opener alone, over its stage's label, the label ending its sentence
  o: { at: "chamber", w: [0.38, 360, 580], fs: [0.024, 0.044, 24, 36] },
};

/** The pinned stage's layout (px) for a W x H stage: the funnel, each beat's callout, its words and its cone. */
const layout = (
  W: number,
  H: number,
  payoff: boolean,
  visits?: string,
  ends: EndsLook | "o" | null = null,
  /** ?beat=9c: the words in a column on the left, every beat (the device as near its chamber as that leaves room for). */
  textLeft = false,
) => {
  const pad = 12;
  // the payoff's metric card, beside the funnel (right of it), the two centred together
  const cardW = clamp(W * 0.24, 230, 320);
  const cardGap = clamp(W * 0.03, 24, 48);
  // one shape for the funnel in every beat and the payoff (FUNNEL_ASPECT): a beat's is only smaller, never flatter
  const fnH0 = payoff ? Math.min(clamp(H * 0.56, 240, 420), H - 170 - pad) : beatFnH(H);
  const fnW = Math.min(payoff ? W - cardW - cardGap : W, fnH0 * FUNNEL_ASPECT);
  const fnH = fnW / FUNNEL_ASPECT;
  const fnLeft = payoff ? (W - fnW - cardGap - cardW) / 2 : (W - fnW) / 2;
  const top = payoff ? 170 : 0;
  const fnTop = payoff ? top + Math.max(0, (H - top - fnH) / 2) : H - fnH - pad;
  const a = funnelAnchors(fnW, fnH, undefined, visits);
  // level with the funnel's run (its centre line), wherever the funnel is
  const card = { left: fnLeft + fnW + cardGap, top: fnTop + a.cy - (cardW * CARD_ASPECT) / 2, width: cardW };
  const gap = clamp(H * 0.075, 34, 64);
  const areaTop = pad + 4;
  const cgap = clamp(W * 0.035, 28, 56);

  // ?beat=7a..7e: the words stand on the beat's funnel (their foot just above its wall), as its stage's label
  const spec = ends ? ENDS_SPEC[ends] : null;
  const bW = Math.min(W, beatFnH(H) * FUNNEL_ASPECT);
  const bH = bW / FUNNEL_ASPECT;
  const bLeft = (W - bW) / 2;
  const bTop = H - bH - pad;
  const bA = funnelAnchors(bW, bH, [1, 1, 1], visits);
  const wordsW = spec ? clamp(W * spec.w[0], spec.w[1], Math.min(spec.w[2], W)) : 0;
  // the size: as the spec says, never so big that the opening wraps in the width it has
  const wordsFs = spec ? Math.min(clamp(Math.min(W * spec.fs[0], H * spec.fs[1]), spec.fs[2], spec.fs[3]), wordsW / 17) : 0;
  // kicker, opening, struck loss, handwritten win
  // kicker, opening, struck loss, handwritten win (the opener: kicker and up to two lines)
  const wordsH = 44 + wordsFs * (ends === "o" ? 2.3 : 3.5);
  /** Their foot over [l, r]: just clear of the funnel's upper wall at its highest there (a chamber's entry is as high as the one before it, the first's as the mouth). */
  const footOver = (l: number, r: number) => {
    // the opener stands on its label (the funnel box's top row), not on the wall
    if (ends === "o") return bTop - clamp(H * 0.022, 12, 24);
    const walls = bA.chambers.map((c, j) =>
      r - bLeft > c.xa && l - bLeft < c.xb ? (j === 0 ? bA.mouth.top : bA.chambers[j - 1].top) : Infinity,
    );
    const top = Math.min(...walls);
    // (beside the funnel, or before the stage is measured: the mouth's height)
    return bTop + (Number.isFinite(top) ? top : bA.mouth.top) - clamp(H * 0.012, 6, 14);
  };
  const overLeft = (i: number) =>
    clamp(spec?.at === "funnel" ? bLeft + bW / 2 - wordsW / 2 : bLeft + bA.chambers[i].xc - wordsW / 2, 0, W - wordsW);
  const over = spec && spec.at !== "device";
  const areaBottom = over
    ? Math.min(...[0, 1, 2].map((i) => footOver(overLeft(i), overLeft(i) + wordsW))) - wordsH - clamp(H * 0.03, 14, 28)
    : H - beatFnH(H) - pad - gap;

  const textW = textLeft ? clamp(W * 0.3, 320, 460) : 0;
  const beats = [0, 1, 2].map((i) => {
    const A = DEVICE_ASPECT[i];
    const w = Math.min(
      (areaBottom - areaTop) * A,
      W * 0.56,
      textLeft ? W - textW - cgap : Infinity,
      i === 1 ? 320 : Infinity,
    );
    const h = w / A;
    const y = areaBottom - h;
    const ch = a.chambers[i];
    const xc = fnLeft + ch.xc;
    const x = clamp(xc - w / 2, textLeft ? textW + cgap : 0, W - w);
    const roomL = x;
    const roomR = W - x - w;
    const right = roomR >= roomL;
    const cw = Math.min((right ? roomR : roomL) - cgap, 460);
    // the words: over the funnel, or (7e) beside the device, standing on the funnel either way
    let copy: CSSProperties;
    if (over) {
      const l = overLeft(i);
      copy = { left: l, width: wordsW, bottom: H - footOver(l, l + wordsW), ["--bch-fs" as string]: `${wordsFs}px` };
    } else if (spec) {
      const ww = Math.min(wordsW, (right ? roomR : roomL) - cgap);
      const fs = Math.min(wordsFs, ww / 17);
      const l = right ? x + w + cgap : Math.max(0, x - cgap - ww);
      copy = { left: l, width: ww, bottom: H - footOver(l, l + ww), ["--bch-fs" as string]: `${fs}px` };
    } else if (textLeft) {
      copy = { left: 0, width: textW, top: y + h / 2 };
    } else {
      copy = { left: right ? x + w + cgap : Math.max(0, x - cgap - cw), width: cw, top: y + h / 2 };
    }
    return {
      x,
      y,
      w,
      h,
      origin: `${xc - x}px ${h + gap}px`,
      copy,
      cone: {
        top: [
          x + Math.min(18, w * 0.06),
          x + w - Math.min(18, w * 0.06),
          y + h - 6,
        ],
        // over the funnel: the cone ends on the words, over the chamber
        bottom: over
          ? [bLeft + bA.chambers[i].xa + 8, bLeft + bA.chambers[i].xb - 8, footOver(overLeft(i), overLeft(i) + wordsW) - wordsH]
          : [fnLeft + ch.xa + 8, fnLeft + ch.xb - 8, fnTop + 2],
      },
    };
  });
  return { fnH, fnW, fnLeft, fnTop, beats, card };
};

/**
 * The zoom cone from a stage to its device: a soft wedge with two marker
 * sides, drawn out of the stage towards the device (pathLength 1, so the
 * CSS draws it with a dash offset).
 */
const Cone = ({
  stage,
  device,
  on,
  className,
}: {
  /** The stage's edge: [x0, x1, y]. */
  stage: number[];
  /** The device's edge: [x0, x1, y]. */
  device: number[];
  on: boolean;
  className?: string;
}) => {
  const [b0, b1, by] = stage;
  const [a0, a1, ay] = device;
  const my = (ay + by) / 2;
  const left = `M${b0} ${by} C ${b0} ${my}, ${a0} ${my}, ${a0} ${ay}`;
  const right = `M${b1} ${by} C ${b1} ${my}, ${a1} ${my}, ${a1} ${ay}`;
  const fill = `M${a0} ${ay} C ${a0} ${my}, ${b0} ${my}, ${b0} ${by} L ${b1} ${by} C ${b1} ${my}, ${a1} ${my}, ${a1} ${ay} Z`;
  return (
    <svg
      className={cn("sl-g2-cone", on && "is-on", className)}
      aria-hidden="true"
    >
      <path className="sl-g2-cone-fill" d={fill} />
      <path className="sl-g2-cone-side" d={left} pathLength={1} />
      <path className="sl-g2-cone-side" d={right} pathLength={1} />
    </svg>
  );
};

/** A marker arrow from a device to its chamber (?beat=8c/8d), drawn in like the cone's sides. */
const Arrow = ({ d, head, on }: { d: string; head: string; on: boolean }) => (
  <svg className={cn("sl-g2-cone sl-g2-arrow", on && "is-on")} aria-hidden="true">
    <path className="sl-g2-cone-side" d={d} pathLength={1} />
    <path className="sl-g2-cone-side sl-g2-arrow-head" d={head} pathLength={1} />
  </svg>
);

/**
 * ?beat=9b's link: a marker frame round the stage's chamber, and an arrow
 * from its foot swooping under the funnel into the device; drawn in like
 * the cone's sides.
 */
const Lens = ({ box, d, head, on }: { box: number[]; d: string; head: string; on: boolean }) => {
  const [x0, y0, x1, y1] = box;
  const r = Math.min(16, (x1 - x0) / 4, (y1 - y0) / 4);
  // the frame, a touch uneven, as if drawn with the marker
  const frame =
    `M${x0 + r} ${y0} L${x1 - r} ${y0 + 1.5} Q${x1} ${y0} ${x1} ${y0 + r} L${x1 + 1} ${y1 - r}` +
    ` Q${x1} ${y1} ${x1 - r} ${y1} L${x0 + r} ${y1 - 1} Q${x0} ${y1} ${x0} ${y1 - r} L${x0 - 1} ${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0}`;
  return (
    <svg className={cn("sl-g2-cone sl-g2-lens", on && "is-on")} aria-hidden="true">
      <path className="sl-g2-cone-side sl-g2-lens-frame" d={frame} pathLength={1} />
      <path className="sl-g2-cone-side" d={d} pathLength={1} />
      <path className="sl-g2-cone-side" d={head} pathLength={1} />
    </svg>
  );
};

/** A beat's device (memoised: only the playing beat's clock moves, so the others skip their re-render). */
const Callout = memo(function Callout({
  i,
  t,
  on,
  past,
  rewinding,
  x,
  y,
  w,
  h,
  origin,
}: {
  i: number;
  t: number;
  on: boolean;
  past: boolean;
  rewinding: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  origin: string;
}) {
  return (
    <div
      className={cn("sl-g2-callout", on && "is-on", past && "is-past")}
      aria-hidden={!on}
      style={{ left: x, top: y, width: w, height: h, transformOrigin: origin }}
    >
      <RewindScreen on={rewinding}>
        <Device index={i} clock={{ t }} active={on} />
      </RewindScreen>
    </div>
  );
});

/** A beat's words, memoised the same way. */
const BeatCopyM = memo(BeatCopy);

const Pinned = () => {
  const s = useMessages().landing.sales;
  // ?beat=7: the beat's words sit over its stage, as the funnel's label (the funnel draws none)
  const look = useBeatStyle();
  const ends = endsLook(look);
  // ?beat=8a..8d: the same words, the device, the funnel arranged around it (sales/arrange)
  const arr = arrLook(look);
  const onFunnel = !!(ends || arr);
  // ?beat=9a..9c (9a the default): the opener alone, the funnel's label ending its sentence
  const opener = openerLook(look);
  const { win } = useSalesProto();
  const tls = useBeatTimelines();
  const [track, progress] = usePinProgress<HTMLDivElement>();
  // four stretches of the track: find, trust, buy, then the payoff (longer: three fixes, each given time)
  const x = Math.min(SPAN - 0.0001, progress * SPAN);
  const step = Math.min(3, Math.floor(x));
  const local = step < 3 ? x - step : (x - 3) / PAYOFF_SPAN;
  const payoff = step === 3;
  // where the scroll puts each beat; its clock is pulled there, rewound there, and plays on by itself at rest
  const at = (i: number) => (step > i ? tls[i].duration : step < i ? 0 : timeAt(local, tls[i].duration));
  const ts = [
    useScrollPlay(at(0), tls[0].duration, step === 0),
    useScrollPlay(at(1), tls[1].duration, step === 1),
    useScrollPlay(at(2), tls[2].duration, step === 2),
  ];
  const beats = tls.map((tl, i) => ({ ...tl, t: ts[i] }));
  const payT = useScrollPlay(payoff ? timeAt(local, PAYOFF_DURATION) : 0, PAYOFF_DURATION, payoff);
  // one value that only falls when the scroll goes back (a step back, or back within a step)
  const rewinding = useRewinding(step * 1e5 + (payoff ? payT : beats[step].t));
  const [stage, { W, H }] = useSize<HTMLDivElement>();
  // (the layouts change only with the stage's size, the payoff and the look: worked out once each, so the
  // beats that aren't playing keep the same props and skip their re-render)
  const visits = s.funnel.visits;
  const L0 = useMemo(
    () => layout(W, H, payoff, visits, opener === "a" ? "o" : ends, opener === "c"),
    [W, H, payoff, visits, opener, ends],
  );
  const A = useMemo(
    () =>
      opener === "b"
        ? arrangeOpener(W, H, OPENER_FUNNEL_ASPECT, visits)
        : arr
          ? arrange(W, H, arr, FUNNEL_ASPECT, visits)
          : null,
    [W, H, opener, arr, visits],
  );
  // the arrangement's funnel in the beats; in the payoff too where it keeps it (9b), else the payoff's own
  const L = A && (!payoff || A.payoff) ? { ...L0, fnW: A.fnW, fnH: A.fnH, fnLeft: A.fnLeft, fnTop: A.fnTop } : L0;
  const card = A?.payoff?.card ?? L0.card;
  const links = useMemo(
    () => L0.beats.map((b, i) => A?.beats[i].link ?? { kind: "cone" as const, stage: b.cone.bottom, device: b.cone.top }),
    [L0, A],
  );
  const rects = useMemo(() => L0.beats.map((b, i) => A?.beats[i] ?? b), [L0, A]);
  // the openers (9a, 9b) stand centred on their label, where the funnel actually set it
  const [labelAt, setLabelAt] = useState<number[] | null>(null);
  const onLabels = useMemo(
    () => (c: number[]) => setLabelAt((p) => (p && p.length === c.length && p.every((v, j) => Math.abs(v - c[j]) < 0.5) ? p : c)),
    [],
  );
  const copyStyle = (i: number): CSSProperties => {
    const c = rects[i].copy;
    if (!(opener === "a" || opener === "b") || !labelAt || step !== i || typeof c.width !== "number") return c;
    // centred on the label; near an edge, narrower (onto two lines) rather than off centre
    const [lo, hi] = A?.wordsRoom ?? [0, W];
    const centre = L.fnLeft + labelAt[i];
    const half = Math.min(c.width / 2, centre - lo, hi - centre);
    if (half < 150) return { ...c, left: clamp(centre - c.width / 2, lo, Math.max(lo, hi - c.width)) };
    return { ...c, left: centre - half, width: 2 * half };
  };
  const f = Math.min(step, 2);
  const clock = payoff
    ? { t: payT, duration: PAYOFF_DURATION, fixAt: undefined }
    : { t: beats[f].t, duration: beats[f].duration, fixAt: beats[f].fixAt };
  const k = fixedAt(step, clock.t, clock.fixAt);

  return (
    <SalesShell lit={payoff ? "all" : step} className="sl-g2 is-pinned">
      <div ref={track} className="sl-g2-track">
        <div className="sl-g2-pin">
          <div className="bzl-wrap sl-g2-frame">
            {/* ph-no-capture: the session recorder would log every animated frame of it (replays show a placeholder) */}
            <div ref={stage} className={cn("sl-g2-stage ph-no-capture", payoff && "is-payoff")}>
              {links.map((l, i) =>
                l.kind === "arrow" ? (
                  <Arrow key={i} d={l.d} head={l.head} on={step === i} />
                ) : l.kind === "lens" ? (
                  <Lens key={i} box={l.box} d={l.d} head={l.head} on={step === i} />
                ) : (
                  <Cone key={i} stage={l.stage} device={l.device} on={step === i} />
                ),
              )}
              {rects.map((b, i) => (
                <Callout
                  key={i}
                  i={i}
                  t={beats[i].t}
                  on={step === i}
                  past={step > i}
                  rewinding={rewinding && step === i}
                  x={b.x}
                  y={b.y}
                  w={b.w}
                  h={b.h}
                  origin={b.origin}
                />
              ))}
              {s.panels.map((p, i) => (
                <div
                  key={p.title}
                  className={cn(
                    "sl-g2-copy",
                    ends && `is-over is-over-${ends}`,
                    arr && `is-over is-arr-${arr}`,
                    (opener === "a" || opener === "b") && "is-over is-opener",
                    (ends === "d" || arr === "a" || arr === "b" || opener === "a" || opener === "b") && "is-center",
                    step === i && "is-on",
                  )}
                  style={copyStyle(i)}
                >
                  <BeatCopyM index={i} t={beats[i].t} fixAt={beats[i].fixAt} />
                  {win > 0 && <Metrics variant={win} k={step === i ? k : fixedAt(i, beats[i].t, beats[i].fixAt)} focus={i} className="sl-g2-met" />}
                </div>
              ))}
              <div className={cn("sl-g2-copy is-payoff", payoff && "is-on")} style={A?.payoff?.copy}>
                <PanelCopy kicker={s.payoff.kicker} title={s.payoff.title} body={s.payoff.body} />
              </div>
              {/* the payoff's win in the metrics a merchant watches, turning with each fix (direction only) */}
              <div className={cn("sl-g2-card", payoff && "is-on")} style={{ left: card.left, top: card.top, width: card.width }}>
                <Metrics variant={4} k={payoff ? k : [0, 0, 0]} focus={3} className="sl-g2-met is-card" />
              </div>
              <div className="sl-fn sl-g2-funnel" style={{ left: L.fnLeft, top: L.fnTop, width: L.fnW, height: L.fnH }}>
                <FunnelFlow
                  t={clock.t}
                  duration={clock.duration}
                  focus={step}
                  fixAt={clock.fixAt}
                  copy={s.funnel}
                  labels={payoff || !onFunnel}
                  onLabels={payoff ? undefined : onLabels}
                  // (the words stand where the funnel's ◀◀ goes: their device's tape look says it)
                  rewind={rewinding && (payoff || !onFunnel)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SalesShell>
  );
};

/** A stacked beat: its words, its funnel, and its device hanging off its own stage by the cone; its timeline follows its own scroll through the screen. */
const StackedBeat = ({ i, setRef }: { i: number; setRef: (el: HTMLElement | null) => void }) => {
  const s = useMessages().landing.sales;
  // ?beat=7: the beat's words sit over its stage, as the funnel's label (the funnel draws none)
  const look = useBeatStyle();
  const ends = !!(endsLook(look) || arrLook(look));
  const { win } = useSalesProto();
  const tl = useBeatTimelines()[i];
  const [item, p] = useScrollThrough<HTMLDivElement>(0.8, 0.75);
  const beat = { ...tl, t: useScrollPlay(timeAt(p, tl.duration), tl.duration, p > 0 && p < 1) };
  const rewinding = useRewinding(beat.t);
  const fn = useRef<HTMLDivElement>(null);
  const dev = useRef<HTMLDivElement>(null);
  const [cone, setCone] = useState<{ from: number[]; to: number[] } | null>(null);
  useLayoutEffect(() => {
    const el = item.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const fr = fn.current?.getBoundingClientRect();
      const frame =
        dev.current?.querySelector(".bzl-device")?.getBoundingClientRect() ?? dev.current?.getBoundingClientRect();
      if (!fr || !frame) return;
      const ch = funnelAnchors(fr.width, fr.height, undefined, s.funnel.visits).chambers[i];
      const ox = fr.left - r.left;
      const inset = Math.min(18, frame.width * 0.08);
      setCone({
        // up from the device's top edge to the stage's floor (the leak, where the agent sits)
        from: [frame.left - r.left + inset, frame.right - r.left - inset, frame.top - r.top + 6],
        to: [ox + ch.xa + 6, ox + ch.xb - 6, fr.top - r.top + ch.floor + 4],
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [i, item]);
  return (
    <div
      ref={(el) => {
        (item as { current: HTMLDivElement | null }).current = el;
        setRef(el);
      }}
      className="sl-g2-item relative"
    >
      <BeatCopy index={i} t={beat.t} fixAt={beat.fixAt} className="sl-c-copy is-on" />
      {win > 0 && <Metrics variant={win} k={fixedAt(i, beat.t, beat.fixAt)} focus={i} className="sl-g2-met" />}
      <div ref={fn}>
        <FunnelScale focus={i} t={beat.t} duration={beat.duration} fixAt={beat.fixAt} rewind={rewinding && !ends} labels={!ends} className="sl-g2-s-fn" />
      </div>
      {cone && <Cone stage={cone.to} device={cone.from} on className="is-static" />}
      <div ref={dev} className="sl-g2-s-dev relative">
        <RewindScreen on={rewinding}>
          <Device index={i} clock={beat} />
        </RewindScreen>
      </div>
    </div>
  );
};

const StackedPayoff = ({ setRef }: { setRef: (el: HTMLElement | null) => void }) => {
  const s = useMessages().landing.sales;
  const [item, p] = useScrollThrough<HTMLDivElement>(0.8, 0.85);
  const t = useScrollPlay(timeAt(p, PAYOFF_DURATION), PAYOFF_DURATION, p > 0 && p < 1);
  const rewinding = useRewinding(t);
  return (
    <div
      ref={(el) => {
        (item as { current: HTMLDivElement | null }).current = el;
        setRef(el);
      }}
      className="sl-g2-item is-payoff"
    >
      <PanelCopy kicker={s.payoff.kicker} title={s.payoff.title} body={s.payoff.body} className="sl-c-copy is-on" />
      <SalesPayoff t={t} rewind={rewinding} />
    </div>
  );
};

const Stacked = () => {
  const { active, setRef } = useActivePanel(0.55);
  return (
    <SalesShell lit={active >= 3 ? "all" : active} className="sl-g2 is-stacked">
      <div className="bzl-wrap sl-g2-list">
        {[0, 1, 2].map((i) => (
          <StackedBeat key={i} i={i} setRef={setRef(i)} />
        ))}
        <StackedPayoff setRef={setRef(3)} />
      </div>
    </SalesShell>
  );
};

export default SalesSpine;
