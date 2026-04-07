import {
  BIZMIS_PRODUCT_NAME,
  buildPilotInviteChips,
  buildPilotInviteFooterPlainText,
  buildPilotInviteGreetingPlainText,
  buildPilotInvitePreheader,
  PILOT_INVITE_EMAIL_COPY,
} from "@/data/leadPilotInviteCopy";
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
const SHOPIFY_MARK_WHITE = "/images/shopify-mark-white.png";
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
/** --foreground HSL(35,30%,15%) pre-baked — warm dark brown */
const BIZMIS_FOREGROUND_HEX = "#32281B";
/** Lighter muted for de-emphasized text (footer, captions) */
const BIZMIS_MUTED_LIGHT_HEX = "#B5A48E";
/** Warm neutral replacing cold #f8f8f8 / #f5f5f5 */
const BIZMIS_WARM_SURFACE_HEX = "#FAF7F4";
/** Warm shadow matching landing --shadow-soft (orange-tinted) */
const BIZMIS_SHADOW_SOFT = "0 6px 25px -6px rgba(249,163,83,0.18)";
/** Softer dashed border for coupon pill (lighter than BIZMIS_BORDER_HEX) */
const COUPON_PILL_BORDER_HEX = "#E8DFD4";
/** Near-white surface so coupon reads lighter than the warm CTA block */
const COUPON_PILL_BG_HEX = "#FDFCFB";

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

const HEADING = "font-family:'Plus Jakarta Sans','Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;";
const BODY = "font-family:'DM Sans','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;";

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

const MOCKUP_PRODUCT_COUNT = 2;

