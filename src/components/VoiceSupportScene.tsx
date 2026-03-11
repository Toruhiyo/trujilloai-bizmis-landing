import { useEffect, useRef, useState, useCallback } from "react";
import { FaCheck } from "react-icons/fa";
import CustomerVoiceCard from "./CustomerVoiceCard";
import { SUPPORT_CASES, SupportCase } from "@/data/support-cases";

const INTERSECTION_THRESHOLD = 0.3;
const TRANSITION_MS = 500;
const CUSTOMER_TEXT_DELAY_MS = 400;
const WAVEFORM_BARS = 40;
const WAVEFORM_HEIGHTS = [
  32, 52, 68, 42, 72, 48, 62, 36, 56, 74, 40, 60, 44, 70,
  50, 64, 34, 58, 46, 68, 38, 54, 48, 66, 30, 56, 42, 72,
  46, 62, 36, 58, 50, 68, 40, 54, 44, 70, 38, 60,
];

type Phase =
  | "idle"
  | "customer-in"
  | "customer-speaking"
  | "pause"
  | "agent-speaking"
  | "done"
  | "hold"
  | "fade-out";

const PHASE_DURATIONS: Record<Phase, number> = {
  idle: 600,
  "customer-in": 600,
  "customer-speaking": 2500,
  pause: 1800,
  "agent-speaking": 3500,
  done: 500,
  hold: 500,
  "fade-out": 600,
};

const PHASE_ORDER: Phase[] = [
  "idle",
  "customer-in",
  "customer-speaking",
  "pause",
  "agent-speaking",
  "done",
  "hold",
  "fade-out",
];

