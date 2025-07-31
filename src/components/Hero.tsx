import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Code } from "lucide-react";

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

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group">
                Get Started Free
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

            {/* App Store Style Integration Badges - Bigger & Square */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
              {/* Shopify App Store Badge */}
              <div className="bg-transparent border-2 border-white/90 rounded-2xl px-6 py-5 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group flex-1 min-h-[90px]">
                <div className="flex-shrink-0">
                  {/* Shopify Icon SVG */}
                  <svg
                    className="w-12 h-12 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M15.337 2.265c-.07-.02-.14-.01-.2.01-.011 0-.37.12-.94.33-.346-.994-1.015-1.435-1.015-1.435l-.04-.03c-.09-.07-.21-.098-.32-.063-.011.003-.28.09-.7.23-1.26-1.613-2.79-1.578-2.79-1.578-5.18.29-7.605 3.906-8.467 5.945-.616 1.46-.863 2.687-.863 2.687-.56.15-2.88.75-2.93.78-.45.13-.47.15-.52.56C.005 10.25 0 18.62 0 18.62l13.76 2.38 7.26-1.6s-5.59-17.058-5.683-17.135zM6.24 7.1c-.48.13-.87.23-.87.23v-.63c0-.48-.04-.97-.15-1.39.36-.14.79-.27 1.02-.3 0 0 0 1.49 0 2.09zM8.55 6.6c0 .23-.01.45-.02.66 0 .18-.01.36-.02.53L7.5 7.46c0-.01 0-1.94 0-1.94.45-.08.91-.16 1.05-.18 0 .43 0 1.26 0 1.26zm1.75-.3c.17-.04.31-.07.31-.07V7.9l-.95.25s.01-.65.01-.98.01-.57.01-.57c.21-.03.42-.06.62-.1zm-1.4-2.77c.31-.1.7-.22 1.15-.35.01.33.03.68.03 1.05 0 .05 0 .1 0 .15-.37.08-.7.15-1.18.23v-1.08zm1.46-.4c.68-.2 1.47-.42 2.25-.63v.04c0 .32-.03.64-.08.95-.33.08-.66.16-1.01.24-.4.09-.78.18-1.16.27V3.13zm2.56-.7c.02 0 .05-.01.08-.01-.28.73-.46 1.44-.57 2.13-.48.12-.96.23-1.44.35 0-.37-.01-.74-.02-1.08-.01-.45-.02-.87-.01-1.25.66-.18 1.3-.33 1.96-.47z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-light tracking-wide mb-1 opacity-90">
                    Available on the
                  </div>
                  <div className="text-white font-heading font-bold text-xl leading-tight">
                    Shopify App Store
                  </div>
                  <div className="text-white/80 text-xs mt-1">
                    One-click install, ready in minutes
                  </div>
                </div>
              </div>

              {/* Custom Website Badge */}
              <div className="bg-transparent border-2 border-white/90 rounded-2xl px-6 py-5 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group flex-1 min-h-[90px]">
                <div className="flex-shrink-0">
                  <Code className="w-12 h-12 text-white stroke-2" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-light tracking-wide mb-1 opacity-90">
                    Get it for your
                  </div>
                  <div className="text-white font-heading font-bold text-xl leading-tight">
                    Custom Website
                  </div>
                  <div className="text-white/80 text-xs mt-1">
                    Tailored integration & setup
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
