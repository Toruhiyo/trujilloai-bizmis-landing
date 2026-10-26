import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import PillarIntro from "../PillarIntro";
import { useMedia, useOnScreen, usePinProgress, useRewinding, useScrollPlay } from "../sales/hooks";
import { useOpener } from "./OpenerContext";
import type { Motif } from "./OpenerDesign";
import "@/styles/pillar-intro.css";
import "@/styles/pillar-openers.css";

/** Where a pinned section is, for its content: how far its track has been scrolled (0 → 1), and whether it's on screen. */
export type PinState = {
  /** True when the section is the pinned one-screen layout (desktop, an opener design). */
  pinned: boolean;
  /** 0 → 1 through the pinned track (0 when not pinned). */
  progress: number;
  /** The section is on screen (its scroll-played clocks run). */
  active: boolean;
};

/** Pinned on screens that hold the one-screen layout; phones and short screens stack and scroll. */
export const PIN_QUERY = "(min-width: 1024px) and (min-height: 600px)";

type Props = {
  /** The section's place in the page ("02"). */
  index: string;
  icon: ReactNode;
  name: string;
  promise: string;
  /** The area's full name, the chapter's eyebrow ("Customer Support"). */
  area?: string;
  /** The promise, a sentence a line, for the opener designs. */
  outcome?: string[];
  /** The pillar, for the designs' drawings. */
  motif?: Motif;
  /** Scroll room while pinned, in screens' heights: the content's timeline maps onto it. */
  run?: number;
  className?: string;
  children: ReactNode | ((state: PinState) => ReactNode);
};

/** Of the pinned track: a short lead-in, then the scene's timeline, then a hold on its end state. */
const LEAD = 0.04;
const RUN = 0.8;

/**
 * A pinned section's scene clock, like a Boost Sales beat's (useScrollPlay):
 * the scroll sets where it is along `duration` (forward advances it, back
 * rewinds it); when the scroll rests it plays on at 1x to its end state,
 * holds it ~2.6 s, rewinds and replays. `rewinding` while it runs back (for
 * the ◀◀ signs); `replay` counts the times it came back to its start after
 * reaching its end (e.g. the store plays its next case). Not pinned, it
 * sits at 0: the content runs its own loops then.
 */
export const useScenePlay = ({ pinned, progress, active }: PinState, duration: number) => {
  const target = Math.min(1, Math.max(0, (progress - LEAD) / RUN)) * duration;
  const t = useScrollPlay(pinned ? target : 0, duration, pinned && active);
  const rewinding = useRewinding(t);
  const [replay, setReplay] = useState(0);
  const reached = useRef(false);
  useEffect(() => {
    if (t >= duration - 1) reached.current = true;
    else if (t <= 0 && reached.current) {
      reached.current = false;
      setReplay((n) => n + 1);
    }
  }, [t, duration]);
  return { t, rewinding, replay };
};

const render = (children: Props["children"], state: PinState) =>
  typeof children === "function" ? children(state) : children;

/**
 * A benefit section's opening for Customer Support and Store Insights, on
 * PillarIntro like Boost Sales: the chapter opener big in the middle of the
 * screen (the number, the eyebrow with the area's full name, the outcome on
 * one line), which the scroll morphs into the section's sticky docked bar
 * ([icon] area | outcome), the content following under it.
 *
 * With an opener design (?open=1..6; the page's default is 5, "Chapter") on
 * a desktop screen, the content is ONE pinned screen, sticky right under
 * the bar while the page scrolls through a track `run` screens long. The
 * content gets the track's progress (a render prop) to drive its animations
 * by the scroll, like Boost Sales (sales/hooks: usePinProgress,
 * useScrollPlay). Otherwise (phones, short screens, ?open=0) it simply
 * follows in the flow.
 */
const BenefitIntro = (props: Props) => {
  const opener = useOpener();
  const wide = useMedia(PIN_QUERY);
  const pinned = wide && opener !== "0" && Boolean(props.outcome);
  const { index, icon, name, promise, area, outcome, motif, run = 1.6, className, children } = props;
  return (
    <PillarIntro
      index={index}
      name={name}
      icon={icon}
      line={promise}
      area={area}
      outcome={outcome}
      motif={motif}
      docked={<span className="bzp-dock-line">{promise}</span>}
      className={cn("bzp", pinned && "is-pinned", className)}
    >
      {pinned ? (
        <Track run={run}>{children}</Track>
      ) : (
        <div className="bzp-body">{render(children, { pinned: false, progress: 0, active: true })}</div>
      )}
    </PillarIntro>
  );
};

/** The pinned track: one screen under the bar, sticky while the page scrolls `run` screens through it. */
const Track = ({ run, children }: { run: number; children: Props["children"] }) => {
  const [track, progress] = usePinProgress<HTMLDivElement>();
  const [pin, onScreen] = useOnScreen<HTMLDivElement>(0.2);
  return (
    <div
      ref={track}
      className="bzp-track"
      style={{ height: `calc(100svh - var(--pi-nav) - var(--pi-dock-h) + ${run * 100}svh)` }}
    >
      <div ref={pin} className="bzp-pin">
        <Fit>{render(children, { pinned: true, progress, active: onScreen })}</Fit>
      </div>
    </div>
  );
};

/**
 * The pinned screen's content, kept whole: laid out at the stage's width,
 * and if it comes out taller than the room left under the opener, scaled
 * down (from the top centre) until it fits. Never clipped.
 */
const Fit = ({ children }: { children: ReactNode }) => {
  const stage = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const s = stage.current;
    const c = inner.current;
    if (!s || !c || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const room = s.clientHeight;
      const need = c.offsetHeight;
      setScale(need > room && need > 0 ? Math.max(0.5, room / need) : 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(s);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={stage} className="bzp-stage">
      <div ref={inner} className="bzp-fit" style={scale < 1 ? { transform: `scale(${scale.toFixed(4)})` } : undefined}>
        {children}
      </div>
    </div>
  );
};

export default BenefitIntro;
