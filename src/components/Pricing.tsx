import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Zap, HelpCircle, ChevronDown, Clock } from "lucide-react";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import { PricingPlanFeatureSoon } from "./PricingPlanFeatureSoon";

interface PricingTier {
  monthlyStandard: number;
  monthlyEarlyBird: number;
  yearlyStandardMonthlyEquivalent: number;
  yearlyEarlyBirdMonthlyEquivalent: number;
}

interface Plan {
  name: string;
  pricing: PricingTier;
  includedMinutes: number;
  extraMinutesCost: number;
  features: string[];
  popular: boolean;
  buttonText: string;
  buttonVariant: "outline" | "warm";
  everythingIn?: string;
}

const COMING_SOON_FEATURES = [
  "Avatar customization",
  "Professional Voice Cloning",
  "Advanced Analytics + Exports",
  "Webhooks",
];

const PLANS: Plan[] = [
  {
    name: "Starter",
    pricing: {
      monthlyStandard: 149,
      monthlyEarlyBird: 74,
      yearlyStandardMonthlyEquivalent: 119,
      yearlyEarlyBirdMonthlyEquivalent: 99,
    },
    includedMinutes: 250,
    extraMinutesCost: 0.60,
    features: [
      "1 Bizmis Store Assistant",
      "5 Concurrent Conversations",
      "Support: Email (48h)",
    ],
    popular: false,
    buttonText: "Get Started",
    buttonVariant: "outline",
  },
  {
    name: "Plus",
    pricing: {
      monthlyStandard: 499,
      monthlyEarlyBird: 249,
      yearlyStandardMonthlyEquivalent: 399,
      yearlyEarlyBirdMonthlyEquivalent: 333,
    },
    includedMinutes: 900,
    extraMinutesCost: 0.55,
    features: [
      "Up to 5 Bizmis Store Assistants",
      "15 Concurrent Conversations",
      "Professional Voice Cloning",
      "Avatar customization",
      "Basic Conversation History",
      "Support: Email + chat (24h)",
    ],
    popular: true,
    buttonText: "Get Started",
    buttonVariant: "warm",
    everythingIn: "Starter",
  },
  {
    name: "Pro",
    pricing: {
      monthlyStandard: 1499,
      monthlyEarlyBird: 749,
      yearlyStandardMonthlyEquivalent: 1199,
      yearlyEarlyBirdMonthlyEquivalent: 999,
    },
    includedMinutes: 3000,
    extraMinutesCost: 0.50,
    features: [
      "Unlimited Bizmis Store Assistants",
      "30 Concurrent Conversations",
      "Advanced Analytics + Exports",
      "Webhooks",
      "Support: Priority (8h), 99.5% SLA",
    ],
    popular: false,
    buttonText: "Get Started",
    buttonVariant: "outline",
    everythingIn: "Plus",
  },
];

const ENTERPRISE_FEATURES = [
  "Custom minutes & pricing",
  "Custom Concurrent Conversations",
  "Support: Dedicated CSM, 99.9%+ SLA",
];

const formatPrice = (price: number): string => {
  return Math.round(price).toLocaleString("en-US");
};

