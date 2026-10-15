import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import PillarIntro from "../PillarIntro";
import SectionHead from "../openers/SectionHead";
import { useOpener } from "../openers/OpenerContext";
import { isOpenerVariant, useStruct } from "../openers/StructContext";

/**
 * A benefit section's opening for Customer Support and Store Insights.
 *
 * By default (opener "0") it's PillarIntro, like Boost Sales: the NAME huge,
 * its icon above it and its promise under it; as it scrolls away the
 * section's sticky docked bar slides in (the name as a label, the promise
 * beside it), and the content follows under the bar.
 *
 * With the one-screen approaches under comparison (?open=1..5) there's no
 * opener and no bar: the title sits inline at the top of the section
 * (openers/SectionHead), styled by openers.css.
 *
 * With the redesigned openers (?struct=D..G) it's PillarIntro again, its
 * entrance flipped: the outcome (`outcome`, the promise a sentence a line) is
 * the hero and the name is the small area label; `moment` is the pillar's
 * marker drawing for the split opener (E).
 */
const BenefitIntro = ({
  index,
  icon,
  name,
  promise,
  outcome,
  moment,
  className,
  children,
}: {
  /** The section's place in the page ("02"). */
  index: string;
  icon: ReactNode;
  name: string;
  promise: string;
  /** ?struct=D..G: the promise, a sentence a line. */
  outcome?: string[];
  /** ?struct=E: the pillar's marker moment, beside the outcome. */
  moment?: ReactNode;
  className?: string;
  children: ReactNode;
}) => {
  const opener = useOpener();
  const struct = useStruct();
  if (isOpenerVariant(struct))
    return (
      <PillarIntro
        index={index}
        name={name}
        icon={icon}
        line={promise}
        outcome={outcome ?? [promise]}
        area={name}
        moment={moment}
        docked={<span className="bzp-dock-line">{promise}</span>}
        className={cn("bzp", className)}
      >
        <div className="bzp-body">{children}</div>
      </PillarIntro>
    );
  if (opener === "0")
    return (
      <PillarIntro
        index={index}
        name={name}
        icon={icon}
        line={promise}
        docked={<span className="bzp-dock-line">{promise}</span>}
        className={cn("bzp", className)}
      >
        <div className="bzp-body">{children}</div>
      </PillarIntro>
    );
  return (
    <>
      <SectionHead index={index} icon={icon} name={name} promise={promise} className={cn("bzp-head", className)} />
      <div className="bzp-body">{children}</div>
    </>
  );
};

export default BenefitIntro;
