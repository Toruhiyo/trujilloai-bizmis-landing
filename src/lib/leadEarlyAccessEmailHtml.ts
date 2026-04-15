import {
  buildEarlyAccessChips,
  buildEarlyAccessFooterPlainText,
  buildEarlyAccessPreheader,
  buildMontageClerkCuePlainText,
  MONTAGE_CLERK_CUE_BEFORE_PRODUCT_NAME,
  MONTAGE_CLERK_CUE_AFTER_PRODUCT_NAME,
  buildEarlyAccessSalutationPlainText,
  buildEarlyAccessTrialUsageFootnotePlainText,
  buildEarlyAccessValueSentencePlainText,
  earlyAccessGreetingFirstName,
  EARLY_ACCESS_EMAIL_COPY,
} from "@/data/leadEarlyAccessCopy";
import {
  type LeadEarlyAccessData,
  EARLY_ACCESS_TERMS,
  resolveLogoColorOverlay,
  resolveStoreNameTextColor,
} from "@/data/leads/_schema";
import {
  BIZMIS_BORDER_HEX,
  BIZMIS_MUTED_FG_HEX,
  BIZMIS_PRIMARY_HEX,
  BIZMIS_WARM_BG_HEX,
} from "@/lib/bizmisBrandColors";

const BIZMIS_LOGO_WHITE = "/images/bizmis-logo-white-transparent.png";
const SHOPIFY_MARK_WHITE = "/images/shopify-mark-white.png";
const BIZMIS_URL = "https://bizmis.ai";

const EMAIL_NOISE_GRAIN_TILE = "/images/early-access-noise-grain.png";

const OUTCOME_ICON_TREND = "/images/early-access-outcome-trend.svg";
const OUTCOME_ICON_HEADPHONES = "/images/early-access-outcome-headphones.svg";
const OUTCOME_ICON_CHART = "/images/early-access-outcome-chart.svg";
/** Same glyph as react-icons/fa FaRoute (Font Awesome Free) — route/path, fits "roadmap" copy. */
const EARLY_ACCESS_SOFT_CTA_ROUTE_ICON = "/images/early-access-soft-cta-route.svg";

const BIZMIS_CLERK_AVATAR_FALLBACK =
  "/images/slides/shopify-listing/shopify-personalization-screenshot-outfitters-tablet.png";

const MONTAGE_CHROME_BG_HEX = "#F7F7F7";
const MONTAGE_CHROME_URL_HEX = "#A3A3A3";
const MONTAGE_CHROME_TRAFFIC_DOT_PX = 8;
const MONTAGE_CHROME_TRAFFIC_GAP_PX = 2;
const MONTAGE_CHROME_URL_ROW_HEIGHT_PX = 15;
const MONTAGE_CHROME_BAR_PADDING_Y_PX = 5;
const EARLY_ACCESS_MONTAGE_WAVEFORM_IMG = "/images/early-access-montage-waveform.png";
const EARLY_ACCESS_MONTAGE_WAVEFORM_IMG_W_PX = 384;
const EARLY_ACCESS_MONTAGE_WAVEFORM_IMG_H_PX = 82;
const BIZMIS_FOREGROUND_HEX = "#32281B";
const BIZMIS_MUTED_LIGHT_HEX = "#B5A48E";
const BIZMIS_SHADOW_SOFT = "0 6px 25px -6px rgba(249,163,83,0.18)";
const COUPON_PILL_BORDER_HEX = "#EBE6DF";
const CTA_COUPON_CUTOUT_BORDER_PX = 1.5;
const CTA_COUPON_CUTOUT_DASH = "rgba(50, 40, 27, 0.1)";
const COUPON_PILL_BG_HEX = "#F7F5F2";

const MONTAGE_VERTICAL_SPREAD_PX = 56;
const MONTAGE_COMPOSITION_SHIFT_PX = 28;

const MONTAGE_CUSTOMER_CUE_TEXT_FALLBACK = "\u201cI\u2019m looking for something lightweight and easy to set up.\u201d";
const MONTAGE_CUSTOMER_WAVE_GREY: [number, number, number] = [180, 180, 180];
const MONTAGE_CUSTOMER_WAVE_OPACITY = 0.18;

