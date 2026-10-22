import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ArrowRight, Clock, Badge as BadgeIcon, MessageSquareText } from "lucide-react";
import { FaTag } from "react-icons/fa";
import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  PublicPlanDTO,
  fetchPublicPlans,
  requestCouponAccessToken,
  validateCoupon,
} from "@/lib/bizmisApi";
import { EARLY_ACCESS_STORE_CAP } from "@/data/leads/_schema";
import { FREE_PLAN_CONVERSATIONS_ALLOWANCE } from "@/data/leadEarlyAccessCopy";
import { localeTag, useLocale, useLocaleHref, useMessages } from "@/i18n/LocaleProvider";
import type { Messages } from "@/i18n/messages/en";

type PlanKey = "starter" | "growth" | "scale";

/** v1 catalog keys still resolve to their v2 plan (spec: plus -> growth, pro -> scale). */
const LEGACY_PLAN_KEY_ALIASES: Record<string, PlanKey> = {
  plus: "growth",
  pro: "scale",
};

const resolvePlanKey = (name: string): string => {
  const key = name.trim().toLowerCase();
  return LEGACY_PLAN_KEY_ALIASES[key] ?? key;
};

interface Plan {
  key: PlanKey;
  name: string;
  monthlyPrice: number;
  includedConversations: number;
  overageRatePerConversation: number;
  features: string[];
  popular: boolean;
  buttonText: string;
  buttonVariant: "outline" | "warm";
}

const COMING_SOON_FEATURES: string[] = [];

/** Plans are billed monthly only (pricing v2); kept as an analytics property. */
const BILLING_PERIOD = "monthly";

/** Enterprise starts here; the final price is custom (contact sales). */
const ENTERPRISE_FROM_MONTHLY_PRICE = 1500;

/** Fallback for the price per extra conversation (every plan, pricing v2). */
const FALLBACK_OVERAGE_RATE_PER_CONVERSATION = 0.3;

/** Static v2 fallbacks. Copy (name/features/buttonText) comes from the locale
 *  dictionary; price, included conversations and overage rate are overlaid
 *  from the backend catalog in `mergePlansWithBackend`. */
const buildPlans = (messages: Messages): Plan[] => [
  {
    key: "starter",
    name: messages.pricing.plans.starter.name,
    monthlyPrice: 79,
    includedConversations: 260,
    overageRatePerConversation: FALLBACK_OVERAGE_RATE_PER_CONVERSATION,
    features: messages.pricing.plans.starter.features,
    popular: false,
    buttonText: messages.common.getStarted,
    buttonVariant: "outline",
  },
  {
    key: "growth",
    name: messages.pricing.plans.growth.name,
    monthlyPrice: 199,
    includedConversations: 660,
    overageRatePerConversation: FALLBACK_OVERAGE_RATE_PER_CONVERSATION,
    features: messages.pricing.plans.growth.features,
    popular: true,
    buttonText: messages.common.getStarted,
    buttonVariant: "warm",
  },
  {
    key: "scale",
    name: messages.pricing.plans.scale.name,
    monthlyPrice: 499,
    includedConversations: 1650,
    overageRatePerConversation: FALLBACK_OVERAGE_RATE_PER_CONVERSATION,
    features: messages.pricing.plans.scale.features,
    popular: false,
    buttonText: messages.common.getStarted,
    buttonVariant: "outline",
  },
];

/** Plan keys that only exist in the v2 catalog. */
const V2_ONLY_PLAN_KEYS = new Set<string>(["growth", "scale"]);

/**
 * True when the backend catalog already bills in conversations (pricing v2).
 * A v1 backend serves the old credit catalog (Starter/Plus/Pro at v1 prices
 * and credit allowances), which must not overwrite the v2 fallbacks.
 */
const isConversationCatalog = (backendPlans: PublicPlanDTO[] | null): boolean =>
  backendPlans !== null &&
  backendPlans.some(
    (plan) =>
      plan.included_conversations != null ||
      plan.overage_rate_per_conversation != null ||
      V2_ONLY_PLAN_KEYS.has(plan.name.trim().toLowerCase()),
  );

/**
 * Overlays backend prices and included conversations (single source of
 * truth) onto the static template, which keeps copy-only fields (feature
 * bullets, button text). Reads the v2 keys first and falls back to the legacy
 * credit-named keys, which the backend keeps populated with the same values
 * for one release. When the catalog hasn't loaded, is still v1, or a plan is
 * missing, the hardcoded v2 values act as a fallback so the page never
 * blanks or shows stale plans.
 */
