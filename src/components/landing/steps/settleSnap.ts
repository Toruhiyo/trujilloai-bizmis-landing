/**
 * The touch screens' snap (lib/scrollSteps): after a swipe has settled
 * (finger up, momentum spent), the page eases onto a stop. Not CSS
 * scroll-snap: Chrome and Safari snap to any point within a third of a
 * screen of where a scroll stops, whichever way it went, so a slow drag of
 * a third of a screen came straight back (tried: it fought the reader).
 *
 * The stops come from the sections (steps/SnapStops, SectionStop), each with
 * its zone: the stretch of scroll where it applies. When a touch swipe
 * settles inside a zone:
 * - a deliberate move (DELIBERATE px or more) always reaches the next stop
 *   the way it went, from where it started, if that stop is within a screen
 *   of where it stopped; if the momentum carried it past, the nearest stop
 *   ahead (within half a screen) or else the one just passed; with no stop
 *   ahead in its zone it's on its way out, and free;
 * - a small move only settles onto a stop it stopped near (NEAR);
 * - a tap does nothing.
 * Outside every zone (an opener, the footer) the page is free. Nothing
 * listens to a wheel, a key or the page scrolling itself (nav links, the way
 * back), and a touch, a wheel or a key stops an ease at once. No event is
 * ever cancelled.
 */
export type SnapZone = { from: number; to: number; stops: number[] };
type Source = () => SnapZone | null;

const sources = new Set<Source>();

/** A swipe of at least this many px is deliberate: it goes on to the next stop. */
const DELIBERATE = 40;
/** A smaller move settles onto a stop only this close (share of the screen's height). */
const NEAR = 0.2;
/** A scroll counts as settled after this long without moving (ms), where `scrollend` isn't there. */
const SETTLE = 140;

let touching = false;
let pending = false;
let startY = 0;
let timer = 0;
let raf = 0;
let easing = false;
let detach: (() => void) | null = null;

const vh = () => document.documentElement.clientHeight || window.innerHeight;
const setY = (y: number) => window.scrollTo({ top: y, left: 0, behavior: "instant" as ScrollBehavior });

/** Stops an ease in progress (a touch, a wheel, a key, or the page scrolling itself). */
export const cancelSettle = () => {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  easing = false;
  pending = false;
  window.clearTimeout(timer);
};

const ease = (to: number) => {
  const from = window.scrollY;
  const dist = to - from;
  if (Math.abs(dist) < 2) return;
  const dur = Math.min(620, 240 + Math.abs(dist) * 0.4);
  const t0 = performance.now();
  easing = true;
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / dur);
    setY(from + dist * (1 - (1 - k) ** 3));
    if (k < 1) raf = requestAnimationFrame(step);
    else {
      raf = 0;
      // (its own last scroll events are not a swipe to settle)
      requestAnimationFrame(() => (easing = false));
    }
  };
  raf = requestAnimationFrame(step);
};

/** Where a swipe from `start` that stopped at `end` should settle, or null. */
export const pickStop = (zones: SnapZone[], start: number, end: number, screen: number): number | null => {
  const zone = zones.find((z) => end >= z.from && end <= z.to);
  if (!zone || !zone.stops.length) return null;
  const stops = [...zone.stops].sort((a, b) => a - b);
  const delta = end - start;
  if (Math.abs(delta) < 6) return null;
  if (Math.abs(delta) < DELIBERATE) {
    const near = stops.reduce((a, b) => (Math.abs(b - end) < Math.abs(a - end) ? b : a));
    return Math.abs(near - end) <= screen * NEAR ? near : null;
  }
  const dir = Math.sign(delta);
  const ahead = (from: number) => (dir > 0 ? stops.find((s) => s > from + 1) : [...stops].reverse().find((s) => s < from - 1));
  // the next stop from where it started: reached unless it's far beyond where the swipe stopped
  const next = ahead(start);
  // (no stop ahead the way it went: it's on its way out, free)
  if (next === undefined) return null;
  if ((next - end) * dir > 0) return Math.abs(next - end) <= screen ? next : null;
  // carried past it: the nearest stop ahead if it's close, else the one just passed
  const beyond = ahead(end);
  if (beyond !== undefined && Math.abs(beyond - end) <= screen * 0.5) return beyond;
  const passed = dir > 0 ? [...stops].reverse().find((s) => s <= end) : stops.find((s) => s >= end);
  return passed !== undefined && Math.abs(end - passed) <= screen * 0.5 ? passed : null;
};

const settle = () => {
  window.clearTimeout(timer);
  if (!pending || touching || easing) return;
  pending = false;
  const zones = [...sources].map((s) => s()).filter((z): z is SnapZone => z !== null);
  const to = pickStop(zones, startY, window.scrollY, vh());
  if (to !== null) ease(Math.max(0, Math.min(to, document.documentElement.scrollHeight - vh())));
};

const attach = () => {
  const onStart = () => {
    cancelSettle();
    touching = true;
    startY = window.scrollY;
  };
  const onEnd = () => {
    touching = false;
    pending = true;
    // (a lift without a scroll after it: settle from here; one with momentum waits for it to end)
    window.clearTimeout(timer);
    timer = window.setTimeout(settle, SETTLE);
  };
  const onScroll = () => {
    if (easing || touching || !pending) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(settle, SETTLE);
  };
  const onOther = () => cancelSettle();
  const opts = { passive: true, capture: true } as const;
  window.addEventListener("touchstart", onStart, opts);
  window.addEventListener("touchend", onEnd, opts);
  window.addEventListener("touchcancel", onEnd, opts);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("scrollend", settle);
  window.addEventListener("wheel", onOther, opts);
  window.addEventListener("keydown", onOther, opts);
  return () => {
    cancelSettle();
    window.removeEventListener("touchstart", onStart, opts);
    window.removeEventListener("touchend", onEnd, opts);
    window.removeEventListener("touchcancel", onEnd, opts);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("scrollend", settle);
    window.removeEventListener("wheel", onOther, opts);
    window.removeEventListener("keydown", onOther, opts);
  };
};

/** A section's stops, measured when a swipe settles; returns its removal. Listening starts with the first. */
export const addSnapSource = (source: Source) => {
  sources.add(source);
  if (!detach) detach = attach();
  return () => {
    sources.delete(source);
    if (!sources.size && detach) {
      detach();
      detach = null;
    }
  };
};
