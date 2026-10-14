import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "@/styles/pillar-intro.css";

/**
 * PillarIntro: a pillar's entrance, driven by the scroll. When the pillar is
 * reached its NAME (the benefit, e.g. "Boost Sales") stands huge, its icon
 * above it and its supporting line under it; as the visitor scrolls on,
 * each piece shrinks and flies up to dock as the section's sticky bar: the
 * name as a strong label, the line's compact form beside it. The children
 * scroll in under it, and the bar stays to the end of the section. With
 * prefers-reduced-motion: the big entrance sits still at the top and the
 * docked bar appears once it's scrolled past (no morph).
 *
 * CHANGED (round 2): the default pattern is now `name` (+ `icon`, `line`).
 * Fully backward compatible: without `name`, `title` (+ `chip`) renders and
 * morphs exactly as before, so compositions built on `title`/`docked` with
 * their own `data-morph` keys (pillar/BenefitIntro) keep working.
 *
 *   <PillarIntro
 *     name="Boost Sales"                            // huge, then the docked label
 *     icon={<TrendIcon />}                          // optional, in a disc
 *     line={<SalesTitle … />}                       // optional supporting line
 *     docked={({ docked }) => <SalesTitle … />}     // optional: the line's docked form (defaults to `line`)
 *     accent="color-mix(…)"                         // optional: the docked bar's ground
 *   >
 *     …the sub-benefits…
 *   </PillarIntro>
 *
 * - `name` / `icon` / `line`: the entrance. The name is the heading (an <h2>
 *   unless `as` says otherwise). Sizes: .pi-name (up to ~11vw) and .pi-line,
 *   or `nameClassName` / `lineClassName`. In the bar: .pi-dock-name (icon +
 *   name, a strong label) then the docked line; on phones they stack.
 * - Legacy: `title` (big, ~9vw, `titleClassName`) with `chip` above it; the
 *   bar shows `docked` (default: `title`, small) with the chip on desktop.
 * - The morph: elements sharing a `data-morph="key"` in the big entrance
 *   and in the bar fly from one to the other (translate + scale, then a
 *   crossfade); the name and icon are keyed for you ("pi-name", "pi-icon").
 *   A line (or legacy title) with no keyed parts flies whole onto the
 *   docked form; big elements with no partner shrink toward the bar and fade.
 * - The root publishes `--pi-dock-h` (the bar's height) so pinned children
 *   can sit right under it (`top: calc(nav + var(--pi-dock-h))`), and
 *   `--pi-e` (0 → 1, the morph's progress; --pi-ex/-ey/-es pace its parts).
 */
export type PillarIntroProps = {
  /** The pillar's name, the benefit ("Boost Sales"): huge on arrival, the docked bar's label. */
  name?: ReactNode;
  /** The pillar's icon (e.g. an AnimatedIcon element), in a disc above the name and beside it docked. */
  icon?: ReactNode;
  /** The supporting line under the name. */
  line?: ReactNode;
  /** Legacy: the big title when there's no `name` (with `name`, read as `line`). */
  title?: ReactNode;
  /** Legacy: a chip above the big title (and left of the docked one on desktop), when there's no `name`. */
  chip?: ReactNode;
  /** The line's (or legacy title's) docked form: a node, or a render prop given `{ docked }`. */
  docked?: ReactNode | ((state: { docked: boolean }) => ReactNode);
  /** The docked bar's ground (any CSS background); defaults to a glass of the pillar's soft accent. */
  accent?: string;
  /** The heading's element (the name, or the legacy title): "h2" (default), or "p"/"div" when the page has it elsewhere. */
  as?: "h2" | "p" | "div";
  className?: string;
  nameClassName?: string;
  lineClassName?: string;
  titleClassName?: string;
  dockClassName?: string;
  children?: ReactNode;
};

/** Scroll (in screen heights, after the header sticks) the big title holds, then takes to dock; .pi-runway is their sum. */
const HOLD = 0.16;
const SHRINK = 0.62;

const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

/**
 * The morph's progress, split so a stacked title unstacks cleanly: words
 * slide sideways into their row early (x), shrink a little ahead (scale),
 * and the lines close up last (y).
 */
const setMorph = (el: HTMLElement, k: number) => {
  // every piece lands by 90%; the last 10% is the crossfade onto the docked bar
  const m = Math.min(1, k / 0.9);
  el.style.setProperty("--pi-e", k.toFixed(4));
  el.style.setProperty("--pi-ex", Math.pow(m, 0.55).toFixed(4));
  el.style.setProperty("--pi-es", Math.min(1, k / 0.8).toFixed(4));
  el.style.setProperty("--pi-ey", Math.pow(m, 1.3).toFixed(4));
};

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

