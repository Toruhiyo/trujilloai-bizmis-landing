import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import SectionHead from "../openers/SectionHead";

/**
 * A benefit section's opening for Customer Support and Store Insights: no
 * opener screen and no sticky bar (only Boost Sales, the long pinned
 * section, has those). The section is one screen; its title sits inline at
 * the top of it (openers/SectionHead: the animated icon, the name, the
 * promise), styled by the page's opener approach (openers.css, ?open=1..5),
 * and the content follows in the same screen.
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
}) => (
  <>
    <SectionHead index={index} icon={icon} name={name} promise={promise} className={cn("bzp-head", className)} />
    <div className="bzp-body">{children}</div>
  </>
);

export default BenefitIntro;
