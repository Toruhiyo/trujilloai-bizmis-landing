import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  MessageCircle,
  TrendingUp,
  Zap,
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
  Headphones,
  Activity,
  Eye,
  Handshake,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Reusable Benefit Badge Component
const BenefitBadge = ({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className: string }>;
  text: string;
}) => (
  <div className="inline-flex items-center gap-3 bg-primary/10 rounded-full px-6 py-3 mb-6">
    <Icon className="w-5 h-5 text-primary" />
    <span className="text-primary font-medium">{text}</span>
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
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-primary/20 text-center max-w-md">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-3">
                  Smart Discovery
                </h3>
                <div className="text-lg font-semibold mb-2">
                  Premium Headphones
                </div>
                <div className="text-primary font-medium">
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
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-primary/20 text-center max-w-lg">
                <h3 className="text-2xl font-bold text-primary mb-6">
                  Smart Comparison
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="font-semibold">Basic Model</div>
                    <div className="text-xl font-bold text-gray-600">$149</div>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-xl ring-2 ring-primary">
                    <div className="font-semibold text-primary">Premium</div>
                    <div className="text-xl font-bold text-primary">$199</div>
                    <div className="text-xs text-primary">⭐ Recommended</div>
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
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-primary/20 text-center max-w-md relative overflow-hidden">
                <div
                  className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 ${
                    cartAnimation
                      ? "bg-green-100 ring-4 ring-green-300 scale-110"
                      : "bg-primary/20"
                  }`}
                >
                  <ShoppingCart
                    className={`w-12 h-12 transition-colors duration-500 ${
                      cartAnimation ? "text-green-600" : "text-primary"
                    }`}
                  />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-3">
                  Purchase Complete!
                </h3>
                <div className="text-green-600 font-medium">
                  Added to cart successfully
                </div>

                {/* Celebration particles */}
                {cartAnimation && (
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-primary rounded-full animate-ping"
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
    <div className="space-y-0 bg-gradient-to-b from-background via-primary/2 to-background">
      {/* Main Benefit: Increase Sales Conversion with Drive Sales Feature */}
      <section
        id="benefits"
        className="relative py-20 bg-gradient-to-br from-primary/15 via-primary/8 to-primary/4 overflow-hidden"
      >
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-primary-light rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Integrated Benefit Header */}
            <div className="text-center max-w-5xl mx-auto mb-20">
              <BenefitBadge
                icon={({ className }: { className: string }) => (
                  <div className="flex items-center gap-1">
                    <ShoppingCart className={className} />
                    <ArrowUp className="w-4 h-4 text-primary" strokeWidth={3} />
                  </div>
                )}
                text="Primary Benefit"
              />
              <h1 className="text-5xl lg:text-7xl font-heading font-bold text-foreground mb-8">
                Increase Sales Conversion
              </h1>
              <p className="text-xl text-muted-foreground font-body leading-relaxed mb-16">
                Shoppers feel personally guided—finding the right product fast
                and checking out with confidence.
              </p>
            </div>

            {/* Drive Sales Feature */}
            <div className="text-left mb-16">
              <div className="flex items-start gap-8 mb-12">
                <div className="flex-shrink-0 mt-2">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-primary/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <ShoppingBag className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-8">
                    <span className="text-primary">Driven Sales Pipeline</span>
                  </h3>
                  <div className="border-l-2 border-primary/20 pl-4 py-2">
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

            {/* Main Layout: Scroll-jacked Flow Left, Avatar Right */}
            <div className="relative">
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
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 w-8 h-0.5 bg-gradient-to-l from-primary/60 to-transparent rounded-full hidden lg:block"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefit 1: Customization - Making Users Feel Closer */}
      <section
        id="benefit-1"
        className="relative py-24 bg-gradient-to-bl from-primary-light/4 to-primary/6 overflow-hidden mt-0"
      >
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-10 right-10 w-48 h-48 bg-primary-light rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-56 h-56 bg-primary rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Customization Feature */}
            <div className="text-left mb-16 lg:text-right">
              <div className="flex items-start gap-8 mb-12 lg:flex-row-reverse">
                <div className="flex-shrink-0 mt-2">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-primary-light/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                    <Users className="w-8 h-8 text-primary-light" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-8">
                    <span className="text-primary-light">
                      Voice & Appearance Customization
                    </span>
                  </h3>
                  <div className="border-l-2 border-primary-light/20 pl-4 py-2">
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

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Right: Features */}
              <div className="space-y-8 order-2 lg:order-2">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-primary/20 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-primary" />
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
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-primary" />
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
                <div className="bg-gradient-to-br from-primary/30 to-primary-light/40 rounded-3xl aspect-[4/3] flex items-center justify-center transform rotate-1 hover:rotate-0 transition-transform duration-500 border-2 border-primary/30 shadow-2xl">
                  <div className="text-center space-y-6 p-8">
                    <Users className="w-40 h-40 text-primary mx-auto" />
                    <div className="space-y-3">
                      <div className="text-primary-dark font-heading font-bold text-2xl">
                        Personalization Hub
                      </div>
                      <div className="text-primary/70 text-base max-w-sm mx-auto">
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
        className="relative py-24 bg-gradient-to-r from-primary-dark/5 to-primary/5 overflow-hidden mt-16"
      >
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            {/* Image Side */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-gradient-to-br from-primary-light/30 to-primary/30 rounded-3xl aspect-square flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="text-center space-y-4 transform -rotate-3">
                  <MessageCircle className="w-32 h-32 text-primary mx-auto" />
                  <div className="text-primary-dark font-heading font-bold text-lg">
                    24/7 Support Interface
                  </div>
                  <div className="text-primary/70 text-sm">
                    [Image placeholder: Chat interface with customer
                    conversations]
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 bg-white rounded-full p-4 shadow-lg">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-4 shadow-lg">
                <Heart className="w-6 h-6 text-primary" />
              </div>
            </div>

            {/* Content Side */}
            <div className="order-1 lg:order-2 space-y-8">
              <div className="space-y-4">
                <BenefitBadge icon={MessageCircle} text="Customer Support" />
                <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground">
                  24/7 Human-Feel Support
                </h2>
                <p className="text-xl text-muted-foreground font-body leading-relaxed">
                  Questions answered instantly, any hour, in a voice that feels
                  genuinely helpful.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">
                      Always online, never waiting
                    </h3>
                    <p className="text-muted-foreground font-body">
                      No waiting times, no business hours — your assistant is
                      ready to help customers whenever they need it.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">
                      Warm, conversational replies
                    </h3>
                    <p className="text-muted-foreground font-body">
                      Responds with genuine warmth and understanding, making
                      customers feel heard and valued.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground mb-1">
                      Reassurance during checkout
                    </h3>
                    <p className="text-muted-foreground font-body">
                      Guides customers through concerns and decision-making with
                      patience and expertise.
                    </p>
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
        className="py-24 bg-gradient-to-tr from-primary/8 via-background to-primary-light/12 relative overflow-hidden"
      >
        {/* Chaotic Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary-light rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-primary-dark rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-primary font-medium mb-4">
                <Activity className="w-5 h-5" />
                Store Insights
              </div>
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
                Understand & Improve Your Store
              </h2>
              <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
                See what customers do, say, and need—then fine-tune your shop
                with real insights.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left: Features */}
              <div className="space-y-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-primary/10 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <Play className="w-6 h-6 text-primary" />
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

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-primary/10 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <Tag className="w-6 h-6 text-primary" />
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

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-primary/10 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <BarChart3 className="w-6 h-6 text-primary" />
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
                <div className="bg-gradient-to-br from-primary/20 to-primary-light/30 rounded-3xl aspect-[4/3] flex items-center justify-center border-2 border-primary/30 transform -rotate-1 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                  <div className="text-center space-y-6 p-8">
                    <Activity className="w-32 h-32 text-primary mx-auto" />
                    <div className="space-y-3">
                      <div className="text-primary-dark font-heading font-bold text-2xl">
                        Analytics Dashboard
                      </div>
                      <div className="text-primary/70 text-base max-w-md mx-auto">
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

      {/* Benefit 4: Integration - Side-by-Side Showcase */}
      <section className="py-24 bg-gradient-to-r from-primary/5 via-background to-primary-light/10 border-t border-primary/10">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <BenefitBadge icon={Zap} text="Integration Options" />
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
                Choose Your Integration Path
              </h2>
              <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
                Choose the integration that works best for your store setup.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Shopify Integration */}
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/10 to-primary-light/20 rounded-3xl p-8 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 group">
                  <div className="absolute -top-4 left-8 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                    Recommended
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-heading font-bold text-foreground">
                        Shopify App Store
                      </h3>
                      <p className="text-primary">One-click installation</p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    Install Bizmis directly from the Shopify App Store.
                    One-click setup, no coding required.
                  </p>

                  <div className="space-y-3 mb-8">
                    {[
                      "1-click install",
                      "Catalog and store data auto-synced",
                      "Ready instantly",
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center text-muted-foreground"
                      >
                        <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                        <span className="font-body">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-primary/5 rounded-2xl p-6 mb-6">
                    <div className="text-center text-primary/60 text-sm">
                      [Shopify app store integration mockup]
                    </div>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary-dark text-white">
                    Get it on Shopify
                  </Button>
                </div>
              </div>

              {/* Custom Integration */}
              <div className="bg-gradient-to-br from-primary-light/10 to-primary/10 rounded-3xl p-8 border border-primary/20 hover:border-primary/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-light to-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Headphones className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-foreground">
                      Custom Website
                    </h3>
                    <p className="text-primary">Tailored integration</p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Tailored integration for your unique website. We assess and
                  customize everything to fit perfectly.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    "Tailor-made setup",
                    "Custom assessment",
                    "Schedule a discovery call",
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center text-muted-foreground"
                    >
                      <div className="w-2 h-2 bg-primary-light rounded-full mr-3" />
                      <span className="font-body">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/5 rounded-2xl p-6 mb-6">
                  <div className="text-center text-primary/60 text-sm">
                    [Custom integration process diagram]
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Schedule a Call
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ValueShowcase;
