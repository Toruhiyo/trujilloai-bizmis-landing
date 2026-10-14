import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import PillarIntro from "../PillarIntro";

/**
 * A benefit pillar's entrance for Support and Insights, on PillarIntro's
 * named pattern (the same one Sales opens with): when the pillar is reached
 * its NAME stands huge ("Customer Support"), its icon above it and its
 * promise ("Fewer tickets. Happier customers.") as the supporting line under
 * it; as you scroll each piece flies onto the section's sticky docked bar,
 * the name as a strong label with the promise beside it (stacked under it
 * on phones), while the content comes in under the bar, one screen tall.
 * In the pillar's own colours (--acc, --acc-ink, --acc-soft from
 * .bzl-pillar.p-*); the skin is .bzp-* in film-landing.css.
 */
const BenefitIntro = ({
  icon,
  name,
  promise,
  className,
  children,
}: {
  icon: ReactNode;
  name: string;
  promise: string;
  className?: string;
  children: ReactNode;
}) => (
  <PillarIntro
    name={name}
    icon={icon}
    line={promise}
    docked={<span className="bzp-dock-line">{promise}</span>}
    className={cn("bzp", className)}
  >
    <div className="bzp-body">{children}</div>
  </PillarIntro>
);

export default BenefitIntro;
