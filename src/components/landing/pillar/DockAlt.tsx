import { Fragment } from "react";
import type { ReactNode } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import type { AltStyle } from "./OpenerContext";

/**
 * The dock styles d, e and f (?dock=, OpenerContext): other ideas of what
 * the docked thing is, each again ONE lockup in the opener and in its docked
 * form (the same pieces, `data-pm` twins, set the same way), morphed by
 * pillar/useDockMorph like a, b and c. pillar-docks.css.
 *
 *   d  Pill     (the default) no bar. The opener's eyebrow is a pill ([icon] area); docked,
 *               the opener has shrunk into a floating pill centred under the
 *               nav: [icon] name | the current part (Sales) or the
 *               outcome. Its ground draws open from its middle as it docks.
 *   e  Tabs     a segmented control of the page's three pillars, the one
 *               you're in filled. Over the opener it's the eyebrow (numbers,
 *               the area in the filled one, its fill drawing in as the opener
 *               holds); docked, every tab gets its name, and Sales' carries
 *               its current part in marker. The outcome fades where it stands.
 *   f  Running  editorial, no bar: the chapter number in marker, the name in
 *               spaced capitals, a hairline, then the outcome as a running
 *               head in a light weight (Sales: its current part in marker).
 *               The opener sets the outcome lighter (Inter 700), its second
 *               sentence in the marker hand.
 *
 * Sales' line (`sub` big, `children` docked: SalesTitle) keeps its own
 * classes; in d and e the bar shows only its current part (the others
 * stacked under it, hidden, --pm-absent: 1, so the morph gives them no twin).
 */
export type { AltStyle } from "./OpenerContext";

/** The page's three pillars, for the tabs. */
const useChapters = () => {
  const b = useMessages().benefits;
  return [
    { n: "01", name: b.sales.badge },
    { n: "02", name: b.support.badge },
    { n: "03", name: b.insights.badge },
  ];
};

