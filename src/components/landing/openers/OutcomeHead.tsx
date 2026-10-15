import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "../Reveal";

/**
 * The structure options' section head (?struct=A|B|C, structs.css .oh-*):
 * the AREA as a small label (its icon in a disc, "Support"), the OUTCOME as
 * the big line ("Fewer tickets." / "Happier customers.", one line each), a
 * thick primary marker stroke drawing itself under the outcome's second half
 * when the head comes into view.
 *
 *   size  "md"  a half screen's head (B)
 *         "lg"  a screen's head (A)
 *         "xl"  an opener: the outcome is the screen (C)
 */
const OutcomeHead = ({
  area,
  icon,
  lead,
  tail,
  size = "lg",
  center = false,
  as: Tag = "h2",
  className,
}: {
  area: ReactNode;
  icon?: ReactNode;
  /** The outcome's first sentence ("Fewer tickets."). */
  lead?: ReactNode;
  /** Its second ("Happier customers."), underlined in marker. */
  tail?: ReactNode;
  size?: "md" | "lg" | "xl";
  center?: boolean;
  as?: "h2" | "h3" | "p";
  className?: string;
}) => {
  const [ref, inView] = useInView<HTMLElement>(0.35);
  return (
    <header ref={ref} className={cn("oh", `oh-${size}`, center && "is-center", inView && "is-in", className)}>
      <span className="oh-area">
        {icon && (
          <span className="oh-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="oh-area-text">{area}</span>
      </span>
      {(lead || tail) && (
        <Tag className="oh-outcome">
          {lead && <span className="oh-lead">{lead}</span>}{" "}
          {tail && (
            <span className="oh-tail">
              <span className="oh-tail-text">{tail}</span>
              <svg className="oh-mark" viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true">
                <path d="M4 12 C 70 4, 160 3, 296 9" pathLength={1} />
              </svg>
            </span>
          )}
        </Tag>
      )}
    </header>
  );
};

export default OutcomeHead;