function buildProductCardsHtml(lead: LeadPilotInviteData): string {
  const productImages = [lead.productAImagePath, lead.productBImagePath, lead.productCImagePath];
  const products = lead.demoProducts.slice(0, MOCKUP_PRODUCT_COUNT);

  return products
    .map((product, i) => {
      const imgUrl = absImg(productImages[i]);
      const mb = i < products.length - 1 ? "margin-bottom:6px;" : "";
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${BIZMIS_BORDER_HEX};border-radius:12px;${mb}">
            <tr>
              <td width="50" style="padding:8px;">
                <img src="${imgUrl}" alt="" width="42" style="display:block;max-width:42px;height:auto;border:0;border-radius:8px;" />
              </td>
              <td style="padding:8px 10px 8px 0;vertical-align:middle;">
                <p style="margin:0;${BODY}font-size:11px;font-weight:600;color:${BIZMIS_FOREGROUND_HEX};">${escapeHtml(product.title)}</p>
                <p style="margin:2px 0 3px;${BODY}font-size:11px;color:${BIZMIS_MUTED_FG_HEX};">${escapeHtml(product.price)}</p>
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

function buildPilotInviteChipStripHtml(storeCap: number): string {
  const sepDotStyle = `display:inline-block;width:4px;height:4px;border-radius:50%;background-color:${BIZMIS_BORDER_HEX};vertical-align:middle;margin:0 8px;`;
  const textStyle = `${BODY}font-size:11px;font-weight:500;color:${BIZMIS_MUTED_FG_HEX};vertical-align:middle;`;
  return buildPilotInviteChips(storeCap)
    .map((phrase) => `<span style="${textStyle}">${escapeHtml(phrase)}</span>`)
    .join(`<span style="${sepDotStyle}"></span>`);
}

function buildPilotInviteOutcomeStripHtml(
  outcomeIconUrls: readonly [string, string, string],
): string {
  const paddings = ["padding:0 16px 0 0;", "padding:0 16px 0 0;", "padding:0;"] as const;
  return PILOT_INVITE_EMAIL_COPY.outcomes
    .map((label, i) => {
      const url = outcomeIconUrls[i];
      const labelEsc = escapeHtml(label);
      return `<td style="${paddings[i]}vertical-align:middle;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align:middle;padding-right:6px;">
                        <img src="${url}" alt="" width="16" height="16" style="display:block;width:16px;height:16px;border:0;" />
                      </td>
                      <td style="vertical-align:middle;${BODY}font-size:12px;font-weight:600;color:${BIZMIS_MUTED_FG_HEX};">${labelEsc}</td>
                    </tr>
                  </table>
                </td>`;
    })
    .join("\n                ");
}

export function buildLeadPilotInviteEmailHtml(
  lead: LeadPilotInviteData,
): { html: string; plainText: string } {
  const pri = lead.primaryColor;
  const storeNameColor = escapeHtml(resolveStoreNameTextColor(lead));
  const store = escapeHtml(lead.storeName);
  const domain = escapeHtml(lead.storeDomain);
  const { storeCap, shopifyAppUrl } = PILOT_INVITE_TERMS;
  const copy = PILOT_INVITE_EMAIL_COPY;

  const storeLogoHtml = storeLogoEmailMarkup(lead);
  const bizmisLogoUrl = absImg(BIZMIS_LOGO_WHITE);
  const shopifyMarkUrl = absImg(SHOPIFY_MARK_WHITE);
  const productCardsHtml = buildProductCardsHtml(lead);
  const outcomeIconUrls = [
    absImg(OUTCOME_ICON_TREND),
    absImg(OUTCOME_ICON_HEADPHONES),
    absImg(OUTCOME_ICON_CHART),
  ] as const;

  const listeningBarsHtml = emailWaveformBars(BIZMIS_PRIMARY_HEX, LISTENING_BARS);
  const widgetBarsHtml = emailWaveformBars("#ffffff", WIDGET_BARS);

  const preheader = buildPilotInvitePreheader(lead.storeName, storeCap);

  const chipStripHtml = buildPilotInviteChipStripHtml(storeCap);
  const bizmisProductNameEsc = escapeHtml(BIZMIS_PRODUCT_NAME);
  const outcomeStripInnerHtml = buildPilotInviteOutcomeStripHtml(outcomeIconUrls);

  const couponCodeEsc = escapeHtml(lead.couponCode.trim());

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(copy.emailDocumentTitle)}</title>
</head>
<body style="margin:0;padding:0;background-color:${BIZMIS_WARM_BG_HEX};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<!-- Preheader (hidden) -->
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BIZMIS_WARM_BG_HEX};">
  <tr>
    <td align="center" style="padding:28px 16px;">

      <!-- Card wrapper -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background-color:#ffffff;border:1px solid ${BIZMIS_BORDER_HEX};border-radius:16px;overflow:hidden;box-shadow:${BIZMIS_SHADOW_SOFT};">

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

        <!-- Greeting -->
        <tr>
          <td style="padding:28px 32px 0 32px;">
            <p style="margin:0;${BODY}font-size:15px;font-weight:500;line-height:1.55;color:${BIZMIS_FOREGROUND_HEX};">
              ${escapeHtml(copy.invitePrefix)} <span style="color:${storeNameColor};font-weight:700;">${store}</span> ${escapeHtml(copy.inviteJoiner)} <a href="${shopifyAppUrl}" target="_blank" style="${BODY}font-weight:700;color:${BIZMIS_PRIMARY_HEX};text-decoration:none;">${bizmisProductNameEsc}</a> ${escapeHtml(copy.inviteSuffix)}
            </p>
          </td>
        </tr>

        <!-- Headline -->
        <tr>
          <td style="padding:16px 32px 0 32px;">
            <p style="margin:0;${HEADING}font-size:22px;font-weight:700;line-height:1.3;color:${BIZMIS_FOREGROUND_HEX};">
              ${escapeHtml(copy.headline)}
            </p>
          </td>
        </tr>

        <!-- Subline -->
        <tr>
          <td style="padding:14px 32px 0 32px;">
            <p style="margin:0;${BODY}font-size:14px;line-height:1.65;color:${BIZMIS_MUTED_FG_HEX};">
              ${escapeHtml(copy.subline)}
            </p>
          </td>
        </tr>

        <!-- CTA block: coupon above button, value chips below -->
        <tr>
          <td style="padding:20px 32px 0 32px;" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BIZMIS_WARM_SURFACE_HEX};border-radius:16px;">
              <tr>
                <td style="padding:18px 20px 12px 20px;" align="center">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background-color:${COUPON_PILL_BG_HEX};border:1px dashed ${COUPON_PILL_BORDER_HEX};border-radius:6px;padding:6px 12px;text-align:center;line-height:1.4;">
                        <span style="${BODY}font-size:9px;color:${BIZMIS_MUTED_LIGHT_HEX};vertical-align:middle;">${escapeHtml(copy.couponLabel)}</span> <span style="${BODY}font-size:11px;font-weight:500;color:${BIZMIS_MUTED_FG_HEX};letter-spacing:0.04em;vertical-align:middle;">${couponCodeEsc}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 20px 12px 20px;" align="center">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background-color:${BIZMIS_FOREGROUND_HEX};padding:13px 32px;border-radius:12px;text-align:center;box-shadow:0 4px 14px -2px rgba(50,40,27,0.2);">
                        <a href="${shopifyAppUrl}" target="_blank" style="display:inline-block;text-decoration:none;color:#ffffff;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                            <tr>
                              <td style="vertical-align:middle;padding-right:10px;">
                                <img src="${shopifyMarkUrl}" alt="Shopify" width="22" height="22" style="display:block;width:22px;height:22px;border:0;" />
                              </td>
                              <td style="vertical-align:middle;${HEADING}font-size:14px;font-weight:600;color:#ffffff;">
                                ${escapeHtml(copy.ctaLabel)}
                              </td>
                            </tr>
                          </table>
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 16px 18px 16px;text-align:center;line-height:1.5;">
                  ${chipStripHtml}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Outcome strip -->
        <tr>
          <td style="padding:18px 32px 0 32px;text-align:center;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                ${outcomeStripInnerHtml}
              </tr>
            </table>
          </td>
        </tr>

        <!-- Storefront demo mockup -->
        <tr>
          <td style="padding:24px 28px 0 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${BIZMIS_BORDER_HEX};border-radius:16px;overflow:hidden;box-shadow:0 4px 20px -4px rgba(0,0,0,0.06);">

              <!-- Browser chrome -->
              <tr>
                <td style="background-color:${BIZMIS_WARM_SURFACE_HEX};border-bottom:1px solid ${BIZMIS_BORDER_HEX};padding:8px 14px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="vertical-align:middle;">
                        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${BIZMIS_PRIMARY_DARK_HEX};margin-right:4px;"></span>
                        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${BIZMIS_PRIMARY_HEX};margin-right:4px;"></span>
                        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${BIZMIS_PRIMARY_LIGHT_HEX};margin-right:8px;"></span>
                        <span style="${BODY}font-size:10px;color:${BIZMIS_MUTED_LIGHT_HEX};">${domain}</span>
                      </td>
                      <td style="vertical-align:middle;text-align:right;">
                        <span style="${BODY}font-size:10px;font-weight:600;color:${BIZMIS_MUTED_FG_HEX};">${escapeHtml(copy.mockupClerkLabel)}</span>
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
                      <td width="48%" style="vertical-align:top;padding:10px 6px 10px 12px;">
                        <!-- Shopper prompt -->
                        <div style="background-color:${BIZMIS_WARM_SURFACE_HEX};border-radius:10px;padding:10px 12px;margin-bottom:10px;">
                          <p style="margin:0;${BODY}font-size:11px;line-height:1.5;color:${BIZMIS_MUTED_FG_HEX};">
                            ${escapeHtml(lead.demoShopperPrompt)}
                          </p>
                        </div>

                        <!-- Voice state pill with waveform bars -->
                        <div style="display:inline-block;background-color:${BIZMIS_PRIMARY_TINT_008};border-radius:9999px;padding:4px 12px;margin-bottom:10px;">
                          ${listeningBarsHtml}
                          <span style="${BODY}font-size:10px;font-weight:600;color:${BIZMIS_PRIMARY_HEX};vertical-align:middle;margin-left:5px;">${escapeHtml(copy.voiceListeningLabel)}</span>
                        </div>

                        <!-- Bizmis reply -->
                        <div style="background-color:${BIZMIS_PRIMARY_TINT_006};border-radius:10px;padding:10px 12px;border:1px solid ${BIZMIS_PRIMARY_TINT_010};">
                          <p style="margin:0 0 2px 0;${HEADING}font-size:9px;font-weight:700;color:${BIZMIS_PRIMARY_HEX};">bizmis</p>
                          <p style="margin:0;${BODY}font-size:11px;line-height:1.5;color:${BIZMIS_MUTED_FG_HEX};">
                            ${escapeHtml(lead.demoBizmisReply)}
                          </p>
                        </div>
                      </td>

                      <!-- Right: product recommendations -->
                      <td width="52%" style="vertical-align:top;padding:10px 12px 10px 6px;">
                        ${productCardsHtml}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Widget footer -->
              <tr>
                <td style="border-top:1px solid ${BIZMIS_BORDER_HEX};background-color:${BIZMIS_WARM_SURFACE_HEX};padding:10px 14px;text-align:right;">
                  <div style="display:inline-block;background-color:${BIZMIS_FOREGROUND_HEX};border-radius:9999px;padding:5px 12px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:5px;">
                          <img src="${bizmisLogoUrl}" alt="" width="12" height="12" style="display:block;width:12px;height:12px;border:0;" />
                        </td>
                        <td style="vertical-align:middle;padding-right:6px;">
                          ${widgetBarsHtml}
                        </td>
                        <td style="vertical-align:middle;">
                          <span style="${BODY}font-size:9px;font-weight:500;color:#ffffff;">${escapeHtml(copy.voiceWidgetCta)}</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- Footer (proof + contact + link) -->
        <tr>
          <td style="padding:24px 32px 32px 32px;text-align:center;">
            <p style="margin:0 0 6px 0;${BODY}font-size:12px;line-height:1.55;color:${BIZMIS_MUTED_FG_HEX};">
              ${escapeHtml(copy.proofLine)}
            </p>
            <p style="margin:0 0 4px 0;${BODY}font-size:11px;color:${BIZMIS_MUTED_LIGHT_HEX};">
              Questions? Just reply to this email (<a href="mailto:${escapeHtml(copy.contactEmail)}" style="${BODY}font-size:11px;font-weight:400;color:${BIZMIS_PRIMARY_HEX};text-decoration:none;">${escapeHtml(copy.contactEmail)}</a>).
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

  const chipPlainLines = buildPilotInviteChips(storeCap);
  const plainText = [
    buildPilotInviteGreetingPlainText(lead.storeName),
    "",
    copy.headline,
    "",
    copy.subline,
    "",
    `${copy.couponLabel} ${lead.couponCode.trim()}`,
    `${copy.ctaLabel}: ${shopifyAppUrl}`,
    "",
    ...chipPlainLines,
    "",
    copy.proofLine,
    "",
    buildPilotInviteFooterPlainText(),
    `${copy.visitUsPrefix} ${BIZMIS_URL}`,
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
