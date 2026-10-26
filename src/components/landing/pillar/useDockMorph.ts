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
 * frame only reads the root's top and writes transforms and opacities. The
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
    if (!n.textContent?.trim()) continue;
    text += n.textContent;
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
  dock: HTMLElement;
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
};
type Solo = { el: HTMLElement; x: number; y: number; anchor: Pair | null };
type Geometry = { pairs: Pair[]; solos: Solo[]; lone: HTMLElement[]; nav: number; run: number };
type Els = { root: HTMLElement; head: HTMLElement; big: HTMLElement; dock: HTMLElement; runway: HTMLElement };

const PARTS = ".sl-title-lead, .sl-title-part";

const measureGeometry = ({ root, head, big, dock, runway }: Els): Geometry => {
  const rootTop = root.getBoundingClientRect().top;
  const headTop = head.getBoundingClientRect().top;
  const nav = parseFloat(getComputedStyle(head).top) || 0;
  const keyed = (scope: HTMLElement) => {
    const map = new Map<string, HTMLElement>();
    for (const el of scope.querySelectorAll<HTMLElement>("[data-pm]")) map.set(el.dataset.pm!, el);
    return map;
  };
  const bigs = keyed(big);
  const docks = keyed(dock);

  // the sub line and the bar's line, part by part when both are split alike
  const pairsOf: [HTMLElement, HTMLElement][] = [];
  const unpaired = new Map(bigs);
  for (const [key, b] of bigs) {
    const d = docks.get(key);
    if (!d) continue;
    unpaired.delete(key);
    docks.delete(key);
    const bp = [...b.querySelectorAll<HTMLElement>(PARTS)];
    const dp = [...d.querySelectorAll<HTMLElement>(PARTS)];
    if (bp.length && bp.length === dp.length) bp.forEach((el, i) => pairsOf.push([el, dp[i]]));
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
    };
  });
  const find = (el?: HTMLElement) => pairs.find((p) => p.big === el || (el && el.contains(p.big))) ?? null;
  const title = find(bigs.get("title")) ?? pairs[0] ?? null;
  const solos: Solo[] = [...unpaired].map(([key, el]) => {
    const r = el.getBoundingClientRect();
    el.style.transformOrigin = "0 0";
    // the eyebrow's words ride with its icon, the rest with the title
    const anchor = key === "area" ? (find(bigs.get("icon")) ?? title) : title;
    return { el, x: r.left, y: r.top - rootTop, anchor };
  });
  // the run: the runway less the bar (the content follows the runway)
  const run = Math.max(48, runway.offsetHeight - dock.offsetHeight);
  return { pairs, solos, lone: [...docks.values()], nav, run };
};

type State = "open" | "morph" | "docked";

export const useDockMorph = ({
  root,
  head,
  big,
  dock,
  runway,
  body,
  reduced,
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
  /** The content after it, faded in over the morph's second half. */
  body: RefObject<HTMLElement>;
  reduced: boolean;
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
    if (!r || !h || !b || !d || !w || !c) return;

    let g: Geometry | null = null;
    let state: State | null = null;
    let prog = 0; // the morph's progress (0 → 1)
    let pPrev = 0; // the scroll's progress at the last frame
    let dir = 1;
    let moved = 0;
    let last = 0;
    let raf = 0;

    const all = () => (g ? [...g.pairs.flatMap((p) => [p.big, p.dock]), ...g.solos.map((s) => s.el), ...g.lone] : []);
    const clear = () => {
      c.style.opacity = "";
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
      h.style.setProperty("--pm-bar", smooth(0.15, 0.85, e).toFixed(3));
      if (next !== "morph" || !g) return;
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
        p.dock.style.transform = `translate3d(${(left - p.tx).toFixed(2)}px, ${(cy - (kt * p.th) / 2 - p.ty).toFixed(2)}px, 0) scale(${kt.toFixed(4)})`;
        const [a, z] = p.same ? [0.72, 0.9] : [0.32, 0.78];
        p.dock.style.opacity = smooth(a, z, e).toFixed(3);
        p.big.style.opacity = (1 - (p.same ? smooth(0.86, 1, e) : smooth(0.22, 0.66, e))).toFixed(3);
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
      const lo = smooth(0.55, 1, e).toFixed(3);
      for (const el of g.lone) el.style.opacity = lo;
    };

    const frame = (now: number) => {
      raf = 0;
      if (!g) return;
      const top = r.getBoundingClientRect().top;
      const p = clamp01((g.nav - top) / g.run);
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
      paint(reduced ? prog : ease(prog), top);
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
      g = measureGeometry({ root: r, head: h, big: b, dock: d, runway: w });
      state = null;
      const top = r.getBoundingClientRect().top;
      const p = clamp01((g.nav - top) / g.run);
      if (pPrev === 0 && prog === 0) {
        // first measure: start where the scroll is (finishing if partway)
        prog = reduced ? (p >= 0.5 ? 1 : 0) : p;
      }
      pPrev = p;
      paint(reduced ? prog : ease(prog), top);
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
      delete r.dataset.pmState;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, ...deps]);
};
