export type CustomerVoiceCardSize = "default" | "small";

export type CustomerVoiceCardProps = {
  imageUrl: string;
  quote?: string;
  size?: CustomerVoiceCardSize;
  showOverlay?: boolean;
  isVisible?: boolean;
  transitionDelayMs?: number;
  transitionDurationMs?: number;
  className?: string;
};

const sizeClasses = {
  default: {
    wrapper: "max-w-[14rem]",
    card: "rounded-3xl",
    padding: "p-6",
    quote: "text-base",
  },
  small: {
    wrapper: "max-w-[10rem]",
    card: "rounded-2xl",
    padding: "p-4",
    quote: "text-sm",
  },
};

const CustomerVoiceCard = ({
  imageUrl,
  quote,
  size = "default",
  showOverlay = true,
  isVisible = true,
  transitionDelayMs = 0,
  transitionDurationMs = 1400,
  className = "",
}: CustomerVoiceCardProps) => {
  const s = sizeClasses[size];
  return (
    <div
      className={`w-full ${s.wrapper} transition-all ease-out ${className}`}
      style={{
        transitionDelay: `${transitionDelayMs}ms`,
        transitionDuration: `${transitionDurationMs}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(1.5rem)",
      }}
    >
      <div
        className={`relative overflow-hidden ${s.card} border border-primary/15 shadow-lg w-full aspect-[3/4] mx-auto bg-cover bg-center bg-no-repeat`}
        style={{ backgroundImage: `url('${imageUrl}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-primary/20 to-transparent" />

        {showOverlay ? (
          <div
            className={`relative z-10 ${s.padding} flex flex-col justify-end h-full`}
          >
            {quote ? (
              <p
                className={`${s.quote} font-semibold text-white/90 italic font-body drop-shadow-sm`}
              >
                {quote}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CustomerVoiceCard;
