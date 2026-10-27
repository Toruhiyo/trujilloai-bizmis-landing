import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";

/**
 * The opener's morph into the docked bar (PillarIntro), scrubbed by the
 * scroll.
 *
 * The big opener and the bar mark their pieces with `data-pm` keys ("icon",
 * "area", "title", "sub", …). A key on both sides is a PAIR: the big piece
 * flies (translate + one scale, the size and the row settling ahead of the
 * height) from where it sits in the page to its place in the bar, while its
 * bar twin flies the same path from the other end, and they cross-fade on
 * the way: late and short when it's the same
 * text (it simply lands), earlier when it's not ("CUSTOMER SUPPORT" →
 * "Customer Support"). A sub line and the bar's line pair part by part when
 * both are split the same way (.sl-title-part: "Match needs." …), so a
 * two-line line settles into the bar's one line. A big piece with no twin
 * (the chapter number, the rule) rides glued to a pair (scaled with it) and
 * fades early; a bar piece with no twin fades in at its place. The bar's
 * ground (--pm-bar on the head) fades in along, and the content (hidden
 * while the opener stands over it) over the second half.
 *
 * The scroll sets the morph's progress over a short run (the runway's
 * height less the bar's: --pi-run in pillar-intro.css, a fifth of a
 * screen), from when the section's top reaches the nav: as it ends, the
 * content following the runway reaches the bar. When the scroll
 * rests partway, the morph finishes by itself in the direction it was going
 * (back to the opener only from its very start), so the title never stays
 * half-docked. Scrolling again carries on from where it stands, mapped onto
 * what's left of the run, so it meets the scroll's ends without a jump.
 *
 * Geometry is measured on layout / resize / fonts (transforms cleared), the
 * frame only reads the root's top and writes transforms and opacities.
 * `ground` (PillarIntro ?dock=) is how the bar's ground arrives: "fade" (in
 * place), "pill" (grown from a pill in the middle, --pm-g) or "curtain"
 * (.pi-curtain in the head: a panel of the band's colour that wipes up from
 * the screen's bottom behind the title, then lifts into the bar, uncovering
 * the content).
 *
 * The HOLD (`hold`: a spacer in the flow before the runway, .pi-hold): over
 * its height of scroll, before the morph, the opener stays put in the
 * middle of the screen (.pi-big sticky in its wrap, .pi-bigwrap, which is
 * sized here to span the hold and the run: the compositor holds it, so it
 * never trails the scroll by a frame and snaps back) while the
 * scroll plays its small scene, forward and back (no timers): the pieces
 * marked `data-ph` in it: "grow" scales up a few % (and eases back as the
 * morph takes it), "word" lights up one after the other, each on its own
 * beat (lifting in, swelling a little, settling; from its pale state
 * straight to the bar's ink, no tint), "draw" draws in (scaleX from its origin); with the curtain, the
 * band's colour rises from the screen's bottom. The scene plays over the
 * hold's first ~2/3 (SCENE_FROM → SCENE_TO), then its final state stands
 * still for the rest. Then the morph runs over its own short run, as
 * without a hold.
 *
 * As the section ends, the bar slides up under the nav and fades (EXIT). The
 * root's `data-pm-state` is "open" (the bar and the content hidden),
 * "morph" (pieces layered for compositing) or "docked" (the big part
 * hidden). With
 * prefers-reduced-motion: no flight, the bar simply switches halfway.
 */

/** The scroll counts as resting after this long without moving (ms). */
const REST = 90;
/** The settle's time constant (ms): ~95% there in 3× this. */
const TAU = 55;
/** Settling forward from the run's start needs at least this much progress (else it goes back). */
const NUDGE = 0.06;
/**
 * The bar's exit, as the section ends: it slides up under the nav and fades
 * over this share of the screen's height of scroll, finishing as what
 * follows shows its first piece (`lead`: how far under the section's end
 * the next section's opener, or its first line, stands), so it never
 * stands over the next opener (a sticky bar would otherwise ride the
 * section's edge out, clipped).
 */
