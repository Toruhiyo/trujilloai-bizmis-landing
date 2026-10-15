import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Opener } from "./OpenerContext";

/**
 * The pillar openers' static designs under comparison (?open=1..6), rendered
 * by PillarIntro inside its big part: the OUTCOME is the hero ("Boost
 * Sales", "Fewer tickets. Happier customers."), the AREA a small label
 * ("Support"). They scroll away and dock the bar as today (PillarIntro: each
 * .pi-fade piece fades near the nav, .pi-key docks the bar). Film look:
 * white / cream, ink and the primary (white on the Sales orange), marker
 * and handwriting as the accent. pillar-openers.css.
 *
 *   1  Editorial    left-aligned outcome, the area as a running head over a hairline,
 *                   the chapter number at its end
 *   2  Marked       centred outcome, one key word circled in marker
 *   3  Backdrop     the outcome over a large faint marker drawing of the pillar
 *                   (the funnel, the inbox, the chart)
 *   4  Handwritten  a two-line statement, the second line in handwriting
 *   5  Chapter      the chapter number huge in marker handwriting, the outcome beside it
 *   6  Glyph        minimal: the pillar's icon as a large marker drawing, the outcome
 *                   quiet under it
 */
export type Motif = "sales" | "support" | "insights";

const Area = ({ icon, area, className }: { icon?: ReactNode; area?: ReactNode; className?: string }) =>
  area ? (
    <span className={cn("od-area", className)}>
      {icon && (
        <span className="od-area-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{area}</span>
    </span>
  ) : null;

/** A hand-drawn loop around a word (one stroke that runs past its start). */
const Loop = () => (
  <svg className="od-loop" viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true">
    <path d="M118 7 C 60 2, 10 14, 8 40 C 6 66, 70 76, 120 73 C 170 70, 194 56, 192 36 C 190 14, 150 4, 92 9" />
  </svg>
);

/** The pillar, drawn large and faint in marker: the funnel, the inbox, the chart. */
const Backdrop = ({ motif }: { motif: Motif }) => (
  <svg className="od-backdrop" viewBox="0 0 1000 420" aria-hidden="true">
    {motif === "sales" && (
      <g>
        <path d="M30 70 C 260 78, 470 128, 650 168 L 860 172" />
        <path d="M30 350 C 260 342, 470 292, 650 252 L 860 248" />
        <path d="M30 70 V 350" />
        {[
          [90, 130], [150, 260], [210, 190], [260, 300], [320, 150], [370, 230], [430, 200], [500, 245],
          [560, 190], [620, 220], [700, 205], [760, 214],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 9 : 7} className={i % 4 === 1 ? "is-dot" : undefined} />
        ))}
        <path d="M900 150 h 60 l -8 90 h -44 z" />
        <path d="M914 150 c 0 -26, 32 -26, 32 0" />
      </g>
    )}
    {motif === "support" && (
      <g>
        {[0, 1, 2, 3, 4].map((i) => {
          const y = 90 + i * 52;
          const w = 470 - i * 14;
          const x = 250 + i * 7;
          return (
            <g key={i} transform={`rotate(${[-2, 1.5, -1, 2, -0.5][i]} ${x + w / 2} ${y + 24})`}>
              <rect x={x} y={y} width={w} height={48} rx={14} />
              <circle cx={x + 30} cy={y + 24} r={9} />
              <path d={`M${x + 54} ${y + 24} H ${x + 54 + [190, 150, 220, 130, 170][i]}`} />
            </g>
          );
        })}
        <circle cx={830} cy={200} r={70} />
        <path d="M796 202 l 24 24 l 46 -50" />
      </g>
    )}
    {motif === "insights" && (
      <g>
        <path d="M60 370 H 940" />
        {[0, 1, 2, 3, 4].map((i) => {
          const h = [70, 120, 170, 230, 300][i];
          const x = 150 + i * 160;
          return <path key={i} d={`M${x} 370 V ${370 - h + 14} q 0 -14 14 -14 h 62 q 14 0 14 14 V 370`} />;
        })}
        <path d="M150 250 L 340 200 L 500 150 L 660 105 L 840 40" />
        <path d="M806 34 L 842 39 L 830 72" />
      </g>
    )}
  </svg>
);

