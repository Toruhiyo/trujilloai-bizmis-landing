import { useEffect, useLayoutEffect, useRef, useState } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

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

/** True when the visitor asked for less motion. */
export const useReducedMotion = () => useMedia(REDUCED);

/**
 * `seen` turns on the first time the element is in view and stays on (it
 * starts the opening); `on` follows the viewport (loops pause off screen).
 */
export const useViewport = <T extends Element>(threshold = 0.35) => {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setOn(true);
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        setOn(e.isIntersecting);
        if (e.isIntersecting) setSeen(true);
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, on, seen };
};

/**
 * Runs a list of timed steps once, from when `start` turns true: each step
 * is [ms from start, callback]. With reduced motion only the last one runs,
 * at once (the end state, without the journey).
 */
export const useScript = (start: boolean, steps: [number, () => void][]) => {
  const reduced = useReducedMotion();
  const done = useRef(false);
  const latest = useRef(steps);
  latest.current = steps;
  useEffect(() => {
    if (!start || done.current) return;
    done.current = true;
    const all = latest.current;
    if (reduced) {
      all[all.length - 1]?.[1]();
      return;
    }
    const timers = all.map(([at, fn]) => window.setTimeout(fn, at));
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      done.current = false;
    };
  }, [start, reduced]);
};

/**
 * A loop of beats: calls `onBeat(n)` with a growing counter every `every` ms
 * while `run` is true (it resumes where it left off).
 */
export const useTicker = (run: boolean, every: number, onBeat: (n: number) => void) => {
  const n = useRef(0);
  const cb = useRef(onBeat);
  cb.current = onBeat;
  useEffect(() => {
    if (!run) return;
    const t = window.setInterval(() => cb.current(++n.current), every);
    return () => window.clearInterval(t);
  }, [run, every]);
};

/**
 * Scales a fixed-size canvas (laid out at w × h) to the width it's given,
 * never taller than `maxH` (px) and never above `maxScale`, centred.
 */
export const useStageScale = (w: number, h: number, maxH: number, maxScale = 1.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const width = el.getBoundingClientRect().width;
      if (!width) return;
      setScale(Math.min(width / w, maxH / h, maxScale));
    };
    fit();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h, maxH, maxScale]);
  return [ref, scale] as const;
};

/** The viewport's height, kept current. */
export const useViewportHeight = () => {
  const [vh, setVh] = useState(() => (typeof window !== "undefined" ? window.innerHeight : 900));
  useEffect(() => {
    const update = () => setVh(window.innerHeight);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return vh;
};
