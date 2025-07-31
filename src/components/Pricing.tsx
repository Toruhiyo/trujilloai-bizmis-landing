import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const Pricing = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
            Start free, then choose the plan that fits your store. No hidden fees, no setup costs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Trial */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-soft">
            <div className="text-center space-y-4">
              <Badge variant="secondary" className="px-3 py-1">
                Get Started
              </Badge>
              <h3 className="text-2xl font-heading font-bold text-card-foreground">
                Free Trial
              </h3>
              <div className="space-y-2">
                <div className="text-4xl font-heading font-bold text-card-foreground">
                  $0
                </div>
                <div className="text-muted-foreground font-body">
                  14 days free
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="font-body text-card-foreground">Full access to all features</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="font-body text-card-foreground">Up to 100 conversations</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="font-body text-card-foreground">Basic analytics</span>
              </div>
            </div>

            <Button variant="outline" size="lg" className="w-full mt-8">
              Start Free Trial
            </Button>
          </div>

          {/* Professional */}
          <div className="bg-card rounded-3xl p-8 border-2 border-primary shadow-brand relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                Most Popular
              </Badge>
            </div>
            
            <div className="text-center space-y-4">
              <Badge variant="default" className="px-3 py-1">
                Professional
              </Badge>
              <h3 className="text-2xl font-heading font-bold text-card-foreground">
                Professional
              </h3>
              <div className="space-y-2">
                <div className="text-4xl font-heading font-bold text-card-foreground">
                  $49
                </div>
                <div className="text-muted-foreground font-body">
                  per month
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="font-body text-card-foreground">Unlimited conversations</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="font-body text-card-foreground">Advanced analytics & insights</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="font-body text-card-foreground">Custom voice & appearance</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="font-body text-card-foreground">Priority support</span>
              </div>
            </div>

            <Button size="lg" className="w-full mt-8">
              Get Started
            </Button>
          </div>

          {/* Enterprise */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-soft">
            <div className="text-center space-y-4">
              <Badge variant="secondary" className="px-3 py-1">
                Enterprise
              </Badge>
              <h3 className="text-2xl font-heading font-bold text-card-foreground">
                Enterprise
              </h3>
              <div className="space-y-2">
                <div className="text-4xl font-heading font-bold text-card-foreground">
                  Custom
                </div>
                <div className="text-muted-foreground font-body">
                  Contact us
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="font-body text-card-foreground">Everything in Professional</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="font-body text-card-foreground">Multiple store locations</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="font-body text-card-foreground">Custom integrations</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span className="font-body text-card-foreground">Dedicated account manager</span>
              </div>
            </div>

            <Button variant="outline" size="lg" className="w-full mt-8">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;