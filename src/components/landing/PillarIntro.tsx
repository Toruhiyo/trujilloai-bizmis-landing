import { useContext, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "@/styles/pillar-intro.css";
import "@/styles/pillar-openers.css";
import "@/styles/pillar-docks.css";
import { PillarAreaContext } from "./pillar/PillarArea";
import { PillBar, PillOpener } from "./pillar/PillDock";
import { useDockMorph } from "./pillar/useDockMorph";

/**
 * PillarIntro: a pillar's entrance and its sticky docked pill, the one
 * turning into the other as the page scrolls.
 *
 * On arrival the opener stands big in the middle of the screen: the eyebrow
 * (the area's icon and name in a pill), the OUTCOME on one line as the hero
 * (`outcome`, a sentence a part; by default the `name`, with Sales' `line`
 * under it). It HOLDS first: it stays put in the middle of the screen over
 * most of a screen of scroll (.pi-hold, --pi-hold) while the scroll plays a
 * small scene on it (the outcome growing a few %, the pill's ground drawing
 * in), its final state standing for the last third. Then the scroll MORPHS
 * it into the docked pill, floating centred under the nav ([icon] name |
 * the current part (Sales) or the outcome), over a short run (under a fifth
 * of a screen): each piece flies to its place in the pill, shrinking into
 * it, what has no place there fading on the way. Scrolling back reverses
 * it; if the scroll rests partway it finishes by itself in the direction it
 * was going (pillar/useDockMorph). The opener is sticky in its wrap
 * (.pi-bigwrap) through the hold and the run, so the compositor keeps it
 * still; in the flow there's only the hold and its runway (the morph's
 * scroll plus the bar's height), so the content (a pinned stage included)
 * is in place under the pill as the morph ends, fading in over its second
 * half. The pill stays to the end of the section. With
 * prefers-reduced-motion: no flight, the pill simply switches.
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
 *   the pill's label) while the outcome ("title") becomes the pill's line.
 * - The root publishes `--pi-dock-h` (the bar's height) so pinned children
 *   can sit right under it (`top: calc(nav + var(--pi-dock-h))`), and
 *   `.is-docked` once the pill has fully formed.
 * - The lockup is pillar/PillDock (pillar-docks.css), on the shared opener
 *   type of pillar-openers.css.
 */
export type PillarIntroProps = {
  /** The pillar's name, the benefit ("Boost Sales"): the docked label (and the outcome by default). */
  name: string;
  /** The pillar's icon (e.g. an AnimatedIcon element), in a disc in the eyebrow and in the pill. */
  icon?: ReactNode;
  /** The supporting line under the name. */
  line?: ReactNode;
  /** The line's docked form: a node, or a render prop given `{ docked }`. */
  docked?: ReactNode | ((state: { docked: boolean }) => ReactNode);
  /** The docked bar's ground (any CSS background); defaults to a glass of the pillar's soft accent. */
  accent?: string;
  /** The heading's element: "h2" (default), or "p"/"div" when the page has it elsewhere. */
  as?: "h2" | "p" | "div";
  className?: string;
  lineClassName?: string;
  /** The outcome, the opener's hero, a sentence a part (default: the `name`, with `line` under it). */
  outcome?: string[];
  /** The small area label (default: PillarAreaContext). */
  area?: ReactNode;
  children?: ReactNode;
};

/** Desktop: where the pinned screen's left column stands (the children of its grid left of its middle), as drawn. */
const DESKTOP = "(min-width: 1024px)";
const leftColumn = (body: HTMLElement | null) => {
  if (!body || typeof window === "undefined" || !window.matchMedia(DESKTOP).matches) return null;
  const grid = body.querySelector<HTMLElement>(".bzp-fit [class*='-grid'].is-pinned");
  if (!grid) return null;
  const g = grid.getBoundingClientRect();
  const mid = g.left + g.width / 2;
  let left = Infinity;
  let right = -Infinity;
  for (const kid of grid.children) {
    const k = kid.getBoundingClientRect();
    if (!k.width || k.right > mid + 1) continue;
    left = Math.min(left, k.left);
    right = Math.max(right, k.right);
  }
  return right > left ? { left, right } : null;
};

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

const PillarIntro = ({
  name,
  icon,
  line,
  docked,
  accent,
  as: Tag = "h2",
  className,
  lineClassName,
  outcome,
  area,
  children,
}: PillarIntroProps) => {
  const areaCtx = useContext(PillarAreaContext);
  const lines = outcome ?? [name];
  // with an outcome (Support, Insights), the eyebrow's words become the pill's label and the outcome its line
  const byOutcome = Boolean(outcome);
  const root = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const big = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const runway = useRef<HTMLDivElement>(null);
  const holdRef = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [reduced] = useState(prefersReduced);
  const [isDocked, setDocked] = useState(false);

  // the pill of Support / Insights docks over their pinned screen's left column on desktop (the right one is the mockup's)
  const pillOverColumn = byOutcome;

  // keep the pill on its line, and the opener's outcome on one line, their sizes capped to the width they have; publish the bar's height
  const fit = () => {
    const r = root.current;
    const d = dock.current;
    const b = big.current;
    if (!r || !d || !b) return;
    const col = pillOverColumn ? leftColumn(body.current) : null;
    if (col) {
      const box = d.getBoundingClientRect();
      d.style.setProperty("--odz-col-l", `${Math.max(0, col.left - box.left).toFixed(1)}px`);
      d.style.setProperty("--odz-col-r", `${Math.max(0, box.right - col.right).toFixed(1)}px`);
      d.dataset.col = "";
    } else delete d.dataset.col;
    const row = d.querySelector<HTMLElement>(".odz-in");
    if (row) {
      d.style.setProperty("--pi-dfit", "1");
      const cs = getComputedStyle(d);
      const room = d.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const need = row.scrollWidth;
      if (need > room && need > 0) d.style.setProperty("--pi-dfit", (room / need - 0.005).toFixed(4));
    }
    r.style.setProperty("--pi-dock-h", `${d.offsetHeight}px`);
    for (const n of b.querySelectorAll<HTMLElement>(".od-outcome.is-one")) {
      const text = n.firstElementChild as HTMLElement | null;
      if (!text || !n.parentElement) continue;
      n.style.setProperty("--pi-fit", "1");
      const need = text.offsetWidth;
      const box = n.parentElement;
      const cs = getComputedStyle(box);
      const room = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (need > room && need > 0) n.style.setProperty("--pi-fit", (room / need - 0.005).toFixed(4));
    }
  };

  // the hold and the morph, scrubbed by the scroll
  useDockMorph({
    root,
    head,
    big,
    dock,
    runway,
    body,
    reduced,
    hold: holdRef,
    onDocked: setDocked,
    prepare: fit,
  });

  const compact = typeof docked === "function" ? docked({ docked: isDocked }) : (docked ?? line);

  return (
    <div
      ref={root}
      className={cn("pi pi-od pi-od5 pi-odx pi-odx-d", pillOverColumn && "pi-pill-col", isDocked && "is-docked", className)}
      style={accent ? ({ "--pi-bar": accent } as CSSProperties) : undefined}
    >
      <div ref={head} className="pi-head">
        <div ref={dock} className="pi-dock is-named odz-bar odz-bar-d" aria-hidden="true">
          <PillBar icon={icon} label={byOutcome ? (area ?? areaCtx ?? name) : name} byOutcome={byOutcome} lines={byOutcome ? lines : undefined}>
            {compact}
          </PillBar>
        </div>
      </div>
      {/* the opener's wrap: it spans the hold and the morph's run, the opener sticky in it (pillar/useDockMorph sizes it) */}
      <div className="pi-bigwrap">
        <div ref={big} className="pi-big is-named">
          <PillOpener
            icon={icon}
            // the area's name over the outcome; over the pillar's own name (Sales) it would only repeat it: the mark alone
            area={outcome ? (area ?? areaCtx) : undefined}
            lines={lines}
            // Support / Insights' outcome is their line; Sales' is its name, its line under it
            sub={outcome ? undefined : line}
            lineClassName={lineClassName}
            as={Tag}
          />
        </div>
      </div>
      <div ref={holdRef} className="pi-hold" aria-hidden="true" />
      <div ref={runway} className="pi-runway" aria-hidden="true" />
      <div ref={body} className="pi-body">
        {children}
      </div>
    </div>
  );
};

export default PillarIntro;
