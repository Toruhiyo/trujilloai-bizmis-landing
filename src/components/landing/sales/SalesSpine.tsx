import { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import BeatCopy from "./BeatCopy";
import { arrangeOpener } from "./arrange";
import FunnelFlow, { funnelAnchors } from "./funnel/FunnelFlow";
import FunnelScale from "./funnel/FunnelScale";
import { startsFor } from "./funnel/model";
import SalesJar from "./funnel/SalesJar";
import { useActivePanel, useMedia, useNearScreen, usePinProgress, useRewinding, useScrollPlay, useScrollThrough } from "./hooks";
import RewindScreen, { ScreenTape } from "./RewindScreen";
import SalesPayoff, { PAYOFF_DURATION } from "./SalesPayoff";
import { SalesShell, useBeatTimelines, useSize } from "./SalesShell";
import { Device, PanelCopy } from "./shared";

/**
 * Boost Sales, "the funnel as the spine": the marker funnel of the whole
 * store's visits is the section's big central picture, and each part's one
 * conversation plays on its own device in a column beside it (Find's
 * desktop for Discovery, Trust's phone for Decision, Buy's tablet for
 * Checkout), its chamber lit from inside and a marker arrow from under it
 * into the device, so the one shopper and the whole store are one drawing
 * (sales/arrange). Each beat's words are its opener alone, the sentence
 * ending in the stage's own label in the funnel. It's one shopper's journey
 * with the store's one agent, who seals each stage's leak as it solves it
 * in the device; the fixes add up (one funnel, never lossless); then the
 * payoff keeps the funnel, its bag filling, the Sales column beside it
 * filling up.
 *
 * Driven by the scroll's position, not by time: each beat (and the payoff)
 * has its own stretch of the pinned track, and its timeline (typing, the
 * agent's answer, the stage's fix, its solution written and ticked) maps
 * onto that stretch, ending on a hold on the fixed state, so it's always
 * reached; scrolling back rewinds it (the device's screen goes analog, a
 * tape rewinding, and the funnel shows its marker ◀◀ while it does). The visits
 * keep flowing in real time. Phones and tablets pin too (the same pieces
 * stacked); short screens (a phone on its side): the beats stack, each
 * funnel with its device hanging off its stage by a zoom cone, each mapped
 * to its own scroll through the screen.
 */
const SalesSpine = () => {
  // pinned on desktops, and on phones and tablets too (the stage's stacked arrangement), so the scroll drives it there as well
  const desk = useMedia("(min-width: 1024px) and (min-height: 640px)");
  const tall = useMedia("(min-height: 540px)");
  return desk || tall ? <Pinned /> : <Stacked />;
};

/** The payoff's stretch of scroll, in beats' stretches; the whole track's. */
const PAYOFF_SPAN = 1.5;
const SPAN = 3 + PAYOFF_SPAN;
/**
 * Of a beat's stretch of scroll (about two screens): a short lead-in, then its timeline, then a long
 * hold on its fixed state (about a third: two thirds of a screen), so a fast scroller still lands on the win.
 */
const LEAD = 0.035;
const RUN = 0.64;
/** Where a beat is on its timeline (ms), `p` (0 → 1) through its stretch of scroll. */
const timeAt = (p: number, duration: number) => Math.min(1, Math.max(0, (p - LEAD) / RUN)) * duration;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** The stage's funnel (the beats' and the payoff's alike): taller than a flat one, as it has a column of its own to fill. */
const OPENER_FUNNEL_ASPECT = 2.05;

/**
 * A stacked beat's zoom cone from its stage to its device: a soft wedge with two marker
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

/**
 * A beat's link: a hand-drawn marker arrow from under the lit chamber
 * (the funnel fills it) into the device. The line draws itself in, then the
 * head, in two quick strokes.
 */
const Lens = ({ d, head, on }: { d: string; head: string; on: boolean }) => (
  <svg className={cn("sl-g2-cone sl-g2-lens", on && "is-on")} aria-hidden="true">
    <path className="sl-g2-cone-side" d={d} pathLength={1} />
    <path className="sl-g2-cone-side sl-g2-lens-head" d={head} pathLength={1} />
  </svg>
);

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
  const tls = useBeatTimelines();
  const [track, progress] = usePinProgress<HTMLDivElement>();
  // the beats' clocks run only while the track is on screen: above it (beat one) or past it (the payoff)
  // they would otherwise play, hold and rewind unseen, re-rendering the whole stage every frame
  const seen = useNearScreen(track, "0px");
  // four stretches of the track: find, trust, buy, then the payoff (longer: three fixes, each given time)
  const x = Math.min(SPAN - 0.0001, progress * SPAN);
  const step = Math.min(3, Math.floor(x));
  const local = step < 3 ? x - step : (x - 3) / PAYOFF_SPAN;
  const payoff = step === 3;
  // where the scroll puts each beat; its clock is pulled there, rewound there, and plays on by itself at rest
  const at = (i: number) => (step > i ? tls[i].duration : step < i ? 0 : timeAt(local, tls[i].duration));
  const ts = [
    useScrollPlay(at(0), tls[0].duration, seen && step === 0),
    useScrollPlay(at(1), tls[1].duration, seen && step === 1),
    useScrollPlay(at(2), tls[2].duration, seen && step === 2),
  ];
  const beats = tls.map((tl, i) => ({ ...tl, t: ts[i] }));
  const payT = useScrollPlay(payoff ? timeAt(local, PAYOFF_DURATION) : 0, PAYOFF_DURATION, seen && payoff);
  // one value that only falls when the scroll goes back (a step back, or back within a step)
  const rewinding = useRewinding(step * 1e5 + (payoff ? payT : beats[step].t));
  const [stage, { W, H }] = useSize<HTMLDivElement>();
  // (the layout changes only with the stage's size: worked out once each, so the
  // beats that aren't playing keep the same props and skip their re-render)
  const visits = s.funnel.visits;
  const A = useMemo(() => arrangeOpener(W, H, OPENER_FUNNEL_ASPECT, visits), [W, H, visits]);
  const card = A.payoff.card;
  // the Sales column: in the card's column, tall (most of the stage, never all of it), level with the
  // funnel's bag; where the card sits under the funnel (phones), a wide bar filling sideways
  const bag = useMemo(() => {
    const b = funnelAnchors(A.fnW, A.fnH, [1, 1, 1], visits).bag;
    return { x: A.fnLeft + b.x, y: A.fnTop + b.y };
  }, [A, visits]);
  const payStarts = useMemo(() => startsFor(3), []);
  const jar = useMemo(() => {
    if (A.payoff.under) {
      const h = clamp(H * 0.09, 56, 76);
      return { x: card.left, y: card.top, w: card.width, h };
    }
    const h = clamp(H * 0.7, 260, 580);
    const w = clamp(h * 0.3, 110, 170);
    return { x: card.left + (card.width - w) / 2, y: clamp(bag.y - h * 0.55, 12, H - 12 - h), w, h };
  }, [card, A, H, bag.y]);
  // the openers stand centred on their label, where the funnel actually set it
  const [labelAt, setLabelAt] = useState<number[] | null>(null);
  const onLabels = useMemo(
    () => (c: number[]) => setLabelAt((p) => (p && p.length === c.length && p.every((v, j) => Math.abs(v - c[j]) < 0.5) ? p : c)),
    [],
  );
  const copyStyle = (i: number): CSSProperties => {
    const c = A.beats[i].copy;
    if (!labelAt || step !== i || typeof c.width !== "number") return c;
    // centred on the label; near an edge, narrower (onto two lines) rather than off centre
    const [lo, hi] = A.wordsRoom;
    const centre = A.fnLeft + labelAt[i];
    const half = Math.min(c.width / 2, centre - lo, hi - centre);
    if (half < 150) return { ...c, left: clamp(centre - c.width / 2, lo, Math.max(lo, hi - c.width)) };
    return { ...c, left: centre - half, width: 2 * half };
  };
  const f = Math.min(step, 2);
  const clock = payoff
    ? { t: payT, duration: PAYOFF_DURATION, fixAt: undefined }
    : { t: beats[f].t, duration: beats[f].duration, fixAt: beats[f].fixAt };

  return (
    <SalesShell lit={payoff ? "all" : step} className="sl-g2 is-pinned">
      <div ref={track} className="sl-g2-track">
        <div className="sl-g2-pin">
          <div className="bzl-wrap sl-g2-frame">
            {/* ph-no-capture: the session recorder would log every animated frame of it (replays show a placeholder) */}
            <div ref={stage} className={cn("sl-g2-stage ph-no-capture", payoff && "is-payoff")}>
              {/* the payoff scrolled back: the whole of it (funnel, words, column) rewinds as one tape, like a device's screen */}
              <ScreenTape band on={rewinding && payoff}>
                {A.beats.map((b, i) => (
                  <Lens key={i} d={b.link.d} head={b.link.head} on={step === i} />
                ))}
                {A.beats.map((b, i) => (
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
                    className={cn("sl-g2-copy", "is-over is-opener", "is-center", step === i && "is-on")}
                    style={copyStyle(i)}
                  >
                    <BeatCopyM index={i} />
                  </div>
                ))}
                <div className={cn("sl-g2-copy is-payoff", A.payoff.under && "is-under", payoff && "is-on")} style={A.payoff.copy}>
                  {/* the title alone (no eyebrow, no line under it) */}
                  <PanelCopy title={s.payoff.title} />
                </div>
                {/* the payoff's win: the Sales column filling up (the film's) */}
                <SalesJar t={payoff ? payT : 0} starts={payStarts} duration={PAYOFF_DURATION} from={bag} box={jar} label={s.payoff.jar} on={seen && payoff} />
                <div className="sl-fn sl-g2-funnel" style={{ left: A.fnLeft, top: A.fnTop, width: A.fnW, height: A.fnH }}>
                  <FunnelFlow
                    t={clock.t}
                    duration={clock.duration}
                    focus={step}
                    fixAt={clock.fixAt}
                    copy={s.funnel}
                    onLabels={payoff ? undefined : onLabels}
                    lit={payoff ? -1 : step}
                    rewind={rewinding}
                  />
                </div>
              </ScreenTape>
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
      <BeatCopy index={i} className="sl-c-copy is-on" />
      <div ref={fn}>
        <FunnelScale focus={i} t={beat.t} duration={beat.duration} fixAt={beat.fixAt} rewind={rewinding} className="sl-g2-s-fn" />
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
      <PanelCopy title={s.payoff.title} className="sl-c-copy is-on" />
      <ScreenTape band on={rewinding}>
        <SalesPayoff t={t} rewind={rewinding} />
      </ScreenTape>
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
