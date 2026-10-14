import type { CSSProperties } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * The pillar's title, "Shoppers / Find it. / Trust it. / Buy it.", with the
 * part being shown lit (`active`: 0–2, or "all" for the payoff, or null for
 * none; the parts before it are also marked done). `stack` sets each part on
 * its own line (the rail); `line` keeps it to one line (a header bar);
 * `big` is the pillar's entrance (PillarIntro), every part kept whole on
 * its line. How a lit part looks is up to
 * the variant's CSS (.sl-title in landing-sales.css). `marks` draws a marker
 * underline under each part (.sl-title-mark), which the CSS shows on the lit
 * part and, calmer, on the parts already shown.
 */
const SalesTitle = ({
  active,
  layout,
  as: Tag = "h2",
  fills,
  marks,
  className,
}: {
  active: number | "all" | null;
  layout: "stack" | "line" | "big";
  /** "p" / "span" for a visual copy of a title that's already on the page (hidden from screen readers). */
  as?: "h2" | "p" | "span";
  /** Progress under each part, 0–1 (as --fill), for a layout that draws it. */
  fills?: number[];
  /** A marker underline under each part (shown by the CSS on the lit and done parts). */
  marks?: boolean;
  className?: string;
}) => {
  const s = useMessages().landing.sales;
  return (
    <Tag
      className={cn("sl-title", `is-${layout}`, className)}
      aria-hidden={Tag !== "h2" || undefined}
    >
      <span className="sl-title-lead">
        {s.titleLead}
      </span>{" "}
      {s.titleParts.map((part, i) => (
        <span key={part}>
          <span
            className={cn(
              "sl-title-part",
              active === "all" || active === i
                ? "is-on"
                : typeof active === "number" && i < active
                  ? "is-off is-done"
                  : "is-off",
            )}
            style={fills ? ({ "--fill": fills[i] ?? 0 } as CSSProperties) : undefined}
          >
            <span className="sl-title-text">
              {part}
              {marks && (
                <svg className="sl-title-mark" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M1.5 7.2C24 4.6 58 3.6 98.5 5.4" />
                </svg>
              )}
            </span>
          </span>
          {i < s.titleParts.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
};

/** The title as plain text for screen readers: the heading, or (`as="p"`) the line under a visible heading. */
export const SalesHeading = ({ as: Tag = "h2" }: { as?: "h2" | "p" }) => {
  const s = useMessages().landing.sales;
  return (
    <Tag className="sr-only">
      {s.titleLead} {s.titleParts.join(" ")}
    </Tag>
  );
};

export default SalesTitle;