const EXIT = 0.2;
/** The hold's scene: how much the outcome grows (scale − 1), how dim a word stands before it lights, how far (share of the screen) the curtain rises. */
const GROW = 0.05;
const DIM = 0.22;
const RISE = 0.2;
/**
 * The hold's timing (shares of it): the scene plays from SCENE_FROM to
 * SCENE_TO, then its final state (all lit, drawn, risen) stands still for
 * the rest, so a fast scroller still leaves with it. Each word takes its own
 * beat in turn (a slot each, overlapping by BEAT_OVERLAP): it lifts in and
 * swells a little (POP, scale − 1) as it lights, then settles as the next
 * one takes over.
 */
const SCENE_FROM = 0.04;
const SCENE_TO = 0.7;
const BEAT_OVERLAP = 0.35;
const POP = 0.05;
const LIFT = 0.14;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Box = { x: number; y: number; w: number; h: number };

/** The tight box of an element's text (its text nodes only, no padding, no marker svgs), and its line count; an element without text: its border box. */
const textBox = (el: HTMLElement): Box & { lines: number; text: string } => {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  const tops: number[] = [];
  let text = "";
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    // the words' spaces count (a line split into words still reads as its twin), their boxes don't
    text += n.textContent ?? "";
    if (!n.textContent?.trim()) continue;
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (!r.width) continue;
      x0 = Math.min(x0, r.left);
      y0 = Math.min(y0, r.top);
      x1 = Math.max(x1, r.right);
      y1 = Math.max(y1, r.bottom);
      if (!tops.some((t) => Math.abs(t - r.top) < r.height * 0.5)) tops.push(r.top);
    }
  }
  if (x0 === Infinity) {
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height, lines: 0, text: "" };
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, lines: tops.length, text: text.replace(/\s+/g, " ").trim() };
};

type Pair = {
  big: HTMLElement;
  /** Its twin in the bar. */
  dock: HTMLElement | null;
  /** The big text box: left (screen), top from the root's top, size. */
  bx: number;
  by: number;
  bw: number;
  bh: number;
  /** The bar's text box, as it sits with the bar docked (screen). */
  tx: number;
  ty: number;
  tw: number;
  th: number;
  /** The big piece's scale in the bar. */
  k: number;
  same: boolean;
  /** When the big piece fades out, and its twin fades in (morph progress). */
  out: [number, number];
  in: [number, number];
};
type Solo = { el: HTMLElement; x: number; y: number; anchor: Pair | null };
type Geometry = {
  pairs: Pair[];
  solos: Solo[];
  lone: HTMLElement[];
  /** When the bar's pieces without a twin fade in. */
  loneIn: [number, number];
  nav: number;
  run: number;
  barH: number;
  /** How far under the section's end the next section shows its first piece. */
  lead: number;
  /** The hold's scroll (px; 0 without one). */
  hold: number;
  /** The hold's scene: what grows, the words lit in turn, what draws in. */
  grow: HTMLElement[];
  words: HTMLElement[];
  draw: HTMLElement[];
};
type Els = {
  root: HTMLElement;
  head: HTMLElement;
  big: HTMLElement;
  dock: HTMLElement;
  runway: HTMLElement;
  hold: HTMLElement | null;
};
export type MorphGround = "fade" | "pill" | "curtain";

const PARTS = ".sl-title-lead, .sl-title-part, .pm-part";

/** A bar part that isn't shown right now (its CSS sets --pm-absent: 1): it gets no twin. */
const absent = (el: HTMLElement) => getComputedStyle(el).getPropertyValue("--pm-absent").trim() === "1";

