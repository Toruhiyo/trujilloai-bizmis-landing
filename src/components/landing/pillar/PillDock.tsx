import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The pillar's opener and its docked pill, ONE lockup in both forms (the
 * same pieces, `data-pm` twins, set the same way), morphed by
 * pillar/useDockMorph. pillar-docks.css.
 *
 * The opener's eyebrow is a pill ([icon] area); docked, the opener has
 * shrunk into a floating pill centred under the nav: [icon] name | the
 * current part (Sales) or the outcome. Its ground draws open from its middle
 * as it docks.
 *
 * Sales' line (`sub` big, `children` docked: SalesTitle) keeps its own
 * classes; the pill shows only its current part (the others stacked under
 * it, hidden, --pm-absent: 1, so the morph gives them no twin).
 */

/** The outcome, a sentence a part (one line wide, a line each on phones). */
const Outcome = ({ lines, as: Tag }: { lines: string[]; as: "h2" | "p" | "div" }) => (
  <Tag className="od-outcome is-one odz-title" data-pm="title">
    <span className="od-l" data-ph="grow">
      {/* a flat list, no keyed fragment: the dev tagger's data-lov-id on one floods the console */}
      {lines.flatMap((line, i) => [
        <span key={i} className="odx-ln pm-part">
          {line}
        </span>,
        i < lines.length - 1 ? " " : null,
      ])}
    </span>
  </Tag>
);

/** The outcome in the docked form, a sentence a part (the twins of the opener's). */
const DockLine = ({ lines }: { lines: string[] }) => (
  <span className="bzp-dock-line">
    {lines.flatMap((line, i) => [
      <span key={i} className="odx-ln pm-part">
        {line}
      </span>,
      i < lines.length - 1 ? " " : null,
    ])}
  </span>
);

const Icon = ({ icon }: { icon?: ReactNode }) =>
  icon ? (
    <span className="odz-icon" data-pm="icon" aria-hidden="true">
      {icon}
    </span>
  ) : null;

export const PillOpener = ({
  icon,
  area,
  lines,
  sub,
  lineClassName,
  as: Tag = "h2",
}: {
  icon?: ReactNode;
  /** The area's name (Support, Insights); none over Sales' own name. */
  area?: ReactNode;
  lines: string[];
  sub?: ReactNode;
  lineClassName?: string;
  as?: "h2" | "p" | "div";
}) => (
  <div className="odz odz-d">
    <span className={cn("odz-kick", area && "is-pill")}>
      {/* the pill's ground: it draws open from the icon as the opener holds, and rides with the icon into the bar */}
      {area && (
        <span className="odz-chip" data-pm="chip" data-pm-ride="icon" aria-hidden="true">
          <i data-ph="draw" />
        </span>
      )}
      <Icon icon={icon} />
      {area && (
        <span className="odz-label" data-pm="area">
          {area}
        </span>
      )}
    </span>
    <Outcome lines={lines} as={Tag} />
    {sub ? (
      <span className={cn("pi-line od-sub odz-sub", lineClassName)} data-pm="sub">
        {sub}
      </span>
    ) : null}
  </div>
);

export const PillBar = ({
  icon,
  label,
  byOutcome,
  lines,
  children,
}: {
  icon?: ReactNode;
  /** The area's name (with an outcome) or the pillar's name (Sales). */
  label: ReactNode;
  byOutcome: boolean;
  /** The outcome, a sentence a part. */
  lines?: string[];
  /** Sales' line (SalesTitle, its current part lit). */
  children?: ReactNode;
}) => {
  const main = byOutcome && lines?.length ? <DockLine lines={lines} /> : children;
  return (
    <span className={cn("odz-in odz-pill", byOutcome && "is-outcome")}>
      <span className="odz-pill-head">
        <Icon icon={icon} />
        <span className={cn("odz-label", !byOutcome && "is-hero")} data-pm={byOutcome ? "area" : "title"}>
          {label}
        </span>
      </span>
      {main && (
        <>
          <span className="odz-sep" data-pm="sep" aria-hidden="true" />
          <span className={cn("odz-main", byOutcome ? "is-outcome" : "is-line")} data-pm={byOutcome ? "title" : "sub"}>
            {main}
          </span>
        </>
      )}
    </span>
  );
};
