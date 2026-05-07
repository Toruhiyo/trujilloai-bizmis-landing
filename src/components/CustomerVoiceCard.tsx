import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

export const SHOPPER_MESSAGE_DRIFT_IN_MS = 700;
const QUOTE_DRIFT_IN_MS = SHOPPER_MESSAGE_DRIFT_IN_MS;

/** Words begin revealing partway through the bubble fade-in. */
export const SHOPPER_CAPTION_WORD_INTRA_DRIFT_OFFSET_MS = Math.round(
  SHOPPER_MESSAGE_DRIFT_IN_MS * 0.35,
);

const CAPTION_WORD_DWELL_MS_DEFAULT = 340;
const CAPTION_WORD_DWELL_MS_SMALL = 300;
/** Uniform bleed around measured caption bounds for primary stain layers. */
const CAPTION_STAIN_MARGIN_PX_DEFAULT = 14;
const CAPTION_STAIN_MARGIN_PX_SMALL = 11;

export type CustomerVoiceCardSize = "default" | "small";

/**
 * Karaoke caption color tone:
 * - "shopper": white words on primary stain (active word: white chip + primary text).
 * - "clerk":   primary words on white stain (active word: primary chip + white text).
 */
export type ShopperCaptionTone = "shopper" | "clerk";

export type CustomerVoiceCardProps = {
  imageUrl: string;
  quote?: string;
  size?: CustomerVoiceCardSize;
  showOverlay?: boolean;
  isVisible?: boolean;
  /**
   * Independent visibility for the quote text. Defaults to `isVisible` so the
   * quote enters together with the card. Set explicitly to drive the quote's
   * entrance separately from the card's slide-in.
   */
  quoteVisible?: boolean;
  /** Delay (ms) before the quote drift-in animation runs once `quoteVisible` is true. */
  quoteEnterDelayMs?: number;
  transitionDelayMs?: number;
  transitionDurationMs?: number;
  className?: string;
  /** Called once when the shopper caption karaoke pass completes (`consumed`). */
  onCaptionPlaybackConsumed?: () => void;
};

export type ShopperShortCaptionProps = {
  quote: string;
  shown: boolean;
  /** Delay before the first word animates in (ms). */
  wordBaseDelayMs: number;
  size?: CustomerVoiceCardSize;
  textClassName?: string;
  className?: string;
  tone?: ShopperCaptionTone;
  /** Called once when the first karaoke pass finishes (`consumed`). */
  onCaptionPlaybackConsumed?: () => void;
};

const QUOTE_OVERHANG_TRANSFORM = "translate(58%, -22%)";

