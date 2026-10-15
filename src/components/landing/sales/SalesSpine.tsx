import { useLayoutEffect, useRef, useState } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import FunnelFlow, { funnelAnchors } from "./funnel/FunnelFlow";
import FunnelScale from "./funnel/FunnelScale";
import { useActivePanel, useMedia, usePinProgress, useScene } from "./hooks";
import SalesPayoff, { PAYOFF_DURATION } from "./SalesPayoff";
import { DEVICE_ASPECT, SalesShell, useBeat, useSize } from "./SalesShell";
import type { Beat } from "./SalesShell";
import { Device, PanelCopy, Sentinel } from "./shared";

/**
 * Grouping 2, "the funnel as the spine" (?grp=2): the marker funnel is the
 * section's big central picture, and each part's one conversation pops out
 * of its own stage like a callout: Find's desktop out of Discovery, Trust's
 * phone out of Decision, Buy's tablet out of Checkout, joined to its
 * chamber by a zoom cone, so the one shopper and the whole store are one
 * drawing. Each beat's device and the funnel share its clock: the stage's
 * fix lands the moment the agent solves it in the device; fixes add up
 * (one funnel, fixed stage by stage, never lossless); then the devices
 * fold back into the funnel and it grows for the payoff, its bag filling.
 * Phones (and short screens): the beats stack, each funnel with its device
 * hanging off its stage.
 */
