import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import PillarIntro from "../PillarIntro";
import SectionHead from "../openers/SectionHead";
import { useOpener } from "../openers/OpenerContext";

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
 */
const BenefitIntro = ({
  index,
  icon,
  name,
  promise,
  className,
  children,
}: {
  /** The section's place in the page ("02"). */
  index: string;
  icon: ReactNode;
  name: string;
  promise: string;
  className?: string;
  children: ReactNode;
}) => {
  const opener = useOpener();
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
