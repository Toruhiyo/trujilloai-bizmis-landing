import type { CSSProperties } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * The pillar's title, "Shoppers / Find it. / Trust it. / Buy it.", with the
 * part being shown lit (`active`: 0–2, or "all" for the payoff, or null for
 * none). `stack` sets each part on its own line (the rail); `line` keeps it
 * to one line (a header bar). How a lit part looks is up to the variant's
 * CSS (.sl-title in landing-sales.css).
 */
const SalesTitle = ({
  active,
  layout,
  as: Tag = "h2",
  fills,
  className,
}: {
  active: number | "all" | null;
  layout: "stack" | "line";
  /** "p" for a visual copy of a title that's already on the page (it's hidden from screen readers). */
  as?: "h2" | "p";
  /** Progress under each part, 0–1 (as --fill), for a layout that draws it. */
  fills?: number[];
  className?: string;
}) => {
  const s = useMessages().landing.sales;
  return (
    <Tag
      className={cn("sl-title", `is-${layout}`, className)}
      aria-hidden={Tag === "p" || undefined}
    >
      <span className="sl-title-lead">{s.titleLead} </span>
      {s.titleParts.map((part, i) => (
        <span key={part}>
          <span
            className={cn(
              "sl-title-part",
              active === "all" || active === i ? "is-on" : "is-off",
            )}
            style={fills ? ({ "--fill": fills[i] ?? 0 } as CSSProperties) : undefined}
          >
            <span className="sl-title-text">{part}</span>
          </span>
          {i < s.titleParts.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
};

/** The title as plain text, for the one heading screen readers get. */
export const SalesHeading = () => {
  const s = useMessages().landing.sales;
  return (
    <h2 className="sr-only">
      {s.titleLead} {s.titleParts.join(" ")}
    </h2>
  );
};

export default SalesTitle;
