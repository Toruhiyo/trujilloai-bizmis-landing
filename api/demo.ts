import type { VercelRequest, VercelResponse } from "@vercel/node";

const APP_LISTING_URL =
  process.env.BIZMIS_SHOPIFY_APP_LISTING_URL ?? "https://apps.shopify.com/bizmis";
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const TIMEOUT_MS = 10_000;

// The App Store listing regenerates a short-lived `_bt` password-bypass token on every
// render, so we mint a fresh one per request instead of hardcoding one that rots.
// BIZ-151: match ANY *.myshopify.com bypass link instead of pinning the store host —
// the listing's demo store can be swapped (it already happened) and the only such link
// on our own listing page is the "View demo store" one.
export function extractDemoBypassUrl(listingHtml: string): string | null {
  const match = listingHtml.match(
    /href="(https:\/\/[a-z0-9][a-z0-9-]*\.myshopify\.com\/\?_bt=[^"]+)"/i,
  );
  if (!match) return null;

  const candidate = decodeHtmlEntities(match[1]);
  return isDemoStoreUrl(candidate) ? candidate : null;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.setHeader("Cache-Control", "no-store");

  // BIZ-134: carry the lead handle + early-access code (and campaign UTMs) through
  // the redirect so the demo store can surface the install CTA and redeem the code.
  // The email no longer prints the code; it rides the query instead.
  const bypassUrl = await resolveDemoBypassUrl();
  const target = appendAttributionParams(bypassUrl ?? APP_LISTING_URL, req.query);
  res.setHeader("Location", target);
  res.status(302).end();
}

// Core logic.

const ATTRIBUTION_PARAMS = new Set(["ref", "code"]);
const UTM_PARAM_PREFIX = "utm_";

export function appendAttributionParams(
  target: string,
  query: VercelRequest["query"],
): string {
  let url: URL;
  try {
    url = new URL(target);
  } catch {
    return target;
  }
  for (const [key, raw] of Object.entries(query)) {
    if (!isAttributionParam(key)) continue;
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

function isAttributionParam(key: string): boolean {
  return ATTRIBUTION_PARAMS.has(key) || key.startsWith(UTM_PARAM_PREFIX);
}

async function resolveDemoBypassUrl(): Promise<string | null> {
  try {
    const resp = await fetch(APP_LISTING_URL, {
      headers: { "User-Agent": BROWSER_USER_AGENT, Accept: "text/html" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!resp.ok) {
      console.error(`Demo: listing fetch failed (${resp.status})`);
      return null;
    }
    const bypassUrl = extractDemoBypassUrl(await resp.text());
    if (!bypassUrl) {
      console.error("Demo: no demo-store bypass link found on the listing — falling back to the app listing");
    }
    return bypassUrl;
  } catch (error) {
    console.error(`Demo: listing fetch error — ${(error as Error).message}`);
    return null;
  }
}

function isDemoStoreUrl(candidate: string): boolean {
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" && url.hostname.endsWith(".myshopify.com");
  } catch {
    return false;
  }
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#x3D;/gi, "=");
}
