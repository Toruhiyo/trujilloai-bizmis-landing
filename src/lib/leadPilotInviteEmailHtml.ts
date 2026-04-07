import {
  type LeadPilotInviteData,
  PILOT_INVITE_TERMS,
  resolveLeadLogoScale,
  resolveLogoColorOverlay,
  resolveStoreNameTextColor,
} from "@/data/leadPilotInviteTypes";
import {
  BIZMIS_BORDER_HEX,
  BIZMIS_MUTED_FG_HEX,
  BIZMIS_PRIMARY_DARK_HEX,
  BIZMIS_PRIMARY_HEX,
  BIZMIS_PRIMARY_LIGHT_HEX,
  BIZMIS_WARM_BG_HEX,
} from "@/lib/bizmisBrandColors";

const BIZMIS_LOGO_WHITE = "/images/bizmis-logo-white-transparent.png";
const BIZMIS_URL = "https://bizmis.ai";

const OUTCOME_ICON_TREND = "/images/pilot-invite-outcome-trend.svg";
const OUTCOME_ICON_HEADPHONES = "/images/pilot-invite-outcome-headphones.svg";
const OUTCOME_ICON_CHART = "/images/pilot-invite-outcome-chart.svg";

/** Approx rgba(BIZMIS_PRIMARY, 0.08) on white */
const BIZMIS_PRIMARY_TINT_008 = "#FFF6EE";
/** Approx rgba(BIZMIS_PRIMARY, 0.06) on white */
const BIZMIS_PRIMARY_TINT_006 = "#FFF8F1";
/** Approx rgba(BIZMIS_PRIMARY, 0.10) on white */
const BIZMIS_PRIMARY_TINT_010 = "#FFF3E8";

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

/** Email clients often ignore SVG in img/mask; prefer a .png sibling when the lead uses .svg. */
function logoPublicPathForEmail(logoImagePath: string): string {
  if (logoImagePath.toLowerCase().endsWith(".svg")) {
    return logoImagePath.replace(/\.svg$/i, ".png");
  }
  return logoImagePath;
}

const EMAIL_HEADER_LOGO_BASE_WIDTH_PX = 120;
const EMAIL_HEADER_LOGO_BASE_MASK_HEIGHT_PX = 32;

