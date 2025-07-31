import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

const Pricing = () => {
  return (
    <section className="py-20 bg-gradient-subtle relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Simple, straightforward pricing
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
            Start with a free trial. No setup fees, no hidden costs.
          </p>
        </div>
        
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-soft border-2 border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-full text-sm font-medium">
              Most Popular
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
                Shopify App
              </h3>
              <div className="mb-4">
                <span className="text-5xl font-heading font-bold text-foreground">$39</span>
                <span className="text-muted-foreground font-body">/month</span>
              </div>
              <p className="text-muted-foreground font-body">
                Everything you need to turn visitors into customers
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="font-body text-foreground">Voice-powered sales conversations</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="font-body text-foreground">24/7 customer support</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="font-body text-foreground">Product catalog integration</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="font-body text-foreground">Session replays and analytics</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="font-body text-foreground">No setup or training required</span>
              </div>
            </div>
            
            <Button variant="warm" size="lg" className="w-full group">
              Start 14-Day Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Available now on the Shopify App Store
            </p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground font-body mb-4">
            Need a custom integration? Let's talk.
          </p>
          <Button variant="outline" size="lg" className="group">
            Schedule Custom Quote
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;