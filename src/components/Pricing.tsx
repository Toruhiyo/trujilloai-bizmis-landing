import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Zap } from "lucide-react";
import { useState } from "react";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      monthlyPrice: "29",
      annualPrice: "24",
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
      monthlyPrice: "79",
      annualPrice: "66",
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
      monthlyPrice: "179",
      annualPrice: "149",
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
    {
      name: "Enterprise",
      monthlyPrice: "Custom",
      annualPrice: "Custom",
      period: "",
      description: "For large enterprises requiring custom solutions",
      features: [
        "Unlimited conversations & users",
        "Custom AI model training",
        "Advanced security & compliance",
        "Multi-store management",
        "Custom workflow automation",
        "Dedicated support team",
        "SLA guarantees",
        "On-premise deployment options",
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
    },
  ];

  return (
    <section
      id="pricing"
      className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-gray-100/25 bg-grid-16"></div>
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Simple Pricing for Shopify Stores
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto mb-8">
            Start with a free trial, then choose the plan that grows with your
            business. All plans include full Shopify integration and setup
            support.
          </p>

          <div className="inline-flex items-center justify-center gap-4 bg-white rounded-2xl px-6 py-4 shadow-lg border border-gray-100">
            <span
              className={`text-sm font-medium transition-colors ${
                !isAnnual ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 ${
                isAnnual
                  ? "bg-gradient-to-r from-orange-500 to-orange-600"
                  : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg ${
                  isAnnual ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium transition-colors ${
                isAnnual ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Annual
            </span>
            {isAnnual && (
              <span className="bg-gradient-to-r from-primary-light/30 to-primary/20 text-primary-dark text-xs font-medium px-3 py-1.5 rounded-full border border-primary/30">
                💰 Save up to 20%
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-8 max-w-8xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-500 group ${
                plan.popular
                  ? "ring-2 ring-orange-500 scale-[1.02] xl:scale-105 bg-gradient-to-br from-white to-orange-50"
                  : "hover:scale-[1.02] border border-gray-100"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-heading font-semibold flex items-center gap-2 shadow-lg">
                    <Zap className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-foreground mb-3">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
                      {plan.monthlyPrice === "Custom"
                        ? plan.monthlyPrice
                        : `$${isAnnual ? plan.annualPrice : plan.monthlyPrice}`}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground font-body text-sm">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                  {isAnnual && plan.monthlyPrice !== "Custom" && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground line-through">
                        ${plan.monthlyPrice}/month
                      </span>
                      <span className="ml-2 text-xs font-medium text-primary-dark bg-primary-light/20 px-2 py-1 rounded-full">
                        Save $
                        {(parseInt(plan.monthlyPrice) -
                          parseInt(plan.annualPrice)) *
                          12}
                        /year
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-orange-600" />
                    </div>
                    <span className="text-muted-foreground font-body text-sm leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <Button
                  variant={plan.buttonVariant}
                  size="lg"
                  className="w-full group relative overflow-hidden"
                >
                  <span className="relative z-10">{plan.buttonText}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
                  {plan.popular && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground font-body mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-orange-600" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-orange-600" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-orange-600" />
              <span>Free setup support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
