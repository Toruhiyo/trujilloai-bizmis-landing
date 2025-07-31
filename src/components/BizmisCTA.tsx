import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink } from "lucide-react";

const BizmisCTA = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Get Bizmis on Your Store
          </h2>
          
          <p className="text-xl text-muted-foreground font-body mb-8 max-w-2xl mx-auto leading-relaxed">
            Your customers are waiting for the personal touch they get in physical stores. Give it to them today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button size="xl" className="group bg-primary hover:bg-primary-dark text-white font-heading">
              Get Bizmis on Your Store
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="xl" 
              className="group border-primary text-primary hover:bg-primary/5"
            >
              <ExternalLink className="w-5 h-5" />
              Schedule Demo Call
            </Button>
          </div>

          <div className="bg-gradient-subtle rounded-2xl p-8 max-w-2xl mx-auto">
            <p className="text-lg font-body text-foreground mb-4 font-semibold">
              Available now on the Shopify App Store
            </p>
            
            <div className="space-y-3 text-muted-foreground font-body">
              <p className="text-sm">
                ✓ 14-day free trial • No setup required • Instant activation
              </p>
              <p className="text-sm">
                Need a custom integration for your website? 
                <span className="text-primary font-medium ml-1">Let's talk.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BizmisCTA;