function storeLogoEmailMarkup(lead: LeadPilotInviteData): string {
  const store = escapeHtml(lead.storeName);
  const logoUrl = absImg(logoPublicPathForEmail(lead.logoImagePath));
  const overlay = resolveLogoColorOverlay(lead);
  const scale = resolveLeadLogoScale(lead);
  const logoW = Math.round(EMAIL_HEADER_LOGO_BASE_WIDTH_PX * scale);
  const maskH = Math.round(EMAIL_HEADER_LOGO_BASE_MASK_HEIGHT_PX * scale);
  if (!overlay) {
    return `<img src="${logoUrl}" alt="${store}" width="${logoW}" height="auto" style="display:block;max-width:${logoW}px;height:auto;border:0;" />`;
  }
  const safeOverlay = escapeHtml(overlay);
  const urlEsc = logoUrl.replace(/'/g, "\\'");
  return `<div role="presentation" aria-label="${store}" style="display:inline-block;width:${logoW}px;height:${maskH}px;background-color:${safeOverlay};-webkit-mask-image:url('${urlEsc}');mask-image:url('${urlEsc}');-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:left center;mask-position:left center;"></div>`;
}

/* ------------------------------------------------------------------ */
/*  Font stacks                                                       */
/* ------------------------------------------------------------------ */

const HEADING = "font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;";
const BODY = "font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;";

/* ------------------------------------------------------------------ */
/*  Email-safe waveform bars                                          */
/* ------------------------------------------------------------------ */

function emailWaveformBars(color: string, heights: number[]): string {
  return heights
    .map(
      (h) =>
        `<span style="display:inline-block;width:2px;height:${h}px;background-color:${color};border-radius:1px;margin:0 1px;vertical-align:middle;"></span>`,
    )
    .join("");
}

const LISTENING_BARS = [5, 9, 12, 7, 10];
const WIDGET_BARS = [3, 6, 9, 5, 7];

/* ------------------------------------------------------------------ */
/*  Build product cards HTML for the storefront demo                  */
/* ------------------------------------------------------------------ */

function buildProductCardsHtml(lead: LeadPilotInviteData): string {
  const productImages = [lead.productAImagePath, lead.productBImagePath, lead.productCImagePath];

  return lead.demoProducts
    .map((product, i) => {
      const imgUrl = absImg(productImages[i]);
      const mb = i < 2 ? "margin-bottom:8px;" : "";
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${BIZMIS_BORDER_HEX};border-radius:8px;${mb}">
            <tr>
              <td width="56" style="padding:10px;">
                <img src="${imgUrl}" alt="" width="48" style="display:block;max-width:48px;height:auto;border:0;" />
              </td>
              <td style="padding:10px 12px 10px 0;vertical-align:middle;">
                <p style="margin:0;${BODY}font-size:11px;font-weight:600;color:#333;">${escapeHtml(product.title)}</p>
                <p style="margin:3px 0 4px;${BODY}font-size:11px;color:#888;">${escapeHtml(product.price)}</p>
                <span style="display:inline-block;background-color:${BIZMIS_PRIMARY_TINT_008};border-radius:9999px;padding:2px 8px;${BODY}font-size:9px;font-weight:500;color:${BIZMIS_PRIMARY_HEX};">${escapeHtml(product.tag)}</span>
              </td>
            </tr>
          </table>`;
    })
    .join("\n");
}

/* ------------------------------------------------------------------ */
/*  Build email-safe HTML                                             */
/* ------------------------------------------------------------------ */

export function buildLeadPilotInviteEmailHtml(
  lead: LeadPilotInviteData,
): { html: string; plainText: string } {
  const pri = lead.primaryColor;
  const storeNameColor = escapeHtml(resolveStoreNameTextColor(lead));
  const store = escapeHtml(lead.storeName);
  const domain = escapeHtml(lead.storeDomain);
  const { storeCap, shopifyAppUrl } = PILOT_INVITE_TERMS;

  const storeLogoHtml = storeLogoEmailMarkup(lead);
  const bizmisLogoUrl = absImg(BIZMIS_LOGO_WHITE);
  const productCardsHtml = buildProductCardsHtml(lead);
  const outcomeIconTrendUrl = absImg(OUTCOME_ICON_TREND);
  const outcomeIconHeadphonesUrl = absImg(OUTCOME_ICON_HEADPHONES);
  const outcomeIconChartUrl = absImg(OUTCOME_ICON_CHART);

  const listeningBarsHtml = emailWaveformBars(BIZMIS_PRIMARY_HEX, LISTENING_BARS);
  const widgetBarsHtml = emailWaveformBars("#ffffff", WIDGET_BARS);

  const preheader = `Early access invite for ${lead.storeName}. First ${storeCap} stores only — Bizmis voice-first store clerks.`;

  const CHIP_BADGE_STYLE = `display:inline-block;margin:0;padding:6px 10px;border-radius:9999px;border:1px solid ${BIZMIS_BORDER_HEX};${BODY}font-size:10px;line-height:1.35;color:#555;text-align:center;`;

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
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background-color:#ffffff;border:1px solid ${BIZMIS_BORDER_HEX};border-radius:14px;overflow:hidden;">

        <!-- Split banner: store left | diagonal | bizmis right -->
        <tr>
          <td style="padding:0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="50%" style="background-color:${pri};padding:20px 16px 20px 28px;vertical-align:middle;">
                  ${storeLogoHtml}
                </td>
                <td width="6%" style="background-color:${pri};background:linear-gradient(to bottom right,${pri} 50%,${BIZMIS_PRIMARY_HEX} 50%);text-align:center;vertical-align:middle;padding:0;">
                  <span style="${HEADING}font-size:28px;font-weight:900;color:#ffffff;line-height:1;text-shadow:0 1px 4px rgba(0,0,0,0.25);">&#x2716;</span>
                </td>
                <td width="44%" style="background:linear-gradient(145deg,${BIZMIS_PRIMARY_LIGHT_HEX} 0%,${BIZMIS_PRIMARY_HEX} 50%,${BIZMIS_PRIMARY_DARK_HEX} 100%);padding:20px 28px 20px 16px;vertical-align:middle;text-align:right;">
                  <a href="${BIZMIS_URL}" target="_blank" style="text-decoration:none;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right">
                      <tr>
                        <td style="vertical-align:middle;">
                          <img src="${bizmisLogoUrl}" alt="Bizmis" width="36" height="36" style="display:block;width:36px;height:auto;border:0;" />
                        </td>
                        <td style="vertical-align:middle;padding-left:8px;${HEADING}font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">
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

        <!-- Eyebrow -->
        <tr>
          <td style="padding:20px 28px 0 28px;">
            <p style="margin:0;${BODY}font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:${BIZMIS_MUTED_FG_HEX};">
              Early access invite for <span style="color:${storeNameColor};">${store}</span>
            </p>
          </td>
        </tr>

        <!-- Headline -->
        <tr>
          <td style="padding:10px 28px 0 28px;">
            <p style="margin:0;${HEADING}font-size:22px;font-weight:700;line-height:1.25;color:#1a1a1a;">
              Drive sales and cut support load with Bizmis voice-first store clerks.
            </p>
          </td>
        </tr>

        <!-- Subline -->
        <tr>
          <td style="padding:10px 28px 0 28px;background-color:#ffffff;">
            <p style="margin:0;background-color:#ffffff;${BODY}font-size:14px;line-height:1.5;color:${BIZMIS_MUTED_FG_HEX};">
              Greets shoppers, recommends the right products, answers support questions, and helps more visitors buy with confidence.
            </p>
          </td>
        </tr>

        <!-- Chips — equal columns so none wrap alone -->
        <tr>
          <td style="padding:14px 24px 0 24px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;">
              <tr>
                <td width="33%" style="width:33%;vertical-align:top;padding:0 4px 0 0;text-align:center;">
                  <span style="${CHIP_BADGE_STYLE}">30 days on us &middot; no commitment</span>
                </td>
                <td width="34%" style="width:34%;vertical-align:top;padding:0 4px;text-align:center;">
                  <span style="${CHIP_BADGE_STYLE}">Your feedback shapes the roadmap</span>
                </td>
                <td width="33%" style="width:33%;vertical-align:top;padding:0 0 0 4px;text-align:center;">
                  <span style="${CHIP_BADGE_STYLE}">Limited offer · First ${storeCap} stores only</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Primary CTA -->
        <tr>
          <td style="padding:18px 28px 0 28px;" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background-color:#1a1a1a;padding:11px 24px;border-radius:9999px;text-align:center;">
                  <a href="${shopifyAppUrl}" target="_blank" style="display:inline-block;${BODY}font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                    Install Bizmis with early access
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Storefront demo mockup -->
        <tr>
          <td style="padding:20px 28px 0 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${BIZMIS_BORDER_HEX};border-radius:12px;overflow:hidden;">

              <!-- Browser chrome -->
              <tr>
                <td style="background-color:#f8f8f8;border-bottom:1px solid ${BIZMIS_BORDER_HEX};padding:8px 14px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="vertical-align:middle;">
                        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${BIZMIS_PRIMARY_DARK_HEX};margin-right:4px;"></span>
                        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${BIZMIS_PRIMARY_HEX};margin-right:4px;"></span>
                        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${BIZMIS_PRIMARY_LIGHT_HEX};margin-right:8px;"></span>
                        <span style="${BODY}font-size:10px;color:#999;">${domain}</span>
                      </td>
                      <td style="vertical-align:middle;text-align:right;">
                        <span style="${BODY}font-size:10px;font-weight:600;color:${BIZMIS_MUTED_FG_HEX};">Bizmis voice-first store clerk</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Two-column content -->
              <tr>
                <td style="padding:0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <!-- Left: voice interaction -->
                      <td width="48%" style="vertical-align:top;padding:14px 8px 14px 14px;">
                        <!-- Shopper prompt -->
                        <div style="background-color:#f5f5f5;border-radius:8px;padding:10px 12px;margin-bottom:10px;">
                          <p style="margin:0;${BODY}font-size:11px;line-height:1.5;color:#666;">
                            ${escapeHtml(lead.demoShopperPrompt)}
                          </p>
                        </div>

                        <!-- Voice state pill with waveform bars -->
                        <div style="display:inline-block;background-color:${BIZMIS_PRIMARY_TINT_008};border-radius:9999px;padding:4px 12px;margin-bottom:10px;">
                          ${listeningBarsHtml}
                          <span style="${BODY}font-size:10px;font-weight:600;color:${BIZMIS_PRIMARY_HEX};vertical-align:middle;margin-left:5px;">Listening</span>
                        </div>

                        <!-- Bizmis reply -->
                        <div style="background-color:${BIZMIS_PRIMARY_TINT_006};border-radius:8px;padding:10px 12px;border:1px solid ${BIZMIS_PRIMARY_TINT_010};">
                          <p style="margin:0 0 2px 0;${HEADING}font-size:9px;font-weight:700;color:${BIZMIS_PRIMARY_HEX};">bizmis</p>
                          <p style="margin:0;${BODY}font-size:11px;line-height:1.5;color:#666;">
                            ${escapeHtml(lead.demoBizmisReply)}
                          </p>
                        </div>
                      </td>

                      <!-- Right: product recommendations -->
                      <td width="52%" style="vertical-align:top;padding:14px 14px 14px 8px;">
                        ${productCardsHtml}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Widget footer -->
              <tr>
                <td style="border-top:1px solid ${BIZMIS_BORDER_HEX};background-color:#fafafa;padding:10px 14px;text-align:right;">
                  <div style="display:inline-block;background-color:#1a1a1a;border-radius:9999px;padding:5px 12px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:5px;">
                          <img src="${bizmisLogoUrl}" alt="" width="12" height="12" style="display:block;width:12px;height:12px;border:0;" />
                        </td>
                        <td style="vertical-align:middle;padding-right:6px;">
                          ${widgetBarsHtml}
                        </td>
                        <td style="vertical-align:middle;">
                          <span style="${BODY}font-size:9px;font-weight:500;color:#ffffff;">Ask by voice</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- Outcome strip -->
        <tr>
          <td style="padding:18px 28px 0 28px;text-align:center;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                <td style="padding:0 16px 0 0;vertical-align:middle;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align:middle;padding-right:6px;">
                        <img src="${outcomeIconTrendUrl}" alt="" width="16" height="16" style="display:block;width:16px;height:16px;border:0;" />
                      </td>
                      <td style="vertical-align:middle;${BODY}font-size:12px;font-weight:500;color:#555;">Sell more</td>
                    </tr>
                  </table>
                </td>
                <td style="padding:0 16px 0 0;vertical-align:middle;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align:middle;padding-right:6px;">
                        <img src="${outcomeIconHeadphonesUrl}" alt="" width="16" height="16" style="display:block;width:16px;height:16px;border:0;" />
                      </td>
                      <td style="vertical-align:middle;${BODY}font-size:12px;font-weight:500;color:#555;">Support faster</td>
                    </tr>
                  </table>
                </td>
                <td style="padding:0;vertical-align:middle;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align:middle;padding-right:6px;">
                        <img src="${outcomeIconChartUrl}" alt="" width="16" height="16" style="display:block;width:16px;height:16px;border:0;" />
                      </td>
                      <td style="vertical-align:middle;${BODY}font-size:12px;font-weight:500;color:#555;">Learn from sessions</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Micro copy -->
        <tr>
          <td style="padding:16px 28px 0 28px;text-align:center;">
            <p style="margin:0;${BODY}font-size:13px;line-height:1.5;color:${BIZMIS_MUTED_FG_HEX};">
              As an early-access store, you&rsquo;ll get direct access to us and help shape the roadmap.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 28px 22px 28px;text-align:center;">
            <p style="margin:0 0 4px 0;${BODY}font-size:11px;color:#999;">
              Questions? Just reply to this email.
            </p>
            <a href="${BIZMIS_URL}" target="_blank" style="${BODY}font-size:11px;font-weight:600;color:${BIZMIS_PRIMARY_HEX};text-decoration:none;">
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
    `EARLY ACCESS INVITE FOR ${lead.storeName.toUpperCase()}`,
    "",
    "Drive sales and cut support load with Bizmis voice-first store clerks.",
    "",
    "Greets shoppers, recommends the right products, answers support questions, and helps more visitors buy with confidence.",
    "",
    "30 days on us · no commitment",
    "Your feedback shapes the roadmap",
    `Limited offer · First ${storeCap} stores only`,
    "",
    `Install Bizmis with early access: ${shopifyAppUrl}`,
    "",
    "As an early-access store, you'll get direct access to us and help shape the roadmap.",
    "",
    "Questions? Just reply to this email.",
    `Visit us: ${BIZMIS_URL}`,
  ].join("\n");

  return { html, plainText };
}

/**
 * Copies the raw HTML source code as plain text for pasting into
 * an email platform's HTML / source editor.
 */
export function copyLeadPilotHtmlSource(lead: LeadPilotInviteData): Promise<void> {
  const { html } = buildLeadPilotInviteEmailHtml(lead);
  return navigator.clipboard.writeText(html);
}
