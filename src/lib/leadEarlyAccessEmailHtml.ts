import {
  buildEarlyAccessChips,
  buildEarlyAccessFooterPlainText,
  buildEarlyAccessPreheader,
  buildEarlyAccessSalutationPlainText,
  buildEarlyAccessTrialUsageFootnotePlainText,
  buildEarlyAccessValueSentencePlainText,
  earlyAccessGreetingFirstName,
  EARLY_ACCESS_EMAIL_COPY,
} from "@/data/leadEarlyAccessCopy";
import {
  type LeadEarlyAccessData,
  EARLY_ACCESS_TERMS,
  resolveLeadLogoScale,
  resolveLogoColorOverlay,
  resolveStoreNameTextColor,
} from "@/data/leads/_schema";
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

const OUTCOME_ICON_TREND = "/images/early-access-outcome-trend.svg";
const OUTCOME_ICON_HEADPHONES = "/images/early-access-outcome-headphones.svg";
const OUTCOME_ICON_CHART = "/images/early-access-outcome-chart.svg";

const BIZMIS_CLERK_AVATAR_FALLBACK =
  "/images/slides/shopify-listing/shopify-personalization-screenshot-outfitters-tablet.png";

const BIZMIS_PRIMARY_TINT_006 = "#FFF8F1";
const MONTAGE_CARD_BORDER_HEX = "#F0E0D0";
const MONTAGE_CHROME_BG_HEX = "#F7F7F7";
const MONTAGE_CHROME_URL_HEX = "#A3A3A3";
const MONTAGE_CHROME_TRAFFIC_DOT_PX = 8;
const MONTAGE_CHROME_TRAFFIC_GAP_PX = 2;
const MONTAGE_CHROME_URL_ROW_HEIGHT_PX = 15;
const MONTAGE_CHROME_BAR_PADDING_Y_PX = 5;
const EARLY_ACCESS_MONTAGE_WAVEFORM_IMG = "/images/early-access-montage-waveform.png";
const EARLY_ACCESS_MONTAGE_WAVEFORM_IMG_W_PX = 480;
const EARLY_ACCESS_MONTAGE_WAVEFORM_IMG_H_PX = 42;
const BIZMIS_FOREGROUND_HEX = "#32281B";
const BIZMIS_MUTED_LIGHT_HEX = "#B5A48E";
const BIZMIS_SHADOW_SOFT = "0 6px 25px -6px rgba(249,163,83,0.18)";
const COUPON_PILL_BORDER_HEX = "#EBE6DF";
const CTA_COUPON_CUTOUT_BORDER_PX = 1.5;
const CTA_COUPON_CUTOUT_DASH = "rgba(50, 40, 27, 0.1)";
const COUPON_PILL_BG_HEX = "#F7F5F2";

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

function logoPublicPathForEmail(logoImagePath: string): string {
  if (logoImagePath.toLowerCase().endsWith(".svg")) {
    return logoImagePath.replace(/\.svg$/i, ".png");
  }
  return logoImagePath;
}

const EMAIL_HEADER_LOGO_BASE_WIDTH_PX = 120;
const EMAIL_HEADER_LOGO_BASE_MASK_HEIGHT_PX = 32;

