import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import PillarIntro from "../PillarIntro";
import type { Motif } from "./OpenerDesign";

/**
 * A benefit section's opening for Customer Support and Store Insights:
 * PillarIntro, like Boost Sales. By default the NAME huge, its icon above it
 * and its promise under it; as it scrolls away the section's sticky docked
 * bar slides in (the name as a label, the promise beside it), and the
 * content follows under the bar.
 *
 * With the opener designs under comparison (?open=1..6, pillar/OpenerDesign)
 * the opener shows the OUTCOME big (`outcome`, the promise a sentence a
 * line) with the small area label (`area`) and the pillar's drawings
 * (`motif`).
 */
const BenefitIntro = ({
  index,
  icon,
  name,
  promise,
  area,
  outcome,
  motif,
  className,
  children,
}: {
  /** The section's place in the page ("02"). */
  index: string;
  icon: ReactNode;
  name: string;
  promise: string;
  /** The small area label for the opener designs ("Support"). */
  area?: string;
  /** The promise, a sentence a line, for the opener designs. */
  outcome?: string[];
  /** The pillar, for the designs' drawings. */
  motif?: Motif;
  className?: string;
  children: ReactNode;
}) => (
  <PillarIntro
    index={index}
    name={name}
    icon={icon}
    line={promise}
    area={area}
    outcome={outcome}
    motif={motif}
    docked={<span className="bzp-dock-line">{promise}</span>}
    className={cn("bzp", className)}
  >
    <div className="bzp-body">{children}</div>
  </PillarIntro>
);

export default BenefitIntro;
