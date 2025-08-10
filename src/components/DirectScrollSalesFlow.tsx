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

  const handleStepClick = (stepNumber: number) => {
    let targetProgress: number;

    switch (stepNumber) {
      case 1:
        targetProgress = 0;
        break;
      case 2:
        targetProgress = PROGRESS_THRESHOLD_STEP_2 + 0.2;
        break;
      case 3:
        targetProgress = PROGRESS_THRESHOLD_STEP_3 + 0.05;
        break;
      default:
        targetProgress = 0;
    }

    setProgress(targetProgress);
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        ref={viewportRef}
        className="sticky w-full top-0 h-[520px] flex items-center justify-start transition-all duration-300"
        style={{ "--scroll-progress": progress } as React.CSSProperties}
      >
        <div className="w-full mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-12 items-start">
            {/* Left Side - Steps Content with Tracker */}
            <div className="flex items-center lg:col-span-3">
              {/* Vertical Step Tracker */}
              <div className="flex flex-col items-center gap-4 mr-12 z-20">
                {Array.from({ length: STEP_TRACKER_CIRCLES }).map(
                  (_, index) => {
                    const stepNumber = index + 1;
                    return (
                      <React.Fragment key={stepNumber}>
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 cursor-pointer hover:scale-110 ${getStepTrackerStyles(
                            stepNumber
                          )}`}
                          onClick={() => handleStepClick(stepNumber)}
                        >
                          <span className="font-bold text-lg">
                            {stepNumber}
                          </span>
                        </div>
                        {stepNumber < STEP_TRACKER_CIRCLES && (
                          <div
                            className={`w-1 h-16 rounded-full transition-all duration-500 ${getProgressLineStyles(
                              stepNumber
                            )}`}
                          ></div>
                        )}
                      </React.Fragment>
                    );
                  }
                )}
              </div>

              {/* Main Content Area */}
              <div className="relative h-[520px] flex-1">
                {/* Step 1: Discovery */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-out"
                  style={{
                    opacity: getStepOpacity(1),
                    transform: getStepTransform(1),
                  }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-white mb-3 bg-orange-600 px-8 py-4 rounded-2xl inline-block">
                      Understand & Recommend
                    </h2>
                    <p className="text-lg text-orange-500 font-medium">
                      Uncover their needs and guide them to the perfect match
                    </p>
                  </div>
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-orange-200/50 max-w-5xl w-full">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Product 1 */}
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <div className="w-8 h-8 bg-white rounded"></div>
                        </div>
                        <h4 className="font-bold text-lg mb-2">
                          Wireless Earbuds
                        </h4>
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          $89
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          ★★★★☆ (127 reviews)
                        </div>
                        <div className="text-xs text-gray-500 leading-relaxed">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Sed do eiusmod tempor incididunt ut labore et
                          dolore magna aliqua.
                        </div>
                      </div>

                      {/* Product 2 */}
                      <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-300 hover:shadow-lg transition-shadow">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <div className="w-8 h-8 bg-white rounded"></div>
                        </div>
                        <h4 className="font-bold text-lg mb-2">
                          Premium Headphones
                        </h4>
                        <div className="text-2xl font-bold text-orange-600 mb-2">
                          $199
                        </div>
                        <div className="text-sm text-orange-600 mb-3">
                          ★★★★★ (89 reviews)
                        </div>
                        <div className="text-xs text-gray-500 leading-relaxed">
                          Ut enim ad minim veniam, quis nostrud exercitation
                          ullamco laboris nisi ut aliquip ex ea commodo
                          consequat.
                        </div>
                      </div>

                      {/* Product 3 */}
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <div className="w-8 h-8 bg-white rounded"></div>
                        </div>
                        <h4 className="font-bold text-lg mb-2">
                          Smart Speaker
                        </h4>
                        <div className="text-2xl font-bold text-green-600 mb-2">
                          $149
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          ★★★★☆ (203 reviews)
                        </div>
                        <div className="text-xs text-gray-500 leading-relaxed">
                          Duis aute irure dolor in reprehenderit in voluptate
                          velit esse cillum dolore eu fugiat nulla pariatur.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Comparison */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-out"
                  style={{
                    opacity: getStepOpacity(2),
                    transform: getStepTransform(2),
                  }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-white mb-3 bg-orange-600 px-8 py-4 rounded-2xl inline-block">
                      Show the Difference
                    </h2>
                    <p className="text-lg text-orange-500 font-medium">
                      Highlight key benefits and make the choice clear
                    </p>
                  </div>
                  <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-orange-200/50 max-w-6xl w-full">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left p-4 font-bold text-lg">
                              Features
                            </th>
                            <th className="text-center p-4 font-bold text-lg text-blue-600">
                              Basic Model
                            </th>
                            <th className="text-center p-4 font-bold text-lg text-orange-600 border-l-2 border-r-2 border-orange-300">
                              Premium
                            </th>
                            <th className="text-center p-4 font-bold text-lg text-green-600">
                              Pro Version
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100">
                            <td className="p-4 font-semibold">Price</td>
                            <td className="p-4 text-center text-2xl font-bold text-blue-600">
                              $89
                            </td>
                            <td className="p-4 text-center text-2xl font-bold text-orange-600 border-l-2 border-r-2 border-orange-300">
                              $199
                            </td>
                            <td className="p-4 text-center text-2xl font-bold text-green-600">
                              $299
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="p-4 font-semibold">Battery Life</td>
                            <td className="p-4 text-center">6 hours</td>
                            <td className="p-4 text-center border-l-2 border-r-2 border-orange-300">
                              12 hours
                            </td>
                            <td className="p-4 text-center">24 hours</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="p-4 font-semibold">
                              Noise Cancellation
                            </td>
                            <td className="p-4 text-center">❌</td>
                            <td className="p-4 text-center border-l-2 border-r-2 border-orange-300">
                              ✅
                            </td>
                            <td className="p-4 text-center">✅</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="p-4 font-semibold">
                              Water Resistance
                            </td>
                            <td className="p-4 text-center">IPX4</td>
                            <td className="p-4 text-center border-l-2 border-r-2 border-orange-300">
                              IPX7
                            </td>
                            <td className="p-4 text-center">IPX8</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="p-4 font-semibold">Warranty</td>
                            <td className="p-4 text-center">1 year</td>
                            <td className="p-4 text-center border-l-2 border-r-2 border-orange-300">
                              2 years
                            </td>
                            <td className="p-4 text-center">3 years</td>
                          </tr>
                          <tr className="bg-orange-50">
                            <td className="p-4 font-semibold">AI Features</td>
                            <td className="p-4 text-center text-sm text-gray-500">
                              Lorem ipsum dolor sit amet
                            </td>
                            <td className="p-4 text-center text-sm text-orange-600 font-semibold border-l-2 border-r-2 border-orange-300">
                              Smart recommendations
                            </td>
                            <td className="p-4 text-center text-sm text-gray-500">
                              Ut enim ad minim veniam
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-6 text-center">
                      <div className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-lg font-semibold">
                        ⭐ Premium Recommended - Best Value
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Purchase */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-out"
                  style={{
                    opacity: getStepOpacity(3),
                    transform: getStepTransform(3),
                  }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-white mb-3 bg-orange-600 px-8 py-4 rounded-2xl inline-block">
                      Close with Confidence
                    </h2>
                    <p className="text-lg text-orange-500 font-medium">
                      Turn interest into a successful purchase
                    </p>
                  </div>
                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-orange-200/50 max-w-md w-full">
                    <div className="text-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <div className="text-white text-lg">✓</div>
                      </div>
                      <h3 className="text-xl font-bold text-green-600 mb-1">
                        Order Confirmed!
                      </h3>
                      <p className="text-xs text-gray-600">
                        Thank you for your purchase
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <h4 className="font-bold text-base mb-2 text-center">
                        Order Summary
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center py-1 border-b border-gray-200">
                          <span className="font-medium text-xs">
                            Premium Headphones
                          </span>
                          <span className="font-bold text-orange-600 text-sm">
                            $199.00
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-200">
                          <span className="font-medium text-xs">Shipping</span>
                          <span className="font-bold text-green-600 text-sm">
                            FREE
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-200">
                          <span className="font-medium text-xs">Tax</span>
                          <span className="font-bold text-sm">$16.92</span>
                        </div>
                        <div className="flex justify-between items-center py-1 pt-1">
                          <span className="font-bold text-base">Total</span>
                          <span className="font-bold text-lg text-orange-600">
                            $215.92
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 mb-3">
                      <div className="bg-blue-50 rounded-md p-2 border border-blue-200">
                        <h5 className="font-semibold text-blue-800 mb-1 text-xs">
                          Shipping Address
                        </h5>
                        <div className="text-xs text-gray-700 leading-tight">
                          <div>John Doe</div>
                          <div>123 Main Street</div>
                          <div>Apt 4B</div>
                          <div>New York, NY 10001</div>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-md p-2 border border-green-200">
                        <h5 className="font-semibold text-green-800 mb-1 text-xs">
                          Estimated Delivery
                        </h5>
                        <div className="text-xs text-gray-700 leading-tight">
                          <div className="font-semibold text-green-600">
                            2-3 Business Days
                          </div>
                          <div className="text-xs text-gray-500">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Sed do eiusmod tempor incididunt ut labore.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-md font-semibold text-xs">
                        🎉 You're all set! Check your email for confirmation.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Big Avatar */}
            <div className="flex justify-center lg:justify-start items-end h-[520px] w-full lg:col-span-1">
              <div className="w-full h-full flex items-end">
                <div className="relative w-full h-[480px] transform hover:scale-105 transition-transform duration-500">
                  {/* Step 1 Avatar */}
                  <img
                    src="/images/benefit-1-driven-sales-pipeline-1.png"
                    alt="Sales Pipeline Step 1 Avatar"
                    className={`w-full h-full object-contain object-bottom drop-shadow-2xl transition-all duration-700 ${
                      progress < PROGRESS_THRESHOLD_STEP_2
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-75"
                    }`}
                  />

                  {/* Step 2 Avatar */}
                  <img
                    src="/images/benefit-1-driven-sales-pipeline-2.png"
                    alt="Sales Pipeline Step 2 Avatar"
                    className={`w-full h-full object-contain object-bottom drop-shadow-2xl absolute inset-0 transition-all duration-700 ${
                      progress >= PROGRESS_THRESHOLD_STEP_2 &&
                      progress < PROGRESS_THRESHOLD_STEP_3
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-75"
                    }`}
                  />

                  {/* Step 3 Avatar */}
                  <img
                    src="/images/benefit-1-driven-sales-pipeline-3.png"
                    alt="Sales Pipeline Step 3 Avatar"
                    className={`w-full h-full object-contain object-bottom drop-shadow-2xl absolute inset-0 transition-all duration-700 ${
                      progress >= PROGRESS_THRESHOLD_STEP_3
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-75"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectScrollSalesFlow;
