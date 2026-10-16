import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* What every look of a beat's loss → win words builds on (BeatAlt, BeatSwap). */

export const clamp = (v: number) => Math.min(1, Math.max(0, v));
/** The pen's pace (off the mark gently, steady, easing at the end), as the funnel's labels write. */
export const pen = (k: number) => {
  const x = clamp(k);
  return x < 0.15 ? (x / 0.15) ** 2 * 0.1 : 0.1 + 0.9 * (1 - (1 - (x - 0.15) / 0.85) ** 1.6);
};
export const easeOut = (k: number) => 1 - (1 - clamp(k)) ** 3;

/** The bar's part for this beat ("Match needs."), without its full stop: the beat's name. */
export const stageName = (part: string) => part.replace(/[.。!¡]+$/u, "").trim();

/**
 * A loss or a win carries its core between double brackets ("…, then [[buy
 * the same products from a competitor]]."): the words that hurt, or the
 * words that pay. `splitCore` cuts the sentence around it; `plain` drops the
 * marks (for the looks that don't highlight it).
 */
export type Cored = { pre: string; core: string; post: string; text: string };
export const splitCore = (s: string): Cored => {
  const m = s.match(/^([\s\S]*?)\[\[([\s\S]+?)\]\]([\s\S]*)$/);
  return m ? { pre: m[1], core: m[2], post: m[3], text: m[1] + m[2] + m[3] } : { pre: s, core: "", post: "", text: s };
};
export const plain = (s: string) => s.replace(/\[\[|\]\]/g, "");
/** The core said on its own, as a headline ("Buy the same products from a competitor"). */
export const capFirst = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);

/** A text written on letter by letter at `k` (0 → 1); the whole text for screen readers. */
export const Writer = ({ text, k }: { text: string; k: number }) => {
  const shown = k * text.length;
  let pos = 0;
  const words = text.split(" ");
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, wi) => {
          const start = pos;
          pos += w.length + 1;
          return (
            <span key={wi}>
              <span className="bc-word">
                {[...w].map((c, ci) => (
                  <span key={ci} style={{ opacity: clamp(shown - (start + ci)) }}>
                    {c}
                  </span>
                ))}
              </span>
              {wi < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </span>
    </>
  );
};

/** A thin marker strike over every line of `children`, `k` (0 → 1) of the way. */
export const Strike = ({ k, children, className }: { k: number; children: ReactNode; className?: string }) => (
  <span className={cn("bc-strike", className)} style={{ backgroundSize: `${(k * 100).toFixed(1)}% var(--bc-strike-w)` }}>
    {children}
  </span>
);

/** The number pill and the bar's part for the beat ("01 Match needs"). */
export const Kicker = ({
  index,
  name,
  numbered,
  children,
}: {
  index: number;
  name: string;
  numbered: boolean;
  children?: ReactNode;
}) => (
  <span className="sl-copy-kicker bc-kicker">
    {numbered && (
      <span className="sl-copy-kicker-num" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
    )}
    <span className="bc-kicker-name">{name}</span>
    {children}
  </span>
);
