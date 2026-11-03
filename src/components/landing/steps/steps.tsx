import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { scrollSteps } from "@/lib/scrollSteps";
import { useReducedMotion } from "../sales/hooks";

/*
 * The ?scroll=steps trial's pieces (lib/scrollSteps), each on its own switch:
 * the soft snap in a pinned track (SnapMarks), the progress bar under a
 * docked pill (StepBar, fed by useStepsReport) and the idle "scroll on" cue
 * at its end (IdleCue). None of them renders anything without the flag.
 */

/** Where a beat rests, in beat lengths from its start (the snap's point): the middle of its stretch. */
export const STEP_REST = 0.5;
/** Timed beats: the share of a beat's stretch over which scrolling back rewinds it (the rest holds its end). */
export const STEP_RUN = 0.4;

const COARSE = "(hover: none) and (pointer: coarse)";

/** How many SnapMarks are on the page: the snap is on while there are any. */
let marks = 0;
const setSnap = (on: boolean) => {
  const root = document.documentElement;
  if (on) {
    root.dataset.bzlSnap = "on";
    root.classList.add("bzl-snap");
  } else {
    delete root.dataset.bzlSnap;
    root.classList.remove("bzl-snap");
  }
};

/**
 * The soft snap in a pinned track (put inside the track, after its pin: the
 * pin stays the track's first child): a point at each of `rests` (the track's
 * progress, 0 → 1, where a beat rests), placed from the track's travel and the
 * pin's sticky top (measured), aligned to the screen's top. The page's root
 * snaps to them by proximity only (html.bzl-snap, scroll-steps.css), never
 * mandatory, and no event is touched.
 *
 * Only when asked for (snap=touch: touch screens, snap=all: everywhere; never
 * with reduced motion). Both Chrome and Safari snap to a point within a third
 * of a screen of where a scroll stops, whichever way it went: a fling lands on
 * a beat, but a slow drag on a phone, a wheel notch or a small trackpad move
 * is pulled back where it started. (Tried and dropped: "covering" areas, free
 * inside a beat and snapping only near the seam between two; Chrome cuts an
 * area's free stretch short a screen before the next, and Safari had no way
 * back across a seam for a short scroll up.)
 */
