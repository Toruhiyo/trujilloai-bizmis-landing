import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const BizmisHero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* 3D Studio Background */}
      <div className="absolute inset-0 studio-lighting-base">
        <div className="absolute inset-0 studio-radial-light" />
        <div className="absolute inset-0 studio-floor-shadow" />
        <div className="absolute inset-0 studio-horizon-shadow" />
        <div className="absolute inset-0 studio-horizon-meniscus-left" />
        <div className="absolute inset-0 studio-horizon-meniscus-right" />
        <div className="absolute inset-0 studio-ambient-overlay" />
      </div>

      <div className="container mx-auto px-6 relative z-10 h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-foreground leading-tight">
                Turn visitors into customers with a real-store shopping experience
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl">
                Bizmis engages your customers, guides their choices, and helps them buy — just like an in-store expert would. Ready from day one.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="xl"
                className="group shadow-brand text-lg px-8 py-4 bg-primary hover:bg-primary-dark transition-all duration-300"
              >
                Get Bizmis on Your Store
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="xl"
                className="text-lg px-8 py-4 border-2 border-muted-foreground/30 hover:border-primary hover:bg-secondary transition-all duration-300"
              >
                See How It Works
              </Button>
            </div>
            
            <p className="text-muted-foreground text-sm">
              Available now on the Shopify App Store
            </p>
          </div>

          {/* Right Content - Hero Image Placeholder */}
          <div className="relative">
            <div className="aspect-square bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-brand">
              <div className="text-center p-8">
                <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl text-white/80">🗣️</span>
                </div>
                <p className="text-white/90 text-lg font-medium">
                  Hero Image Placeholder
                </p>
                <p className="text-white/70 text-sm mt-2">
                  Replace with provided Bizmis image
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BizmisHero;