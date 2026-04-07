import {
  type LeadPilotInviteData,
  PILOT_INVITE_TERMS,
  resolveLogoColorOverlay,
  resolveStoreNameTextColor,
} from "@/data/leadPilotInviteTypes";
import {
  BIZMIS_BORDER_HEX,
  BIZMIS_MUTED_FG_HEX,
  BIZMIS_PRIMARY_DARK_HEX,
  BIZMIS_PRIMARY_HEX,
  BIZMIS_PRIMARY_LIGHT_HEX,
  BIZMIS_SECONDARY_SURFACE_HEX,
  BIZMIS_WARM_BG_HEX,
} from "@/lib/bizmisBrandColors";

const BIZMIS_LOGO_WHITE = "/images/bizmis-logo-white-transparent.png";
const HERO_AVATAR = "/images/hero-avatar-1.png";
/** PNG raster of `shopify-mark-white.svg` for email clients that block SVG in img. */
const SHOPIFY_MARK_WHITE = "/images/shopify-mark-white.png";
const BIZMIS_URL = "https://bizmis.ai";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resolveBaseUrl(): string {
  const env = import.meta.env.VITE_PUBLIC_BASE_URL;
  if (typeof env === "string" && env.length > 0) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

function absImg(publicPath: string): string {
  return `${resolveBaseUrl()}${publicPath}`;
}

function secondaryColor(lead: LeadPilotInviteData): string {
  return lead.secondaryColor ?? lead.primaryColor;
}

/** Email clients often ignore SVG in img/mask; prefer a .png sibling when the lead uses .svg. */
function logoPublicPathForEmail(logoImagePath: string): string {
  if (logoImagePath.toLowerCase().endsWith(".svg")) {
    return logoImagePath.replace(/\.svg$/i, ".png");
  }
  return logoImagePath;
}

function storeLogoEmailMarkup(lead: LeadPilotInviteData): string {
  const store = escapeHtml(lead.storeName);
  const logoUrl = absImg(logoPublicPathForEmail(lead.logoImagePath));
  const overlay = resolveLogoColorOverlay(lead);
  if (!overlay) {
    return `<img src="${logoUrl}" alt="${store}" width="168" height="auto" style="display:block;max-width:168px;height:auto;border:0;" />`;
  }
  const safeOverlay = escapeHtml(overlay);
  const urlEsc = logoUrl.replace(/'/g, "\\'");
  return `<div role="presentation" aria-label="${store}" style="display:inline-block;width:168px;height:56px;background-color:${safeOverlay};-webkit-mask-image:url('${urlEsc}');mask-image:url('${urlEsc}');-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:left center;mask-position:left center;"></div>`;
}

/* ------------------------------------------------------------------ */
/*  Font stacks — matching card preview                               */
/* ------------------------------------------------------------------ */

const HEADING = "font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;";
const BODY = "font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;";
/** Matches pricing plan price figures: heading + tabular nums */
const HEADING_TABULAR =
  HEADING +
  "font-variant-numeric:tabular-nums;font-feature-settings:'tnum' 1;-webkit-font-feature-settings:'tnum' 1;";

/* ------------------------------------------------------------------ */
/*  Value prop icons (Lucide-aligned strokes, inline SVG for email)    */
/* ------------------------------------------------------------------ */

function emailValuePropIcon(kind: "trend" | "cart" | "clock"): string {
  const s = BIZMIS_PRIMARY_HEX;
  const o = `xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"`;
  const stroke = `fill="none" stroke="${s}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
  switch (kind) {
    case "trend":
      return `<svg ${o} ${stroke}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;
    case "cart":
      return `<svg ${o} ${stroke}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`;
    case "clock":
      return `<svg ${o} ${stroke}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
  }
}

/* ------------------------------------------------------------------ */
/*  Build email-safe HTML                                             */
/* ------------------------------------------------------------------ */

export function buildLeadPilotInviteEmailHtml(
  lead: LeadPilotInviteData,
): { html: string; plainText: string } {
  const pri = lead.primaryColor;
  const storeNameColor = escapeHtml(resolveStoreNameTextColor(lead));
  const sec = secondaryColor(lead);
  const store = escapeHtml(lead.storeName);
  const { pilotDays, shopperCap, storeCap, shopifyAppUrl } = PILOT_INVITE_TERMS;

  const storeLogoHtml = storeLogoEmailMarkup(lead);
  const pA = absImg(lead.productAImagePath);
  const pB = absImg(lead.productBImagePath);
  const pC = absImg(lead.productCImagePath);
  const bizmisLogoUrl = absImg(BIZMIS_LOGO_WHITE);
  const avatarUrl = absImg(HERO_AVATAR);
  const shopifyMarkUrl = absImg(SHOPIFY_MARK_WHITE);

  const preheader = `Team ${lead.storeName} &mdash; free exclusive Bizmis pilot: ${pilotDays} days, ${shopperCap} shoppers, only ${storeCap} spots. Claim yours now.`;

  const PILL_BASE = `display:inline-block;margin:3px 5px 3px 0;padding:7px 14px;border-radius:9999px;${BODY}font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;`;
  const PILL_PRIMARY = `${PILL_BASE}background-color:${BIZMIS_PRIMARY_HEX};`;
  const PILL_DARK = `${PILL_BASE}background-color:${BIZMIS_PRIMARY_DARK_HEX};`;

  const bodyInner = lead.content.trim().length > 0
    ? `<div style="${BODY}font-size:14px;line-height:1.55;color:#333;">${lead.content}</div>`
    : defaultBodyCopyHtml(lead);

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Bizmis Pilot Invite</title>
</head>
<body style="margin:0;padding:0;background-color:${BIZMIS_WARM_BG_HEX};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<!-- Preheader (hidden) -->
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BIZMIS_WARM_BG_HEX};">
  <tr>
    <td align="center" style="padding:20px 12px;">

      <!-- Card wrapper -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="580" style="max-width:580px;width:100%;background-color:#ffffff;border:1px solid ${BIZMIS_BORDER_HEX};border-radius:16px;overflow:hidden;">

        <!-- Brand bar: store | diagonal | bizmis -->
        <tr>
          <td style="padding:0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="46%" style="background-color:${pri};padding:24px 16px 24px 28px;vertical-align:middle;">
                  ${storeLogoHtml}
                </td>
                <td width="8%" style="background-color:${pri};background:linear-gradient(to bottom right,${pri} 50%,${BIZMIS_PRIMARY_HEX} 50%);text-align:center;vertical-align:middle;padding:0 2px;">
                  <span style="${HEADING}font-size:38px;font-weight:900;color:#ffffff;line-height:1;text-shadow:0 1px 6px rgba(0,0,0,0.22),0 0 10px rgba(0,0,0,0.1);">&#x2716;</span>
                </td>
                <td width="46%" style="background:linear-gradient(145deg,${BIZMIS_PRIMARY_LIGHT_HEX} 0%,${BIZMIS_PRIMARY_HEX} 45%,${BIZMIS_PRIMARY_DARK_HEX} 100%);padding:20px 28px 20px 16px;vertical-align:middle;text-align:right;">
                  <a href="${BIZMIS_URL}" target="_blank" style="text-decoration:none;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right">
                      <tr>
                        <td style="vertical-align:middle;">
                          <img src="${bizmisLogoUrl}" alt="Bizmis" width="52" height="52" style="display:block;width:52px;height:auto;border:0;" />
                        </td>
                        <td style="vertical-align:middle;padding-left:12px;${HEADING}font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">
                          bizmis
                        </td>
                      </tr>
                    </table>
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Headline -->
        <tr>
          <td style="padding:12px 28px 10px 28px;">
            <p style="margin:0;${HEADING}font-size:23px;font-weight:800;line-height:1.2;color:#1a1a1a;">
              Team <span style="color:${storeNameColor};">${store}</span>, you&rsquo;re invited to a
              <span style="text-decoration:underline;text-decoration-color:${BIZMIS_PRIMARY_HEX};text-underline-offset:3px;">free</span> exclusive Bizmis pilot.
            </p>
          </td>
        </tr>

        <!-- Pilot terms pills (flat, no gradient) -->
        <tr>
          <td style="padding:8px 28px 16px 28px;">
            <span style="${PILL_PRIMARY}">100% FREE FOR ${pilotDays} DAYS</span>
            <span style="${PILL_PRIMARY}">${shopperCap.toLocaleString()} SHOPPERS</span>
            <span style="${PILL_DARK}">ONLY ${storeCap} SPOTS</span>
          </td>
        </tr>

        <!-- Product + Avatar montage -->
        <tr>
          <td style="padding:4px 20px 16px 20px;background-color:${BIZMIS_SECONDARY_SURFACE_HEX};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="120" style="vertical-align:bottom;padding:4px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr><td style="padding:3px;"><div style="background-color:#ffffff;text-align:center;padding:6px;border:1px solid ${BIZMIS_BORDER_HEX};border-radius:10px;"><img src="${pA}" alt="${store} product" width="90" style="display:inline-block;max-width:100%;height:auto;border:0;" /></div></td></tr>
                    <tr><td style="padding:3px;"><div style="background-color:#ffffff;text-align:center;padding:6px;border:1px solid ${BIZMIS_BORDER_HEX};border-radius:10px;"><img src="${pB}" alt="${store} product" width="90" style="display:inline-block;max-width:100%;height:auto;border:0;" /></div></td></tr>
                    <tr><td style="padding:3px;"><div style="background-color:#ffffff;text-align:center;padding:6px;border:1px solid ${BIZMIS_BORDER_HEX};border-radius:10px;"><img src="${pC}" alt="${store} product" width="90" style="display:inline-block;max-width:100%;height:auto;border:0;" /></div></td></tr>
                  </table>
                </td>
                <td style="vertical-align:bottom;text-align:center;padding:4px 8px 0 8px;">
                  <img src="${avatarUrl}" alt="Bizmis AI store clerk" width="240" style="display:inline-block;max-width:100%;height:auto;border:0;" />
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Value proposition (inline SVG icons) -->
        <tr>
          <td style="padding:20px 28px 6px 28px;">
            <p style="margin:0 0 10px 0;${HEADING}font-size:15px;font-weight:800;color:#1a1a1a;">
              Boost profits, selling the human way.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="28" style="vertical-align:top;padding:6px 0;">${emailValuePropIcon("trend")}</td>
                <td style="vertical-align:top;padding:6px 0 8px 8px;${BODY}font-size:13px;line-height:1.45;color:#555;">Convert more browsers into confident buyers</td>
              </tr>
              <tr>
                <td width="28" style="vertical-align:top;padding:6px 0;">${emailValuePropIcon("cart")}</td>
                <td style="vertical-align:top;padding:6px 0 8px 8px;${BODY}font-size:13px;line-height:1.45;color:#555;">Increase average order value with smart upsells</td>
              </tr>
              <tr>
                <td width="28" style="vertical-align:top;padding:6px 0;">${emailValuePropIcon("clock")}</td>
                <td style="vertical-align:top;padding:6px 0 8px 8px;${BODY}font-size:13px;line-height:1.45;color:#555;">Save hours on support while earning loyal customers</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body copy -->
        <tr>
          <td style="padding:10px 28px 6px 28px;">
            ${bodyInner}
          </td>
        </tr>

        <!-- Pilot code (calm panel) -->
        <tr>
          <td style="padding:12px 28px 8px 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${BIZMIS_BORDER_HEX};border-radius:12px;background-color:${BIZMIS_SECONDARY_SURFACE_HEX};">
              <tr>
                <td style="padding:18px 22px;text-align:center;border-top:3px solid ${BIZMIS_PRIMARY_HEX};border-radius:12px 12px 0 0;">
                  <p style="margin:0 0 6px 0;${BODY}font-size:12px;font-weight:500;color:${BIZMIS_MUTED_FG_HEX};">
                    Your pilot code
                  </p>
                  <p style="margin:0 0 8px 0;${HEADING_TABULAR}font-size:22px;font-weight:700;letter-spacing:0.04em;color:#1a1a1a;">
                    ${escapeHtml(lead.couponCode)}
                  </p>
                  <p style="margin:0;${BODY}font-size:12px;color:${BIZMIS_MUTED_FG_HEX};line-height:1.4;">
                    ${pilotDays} days free &middot; No credit card
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:16px 28px 8px 28px;" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background-color:${BIZMIS_PRIMARY_HEX};padding:12px 28px;border-radius:9999px;text-align:center;">
                  <a href="${shopifyAppUrl}" target="_blank" style="display:inline-block;text-decoration:none;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                      <tr>
                        <td style="vertical-align:middle;padding:0 10px 0 0;">
                          <img src="${shopifyMarkUrl}" alt="" width="20" height="23" style="display:block;width:20px;height:23px;border:0;" />
                        </td>
                        <td style="vertical-align:middle;${BODY}font-size:14px;font-weight:600;color:#ffffff;">
                          Install on Shopify
                        </td>
                      </tr>
                    </table>
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:10px 0 0 0;${BODY}font-size:12px;color:${BIZMIS_MUTED_FG_HEX};line-height:1.45;">
              Opens the Bizmis listing in the Shopify App Store.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:12px 28px 22px 28px;text-align:center;">
            <p style="margin:0 0 6px 0;${BODY}font-size:12px;color:${BIZMIS_MUTED_FG_HEX};">
              Questions? Just reply to this email.
            </p>
            <a href="${BIZMIS_URL}" target="_blank" style="${BODY}font-size:12px;font-weight:600;color:${BIZMIS_PRIMARY_HEX};text-decoration:none;">
              bizmis.ai
            </a>
          </td>
        </tr>

      </table>
      <!-- /Card wrapper -->

    </td>
  </tr>
</table>
</body>
</html>`;

  const plainText = [
    `Team ${lead.storeName}, you're invited to a FREE exclusive Bizmis pilot.`,
    "",
    `100% FREE for ${pilotDays} days · ${shopperCap} shoppers · Only ${storeCap} spots`,
    "",
    "Boost profits, selling the human way:",
    "- Convert more browsers into confident buyers",
    "- Increase average order value with smart upsells",
    "- Save hours on support while earning loyal customers",
    "",
    `Bizmis is a voice-powered sales clerk that knows your catalog. Not a chatbot — a natural, human-like shopping assistant.`,
    "",
    `As a founding pilot store, you'll directly shape our product roadmap.`,
    "",
    `Your exclusive FREE pilot code: ${lead.couponCode}`,
    `100% free — no credit card required`,
    "",
    `Install on Shopify (App Store): ${shopifyAppUrl}`,
    "",
    `Pilot seats are limited (${storeCap} stores this wave); we confirm in order of signup.`,
    "",
    "Questions? Just reply to this email.",
    `Visit us: ${BIZMIS_URL}`,
  ].join("\n");

  return { html, plainText };
}

/* ------------------------------------------------------------------ */
/*  Default body copy (email version)                                 */
/* ------------------------------------------------------------------ */

function defaultBodyCopyHtml(lead: LeadPilotInviteData): string {
  const store = escapeHtml(lead.storeName);
  const { storeCap } = PILOT_INVITE_TERMS;
  return `
    <p style="margin:0 0 10px 0;${BODY}font-size:14px;line-height:1.55;color:${BIZMIS_MUTED_FG_HEX};">
      Bizmis is a voice-powered sales clerk that knows your catalog inside out. Not a chatbot &mdash;
      a natural, human-like shopping assistant that converts browsers into confident buyers.
    </p>
    <p style="margin:0 0 10px 0;${BODY}font-size:14px;font-weight:600;line-height:1.55;color:#1a1a1a;">
      As a founding pilot store, you&rsquo;ll directly shape our product roadmap.
      Build the voice commerce tool that fits <span style="color:${escapeHtml(resolveStoreNameTextColor(lead))};">${store}</span>&rsquo;s customers and brand.
    </p>
    <p style="margin:0;${BODY}font-size:12px;color:${BIZMIS_MUTED_FG_HEX};line-height:1.5;">
      Pilot seats are limited (${storeCap} stores in this wave)&mdash;we&rsquo;ll confirm yours in order of signup.
    </p>
  `;
}

/**
 * Copies the raw HTML source code as plain text for pasting into
 * an email platform's HTML / source editor.
 */
export function copyLeadPilotHtmlSource(lead: LeadPilotInviteData): Promise<void> {
  const { html } = buildLeadPilotInviteEmailHtml(lead);
  return navigator.clipboard.writeText(html);
}