function parseCaptionWords(raw: string): string[] {
  const trimmed = raw
    .trim()
    .replace(/^["'\u201c\u2018]+|["'\u201d\u2019]+$/gu, "");
  if (!trimmed) return [];
  return trimmed.split(/\s+/).filter(Boolean);
}

type HighlightRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * Short-form captions: stroked white words; active word uses white chip + primary text.
 */
export function ShopperShortCaption({
  quote,
  shown,
  wordBaseDelayMs,
  size = "default",
  textClassName,
  className = "",
  tone = "shopper",
  onCaptionPlaybackConsumed,
}: ShopperShortCaptionProps) {
  const stainHaloClass =
    tone === "clerk" ? "clerk-caption-stain-halo" : "shopper-caption-stain-halo";
  const stainCoreClass =
    tone === "clerk" ? "clerk-caption-stain-core" : "shopper-caption-stain-core";
  const tokenClass =
    tone === "clerk" ? "clerk-caption-token" : "shopper-caption-token";
  /*
   * Active word "chip" pops visually via transform: scale (paint-only) so it
   * never reflows neighboring words. The negative margin cancels the chip
   * padding so its layout box is identical to an inactive word's box; the
   * scale only affects rendering.
   */
  const activeWordChipClass =
    tone === "clerk"
      ? "relative z-[3] -m-1.5 inline-block rounded-[7px] bg-primary p-1.5 align-baseline font-extrabold uppercase tracking-[0.03em] leading-none text-white origin-center scale-[1.12] transition duration-150"
      : "relative z-[3] -m-1.5 inline-block rounded-[7px] bg-white p-1.5 align-baseline font-extrabold uppercase tracking-[0.03em] leading-none text-primary origin-center scale-[1.12] transition duration-150";
  const words = parseCaptionWords(quote);
  const dwellMs =
    size === "small"
      ? CAPTION_WORD_DWELL_MS_SMALL
      : CAPTION_WORD_DWELL_MS_DEFAULT;

  const onConsumedRef = useRef(onCaptionPlaybackConsumed);
  onConsumedRef.current = onCaptionPlaybackConsumed;

  const containerRef = useRef<HTMLParagraphElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  /** First karaoke pass finished; highlight stays off until quote/`shown` resets. */
  const [captionConsumed, setCaptionConsumed] = useState(false);
  const [stainRect, setStainRect] = useState<HighlightRect | null>(null);
  const [layoutNonce, setLayoutNonce] = useState(0);

  const stainMarginPx =
    size === "small"
      ? CAPTION_STAIN_MARGIN_PX_SMALL
      : CAPTION_STAIN_MARGIN_PX_DEFAULT;

  const baseSize =
    textClassName ??
    (size === "small"
      ? "text-[12px] xs:text-[13px] leading-none"
      : "text-[13px] sm:text-[14px] md:text-[15px] leading-none");

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() =>
      setLayoutNonce((value) => value + 1),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [quote]);

  useLayoutEffect(() => {
    const wrap = wrapperRef.current;
    const paragraph = containerRef.current;
    if (!wrap || !paragraph || !shown || words.length === 0) {
      setStainRect(null);
      return;
    }
    const wrapBox = wrap.getBoundingClientRect();
    const captionBox = paragraph.getBoundingClientRect();
    const margin = stainMarginPx;
    setStainRect({
      left: captionBox.left - wrapBox.left - margin,
      top: captionBox.top - wrapBox.top - margin,
      width: captionBox.width + margin * 2,
      height: captionBox.height + margin * 2,
    });
  }, [layoutNonce, shown, quote, words.length, stainMarginPx]);

  useEffect(() => {
    if (!shown) {
      setActiveWordIndex(-1);
      setCaptionConsumed(false);
      return undefined;
    }
    if (words.length === 0) {
      setActiveWordIndex(-1);
      setCaptionConsumed(false);
      queueMicrotask(() => onConsumedRef.current?.());
      return undefined;
    }

    setCaptionConsumed(false);

    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    let cancelled = false;

    const scheduleWord = (index: number) => {
      if (cancelled) return;
      if (index >= words.length) {
        setActiveWordIndex(-1);
        setCaptionConsumed(true);
        onConsumedRef.current?.();
        return;
      }
      setActiveWordIndex(index);
      timeoutIds.push(
        window.setTimeout(() => scheduleWord(index + 1), dwellMs),
      );
    };

    timeoutIds.push(
      window.setTimeout(() => scheduleWord(0), wordBaseDelayMs),
    );

    return () => {
      cancelled = true;
      timeoutIds.forEach((id) => window.clearTimeout(id));
    };
  }, [shown, words.length, wordBaseDelayMs, quote, dwellMs]);

  const stainVisible = Boolean(stainRect && shown && stainRect.width > 0);

  const stainPositionStyle: CSSProperties = stainRect
    ? {
        left: stainRect.left,
        top: stainRect.top,
        width: stainRect.width,
        height: stainRect.height,
      }
    : {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        visibility: "hidden",
      };

  return (
    <div
      ref={wrapperRef}
      className="relative inline-block max-w-full overflow-visible align-top"
    >
      <span
        aria-hidden
        className={stainHaloClass}
        style={{
          ...stainPositionStyle,
          opacity: stainVisible ? 1 : 0,
        }}
      />
      <span
        aria-hidden
        className={stainCoreClass}
        style={{
          ...stainPositionStyle,
          opacity: stainVisible ? 1 : 0,
        }}
      />
      <p
        ref={containerRef}
        data-caption-state={
          !shown || words.length === 0
            ? "idle"
            : captionConsumed
              ? "consumed"
              : "playing"
        }
        className={`relative z-[1] m-0 flex flex-wrap items-baseline gap-x-1 gap-y-1 font-body ${baseSize} ${className}`}
        aria-label={words.join(" ")}
      >
        {words.map((word, index) => {
          const isActive =
            shown &&
            !captionConsumed &&
            activeWordIndex >= 0 &&
            activeWordIndex === index;
          return (
            <span
              key={`${index}-${word}`}
              ref={(node) => {
                wordRefs.current[index] = node;
              }}
              className={
                isActive
                  ? activeWordChipClass
                  : `${tokenClass} relative z-[2] inline-block align-baseline leading-none transition-colors duration-150`
              }
              style={{
                opacity: shown ? 1 : 0,
                visibility: shown ? "visible" : "hidden",
              }}
            >
              {word}
            </span>
          );
        })}
    </p>
    </div>
  );
}

const sizeClasses = {
  default: {
    wrapper: "max-w-[14rem]",
    card: "rounded-3xl",
    quoteWidth:
      "max-w-[13rem] xs:max-w-[14.5rem] sm:max-w-[17rem] min-w-0 w-max",
    quotePadding: "px-2 py-1.5 sm:px-2.5 sm:py-2",
  },
  small: {
    wrapper: "max-w-[10rem]",
    card: "rounded-2xl",
    quoteWidth:
      "max-w-[11.5rem] xs:max-w-[13.5rem] sm:max-w-[15rem] min-w-0 w-max",
    quotePadding: "px-1.5 py-1",
  },
};

const CustomerVoiceCard = ({
  imageUrl,
  quote,
  size = "default",
  showOverlay = true,
  isVisible = true,
  quoteVisible,
  quoteEnterDelayMs = 0,
  transitionDelayMs = 0,
  transitionDurationMs = 1400,
  className = "",
  onCaptionPlaybackConsumed,
}: CustomerVoiceCardProps) => {
  const s = sizeClasses[size];
  const isQuoteShown = quoteVisible !== undefined ? quoteVisible : isVisible;
  return (
    <div
      className={`relative w-full overflow-visible ${s.wrapper} ${className}`}
      style={{
        transition: `opacity ${transitionDurationMs}ms ease, transform ${transitionDurationMs}ms ease`,
        transitionDelay: `${transitionDelayMs}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(1.5rem)",
      }}
    >
      {/* Photo card */}
      <div
        className={`relative overflow-hidden ${s.card} border border-primary/15 shadow-lg w-full aspect-[3/4] mx-auto bg-cover bg-center bg-no-repeat`}
        style={{ backgroundImage: `url('${imageUrl}')` }}
      >
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary/30 to-transparent" />
      </div>

      {/* Floating short-caption — partly over the card's top-right corner, partly outside */}
      {showOverlay && quote ? (
        <ShopperMessageBubble
          quote={quote}
          quoteWidth={s.quoteWidth}
          quotePadding={s.quotePadding}
          size={size}
          shown={isQuoteShown}
          enterDelayMs={quoteEnterDelayMs}
          onCaptionPlaybackConsumed={onCaptionPlaybackConsumed}
        />
      ) : null}
    </div>
  );
};

interface ShopperMessageBubbleProps {
  quote: string;
  quoteWidth: string;
  quotePadding: string;
  size: CustomerVoiceCardSize;
  shown: boolean;
  enterDelayMs: number;
  onCaptionPlaybackConsumed?: () => void;
}

/* Outer: absolute positioning + static overhang offset. Inner: fade-in only (no drift). */
const ShopperMessageBubble = ({
  quote,
  quoteWidth,
  quotePadding,
  size,
  shown,
  enterDelayMs,
  onCaptionPlaybackConsumed,
}: ShopperMessageBubbleProps) => (
  <div
    className={`absolute top-0 right-0 z-10 overflow-visible ${quoteWidth} pointer-events-none`}
    style={{ transform: QUOTE_OVERHANG_TRANSFORM }}
  >
    <div
      className="overflow-visible"
      style={{
        opacity: shown ? 1 : 0,
        transition: `opacity ${QUOTE_DRIFT_IN_MS}ms ease-out`,
        transitionDelay: shown ? `${enterDelayMs}ms` : "0ms",
      }}
    >
      <div className={`relative overflow-visible ${quotePadding}`}>
        <ShopperShortCaption
          quote={quote}
          shown={shown}
          wordBaseDelayMs={
            enterDelayMs + SHOPPER_CAPTION_WORD_INTRA_DRIFT_OFFSET_MS
          }
          size={size}
          onCaptionPlaybackConsumed={onCaptionPlaybackConsumed}
        />
      </div>
    </div>
  </div>
);

export default CustomerVoiceCard;
