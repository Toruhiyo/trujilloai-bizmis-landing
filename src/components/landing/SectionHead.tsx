import type { LucideIcon } from "lucide-react";
import Reveal from "./Reveal";

/**
 * One-Click Setup's and Make It Truly Yours' own header, set as the pillars'
 * openers are (the docked header's pill style, pillar-docks.css .odz-d): a
 * centred pill eyebrow ([line icon in its cream disc] area name), the title in
 * the openers' weight and tracking (Inter 800, tight), and the sub-lead in the
 * pillars' own lead style (.bzl-pillar-lead, Support's and Insights'). Mirrors
 * the openers' look only; the pillar files stay theirs.
 * film-landing.css (.bzl-shead).
 */
const SectionHead = ({
  icon: Icon,
  eyebrow,
  title,
  lead,
  className,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  lead?: string;
  className?: string;
}) => (
  <div className={className ? `bzl-shead ${className}` : "bzl-shead"}>
    <Reveal>
      <p className="bzl-shead-pill">
        <span className="bzl-shead-icon" aria-hidden="true">
          <Icon strokeWidth={2} />
        </span>
        <span className="bzl-shead-label">{eyebrow}</span>
      </p>
    </Reveal>
    <Reveal delay={80}>
      <h2 className="bzl-shead-title">{title}</h2>
    </Reveal>
    {lead && (
      <Reveal delay={160}>
        <p className="bzl-pillar-lead bzl-shead-lead">{lead}</p>
      </Reveal>
    )}
  </div>
);

export default SectionHead;
