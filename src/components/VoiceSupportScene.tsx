import { useEffect, useRef, useState, useCallback } from "react";
import { FaCheck } from "react-icons/fa";
import CustomerVoiceCard from "./CustomerVoiceCard";
import { SUPPORT_CASES, SupportCase } from "@/data/support-cases";

const INTERSECTION_THRESHOLD = 0.3;
const TRANSITION_MS = 500;
const CUSTOMER_TEXT_DELAY_MS = 400;
const RESOLUTION_TEXT_DELAY_MS = 200;
const ACTION_DONE_LINGER_MS = 1200;
const RESOLUTION_SLOT_MIN_HEIGHT = "5rem";
const SOLVED_DURATION_MS = 1800;
const WAVEFORM_BARS = 40;
const WAVEFORM_HEIGHTS = [
  44, 64, 80, 54, 84, 60, 74, 48, 68, 86, 52, 72, 56, 82,
  62, 76, 46, 70, 58, 80, 50, 66, 60, 78, 42, 68, 54, 84,
  58, 74, 48, 70, 62, 82, 52, 66, 56, 82, 50, 72,
];

/** Gap between bars (matches the `gap-[1.5px]` Tailwind class on the wave row). */
const WAVE_BAR_GAP_PX = 1.5;
/** Silent ↔ talking: slow symmetric height morph (was 300ms; transform pulse fought this). */
const WAVE_HEIGHT_MORPH_MS = 820;
/** Bar opacity dimming applied while silent so the row reads as "idle" without disappearing. */
const WAVE_BAR_OPACITY_TALKING = 1;
const WAVE_BAR_OPACITY_SILENT = 0.4;
const WAVE_HEIGHT_MORPH_EASING = "cubic-bezier(0.42, 0, 0.58, 1)";
/** Per-bar fluctuation while talking. */
const WAVE_PULSE_S = 1.2;
/** Pseudo-random but deterministic per-bar phase offsets in [0, WAVE_PULSE_S).
   Applied as a NEGATIVE delay so all bars start mid-cycle at different phases — avoids
   the left→right sweep you'd get from a positive staggered delay. */
const WAVE_BAR_PHASE_OFFSETS_S = Array.from({ length: 40 }, (_, i) => {
  const pseudo = Math.sin(i * 12.9898) * 43758.5453;
  return +(WAVE_PULSE_S * (pseudo - Math.floor(pseudo))).toFixed(3);
});

type Phase =
  | "idle"
  | "customer-in"
  | "customer-speaking"
  | "pause"
  | "agent-speaking"
  | "done"
  | "hold"
  | "fade-out"
  | "solved";

const PHASE_DURATIONS: Record<Phase, number> = {
  idle: 600,
  "customer-in": 600,
  "customer-speaking": 2500,
  pause: 1800,
  "agent-speaking": 3500,
  done: 500,
  hold: 500,
  "fade-out": 600,
  solved: SOLVED_DURATION_MS,
};

const PHASE_ORDER: Phase[] = [
  "idle",
  "customer-in",
  "customer-speaking",
  "pause",
  "agent-speaking",
  "done",
  "hold",
  "solved",
  "fade-out",
];

const SOLVED_PARTICLES = [
  { x: -28, y: -32, size: 6, delay: 0, color: "#FD912A" },
  { x: 30, y: -26, size: 5, delay: 40, color: "#FDB34A" },
  { x: -20, y: 28, size: 5, delay: 80, color: "#FD912A" },
  { x: 26, y: 30, size: 4, delay: 60, color: "#FDB34A" },
  { x: -36, y: 4, size: 4, delay: 100, color: "#FDC97A" },
  { x: 38, y: -4, size: 5, delay: 20, color: "#FD912A" },
  { x: 0, y: -38, size: 4, delay: 70, color: "#FDB34A" },
  { x: 0, y: 36, size: 3, delay: 110, color: "#FDC97A" },
];

