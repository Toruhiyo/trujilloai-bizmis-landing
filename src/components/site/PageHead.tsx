import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import { cn } from "@/lib/utils";

/**
 * A page's (or a page section's) header in the landing's section-head style
 * (landing/SectionHead, mirrored in bzl-site.css): a centred pill eyebrow
 * (line icon in its cream disc, then the label), the title in Inter 800 with
 * the tight tracking, and the lead in the pillars' lead style. `as` picks the
 * heading level: h1 for the page's own head, h2 for a section inside it.
 */
const PageHead = ({
  icon: Icon,
  eyebrow,
  title,
  lead,
  as: Heading = "h1",
  id,
  className,
  children,
}: {
  icon?: LucideIcon;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  as?: "h1" | "h2";
  id?: string;
  className?: string;
  children?: ReactNode;
}) => (
  <div className={cn("bzl-site-head", Heading === "h2" && "is-sub", className)}>
    {eyebrow && (
      <Reveal>
        <p className="bzl-site-pill">
          {Icon && (
            <span className="bzl-site-pill-icon" aria-hidden="true">
              <Icon strokeWidth={2} />
            </span>
          )}
          <span>{eyebrow}</span>
        </p>
      </Reveal>
    )}
    <Reveal delay={80}>
      <Heading id={id} className="bzl-site-title">
        {title}
      </Heading>
    </Reveal>
    {lead && (
      <Reveal delay={160}>
        <p className="bzl-site-lead">{lead}</p>
      </Reveal>
    )}
    {children}
  </div>
);

export default PageHead;
