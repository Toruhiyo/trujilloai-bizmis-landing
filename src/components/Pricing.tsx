import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ArrowRight, Clock, Badge as BadgeIcon } from "lucide-react";
import { FaTag } from "react-icons/fa";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SectionBadge from "./SectionBadge";
import { usePostHog } from "posthog-js/react";
import confetti from "canvas-confetti";
import { PricingPlanFeatureSoon } from "./PricingPlanFeatureSoon";
import { cn } from "@/lib/utils";

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
  extraMinuteRate: number;
  maxConcurrency: number;
  features: string[];
  popular: boolean;
  buttonText: string;
  buttonVariant: "outline" | "warm";
  everythingIn?: string;
}

const COMING_SOON_FEATURES: string[] = [];

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
    extraMinuteRate: 0.6,
    maxConcurrency: 20,
    features: ["1 Bizmis Store Clerk", "Support: Email (48h)"],
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
    extraMinuteRate: 0.55,
    maxConcurrency: 40,
    features: [
      "Up to 5 Bizmis Store Clerks",
      "History, transcripts, and replays",
      "Avatar customization",
      "Support: Email (24h) and scheduled call",
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
    extraMinuteRate: 0.5,
    maxConcurrency: 100,
    features: [
      "Unlimited Bizmis Store Clerks",
      "Advanced Analytics, Auto-Tags, Exports",
      "Custom voice cloning",
      "Priority support and live onboarding",
    ],
    popular: false,
    buttonText: "Get Started",
    buttonVariant: "outline",
    everythingIn: "Plus",
  },
];

const ENTERPRISE_FEATURES = [
  "Custom minutes, concurrency & pricing",
  "Support: Dedicated CSM, 99.9%+ SLA",
];

const formatPrice = (price: number): string => {
  return Math.round(price).toLocaleString("en-US");
};

const formatExactPrice = (price: number): string => {
  if (Number.isInteger(price)) {
    return price.toLocaleString("en-US");
  }
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const CARD_HOVER_MS = "duration-500";
const CARD_HOVER_EASE = `${CARD_HOVER_MS} ease-out`;

const PricingFootnoteStar = ({ className }: { className?: string }) => (
  <span
    className={cn("font-semibold leading-none text-primary", className)}
    aria-hidden
  >
    *
  </span>
);

/** Resolves `29 93% 65%`-style values from `:root` for canvas / gradients. */
const hslFromCssVar = (name: string): string => {
  if (typeof document === "undefined") {
    return "hsl(29 93% 65%)";
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  if (!value) {
    return "hsl(29 93% 65%)";
  }
  return `hsl(${value})`;
};

/** Miniaturized hero studio stack — fades in under the veil on card hover. */
const PricingCardHeroBackdrop = ({ noiseId }: { noiseId: string }) => (
  <div
    className={`pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl opacity-0 transition-opacity ${CARD_HOVER_EASE} group-hover:opacity-100`}
    aria-hidden
  >
    <div className="absolute inset-0 studio-lighting-base" />
    <div className="absolute inset-0 studio-radial-light" />
    <div className="absolute inset-0 studio-horizon-shadow" />
    <div className="absolute inset-0 studio-horizon-meniscus-left" />
    <div className="absolute inset-0 studio-horizon-meniscus-right" />
    <div className="absolute inset-0 studio-floor-shadow" />
    <div className="absolute inset-0 studio-ambient-overlay" />
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full mix-blend-overlay opacity-[0.72]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id={`pricing-noise-${noiseId}`}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.78"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>
      <rect
        width="100%"
        height="100%"
        filter={`url(#pricing-noise-${noiseId})`}
        opacity="0.85"
      />
    </svg>
  </div>
);

/** Only valid early-bird coupon for now (case-insensitive). */
const EARLY_BIRD_COUPON_CODE = "EARLY_BIRD_50";
const EARLY_BIRD_SEAT_CAP = 50;

const normalizeCouponInput = (value: string): string =>
  value.trim().toUpperCase();

const fireEarlyBirdConfetti = (
  originElement: HTMLElement | null | undefined
) => {
  let originX = 0.5;
  let originY = 0.5;
  if (originElement) {
    const rect = originElement.getBoundingClientRect();
    originX = (rect.left + rect.width / 2) / window.innerWidth;
    originY = (rect.top + rect.height / 2) / window.innerHeight;
  }

  const count = 200;
  const defaults = {
    origin: { x: originX, y: originY },
    zIndex: 100,
  };

  const fire = (particleRatio: number, opts: object) => {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  };

  const primary = hslFromCssVar("--primary");
  const primaryDark = hslFromCssVar("--primary-dark");
  const primaryLight = hslFromCssVar("--primary-light");
  const background = hslFromCssVar("--background");
  const accent = hslFromCssVar("--accent");
  const secondary = hslFromCssVar("--secondary");

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: [primary, primaryDark],
  });

  fire(0.2, {
    spread: 60,
    colors: [primaryLight, background],
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: [primary, primaryDark, primaryLight, background, accent],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: [primary, primaryDark],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: [primaryLight, background, secondary],
  });
};

