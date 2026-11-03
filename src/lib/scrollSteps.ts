import { useSyncExternalStore } from "react";

/**
 * How the landing's pinned, scroll-driven sections play, by device:
 *
 * - Mouse or trackpad (a fine pointer that hovers): the scroll drives each
 *   scene's clock (sales/hooks useScrollPlay), the tracks as long as their
 *   scenes; nothing below applies.
 * - Touch screens (`(hover: none) and (pointer: coarse)`: phones, tablets):
 *   stepped. The scroll only picks the beat, which plays by time at its own
 *   speed (a fling never flashes through one); the tracks are about a screen
 *   a beat; a thin bar under the docked pill shows the beats and fills as
 *   one plays; a small chevron at its end nods once a beat has played out
 *   and the page has rested; and the page settles on a stop after a swipe
 *   (steps/settleSnap).
 *
 * Decided at load and again whenever the media query changes (a tablet
 * gaining a trackpad). The address can override it, for debugging:
 * `?scroll=steps` / `?scroll=legacy` force one or the other, and with
 * steps on, `time=0` (beats scrubbed by the scroll), `snap=0`, `dots=0`,
 * `cue=0`, `short=0` (the tracks keep their length), `fling=skip|queue`
 * (default: a beat being watched finishes at 2x before the one the scroll is
 * on comes on; beats only flown past are skipped).
 */
export type ScrollSteps = {
  on: boolean;
  /** Beats play by time; the scroll only picks which one (useScrollPlay). */
  time: boolean;
  /** The page settles on a stop after a touch swipe (steps/settleSnap). */
  snap: boolean;
  dots: boolean;
  cue: boolean;
  /** About a screen of scroll a beat (else the tracks keep their length). */
  short: boolean;
  /** The scroll ahead of the beat on screen: a beat being watched finishes first (at 2x), skip at once, or every beat in turn. */
  fling: "finish" | "skip" | "queue";
};

const OFF: ScrollSteps = { on: false, time: false, snap: false, dots: false, cue: false, short: false, fling: "finish" };

/** A touch screen: no hover, a coarse pointer. */
export const TOUCH_QUERY = "(hover: none) and (pointer: coarse)";

const touchDevice = () => typeof window !== "undefined" && window.matchMedia?.(TOUCH_QUERY).matches === true;

const parse = (search: string, touch: boolean): ScrollSteps => {
  const q = new URLSearchParams(search);
  const forced = q.get("scroll");
  const on = forced === "steps" ? true : forced === "legacy" ? false : touch;
  if (!on) return OFF;
  const flag = (name: string, fallback = true) => {
    const v = q.get(name);
    return v === null ? fallback : !(v === "0" || v === "off" || v === "false");
  };
  const time = flag("time");
  const fling = q.get("fling");
  return {
    on: true,
    time,
    snap: flag("snap"),
    dots: flag("dots"),
    cue: flag("cue"),
    // (scrubbed beats on a short track would only scrub faster: short follows time unless told)
    short: flag("short", time),
    fling: fling === "queue" ? "queue" : fling === "skip" ? "skip" : "finish",
  };
};

let cache: { key: string; value: ScrollSteps } | null = null;

/** How the pinned sections play on this device, now (the same object while nothing changes). */
export const scrollSteps = (): ScrollSteps => {
  if (typeof window === "undefined") return OFF;
  const touch = touchDevice();
  const key = `${touch ? 1 : 0}${window.location.search}`;
  if (!cache || cache.key !== key) cache = { key, value: parse(window.location.search, touch) };
  return cache.value;
};

const subscribe = (onChange: () => void) => {
  const mq = typeof window !== "undefined" ? window.matchMedia?.(TOUCH_QUERY) : undefined;
  mq?.addEventListener?.("change", onChange);
  return () => mq?.removeEventListener?.("change", onChange);
};

/** scrollSteps(), live: the component renders again if the device's kind changes. */
export const useScrollSteps = (): ScrollSteps => useSyncExternalStore(subscribe, scrollSteps, () => OFF);
