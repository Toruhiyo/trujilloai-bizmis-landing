import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const BizmisHero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: "var(--bizmis-gradient)" }}>
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-white leading-tight">
                Turn visitors into customers with a real-store shopping experience
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 font-body max-w-2xl">
                Bizmis engages your customers, guides their choices, and helps them buy — just like an in-store expert would. Ready from day one.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="xl"
                className="group bg-white text-primary hover:bg-white/90 font-semibold text-lg px-8 py-4 rounded-xl shadow-2xl"
              >
                Get Bizmis on Your Store
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform ml-2" />
              </Button>
            </div>

            <p className="text-white/80 text-sm">
              Available now on the Shopify App Store
            </p>
          </div>

          {/* Right Content - Placeholder for image */}
          <div className="relative lg:pl-8">
            <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 min-h-[400px] flex items-center justify-center">
              <div className="text-center text-white/70">
                <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🛍️</span>
                </div>
                <p className="font-medium">Bizmis Voice Assistant</p>
                <p className="text-sm opacity-80">Image placeholder</p>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-300" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BizmisHero;