const mergePlansWithBackend = (
  templates: Plan[],
  backendPlans: PublicPlanDTO[] | null,
): Plan[] => {
  if (!backendPlans || !isConversationCatalog(backendPlans)) return templates;
  return templates.map((template) => {
    const backendPlan = backendPlans.find(
      (plan) => resolvePlanKey(plan.name) === template.key,
    );
    if (!backendPlan) return template;
    return {
      ...template,
      monthlyPrice: backendPlan.monthly_price ?? template.monthlyPrice,
      includedConversations:
        backendPlan.included_conversations ??
        backendPlan.included_credits ??
        template.includedConversations,
      overageRatePerConversation:
        backendPlan.overage_rate_per_conversation ??
        backendPlan.overage_rate_per_credit ??
        template.overageRatePerConversation,
      popular: backendPlan.is_popular ?? template.popular,
    };
  });
};

const formatOverageRate = (rate: number): string => {
  return rate.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

/** Mirrors the backend coupon math (`_floor_price`). */
const applyDiscount = (standardPrice: number, discountPercent: number): number =>
  discountPercent > 0
    ? Math.floor(standardPrice * (1 - discountPercent / 100))
    : standardPrice;

const CARD_HOVER_MS = "duration-500";
const CARD_HOVER_EASE = `${CARD_HOVER_MS} ease-out`;

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

/** Matches the `?code=` query used on early-access email and install links. */
const COUPON_URL_PARAM = "code";

const readCouponFromSearchParams = (params: URLSearchParams): string => {
  const raw = params.get(COUPON_URL_PARAM);
  return raw ? normalizeCouponInput(raw) : "";
};

const withCouponSearchParam = (
  params: URLSearchParams,
  code: string | null,
): URLSearchParams => {
  const next = new URLSearchParams(params);
  if (code) {
    next.set(COUPON_URL_PARAM, code);
  } else {
    next.delete(COUPON_URL_PARAM);
  }
  return next;
};

const couponErrorMessage = (
  code: CouponErrorCode | string,
  errors: Messages["pricing"]["coupon"]["errors"],
): string => {
  switch (code) {
    case "COUPON_NOT_FOUND":
      return errors.notFound;
    case "COUPON_EXPIRED":
      return errors.expired;
    case "COUPON_NOT_YET_ACTIVE":
      return errors.notYetActive;
    case "COUPON_INVALID_FORMAT":
      return errors.invalidFormat;
    case "COUPON_ALREADY_CLAIMED_BY_ANOTHER_STORE":
      return errors.alreadyClaimed;
    case "COUPON_INVALID_ACCESS_TOKEN":
      return errors.invalidToken;
    default:
      return errors.generic;
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
  const [searchParams, setSearchParams] = useSearchParams();
  const href = useLocaleHref();
  const messages = useMessages();
  const numberLocale = localeTag(useLocale());
  const posthog = usePostHog();
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDTO | null>(null);
  const [couponValue, setCouponValue] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [backendPlans, setBackendPlans] = useState<PublicPlanDTO[] | null>(
    null,
  );
  const couponInputRef = useRef<HTMLInputElement>(null);
  const applyInFlightRef = useRef(false);
  const didAutoApplyUrlCouponRef = useRef(false);

  const persistCouponUrlParam = (code: string | null) => {
    setSearchParams(
      (prev) => {
        const next = withCouponSearchParam(prev, code);
        return next.toString() === prev.toString() ? prev : next;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    let active = true;
    fetchPublicPlans()
      .then((catalog) => {
        if (active) setBackendPlans(catalog);
      })
      .catch(() => {
        // Keep the hardcoded fallback prices if the catalog can't load.
      });
    return () => {
      active = false;
    };
  }, []);

  const plans = useMemo(
    () => mergePlansWithBackend(buildPlans(messages), backendPlans),
    [backendPlans, messages],
  );
  const catalogIsV2 = isConversationCatalog(backendPlans);

  const showEarlyAccess = appliedCoupon !== null;
  const earlyAccessIntroMonths = appliedCoupon?.summary.intro_months ?? 0;

  const handlePlanClick = (planName: string) => {
    posthog.capture("pricing_plan_clicked", {
      plan: planName.toLowerCase(),
      billing_period: BILLING_PERIOD,
      early_access_enabled: showEarlyAccess,
      coupon_code: appliedCoupon?.code ?? null,
      destination: "shopify_app_listing",
    });
    openBizmisShopifyAppListing();
  };

  const handleContactSales = () => {
    posthog.capture("pricing_plan_clicked", {
      plan: "enterprise",
      billing_period: BILLING_PERIOD,
      early_access_enabled: showEarlyAccess,
      coupon_code: appliedCoupon?.code ?? null,
    });
    navigate(
      `${href("/contact")}?subject=${encodeURIComponent(
        messages.pricing.enterpriseInquirySubject,
      )}`,
    );
  };

  /** Coupon prices are only trusted from a v2 backend; a v1 backend prices
   *  its coupons against the old plans, so the percent is applied locally. */
  const findCouponPriceFor = (plan: Plan) => {
    if (!appliedCoupon || !catalogIsV2) return null;
    return (
      appliedCoupon.prices.find(
        (price) => resolvePlanKey(price.plan_name) === plan.key,
      ) ?? null
    );
  };

  const tryApplyEarlyAccessCoupon = async (
    rawCode?: string,
    options?: { celebrate?: boolean },
  ) => {
    if (showEarlyAccess || isApplyingCoupon || applyInFlightRef.current) {
      return;
    }

    const entered = normalizeCouponInput(rawCode ?? couponValue);
    if (!entered) {
      setCouponError(messages.pricing.coupon.errors.empty);
      return;
    }

    persistCouponUrlParam(entered);
    setCouponValue(entered);
    setCouponError(null);
    applyInFlightRef.current = true;
    setIsApplyingCoupon(true);
    try {
      const accessToken = await requestCouponAccessToken();
      const coupon = await validateCoupon(entered, accessToken);
      setAppliedCoupon(coupon);
      setCouponValue(coupon.code);
      persistCouponUrlParam(coupon.code);
      posthog.capture("pricing_coupon_applied", {
        coupon: coupon.code,
        coupon_kind: coupon.kind,
        billing_period: BILLING_PERIOD,
      });
      if (options?.celebrate !== false) {
        fireEarlyAccessConfetti(couponInputRef.current);
      }
    } catch (error) {
      const errorCode =
        error instanceof CouponApiError ? error.code : "NETWORK_ERROR";
      setCouponError(
        couponErrorMessage(errorCode, messages.pricing.coupon.errors),
      );
      posthog.capture("pricing_coupon_apply_failed", {
        coupon: entered,
        error_code: errorCode,
        billing_period: BILLING_PERIOD,
      });
    } finally {
      applyInFlightRef.current = false;
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
    persistCouponUrlParam(null);
    posthog.capture("pricing_coupon_removed", {
      coupon: previousCode,
      billing_period: BILLING_PERIOD,
    });
  };

  useEffect(() => {
    if (didAutoApplyUrlCouponRef.current) {
      return;
    }
    const fromUrl = readCouponFromSearchParams(searchParams);
    if (!fromUrl) {
      return;
    }
    didAutoApplyUrlCouponRef.current = true;
    void tryApplyEarlyAccessCoupon(fromUrl, { celebrate: false });
    // Apply the landing `?code=` once on mount; later writes keep the URL in sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDisplayPrice = (plan: Plan): number => {
    if (!appliedCoupon) return plan.monthlyPrice;
    const couponPrice = findCouponPriceFor(plan);
    if (couponPrice) return couponPrice.monthly;
    return applyDiscount(
      plan.monthlyPrice,
      appliedCoupon.summary.monthly_discount_percent,
    );
  };

  const getDiscountPercent = (plan: Plan): number => {
    // With a coupon applied, use the campaign's single discount percent so
    // every card shows the same badge, avoiding per-plan rounding drift like
    // 34% vs 33%.
    if (appliedCoupon && appliedCoupon.summary.monthly_discount_percent > 0) {
      return appliedCoupon.summary.monthly_discount_percent;
    }
    const currentPrice = getDisplayPrice(plan);
    const standardPrice = plan.monthlyPrice;
    if (currentPrice >= standardPrice) return 0;
    return Math.round(((standardPrice - currentPrice) / standardPrice) * 100);
  };

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
            <SectionBadge icon={FaTag} text={messages.pricing.badge} />
          </div>
          <h2 className="mb-4 font-heading text-3xl font-bold leading-tight text-foreground sm:mb-6 sm:text-4xl sm:leading-tight lg:text-5xl xl:text-6xl">
            {messages.pricing.title}
          </h2>
          <p className="mx-auto max-w-3xl px-2 font-body text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
            {messages.pricing.lead}
          </p>
        </div>

        {/* Free plan — live-but-capped lead-in above the paid grid */}
        <div className="mx-auto mb-5 max-w-7xl sm:mb-6">
          <div className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-primary/30 bg-background/75 p-5 shadow-soft backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-6 lg:px-7">
            <div className="flex flex-col gap-1.5 sm:max-w-2xl">
              <div className="flex items-baseline gap-2.5">
                <h3 className="font-heading text-xl font-bold text-foreground lg:text-2xl">
                  {messages.pricing.free.name}
                </h3>
                <span className="font-heading text-2xl font-bold tabular-nums text-foreground lg:text-3xl">
                  $0
                </span>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-heading text-[0.65rem] font-semibold uppercase tracking-wide text-primary-dark">
                  {messages.pricing.free.noCommitment}
                </span>
              </div>
              <p className="font-body text-sm leading-relaxed text-foreground/80">
                {messages.pricing.free.description(
                  FREE_PLAN_CONVERSATIONS_ALLOWANCE.toLocaleString(numberLocale),
                )}
              </p>
            </div>
            <div className="shrink-0">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handlePlanClick("Free")}
                className="group/free w-full border border-primary/40 bg-primary/5 font-semibold text-primary-dark shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary/10 sm:w-auto"
              >
                <span>{messages.pricing.free.cta}</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/free:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Pricing Cards - 4 columns */}
        <div
          id="pricing-cards"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 max-w-7xl mx-auto"
        >
          {plans.map((plan, index) => {
            const displayPrice = getDisplayPrice(plan);
            const discountPercent = getDiscountPercent(plan);
            const hasDiscount = discountPercent > 0;

            return (
              <div
                key={plan.key}
                className={`group relative flex flex-col transition-all duration-500 ${
                  plan.popular
                    ? "scale-[1.02] xl:scale-105"
                    : "hover:scale-[1.02]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 z-30 flex w-full -translate-x-1/2 transform justify-center">
                    <div className="whitespace-nowrap rounded-full border-2 border-primary bg-background/25 px-4 py-1.5 font-heading text-sm font-semibold text-primary backdrop-blur-md transition-colors group-hover:border-primary-foreground/85 group-hover:text-primary-foreground group-hover:bg-primary-light/85">
                      {messages.pricing.popular}
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
                        showEarlyAccess
                          ? messages.pricing.introPeriodTitle
                          : messages.pricing.discountTitle(discountPercent)
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
                          {messages.pricing.off}
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
                              ${formatPrice(plan.monthlyPrice)}
                            </span>
                          )}
                          <span className="font-heading text-3xl font-bold tabular-nums text-foreground transition-colors group-hover:text-primary-foreground lg:text-4xl">
                            ${formatExactPrice(displayPrice)}
                          </span>
                          <span className="font-body text-sm text-foreground/70 transition-colors group-hover:text-primary-foreground/80">
                            {messages.pricing.perMonth}
                          </span>
                        </div>

                        {showEarlyAccess && earlyAccessIntroMonths > 0 && (
                          <p className="flex items-center justify-center gap-1 text-sm text-foreground/70 transition-colors group-hover:text-primary-foreground/85">
                            <Clock className="h-3.5 w-3.5" />
                            {messages.pricing.introMonths(
                              earlyAccessIntroMonths,
                              formatPrice(plan.monthlyPrice),
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-3 space-y-1 border-b border-border/70 pb-3 transition-colors group-hover:border-primary-foreground/30 sm:mb-4 sm:space-y-1.5 sm:pb-4">
                      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                        <span className="font-heading text-base font-bold tabular-nums text-foreground/80 transition-colors group-hover:text-primary-foreground sm:text-lg">
                          {plan.includedConversations.toLocaleString(numberLocale)}
                        </span>
                        <span className="text-xs font-medium text-foreground/65 transition-colors group-hover:text-primary-foreground/85">
                          {messages.pricing.conversationsPerMonth}
                        </span>
                      </div>
                      <p className="pt-0.5 text-xs font-medium leading-snug text-foreground/65 transition-colors group-hover:text-primary-foreground/85">
                        {messages.pricing.extraConversations(
                          `$${formatOverageRate(plan.overageRatePerConversation)}`,
                        )}
                      </p>
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
                  {messages.pricing.enterprise.name}
                </h3>
                <div className="mb-2 sm:mb-3">
                  <div className="flex flex-wrap items-baseline justify-center gap-1">
                    <span className="font-body text-sm text-primary-foreground/75">
                      {messages.pricing.enterprise.priceFrom}
                    </span>
                    <span className="font-heading text-3xl font-bold tabular-nums lg:text-4xl">
                      ${formatPrice(ENTERPRISE_FROM_MONTHLY_PRICE)}
                    </span>
                    <span className="font-body text-sm text-primary-foreground/75">
                      {messages.pricing.perMonth}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-primary-foreground/75 transition-colors group-hover:text-primary-foreground/90">
                  {messages.pricing.enterprise.description}
                </p>
              </div>

              <div className="mb-6 flex-grow sm:mb-8">
                <p className="mb-3 text-sm font-medium text-primary-foreground/75 transition-colors group-hover:text-primary-foreground/90">
                  {messages.pricing.enterprise.everythingInScale}
                </p>
                <ul className="space-y-2.5 sm:space-y-3">
                  {messages.pricing.enterprise.features.map((feature, idx) => (
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
                  <span>{messages.common.contactSales}</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/ent:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* What one conversation is (pricing v2 unit) */}
        <div className="mx-auto mt-6 flex max-w-3xl justify-center sm:mt-8">
          <p className="inline-flex items-start gap-2 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-2.5 text-left text-xs font-medium leading-relaxed text-primary-dark backdrop-blur-md sm:text-sm">
            <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
            <span>{messages.pricing.conversationDefinition}</span>
          </p>
        </div>

        {/* Billing Summary */}
        <div className="mt-10 text-center sm:mt-12">
          <div className="mb-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-foreground/75 sm:mb-10 sm:gap-x-6 sm:gap-y-3 lg:gap-x-8">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>{messages.pricing.guarantees.spendLimit}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>{messages.pricing.guarantees.cancelAnytime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span>{messages.pricing.guarantees.moneyBack}</span>
            </div>
          </div>
        </div>

        {/* Discount coupon — below plan grid, above FAQs (Early Access copy only after valid apply) */}
        <div className="mx-auto mb-10 max-w-xl px-2">
          {!showEarlyAccess ? (
            <p className="mb-4 text-center text-sm text-muted-foreground">
              {messages.pricing.coupon.prompt}
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
              placeholder={messages.pricing.coupon.placeholder}
              autoComplete="off"
              spellCheck={false}
              aria-label={messages.pricing.coupon.inputAria}
            />
            {showEarlyAccess ? (
              <Button
                type="button"
                variant="outline"
                className="shrink-0 border-primary/40 font-semibold text-primary-dark sm:min-w-[8.5rem]"
                onClick={removeAppliedCoupon}
              >
                {messages.pricing.coupon.remove}
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                className="shrink-0 sm:w-32"
                onClick={() => void tryApplyEarlyAccessCoupon()}
                disabled={isApplyingCoupon}
              >
                {isApplyingCoupon
                  ? messages.pricing.coupon.applying
                  : messages.pricing.coupon.apply}
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
                  {messages.pricing.coupon.active(appliedCoupon.summary.label)}
                </span>
              </div>
              <p className="mt-2 text-center text-foreground">
                <span className="font-semibold">
                  {messages.pricing.coupon.viewingPricing(
                    appliedCoupon.summary.label,
                    EARLY_ACCESS_STORE_CAP,
                  )}
                </span>{" "}
                <span className="text-foreground/85">
                  {messages.pricing.coupon.shapeProduct}{" "}
                  <span className="font-semibold text-foreground">
                    {messages.pricing.coupon.monthlyDiscount(
                      appliedCoupon.summary.monthly_discount_percent,
                      earlyAccessIntroMonths,
                    )}
                  </span>
                  {messages.pricing.coupon.discountEnd}
                </span>
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-2 text-center">
          <a
            href={`${href("/faqs")}#pricing-billing`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-dark"
          >
            {messages.pricing.viewAllFaqs}{" "}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
