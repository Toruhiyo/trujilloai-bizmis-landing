import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Every content section's header (Boost Sales, Customer Support, Store
 * Insights, One-Click Setup, Personalization), one markup for all of them, so
 * the header variants (?hdr=1..6, openers.css) style every section the same
 * way: the section's animated icon in its disc, its index ("01"), its name,
 * its promise, plus the pieces only some variants show (a small index
 * kicker, a huge ghost number, a marker underline under the name).
 *
 * Inside a pillar it's rendered by PillarIntro (which adds its own classes
 * for the docked bar and the scroll fade through the *ClassName props);
 * One-Click Setup and Personalization render it directly.
 */
export type SectionHeadProps = {
  /** "01".."05": the section's place in the sequence. */
  index: string;
  /** Of how many ("05"), for the variants that show "01 / 05". */
  total?: string;
  icon: ReactNode;
  name: ReactNode;
  promise?: ReactNode;
  /** The name's element: an h2 unless the page has its heading elsewhere. */
  as?: "h2" | "p" | "div";
  className?: string;
  iconClassName?: string;
  nameClassName?: string;
  promiseClassName?: string;
};

const SectionHead = ({
  index,
  total = "05",
  icon,
  name,
  promise,
  as: Tag = "h2",
  className,
  iconClassName,
  nameClassName,
  promiseClassName,
}: SectionHeadProps) => (
  <header className={cn("sh", className)} data-index={index}>
    <span className="sh-ghost" aria-hidden="true">
      {index}
    </span>
    <span className={cn("sh-icon", iconClassName)} aria-hidden="true">
      {icon}
    </span>
    <span className="sh-text">
      <span className="sh-kicker" aria-hidden="true">
        <span className="sh-num">{index}</span>
        <span className="sh-of"> / {total}</span>
      </span>
      <Tag className={cn("sh-name", nameClassName)}>
        <span className="sh-name-text pi-name-text">{name}</span>
        {/* the marker underline (only some variants show it) */}
        <svg className="sh-mark" viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true">
          <path d="M4 12 C 70 4, 160 3, 296 9" pathLength={1} />
        </svg>
      </Tag>
      {promise && <span className={cn("sh-promise", promiseClassName)}>{promise}</span>}
    </span>
  </header>
);

export default SectionHead;
