import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen studio-lighting-base flex items-center overflow-hidden pt-16">
      {/* 3D Studio Lighting System */}
      <div className="absolute inset-0 studio-radial-light" />
      <div className="absolute inset-0 studio-horizon-shadow" />
      <div className="absolute inset-0 studio-horizon-meniscus-left" />
      <div className="absolute inset-0 studio-horizon-meniscus-right" />
      <div className="absolute inset-0 studio-floor-shadow" />
      <div className="absolute inset-0 studio-ambient-overlay" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-white leading-tight">
                Your Store's Digital
                <span className="block text-white/90">Salesperson</span>
              </h1>
              <p className="text-xl lg:text-2xl text-white/80 font-body max-w-2xl">
                Greet every visitor, guide them to the right products, and close more sales—just like the best in-store experience.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group">
                Try Free for 14 Days
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="xl"
                className="group bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Integration Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div className="bg-white rounded-2xl p-4 border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm" />
                  </div>
                  <div>
                    <div className="text-gray-900 font-heading font-semibold text-sm">
                      Available on Shopify App Store
                    </div>
                    <div className="text-gray-600 font-body text-xs">
                      Plug & Play • Instantly synced with your catalog
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm" />
                  </div>
                  <div>
                    <div className="text-gray-900 font-heading font-semibold text-sm">
                      Custom Website Integration
                    </div>
                    <div className="text-gray-600 font-body text-xs">
                      Tailored setup • Schedule a call
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative lg:pl-8">
            {/* Main Image - Made bigger */}
            <div className="relative z-10">
              <img
                src="/lovable-uploads/badd07ac-0944-4a30-937f-128b9286a875.png"
                alt="Digital salesperson helping customers"
                className="w-full h-auto max-w-2xl mx-auto"
              />
            </div>

            {/* Floating elements - positioned to not overlap */}
            <div className="absolute -top-6 -right-6 w-16 lg:w-24 h-16 lg:h-24 bg-white/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-6 lg:-bottom-10 -left-6 lg:-left-10 w-20 lg:w-32 h-20 lg:h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-300" />

            {/* Stats floating cards - positioned in hero near the image */}
            <div className="absolute top-8 lg:top-12 -left-8 lg:-left-12 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-brand animate-bounce z-20">
              <div className="text-lg lg:text-2xl font-bold text-primary font-heading">
                24/7
              </div>
              <div className="text-xs lg:text-sm text-gray-600 font-body">
                Always Available
              </div>
            </div>

            <div className="absolute bottom-16 lg:bottom-20 -right-8 lg:-right-12 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-brand animate-bounce delay-200 z-20">
              <div className="text-lg lg:text-2xl font-bold text-primary font-heading">
                +47%
              </div>
              <div className="text-xs lg:text-sm text-gray-600 font-body">
                Sales Increase
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
