import { type CSSProperties } from "react";
import {
  ShopperShortCaption,
  type CustomerVoiceCardSize,
  type ShopperCaptionTone,
} from "./CustomerVoiceCard";

/**
 * Floating karaoke caption shell. Wraps `ShopperShortCaption` in an absolutely
 * positioned shell that overhangs an anchor element (avatar card, clerk image),
 * with a delayed opacity + optional translateY reveal.
 *
 * Used for:
 *  - Benefit 1 shopper (overhangs the customer photo card top-right corner)
 *  - Benefit 2 shopper (same shopper card, smaller size)
 *  - Benefit 2 Bizmis clerk (overhangs the clerk image's left side)
 */
export type FloatingCaptionProps = {
  /** Outer-wrapper Tailwind classes for absolute positioning, z-index, max-widths, etc. */
  wrapperClassName?: string;
  /** Inline overrides (e.g. `top: "56%"`, `transform: "translate(...)"`). */
  wrapperStyle?: CSSProperties;
  /** Padding around the inline karaoke caption box (e.g. shopper bubble vs clerk overlay). */
  paddingClassName?: string;

  shown: boolean;
  /** Reveal delay (ms) before opacity/translateY start animating. */
  enterDelayMs?: number;
  /** Reveal duration (ms) for opacity/translateY. */
  enterDurationMs?: number;
  /**
   * Optional pre-reveal vertical offset in rem. When `shown` flips true, the
   * caption eases from `translateY(<rem>)` back to `translateY(0)` together
   * with the opacity transition.
   */
  translateYOffsetRem?: number;

  // Forwarded directly to `ShopperShortCaption`:
  quote: string;
  wordBaseDelayMs: number;
  size?: CustomerVoiceCardSize;
  textClassName?: string;
  /** Caption layout classes (e.g. "justify-end text-right"). */
  captionClassName?: string;
  tone?: ShopperCaptionTone;
  onCaptionPlaybackConsumed?: () => void;
};

const DEFAULT_ENTER_DURATION_MS = 700;

const FloatingCaption = ({
  wrapperClassName = "",
  wrapperStyle,
  paddingClassName = "",
  shown,
  enterDelayMs = 0,
  enterDurationMs = DEFAULT_ENTER_DURATION_MS,
  translateYOffsetRem = 0,
  quote,
  wordBaseDelayMs,
  size,
  textClassName,
  captionClassName,
  tone,
  onCaptionPlaybackConsumed,
}: FloatingCaptionProps) => {
  const hasYMotion = translateYOffsetRem !== 0;
  const hiddenTransform = hasYMotion
    ? `translateY(${translateYOffsetRem}rem)`
    : undefined;
  const transitionList = hasYMotion
    ? `opacity ${enterDurationMs}ms ease-out, transform ${enterDurationMs}ms ease-out`
    : `opacity ${enterDurationMs}ms ease-out`;

  return (
    <div
      className={`overflow-visible ${wrapperClassName}`}
      style={wrapperStyle}
    >
      <div
        className="overflow-visible"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? "translateY(0)" : hiddenTransform,
          transition: transitionList,
          transitionDelay: shown ? `${enterDelayMs}ms` : "0ms",
        }}
      >
        <div className={`relative overflow-visible ${paddingClassName}`}>
          <ShopperShortCaption
            quote={quote}
            shown={shown}
            wordBaseDelayMs={wordBaseDelayMs}
            size={size}
            textClassName={textClassName}
            className={captionClassName}
            tone={tone}
            onCaptionPlaybackConsumed={onCaptionPlaybackConsumed}
          />
        </div>
      </div>
    </div>
  );
};

export default FloatingCaption;
