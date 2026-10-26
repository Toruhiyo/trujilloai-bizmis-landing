import type { CSSProperties } from "react";
import { useSalesCopy, useSalesProto } from "./proto";
import BeatAlt from "./beatcopy/BeatAlt";
import BeatSwap from "./beatcopy/BeatSwap";
import BeatHL, { BeatOpening } from "./beatcopy/BeatHL";
import { plain } from "./beatcopy/parts";
import { HLS, HL_FROM, SWAPS, SWAP_FROM, useBeatStyle } from "./beatcopy/style";
import { OPENER, arrLook, endsLook } from "./beatcopy/style";
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
 * The words rewind with the clock as they are, no tape look of their own
 * (the analog rewind look, beatcopy/RewindTape, belongs to the devices).
 */
const BeatCopy = ({ t, className, style, ...rest }: Props) => (
  <div className={className} style={style}>
    <BeatWords t={t} {...rest} />
  </div>
);

type Props = {
  index: number;
  t: number;
  fixAt: number;
  className?: string;
  style?: CSSProperties;
  /** The number pill before the stage (off where the layout numbers the parts itself). */
  numbered?: boolean;
};

/** The words themselves, in the look the URL picks (placement goes on the box around them). */
const BeatWords = ({
  index,
  t,
  fixAt,
  numbered = true,
}: Omit<Props, "className" | "style">) => {
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
      />
    );
  // ?beat=7: the words over the funnel, as its stage's label (6c's look; the funnel has no labels of its own)
  // ?beat=9: the opener alone; the sentence ends in the funnel's label
  if (look === OPENER) return <BeatOpening index={index} numbered={numbered} />;
  if (endsLook(look) || arrLook(look)) return <BeatHL look="c" index={index} t={t} fixAt={fixAt} numbered={numbered} delay={0} />;
  // ?beat=6a..6e: the polished highlighters, the shared opening never moving (beatcopy/BeatHL)
  if (look >= HL_FROM)
    return <BeatHL look={HLS[look - HL_FROM]} index={index} t={t} fixAt={fixAt} numbered={numbered} />;
  // ?beat=5a..5e: the headline swaps, each loss's and win's core highlighted (beatcopy/BeatSwap)
  if (look >= SWAP_FROM)
    return (
      <BeatSwap look={SWAPS[look - SWAP_FROM]} index={index} t={t} fixAt={fixAt} numbered={numbered} />
    );
  // ?beat=1..6: an alternative look for the same loss → win (beatcopy/BeatAlt)
  if (look > 0)
    return (
      <BeatAlt variant={look} index={index} t={t} fixAt={fixAt} numbered={numbered} />
    );
  // the core marks ([[…]]) are for the headline swaps: plain here
  const problem = plain(s.flip[index].problem);
  const fix = plain(s.flip[index].fix);
  const since = t - fixAt;
  const strike = pen((since - 140) / 300);
  const write = pen((since - 560) / (240 + fix.length * 22));
  return (
    <div className="sl-copy sl-flip" data-since={Math.round(since)}>
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
