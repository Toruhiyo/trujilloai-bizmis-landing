import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

const Pricing = () => {
  return (
    <section className="py-20 bg-gradient-subtle relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
            Start free, see results, then choose the plan that grows with your store.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Free Trial */}
          <div className="bg-white rounded-3xl p-8 shadow-soft border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                14-Day Free Trial
              </h3>
              <p className="text-muted-foreground font-body">
                Experience the full power with no commitment
              </p>
              <div className="mt-6">
                <span className="text-5xl font-heading font-bold text-primary">$0</span>
                <span className="text-muted-foreground">/14 days</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-body">Full salesperson features</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-body">Complete analytics dashboard</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-body">Session replays included</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-body">Email support</span>
              </li>
            </ul>

            <Button variant="outline" size="lg" className="w-full group">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-8 shadow-brand border-2 border-primary/20 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-heading font-semibold">
                Most Popular
              </span>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                Pro Plan
              </h3>
              <p className="text-muted-foreground font-body">
                Perfect for growing stores
              </p>
              <div className="mt-6">
                <span className="text-5xl font-heading font-bold text-primary">$79</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-body">Everything in free trial</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-body">Unlimited conversations</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-body">Advanced conversation tagging</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-body">Priority support</span>
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span className="font-body">Custom voice training</span>
              </li>
            </ul>

            <Button variant="warm" size="lg" className="w-full group">
              Choose Pro Plan
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground font-body">
            All plans include free setup assistance and can be cancelled anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;