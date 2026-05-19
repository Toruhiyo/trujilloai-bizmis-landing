import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, ArrowRight, Clock, Badge as BadgeIcon, ChevronDown, Phone, MessageSquareText, Info } from "lucide-react";
import { FaTag } from "react-icons/fa";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SectionBadge from "./SectionBadge";
import { usePostHog } from "posthog-js/react";
import confetti from "canvas-confetti";
import { PricingPlanFeatureSoon } from "./PricingPlanFeatureSoon";
import { cn } from "@/lib/utils";
import { bizmisConfettiColors } from "@/lib/colors";
import { openBizmisShopifyAppListing } from "@/lib/bizmisUrls";
import {
  CouponApiError,
  CouponDTO,
  CouponErrorCode,
  requestCouponAccessToken,
  validateCoupon,
} from "@/lib/bizmisApi";
import { EARLY_ACCESS_STORE_CAP } from "@/data/leads/_schema";

const CREDITS_PER_VOICE_MINUTE = 10;

const CONCURRENCY_TOOLTIP =
  "Voice-only limit. Text concurrency is effectively unlimited.";

interface PricingTier {
  monthlyStandard: number;
  yearlyStandardMonthlyEquivalent: number;
}

interface Plan {
  name: string;
  pricing: PricingTier;
  includedCredits: number;
  overageRatePerCredit: number;
  maxConcurrency: number;
  features: string[];
  popular: boolean;
  buttonText: string;
  buttonVariant: "outline" | "warm";
  everythingIn?: string;
  sessionEstimate: string;
}

const COMING_SOON_FEATURES: string[] = [];

const PLANS: Plan[] = [
  {
    name: "Starter",
    pricing: {
      monthlyStandard: 149,
      yearlyStandardMonthlyEquivalent: 119,
    },
    includedCredits: 2500,
    overageRatePerCredit: 0.06,
    maxConcurrency: 20,
    sessionEstimate: "250\u2013400",
    features: ["1 Bizmis Store Clerk", "Support: Email (48h)"],
    popular: false,
    buttonText: "Get Started",
    buttonVariant: "outline",
  },
  {
    name: "Plus",
    pricing: {
      monthlyStandard: 499,
      yearlyStandardMonthlyEquivalent: 399,
    },
    includedCredits: 9000,
    overageRatePerCredit: 0.055,
    maxConcurrency: 40,
    sessionEstimate: "900\u20131,500",
    features: [
      "Up to 5 Bizmis Store Clerks",
      "Session history and Replays",
      "Avatar customization",
      "Support: Email (24h) and Scheduled calls",
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
      yearlyStandardMonthlyEquivalent: 1199,
    },
    includedCredits: 30000,
    overageRatePerCredit: 0.05,
    maxConcurrency: 100,
    sessionEstimate: "3,000\u20135,000",
    features: [
      "Lowest overage rate",
      "Unlimited Bizmis Store Clerks",
      "Auto-Tagged conversations",
      "Priority support and Live onboarding",
    ],
    popular: false,
    buttonText: "Get Started",
    buttonVariant: "outline",
    everythingIn: "Plus",
  },
];

const ENTERPRISE_FEATURES = [
  "Custom credits, concurrency & pricing",
  "Support: Dedicated CSM, 99.9%+ SLA",
];

const formatOverageRate = (rate: number): string => {
  return rate.toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
};

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

