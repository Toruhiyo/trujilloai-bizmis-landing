import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { FaCheck, FaChevronRight } from "react-icons/fa";
import CustomerVoiceCard, {
  SHOPPER_CAPTION_WORD_INTRA_DRIFT_OFFSET_MS,
} from "./CustomerVoiceCard";
import FloatingCaption from "./FloatingCaption";
import Waveform from "./Waveform";
import { SUPPORT_CASES, SupportCase } from "@/data/support-cases";

const INTERSECTION_THRESHOLD = 0.3;
const TRANSITION_MS = 500;
const CUSTOMER_TEXT_DELAY_MS = 400;
const RESOLUTION_TEXT_DELAY_MS = 200;
const ACTION_DONE_LINGER_MS = 1200;
const RESOLUTION_SLOT_MIN_HEIGHT = "5rem";
const SOLVED_DURATION_MS = 1800;

/** Caption sits to the left of the avatar; small overhang back over the figure for visual link. */
const CLERK_CAPTION_OVERHANG_TRANSFORM = "translate(22%, -22%)";
/** Vertical anchor: sits lower than torso midpoint so caption clears the center waveform. */
const CLERK_CAPTION_OVERLAY_TOP = "56%";

/** Pause after each karaoke caption finishes before progressing to the next phase. */
const SHOPPER_CAPTION_TO_PAUSE_DELAY_MS = 600;
const CLERK_CAPTION_TO_FADE_DELAY_MS = 500;

/**
 * Delays from each caption's "shown" trigger to the first karaoke word (used to
 * sync the audio waveform animation with the karaoke playback windows).
 *
 * - Shopper: `CustomerVoiceCard` adds `SHOPPER_CAPTION_WORD_INTRA_DRIFT_OFFSET_MS`
 *   on top of the card's `quoteEnterDelayMs` (which we pass as `CUSTOMER_TEXT_DELAY_MS`).
 * - Clerk: `ShopperShortCaption` is rendered directly with `wordBaseDelayMs={RESOLUTION_TEXT_DELAY_MS}`.
 */
const SHOPPER_KARAOKE_START_DELAY_MS =
  CUSTOMER_TEXT_DELAY_MS + SHOPPER_CAPTION_WORD_INTRA_DRIFT_OFFSET_MS;
const CLERK_KARAOKE_START_DELAY_MS = RESOLUTION_TEXT_DELAY_MS;

/**
 * Hard ceiling for caption-driven phase gates. If the caption never reports
 * `consumed` (e.g. throttled tab, tracker dropping the timer), force-advance
 * after this much time so the scene never freezes.
 */
const CAPTION_GATE_MAX_WAIT_MS = 10_000;

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
  /** Caption-driven (gated by shopperCaptionConsumed); kept as upper bound. */
  "customer-speaking": 6000,
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

const STEPS = [
  { num: 1, label: "Question received" },
  { num: 2, label: "Source checked" },
  { num: 3, label: "Answered & resolved" },
] as const;

