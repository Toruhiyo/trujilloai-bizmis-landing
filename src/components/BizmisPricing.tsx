import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

const BizmisPricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small stores getting started",
      features: [
        "Up to 500 conversations/month",
        "Basic product guidance",
        "Email support",
        "Essential analytics"
      ],
      popular: false
    },
    {
      name: "Growth", 
      price: "$79",
      period: "/month",
      description: "Most popular for growing businesses", 
      features: [
        "Up to 2,000 conversations/month",
        "Advanced product recommendations",
        "Priority support",
        "Full analytics dashboard",
        "Custom voice & personality",
        "A/B testing capabilities"
      ],
      popular: true
    },
    {
      name: "Scale",
      price: "$199", 
      period: "/month",
      description: "For high-volume stores",
      features: [
        "Unlimited conversations",
        "Multi-language support",
        "Dedicated success manager",
        "Advanced integrations",
        "Custom reporting",
        "White-label options"
      ],
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
            Choose the plan that fits your store's needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-2xl p-8 shadow-soft hover:shadow-brand transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-primary scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-4xl font-heading font-bold text-primary">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground font-body">
                    {plan.period}
                  </span>
                </div>
                <p className="text-muted-foreground font-body">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground font-body text-sm leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.popular ? "default" : "outline"} 
                size="lg" 
                className="w-full group"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground font-body">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BizmisPricing;