/** The pillar's icon, drawn large in marker: a rising trend, a headset, a bulb. */
const Glyph = ({ motif }: { motif: Motif }) => (
  <svg className="od-glyph" viewBox="0 0 100 100" aria-hidden="true">
    {motif === "sales" && (
      <g>
        <path d="M10 76 L 38 48 L 56 62 L 90 26" />
        <path d="M68 25 L 91 24 L 90 47" />
        <path d="M10 90 H 92" className="is-thin" />
      </g>
    )}
    {motif === "support" && (
      <g>
        <path d="M18 60 V 50 C 18 26, 34 12, 50 12 C 66 12, 82 26, 82 50 V 60" />
        <rect x="10" y="50" width="16" height="26" rx="7" />
        <rect x="74" y="50" width="16" height="26" rx="7" />
        <path d="M82 76 C 80 88, 68 92, 56 91" />
        <circle cx="51" cy="91" r="4" className="is-dot" />
      </g>
    )}
    {motif === "insights" && (
      <g>
        <path d="M50 18 C 32 18, 22 31, 22 45 C 22 58, 31 63, 35 74 H 65 C 69 63, 78 58, 78 45 C 78 31, 68 18, 50 18 Z" />
        <path d="M39 83 H 61 M 43 92 H 57" />
        <path d="M50 3 V 8 M 14 14 l 4 4 M 86 14 l -4 4 M 3 46 h 6 M 91 46 h 6" className="is-thin" />
      </g>
    )}
  </svg>
);

const OpenerDesign = ({
  v,
  index,
  icon,
  area,
  lines,
  sub,
  lineClassName,
  motif,
  as: Tag = "h2",
}: {
  v: Exclude<Opener, "0">;
  index?: string;
  icon?: ReactNode;
  area?: ReactNode;
  /** The outcome, a sentence a line. */
  lines: string[];
  /** The line under it (Sales: "Shoppers Find it. Trust it. Buy it."). */
  sub?: ReactNode;
  lineClassName?: string;
  motif: Motif;
  as?: "h2" | "p" | "div";
}) => {
  const full = lines.join(" ");
  const subEl = sub ? <span className={cn("pi-line od-sub pi-fade", lineClassName)}>{sub}</span> : null;
  const outcome = (cls?: string) => (
    <Tag className={cn("od-outcome pi-fade pi-key", cls)}>
      {lines.map((l, i) => (
        <span key={i} className="od-l">
          {l}
        </span>
      ))}
    </Tag>
  );

  if (v === "1")
    return (
      <div className="od od1">
        <div className="od1-head pi-fade">
          <Area icon={icon} area={area} />
          <span className="od1-rule" aria-hidden="true" />
          {index && <span className="od1-num">{index}</span>}
        </div>
        {outcome()}
        {subEl}
      </div>
    );

  if (v === "2") {
    // the key word: the second sentence's first word ("Happier", "Fix"), or a one-line outcome's last ("Sales")
    const [l1, l2] = lines;
    const parts =
      lines.length > 1
        ? [l1, l2.split(" ")[0], l2.split(" ").slice(1).join(" ")]
        : [l1.split(" ").slice(0, -1).join(" "), l1.split(" ").slice(-1)[0], ""];
    return (
      <div className="od od2">
        <Area icon={icon} area={area} className="is-pill pi-fade" />
        <Tag className="od-outcome pi-fade pi-key" aria-label={full}>
          {lines.length > 1 && <span className="od-l">{parts[0]}</span>}
          <span className="od-l" aria-hidden="true">
            {lines.length === 1 && `${parts[0]} `}
            <span className="od-key">
              {parts[1]}
              <Loop />
            </span>
            {parts[2] && ` ${parts[2]}`}
          </span>
        </Tag>
        {subEl}
      </div>
    );
  }

  if (v === "3")
    return (
      <div className="od od3">
        <Backdrop motif={motif} />
        <Area icon={icon} area={area} className="pi-fade" />
        {outcome()}
        {subEl}
      </div>
    );

  if (v === "4") {
    const [first, second] =
      lines.length > 1 ? [lines[0], lines.slice(1).join(" ")] : [lines[0].split(" ")[0], lines[0].split(" ").slice(1).join(" ")];
    return (
      <div className="od od4">
        <Area icon={icon} area={area} className="pi-fade" />
        <Tag className="od-outcome pi-fade pi-key" aria-label={full}>
          <span className="od-l" aria-hidden="true">
            {first}
          </span>
          <span className="od-l od-hand" aria-hidden="true">
            {second}
          </span>
        </Tag>
        {subEl}
      </div>
    );
  }

  if (v === "5")
    return (
      <div className="od od5">
        <span className="od5-num pi-fade" aria-hidden="true">
          {index}
        </span>
        <div className="od5-copy">
          <Area icon={icon} area={area} className="pi-fade" />
          {outcome()}
          {subEl}
        </div>
      </div>
    );

  return (
    <div className="od od6">
      <span className="od6-glyph pi-fade">
        <Glyph motif={motif} />
      </span>
      <Area area={area} className="pi-fade" />
      {outcome()}
      {subEl}
    </div>
  );
};

export default OpenerDesign;
