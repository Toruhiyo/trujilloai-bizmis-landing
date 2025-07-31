import { ShoppingBag, Globe } from "lucide-react";

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
                Your Store's New
                <span className="block text-white/90">Digital Salesperson</span>
              </h1>
              <p className="text-xl lg:text-2xl text-white/80 font-body max-w-2xl">
                Give your online store the personal touch of a real salesperson. Your assistant welcomes visitors, guides them to the right products, and helps them buy with confidence.
              </p>
            </div>

            {/* App Store Style Badges */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-white/20 transition-all duration-300 shadow-lg">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs text-white/70 font-body uppercase tracking-wide">
                    Get it on
                  </div>
                  <div className="text-lg font-heading font-bold text-white">
                    Shopify App Store
                  </div>
                  <div className="text-xs text-white/60 font-body">
                    Plug & play · Instant catalog sync
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-white/20 transition-all duration-300 shadow-lg">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs text-white/70 font-body uppercase tracking-wide">
                    Integrate via
                  </div>
                  <div className="text-lg font-heading font-bold text-white">
                    Custom Website Setup
                  </div>
                  <div className="text-xs text-white/60 font-body">
                    Tailored deployment · Schedule a call
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
