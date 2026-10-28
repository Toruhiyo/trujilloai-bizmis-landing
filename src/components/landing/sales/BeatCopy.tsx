import type { CSSProperties } from "react";
import { useSalesCopy } from "./salesCopy";
import "@/styles/beat-copy.css";

/** The bar's part for this beat ("Match needs."), without its full stop: the beat's name. */
const stageName = (part: string) => part.replace(/[.。!¡]+$/u, "").trim();

/** The opener as its own line, ending in an ellipsis: "Buyers with a full cart…" (drawn, never in the copy). */
const opening = (pre: string) => `${pre.replace(/[\s,;:]+$/u, "")}…`;

/**
 * A beat's words: the number pill and the beat's name ("01 Match needs"),
 * then the opener alone ("Buyers with a full cart…"), set once; the
 * sentence ends in the funnel's own label for the stage ("Abandon the
 * cart", struck, then "Buy it ✓"), where and as it already is.
 */
const BeatCopy = ({ index, className, style }: { index: number; className?: string; style?: CSSProperties }) => {
  const s = useSalesCopy();
  return (
    <div className={className} style={style}>
      <div className="sl-copy bc bch bch-opener">
        <span className="sl-copy-kicker bc-kicker">
          <span className="sl-copy-kicker-num" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="bc-kicker-name">{stageName(s.titleParts[index])}</span>
        </span>
        <h3 className="bch-head">
          <span className="bch-pre">{opening(s.openers[index])}</span>
        </h3>
      </div>
    </div>
  );
};

export default BeatCopy;
