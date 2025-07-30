import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-hero-gradient flex items-center overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-light/20 to-primary/30" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-white leading-tight">
                Meet Your Store's
                <span className="block text-white/90">AI Assistant</span>
              </h1>
              <p className="text-xl lg:text-2xl text-white/80 font-medium max-w-2xl">
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
            
            <div className="flex items-center gap-6 text-white/70">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">No setup required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
            </div>
          </div>
          
          {/* Right Content - Image */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative z-10">
              <img 
                src="/lovable-uploads/bbc58d58-bc0f-4feb-9429-2124e5641b09.png" 
                alt="Bizmis AI Assistants - Sales, Support, and Analytics team"
                className="w-full h-auto max-w-lg mx-auto drop-shadow-2xl"
              />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-300" />
            
            {/* Stats floating cards */}
            <div className="absolute top-8 -left-8 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-brand animate-bounce">
              <div className="text-2xl font-bold text-primary">+47%</div>
              <div className="text-sm text-gray-600">Sales Increase</div>
            </div>
            
            <div className="absolute bottom-16 -right-8 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-brand animate-bounce delay-200">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-gray-600">AI Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;