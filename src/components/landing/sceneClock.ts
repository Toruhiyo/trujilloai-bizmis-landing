import { useEffect, useRef, useState } from "react";
import type { PinState } from "./pillar/BenefitIntro";
import { useRewinding, useScrollPlay } from "./sales/hooks";

/**
 * Sales' useScrollPlay (sales/hooks) with its rest hold as a parameter, for
 * Customer Support, whose cases should move on sooner: a scene's clock, half
 * scroll, half time (ms along a timeline of `duration`). The scroll sets
 * `target`; scrolling on pulls the clock up to it, scrolling back rewinds it
 * to it (a quick ease, never a jump). When the page's scroll rests, it plays
 * on at 1x to the end, holds it `hold` ms, rewinds to the start and plays
 * again. Inactive, it sits on `target`. Reduced motion: it sits on the end.
 */
export const useScrollPlayHold = (rawTarget: number, duration: number, active: boolean, hold: number) =>
  useScrollPlay(rawTarget, duration, active, hold);

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
