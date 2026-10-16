import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useSalesCopy, useSalesProto } from "./proto";
import BeatAlt from "./beatcopy/BeatAlt";
import { useBeatStyle } from "./beatcopy/style";
import { PanelCopy } from "./shared";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
/** The pen's pace, as the funnel's labels write (off the mark gently, steady, easing at the end). */
const pen = (k: number) => {
  const x = clamp(k);
  return x < 0.15 ? (x / 0.15) ** 2 * 0.1 : 0.1 + 0.9 * (1 - (1 - (x - 0.15) / 0.85) ** 1.6);
};

/**
 * A beat's words. Today's: its stage, short benefit title and one line
 * (PanelCopy). With ?copy=flip: the problem, said plainly, then at the fix
 * (on the beat's clock, `t` against `fixAt`, as the funnel's label does) a
 * marker stroke strikes it through and the fix is written in under it.
 */
const BeatCopy = ({
  index,
  t,
  fixAt,
  className,
  style,
  numbered = true,
}: {
  index: number;
  t: number;
  fixAt: number;
  className?: string;
  style?: CSSProperties;
  /** The number pill before the stage (off where the layout numbers the parts itself). */
  numbered?: boolean;
}) => {
  const s = useSalesCopy();
  const { flip } = useSalesProto();
  const look = useBeatStyle();
  if (!flip)
    return (
      <PanelCopy
        index={numbered ? index : undefined}
        kicker={s.stages[index]}
        title={s.panels[index].title}
        body={s.panels[index].body}
        className={className}
        style={style}
      />
    );
  // ?beat=1..6: an alternative look for the same loss → win (beatcopy/BeatAlt)
  if (look > 0)
    return (
      <BeatAlt variant={look} index={index} t={t} fixAt={fixAt} numbered={numbered} className={className} style={style} />
    );
  const { problem, fix } = s.flip[index];
  const since = t - fixAt;
  const strike = pen((since - 140) / 300);
  const write = pen((since - 560) / (240 + fix.length * 22));
  return (
    <div className={cn("sl-copy sl-flip", className)} style={style} data-since={Math.round(since)}>
      <span className="sl-copy-kicker">
        {numbered && (
          <span className="sl-copy-kicker-num" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        {s.stages[index]}
      </span>
      <h3 className="sl-copy-title sl-flip-problem" style={{ opacity: 1 - 0.45 * strike }}>
        {/* the strike: a marker band swept across every line of it (one per line, box-decoration-break) */}
        <span className="sl-flip-text" style={{ backgroundSize: `${(strike * 100).toFixed(1)}% 0.1em` }}>
          {problem}
        </span>
      </h3>
      <p
        className="sl-flip-fix"
        style={{ clipPath: write >= 1 ? undefined : `inset(-20% ${((1 - write) * 100).toFixed(2)}% -20% -4%)` }}
      >
        {fix}
      </p>
    </div>
  );
};

export default BeatCopy;
