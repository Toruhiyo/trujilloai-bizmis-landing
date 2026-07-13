import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";
import { FaShopify } from "react-icons/fa";
import { usePostHog } from "posthog-js/react";
import {
  BIZMIS_DEMO_STORE_URL,
  BIZMIS_SHOPIFY_APP_LISTING_URL,
  openBizmisCustomIntegrationCall,
  openBizmisDemoStore,
  openBizmisShopifyAppListing,
} from "@/lib/bizmisUrls";
import Navbar from "./Navbar";

const Hero = () => {
  const posthog = usePostHog();

  const handleCustomWebsitesClick = () => {
    posthog.capture("cta_clicked", {
      cta_type: "custom_websites",
      location: "hero",
    });
    openBizmisCustomIntegrationCall();
  };

  const handleShopifyInstallClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisShopifyAppListing();
    posthog.capture("cta_clicked", {
      cta_type: "get_started",
      location: "hero",
    });
  };

  const handleViewDemoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisDemoStore();
    posthog.capture("cta_clicked", {
      cta_type: "view_demo",
      location: "hero",
    });
  };

  const handleEarlyAccessClick = () => {
    posthog.capture("cta_clicked", {
      cta_type: "early_access",
      location: "hero",
    });
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
            <div className="flex justify-center">
              <a
                href="/early-access"
                onClick={handleEarlyAccessClick}
                className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-white/[0.10] hover:text-white sm:text-sm"
              >
                <span className="relative flex h-1.5 w-1.5 flex-shrink-0" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-50" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white/80" />
                </span>
                <span className="font-medium">
                  <span className="text-white/90">Early Access</span>
                  <span className="text-white/45" aria-hidden="true"> · </span>
                  <span className="text-white/70">First 50 stores</span>
                </span>
                <ArrowRight
                  className="h-3 w-3 text-white/45 transition-transform group-hover:translate-x-0.5 group-hover:text-white/65"
                  aria-hidden="true"
                />
              </a>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-4xl xs:text-5xl sm:text-6xl font-heading font-bold text-white leading-tight">
                Boost Profits,
                <span className="block text-white/90">
                  Selling The Human Way
                </span>
              </h1>
              <p className="text-sm sm:text-base text-white/80 font-body max-w-xl mx-auto">
                <span className="font-semibold">This isn't a chatbot.</span>{" "}
                {/* Tighter pitch on phones; full version reads at sm+. */}
                <span className="sm:hidden">
                  Bizmis welcomes shoppers, answers questions, and guides them
                  to buy — like your best in-store salesperson, 24/7.
                </span>
                <span className="hidden sm:inline">
                  Bizmis speaks naturally—welcoming your customers, answering
                  their questions, and guiding them to buy with confidence, just
                  like the best in-store salesperson would.
                </span>
              </p>
            </div>

            <div className="space-y-3 w-full max-w-md mx-auto">
              <Button
                variant="hero"
                size="xl"
                asChild
                className="group flex items-center gap-3 xs:gap-3.5 sm:gap-4 h-14 xs:h-16 sm:h-[4.5rem] md:h-[4.75rem] px-4 xs:px-5 sm:px-6 md:px-7 text-base xs:text-lg sm:text-xl md:text-xl w-full [&_svg]:pointer-events-auto"
              >
                <a
                  href={BIZMIS_SHOPIFY_APP_LISTING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleShopifyInstallClick}
                >
                  <div className="flex-shrink-0">
                    <FaShopify className="!w-6 !h-6 xs:!w-7 xs:!h-7 sm:!w-8 sm:!h-8 md:!w-9 md:!h-9 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 text-center">
                    <div className="font-semibold text-base xs:text-lg sm:text-xl md:text-xl">
                      Install Now
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <ArrowRight className="!w-5 !h-5 xs:!w-5 xs:!h-5 sm:!w-6 sm:!h-6 md:!w-6 md:!h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-11 w-full border-white/25 bg-white/[0.06] text-sm font-medium text-white/90 hover:bg-white/15 hover:text-white xs:h-12 xs:text-base [&_svg]:pointer-events-auto"
              >
                <a
                  href={BIZMIS_DEMO_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleViewDemoClick}
                >
                  <PlayCircle
                    className="!h-4 !w-4 xs:!h-5 xs:!w-5"
                    aria-hidden="true"
                  />
                  Live Demo
                </a>
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
                <a
                  href="/early-access"
                  onClick={handleEarlyAccessClick}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-sm text-white/80 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-white/[0.10] hover:text-white"
                >
                  <span className="relative flex h-1.5 w-1.5 flex-shrink-0" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-50" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white/80" />
                  </span>
                  <span className="font-medium">
                    <span className="text-white/90">Early Access</span>
                    <span className="text-white/45" aria-hidden="true"> · </span>
                    <span className="text-white/70">Free for the first 50 Shopify stores</span>
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 text-white/45 transition-transform group-hover:translate-x-0.5 group-hover:text-white/65"
                    aria-hidden="true"
                  />
                </a>
                <h1 className="text-[clamp(3rem,6.7vh,4.5rem)] font-heading font-bold text-white leading-[1.0]">
                  Boost Profits,
                  <span className="block text-white/90">
                    Selling The Human Way
                  </span>
                </h1>
                <p className="text-[clamp(1.125rem,2.2vh,1.5rem)] text-white/80 font-body max-w-2xl">
                  <span className="font-semibold">This isn't a chatbot.</span>{" "}
                  Bizmis speaks naturally—welcoming your customers, answering
                  their questions, and guiding them to buy with confidence, just
                  like the best in-store salesperson would.
                </p>
              </div>

              <div className="space-y-4 w-fit">
                <div className="flex items-stretch gap-5">
                  <Button
                    variant="hero"
                    size="xl"
                    asChild
                    className="group flex items-center gap-4 h-20 px-8 text-lg [&_svg]:!w-8 [&_svg]:!h-8 [&_svg]:pointer-events-auto"
                  >
                    <a
                      href={BIZMIS_SHOPIFY_APP_LISTING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleShopifyInstallClick}
                    >
                      <div className="flex-shrink-0">
                        <FaShopify className="w-9 h-9 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-semibold">Install Now</div>
                        <div className="text-sm opacity-80">
                          One-click install, ready in minutes
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </a>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="h-20 border-white/30 bg-white/10 px-6 text-lg text-white hover:bg-white/20 hover:text-white [&_svg]:pointer-events-auto"
                  >
                    <a
                      href={BIZMIS_DEMO_STORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleViewDemoClick}
                    >
                      <PlayCircle className="!h-5 !w-5" aria-hidden="true" />
                      Live Demo
                    </a>
                  </Button>
                </div>

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
