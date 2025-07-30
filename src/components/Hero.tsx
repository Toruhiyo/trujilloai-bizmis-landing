import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-sky flex items-center overflow-hidden pt-16">
      {/* Whimsical floating elements - Hot air balloons style */}
      <div className="absolute top-20 left-8 w-24 h-32 bg-gradient-to-b from-pink-300 to-pink-400 rounded-full opacity-60 animate-pulse" 
           title="Placeholder: Hot air balloon with 3D avatar - Support Assistant" />
      <div className="absolute top-32 right-12 w-20 h-28 bg-gradient-to-b from-blue-300 to-blue-400 rounded-full opacity-50 animate-pulse delay-300" 
           title="Placeholder: Hot air balloon with 3D avatar - Sales Assistant" />
      <div className="absolute bottom-40 left-16 w-18 h-24 bg-gradient-to-b from-green-300 to-green-400 rounded-full opacity-40 animate-pulse delay-700" 
           title="Placeholder: Hot air balloon with 3D avatar - Analytics Expert" />
      
      {/* Floating cute avatar cards */}
      <div className="absolute top-64 left-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-float animate-bounce">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full mb-2 border-4 border-white" 
             title="Placeholder: 3D Support Avatar" />
        <div className="text-xs font-semibold text-center">Support Specialist</div>
      </div>
      
      <div className="absolute bottom-64 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-float animate-bounce delay-500">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full mb-2 border-4 border-white" 
             title="Placeholder: 3D Sales Avatar" />
        <div className="text-xs font-semibold text-center">Sales Expert</div>
      </div>
      
      {/* Cloud-like decorative elements */}
      <div className="absolute top-24 left-1/3 w-32 h-16 bg-white/30 rounded-full blur-sm opacity-60" />
      <div className="absolute top-16 right-1/4 w-24 h-12 bg-white/20 rounded-full blur-sm opacity-50" />
      <div className="absolute bottom-32 left-1/4 w-28 h-14 bg-white/25 rounded-full blur-sm opacity-40" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-foreground leading-tight">
                Your Store's
                <span className="block text-primary">Cute AI Team</span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground font-body max-w-2xl">
                Deploy delightful 3D AI assistants that float around your store, 
                helping customers and boosting sales with personality.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-float"
              >
                Deploy Your AI Team
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="group border-primary/30 text-primary hover:bg-primary/5"
              >
                <Play className="w-5 h-5" />
                See Them in Action
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-accent-pink/30 shadow-soft">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent-pink rounded-full animate-pulse" />
                  <div>
                    <div className="text-sm font-semibold">Instant Deploy</div>
                    <div className="text-xs text-muted-foreground">5 minutes</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-accent-blue/30 shadow-soft">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
                  <div>
                    <div className="text-sm font-semibold">Always Active</div>
                    <div className="text-xs text-muted-foreground">24/7 online</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-accent-green/30 shadow-soft">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent-green rounded-full animate-pulse" />
                  <div>
                    <div className="text-sm font-semibold">Smart & Cute</div>
                    <div className="text-xs text-muted-foreground">Loved by all</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Illustrated Scene */}
          <div className="relative lg:pl-8">
            {/* Large illustration placeholder */}
            <div className="relative z-10 bg-white/20 border-2 border-dashed border-primary/30 rounded-3xl p-8 min-h-[500px] flex flex-col items-center justify-center backdrop-blur-sm">
              <div className="text-center space-y-4 mb-8">
                <div className="text-lg font-heading font-semibold text-primary">Main Illustration Placeholder</div>
                <div className="text-sm text-muted-foreground max-w-xs">
                  Whimsical scene with 3D avatars floating around a virtual store, 
                  helping customers and showing analytics
                </div>
              </div>
              
              {/* Avatars in the scene */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full mx-auto mb-2 border-4 border-white shadow-soft" 
                       title="3D Support Avatar" />
                  <div className="text-xs font-medium">Maya</div>
                  <div className="text-xs text-muted-foreground">Support</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full mx-auto mb-2 border-4 border-white shadow-soft" 
                       title="3D Sales Avatar" />
                  <div className="text-xs font-medium">Alex</div>
                  <div className="text-xs text-muted-foreground">Sales</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-300 to-green-400 rounded-full mx-auto mb-2 border-4 border-white shadow-soft" 
                       title="3D Analytics Avatar" />
                  <div className="text-xs font-medium">Sam</div>
                  <div className="text-xs text-muted-foreground">Analytics</div>
                </div>
              </div>
            </div>
            
            {/* Floating stats cards */}
            <div className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-float animate-bounce z-20">
              <div className="text-2xl font-bold text-primary font-heading">+47%</div>
              <div className="text-xs text-muted-foreground">Sales Boost</div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-float animate-bounce delay-200 z-20">
              <div className="text-2xl font-bold text-secondary font-heading">98%</div>
              <div className="text-xs text-muted-foreground">Happy Customers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;