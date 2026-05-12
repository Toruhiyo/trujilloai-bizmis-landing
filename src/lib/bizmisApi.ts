const DEFAULT_BIZMIS_API_BASE_URL = "https://api.trujillo.ai";
const COUPON_ACCESS_TOKEN_HEADER = "X-Bizmis-Coupon-Access-Token";

const getBaseUrl = (): string =>
  (import.meta.env.VITE_BIZMIS_API_BASE_URL || DEFAULT_BIZMIS_API_BASE_URL).replace(
    /\/$/,
    "",
  );

export type CouponKind = "early_access" | "custom";
export type CouponStatus = "unclaimed" | "claimed";

export interface CouponSummary {
  label: string;
  monthly_discount_percent: number;
  yearly_discount_percent: number;
  intro_months: number;
}

export interface CouponPlanPrice {
  plan_name: string;
  monthly: number;
  yearly_monthly_equivalent: number;
}

export interface CouponDTO {
  code: string;
  kind: CouponKind;
  status: CouponStatus;
  summary: CouponSummary;
  prices: CouponPlanPrice[];
  starts_at: string | null;
  expires_at: string | null;
  claimed_by_store_domain: string | null;
  claimed_at: string | null;
}

export type CouponErrorCode =
  | "COUPON_NOT_FOUND"
  | "COUPON_EXPIRED"
  | "COUPON_NOT_YET_ACTIVE"
  | "COUPON_INVALID_FORMAT"
  | "COUPON_ALREADY_CLAIMED_BY_ANOTHER_STORE"
  | "COUPON_INVALID_ACCESS_TOKEN"
  | "NETWORK_ERROR";

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
