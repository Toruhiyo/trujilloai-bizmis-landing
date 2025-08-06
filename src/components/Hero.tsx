import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { FaShopify } from "react-icons/fa";
import Navbar from "./Navbar";

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen studio-lighting-base flex items-center overflow-hidden"
    >
      {/* 3D Studio Lighting System */}
      <div className="absolute inset-0 studio-radial-light" />
      <div className="absolute inset-0 studio-horizon-shadow" />
      <div className="absolute inset-0 studio-horizon-meniscus-left" />
      <div className="absolute inset-0 studio-horizon-meniscus-right" />
      <div className="absolute inset-0 studio-floor-shadow" />
      <div className="absolute inset-0 studio-ambient-overlay" />

      {/* Navbar positioned within hero */}
      <Navbar />

      <div className="container mx-auto px-6 relative z-10 pt-16">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-white leading-tight">
                Sell Online,
                <span className="block text-white/90">The Human Way</span>
              </h1>
              <p className="text-xl lg:text-2xl text-white/80 font-body max-w-2xl">
                This isn't a chatbot. Bizmis speaks naturally—welcoming your
                customers, answering their questions, and guiding them to buy
                with confidence, just like the best in-store salesperson would.
              </p>
            </div>

            <div className="space-y-4 w-fit">
              <Button
                variant="hero"
                size="xl"
                className="group flex items-center gap-4 h-20 px-8 text-lg [&_svg]:!w-8 [&_svg]:!h-8 w-full"
              >
                <div className="flex-shrink-0">
                  <FaShopify className="w-8 h-8 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-semibold">
                    <span className="font-black">Get Started Free</span> on
                    Shopify
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
                <Button
                  variant="outline"
                  size="lg"
                  className="group bg-white/10 border-white/30 text-white hover:bg-white/20 [&_svg]:!w-5 [&_svg]:!h-5 flex-shrink-0"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Button>

                <span className="text-white/70 text-sm text-center sm:text-left flex-1 min-w-0">
                  Also available for{" "}
                  <button className="text-white/80 hover:text-white underline underline-offset-2 transition-colors">
                    custom websites
                  </button>
                </span>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative lg:pl-8">
            {/* Main Image - Made bigger */}
            <div className="relative z-10">
              <img
                src="/images/hero-3-avatars-no-shadow.png"
                alt="Digital sales assistant helping customers"
                className="w-full h-auto max-w-2xl mx-auto"
              />
            </div>

            {/* Floating elements - positioned to not overlap */}
            <div className="absolute -top-6 -right-6 w-16 lg:w-24 h-16 lg:h-24 bg-white/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-6 lg:-bottom-10 -left-6 lg:-left-10 w-20 lg:w-32 h-20 lg:h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-300" />

            {/* Stats floating cards - positioned in hero near the image */}
            {/* <div className="absolute top-8 lg:top-12 -left-8 lg:-left-12 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-brand animate-bounce z-20">
                              <div className="text-lg lg:text-2xl font-bold text-orange-600 font-heading">
                  24/7
                </div>
              <div className="text-xs lg:text-sm text-gray-600 font-body">
                Always Ready
              </div>
            </div>

            <div className="absolute bottom-16 lg:bottom-20 -right-8 lg:-right-12 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-brand animate-bounce delay-200 z-20">
                              <div className="text-lg lg:text-2xl font-bold text-orange-600 font-heading">
                  +47%
                </div>
              <div className="text-xs lg:text-sm text-gray-600 font-body">
                Sales Increase
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
