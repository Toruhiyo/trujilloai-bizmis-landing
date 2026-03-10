import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { FaShopify } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { usePostHog } from "posthog-js/react";
import Navbar from "./Navbar";

const Hero = () => {
  const navigate = useNavigate();
  const posthog = usePostHog();

  const handleCustomWebsitesClick = () => {
    posthog.capture("cta_clicked", {
      cta_type: "custom_websites",
      location: "hero",
    });
    navigate("/contact?subject=Bizmis%20Website%20Integration");
  };

  const handleGetStartedClick = () => {
    posthog.capture("cta_clicked", {
      cta_type: "get_started",
      location: "hero",
    });
    navigate("/pricing");
  };
  return (
    <section
      id="hero"
      className="relative min-h-screen lg:h-screen studio-lighting-base flex flex-col overflow-hidden"
    >
      {/* 3D Studio Lighting System */}
      <div className="absolute inset-0 studio-radial-light" />
      <div className="absolute inset-0 studio-horizon-shadow" />
      <div className="absolute inset-0 studio-horizon-meniscus-left" />
      <div className="absolute inset-0 studio-horizon-meniscus-right" />
      <div className="absolute inset-0 studio-floor-shadow" />
      <div className="absolute inset-0 studio-ambient-overlay" />

      {/* Noise grain overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-[1] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="hero-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.50"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#hero-noise)"
          opacity="0.40"
        />
      </svg>

      {/* Navbar positioned within hero */}
      <Navbar />

      {/* Mobile Layout - Text above image */}
      <div className="lg:hidden flex-1 flex flex-col relative z-10 pt-24 sm:pt-32 pb-4">
        {/* Text Content - Top Section with proper spacing */}
        <div className="flex-shrink-0 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-4xl xs:text-5xl sm:text-6xl font-heading font-bold text-white ">
                Boost Profits,
                <span className="block text-white/90">
                  Selling The Human Way
                </span>
              </h1>
              <p className="text-sm sm:text-base text-white/80 font-body max-w-xl mx-auto">
                <span className="font-semibold">This isn't a chatbot.</span>{" "}
                Bizmis speaks naturally—welcoming your
                customers, answering their questions, and guiding them to buy
                with confidence, just like the best in-store salesperson would.
              </p>
            </div>

            <div className="space-y-2 w-full max-w-md mx-auto">
              <Button
                variant="hero"
                size="xl"
                onClick={handleGetStartedClick}
                className="group flex items-center gap-3 h-12 sm:h-14 px-4 sm:px-6 text-sm sm:text-base [&_svg]:!w-5 [&_svg]:!h-5 sm:[&_svg]:!w-6 sm:[&_svg]:!h-6 w-full"
              >
                <div className="flex-shrink-0">
                  <FaShopify className="w-6 h-6 sm:w-7 sm:h-7 text-[#FD912A]" />
                </div>
                <div className="flex-1 min-w-0 text-center">
                  <div className="font-semibold text-xs sm:text-sm">
                    <span className="font-black">Get Started</span> on Shopify
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>

              <div className="flex flex-col gap-2 items-center w-full">
                <span className="text-white/70 text-xs text-center">
                  Also available for{" "}
                  <button
                    onClick={handleCustomWebsitesClick}
                    className="text-white/80 hover:text-white underline underline-offset-2 transition-colors"
                  >
                    custom websites
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image Container - Takes all remaining space */}
        <div className="flex flex-1 items-center justify-center min-h-0 px-4 sm:px-6">
          <div className="relative w-full h-full max-h-[50vh] flex items-center justify-center">
            <img
              src="/images/hero-avatar-1.png"
              alt="Digital sales assistant helping customers"
              className="max-w-full max-h-[-webkit-fill-available] h-auto w-auto object-contain object-center z-10"
            />

            {/* Avatar Floor Shadow - scaled with image */}
            <div className="absolute left-1/2 transform -translate-x-[50%] w-[20vh] h-[23%] avatar-floor-shadow z-0 bottom-0" />

            {/* Floating elements - scaled with image */}
            <div className="absolute top-[10%] right-[5%] w-[8%] h-[8%] bg-white/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-[20%] left-[5%] w-[10%] h-[10%] bg-white/10 rounded-full blur-2xl animate-pulse delay-300" />
          </div>
        </div>
      </div>

      {/* Desktop Layout - Side by side */}
      <div className="hidden lg:flex flex-1 items-center relative z-10">
        <div className="container mx-auto px-4 sm:px-6 overflow-visible">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 items-center">
            {/* Left Content */}
            <div className="space-y-[clamp(1.5rem,3vh,2rem)] text-left">
              <div className="space-y-[clamp(0.75rem,1.5vh,1rem)]">
                <h1 className="text-[clamp(3rem,6.7vh,4.5rem)] font-heading font-bold text-white leading-[1.0]">
                  Boost Profits,
                  <span className="block text-white/90">
                    Selling The Human Way
                  </span>
                </h1>
                <p className="text-[clamp(1.125rem,2.2vh,1.5rem)] text-white/80 font-body max-w-2xl">
                  <span className="font-semibold">This isn't a chatbot.</span>{" "}
                  Bizmis speaks naturally—welcoming your
                  customers, answering their questions, and guiding them to buy
                  with confidence, just like the best in-store salesperson
                  would.
                </p>
              </div>

              <div className="space-y-4 w-fit">
                <Button
                  variant="hero"
                  size="xl"
                  onClick={handleGetStartedClick}
                  className="group flex items-center gap-4 h-20 px-8 text-lg [&_svg]:!w-8 [&_svg]:!h-8 w-full"
                >
                  <div className="flex-shrink-0">
                    <FaShopify className="w-9 h-9 text-[#FD912A]" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-semibold">
                      <span className="font-black">Get Started</span> on Shopify
                    </div>
                    <div className="text-sm opacity-80">
                      One-click install, ready in minutes
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Button>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full">
                  <span className="text-white/70 text-sm text-center sm:text-left flex-1 min-w-0">
                    Also available for{" "}
                    <button
                      onClick={handleCustomWebsitesClick}
                      className="text-white/80 hover:text-white underline underline-offset-2 transition-colors"
                    >
                      custom websites
                    </button>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Content - Image */}
            <div className="relative lg:pl-8 pb-16 overflow-visible">
              {/* Main Image - Made bigger */}
              <div className="relative z-10">
                <img
                  src="/images/hero-avatar-1.png"
                  alt="Digital sales assistant helping customers"
                  className="w-auto h-auto max-w-full max-h-[calc(100vh-10rem)] mx-auto z-10"
                />
              </div>

              {/* Avatar Floor Shadow - positioned at the feet of the avatar */}
              <div className="absolute left-1/2 transform -translate-x-[45%] w-[800px] max-w-[100%] h-[80px] avatar-floor-shadow z-0 bottom-[6.5rem]" />

              {/* Floating elements - positioned to not overlap */}
              <div className="absolute -top-6 -right-6 w-16 lg:w-24 h-16 lg:h-24 bg-white/20 rounded-full blur-xl animate-pulse" />
              <div className="absolute -bottom-6 lg:-bottom-10 -left-6 lg:-left-10 w-20 lg:w-32 h-20 lg:h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-300" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
