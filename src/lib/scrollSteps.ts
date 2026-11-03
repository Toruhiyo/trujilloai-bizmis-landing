import { VISUAL_TEST } from "@/lib/visualTest";

/**
 * A trial of another scroll mechanic for the landing's pinned sections
 * (stepped scrollytelling), behind a URL flag so it can be compared with the
 * page as it is: `/?scroll=steps` turns it on; each part can be switched
 * off on its own (and the snap, off by default, on):
 *
 * - `time=0`  the beats stay scrubbed by the scroll (as today) instead of
 *             playing by time once the scroll has picked them
 * - `snap=touch` / `snap=all` the soft snap, OFF by default: a point at each
 *             beat's resting place, snapped to by proximity (`touch`: on touch
 *             screens only; `all`: mice and trackpads too). Flings land on a
 *             beat, never between two; but Chrome and Safari both pull any
 *             scroll that stops within a third of a screen of a point back
 *             onto it, whichever way it went: a slow drag on a phone, a wheel
 *             notch, a small trackpad move (and Safari's arrow keys) went
 *             nowhere. It fought the reader, so it's off unless asked for.
 * - `dots=0`  no progress bar under the docked pill
 * - `cue=0`   no idle "scroll on" chevron
 * - `short=0` the pinned tracks keep today's length (they're about a screen a beat with `time`)
 * - `fling=`   when the scroll runs ahead of the beat on screen. Default
 *             `finish`: a beat being watched (it has played a second or so)
 *             finishes at 2x before the one the scroll is on comes on; beats
 *             only flown past are skipped. `skip`: the beat the scroll is
 *             on comes on at once. `queue`: every beat in turn, each
 *             finishing at 2x.
 *
 * Without `scroll=steps` (and always under the visual regression suite) none
 * of it exists: the page is exactly as it was. Read from the address once per
 * page (the flag lives in the URL: a link to "/" without it is the page as
 * usual).
 */
export type ScrollSteps = {
  on: boolean;
  /** Beats play by time; the scroll only picks which one (useScrollPlay). */
  time: boolean;
  /** Where the soft snap is on: nowhere (the default), touch screens, or every input. */
  snap: false | "touch" | "all";
  dots: boolean;
  cue: boolean;
  /** About a screen of scroll a beat (else the tracks keep their length). */
  short: boolean;
  /** The scroll ahead of the beat on screen: a beat being watched finishes first (at 2x), skip at once, or every beat in turn. */
  fling: "finish" | "skip" | "queue";
};

const OFF: ScrollSteps = {
  on: false,
  time: false,
  snap: false,
  dots: false,
  cue: false,
  short: false,
  fling: "finish",
};

let cache: { search: string; value: ScrollSteps } | null = null;

const parse = (search: string): ScrollSteps => {
  const q = new URLSearchParams(search);
  if (q.get("scroll") !== "steps") return OFF;
  const flag = (name: string, fallback = true) => {
    const v = q.get(name);
    return v === null ? fallback : !(v === "0" || v === "off" || v === "false");
  };
  const time = flag("time");
  return {
    on: true,
    time,
    snap: q.get("snap") === "all" ? "all" : q.get("snap") === "touch" || q.get("snap") === "1" ? "touch" : false,
    dots: flag("dots"),
    cue: flag("cue"),
    // (scrubbed beats on a short track would only scrub faster: short follows time unless told)
    short: flag("short", time),
    fling: q.get("fling") === "queue" ? "queue" : q.get("fling") === "skip" ? "skip" : "finish",
  };
};

/** The trial's switches for this page (all off without `?scroll=steps`). */
export const scrollSteps = (): ScrollSteps => {
  if (typeof window === "undefined" || VISUAL_TEST) return OFF;
  const search = window.location.search;
  if (!cache || cache.search !== search) cache = { search, value: parse(search) };
  return cache.value;
};

/**
 * The soft snap (scroll-steps.css: `html.bzl-snap`) set aside while the page
 * scrolls itself (a nav link, a way back, a turn of the phone), so it lands
 * where it was sent: off now, back once the page has stood still a moment
 * (and at least `min` ms). A no-op without the trial.
 */
let held = 0;
let moved = 0;
const onMove = () => {
  moved = performance.now();
};
export const holdSnap = (min = 300): void => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (root.dataset.bzlSnap !== "on") return;
  root.classList.remove("bzl-snap");
  const until = performance.now() + min;
  moved = performance.now();
  window.clearTimeout(held);
  window.addEventListener("scroll", onMove, { passive: true });
  const check = () => {
    const now = performance.now();
    if (now < until || now - moved < 200) {
      held = window.setTimeout(check, 100);
      return;
    }
    held = 0;
    window.removeEventListener("scroll", onMove);
    if (root.dataset.bzlSnap === "on") root.classList.add("bzl-snap");
  };
  held = window.setTimeout(check, 100);
};

