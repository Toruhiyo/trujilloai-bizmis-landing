import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSalesCopy } from "../proto";
import "@/styles/beat-copy.css";

/*
 * The alternative looks for a beat's loss → win words (?beat=1..6). Every
 * one runs off the beat's clock: `since` is ms since the stage's fix (`t`
 * against `fixAt`), so the strike and the win land as the funnel's label
 * flips, scroll back and they rewind. Reduced motion: the clock sits on the
 * end, so it's the final state.
 */

const clamp = (v: number) => Math.min(1, Math.max(0, v));
/** The pen's pace (off the mark gently, steady, easing at the end), as the funnel's labels write. */
const pen = (k: number) => {
  const x = clamp(k);
  return x < 0.15 ? (x / 0.15) ** 2 * 0.1 : 0.1 + 0.9 * (1 - (1 - (x - 0.15) / 0.85) ** 1.6);
};
const easeOut = (k: number) => 1 - (1 - clamp(k)) ** 3;

/** The moments after the fix, shared by every look (ms since the fix). */
const at = (since: number, len: number) => ({
  /** the loss struck through */
  strike: pen((since - 140) / 300),
  /** the win coming in (a slide or a lift) */
  enter: easeOut((since - 520) / 520),
  /** the win written or typed on, letter by letter */
  write: pen((since - 560) / (260 + Math.min(len * 16, 1250))),
  /** the marker arrow / X drawn */
  draw: pen((since - 380) / 340),
});

/** The bar's part for this beat ("Match needs."), without its full stop: the beat's name. */
const stageName = (part: string) => part.replace(/[.。!¡]+$/u, "").trim();