/** The top of the first line of text in `scope` that's on the page (its text nodes' boxes), or null. */
const firstText = (scope: Element) => {
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim() || n.parentElement?.closest(".sr-only, [aria-hidden='true'] svg")) continue;
    range.selectNodeContents(n);
    const r = range.getBoundingClientRect();
    if (r.width > 2 && r.height > 2) return r.top;
  }
  return null;
};

/**
 * How far under this section's end the next section shows its first piece:
 * its opener's (the pieces of its .pi-big), or else its first line of text.
 * Without a next section: this opener's own lead (the openers share a design).
 */
const leadAfter = (root: HTMLElement, big: HTMLElement) => {
  const bottom = root.getBoundingClientRect().bottom;
  // a next opener's pieces as they stand before it sticks (its offset in its wrap)
  const shift = (el: HTMLElement) => {
    const big = el.closest<HTMLElement>(".pi-big");
    const wrap = big?.parentElement;
    return big && wrap ? big.getBoundingClientRect().top - wrap.getBoundingClientRect().top : 0;
  };
  const tops = (scope: Element) =>
    [...scope.querySelectorAll<HTMLElement>(".pi-big [data-pm]")].map((el) => el.getBoundingClientRect().top - shift(el));
  const next = root.closest("section")?.nextElementSibling;
  if (next) {
    const pieces = tops(next);
    const top = pieces.length ? Math.min(...pieces) : firstText(next);
    if (top !== null) return Math.max(0, top - bottom);
  }
  const own = [...big.querySelectorAll<HTMLElement>("[data-pm]")].map((el) => el.getBoundingClientRect().top);
  return own.length ? Math.max(0, Math.min(...own) - root.getBoundingClientRect().top) : 0;
};