/** The outcome, a sentence a part (one line wide, a line each on phones); f sets the sentences after the first in the marker hand. */
const Outcome = ({
  style,
  lines,
  ride,
  as: Tag,
}: {
  style: AltStyle;
  lines: string[];
  ride?: string;
  as: "h2" | "p" | "div";
}) => (
  <Tag className="od-outcome is-one odz-title" data-pm="title" data-pm-ride={ride}>
    <span className="od-l" data-ph="grow">
      {lines.map((line, i) => (
        <Fragment key={i}>
          <span className={cn("odx-ln pm-part", style === "f" && i > 0 && "is-hand")}>{line}</span>
          {i < lines.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  </Tag>
);

/** The outcome in the docked form, a sentence a part (the twins of the opener's). */
const DockLine = ({ lines }: { lines: string[] }) => (
  <span className="bzp-dock-line">
    {lines.map((line, i) => (
      <Fragment key={i}>
        <span className="odx-ln pm-part">{line}</span>
        {i < lines.length - 1 ? " " : null}
      </Fragment>
    ))}
  </span>
);

const Icon = ({ icon }: { icon?: ReactNode }) =>
  icon ? (
    <span className="odz-icon" data-pm="icon" aria-hidden="true">
      {icon}
    </span>
  ) : null;

export const AltOpener = ({
  style,
  index,
  icon,
  area,
  lines,
  sub,
  lineClassName,
  as: Tag = "h2",
}: {
  style: AltStyle;
  index?: string;
  icon?: ReactNode;
  /** The area's name (Support, Insights); none over Sales' own name. */
  area?: ReactNode;
  lines: string[];
  sub?: ReactNode;
  lineClassName?: string;
  as?: "h2" | "p" | "div";
}) => {
  const chapters = useChapters();
  const subEl = sub ? (
    <span className={cn("pi-line od-sub odz-sub", lineClassName)} data-pm="sub">
      {sub}
    </span>
  ) : null;

  if (style === "d")
    return (
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
        <Outcome style={style} lines={lines} as={Tag} />
        {subEl}
      </div>
    );

  if (style === "e") {
    const on = index ?? "01";
    return (
      <div className="odz odz-e">
        <span className="odz-tabs" aria-hidden="true">
          <span className="odz-tabs-ground" data-pm="tabs" data-pm-ride={`n${on}`} />
          {chapters.map((c) => (
            <span key={c.n} className={cn("odz-tab", c.n === on && "is-on")}>
              {c.n === on && (
                <span className="odz-fill" data-pm="fill" data-pm-ride={`n${on}`}>
                  <i data-ph="draw" />
                </span>
              )}
              <span className="odz-n" data-pm={`n${c.n}`}>
                {c.n}
              </span>
              {c.n === on && area && (
                <span className="odz-label" data-pm="area">
                  {area}
                </span>
              )}
            </span>
          ))}
        </span>
        {/* Support's / Insights' outcome has no tab of its own: it fades where it stands */}
        <Outcome style={style} lines={lines} ride={area ? "none" : undefined} as={Tag} />
        {subEl}
      </div>
    );
  }

  return (
    <div className="odz odz-f">
      <span className="odz-kick">
        {index && (
          <span className="odz-num" data-pm="num" aria-hidden="true">
            {index}
          </span>
        )}
        {area && (
          <span className="odz-label" data-pm="area">
            {area}
          </span>
        )}
        <span className="odz-rule" data-pm="rule" aria-hidden="true">
          <i data-ph="draw" />
        </span>
      </span>
      <Outcome style={style} lines={lines} as={Tag} />
      {subEl}
    </div>
  );
};

export const AltBar = ({
  style,
  index,
  icon,
  label,
  byOutcome,
  lines,
  children,
}: {
  style: AltStyle;
  index?: string;
  icon?: ReactNode;
  /** The area's name (with an outcome) or the pillar's name (Sales). */
  label: ReactNode;
  byOutcome: boolean;
  /** The outcome, a sentence a part. */
  lines?: string[];
  /** Sales' line (SalesTitle, its current part lit). */
  children?: ReactNode;
}) => {
  const chapters = useChapters();
  const main = byOutcome && lines?.length ? <DockLine lines={lines} /> : children;
  const labelEl = (
    <span className={cn("odz-label", !byOutcome && "is-hero")} data-pm={byOutcome ? "area" : "title"}>
      {label}
    </span>
  );
  const mainEl = main ? (
    <span className={cn("odz-main", byOutcome ? "is-outcome" : "is-line")} data-pm={byOutcome ? "title" : "sub"}>
      {main}
    </span>
  ) : null;

  if (style === "d")
    return (
      <span className={cn("odz-in odz-pill", byOutcome && "is-outcome")}>
        <span className="odz-pill-head">
          <Icon icon={icon} />
          {labelEl}
        </span>
        {mainEl && (
          <>
            <span className="odz-sep" data-pm="sep" aria-hidden="true" />
            {mainEl}
          </>
        )}
      </span>
    );

  if (style === "e") {
    const on = index ?? "01";
    return (
      <span className="odz-in odz-tabs">
        {chapters.map((c) => (
          <span key={c.n} className={cn("odz-tab", c.n === on && "is-on")}>
            <span className="odz-n" data-pm={`n${c.n}`}>
              {c.n}
            </span>
            {c.n === on ? (
              <>
                {labelEl}
                {!byOutcome && mainEl}
              </>
            ) : (
              <span className="odz-label" data-pm={`t${c.n}`}>
                {c.name}
              </span>
            )}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={cn("odz-in odz-run", byOutcome && "is-outcome")}>
      <span className="odz-run-head">
        {index && (
          <span className="odz-num" data-pm="num">
            {index}
          </span>
        )}
        {labelEl}
        <span className="odz-rule" data-pm="rule" />
      </span>
      {mainEl}
    </span>
  );
};
