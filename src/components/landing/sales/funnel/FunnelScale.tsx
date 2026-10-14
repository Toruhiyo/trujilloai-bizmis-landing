import type { ComponentType } from "react";
import { useLocation } from "react-router-dom";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { useOnScreen, useReducedMotion } from "../hooks";
import FunnelCrowd from "./FunnelCrowd";
import FunnelFlow from "./FunnelFlow";
import FunnelRiver from "./FunnelRiver";
import type { ConceptProps } from "./model";
import { useFunnelSwitch } from "./model";

/**
 * The at-scale view: what Bizmis does to the whole store's traffic, next to
 * the one conversation the mockup shows. Three concepts on trial, picked
 * with ?funnel=:
 *  1. the flow: a stream of shoppers pours through the funnel, leaking at
 *     each stage; with Bizmis the leaks shrink and orders pour out;
 *  2. the crowd: a day's visitors as a crowd of figures that light up as
 *     they find a fit, decide and turn into orders;
 *  3. the river: a sankey of the whole funnel, its band widening at each
 *     stage Bizmis works, shoppers flowing along it.
 * Each takes the stage in `focus` (0–2, or 3 for the whole funnel): with
 * Bizmis on, every stage up to it is plugged; a switch flips without / with
 * on a loop (and on click).
 */
const CONCEPTS: Record<string, ComponentType<ConceptProps>> = {
  "1": FunnelFlow,
  "2": FunnelCrowd,
  "3": FunnelRiver,
};

const useFunnelConcept = () => {
  const { search } = useLocation();
  const key = new URLSearchParams(search).get("funnel") ?? "1";
  return CONCEPTS[key] ? key : "1";
};

const FunnelScale = ({
  focus,
  play: playProp,
  className,
}: {
  focus: number;
  /** Defaults to "while on screen". */
  play?: boolean;
  className?: string;
}) => {
  const f = useMessages().landing.sales.funnel;
  const concept = useFunnelConcept();
  const Concept = CONCEPTS[concept];
  const reduced = useReducedMotion();
  const [ref, onScreen] = useOnScreen<HTMLDivElement>(0.25);
  const play = (playProp ?? true) && onScreen;
  const { on, set, boost } = useFunnelSwitch(focus, play, reduced);

  return (
    <div
      ref={ref}
      className={cn("sl-fn", `is-c${concept}`, on && "is-with", className)}
      data-focus={focus}
    >
      <div className="sl-fn-head">
        <span className="sl-fn-eyebrow">
          {f.eyebrow}
          <span className="sl-fn-note">{f.note}</span>
        </span>
        <div className="sl-fn-switch" role="group" aria-label={f.eyebrow}>
          <span className="sl-fn-thumb" aria-hidden="true" />
          <button type="button" aria-pressed={!on} onClick={() => set(false)}>
            {f.without}
          </button>
          <button type="button" aria-pressed={on} onClick={() => set(true)}>
            {f.with}
          </button>
        </div>
      </div>
      <div className="sl-fn-viz">
        <Concept
          boost={boost}
          focus={focus}
          play={play}
          reduced={reduced}
          steps={f.steps}
          left={f.left}
        />
      </div>
    </div>
  );
};

export default FunnelScale;