const VoiceSupportScene = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [caseIndex, setCaseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");

  const currentCase: SupportCase = SUPPORT_CASES[caseIndex];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: INTERSECTION_THRESHOLD }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const advanceToNext = useCallback(() => {
    setCaseIndex((prev) => (prev + 1) % SUPPORT_CASES.length);
    setPhase("idle");
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const currentIndex = PHASE_ORDER.indexOf(phase);
    if (phase === "fade-out") {
      const timeout = setTimeout(advanceToNext, PHASE_DURATIONS["fade-out"]);
      return () => clearTimeout(timeout);
    }
    if (currentIndex < PHASE_ORDER.length - 1) {
      const nextPhase = PHASE_ORDER[currentIndex + 1];
      const timeout = setTimeout(() => setPhase(nextPhase), PHASE_DURATIONS[phase]);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, phase, advanceToNext]);

  const fadingOut = phase === "fade-out";

  const customerVisible = phase !== "idle";

  const waveVisible =
    phase === "customer-speaking" ||
    phase === "pause" ||
    phase === "agent-speaking" ||
    phase === "done" ||
    phase === "hold";

  const waveAnimating =
    phase === "customer-speaking" || phase === "agent-speaking";

  const customerTextVisible =
    phase === "customer-speaking" ||
    phase === "pause" ||
    phase === "agent-speaking" ||
    phase === "done" ||
    phase === "hold";

  const actionBadgeVisible =
    phase === "pause" ||
    phase === "agent-speaking" ||
    phase === "done" ||
    phase === "hold";

  const actionCompleted =
    phase === "agent-speaking" ||
    phase === "done" ||
    phase === "hold";

  const resolutionVisible =
    phase === "agent-speaking" ||
    phase === "done" ||
    phase === "hold";


  return (
    <div
      ref={ref}
      className="relative flex flex-row items-center justify-center w-full min-h-[420px] sm:min-h-[520px]"
    >
      {/* Customer voice card — left (image only, no overlay) */}
      <div
        className="relative z-20 flex-shrink-0 w-full max-w-[10rem] -mr-12 sm:-mr-16 lg:-mr-20"
        style={{
          opacity: customerVisible && !fadingOut ? 1 : 0,
          transform: customerVisible && !fadingOut ? "translateX(0)" : "translateX(-1.5rem)",
          transition: `opacity ${TRANSITION_MS}ms ease-in-out, transform ${TRANSITION_MS}ms ease-in-out`,
        }}
      >
        <CustomerVoiceCard
          imageUrl={currentCase.customerImage}
          size="small"
          showOverlay={false}
          isVisible={customerVisible && !fadingOut}
        />
        {/* Customer request text — overlay on card bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 z-30 px-2 pb-3"
          style={{
            opacity: customerTextVisible && !fadingOut ? 1 : 0,
            transform: customerTextVisible && !fadingOut ? "translateY(0)" : "translateY(0.5rem)",
            transition: `opacity ${TRANSITION_MS}ms ease-in-out, transform ${TRANSITION_MS}ms ease-in-out`,
            transitionDelay: customerTextVisible && !fadingOut ? `${CUSTOMER_TEXT_DELAY_MS}ms` : "0ms",
          }}
        >
          <p className="text-sm sm:text-base font-semibold italic text-white leading-snug">
            {currentCase.customerQuote}
          </p>
        </div>
      </div>

      {/* Bizmis avatar — center */}
      <div
        className={`relative z-10 flex-shrink-0 transition-all ease-out ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
        style={{
          transitionDelay: isVisible ? "200ms" : "0ms",
          transitionDuration: "1200ms",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute -inset-8 rounded-full bg-[#FD912A]/8 blur-2xl animate-pulse" />
        </div>
        <img
          src="/images/benefit-2-customer-support.png"
          alt="Bizmis support assistant"
          className="relative w-80 h-80 sm:w-96 sm:h-96 lg:w-[28rem] lg:h-[28rem] object-contain drop-shadow-2xl"
        />

        {/* Voice waveform — overlapping avatar bottom */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30"
          style={{
            opacity: waveVisible ? 1 : 0,
            transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
          }}
        >
          <div className="bg-white/70 backdrop-blur-md rounded-full px-5 py-2.5 shadow-lg border border-[#FD912A]/15 flex items-center min-w-[14rem] sm:min-w-[17rem] lg:min-w-[20rem]">
            <div className="flex items-center gap-[1.5px] h-9 flex-1 min-w-0">
              {Array.from({ length: WAVEFORM_BARS }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 min-w-[2px] rounded-full bg-[#FD912A]/70"
                  style={{
                    height: waveAnimating
                      ? `${WAVEFORM_HEIGHTS[i % WAVEFORM_BARS]}%`
                      : "20%",
                    animation: waveAnimating
                      ? `waveform-pulse 1.2s ease-in-out ${i * 0.04}s infinite alternate`
                      : "none",
                    transition: "height 300ms ease-in-out",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Right column — action badge + resolution card */}
      <div className="relative z-20 flex-shrink-0 w-full max-w-[14rem] -ml-12 sm:-ml-16 lg:-ml-20 flex flex-col items-start gap-2.5">
        {/* Action badge — processing → done */}
        <div
          style={{
            opacity: actionBadgeVisible && !fadingOut ? 1 : 0,
            animation: actionBadgeVisible && !fadingOut ? "action-badge-in 500ms ease-out forwards" : "none",
            transition: fadingOut ? `opacity ${TRANSITION_MS}ms ease-in-out` : undefined,
            pointerEvents: "none",
          }}
        >
          <div
            className="backdrop-blur-md rounded-xl px-3.5 py-2 shadow-md flex items-center gap-2 transition-all duration-300"
            style={{
              background: actionCompleted ? "rgba(253,145,42,0.12)" : "rgba(255,255,255,0.9)",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: actionCompleted ? "rgba(253,145,42,0.3)" : "rgba(253,145,42,0.15)",
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300"
              style={{
                background: actionCompleted ? "rgba(253,145,42,0.2)" : "rgba(253,145,42,0.1)",
              }}
            >
              {actionCompleted ? (
                <FaCheck className="w-2.5 h-2.5 text-[#FD912A]" />
              ) : (
                <currentCase.resolutionIcon className="w-3 h-3 text-[#FD912A]" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-foreground/80 whitespace-nowrap">
                {currentCase.resolutionAction}
              </span>
              {actionCompleted ? (
                <span className="text-[10px] text-[#FD912A] font-semibold">Done</span>
              ) : (
                <span className="flex items-center gap-0.5 text-[10px] text-[#FD912A] font-medium">
                  Processing
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        animation: actionBadgeVisible
                          ? `action-dots 1.2s ease-in-out ${i * 0.2}s infinite`
                          : "none",
                      }}
                    >
                      .
                    </span>
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Resolution card */}
        <div
          className="w-full"
          style={{
            opacity: resolutionVisible && !fadingOut ? 1 : 0,
            transform: resolutionVisible && !fadingOut ? "translateY(0)" : "translateY(0.75rem)",
            transition: `opacity ${TRANSITION_MS}ms ease-in-out, transform ${TRANSITION_MS}ms ease-in-out`,
          }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-[#FD912A]/20 shadow-lg p-4">
            <p className="text-sm text-foreground italic leading-relaxed">
              {currentCase.response}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSupportScene;
