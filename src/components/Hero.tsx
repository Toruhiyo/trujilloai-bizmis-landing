import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-hero-gradient flex items-center overflow-hidden pt-16">
      {/* Background landscape with floating avatars */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-light/20 to-primary/30" />
      
      {/* Floating 3D Avatar Placeholders - Fly.io style */}
      <div className="absolute top-20 left-4 sm:left-8 lg:left-16 w-20 sm:w-24 lg:w-32 h-12 sm:h-14 lg:h-18 bg-white/90 border-2 border-dashed border-primary/50 rounded-xl flex items-center justify-center shadow-lg animate-bounce">
        <span className="text-xs sm:text-sm text-primary font-heading font-semibold text-center px-2">Flying Sales Avatar</span>
      </div>
      
      <div className="absolute top-32 sm:top-40 lg:top-48 right-4 sm:right-8 lg:right-20 w-16 sm:w-20 lg:w-24 h-10 sm:h-12 lg:h-14 bg-green-100 border-2 border-dashed border-green-500 rounded-lg flex items-center justify-center shadow-lg animate-pulse">
        <span className="text-xs text-green-700 font-body text-center px-1">Support Balloon</span>
      </div>
      
      <div className="absolute bottom-32 sm:bottom-40 lg:bottom-48 left-8 sm:left-12 lg:left-24 w-18 sm:w-22 lg:w-28 h-11 sm:h-13 lg:h-16 bg-blue-100 border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center shadow-lg animate-bounce delay-300">
        <span className="text-xs text-blue-700 font-body text-center px-2">Analytics Cloud</span>
      </div>
      
      <div className="absolute bottom-16 sm:bottom-20 lg:bottom-24 right-8 sm:right-12 lg:right-16 w-24 sm:w-28 lg:w-36 h-12 sm:h-14 lg:h-18 bg-purple-100 border-2 border-dashed border-purple-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse delay-500">
        <span className="text-xs text-purple-700 font-heading font-semibold text-center px-2">Customer Service Island</span>
      </div>
      
      {/* Mountain/Building-like structures with avatars */}
      <div className="absolute bottom-0 left-0 w-32 sm:w-40 lg:w-48 h-24 sm:h-28 lg:h-32 bg-gradient-to-t from-white/30 to-transparent rounded-t-3xl">
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 lg:w-24 h-8 sm:h-10 lg:h-12 bg-orange-100 border-2 border-dashed border-orange-500 rounded-lg flex items-center justify-center">
          <span className="text-xs text-orange-700 font-body text-center px-1">Store Avatar</span>
        </div>
      </div>
      
      <div className="absolute bottom-0 right-0 w-28 sm:w-36 lg:w-44 h-20 sm:h-24 lg:h-28 bg-gradient-to-t from-white/20 to-transparent rounded-t-2xl">
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-14 sm:w-18 lg:w-22 h-7 sm:h-9 lg:h-11 bg-pink-100 border-2 border-dashed border-pink-500 rounded-lg flex items-center justify-center">
          <span className="text-xs text-pink-700 font-body text-center px-1">Happy Customer</span>
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-white leading-tight">
                Meet Your Store's
                <span className="block text-white/90 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">AI Assistant Team</span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-white/80 font-body max-w-2xl leading-relaxed">
                Transform your e-commerce with cute 3D AI assistants that live in your store, 
                boost sales naturally, and create delightful customer experiences.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="xl" 
                className="group shadow-2xl"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="xl" 
                className="group bg-white/15 border-white/30 text-white hover:bg-white/25 backdrop-blur-sm shadow-xl"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>
            
            {/* Stats with integrated avatar placeholders */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-6 max-w-md">
                <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-2xl p-4 border border-green-400/30 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <div>
                      <div className="text-white font-heading font-semibold text-sm">Instant Setup</div>
                      <div className="text-white/70 font-body text-xs">Ready in minutes</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-4 border border-blue-400/30 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                    <div>
                      <div className="text-white font-heading font-semibold text-sm">Always Online</div>
                      <div className="text-white/70 font-body text-xs">24/7 assistance</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tiny floating avatars around stats */}
              <div className="absolute -top-4 -left-4 w-12 h-6 bg-yellow-100 border border-dashed border-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-xs text-yellow-700 font-body">Setup Assistant</span>
              </div>
              <div className="absolute -bottom-4 -right-4 w-10 h-5 bg-cyan-100 border border-dashed border-cyan-500 rounded-md flex items-center justify-center">
                <span className="text-xs text-cyan-700 font-body">24/7 Helper</span>
              </div>
            </div>
          </div>
          
          {/* Right Content - Main Team Image with floating elements */}
          <div className="relative lg:pl-8">
            {/* Main Team Image in a cloud-like container */}
            <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
              <img 
                src="/lovable-uploads/bbc58d58-bc0f-4feb-9429-2124e5641b09.png" 
                alt="Bizmis AI Assistants Team - Sales, Support, and Analytics avatars working together"
                className="w-full h-auto max-w-xl mx-auto drop-shadow-2xl"
              />
              
              {/* Floating performance indicators */}
              <div className="absolute -top-6 -left-6 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-brand animate-bounce z-20">
                <div className="text-xl font-bold text-green-600 font-heading">+47%</div>
                <div className="text-xs text-gray-600 font-body">Sales Boost</div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-brand animate-bounce delay-200 z-20">
                <div className="text-xl font-bold text-blue-600 font-heading">24/7</div>
                <div className="text-xs text-gray-600 font-body">AI Support</div>
              </div>
              
              <div className="absolute top-1/2 -right-8 bg-white/95 backdrop-blur-sm rounded-xl p-2 shadow-brand animate-pulse z-20">
                <div className="text-lg font-bold text-purple-600 font-heading">∞</div>
                <div className="text-xs text-gray-600 font-body">Patience</div>
              </div>
            </div>
            
            {/* Surrounding avatar placeholders in orbit */}
            <div className="absolute top-8 left-4 w-16 h-8 bg-red-100 border-2 border-dashed border-red-500 rounded-lg flex items-center justify-center animate-pulse">
              <span className="text-xs text-red-700 font-body text-center">Sales Director</span>
            </div>
            
            <div className="absolute bottom-8 left-8 w-18 h-9 bg-indigo-100 border-2 border-dashed border-indigo-500 rounded-lg flex items-center justify-center animate-bounce delay-700">
              <span className="text-xs text-indigo-700 font-body text-center">Data Scientist</span>
            </div>
            
            <div className="absolute top-1/3 -left-8 w-14 h-7 bg-teal-100 border-2 border-dashed border-teal-500 rounded-lg flex items-center justify-center animate-pulse delay-1000">
              <span className="text-xs text-teal-700 font-body text-center">UX Expert</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;