function storeLogoEmailMarkup(lead: LeadEarlyAccessData): string {
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

const HEADING = "font-family:'Plus Jakarta Sans','Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;";
const BODY = "font-family:'DM Sans','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;";

function emailMontageWatermarkWaveformImgHtml(): string {
  const src = escapeHtml(absImg(EARLY_ACCESS_MONTAGE_WAVEFORM_IMG));
  const w = EARLY_ACCESS_MONTAGE_WAVEFORM_IMG_W_PX;
  const h = EARLY_ACCESS_MONTAGE_WAVEFORM_IMG_H_PX;
  return `<img src="${src}" alt="" role="presentation" width="${w}" height="${h}" style="display:block;margin:0 auto;border:0;width:100%;max-width:${w}px;height:${h}px;" />`;
}

function buildMontageProductCardHtml(lead: LeadEarlyAccessData, index: number): string {
  const productImages = [lead.productAImagePath, lead.productBImagePath, lead.productCImagePath];
  const product = lead.demoProducts[index];
  if (!product) return "";
  const imgUrl = absImg(productImages[index]);
  const tagEsc = escapeHtml(product.tag);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:168px;margin:0 auto;">
              <tr>
                <td align="center" style="padding:0 0 2px 0;line-height:1;">
                  <span style="display:inline-block;background-color:${BIZMIS_PRIMARY_TINT_006};border:1px solid ${MONTAGE_CARD_BORDER_HEX};border-radius:9999px;padding:2px 8px;${BODY}font-size:7px;font-weight:600;color:${BIZMIS_PRIMARY_DARK_HEX};letter-spacing:0.02em;">${tagEsc}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${MONTAGE_CARD_BORDER_HEX};border-radius:10px;margin-top:-6px;">
                    <tr>
                      <td width="44" style="padding:6px 4px 6px 8px;vertical-align:middle;">
                        <img src="${imgUrl}" alt="" width="36" style="display:block;max-width:36px;height:auto;border:0;border-radius:6px;" />
                      </td>
                      <td style="padding:6px 8px 6px 2px;vertical-align:middle;">
                        <p style="margin:0;${BODY}font-size:9px;font-weight:600;color:${BIZMIS_FOREGROUND_HEX};line-height:1.25;">${escapeHtml(product.title)}</p>
                        <p style="margin:1px 0 0;${BODY}font-size:8px;color:${BIZMIS_MUTED_LIGHT_HEX};">${escapeHtml(product.price)}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>`;
}

function buildEarlyAccessChipStripHtml(storeCap: number): string {
  const sepDotStyle = `display:inline-block;width:3px;height:3px;border-radius:50%;background-color:${BIZMIS_MUTED_LIGHT_HEX};vertical-align:middle;margin:0 11px;`;
  const textStyle = `${BODY}font-size:10px;font-weight:500;color:${BIZMIS_MUTED_FG_HEX};vertical-align:middle;letter-spacing:0.01em;`;
  return buildEarlyAccessChips(storeCap)
    .map((phrase) => `<span style="${textStyle}">${escapeHtml(phrase)}</span>`)
    .join(`<span style="${sepDotStyle}"></span>`);
}

function buildEarlyAccessOutcomeStripHtml(
  outcomeIconUrls: readonly [string, string, string],
): string {
  const paddings = ["padding:0 22px 0 0;", "padding:0 22px 0 0;", "padding:0;"] as const;
  return EARLY_ACCESS_EMAIL_COPY.outcomes
    .map((label, i) => {
      const url = outcomeIconUrls[i];
      const labelEsc = escapeHtml(label);
      return `<td style="${paddings[i]}vertical-align:middle;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align:middle;padding-right:7px;width:18px;">
                        <img src="${url}" alt="" width="15" height="15" style="display:block;width:15px;height:15px;border:0;opacity:0.92;" />
                      </td>
                      <td style="vertical-align:middle;${BODY}font-size:11px;font-weight:500;color:${BIZMIS_MUTED_FG_HEX};letter-spacing:0.01em;">${labelEsc}</td>
                    </tr>
                  </table>
                </td>`;
    })
    .join("\n                ");
}

export function buildLeadEarlyAccessEmailHtml(
  lead: LeadEarlyAccessData,
): { html: string; plainText: string } {
  const pri = lead.primaryColor;
  const storeNameColor = escapeHtml(resolveStoreNameTextColor(lead));
  const store = escapeHtml(lead.storeName);
  const domain = escapeHtml(lead.storeDomain);
  const { storeCap, shopifyAppUrl } = EARLY_ACCESS_TERMS;
  const copy = EARLY_ACCESS_EMAIL_COPY;

  const storeLogoHtml = storeLogoEmailMarkup(lead);
  const bizmisLogoUrl = absImg(BIZMIS_LOGO_WHITE);
  const shopifyMarkUrl = absImg(SHOPIFY_MARK_WHITE);
  const clerkAvatarUrl = absImg(lead.clerkAvatarImagePath || BIZMIS_CLERK_AVATAR_FALLBACK);
  const montageCards = [
    buildMontageProductCardHtml(lead, 0),
    buildMontageProductCardHtml(lead, 1),
    buildMontageProductCardHtml(lead, 2),
  ];
  const montageClerkCueRaw = lead.montageClerkCue?.trim() || copy.montageClerkCueDefault;
  const montageClerkCueEsc = escapeHtml(montageClerkCueRaw);
  const montageWatermarkWaveformHtml = emailMontageWatermarkWaveformImgHtml();
  const outcomeIconUrls = [
    absImg(OUTCOME_ICON_TREND),
    absImg(OUTCOME_ICON_HEADPHONES),
    absImg(OUTCOME_ICON_CHART),
  ] as const;

  const preheader = buildEarlyAccessPreheader(lead.storeName, storeCap);

  const chipStripHtml = buildEarlyAccessChipStripHtml(storeCap);
  const chipTrialFootnoteEsc = escapeHtml(buildEarlyAccessTrialUsageFootnotePlainText());
  const outcomeStripInnerHtml = buildEarlyAccessOutcomeStripHtml(outcomeIconUrls);

  const couponCodeEsc = escapeHtml(lead.couponCode.trim());

  const contactFirstName = earlyAccessGreetingFirstName(lead.leadContactName);
  const contactFirstEsc = contactFirstName ? escapeHtml(contactFirstName) : "";
  const accentInviteBizmis = `font-weight:600;color:${BIZMIS_PRIMARY_HEX};`;
  const accentInviteStore = `color:${storeNameColor};font-weight:600;`;
  const salutationParagraphInnerHtml = contactFirstName
    ? `${escapeHtml(copy.greetingDear)} ${contactFirstEsc},`
    : `${escapeHtml(copy.greetingDear)} ${store}${escapeHtml(copy.greetingStoreTeamSuffix)}`;
  const beforeBizmis = contactFirstName
    ? copy.inviteSentenceLeadNamedBeforeBizmis
    : copy.inviteSentenceLeadNoContactBeforeBizmis;
  const bizmisWordEsc = escapeHtml(copy.inviteSentenceBizmisWord);
  const inviteLeadParagraphInnerHtml = `${escapeHtml(beforeBizmis)}<span style="${accentInviteBizmis}">${bizmisWordEsc}</span>${escapeHtml(copy.inviteSentenceAfterFirstBizmis)}<span style="${accentInviteStore}">${store}</span>${escapeHtml(copy.inviteSentenceAfterStore)}`;

  const inviteTopGreetingStyle = `${BODY}font-size:11px;font-weight:400;line-height:1.6;color:${BIZMIS_MUTED_FG_HEX};letter-spacing:0.01em;`;
  const inviteTopLeadStyle = `${BODY}font-size:15px;font-weight:400;line-height:1.72;color:${BIZMIS_FOREGROUND_HEX};`;
  const inviteTopSupportStyle = `${BODY}font-size:11px;font-weight:400;line-height:1.72;color:${BIZMIS_MUTED_LIGHT_HEX};text-align:center;`;

  const inviteTopLeadMeasurePx = 440;
  const inviteTopSupportMeasurePx = 420;

  const softCtaAboveMockupBase = `${BODY}font-size:12px;line-height:1.72;`;
  const softCtaAboveMockupHtml = `<span style="${softCtaAboveMockupBase}color:${BIZMIS_MUTED_LIGHT_HEX};font-weight:400;"><a href="${shopifyAppUrl}" target="_blank" style="${softCtaAboveMockupBase}color:${BIZMIS_PRIMARY_HEX};font-weight:500;text-decoration:none;">${escapeHtml(copy.softCtaAboveMockupLinkPhrase)}</a>${escapeHtml(copy.softCtaAboveMockupAfterLink)}${escapeHtml(copy.softCtaAboveMockupEmphasis)}</span>`;

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
                <td width="50%" style="background-color:${pri};padding:14px 14px 14px 24px;vertical-align:middle;">
                  ${storeLogoHtml}
                </td>
                <td width="6%" style="background-color:${pri};background:linear-gradient(to bottom right,${pri} 50%,${BIZMIS_PRIMARY_HEX} 50%);text-align:center;vertical-align:middle;padding:0;">
                  <span style="${HEADING}font-size:28px;font-weight:900;color:#ffffff;line-height:1;text-shadow:0 1px 4px rgba(0,0,0,0.25);">&#x2716;</span>
                </td>
                <td width="44%" style="background:linear-gradient(145deg,${BIZMIS_PRIMARY_LIGHT_HEX} 0%,${BIZMIS_PRIMARY_HEX} 52%,${BIZMIS_PRIMARY_DARK_HEX} 100%);padding:14px 24px 14px 14px;vertical-align:middle;text-align:right;">
                  <a href="${BIZMIS_URL}" target="_blank" style="text-decoration:none;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right">
                      <tr>
                        <td style="vertical-align:middle;">
                          <img src="${bizmisLogoUrl}" alt="Bizmis" width="32" height="32" style="display:block;width:32px;height:auto;border:0;" />
                        </td>
                        <td style="vertical-align:middle;padding-left:7px;${HEADING}font-size:17px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">
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

        <!-- Salutation (small) -->
        <tr>
          <td style="padding:26px 32px 0 32px;">
            <p style="margin:0;${inviteTopGreetingStyle}">
              ${salutationParagraphInnerHtml}
            </p>
          </td>
        </tr>

        <!-- Invitation sentence (dominant, softened — not hero weight) -->
        <tr>
          <td style="padding:30px 32px 0 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:${inviteTopLeadMeasurePx}px;">
              <tr>
                <td style="padding:0;">
                  <p style="margin:0;${inviteTopLeadStyle}">
                    ${inviteLeadParagraphInnerHtml}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Soft editorial CTA (above mockup; same URL as install button) -->
        <tr>
          <td style="padding:14px 32px 0 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:${inviteTopLeadMeasurePx}px;">
              <tr>
                <td style="padding:0;">
                  <p style="margin:0;">
                    ${softCtaAboveMockupHtml}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Desktop frame: slides-style chrome + single white scene with watermark -->
        <tr>
          <td style="padding:26px 20px 0 20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:0;border-radius:12px;overflow:hidden;box-shadow:0 8px 40px -8px rgba(0,0,0,0.12);">
              <tr>
                <td style="background-color:${MONTAGE_CHROME_BG_HEX};padding:${MONTAGE_CHROME_BAR_PADDING_Y_PX}px 10px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="vertical-align:middle;white-space:nowrap;padding-right:8px;">
                        <span style="display:inline-block;width:${MONTAGE_CHROME_TRAFFIC_DOT_PX}px;height:${MONTAGE_CHROME_TRAFFIC_DOT_PX}px;border-radius:50%;background-color:${BIZMIS_PRIMARY_DARK_HEX};margin-right:${MONTAGE_CHROME_TRAFFIC_GAP_PX}px;vertical-align:middle;"></span>
                        <span style="display:inline-block;width:${MONTAGE_CHROME_TRAFFIC_DOT_PX}px;height:${MONTAGE_CHROME_TRAFFIC_DOT_PX}px;border-radius:50%;background-color:${BIZMIS_PRIMARY_HEX};margin-right:${MONTAGE_CHROME_TRAFFIC_GAP_PX}px;vertical-align:middle;"></span>
                        <span style="display:inline-block;width:${MONTAGE_CHROME_TRAFFIC_DOT_PX}px;height:${MONTAGE_CHROME_TRAFFIC_DOT_PX}px;border-radius:50%;background-color:${BIZMIS_PRIMARY_LIGHT_HEX};vertical-align:middle;"></span>
                      </td>
                      <td style="vertical-align:middle;width:99%;padding:0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#ffffff;border-radius:9999px;">
                          <tr>
                            <td style="padding:0 8px;height:${MONTAGE_CHROME_URL_ROW_HEIGHT_PX}px;vertical-align:middle;line-height:${MONTAGE_CHROME_URL_ROW_HEIGHT_PX}px;">
                              <span style="${BODY}font-size:7px;color:${MONTAGE_CHROME_URL_HEX};line-height:${MONTAGE_CHROME_URL_ROW_HEIGHT_PX}px;">${domain}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td bgcolor="#ffffff" style="background-color:#ffffff;padding:14px 16px 0 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td width="56%" style="vertical-align:middle;padding:0 10px 0 0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" align="center" style="margin:0 auto;">
                          <tr>
                            <td width="50%" style="vertical-align:top;text-align:center;padding:0 2px 0 0;">
                              ${montageCards[0]}
                            </td>
                            <td width="50%" style="vertical-align:top;text-align:center;padding:0 0 0 2px;">
                              ${montageCards[1]}
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" style="vertical-align:top;text-align:center;padding:5px 0 0 0;">
                              ${montageCards[2]}
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td width="44%" style="vertical-align:middle;padding:0;text-align:center;">
                        <img src="${clerkAvatarUrl}" alt="Bizmis store clerk" width="150" style="display:block;margin:0 auto;max-width:150px;height:auto;border:0;border-radius:12px;" />
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding:10px 0 8px 0;text-align:center;position:relative;">
                        <!--[if !mso]><!-->
                        <div style="position:relative;display:block;margin:0 auto;max-width:100%;">
                          <div style="text-align:center;line-height:0;font-size:0;padding:0;height:42px;overflow:hidden;">
                            ${montageWatermarkWaveformHtml}
                          </div>
                          <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;">
                            <div style="position:absolute;width:70%;height:100%;top:0;left:15%;background:radial-gradient(ellipse 100% 100% at 50% 50%,rgba(255,255,255,0.92) 0%,rgba(255,255,255,0.45) 30%,transparent 68%);"></div>
                            <p style="margin:0;position:relative;${BODY}font-size:11px;font-weight:500;line-height:1;color:${BIZMIS_PRIMARY_DARK_HEX};">
                              ${montageClerkCueEsc}
                            </p>
                          </div>
                        </div>
                        <!--<![endif]-->
                        <!--[if mso]>
                        <p style="margin:0;${BODY}font-size:11px;font-weight:500;line-height:1.5;color:${BIZMIS_PRIMARY_DARK_HEX};">
                          ${montageClerkCueEsc}
                        </p>
                        <![endif]-->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Value strip (reinforcement after demo, before subline + CTA) -->
        <tr>
          <td style="padding:28px 32px 0 32px;text-align:center;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                ${outcomeStripInnerHtml}
              </tr>
            </table>
          </td>
        </tr>

        <!-- Supporting sentence (subtitle) -->
        <tr>
          <td style="padding:30px 32px 0 32px;" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:${inviteTopSupportMeasurePx}px;margin:0 auto;">
              <tr>
                <td style="padding:0;">
                  <p style="margin:0;${inviteTopSupportStyle}">
                    ${escapeHtml(copy.subline)}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA block: coupon, button, offer chips -->
        <tr>
          <td style="padding:28px 32px 0 32px;" align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:transparent;border:${CTA_COUPON_CUTOUT_BORDER_PX}px dashed ${CTA_COUPON_CUTOUT_DASH};border-radius:14px;">
              <tr>
                <td style="padding:24px 28px 14px 28px;" align="center">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding:6px 14px;text-align:center;line-height:1.5;">
                        <span style="${BODY}font-size:9px;font-weight:400;color:${BIZMIS_MUTED_LIGHT_HEX};letter-spacing:0.02em;vertical-align:middle;">${escapeHtml(copy.couponLabel)}</span> <span style="${BODY}font-size:10px;font-weight:400;color:${BIZMIS_MUTED_FG_HEX};letter-spacing:0.04em;vertical-align:middle;">${couponCodeEsc}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 28px 20px 28px;" align="center">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background-color:${BIZMIS_FOREGROUND_HEX};padding:14px 36px;border-radius:12px;text-align:center;box-shadow:0 2px 8px -2px rgba(50,40,27,0.12);">
                        <a href="${shopifyAppUrl}" target="_blank" style="display:inline-block;text-decoration:none;color:#ffffff;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                            <tr>
                              <td style="vertical-align:middle;padding-right:10px;">
                                <img src="${shopifyMarkUrl}" alt="Shopify" width="20" height="20" style="display:block;width:20px;height:20px;border:0;" />
                              </td>
                              <td style="vertical-align:middle;${HEADING}font-size:13px;font-weight:600;color:#ffffff;">
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
                <td style="padding:0 24px 24px 24px;text-align:center;line-height:1.7;">
                  ${chipStripHtml}
                </td>
              </tr>
            </table>
            <p style="margin:10px 0 0 0;${BODY}font-size:8px;line-height:1.4;color:${BIZMIS_MUTED_LIGHT_HEX};text-align:center;">${chipTrialFootnoteEsc}</p>
          </td>
        </tr>

        <!-- Footer (proof + contact + link) -->
        <tr>
          <td style="padding:28px 48px 0 48px;">
            <div style="border-top:1px solid ${COUPON_PILL_BORDER_HEX};"></div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 28px 40px;text-align:center;">
            <p style="margin:0 0 10px 0;${BODY}font-size:10px;line-height:1.65;color:${BIZMIS_MUTED_LIGHT_HEX};">
              ${escapeHtml(copy.proofLine)}
            </p>
            <p style="margin:0 0 6px 0;${BODY}font-size:10px;line-height:1.55;color:${BIZMIS_MUTED_LIGHT_HEX};">
              Questions? Just reply to this email (<a href="mailto:${escapeHtml(copy.contactEmail)}" style="${BODY}font-size:10px;font-weight:400;color:${BIZMIS_MUTED_FG_HEX};text-decoration:none;">${escapeHtml(copy.contactEmail)}</a>).
            </p>
            <a href="${BIZMIS_URL}" target="_blank" style="${BODY}font-size:10px;font-weight:500;color:${BIZMIS_MUTED_FG_HEX};text-decoration:none;">
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

  const chipPlainLines = buildEarlyAccessChips(storeCap);
  const plainText = [
    buildEarlyAccessSalutationPlainText(lead.storeName, lead.leadContactName),
    "",
    buildEarlyAccessValueSentencePlainText(lead.storeName, lead.leadContactName),
    "",
    `${copy.softCtaAboveMockupLinkPhrase} ${shopifyAppUrl}${copy.softCtaAboveMockupAfterLink}${copy.softCtaAboveMockupEmphasis}`,
    "",
    ...copy.outcomes,
    "",
    copy.subline,
    "",
    `${copy.couponLabel} ${lead.couponCode.trim()}`,
    `${copy.ctaLabel}: ${shopifyAppUrl}`,
    "",
    ...chipPlainLines,
    "",
    buildEarlyAccessTrialUsageFootnotePlainText(),
    "",
    copy.proofLine,
    "",
    buildEarlyAccessFooterPlainText(),
    `${copy.visitUsPrefix} ${BIZMIS_URL}`,
  ].join("\n");

  return { html, plainText };
}

export function copyLeadEarlyAccessHtmlSource(lead: LeadEarlyAccessData): Promise<void> {
  const { html } = buildLeadEarlyAccessEmailHtml(lead);
  return navigator.clipboard.writeText(html);
}
