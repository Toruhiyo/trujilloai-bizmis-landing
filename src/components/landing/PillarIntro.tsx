import { useContext, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "@/styles/pillar-intro.css";
import "@/styles/pillar-openers.css";
import { PillarAreaContext, useDockStyle, useOpener } from "./pillar/OpenerContext";
import OpenerDesign, { DockBar, DockOpener } from "./pillar/OpenerDesign";
import type { Motif } from "./pillar/OpenerDesign";
import { useDockMorph } from "./pillar/useDockMorph";

/**
 * PillarIntro: a pillar's entrance and its sticky docked bar, the one
 * turning into the other as the page scrolls.
 *
 * On arrival the opener stands big in the middle of the screen (the chapter
 * design: the number in marker, the eyebrow with the area's icon and name,
 * the outcome on one line, Sales' line under it). From when the section's
 * top reaches the nav, the scroll MORPHS it into the docked bar ([icon]
 * Name | line), over a short run (under a fifth of a screen): each piece
 * flies to its place in the bar, shrinking into it, the parts of a
 * two-line line settling into the bar's one line, what has no place there
 * (the number, the rule) fading on the way, the bar's ground fading in.
 * Scrolling back reverses it; if the scroll rests partway it finishes by
 * itself in the direction it was going (pillar/useDockMorph). The opener
 * stands over the section's top (one screen tall, so it's centred when the
 * morph starts); in the flow there's only its runway (the morph's scroll
 * plus the bar's height), so the content (a pinned stage included) is in
 * place under the bar as the morph ends, fading in over its second half.
 * The bar stays to the end of the section. With prefers-reduced-motion: no flight, the bar
 * simply switches.
 *
 *   <PillarIntro
 *     name="Boost Sales"                            // the docked label (and the outcome by default)
 *     icon={<TrendIcon />}                          // optional, in a disc
 *     line={<SalesTitle … />}                       // optional supporting line
 *     docked={({ docked }) => <SalesTitle … />}     // optional: the line's docked form (defaults to `line`)
 *     accent="color-mix(…)"                         // optional: the docked bar's ground
 *   >
 *     …the sub-benefits…
 *   </PillarIntro>
 *
 * - The pieces that morph carry `data-pm` keys on both sides: "icon",
 *   "title", "sub", and with an `outcome`, "area" (the eyebrow's words →
 *   the bar's label) while the outcome ("title") becomes the bar's line.
 * - `name` / `icon` / `line` (+ `index`): with ?open=0 the old entrance:
 *   the icon in its disc, the name huge on one line (capped to the width it
 *   has, --pi-fit), the line under it. The name is the heading (an <h2>
 *   unless `as` says otherwise). In the bar: .pi-dock-name (icon + name, a
 *   strong label) then the docked line; on phones they stack.
 * - Legacy: `title` (big, `titleClassName`) with `chip` above it; the bar
 *   shows `docked` (default: `title`) with the chip on desktop.
 * - The root publishes `--pi-dock-h` (the bar's height) so pinned children
 *   can sit right under it (`top: calc(nav + var(--pi-dock-h))`), and
 *   `.is-docked` once the bar has fully formed.
 * - ?dock=a|b|c (pillar/OpenerContext useDockStyle) swaps the opener and
 *   its bar for a style under comparison, each ONE lockup (pillar/OpenerDesign
 *   DockOpener + DockBar: the same mark, label and outcome, set the same
 *   way, the bar the opener shrunk into place): a calm one (the icon in its
 *   disc, small capitals; the bar's ground grows from a pill), an editorial
 *   one (left-aligned, the marker number and a hairline), a curtain (the
 *   band's colour lifting the title into the bar). Before the morph they
 *   HOLD: the opener stays put in the middle of the screen over a further
 *   run (.pi-hold, --pi-hold) while the scroll plays a small scene on it
 *   (the outcome growing a few %, its words lighting up, a line drawing),
 *   then the morph runs as quick as ever.
 * - The opener designs (?open=1..6, pillar/OpenerContext; the page's default
 *   is 5) are pillar/OpenerDesign: the OUTCOME the hero (`outcome`; by
 *   default the `name`, with `line` under it), the AREA the eyebrow (`area`;
 *   by default PillarAreaContext), `motif` the pillar's drawing (by default
 *   "sales").
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
  // a dock style under comparison (?dock=a|b|c), with an opener design
  const dockStyle = useDockStyle();
  const alt = v && dockStyle !== "0" ? dockStyle : null;
  const root = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const big = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const runway = useRef<HTMLDivElement>(null);
  const holdRef = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [reduced] = useState(prefersReduced);
  const [isDocked, setDocked] = useState(false);

  // keep the bar on its line(s), and the big name (or the chapter's outcome) on one line, their sizes capped to the width they have; publish the bar's height
  const fit = () => {
    const r = root.current;
    const d = dock.current;
    const b = big.current;
    if (!r || !d || !b) return;
    const row = d.querySelector<HTMLElement>(".odx-bar-in");
    if (row) {
      d.style.setProperty("--pi-dfit", "1");
      const cs = getComputedStyle(d);
      const room = d.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const need = row.scrollWidth;
      if (need > room && need > 0) d.style.setProperty("--pi-dfit", (room / need - 0.005).toFixed(4));
    }
    r.style.setProperty("--pi-dock-h", `${d.offsetHeight}px`);
    for (const n of b.querySelectorAll<HTMLElement>(".pi-name, .od-outcome.is-one")) {
      const text = n.firstElementChild as HTMLElement | null;
      if (!text) continue;
      n.style.setProperty("--pi-fit", "1");
      const need = text.offsetWidth;
      let room = n.clientWidth;
      if (n.classList.contains("is-one") && n.parentElement) {
        const box = n.parentElement;
        const cs = getComputedStyle(box);
        room = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      }
      if (need > room && need > 0) n.style.setProperty("--pi-fit", (room / need - 0.005).toFixed(4));
    }
  };

  // the morph, scrubbed by the scroll
  useDockMorph({
    root,
    head,
    big,
    dock,
    runway,
    body,
    reduced,
    hold: alt ? holdRef : undefined,
    ground: alt === "a" ? "pill" : alt === "c" ? "curtain" : "fade",
    onDocked: setDocked,
    prepare: fit,
    deps: [v, alt],
  });

  const compact =
    typeof docked === "function" ? docked({ docked: isDocked }) : (docked ?? (named ? line : title));

  // with an outcome, the eyebrow's words become the bar's label and the outcome its line
  const byOutcome = Boolean(v && outcome);
  const bar = (
    <div ref={head} className="pi-head">
      {alt === "c" && <span className="pi-curtain" aria-hidden="true" />}
      <div
        ref={dock}
        className={cn("pi-dock", named && "is-named", alt && `odx-bar odx-bar-${alt}`, dockClassName)}
        aria-hidden="true"
      >
        {alt ? (
          <DockBar
            style={alt}
            index={index}
            icon={icon}
            label={byOutcome ? (area ?? areaCtx ?? name) : name}
            byOutcome={byOutcome}
            lines={byOutcome ? lines : undefined}
          >
            {compact}
          </DockBar>
        ) : named ? (
          <span className="pi-dock-name">
            {icon && (
              <span className="pi-dock-icon" data-pm="icon">
                {icon}
              </span>
            )}
            <span className="pi-dock-label" data-pm={byOutcome ? "area" : "title"}>
              {name}
            </span>
          </span>
        ) : (
          chip && (
            <span className="pi-dock-chip" data-pm="chip">
              {chip}
            </span>
          )
        )}
        {!alt && compact && (
          <div className="pi-dock-main" data-pm={byOutcome ? "title" : "sub"}>
            {compact}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      ref={root}
      className={cn("pi", v && `pi-od pi-od${v}`, alt && `pi-odx pi-odx-${alt}`, isDocked && "is-docked", className)}
      style={accent ? ({ "--pi-bar": accent } as CSSProperties) : undefined}
    >
      {bar}
      <div ref={big} className={cn("pi-big", named && "is-named")}>
        {alt && lines ? (
          <DockOpener
            style={alt}
            index={index}
            icon={icon}
            // the area's name over the outcome; over the pillar's own name (Sales) it would only repeat it: the mark alone
            area={outcome ? (area ?? areaCtx) : undefined}
            lines={lines}
            sub={outcome ? undefined : line}
            lineClassName={lineClassName}
            as={Tag}
          />
        ) : v && lines ? (
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
              <span className="pi-icon" data-pm="icon" aria-hidden="true">
                {icon}
              </span>
            )}
            <Tag className={cn("pi-name", nameClassName)} data-pm="title">
              <span className="pi-name-text">{name}</span>
            </Tag>
            {line && (
              <span className={cn("pi-line", lineClassName)} data-pm="sub">
                {line}
              </span>
            )}
          </>
        ) : (
          <>
            {chip && (
              <span className="pi-chip" data-pm="chip-big">
                {chip}
              </span>
            )}
            <Tag className={cn("pi-title", titleClassName)} data-pm="sub">
              {title}
            </Tag>
          </>
        )}
      </div>
      {alt && <div ref={holdRef} className="pi-hold" aria-hidden="true" />}
      <div ref={runway} className="pi-runway" aria-hidden="true" />
      <div ref={body} className="pi-body">
        {children}
      </div>
    </div>
  );
};

export default PillarIntro;
