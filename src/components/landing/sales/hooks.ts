import { useCallback, useEffect, useRef, useState } from "react";

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
 * A mockup's beats: steps through `durations` (ms each) on a loop while
 * `play` is true, from the first beat every time it starts again. With
 * reduced motion it rests on the last beat (the outcome), without moving.
 */
export const useBeats = (durations: number[], play: boolean) => {
  const reduced = useReducedMotion();
  const last = durations.length - 1;
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    if (!play) setBeat(0);
  }, [play]);
  useEffect(() => {
    if (!play || reduced) return;
    const t = window.setTimeout(
      () => setBeat((b) => (b + 1) % durations.length),
      durations[beat],
    );
    return () => window.clearTimeout(t);
  }, [beat, play, reduced, durations]);
  return reduced ? last : beat;
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
 * For a pinned section (a tall track with a sticky stage inside): how far
 * the stage has been scrolled through, 0 → 1.
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
      const travel = r.height - window.innerHeight;
      setProgress(travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0);
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
