import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useInView } from "../Reveal";
import type { OpenerVariant } from "./StructContext";

/**
 * The redesigned pillar openers (?struct=D..G), rendered by PillarIntro in
 * place of its big name: the OUTCOME is the hero ("Boost Sales", "Fewer
 * tickets. Happier customers."), the AREA a small label ("Customer Support").
 * PillarIntro keeps the scroll behaviour: every .pi-fade piece fades as it
 * nears the nav, .pi-key (the outcome) docks the sticky bar, and in F the
 * .pi-shrink line scales down as it rises into the bar. opener-heroes.css.
 *
 *   D  Written   the outcome written on in marker handwriting, line by line, a marker
 *                stroke under it; the area a tiny pill above
 *   E  Split     the outcome big on the left (area label over it, line under it), the
 *                pillar's marker moment on the right (Sales: its animated icon, large)
 *   F  Typed     one giant line, fitted to the width, typing itself with a caret; as you
 *                scroll it shrinks into the docked bar
 *   G  Canvas    a calm full-bleed canvas: the animated icon large with slow rings, the
 *                tiny area label, the outcome under it
 */
export type OpenerHeroProps = {
  variant: OpenerVariant;
  area?: ReactNode;
  icon?: ReactNode;
  /** The outcome, a sentence a line. */
  outcome: string[];
  /** The supporting line under it (Sales: "Shoppers Find it. Trust it. Buy it."). */
  line?: ReactNode;
  lineClassName?: string;
  /** The pillar's marker moment (E: the right half). */
  moment?: ReactNode;
  as?: "h2" | "p" | "div";
};

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

/** Types `text` once `go`: a character every `ms`. */
const useTyped = (text: string, go: boolean, ms = 62) => {
  const [n, setN] = useState(() => (reducedMotion() ? text.length : 0));
  useEffect(() => {
    if (!go || n >= text.length) return;
    const id = window.setTimeout(() => setN((k) => k + 1), n === 0 ? 260 : ms);
    return () => window.clearTimeout(id);
  }, [go, n, text, ms]);
  return n;
};

const Area = ({ area, icon, className }: { area?: ReactNode; icon?: ReactNode; className?: string }) =>
  area ? (
    <span className={cn("oph-area pi-fade", className)}>
      {icon && (
        <span className="oph-area-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{area}</span>
    </span>
  ) : null;

const Mark = ({ className }: { className?: string }) => (
  <svg className={cn("oph-mark", className)} viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true">
    <path d="M4 12 C 70 4, 160 3, 296 9" pathLength={1} />
  </svg>
);

const OpenerHero = ({ variant, area, icon, outcome, line, lineClassName, moment, as: Tag = "h2" }: OpenerHeroProps) => {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const full = outcome.join(" ");
  const typed = useTyped(full, variant === "F" && inView);
  const sub = line ? <span className={cn("pi-line pi-fade oph-line", lineClassName)}>{line}</span> : null;

  if (variant === "D") {
    // each line written after the one before, at a pen's pace
    let at = 0.25;
    return (
      <div ref={ref} className={cn("oph oph-d", inView && "is-in")}>
        <Area area={area} icon={icon} className="is-pill" />
        <Tag className="oph-outcome pi-fade pi-key">
          {outcome.map((l, i) => {
            const dur = 0.2 + l.length * 0.04;
            const style = { "--w-at": `${at}s`, "--w-dur": `${dur}s` } as CSSProperties;
            at += dur + 0.12;
            return (
              <span key={i} className="oph-w" style={style}>
                {l}
                {i === outcome.length - 1 && <Mark />}
              </span>
            );
          })}
        </Tag>
        {sub && (
          <span className="oph-after" style={{ "--w-at": `${at + 0.2}s` } as CSSProperties}>
            {sub}
          </span>
        )}
      </div>
    );
  }

  if (variant === "E") {
    return (
      <div ref={ref} className={cn("oph oph-e", inView && "is-in")}>
        <div className="oph-e-copy">
          <Area area={area} icon={icon} />
          <Tag className="oph-outcome pi-fade pi-key">
            {outcome.map((l, i) => (
              <span key={i} className="oph-l">
                {l}
                {i === outcome.length - 1 && <Mark />}
              </span>
            ))}
          </Tag>
          {sub}
        </div>
        <div className="oph-e-art pi-fade">
          {moment ?? (
            <span className="oph-e-icon" aria-hidden="true">
              {icon}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (variant === "F") {
    return (
      <div ref={ref} className={cn("oph oph-f", inView && "is-in", typed >= full.length && "is-typed")}>
        <Area area={area} icon={icon} />
        {/* one line, fitted to the width (PillarIntro's --pi-fit measures the ghost) */}
        <Tag className="pi-name oph-outcome pi-key pi-shrink" aria-label={full}>
          <span className="oph-type" aria-hidden="true">
            <span className="oph-ghost">{full}</span>
            <span className="oph-typed">
              {full.slice(0, typed)}
              <span className="oph-caret" />
            </span>
          </span>
        </Tag>
        {sub && <span className="oph-after">{sub}</span>}
      </div>
    );
  }

  // G: the calm canvas
  return (
    <div ref={ref} className={cn("oph oph-g", inView && "is-in")}>
      <span className="oph-g-icon pi-fade" aria-hidden="true">
        <span className="oph-g-ring" />
        <span className="oph-g-ring" />
        <span className="oph-g-ring" />
        <span className="oph-g-disc">{icon}</span>
      </span>
      <Area area={area} />
      <Tag className="oph-outcome pi-fade pi-key">
        {outcome.map((l, i) => (
          <span key={i} className="oph-l">
            {l}
          </span>
        ))}
      </Tag>
      {sub}
    </div>
  );
};

export default OpenerHero;
