import { useContext, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "@/styles/pillar-intro.css";
import "@/styles/pillar-openers.css";
import { PillarAreaContext, useOpener } from "./pillar/OpenerContext";
import OpenerDesign from "./pillar/OpenerDesign";
import type { Motif } from "./pillar/OpenerDesign";

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
 * - `name` / `icon` / `line` (+ `index`): the entrance: the icon in its
 *   disc, the name, the line under it. The name is the heading (an <h2>
 *   unless `as` says otherwise), always one line: its size (.pi-name) is
 *   capped to the width it has (--pi-fit). In the bar: .pi-dock-name (icon +
 *   name, a strong label) then the docked line; on phones they stack.
 * - Legacy: `title` (big, `titleClassName`) with `chip` above it; the bar
 *   shows `docked` (default: `title`) with the chip on desktop.
 * - The root publishes `--pi-dock-h` (the bar's height) so pinned children
 *   can sit right under it (`top: calc(nav + var(--pi-dock-h))`), and
 *   `.is-docked` while the bar shows.
 * - With the opener designs under comparison (?open=1..6, pillar/
 *   OpenerContext) the big part is pillar/OpenerDesign: the OUTCOME the hero
 *   (`outcome`, a sentence a line; by default the `name`, with `line` under
 *   it), the AREA a small label (`area`; by default PillarAreaContext),
 *   `motif` the pillar's drawing (by default "sales"). It scrolls away and
 *   docks the bar like the default.
 */
export type PillarIntroProps = {
  /** The pillar's name, the benefit ("Boost Sales"): huge on arrival, the docked bar's label. */
  name?: ReactNode;
  /** The section's place in the page's sequence ("01"). */
  index?: string;
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
  /** ?open=1..6: the outcome, the opener's hero, a sentence a line (default: the `name`, with `line` under it). */
  outcome?: string[];
  /** ?open=1..6: the small area label (default: PillarAreaContext). */
  area?: ReactNode;
  /** ?open=1..6: the pillar, for its drawings (default: "sales"). */
  motif?: Motif;
  children?: ReactNode;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

const PillarIntro = ({
  name,
  index,
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
  outcome,
  area,
  motif = "sales",
  children,
}: PillarIntroProps) => {
  const named = name !== undefined && name !== null;
  const line = named ? (lineProp ?? title) : undefined;
  const opener = useOpener();
  const areaCtx = useContext(PillarAreaContext);
  const lines = outcome ?? (typeof name === "string" ? [name] : undefined);
  // the opener design, if any
  const v = named && lines && opener !== "0" ? opener : null;
  const root = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const big = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const [reduced] = useState(prefersReduced);
  const [isDocked, setDocked] = useState(false);

  // publish the bar's height, and keep the big name on one line (its size capped to the width it has)
  useLayoutEffect(() => {
    const r = root.current;
    const d = dock.current;
    const b = big.current;
    if (!r || !d || !b) return;
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
  }, [v]);

  // the scroll
  useLayoutEffect(() => {
    const r = root.current;
    const h = head.current;
    const d = dock.current;
    const b = big.current;
    if (!r || !h || !d || !b) return;
    let frame = 0;

    // default: fade each big piece as it nears the nav; dock once the name passes into the bar's place
    const fadeAway = (nav: number, bar: number) => {
      for (const el of b.querySelectorAll<HTMLElement>(".pi-fade")) {
        const a = el.getBoundingClientRect();
        // fully shown until it nears the bar; gone by the time its top reaches the nav
        el.style.setProperty("--pi-o", clamp01((a.top - nav) / (bar + a.height * 0.45)).toFixed(3));
      }
      // the bar comes in as the name's top passes into it (the big pieces then crossfade out)
      const key = b.querySelector<HTMLElement>(".pi-key");
      return key ? key.getBoundingClientRect().top < nav + bar * 0.6 : false;
    };

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
      setDocked(fadeAway(nav, bar));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    document.fonts?.ready.then(onScroll).catch(() => {});
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [v]);

  const compact =
    typeof docked === "function" ? docked({ docked: isDocked }) : (docked ?? (named ? line : title));

  const bar = (
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
  );

  return (
    <div
      ref={root}
      className={cn("pi", v && `pi-od pi-od${v}`, reduced && "is-still", isDocked && "is-docked", className)}
      style={accent ? ({ "--pi-bar": accent } as CSSProperties) : undefined}
    >
      {bar}
      <div ref={big} className={cn("pi-big", named && "is-named")}>
        {v && lines ? (
          <OpenerDesign
            v={v}
            index={index}
            icon={icon}
            area={area ?? areaCtx}
            lines={lines}
            // Support / Insights' outcome is their line; Sales' is its name, its line under it
            sub={outcome ? undefined : line}
            lineClassName={lineClassName}
            motif={motif}
            as={Tag}
          />
        ) : named ? (
          <>
            {icon && (
              <span className="pi-icon pi-fade" aria-hidden="true">
                {icon}
              </span>
            )}
            <Tag className={cn("pi-name pi-fade pi-key", nameClassName)}>
              <span className="pi-name-text">{name}</span>
            </Tag>
            {line && <span className={cn("pi-line pi-fade", lineClassName)}>{line}</span>}
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
