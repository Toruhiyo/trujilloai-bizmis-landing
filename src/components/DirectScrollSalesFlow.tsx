import React, { useState, useEffect } from "react";
import { ShoppingCart, ShoppingBag } from "lucide-react";

const PROGRESS_THRESHOLD_STEP_2 = 0.33;
const PROGRESS_THRESHOLD_STEP_3 = 0.66;
const CART_ANIMATION_THRESHOLD = 0.75;
const SCROLL_SENSITIVITY = 0.001;
const MAX_DELTA_CLAMP = 150;
const TOUCH_SENSITIVITY_MULTIPLIER = 2.5;
const VIEWPORT_CENTER_RATIO = 0.5;
const CART_ANIMATION_DURATION = 1500;
const CART_ANIMATION_INTERVAL = 3000;
const STEP_TRACKER_CIRCLES = 3;
const CELEBRATION_PARTICLES_COUNT = 8;

const DirectScrollSalesFlow = () => {
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cartAnimation, setCartAnimation] = useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const currentProgress = React.useRef(0);
  const scrollVelocity = React.useRef(0);

  // Master scroll controller
  useEffect(() => {
    let isInZone = false;

    const handleInput = (delta: number) => {
      if (!isInZone) return false;

      scrollVelocity.current = delta;

      const cappedDelta =
        Math.sign(delta) * Math.min(Math.abs(delta), MAX_DELTA_CLAMP);
      let newProgress =
        currentProgress.current + cappedDelta * SCROLL_SENSITIVITY;

      const atTopBoundary = currentProgress.current <= 0;
      const atBottomBoundary = currentProgress.current >= 1;
      const scrollingUp = delta < 0;
      const scrollingDown = delta > 0;

      if (
        (atTopBoundary && scrollingUp) ||
        (atBottomBoundary && scrollingDown)
      ) {
        setIsActive(false);
        return false;
      }

      setIsActive(true);
      newProgress = Math.max(0, Math.min(1, newProgress));
      currentProgress.current = newProgress;
      setProgress(newProgress);

      if (viewportRef.current) {
        viewportRef.current.style.setProperty(
          "--scroll-progress",
          newProgress.toString()
        );
      }

      return true;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const inViewport =
        rect.top <= window.innerHeight * VIEWPORT_CENTER_RATIO &&
        rect.bottom >= window.innerHeight * VIEWPORT_CENTER_RATIO;
      isInZone = inViewport;

      if (handleInput(e.deltaY)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const inViewport =
        rect.top <= window.innerHeight * VIEWPORT_CENTER_RATIO &&
        rect.bottom >= window.innerHeight * VIEWPORT_CENTER_RATIO;
      isInZone = inViewport;

      const touchY = e.touches[0].clientY;
      const delta = (touchStartY - touchY) * TOUCH_SENSITIVITY_MULTIPLIER;
      touchStartY = touchY;

      if (handleInput(delta)) {
        e.preventDefault();
      }
    };

    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isActive]);

  // Cart animation trigger
  useEffect(() => {
    if (progress > CART_ANIMATION_THRESHOLD) {
      const interval = setInterval(() => {
        setCartAnimation(true);
        setTimeout(() => setCartAnimation(false), CART_ANIMATION_DURATION);
      }, CART_ANIMATION_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [progress]);

  const getStepTrackerStyles = (stepIndex: number) => {
    const isStep1 = stepIndex === 1;
    const isStep2 = stepIndex === 2;
    const isStep3 = stepIndex === 3;

    if (isStep1) {
      return progress < PROGRESS_THRESHOLD_STEP_2
        ? "bg-orange-600 border-orange-600 text-white"
        : "bg-white/80 border-orange-300 text-orange-600";
    }

    if (isStep2) {
      return progress >= PROGRESS_THRESHOLD_STEP_2 &&
        progress < PROGRESS_THRESHOLD_STEP_3
        ? "bg-orange-600 border-orange-600 text-white"
        : progress >= PROGRESS_THRESHOLD_STEP_3
        ? "bg-white/80 border-orange-600 text-orange-600"
        : "bg-white/80 border-orange-300 text-orange-300";
    }

    if (isStep3) {
      return progress >= PROGRESS_THRESHOLD_STEP_3
        ? "bg-orange-600 border-orange-600 text-white"
        : "bg-white/80 border-orange-300 text-orange-300";
    }

    return "";
  };

  const getProgressLineStyles = (lineIndex: number) => {
    if (lineIndex === 1) {
      return progress >= PROGRESS_THRESHOLD_STEP_2
        ? "bg-orange-600"
        : "bg-orange-200";
    }
    if (lineIndex === 2) {
      return progress >= PROGRESS_THRESHOLD_STEP_3
        ? "bg-orange-600"
        : "bg-orange-200";
    }
    return "";
  };

  const getStepOpacity = (stepNumber: number) => {
    if (stepNumber === 1) {
      return progress < PROGRESS_THRESHOLD_STEP_2
        ? 1
        : Math.max(0, 1 - (progress - PROGRESS_THRESHOLD_STEP_2) * 5);
    }
    if (stepNumber === 2) {
      return progress >= PROGRESS_THRESHOLD_STEP_2 &&
        progress < PROGRESS_THRESHOLD_STEP_3
        ? 1
        : 0;
    }
    if (stepNumber === 3) {
      return progress >= PROGRESS_THRESHOLD_STEP_3 ? 1 : 0;
    }
    return 0;
  };

  const getStepTransform = (stepNumber: number) => {
    if (stepNumber === 1) {
      return `translateY(${
        progress < PROGRESS_THRESHOLD_STEP_2
          ? 0
          : -50 * (progress - PROGRESS_THRESHOLD_STEP_2)
      }px) scale(${
        progress < PROGRESS_THRESHOLD_STEP_2
          ? 1
          : Math.max(0.8, 1 - (progress - PROGRESS_THRESHOLD_STEP_2))
      })`;
    }
    if (stepNumber === 2) {
      return `translateY(${
        progress >= PROGRESS_THRESHOLD_STEP_2 &&
        progress < PROGRESS_THRESHOLD_STEP_3
          ? 0
          : 30
      }px) scale(${
        progress >= PROGRESS_THRESHOLD_STEP_2 &&
        progress < PROGRESS_THRESHOLD_STEP_3
          ? 1
          : 0.9
      })`;
    }
    if (stepNumber === 3) {
      return `translateY(${
        progress >= PROGRESS_THRESHOLD_STEP_3 ? 0 : 30
      }px) scale(${progress >= PROGRESS_THRESHOLD_STEP_3 ? 1 : 0.9})`;
    }
    return "";
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        ref={viewportRef}
        className="sticky top-0 h-[520px] flex items-center justify-center transition-all duration-300"
        style={{ "--scroll-progress": progress } as React.CSSProperties}
      >
        <div className="w-full max-w-4xl mx-auto px-6">
          <div className="relative h-[520px]">
            {/* Step Tracker */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20">
              {Array.from({ length: STEP_TRACKER_CIRCLES }).map((_, index) => {
                const stepNumber = index + 1;
                return (
                  <React.Fragment key={stepNumber}>
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 ${getStepTrackerStyles(
                        stepNumber
                      )}`}
                    >
                      <span className="font-bold text-lg">{stepNumber}</span>
                    </div>
                    {stepNumber < STEP_TRACKER_CIRCLES && (
                      <div
                        className={`w-16 h-1 rounded-full transition-all duration-500 ${getProgressLineStyles(
                          stepNumber
                        )}`}
                      ></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Step 1: Discovery */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out"
              style={{
                opacity: getStepOpacity(1),
                transform: getStepTransform(1),
              }}
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-orange-200/50 text-center max-w-lg">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <ShoppingBag className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-orange-600 mb-4">
                  Smart Discovery
                </h3>
                <div className="text-xl font-semibold mb-3">
                  Premium Headphones
                </div>
                <div className="text-orange-600 font-medium text-lg">
                  $199 → Perfect Match!
                </div>
                <div className="mt-6 text-base text-muted-foreground">
                  AI finds exactly what you need
                </div>
              </div>
            </div>

            {/* Step 2: Comparison */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out"
              style={{
                opacity: getStepOpacity(2),
                transform: getStepTransform(2),
              }}
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-orange-200/50 text-center max-w-xl">
                <h3 className="text-3xl font-bold text-orange-600 mb-8">
                  Smart Comparison
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-gray-50 rounded-xl">
                    <div className="font-semibold text-lg mb-2">
                      Basic Model
                    </div>
                    <div className="text-2xl font-bold text-gray-600">$149</div>
                  </div>
                  <div className="p-6 bg-amber-100 rounded-xl ring-2 ring-orange-500">
                    <div className="font-semibold text-lg mb-2 text-orange-600">
                      Premium
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      $199
                    </div>
                    <div className="text-sm text-orange-600 mt-2">
                      ⭐ Recommended
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-base text-muted-foreground">
                  AI explains the difference
                </div>
              </div>
            </div>

            {/* Step 3: Purchase */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out"
              style={{
                opacity: getStepOpacity(3),
                transform: getStepTransform(3),
              }}
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-orange-200/50 text-center max-w-lg relative overflow-hidden">
                <div
                  className={`w-28 h-28 rounded-2xl flex items-center justify-center mx-auto mb-8 transition-all duration-500 ${
                    cartAnimation
                      ? "bg-amber-100 ring-4 ring-orange-300 scale-110"
                      : "bg-amber-100"
                  }`}
                >
                  <ShoppingCart
                    className={`w-14 h-14 transition-colors duration-500 ${
                      cartAnimation ? "text-orange-600" : "text-orange-600"
                    }`}
                  />
                </div>
                <h3 className="text-3xl font-bold text-orange-600 mb-4">
                  Purchase Complete!
                </h3>
                <div className="text-orange-600 font-medium text-lg">
                  Added to cart successfully
                </div>

                {/* Celebration particles */}
                {cartAnimation && (
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: CELEBRATION_PARTICLES_COUNT }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-orange-600 rounded-full animate-ping"
                          style={{
                            top: `${30 + Math.random() * 40}%`,
                            left: `${20 + Math.random() * 60}%`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: "1s",
                          }}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectScrollSalesFlow;
