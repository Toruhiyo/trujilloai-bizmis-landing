import type { VercelRequest, VercelResponse } from "@vercel/node";

const APP_LISTING_URL =
  process.env.BIZMIS_SHOPIFY_APP_LISTING_URL ?? "https://apps.shopify.com/bizmis";
const DEMO_STORE_HOST =
  process.env.BIZMIS_DEMO_STORE_HOST ?? "paper-and-pine-books.myshopify.com";
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const TIMEOUT_MS = 10_000;

// The App Store listing regenerates a short-lived `_bt` password-bypass token on every
// render, so we mint a fresh one per request instead of hardcoding one that rots.
export function extractDemoBypassUrl(listingHtml: string, storeHost: string): string | null {
  const escapedHost = storeHost.replace(/[.]/g, "\\.");
  const match = listingHtml.match(
    new RegExp(`href="(https://${escapedHost}/\\?_bt=[^"]+)"`, "i"),
  );
  if (!match) return null;

  const candidate = decodeHtmlEntities(match[1]);
  return isExpectedStoreUrl(candidate, storeHost) ? candidate : null;
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

  const bypassUrl = await resolveDemoBypassUrl();
  res.setHeader("Location", bypassUrl ?? APP_LISTING_URL);
  res.status(302).end();
}

// Core logic.

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
    return extractDemoBypassUrl(await resp.text(), DEMO_STORE_HOST);
  } catch (error) {
    console.error(`Demo: listing fetch error — ${(error as Error).message}`);
    return null;
  }
}

function isExpectedStoreUrl(candidate: string, storeHost: string): boolean {
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" && url.hostname === storeHost;
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