const SalesSpine = () => {
  const pin = useMedia("(min-width: 1024px) and (min-height: 640px)");
  return pin ? <Pinned /> : <Stacked />;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** The pinned stage's layout (px) for a W x H stage: the funnel, each beat's callout, its words and its cone. */
const layout = (W: number, H: number, payoff: boolean) => {
  const pad = 12;
  const fnH = payoff ? clamp(H * 0.56, 240, 420) : clamp(H * 0.3, 165, 250);
  const fnW = Math.min(W, fnH * (payoff ? 2.9 : 4.6));
  const fnLeft = (W - fnW) / 2;
  const top = payoff ? 170 : 0;
  const fnTop = payoff ? top + Math.max(0, (H - top - fnH) / 2) : H - fnH - pad;
  const a = funnelAnchors(fnW, fnH);
  const gap = clamp(H * 0.075, 34, 64);
  const areaTop = pad + 4;
  const areaBottom = H - clamp(H * 0.3, 165, 250) - pad - gap;
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
  return { fnH, fnW, fnLeft, fnTop, beats };
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

const Pinned = () => {
  const s = useMessages().landing.sales;
  const [track, progress] = usePinProgress<HTMLDivElement>();
  const step = Math.min(3, Math.floor(progress * 4));
  const payoff = step === 3;
  const beats = [
    useBeat(0, step === 0),
    useBeat(1, step === 1),
    useBeat(2, step === 2),
  ];
  const pay = useScene(PAYOFF_DURATION, payoff, { threshold: 0.35 });
  const [stage, { W, H }] = useSize<HTMLDivElement>();
  const L = layout(W, H, payoff);
  const f = Math.min(step, 2);
  const clock = payoff
    ? { t: pay.t, duration: PAYOFF_DURATION, fixAt: undefined }
    : { t: beats[f].t, duration: beats[f].duration, fixAt: beats[f].fixAt };

  return (
    <SalesShell lit={payoff ? "all" : step} className="sl-g2 is-pinned">
      <div ref={track} className="sl-g2-track">
        <div className="sl-g2-pin">
          <div className="bzl-wrap sl-g2-frame">
            <div
              ref={stage}
              className={cn("sl-g2-stage", payoff && "is-payoff")}
            >
              {/* always mounted: the beats' sentinels must exist when their clocks start watching */}
              <>
                {L.beats.map((b, i) => (
                  <Cone
                    key={i}
                    stage={b.cone.bottom}
                    device={b.cone.top}
                    on={step === i}
                  />
                ))}
                {L.beats.map((b, i) => (
                  <div
                    key={i}
                    className={cn(
                      "sl-g2-callout",
                      step === i && "is-on",
                      step > i && "is-past",
                    )}
                    aria-hidden={step !== i}
                    style={{
                      left: b.x,
                      top: b.y,
                      width: b.w,
                      height: b.h,
                      transformOrigin: b.origin,
                    }}
                  >
                    <Sentinel ref={beats[i].sentinel} off={beats[i].off} />
                    <Device index={i} clock={beats[i]} active={step === i} />
                  </div>
                ))}
                {s.panels.map((p, i) => (
                  <PanelCopy
                    key={p.title}
                    index={i}
                    kicker={s.stages[i]}
                    title={p.title}
                    body={p.body}
                    className={cn("sl-g2-copy", step === i && "is-on")}
                    style={{
                      left: L.beats[i].copy.left,
                      width: L.beats[i].copy.width,
                      top: L.beats[i].copy.top,
                    }}
                  />
                ))}
                <PanelCopy
                  kicker={s.payoff.kicker}
                  title={s.payoff.title}
                  body={s.payoff.body}
                  className={cn("sl-g2-copy is-payoff", payoff && "is-on")}
                />
                <div
                  className="sl-fn sl-g2-funnel"
                  style={{
                    left: L.fnLeft,
                    top: L.fnTop,
                    width: L.fnW,
                    height: L.fnH,
                  }}
                >
                  <Sentinel ref={pay.sentinel} off={pay.off} />
                  <FunnelFlow
                    t={clock.t}
                    duration={clock.duration}
                    focus={step}
                    fixAt={clock.fixAt}
                    copy={s.funnel}
                  />
                </div>
              </>
            </div>
          </div>
        </div>
      </div>
    </SalesShell>
  );
};

/** A stacked beat: its words, its funnel, and its device hanging off its own stage by the cone. */
const StackedBeat = ({
  i,
  beat,
  setRef,
}: {
  i: number;
  beat: Beat;
  setRef: (el: HTMLElement | null) => void;
}) => {
  const s = useMessages().landing.sales;
  const item = useRef<HTMLDivElement | null>(null);
  const fn = useRef<HTMLDivElement>(null);
  const dev = useRef<HTMLDivElement>(null);
  const [cone, setCone] = useState<{
    from: number[];
    to: number[];
    w: number;
    h: number;
  } | null>(null);
  useLayoutEffect(() => {
    const el = item.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const fr = fn.current?.getBoundingClientRect();
      const frame =
        dev.current?.querySelector(".bzl-device")?.getBoundingClientRect() ??
        dev.current?.getBoundingClientRect();
      if (!fr || !frame) return;
      const ch = funnelAnchors(fr.width, fr.height).chambers[i];
      const ox = fr.left - r.left;
      const inset = Math.min(18, frame.width * 0.08);
      setCone({
        // up from the device's top edge to the stage's floor (the leak, where its agent sits)
        from: [
          frame.left - r.left + inset,
          frame.right - r.left - inset,
          frame.top - r.top + 6,
        ],
        to: [ox + ch.xa + 6, ox + ch.xb - 6, fr.top - r.top + ch.floor + 4],
        w: r.width,
        h: r.height,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [i]);
  return (
    <div
      ref={(el) => {
        item.current = el;
        setRef(el);
      }}
      className="sl-g2-item relative"
    >
      <Sentinel ref={beat.sentinel} off={beat.off} />
      <PanelCopy
        index={i}
        kicker={s.stages[i]}
        title={s.panels[i].title}
        body={s.panels[i].body}
        className="sl-c-copy is-on"
      />
      <div ref={fn}>
        <FunnelScale
          focus={i}
          t={beat.t}
          duration={beat.duration}
          fixAt={beat.fixAt}
          className="sl-g2-s-fn"
        />
      </div>
      {cone && (
        <Cone stage={cone.to} device={cone.from} on className="is-static" />
      )}
      <div ref={dev} className="sl-g2-s-dev">
        <Device index={i} clock={beat} />
      </div>
    </div>
  );
};

const Stacked = () => {
  const s = useMessages().landing.sales;
  const beats = [useBeat(0), useBeat(1), useBeat(2)];
  const { active, setRef } = useActivePanel(0.55);
  return (
    <SalesShell lit={active >= 3 ? "all" : active} className="sl-g2 is-stacked">
      <div className="bzl-wrap sl-g2-list">
        {beats.map((b, i) => (
          <StackedBeat key={i} i={i} beat={b} setRef={setRef(i)} />
        ))}
        <div ref={setRef(3)} className="sl-g2-item is-payoff">
          <PanelCopy
            kicker={s.payoff.kicker}
            title={s.payoff.title}
            body={s.payoff.body}
            className="sl-c-copy is-on"
          />
          <SalesPayoff />
        </div>
      </div>
    </SalesShell>
  );
};

export default SalesSpine;
