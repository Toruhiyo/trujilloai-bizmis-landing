import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "@/styles/pillar-intro.css";
import "@/styles/pillar-transitions.css";
import { PillarAreaContext, useOpener } from "./pillar/OpenerContext";

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
 * - With the transitions under comparison (?open=1..5, pillar/OpenerContext)
 *   the opener is one screen (its stage, 100svh under the nav): the icon,
 *   the AREA a small label (`area`; by default PillarAreaContext), the
 *   OUTCOME big (`outcome`, a sentence a line; by default the `name`), the
 *   line; and it hands over to the content by the option's transition, all
 *   of it a function of the scroll (--pi-p, 0 → 1), so every scroll position
 *   is one clean state, forwards or back. pillar-transitions.css.
 *     1  shrink to dock: the stage pins over a short runway; the outcome
 *        shrinks and rises into the bar's place, the content coming up under it
 *     2  slide aside (≥ 900px; phones get 1): the outcome slides from the
 *        screen's centre into a left rail and stays there, sticky, as the
 *        section's side title; the content
 *        enters in the right column; no docked bar
 *     3  curtain: the stage stays put (sticky for the whole section) and the
 *        content rises over it as a sheet with a rounded top; the bar docks
 *        as the sheet reaches it
 *     4  zoom through: the outcome scales up past the viewer and fades; the
 *        content, behind it, fades in
 *     5  split: the stage parts like two doors (the outcome's halves on
 *        them), the content between; the bar docks as they open
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
  /** ?open=1..5: the outcome, the opener's hero, a sentence a line (default: the `name`, with `line` under it). */
  outcome?: string[];
  /** ?open=1..5: the small area label (default: PillarAreaContext). */
  area?: ReactNode;
  children?: ReactNode;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

