const QUOTE_DRIFT_IN_MS = 700;
const QUOTE_IDLE_DRIFT_MS = 8000;

export type CustomerVoiceCardSize = "default" | "small";

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
};

const QUOTE_OVERHANG_TRANSFORM = "translate(45%, -22%)";

const sizeClasses = {
  default: {
    wrapper: "max-w-[14rem]",
    card: "rounded-3xl",
    quoteText: "text-[12px] sm:text-[13px]",
    quoteWidth: "w-[8.5rem] sm:w-[9.75rem]",
    quotePadding: "px-3 py-2",
  },
  small: {
    wrapper: "max-w-[10rem]",
    card: "rounded-2xl",
    quoteText: "text-[11px]",
    quoteWidth: "w-[7rem]",
    quotePadding: "px-2.5 py-1.5",
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
}: CustomerVoiceCardProps) => {
  const s = sizeClasses[size];
  const isQuoteShown = quoteVisible !== undefined ? quoteVisible : isVisible;
  const idleDriftDelayMs = quoteEnterDelayMs + QUOTE_DRIFT_IN_MS;
  return (
    <div
      className={`relative w-full ${s.wrapper} ${className}`}
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

      {/* Floating quote — partly over the card's top-right corner, partly outside */}
      {showOverlay && quote ? (
        <ShopperMessageBubble
          quote={quote}
          quoteText={s.quoteText}
          quoteWidth={s.quoteWidth}
          quotePadding={s.quotePadding}
          shown={isQuoteShown}
          enterDelayMs={quoteEnterDelayMs}
          idleDriftDelayMs={idleDriftDelayMs}
        />
      ) : null}
    </div>
  );
};

interface ShopperMessageBubbleProps {
  quote: string;
  quoteText: string;
  quoteWidth: string;
  quotePadding: string;
  shown: boolean;
  enterDelayMs: number;
  idleDriftDelayMs: number;
}

/* Three nested elements so the static positioning offset and the animated
   transforms (entrance drift-in + continuous idle drift) live on separate
   elements and never clobber each other:

   - Outer: absolute positioning + static overhang offset (stable)
   - Middle: opacity + one-shot entrance drift-in animation
   - Inner: continuous idle drift animation
*/
const ShopperMessageBubble = ({
  quote,
  quoteText,
  quoteWidth,
  quotePadding,
  shown,
  enterDelayMs,
  idleDriftDelayMs,
}: ShopperMessageBubbleProps) => (
  <div
    className={`absolute top-0 right-0 z-10 ${quoteWidth} pointer-events-none`}
    style={{ transform: QUOTE_OVERHANG_TRANSFORM }}
  >
    <div
      style={{
        opacity: shown ? 1 : 0,
        animation: shown
          ? `shopper-message-drift-in ${QUOTE_DRIFT_IN_MS}ms ease-out ${enterDelayMs}ms both`
          : "none",
      }}
    >
      <div
        style={{
          animation: shown
            ? `shopper-message-idle-drift ${QUOTE_IDLE_DRIFT_MS}ms ease-in-out ${idleDriftDelayMs}ms infinite`
            : "none",
        }}
      >
        <ShopperMessageBody
          quote={quote}
          quoteText={quoteText}
          quotePadding={quotePadding}
        />
      </div>
    </div>
  </div>
);

interface ShopperMessageBodyProps {
  quote: string;
  quoteText: string;
  quotePadding: string;
}

const ShopperMessageBody = ({
  quote,
  quoteText,
  quotePadding,
}: ShopperMessageBodyProps) => (
  <div className={`relative ${quotePadding}`}>
    <ShopperMessageStain />
    <p
      className={`relative ${quoteText} font-semibold italic text-foreground/90 font-body leading-snug`}
    >
      {quote}
    </p>
  </div>
);

/* Two stacked layers:
   - Outer: soft primary tint + gaussian blur on its own pixels (outward glow).
   - Inner: frosted glass (`backdrop-filter`) — masked with the same radial as the
     outer so blur strength fades toward the edges just like the color stain.
   Filter blur and backdrop-filter cannot share one element; masks stay aligned
   via the shared `.shopper-message-stain-mask` class in `index.css`. */
const ShopperMessageStain = () => (
  <>
    <span
      aria-hidden
      className="shopper-message-stain-mask absolute -inset-3 rounded-2xl pointer-events-none bg-primary/35 blur-xl"
    />
    <span
      aria-hidden
      className="shopper-message-stain-mask absolute -inset-1 rounded-xl pointer-events-none bg-primary/22 backdrop-blur-xl"
    />
  </>
);

export default CustomerVoiceCard;
