import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Code } from "lucide-react";
import { FaShopify } from "react-icons/fa";

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
                Meet Your Store's
                <span className="block text-white/90">AI Assistant</span>
              </h1>
              <p className="text-xl lg:text-2xl text-white/80 font-body max-w-2xl">
                Transform your e-commerce with cute 3D AI assistants that boost
                sales, provide 24/7 support, and understand your customers.
              </p>
            </div>

            {/* Primary Shopify CTA and Secondary Video Button */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
              {/* Primary Shopify App Store CTA */}
              <div className="bg-white rounded-2xl px-8 py-6 flex items-center gap-5 hover:bg-white/95 transition-colors cursor-pointer group flex-1 min-h-[100px] shadow-xl">
                <div className="flex-shrink-0">
                  <FaShopify className="w-14 h-14 text-[#95BF47]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-700 text-sm font-medium tracking-wide mb-1">
                    Start free on
                  </div>
                  <div className="text-gray-900 font-heading font-bold text-2xl leading-tight">
                    Shopify App Store
                  </div>
                  <div className="text-gray-600 text-sm mt-1 font-medium">
                    Install in 2 clicks • Free trial
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Secondary Video Button */}
              <Button
                variant="outline"
                size="xl"
                className="group bg-white/10 border-white/30 text-white hover:bg-white/20 sm:w-auto w-full"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Discrete Custom Website Option */}
            <div className="text-center">
              <p className="text-white/60 text-sm">
                Need custom integration? 
                <button className="text-white/80 hover:text-white underline underline-offset-2 ml-1 transition-colors">
                  Contact us
                </button>
              </p>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative lg:pl-8">
            {/* Main Image - Made bigger */}
            <div className="relative z-10">
              <img
                src="/lovable-uploads/badd07ac-0944-4a30-937f-128b9286a875.png"
                alt="AI Assistant team - Support, Sales, and Analytics avatars"
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
                AI Support
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