export const SnapMarks = ({ rests }: { rests: number[] }) => {
  const [flags] = useState(scrollSteps);
  const reduced = useReducedMotion();
  const [touch] = useState(() => typeof window !== "undefined" && window.matchMedia?.(COARSE).matches === true);
  const on = !reduced && (flags.snap === "all" || (flags.snap === "touch" && touch));
  const box = useRef<HTMLSpanElement>(null);
  const [tops, setTops] = useState<number[]>([]);
  const key = rests.map((v) => v.toFixed(4)).join(",");

  useEffect(() => {
    if (!on) return;
    marks += 1;
    setSnap(true);
    return () => {
      marks -= 1;
      if (!marks) setSnap(false);
    };
  }, [on]);

  useLayoutEffect(() => {
    const track = box.current?.parentElement;
    const pin = track?.firstElementChild as HTMLElement | null;
    if (!on || !track || !pin) return;
    const measure = () => {
      const travel = track.offsetHeight - pin.offsetHeight;
      const stick = parseFloat(getComputedStyle(pin).top) || 0;
      setTops(key.split(",").map((p) => Math.round(Number(p) * travel - stick)));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(pin);
    return () => ro.disconnect();
  }, [on, key]);

  if (!on) return null;
  return (
    <span ref={box} className="bzl-snaps" aria-hidden="true">
      {tops.map((top, i) => (
        <i key={i} className="bzl-snap-mark" style={{ top }} />
      ))}
    </span>
  );
};

/**
 * The progress bar under a docked pill: one segment a beat (no numbers),
 * filled by useStepsReport, and the idle cue's chevron at its end (IdleCue).
 * With `dots=0` only the chevron's room is there.
 */
export const StepBar = ({ count }: { count: number }) => (
  <span className="bzl-steps" aria-hidden="true" data-count={count} data-dots={scrollSteps().dots ? undefined : "0"}>
    {Array.from({ length: count }, (_, i) => (
      <i key={i} />
    ))}
    <svg className="bzl-cue" viewBox="0 0 12 8">
      <path d="M1.5 1.75l4.5 4.5 4.5-4.5" />
    </svg>
  </span>
);

/** Whether the pills carry the bar on this page (the progress, or the idle cue at its end). */
export const stepBarOn = () => scrollSteps().dots || scrollSteps().cue;

/* ── the idle cue's state: the sections whose beat has played to its end (when, and their bar) ── */
const ready = new Map<string, { at: number; bar: HTMLElement | null }>();
const listeners = new Set<() => void>();
const setReady = (id: string, on: boolean, bar: HTMLElement | null) => {
  if (on === ready.has(id)) return;
  if (on) ready.set(id, { at: performance.now(), bar });
  else ready.delete(id);
  listeners.forEach((l) => l());
};

let ids = 0;

/**
 * A pinned section tells the trial's pieces where it is: `count` beats, the
 * one on (`index`) and how far it has played (`fill`, 0 → 1), while `active`.
 * It fills the segments of the StepBar in the docked pill over `anchor` (the
 * pill of the PillarIntro it sits in), written straight on them (no
 * re-render), and, once the beat on has played to its end, lets the IdleCue
 * know.
 */
export const useStepsReport = (
  anchor: RefObject<Element | null>,
  { count, index, fill, active }: { count: number; index: number; fill: number; active: boolean },
) => {
  const [flags] = useState(scrollSteps);
  const [id] = useState(() => `s${(ids += 1)}`);
  const bar = useRef<HTMLElement | null>(null);
  const last = useRef<string[]>([]);
  // the beat on has reached its end once (stays so through its replay; a new beat starts over)
  const done = useRef({ index: -1, on: false });
  const f = Math.min(1, Math.max(0, fill));
  if (done.current.index !== index || !active) done.current = { index, on: false };
  if (active && f >= 0.999) done.current.on = true;
  const finished = done.current.on;

  // (only while on: a section may hold two reporters, one of them idle for the layout it's in)
  const find = () => {
    if (!bar.current || !bar.current.isConnected)
      bar.current = anchor.current?.closest(".pi")?.querySelector<HTMLElement>(".pi-dock .bzl-steps") ?? null;
    return bar.current;
  };
  useLayoutEffect(() => {
    if (!flags.dots || !active) return;
    const el = find();
    if (!el) return;
    const kids = el.children;
    const n = Math.min(count, kids.length);
    // (the segment after the one on: the idle cue's glow)
    if (el.dataset.on !== String(index)) {
      el.dataset.on = String(index);
      for (let i = 0; i < n; i++) kids[i].classList.toggle("is-next", i === index + 1);
    }
    for (let i = 0; i < n; i++) {
      // (in hundredths: a write a few times a second, not every frame)
      const v = (i < index ? 1 : i === index ? Math.floor(f * 100) / 100 : 0).toFixed(2);
      if (last.current[i] === v) continue;
      last.current[i] = v;
      (kids[i] as HTMLElement).style.setProperty("--f", v);
    }
  });

  useEffect(() => {
    if (!flags.cue) return;
    setReady(id, active && finished, active && finished ? find() : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flags.cue, id, active, finished]);
  useEffect(() => () => setReady(id, false, null), [id]);
};

/** The idle cue: after a beat has played to its end and the page has rested this long (ms). */
const IDLE = 2200;
/** At most this many times a visit (a page load). */
const MAX_SHOWS = 2;
let shows = 0;

/**
 * The idle cue, "scroll on": once a pinned section's beat has played to its
 * end and nothing has scrolled for a couple of seconds, a small chevron nods
 * at the end of its progress bar under the docked pill (the next segment
 * glowing), gone the moment the page scrolls; at most twice a visit. In the
 * pill's own room, so never over the content (a section without a pill,
 * Setup, has no cue). Mounted once for the page.
 */
export const IdleCue = () => {
  const [flags] = useState(scrollSteps);
  useEffect(() => {
    if (!flags.cue) return;
    let lastScroll = performance.now();
    let shown: HTMLElement | null = null;
    let timer = 0;
    const hide = () => {
      shown?.classList.remove("is-cue");
      shown = null;
    };
    const check = () => {
      timer = 0;
      if (shown || shows >= MAX_SHOWS || !ready.size) return;
      const entries = [...ready.values()].filter((r) => r.bar?.isConnected);
      if (!entries.length) return;
      const latest = entries.reduce((a, b) => (b.at > a.at ? b : a));
      const wait = Math.max(lastScroll, latest.at) + IDLE - performance.now();
      if (wait > 0) {
        timer = window.setTimeout(check, wait + 20);
        return;
      }
      shows += 1;
      shown = latest.bar;
      shown?.classList.add("is-cue");
    };
    const arm = () => {
      window.clearTimeout(timer);
      timer = 0;
      check();
    };
    const onScroll = () => {
      lastScroll = performance.now();
      hide();
      if (!timer && ready.size && shows < MAX_SHOWS) timer = window.setTimeout(check, IDLE + 20);
    };
    listeners.add(arm);
    window.addEventListener("scroll", onScroll, { passive: true });
    arm();
    return () => {
      listeners.delete(arm);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
      hide();
    };
  }, [flags.cue]);
  return null;
};
