import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "@/styles/pillar-intro.css";

/**
 * PillarIntro: a pillar's entrance and its sticky docked bar.
 *
 * On arrival the pillar's NAME (the benefit, e.g. "Boost Sales") stands huge
 * on one line, its icon in a disc above it and its supporting line under it.
 * Nothing morphs: the big title scrolls away with the page, each piece
 * fading (and settling a touch smaller) as it nears the nav. The moment the
 * big name passes into the bar's place the docked bar ([icon] Name | line)
 * slides in while what's left of the big title fades out: one short timed
 * crossfade, so no scroll position shows either half-drawn, and nothing is
 * ever read through the bar. There's no runway: the content follows the big
 * title in the flow and arrives under the bar, which stays to the end of
 * the section. With prefers-reduced-motion: the same, without the settle,
 * the slide or the fades (the bar simply switches).
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
 *   unless `as` says otherwise), always one line: its size (.pi-name) is
 *   capped to the width it has (--pi-fit). In the bar: .pi-dock-name (icon +
 *   name, a strong label) then the docked line; on phones they stack.
 * - Legacy: `title` (big, `titleClassName`) with `chip` above it; the bar
 *   shows `docked` (default: `title`) with the chip on desktop.
 * - The root publishes `--pi-dock-h` (the bar's height) so pinned children
 *   can sit right under it (`top: calc(nav + var(--pi-dock-h))`), and
 *   `.is-docked` while the bar shows.
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

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

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
  const [isDocked, setDocked] = useState(false);

  // publish the bar's height, and keep the big name on one line (its size capped to the width it has)
  useLayoutEffect(() => {
    const r = root.current;
    const b = big.current;
    const d = dock.current;
    if (!r || !b || !d) return;
    const measure = () => {
      r.style.setProperty("--pi-dock-h", `${d.offsetHeight}px`);
      const n = b.querySelector<HTMLElement>(".pi-name");
      const text = n?.firstElementChild as HTMLElement | null;
      if (!n || !text) return;
      n.style.setProperty("--pi-fit", "1");
      const need = text.offsetWidth; // layout width (the fade's settle scale doesn't count)
      const room = n.clientWidth;
      if (need > room && need > 0) n.style.setProperty("--pi-fit", (room / need - 0.005).toFixed(4));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(d);
    ro.observe(b);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, []);

  // the scroll: fade each big piece as it nears the nav; dock once the name passes into the bar's place
  useLayoutEffect(() => {
    const r = root.current;
    const h = head.current;
    const b = big.current;
    const d = dock.current;
    if (!r || !h || !b || !d) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const box = r.getBoundingClientRect();
      if (box.top > vh || box.bottom < 0) {
        if (box.top > vh) setDocked(false);
        return;
      }
      const nav = parseFloat(getComputedStyle(h).top) || 0;
      const bar = d.offsetHeight;
      let dockNow = false;
      for (const el of b.querySelectorAll<HTMLElement>(".pi-fade")) {
        const a = el.getBoundingClientRect();
        // fully shown until it nears the bar; gone by the time its top reaches the nav
        el.style.setProperty("--pi-o", clamp01((a.top - nav) / (bar + a.height * 0.45)).toFixed(3));
        // the bar comes in as the name's top passes into it (the big pieces then crossfade out)
        if (el.classList.contains("pi-key")) dockNow = a.top < nav + bar * 0.6;
      }
      setDocked(dockNow);
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
  }, []);

  const compact =
    typeof docked === "function" ? docked({ docked: isDocked }) : (docked ?? (named ? line : title));

  return (
    <div
      ref={root}
      className={cn("pi", reduced && "is-still", isDocked && "is-docked", className)}
      style={accent ? ({ "--pi-bar": accent } as CSSProperties) : undefined}
    >
      <div ref={head} className="pi-head">
        <div ref={dock} className={cn("pi-dock", named && "is-named", dockClassName)} aria-hidden="true">
          {named ? (
            <span className="pi-dock-name">
              {icon && <span className="pi-dock-icon">{icon}</span>}
              <span className="pi-dock-label">{name}</span>
            </span>
          ) : (
            chip && <span className="pi-dock-chip">{chip}</span>
          )}
          {compact && <div className="pi-dock-main">{compact}</div>}
        </div>
      </div>
      <div ref={big} className={cn("pi-big", named && "is-named")}>
        {named ? (
          <>
            {icon && (
              <span className="pi-icon pi-fade" aria-hidden="true">
                {icon}
              </span>
            )}
            <Tag className={cn("pi-name pi-fade pi-key", nameClassName)}>
              <span className="pi-name-text">{name}</span>
            </Tag>
            {line && <div className={cn("pi-line pi-fade", lineClassName)}>{line}</div>}
          </>
        ) : (
          <>
            {chip && <span className="pi-chip pi-fade">{chip}</span>}
            <Tag className={cn("pi-title pi-fade pi-key", titleClassName)}>{title}</Tag>
          </>
        )}
      </div>
      <div className="pi-body">{children}</div>
    </div>
  );
};

export default PillarIntro;
