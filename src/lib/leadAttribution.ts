import type { PostHog } from "posthog-js";

/**
 * Lead attribution super-properties.
 *
 * When a visitor lands with `?ref=<handle>` (emitted by the Instantly
 * cold-email template) or with the standard `utm_*` set, we promote each
 * value to a PostHog super-property so every downstream event during the
 * session carries attribution context (pageviews, clicks, custom
 * captures). Values also persist to sessionStorage so a full-page reload
 * or internal navigation does not drop the attribution tail.
 *
 * The `lead_*` prefix is deliberate: we keep PostHog's native
 * `$utm_*` auto-captured super-properties intact for short-term analysis
 * and add our own namespaced set for long-term attribution and funnels.
 */
type AttributionMapping = {
  readonly urlParam: string;
  readonly propertyName: string;
  readonly storageKey: string;
};

export const LEAD_REF_URL_PARAM = "ref" as const;
export const LEAD_REF_PROPERTY = "lead_ref" as const;
export const LEAD_REF_STORAGE_KEY = "bizmis_lead_ref" as const;

export const LEAD_ATTRIBUTION_MAPPINGS: readonly AttributionMapping[] = [
  {
    urlParam: LEAD_REF_URL_PARAM,
    propertyName: LEAD_REF_PROPERTY,
    storageKey: LEAD_REF_STORAGE_KEY,
  },
  {
    urlParam: "utm_source",
    propertyName: "lead_utm_source",
    storageKey: "bizmis_lead_utm_source",
  },
  {
    urlParam: "utm_medium",
    propertyName: "lead_utm_medium",
    storageKey: "bizmis_lead_utm_medium",
  },
  {
    urlParam: "utm_campaign",
    propertyName: "lead_utm_campaign",
    storageKey: "bizmis_lead_utm_campaign",
  },
  {
    urlParam: "utm_content",
    propertyName: "lead_utm_content",
    storageKey: "bizmis_lead_utm_content",
  },
];

function readFromUrl(param: string): string | null {
  try {
    const value = new URLSearchParams(window.location.search).get(param);
    return value && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

function readFromSessionStorage(key: string): string | null {
  try {
    const value = window.sessionStorage.getItem(key);
    return value && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

function writeToSessionStorage(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    /* sessionStorage unavailable (Safari private mode, etc.) */
  }
}

export function resolveLeadAttribution(): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const mapping of LEAD_ATTRIBUTION_MAPPINGS) {
    const fromUrl = readFromUrl(mapping.urlParam);
    const fromStorage = fromUrl ? null : readFromSessionStorage(mapping.storageKey);
    const value = fromUrl ?? fromStorage;
    if (!value) continue;
    resolved[mapping.propertyName] = value;
    if (fromUrl) writeToSessionStorage(mapping.storageKey, fromUrl);
  }
  return resolved;
}

/**
 * Registers any resolved attribution values as PostHog super-properties.
 * Safe to call repeatedly (register() is idempotent). No-op when the
 * current URL and sessionStorage carry nothing.
 */
export function captureLeadAttribution(posthog: PostHog): void {
  const resolved = resolveLeadAttribution();
  if (Object.keys(resolved).length === 0) return;
  posthog.register(resolved);
}
