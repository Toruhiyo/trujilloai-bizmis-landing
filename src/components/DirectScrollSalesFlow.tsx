import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  ShoppingBag,
  Star,
  Check,
  X,
  Package,
  Truck,
  Shield,
  Zap,
  Users,
  Award,
  Search,
  GitCompare,
  Handshake,
  Weight,
  Ruler,
} from "lucide-react";

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
        ? "bg-primary border-primary text-primary-foreground"
        : "bg-background border-primary text-primary";
    }

    if (isStep2) {
      return progress >= PROGRESS_THRESHOLD_STEP_2 &&
        progress < PROGRESS_THRESHOLD_STEP_3
        ? "bg-primary border-primary text-primary-foreground"
        : progress >= PROGRESS_THRESHOLD_STEP_3
        ? "bg-background border-primary text-primary"
        : "bg-background border-primary text-primary";
    }

    if (isStep3) {
      return progress >= PROGRESS_THRESHOLD_STEP_3
        ? "bg-primary border-primary text-primary-foreground"
        : "bg-background border-primary text-primary";
    }

    return "";
  };

  const getProgressLineStyles = (lineIndex: number) => {
    if (lineIndex === 1) {
      return progress >= PROGRESS_THRESHOLD_STEP_2 ? "bg-primary" : "bg-muted";
    }
    if (lineIndex === 2) {
      return progress >= PROGRESS_THRESHOLD_STEP_3 ? "bg-primary" : "bg-muted";
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
                  {/* Floating Header Card */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-primary via-primary-light to-primary rounded-2xl p-4 shadow-2xl border-2 border-primary-foreground transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                          <Search className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-primary-foreground tracking-tight leading-none">
                            DISCOVER & RECOMMEND
                          </h2>
                          <p className="text-sm text-primary-foreground/80 font-medium mt-1">
                            Find the perfect match
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-background/95 backdrop-blur-xl rounded-3xl p-6 pt-20 shadow-2xl border border-muted max-w-5xl w-full mt-8">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Product A */}
                      <div className="bg-muted/50 rounded-2xl p-5 border border-border hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <div className="relative mb-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/40 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                            <Package className="w-10 h-10 text-muted-foreground" />
                          </div>
                          <div className="absolute -top-2 -right-2 bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-full">
                            A
                          </div>
                        </div>
                        <h4 className="font-bold text-lg mb-2 text-center">
                          Product A
                        </h4>
                        <div className="text-2xl font-bold text-muted-foreground mb-3 text-center">
                          $129
                        </div>
                        <div className="flex items-center justify-center mb-3">
                          {[...Array(3)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 text-primary fill-current"
                            />
                          ))}
                          {[...Array(2)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-muted" />
                          ))}
                          <span className="ml-2 text-xs text-muted-foreground">
                            (127)
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground text-center leading-relaxed">
                          Standard solution for everyday needs
                        </div>
                      </div>

                      {/* Product B - Recommended */}
                      <div className="bg-accent/70 rounded-2xl p-5 border-2 border-primary hover:shadow-xl transition-all duration-300 hover:scale-105 relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                          RECOMMENDED
                        </div>
                        <div className="relative mb-4 mt-2">
                          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/40 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                            <Zap className="w-10 h-10 text-primary" />
                          </div>
                          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                            B
                          </div>
                        </div>
                        <h4 className="font-bold text-lg mb-2 text-center">
                          Product B
                        </h4>
                        <div className="text-2xl font-bold text-primary mb-3 text-center">
                          $249
                        </div>
                        <div className="flex items-center justify-center mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 text-primary fill-current"
                            />
                          ))}
                          <span className="ml-2 text-xs text-primary">
                            (89)
                          </span>
                        </div>
                        <div className="text-sm text-primary/80 text-center leading-relaxed font-medium">
                          Optimized performance and features
                        </div>
                      </div>

                      {/* Product C */}
                      <div className="bg-muted/50 rounded-2xl p-5 border border-border hover:shadow-lg transition-all duration-300 hover:scale-105">
                        <div className="relative mb-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-secondary-foreground/20 to-secondary-foreground/40 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                            <Award className="w-10 h-10 text-secondary-foreground" />
                          </div>
                          <div className="absolute -top-2 -right-2 bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-full">
                            C
                          </div>
                        </div>
                        <h4 className="font-bold text-lg mb-2 text-center">
                          Product C
                        </h4>
                        <div className="text-2xl font-bold text-secondary-foreground mb-3 text-center">
                          $399
                        </div>
                        <div className="flex items-center justify-center mb-3">
                          {[...Array(4)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 text-primary fill-current"
                            />
                          ))}
                          {[...Array(1)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-muted" />
                          ))}
                          <span className="ml-2 text-xs text-muted-foreground">
                            (203)
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground text-center leading-relaxed">
                          Enterprise-grade with premium support
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
                  {/* Floating Header Card */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-primary via-primary-light to-primary rounded-2xl p-4 shadow-2xl border-2 border-primary-foreground transform rotate-1 hover:rotate-0 transition-transform duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                          <GitCompare className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-primary-foreground tracking-tight leading-none">
                            COMPARE OPTIONS
                          </h2>
                          <p className="text-sm text-primary-foreground/80 font-medium mt-1">
                            See the clear differences
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-background/95 backdrop-blur-xl rounded-2xl p-6 pt-20 shadow-2xl border border-muted max-w-4xl w-full mt-8">
                    <div className="grid grid-cols-4 gap-4">
                      {/* Feature Column */}
                      <div>
                        <div className="h-12 flex items-center justify-center mb-3">
                          <h3 className="font-bold text-base text-foreground">
                            Features
                          </h3>
                        </div>

                        <div className="space-y-3">
                          <div className="h-12 flex items-center gap-2 p-2 rounded-lg">
                            <span className="text-lg font-bold text-primary">
                              $
                            </span>
                            <span className="font-medium text-sm">Price</span>
                          </div>

                          <div className="h-12 flex items-center gap-2 p-2 rounded-lg">
                            <Star className="w-4 h-4 text-primary" />
                            <span className="font-medium text-sm">Quality</span>
                          </div>

                          <div className="h-12 flex items-center gap-2 p-2 rounded-lg">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="font-medium text-sm">
                              Features
                            </span>
                          </div>

                          <div className="h-12 flex items-center gap-2 p-2 rounded-lg">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="font-medium text-sm">
                              Durability
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Product A Column */}
                      <div>
                        <div className="h-12 bg-muted/50 rounded-xl flex items-center justify-center border border-border mb-3">
                          <span className="font-bold text-muted-foreground text-sm">
                            Product A
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="h-12 flex items-center justify-center p-2">
                            <div className="text-xl font-bold text-muted-foreground">
                              $89
                            </div>
                          </div>

                          <div className="h-12 flex items-center justify-center p-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              Standard
                            </div>
                          </div>

                          <div className="h-12 flex items-center justify-center p-2">
                            <div className="text-sm text-muted-foreground">
                              Basic
                            </div>
                          </div>

                          <div className="h-12 flex items-center justify-center p-2">
                            <div className="text-xs text-muted-foreground">
                              Good
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Product B Column - Recommended */}
                      <div className="relative">
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full z-10">
                          Recommended
                        </div>
                        <div className="h-12 bg-accent/70 rounded-xl flex items-center justify-center border-2 border-primary mb-3">
                          <span className="font-bold text-primary text-sm">
                            Product B
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="h-12 flex items-center justify-center p-2 bg-primary/10 rounded-lg">
                            <div className="text-xl font-bold text-primary">
                              $199
                            </div>
                          </div>

                          <div className="h-12 flex items-center justify-center p-2 bg-primary/10 rounded-lg">
                            <div className="text-sm font-medium text-primary">
                              Premium
                            </div>
                          </div>

                          <div className="h-12 flex items-center justify-center p-2 bg-primary/10 rounded-lg">
                            <div className="text-sm text-primary font-medium">
                              Advanced
                            </div>
                          </div>

                          <div className="h-12 flex items-center justify-center p-2 bg-primary/10 rounded-lg">
                            <div className="text-xs text-primary font-medium">
                              Excellent
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Product C Column */}
                      <div>
                        <div className="h-12 bg-muted/50 rounded-xl flex items-center justify-center border border-border mb-3">
                          <span className="font-bold text-secondary-foreground text-sm">
                            Product C
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="h-12 flex items-center justify-center p-2">
                            <div className="text-xl font-bold text-secondary-foreground">
                              $349
                            </div>
                          </div>

                          <div className="h-12 flex items-center justify-center p-2">
                            <div className="text-sm font-medium text-secondary-foreground">
                              Professional
                            </div>
                          </div>

                          <div className="h-12 flex items-center justify-center p-2">
                            <div className="text-sm text-secondary-foreground">
                              Premium
                            </div>
                          </div>

                          <div className="h-12 flex items-center justify-center p-2">
                            <div className="text-xs text-secondary-foreground">
                              Superior
                            </div>
                          </div>
                        </div>
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
                  {/* Floating Header Card */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-primary via-primary-light to-primary rounded-2xl p-4 shadow-2xl border-2 border-primary-foreground transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                          <Handshake className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-primary-foreground tracking-tight leading-none">
                            SEAL THE DEAL
                          </h2>
                          <p className="text-sm text-primary-foreground/80 font-medium mt-1">
                            Complete with confidence
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-background/95 backdrop-blur-xl rounded-2xl p-4 pt-20 shadow-2xl border border-muted max-w-sm w-full mt-8">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-2">
                        <Check className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h3 className="text-xl font-bold text-primary mb-1">
                        Order Confirmed!
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Thank you for your purchase
                      </p>
                    </div>

                    <div className="bg-muted rounded-lg p-3 mb-4">
                      <h4 className="font-bold text-base mb-2 text-center">
                        Order Summary
                      </h4>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center py-1 border-b border-border">
                          <span className="font-medium text-xs">Product B</span>
                          <span className="font-bold text-primary text-sm">
                            $199.00
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-border">
                          <span className="font-medium text-xs">Shipping</span>
                          <span className="font-bold text-primary text-sm">
                            FREE
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-border">
                          <span className="font-medium text-xs">Tax</span>
                          <span className="font-bold text-sm">$15.93</span>
                        </div>
                        <div className="flex justify-between items-center py-1 pt-1">
                          <span className="font-bold text-base">Total</span>
                          <span className="font-bold text-lg text-primary">
                            $214.93
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 mb-4">
                      <div className="bg-accent rounded-md p-2 border border-primary">
                        <h5 className="font-semibold text-primary mb-1 text-xs">
                          Delivery Information
                        </h5>
                        <div className="text-xs text-muted-foreground leading-tight">
                          <div>Customer Name</div>
                          <div>123 Main Street</div>
                          <div>New York, NY 10001</div>
                          <div className="font-semibold text-primary mt-1">
                            2-3 Business Days
                          </div>
                        </div>
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
