import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

const BizmisCTA = () => {
  return (
    <section className="py-20 bg-gradient-warm relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-6 mb-10">
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-heading font-bold text-white leading-tight">
              Ready to turn every visitor into a customer?
            </h2>
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto">
              Bizmis is the proactive store clerk your online shop never had — until now.
            </p>
          </div>
          
          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-300 fill-current" />
              ))}
            </div>
            <span className="text-white/80 ml-2">Trusted by growing stores everywhere</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="xl"
              className="group shadow-2xl bg-white text-primary hover:bg-white/90 transition-all duration-300 font-semibold"
            >
              Get Bizmis on Your Store
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="xl"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300"
            >
              Schedule Demo
            </Button>
          </div>
          
          <div className="mt-8 space-y-2">
            <p className="text-white font-medium">
              Available now on the Shopify App Store
            </p>
            <p className="text-white/70 text-sm">
              Need a custom integration? Let's talk.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BizmisCTA;