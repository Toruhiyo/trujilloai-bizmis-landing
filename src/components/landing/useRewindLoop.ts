import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Drives a landing animation as a loop the viewer always sees from its start:
 * it plays forward from 0 the moment its element comes into view, holds on the
 * end, rewinds (the timeline runs backwards, fast, like a tape), rests on the
 * start, and plays again. Leaving the view stops it and resets it to 0, so the
 * next visit starts from the beginning too.
 *
 * Components read `t` (ms along their own timeline, going back down while
 * `rewinding`) and derive their state from it, e.g. which phase they're in:
 * CSS transitions between those states then play backwards on their own. A
 * canvas can take `onFrame` instead and skip React renders entirely.
 *
 * With prefers-reduced-motion it sits on the end (t = duration) and never moves.
 */
export type RewindLoopOptions = {
  /** Length of the forward timeline (ms). */
  duration: number;
  /** Pause on the finished state before rewinding (ms). */
  hold?: number;
  /** How long the rewind takes (ms): faster than the forward play. */
  rewind?: number;
  /** Pause on the start before playing again (ms). */
  rest?: number;
  /** Share of the element that must be visible to start. */
  threshold?: number;
  /** Re-render at most this often (ms); 0 renders every frame. */
  tick?: number;
  /** Called every animation frame with the current time (no re-render needed). */
  onFrame?: (t: number, rewinding: boolean) => void;
  /** Pauses the loop (e.g. until an asset is ready), keeping its place. */
  paused?: boolean;
};

export type RewindLoop = {
  /** ms along the forward timeline, 0..duration. */
  t: number;
  /** True while the timeline runs backwards. */
  rewinding: boolean;
  /** True while the element is in view and the loop runs. */
  active: boolean;
  /** Increments every time a forward play starts (handy as a React key). */
  cycle: number;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function useRewindLoop(
  ref: RefObject<Element | null>,
  { duration, hold = 2200, rewind = 900, rest = 500, threshold = 0.35, tick = 1000 / 30, onFrame, paused = false }: RewindLoopOptions,
): RewindLoop {
  const reduced = useRef(prefersReducedMotion()).current;
  const [state, setState] = useState<RewindLoop>({
    t: reduced ? duration : 0,
    rewinding: false,
    active: false,
    cycle: 0,
  });
  const [inView, setInView] = useState(false);
  const frameCb = useRef(onFrame);
  frameCb.current = onFrame;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);

  useEffect(() => {
    if (reduced) {
      frameCb.current?.(duration, false);
      return;
    }
    if (!inView) {
      // out of view: back to the start, ready for the next visit
      frameCb.current?.(0, false);
      setState((s) => ({ t: 0, rewinding: false, active: false, cycle: s.cycle }));
      return;
    }
    // one cycle: play [0, duration] → hold → rewind → rest
    const play = duration;
    const total = play + hold + rewind + rest;
    let start = performance.now();
    let pausedAt: number | null = null;
    let lastRender = -Infinity;
    let lastCycle = -1;
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (pausedRef.current) {
        if (pausedAt === null) pausedAt = now;
        return;
      }
      if (pausedAt !== null) {
        start += now - pausedAt;
        pausedAt = null;
      }
      const elapsed = now - start;
      const cycle = Math.floor(elapsed / total);
      const e = elapsed - cycle * total;
      let t: number;
      let rewinding = false;
      if (e < play) t = e;
      else if (e < play + hold) t = play;
      else if (e < play + hold + rewind) {
        rewinding = true;
        const k = (e - play - hold) / rewind;
        // ease in-out, so the rewind gathers speed and settles
        t = play * (1 - (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2));
      } else t = 0;
      frameCb.current?.(t, rewinding);
      if (cycle !== lastCycle || tick === 0 || now - lastRender >= tick) {
        lastRender = now;
        lastCycle = cycle;
        setState((s) =>
          s.t === t && s.rewinding === rewinding && s.active && s.cycle === cycle + 1
            ? s
            : { t, rewinding, active: true, cycle: cycle + 1 },
        );
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, duration, hold, rewind, rest, tick]);

  return state;
}

/** The phase a timeline is in: the last one whose `at` (ms) has passed. */
export function phaseAt<P extends string>(t: number, phases: ReadonlyArray<readonly [P, number]>): P {
  let p = phases[0][0];
  for (const [name, at] of phases) if (t >= at) p = name;
  return p;
}

/** 0..1 progress of `t` through [from, to], clamped. */
export const span = (t: number, from: number, to: number) => Math.min(1, Math.max(0, (t - from) / (to - from)));

/** How much of `text` is typed at time `t` when typing starts at `from`, one character every `msPerChar`. */
export const typed = (text: string, t: number, from: number, msPerChar = 28) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor((t - from) / msPerChar))));
