import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Zap } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "29",
      period: "month",
      description: "Perfect for small Shopify stores starting their journey",
      features: [
        "Up to 500 monthly conversations",
        "Basic voice customization",
        "Product recommendations",
        "24/7 customer support",
        "Basic analytics dashboard",
        "Shopify one-click setup",
      ],
      popular: false,
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const,
    },
    {
      name: "Growth",
      price: "79",
      period: "month",
      description: "For growing stores ready to scale customer experience",
      features: [
        "Up to 2,500 monthly conversations",
        "Advanced voice cloning",
        "Custom appearance design",
        "Session replay analytics",
        "Tagged conversation insights",
        "Priority customer support",
        "Advanced product matching",
        "Cart abandonment recovery",
      ],
      popular: true,
      buttonText: "Start Free Trial",
      buttonVariant: "warm" as const,
    },
    {
      name: "Pro",
      price: "179",
      period: "month",
      description: "For established stores wanting maximum performance",
      features: [
        "Unlimited conversations",
        "Full voice & appearance customization",
        "Advanced behavioral analytics",
        "A/B testing for conversations",
        "Custom integrations",
        "Dedicated account manager",
        "White-label options",
        "Multi-language support",
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
    },
  ];

  return (
    <section
      id="pricing"
      className="py-20 bg-gradient-subtle relative overflow-hidden"
    >
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Simple Pricing for Shopify Stores
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
            Start with a free trial, then choose the plan that grows with your
            business. All plans include full Shopify integration and setup
            support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl p-8 shadow-soft hover:shadow-brand transition-all duration-300 ${
                plan.popular ? "ring-2 ring-primary scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-heading font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-4xl font-heading font-bold text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground font-body">
                    /{plan.period}
                  </span>
                </div>
                <p className="text-muted-foreground font-body text-sm">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-muted-foreground font-body text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.buttonVariant}
                size="lg"
                className="w-full group"
              >
                {plan.buttonText}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground font-body mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Free setup support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
