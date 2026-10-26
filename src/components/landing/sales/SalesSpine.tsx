import { useLayoutEffect, useRef, useState } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import BeatCopy from "./BeatCopy";
import { endingLabels } from "./beatcopy/BeatHL";
import { ENDS, useBeatStyle } from "./beatcopy/style";
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
/** A beat's funnel's height for an H px stage (a little more of it than a flat funnel took, so its narrower box still reads). */
const beatFnH = (H: number) => clamp(H * 0.36, 180, 300);
/** The metric card's height : width (Metrics' card, 168 / 330). */
const CARD_ASPECT = 168 / 330;

/** The pinned stage's layout (px) for a W x H stage: the funnel, each beat's callout, its words and its cone. */
const layout = (W: number, H: number, payoff: boolean, visits?: string) => {
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
  const areaBottom = H - beatFnH(H) - pad - gap;
  const cgap = clamp(W * 0.035, 28, 56);
  const beats = [0, 1, 2].map((i) => {
    const A = DEVICE_ASPECT[i];
    const w = Math.min(
      (areaBottom - areaTop) * A,
      W * 0.56,
      i === 1 ? 320 : Infinity,
    );
    const h = w / A;
    const y = areaBottom - h;
    const ch = a.chambers[i];
    const xc = fnLeft + ch.xc;
    const x = clamp(xc - w / 2, 0, W - w);
    const roomL = x;
    const roomR = W - x - w;
    const right = roomR >= roomL;
    const cw = Math.min((right ? roomR : roomL) - cgap, 460);
    return {
      x,
      y,
      w,
      h,
      origin: `${xc - x}px ${h + gap}px`,
      copy: {
        left: right ? x + w + cgap : Math.max(0, x - cgap - cw),
        width: cw,
        top: y + h / 2,
      },
      cone: {
        top: [
          x + Math.min(18, w * 0.06),
          x + w - Math.min(18, w * 0.06),
          y + h - 6,
        ],
        bottom: [fnLeft + ch.xa + 8, fnLeft + ch.xb - 8, fnTop + 2],
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

/** The beats' funnel labels: the stages' own, or (?beat=7) the words' endings. */
const useBeatLabels = () => {
  const s = useMessages().landing.sales;
  const look = useBeatStyle();
  return look === ENDS ? { ...s.funnel, ...endingLabels(s.flip) } : s.funnel;
};

const Pinned = () => {
  const s = useMessages().landing.sales;
  const labels = useBeatLabels();
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
  const L = layout(W, H, payoff, s.funnel.visits);
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
            <div ref={stage} className={cn("sl-g2-stage", payoff && "is-payoff")}>
              {L.beats.map((b, i) => (
                <Cone key={i} stage={b.cone.bottom} device={b.cone.top} on={step === i} />
              ))}
              {L.beats.map((b, i) => (
                <div
                  key={i}
                  className={cn("sl-g2-callout", step === i && "is-on", step > i && "is-past")}
                  aria-hidden={step !== i}
                  style={{ left: b.x, top: b.y, width: b.w, height: b.h, transformOrigin: b.origin }}
                >
                  <RewindScreen on={rewinding && step === i}>
                    <Device index={i} clock={beats[i]} active={step === i} />
                  </RewindScreen>
                </div>
              ))}
              {s.panels.map((p, i) => (
                <div
                  key={p.title}
                  className={cn("sl-g2-copy", step === i && "is-on")}
                  style={{ left: L.beats[i].copy.left, width: L.beats[i].copy.width, top: L.beats[i].copy.top }}
                >
                  <BeatCopy index={i} t={beats[i].t} fixAt={beats[i].fixAt} />
                  {win > 0 && <Metrics variant={win} k={step === i ? k : fixedAt(i, beats[i].t, beats[i].fixAt)} focus={i} className="sl-g2-met" />}
                </div>
              ))}
              <div className={cn("sl-g2-copy is-payoff", payoff && "is-on")}>
                <PanelCopy kicker={s.payoff.kicker} title={s.payoff.title} body={s.payoff.body} />
              </div>
              {/* the payoff's win in the metrics a merchant watches, turning with each fix (direction only) */}
              <div className={cn("sl-g2-card", payoff && "is-on")} style={{ left: L.card.left, top: L.card.top, width: L.card.width }}>
                <Metrics variant={4} k={payoff ? k : [0, 0, 0]} focus={3} className="sl-g2-met is-card" />
              </div>
              <div className="sl-fn sl-g2-funnel" style={{ left: L.fnLeft, top: L.fnTop, width: L.fnW, height: L.fnH }}>
                <FunnelFlow
                  t={clock.t}
                  duration={clock.duration}
                  focus={step}
                  fixAt={clock.fixAt}
                  copy={payoff ? s.funnel : labels}
                  rewind={rewinding}
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
  const labels = useBeatLabels();
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
        <FunnelScale focus={i} t={beat.t} duration={beat.duration} fixAt={beat.fixAt} rewind={rewinding} copy={labels} className="sl-g2-s-fn" />
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