const PillarIntro = ({
  name,
  icon,
  line: lineProp,
  title,
  chip,
  docked,
  accent,
  as: Tag = "h2",
  className,
  nameClassName,
  lineClassName,
  titleClassName,
  dockClassName,
  children,
}: PillarIntroProps) => {
  const named = name !== undefined && name !== null;
  const line = named ? (lineProp ?? title) : undefined;
  const root = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const big = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const [reduced] = useState(prefersReduced);
  const [isDocked, setDocked] = useState(reduced);
  const e = useRef(reduced ? 1 : 0);

  // measure where each big element has to fly to dock, and the header's height
  useLayoutEffect(() => {
    const r = root.current;
    const h = head.current;
    const b = big.current;
    const d = dock.current;
    if (!r || !h || !d) return;
    const measure = () => {
      r.style.setProperty("--pi-dock-h", `${d.offsetHeight}px`);
      if (!b || reduced) return;
      setMorph(r, 0);
      const pairs: [HTMLElement, HTMLElement | null][] = Array.from(
        b.querySelectorAll<HTMLElement>("[data-morph]"),
      ).map((el) => [el, d.querySelector<HTMLElement>(`[data-morph="${el.dataset.morph}"]`)]);
      // a line (or legacy title) with no keyed parts flies whole onto the docked form
      const into = d.querySelector<HTMLElement>(".pi-dock-main");
      for (const whole of b.querySelectorAll<HTMLElement>(".pi-line, .pi-title")) {
        if (!whole.querySelector("[data-morph]") && !whole.hasAttribute("data-morph")) pairs.push([whole, into]);
      }
      const home = d.getBoundingClientRect();
      for (const [el, to] of pairs) {
        const a = el.getBoundingClientRect();
        const t = to?.getBoundingClientRect();
        const has = !!t && t.width > 0 && t.height > 0;
        const tx = has ? t.left + t.width / 2 : home.left + home.width / 2;
        const ty = has ? t.top + t.height / 2 : home.top + home.height / 2;
        const s = has ? Math.min(t.height / a.height, t.width / a.width) : 0.25;
        el.style.setProperty("--pi-dx", `${(tx - (a.left + a.width / 2)).toFixed(1)}px`);
        el.style.setProperty("--pi-dy", `${(ty - (a.top + a.height / 2)).toFixed(1)}px`);
        el.style.setProperty("--pi-s", s.toFixed(4));
        el.classList.add("pi-morph");
        el.classList.toggle("pi-lone", !has);
      }
      setMorph(r, e.current);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(d);
    if (b) ro.observe(b);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [reduced]);

  // the scroll drives the morph
  useLayoutEffect(() => {
    const r = root.current;
    const h = head.current;
    if (!r || !h) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = parseFloat(getComputedStyle(h).top) || 0;
      const y = top - r.getBoundingClientRect().top; // > 0 once the header sticks
      const vh = window.innerHeight;
      let k: number;
      if (reduced) {
        const still = r.querySelector<HTMLElement>(".pi-still");
        k = still && still.getBoundingClientRect().bottom < top + (dock.current?.offsetHeight ?? 0) ? 1 : 0;
      } else k = ease(Math.min(1, Math.max(0, (y - HOLD * vh) / (SHRINK * vh))));
      if (Math.abs(k - e.current) > 0.0005 || k === 0 || k === 1) {
        e.current = k;
        setMorph(r, k);
      }
      setDocked(k >= 0.999);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  const bigBlock = (
    <div ref={big} className={reduced ? "pi-still" : "pi-big"}>
      {named ? (
        <div className="pi-big-inner is-named">
          {icon && (
            <span className="pi-icon" data-morph="pi-icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <Tag className={cn("pi-name", nameClassName)}>
            <span data-morph="pi-name">{name}</span>
          </Tag>
          {line && <div className={cn("pi-line", lineClassName)}>{line}</div>}
        </div>
      ) : (
        <div className="pi-big-inner">
          {chip && (
            <span className="pi-chip" data-morph="pi-chip">
              {chip}
            </span>
          )}
          <Tag className={cn("pi-title", titleClassName)}>{title}</Tag>
        </div>
      )}
    </div>
  );
  const compact =
    typeof docked === "function" ? docked({ docked: isDocked }) : (docked ?? (named ? line : title));

  return (
    <div
      ref={root}
      className={cn("pi", reduced && "is-still", isDocked && "is-docked", className)}
      style={{ "--pi-e": reduced ? 1 : 0, ...(accent ? { "--pi-bar": accent } : {}) } as CSSProperties}
    >
      {reduced && bigBlock}
      <div ref={head} className="pi-head">
        <div ref={dock} className={cn("pi-dock", named && "is-named", dockClassName)} aria-hidden="true">
          {named ? (
            <span className="pi-dock-name">
              {icon && (
                <span className="pi-dock-icon" data-morph="pi-icon">
                  {icon}
                </span>
              )}
              <span data-morph="pi-name">{name}</span>
            </span>
          ) : (
            chip && (
              <span className="pi-dock-chip" data-morph="pi-chip">
                {chip}
              </span>
            )
          )}
          {compact && <div className="pi-dock-main">{compact}</div>}
        </div>
        {!reduced && bigBlock}
      </div>
      {!reduced && <div className="pi-runway" aria-hidden="true" />}
      <div className="pi-body">{children}</div>
    </div>
  );
};

export default PillarIntro;