/** Matches a media query, live. */
const useMedia = (query: string) => {
  const [on, setOn] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const set = () => setOn(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, [query]);
  return on;
};

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
  outcome,
  area,
  children,
}: PillarIntroProps) => {
  const named = name !== undefined && name !== null;
  const line = named ? (lineProp ?? title) : undefined;
  const opener = useOpener();
  const areaCtx = useContext(PillarAreaContext);
  const lines = outcome ?? (typeof name === "string" ? [name] : undefined);
  // Support / Insights pass their outcome (their promise, docked as the bar's line); Sales' is its name
  const explicit = outcome !== undefined;
  const wide = useMedia("(min-width: 900px)");
  // the transition, if any (slide-aside needs the room for its rail: phones shrink to dock)
  const t = named && lines && opener !== "0" ? (opener === "2" && !wide ? "1" : opener) : null;
  const root = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const big = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const run = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [reduced] = useState(prefersReduced);
  const [isDocked, setDocked] = useState(false);

  // publish the bar's height, and keep the big name on one line (its size capped to the width it has)
  useLayoutEffect(() => {
    const r = root.current;
    const d = dock.current;
    if (!r || !d) return;
    const b = big.current;
    const measure = () => {
      // the rail is the side title: no bar for the content to clear
      r.style.setProperty("--pi-dock-h", t === "2" ? "0px" : `${d.offsetHeight}px`);
      const n = b?.querySelector<HTMLElement>(".pi-name");
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
    if (b) ro.observe(b);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [t]);

  // the scroll
  useLayoutEffect(() => {
    const r = root.current;
    const h = head.current;
    const d = dock.current;
    if (!r || !h || !d) return;
    const b = big.current;
    let frame = 0;

    // default: fade each big piece as it nears the nav; dock once the name passes into the bar's place
    const fadeAway = (vh: number, nav: number, bar: number) => {
      if (!b) return false;
      for (const el of b.querySelectorAll<HTMLElement>(".pi-fade")) {
        const a = el.getBoundingClientRect();
        // fully shown until it nears the bar; gone by the time its top reaches the nav
        el.style.setProperty("--pi-o", clamp01((a.top - nav) / (bar + a.height * 0.45)).toFixed(3));
      }
      // the bar comes in as the name's top passes into it (the big pieces then crossfade out)
      const key = b.querySelector<HTMLElement>(".pi-key");
      return key ? key.getBoundingClientRect().top < nav + bar * 0.6 : false;
    };

    // the transitions: one progress, --pi-p (0 → 1), from the scroll
    const transition = (nav: number, bar: number) => {
      const st = stage.current;
      const hr = hero.current;
      if (!st || !hr) return false;
      const stH = st.offsetHeight;
      let p = 0;
      let dockNow = false;
      if (t === "3") {
        // how much of the opener the sheet covers
        const top = body.current?.getBoundingClientRect().top ?? Infinity;
        p = clamp01((nav + stH - top) / stH);
        dockNow = top <= nav + bar;
      } else if (run.current) {
        const ru = run.current;
        const R = t === "2" ? stH * 0.6 : Math.max(1, ru.offsetHeight - stH);
        p = clamp01((nav - ru.getBoundingClientRect().top) / R);
        dockNow = t === "1" ? p >= 0.97 : t === "4" ? p >= 0.8 : t === "5" ? p >= 0.6 : false;
      }
      const e = easeInOut(p);
      r.style.setProperty("--pi-p", p.toFixed(4));
      r.style.setProperty("--pi-e", e.toFixed(4));
      const sr = st.getBoundingClientRect();
      if (t === "1") {
        // the outcome flies into the bar's place, at the docked label's size
        const o = hr.querySelector<HTMLElement>(".pi-outcome");
        const target = d.querySelector<HTMLElement>(explicit ? ".pi-dock-main" : ".pi-dock-label");
        if (o && target) {
          const hb = hr.getBoundingClientRect();
          const cx = hb.left + o.offsetLeft + o.offsetWidth / 2;
          const cy = hb.top + o.offsetTop + o.offsetHeight / 2;
          const tb = target.getBoundingClientRect();
          const s = Math.min(tb.width / o.offsetWidth, (bar * 0.6) / o.offsetHeight, 1);
          const dx = tb.left + tb.width / 2 - cx;
          const dy = nav + bar / 2 - cy;
          o.style.transform = `translate(${(dx * e).toFixed(1)}px, ${(dy * e).toFixed(1)}px) scale(${(1 + (s - 1) * e).toFixed(4)})`;
        }
      } else if (t === "2") {
        // from the screen's centre, big, into the rail
        const S = Math.min(2.6, (window.innerWidth * 0.84) / hr.offsetWidth, (stH * 0.62) / hr.offsetHeight);
        const cx = sr.left + hr.offsetLeft + hr.offsetWidth / 2;
        const cy = sr.top + hr.offsetTop + hr.offsetHeight / 2;
        const k = 1 - e;
        const dx = window.innerWidth / 2 - cx;
        const dy = sr.top + stH / 2 - cy;
        hr.style.transform = `translate(${(dx * k).toFixed(1)}px, ${(dy * k).toFixed(1)}px) scale(${(1 + (S - 1) * k).toFixed(4)})`;
      }
      return dockNow;
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
      setDocked(t ? transition(nav, bar) : fadeAway(vh, nav, bar));
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
  }, [t, explicit]);

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

  if (t && lines) {
    const areaLabel = area ?? areaCtx;
    // the line under the outcome: Sales' own (its outcome is its name); Support / Insights' outcome is their line
    const sub = outcome ? null : line;
    const full = lines.join(" ");
    // the split's halves: two sentences, or a one-line outcome's first word and the rest
    const [left, right] =
      lines.length > 1
        ? [lines.slice(0, Math.ceil(lines.length / 2)).join(" "), lines.slice(Math.ceil(lines.length / 2)).join(" ")]
        : [full.split(" ")[0], full.split(" ").slice(1).join(" ")];
    const iconDisc = icon && (
      <span className="pi-icon pi-h-part" aria-hidden="true">
        {icon}
      </span>
    );
    const areaTag = areaLabel && <span className="pi-area pi-h-part">{areaLabel}</span>;
    const subLine = sub && <span className={cn("pi-line pi-h-part", lineClassName)}>{sub}</span>;
    const heroEl =
      t === "5" ? (
        <div ref={hero} className="pi-hero is-split">
          <div className="pi-door is-l">
            <div className="pi-door-top">
              {iconDisc}
              {areaTag}
            </div>
            <Tag className="pi-outcome">
              <span className="sr-only">{full}</span>
              <span aria-hidden="true">{left}</span>
            </Tag>
            <div />
          </div>
          <div className="pi-door is-r" aria-hidden="true">
            <div />
            <span className="pi-outcome">{right}</span>
            <div className="pi-door-bottom">{subLine}</div>
          </div>
        </div>
      ) : (
        <div ref={hero} className="pi-hero">
          {iconDisc}
          {areaTag}
          <Tag className="pi-outcome">
            {lines.map((l, i) => (
              <span key={i} className="pi-ol">
                {l}
              </span>
            ))}
          </Tag>
          {subLine}
        </div>
      );
    const stageEl = (
      <div ref={stage} className="pi-stage">
        {heroEl}
      </div>
    );
    return (
      <div
        ref={root}
        className={cn("pi pi-t", `pi-t${t}`, reduced && "is-still", isDocked && "is-docked", className)}
        style={accent ? ({ "--pi-bar": accent } as CSSProperties) : undefined}
      >
        {bar}
        {t === "2" ? (
          <div ref={run} className="pi-rail-grid">
            <div className="pi-rail">{stageEl}</div>
            <div className="pi-main">
              <div className="pi-run" />
              <div ref={body} className="pi-body">
                {children}
              </div>
            </div>
          </div>
        ) : (
          <>
            {t === "3" ? (
              stageEl
            ) : (
              <div ref={run} className="pi-run">
                {stageEl}
              </div>
            )}
            <div ref={body} className="pi-body">
              {children}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      ref={root}
      className={cn("pi", reduced && "is-still", isDocked && "is-docked", className)}
      style={accent ? ({ "--pi-bar": accent } as CSSProperties) : undefined}
    >
      {bar}
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
