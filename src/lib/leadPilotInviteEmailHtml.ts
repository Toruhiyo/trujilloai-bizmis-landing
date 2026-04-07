import { type LeadPilotInviteData, PILOT_INVITE_TERMS } from "@/data/leadPilotInviteTypes";

const BIZMIS_LOGO_WHITE = "/images/bizmis-logo-white-transparent.png";
const HERO_AVATAR = "/images/hero-avatar-1.png";
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

/* ------------------------------------------------------------------ */
/*  Font stacks — matching card preview                               */
/* ------------------------------------------------------------------ */

const HEADING = "font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;";
const BODY = "font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;";

/* ------------------------------------------------------------------ */
/*  Shared Bizmis colors                                              */
/* ------------------------------------------------------------------ */

const BIZMIS_ORANGE = "#FD912A";
const BIZMIS_ORANGE_DARK = "#C96E0B";
const BIZMIS_ORANGE_DEEP = "#8B5A1A";
const BIZMIS_WARM_BG = "#FFF7ED";

/* ------------------------------------------------------------------ */
/*  Build email-safe HTML                                             */
/* ------------------------------------------------------------------ */

export function buildLeadPilotInviteEmailHtml(
  lead: LeadPilotInviteData,
): { html: string; plainText: string } {
  const pri = lead.primaryColor;
  const sec = secondaryColor(lead);
  const store = escapeHtml(lead.storeName);
  const { pilotDays, shopperCap, storeCap, shopifyAppUrl } = PILOT_INVITE_TERMS;

  const logoUrl = absImg(lead.logoImagePath);
  const pA = absImg(lead.productAImagePath);
  const pB = absImg(lead.productBImagePath);
  const pC = absImg(lead.productCImagePath);
  const bizmisLogoUrl = absImg(BIZMIS_LOGO_WHITE);
  const avatarUrl = absImg(HERO_AVATAR);

  const preheader = `Team ${lead.storeName} &mdash; free exclusive Bizmis pilot: ${pilotDays} days, ${shopperCap} shoppers, only ${storeCap} spots. Claim yours now.`;

  const PILL_BASE = `display:inline-block;margin:3px 5px 3px 0;padding:7px 14px;border-radius:4px;${BODY}font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;`;
  const PILL_ORANGE = `${PILL_BASE}background-color:${BIZMIS_ORANGE};`;
  const PILL_DARK = `${PILL_BASE}background-color:${BIZMIS_ORANGE_DEEP};`;

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
<body style="margin:0;padding:0;background-color:${BIZMIS_WARM_BG};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<!-- Preheader (hidden) -->
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BIZMIS_WARM_BG};">
  <tr>
    <td align="center" style="padding:20px 12px;">

      <!-- Card wrapper -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="580" style="max-width:580px;width:100%;background-color:#ffffff;border:1px solid #e5e1dc;border-radius:16px;overflow:hidden;">

        <!-- Brand bar: store | diagonal | bizmis -->
        <tr>
          <td style="padding:0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="46%" style="background-color:${pri};padding:24px 16px 24px 28px;vertical-align:middle;">
                  <img src="${logoUrl}" alt="${store}" width="120" height="auto" style="display:block;max-width:120px;height:auto;border:0;" />
                </td>
                <td width="8%" style="background-color:${pri};background:linear-gradient(to bottom right,${pri} 50%,${BIZMIS_ORANGE} 50%);"></td>
                <td width="46%" style="background-color:${BIZMIS_ORANGE};padding:20px 28px 20px 16px;vertical-align:middle;text-align:right;">
                  <a href="${BIZMIS_URL}" target="_blank" style="text-decoration:none;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right">
                      <tr>
                        <td style="vertical-align:middle;">
                          <img src="${bizmisLogoUrl}" alt="Bizmis" width="38" height="38" style="display:block;width:38px;height:auto;border:0;" />
                        </td>
                        <td style="vertical-align:middle;padding-left:10px;${HEADING}font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">
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

        <!-- Centered X at the intersection (no background) -->
        <tr>
          <td align="center" style="padding:0;line-height:0;font-size:0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:-22px;">
              <tr>
                <td style="text-align:center;vertical-align:middle;">
                  <span style="${HEADING}font-size:26px;font-weight:900;color:#ffffff;text-shadow:0 2px 8px rgba(0,0,0,0.5),0 0 20px rgba(0,0,0,0.25);line-height:1;">&#x2716;</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Headline -->
        <tr>
          <td style="padding:12px 28px 10px 28px;">
            <p style="margin:0;${HEADING}font-size:23px;font-weight:800;line-height:1.2;color:#1a1a1a;">
              Team <span style="color:${BIZMIS_ORANGE};">${store}</span>, you&rsquo;re invited to a
              <span style="text-decoration:underline;text-decoration-color:${BIZMIS_ORANGE};text-underline-offset:3px;">free</span> exclusive Bizmis pilot.
            </p>
          </td>
        </tr>

        <!-- Pilot terms pills (flat, no gradient) -->
        <tr>
          <td style="padding:8px 28px 16px 28px;">
            <span style="${PILL_ORANGE}">100% FREE FOR ${pilotDays} DAYS</span>
            <span style="${PILL_ORANGE}">${shopperCap.toLocaleString()} SHOPPERS</span>
            <span style="${PILL_DARK}">ONLY ${storeCap} SPOTS</span>
          </td>
        </tr>

        <!-- Product + Avatar montage -->
        <tr>
          <td style="padding:4px 20px 16px 20px;background-color:${BIZMIS_WARM_BG};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="120" style="vertical-align:bottom;padding:4px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr><td style="padding:3px;"><div style="background-color:#ffffff;text-align:center;padding:6px;border:1px solid #eee;border-radius:10px;"><img src="${pA}" alt="${store} product" width="90" style="display:inline-block;max-width:100%;height:auto;border:0;" /></div></td></tr>
                    <tr><td style="padding:3px;"><div style="background-color:#ffffff;text-align:center;padding:6px;border:1px solid #eee;border-radius:10px;"><img src="${pB}" alt="${store} product" width="90" style="display:inline-block;max-width:100%;height:auto;border:0;" /></div></td></tr>
                    <tr><td style="padding:3px;"><div style="background-color:#ffffff;text-align:center;padding:6px;border:1px solid #eee;border-radius:10px;"><img src="${pC}" alt="${store} product" width="90" style="display:inline-block;max-width:100%;height:auto;border:0;" /></div></td></tr>
                  </table>
                </td>
                <td style="vertical-align:bottom;text-align:center;padding:4px 8px 0 8px;">
                  <img src="${avatarUrl}" alt="Bizmis AI store clerk" width="240" style="display:inline-block;max-width:100%;height:auto;border:0;" />
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Value proposition with Unicode icons -->
        <tr>
          <td style="padding:20px 28px 6px 28px;">
            <p style="margin:0 0 10px 0;${HEADING}font-size:15px;font-weight:800;color:#1a1a1a;">
              Boost profits, selling the human way.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="22" style="vertical-align:top;padding:4px 0;${BODY}font-size:14px;color:${BIZMIS_ORANGE};font-weight:700;">&#x2197;</td>
                <td style="vertical-align:top;padding:4px 0 8px 6px;${BODY}font-size:13px;line-height:1.45;color:#555;">Convert more browsers into confident buyers</td>
              </tr>
              <tr>
                <td width="22" style="vertical-align:top;padding:4px 0;${BODY}font-size:14px;color:${BIZMIS_ORANGE};font-weight:700;">&#x25B2;</td>
                <td style="vertical-align:top;padding:4px 0 8px 6px;${BODY}font-size:13px;line-height:1.45;color:#555;">Increase average order value with smart upsells</td>
              </tr>
              <tr>
                <td width="22" style="vertical-align:top;padding:4px 0;${BODY}font-size:14px;color:${BIZMIS_ORANGE};font-weight:700;">&#x29D7;</td>
                <td style="vertical-align:top;padding:4px 0 8px 6px;${BODY}font-size:13px;line-height:1.45;color:#555;">Save hours on support while earning loyal customers</td>
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

        <!-- Coupon ticket (flat accents, no gradient) -->
        <tr>
          <td style="padding:12px 28px 18px 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="6" style="background-color:${BIZMIS_ORANGE};border-radius:6px 0 0 6px;"></td>
                <td style="background-color:${BIZMIS_WARM_BG};border-top:2px dashed ${BIZMIS_ORANGE};border-bottom:2px dashed ${BIZMIS_ORANGE};padding:16px 24px;text-align:center;">
                  <p style="margin:0 0 4px 0;${BODY}font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${BIZMIS_ORANGE_DARK};">
                    Your exclusive free pilot code
                  </p>
                  <p style="margin:0 0 6px 0;${HEADING}font-size:24px;font-weight:800;letter-spacing:0.06em;color:#1a1a1a;">
                    ${escapeHtml(lead.couponCode)}
                  </p>
                  <p style="margin:0;${BODY}font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${BIZMIS_ORANGE};">
                    100% free &mdash; no credit card required
                  </p>
                </td>
                <td width="6" style="background-color:${BIZMIS_ORANGE};border-radius:0 6px 6px 0;"></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA button (flat, no gradient) -->
        <tr>
          <td style="padding:0 28px 10px 28px;" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background-color:${BIZMIS_ORANGE};padding:15px 40px;border-radius:8px;text-align:center;">
                  <a href="${shopifyAppUrl}" target="_blank" style="display:inline-block;${BODY}font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.02em;">
                    Claim Your Free Pilot &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Urgency nudge -->
        <tr>
          <td style="padding:4px 28px 20px 28px;text-align:center;">
            <p style="margin:0;${BODY}font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${BIZMIS_ORANGE_DEEP};">
              Only ${storeCap} spots available &mdash; first come, first served
            </p>
          </td>
        </tr>

        <!-- Footer with bizmis.ai link -->
        <tr>
          <td style="padding:0 28px 22px 28px;text-align:center;">
            <p style="margin:0 0 6px 0;${BODY}font-size:12px;color:#999;">
              Questions? Just reply to this email.
            </p>
            <a href="${BIZMIS_URL}" target="_blank" style="${BODY}font-size:12px;font-weight:600;color:${BIZMIS_ORANGE};text-decoration:none;">
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
    `Claim your free pilot: ${shopifyAppUrl}`,
    "",
    `Only ${storeCap} spots available — first come, first served.`,
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
    <p style="margin:0 0 10px 0;${BODY}font-size:14px;line-height:1.55;color:#555;">
      Bizmis is a voice-powered sales clerk that knows your catalog inside out. Not a chatbot &mdash;
      a natural, human-like shopping assistant that converts browsers into confident buyers.
    </p>
    <p style="margin:0 0 10px 0;${BODY}font-size:14px;font-weight:600;line-height:1.55;color:#1a1a1a;">
      As a founding pilot store, you&rsquo;ll directly shape our product roadmap.
      Build the voice commerce tool that fits <span style="color:${BIZMIS_ORANGE};">${store}</span>&rsquo;s customers and brand.
    </p>
    <p style="margin:0;${BODY}font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${BIZMIS_ORANGE_DEEP};">
      Only ${storeCap} spots available &mdash; first come, first served.
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