const CreditsLine = ({
  plan,
  panelId,
  open,
  onToggle,
}: {
  plan: Plan;
  panelId: string;
  open: boolean;
  onToggle: () => void;
}) => {
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="flex w-full items-baseline gap-x-1.5 gap-y-0.5"
      >
        <span className="font-heading text-base font-bold tabular-nums text-foreground/80 transition-colors group-hover:text-primary-foreground sm:text-lg">
          {plan.includedCredits.toLocaleString()}
        </span>
        <span className="text-xs font-medium text-foreground/65 transition-colors group-hover:text-primary-foreground/85">
          credits included
        </span>
        <ChevronDown
          className={cn(
            "ml-auto h-3.5 w-3.5 shrink-0 text-foreground/40 transition-all duration-200 group-hover:text-primary-foreground/60",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-label={`Estimated shopper sessions for ${plan.name}`}
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-2 flex items-center gap-2 whitespace-nowrap rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-2 transition-colors group-hover:border-primary-foreground/15 group-hover:bg-primary-foreground/[0.08]">
            <span className="text-sm font-semibold tabular-nums text-foreground/75 transition-colors group-hover:text-primary-foreground/90">
              ~{plan.sessionEstimate}
            </span>
            <span className="text-xs text-foreground/55 transition-colors group-hover:text-primary-foreground/70">
              shopper sessions/mo{" "}
              <PricingFootnoteStar className="text-[0.6rem] transition-colors group-hover:text-primary-foreground" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Dark noisy backdrop for the enterprise card — always visible. */
const EnterpriseCardBackdrop = () => (
  <div
    className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl"
    aria-hidden
  >
    <div className="absolute inset-0 enterprise-base" />
    <div className="absolute inset-0 enterprise-radial-glow" />
    <div className="absolute inset-0 enterprise-floor-glow" />
    <div className="absolute inset-0 enterprise-edge-light" />
    <div className="absolute inset-0 enterprise-ambient" />
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full mix-blend-soft-light opacity-[0.55]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="enterprise-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves="4"
          stitchTiles="stitch"
        />
      </filter>
      <rect
        width="100%"
        height="100%"
        filter="url(#enterprise-noise)"
        opacity="0.9"
      />
    </svg>
  </div>
);

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

const normalizeCouponInput = (value: string): string =>
  value.trim().toUpperCase();

const couponErrorMessage = (code: CouponErrorCode | string): string => {
  switch (code) {
    case "COUPON_NOT_FOUND":
      return "That code isn\u2019t valid.";
    case "COUPON_EXPIRED":
      return "That code has expired.";
    case "COUPON_NOT_YET_ACTIVE":
      return "That code isn\u2019t active yet.";
    case "COUPON_INVALID_FORMAT":
      return "Code format looks off \u2014 check for typos.";
    case "COUPON_ALREADY_CLAIMED_BY_ANOTHER_STORE":
      return "That code has already been claimed.";
    case "COUPON_INVALID_ACCESS_TOKEN":
      return "Session expired. Please try again.";
    default:
      return "Couldn\u2019t verify the code right now. Please try again.";
  }
};

const fireEarlyAccessConfetti = (
  originElement: HTMLElement | null | undefined,
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

  const C = bizmisConfettiColors();

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: [C[0], C[1]],
  });

  fire(0.2, {
    spread: 60,
    colors: [C[2], C[6]],
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: C,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: [C[0], C[1]],
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: [C[2], C[6], C[5]],
  });
};

const Pricing = () => {
  const navigate = useNavigate();
  const posthog = usePostHog();
  const [isYearly, setIsYearly] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDTO | null>(null);
  const [couponValue, setCouponValue] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showUpgradeCreditDetails, setShowUpgradeCreditDetails] =
    useState(false);
  const [sessionEstimatesExpanded, setSessionEstimatesExpanded] =
    useState(false);
  const couponInputRef = useRef<HTMLInputElement>(null);

  const showEarlyAccess = appliedCoupon !== null;
  const earlyAccessIntroMonths = appliedCoupon?.summary.intro_months ?? 0;

  const handlePlanClick = (planName: string) => {
    posthog.capture("pricing_plan_clicked", {
      plan: planName.toLowerCase(),
      billing_period: isYearly ? "yearly" : "monthly",
      early_access_enabled: showEarlyAccess,
      coupon_code: appliedCoupon?.code ?? null,
      destination: "shopify_app_listing",
    });
    openBizmisShopifyAppListing();
  };

  const handleContactSales = () => {
    posthog.capture("pricing_plan_clicked", {
      plan: "enterprise",
      billing_period: isYearly ? "yearly" : "monthly",
      early_access_enabled: showEarlyAccess,
      coupon_code: appliedCoupon?.code ?? null,
    });
    navigate("/contact?subject=Enterprise%20Plan%20Inquiry");
  };

  const handleBillingToggle = (yearly: boolean) => {
    posthog.capture("billing_period_toggled", {
      billing_period: yearly ? "yearly" : "monthly",
      early_access_enabled: showEarlyAccess,
    });
    setIsYearly(yearly);
  };

  const findCouponPriceFor = (plan: Plan) => {
    if (!appliedCoupon) return null;
    return (
      appliedCoupon.prices.find(
        (price) => price.plan_name === plan.name.toLowerCase(),
      ) ?? null
    );
  };

  const tryApplyEarlyAccessCoupon = async () => {
    if (showEarlyAccess || isApplyingCoupon) {
      return;
    }

    const entered = normalizeCouponInput(couponValue);
    if (!entered) {
      setCouponError("Enter a code first.");
      return;
    }

    setCouponError(null);
    setIsApplyingCoupon(true);
    try {
      const accessToken = await requestCouponAccessToken();
      const coupon = await validateCoupon(entered, accessToken);
      setAppliedCoupon(coupon);
      setCouponValue(coupon.code);
      posthog.capture("pricing_coupon_applied", {
        coupon: coupon.code,
        coupon_kind: coupon.kind,
        billing_period: isYearly ? "yearly" : "monthly",
      });
      fireEarlyAccessConfetti(couponInputRef.current);
    } catch (error) {
      const errorCode =
        error instanceof CouponApiError ? error.code : "NETWORK_ERROR";
      setCouponError(couponErrorMessage(errorCode));
      posthog.capture("pricing_coupon_apply_failed", {
        coupon: entered,
        error_code: errorCode,
        billing_period: isYearly ? "yearly" : "monthly",
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeAppliedCoupon = () => {
    if (!appliedCoupon) {
      return;
    }
    const previousCode = appliedCoupon.code;
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponValue("");
    posthog.capture("pricing_coupon_removed", {
      coupon: previousCode,
      billing_period: isYearly ? "yearly" : "monthly",
    });
  };

  const getDisplayPrice = (plan: Plan): number => {
    const couponPrice = findCouponPriceFor(plan);
    if (couponPrice) {
      return isYearly
        ? couponPrice.yearly_monthly_equivalent
        : couponPrice.monthly;
    }
    if (isYearly) return plan.pricing.yearlyStandardMonthlyEquivalent;
    return plan.pricing.monthlyStandard;
  };

  const getDiscountPercent = (plan: Plan): number => {
    const currentPrice = getDisplayPrice(plan);
    const standardPrice = plan.pricing.monthlyStandard;
    if (currentPrice >= standardPrice) return 0;
    return Math.round(((standardPrice - currentPrice) / standardPrice) * 100);
  };

  const showUpgradeCreditNote = !isYearly && showEarlyAccess;

  return (
    <section id="pricing" className="relative overflow-hidden py-12 sm:py-16 lg:py-24">
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
        <div className="mb-8 text-center sm:mb-12">
          <div className="mb-4 flex justify-center sm:mb-6">
            <SectionBadge icon={FaTag} text="Pricing" />
          </div>
          <h2 className="mb-4 font-heading text-3xl font-bold leading-tight text-foreground sm:mb-6 sm:text-4xl sm:leading-tight lg:text-5xl xl:text-6xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mb-6 max-w-3xl px-2 font-body text-base leading-relaxed text-muted-foreground sm:mb-8 sm:text-lg lg:text-xl">
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
        </div>

        {/* Pricing Cards - 4 columns */}
        <div
          id="pricing-cards"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 max-w-7xl mx-auto"
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
                    <div className="whitespace-nowrap rounded-full border-2 border-primary bg-background/25 px-4 py-1.5 font-heading text-sm font-semibold text-primary backdrop-blur-md transition-colors group-hover:border-primary-foreground/85 group-hover:text-primary-foreground group-hover:bg-primary-light/85">
                      Popular
                    </div>
                  </div>
                )}
                <div
                  className={`relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 shadow-soft backdrop-blur-sm transition-[box-shadow,border-color] hover:shadow-lg sm:p-6 lg:p-7 ${
                    plan.popular
                      ? "border-2 border-primary group-hover:border-primary-foreground/30"
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
                      className="pointer-events-none absolute right-2 top-2 z-20 flex h-14 w-14 items-center justify-center text-center sm:right-3 sm:top-3 sm:h-16 sm:w-16"
                      title={
                        !isYearly && showEarlyAccess
                          ? "Discounted intro period"
                          : `${discountPercent}% off vs. list price`
                      }
                    >
                      <BadgeIcon
                        className="absolute inset-0 h-full w-full fill-primary stroke-none transition-colors group-hover:fill-primary-foreground/25"
                        strokeWidth={0}
                        aria-hidden
                      />
                      <div className="relative z-10 flex flex-col items-center gap-0">
                        <span className="font-heading text-lg font-extrabold leading-none text-primary-foreground tabular-nums sm:text-xl">
                          {discountPercent}%
                        </span>
                        <span className="-mt-0.5 font-heading text-[0.6rem] font-bold uppercase leading-none tracking-wide text-primary-foreground/90 sm:-mt-1 sm:text-[0.65rem]">
                          off
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                    <div className="mb-4 pt-2 text-center sm:mb-6 sm:pt-4">
                      <h3 className="mb-2 font-heading text-lg font-bold text-foreground transition-colors sm:mb-3 lg:text-xl group-hover:text-primary-foreground">
                        {plan.name}
                      </h3>

                      {/* Price Block */}
                      <div className="space-y-2">
                        <div
                          className={`flex flex-wrap items-baseline justify-center ${hasDiscount ? "gap-2" : "gap-1"}`}
                        >
                          {hasDiscount && (
                            <span className="font-heading text-lg font-light tabular-nums text-neutral-400 line-through decoration-2 decoration-neutral-400 transition-colors group-hover:text-primary-foreground/95 group-hover:decoration-primary-foreground/80">
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

                        {!isYearly &&
                          showEarlyAccess &&
                          earlyAccessIntroMonths > 0 && (
                            <p className="flex items-center justify-center gap-1 text-sm text-foreground/70 transition-colors group-hover:text-primary-foreground/85">
                              <Clock className="h-3.5 w-3.5" />
                              first {earlyAccessIntroMonths} month
                              {earlyAccessIntroMonths === 1 ? "" : "s"}, then $
                              {formatPrice(plan.pricing.monthlyStandard)}/mo
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="mb-3 space-y-1 border-b border-border/70 pb-3 transition-colors group-hover:border-primary-foreground/30 sm:mb-4 sm:space-y-1.5 sm:pb-4">
                      <CreditsLine
                        plan={plan}
                        panelId={`pricing-session-estimate-${plan.name.toLowerCase()}`}
                        open={sessionEstimatesExpanded}
                        onToggle={() =>
                          setSessionEstimatesExpanded((v) => !v)
                        }
                      />
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-0.5">
                        <span className="font-heading text-base font-bold tabular-nums text-foreground/80 transition-colors group-hover:text-primary-foreground sm:text-lg">
                          ${formatOverageRate(plan.overageRatePerCredit)}/credit
                        </span>
                        <span className="text-xs font-medium leading-snug text-foreground/65 transition-colors group-hover:text-primary-foreground/85">
                          beyond included
                        </span>
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="font-heading text-base font-bold tabular-nums text-foreground/80 transition-colors group-hover:text-primary-foreground sm:text-lg">
                          {plan.maxConcurrency}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="text-xs font-medium text-foreground/65 transition-colors group-hover:text-primary-foreground/85">
                            concurrent voice conversations
                          </span>
                          <Tooltip delayDuration={150}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex shrink-0 rounded-full text-primary/60 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:text-primary-foreground/50 group-hover:hover:text-primary-foreground/80"
                                aria-label={CONCURRENCY_TOOLTIP}
                              >
                                <Info className="h-3.5 w-3.5" strokeWidth={2.5} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-[min(16rem,calc(100vw-2rem))] rounded-lg border-primary/15 bg-card px-3.5 py-2.5 text-[0.8rem] leading-snug text-foreground/80 shadow-lg"
                            >
                              <span className="flex items-start gap-2">
                                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                {CONCURRENCY_TOOLTIP}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="mb-4 flex-grow sm:mb-6">
                      <ul className="space-y-2 sm:space-y-2.5">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary transition-colors group-hover:text-primary-foreground" />
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
                            ? "border border-primary/40 bg-primary/5 text-primary-dark shadow-sm hover:border-primary hover:bg-primary/10 hover:text-primary-dark group-hover:border-primary-foreground/60 group-hover:bg-primary-foreground/15 group-hover:text-primary-foreground hover:group-hover:!border-primary-foreground hover:group-hover:!bg-primary-foreground/25"
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
          <div className="group relative flex flex-col overflow-hidden rounded-2xl p-5 text-primary-foreground shadow-soft transition-all duration-500 hover:scale-[1.02] hover:shadow-lg sm:p-6 lg:p-7">
            <EnterpriseCardBackdrop />
            <div className="relative z-10 flex flex-1 flex-col">
              <div className="mb-4 pt-2 text-center sm:mb-6">
                <h3 className="mb-2 font-heading text-xl font-bold sm:mb-3 lg:text-2xl">
                  Enterprise
                </h3>
                <div className="mb-2 sm:mb-3">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-heading text-3xl font-bold lg:text-4xl">
                      Custom
                    </span>
                  </div>
                </div>
                <p className="text-sm text-primary-foreground/75 transition-colors group-hover:text-primary-foreground/90">
                  Tailored solutions for large-scale operations with custom
                  volume and requirements.
                </p>
              </div>

              <div className="mb-6 flex-grow sm:mb-8">
                <p className="mb-3 text-sm font-medium text-primary-foreground/75 transition-colors group-hover:text-primary-foreground/90">
                  Everything in Pro plus:
                </p>
                <ul className="space-y-2.5 sm:space-y-3">
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
                  className="group/ent w-full border border-primary-foreground/20 bg-[hsl(25_22%_9%)] text-primary-foreground shadow-sm transition-all duration-300 hover:border-primary-foreground/45 hover:bg-[hsl(25_22%_12%)] hover:text-primary-foreground hover:shadow-md group-hover:border-primary-foreground/45 group-hover:bg-[hsl(25_22%_12%)] group-hover:text-primary-foreground"
                >
                  <span>Contact Sales</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/ent:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Credit conversion reference — matches slide deck pills (e.g. ProductDiscoverySlide) */}
        <div className="mx-auto mt-6 flex max-w-7xl flex-wrap items-center justify-center gap-3 sm:mt-8 sm:gap-4">
          <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/25 bg-primary/15 px-3 py-1.5 text-xs font-heading font-medium text-primary-dark backdrop-blur-md sm:text-sm">
            <Phone className="h-3.5 w-3.5 shrink-0 text-primary-dark sm:h-4 sm:w-4" />
            1 voice minute = 10 credits
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/25 bg-primary/15 px-3 py-1.5 text-xs font-heading font-medium text-primary-dark backdrop-blur-md sm:text-sm">
            <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-primary-dark sm:h-4 sm:w-4" />
            1 text message = 1 credit
          </span>
        </div>
        <p className="mt-2.5 text-center text-xs italic text-foreground/40">
          <PricingFootnoteStar className="text-[0.55rem]" /> Session estimates vary by voice/text mix and session length.
        </p>

        {/* Upgrade Credit Note - Only when Monthly + Early Access ON */}
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
                  charges (overage credits) are excluded from the credit.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Billing Summary */}
        <div className="mt-10 text-center sm:mt-12">
          <div className="mb-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-foreground/75 sm:mb-10 sm:gap-x-6 sm:gap-y-3 lg:gap-x-8">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
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

        {/* Discount coupon — below plan grid, above FAQs (Early Access copy only after valid apply) */}
        <div className="mx-auto mb-10 max-w-xl px-2">
          {!showEarlyAccess ? (
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
                if (
                  e.key === "Enter" &&
                  !showEarlyAccess &&
                  !isApplyingCoupon
                ) {
                  e.preventDefault();
                  void tryApplyEarlyAccessCoupon();
                }
              }}
              disabled={showEarlyAccess || isApplyingCoupon}
              className="h-12 font-mono text-sm uppercase tracking-wide sm:min-w-0 sm:flex-1"
              placeholder="Discount code"
              autoComplete="off"
              spellCheck={false}
              aria-label="Discount coupon code"
            />
            {showEarlyAccess ? (
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
                onClick={() => void tryApplyEarlyAccessCoupon()}
                disabled={isApplyingCoupon}
              >
                {isApplyingCoupon ? "Applying\u2026" : "Apply"}
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

          {showEarlyAccess && appliedCoupon ? (
            <div className="relative mt-8 rounded-2xl border border-primary/25 bg-accent/35 px-5 py-6 shadow-sm sm:px-6 sm:py-7">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-md">
                  {appliedCoupon.summary.label} active
                </span>
              </div>
              <p className="mt-2 text-center text-foreground">
                <span className="font-semibold">
                  You&apos;re viewing {appliedCoupon.summary.label} pricing --
                  reserved for our first {EARLY_ACCESS_STORE_CAP} merchants only.
                </span>{" "}
                <span className="text-foreground/85">
                  Help shape the product with your feedback on the roadmap. Your
                  plan prices above include{" "}
                  <span className="font-semibold text-foreground">
                    {appliedCoupon.summary.monthly_discount_percent}% off
                    {earlyAccessIntroMonths > 0
                      ? ` your first ${earlyAccessIntroMonths} month${
                          earlyAccessIntroMonths === 1 ? "" : "s"
                        }`
                      : ""}
                  </span>{" "}
                  on monthly billing, or{" "}
                  <span className="font-semibold text-foreground">
                    {appliedCoupon.summary.yearly_discount_percent}% off yearly
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
