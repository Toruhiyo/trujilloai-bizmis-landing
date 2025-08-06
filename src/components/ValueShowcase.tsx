import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  MessageCircle,
  TrendingUp,
  ArrowUp,
  Clock,
  Heart,
  Shield,
  Play,
  Tag,
  BarChart3,
  Users,
  ShoppingBag,
  MessageSquare,
  Activity,
  Eye,
  Handshake,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionBadge from "./SectionBadge";
import Integration from "./Integration";

// Reusable Benefit Badge Component
const BenefitBadge = ({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className: string }>;
  text: string;
}) => (
  <div className="inline-flex items-center gap-3 bg-amber-100/50 rounded-full px-6 py-3 mb-6">
    <Icon className="w-5 h-5 text-orange-600" />
    <span className="text-orange-600 font-medium">{text}</span>
  </div>
);

// Direct Scroll-Linked Sales Flow - Animation Tightened to Scroll Position
const DirectScrollSalesFlow = () => {
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cartAnimation, setCartAnimation] = useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const currentProgress = React.useRef(0);
  const isScrolling = React.useRef(false);
  const scrollVelocity = React.useRef(0);

  // Master scroll controller
  useEffect(() => {
    let isInZone = false;

    const handleInput = (delta: number) => {
      if (!isInZone) return false;

      scrollVelocity.current = delta;
      const sensitivity = 0.001; // Optimized for direct scroll response

      // Cap delta to prevent huge jumps from high-speed scrolling
      const cappedDelta = Math.sign(delta) * Math.min(Math.abs(delta), 150);

      // Calculate what the new progress would be
      let newProgress = currentProgress.current + cappedDelta * sensitivity;

      // Check if we're at boundaries AND trying to exit in that direction
      const atTopBoundary = currentProgress.current <= 0;
      const atBottomBoundary = currentProgress.current >= 1;
      const scrollingUp = delta < 0; // Use original delta for direction
      const scrollingDown = delta > 0;

      // Only allow scroll unlock when at boundary trying to go further in that direction
      if (
        (atTopBoundary && scrollingUp) ||
        (atBottomBoundary && scrollingDown)
      ) {
        setIsActive(false);
        return false; // Allow normal scroll to resume
      }

      // Otherwise, we're in the animation zone - ALWAYS lock scroll
      setIsActive(true);

      // Clamp progress to boundaries
      newProgress = Math.max(0, Math.min(1, newProgress));

      // Update progress IMMEDIATELY - no interpolation
      currentProgress.current = newProgress;
      setProgress(newProgress);

      // Update CSS custom property for hardware acceleration
      if (viewportRef.current) {
        viewportRef.current.style.setProperty(
          "--scroll-progress",
          newProgress.toString()
        );
      }

      return true; // Prevent normal scroll
    };

    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      // More generous zone detection - starts when container enters viewport
      const inViewport =
        rect.top <= window.innerHeight * 0.5 &&
        rect.bottom >= window.innerHeight * 0.5;
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
      // Same consistent zone detection as wheel handler
      const inViewport =
        rect.top <= window.innerHeight * 0.5 &&
        rect.bottom >= window.innerHeight * 0.5;
      isInZone = inViewport;

      const touchY = e.touches[0].clientY;
      const delta = (touchStartY - touchY) * 2.5; // Touch sensitivity for immediate response
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
    if (progress > 0.75) {
      const interval = setInterval(() => {
        setCartAnimation(true);
        setTimeout(() => setCartAnimation(false), 1500);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [progress]);

  const getStepProgress = (stepIndex: number) => {
    const stepStart = stepIndex / 3;
    const stepEnd = (stepIndex + 1) / 3;
    const localProgress = Math.max(
      0,
      Math.min(1, (progress - stepStart) / (stepEnd - stepStart))
    );
    return localProgress;
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        ref={viewportRef}
        className="sticky top-0 h-[420px] flex items-center justify-center transition-all duration-300"
        style={{ "--scroll-progress": progress } as React.CSSProperties}
      >
        {/* Sales Steps Flow */}
        <div className="w-full max-w-2xl mx-auto px-6">
          <div className="relative h-[420px]">
            {/* Step 1: Discovery */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out"
              style={{
                opacity:
                  progress < 0.33 ? 1 : Math.max(0, 1 - (progress - 0.33) * 5),
                transform: `translateY(${
                  progress < 0.33 ? 0 : -50 * (progress - 0.33)
                }px) scale(${
                  progress < 0.33 ? 1 : Math.max(0.8, 1 - (progress - 0.33))
                })`,
              }}
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-orange-200/50 text-center max-w-md">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-orange-600 mb-3">
                  Smart Discovery
                </h3>
                <div className="text-lg font-semibold mb-2">
                  Premium Headphones
                </div>
                <div className="text-orange-600 font-medium">
                  $199 → Perfect Match!
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  AI finds exactly what you need
                </div>
              </div>
            </div>

            {/* Step 2: Comparison */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out"
              style={{
                opacity: progress >= 0.33 && progress < 0.66 ? 1 : 0,
                transform: `translateY(${
                  progress >= 0.33 && progress < 0.66 ? 0 : 30
                }px) scale(${progress >= 0.33 && progress < 0.66 ? 1 : 0.9})`,
              }}
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-orange-200/50 text-center max-w-lg">
                <h3 className="text-2xl font-bold text-orange-600 mb-6">
                  Smart Comparison
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="font-semibold">Basic Model</div>
                    <div className="text-xl font-bold text-gray-600">$149</div>
                  </div>
                  <div className="p-4 bg-amber-100 rounded-xl ring-2 ring-orange-500">
                    <div className="font-semibold text-orange-600">Premium</div>
                    <div className="text-xl font-bold text-orange-600">
                      $199
                    </div>
                    <div className="text-xs text-orange-600">
                      ⭐ Recommended
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  AI explains the difference
                </div>
              </div>
            </div>

            {/* Step 3: Purchase */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out"
              style={{
                opacity: progress >= 0.66 ? 1 : 0,
                transform: `translateY(${progress >= 0.66 ? 0 : 30}px) scale(${
                  progress >= 0.66 ? 1 : 0.9
                })`,
              }}
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-orange-200/50 text-center max-w-md relative overflow-hidden">
                <div
                  className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 ${
                    cartAnimation
                      ? "bg-amber-100 ring-4 ring-orange-300 scale-110"
                      : "bg-amber-100"
                  }`}
                >
                  <ShoppingCart
                    className={`w-12 h-12 transition-colors duration-500 ${
                      cartAnimation ? "text-orange-600" : "text-orange-600"
                    }`}
                  />
                </div>
                <h3 className="text-2xl font-bold text-orange-600 mb-3">
                  Purchase Complete!
                </h3>
                <div className="text-orange-600 font-medium">
                  Added to cart successfully
                </div>

                {/* Celebration particles */}
                {cartAnimation && (
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 8 }).map((_, i) => (
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
                    ))}
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

const ValueShowcase = () => {
  return (
    <div className="space-y-0 bg-gradient-to-b from-background via-orange-50/10 to-background">
      {/* Shared Background Section: Driven Sales & Customization */}
      <section className="relative py-20 overflow-hidden">
        {/* Modern Shared Background Design - Single background for both sections */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20"></div>

        {/* Geometric Background Elements */}
        <div className="absolute inset-0">
          {/* Large floating shapes */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-amber-200/15 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-orange-300/15 to-yellow-300/10 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>

          {/* Floating accent elements */}
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-orange-400/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-amber-500/40 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-2/3 left-1/4 w-1.5 h-1.5 bg-orange-300/25 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Section 1: Main Benefit Header */}
            <div className="text-center max-w-5xl mx-auto mb-20">
              <div className="relative">
                <div className="absolute -left-64  top-10 text-9xl lg:text-[12rem] font-bold text-orange-600/20 transform -rotate-12 select-none">
                  #1
                </div>
                <SectionBadge icon={ShoppingCart} text="Increase Sales" />
                <h1 className="text-5xl lg:text-7xl font-heading font-bold text-foreground mb-8 relative z-10">
                  Increase Sales Conversion
                </h1>
              </div>
              <p className="text-xl text-muted-foreground font-body leading-relaxed mb-16">
                Shoppers feel personally guided—finding the right product fast
                and checking out with confidence.
              </p>
            </div>

            {/* Section 2: Drive Sales Feature */}
            <div className="text-left mb-16">
              <div className="flex items-start gap-8 mb-12">
                <div className="flex-shrink-0 mt-2">
                  <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-orange-200/50 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <ShoppingBag className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-8">
                    <span className="text-orange-600">
                      Driven Sales Pipeline
                    </span>
                  </h3>
                  <div className="border-l-2 border-orange-200/50 pl-4 py-2">
                    <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                      <span className="font-semibold">
                        Expert-level selling skills
                      </span>{" "}
                      that turn casual browsers into{" "}
                      <span className="font-semibold">confident buyers</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Main Layout - Scroll-jacked Flow Left, Avatar Right */}
            <div className="relative mb-32">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Left Side - Direct Scroll-Linked Sales Flow */}
                <div className="w-full">
                  <DirectScrollSalesFlow />
                </div>

                {/* Right Side - Bigger Avatar */}
                <div className="flex justify-center lg:justify-start items-center">
                  <div className="sticky top-32">
                    <div className="relative transform hover:scale-105 transition-transform duration-500">
                      <img
                        src="/images/benefit-increase-sales-driven-sales-1.png"
                        alt="Sales Assistant Avatar"
                        className="w-80 h-80 lg:w-[420px] lg:h-[420px] object-contain drop-shadow-2xl"
                      />
                    </div>

                    {/* Connection Line to Flow */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 w-8 h-0.5 bg-gradient-to-l from-orange-400/60 to-transparent rounded-full hidden lg:block"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Customization Feature */}
            <div className="text-left mb-16 lg:text-right">
              <div className="flex items-start gap-8 mb-12 lg:flex-row-reverse">
                <div className="flex-shrink-0 mt-2">
                  <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-orange-200/50 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                    <Users className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-8">
                    <span className="text-orange-600">
                      Voice & Appearance Customization
                    </span>
                  </h3>
                  <div className="border-l-2 border-orange-200/50 pl-4 py-2">
                    <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                      Build{" "}
                      <span className="font-semibold">
                        authentic relationships
                      </span>{" "}
                      that drive{" "}
                      <span className="font-semibold">customer loyalty</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Customization Layout */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Right: Features */}
              <div className="space-y-8 order-2 lg:order-2">
                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 border border-orange-200/30 transform -rotate-1 hover:rotate-0 transition-transform duration-500 shadow-xl">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-200/50">
                        <Users className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold text-foreground mb-1">
                          Personal Avatar
                        </h4>
                        <p className="text-muted-foreground font-body text-sm">
                          Creating genuine connections by making your sales
                          representative sound and look like you.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-200/50">
                        <MessageSquare className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold text-foreground mb-1">
                          Voice Cloning
                        </h4>
                        <p className="text-muted-foreground font-body text-sm">
                          Authentic customer interactions through replication of
                          your unique speaking style and personality.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Left: Customization Image */}
              <div className="relative order-1 lg:order-1">
                <div className="bg-gradient-to-br from-orange-100/80 to-amber-100/60 backdrop-blur-sm rounded-3xl aspect-[4/3] flex items-center justify-center transform rotate-1 hover:rotate-0 transition-transform duration-500 border border-orange-200/50 shadow-2xl">
                  <div className="text-center space-y-6 p-8">
                    <Users className="w-40 h-40 text-orange-600 mx-auto" />
                    <div className="space-y-3">
                      <div className="text-orange-800 font-heading font-bold text-2xl">
                        Personalization Hub
                      </div>
                      <div className="text-orange-600/70 text-base max-w-sm mx-auto">
                        [Voice & appearance personalization interface]
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefit 2: Customer Support - Split Diagonal */}
      <section
        id="benefit-2"
        className="relative py-32 bg-gradient-to-r from-orange-50/20 to-amber-50/20 overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 bg-orange-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-200/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-20">
              <SectionBadge icon={MessageSquare} text="Customer Support" />
              <div className="relative">
                <div className="absolute -left-16 -top-16 text-8xl lg:text-9xl font-bold text-orange-600/25 transform rotate-6 select-none">
                  #2
                </div>
                <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 relative z-10 ml-14">
                  Support That Sells
                </h2>
              </div>
              <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
                Turn support conversations into sales opportunities with
                empathetic, knowledgeable assistance.
              </p>
            </div>

            {/* Split Layout */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left: Support Features */}
              <div className="space-y-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-orange-200/30 transform rotate-1 hover:rotate-0 transition-transform duration-500 shadow-xl">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-200/50">
                        <Heart className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold text-foreground mb-1">
                          Warm, conversational replies
                        </h4>
                        <p className="text-muted-foreground font-body text-sm">
                          Responds with genuine warmth and understanding, making
                          customers feel heard and valued.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-200/50">
                        <Shield className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold text-foreground mb-1">
                          Reassurance during checkout
                        </h4>
                        <p className="text-muted-foreground font-body text-sm">
                          Guides customers through concerns and decision-making
                          with patience and expertise.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Support Image */}
              <div className="relative">
                <div className="bg-gradient-to-br from-orange-100/60 to-amber-100/40 rounded-3xl aspect-[4/3] flex items-center justify-center transform -rotate-1 hover:rotate-0 transition-transform duration-500 border border-orange-200/30 shadow-2xl">
                  <div className="text-center space-y-6 p-8">
                    <MessageSquare className="w-40 h-40 text-orange-600 mx-auto" />
                    <div className="space-y-3">
                      <div className="text-orange-800 font-heading font-bold text-2xl">
                        Support Hub
                      </div>
                      <div className="text-orange-600/70 text-base max-w-sm mx-auto">
                        [Customer support conversation interface]
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefit 3: Store Insights - Chaotic Asymmetric Layout */}
      <section
        id="benefit-3"
        className="py-32 bg-gradient-to-tr from-orange-50/15 via-background to-amber-50/20 relative overflow-hidden"
      >
        {/* Chaotic Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-orange-400/15 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-20">
              <SectionBadge icon={Activity} text="Store Insights" />
              <div className="relative">
                <div className="absolute -left-16 -top-16 text-8xl lg:text-9xl font-bold text-orange-600/25 transform rotate-6 select-none">
                  #3
                </div>
                <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 relative z-10 ml-14">
                  Understand Customers. Sell Smarter.
                </h2>
              </div>
              <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
                See what customers do, say, and need—then fine-tune your shop
                with real insights.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-20 items-center">
              {/* Left: Features */}
              <div className="space-y-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <Play className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                        Session Replays
                      </h3>
                      <p className="text-muted-foreground font-body text-sm">
                        Watch how customers navigate and interact with your
                        assistant to identify improvement opportunities.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <Tag className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                        Auto-Tagged Chats
                      </h3>
                      <p className="text-muted-foreground font-body text-sm">
                        Automatically categorized customer interactions reveal
                        common questions and pain points.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100/50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <BarChart3 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                        Interaction Dashboard
                      </h3>
                      <p className="text-muted-foreground font-body text-sm">
                        Clear analytics showing customer behavior trends,
                        popular products, and conversion patterns.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Image - Large Single Image */}
              <div className="relative">
                <div className="bg-gradient-to-br from-orange-100/40 to-amber-100/50 rounded-3xl aspect-[4/3] flex items-center justify-center border-2 border-orange-200/50 transform rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl scale-110">
                  <div className="text-center space-y-6 p-8 transform -rotate-2">
                    <Activity className="w-40 h-40 text-orange-600 mx-auto" />
                    <div className="space-y-3">
                      <div className="text-orange-800 font-heading font-bold text-2xl">
                        Analytics Dashboard
                      </div>
                      <div className="text-orange-600/70 text-base max-w-md mx-auto">
                        [Image: Complete analytics dashboard showing session
                        replays, chat categorization, and interaction metrics in
                        one unified interface]
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Integration />
    </div>
  );
};

export default ValueShowcase;