const measureGeometry = ({ root, head, big, dock, runway, hold: spacer }: Els): Geometry => {
  // the big pieces' places are taken from the opener's own top (it may be stuck partway down its wrap)
  const rootTop = big.getBoundingClientRect().top;
  const headTop = head.getBoundingClientRect().top;
  const nav = parseFloat(getComputedStyle(head).top) || 0;
  // the run: the runway less the bar (the content follows the runway)
  const run = Math.max(48, runway.offsetHeight - dock.offsetHeight);
  const barH = head.offsetHeight;
  const lead = leadAfter(root, big);
  const hold = spacer ? spacer.offsetHeight : 0;
  const scene = (key: string) => (hold ? [...big.querySelectorAll<HTMLElement>(`[data-ph="${key}"]`)] : []);

  const keyed = (scope: HTMLElement) => {
    const map = new Map<string, HTMLElement>();
    for (const el of scope.querySelectorAll<HTMLElement>("[data-pm]")) map.set(el.dataset.pm!, el);
    return map;
  };
  const bigs = keyed(big);
  const docks = keyed(dock);

  // the sub line and the bar's line, part by part when both are split alike
  const pairsOf: [HTMLElement, HTMLElement][] = [];
  const ghosts: [string, HTMLElement][] = [];
  const unpaired = new Map(bigs);
  for (const [key, b] of bigs) {
    const d = docks.get(key);
    if (!d) continue;
    unpaired.delete(key);
    docks.delete(key);
    const bp = [...b.querySelectorAll<HTMLElement>(PARTS)];
    const dp = [...d.querySelectorAll<HTMLElement>(PARTS)];
    if (bp.length && bp.length === dp.length)
      bp.forEach((el, i) => {
        // a part the bar doesn't show right now (--pm-absent: 1, e.g. a pill showing only the current part): it rides along and fades
        if (absent(dp[i])) ghosts.push([`@${key}`, el]);
        else pairsOf.push([el, dp[i]]);
      });
    else pairsOf.push([b, d]);
  }

  const pairs: Pair[] = pairsOf.map(([b, d]) => {
    const B = textBox(b);
    const T = textBox(d);
    const bs = getComputedStyle(b);
    const ds = getComputedStyle(d);
    // the same words, set the same way (else they cross-fade on the way)
    const same =
      B.lines <= 1 &&
      T.lines <= 1 &&
      B.text === T.text &&
      bs.textTransform === ds.textTransform &&
      bs.fontFamily === ds.fontFamily &&
      Math.abs(parseFloat(bs.fontWeight) - parseFloat(ds.fontWeight)) < 150;
    // the same text (or an icon) lands on its twin's width; other text on its font size
    const k = same || !B.text ? T.w / B.w : parseFloat(ds.fontSize) / parseFloat(bs.fontSize);
    // the transforms scale about the text box's corner
    const bb = b.getBoundingClientRect();
    const db = d.getBoundingClientRect();
    b.style.transformOrigin = `${B.x - bb.left}px ${B.y - bb.top}px`;
    d.style.transformOrigin = `${T.x - db.left}px ${T.y - db.top}px`;
    return {
      big: b,
      dock: d,
      bx: B.x,
      by: B.y - rootTop,
      bw: B.w,
      bh: B.h,
      tx: T.x,
      ty: T.y - headTop + nav,
      tw: T.w,
      th: T.h,
      k: Number.isFinite(k) && k > 0 ? k : 0.3,
      same,
      out: same ? [0.86, 1] : [0.22, 0.66],
      in: same ? [0.72, 0.9] : [0.32, 0.78],
    };
  });
  const find = (el?: HTMLElement) => pairs.find((p) => p.big === el || (el && el.contains(p.big))) ?? null;
  const title = find(bigs.get("title")) ?? pairs[0] ?? null;
  const solos: Solo[] = [...unpaired, ...ghosts].map(([key, el]) => {
    const r = el.getBoundingClientRect();
    el.style.transformOrigin = "0 0";
    // each rides with the piece beside it: the eyebrow's words with its icon, the number with the area's name, the rest with the title
    // (`data-pm-ride` names another piece, or "none": it fades where it stands)
    const ride = el.dataset.pmRide;
    // (a part the bar doesn't show rides with its line's shown part)
    const near =
      ride ??
      (key.startsWith("@") ? key.slice(1) : key === "area" ? "icon" : key === "num" || key === "rule" ? "area" : "title");
    const anchor = ride === "none" ? null : (find(bigs.get(near)) ?? title);
    return { el, x: r.left, y: r.top - rootTop, anchor };
  });
  return {
    pairs,
    solos,
    lone: [...docks.values()],
    loneIn: [0.55, 1],
    nav,
    run,
    barH,
    lead,
    hold,
    grow: scene("grow"),
    words: scene("word"),
    draw: scene("draw"),
  };
};

type State = "open" | "morph" | "docked";