/** Maps each support phase to the step rail index it belongs to. */
const PHASE_TO_STEP: Record<Phase, number> = {
  idle: 0,
  "customer-in": 0,
  "customer-speaking": 0,
  pause: 1,
  "agent-speaking": 2,
  done: 2,
  hold: 2,
  solved: 2,
  "fade-out": 2,
};
const STEP_HIGHLIGHT_TRANSITION_MS = 450;

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
  const [isVisible, setIsVisible] = useState(false);
  const [caseIndex, setCaseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [actionDismissed, setActionDismissed] = useState(false);
  const [resolutionRevealed, setResolutionRevealed] = useState(false);
  const [shopperCaptionConsumed, setShopperCaptionConsumed] = useState(false);
  const [clerkCaptionConsumed, setClerkCaptionConsumed] = useState(false);
  const [shopperKaraokeStarted, setShopperKaraokeStarted] = useState(false);
  const [clerkKaraokeStarted, setClerkKaraokeStarted] = useState(false);

  const currentCase: SupportCase = SUPPORT_CASES[caseIndex];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: INTERSECTION_THRESHOLD },
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

  const onShopperCaptionConsumed = useCallback(() => {
    setShopperCaptionConsumed(true);
  }, []);

  const onClerkCaptionConsumed = useCallback(() => {
    setClerkCaptionConsumed(true);
  }, []);

  useLayoutEffect(() => {
    setShopperCaptionConsumed(false);
    setClerkCaptionConsumed(false);
    setShopperKaraokeStarted(false);
    setClerkKaraokeStarted(false);
  }, [caseIndex]);

  useLayoutEffect(() => {
    if (phase === "customer-speaking") {
      setShopperCaptionConsumed(false);
    }
    if (phase === "solved" || phase === "fade-out") {
      // clerk consumed flag persists into solved/fade-out; only resets per case.
    }
  }, [phase]);

  useEffect(() => {
    if (!isVisible) return;
    if (phase === "fade-out") {
      const timeout = setTimeout(advanceToNext, PHASE_DURATIONS["fade-out"]);
      return () => clearTimeout(timeout);
    }
    if (phase === "customer-speaking") {
      // Caption-driven: do not auto-advance via timer; effect below gates it.
      return;
    }
    if (phase === "solved") {
      // Caption-driven exit: gated by clerkCaptionConsumed below.
      return;
    }
    if (phase === "hold") {
      // Caption-driven entry into "solved": gated by clerkCaptionConsumed below.
      return;
    }
    const currentIndex = PHASE_ORDER.indexOf(phase);
    if (currentIndex < PHASE_ORDER.length - 1) {
      const nextPhase = PHASE_ORDER[currentIndex + 1];
      const timeout = setTimeout(
        () => setPhase(nextPhase),
        PHASE_DURATIONS[phase],
      );
      return () => clearTimeout(timeout);
    }
  }, [isVisible, phase, advanceToNext]);

  /** Mirror the shopper karaoke playback window so the waveform can sync to it. */
  useEffect(() => {
    if (phase !== "customer-speaking") {
      setShopperKaraokeStarted(false);
      return;
    }
    setShopperKaraokeStarted(false);
    const t = window.setTimeout(
      () => setShopperKaraokeStarted(true),
      SHOPPER_KARAOKE_START_DELAY_MS,
    );
    return () => clearTimeout(t);
  }, [phase]);

  /** Mirror the clerk karaoke playback window (resolutionRevealed → consumed). */
  useEffect(() => {
    if (!resolutionRevealed) {
      setClerkKaraokeStarted(false);
      return;
    }
    const t = window.setTimeout(
      () => setClerkKaraokeStarted(true),
      CLERK_KARAOKE_START_DELAY_MS,
    );
    return () => clearTimeout(t);
  }, [resolutionRevealed]);

  /** customer-speaking → pause once the shopper karaoke is consumed (with hard ceiling). */
  useEffect(() => {
    if (!isVisible || phase !== "customer-speaking") return;
    let captionTimer: number | null = null;
    if (shopperCaptionConsumed) {
      captionTimer = window.setTimeout(
        () => setPhase("pause"),
        SHOPPER_CAPTION_TO_PAUSE_DELAY_MS,
      );
    }
    const fallbackTimer = window.setTimeout(
      () => setPhase("pause"),
      CAPTION_GATE_MAX_WAIT_MS,
    );
    return () => {
      if (captionTimer !== null) clearTimeout(captionTimer);
      clearTimeout(fallbackTimer);
    };
  }, [isVisible, phase, shopperCaptionConsumed]);

  /** hold → solved once the clerk karaoke is consumed (with hard ceiling). */
  useEffect(() => {
    if (!isVisible || phase !== "hold") return;
    let captionTimer: number | null = null;
    if (clerkCaptionConsumed) {
      captionTimer = window.setTimeout(
        () => setPhase("solved"),
        PHASE_DURATIONS.hold,
      );
    }
    const fallbackTimer = window.setTimeout(
      () => setPhase("solved"),
      CAPTION_GATE_MAX_WAIT_MS,
    );
    return () => {
      if (captionTimer !== null) clearTimeout(captionTimer);
      clearTimeout(fallbackTimer);
    };
  }, [isVisible, phase, clerkCaptionConsumed]);

  /** solved → fade-out once the clerk karaoke is consumed (min linger + hard ceiling). */
  useEffect(() => {
    if (!isVisible || phase !== "solved") return;
    const minDuration = PHASE_DURATIONS.solved;
    const enteredAt = performance.now();
    let captionTimer: number | null = null;

    if (clerkCaptionConsumed) {
      const elapsed = performance.now() - enteredAt;
      const wait = Math.max(
        CLERK_CAPTION_TO_FADE_DELAY_MS,
        minDuration - elapsed,
      );
      captionTimer = window.setTimeout(() => setPhase("fade-out"), wait);
    }

    const fallbackTimer = window.setTimeout(
      () => setPhase("fade-out"),
      CAPTION_GATE_MAX_WAIT_MS,
    );

    return () => {
      if (captionTimer !== null) clearTimeout(captionTimer);
      clearTimeout(fallbackTimer);
    };
  }, [isVisible, phase, clerkCaptionConsumed]);

  const actionCompleted =
    phase === "agent-speaking" || phase === "done" || phase === "hold";

  useEffect(() => {
    if (!actionCompleted || actionDismissed) return;
    const timeout = setTimeout(
      () => setActionDismissed(true),
      ACTION_DONE_LINGER_MS,
    );
    return () => clearTimeout(timeout);
  }, [actionCompleted, actionDismissed]);

  const fadingOut = phase === "fade-out";

  const actionBadgeVisible =
    (phase === "pause" ||
      phase === "agent-speaking" ||
      phase === "done" ||
      phase === "hold") &&
    !actionDismissed;

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
    (shopperKaraokeStarted && !shopperCaptionConsumed) ||
    (clerkKaraokeStarted && !clerkCaptionConsumed);

  const customerTextVisible =
    phase === "customer-speaking" ||
    phase === "pause" ||
    phase === "agent-speaking" ||
    phase === "done" ||
    phase === "hold" ||
    phase === "solved";

  const solvedVisible = phase === "solved";

  const activeStepIdx = PHASE_TO_STEP[phase];

  return (
    <div ref={ref} className="w-full max-w-6xl mx-auto px-4 overflow-visible">
      {/* Step flow synced with mockup phase: grid keeps one rail row at every
          width so highlighting never changes how many lines the strip uses. */}
      <div className="w-full mb-6 flex items-center justify-center overflow-visible">
        <div
          className="grid w-full max-w-3xl mx-auto items-center gap-x-1 sm:gap-x-2 text-primary text-[11px] sm:text-sm font-medium overflow-visible"
          style={{
            gridTemplateColumns:
              "minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr)",
          }}
        >
          {STEPS.map((step, idx) => {
            const isActive = idx === activeStepIdx;
            return (
              <Fragment key={step.num}>
                <div className="flex min-w-0 justify-center overflow-visible px-0.5 sm:px-1">
                  <span className="inline-flex max-w-full justify-center">
                    <span
                      className="flex max-w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 sm:gap-x-2 origin-center text-center"
                      style={{
                        transform: isActive ? "scale(1.18)" : "scale(1)",
                        opacity: isActive ? 1 : 0.55,
                        transition: `transform ${STEP_HIGHLIGHT_TRANSITION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity ${STEP_HIGHLIGHT_TRANSITION_MS}ms ease`,
                      }}
                    >
                      <span
                        className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full text-white text-[10px] sm:text-xs font-semibold flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? "bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.18),0_4px_14px_-2px_hsl(var(--primary)/0.55)]"
                            : "bg-primary-light"
                        }`}
                      >
                        {step.num}
                      </span>
                      <span
                        className={`min-w-0 max-w-[11rem] xs:max-w-[13rem] sm:max-w-none transition-colors duration-300 ${
                          isActive ? "text-primary font-semibold" : "text-primary"
                        }`}
                      >
                        {step.label}
                      </span>
                    </span>
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <span
                    className="inline-flex shrink-0 items-center justify-center select-none self-center px-0.5 sm:px-1"
                    aria-hidden
                  >
                    <FaChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary/60" />
                  </span>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      <div
        className="relative flex flex-col items-center gap-6 lg:grid lg:gap-0 w-full min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] lg:items-center"
        style={{ gridTemplateColumns: "1fr auto 1fr" }}
      >
        {/* Left cell — customer card pushed to the right edge */}
        <div className="lg:justify-self-end min-w-0 flex justify-center lg:justify-end order-1 lg:order-none">
          <div
            className="relative z-10 w-[10rem] sm:w-[12rem] flex-shrink-0"
            style={{
              opacity: customerVisible && !fadingOut ? 1 : 0,
              transform:
                customerVisible && !fadingOut
                  ? "translateX(0)"
                  : "translateX(-1.5rem)",
              transition: `opacity ${TRANSITION_MS}ms ease-in-out, transform ${TRANSITION_MS}ms ease-in-out`,
            }}
          >
            <CustomerVoiceCard
              key={`support-customer-${caseIndex}`}
              imageUrl={currentCase.customerImage}
              quote={currentCase.customerQuote}
              size="small"
              showOverlay
              isVisible={customerVisible && !fadingOut}
              quoteVisible={customerTextVisible && !fadingOut}
              quoteEnterDelayMs={CUSTOMER_TEXT_DELAY_MS}
              className="max-w-[10rem] sm:max-w-[12rem]"
              onCaptionPlaybackConsumed={onShopperCaptionConsumed}
            />
          </div>
        </div>

        {/* Center cell — waveform + action badge (clerk reply floats on avatar) */}
        <div className="relative z-20 flex flex-col items-stretch gap-3 w-full max-w-[22rem] sm:max-w-[28rem] px-4 sm:px-8 lg:px-10 lg:w-[22rem] xl:w-[28rem] order-3 lg:order-none">
          {/* Audio waveform */}
          <div
            className="w-full py-1"
            style={{
              opacity: waveVisible ? 1 : 0,
              transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
            }}
          >
            <Waveform animating={waveAnimating} className="h-14" />
          </div>

          {/* Single slot: action badge only (fixed height to avoid layout shift) */}
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
                    background: actionCompleted
                      ? "rgba(253,145,42,0.12)"
                      : "rgba(255,255,255,0.9)",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: actionCompleted
                      ? "rgba(253,145,42,0.45)"
                      : "rgba(253,145,42,0.15)",
                    animation: actionCompleted
                      ? "action-badge-done-halo 700ms ease-out forwards"
                      : undefined,
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300"
                    style={{
                      background: actionCompleted
                        ? "rgba(253,145,42,0.2)"
                        : "rgba(253,145,42,0.1)",
                      animation: actionCompleted
                        ? "action-badge-done-pop 450ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                        : undefined,
                    }}
                  >
                    {actionCompleted ? (
                      <FaCheck className="w-2.5 h-2.5 text-primary" />
                    ) : (
                      <currentCase.resolutionIcon className="w-3 h-3 text-primary" />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] sm:text-[13px] font-semibold text-foreground/80 whitespace-nowrap leading-tight">
                      {currentCase.resolutionAction}
                    </span>
                    {actionCompleted ? (
                      <span className="text-[11px] sm:text-[12px] text-primary font-semibold leading-tight">
                        Done
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-[11px] sm:text-[12px] text-primary font-medium leading-tight">
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
                  style={{
                    animation: "solved-ring 1s ease-out forwards",
                    left: "50%",
                    top: "50%",
                    translate: "-50% -50%",
                  }}
                />
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 56 56"
                  fill="none"
                  style={{
                    animation:
                      "solved-badge 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                  }}
                >
                  <circle
                    cx="28"
                    cy="28"
                    r="26"
                    stroke="#FD912A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.25"
                    style={{
                      strokeDasharray: 163,
                      strokeDashoffset: 163,
                      animation:
                        "solved-circle-draw 0.6s ease-out 0.1s forwards",
                    }}
                  />
                  <path
                    d="M17 28.5L24.5 36L39 21"
                    stroke="#FD912A"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    style={{
                      strokeDasharray: 36,
                      strokeDashoffset: 36,
                      animation:
                        "solved-check-draw 0.5s ease-out 0.5s forwards",
                    }}
                  />
                </svg>
              </>
            )}
          </div>
        </div>

        {/* Right cell — clerk avatar with dual primary halo (parity with Benefit 1) */}
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
              <div className="absolute -inset-10 rounded-full bg-primary/34 blur-2xl animate-pulse" />
              <div className="absolute -inset-24 rounded-full bg-primary/22 blur-3xl animate-pulse [animation-delay:0.5s]" />
            </div>
            {resolutionVisible ? (
              <FloatingCaption
                key={`clerk-${caseIndex}`}
                wrapperClassName="absolute right-full z-30 pointer-events-none max-w-[17rem] xs:max-w-[20rem] sm:max-w-[24rem] lg:max-w-[28rem] min-w-0 w-max"
                wrapperStyle={{
                  top: CLERK_CAPTION_OVERLAY_TOP,
                  transform: CLERK_CAPTION_OVERHANG_TRANSFORM,
                }}
                paddingClassName="px-3 py-2"
                shown={resolutionVisible && resolutionRevealed}
                enterDelayMs={RESOLUTION_TEXT_DELAY_MS}
                enterDurationMs={TRANSITION_MS}
                translateYOffsetRem={0.75}
                quote={currentCase.response}
                wordBaseDelayMs={RESOLUTION_TEXT_DELAY_MS}
                textClassName="text-[14px] sm:text-[15px] leading-tight"
                captionClassName="justify-end text-right"
                tone="clerk"
                onCaptionPlaybackConsumed={onClerkCaptionConsumed}
              />
            ) : null}
            <img
              src="/images/benefit-2-customer-support.png"
              alt="Bizmis support assistant"
              className="relative h-56 sm:h-72 md:h-96 lg:h-[28rem] object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSupportScene;
