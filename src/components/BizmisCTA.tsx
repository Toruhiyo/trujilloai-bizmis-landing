import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";

const BizmisCTA = () => {
  return (
    <section className="py-20" style={{ background: "var(--bizmis-gradient)" }}>
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8 mb-12">
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-heading font-bold text-white leading-tight">
              Transform Your Store Today
            </h2>
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto">
              Join store owners who've already upgraded their customer experience with Bizmis
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Button 
              size="xl"
              className="group bg-white text-primary hover:bg-white/90 font-bold text-lg px-10 py-5 rounded-xl shadow-2xl"
            >
              Get Bizmis on Your Store
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              size="xl"
              className="group bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold text-lg px-10 py-5 rounded-xl backdrop-blur-sm"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Need a custom integration? Let's talk
            </Button>
          </div>
          
          <div className="space-y-2">
            <p className="text-white font-medium text-lg">
              Available now on the Shopify App Store
            </p>
            <p className="text-white/70 text-sm">
              No credit card required • Free trial • Cancel anytime
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-20 left-20 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse delay-500" />
        </div>
      </div>
    </section>
  );
};

export default BizmisCTA;