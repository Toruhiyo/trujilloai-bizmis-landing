import { useEffect, useRef, useState, type RefObject } from "react";
import type { RewindLoop, RewindLoopOptions } from "../useRewindLoop";

/**
 * The page's scroll speed, shared by every beat: a smoothed |px per ms|,
 * decaying back to 0 when the scrolling stops. One listener for the page.
 */
const scroll = { v: 0, y: 0, at: 0, users: 0 };
const onScroll = () => {
  const now = performance.now();
  const y = window.scrollY;
  const dt = Math.max(8, now - scroll.at);
  const v = Math.abs(y - scroll.y) / dt;
  // quick to rise, smoothed
  scroll.v = Math.max(v, scroll.v * 0.6 + v * 0.4);
  scroll.y = y;
  scroll.at = now;
};
const watchScroll = () => {
  if (scroll.users++ === 0) {
    scroll.y = window.scrollY;
    scroll.at = performance.now();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
  return () => {
    if (--scroll.users === 0) window.removeEventListener("scroll", onScroll);
  };
};

/** How fast a beat's clock runs: 1× at rest, up to MAX× while the page scrolls fast. */
const MAX = 6;
/** px per ms of scroll for each extra 1× (1.4 px/ms ≈ a brisk flick → ~2×). */
const PER = 0.7;
export const scrollSpeed = (now: number) => {
  // the speed fades out over ~350 ms once the scrolling stops
  const idle = now - scroll.at;
  const v = scroll.v * Math.exp(-Math.max(0, idle - 60) / 180);
  return Math.min(MAX, 1 + v / PER);
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * useRewindLoop (same options, same result), with one difference: the
 * clock is integrated frame by frame at a speed that follows the page's
 * scroll velocity. Scrolled through quickly, a beat plays its whole change
 * faster (up to MAX×) instead of being skipped, so the viewer still sees it
 * happen; at rest it plays at 1×. Its rewind and rest are sped up the same.
 */
export function useScrollClock(
  ref: RefObject<Element | null>,
  { duration, hold = 0, rewind = 900, rest = 500, threshold = 0.35, tick = 1000 / 30, onFrame, paused = false }: RewindLoopOptions,
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

  useEffect(() => (reduced ? undefined : watchScroll()), [reduced]);

  useEffect(() => {
    if (reduced) {
      frameCb.current?.(duration, false);
      return;
    }
    if (!inView) {
      frameCb.current?.(0, false);
      setState((s) => ({ t: 0, rewinding: false, active: false, cycle: s.cycle }));
      return;
    }
    const play = duration;
    const total = play + hold + rewind + rest;
    let elapsed = 0;
    let last = performance.now();
    let lastRender = -Infinity;
    let lastCycle = -1;
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      // (a long gap, e.g. a background tab, counts as a short one)
      const dt = Math.min(250, now - last);
      last = now;
      if (pausedRef.current) return;
      elapsed += dt * scrollSpeed(now);
      const cycle = Math.floor(elapsed / total);
      const e = elapsed - cycle * total;
      let t: number;
      let rewinding = false;
      if (e < play) t = e;
      else if (e < play + hold) t = play;
      else if (e < play + hold + rewind) {
        rewinding = true;
        const k = (e - play - hold) / rewind;
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
