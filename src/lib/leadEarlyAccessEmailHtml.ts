import {
  buildEarlyAccessChips,
  buildEarlyAccessFooterPlainText,
  buildEarlyAccessPreheader,
  buildMontageClerkCuePlainText,
  MONTAGE_CLERK_CUE_BEFORE_PRODUCT_NAME,
  MONTAGE_CLERK_CUE_AFTER_PRODUCT_NAME,
  buildEarlyAccessSalutationPlainText,
  buildSoftCtaPlainText,
  buildEarlyAccessTrialUsageFootnotePlainText,
  buildInviteLeadParagraphPlainText,
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
import {
  buildInviteBizmisSiteUrl,
  INSTANTLY_UNSUBSCRIBE_MERGE_TAG,
  INVITE_UNSUBSCRIBE_LABEL,
} from "@/lib/leadEarlyAccessEmailHtmlSafe";
import { buildReactIconSvgDataUri } from "@/lib/reactIconDataUri";
import { FaRegCalendarAlt } from "react-icons/fa";

const BIZMIS_LOGO_WHITE = "/images/bizmis-logo-white-transparent.png";
const SHOPIFY_MARK_WHITE = "/images/shopify-mark-white.png";
/** Orange-on-white Bizmis square mark used in the invite signature (281x281). */
const BIZMIS_LOGO_ORANGE_WHITE = "/images/bizmis-logo-orange-white.png";
const SIGNATURE_BIZMIS_LOGO_PX = 44;
const SIGNATURE_LOGO_TEXT_GAP_PX = 14;
const SIGNATURE_AFTER_CLOSING_GAP_PX = 24;
/** Bottom padding on the signature row (part of air before the rule). */
const SIGNATURE_BEFORE_FOOTER_GAP_PX = 36;
/** Top padding on the footer separator row (rest of air before the rule). */
const RICH_FOOTER_SEPARATOR_ROW_TOP_PAD_PX = 32;

/** Native 560×120 overlay; regenerate with `node scripts/generate-email-banner-noise-png.mjs`. */
const EMAIL_BANNER_NOISE_GRAIN = "/images/early-access-banner-noise-grain.png";
/** Full-width cover waveform (Shopify deck hero row); regenerate with `node scripts/generate-email-banner-waveform-png.mjs`. */
const EMAIL_BANNER_WAVEFORM = "/images/early-access-email-banner-waveform.png";
/** Logical CSS pixels — matches `SHOPIFY_COVER_FULL_WIDTH_TRACK_H_PX` in `scripts/lib/shopifyCoverFullWidthWaveform.mjs`. */
const EMAIL_BANNER_WAVEFORM_W_PX = 560;
const EMAIL_BANNER_WAVEFORM_H_PX = 128;
/** Display height for the waveform inside the banner (vertically centered, edge-to-edge; keep below ~80% of banner height). */
const EMAIL_BANNER_WAVEFORM_DISPLAY_H_PX = 120;
/** Fixed banner height — logos + waveform vertically centered, badge pinned to the bottom. */
const EMAIL_BANNER_H_PX = 180;
/** Bizmis mark + wordmark in the header strip (right). */
const EMAIL_BANNER_BIZMIS_ICON_PX = 48;
const EMAIL_BANNER_BIZMIS_WORDMARK_FONT_PX = 24;
const EMAIL_BANNER_PAD_X_PX = 24;
const EMAIL_BANNER_BADGE_PAD_BOTTOM_PX = 8;
/** Bottom scrim: % of banner height for the fade-to-dark (from bottom up). */
const EMAIL_BANNER_SCRIM_H_PCT = 26;
const EMAIL_BANNER_BADGE_FONT_PX = 11;

const OUTCOME_ICON_TREND = "/images/early-access-outcome-trend.svg";
const OUTCOME_ICON_HEADSET = "/images/early-access-outcome-headset.svg";
const OUTCOME_ICON_CHART = "/images/early-access-outcome-chart.svg";
/** Chip row below install button — #8F7856 to match pill label text. */
const EARLY_ACCESS_CHIP_GIFT_MUTED = "/images/early-access-chip-gift-muted.svg";
const EARLY_ACCESS_CHIP_ROUTE_MUTED = "/images/early-access-chip-route-muted.svg";
const EARLY_ACCESS_CHIP_CLOCK_MUTED = "/images/early-access-chip-clock-muted.svg";
const CHIP_ROW_ICON_PX = 11;

const EMAIL_ICON_SYNC_WEBSITE = "/images/early-access-icon-sync-website.png";
const EMAIL_ICON_SYNC_CATALOG = "/images/early-access-icon-sync-catalog.png";
const EMAIL_ICON_SYNC_DISCOUNTS = "/images/early-access-icon-sync-discounts.png";
const EMAIL_ICON_SYNC_CUSTOMERS = "/images/early-access-icon-sync-customers.png";
const EMAIL_ICON_SYNC_ORDERS = "/images/early-access-icon-sync-orders.png";
const EMAIL_ICON_INSIGHTS_PLAY = "/images/early-access-icon-insights-play.png";
const EMAIL_ICON_INSIGHTS_TAG = "/images/early-access-icon-insights-tag.png";
const EMAIL_ICON_INSIGHTS_FUNNEL = "/images/early-access-icon-insights-funnel.png";
const EMAIL_ICON_SUPPORT_BOLT = "/images/early-access-icon-support-bolt.png";
const EMAIL_ICON_SUPPORT_SHIELD = "/images/early-access-icon-support-shield.png";
const EMAIL_ICON_SUPPORT_HEART = "/images/early-access-icon-support-heart.png";
const EMAIL_ICON_POLICY_FILECHECK = "/images/early-access-icon-policy-filecheck.png";

const BIZMIS_SALES_AVATAR_FALLBACK =
  "/images/slides/shopify-listing/shopify-personalization-screenshot-outfitters-tablet.png";

const PHONE_FRAME_W = 216;
const PHONE_BEZEL_PX = 3;
const PHONE_NOTCH_W = 48;
const PHONE_NOTCH_H = 12;
const PHONE_SCREEN_RADIUS = 22;
const PHONE_BODY_RADIUS = 25;
const PHONE_HOME_BAR_W = 56;
const PHONE_HOME_BAR_H = 3;
const PHONE_SCREEN_W = PHONE_FRAME_W - PHONE_BEZEL_PX * 2;
const PHONE_AVATAR_W = 288;
/** Centers a wider-than-clip img: `margin: auto` fails when the child is wider than the overflow box. */
const PHONE_AVATAR_CLIP_MARGIN_LEFT_PX = Math.round(
  (PHONE_SCREEN_W - PHONE_AVATAR_W) / 2,
);
/** Diameter of the white radial glow behind the support avatar (circle, centered on the image).
 *  Keep diam + blur contained within the avatar row so the halo doesn't bleed into waveform strips. */
const PHONE_AVATAR_GLOW_DIAM_PX = 256;
const PHONE_AVATAR_GLOW_BLUR_PX = 28;
/** Wider bright core than desktop ellipse so the phone halo reads brighter. */
const PHONE_AVATAR_GLOW_PLATEAU_PCT = 0.65;

/** Inset for shopper + clerk caption blocks inside the support phone screen. */
const PHONE_SUPPORT_CAPTION_INSET_PX = 12;

/** Bizmis mark inline at start of clerk captions (emoji-like) — masked white logo tinted with caption accent (contrast-corrected, same as bold caption text). */
const MONTAGE_SALES_BIZMIS_CAPTION_ICON_PX = 20;
/** Trailing margin applied to the inline Bizmis caption icon (em, scales with font-size). */
const MONTAGE_SALES_BIZMIS_CAPTION_ICON_MARGIN_EM = 0.35;

const MONTAGE_CHROME_BG_HEX = "#F7F7F7";
const MONTAGE_CHROME_URL_HEX = "#A3A3A3";
const MONTAGE_CHROME_TRAFFIC_DOT_PX = 10;
const MONTAGE_CHROME_TRAFFIC_GAP_PX = 3;
const MONTAGE_CHROME_URL_ROW_HEIGHT_PX = 19;
const MONTAGE_CHROME_BAR_PADDING_Y_PX = 6;
const MONTAGE_CHROME_URL_FONT_PX = 9;
type WaveformDims = { img: string; w: number; h: number };

const WAVEFORM_DESKTOP: WaveformDims = {
  img: "/images/early-access-montage-waveform.png",
  w: 448,
  h: 96,
};
const WAVEFORM_PHONE: WaveformDims = {
  img: "/images/early-access-montage-waveform-phone.png",
  w: 224,
  h: 86,
};
const BIZMIS_FOREGROUND_HEX = "#32281B";
const BIZMIS_MUTED_LIGHT_HEX = "#B5A48E";
const CALENDAR_ICON_SIZE_PX = 18;
const CTA_BUTTON_INNER_LINE_HEIGHT_PX = CALENDAR_ICON_SIZE_PX;
const CALENDAR_ICON_DATA_URI = buildReactIconSvgDataUri(
  FaRegCalendarAlt,
  BIZMIS_FOREGROUND_HEX,
  CALENDAR_ICON_SIZE_PX,
);
const BIZMIS_SHADOW_SOFT = "0 6px 25px -6px rgba(249,163,83,0.18)";
const COUPON_PILL_BORDER_HEX = "#EBE6DF";
const CTA_COUPON_CUTOUT_BORDER_PX = 1.5;
const CTA_COUPON_CUTOUT_DASH = "rgba(50, 40, 27, 0.1)";
const COUPON_PILL_BG_HEX = "#F7F5F2";

const BENEFIT_CARD_ICON_PX = 18;
const BENEFIT_CARD_GLOW_TITLE_FONT_PX = 13;
const BENEFIT_CARD_GLOW_SUBTITLE_FONT_PX = 10;
/** Wrapped benefit body copy: looser line-height + light tracking so blocks do not read as dense. */
const BENEFIT_CARD_SUBTITLE_LINE_HEIGHT = 1.48;
const BENEFIT_CARD_SUBTITLE_LETTER_SPACING_EM = 0.015;
const BENEFIT_CARD_TITLE_TO_BODY_MARGIN_PX = 10;
const BENEFIT_CARD_TEXT_HEX = "#ffffff";
const BENEFIT_CARD_SUBTITLE_HEX = "rgba(255,255,255,0.92)";
const BENEFIT_CARD_ICON_WHITE_FILTER =
  "brightness(0) invert(1)";
const MONTAGE_VERTICAL_SPREAD_PX = 56;
const MONTAGE_COMPOSITION_SHIFT_PX = 28;
/** Absolute width of the Boost Sales benefit card overlay on the desktop mockup. */
const BOOST_SALES_BENEFIT_CARD_OVERLAY_WIDTH_PX = 166;

const MONTAGE_CUSTOMER_CUE_TEXT_FALLBACK = "\u201cI\u2019m looking for something lightweight and easy to set up.\u201d";

function montageSalesCueSingleLine(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

const MONTAGE_SALES_CUE_BASE_FONT_PX = 13;
/** Matches desktop montage shopper cue (`montageSalesCueFontPx(..., 10)`). */
const MONTAGE_CUSTOMER_CUE_BASE_FONT_PX = 12;
const MONTAGE_SALES_CUE_MIN_FONT_PX = 10;
const MONTAGE_SALES_CUE_CHARS_AT_BASE = 70;

function montageSalesCueFontPx(text: string, basePx = MONTAGE_SALES_CUE_BASE_FONT_PX): number {
  const len = text.length;
  if (len <= MONTAGE_SALES_CUE_CHARS_AT_BASE) return basePx;
  const scaled = basePx * (MONTAGE_SALES_CUE_CHARS_AT_BASE / len);
  return Math.max(MONTAGE_SALES_CUE_MIN_FONT_PX, Math.round(scaled * 10) / 10);
}

/**
 * Per-glyph advance estimates as a fraction of font-size for Inter /
 * system-ui body copy at email-mockup sizes. Kept conservative so the
 * width budget survives Inter's true bold advances plus any extra
 * letter-spacing introduced by the rendering engine.
 */
const PHONE_CUE_CHAR_W_NORMAL = 0.55;
const PHONE_CUE_CHAR_W_BOLD = 0.62;
const PHONE_CUE_MAX_LINES = 2;

/**
 * Word-aware 2-line simulator for phone captions.
 *
 * Walks the words of `text`, computing the pixel width of each glyph
 * (bold glyphs wider than regular) to greedily pack them into lines.
 * Marks the span of the optional `boldSubstring` (used for the bolded
 * product-name span inside clerk captions) so its extra advance is
 * accounted for. Returns true iff the text fits in `maxLines` at the
 * given font size.
 */
function phoneCueFitsInLines(
  text: string,
  fontPx: number,
  widthPx: number,
  boldSubstring: string | null,
  maxLines: number,
  firstLineReservePx: number = 0,
): boolean {
  const boldStart = boldSubstring ? text.indexOf(boldSubstring) : -1;
  const boldEnd = boldStart >= 0 ? boldStart + (boldSubstring as string).length : -1;
  const charWidthAt = (index: number): number => {
    const ratio = index >= boldStart && index < boldEnd
      ? PHONE_CUE_CHAR_W_BOLD : PHONE_CUE_CHAR_W_NORMAL;
    return fontPx * ratio;
  };
  const spaceWidth = fontPx * PHONE_CUE_CHAR_W_NORMAL;
  const tokens = text.split(/(\s+)/).filter((t) => t.length > 0);
  let lineWidth = firstLineReservePx;
  let lines = 1;
  let cursor = 0;
  for (const token of tokens) {
    const isSpace = /^\s+$/.test(token);
    let tokenWidth = 0;
    for (let i = 0; i < token.length; i++) {
      tokenWidth += isSpace ? spaceWidth : charWidthAt(cursor + i);
    }
    if (isSpace) {
      if (lineWidth === 0) { cursor += token.length; continue; }
      if (lineWidth + tokenWidth > widthPx) {
        lines += 1;
        if (lines > maxLines) return false;
        lineWidth = 0;
      } else {
        lineWidth += tokenWidth;
      }
    } else if (lineWidth + tokenWidth <= widthPx) {
      lineWidth += tokenWidth;
    } else {
      lines += 1;
      if (lines > maxLines) return false;
      lineWidth = tokenWidth;
    }
    cursor += token.length;
  }
  return lines <= maxLines;
}

/**
 * Width-aware font sizing for the phone's shopper/clerk captions.
 *
 * Steps the font size down from `basePx` until the word-wrap simulator
 * reports the copy fits in `maxLines` given the caption `widthPx` and
 * an optional `boldSubstring` (wider glyphs). Falls back to
 * `MONTAGE_SALES_CUE_MIN_FONT_PX` if the copy is too long even at the
 * minimum. Kept separate from `montageSalesCueFontPx` (desktop) so the
 * desktop caption behavior is unchanged.
 */
function montagePhoneCueFontPx(
  text: string,
  basePx: number,
  widthPx: number,
  boldSubstring: string | null = null,
  firstLineReservePx: number = 0,
  maxLines: number = PHONE_CUE_MAX_LINES,
): number {
  const step = 0.5;
  for (let fontPx = basePx; fontPx >= MONTAGE_SALES_CUE_MIN_FONT_PX; fontPx -= step) {
    if (phoneCueFitsInLines(
      text, fontPx, widthPx, boldSubstring, maxLines, firstLineReservePx,
    )) {
      return Math.round(fontPx * 10) / 10;
    }
  }
  return MONTAGE_SALES_CUE_MIN_FONT_PX;
}

const MONTAGE_CUSTOMER_WAVE_GREY: [number, number, number] = [180, 180, 180];
const MONTAGE_CUSTOMER_WAVE_OPACITY = 0.18;

type MontagePalette = {
  hex: string;
  dark: string;
  light: string;
  captionAccent: string;
  /** Caption/wave tint: contrast-corrected; use for waveforms, policy chip, inline caption accents. */
  rgb: [number, number, number];
  /** `hex` (pre-caption) as RGB — scene gradients, recommended card chrome, phone frame glow. */
  uiRgb: [number, number, number];
  /** Legible on solid `hex` (recommended ribbon). */
  uiBadgeTextColor: string;
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

const MONTAGE_CAPTION_MAX_LIGHTNESS = 52;
const MONTAGE_CAPTION_MAX_SATURATION = 65;
const MONTAGE_CAPTION_MIN_CONTRAST = 2.4;
/** When corrected accent is still extremely light — matches Python `resolve_widget_wave_color` / Blender wave ring. */
const MONTAGE_WAVE_LUMINANCE_FALLBACK_HEX = "#475569";

function deriveMontagePalette(primaryHex: string, textColor: string | null | undefined): MontagePalette {
  const accent = pickMontageAccent(primaryHex, textColor);
  const [h, s, l] = hexToHsl(accent);

  const hex = accent;
  const dark = hslToHex(h, Math.min(s + 5, 100), Math.max(l - 18, 10));
  const light = hslToHex(h, Math.max(s - 10, 0), Math.min(l + 22, 92));

  const contrast = contrastRatioOnWhite(accent);
  let captionAccent = hex;
  if (contrast < MONTAGE_CAPTION_MIN_CONTRAST) {
    const targetL = Math.min(l, MONTAGE_CAPTION_MAX_LIGHTNESS);
    const targetS = Math.min(s, MONTAGE_CAPTION_MAX_SATURATION);
    captionAccent = hslToHex(h, targetS, targetL);
  }

  let capRgb = hexToRgb(captionAccent);
  if (relativeLuminance(...capRgb) > 0.85) {
    captionAccent = MONTAGE_WAVE_LUMINANCE_FALLBACK_HEX;
    capRgb = hexToRgb(captionAccent);
  }

  const rgb = capRgb;
  const lum = relativeLuminance(...rgb);
  const WAVE_OPACITY_MIN = 0.06;
  const WAVE_OPACITY_MAX = 0.18;
  const waveformOpacity = +(WAVE_OPACITY_MIN + (WAVE_OPACITY_MAX - WAVE_OPACITY_MIN) * lum).toFixed(3);

  const uiRgb = hexToRgb(hex);
  const uiLum = relativeLuminance(...uiRgb);
  const uiBadgeTextColor = uiLum > 0.42 ? "#32281B" : "#ffffff";

  return { hex, dark, light, captionAccent, rgb, uiRgb, uiBadgeTextColor, waveformOpacity };
}

const MONTAGE_WHITE_GLOW_ALPHA_PEAK = 1.0;
const MONTAGE_SCENE_TINT_ALPHA = 0.08;

const MONTAGE_SCENE_GRADIENT_LIGHT_HEX = "#F6F4F1";

function montageSceneBgHex(r: number, g: number, b: number): string {
  const a = MONTAGE_SCENE_TINT_ALPHA;
  const blend = (c: number) => Math.round(255 + (c - 255) * a);
  return `#${[blend(r), blend(g), blend(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function montageSupportGradientCss(tintHex: string): string {
  return `linear-gradient(to bottom, ${MONTAGE_SCENE_GRADIENT_LIGHT_HEX} 0%, ${tintHex} 30%)`;
}

function montageSalesGradientCss(tintHex: string): string {
  return `linear-gradient(135deg, ${MONTAGE_SCENE_GRADIENT_LIGHT_HEX} 0%, ${tintHex} 50%, ${tintHex} 100%)`;
}

const MONTAGE_WHITE_GLOW_PLATEAU_PCT = 0.50;

type MontageWhiteGlowOpts = {
  plateauPct?: number;
  alphaPeak?: number;
};

function montageWhiteGlowCss(
  shape: "ellipse" | "circle" = "ellipse",
  opts?: MontageWhiteGlowOpts,
): string {
  const plateauPct = opts?.plateauPct ?? MONTAGE_WHITE_GLOW_PLATEAU_PCT;
  const alphaPeak = opts?.alphaPeak ?? MONTAGE_WHITE_GLOW_ALPHA_PEAK;
  const n = 24;
  const parts: string[] = [];
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    const pct = Math.round(t * 1000) / 10;
    const fade = t <= plateauPct
      ? 1
      : 1 - ((t - plateauPct) / (1 - plateauPct));
    const a = alphaPeak * fade;
    parts.push(`rgba(255,255,255,${a.toFixed(4)}) ${pct}%`);
  }
  return `radial-gradient(${shape},${parts.join(",")})`;
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

/** Angle (deg) for the banner blend — diagonal transition (not vertical). CSS: 0° = up, 90° = right, 135° ≈ top-left → bottom-right. */
const BANNER_GRADIENT_ANGLE_DEG = 128;
/** Stops (%) along the gradient axis: solid lead → blend (via white) → solid Bizmis. */
const BANNER_GRADIENT_LEAD_END_PCT = 22;
const BANNER_GRADIENT_BIZMIS_START_PCT = 78;
/** Softer than pure white so the transition peak doesn’t read as a flat opaque band. */
const BANNER_GRADIENT_TRANSITION_WHITE = "rgba(255,255,255,0.42)";

function buildEmailBannerStripCellStyle(leadHex: string, noisePublicUrl: string): string {
  const urlEsc = noisePublicUrl.replace(/'/g, "\\'");
  const whiteStopPct =
    (BANNER_GRADIENT_LEAD_END_PCT + BANNER_GRADIENT_BIZMIS_START_PCT) / 2;
  const grad = `linear-gradient(${BANNER_GRADIENT_ANGLE_DEG}deg, ${leadHex} 0%, ${leadHex} ${BANNER_GRADIENT_LEAD_END_PCT}%, ${BANNER_GRADIENT_TRANSITION_WHITE} ${whiteStopPct}%, ${BIZMIS_PRIMARY_HEX} ${BANNER_GRADIENT_BIZMIS_START_PCT}%, ${BIZMIS_PRIMARY_HEX} 100%)`;
  return `padding:0;vertical-align:middle;position:relative;background-color:${leadHex};background-image:url('${urlEsc}'),${grad};background-repeat:no-repeat,no-repeat;background-size:100% 100%,100% 100%;`;
}

/** Mask fade stops for the darken pass: visible on the lead side, fades through the gradient white band, off on the Bizmis orange side. */
const BANNER_WAVEFORM_DARKEN_MASK_VISIBLE_END_PCT = 45;
const BANNER_WAVEFORM_DARKEN_MASK_FADE_END_PCT = 68;
/** Opacity of the inverted darken pass — tuned to stay readable on near-white leads without crushing mid/dark leads. */
const BANNER_WAVEFORM_DARKEN_OPACITY = 0.35;

/**
 * PNG from `buildShopifyCoverFullWidthWaveformSvg`. Uses two stacked passes so the wave stays
 * visible over any lead color while keeping the Bizmis (orange) half always lightened:
 *   - Lighten pass: `screen` full-width — boosts dark leads and orange; no-op on near-white.
 *   - Darken pass: `multiply` with the PNG inverted, masked to fade out before the Bizmis half —
 *     provides contrast over near-white regions without ever darkening the orange side.
 */
function buildEmailBannerWaveformOverlayHtml(waveformPublicUrl: string): string {
  const commonImgStyle = `display:block;border:0;width:100%;height:${EMAIL_BANNER_WAVEFORM_DISPLAY_H_PX}px;object-fit:fill;`;
  const baseLayerStyle = `position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);-webkit-transform:translateY(-50%);height:${EMAIL_BANNER_WAVEFORM_DISPLAY_H_PX}px;z-index:1;pointer-events:none;line-height:0;mso-line-height-rule:exactly;`;
  const darkenMaskGradient = `linear-gradient(to right, #000 0%, #000 ${BANNER_WAVEFORM_DARKEN_MASK_VISIBLE_END_PCT}%, transparent ${BANNER_WAVEFORM_DARKEN_MASK_FADE_END_PCT}%, transparent 100%)`;
  const lightenPass = `<div aria-hidden="true" style="${baseLayerStyle}mix-blend-mode:screen;"><img src="${waveformPublicUrl}" alt="" width="${EMAIL_BANNER_WAVEFORM_W_PX}" height="${EMAIL_BANNER_WAVEFORM_H_PX}" style="${commonImgStyle}" /></div>`;
  const darkenPass = `<div aria-hidden="true" style="${baseLayerStyle}mix-blend-mode:multiply;opacity:${BANNER_WAVEFORM_DARKEN_OPACITY};-webkit-mask-image:${darkenMaskGradient};mask-image:${darkenMaskGradient};"><img src="${waveformPublicUrl}" alt="" width="${EMAIL_BANNER_WAVEFORM_W_PX}" height="${EMAIL_BANNER_WAVEFORM_H_PX}" style="${commonImgStyle}filter:invert(1);-webkit-filter:invert(1);" /></div>`;
  return `<!--[if !mso]><!-->${lightenPass}${darkenPass}<!--<![endif]-->`;
}

function buildBizmisCaptionIconHtml(captionAccentHex: string, sizePx: number): string {
  const safe = escapeHtml(captionAccentHex);
  const url = absImg(BIZMIS_LOGO_WHITE).replace(/'/g, "\\'");
  return `<span aria-hidden="true" style="display:inline-block;vertical-align:-0.2em;margin-right:${MONTAGE_SALES_BIZMIS_CAPTION_ICON_MARGIN_EM}em;width:${sizePx}px;height:${sizePx}px;background-color:${safe};-webkit-mask-image:url('${url}');mask-image:url('${url}');-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;"></span>`;
}

const HEADING = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,Helvetica,sans-serif;";
const BODY = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,Helvetica,sans-serif;";

/**
 * Full-width banner strip used at the top of the rich invite card and
 * baked as a backdrop into the mockup composition PNG consumed by the
 * Gmail-safe email.
 *
 * Renders a `lead → white → Bizmis` gradient with noise grain, a
 * blended waveform overlay, the store logo on the left, the Bizmis
 * wordmark on the right, a bottom scrim and the "EARLY ACCESS" badge.
 * Returns a full `<table>` fragment (no surrounding `<tr><td>`) so it
 * can be dropped either into an email card row or into a
 * `dangerouslySetInnerHTML` container on the render page.
 */
export function buildEmailInviteBannerHtml(
  lead: LeadEarlyAccessData,
  options: { heightPx?: number } = {},
): string {
  const heightPx = options.heightPx ?? EMAIL_BANNER_H_PX;
  const banner = lead.bannerColor?.trim() || lead.primaryColor;
  const storeLogoHtml = storeLogoEmailMarkup(lead);
  const bizmisLogoUrl = absImg(BIZMIS_LOGO_WHITE);
  const noiseGrainUrl = absImg(EMAIL_BANNER_NOISE_GRAIN);
  const bannerWaveformUrl = absImg(EMAIL_BANNER_WAVEFORM);
  const { storeCap } = EARLY_ACCESS_TERMS;
  const copy = EARLY_ACCESS_EMAIL_COPY;

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td height="${heightPx}" style="${buildEmailBannerStripCellStyle(banner, noiseGrainUrl)}height:${heightPx}px;border-bottom:1px solid ${BIZMIS_BORDER_HEX};">
                ${buildEmailBannerWaveformOverlayHtml(bannerWaveformUrl)}
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" height="${heightPx}" style="position:relative;z-index:2;border-collapse:collapse;height:${heightPx}px;">
                  <tr>
                    <td width="50%" valign="middle" style="padding:0 14px 0 ${EMAIL_BANNER_PAD_X_PX}px;background:transparent;">
                      ${storeLogoHtml}
                    </td>
                    <td width="50%" valign="middle" style="padding:0 ${EMAIL_BANNER_PAD_X_PX}px 0 14px;text-align:right;background:transparent;">
                      <a href="${escapeHtml(buildInviteBizmisSiteUrl(lead.id))}" target="_blank" style="text-decoration:none;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right">
                          <tr>
                            <td style="vertical-align:middle;">
                              <img src="${bizmisLogoUrl}" alt="Bizmis" width="${EMAIL_BANNER_BIZMIS_ICON_PX}" height="${EMAIL_BANNER_BIZMIS_ICON_PX}" style="display:block;width:${EMAIL_BANNER_BIZMIS_ICON_PX}px;height:auto;border:0;" />
                            </td>
                            <td style="vertical-align:middle;padding-left:8px;${HEADING}font-size:${EMAIL_BANNER_BIZMIS_WORDMARK_FONT_PX}px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">
                              bizmis
                            </td>
                          </tr>
                        </table>
                      </a>
                    </td>
                  </tr>
                </table>
                <!--[if !mso]><!--><div aria-hidden="true" style="position:absolute;left:0;right:0;bottom:0;height:${EMAIL_BANNER_SCRIM_H_PCT}%;z-index:2;pointer-events:none;background:linear-gradient(to bottom,transparent 0%,rgba(0,0,0,0.18) 100%);"></div><!--<![endif]-->
                <!--[if !mso]><!--><div style="position:absolute;left:0;right:0;bottom:${EMAIL_BANNER_BADGE_PAD_BOTTOM_PX}px;z-index:3;text-align:center;pointer-events:none;">
                  <p style="margin:0;${BODY}font-size:${EMAIL_BANNER_BADGE_FONT_PX}px;line-height:1.35;color:#ffffff;">
                    <span style="font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(copy.bannerBadgeTitle)}</span><span style="font-weight:400;"> &nbsp;&middot;&nbsp; ${escapeHtml(copy.bannerBadgeLimitPrefix)} ${storeCap} ${escapeHtml(copy.bannerBadgeLimitSuffix)}</span>
                  </p>
                </div><!--<![endif]-->
              </td>
            </tr>
          </table>`;
}

type BenefitCardTitleAlign = "left" | "center";

type BenefitCardGlowPreset = "overlay" | "column";

type BenefitCardAppearance = "glow" | "plain";

/** Per-card tilt (deg); kept at 0 so benefit cards render straight in all clients. */
const BENEFIT_CARD_TILT_SALES_DEG = 0;
const BENEFIT_CARD_TILT_SUPPORT_DEG = 0;
const BENEFIT_CARD_TILT_INSIGHTS_DEG = 0;

function buildPlainBenefitCardIconHtml(iconUrl: string, sizePx: number): string {
  return buildMaskedIconHtml(iconUrl, sizePx, BIZMIS_PRIMARY_HEX);
}

/**
 * Tint a transparent source PNG (shape in alpha) with an arbitrary hex color via
 * CSS `mask-image` + `background-color`. Used in place of inline <svg> so Gmail
 * (which strips inline SVG) still renders the icon. Outlook Windows ignores
 * `mask-image`; every call site here already sits in a non-MSO branch or has a
 * text-only MSO fallback, so there is no Outlook regression vs. inline SVG
 * (Outlook Windows strips inline SVG too).
 */
function buildMaskedIconHtml(
  iconUrl: string,
  sizePx: number,
  colorHex: string,
  display: "inline-block" | "block" = "inline-block",
  verticalAlign: string = "middle",
): string {
  const safeColor = escapeHtml(colorHex);
  const urlEsc = iconUrl.replace(/'/g, "\\'");
  return `<span aria-hidden="true" style="display:${display};vertical-align:${verticalAlign};width:${sizePx}px;height:${sizePx}px;background-color:${safeColor};-webkit-mask-image:url('${urlEsc}');mask-image:url('${urlEsc}');-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;"></span>`;
}

/** Scales the painted glow vs card; pair with blur — blur drives halo spread. */
const BENEFIT_CARD_GLOW_LAYER_SCALE = 0.87;
/** Slightly larger glow for Save Support Hours + Replays cards only (Boost Sales uses default). */
const BENEFIT_CARD_GLOW_LAYER_SCALE_SUPPORT_AND_REPLAYS = 0.93;
/** When true, benefit stains are flat solid orange (no gradient, no blur) — flip to false to restore soft glow. */
const BENEFIT_CARD_GLOW_SOLID_FLAT_PREVIEW = false;
/** When true, benefit cards render as landing-style tinted fills (primary/10 + primary/25 border + soft shadow) instead of a diffuse stain. Takes precedence over the flat-solid preview. */
const BENEFIT_CARD_LANDING_TINT_FILL = true;
/** Rounded corners on the orange stain for Boost Sales, Support, and Replays benefit cards. */
const BENEFIT_CARD_STAIN_BORDER_RADIUS_PX = 28;
/** Landing-style tinted card tokens (align with `bg-primary/10 border-primary/20 rounded-3xl shadow-xl`). */
/** Solid near-opaque cream: visually matches primary/10 on white but blocks anything behind from showing through in all email clients. */
const BENEFIT_CARD_TINT_FILL_SOLID = "#FEF6EE";
const BENEFIT_CARD_TINT_BORDER_RGBA = "rgba(249,163,83,0.22)";
const BENEFIT_CARD_TINT_BORDER_PX = 1;
const BENEFIT_CARD_TINT_SHADOW = "0 18px 36px -20px rgba(17,24,39,0.18),0 4px 10px -6px rgba(17,24,39,0.08)";
/** Real backdrop blur for clients that support it (Apple Mail, iOS Mail, some webmails); ignored elsewhere. */
const BENEFIT_CARD_TINT_BACKDROP_BLUR_PX = 14;
/** Inner padding on Boost Sales, Support, Replays, and Insights benefit card bodies. */
const BENEFIT_CARD_INNER_PADDING_Y_PX = 14;
const BENEFIT_CARD_INNER_PADDING_X_PX = 16;
/** Vertical gap between the Support and Replays cards in the left column (non-MSO). */
const BENEFIT_CARD_SUPPORT_TO_INSIGHTS_GAP_PX = 32;
/** Bizmis-primary outline around the Plug and Play bordered block. */
const SETUP_PLUG_PLAY_BORDER_PX = 2;

function buildBenefitCardGlowBackdropHtml(
  preset: BenefitCardGlowPreset,
  layerScale: number = BENEFIT_CARD_GLOW_LAYER_SCALE,
): string {
  const s = layerScale;
  const scale = `transform:scale(${s});-webkit-transform:scale(${s});transform-origin:50% 48%;`;
  const r = BENEFIT_CARD_STAIN_BORDER_RADIUS_PX;
  const stainRound = `border-radius:${r}px;`;
  if (BENEFIT_CARD_LANDING_TINT_FILL) {
    const b = BENEFIT_CARD_TINT_BACKDROP_BLUR_PX;
    return `<!--[if !mso]><!-->
<div aria-hidden="true" style="position:absolute;top:0;left:0;right:0;bottom:0;background-color:${BENEFIT_CARD_TINT_FILL_SOLID};border:${BENEFIT_CARD_TINT_BORDER_PX}px solid ${BENEFIT_CARD_TINT_BORDER_RGBA};border-radius:${r}px;box-shadow:${BENEFIT_CARD_TINT_SHADOW};backdrop-filter:blur(${b}px);-webkit-backdrop-filter:blur(${b}px);z-index:0;pointer-events:none;box-sizing:border-box;"></div>
<!--<![endif]-->`;
  }
  if (BENEFIT_CARD_GLOW_SOLID_FLAT_PREVIEW) {
    const solid = "rgb(249,163,83)";
    return `<!--[if !mso]><!-->
<div aria-hidden="true" style="position:absolute;top:-10px;left:-10px;right:-10px;bottom:-10px;background:${solid};opacity:1;${scale}z-index:0;pointer-events:none;${stainRound}"></div>
<!--<![endif]-->`;
  }
  if (preset === "column") {
    return `<!--[if !mso]><!-->
<div aria-hidden="true" style="position:absolute;top:-8px;left:-8px;right:-8px;bottom:-8px;background:radial-gradient(ellipse 96% 88% at 50% 48%, rgba(249,163,83,0.98) 0%, rgba(249,163,83,0.78) 22%, rgba(249,163,83,0.52) 44%, rgba(249,163,83,0.28) 60%, rgba(249,163,83,0.12) 76%, transparent 92%);opacity:1;filter:blur(9px);-webkit-filter:blur(9px);${scale}z-index:0;pointer-events:none;${stainRound}"></div>
<div aria-hidden="true" style="position:absolute;top:-10px;left:-10px;right:-10px;bottom:-10px;background:radial-gradient(ellipse 104% 94% at 50% 52%, rgba(249,163,83,0.78) 0%, rgba(249,163,83,0.44) 38%, rgba(249,163,83,0.22) 58%, transparent 86%);opacity:1;filter:blur(13px);-webkit-filter:blur(13px);${scale}z-index:0;pointer-events:none;${stainRound}"></div>
<!--<![endif]-->`;
  }
  return `<!--[if !mso]><!-->
<div aria-hidden="true" style="position:absolute;top:-8px;left:-8px;right:-8px;bottom:-8px;background:radial-gradient(ellipse 94% 86% at 50% 48%, rgba(249,163,83,0.98) 0%, rgba(249,163,83,0.76) 24%, rgba(249,163,83,0.48) 46%, rgba(249,163,83,0.24) 60%, rgba(249,163,83,0.1) 74%, transparent 90%);opacity:1;filter:blur(9px);-webkit-filter:blur(9px);${scale}z-index:0;pointer-events:none;${stainRound}"></div>
<div aria-hidden="true" style="position:absolute;top:-10px;left:-10px;right:-10px;bottom:-10px;background:radial-gradient(ellipse 100% 92% at 48% 52%, rgba(249,163,83,0.76) 0%, rgba(249,163,83,0.42) 40%, rgba(249,163,83,0.2) 60%, transparent 84%);opacity:1;filter:blur(13px);-webkit-filter:blur(13px);${scale}z-index:0;pointer-events:none;${stainRound}"></div>
<!--<![endif]-->`;
}

const SETUP_SYNC_ICON_PX = 7;
const SETUP_SYNC_BADGE_H_GAP_PX = 11;
/** Triangle stain: base spans badge row; tip meets Bizmis logo — tuned for 8px labels + 7px icons + 10px logo gap. */
const SETUP_PLUG_PLAY_TRIANGLE_HEIGHT_PX = 6;
const SETUP_PLUG_PLAY_TRIANGLE_MAX_WIDTH_PX = 440;
/** Top edge of clip-path (triangle base), % from left/right. Blur layer uses +1% / −1% so edge stays soft. */
const SETUP_PLUG_PLAY_TRIANGLE_BASE_LEFT_PCT = 18;
const SETUP_PLUG_PLAY_TRIANGLE_BASE_RIGHT_PCT = 82;
const SETUP_PLUG_PLAY_TRIANGLE_TOP_OFFSET_PX = 29;
const SETUP_PLUG_PLAY_TRIANGLE_DIFFUSE_BLUR_WIDE_PX = 12;
const SETUP_PLUG_PLAY_TRIANGLE_DIFFUSE_BLUR_SOFT_PX = 8;
const SETUP_PLUG_PLAY_TRIANGLE_LAYER_SCALE = 0.9;

function buildSetupSyncBadgesHtml(): string {
  const m = BIZMIS_MUTED_LIGHT_HEX;
  const w = SETUP_SYNC_ICON_PX;
  const icon = (iconPath: string) => buildMaskedIconHtml(absImg(iconPath), w, m);
  const badges: { label: string; iconHtml: string }[] = [
    { label: "Website", iconHtml: icon(EMAIL_ICON_SYNC_WEBSITE) },
    { label: "Catalog", iconHtml: icon(EMAIL_ICON_SYNC_CATALOG) },
    { label: "Discounts", iconHtml: icon(EMAIL_ICON_SYNC_DISCOUNTS) },
    { label: "Customers", iconHtml: icon(EMAIL_ICON_SYNC_CUSTOMERS) },
    { label: "Orders", iconHtml: icon(EMAIL_ICON_SYNC_ORDERS) },
  ];
  const badgeStyle = `display:inline-block;vertical-align:middle;${BODY}font-size:8px;font-weight:500;color:${m};letter-spacing:0.01em;white-space:nowrap;margin:0 ${SETUP_SYNC_BADGE_H_GAP_PX}px;`;
  return badges.map((b) => `<span style="${badgeStyle}">${b.iconHtml}&nbsp;${escapeHtml(b.label)}</span>`).join("");
}

function buildSetupPlugPlayFooterSharedParts(bizmisLogoUrl: string): {
  badgesHtml: string;
  logoMasked: string;
  triangleStainLayersHtml: string;
  triH: number;
  triMaxW: number;
  triTop: number;
  triScale: number;
} {
  const badgesHtml = buildSetupSyncBadgesHtml();
  const logoMasked = buildPlainBenefitCardIconHtml(bizmisLogoUrl, 24);
  const triH = SETUP_PLUG_PLAY_TRIANGLE_HEIGHT_PX;
  const triMaxW = SETUP_PLUG_PLAY_TRIANGLE_MAX_WIDTH_PX;
  const triTop = SETUP_PLUG_PLAY_TRIANGLE_TOP_OFFSET_PX;
  const bL = SETUP_PLUG_PLAY_TRIANGLE_BASE_LEFT_PCT;
  const bR = SETUP_PLUG_PLAY_TRIANGLE_BASE_RIGHT_PCT;
  const blurL = bL + 1;
  const blurR = bR - 1;
  const bWide = SETUP_PLUG_PLAY_TRIANGLE_DIFFUSE_BLUR_WIDE_PX;
  const bSoft = SETUP_PLUG_PLAY_TRIANGLE_DIFFUSE_BLUR_SOFT_PX;
  const triScale = SETUP_PLUG_PLAY_TRIANGLE_LAYER_SCALE;
  /** Always diffuse (gradient + blur); not tied to `BENEFIT_CARD_GLOW_SOLID_FLAT_PREVIEW`. */
  const triangleStainLayersHtml = `<div style="position:absolute;inset:-9px;background:linear-gradient(180deg, rgba(249,163,83,0.06) 0%, rgba(249,163,83,0.14) 32%, rgba(249,163,83,0.26) 62%, rgba(249,163,83,0.38) 100%);clip-path:polygon(${blurL}% 0, ${blurR}% 0, 50% 100%);-webkit-clip-path:polygon(${blurL}% 0, ${blurR}% 0, 50% 100%);filter:blur(${bWide}px);-webkit-filter:blur(${bWide}px);opacity:0.96;"></div>
    <div style="position:absolute;inset:-5px;background:linear-gradient(180deg, rgba(249,163,83,0.09) 0%, rgba(249,163,83,0.07) 22%, rgba(249,163,83,0.16) 52%, rgba(249,163,83,0.26) 100%);clip-path:polygon(${bL}% 0, ${bR}% 0, 50% 100%);-webkit-clip-path:polygon(${bL}% 0, ${bR}% 0, 50% 100%);filter:blur(${bSoft}px);-webkit-filter:blur(${bSoft}px);opacity:0.98;"></div>`;
  return {
    badgesHtml,
    logoMasked,
    triangleStainLayersHtml,
    triH,
    triMaxW,
    triTop,
    triScale,
  };
}

/** Sync badges + triangle + logo for modern clients; no MSO conditionals (safe inside outer `<!--[if !mso]>`). */
function buildSetupPlugPlayFooterNonMsoHtml(bizmisLogoUrl: string): string {
  const p = buildSetupPlugPlayFooterSharedParts(bizmisLogoUrl);
  return `<div style="position:relative;text-align:center;max-width:${p.triMaxW}px;margin:0 auto;padding:4px 12px 0;overflow:visible;">
  <div aria-hidden="true" style="position:absolute;left:50%;top:${p.triTop}px;width:100%;max-width:${p.triMaxW}px;height:${p.triH}px;z-index:0;pointer-events:none;overflow:visible;transform:translateX(-50%) scale(${p.triScale});-webkit-transform:translateX(-50%) scale(${p.triScale});transform-origin:50% 0;">
    ${p.triangleStainLayersHtml}
  </div>
  <div style="position:relative;z-index:1;line-height:1.2;">${p.badgesHtml}</div>
  <div style="position:relative;z-index:1;padding:10px 0 0;">${p.logoMasked}</div>
</div>`;
}

/** Outlook-only table; no outer `<!--[if mso]>` (caller wraps). */
function buildSetupPlugPlayFooterMsoInnerHtml(bizmisLogoUrl: string): string {
  const p = buildSetupPlugPlayFooterSharedParts(bizmisLogoUrl);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${SETUP_PLUG_PLAY_TRIANGLE_MAX_WIDTH_PX}" align="center">
  <tr><td style="padding:4px 12px 0;text-align:center;">${p.badgesHtml}</td></tr>
  <tr><td style="padding:10px 0 0;text-align:center;"><img src="${bizmisLogoUrl}" alt="Bizmis" width="24" height="24" style="display:inline-block;width:24px;height:24px;border:0;" /></td></tr>
</table>`;
}

function buildBenefitCardHtml(
  iconUrl: string,
  title: string,
  subtitle: string,
  options?: {
    titleAlign?: BenefitCardTitleAlign;
    glowPreset?: BenefitCardGlowPreset;
    appearance?: BenefitCardAppearance;
    /** Rotation in degrees; glow and content share the same transform. */
    tiltDeg?: number;
    /** When set, scales the orange glow layers (default `BENEFIT_CARD_GLOW_LAYER_SCALE`). */
    glowLayerScale?: number;
    /** Optional Replays-style icon+text chip row below the subtitle (e.g. support capabilities). */
    chipsRowHtml?: string;
  },
): string {
  const appearance = options?.appearance ?? "glow";
  const glowPreset = options?.glowPreset ?? "overlay";
  const glowLayerScale = options?.glowLayerScale ?? BENEFIT_CARD_GLOW_LAYER_SCALE;
  const titleAlign = options?.titleAlign ?? "left";
  const rowAlign = titleAlign === "center" ? "center" : "left";
  const textAlign = titleAlign === "center" ? "center" : "left";
  const usesLightFill = appearance === "plain" || BENEFIT_CARD_LANDING_TINT_FILL;
  const titleColor = usesLightFill ? BIZMIS_FOREGROUND_HEX : BENEFIT_CARD_TEXT_HEX;
  const subtitleColor = usesLightFill ? BIZMIS_MUTED_FG_HEX : BENEFIT_CARD_SUBTITLE_HEX;
  const titleFontPx = BENEFIT_CARD_GLOW_TITLE_FONT_PX;
  const subtitleFontPx = BENEFIT_CARD_GLOW_SUBTITLE_FONT_PX;
  const iconInnerHtml = usesLightFill
    ? buildPlainBenefitCardIconHtml(iconUrl, BENEFIT_CARD_ICON_PX)
    : `<img src="${iconUrl}" alt="" width="${BENEFIT_CARD_ICON_PX}" height="${BENEFIT_CARD_ICON_PX}" style="display:block;width:${BENEFIT_CARD_ICON_PX}px;height:${BENEFIT_CARD_ICON_PX}px;border:0;filter:${BENEFIT_CARD_ICON_WHITE_FILTER};-webkit-filter:${BENEFIT_CARD_ICON_WHITE_FILTER};" />`;
  const glowBackdropHtml =
    appearance === "plain" ? "" : buildBenefitCardGlowBackdropHtml(glowPreset, glowLayerScale);
  const titleRowHtml = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="${rowAlign}" style="text-align:${textAlign};">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;"><tr>
    <td valign="middle" style="vertical-align:middle;padding-right:7px;width:${BENEFIT_CARD_ICON_PX}px;">
      ${iconInnerHtml}
    </td>
    <td valign="middle" style="vertical-align:middle;">
      <span style="${HEADING}font-size:${titleFontPx}px;font-weight:800;color:${titleColor};letter-spacing:-0.01em;line-height:1.25;">${escapeHtml(title)}</span>
    </td>
  </tr></table>
  </td></tr></table>`;
  const tiltDeg = options?.tiltDeg ?? 0;
  const chipsRowHtml = options?.chipsRowHtml ?? "";
  const cardBody = `<div style="position:relative;border:0;background:transparent;padding:${BENEFIT_CARD_INNER_PADDING_Y_PX}px ${BENEFIT_CARD_INNER_PADDING_X_PX}px;box-sizing:border-box;overflow:visible;">
  ${glowBackdropHtml}
  <div style="position:relative;z-index:1;">
  ${titleRowHtml}
  <p style="margin:${BENEFIT_CARD_TITLE_TO_BODY_MARGIN_PX}px 0 0;text-align:${textAlign};${BODY}font-size:${subtitleFontPx}px;font-weight:400;color:${subtitleColor};line-height:${BENEFIT_CARD_SUBTITLE_LINE_HEIGHT};letter-spacing:${BENEFIT_CARD_SUBTITLE_LETTER_SPACING_EM}em;">${escapeHtml(subtitle)}</p>
  ${chipsRowHtml}
  </div>
</div>`;
  if (tiltDeg === 0) {
    return cardBody;
  }
  const tilt = `transform:rotate(${tiltDeg}deg);-webkit-transform:rotate(${tiltDeg}deg);transform-origin:center center;`;
  return `<div style="position:relative;display:block;overflow:visible;${tilt}">${cardBody}</div>`;
}

const INSIGHTS_PAIR_ICON_PX = 10;
const INSIGHTS_PAIR_ROW_FONT_PX = 8;
/** Space between insights subtitle and the icon+chip row (px). */
const INSIGHTS_CHIPS_MARGIN_TOP_PX = 16;
/** Tighter line-height when chips wrap to a second row. */
const INSIGHTS_CHIPS_LINE_HEIGHT = 1.12;

function buildInsightsPairRowSvgs(
  strokeColor: string = "#ffffff",
): readonly [string, string, string] {
  const w = INSIGHTS_PAIR_ICON_PX;
  const mk = (iconPath: string) => buildMaskedIconHtml(absImg(iconPath), w, strokeColor);
  return [mk(EMAIL_ICON_INSIGHTS_PLAY), mk(EMAIL_ICON_INSIGHTS_TAG), mk(EMAIL_ICON_INSIGHTS_FUNNEL)];
}

function buildSupportPairRowSvgs(strokeColor: string): readonly [string, string, string] {
  const w = INSIGHTS_PAIR_ICON_PX;
  const mk = (iconPath: string) => buildMaskedIconHtml(absImg(iconPath), w, strokeColor);
  return [mk(EMAIL_ICON_SUPPORT_BOLT), mk(EMAIL_ICON_SUPPORT_SHIELD), mk(EMAIL_ICON_SUPPORT_HEART)];
}

function buildTripleIconTextChipRowHtml(
  svgs: readonly [string, string, string],
  labels: readonly [string, string, string],
  textColor: string,
  textAlign: "left" | "center",
): string {
  const pairStyle = `display:inline-block;vertical-align:middle;${BODY}font-size:${INSIGHTS_PAIR_ROW_FONT_PX}px;font-weight:400;color:${textColor};line-height:${INSIGHTS_CHIPS_LINE_HEIGHT};letter-spacing:0.01em;`;
  const sepStyle = `display:inline-block;vertical-align:middle;margin:0 4px;color:${textColor};opacity:0.45;font-size:${INSIGHTS_PAIR_ROW_FONT_PX}px;line-height:${INSIGHTS_CHIPS_LINE_HEIGHT};`;
  const sep = `<span style="${sepStyle}">·</span>`;
  const pairSpans = [
    `<span style="${pairStyle}">${svgs[0]}&nbsp;${escapeHtml(labels[0])}</span>`,
    `<span style="${pairStyle}">${svgs[1]}&nbsp;${escapeHtml(labels[1])}</span>`,
    `<span style="${pairStyle}">${svgs[2]}&nbsp;${escapeHtml(labels[2])}</span>`,
  ];
  return `<p style="margin:${INSIGHTS_CHIPS_MARGIN_TOP_PX}px 0 0;text-align:${textAlign};${BODY}line-height:${INSIGHTS_CHIPS_LINE_HEIGHT};">${pairSpans.join(sep)}</p>`;
}

function buildInsightsBenefitCardHtml(
  headerIconUrl: string,
  title: string,
  subtitle: string,
  pairLabels: readonly [string, string, string],
  tiltDeg: number,
  glowLayerScale: number = BENEFIT_CARD_GLOW_LAYER_SCALE,
): string {
  const glowBackdropHtml = buildBenefitCardGlowBackdropHtml("column", glowLayerScale);
  const insightsTitleColor = BENEFIT_CARD_LANDING_TINT_FILL ? BIZMIS_FOREGROUND_HEX : BENEFIT_CARD_TEXT_HEX;
  const insightsSubtitleColor = BENEFIT_CARD_LANDING_TINT_FILL ? BIZMIS_MUTED_FG_HEX : BENEFIT_CARD_SUBTITLE_HEX;
  const iconInnerHtml = BENEFIT_CARD_LANDING_TINT_FILL
    ? buildPlainBenefitCardIconHtml(headerIconUrl, BENEFIT_CARD_ICON_PX)
    : `<img src="${headerIconUrl}" alt="" width="${BENEFIT_CARD_ICON_PX}" height="${BENEFIT_CARD_ICON_PX}" style="display:block;width:${BENEFIT_CARD_ICON_PX}px;height:${BENEFIT_CARD_ICON_PX}px;border:0;filter:${BENEFIT_CARD_ICON_WHITE_FILTER};-webkit-filter:${BENEFIT_CARD_ICON_WHITE_FILTER};" />`;
  const titleRowHtml = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="center" style="text-align:center;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;"><tr>
    <td valign="middle" style="vertical-align:middle;padding-right:7px;width:${BENEFIT_CARD_ICON_PX}px;">
      ${iconInnerHtml}
    </td>
    <td valign="middle" style="vertical-align:middle;">
      <span style="${HEADING}font-size:${BENEFIT_CARD_GLOW_TITLE_FONT_PX}px;font-weight:800;color:${insightsTitleColor};letter-spacing:-0.01em;line-height:1.25;">${escapeHtml(title)}</span>
    </td>
  </tr></table>
  </td></tr></table>`;
  const subtitleHtml = `<p style="margin:${BENEFIT_CARD_TITLE_TO_BODY_MARGIN_PX}px 0 0;text-align:center;${BODY}font-size:${BENEFIT_CARD_GLOW_SUBTITLE_FONT_PX}px;font-weight:400;color:${insightsSubtitleColor};line-height:${BENEFIT_CARD_SUBTITLE_LINE_HEIGHT};letter-spacing:${BENEFIT_CARD_SUBTITLE_LETTER_SPACING_EM}em;">${escapeHtml(subtitle)}</p>`;
  const pairIconStroke = BENEFIT_CARD_LANDING_TINT_FILL ? BIZMIS_PRIMARY_HEX : "#ffffff";
  const pairsRowHtml = buildTripleIconTextChipRowHtml(
    buildInsightsPairRowSvgs(pairIconStroke),
    pairLabels,
    insightsSubtitleColor,
    "center",
  );
  const cardBody = `<div style="position:relative;border:0;background:transparent;padding:${BENEFIT_CARD_INNER_PADDING_Y_PX}px ${BENEFIT_CARD_INNER_PADDING_X_PX}px;box-sizing:border-box;overflow:visible;">
  ${glowBackdropHtml}
  <div style="position:relative;z-index:1;">
  ${titleRowHtml}
  ${subtitleHtml}
  ${pairsRowHtml}
  </div>
</div>`;
  if (tiltDeg === 0) {
    return cardBody;
  }
  const tilt = `transform:rotate(${tiltDeg}deg);-webkit-transform:rotate(${tiltDeg}deg);transform-origin:center center;`;
  return `<div style="position:relative;display:block;overflow:visible;${tilt}">${cardBody}</div>`;
}

function emailMontageWatermarkWaveformHtml(
  r: number, g: number, b: number, alpha: number,
  flipped = false,
  dims: WaveformDims = WAVEFORM_DESKTOP,
): string {
  const src = absImg(dims.img).replace(/'/g, "\\'");
  const { w, h } = dims;
  const flip = flipped ? "transform:scaleY(-1);" : "";
  return `<div role="presentation" style="display:block;margin:0 auto;width:100%;max-width:${w}px;height:${h}px;background-color:rgba(${r},${g},${b},${alpha});-webkit-mask-image:url('${src}');mask-image:url('${src}');-webkit-mask-size:100% ${h}px;mask-size:100% ${h}px;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center bottom;mask-position:center bottom;${flip}"></div>`;
}

const REGULAR_CARD_W = 122;
const REGULAR_IMG_W = 76;
const REGULAR_IMG_H = 76;
const REGULAR_IMG_SLOT_H = REGULAR_IMG_H + 12;
const REC_CARD_MAX_W = 152;
const REC_IMG_W = 112;
const REC_IMG_H = 88;
const REC_IMG_SLOT_H = REC_IMG_H + 18;

function buildMontageClerkCueInnerHtml(
  customCue: string | null,
  productTitle: string,
  bodyColor: string,
  accentColor: string,
): string {
  const title = montageSalesCueSingleLine(productTitle);
  const fullText = customCue
    ? montageSalesCueSingleLine(customCue)
    : `${MONTAGE_CLERK_CUE_BEFORE_PRODUCT_NAME}${title}${MONTAGE_CLERK_CUE_AFTER_PRODUCT_NAME}`;
  const fPx = montageSalesCueFontPx(fullText, MONTAGE_SALES_CUE_BASE_FONT_PX);
  const bodyStyle = `${BODY}font-size:${fPx}px;font-weight:500;line-height:1.35;color:${bodyColor};white-space:nowrap;`;
  const accentStyle = `${BODY}font-size:${fPx}px;font-weight:800;line-height:1.35;letter-spacing:-0.02em;color:${accentColor};white-space:nowrap;`;

  if (customCue) {
    const cue = montageSalesCueSingleLine(customCue);
    const splitIdx = cue.indexOf(title);
    if (splitIdx >= 0) {
      const before = cue.slice(0, splitIdx);
      const after = cue.slice(splitIdx + title.length);
      return (
        `<span style="${bodyStyle}">${escapeHtml(before)}</span>` +
        `<span style="${accentStyle}">${escapeHtml(title)}</span>` +
        `<span style="${bodyStyle}">${escapeHtml(after)}</span>`
      );
    }
    return `<span style="${bodyStyle}">${escapeHtml(cue)}</span>`;
  }

  return (
    `<span style="${bodyStyle}">${escapeHtml(MONTAGE_CLERK_CUE_BEFORE_PRODUCT_NAME)}</span>` +
    `<span style="${accentStyle}">${escapeHtml(title)}</span>` +
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
  const product = lead.salesProducts[index];
  if (!product) return "";
  const imgUrl = absImg(productImages[index]);
  const [uir, uig, uib] = palette.uiRgb;

  if (isRecommended) {
    return `<div style="display:inline-block;max-width:${REC_CARD_MAX_W}px;border-radius:14px;background:rgba(255,255,255,0.88);-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px);border:1.5px solid ${palette.hex};box-shadow:0 0 0 3px rgba(${uir},${uig},${uib},0.12),0 6px 20px -4px rgba(${uir},${uig},${uib},0.18);overflow:hidden;">
              <div style="background-color:${palette.hex};padding:7px 0;text-align:center;line-height:1;display:flex;align-items:center;justify-content:center;">
                <span style="${BODY}font-size:10px;font-weight:700;color:${palette.uiBadgeTextColor};letter-spacing:0.06em;text-transform:uppercase;vertical-align:middle;">&#9733; Recommended</span>
              </div>
              <div style="padding:10px 10px 8px 10px;text-align:center;height:${REC_IMG_SLOT_H}px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                <img src="${imgUrl}" alt="" width="${REC_IMG_W}" style="display:block;margin:0 auto;max-width:${REC_IMG_W}px;max-height:${REC_IMG_H}px;width:auto;height:auto;border:0;border-radius:8px;object-fit:contain;" />
              </div>
              <div style="padding:4px 12px 12px 12px;text-align:center;">
                <p style="margin:0;${BODY}font-size:11px;font-weight:700;color:${BIZMIS_FOREGROUND_HEX};line-height:1.3;">${escapeHtml(product.title)}</p>
                <p style="margin:4px 0 0;${BODY}font-size:10px;font-weight:600;color:${palette.hex};">${escapeHtml(product.price)}</p>
              </div>
            </div>`;
  }

  return `<div style="display:inline-block;width:${REGULAR_CARD_W}px;border-radius:12px;background:rgba(255,255,255,0.82);-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px);border:1px solid rgba(240,224,208,0.5);overflow:hidden;">
              <div style="padding:8px 8px 6px 8px;text-align:center;height:${REGULAR_IMG_SLOT_H}px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                <img src="${imgUrl}" alt="" width="${REGULAR_IMG_W}" style="display:block;margin:0 auto;max-width:${REGULAR_IMG_W}px;max-height:${REGULAR_IMG_H}px;width:auto;height:auto;border:0;border-radius:8px;object-fit:contain;" />
              </div>
              <div style="padding:0 10px 8px 10px;text-align:center;">
                <p style="margin:0;${BODY}font-size:10px;font-weight:600;color:${BIZMIS_FOREGROUND_HEX};line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(product.title)}</p>
                <p style="margin:2px 0 0;${BODY}font-size:9px;color:${BIZMIS_MUTED_LIGHT_HEX};">${escapeHtml(product.price)}</p>
              </div>
            </div>`;
}

const CS_POLICY_FALLBACK = "Warranty Policy";
const CS_POLICY_ICON_PX = 12;
const CS_POLICY_ICON_STROKE = 3;
/** Inner row height: label line-height matches so text centers in the pill. */
const CS_POLICY_CHIP_ROW_H = 18;
const CS_POLICY_CHIP_FONT_PX = 10;
const CS_SHOPPER_FALLBACK = "Is my order covered under warranty?";
const CS_CLERK_FALLBACK = "Yes, your unit has a full 1-year warranty.";

function highlightProductInHtml(
  text: string, productName: string | null,
  normalStyle: string, boldStyle: string,
): string {
  if (!productName) return `<span style="${normalStyle}">${escapeHtml(text)}</span>`;
  const idx = text.indexOf(productName);
  if (idx < 0) return `<span style="${normalStyle}">${escapeHtml(text)}</span>`;
  const before = text.slice(0, idx);
  const after = text.slice(idx + productName.length);
  return (
    `<span style="${normalStyle}">${escapeHtml(before)}</span>` +
    `<span style="${boldStyle}">${escapeHtml(productName)}</span>` +
    `<span style="${normalStyle}">${escapeHtml(after)}</span>`
  );
}

/**
 * Desktop storefront mockup (rich email) as a self-contained fragment.
 *
 * Emits the `<table data-email-mockup="desktop">...</table>` block used
 * inside the rich email plus the Gmail-safe email's hosted PNG (generated
 * by isolating this fragment on a transparent background via the
 * Playwright pipeline). No surrounding padding, no Boost Sales overlay.
 */
export function buildSalesMockupSceneHtml(lead: LeadEarlyAccessData): string {
  const palette = deriveMontagePalette(lead.primaryColor, lead.textColor);
  const [muiR, muiG, muiB] = palette.uiRgb;
  const montageSceneBg = montageSceneBgHex(muiR, muiG, muiB);
  const salesGradient = montageSalesGradientCss(montageSceneBg);
  const montageWhiteGlow = montageWhiteGlowCss();
  const MONTAGE_SCENE_APPROX_W = 550;
  const glowTiltDeg = +(
    Math.atan2(2 * MONTAGE_VERTICAL_SPREAD_PX, MONTAGE_SCENE_APPROX_W) * (180 / Math.PI)
  ).toFixed(1);

  const domain = escapeHtml(lead.storeDomain);
  const salesAvatarUrl = absImg(lead.salesAvatarImagePath || BIZMIS_SALES_AVATAR_FALLBACK);

  const recIdx = lead.salesRecommendedIndex;
  const otherIndices = ([0, 1, 2] as const).filter((i) => i !== recIdx);
  const recommendedCardHtml = buildMontageProductCardHtml(lead, recIdx, true, palette);
  const otherCardHtmlA = buildMontageProductCardHtml(lead, otherIndices[0], false, palette);
  const otherCardHtmlB = buildMontageProductCardHtml(lead, otherIndices[1], false, palette);

  const clerkCueHtml = buildMontageClerkCueInnerHtml(
    lead.montageClerkCue?.trim() || null,
    lead.salesProducts[recIdx].title,
    BIZMIS_FOREGROUND_HEX,
    palette.captionAccent,
  );
  const clerkBizmisIconHtml = buildBizmisCaptionIconHtml(
    palette.captionAccent,
    MONTAGE_SALES_BIZMIS_CAPTION_ICON_PX,
  );

  const clerkWaveHtml = emailMontageWatermarkWaveformHtml(...palette.rgb, palette.waveformOpacity);
  const customerWaveHtml = emailMontageWatermarkWaveformHtml(
    ...MONTAGE_CUSTOMER_WAVE_GREY,
    MONTAGE_CUSTOMER_WAVE_OPACITY,
    true,
  );

  const shopperCueRaw = lead.montageShopperCue?.trim()
    ? `\u201c${montageSalesCueSingleLine(lead.montageShopperCue.trim())}\u201d`
    : MONTAGE_CUSTOMER_CUE_TEXT_FALLBACK;
  const shopperFontPx = montageSalesCueFontPx(shopperCueRaw, MONTAGE_CUSTOMER_CUE_BASE_FONT_PX);
  const shopperCueHtml = `<span style="${BODY}font-size:${shopperFontPx}px;font-weight:300;font-style:italic;line-height:1.35;color:${BIZMIS_MUTED_LIGHT_HEX};white-space:nowrap;">${escapeHtml(shopperCueRaw)}</span>`;

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" data-email-mockup="desktop" style="border:0;border-radius:12px;overflow:hidden;box-shadow:0 8px 40px -8px rgba(0,0,0,0.12);">
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
                  <span style="${BODY}font-size:${MONTAGE_CHROME_URL_FONT_PX}px;color:${MONTAGE_CHROME_URL_HEX};line-height:${MONTAGE_CHROME_URL_ROW_HEIGHT_PX}px;">${domain}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td bgcolor="${montageSceneBg}" style="background:${salesGradient};background-color:${montageSceneBg};padding:0 10px 0 10px;">
      <!--[if !mso]><!-->
      <div style="position:relative;min-height:360px;overflow:visible;">

        <div style="position:absolute;left:50%;top:calc(50% + ${MONTAGE_COMPOSITION_SHIFT_PX}px);width:160%;height:110%;transform:translate(-50%,-50%) rotate(${glowTiltDeg}deg);border-radius:50%;background:${montageWhiteGlow};-webkit-filter:blur(60px);filter:blur(60px);z-index:0;pointer-events:none;"></div>

        <div style="position:absolute;top:${MONTAGE_VERTICAL_SPREAD_PX + MONTAGE_COMPOSITION_SHIFT_PX}px;right:0;bottom:82px;z-index:2;display:flex;align-items:center;justify-content:center;">
          <img src="${salesAvatarUrl}" alt="Bizmis store clerk" width="320" style="display:block;max-width:320px;width:100%;height:auto;border:0;border-radius:16px;filter:drop-shadow(0 10px 32px rgba(50,40,27,0.16));" />
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
          <div style="position:relative;height:${WAVEFORM_DESKTOP.h}px;">
            <div style="position:absolute;top:0;left:0;right:0;bottom:0;-webkit-mask-image:linear-gradient(to right,#000 60%,transparent 100%);mask-image:linear-gradient(to right,#000 60%,transparent 100%);">
              <div style="text-align:left;line-height:0;font-size:0;padding:0;height:${WAVEFORM_DESKTOP.h}px;overflow:hidden;">
                ${customerWaveHtml}
              </div>
            </div>
            <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:flex-start;overflow:visible;">
              <div style="position:relative;display:flex;align-items:center;justify-content:flex-start;padding-left:8px;padding-right:8px;transform:translateY(-24px);width:100%;max-width:100%;box-sizing:border-box;overflow:visible;">
                <div style="position:absolute;width:120%;height:100%;top:0;left:-10%;background:radial-gradient(ellipse 100% 100% at 30% 50%,rgba(255,255,255,0.92) 0%,rgba(255,255,255,0.45) 30%,transparent 68%);"></div>
                <p style="margin:0;position:relative;text-align:left;white-space:nowrap;overflow:visible;text-overflow:clip;max-width:none;">
                  ${shopperCueHtml}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style="position:absolute;bottom:0;right:0;width:72%;z-index:1;pointer-events:none;">
          <div style="position:relative;height:${WAVEFORM_DESKTOP.h}px;">
            <div style="position:absolute;top:0;left:0;right:0;bottom:0;-webkit-mask-image:linear-gradient(to left,#000 60%,transparent 100%);mask-image:linear-gradient(to left,#000 60%,transparent 100%);">
              <div style="text-align:right;line-height:0;font-size:0;padding:0;height:${WAVEFORM_DESKTOP.h}px;overflow:hidden;">
                ${clerkWaveHtml}
              </div>
            </div>
            <div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:flex-end;overflow:visible;">
              <div style="position:relative;display:flex;align-items:center;justify-content:flex-end;padding-left:8px;padding-right:8px;transform:translateY(24px);width:100%;max-width:100%;box-sizing:border-box;overflow:visible;">
                <div style="position:absolute;width:120%;height:100%;top:0;right:-10%;background:radial-gradient(ellipse 100% 100% at 70% 50%,rgba(255,255,255,0.92) 0%,rgba(255,255,255,0.45) 30%,transparent 68%);"></div>
                <p style="margin:0;position:relative;text-align:right;white-space:nowrap;overflow:visible;text-overflow:clip;max-width:none;">
                  ${clerkBizmisIconHtml}${clerkCueHtml}
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
            <img src="${salesAvatarUrl}" alt="Bizmis store clerk" width="296" style="display:block;margin:0 auto;max-width:296px;height:auto;border:0;" />
          </td>
        </tr>
      </table>
      <![endif]-->
    </td>
  </tr>
</table>`;
}

/**
 * Phone support mockup (rich email) as a self-contained fragment.
 *
 * Emits the `<div data-email-mockup="phone">...</div>` block used inside the
 * rich email plus the Gmail-safe email's hosted PNG (isolated on transparent
 * bg via the Playwright pipeline).
 */
export function buildSupportMockupSceneHtml(
  lead: LeadEarlyAccessData,
  options: { compact?: boolean } = {},
): string {
  const compact = options.compact === true;
  const palette = deriveMontagePalette(lead.primaryColor, lead.textColor);
  const [muiR, muiG, muiB] = palette.uiRgb;
  const montageSceneBg = montageSceneBgHex(muiR, muiG, muiB);
  const supportGradient = montageSupportGradientCss(montageSceneBg);

  const avatarUrl = absImg(lead.supportAvatarImagePath || lead.salesAvatarImagePath || BIZMIS_SALES_AVATAR_FALLBACK);
  const [pr, pg, pb] = palette.uiRgb;
  const pw = WAVEFORM_PHONE;

  /**
   * Both variants natively trim the phone's intrinsic height (no
   * transform, so every internal element keeps its aspect ratio). The
   * compact variant is slightly tighter still, used by the combined
   * email mockup PNG where the phone reads shorter than the desktop.
   * The rich variant keeps a touch more breathing room but still
   * reclaims the large vertical gaps the default values used to leave
   * around the avatar.
   */
  const avatarW = compact ? 276 : PHONE_AVATAR_W;
  const avatarClipMarginLeftPx = Math.round((PHONE_SCREEN_W - avatarW) / 2);
  /**
   * Avatar PNGs carry ~15-20% transparent padding on all sides around
   * the face + rings + badge. Both variants crop that padding
   * vertically so the avatar sits visually closer to the shopper cue
   * above and the clerk chip below without touching the image asset
   * itself.
   */
  const avatarVisibleHeightRatio = compact ? 0.78 : 0.84;
  const avatarVisibleHeightPx = Math.round(avatarW * avatarVisibleHeightRatio);
  const avatarClipMarginTopPx = Math.round((avatarVisibleHeightPx - avatarW) / 2);
  const topWaveRowMinH = compact
    ? Math.round(pw.h * 0.78)
    : Math.round(pw.h * 0.85);
  const bottomWaveRowMinH = compact
    ? Math.round(pw.h * 0.45)
    : Math.round(pw.h * 0.6);
  const shopperPadTopPx = compact ? 4 : 6;
  const shopperPadBottomPx = compact ? 0 : 2;
  const avatarRowPadYPx = compact ? 0 : 2;
  const clerkPadTopPx = compact ? 0 : 2;
  const clerkPadBottomPx = compact ? 4 : 6;
  const avatarCircleGlow = montageWhiteGlowCss("circle", {
    plateauPct: PHONE_AVATAR_GLOW_PLATEAU_PCT,
    alphaPeak: MONTAGE_WHITE_GLOW_ALPHA_PEAK,
  });

  const customerWaveHtml = emailMontageWatermarkWaveformHtml(
    ...MONTAGE_CUSTOMER_WAVE_GREY, MONTAGE_CUSTOMER_WAVE_OPACITY, true, pw,
  );
  const clerkWaveHtml = emailMontageWatermarkWaveformHtml(...palette.rgb, palette.waveformOpacity, false, pw);

  const supportCaptionParagraphWrap =
    "white-space:normal;word-wrap:break-word;overflow-wrap:break-word;max-width:100%;";

  const phoneCaptionWidthPx = PHONE_SCREEN_W - PHONE_SUPPORT_CAPTION_INSET_PX * 2;
  const productName = lead.supportProductName?.trim() || null;
  const policyName = lead.supportPolicyName?.trim() || CS_POLICY_FALLBACK;

  const shopperRaw = lead.supportShopperCue?.trim() || CS_SHOPPER_FALLBACK;
  const shopperText = `\u201c${montageSalesCueSingleLine(shopperRaw)}\u201d`;
  const shopperFontPx = montagePhoneCueFontPx(
    shopperText, MONTAGE_CUSTOMER_CUE_BASE_FONT_PX, phoneCaptionWidthPx, productName,
  );
  const customerCueStyle = `${BODY}font-size:${shopperFontPx}px;font-weight:300;font-style:italic;line-height:1.35;color:${BIZMIS_MUTED_LIGHT_HEX};`;
  const customerCueBoldStyle = `${BODY}font-size:${shopperFontPx}px;font-weight:600;font-style:italic;line-height:1.35;color:${BIZMIS_MUTED_LIGHT_HEX};`;

  const clerkRaw = lead.supportClerkCue?.trim() || CS_CLERK_FALLBACK;
  const clerkDisplay = montageSalesCueSingleLine(clerkRaw);
  const clerkIconReservePx =
    MONTAGE_SALES_BIZMIS_CAPTION_ICON_PX + MONTAGE_SALES_BIZMIS_CAPTION_ICON_MARGIN_EM * MONTAGE_SALES_CUE_BASE_FONT_PX;
  const clerkFontPx = montagePhoneCueFontPx(
    clerkDisplay, MONTAGE_SALES_CUE_BASE_FONT_PX, phoneCaptionWidthPx, productName, clerkIconReservePx,
  );
  const clerkReplyStyle = `${BODY}font-size:${clerkFontPx}px;font-weight:500;line-height:1.35;color:${BIZMIS_FOREGROUND_HEX};`;
  const clerkReplyBoldStyle = `${BODY}font-size:${clerkFontPx}px;font-weight:800;line-height:1.35;letter-spacing:-0.02em;color:${palette.captionAccent};`;

  const shopperHtml = highlightProductInHtml(shopperText, productName, customerCueStyle, customerCueBoldStyle);
  const clerkHtml = highlightProductInHtml(clerkDisplay, productName, clerkReplyStyle, clerkReplyBoldStyle);

  const policyChipAccent = palette.captionAccent;
  const [policyChipR, policyChipG, policyChipB] = hexToRgb(policyChipAccent);

  const chipLabelStyle = `${BODY}font-size:${CS_POLICY_CHIP_FONT_PX}px;font-weight:700;letter-spacing:0.02em;line-height:${CS_POLICY_CHIP_ROW_H}px;mso-line-height-rule:exactly;color:${policyChipAccent};`;
  const policyIconHtml = buildMaskedIconHtml(
    absImg(EMAIL_ICON_POLICY_FILECHECK),
    CS_POLICY_ICON_PX,
    policyChipAccent,
    "block",
    "baseline",
  );
  const lookupChipHtml = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border-collapse:separate;border-spacing:0;border-radius:9999px;background:rgba(${policyChipR},${policyChipG},${policyChipB},0.10);border:1px solid ${policyChipAccent};padding:4px 10px 4px 8px;">
    <tr>
      <td height="${CS_POLICY_CHIP_ROW_H}" style="height:${CS_POLICY_CHIP_ROW_H}px;vertical-align:middle;padding:0 4px 0 0;line-height:${CS_POLICY_CHIP_ROW_H}px;mso-line-height-rule:exactly;">${policyIconHtml}</td>
      <td height="${CS_POLICY_CHIP_ROW_H}" style="height:${CS_POLICY_CHIP_ROW_H}px;vertical-align:middle;padding:0;line-height:${CS_POLICY_CHIP_ROW_H}px;mso-line-height-rule:exactly;"><span style="${chipLabelStyle}">${escapeHtml(policyName)}</span></td>
    </tr>
  </table>`;

  const supportClerkBizmisIconHtml = buildBizmisCaptionIconHtml(palette.captionAccent, MONTAGE_SALES_BIZMIS_CAPTION_ICON_PX);

  return `<!--[if !mso]><!-->
            <div data-email-mockup="phone" style="display:inline-block;width:${PHONE_FRAME_W}px;border-radius:${PHONE_BODY_RADIUS}px;background-color:${MONTAGE_CHROME_BG_HEX};border:1px solid rgba(0,0,0,0.06);padding:${PHONE_BEZEL_PX}px;box-shadow:0 8px 36px -8px rgba(${pr},${pg},${pb},0.18),0 0 0 0.5px rgba(0,0,0,0.04);">

              <div style="width:${PHONE_NOTCH_W}px;height:${PHONE_NOTCH_H}px;margin:0 auto;border-radius:0 0 ${Math.round(PHONE_NOTCH_H * 0.55)}px ${Math.round(PHONE_NOTCH_H * 0.55)}px;background-color:rgba(0,0,0,0.07);"></div>

              <div style="position:relative;border-radius:${PHONE_SCREEN_RADIUS}px;overflow:hidden;margin-top:4px;background:${supportGradient};background-color:${montageSceneBg};">

                <div style="position:relative;z-index:1;">

                  <div style="position:relative;min-height:${topWaveRowMinH}px;overflow:hidden;">
                    <div style="position:absolute;left:0;right:0;bottom:0;height:${pw.h}px;-webkit-mask-image:linear-gradient(to right,#000 70%,transparent 100%);mask-image:linear-gradient(to right,#000 70%,transparent 100%);">
                      <div style="text-align:left;line-height:0;font-size:0;padding:0;height:${pw.h}px;overflow:hidden;">
                        ${customerWaveHtml}
                      </div>
                    </div>
                    <div style="position:relative;z-index:1;padding:${shopperPadTopPx}px ${PHONE_SUPPORT_CAPTION_INSET_PX}px ${shopperPadBottomPx}px ${PHONE_SUPPORT_CAPTION_INSET_PX}px;width:100%;box-sizing:border-box;text-align:left;">
                      <p style="margin:0;width:100%;text-align:left;${supportCaptionParagraphWrap}">
                        ${shopperHtml}
                      </p>
                    </div>
                  </div>

                  <div style="position:relative;width:100%;padding:${avatarRowPadYPx}px 0;box-sizing:border-box;">
                    <div aria-hidden="true" style="position:absolute;left:50%;top:50%;width:${PHONE_AVATAR_GLOW_DIAM_PX}px;height:${PHONE_AVATAR_GLOW_DIAM_PX}px;margin-left:${-Math.round(PHONE_AVATAR_GLOW_DIAM_PX / 2)}px;margin-top:${-Math.round(PHONE_AVATAR_GLOW_DIAM_PX / 2)}px;border-radius:50%;background:${avatarCircleGlow};-webkit-filter:blur(${PHONE_AVATAR_GLOW_BLUR_PX}px);filter:blur(${PHONE_AVATAR_GLOW_BLUR_PX}px);z-index:0;pointer-events:none;"></div>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;position:relative;z-index:1;">
                      <tr>
                        <td align="center" width="100%" style="padding:0;margin:0;width:100%;text-align:center;">
                          <div style="overflow:hidden;width:${PHONE_SCREEN_W}px;height:${avatarVisibleHeightPx}px;max-width:100%;margin:0 auto;line-height:0;font-size:0;">
                            <img src="${avatarUrl}" alt="Bizmis support clerk" width="${avatarW}" style="display:block;margin:0;padding:0;margin-left:${avatarClipMarginLeftPx}px;margin-top:${avatarClipMarginTopPx}px;margin-right:0;max-width:none;width:${avatarW}px;height:auto;border:0;border-radius:14px;filter:drop-shadow(0 8px 24px rgba(50,40,27,0.16));" />
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <div style="position:relative;min-height:${bottomWaveRowMinH}px;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;">
                    <div style="position:absolute;left:0;right:0;bottom:0;height:${pw.h}px;-webkit-mask-image:linear-gradient(to left,#000 70%,transparent 100%);mask-image:linear-gradient(to left,#000 70%,transparent 100%);">
                      <div style="text-align:right;line-height:0;font-size:0;padding:0;height:${pw.h}px;overflow:hidden;">
                        ${clerkWaveHtml}
                      </div>
                    </div>
                    <div style="position:relative;z-index:1;padding:${clerkPadTopPx}px ${PHONE_SUPPORT_CAPTION_INSET_PX}px ${clerkPadBottomPx}px ${PHONE_SUPPORT_CAPTION_INSET_PX}px;width:100%;box-sizing:border-box;text-align:right;">
                      <div style="margin:0 0 4px 0;text-align:right;">
                        ${lookupChipHtml}
                      </div>
                      <p style="margin:0;width:100%;text-align:right;${supportCaptionParagraphWrap}">
                        ${supportClerkBizmisIconHtml}${clerkHtml}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              <div style="width:${PHONE_HOME_BAR_W}px;height:${PHONE_HOME_BAR_H}px;margin:${PHONE_BEZEL_PX + 1}px auto ${PHONE_BEZEL_PX}px auto;border-radius:${PHONE_HOME_BAR_H}px;background-color:rgba(0,0,0,0.10);"></div>

            </div>
            <!--<![endif]-->
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${PHONE_FRAME_W}" align="center">
              <tr>
                <td align="center" style="padding:10px;text-align:center;">
                  <img src="${avatarUrl}" alt="Bizmis support clerk" width="228" style="display:block;margin:0 auto;max-width:228px;height:auto;border:0;" />
                </td>
              </tr>
            </table>
            <![endif]-->`;
}

function buildEarlyAccessChipStripHtml(
  storeCap: number,
  chipIconUrls: readonly [string, string, string],
): string {
  const textStyle = `${BODY}font-size:9px;font-weight:500;color:${BIZMIS_MUTED_FG_HEX};vertical-align:middle;letter-spacing:0.01em;`;
  const imgPx = CHIP_ROW_ICON_PX;
  const imgStyle = `display:block;width:${imgPx}px;height:${imgPx}px;border:0;`;
  const phrases = buildEarlyAccessChips(storeCap);

  const chipCell = (phrase: string, i: number) => {
    const iconUrl = chipIconUrls[i];
    const phraseEsc = escapeHtml(phrase);
    return `<td valign="middle" style="vertical-align:middle;padding:0;white-space:nowrap;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="vertical-align:middle;padding:0 3px 0 0;width:${imgPx + 2}px;">
                        <img src="${iconUrl}" alt="" width="${imgPx}" height="${imgPx}" style="${imgStyle}" />
                      </td>
                      <td style="vertical-align:middle;padding:0;">
                        <span style="${textStyle}">${phraseEsc}</span>
                      </td>
                    </tr>
                  </table>
                </td>`;
  };

  const sepDotInner = `<span style="display:block;width:2px;height:2px;border-radius:50%;background-color:${BIZMIS_MUTED_LIGHT_HEX};font-size:0;line-height:0;"></span>`;
  const sepCell = `<td valign="middle" align="center" style="vertical-align:middle;padding:0 7px;line-height:0;font-size:0;">${sepDotInner}</td>`;

  const rowInner = [chipCell(phrases[0], 0), sepCell, chipCell(phrases[1], 1), sepCell, chipCell(phrases[2], 2)].join(
    "",
  );

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;border-collapse:collapse;">
            <tr>
              ${rowInner}
            </tr>
          </table>`;
}

export function buildLeadEarlyAccessEmailHtml(
  lead: LeadEarlyAccessData,
): { html: string; plainText: string } {
  const pri = lead.primaryColor;
  const storeNameColor = escapeHtml(resolveStoreNameTextColor(lead));
  const store = escapeHtml(lead.storeName);
  const domain = escapeHtml(lead.storeDomain);
  const { storeCap, shopifyAppUrl, bookACallUrl } = EARLY_ACCESS_TERMS;
  const leadHandle = encodeURIComponent(lead.id);
  const installUrlWithCode = `${shopifyAppUrl}?ref=${leadHandle}&code=${encodeURIComponent(lead.couponCode.trim())}`;
  const bookCallUrl = `${bookACallUrl}?ref=${leadHandle}`;
  const copy = EARLY_ACCESS_EMAIL_COPY;
  const bizmisInviteSiteUrl = buildInviteBizmisSiteUrl(lead.id);
  const bizmisInviteHrefEsc = escapeHtml(bizmisInviteSiteUrl);

  const bizmisLogoUrl = absImg(BIZMIS_LOGO_WHITE);
  const shopifyMarkUrl = absImg(SHOPIFY_MARK_WHITE);
  const recProductTitle = lead.salesProducts[lead.salesRecommendedIndex].title;
  const chipStripIconUrls = [
    absImg(EARLY_ACCESS_CHIP_GIFT_MUTED),
    absImg(EARLY_ACCESS_CHIP_ROUTE_MUTED),
    absImg(EARLY_ACCESS_CHIP_CLOCK_MUTED),
  ] as const;
  const outcomeIconUrls = [
    absImg(OUTCOME_ICON_TREND),
    absImg(OUTCOME_ICON_HEADSET),
    absImg(OUTCOME_ICON_CHART),
  ] as const;
  const setupIconUrl = shopifyMarkUrl;

  const preheader = buildEarlyAccessPreheader(lead.storeName, storeCap);

  const chipStripHtml = buildEarlyAccessChipStripHtml(storeCap, chipStripIconUrls);
  const chipTrialFootnoteEsc = escapeHtml(buildEarlyAccessTrialUsageFootnotePlainText());
  const supportMockupHtml = buildSupportMockupSceneHtml(lead);
  const salesMockupHtml = buildSalesMockupSceneHtml(lead);

  const salesBenefitCardHtml = buildBenefitCardHtml(outcomeIconUrls[0], copy.salesMockupTitle, copy.salesMockupSubtitle, {
    titleAlign: "center",
    tiltDeg: BENEFIT_CARD_TILT_SALES_DEG,
  });
  const supportBenefitChipTextColor = BENEFIT_CARD_LANDING_TINT_FILL ? BIZMIS_MUTED_FG_HEX : BENEFIT_CARD_SUBTITLE_HEX;
  const supportChipsRowHtml = buildTripleIconTextChipRowHtml(
    buildSupportPairRowSvgs(BIZMIS_PRIMARY_HEX),
    [copy.supportPairInstant247, copy.supportPairProblemResolution, copy.supportPairEmotionalIntelligence],
    supportBenefitChipTextColor,
    "center",
  );
  const supportBenefitCardHtml = buildBenefitCardHtml(outcomeIconUrls[1], copy.supportMockupTitle, copy.supportMockupSubtitle, {
    titleAlign: "center",
    glowPreset: "column",
    tiltDeg: BENEFIT_CARD_TILT_SUPPORT_DEG,
    glowLayerScale: BENEFIT_CARD_GLOW_LAYER_SCALE_SUPPORT_AND_REPLAYS,
    chipsRowHtml: supportChipsRowHtml,
  });
  const insightsBenefitCardHtml = buildInsightsBenefitCardHtml(
    outcomeIconUrls[2],
    copy.insightsTitle,
    copy.insightsSubtitle,
    [copy.insightsPairSessionReplays, copy.insightsPairAutoTaggedChats, copy.insightsPairFunnelInsights],
    BENEFIT_CARD_TILT_INSIGHTS_DEG,
    BENEFIT_CARD_GLOW_LAYER_SCALE_SUPPORT_AND_REPLAYS,
  );
  const setupBenefitCardHtml = buildBenefitCardHtml(setupIconUrl, copy.setupTitle, copy.setupSubtitle, {
    titleAlign: "center",
    appearance: "plain",
  });

  const couponCodeEsc = escapeHtml(lead.couponCode.trim());

  const contactFirstName = earlyAccessGreetingFirstName(lead.leadContactName);
  const contactFirstEsc = contactFirstName ? escapeHtml(contactFirstName) : "";
  const accentInviteBizmis = `font-weight:600;color:${BIZMIS_PRIMARY_HEX};`;
  const accentInviteStore = `color:${storeNameColor};font-weight:600;`;
  const salutationParagraphInnerHtml = contactFirstName
    ? `${escapeHtml(copy.greetingDear)} ${contactFirstEsc},`
    : `${escapeHtml(copy.greetingDear)} ${store}${escapeHtml(copy.greetingStoreTeamSuffix)}`;
  const bizmisWordEsc = escapeHtml(copy.inviteSentenceBizmisWord);
  const valueBold = "font-weight:600;";
  const inviteLeadParagraphInnerHtml = `${escapeHtml(copy.inviteIntroBeforeBizmis)}<span style="${accentInviteBizmis}">${bizmisWordEsc}</span>${escapeHtml(copy.inviteIntroReachOutBeforeStore)}<span style="${accentInviteStore}">${store}</span>${escapeHtml(copy.inviteIntroReachOutAfterStore)}${escapeHtml(copy.inviteIntroProductPitch)}<strong style="${valueBold}">${escapeHtml(copy.inviteSentenceValueDriveSales)}</strong>${escapeHtml(copy.inviteSentenceValueJoiner)}<strong style="${valueBold}">${escapeHtml(copy.inviteSentenceValueEaseSupport)}</strong>.`;
  const ctaUrgencyParagraphInnerHtml = `${escapeHtml(copy.ctaUrgencyEaOpenBeforeCap)}${storeCap}${escapeHtml(copy.ctaUrgencyEaOpenAfterCapBeforeStore)}${store}${escapeHtml(copy.ctaUrgencyEaOpenAfterStoreName)}<strong style="${valueBold}">${escapeHtml(copy.ctaUrgencyEmphasis1)}</strong>${escapeHtml(copy.ctaUrgencyBetweenEmphasis1And2)}<strong style="${valueBold}">${store}${escapeHtml(copy.ctaUrgencyAfterStoreName)}</strong>${escapeHtml(copy.ctaUrgencyBetweenEmphasis2And3)}<strong style="${valueBold}">${escapeHtml(copy.ctaUrgencyEmphasis3)}</strong>${escapeHtml(copy.ctaUrgencyAfterEmphasis3)}`;

  const inviteTopGreetingStyle = `${BODY}font-size:11px;font-weight:400;line-height:1.6;color:${BIZMIS_MUTED_FG_HEX};letter-spacing:0.01em;`;
  const inviteTopLeadStyle = `${BODY}font-size:15px;font-weight:400;line-height:1.72;color:${BIZMIS_FOREGROUND_HEX};`;
  const inviteTopSupportStyle = `${BODY}font-size:11px;font-weight:400;line-height:1.72;color:${BIZMIS_MUTED_LIGHT_HEX};text-align:center;`;

  const inviteTopLeadMeasurePx = 440;
  const inviteTopSupportMeasurePx = 420;
  /** Vertical rhythm: greeting → lead → soft CTA → mockup (email-safe px). */
  const inviteTopPadAfterBannerPx = 34;
  const inviteTopPadAfterGreetingPx = 36;
  const inviteTopPadAfterLeadPx = 24;
  const inviteTopPadBeforeMockupPx = 48;

  const softCtaChipPhrases = buildEarlyAccessChips(storeCap);
  const softCtaAboveMockupPrimaryStyle = `${HEADING}font-size:14px;font-weight:600;color:${BIZMIS_PRIMARY_HEX};letter-spacing:-0.02em;line-height:1.35;text-decoration:none;`;
  /** Smaller than install chip row so three phrases fit one line in ~440px column. */
  const SOFT_CTA_CHIP_FONT_PX = 10;
  const SOFT_CTA_CHIP_ICON_PX = 10;
  const softCtaChipTextStyle = `${BODY}font-size:${SOFT_CTA_CHIP_FONT_PX}px;font-weight:400;line-height:1.35;letter-spacing:-0.01em;color:${BIZMIS_MUTED_LIGHT_HEX};`;
  const softCtaChipIconHtml = (iconUrl: string, phrase: string) =>
    `<img src="${iconUrl}" alt="" width="${SOFT_CTA_CHIP_ICON_PX}" height="${SOFT_CTA_CHIP_ICON_PX}" style="display:inline-block;vertical-align:-0.15em;width:${SOFT_CTA_CHIP_ICON_PX}px;height:${SOFT_CTA_CHIP_ICON_PX}px;margin:0 3px 0 0;border:0;" /><span style="${softCtaChipTextStyle}">${escapeHtml(phrase)}</span>`;
  const softCtaChipSep = `<span style="display:inline-block;margin:0 3px;color:${BIZMIS_MUTED_LIGHT_HEX};opacity:0.45;font-size:${SOFT_CTA_CHIP_FONT_PX}px;line-height:1.35;">·</span>`;
  const softCtaChipsInlineHtml = [
    softCtaChipIconHtml(chipStripIconUrls[0], softCtaChipPhrases[0]),
    softCtaChipIconHtml(chipStripIconUrls[1], softCtaChipPhrases[1]),
    softCtaChipIconHtml(chipStripIconUrls[2], softCtaChipPhrases[2]),
  ].join(softCtaChipSep);
  const softCtaInlineTaglineStyle = `${BODY}font-size:10px;font-weight:400;line-height:1.35;letter-spacing:-0.01em;color:${BIZMIS_MUTED_LIGHT_HEX};font-style:italic;`;
  const softCtaInlineTaglineHtml = `<span style="${softCtaInlineTaglineStyle}">${escapeHtml(copy.softCtaAboveMockupInlineTagline)}</span>`;
  const softCtaAboveMockupHtml = `<div style="border-left:3.5px solid ${BIZMIS_PRIMARY_HEX};padding:14px 16px 14px 16px;background-color:rgba(249,163,83,0.06);border-radius:0 8px 8px 0;">
  <p style="margin:0;text-align:left;"><a href="${shopifyAppUrl}" target="_blank" rel="noopener noreferrer" style="${softCtaAboveMockupPrimaryStyle}">${escapeHtml(copy.softCtaAboveMockupPrimaryLine)} \u2192</a>&nbsp;&nbsp;${softCtaInlineTaglineHtml}</p>
  <p style="margin:10px 0 0;text-align:left;line-height:1.35;white-space:nowrap;">${softCtaChipsInlineHtml}</p>
</div>`;

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
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

        <!-- Banner: full-width lead→Bizmis gradient + grain; inner table for logos (no ×) -->
        <tr>
          <td style="padding:0;">
            ${buildEmailInviteBannerHtml(lead)}
          </td>
        </tr>

        <!-- Salutation (small) -->
        <tr>
          <td style="padding:${inviteTopPadAfterBannerPx}px 32px 0 32px;">
            <p style="margin:0;${inviteTopGreetingStyle}">
              ${salutationParagraphInnerHtml}
            </p>
          </td>
        </tr>

        <!-- Invitation sentence (dominant, softened — not hero weight) -->
        <tr>
          <td style="padding:${inviteTopPadAfterGreetingPx}px 32px 0 32px;">
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

        <!-- Early access offer (scarcity, roadmap, call) -->
        <tr>
          <td style="padding:14px 32px 0 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:${inviteTopLeadMeasurePx}px;">
              <tr>
                <td style="padding:0;">
                  <p style="margin:0;${inviteTopLeadStyle}">
                    ${ctaUrgencyParagraphInnerHtml}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Bridge to mockup: quote rail + primary link + chip icons (same URL as install) -->
        <tr>
          <td style="padding:${inviteTopPadAfterLeadPx}px 32px 0 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:${inviteTopLeadMeasurePx}px;">
              <tr>
                <td style="padding:0;">
                  ${softCtaAboveMockupHtml}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Desktop frame + Boost Sales card overlay -->
        <tr>
          <td style="padding:${inviteTopPadBeforeMockupPx}px 20px 0 20px;">
            <!--[if !mso]><!--><div style="position:relative;"><!--<![endif]-->
            ${salesMockupHtml}

            <!--[if !mso]><!-->
            <div style="position:absolute;top:-16px;right:-24px;z-index:10;width:${BOOST_SALES_BENEFIT_CARD_OVERLAY_WIDTH_PX}px;">
              ${salesBenefitCardHtml}
            </div>
            </div>
            <!--<![endif]-->
          </td>
        </tr>

        <!-- Benefits 2 & 3: Card column (Support + Insights) | Phone mockup -->
        <tr>
          <td style="padding:28px 20px 0 20px;">
            <!--[if !mso]><!-->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;margin:0 auto;">
              <tr>
                <td valign="middle" style="vertical-align:middle;padding:0 12px 0 0;width:50%;">
                  ${supportBenefitCardHtml}
                  <div style="height:${BENEFIT_CARD_SUPPORT_TO_INSIGHTS_GAP_PX}px;font-size:0;line-height:0;">&nbsp;</div>
                  ${insightsBenefitCardHtml}
                </td>
                <td valign="middle" align="center" style="vertical-align:middle;padding:0;">
                  ${supportMockupHtml}
                </td>
              </tr>
            </table>
            <!--<![endif]-->
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="520" align="center">
              <tr>
                <td valign="top" width="200" style="padding:0 12px 0 0;">
                  <p style="margin:0;${HEADING}font-size:13px;font-weight:800;color:${BIZMIS_FOREGROUND_HEX};">${escapeHtml(copy.supportMockupTitle)}</p>
                  <p style="margin:8px 0 0;${BODY}font-size:10px;color:${BIZMIS_MUTED_FG_HEX};line-height:${BENEFIT_CARD_SUBTITLE_LINE_HEIGHT};letter-spacing:${BENEFIT_CARD_SUBTITLE_LETTER_SPACING_EM}em;">${escapeHtml(copy.supportMockupSubtitle)}</p>
                  <p style="margin:${INSIGHTS_CHIPS_MARGIN_TOP_PX}px 0 0;${BODY}font-size:${INSIGHTS_PAIR_ROW_FONT_PX}px;color:${BIZMIS_MUTED_FG_HEX};line-height:${INSIGHTS_CHIPS_LINE_HEIGHT};text-align:center;">${escapeHtml(copy.supportPairInstant247)} · ${escapeHtml(copy.supportPairProblemResolution)} · ${escapeHtml(copy.supportPairEmotionalIntelligence)}</p>
                  <br/>
                  <p style="margin:0;${HEADING}font-size:13px;font-weight:800;color:${BIZMIS_FOREGROUND_HEX};">${escapeHtml(copy.insightsTitle)}</p>
                  <p style="margin:8px 0 0;${BODY}font-size:10px;color:${BIZMIS_MUTED_FG_HEX};line-height:${BENEFIT_CARD_SUBTITLE_LINE_HEIGHT};letter-spacing:${BENEFIT_CARD_SUBTITLE_LETTER_SPACING_EM}em;">${escapeHtml(copy.insightsSubtitle)}</p>
                  <p style="margin:${INSIGHTS_CHIPS_MARGIN_TOP_PX}px 0 0;${BODY}font-size:8px;color:${BIZMIS_MUTED_FG_HEX};line-height:${INSIGHTS_CHIPS_LINE_HEIGHT};text-align:center;">${escapeHtml(copy.insightsPairSessionReplays)} · ${escapeHtml(copy.insightsPairAutoTaggedChats)} · ${escapeHtml(copy.insightsPairFunnelInsights)}</p>
                </td>
                <td valign="middle" align="center" width="320">
                </td>
              </tr>
            </table>
            <![endif]-->
          </td>
        </tr>

        <!-- Plug and Play: title + sync footer in one primary-bordered block -->
        <tr>
          <td style="padding:28px 20px 0 20px;">
            <!--[if !mso]><!-->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;margin:0 auto;border:${SETUP_PLUG_PLAY_BORDER_PX}px solid ${BIZMIS_PRIMARY_HEX};border-radius:14px;border-collapse:separate;background-color:transparent;">
              <tr>
                <td style="padding:0;">
                  ${setupBenefitCardHtml}
                </td>
              </tr>
              <tr>
                <td style="padding:0 4px 14px 4px;">
                  ${buildSetupPlugPlayFooterNonMsoHtml(bizmisLogoUrl)}
                </td>
              </tr>
            </table>
            <!--<![endif]-->
            <!--[if mso]>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="520" align="center" style="border:${SETUP_PLUG_PLAY_BORDER_PX}px solid ${BIZMIS_PRIMARY_HEX};border-collapse:collapse;">
              <tr>
                <td valign="top" width="520" style="padding:12px 16px 0 16px;background-color:transparent;">
                  <p style="margin:0;${HEADING}font-size:${BENEFIT_CARD_GLOW_TITLE_FONT_PX}px;font-weight:800;color:${BIZMIS_FOREGROUND_HEX};text-align:center;">${escapeHtml(copy.setupTitle)}</p>
                  <p style="margin:8px 0 0;${BODY}font-size:${BENEFIT_CARD_GLOW_SUBTITLE_FONT_PX}px;color:${BIZMIS_MUTED_FG_HEX};line-height:${BENEFIT_CARD_SUBTITLE_LINE_HEIGHT};letter-spacing:${BENEFIT_CARD_SUBTITLE_LETTER_SPACING_EM}em;text-align:center;">${escapeHtml(copy.setupSubtitle)}</p>
                </td>
              </tr>
              <tr>
                <td width="520" style="padding:0 4px 12px 4px;background-color:transparent;">
                  ${buildSetupPlugPlayFooterMsoInnerHtml(bizmisLogoUrl)}
                </td>
              </tr>
            </table>
            <![endif]-->
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
                <td style="padding:24px 28px 10px 28px;" align="center">
                  <p style="margin:0;${BODY}font-size:10px;font-weight:600;line-height:1.4;color:${BIZMIS_MUTED_FG_HEX};letter-spacing:0.14em;text-transform:uppercase;">${escapeHtml(copy.ctaScheduleKicker)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 28px 20px 28px;" align="center">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td style="padding:0;border-radius:12px;overflow:hidden;">
                        <a href="${bookCallUrl}" target="_blank" rel="noopener noreferrer" style="display:block;padding:14px 36px;text-align:center;text-decoration:none;color:${BIZMIS_FOREGROUND_HEX};background-color:${BIZMIS_PRIMARY_HEX};border-radius:12px;box-shadow:0 2px 8px -2px rgba(249,163,83,0.35);-webkit-text-size-adjust:none;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                            <tr valign="middle" align="center">
                              <td width="${CALENDAR_ICON_SIZE_PX}" height="${CTA_BUTTON_INNER_LINE_HEIGHT_PX}" style="padding:0 10px 0 0;width:${CALENDAR_ICON_SIZE_PX}px;height:${CTA_BUTTON_INNER_LINE_HEIGHT_PX}px;vertical-align:middle;line-height:${CTA_BUTTON_INNER_LINE_HEIGHT_PX}px;mso-line-height-rule:exactly;font-size:0;" aria-hidden="true" valign="middle">
                                <img src="${escapeHtml(CALENDAR_ICON_DATA_URI)}" alt="" width="${CALENDAR_ICON_SIZE_PX}" height="${CALENDAR_ICON_SIZE_PX}" style="display:block;width:${CALENDAR_ICON_SIZE_PX}px;height:${CALENDAR_ICON_SIZE_PX}px;border:0;margin:0;" />
                              </td>
                              <td style="padding:0;vertical-align:middle;${HEADING}font-size:13px;font-weight:600;line-height:${CTA_BUTTON_INNER_LINE_HEIGHT_PX}px;mso-line-height-rule:exactly;color:${BIZMIS_FOREGROUND_HEX};white-space:nowrap;" valign="middle">
                                ${escapeHtml(copy.ctaPrimaryButtonLabel)}
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
                <td style="padding:0 28px 6px 28px;" align="center">
                  <a href="${installUrlWithCode}" target="_blank" rel="noopener noreferrer" style="${BODY}font-size:11px;font-weight:500;color:${BIZMIS_MUTED_FG_HEX};text-decoration:underline;">
                    ${escapeHtml(copy.ctaSecondaryInstallLinkLabel)}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding:0 28px 20px 28px;" align="center">
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
                <td style="padding:0 12px 20px 12px;text-align:center;line-height:1.45;">
                  ${chipStripHtml}
                </td>
              </tr>
            </table>
            <p style="margin:10px 0 0 0;${BODY}font-size:8px;line-height:1.4;color:${BIZMIS_MUTED_LIGHT_HEX};text-align:center;">${chipTrialFootnoteEsc}</p>
          </td>
        </tr>

        <!-- Signature -->
        <tr>
          <td style="padding:28px 40px ${SIGNATURE_BEFORE_FOOTER_GAP_PX}px 40px;">
            <p style="margin:0;${BODY}font-size:14px;line-height:1.5;color:${BIZMIS_FOREGROUND_HEX};">${escapeHtml(copy.signatureClosing)}</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:${SIGNATURE_AFTER_CLOSING_GAP_PX}px 0 0 0;">
              <tr>
                <td valign="middle" style="padding:0 ${SIGNATURE_LOGO_TEXT_GAP_PX}px 0 0;vertical-align:middle;">
                  <a href="${bizmisInviteHrefEsc}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;border:0;line-height:0;font-size:0;">
                    <img src="${absImg(BIZMIS_LOGO_ORANGE_WHITE)}" alt="Bizmis" width="${SIGNATURE_BIZMIS_LOGO_PX}" height="${SIGNATURE_BIZMIS_LOGO_PX}" style="display:block;width:${SIGNATURE_BIZMIS_LOGO_PX}px;height:${SIGNATURE_BIZMIS_LOGO_PX}px;border:0;" />
                  </a>
                </td>
                <td valign="top" style="padding:0;vertical-align:top;">
                  <p style="margin:0;${BODY}font-size:15px;font-weight:600;line-height:1.4;color:${BIZMIS_FOREGROUND_HEX};">${escapeHtml(copy.signatureName)}</p>
                  <p style="margin:2px 0 0 0;${BODY}font-size:13px;line-height:1.5;color:${BIZMIS_MUTED_FG_HEX};">${escapeHtml(copy.signatureRoleBeforeBizmis)}<span style="color:${BIZMIS_PRIMARY_HEX};font-weight:600;">${escapeHtml(copy.signatureRoleBizmisWord)}</span></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer (proof + contact + link) -->
        <tr>
          <td style="padding:${RICH_FOOTER_SEPARATOR_ROW_TOP_PAD_PX}px 48px 0 48px;">
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
            <a href="${bizmisInviteHrefEsc}" target="_blank" style="${BODY}font-size:10px;font-weight:500;color:${BIZMIS_MUTED_FG_HEX};text-decoration:none;">
              bizmis.ai
            </a>
            <span style="${BODY}font-size:10px;color:${BIZMIS_MUTED_LIGHT_HEX};">&nbsp;&middot;&nbsp;</span>
            <a href="${INSTANTLY_UNSUBSCRIBE_MERGE_TAG}" style="${BODY}font-size:10px;font-weight:400;color:${BIZMIS_MUTED_FG_HEX};text-decoration:underline;">${escapeHtml(INVITE_UNSUBSCRIBE_LABEL)}</a>
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
  const montagePlainLine = montageSalesCueSingleLine(
    lead.montageClerkCue?.trim() || buildMontageClerkCuePlainText(recProductTitle),
  );

  const plainText = [
    buildEarlyAccessSalutationPlainText(lead.storeName, lead.leadContactName),
    "",
    buildInviteLeadParagraphPlainText(lead.storeName),
    "",
    buildSoftCtaPlainText(shopifyAppUrl, storeCap),
    "",
    montagePlainLine,
    "",
    copy.subline,
    "",
    `${copy.couponLabel} ${lead.couponCode.trim()}`,
    `${copy.ctaPrimaryButtonLabel}: ${bookCallUrl}`,
    `${copy.ctaSecondaryInstallLinkLabel}: ${installUrlWithCode}`,
    "",
    ...chipPlainLines,
    "",
    buildEarlyAccessTrialUsageFootnotePlainText(),
    "",
    copy.proofLine,
    "",
    copy.signatureClosing,
    "",
    copy.signatureName,
    `${copy.signatureRoleBeforeBizmis}${copy.signatureRoleBizmisWord}`,
    "",
    buildEarlyAccessFooterPlainText(),
    `${copy.visitUsPrefix} ${bizmisInviteSiteUrl}`,
    `${INVITE_UNSUBSCRIBE_LABEL}: ${INSTANTLY_UNSUBSCRIBE_MERGE_TAG}`,
  ].join("\n");

  return { html, plainText };
}

export function copyLeadEarlyAccessHtmlSource(lead: LeadEarlyAccessData): Promise<void> {
  const { html } = buildLeadEarlyAccessEmailHtml(lead);
  return navigator.clipboard.writeText(html);
}
