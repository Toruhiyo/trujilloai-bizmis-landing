const DEFAULT_BIZMIS_API_BASE_URL = "https://api.trujillo.ai";
const COUPON_ACCESS_TOKEN_HEADER = "X-Bizmis-Coupon-Access-Token";

const getBaseUrl = (): string =>
  (import.meta.env.VITE_BIZMIS_API_BASE_URL || DEFAULT_BIZMIS_API_BASE_URL).replace(
    /\/$/,
    "",
  );

export type CouponKind = "early_access" | "custom";

export interface CouponSummary {
  label: string;
  monthly_discount_percent: number;
  /** @deprecated not displayed; plans are monthly only. */
  yearly_discount_percent?: number | null;
  intro_months: number;
}

export interface CouponPlanPrice {
  plan_name: string;
  monthly: number;
  /** @deprecated not displayed; plans are monthly only. */
  yearly_monthly_equivalent?: number | null;
}

export interface CouponDTO {
  code: string;
  kind: CouponKind;
  summary: CouponSummary;
  prices: CouponPlanPrice[];
  starts_at: string | null;
  expires_at: string | null;
}

export type CouponErrorCode =
  | "COUPON_NOT_FOUND"
  | "COUPON_EXPIRED"
  | "COUPON_NOT_YET_ACTIVE"
  | "COUPON_INVALID_FORMAT"
  | "COUPON_ALREADY_CLAIMED_BY_ANOTHER_STORE"
  | "COUPON_CAMPAIGN_EXHAUSTED"
  | "COUPON_INVALID_ACCESS_TOKEN"
  | "NETWORK_ERROR";

/**
 * Public plan catalog returned by `GET /bizmis/coupons/plans`. This is the
 * single source of truth for base prices and included conversations; the
 * landing must not hardcode them. Marketing-only fields (feature bullets)
 * stay in the locale dictionaries.
 *
 * Pricing v2 (2026-10-22) bills in conversations, monthly only. The new keys
 * are optional so the landing keeps working against a backend that still
 * serves only the legacy credit-named keys; during the transition the backend
 * populates both with the same values. Legacy keys can go once every backend
 * deploy serves the new ones.
 */
export interface PublicPlanDTO {
  name: string;
  display_name: string;
  monthly_price: number;
  included_conversations?: number;
  overage_rate_per_conversation?: number;
  max_overage_cap_usd?: number;
  max_assistants?: number | null;
  /** Not displayed: card copy comes from the locale dictionaries. */
  entitlements?: Record<string, unknown>;
  /** Not displayed: card copy comes from the locale dictionaries. */
  features?: { label: string; is_soon: boolean }[];
  is_popular: boolean;
  money_back_guarantee_days?: number | null;
  /** @deprecated v1 alias of `included_conversations`. */
  included_credits?: number;
  /** @deprecated v1 alias of `overage_rate_per_conversation`. */
  overage_rate_per_credit?: number;
  /** @deprecated never displayed; concurrency is no longer a plan feature. */
  max_concurrency?: number;
  /** @deprecated always null in v2 (no yearly plans). */
  yearly_discount_percent?: number | null;
  /** @deprecated always null in v2 (no yearly plans). */
  yearly_price?: number | null;
}

interface PlansResponseBody {
  data: PublicPlanDTO[];
}

export async function fetchPublicPlans(): Promise<PublicPlanDTO[]> {
  const response = await fetch(`${getBaseUrl()}/bizmis/coupons/plans`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Plans request failed (HTTP ${response.status})`);
  }
  const body = (await response.json()) as PlansResponseBody;
  return body.data;
}

export class CouponApiError extends Error {
  readonly code: CouponErrorCode;

  constructor(code: CouponErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

interface AccessTokenResponseBody {
  data: { access_token: string };
}

interface ValidateResponseBody {
  data: CouponDTO;
}

interface ErrorResponseBody {
  detail?: {
    error_code?: string;
    message?: string;
  };
}

const parseCouponErrorCode = (raw: string | undefined): CouponErrorCode => {
  switch (raw) {
    case "COUPON_NOT_FOUND":
    case "COUPON_EXPIRED":
    case "COUPON_NOT_YET_ACTIVE":
    case "COUPON_INVALID_FORMAT":
    case "COUPON_ALREADY_CLAIMED_BY_ANOTHER_STORE":
    case "COUPON_CAMPAIGN_EXHAUSTED":
    case "COUPON_INVALID_ACCESS_TOKEN":
      return raw;
    default:
      return "NETWORK_ERROR";
  }
};

const toCouponError = async (response: Response): Promise<CouponApiError> => {
  let body: ErrorResponseBody = {};
  try {
    body = (await response.json()) as ErrorResponseBody;
  } catch {
    // No JSON body — fall through with empty body.
  }
  const code = parseCouponErrorCode(body.detail?.error_code);
  const message =
    body.detail?.message || `Coupon request failed (HTTP ${response.status})`;
  return new CouponApiError(code, message);
};

export async function requestCouponAccessToken(): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${getBaseUrl()}/bizmis/coupons/access-token`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    throw new CouponApiError(
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Network request failed",
    );
  }

  if (!response.ok) {
    throw await toCouponError(response);
  }

  const body = (await response.json()) as AccessTokenResponseBody;
  return body.data.access_token;
}

export async function validateCoupon(
  code: string,
  accessToken: string,
): Promise<CouponDTO> {
  let response: Response;
  try {
    response = await fetch(`${getBaseUrl()}/bizmis/coupons/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        [COUPON_ACCESS_TOKEN_HEADER]: accessToken,
      },
      body: JSON.stringify({ code }),
    });
  } catch (error) {
    throw new CouponApiError(
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Network request failed",
    );
  }

  if (!response.ok) {
    throw await toCouponError(response);
  }

  const body = (await response.json()) as ValidateResponseBody;
  return body.data;
}