/** A text written on letter by letter at `k` (0 → 1); the whole text for screen readers. */
const Writer = ({ text, k }: { text: string; k: number }) => {
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
const Strike = ({ k, children, className }: { k: number; children: ReactNode; className?: string }) => (
  <span className={cn("bc-strike", className)} style={{ backgroundSize: `${(k * 100).toFixed(1)}% var(--bc-strike-w)` }}>
    {children}
  </span>
);

/** The number pill and the bar's part for the beat ("01 Match needs"). */
const Kicker = ({ index, name, numbered, children }: { index: number; name: string; numbered: boolean; children?: ReactNode }) => (
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

/**
 * Which side of the copy its device is on (the pinned stage places both with
 * inline `left`, so it's read without a layout), or "below" (stacked: the
 * funnel and device follow the words). Re-read every render: the stage lays
 * its callouts out once it knows its size.
 */
const useDeviceSide = (index: number) => {
  const ref = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState<"left" | "right" | "below">("below");
  useLayoutEffect(() => {
    const slot = ref.current?.closest<HTMLElement>(".sl-g2-copy");
    const dev = slot?.parentElement?.querySelectorAll<HTMLElement>(".sl-g2-callout")[index];
    const next = !slot || !dev ? "below" : parseFloat(dev.style.left) < parseFloat(slot.style.left) ? "left" : "right";
    if (next !== side) setSide(next);
  });
  return [ref, side] as const;
};

type Props = {
  variant: number;
  index: number;
  t: number;
  fixAt: number;
  numbered: boolean;
  className?: string;
  style?: CSSProperties;
};

const BeatAlt = ({ variant, index, t, fixAt, numbered, className, style }: Props) => {
  const s = useSalesCopy();
  const [ref, side] = useDeviceSide(index);
  const { problem, fix } = s.flip[index];
  const L = s.flipLabels;
  const name = stageName(s.titleParts[index]);
  const since = t - fixAt;
  const m = at(since, fix.length);
  const fixed = since >= 440;
  const root = (body: ReactNode, extra?: string) => (
    <div
      ref={ref}
      className={cn("sl-copy bc", `bc-v${variant}`, `is-dev-${side}`, extra, className)}
      style={style}
      data-since={Math.round(since)}
    >
      {body}
    </div>
  );

  // 1 · Ledger: a small "You lose" row, a thin strike, then "You win" big and bold sliding in
  if (variant === 1)
    return root(
      <>
        <Kicker index={index} name={name} numbered={numbered} />
        <div className="bc1-rows">
          <div className="bc1-row is-loss" style={{ opacity: 1 - 0.4 * m.strike }}>
            <span className="bc-label">{L.lose}</span>
            <p className="bc1-loss">
              <Strike k={m.strike}>{problem}</Strike>
            </p>
          </div>
          <div
            className="bc1-row is-win"
            style={{ opacity: m.enter, transform: `translateY(${((1 - m.enter) * 18).toFixed(1)}px)` }}
          >
            <span className="bc-label">{L.win}</span>
            <p className="bc1-win">{fix}</p>
          </div>
        </div>
      </>,
    );

  // 2 · Before / after cards: the loss card dims under a marker X, the win card lifts in front
  if (variant === 2) {
    const x1 = clamp(m.draw * 2);
    const x2 = clamp(m.draw * 2 - 1);
    return root(
      <>
        <Kicker index={index} name={name} numbered={numbered} />
        <div className="bc2-stack">
          <div
            className="bc2-card is-loss"
            style={{
              opacity: 1 - 0.38 * m.strike,
              transform: `scale(${(1 - 0.04 * m.enter).toFixed(3)})`,
            }}
          >
            <span className="bc-label">{L.lose}</span>
            <p className="bc2-loss">{problem}</p>
            <svg className="bc2-x" viewBox="0 0 40 40" aria-hidden="true">
              <path d="M7 6 C 15 15, 24 25, 34 35" pathLength={1} style={{ strokeDashoffset: 1 - x1 }} />
              <path d="M33 5 C 25 14, 15 25, 6 35" pathLength={1} style={{ strokeDashoffset: 1 - x2 }} />
            </svg>
          </div>
          <div
            className="bc2-card is-win"
            style={{
              opacity: m.enter,
              transform: `translateY(${((1 - m.enter) * 28).toFixed(1)}px) scale(${(0.96 + 0.04 * m.enter).toFixed(3)})`,
            }}
          >
            <span className="bc2-win-head">
              <span className="bc-check" aria-hidden="true">
                <Check strokeWidth={3.2} />
              </span>
              <span className="bc-label">{L.win}</span>
            </span>
            <p className="bc2-win">{fix}</p>
          </div>
        </div>
      </>,
    );
  }

  // 3 · Marker annotation: the loss small, a marker arrow, the win BIG in handwriting
  if (variant === 3)
    return root(
      <>
        <Kicker index={index} name={name} numbered={numbered} />
        <p className="bc3-loss" style={{ opacity: 1 - 0.35 * m.strike }}>
          <Strike k={m.strike}>{problem}</Strike>
        </p>
        <div className="bc3-row">
          <svg className="bc3-arrow" viewBox="0 0 44 64" aria-hidden="true">
            <path d="M8 3 C 3 26, 9 46, 36 52" pathLength={1} style={{ strokeDashoffset: 1 - clamp(m.draw * 1.35) }} />
            <path d="M27 42 L 38 52 L 25 59" pathLength={1} style={{ strokeDashoffset: 1 - clamp(m.draw * 3.2 - 2.2) }} />
          </svg>
          <p className="bc3-win">
            <Writer text={fix} k={m.write} />
          </p>
        </div>
      </>,
    );

  // 4 · Speech bubble: your pain, in your words, answered by the win as a bold statement
  if (variant === 4)
    return root(
      <>
        <Kicker index={index} name={name} numbered={numbered} />
        <figure className="bc4-bubble" style={{ opacity: 1 - 0.3 * m.strike }}>
          <figcaption className="bc-label">{L.you}</figcaption>
          <blockquote className="bc4-quote">
            <Strike k={m.strike}>{s.flipQuote[index]}</Strike>
          </blockquote>
        </figure>
        <div
          className="bc4-answer"
          style={{ opacity: m.enter, transform: `translateY(${((1 - m.enter) * 16).toFixed(1)}px)` }}
        >
          <span className="bc4-answer-head">
            <span className="bc-check" aria-hidden="true">
              <Check strokeWidth={3.2} />
            </span>
            <span className="bc-label">{L.withBizmis}</span>
          </span>
          <p className="bc4-win">{fix}</p>
        </div>
      </>,
    );

  // 5 · Headline swap: one slot; the loss struck, it lifts away, the win types into its place
  if (variant === 5) {
    const out = easeOut((since - 520) / 380);
    const type = pen((since - 760) / (220 + Math.min(fix.length * 14, 1100)));
    return root(
      <>
        <Kicker index={index} name={name} numbered={numbered}>
          <span className={cn("bc5-chip", fixed && "is-fixed")}>
            {fixed && <Check strokeWidth={3.2} aria-hidden="true" />}
            {fixed ? s.funnel.solutions[index] : s.funnel.problems[index]}
          </span>
        </Kicker>
        <div className="bc5-slot">
          <h3
            className="bc5-line is-loss"
            aria-hidden={out >= 1}
            style={{ opacity: 1 - out, transform: `translateY(${(-out * 16).toFixed(1)}px)` }}
          >
            <Strike k={m.strike} className="is-thick">
              {problem}
            </Strike>
          </h3>
          <h3 className="bc5-line is-win">
            <Writer text={fix} k={type} />
          </h3>
        </div>
      </>,
    );
  }

  // 6 · Stage card: a white card tethered to its device; the funnel's own status chip,
  // the loss struck in primary, the win big in ink with a marker swiped behind it
  const swipe = pen((since - 900) / 700);
  return root(
    <div className="bc6-card">
      <span className="bc6-notch" aria-hidden="true" />
      <div className="bc6-head">
        {numbered && <span className="bc6-num">{String(index + 1).padStart(2, "0")}</span>}
        <span className="bc6-name">{name}</span>
        <span className={cn("bc6-chip", fixed && "is-fixed")}>
          {fixed && <Check strokeWidth={3.2} aria-hidden="true" />}
          {fixed ? s.funnel.solutions[index] : s.funnel.problems[index]}
        </span>
      </div>
      <p className="bc6-loss" style={{ opacity: 1 - 0.42 * m.strike }}>
        <Strike k={m.strike}>{problem}</Strike>
      </p>
      <div className="bc6-grow" style={{ gridTemplateRows: `${m.enter.toFixed(3)}fr` }}>
        <div className="bc6-grow-in">
          <p className="bc6-win" style={{ opacity: m.enter }}>
            <span className="bc6-mark" style={{ backgroundSize: `${(swipe * 100).toFixed(1)}% 0.42em` }}>
              {fix}
            </span>
          </p>
        </div>
      </div>
    </div>,
    "is-card",
  );
};

export default BeatAlt;
