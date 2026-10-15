import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import PillarIntro from "../PillarIntro";

/**
 * A benefit section's opening for Customer Support and Store Insights:
 * PillarIntro, like Boost Sales. By default the NAME huge, its icon above it
 * and its promise under it; as it scrolls away the section's sticky docked
 * bar slides in (the name as a label, the promise beside it), and the
 * content follows under the bar.
 *
 * With the opener transitions under comparison (?open=1..5, pillar/
 * OpenerContext) the opener shows the OUTCOME big (`outcome`, the promise a
 * sentence a line) under the small area label (`area`), and hands over to
 * the content as that option does.
 */
const BenefitIntro = ({
  index,
  icon,
  name,
  promise,
  area,
  outcome,
  className,
  children,
}: {
  /** The section's place in the page ("02"). */
  index: string;
  icon: ReactNode;
  name: string;
  promise: string;
  /** The small area label for the transitions ("Support"). */
  area?: string;
  /** The promise, a sentence a line, for the transitions. */
  outcome?: string[];
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
    docked={<span className="bzp-dock-line">{promise}</span>}
    className={cn("bzp", className)}
  >
    <div className="bzp-body">{children}</div>
  </PillarIntro>
);

export default BenefitIntro;
