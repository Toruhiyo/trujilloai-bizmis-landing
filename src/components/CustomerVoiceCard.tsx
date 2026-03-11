import { FaMicrophone } from "react-icons/fa";

const WAVEFORM_BARS = 24;
const WAVEFORM_HEIGHTS = [
  28, 42, 55, 38, 62, 48, 70, 30, 58, 45, 65, 35,
  50, 68, 40, 55, 32, 60, 44, 72, 36, 52, 46, 64,
];

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
    mic: "w-9 h-9",
    micIcon: "w-3.5 h-3.5",
    gap: "gap-3 mb-4",
    waveform: "h-8",
    quote: "text-base",
  },
  small: {
    wrapper: "max-w-[10rem]",
    card: "rounded-2xl",
    padding: "p-4",
    mic: "w-7 h-7",
    micIcon: "w-3 h-3",
    gap: "gap-2 mb-3",
    waveform: "h-6",
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
        className={`relative overflow-hidden ${s.card} border border-[#FD912A]/15 shadow-lg w-full aspect-[3/4] mx-auto bg-cover bg-center bg-no-repeat`}
        style={{ backgroundImage: `url('${imageUrl}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#FD912A]/50 via-[#FD912A]/20 to-transparent" />

        {showOverlay ? (
          <div className={`relative z-10 ${s.padding} flex flex-col justify-end h-full`}>
            <div className={`flex items-center ${s.gap}`}>
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-[#FD912A]/20 animate-ping [animation-duration:2s]" />
                <div className={`relative ${s.mic} bg-gradient-to-br from-[#FD912A] to-[#FD912A]/80 rounded-full flex items-center justify-center shadow-md`}>
                  <FaMicrophone className={`${s.micIcon} text-white`} />
                </div>
              </div>
              <div className={`flex items-center gap-[2px] ${s.waveform} flex-1 min-w-0`}>
                {Array.from({ length: WAVEFORM_BARS }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 min-w-[2px] max-w-[3px] rounded-full bg-[#FD912A]/80"
                    style={{
                      height: `${WAVEFORM_HEIGHTS[i % WAVEFORM_BARS]}%`,
                      animation: isVisible
                        ? `waveform-pulse 1.2s ease-in-out ${i * 0.05}s infinite alternate`
                        : "none",
                    }}
                  />
                ))}
              </div>
            </div>
            {quote && (
              <p className={`${s.quote} font-semibold text-white/90 italic font-body drop-shadow-sm`}>
                {quote}
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CustomerVoiceCard;
