import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-hero-gradient flex items-center overflow-hidden pt-16">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-light/20 to-primary/30" />
      
      {/* Decorative Avatar Placeholders - Scattered throughout */}
      <div className="absolute top-16 left-8 w-20 h-20 bg-white/20 rounded-full blur-sm animate-pulse" 
           title="Placeholder for cute 3D avatar - Happy Customer browsing" />
      <div className="absolute top-40 right-16 w-16 h-16 bg-white/15 rounded-full blur-sm animate-pulse delay-200" 
           title="Placeholder for cute 3D avatar - Sales Assistant helping" />
      <div className="absolute bottom-40 left-16 w-18 h-18 bg-white/10 rounded-full blur-sm animate-pulse delay-500" 
           title="Placeholder for cute 3D avatar - Support Representative" />
      <div className="absolute bottom-24 right-24 w-14 h-14 bg-white/25 rounded-full blur-sm animate-pulse delay-700" 
           title="Placeholder for cute 3D avatar - Analytics Expert" />
      <div className="absolute top-64 left-32 w-12 h-12 bg-white/30 rounded-full blur-sm animate-pulse delay-1000" 
           title="Placeholder for cute 3D avatar - Store Owner" />
      <div className="absolute bottom-64 right-8 w-10 h-10 bg-white/20 rounded-full blur-sm animate-pulse delay-1200" 
           title="Placeholder for cute 3D avatar - Satisfied Customer" />
      
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
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-white font-body">No setup required</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-white font-body">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Image */}
          <div className="relative lg:pl-8">
            {/* Main Image - Made bigger */}
            <div className="relative z-10">
              <img 
                src="/lovable-uploads/bbc58d58-bc0f-4feb-9429-2124e5641b09.png" 
                alt="Bizmis AI Assistants - Sales, Support, and Analytics team"
                className="w-full h-auto max-w-2xl mx-auto drop-shadow-2xl"
              />
            </div>
            
            {/* Floating elements - positioned to not overlap */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-300" />
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;