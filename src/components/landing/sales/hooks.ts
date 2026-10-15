import { useCallback, useEffect, useRef, useState } from "react";
import type { RewindLoopOptions } from "../useRewindLoop";
import { useScrollClock } from "./useScrollClock";

const query = "(prefers-reduced-motion: reduce)";

/** True when the visitor asked for less motion (tracks changes). */
export const useReducedMotion = () => {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.(query).matches === true,
  );
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const update = () => setReduced(mq.matches);
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
};

/** Live "is it on screen" (unlike Reveal's useInView, it turns off again). */
export const useOnScreen = <T extends Element>(threshold = 0.35) => {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => setOn(e.isIntersecting),
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, on] as const;
};

/**
 * A scene's timeline (see useRewindLoop): it plays from its start when its
 * sentinel (a box over the scene, see <Sentinel>) comes into view, then
 * rewinds fast right away (no hold: the hook's default), and plays again;
 * leaving resets it. Pass `play: false`
 * to hide the sentinel, which counts as out of view: a pinned stage uses it
 * so each beat starts over the moment it becomes the active one. A beat's
 * mockup and funnel share one scene (one clock), so they rewind together.
 * Renders
 * every frame by default (tick 0), since the scenes derive motion from `t`.
 */
export const useScene = (
  duration: number,
  play?: boolean,
  opts: Omit<RewindLoopOptions, "duration"> = {},
) => {
  const sentinel = useRef<HTMLSpanElement>(null);
  // the rewind loop, on a clock that speeds up while the page scrolls fast (useScrollClock)
  const loop = useScrollClock(sentinel, {
    duration,
    rewind: 1000,
    threshold: 0.3,
    tick: 0,
    ...opts,
  });
  return { ...loop, sentinel, off: play === false };
};

/** Ease in and out (smoothstep-ish cubic). */
export const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
/** Ease out with a little overshoot: a pop. */
export const easeOutBack = (k: number) => {
  const c = 1.9;
  return k <= 0 ? 0 : k >= 1 ? 1 : 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2;
};
/** A 0 → 1 → 0 bump centred at `at + dur / 2`, `dur` ms long. */
export const bump = (t: number, at: number, dur: number) => {
  const k = (t - at) / dur;
  return k <= 0 || k >= 1 ? 0 : Math.sin(Math.PI * k);
};

/**
 * Which of a list of panels is "the one being read": the panel crossing the
 * viewport's reading line (45% down), else the nearest one. `setRef(i)` goes
 * on each panel.
 */
export const useActivePanel = (line = 0.45) => {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const y = window.innerHeight * line;
      let best = 0;
      let bestD = Infinity;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = r.top > y ? r.top - y : r.bottom < y ? y - r.bottom : 0;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [line]);
  const setRef = useCallback(
    (i: number) => (el: HTMLElement | null) => {
      refs.current[i] = el;
    },
    [],
  );
  return { active, setRef };
};

/**
 * For a pinned section (a tall track with a sticky stage as its first
 * child): how far the stage has been scrolled through, 0 → 1. Honours the
 * stage's own sticky `top` (e.g. under a docked header).
 */
export const usePinProgress = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const pin = el.firstElementChild as HTMLElement | null;
      const top = pin ? parseFloat(getComputedStyle(pin).top) || 0 : 0;
      const travel = r.height - (pin ? pin.offsetHeight : window.innerHeight);
      setProgress(travel > 0 ? Math.min(1, Math.max(0, (top - r.top) / travel)) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return [ref, progress] as const;
};

/** True while the media query matches. */
export const useMedia = (q: string) => {
  const [on, setOn] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.(q).matches === true,
  );
  useEffect(() => {
    const mq = window.matchMedia?.(q);
    if (!mq) return;
    const update = () => setOn(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, [q]);
  return on;
};