export const useDockMorph = ({
  root,
  head,
  big,
  dock,
  runway,
  hold,
  body,
  reduced,
  ground = "fade",
  onDocked,
  prepare,
  deps,
}: {
  root: RefObject<HTMLElement>;
  head: RefObject<HTMLElement>;
  big: RefObject<HTMLElement>;
  dock: RefObject<HTMLElement>;
  /** The opener's room in the flow: the run plus the bar's height. */
  runway: RefObject<HTMLElement>;
  /** The hold's spacer, before the runway (none: no hold). */
  hold?: RefObject<HTMLElement>;
  /** The content after it, faded in over the morph's second half. */
  body: RefObject<HTMLElement>;
  reduced: boolean;
  /** How the bar's ground arrives: "fade" (default), "pill" or "curtain". */
  ground?: MorphGround;
  /** Called when the bar's docked state changes. */
  onDocked: (docked: boolean) => void;
  /** Runs before the morph's geometry is measured (e.g. fitting the title to its line). */
  prepare?: () => void;
  /** Re-measure when these change (the opener's design). */
  deps: unknown[];
}) => {
  const cb = useRef(onDocked);
  cb.current = onDocked;
  const prep = useRef(prepare);
  prep.current = prepare;

  useLayoutEffect(() => {
    const r = root.current;
    const h = head.current;
    const b = big.current;
    const d = dock.current;
    const w = runway.current;
    const c = body.current;
    const sp = hold?.current ?? null;
    if (!r || !h || !b || !d || !w || !c) return;
    const curtain = ground === "curtain" ? h.querySelector<HTMLElement>(".pi-curtain") : null;

    let g: Geometry | null = null;
    let state: State | null = null;
    let prog = 0; // the morph's progress (0 → 1)
    let pPrev = 0; // the scroll's progress at the last frame
    let dir = 1;
    let moved = 0;
    let last = 0;
    let raf = 0;
    let gone = -1; // the bar's exit, as last painted
    let held = -1; // the hold's scene, as last painted

    // the bar leaves as the section's end comes up the screen (see EXIT)
    const exit = (bottom: number, lead: number) => {
      const vh = window.innerHeight;
      const done = vh - lead;
      const span = vh * EXIT;
      const q = reduced ? (bottom < done + span / 2 ? 1 : 0) : smooth(0, 1, (done + span - bottom) / span);
      if (Math.abs(q - gone) < 0.001) return;
      gone = q;
      h.style.transform = q > 0 ? `translate3d(0, ${(-q * (h.offsetHeight + 8)).toFixed(1)}px, 0)` : "";
      h.style.opacity = q > 0 ? (1 - q).toFixed(3) : "";
    };

    const all = () =>
      g
        ? [
            ...g.pairs.flatMap((p) => (p.dock ? [p.big, p.dock] : [p.big])),
            ...g.solos.map((s) => s.el),
            ...g.lone,
          ]
        : [];
    const clear = () => {
      c.style.opacity = "";
      b.style.transform = "";
      held = -1;
      if (g) for (const el of [...g.grow, ...g.words, ...g.draw]) {
        el.style.transform = "";
        el.style.opacity = "";
      }
      if (curtain) {
        curtain.style.transform = "";
        curtain.style.opacity = "";
      }
      for (const el of all()) {
        el.style.transform = "";
        el.style.opacity = "";
      }
    };

    const paint = (e: number, rootTop: number) => {
      const next: State = e <= 0 ? "open" : e >= 1 ? "docked" : "morph";
      if (next !== state) {
        const wasDocked = state === "docked";
        state = next;
        r.dataset.pmState = next;
        if (next !== "morph") clear();
        if (wasDocked !== (next === "docked")) cb.current(next === "docked");
      }
      // the bar's ground: in place, from a pill, or after the curtain
      const [b0, b1] = ground === "pill" ? [0.02, 0.4] : ground === "curtain" ? [0.8, 1] : [0.15, 0.85];
      h.style.setProperty("--pm-bar", smooth(b0, b1, e).toFixed(3));
      if (ground === "pill") h.style.setProperty("--pm-g", smooth(0.05, 0.85, e).toFixed(3));
      if (next !== "morph" || !g) return;
      if (curtain) {
        // the band's colour wipes up from the screen's bottom (its top edge quick; from where the hold left it), then lifts into the bar
        const vh = window.innerHeight;
        const top = lerp(vh - (g.hold ? vh * RISE : 0), g.nav, 1 - (1 - e) * (1 - e));
        const bottom = e < 0.45 ? vh : lerp(vh, g.nav + g.barH, (e - 0.45) / 0.55);
        curtain.style.transform = `translate3d(0, ${(top - g.nav).toFixed(1)}px, 0) scaleY(${(Math.max(g.barH, bottom - top) / g.barH).toFixed(4)})`;
        curtain.style.opacity = ((g.hold ? 1 : smooth(0, 0.08, e)) * (1 - smooth(0.9, 1, e))).toFixed(3);
      }
      c.style.opacity = smooth(0.45, 1, e).toFixed(3);
      // the size and the row settle ahead of the height, so pieces bound for one line don't run into each other
      const es = 1 - (1 - e) * (1 - e);
      const pos = (p: Pair) => {
        const top = rootTop + p.by;
        const kb = Math.pow(p.k, es);
        const left = lerp(p.bx, p.tx, es);
        const cy = lerp(top + p.bh / 2, p.ty + p.th / 2, e);
        return { top, kb, left, cy };
      };
      for (const p of g.pairs) {
        const { top, kb, left, cy } = pos(p);
        const kt = kb / p.k;
        p.big.style.transform = `translate3d(${(left - p.bx).toFixed(2)}px, ${(cy - (kb * p.bh) / 2 - top).toFixed(2)}px, 0) scale(${kb.toFixed(4)})`;
        p.big.style.opacity = (1 - smooth(p.out[0], p.out[1], e)).toFixed(3);
        if (!p.dock) continue;
        p.dock.style.transform = `translate3d(${(left - p.tx).toFixed(2)}px, ${(cy - (kt * p.th) / 2 - p.ty).toFixed(2)}px, 0) scale(${kt.toFixed(4)})`;
        p.dock.style.opacity = smooth(p.in[0], p.in[1], e).toFixed(3);
      }
      for (const s of g.solos) {
        const o = (1 - smooth(0, 0.42, e)).toFixed(3);
        s.el.style.opacity = o;
        if (!s.anchor) continue;
        // glued to its pair: carried and scaled with it
        const a = s.anchor;
        const { top, kb, left, cy } = pos(a);
        const ax = left;
        const ay = cy - (kb * a.bh) / 2;
        const sx = ax + kb * (s.x - a.bx);
        const sy = ay + kb * (rootTop + s.y - top);
        s.el.style.transform = `translate3d(${(sx - s.x).toFixed(2)}px, ${(sy - rootTop - s.y).toFixed(2)}px, 0) scale(${kb.toFixed(4)})`;
      }
      const lo = smooth(g.loneIn[0], g.loneIn[1], e).toFixed(3);
      for (const el of g.lone) el.style.opacity = lo;
    };

    // the hold's scene (q: 0 → 1 over the hold), easing back as the morph (e) takes the opener
    const scene = (q: number, e: number) => {
      if (!g || !g.hold) return;
      const key = q + e * 2;
      if (Math.abs(key - held) < 0.0005) return;
      held = key;
      // the scene's own clock: it plays over the hold's first part, then stands
      const k = clamp01((q - SCENE_FROM) / (SCENE_TO - SCENE_FROM));
      const s = 1 + GROW * (1 - Math.pow(1 - k, 2)) * (1 - smooth(0, 0.6, e));
      for (const el of g.grow) el.style.transform = s > 1.0001 ? `scale(${s.toFixed(4)})` : "";
      const n = g.words.length;
      // a slot each, one after the other (a little overlap so it reads as one phrase)
      const slot = 1 / Math.max(1, n - BEAT_OVERLAP * (n - 1));
      g.words.forEach((el, i) => {
        const a = i * slot * (1 - BEAT_OVERLAP);
        const w = clamp01((k - a) / slot);
        const lit = smooth(0, 0.45, w);
        // the beat: up from a little below and a swell as it lights, settling as the slot ends
        const beat = w <= 0 || w >= 1 ? 0 : Math.sin(Math.PI * Math.min(1, w / 0.8));
        const lift = LIFT * (1 - lit);
        const sc = 1 + POP * beat;
        el.style.opacity = (DIM + (1 - DIM) * lit).toFixed(3);
        el.style.transform = lift > 0.001 || sc > 1.0005 ? `translate3d(0, ${lift.toFixed(3)}em, 0) scale(${sc.toFixed(4)})` : "";
      });
      for (const el of g.draw) el.style.transform = `scaleX(${smooth(0, 0.85, k).toFixed(4)})`;
      if (curtain && e <= 0) {
        // the band's colour rises from the screen's bottom, under the opener
        const vh = window.innerHeight;
        const rise = RISE * vh * (1 - Math.pow(1 - k, 2));
        const top = vh - rise;
        curtain.style.transform = rise > 0.5 ? `translate3d(0, ${(top - g.nav).toFixed(1)}px, 0) scaleY(${(Math.max(1, rise) / g.barH).toFixed(4)})` : "";
        curtain.style.opacity = rise > 0.5 ? "1" : "";
      }
    };

    // paint the morph where it stands, the opener held in place (carried down along the scroll) and its scene
    const place = (top: number) => {
      if (!g) return;
      const e = reduced ? prog : ease(prog);
      const past = g.nav - top;
      // where the opener stands: stuck under the nav (position: sticky, in its wrap) through the hold and the run
      const shift = Math.min(Math.max(past, 0), g.hold + g.run);
      paint(e, top + shift);
      if (!g.hold) return;
      scene(reduced ? 1 : clamp01(past / g.hold), e);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!g) return;
      const box = r.getBoundingClientRect();
      const top = box.top;
      exit(box.bottom, g.lead);
      const p = clamp01((g.nav - top - g.hold) / g.run);
      if (p !== pPrev) {
        // carry on from where the morph stands, onto what's left of the run
        prog = p > pPrev ? 1 - ((1 - prog) * (1 - p)) / (1 - pPrev) : (prog * p) / pPrev;
        dir = p > pPrev ? 1 : -1;
        pPrev = p;
        moved = now;
      }
      if (p <= 0) prog = 0;
      else if (p >= 1) prog = 1;
      else if (reduced) prog = p >= 0.5 ? 1 : 0;
      else if (prog > 0 && prog < 1 && now - moved > REST) {
        // resting partway: finish the way it was going
        const to = dir > 0 ? (prog > NUDGE ? 1 : 0) : prog < 1 - NUDGE ? 0 : 1;
        const dt = Math.min(64, last ? now - last : 16);
        prog += (to - prog) * (1 - Math.exp(-dt / TAU));
        if (Math.abs(to - prog) < 0.004) prog = to;
      }
      last = now;
      place(top);
      // keep ticking while it's partway (to notice the rest and settle)
      if (prog > 0 && prog < 1) raf = requestAnimationFrame(frame);
      else last = 0;
    };
    const tick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const measure = () => {
      clear();
      prep.current?.();
      g = measureGeometry({ root: r, head: h, big: b, dock: d, runway: w, hold: sp });
      // the opener's wrap spans the hold and the run, so it stays stuck (on the compositor, no lag behind the scroll) until the bar has formed
      const wrap = b.parentElement;
      if (wrap?.classList.contains("pi-bigwrap")) wrap.style.height = `${b.offsetHeight + g.hold + g.run}px`;
      state = null;
      const top = r.getBoundingClientRect().top;
      const p = clamp01((g.nav - top - g.hold) / g.run);
      if (pPrev === 0 && prog === 0) {
        // first measure: start where the scroll is (finishing if partway)
        prog = reduced ? (p >= 0.5 ? 1 : 0) : p;
      }
      pPrev = p;
      place(top);
      tick();
    };

    measure();
    let pending = 0;
    const remeasure = () => {
      if (pending) return;
      pending = requestAnimationFrame(() => {
        pending = 0;
        measure();
      });
    };
    const ro = new ResizeObserver(remeasure);
    ro.observe(d);
    ro.observe(b);
    ro.observe(w);
    if (sp) ro.observe(sp);
    document.fonts?.ready.then(remeasure).catch(() => {});
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", remeasure);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", remeasure);
      if (raf) cancelAnimationFrame(raf);
      if (pending) cancelAnimationFrame(pending);
      clear();
      h.style.transform = "";
      h.style.opacity = "";
      delete r.dataset.pmState;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, ground, ...deps]);
};
