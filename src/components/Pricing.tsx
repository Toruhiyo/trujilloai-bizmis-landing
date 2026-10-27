import { Check, ArrowRight, ChevronDown, Clock, ShieldCheck, Tag } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHead from "@/components/site/PageHead";
import Reveal from "@/components/landing/Reveal";
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
  /** Monthly equivalent of the yearly price (billed yearly, upfront). */
  yearlyMonthlyPrice: number;
  includedConversations: number;
  overageRatePerConversation: number;
  features: string[];
  popular: boolean;
  buttonText: string;
  buttonVariant: "outline" | "warm";
}

const COMING_SOON_FEATURES: string[] = [];

/** Each card shows its top features; longer lists open on "See all features". */
const FEATURES_SHOWN = 3;
/** Enterprise already leads with "Everything in Scale, plus:", so one fewer. */
const ENTERPRISE_FEATURES_SHOWN = 2;

type BillingPeriod = "monthly" | "yearly";

const MONTHS_PER_YEAR = 12;

/** Yearly billing is about 20% off the monthly price. Used when the backend
 *  catalog has no yearly price for a plan (the v2 catalog returns null). */
const YEARLY_FALLBACK_DISCOUNT_PERCENT = 20;

/** Enterprise starts here; the final price is custom (contact sales). */
const ENTERPRISE_FROM_MONTHLY_PRICE = 1500;

/** Fallback for the price per extra session (every plan, pricing v2). */
const FALLBACK_OVERAGE_RATE_PER_CONVERSATION = 0.3;

/** 20% off the monthly price, rounded down to whole dollars ($79 -> $63). */
const yearlyFallbackMonthlyPrice = (monthlyPrice: number): number =>
  Math.floor(monthlyPrice * (1 - YEARLY_FALLBACK_DISCOUNT_PERCENT / 100));

/** Static v2 fallbacks. Copy (name/features/buttonText) comes from the locale
 *  dictionary; price, included sessions and overage rate are overlaid
 *  from the backend catalog in `mergePlansWithBackend`. */
