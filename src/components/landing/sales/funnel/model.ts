import { useEffect, useRef, useState } from "react";

/**
 * The at-scale funnel's (illustrative) model: of every shopper who visits,
 * how many find a fit (discovery), how many of those decide (decision) and
 * how many of those carts become orders (checkout), without Bizmis and with
 * it. Shapes only: no figure is ever printed, and none is a claim.
 */
export const BASE = [0.4, 0.36, 0.52];
export const BOOST = [0.64, 0.58, 0.8];

/** The pass rate of stage `i` with Bizmis `k` (0 → 1) of the way in. */
export const rate = (i: number, k: number) => BASE[i] + (BOOST[i] - BASE[i]) * k;

/** How many of the visitors are left after each stage: [visits, fit, decided, ordered]. */
export const flows = (k: number[]) => {
  const out = [1];
  for (let i = 0; i < 3; i++) out.push(out[i] * rate(i, k[i] ?? 0));
  return out;
};

/** Ease `cur` toward `target` (exponential, `tau` seconds). */
export const approach = (cur: number, target: number, dt: number, tau = 0.55) =>
  target + (cur - target) * Math.exp(-dt / tau);

/** What a concept gets: Bizmis on each stage (0 → 1), the stage in focus (3 = all), and whether it plays. */
export type ConceptProps = {
  boost: number[];
  focus: number;
  play: boolean;
  reduced: boolean;
  steps: string[];
  left: string;
};

/** Without Bizmis, then with it (a beat to see the leaks first), on a loop while it plays. */
const OFF_MS = 1600;
const ON_MS = 5600;

/**
 * The funnel's switch: "with Bizmis" on a loop (off for a breath, then on)
 * while it plays, restarting off each time the focus moves or it comes back on
 * screen; a click takes it over until then. Reduced motion rests on "with". With
 * Bizmis on, every stage up to the focus is plugged.
 */
export const useFunnelSwitch = (focus: number, play: boolean, reduced: boolean) => {
  const [on, setOn] = useState(reduced);
  const [manual, setManual] = useState<boolean | null>(null);
  // a new stage (or coming back on screen) starts over, without Bizmis first
  useEffect(() => {
    setManual(null);
    setOn(reduced);
  }, [focus, reduced, play]);
  useEffect(() => {
    if (manual !== null || reduced || !play) return;
    const t = window.setTimeout(() => setOn((v) => !v), on ? ON_MS : OFF_MS);
    return () => window.clearTimeout(t);
  }, [on, manual, reduced, play]);
  const value = manual ?? on;
  const boost = [0, 1, 2].map((i) => (value && (focus >= 3 || i <= focus) ? 1 : 0));
  return { on: value, set: setManual, boost };
};

/** A value per stage that eases toward its target each frame (for canvas / SVG loops). */
export const useEased = (target: number[]) => {
  const cur = useRef(target.slice());
  const tgt = useRef(target);
  tgt.current = target;
  const step = (dt: number) => {
    let moving = false;
    cur.current = cur.current.map((c, i) => {
      const n = approach(c, tgt.current[i], dt);
      if (Math.abs(n - tgt.current[i]) > 0.002) moving = true;
      return Math.abs(n - tgt.current[i]) > 0.002 ? n : tgt.current[i];
    });
    return moving;
  };
  return { cur, tgt, step };
};

/** A seeded random stream, so the crowd and the flow look the same on every load. */
export const seeded = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** The agent working each stage: the real Bizmis head renders, one per mockup. */
export const STAGE_HEADS = ["amber", "mia", "luca"];
