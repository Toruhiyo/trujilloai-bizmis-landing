import { useEffect, useRef, useState } from "react";
import type { PinState } from "./pillar/BenefitIntro";
import { useReducedMotion, useRewinding } from "./sales/hooks";

/**
 * Sales' useScrollPlay (sales/hooks) with its rest hold as a parameter, for
 * Customer Support, whose cases should move on sooner: a scene's clock, half
 * scroll, half time (ms along a timeline of `duration`). The scroll sets
 * `target`; scrolling on pulls the clock up to it, scrolling back rewinds it
 * to it (a quick ease, never a jump). When the scroll rests, it plays on at
 * 1x to the end, holds it `hold` ms, rewinds to the start (REWIND) and plays
 * again. Inactive, it sits on `target`. Reduced motion: it sits on the end.
 */
const REWIND = 1000;

export const useScrollPlayHold = (rawTarget: number, duration: number, active: boolean, hold: number) => {
  const target = Math.min(duration, Math.max(0, rawTarget));
  const reduced = useReducedMotion();
  const [t, setT] = useState(target);
  const tgt = useRef(target);
  const cur = useRef(target);
  const dur = useRef(duration);
  tgt.current = target;
  dur.current = duration;
  useEffect(() => {
    if (!active || reduced) {
      cur.current = tgt.current;
      setT(tgt.current);
      return;
    }
    cur.current = tgt.current;
    setT(tgt.current);
    let raf = 0;
    let last = performance.now();
    let prev = tgt.current;
    let phase: "play" | "hold" | "rewind" = "play";
    let since = 0;
    let from = 0;
    let back = false;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(100, now - last);
      last = now;
      const d = dur.current;
      const target = tgt.current;
      let next = cur.current;
      if (target > prev + 0.5) {
        phase = "play";
        back = false;
        next = Math.min(d, Math.max(target, next + dt));
      } else if ((target < prev - 0.5 || back) && target < next - 0.5) {
        phase = "play";
        back = true;
        next = Math.max(target, next + (target - next) * 0.22 - dt * 0.6);
      } else if (back) {
        back = false;
        next = target;
      } else if (phase === "play") {
        next = Math.min(d, next + dt);
        if (next >= d) {
          phase = "hold";
          since = now;
        }
      } else if (phase === "hold") {
        if (now - since >= hold) {
          phase = "rewind";
          since = now;
          from = next;
        }
      } else {
        const k = Math.min(1, (now - since) / REWIND);
        next = from * (1 - (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2));
        if (k >= 1) {
          next = 0;
          phase = "play";
        }
      }
      prev = target;
      if (next !== cur.current) {
        cur.current = next;
        setT(next);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, reduced, hold]);
  return reduced ? (active ? duration : target) : active ? Math.min(t, duration) : target;
};

/** A pinned section's scene clock (as BenefitIntro's useScenePlay), with its rest hold as a parameter. */
export const usePinScene = ({ pinned, progress, active, from = 0, to = 1 }: PinState, duration: number, hold: number) => {
  const target = Math.min(1, Math.max(0, (progress - from) / Math.max(0.01, to - from))) * duration;
  return useScrollPlayHold(pinned ? target : 0, duration, pinned && active, hold);
};

/**
 * BenefitIntro's useScenePlay with its rest hold as a parameter (for Store
 * Insights, whose drawing should replay soon, not after FIXED_HOLD's 6 s):
 * the clock (`t`), `rewinding` while it runs back, and `replay`, the times
 * it came back to its start after reaching its end.
 */
export const useScenePlayHold = (pin: PinState, duration: number, hold: number) => {
  const t = usePinScene(pin, duration, hold);
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