type MontagePalette = {
  hex: string;
  dark: string;
  light: string;
  captionAccent: string;
  rgb: [number, number, number];
  badgeTextColor: string;
  waveformOpacity: number;
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

function hexToHsl(hex: string): [number, number, number] {
  const [rr, gg, bb] = hexToRgb(hex).map((c) => c / 255);
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6;
    else if (max === gg) h = ((bb - rr) / d + 2) / 6;
    else h = ((rr - gg) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lN - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * Math.max(0, Math.min(1, color)))
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

const MONTAGE_ACCENT_MIN_CONTRAST_RATIO = 1.8;

function contrastRatioOnWhite(hex: string): number {
  const rgb = hexToRgb(hex);
  const lum = relativeLuminance(...rgb);
  return (1.0 + 0.05) / (lum + 0.05);
}

function pickMontageAccent(primaryHex: string, textColor: string | null | undefined): string {
  if (contrastRatioOnWhite(primaryHex) >= MONTAGE_ACCENT_MIN_CONTRAST_RATIO) return primaryHex;
  if (textColor && contrastRatioOnWhite(textColor) >= MONTAGE_ACCENT_MIN_CONTRAST_RATIO) return textColor;
  return primaryHex;
}

function deriveMontagePalette(primaryHex: string, textColor: string | null | undefined): MontagePalette {
  const accent = pickMontageAccent(primaryHex, textColor);
  const [h, s, l] = hexToHsl(accent);

  const hex = accent;
  const dark = hslToHex(h, Math.min(s + 5, 100), Math.max(l - 18, 10));
  const light = hslToHex(h, Math.max(s - 10, 0), Math.min(l + 22, 92));

  const contrast = contrastRatioOnWhite(accent);
  const CAPTION_MIN_CONTRAST = 2.4;
  let captionAccent = hex;
  if (contrast < CAPTION_MIN_CONTRAST) {
    const targetL = Math.min(l, 52);
    const targetS = Math.min(s, 65);
    captionAccent = hslToHex(h, targetS, targetL);
  }

  const rgb = hexToRgb(hex);
  const lum = relativeLuminance(...rgb);
  const badgeTextColor = lum > 0.42 ? "#32281B" : "#ffffff";
  const WAVE_OPACITY_MIN = 0.06;
  const WAVE_OPACITY_MAX = 0.18;
  const waveformOpacity = +(WAVE_OPACITY_MIN + (WAVE_OPACITY_MAX - WAVE_OPACITY_MIN) * lum).toFixed(3);
  return { hex, dark, light, captionAccent, rgb, badgeTextColor, waveformOpacity };
}

const MONTAGE_RADIAL_GLOW_ALPHA_PEAK = 0.24;

function montageRadialGlowBackgroundCss(r: number, g: number, b: number): string {
  const n = 22;
  const parts: string[] = [];
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const pct = Math.round(t * 1000) / 10;
    const eased = 1 - t;
    const a = MONTAGE_RADIAL_GLOW_ALPHA_PEAK * eased * eased * eased;
    parts.push(`rgba(${r},${g},${b},${a.toFixed(4)}) ${pct}%`);
  }
  return `radial-gradient(ellipse,${parts.join(",")})`;
}

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

const EMAIL_HEADER_LOGO_MAX_W_PX = 160;
const EMAIL_HEADER_LOGO_MAX_H_PX = 38;

function storeLogoEmailMarkup(lead: LeadEarlyAccessData): string {
  const store = escapeHtml(lead.storeName);
  const logoUrl = absImg(logoPublicPathForEmail(lead.logoImagePath));
  const overlay = resolveLogoColorOverlay(lead);
  const maxW = EMAIL_HEADER_LOGO_MAX_W_PX;
  const maxH = EMAIL_HEADER_LOGO_MAX_H_PX;
  if (!overlay) {
    return `<img src="${logoUrl}" alt="${store}" style="display:block;max-width:${maxW}px;max-height:${maxH}px;width:auto;height:auto;border:0;" />`;
  }
  const safeOverlay = escapeHtml(overlay);
  const urlEsc = logoUrl.replace(/'/g, "\\'");
  return `<div role="presentation" aria-label="${store}" style="display:inline-block;width:${maxW}px;height:${maxH}px;background-color:${safeOverlay};-webkit-mask-image:url('${urlEsc}');mask-image:url('${urlEsc}');-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:left center;mask-position:left center;"></div>`;
}

const HEADING = "font-family:'Plus Jakarta Sans','Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;";
const BODY = "font-family:'DM Sans','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;";

function emailMontageWatermarkWaveformHtml(
  r: number, g: number, b: number, alpha: number, flipped = false,
): string {
  const src = absImg(EARLY_ACCESS_MONTAGE_WAVEFORM_IMG).replace(/'/g, "\\'");
  const w = EARLY_ACCESS_MONTAGE_WAVEFORM_IMG_W_PX;
  const h = EARLY_ACCESS_MONTAGE_WAVEFORM_IMG_H_PX;
  const flip = flipped ? "transform:scaleY(-1);" : "";
  return `<div role="presentation" style="display:block;margin:0 auto;width:100%;max-width:${w}px;height:${h}px;background-color:rgba(${r},${g},${b},${alpha});-webkit-mask-image:url('${src}');mask-image:url('${src}');-webkit-mask-size:100% ${h}px;mask-size:100% ${h}px;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center bottom;mask-position:center bottom;${flip}"></div>`;
}

const REGULAR_CARD_W = 105;
const REGULAR_IMG_W = 62;
const REGULAR_IMG_H = 62;
const REC_CARD_MAX_W = 132;
const REC_IMG_W = 94;

function buildMontageClerkCueInnerHtml(
  customCue: string | null,
  productTitle: string,
  bodyColor: string,
  accentColor: string,
): string {
  const bodyStyle = `${BODY}font-size:11px;font-weight:500;line-height:1.35;color:${bodyColor};`;
  const accentStyle = `${BODY}font-size:11px;font-weight:800;line-height:1.35;letter-spacing:-0.02em;color:${accentColor};`;

  if (customCue) {
    const splitIdx = customCue.indexOf(productTitle);
    if (splitIdx >= 0) {
      const before = customCue.slice(0, splitIdx);
      const after = customCue.slice(splitIdx + productTitle.length);
      return (
        `<span style="${bodyStyle}">${escapeHtml(before)}</span>` +
        `<span style="${accentStyle}">${escapeHtml(productTitle)}</span>` +
        `<span style="${bodyStyle}">${escapeHtml(after)}</span>`
      );
    }
    return `<span style="${bodyStyle}">${escapeHtml(customCue)}</span>`;
  }

  return (
    `<span style="${bodyStyle}">${escapeHtml(MONTAGE_CLERK_CUE_BEFORE_PRODUCT_NAME)}</span>` +
    `<span style="${accentStyle}">${escapeHtml(productTitle)}</span>` +
    `<span style="${bodyStyle}">${escapeHtml(MONTAGE_CLERK_CUE_AFTER_PRODUCT_NAME)}</span>`
  );
}

function buildMontageProductCardHtml(
  lead: LeadEarlyAccessData,
  index: number,
  isRecommended: boolean,
  palette: MontagePalette,
): string {
  const productImages = [lead.productAImagePath, lead.productBImagePath, lead.productCImagePath];
  const product = lead.demoProducts[index];
  if (!product) return "";
  const imgUrl = absImg(productImages[index]);
  const [pr, pg, pb] = palette.rgb;

  if (isRecommended) {
    return `<div style="display:inline-block;max-width:${REC_CARD_MAX_W}px;border-radius:14px;background:rgba(255,255,255,0.88);-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px);border:1.5px solid ${palette.hex};box-shadow:0 0 0 3px rgba(${pr},${pg},${pb},0.12),0 6px 20px -4px rgba(${pr},${pg},${pb},0.18);overflow:hidden;">
              <div style="background-color:${palette.hex};padding:6px 0;text-align:center;line-height:1;display:flex;align-items:center;justify-content:center;">
                <span style="${BODY}font-size:8px;font-weight:700;color:${palette.badgeTextColor};letter-spacing:0.06em;text-transform:uppercase;vertical-align:middle;">&#9733; Recommended</span>
              </div>
              <div style="padding:8px 8px 6px 8px;text-align:center;">
                <img src="${imgUrl}" alt="" width="${REC_IMG_W}" style="display:block;margin:0 auto;max-width:${REC_IMG_W}px;height:auto;border:0;border-radius:8px;" />
              </div>
              <div style="padding:4px 10px 10px 10px;text-align:center;">
                <p style="margin:0;${BODY}font-size:9px;font-weight:700;color:${BIZMIS_FOREGROUND_HEX};line-height:1.3;">${escapeHtml(product.title)}</p>
                <p style="margin:3px 0 0;${BODY}font-size:8px;font-weight:600;color:${palette.captionAccent};">${escapeHtml(product.price)}</p>
              </div>
            </div>`;
  }

  return `<div style="display:inline-block;width:${REGULAR_CARD_W}px;border-radius:12px;background:rgba(255,255,255,0.82);-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px);border:1px solid rgba(240,224,208,0.5);overflow:hidden;">
              <div style="padding:6px 6px 4px 6px;text-align:center;height:${REGULAR_IMG_H + 10}px;display:flex;align-items:center;justify-content:center;">
                <img src="${imgUrl}" alt="" width="${REGULAR_IMG_W}" style="display:block;margin:0 auto;max-width:${REGULAR_IMG_W}px;max-height:${REGULAR_IMG_H}px;height:auto;border:0;border-radius:8px;object-fit:contain;" />
              </div>
              <div style="padding:0 8px 6px 8px;text-align:center;">
                <p style="margin:0;${BODY}font-size:8px;font-weight:600;color:${BIZMIS_FOREGROUND_HEX};line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(product.title)}</p>
                <p style="margin:1px 0 0;${BODY}font-size:7.5px;color:${BIZMIS_MUTED_LIGHT_HEX};">${escapeHtml(product.price)}</p>
              </div>
            </div>`;
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
  const banner = lead.bannerColor?.trim() || pri;
  const storeNameColor = escapeHtml(resolveStoreNameTextColor(lead));
  const store = escapeHtml(lead.storeName);
  const domain = escapeHtml(lead.storeDomain);
  const { storeCap, shopifyAppUrl } = EARLY_ACCESS_TERMS;
  const copy = EARLY_ACCESS_EMAIL_COPY;

  const storeLogoHtml = storeLogoEmailMarkup(lead);
  const bizmisLogoUrl = absImg(BIZMIS_LOGO_WHITE);
  const shopifyMarkUrl = absImg(SHOPIFY_MARK_WHITE);
  const noiseGrainUrl = absImg(EMAIL_NOISE_GRAIN_TILE);
  const clerkAvatarUrl = absImg(lead.clerkAvatarImagePath || BIZMIS_CLERK_AVATAR_FALLBACK);
  const mp = deriveMontagePalette(pri, lead.textColor);
  const [mpr, mpg, mpb] = mp.rgb;
  const montageRadialGlowBg = montageRadialGlowBackgroundCss(mpr, mpg, mpb);
  const MONTAGE_SCENE_APPROX_W = 550;
  const glowTiltDeg = +(Math.atan2(2 * MONTAGE_VERTICAL_SPREAD_PX, MONTAGE_SCENE_APPROX_W) * (180 / Math.PI)).toFixed(1);
  const recIdx = lead.recommendedProductIndex;
  const otherIndices = ([0, 1, 2] as const).filter((i) => i !== recIdx);
  const recommendedCardHtml = buildMontageProductCardHtml(lead, recIdx, true, mp);
  const otherCardHtmlA = buildMontageProductCardHtml(lead, otherIndices[0], false, mp);
  const otherCardHtmlB = buildMontageProductCardHtml(lead, otherIndices[1], false, mp);
  const montageCueBody = BIZMIS_FOREGROUND_HEX;
  const montageCueAccent = mp.captionAccent;
  const recProductTitle = lead.demoProducts[recIdx].title;
  const montageClerkCueInnerHtml = buildMontageClerkCueInnerHtml(
    lead.montageClerkCue?.trim() || null, recProductTitle, montageCueBody, montageCueAccent,
  );
  const montageClerkWaveHtml = emailMontageWatermarkWaveformHtml(...mp.rgb, mp.waveformOpacity);
  const montageCustomerWaveHtml = emailMontageWatermarkWaveformHtml(
    ...MONTAGE_CUSTOMER_WAVE_GREY, MONTAGE_CUSTOMER_WAVE_OPACITY, true,
  );
  const montageCustomerCueText = lead.montageShopperCue?.trim()
    ? `\u201c${lead.montageShopperCue.trim()}\u201d`
    : MONTAGE_CUSTOMER_CUE_TEXT_FALLBACK;
  const montageCustomerCueHtml = `<span style="${BODY}font-size:10px;font-weight:300;font-style:italic;line-height:1.35;color:${BIZMIS_MUTED_LIGHT_HEX};">${escapeHtml(montageCustomerCueText)}</span>`;
  const softCtaRouteIconUrl = absImg(EARLY_ACCESS_SOFT_CTA_ROUTE_ICON);
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
  const valueBold = "font-weight:600;";
  const inviteLeadParagraphInnerHtml = `${escapeHtml(beforeBizmis)}<span style="${accentInviteBizmis}">${bizmisWordEsc}</span>${escapeHtml(copy.inviteSentenceAfterFirstBizmis)}<span style="${accentInviteStore}">${store}</span>${escapeHtml(copy.inviteSentenceAfterStorePreValue)}<strong style="${valueBold}">${escapeHtml(copy.inviteSentenceValueDriveSales)}</strong>${escapeHtml(copy.inviteSentenceValueJoiner)}<strong style="${valueBold}">${escapeHtml(copy.inviteSentenceValueEaseSupport)}</strong>${escapeHtml(copy.inviteSentenceAfterStorePostValue)}`;

  const inviteTopGreetingStyle = `${BODY}font-size:11px;font-weight:400;line-height:1.6;color:${BIZMIS_MUTED_FG_HEX};letter-spacing:0.01em;`;
  const inviteTopLeadStyle = `${BODY}font-size:15px;font-weight:400;line-height:1.72;color:${BIZMIS_FOREGROUND_HEX};`;
  const inviteTopSupportStyle = `${BODY}font-size:11px;font-weight:400;line-height:1.72;color:${BIZMIS_MUTED_LIGHT_HEX};text-align:center;`;

  const inviteTopLeadMeasurePx = 440;
  const inviteTopSupportMeasurePx = 420;

  const softCtaAboveMockupBase = `${BODY}font-size:13px;line-height:1.72;`;
  const softCtaStrong = `${softCtaAboveMockupBase}font-weight:600;color:${BIZMIS_MUTED_LIGHT_HEX};`;
  const softCtaAboveMockupHtml = `<span style="${softCtaAboveMockupBase}color:${BIZMIS_MUTED_LIGHT_HEX};font-weight:400;"><a href="${shopifyAppUrl}" target="_blank" style="${softCtaAboveMockupBase}color:${BIZMIS_PRIMARY_HEX};font-weight:500;text-decoration:none;">${escapeHtml(copy.softCtaAboveMockupLinkPhrase)}</a>${escapeHtml(copy.softCtaAboveMockupAfterLinkPrefix)}<strong style="${softCtaStrong}">${escapeHtml(copy.softCtaAboveMockupNoCostBold)}</strong>${escapeHtml(copy.softCtaAboveMockupAfterLinkSuffix)}<strong style="${softCtaStrong}">${escapeHtml(copy.softCtaAboveMockupEmphasisBold)}</strong>${escapeHtml(copy.softCtaAboveMockupEmphasisTail)}</span>`;

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
                <td width="50%" background="${noiseGrainUrl}" bgcolor="${banner}" style="background-color:${banner};background-image:url('${noiseGrainUrl}');background-repeat:repeat;padding:14px 14px 14px 24px;vertical-align:middle;">
                  ${storeLogoHtml}
                </td>
                <td width="6%" style="background-color:${banner};background:linear-gradient(to bottom right,${banner} 50%,${BIZMIS_PRIMARY_HEX} 50%);text-align:center;vertical-align:middle;padding:0;">
                  <span style="${HEADING}font-size:28px;font-weight:900;color:#ffffff;line-height:1;text-shadow:0 1px 4px rgba(0,0,0,0.25);">&#x2716;</span>
                </td>
                <td width="44%" background="${noiseGrainUrl}" bgcolor="${BIZMIS_PRIMARY_HEX}" style="background-color:${BIZMIS_PRIMARY_HEX};background-image:url('${noiseGrainUrl}');background-repeat:repeat;padding:14px 24px 14px 14px;vertical-align:middle;text-align:right;">
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

        <!-- Early access badge strip -->
        <tr>
          <td style="padding:10px 24px;text-align:center;background-color:rgba(249,163,83,0.06);border-bottom:1px solid ${BIZMIS_BORDER_HEX};">
            <p style="margin:0;${BODY}font-size:11px;line-height:1.4;color:${BIZMIS_FOREGROUND_HEX};"><span style="font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(copy.bannerBadgeTitle)}</span><span style="color:${BIZMIS_MUTED_LIGHT_HEX};font-weight:400;"> &nbsp;&middot;&nbsp; ${escapeHtml(copy.bannerBadgeLimitPrefix)} ${storeCap} ${escapeHtml(copy.bannerBadgeLimitSuffix)}</span></p>
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
                  <div style="border-left:3.5px solid ${BIZMIS_PRIMARY_HEX};background-color:rgba(249,163,83,0.06);padding:10px 14px;border-radius:0 6px 6px 0;">
                    <!-- <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                      <td style="vertical-align:top;padding-right:8px;padding-top:2px;"><img src="${softCtaRouteIconUrl}" alt="" width="14" height="14" style="display:block;width:14px;height:14px;border:0;" /></td>
                      <td style="vertical-align:top;"> -->
                    <p style="margin:0;text-align:left;">${softCtaAboveMockupHtml}</p>
                    <!-- </td></tr></table> -->
                  </div>
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
                        <span style="display:inline-block;width:${MONTAGE_CHROME_TRAFFIC_DOT_PX}px;height:${MONTAGE_CHROME_TRAFFIC_DOT_PX}px;border-radius:50%;background-color:#C8C8C8;margin-right:${MONTAGE_CHROME_TRAFFIC_GAP_PX}px;vertical-align:middle;"></span>
                        <span style="display:inline-block;width:${MONTAGE_CHROME_TRAFFIC_DOT_PX}px;height:${MONTAGE_CHROME_TRAFFIC_DOT_PX}px;border-radius:50%;background-color:#E8E8E8;margin-right:${MONTAGE_CHROME_TRAFFIC_GAP_PX}px;vertical-align:middle;"></span>
                        <span style="display:inline-block;width:${MONTAGE_CHROME_TRAFFIC_DOT_PX}px;height:${MONTAGE_CHROME_TRAFFIC_DOT_PX}px;border-radius:50%;background-color:#D8D8D8;vertical-align:middle;"></span>
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
                <td bgcolor="#ffffff" style="background-color:#ffffff;padding:0 10px 0 10px;">
                  <!--[if !mso]><!-->
                  <div style="position:relative;min-height:360px;overflow:visible;">

                    <div style="position:absolute;left:50%;top:calc(50% + ${MONTAGE_COMPOSITION_SHIFT_PX}px);width:162%;height:92%;transform:translate(-50%,-50%) rotate(${glowTiltDeg}deg);border-radius:50%;background:${montageRadialGlowBg};-webkit-filter:blur(20px);filter:blur(20px);z-index:0;pointer-events:none;"></div>

                    <div style="position:absolute;top:${MONTAGE_VERTICAL_SPREAD_PX + MONTAGE_COMPOSITION_SHIFT_PX}px;right:0;bottom:82px;z-index:2;display:flex;align-items:center;justify-content:center;">
                      <img src="${clerkAvatarUrl}" alt="Bizmis store clerk" width="280" style="display:block;max-width:280px;width:100%;height:auto;border:0;border-radius:16px;filter:drop-shadow(0 10px 32px rgba(50,40,27,0.16));" />
                    </div>

                    <div style="position:absolute;top:calc(50% + ${MONTAGE_COMPOSITION_SHIFT_PX - MONTAGE_VERTICAL_SPREAD_PX}px);left:2%;transform:translateY(-50%);z-index:3;width:52%;">
                      <div style="position:relative;display:flex;align-items:center;justify-content:center;min-height:220px;">

                        <div style="position:absolute;left:-2%;top:50%;transform:translateY(-52%) rotate(-6deg) scale(0.85);z-index:1;opacity:0.82;filter:drop-shadow(0 2px 8px rgba(50,40,27,0.08));">
                          ${otherCardHtmlA}
                        </div>

                        <div style="position:relative;z-index:3;filter:drop-shadow(0 6px 20px rgba(50,40,27,0.16));">
                          ${recommendedCardHtml}
                        </div>

                        <div style="position:absolute;right:-2%;top:50%;transform:translateY(-52%) rotate(6deg) scale(0.85);z-index:1;opacity:0.82;filter:drop-shadow(0 2px 8px rgba(50,40,27,0.08));">
                          ${otherCardHtmlB}
                        </div>

                      </div>
                    </div>

                    <div style="position:absolute;top:0;left:0;width:72%;z-index:1;pointer-events:none;">
                      <div style="position:relative;height:82px;">
                        <div style="position:absolute;top:0;left:0;right:0;bottom:0;-webkit-mask-image:linear-gradient(to right,#000 60%,transparent 100%);mask-image:linear-gradient(to right,#000 60%,transparent 100%);">
                          <div style="text-align:left;line-height:0;font-size:0;padding:0;height:82px;overflow:hidden;">
                            ${montageCustomerWaveHtml}
                          </div>
                        </div>
                        <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:flex-start;">
                          <div style="position:relative;display:flex;align-items:center;justify-content:flex-start;padding-left:8px;transform:translateY(-24px);">
                            <div style="position:absolute;width:120%;height:100%;top:0;left:-10%;background:radial-gradient(ellipse 100% 100% at 30% 50%,rgba(255,255,255,0.92) 0%,rgba(255,255,255,0.45) 30%,transparent 68%);"></div>
                            <p style="margin:0;position:relative;white-space:nowrap;">
                              ${montageCustomerCueHtml}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style="position:absolute;bottom:0;right:0;width:72%;z-index:1;pointer-events:none;">
                      <div style="position:relative;height:82px;">
                        <div style="position:absolute;top:0;left:0;right:0;bottom:0;-webkit-mask-image:linear-gradient(to left,#000 60%,transparent 100%);mask-image:linear-gradient(to left,#000 60%,transparent 100%);">
                          <div style="text-align:right;line-height:0;font-size:0;padding:0;height:82px;overflow:hidden;">
                            ${montageClerkWaveHtml}
                          </div>
                        </div>
                        <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:flex-end;">
                          <div style="position:relative;display:flex;align-items:center;justify-content:flex-end;padding-right:8px;transform:translateY(24px);">
                            <div style="position:absolute;width:120%;height:100%;top:0;right:-10%;background:radial-gradient(ellipse 100% 100% at 70% 50%,rgba(255,255,255,0.92) 0%,rgba(255,255,255,0.45) 30%,transparent 68%);"></div>
                            <p style="margin:0;position:relative;white-space:nowrap;">
                              ${montageClerkCueInnerHtml}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                  <!--<![endif]-->
                  <!--[if mso]>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td width="100%" align="center" style="padding:0;text-align:center;">
                        <img src="${clerkAvatarUrl}" alt="Bizmis store clerk" width="260" style="display:block;margin:0 auto;max-width:260px;height:auto;border:0;" />
                      </td>
                    </tr>
                  </table>
                  <![endif]-->
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
  const montagePlainLine = lead.montageClerkCue?.trim() || buildMontageClerkCuePlainText(recProductTitle);

  const plainText = [
    buildEarlyAccessSalutationPlainText(lead.storeName, lead.leadContactName),
    "",
    buildEarlyAccessValueSentencePlainText(lead.storeName, lead.leadContactName),
    "",
    `${copy.softCtaAboveMockupLinkPhrase} ${shopifyAppUrl}${copy.softCtaAboveMockupAfterLinkPrefix}${copy.softCtaAboveMockupNoCostBold}${copy.softCtaAboveMockupAfterLinkSuffix}${copy.softCtaAboveMockupEmphasisBold}${copy.softCtaAboveMockupEmphasisTail}`,
    "",
    montagePlainLine,
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
