import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-hero-gradient flex items-center overflow-hidden pt-16">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-light/20 to-primary/30" />
      
      {/* Soft horizon shadow for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/10 via-black/5 to-transparent" />
      
      {/* Decorative Avatar Placeholders - Responsive */}
      <div className="absolute top-16 left-4 lg:left-8 w-16 lg:w-20 h-16 lg:h-20 bg-white/20 rounded-full blur-sm animate-pulse" 
           title="Placeholder for cute 3D avatar - Happy Customer browsing" />
      <div className="absolute top-32 lg:top-40 right-8 lg:right-16 w-12 lg:w-16 h-12 lg:h-16 bg-white/15 rounded-full blur-sm animate-pulse delay-200" 
           title="Placeholder for cute 3D avatar - Sales Assistant helping" />
      <div className="absolute bottom-32 lg:bottom-40 left-8 lg:left-16 w-14 lg:w-18 h-14 lg:h-18 bg-white/10 rounded-full blur-sm animate-pulse delay-500" 
           title="Placeholder for cute 3D avatar - Support Representative" />
      <div className="absolute bottom-16 lg:bottom-24 right-12 lg:right-24 w-10 lg:w-14 h-10 lg:h-14 bg-white/25 rounded-full blur-sm animate-pulse delay-700" 
           title="Placeholder for cute 3D avatar - Analytics Expert" />
      
      {/* Descriptive Avatar Placeholders - Responsive */}
      <div className="absolute top-48 lg:top-64 left-8 lg:left-32 w-24 lg:w-32 h-14 lg:h-16 bg-white/30 border-2 border-dashed border-white/50 rounded-lg flex items-center justify-center animate-pulse delay-1000">
        <span className="text-xs text-white font-body text-center px-1 lg:px-2">Store Owner Avatar</span>
      </div>
      <div className="absolute bottom-48 lg:bottom-64 right-4 lg:right-8 w-24 lg:w-28 h-14 lg:h-16 bg-white/20 border-2 border-dashed border-white/40 rounded-lg flex items-center justify-center animate-pulse delay-1200">
        <span className="text-xs text-white font-body text-center px-1 lg:px-2">Satisfied Customer Avatar</span>
      </div>
      
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
                Transform your e-commerce with cute 3D AI assistants that boost sales, 
                provide 24/7 support, and understand your customers.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="xl" 
                className="group"
              >
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
            
            <div className="grid grid-cols-2 gap-6 max-w-md">
              <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-2xl p-4 border border-green-400/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <div>
                    <div className="text-white font-heading font-semibold text-sm">Instant Setup</div>
                    <div className="text-white/70 font-body text-xs">Ready in minutes</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-4 border border-blue-400/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                  <div>
                    <div className="text-white font-heading font-semibold text-sm">Always Online</div>
                    <div className="text-white/70 font-body text-xs">24/7 assistance</div>
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
              <div className="text-lg lg:text-2xl font-bold text-primary font-heading">+47%</div>
              <div className="text-xs lg:text-sm text-gray-600 font-body">Sales Increase</div>
            </div>
            
            <div className="absolute bottom-16 lg:bottom-20 -right-8 lg:-right-12 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-brand animate-bounce delay-200 z-20">
              <div className="text-lg lg:text-2xl font-bold text-primary font-heading">24/7</div>
              <div className="text-xs lg:text-sm text-gray-600 font-body">AI Support</div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;