const formatExactPrice = (price: number): string => {
  if (Number.isInteger(price)) {
    return price.toLocaleString("en-US");
  }
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const EARLY_BIRD_TOOLTIP = "First 50 merchants get exclusive launch pricing";

const SHOW_CONCURRENT_CONVERSATIONS_LIMIT = false;

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [showEarlyBird, setShowEarlyBird] = useState(true);
  const [showUpgradeCreditDetails, setShowUpgradeCreditDetails] = useState(false);
  const earlyBirdRef = useRef<HTMLLabelElement>(null);

  const handleEarlyBirdChange = () => {
    const newValue = !showEarlyBird;
    setShowEarlyBird(newValue);
    if (newValue) {
      // Calculate origin based on button position if possible
      let originX = 0.5;
      let originY = 0.5;

      if (earlyBirdRef.current) {
        const rect = earlyBirdRef.current.getBoundingClientRect();
        originX = (rect.left + rect.width / 2) / window.innerWidth;
        originY = (rect.top + rect.height / 2) / window.innerHeight;
      }

      // Single big explosion centered at the button
      const count = 200;
      const defaults = {
        origin: { x: originX, y: originY },
        zIndex: 100, // Ensure it's on top
      };

      function fire(particleRatio: number, opts: any) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#FF8F00', '#F59E0B']
      });

      fire(0.2, {
        spread: 60,
        colors: ['#FCD34D', '#FFFFFF']
      });

      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ['#FF8F00', '#F59E0B', '#FCD34D', '#FFFFFF', '#FFF7ED']
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
        colors: ['#FF8F00', '#F59E0B']
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 45,
        colors: ['#FCD34D', '#FFFFFF', '#FFF7ED']
      });
    }
  };

  const getDisplayPrice = (plan: Plan): number => {
    if (isYearly && showEarlyBird) return plan.pricing.yearlyEarlyBirdMonthlyEquivalent;
    if (isYearly) return plan.pricing.yearlyStandardMonthlyEquivalent;
    if (showEarlyBird) return plan.pricing.monthlyEarlyBird;
    return plan.pricing.monthlyStandard;
  };

  const getDiscountPercent = (plan: Plan): number => {
    const currentPrice = getDisplayPrice(plan);
    const standardPrice = plan.pricing.monthlyStandard;
    if (currentPrice >= standardPrice) return 0;
    return Math.round(((standardPrice - currentPrice) / standardPrice) * 100);
  };

  const showUpgradeCreditNote = !isYearly && showEarlyBird;

  return (
    <section
      id="pricing"
      className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-gray-100/25 bg-grid-16"></div>
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto mb-8">
            Choose the plan that fits your business. All plans include full Shopify integration.
          </p>

          {/* Controls Row - Single Row */}
          <div className="inline-flex flex-wrap items-center justify-center gap-6 bg-white rounded-2xl px-6 py-4 shadow-lg border border-gray-100">
            {/* Billing Toggle */}
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium transition-colors ${!isYearly ? "text-foreground" : "text-muted-foreground"
                  }`}
              >
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isYearly
                  ? "bg-gradient-to-r from-primary to-primary-dark"
                  : "bg-gray-200"
                  }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg ${isYearly ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
              <div className="flex flex-col items-start">
                <span
                  className={`text-sm font-medium transition-colors ${isYearly ? "text-foreground" : "text-muted-foreground"
                    }`}
                >
                  Yearly
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className="h-8 w-px bg-gray-200 hidden sm:block" />

            {/* Early Bird Checkbox - Fancier Design */}
            <label
              ref={earlyBirdRef}
              className={`relative flex items-center gap-3 cursor-pointer group px-4 py-2.5 rounded-xl transition-all duration-300 select-none ${showEarlyBird
                ? "bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-200 shadow-md scale-105"
                : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                }`}
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showEarlyBird}
                  onChange={handleEarlyBirdChange}
                  className="sr-only peer"
                />
                <div className={`w-5 h-5 rounded-md transition-all flex items-center justify-center ${showEarlyBird
                  ? "bg-gradient-warm shadow-md"
                  : "border-2 border-gray-300"
                  }`}>
                  {showEarlyBird && (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold transition-colors ${showEarlyBird ? "text-orange-700" : "text-foreground"
                  }`}>
                  Early Bird
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${showEarlyBird
                  ? "bg-orange-100 text-orange-700 border border-orange-200"
                  : "bg-gray-200 text-muted-foreground"
                  }`}>
                  50 seats
                </span>
              </div>
              <div className="relative ml-1 group/tooltip">
                <HelpCircle className="w-4 h-4 text-amber-700 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all whitespace-nowrap z-50">
                  {EARLY_BIRD_TOOLTIP}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </label>
          </div>

          {/* Global Microcopy - Only show when Early Bird is OFF */}
          {!showEarlyBird && (
            <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto">
              Save 20% with yearly billing.
            </p>
          )}

          {/* Early Bird Special Message */}
          {showEarlyBird && (
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="relative bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-orange-200/60 rounded-2xl px-6 py-5 shadow-sm">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-warm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    🐣 Early Bird
                  </span>
                </div>
                <p className="text-center text-amber-900 mt-2">
                  <span className="font-semibold">Be one of our first 50 merchants and help shape Bizmis.</span>{" "}
                  <span className="text-amber-800">
                    Shape Bizmis roadmap to suit your needs. Plus, enjoy <span className="font-semibold">50% off your first 3 months</span> or <span className="font-semibold">33% off yearly</span>.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Cards - 4 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-6 max-w-7xl mx-auto">
          {PLANS.map((plan, index) => {
            const displayPrice = getDisplayPrice(plan);
            const discountPercent = getDiscountPercent(plan);
            const hasDiscount = discountPercent > 0;

            return (
              <div
                key={index}
                className={`relative flex flex-col transition-all duration-500 ${plan.popular
                  ? "scale-[1.02] xl:scale-105"
                  : "hover:scale-[1.02]"
                  }`}
              >
                {/* Badge outside overflow-hidden */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-30 w-full flex justify-center">
                    <div className="bg-gradient-warm text-white px-4 py-1.5 rounded-full text-sm font-heading font-semibold flex items-center gap-2 shadow-lg border-2 border-white whitespace-nowrap">
                      <Zap className="w-3.5 h-3.5" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className={`relative bg-white rounded-2xl p-6 lg:p-7 shadow-lg hover:shadow-xl flex flex-col overflow-hidden h-full ${plan.popular
                  ? "ring-2 ring-primary bg-gradient-to-br from-white to-primary-light/10"
                  : "border border-gray-100"
                  }`}>
                  {/* Discount Ribbon - Orange/Warm Palette */}
                  {hasDiscount && (
                    <div className="absolute -right-12 top-6 rotate-45 bg-gradient-warm text-white py-1.5 w-44 text-sm font-bold shadow-lg z-20 flex items-center justify-center gap-1">
                      {!isYearly && showEarlyBird && <Clock className="w-3.5 h-3.5" />}
                      {discountPercent}% OFF
                    </div>
                  )}

                  <div className="text-center mb-6 pt-2">
                    <h3 className="text-xl lg:text-2xl font-heading font-bold text-foreground mb-3">
                      {plan.name}
                    </h3>

                    {/* Price Block */}
                    <div className="space-y-2">
                      {/* Strikethrough original price when discounted */}
                      {hasDiscount && (
                        <div className="text-lg text-muted-foreground line-through">
                          ${formatPrice(plan.pricing.monthlyStandard)} / month
                        </div>
                      )}

                      {/* Primary Price - No color, just bold */}
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
                          ${formatExactPrice(displayPrice)}
                        </span>
                        <span className="text-muted-foreground font-body text-sm">
                          / month
                        </span>
                      </div>

                      {/* Secondary info based on state */}
                      {isYearly && (
                        <p className="text-sm text-muted-foreground">
                          billed yearly
                        </p>
                      )}

                      {!isYearly && showEarlyBird && (
                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          first 3 months, then ${formatPrice(plan.pricing.monthlyStandard)}/month
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Minutes Section - Clean, no spark icons */}
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-foreground">
                        <span className="font-semibold">{plan.includedMinutes.toLocaleString()}</span> minutes included
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        Extra minutes at <span className="font-semibold text-foreground">${plan.extraMinutesCost.toFixed(2)}/min</span>
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mb-8 flex-grow">
                    {plan.everythingIn && (
                      <p className="text-sm font-medium text-muted-foreground mb-3">
                        Everything in {plan.everythingIn} plus:
                      </p>
                    )}
                    <ul className="space-y-3">
                      {plan.features
                        .filter(feature => SHOW_CONCURRENT_CONVERSATIONS_LIMIT || !feature.includes("Concurrent Conversations"))
                        .map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-gradient-to-br from-amber-100 to-primary-light/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-muted-foreground font-body text-sm leading-relaxed flex items-center">
                              {feature}
                              {COMING_SOON_FEATURES.includes(feature) && <PricingPlanFeatureSoon />}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="mt-auto">
                    <Button
                      variant={plan.buttonVariant}
                      size="lg"
                      className={`w-full group relative overflow-hidden transition-all duration-300 ${plan.buttonVariant === "outline"
                        ? "hover:bg-primary hover:text-white hover:border-primary"
                        : "hover:opacity-90 hover:shadow-lg"
                        }`}
                    >
                      <span className="relative z-10">{plan.buttonText}</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Enterprise Card */}
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 lg:p-7 shadow-lg hover:shadow-xl transition-all duration-500 flex flex-col text-white hover:scale-[1.02]">
            <div className="text-center mb-6 pt-2">
              <h3 className="text-xl lg:text-2xl font-heading font-bold mb-3">
                Enterprise
              </h3>
              <div className="mb-3">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl lg:text-4xl font-heading font-bold">
                    Custom
                  </span>
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                Tailored solutions for large-scale operations with custom volume and requirements.
              </p>
            </div>

            <div className="mb-8 flex-grow">
              <p className="text-sm font-medium text-gray-300 mb-3">
                Everything in Pro plus:
              </p>
              <ul className="space-y-3">
                {ENTERPRISE_FEATURES
                  .filter(feature => SHOW_CONCURRENT_CONVERSATIONS_LIMIT || !feature.includes("Concurrent Conversations"))
                  .map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-300 font-body text-sm leading-relaxed flex items-center">
                        {feature}
                        {COMING_SOON_FEATURES.includes(feature) && <PricingPlanFeatureSoon />}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="mt-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-900 border-0 transition-all duration-300 group"
              >
                <span>Contact Sales</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Upgrade Credit Note - Only when Monthly + Early Bird ON */}
        {showUpgradeCreditNote && (
          <div className="max-w-3xl mx-auto mt-8">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-4">
              <p className="text-sm text-amber-900">
                <span className="font-medium">Upgrade to yearly within 90 days</span> and we'll credit what you already paid toward your yearly plan (commitment charges only).{" "}
                <button
                  onClick={() => setShowUpgradeCreditDetails(!showUpgradeCreditDetails)}
                  className="text-amber-700 underline underline-offset-2 hover:text-amber-900 transition-colors"
                >
                  {showUpgradeCreditDetails ? "Hide details" : "Learn more"}
                </button>
              </p>
              {showUpgradeCreditDetails && (
                <p className="text-xs text-amber-800 mt-2 pt-2 border-t border-amber-200">
                  Credit applies to commitment charges only. On-demand usage charges (extra minutes) are excluded from the credit.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Billing Summary */}
        <div className="text-center mt-12 mb-16">
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>60-day money-back guarantee (yearly plans)</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <a href="/faqs#billing" className="text-primary hover:text-primary-dark font-medium text-sm inline-flex items-center gap-1 transition-colors">
            View all frequently asked questions <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