const VoiceSupportScene = () => {
  const ref = useRef<HTMLDivElement>(null);
  const waveRowRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [caseIndex, setCaseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [actionDismissed, setActionDismissed] = useState(false);
  const [resolutionRevealed, setResolutionRevealed] = useState(false);
  const [silentBarHeightPx, setSilentBarHeightPx] = useState(0);

  const currentCase: SupportCase = SUPPORT_CASES[caseIndex];

  useEffect(() => {
    const node = waveRowRef.current;
    if (!node) return;

    const measure = () => {
      const rowWidth = node.clientWidth;
      if (rowWidth <= 0) return;
      const totalGap = WAVE_BAR_GAP_PX * (WAVEFORM_BARS - 1);
      const barWidth = (rowWidth - totalGap) / WAVEFORM_BARS;
      setSilentBarHeightPx(Math.max(0, barWidth));
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(node);
    return () => resizeObserver.disconnect();
  }, []);

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
    setActionDismissed(false);
    setResolutionRevealed(false);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    if (phase === "fade-out") {
      const timeout = setTimeout(advanceToNext, PHASE_DURATIONS["fade-out"]);
      return () => clearTimeout(timeout);
    }
    const currentIndex = PHASE_ORDER.indexOf(phase);
    if (currentIndex < PHASE_ORDER.length - 1) {
      const nextPhase = PHASE_ORDER[currentIndex + 1];
      const timeout = setTimeout(() => setPhase(nextPhase), PHASE_DURATIONS[phase]);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, phase, advanceToNext]);

  const actionCompleted =
    phase === "agent-speaking" ||
    phase === "done" ||
    phase === "hold";

  useEffect(() => {
    if (!actionCompleted || actionDismissed) return;
    const timeout = setTimeout(() => setActionDismissed(true), ACTION_DONE_LINGER_MS);
    return () => clearTimeout(timeout);
  }, [actionCompleted, actionDismissed]);

  const fadingOut = phase === "fade-out";

  const actionBadgeVisible =
    (phase === "pause" ||
    phase === "agent-speaking" ||
    phase === "done" ||
    phase === "hold") && !actionDismissed;

  const resolutionVisible = actionDismissed && !fadingOut;

  useEffect(() => {
    if (!resolutionVisible) {
      setResolutionRevealed(false);
      return;
    }
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setResolutionRevealed(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [resolutionVisible]);

  const customerVisible = phase !== "idle";

  const waveVisible =
    phase === "customer-speaking" ||
    phase === "pause" ||
    phase === "agent-speaking" ||
    phase === "done" ||
    phase === "hold" ||
    phase === "solved";

  const waveAnimating =
    phase === "customer-speaking" || phase === "agent-speaking";

  const customerTextVisible =
    phase === "customer-speaking" ||
    phase === "pause" ||
    phase === "agent-speaking" ||
    phase === "done" ||
    phase === "hold" ||
    phase === "solved";

  const solvedVisible = phase === "solved";

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center gap-6 lg:grid lg:gap-0 w-full min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] lg:items-center"
      style={{ gridTemplateColumns: "1fr auto 1fr" }}
    >
      {/* Left cell — customer card pushed to the right edge */}
      <div className="lg:justify-self-end min-w-0 flex justify-center lg:justify-end order-1 lg:order-none">
        <div
          className="relative z-10 w-[10rem] sm:w-[12rem] flex-shrink-0"
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
            className="max-w-[10rem] sm:max-w-[12rem]"
          />
        </div>
      </div>

      {/* Center cell — text, waveform, action + resolution */}
      <div className="relative z-20 flex flex-col items-stretch gap-2 w-full max-w-[22rem] sm:max-w-[28rem] px-4 sm:px-8 lg:px-10 lg:w-[22rem] xl:w-[28rem] order-3 lg:order-none">
        {/* Customer request text */}
        <div
          style={{
            opacity: customerTextVisible && !fadingOut ? 1 : 0,
            transform: customerTextVisible && !fadingOut ? "translateY(0)" : "translateY(0.5rem)",
            transition: `opacity ${TRANSITION_MS}ms ease-in-out, transform ${TRANSITION_MS}ms ease-in-out`,
            transitionDelay: customerTextVisible && !fadingOut ? `${CUSTOMER_TEXT_DELAY_MS}ms` : "0ms",
          }}
        >
          <p className="text-sm sm:text-base font-semibold italic text-foreground/70 leading-snug text-left">
            {currentCase.customerQuote}
          </p>
        </div>

        {/* Audio waveform */}
        <div
          className="w-full py-1"
          style={{
            opacity: waveVisible ? 1 : 0,
            transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
          }}
        >
          <div ref={waveRowRef} className="flex items-center gap-[1.5px] h-14 w-full">
            {Array.from({ length: WAVEFORM_BARS }).map((_, i) => (
              <div
                key={i}
                className="flex-1 min-w-[1px] rounded-full bg-primary-light"
                style={{
                  width: "100%",
                  height: waveAnimating
                    ? `${WAVEFORM_HEIGHTS[i % WAVEFORM_BARS]}%`
                    : `${silentBarHeightPx}px`,
                  opacity: waveAnimating ? WAVE_BAR_OPACITY_TALKING : WAVE_BAR_OPACITY_SILENT,
                  transformOrigin: "center",
                  transition: `height ${WAVE_HEIGHT_MORPH_MS}ms ${WAVE_HEIGHT_MORPH_EASING}, opacity ${WAVE_HEIGHT_MORPH_MS}ms ${WAVE_HEIGHT_MORPH_EASING}`,
                  animation: waveAnimating
                    ? `voice-support-wave-bar ${WAVE_PULSE_S}s ease-in-out ${-WAVE_BAR_PHASE_OFFSETS_S[i % WAVE_BAR_PHASE_OFFSETS_S.length]}s infinite alternate`
                    : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Single slot: action badge or resolution message (fixed height to avoid layout shift) */}
        <div
          className="flex flex-col items-end justify-start"
          style={{ minHeight: RESOLUTION_SLOT_MIN_HEIGHT }}
        >
          {actionBadgeVisible ? (
            <div
              style={{
                opacity: 1,
                animation: "action-badge-in 500ms ease-out forwards",
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
                    <FaCheck className="w-2.5 h-2.5 text-primary" />
                  ) : (
                    <currentCase.resolutionIcon className="w-3 h-3 text-primary" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-foreground/80 whitespace-nowrap">
                    {currentCase.resolutionAction}
                  </span>
                  {actionCompleted ? (
                    <span className="text-[10px] text-primary font-semibold">Done</span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[10px] text-primary font-medium">
                      Processing
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          style={{
                            animation: `action-dots 1.2s ease-in-out ${i * 0.2}s infinite`,
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
          ) : resolutionVisible ? (
            <div
              style={{
                opacity: resolutionRevealed ? 1 : 0,
                transform: resolutionRevealed ? "translateY(0)" : "translateY(0.75rem)",
                transition: `opacity ${TRANSITION_MS}ms ease-in-out, transform ${TRANSITION_MS}ms ease-in-out`,
                transitionDelay: resolutionRevealed ? "0ms" : `${RESOLUTION_TEXT_DELAY_MS}ms`,
              }}
            >
              <p className="text-sm text-foreground/70 italic leading-relaxed text-right">
                {currentCase.response}
              </p>
            </div>
          ) : null}
        </div>

        {/* Solved checkmark — below content, no layout displacement */}
        <div
          className="absolute left-0 right-0 bottom-0 flex justify-center pointer-events-none"
          style={{
            opacity: solvedVisible ? 1 : 0,
            transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
            transform: "translateY(100%)",
          }}
        >
          {solvedVisible && (
            <>
              {SOLVED_PARTICLES.map((p, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: p.size,
                    height: p.size,
                    background: p.color,
                    animation: `solved-particle 800ms ease-out ${p.delay}ms forwards`,
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    ["--px" as string]: `${p.x}px`,
                    ["--py" as string]: `${p.y}px`,
                  }}
                />
              ))}
              <div
                className="absolute rounded-full border-2 border-primary/30"
                style={{ animation: "solved-ring 1s ease-out forwards", left: "50%", top: "50%", translate: "-50% -50%" }}
              />
              <svg
                width="64"
                height="64"
                viewBox="0 0 56 56"
                fill="none"
                style={{ animation: "solved-badge 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
              >
                <circle
                  cx="28" cy="28" r="26"
                  stroke="#FD912A" strokeWidth="2.5" strokeLinecap="round"
                  fill="none" opacity="0.25"
                  style={{ strokeDasharray: 163, strokeDashoffset: 163, animation: "solved-circle-draw 0.6s ease-out 0.1s forwards" }}
                />
                <path
                  d="M17 28.5L24.5 36L39 21"
                  stroke="#FD912A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                  fill="none"
                  style={{ strokeDasharray: 36, strokeDashoffset: 36, animation: "solved-check-draw 0.5s ease-out 0.5s forwards" }}
                />
              </svg>
            </>
          )}
        </div>
      </div>

      {/* Right cell — avatar pushed to the left edge */}
      <div className="lg:justify-self-start order-2 lg:order-none">
        <div
          className={`relative z-10 transition-all ease-out ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
          style={{
            transitionDelay: isVisible ? "200ms" : "0ms",
            transitionDuration: "1200ms",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute -inset-8 rounded-full bg-primary/8 blur-2xl animate-pulse" />
          </div>
          <img
            src="/images/benefit-2-customer-support.png"
            alt="Bizmis support assistant"
            className="relative h-56 sm:h-72 md:h-96 lg:h-[28rem] object-contain drop-shadow-2xl"
          />
        </div>
      </div>

    </div>
  );
};

export default VoiceSupportScene;
