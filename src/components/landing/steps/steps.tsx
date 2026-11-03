import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { useScrollSteps } from "@/lib/scrollSteps";
import type { ScrollSteps } from "@/lib/scrollSteps";
import { useReducedMotion } from "../sales/hooks";
import { addSnapSource } from "./settleSnap";
import type { SnapZone } from "./settleSnap";

/*
 * The stepped mode's pieces on touch screens (lib/scrollSteps): the stops a
 * swipe settles on (SnapStops, steps/settleSnap), the progress bar under a
 * docked pill (StepBar, fed by useStepsReport) and the idle "scroll on" cue
 * at its end (IdleCue). None of them does anything with a mouse or trackpad.
 */

/** Where a beat rests, in beat lengths from its start (its stop): the middle of its stretch. */
export const STEP_REST = 0.5;
/** Timed beats: the share of a beat's stretch over which scrolling back rewinds it (the rest holds its end). */
export const STEP_RUN = 0.4;

/** How far before a pinned track the page still counts as in it, for the settle (share of the screen's height). */
const LEAD_IN = 0.35;

const viewH = () => document.documentElement.clientHeight || window.innerHeight;

/**
 * A pinned track's stops (put inside the track, after its pin: the pin stays
 * the track's first child): one at each of `rests` (the track's progress,
 * 0 → 1, where a beat rests), measured when a swipe settles (the track's
 * travel and the pin's sticky top). Its zone, where a settling scroll is
 * eased onto one of them, is the track's own stretch of scroll, from a third
 * of a screen before the pin sticks to where it lets go: past it the page is
 * free. Renders nothing.
 */
export const SnapStops = ({ rests }: { rests: number[] }) => {
  const flags = useScrollSteps();
  const reduced = useReducedMotion();
  const on = flags.snap && !reduced;
  const box = useRef<HTMLSpanElement>(null);
  const key = rests.map((v) => v.toFixed(4)).join(",");
  useEffect(() => {
    const track = box.current?.parentElement;
    const pin = track?.firstElementChild as HTMLElement | null;
    if (!on || !track || !pin) return;
    const list = key.split(",").map(Number);
    return addSnapSource((): SnapZone | null => {
      const travel = track.offsetHeight - pin.offsetHeight;
      if (travel <= 0 || getComputedStyle(pin).position !== "sticky") return null;
      const stick = parseFloat(getComputedStyle(pin).top) || 0;
      const start = track.getBoundingClientRect().top + window.scrollY - stick;
      return { from: start - viewH() * LEAD_IN, to: start + travel, stops: list.map((p) => start + p * travel) };
    });
  }, [on, key]);
  return on ? <span ref={box} hidden /> : null;
};

/**
 * A section's stop that isn't pinned (Customize): its top just under the nav.
 * Its zone runs from a third of a screen above that to where its bottom
 * reaches the screen's. Put inside the section.
 */
export const SectionStop = () => {
  const flags = useScrollSteps();
  const reduced = useReducedMotion();
  const on = flags.snap && !reduced;
  const box = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const section = box.current?.parentElement;
    if (!on || !section) return;
    return addSnapSource((): SnapZone => {
      const nav = document.getElementById("site-navbar")?.getBoundingClientRect().height ?? 0;
      const vh = viewH();
      const stop = section.getBoundingClientRect().top + window.scrollY - nav;
      return { from: stop - vh * LEAD_IN, to: stop + Math.max(0, section.offsetHeight + nav - vh), stops: [stop] };
    });
  }, [on]);
  return on ? <span ref={box} hidden /> : null;
};

/**
 * The progress bar under a docked pill: one segment a beat (no numbers),
 * filled by useStepsReport, and the idle cue's chevron at its end (IdleCue).
 * With `dots=0` only the chevron's room is there.
 */
export const StepBar = ({ count }: { count: number }) => {
  const flags = useScrollSteps();
  return (
    <span className="bzl-steps" aria-hidden="true" data-count={count} data-dots={flags.dots ? undefined : "0"}>
      {Array.from({ length: count }, (_, i) => (
        <i key={i} />
      ))}
      <svg className="bzl-cue" viewBox="0 0 12 8">
        <path d="M1.5 1.75l4.5 4.5 4.5-4.5" />
      </svg>
    </span>
  );
};

/** Whether the pills carry the bar (the progress, or the idle cue at its end). */
export const stepBarOn = (flags: ScrollSteps) => flags.dots || flags.cue;

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
 * A pinned section tells the stepped mode's pieces where it is: `count` beats, the
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
  const flags = useScrollSteps();
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
  const lastFill = useRef("");
  useLayoutEffect(() => {
    if (!flags.on || !active) return;
    // (the section's place in its scene, for whoever needs it: the visual suite waits on it)
    const fillText = `${index}:${(Math.floor(f * 100) / 100).toFixed(2)}`;
    if (lastFill.current !== fillText) {
      lastFill.current = fillText;
      const section = anchor.current?.closest("section");
      if (section) section.dataset.stepFill = fillText;
    }
    if (!flags.dots) return;
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
  const flags = useScrollSteps();
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