const Pricing = () => {
  const navigate = useNavigate();
  const posthog = usePostHog();
  const [isYearly, setIsYearly] = useState(true);
  const [showEarlyBird, setShowEarlyBird] = useState(false);
  const [couponValue, setCouponValue] = useState(EARLY_BIRD_COUPON_CODE);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showUpgradeCreditDetails, setShowUpgradeCreditDetails] =
    useState(false);
  const couponInputRef = useRef<HTMLInputElement>(null);

  const handlePlanClick = (planName: string) => {
    posthog.capture("pricing_plan_clicked", {
      plan: planName.toLowerCase(),
      billing_period: isYearly ? "yearly" : "monthly",
      early_bird_enabled: showEarlyBird,
    });
    navigate(`/join-waitlist?plan=${planName.toLowerCase()}`);
  };

  const handleContactSales = () => {
    posthog.capture("pricing_plan_clicked", {
      plan: "enterprise",
      billing_period: isYearly ? "yearly" : "monthly",
      early_bird_enabled: showEarlyBird,
    });
    navigate("/contact?subject=Enterprise%20Plan%20Inquiry");
  };

  const handleBillingToggle = (yearly: boolean) => {
    posthog.capture("billing_period_toggled", {
      billing_period: yearly ? "yearly" : "monthly",
      early_bird_enabled: showEarlyBird,
    });
    setIsYearly(yearly);
  };

  const tryApplyEarlyBirdCoupon = () => {
    if (showEarlyBird) {
      return;
    }

    const entered = normalizeCouponInput(couponValue);
    if (entered !== EARLY_BIRD_COUPON_CODE) {
      setCouponError("That code isn’t valid.");
      return;
    }

    setCouponError(null);
    setShowEarlyBird(true);
    posthog.capture("pricing_coupon_applied", {
      coupon: EARLY_BIRD_COUPON_CODE,
      billing_period: isYearly ? "yearly" : "monthly",
    });

    fireEarlyBirdConfetti(couponInputRef.current);
  };

  const removeAppliedCoupon = () => {
    if (!showEarlyBird) {
      return;
    }
    setShowEarlyBird(false);
    setCouponError(null);
    posthog.capture("pricing_coupon_removed", {
      coupon: EARLY_BIRD_COUPON_CODE,
      billing_period: isYearly ? "yearly" : "monthly",
    });
  };

  const getDisplayPrice = (plan: Plan): number => {
    if (isYearly && showEarlyBird)
      return plan.pricing.yearlyEarlyBirdMonthlyEquivalent;
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
    <section id="pricing" className="relative overflow-hidden py-16 lg:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-muted/90 via-accent/25 to-background"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-0 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/2 translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute left-1/2 top-[36%] h-72 w-[min(44rem,92%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 lg:px-6">
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <SectionBadge icon={FaTag} text="Pricing" />
          </div>
          <h2 className="mb-6 font-heading text-4xl font-bold text-foreground lg:text-5xl xl:text-6xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mb-8 max-w-3xl font-body text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Choose the plan that fits your business. All plans include full
            Shopify integration.
          </p>

          {/* Billing period only */}
          <div className="inline-flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-border/60 bg-background/75 px-6 py-4 shadow-soft backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span
                className={`text-sm font-medium transition-colors ${
                  !isYearly ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Monthly
              </span>
              <button
                type="button"
                onClick={() => handleBillingToggle(!isYearly)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  isYearly
                    ? "bg-gradient-to-r from-primary to-primary-dark"
                    : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-primary-foreground transition-all duration-300 shadow-lg ${
                    isYearly ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium transition-colors ${
                  isYearly ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Yearly
              </span>
            </div>
          </div>

          {!showEarlyBird && (
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
              Save 20% with yearly billing.
            </p>
          )}
        </div>

        {/* Pricing Cards - 4 columns */}
        <div
          id="pricing-cards"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-6 max-w-7xl mx-auto"
        >
          {PLANS.map((plan, index) => {
            const displayPrice = getDisplayPrice(plan);
            const discountPercent = getDiscountPercent(plan);
            const hasDiscount = discountPercent > 0;

            return (
              <div
                key={index}
                className={`group relative flex flex-col transition-all duration-500 ${
                  plan.popular
                    ? "scale-[1.02] xl:scale-105"
                    : "hover:scale-[1.02]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 z-30 flex w-full -translate-x-1/2 transform justify-center">
                    <div className="whitespace-nowrap rounded-full border border-primary bg-primary-light/25 px-4 py-1.5 font-heading text-sm font-semibold text-primary backdrop-blur-md transition-colors group-hover:border-primary-foreground/85 group-hover:text-primary-foreground">
                      Popular
                    </div>
                  </div>
                )}
                <div
                  className={`relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 shadow-soft backdrop-blur-sm transition-shadow hover:shadow-lg lg:p-7 ${
                    plan.popular
                      ? "border-primary"
                      : "border-border/60"
                  }`}
                >
                  <PricingCardHeroBackdrop noiseId={`plan-${index}`} />
                  <div
                    className={`pointer-events-none absolute inset-0 z-[1] rounded-2xl backdrop-blur-[2px] transition-opacity ${CARD_HOVER_EASE} group-hover:opacity-0 ${
                      plan.popular
                        ? "bg-gradient-to-br from-card/96 via-card/92 to-primary-light/18"
                        : "bg-card/95"
                    }`}
                    aria-hidden
                  />
                  {/* Discount — filled scalloped seal badge */}
                  {hasDiscount && (
                    <div
                      className="pointer-events-none absolute right-3 top-3 z-20 flex h-16 w-16 items-center justify-center text-center"
                      title={
                        !isYearly && showEarlyBird
                          ? "Discounted intro period"
                          : `${discountPercent}% off vs. list price`
                      }
                    >
                      <BadgeIcon
                        className="absolute inset-0 h-full w-full fill-primary stroke-none transition-colors group-hover:fill-primary-foreground/25"
                        strokeWidth={0}
                        aria-hidden
                      />
                      <div className="relative z-10 flex flex-col items-center gap-0.5">
                        {!isYearly && showEarlyBird && (
                          <Clock
                            className="h-2.5 w-2.5 shrink-0 text-primary-foreground/90"
                            aria-hidden
                          />
                        )}
                        <span className="font-heading text-xl font-extrabold leading-none text-primary-foreground tabular-nums">
                          {discountPercent}%
                        </span>
                        <span className="font-heading text-[0.65rem] font-bold uppercase leading-none tracking-wide text-primary-foreground/90">
                          off
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                  <div className="mb-6 pt-2 text-center">
                    <h3 className="mb-3 font-heading text-xl font-bold text-foreground transition-colors lg:text-2xl group-hover:text-primary-foreground">
                      {plan.name}
                    </h3>

                    {/* Price Block */}
                    <div className="space-y-2">
                      <div
                        className={`flex flex-wrap items-baseline justify-center ${hasDiscount ? "gap-2" : "gap-1"}`}
                      >
                        {hasDiscount && (
                          <span className="font-heading text-lg font-light tabular-nums text-foreground/60 line-through decoration-foreground/45 transition-colors group-hover:text-primary-foreground/75 group-hover:decoration-primary-foreground/50">
                            ${formatPrice(plan.pricing.monthlyStandard)}
                          </span>
                        )}
                        <span className="font-heading text-3xl font-bold tabular-nums text-foreground transition-colors group-hover:text-primary-foreground lg:text-4xl">
                          ${formatExactPrice(displayPrice)}
                        </span>
                        <span className="font-body text-sm text-foreground/70 transition-colors group-hover:text-primary-foreground/80">
                          /mo
                        </span>
                      </div>

                      {/* Secondary info based on state */}
                      {isYearly && (
                        <p className="flex justify-center pt-0.5">
                          <span className="font-heading text-[0.625rem] font-semibold uppercase leading-none tracking-widest text-muted-foreground/55 transition-colors group-hover:text-primary-foreground/75">
                            billed yearly
                          </span>
                        </p>
                      )}

                      {!isYearly && showEarlyBird && (
                        <p className="flex items-center justify-center gap-1 text-sm text-foreground/70 transition-colors group-hover:text-primary-foreground/85">
                          <Clock className="h-3.5 w-3.5" />
                          first 3 months, then $
                          {formatPrice(plan.pricing.monthlyStandard)}/mo
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 space-y-2 border-b border-border/70 pb-4 transition-colors group-hover:border-primary-foreground/30">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="font-heading text-base font-semibold tabular-nums text-foreground/80 transition-colors group-hover:text-primary-foreground sm:text-lg">
                        {plan.includedMinutes.toLocaleString()}
                      </span>
                      <span className="text-xs text-foreground/65 transition-colors group-hover:text-primary-foreground/85">
                        min included
                      </span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="inline-flex items-baseline gap-0.5">
                        <span className="font-heading text-base font-semibold tabular-nums text-foreground/80 transition-colors group-hover:text-primary-foreground sm:text-lg">
                          ${plan.extraMinuteRate.toFixed(2)}/min
                        </span>
                        <PricingFootnoteStar className="text-sm transition-colors group-hover:text-primary-foreground sm:text-base" />
                      </span>
                      <span className="text-xs leading-snug text-foreground/65 transition-colors group-hover:text-primary-foreground/85">
                        beyond included
                      </span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="font-heading text-base font-semibold tabular-nums text-foreground/80 transition-colors group-hover:text-primary-foreground sm:text-lg">
                        {plan.maxConcurrency}
                      </span>
                      <span className="text-xs text-foreground/65 transition-colors group-hover:text-primary-foreground/85">
                        concurrent voice conversations
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mb-8 flex-grow">
                    {plan.everythingIn && (
                      <p className="mb-3 text-sm font-medium text-foreground/75 transition-colors group-hover:text-primary-foreground/90">
                        Everything in {plan.everythingIn} plus:
                      </p>
                    )}
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/30 ring-1 ring-primary/25 transition-colors group-hover:bg-primary-foreground/20 group-hover:ring-primary-foreground/40">
                            <Check className="h-3 w-3 text-primary-dark transition-colors group-hover:text-primary-foreground" />
                          </div>
                          <span className="flex items-center font-body text-sm leading-relaxed text-foreground/85 transition-colors group-hover:text-primary-foreground/95">
                            {feature}
                            {COMING_SOON_FEATURES.includes(feature) && (
                              <PricingPlanFeatureSoon />
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto">
                    <Button
                      variant={plan.buttonVariant}
                      size="lg"
                      onClick={() => handlePlanClick(plan.name)}
                      className={`w-full font-semibold transition-all duration-300 group/btn relative overflow-hidden ${
                        plan.buttonVariant === "outline"
                          ? "border-2 border-primary/55 bg-background text-primary-dark shadow-sm hover:border-primary hover:bg-primary/10 hover:text-primary-dark group-hover:border-primary-foreground group-hover:bg-primary-foreground/15 group-hover:text-primary-foreground hover:group-hover:!border-primary-foreground hover:group-hover:!bg-primary-foreground/25"
                          : "group-hover:bg-primary-foreground group-hover:text-primary-dark group-hover:shadow-lg hover:!bg-primary-foreground/95"
                      }`}
                    >
                      <span className="relative z-10">{plan.buttonText}</span>
                      <ArrowRight className="relative z-10 ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Enterprise Card */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-soft transition-all duration-500 hover:scale-[1.02] hover:shadow-lg lg:p-7">
            <PricingCardHeroBackdrop noiseId="enterprise" />
            <div
              className={`pointer-events-none absolute inset-0 z-[1] rounded-2xl bg-gradient-to-br from-foreground via-foreground to-primary-dark/75 transition-opacity ${CARD_HOVER_EASE} group-hover:opacity-0`}
              aria-hidden
            />
            <div className="relative z-10 flex flex-1 flex-col">
            <div className="mb-6 pt-2 text-center">
              <h3 className="mb-3 font-heading text-xl font-bold lg:text-2xl">
                Enterprise
              </h3>
              <div className="mb-3">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-heading text-3xl font-bold lg:text-4xl">
                    Custom
                  </span>
                </div>
              </div>
              <p className="text-sm text-primary-foreground/75 transition-colors group-hover:text-primary-foreground/90">
                Tailored solutions for large-scale operations with custom volume
                and requirements.
              </p>
            </div>

            <div className="mb-8 flex-grow">
              <p className="mb-3 text-sm font-medium text-primary-foreground/75 transition-colors group-hover:text-primary-foreground/90">
                Everything in Pro plus:
              </p>
              <ul className="space-y-3">
                {ENTERPRISE_FEATURES.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors group-hover:bg-primary-foreground/20">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span className="flex items-center font-body text-sm leading-relaxed text-primary-foreground/80 transition-colors group-hover:text-primary-foreground">
                      {feature}
                      {COMING_SOON_FEATURES.includes(feature) && (
                        <PricingPlanFeatureSoon />
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              <Button
                variant="outline"
                size="lg"
                onClick={handleContactSales}
                className="group/ent w-full border-0 bg-background text-foreground transition-all duration-300 hover:bg-background/95 hover:text-foreground group-hover:border group-hover:border-primary-foreground/30 group-hover:bg-background/95 group-hover:text-primary-dark"
              >
                <span>Contact Sales</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/ent:translate-x-1" />
              </Button>
            </div>
            </div>
          </div>
        </div>

        {/* Upgrade Credit Note - Only when Monthly + Early Bird ON */}
        {showUpgradeCreditNote && (
          <div className="max-w-3xl mx-auto mt-8">
            <div className="rounded-xl border border-primary/20 bg-accent/35 px-6 py-4">
              <p className="text-sm text-foreground">
                <span className="font-medium">
                  Upgrade to yearly within 90 days
                </span>{" "}
                and we'll credit what you already paid toward your yearly plan
                (commitment charges only).{" "}
                <button
                  onClick={() =>
                    setShowUpgradeCreditDetails(!showUpgradeCreditDetails)
                  }
                  className="text-primary underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  {showUpgradeCreditDetails ? "Hide details" : "Learn more"}
                </button>
              </p>
              {showUpgradeCreditDetails && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-primary/20">
                  Credit applies to commitment charges only. On-demand usage
                  charges (extra minutes) are excluded from the credit.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Billing Summary */}
        <div className="mt-12 text-center">
          <div className="mb-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-foreground/75 lg:gap-x-8">
            <div
              className="flex items-center gap-2"
              aria-label="Voice is billed per minute. You choose your maximum spend limit and can change it anytime."
            >
              <PricingFootnoteStar />
              <span>You choose your spend limit</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>30-day money-back guarantee (yearly plans)</span>
            </div>
          </div>
        </div>

        {/* Discount coupon — below plan grid, above FAQs (early bird copy only after valid apply) */}
        <div className="mx-auto mb-10 max-w-xl px-2">
          {!showEarlyBird ? (
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Have a discount code? Enter it and press Enter or Apply to update
              the prices above.
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <Input
              ref={couponInputRef}
              value={couponValue}
              onChange={(e) => {
                setCouponValue(e.target.value);
                setCouponError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !showEarlyBird) {
                  e.preventDefault();
                  tryApplyEarlyBirdCoupon();
                }
              }}
              disabled={showEarlyBird}
              className="h-12 font-mono text-sm uppercase tracking-wide sm:min-w-0 sm:flex-1"
              placeholder="Discount code"
              autoComplete="off"
              spellCheck={false}
              aria-label="Discount coupon code"
            />
            {showEarlyBird ? (
              <Button
                type="button"
                variant="outline"
                className="shrink-0 border-primary/40 font-semibold text-primary-dark sm:min-w-[8.5rem]"
                onClick={removeAppliedCoupon}
              >
                Remove coupon
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                className="shrink-0 sm:w-32"
                onClick={tryApplyEarlyBirdCoupon}
              >
                Apply
              </Button>
            )}
          </div>
          {couponError ? (
            <p
              className="mt-3 text-center text-sm text-destructive"
              role="alert"
            >
              {couponError}
            </p>
          ) : null}

          {showEarlyBird ? (
            <div className="relative mt-8 rounded-2xl border border-primary/25 bg-accent/35 px-5 py-6 shadow-sm sm:px-6 sm:py-7">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md">
                  Early bird active
                </span>
              </div>
              <p className="mt-2 text-center text-foreground">
                <span className="font-semibold">
                  You&apos;re viewing early bird pricing — reserved for our first{" "}
                  {EARLY_BIRD_SEAT_CAP} merchants only.
                </span>{" "}
                <span className="text-foreground/85">
                  Help shape the product with your feedback on the roadmap. Your
                  plan prices above include{" "}
                  <span className="font-semibold text-foreground">
                    50% off your first 3 months
                  </span>{" "}
                  on monthly billing, or{" "}
                  <span className="font-semibold text-foreground">
                    33% off yearly
                  </span>{" "}
                  when yearly is selected.
                </span>
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-2 text-center">
          <a
            href="/faqs#billing"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-dark"
          >
            View all frequently asked questions{" "}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
