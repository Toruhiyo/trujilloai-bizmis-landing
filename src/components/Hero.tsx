import { ArrowRight, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-subtle overflow-hidden">
      {/* Story Chapter Title */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white rounded-full px-6 py-2 shadow-panel border-2 border-primary">
          <span className="text-sm font-heading font-bold text-primary">Chapter 1: The Beginning</span>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        {/* Comic Panel Layout */}
        <div className="max-w-6xl mx-auto">
          {/* Opening Scene */}
          <div className="bg-gradient-panel rounded-3xl p-8 mb-8 shadow-panel border-2 border-border relative">
            {/* Comic panel border effect */}
            <div className="absolute -top-2 -left-2 w-full h-full bg-primary/20 rounded-3xl -z-10" />
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Story Text */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-6xl font-heading font-bold text-foreground leading-tight">
                    Meet Emma, Your
                    <span className="block text-primary">AI Store Assistant</span>
                  </h1>
                  
                  {/* Speech Bubble */}
                  <div className="relative bg-gradient-speech rounded-2xl p-6 shadow-speech border border-primary/20">
                    <div className="absolute -bottom-4 left-8 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-t-white" />
                    <p className="text-lg text-foreground font-body italic">
                      "Hi! I'm Emma, and I'm here to help your customers find exactly what they need. Let me show you what I can do..."
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 bg-primary hover:bg-primary-dark text-primary-foreground shadow-soft transition-all duration-300 hover:scale-105"
                  >
                    Start Emma's Story
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-6 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    Watch Her in Action
                  </Button>
                </div>
              </div>
              
              {/* Character Image */}
              <div className="relative">
                <div className="bg-white rounded-3xl p-6 shadow-panel">
                  <img 
                    src="/lovable-uploads/8bb3d8ae-b65a-41cb-96b6-ae21a9c0269f.png" 
                    alt="Emma and her AI assistant team"
                    className="w-full h-auto rounded-2xl"
                  />
                </div>
                
                {/* Floating dialogue bubbles */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl p-3 shadow-speech border border-accent/30">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-accent" />
                    <span className="text-sm font-body text-foreground">Hello there!</span>
                  </div>
                </div>
                
                <div className="absolute bottom-4 -left-4 bg-white rounded-xl p-3 shadow-speech border border-primary/30">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm font-body text-foreground">Ready to help!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Story Navigation */}
          <div className="text-center">
            <div className="inline-flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-soft border border-border">
              <span className="text-sm font-body text-muted-foreground">Scroll down to continue Emma's journey</span>
              <div className="w-6 h-6 bg-primary rounded-full animate-bounce flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-white rotate-90" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;