import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import Scene3D from "./3d/Scene3D";
import ParticleField from "./3d/ParticleField";

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedAI, setSelectedAI] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX - window.innerWidth / 2,
        y: e.clientY - window.innerHeight / 2,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleAIClick = (type: string) => {
    setSelectedAI(type);
    setTimeout(() => setSelectedAI(null), 2000);
  };

  return (
    <section className="relative min-h-screen particle-bg flex items-center overflow-hidden">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <Scene3D mousePosition={mousePosition} onAIClick={handleAIClick} />
      </div>
      {/* Floating AI Info Cards */}
      {selectedAI && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="bg-card/90 backdrop-blur-md rounded-2xl p-6 neon-border max-w-md">
            <h3 className="text-xl font-heading font-bold text-primary glow-text mb-2">
              {selectedAI === "sales" && "💼 Sales AI Assistant"}
              {selectedAI === "support" && "🎧 Support AI Assistant"}
              {selectedAI === "analytics" && "📊 Analytics AI Assistant"}
            </h3>
            <p className="text-muted-foreground">
              {selectedAI === "sales" && "Boost conversions with personalized product recommendations and smart upselling."}
              {selectedAI === "support" && "Provide 24/7 customer support with human-like conversations and instant responses."}
              {selectedAI === "analytics" && "Deep insights into customer behavior with real-time analytics and session replays."}
            </p>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-6 relative z-20">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8 parallax-layer" 
               style={{ transform: `translateX(${mousePosition.x * 0.02}px)` }}>
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-heading font-bold text-foreground leading-tight glow-text">
                Experience the Future of
                <span className="block bg-gradient-neon bg-clip-text text-transparent">AI Commerce</span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground font-body max-w-2xl">
                Interact with floating 3D AI assistants that transform your e-commerce 
                with immersive experiences and intelligent automation.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="xl" 
                className="group bg-primary hover:bg-primary-light text-primary-foreground shadow-neon"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Enter 3D Experience
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="xl" 
                className="group neon-border bg-card/10 backdrop-blur-sm text-foreground hover:bg-card/20"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 max-w-md">
              <div className="bg-card/20 backdrop-blur-md rounded-2xl p-4 neon-border floating-3d">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  <div>
                    <div className="text-foreground font-heading font-semibold text-sm">3D Interactive</div>
                    <div className="text-muted-foreground font-body text-xs">Click & explore</div>
                  </div>
                </div>
              </div>
              <div className="bg-card/20 backdrop-blur-md rounded-2xl p-4 neon-border floating-3d">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" />
                  <div>
                    <div className="text-foreground font-heading font-semibold text-sm">AI Powered</div>
                    <div className="text-muted-foreground font-body text-xs">Smart automation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Interactive Guide */}
          <div className="relative lg:pl-8 parallax-layer" 
               style={{ transform: `translateX(${mousePosition.x * -0.01}px) translateY(${mousePosition.y * 0.01}px)` }}>
            
            {/* 3D Interaction Guide */}
            <div className="bg-card/30 backdrop-blur-md rounded-3xl p-8 neon-border">
              <h3 className="text-2xl font-heading font-bold text-foreground mb-6 glow-text">
                🎯 Interactive Controls
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-card/20 rounded-xl">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-muted-foreground">Click 3D AI assistants to learn more</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-card/20 rounded-xl">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                  <span className="text-muted-foreground">Drag to rotate the 3D scene</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-card/20 rounded-xl">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span className="text-muted-foreground">Scroll to zoom in/out</span>
                </div>
              </div>
            </div>
            
            {/* Performance Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-card/20 backdrop-blur-sm rounded-xl p-4 neon-border floating-3d">
                <div className="text-2xl font-bold text-primary glow-text">98%</div>
                <div className="text-sm text-muted-foreground">User Engagement</div>
              </div>
              <div className="bg-card/20 backdrop-blur-sm rounded-xl p-4 neon-border floating-3d">
                <div className="text-2xl font-bold text-secondary glow-text">3D</div>
                <div className="text-sm text-muted-foreground">AI Assistants</div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;