const buildPlans = (messages: Messages): Plan[] => [
  {
    key: "starter",
    name: messages.pricing.plans.starter.name,
    monthlyPrice: 79,
    yearlyMonthlyPrice: yearlyFallbackMonthlyPrice(79),
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
    yearlyMonthlyPrice: yearlyFallbackMonthlyPrice(199),
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
    yearlyMonthlyPrice: yearlyFallbackMonthlyPrice(499),
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
 * True when the backend catalog is already the v2 catalog (billed in
 * sessions, formerly named conversations). A v1 backend serves the old credit
 * catalog (Starter/Plus/Pro at v1 prices and credit allowances), which must
 * not overwrite the v2 fallbacks.
 */
const isConversationCatalog = (backendPlans: PublicPlanDTO[] | null): boolean =>
  backendPlans !== null &&
  backendPlans.some(
    (plan) =>
      plan.included_sessions != null ||
      plan.overage_rate_per_session != null ||
      plan.included_conversations != null ||
      plan.overage_rate_per_conversation != null ||
      V2_ONLY_PLAN_KEYS.has(plan.name.trim().toLowerCase()),
  );

/**
 * Overlays backend prices and included sessions (single source of truth)
 * onto the static template, which keeps copy-only fields (feature bullets,
 * button text). Reads the session keys first and falls back to the older
 * conversation- and credit-named keys, which the backend keeps populated with
 * the same values (a backend from before the session rename only has those).
 * When the catalog hasn't loaded, is still v1, or a plan is missing, the
 * hardcoded v2 values act as a fallback so the page never blanks or shows
 * stale plans. The yearly price is `yearly_price / 12` when the catalog has
 * one, else 20% off the monthly price rounded down.
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
    const monthlyPrice = backendPlan.monthly_price ?? template.monthlyPrice;
    return {
      ...template,
      monthlyPrice,
      yearlyMonthlyPrice:
        backendPlan.yearly_price != null
          ? backendPlan.yearly_price / MONTHS_PER_YEAR
          : yearlyFallbackMonthlyPrice(monthlyPrice),
      includedConversations:
        backendPlan.included_sessions ??
        backendPlan.included_conversations ??
        backendPlan.included_credits ??
        template.includedConversations,
      overageRatePerConversation:
        backendPlan.overage_rate_per_session ??
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
  // monthly first: the Shopify app bills monthly only for now (yearly is shown, not yet sold)
  const [isYearly, setIsYearly] = useState(false);
  /** One switch for every card, so the row of cards stays even. */
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const billingPeriod: BillingPeriod = isYearly ? "yearly" : "monthly";
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
      billing_period: billingPeriod,
      early_access_enabled: showEarlyAccess,
      coupon_code: appliedCoupon?.code ?? null,
      destination: "shopify_app_listing",
    });
    openBizmisShopifyAppListing();
  };

  const handleContactSales = () => {
    posthog.capture("pricing_plan_clicked", {
      plan: "enterprise",
      billing_period: billingPeriod,
      early_access_enabled: showEarlyAccess,
      coupon_code: appliedCoupon?.code ?? null,
    });
    navigate(
      `${href("/contact")}?subject=${encodeURIComponent(
        messages.pricing.enterpriseInquirySubject,
      )}`,
    );
  };

  const handleBillingToggle = (yearly: boolean) => {
    posthog.capture("billing_period_toggled", {
      billing_period: yearly ? "yearly" : "monthly",
      early_access_enabled: showEarlyAccess,
    });
    setIsYearly(yearly);
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
        billing_period: billingPeriod,
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
        billing_period: billingPeriod,
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
      billing_period: billingPeriod,
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

  const couponYearlyDiscountPercent =
    appliedCoupon?.summary.yearly_discount_percent ?? 0;

  /** The coupon's yearly price (monthly equivalent), when the coupon has a
   *  yearly discount: the backend's `yearly_monthly_equivalent`, else its
   *  yearly percent off the monthly price. The coupon's monthly percent is an
   *  intro discount on monthly billing, so it is not applied to yearly. */
  const getCouponYearlyPrice = (plan: Plan): number | null => {
    if (!appliedCoupon) return null;
    const couponPrice = findCouponPriceFor(plan);
    if (couponPrice?.yearly_monthly_equivalent != null) {
      return couponPrice.yearly_monthly_equivalent;
    }
    if (couponYearlyDiscountPercent > 0) {
      return applyDiscount(plan.monthlyPrice, couponYearlyDiscountPercent);
    }
    return null;
  };

  /** True when the yearly card shows the coupon's yearly price rather than
   *  the standard yearly price (the coupon never makes yearly dearer). */
  const isCouponYearlyPriceShown = (plan: Plan): boolean => {
    const couponYearlyPrice = getCouponYearlyPrice(plan);
    return (
      couponYearlyPrice !== null && couponYearlyPrice < plan.yearlyMonthlyPrice
    );
  };

  const getDisplayPrice = (plan: Plan): number => {
    if (isYearly) {
      return isCouponYearlyPriceShown(plan)
        ? (getCouponYearlyPrice(plan) as number)
        : plan.yearlyMonthlyPrice;
    }
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
    if (isYearly) {
      if (isCouponYearlyPriceShown(plan) && couponYearlyDiscountPercent > 0) {
        return couponYearlyDiscountPercent;
      }
    } else if (
      appliedCoupon &&
      appliedCoupon.summary.monthly_discount_percent > 0
    ) {
      return appliedCoupon.summary.monthly_discount_percent;
    }
    const currentPrice = getDisplayPrice(plan);
    const standardPrice = plan.monthlyPrice;
    if (currentPrice >= standardPrice) return 0;
    return Math.round(((standardPrice - currentPrice) / standardPrice) * 100);
  };

  /** A tick in its cream disc (the features, the reassurances). */
  const tick = (
    <span className="bzl-price-tick" aria-hidden="true">
      <Check />
    </span>
  );

  /** A card's feature list: the top few, the rest behind "See all features". */
  const featureList = (features: string[], count = FEATURES_SHOWN) => {
    const hasMore = features.length > count;
    const shown = showAllFeatures || !hasMore ? features : features.slice(0, count);
    return (
      <div className="bzl-price-features">
        <ul className="space-y-[var(--price-li-gap)]">
          {shown.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              {tick}
              <span className="flex items-center">
                {feature}
                {COMING_SOON_FEATURES.includes(feature) && (
                  <PricingPlanFeatureSoon />
                )}
              </span>
            </li>
          ))}
        </ul>
        {hasMore && (
          <button
            type="button"
            className="bzl-price-more"
            aria-expanded={showAllFeatures}
            aria-controls="pricing-cards"
            onClick={() => setShowAllFeatures((open) => !open)}
          >
            {showAllFeatures
              ? messages.pricing.fewerFeatures
              : messages.pricing.seeAllFeatures}
            <ChevronDown className={cn("h-4 w-4 transition-transform", showAllFeatures && "rotate-180")} aria-hidden="true" />
          </button>
        )}
      </div>
    );
  };

  return (
    <section id="pricing" className="bzl-price-page relative pb-[clamp(3rem,8svh,6rem)]">
      {/* The page's head, compact, the billing switch right under it: the
          whole offer (head, switch, Free, the four cards) fits one desktop screen */}
      <div className="bzl-wrap bzl-price-hero">
        <PageHead
          icon={Tag}
          eyebrow={messages.pricing.badge}
          title={messages.pricing.title}
        >
          {/* The lead and the billing period side by side on desktop, stacked on phones
              (Monthly is the default; the guarantee is yearly only) */}
          <Reveal delay={160} className="bzl-price-sub">
            <p className="bzl-site-lead">{messages.pricing.lead}</p>
            <div className="bzl-site-seg" role="group">
              <button
                type="button"
                aria-pressed={!isYearly}
                onClick={() => isYearly && handleBillingToggle(false)}
              >
                {messages.pricing.monthly}
              </button>
              <button
                type="button"
                aria-pressed={isYearly}
                onClick={() => !isYearly && handleBillingToggle(true)}
              >
                {messages.pricing.yearly}
              </button>
            </div>
          </Reveal>
        </PageHead>
      </div>

      {/* The plans, on the landing's cream sheet */}
      <div className="bzl-site-sheet bzl-price-sheet">
        <div className="bzl-wrap">
          {/* Free plan: the live-but-capped lead-in above the paid grid */}
          <div className="bzl-site-card bzl-price-free">
            <div className="flex min-w-0 flex-col gap-x-5 gap-y-1 lg:flex-row lg:items-center">
              <div className="flex shrink-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="bzl-price-name">{messages.pricing.free.name}</h3>
                <span className="bzl-price-amount is-free">$0</span>
                <span className="bzl-price-chip self-center">
                  {messages.pricing.free.noCommitment}
                </span>
              </div>
              <p className="bzl-price-muted text-[0.9375rem] leading-snug">
                {messages.pricing.free.description(
                  FREE_PLAN_CONVERSATIONS_ALLOWANCE.toLocaleString(numberLocale),
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handlePlanClick("Free")}
              className="bzl-site-btn is-ghost shrink-0"
            >
              {messages.pricing.free.cta}
              <ArrowRight className="is-arrow" aria-hidden="true" />
            </button>
          </div>

          {/* Paid plans and Enterprise */}
          <div id="pricing-cards" className="bzl-price-grid">
            {plans.map((plan) => {
              const displayPrice = getDisplayPrice(plan);
              const discountPercent = getDiscountPercent(plan);
              const hasDiscount = discountPercent > 0;

              return (
                <div
                  key={plan.key}
                  className={cn(
                    "bzl-site-card bzl-price-card",
                    plan.popular && "is-popular",
                  )}
                >
                  {plan.popular && (
                    <span className="bzl-site-hand bzl-price-popular">
                      {messages.pricing.popular}
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <h3 className="bzl-price-name pt-1">{plan.name}</h3>
                    {hasDiscount && (
                      <span
                        className="bzl-price-off"
                        title={
                          !isYearly && showEarlyAccess
                            ? messages.pricing.introPeriodTitle
                            : messages.pricing.discountTitle(discountPercent)
                        }
                      >
                        {discountPercent}% {messages.pricing.off}
                      </span>
                    )}
                  </div>

                  {/* Price block ("billed yearly" sits under /mo, beside the price, so yearly adds no height) */}
                  <div className="bzl-price-block">
                    <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
                      {hasDiscount && (
                        <span className="bzl-price-was self-baseline">
                          ${formatPrice(plan.monthlyPrice)}
                        </span>
                      )}
                      <span className="bzl-price-amount">
                        ${formatExactPrice(displayPrice)}
                      </span>
                      <span className="flex flex-col pb-[0.2em] leading-tight">
                        <span className="bzl-price-per">
                          {messages.pricing.perMonth}
                        </span>
                        {isYearly && (
                          <span className="bzl-price-muted whitespace-nowrap text-[0.75rem] font-medium">
                            {messages.pricing.billedYearly}
                          </span>
                        )}
                      </span>
                    </div>
                    {!isYearly &&
                      showEarlyAccess &&
                      earlyAccessIntroMonths > 0 && (
                        <p className="bzl-price-muted mt-1.5 flex items-center gap-1.5 text-[0.8125rem]">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          {messages.pricing.introMonths(
                            earlyAccessIntroMonths,
                            formatPrice(plan.monthlyPrice),
                          )}
                        </p>
                      )}
                  </div>

                  {/* Sessions */}
                  <div className="bzl-price-sessions">
                    <p className="flex flex-wrap items-baseline gap-x-1.5">
                      <span className="text-lg font-extrabold tabular-nums tracking-[-0.02em]">
                        {plan.includedConversations.toLocaleString(numberLocale)}
                      </span>
                      <span className="bzl-price-muted text-sm font-medium">
                        {messages.pricing.conversationsPerMonth}
                      </span>
                    </p>
                    <p className="bzl-price-muted mt-0.5 text-[0.75rem] leading-snug">
                      {messages.pricing.extraConversations(
                        `$${formatOverageRate(plan.overageRatePerConversation)}`,
                      )}
                    </p>
                  </div>

                  {/* Features: the top few, the rest on demand */}
                  {featureList(plan.features)}

                  <div className="mt-auto">
                    {/* The 30-day money-back guarantee covers yearly plans only
                        (above the button, so every card's button lines up). */}
                    {isYearly && (
                      <p className="bzl-price-note">
                        <ShieldCheck aria-hidden="true" />
                        <span>{messages.pricing.guarantees.cardNote}</span>
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => handlePlanClick(plan.name)}
                      className={cn(
                        "bzl-site-btn w-full",
                        plan.buttonVariant === "outline" && "is-ghost",
                      )}
                    >
                      {plan.buttonText}
                      <ArrowRight className="is-arrow" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Enterprise */}
            <div className="bzl-site-card bzl-price-card is-ink">
              <h3 className="bzl-price-name pt-1">
                {messages.pricing.enterprise.name}
              </h3>
              {/* "From" over /mo, beside the price (as "billed yearly" on the plans), so it never wraps */}
              <div className="bzl-price-block flex flex-wrap items-end gap-x-2 gap-y-1">
                <span className="bzl-price-amount">
                  ${formatPrice(ENTERPRISE_FROM_MONTHLY_PRICE)}
                </span>
                <span className="flex flex-col pb-[0.2em] leading-tight">
                  <span className="bzl-price-muted whitespace-nowrap text-[0.75rem] font-medium">
                    {messages.pricing.enterprise.priceFrom}
                  </span>
                  <span className="bzl-price-per">{messages.pricing.perMonth}</span>
                </span>
              </div>
              {/* in the sessions box's place: what it is, then "Everything in Scale, plus:" */}
              <div className="bzl-price-sessions is-ink">
                <p className="text-[0.8125rem] leading-snug">
                  {messages.pricing.enterprise.description}
                </p>
              </div>
              <p className="bzl-price-plus">
                {messages.pricing.enterprise.everythingInScale}
              </p>
              {featureList(messages.pricing.enterprise.features, ENTERPRISE_FEATURES_SHOWN)}
              <div className="mt-auto">
                <button
                  type="button"
                  onClick={handleContactSales}
                  className="bzl-site-btn is-ink w-full"
                >
                  {messages.common.contactSales}
                  <ArrowRight className="is-arrow" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Reassurances */}
          <ul className="mx-auto mt-[clamp(1.75rem,4svh,2.5rem)] flex w-fit max-w-full flex-col items-start gap-x-8 gap-y-3 text-[0.9375rem] font-medium sm:w-auto sm:max-w-5xl sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            {[
              messages.pricing.guarantees.spendLimit,
              messages.pricing.guarantees.cancelAnytime,
              messages.pricing.guarantees.moneyBack,
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                {tick}
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Discount code: below the plans (Early Access copy only after a valid apply) */}
      <div className="bzl-wrap">
        <div className="mx-auto mt-[clamp(2.5rem,7svh,4.5rem)] max-w-xl">
          {!showEarlyAccess ? (
            <p className="bzl-price-muted mb-4 text-center text-[0.9375rem] leading-relaxed">
              {messages.pricing.coupon.prompt}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <input
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
              className="bzl-site-input font-mono uppercase tracking-wide sm:min-w-0 sm:flex-1"
              placeholder={messages.pricing.coupon.placeholder}
              autoComplete="off"
              spellCheck={false}
              aria-label={messages.pricing.coupon.inputAria}
            />
            {showEarlyAccess ? (
              <button
                type="button"
                className="bzl-site-btn is-ghost shrink-0"
                onClick={removeAppliedCoupon}
              >
                {messages.pricing.coupon.remove}
              </button>
            ) : (
              <button
                type="button"
                className="bzl-site-btn shrink-0 sm:min-w-[8rem]"
                onClick={() => void tryApplyEarlyAccessCoupon()}
                disabled={isApplyingCoupon}
              >
                {isApplyingCoupon
                  ? messages.pricing.coupon.applying
                  : messages.pricing.coupon.apply}
              </button>
            )}
          </div>
          {couponError ? (
            <p className="mt-3 text-center text-sm text-destructive" role="alert">
              {couponError}
            </p>
          ) : null}

          {showEarlyAccess && appliedCoupon ? (
            <div className="relative mt-9 rounded-[var(--bzl-radius-card)] bg-[var(--site-sheet)] px-5 pb-6 pt-8 shadow-[inset_0_0_0_1px_var(--site-sheet-line)] sm:px-7">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[hsl(var(--primary))] px-3.5 py-1 text-[0.8125rem] font-bold text-white">
                {messages.pricing.coupon.active(appliedCoupon.summary.label)}
              </span>
              <p className="text-center leading-relaxed">
                <span className="font-semibold">
                  {messages.pricing.coupon.viewingPricing(
                    appliedCoupon.summary.label,
                    EARLY_ACCESS_STORE_CAP,
                  )}
                </span>{" "}
                <span className="bzl-price-muted">
                  {messages.pricing.coupon.shapeProduct}{" "}
                  <span className="font-semibold text-[var(--site-ink)]">
                    {messages.pricing.coupon.monthlyDiscount(
                      appliedCoupon.summary.monthly_discount_percent,
                      earlyAccessIntroMonths,
                    )}
                  </span>
                  {couponYearlyDiscountPercent > 0 ? (
                    <>
                      {" "}
                      {messages.pricing.coupon.onMonthlyBilling}{" "}
                      <span className="font-semibold text-[var(--site-ink)]">
                        {messages.pricing.coupon.yearlyDiscount(
                          couponYearlyDiscountPercent,
                        )}
                      </span>{" "}
                      {messages.pricing.coupon.whenYearlySelected}
                    </>
                  ) : (
                    messages.pricing.coupon.discountEnd
                  )}
                </span>
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-10 text-center">
          <a
            href={`${href("/faqs")}#pricing-billing`}
            className="bzl-site-link is-strong"
          >
            {messages.pricing.viewAllFaqs}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
