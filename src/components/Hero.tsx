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

      {/* Decorative Avatar Placeholders - Responsive */}
      <div
        className="absolute top-16 left-4 lg:left-8 w-16 lg:w-20 h-16 lg:h-20 bg-white/20 rounded-full blur-sm animate-pulse"
        title="Placeholder for cute 3D avatar - Happy Customer browsing"
      />
      <div
        className="absolute top-32 lg:top-40 right-8 lg:right-16 w-12 lg:w-16 h-12 lg:h-16 bg-white/15 rounded-full blur-sm animate-pulse delay-200"
        title="Placeholder for cute 3D avatar - Sales Assistant helping"
      />
      <div
        className="absolute bottom-32 lg:bottom-40 left-8 lg:left-16 w-14 lg:w-18 h-14 lg:h-18 bg-white/10 rounded-full blur-sm animate-pulse delay-500"
        title="Placeholder for cute 3D avatar - Support Representative"
      />
      <div
        className="absolute bottom-16 lg:bottom-24 right-12 lg:right-24 w-10 lg:w-14 h-10 lg:h-14 bg-white/25 rounded-full blur-sm animate-pulse delay-700"
        title="Placeholder for cute 3D avatar - Analytics Expert"
      />

      {/* Descriptive Avatar Placeholders - Responsive */}
      <div className="absolute top-48 lg:top-64 left-8 lg:left-32 w-24 lg:w-32 h-14 lg:h-16 bg-white/30 border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center animate-pulse delay-1000">
        <span className="text-xs text-white font-body text-center px-1 lg:px-2">
          Store Owner Avatar
        </span>
      </div>
      <div className="absolute bottom-48 lg:bottom-64 right-4 lg:right-8 w-24 lg:w-28 h-14 lg:h-16 bg-white/20 border-2 border-dashed border-white/40 rounded-lg flex items-center justify-center animate-pulse delay-1200">
        <span className="text-xs text-white font-body text-center px-1 lg:px-2">
          Satisfied Customer Avatar
        </span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-white leading-tight">
                Turn Browsers Into
                <span className="block text-white/90">Buyers</span>
              </h1>
              <p className="text-xl lg:text-2xl text-white/80 font-body max-w-2xl leading-relaxed">
                Your store's new digital salesperson welcomes visitors, guides them through products, and closes sales — just like your best in-store team member.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group">
                Start Selling More
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="xl"
                className="group bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Play className="w-5 h-5" />
                See It In Action
              </Button>
            </div>

            {/* Integration Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-brand">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <h3 className="text-foreground font-heading font-bold text-lg">Shopify Store</h3>
                  </div>
                  <div>
                    <div className="text-foreground/80 font-body text-sm font-semibold mb-1">
                      Install and go
                    </div>
                    <div className="text-muted-foreground font-body text-xs">
                      Automatic catalog sync • No setup • Active from day 1
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-brand">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">C</span>
                    </div>
                    <h3 className="text-foreground font-heading font-bold text-lg">Custom Website</h3>
                  </div>
                  <div>
                    <div className="text-foreground/80 font-body text-sm font-semibold mb-1">
                      Tailor-made integration
                    </div>
                    <div className="text-muted-foreground font-body text-xs">
                      Schedule a call for custom setup
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
                alt="Your store's new digital salesperson helping customers"
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
                Always Selling
              </div>
            </div>

            <div className="absolute bottom-16 lg:bottom-20 -right-8 lg:-right-12 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-brand animate-bounce delay-200 z-20">
              <div className="text-lg lg:text-2xl font-bold text-primary font-heading">
                +47%
              </div>
              <div className="text-xs lg:text-sm text-gray-600 font-body">
                Sales Boost
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
