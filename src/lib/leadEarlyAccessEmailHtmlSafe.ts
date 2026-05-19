/**
 * Gmail-safe early access invite email builder.
 *
 * Produces minimal table-based HTML + plain-text sibling for cold email sends.
 * Layout is intentionally stripped down to: "EARLY ACCESS INVITE" eyebrow →
 * salutation → pitch paragraph → combined storefront + support mockup →
 * single install CTA → footer. The visual sits in one hosted PNG generated
 * by `scripts/generate-email-compositions.mjs` (phone overlapping the
 * desktop's top-right on a transparent background); the rest is real text
 * in <table> / <td> with inline styles so it survives Gmail's HTML
 * sanitizer without layout breakage.
 *
 * Hard rules enforced at build time (see `assertEmailSafe`):
 *  - No <script>, <form>, <svg>, <style> (outside MSO conditionals), class=
 *  - No CSS properties Gmail strips (position, transform, mask-image, etc.)
 *  - Total HTML weight must stay under Gmail's ~102 KB clip threshold.
 *
 * This is intentionally a parallel, separate builder from
 * `leadEarlyAccessEmailHtml.ts`. The rich one stays as the admin preview and
 * web view; this one is what actually gets copy-pasted into Instantly.
 */

import type { LeadEarlyAccessData } from "@/data/leads/_schema";
import {
  EARLY_ACCESS_EMAIL_COPY,
  buildCtaUrgencyPlainText,
  buildEarlyAccessPreheader,
  buildEarlyAccessSalutationPlainText,
  buildInviteLeadParagraphPlainText,
  earlyAccessGreetingFirstName,
} from "@/data/leadEarlyAccessCopy";
import { EARLY_ACCESS_TERMS, resolveStoreNameTextColor } from "@/data/leads/_schema";
import {
  BIZMIS_BORDER_HEX,
  BIZMIS_MUTED_FG_HEX,
  BIZMIS_PRIMARY_HEX,
  BIZMIS_WARM_BG_HEX,
} from "@/lib/bizmisBrandColors";
import { buildReactIconSvgDataUri } from "@/lib/reactIconDataUri";
import { FaRegCalendarAlt } from "react-icons/fa";

export const SAFE_EMAIL_DEFAULT_BASE_URL = "https://www.bizmis.ai" as const;
export const SAFE_EMAIL_MAX_BYTES = 102_000;
export const SAFE_EMAIL_WARN_BYTES = 60_000;

/**
 * Instantly merge tag for the per-send unsubscribe URL. At send time Instantly
 * replaces this literal with a tracked unsubscribe link and attaches the
 * `List-Unsubscribe` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
 * SMTP headers (which is what mail-tester is checking for).
 *
 * Kept outside `EARLY_ACCESS_EMAIL_COPY` because it is sending-tool
 * infrastructure, not copy — the literal string must survive the template
 * unescaped so Instantly can find and replace it.
 */
export const INSTANTLY_UNSUBSCRIBE_MERGE_TAG = "{{unsubscribe}}" as const;

/** Visible label shown next to the unsubscribe link in the email footer. */
export const INVITE_UNSUBSCRIBE_LABEL = "Unsubscribe" as const;

/**
 * Public marketing site URL for outbound invites, tagged with the lead id.
 * Uses `ref` so it matches the Shopify install CTA query shape in the same email.
 */
export function buildInviteBizmisSiteUrl(leadId: string): string {
  const trimmed = leadId.trim();
  const params = new URLSearchParams();
  if (trimmed.length > 0) params.set("ref", trimmed);
  const qs = params.toString();
  return qs.length > 0 ? `${SAFE_EMAIL_DEFAULT_BASE_URL}?${qs}` : `${SAFE_EMAIL_DEFAULT_BASE_URL}`;
}

const CARD_MAX_WIDTH_PX = 600;
/**
 * Display dimensions for the combined mockup PNG (phone overlapping the
 * desktop mockup's top-right, with the rich invite banner baked in as a
 * backdrop behind both) produced by
 * `scripts/generate-email-compositions.mjs`. The image stretches
 * edge-to-edge across the card's content area (no horizontal padding
 * on the row), so its display width equals CARD_MAX_WIDTH_PX. The
 * height is kept proportional to the PNG's intrinsic aspect ratio.
 */
const COMBINED_MOCKUP_DISPLAY_WIDTH_PX = CARD_MAX_WIDTH_PX;
const COMBINED_MOCKUP_INTRINSIC_WIDTH_PX = 844;
const COMBINED_MOCKUP_INTRINSIC_HEIGHT_PX = 650;
const COMBINED_MOCKUP_DISPLAY_HEIGHT_PX = Math.round(
  (COMBINED_MOCKUP_DISPLAY_WIDTH_PX * COMBINED_MOCKUP_INTRINSIC_HEIGHT_PX) /
    COMBINED_MOCKUP_INTRINSIC_WIDTH_PX,
);

const FOREGROUND_HEX = "#32281B";
const MUTED_LIGHT_HEX = "#B5A48E";
const MUTED_SUBTLE_HEX = "#C8BBA4";
const CALENDAR_ICON_SIZE_PX = 18;
const CTA_BUTTON_INNER_LINE_HEIGHT_PX = CALENDAR_ICON_SIZE_PX;
const CALENDAR_ICON_DATA_URI = buildReactIconSvgDataUri(
  FaRegCalendarAlt,
  FOREGROUND_HEX,
  CALENDAR_ICON_SIZE_PX,
);
/** Orange-on-white Bizmis square mark used as the signature logo (public asset, 281x281). */
const SIGNATURE_BIZMIS_LOGO_PATH = "/images/bizmis-logo-orange-white.png";
/** Display size in logical CSS px (keeps square 1:1 aspect ratio). */
const SIGNATURE_BIZMIS_LOGO_DISPLAY_PX = 44;
const SIGNATURE_LOGO_TEXT_GAP_PX = 14;
/** Vertical gap between "Cheers," and the logo + name row. */
const SIGNATURE_AFTER_CLOSING_GAP_PX = 24;
/**
 * Space below the signature block before the footer border. On the
 * Gmail-safe card the rule sits on the next row, so this bottom padding
 * is the only lever for signature-to-line air (footer padding-top is
 * below the rule, not above it).
 */
const SIGNATURE_BEFORE_FOOTER_GAP_PX = 44;

const SYSTEM_FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,Helvetica,sans-serif";

const LINK_SUCCESS_GREEN_HEX = "#108849";

/**
 * Static UTM values baked into the Gmail-safe template. The cold-email
 * path is identified channel-wide by `utm_source=bizmis-cold-email` +
 * `utm_medium=email`; per-batch segmentation happens via `utm_campaign`
 * (see `BuildSafeEmailOptions.utmCampaign`), and per-recipient tagging
 * via `utm_content=<lead_handle>`.
 */
export const SAFE_EMAIL_UTM_SOURCE = "bizmis-cold-email" as const;
export const SAFE_EMAIL_UTM_MEDIUM = "email" as const;
export const SAFE_EMAIL_DEFAULT_UTM_CAMPAIGN = "early-access" as const;

export type BuildSafeEmailOptions = {
  /**
   * Base URL used for absolute image src values. Leave empty ("") to emit
   * relative URLs (admin iframe preview against the dev server). Pass the
   * production origin (default "https://www.bizmis.ai") for outbound copy.
   */
  baseUrl?: string;
  /**
   * Value for the `utm_campaign` query parameter appended to every
   * outbound link. For Instantly sends, pass the campaign placeholder
   * token — see `scripts/generate-instantly-template.mjs`, which swaps
   * it for the `{{utm_campaign}}` merge tag so per-batch campaign names
   * can be set from the Instantly CSV.
   */
  utmCampaign?: string;
};

export type SafeEmailBuildResult = {
  html: string;
  plainText: string;
  htmlSizeBytes: number;
  warnings: string[];
};

// Public API.

export function buildLeadEarlyAccessEmailHtmlSafe(
  lead: LeadEarlyAccessData,
  options: BuildSafeEmailOptions = {},
): SafeEmailBuildResult {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const utmCampaign = options.utmCampaign?.trim() || SAFE_EMAIL_DEFAULT_UTM_CAMPAIGN;
  const html = renderSafeHtml(lead, baseUrl, utmCampaign);
  const htmlSizeBytes = new TextEncoder().encode(html).byteLength;
  const warnings = assertEmailSafe(html, htmlSizeBytes);
  const plainText = renderPlainText(lead, utmCampaign);
  return { html, plainText, htmlSizeBytes, warnings };
}

export async function copyLeadEarlyAccessSafeHtmlSource(
  lead: LeadEarlyAccessData,
): Promise<void> {
  const { html } = buildLeadEarlyAccessEmailHtmlSafe(lead, {
    baseUrl: SAFE_EMAIL_DEFAULT_BASE_URL,
  });
  await navigator.clipboard.writeText(html);
}

// Base URL handling.

function normalizeBaseUrl(raw: string | undefined): string {
  if (raw === undefined) return SAFE_EMAIL_DEFAULT_BASE_URL;
  if (raw === "") return "";
  return raw.replace(/\/$/, "");
}

function absUrl(baseUrl: string, publicPath: string): string {
  const safePath = publicPath.startsWith("/") ? publicPath : `/${publicPath}`;
  return `${baseUrl}${safePath}`;
}

/**
 * Builds the `utm_source=...&utm_medium=...&utm_campaign=...&utm_content=...`
 * query string appended to every outbound link in the cold-email template.
 *
 * `leadId` is passed raw: URLSearchParams handles percent-encoding
 * consistently. Synthetic placeholders in the Instantly pipeline are
 * deliberately alphanumeric so they survive encoding untouched — the
 * generator script then swaps them for merge tags.
 */
function buildOutboundUtmTail(leadId: string, utmCampaign: string): string {
  const params = new URLSearchParams({
    utm_source: SAFE_EMAIL_UTM_SOURCE,
    utm_medium: SAFE_EMAIL_UTM_MEDIUM,
    utm_campaign: utmCampaign,
    utm_content: leadId,
  });
  return params.toString();
}

// HTML rendering.

function renderSafeHtml(lead: LeadEarlyAccessData, baseUrl: string, utmCampaign: string): string {
  const { storeCap, shopifyAppUrl, bookACallUrl } = EARLY_ACCESS_TERMS;
  const copy = EARLY_ACCESS_EMAIL_COPY;

  const storeName = escapeHtml(lead.storeName);
  const storeAccent = resolveStoreAccentForEmail(lead);
  const leadHandle = encodeURIComponent(lead.id);
  const earlyAccessCode = lead.couponCode;
  const topProductTitle = lead.salesProducts[lead.salesRecommendedIndex].title;

  const combinedMockupUrl = absUrl(baseUrl, `/invite-cards/leads/${lead.id}/email/mockup.png`);

  const utmTail = buildOutboundUtmTail(lead.id, utmCampaign);
  const bookCallUrl = `${bookACallUrl}?ref=${leadHandle}&${utmTail}`;
  const installUrlWithCode = `${shopifyAppUrl}?ref=${leadHandle}&code=${encodeURIComponent(earlyAccessCode)}&${utmTail}`;
  const bizmisInviteSiteUrl = `${buildInviteBizmisSiteUrl(lead.id)}&${utmTail}`;

  const salutationText = escapeHtml(buildEarlyAccessSalutationPlainText(lead.storeName, lead.leadContactName));

  const pitchHtml = buildPitchParagraphHtml();
  const ctaUrgencyHtml = buildCtaUrgencyHtml(storeName, storeCap);
  const ctaBoxHtml = buildCtaBoxHtml(bookCallUrl, installUrlWithCode, earlyAccessCode);

  const preheader = escapeHtml(buildEarlyAccessPreheader(lead.storeName, storeCap));

  const combinedImageHtml = buildCenteredImage({
    src: combinedMockupUrl,
    alt: `Mockup of Bizmis on the ${lead.storeName} Shopify storefront`,
    widthPx: COMBINED_MOCKUP_DISPLAY_WIDTH_PX,
    heightPx: COMBINED_MOCKUP_DISPLAY_HEIGHT_PX,
    borderRadiusPx: 0,
    fullWidth: true,
  });

  const titleHtml = buildEarlyAccessTitleHtml(storeName, storeAccent, bizmisInviteSiteUrl);
  const signatureHtml = buildSignatureHtml(baseUrl, bizmisInviteSiteUrl);

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(copy.emailDocumentTitle)}</title>
<!--[if mso]>
<style>table,td{font-family:Arial,sans-serif !important;} a{text-decoration:none;}</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BIZMIS_WARM_BG_HEX};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
${preheader}
</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BIZMIS_WARM_BG_HEX};">
<tr>
<td align="center" style="padding:28px 16px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${CARD_MAX_WIDTH_PX}" style="max-width:${CARD_MAX_WIDTH_PX}px;width:100%;background-color:#ffffff;border:1px solid ${BIZMIS_BORDER_HEX};border-radius:16px;overflow:hidden;">

<tr>
<td style="padding:36px 32px 0 32px;" align="center">
${titleHtml}
</td>
</tr>

<tr>
<td style="padding:38px 32px 0 32px;">
<p style="margin:0;font-family:${SYSTEM_FONT_STACK};font-size:11px;line-height:1.6;color:${BIZMIS_MUTED_FG_HEX};letter-spacing:0.01em;">
${salutationText}
</p>
</td>
</tr>

<tr>
<td style="padding:14px 32px 0 32px;">
${pitchHtml}
</td>
</tr>

<tr>
<td style="padding:14px 32px 0 32px;">
${ctaUrgencyHtml}
</td>
</tr>

<tr>
<td style="padding:24px 32px 0 32px;" align="center">
${ctaBoxHtml}
</td>
</tr>

<tr>
<td style="padding:28px 0 4px 0;line-height:0;font-size:0;" align="center">
${combinedImageHtml}
</td>
</tr>

<tr>
<td style="padding:24px 32px ${SIGNATURE_BEFORE_FOOTER_GAP_PX}px 32px;">
${signatureHtml}
</td>
</tr>

<tr>
<td style="padding:28px 40px 32px 40px;text-align:center;border-top:1px solid #EBE6DF;">
<p style="margin:0 0 10px 0;font-family:${SYSTEM_FONT_STACK};font-size:10px;line-height:1.55;color:${MUTED_LIGHT_HEX};">
Questions? Just reply to this email (<a href="mailto:${escapeHtml(copy.contactEmail)}" style="color:${BIZMIS_MUTED_FG_HEX};text-decoration:none;">${escapeHtml(copy.contactEmail)}</a>).
</p>
<a href="${escapeAttr(bizmisInviteSiteUrl)}" target="_blank" rel="noopener noreferrer" style="font-family:${SYSTEM_FONT_STACK};font-size:10px;font-weight:500;color:${BIZMIS_MUTED_FG_HEX};text-decoration:none;">bizmis.ai</a>
<span style="font-family:${SYSTEM_FONT_STACK};font-size:10px;color:${MUTED_LIGHT_HEX};">&nbsp;&middot;&nbsp;</span>
<a href="${INSTANTLY_UNSUBSCRIBE_MERGE_TAG}" style="font-family:${SYSTEM_FONT_STACK};font-size:10px;font-weight:400;color:${BIZMIS_MUTED_FG_HEX};text-decoration:underline;">${escapeHtml(INVITE_UNSUBSCRIBE_LABEL)}</a>
</td>
</tr>

</table>
</td>
</tr>
</table>

</body>
</html>`;
}

/**
 * Inline early-access invite heading:
 *
 *   `{StoreName} × bizmis · Early Access Invite`
 *
 * All three segments sit on a single centered line: the store name in
 * the lead's resolved accent, `bizmis` in Bizmis primary (linked to the
 * marketing site with `ref=<lead id>`), and the eyebrow in the same subtle tone
 * as the × / · separators. Wraps naturally if the store
 * name is long enough to exceed the card's content width.
 */
function buildEarlyAccessTitleHtml(
  storeName: string,
  storeAccent: string,
  bizmisInviteSiteUrl: string,
): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  const baseTextStyle =
    `font-family:${SYSTEM_FONT_STACK};font-size:22px;font-weight:700;line-height:1.3;letter-spacing:-0.005em;`;
  const separatorStyle = `${baseTextStyle}font-weight:400;color:${MUTED_SUBTLE_HEX};`;
  const eyebrowStyle =
    `font-family:${SYSTEM_FONT_STACK};font-size:14px;font-weight:600;line-height:1.3;letter-spacing:0.2em;text-transform:uppercase;color:${MUTED_SUBTLE_HEX};vertical-align:0.08em;`;
  return `<p style="margin:0;text-align:center;${baseTextStyle}">
<span style="color:${storeAccent};">${storeName}</span>
<span style="${separatorStyle}">&nbsp;${escapeHtml(c.inviteTitleBrandLeadSeparator)}&nbsp;</span>
<a href="${escapeAttr(bizmisInviteSiteUrl)}" target="_blank" rel="noopener noreferrer" style="${baseTextStyle}color:${BIZMIS_PRIMARY_HEX};text-decoration:none;">${escapeHtml(c.inviteTitleBrandLead)}</a>
<span style="${separatorStyle}">&nbsp;${escapeHtml(c.inviteTitleEyebrowSeparator)}&nbsp;</span>
<span style="${eyebrowStyle}">${escapeHtml(c.inviteTitleEyebrow)}</span>
</p>`;
}

// HTML fragment helpers.

type CenteredImageSpec = {
  src: string;
  alt: string;
  widthPx: number;
  heightPx: number;
  borderRadiusPx: number;
  fullWidth: boolean;
};

function buildCenteredImage(spec: CenteredImageSpec): string {
  const widthAttr = spec.fullWidth
    ? `width:100%;max-width:${spec.widthPx}px;height:auto;`
    : `max-width:${spec.widthPx}px;height:auto;margin:0 auto;`;
  return `<img src="${escapeAttr(spec.src)}" alt="${escapeAttr(spec.alt)}" width="${spec.widthPx}" height="${spec.heightPx}" style="display:block;${widthAttr}border:0;border-radius:${spec.borderRadiusPx}px;" />`;
}

function buildPitchParagraphHtml(): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  const fgStyle = `font-family:${SYSTEM_FONT_STACK};font-size:15px;line-height:1.72;color:${FOREGROUND_HEX};`;
  return `<p style="margin:0;${fgStyle}">
${escapeHtml(c.inviteIntroBeforeBizmis)}${escapeHtml(c.inviteSentenceBizmisWord)}${escapeHtml(c.inviteIntroAfterBizmis)}<strong style="font-weight:600;">${escapeHtml(c.inviteSentenceValueDriveSales)}</strong>${escapeHtml(c.inviteSentenceValueJoiner)}<strong style="font-weight:600;">${escapeHtml(c.inviteSentenceValueEaseSupport)}</strong>.
</p>`;
}

/**
 * Second body paragraph, rendered right under the pitch paragraph with
 * matching typography (15px / 1.72 foreground) so it reads as a natural
 * continuation rather than a separate tagline. Key phrases bump to 600
 * weight; Bizmis stays in body color (same rule as the pitch paragraph
 * in the Gmail-safe card).
 */
function buildCtaUrgencyHtml(storeName: string, storeCap: number): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  const fgStyle = `font-family:${SYSTEM_FONT_STACK};font-size:15px;line-height:1.72;color:${FOREGROUND_HEX};`;
  const emphasis = "font-weight:600;";
  return `<p style="margin:0;${fgStyle}">
${escapeHtml(c.ctaUrgencyEaOpenBeforeCap)}${storeCap}${escapeHtml(c.ctaUrgencyEaOpenAfterCapBeforeStore)}${escapeHtml(storeName)}${escapeHtml(c.ctaUrgencyEaOpenAfterStoreName)}<strong style="${emphasis}">${escapeHtml(c.ctaUrgencyEmphasis1)}</strong>${escapeHtml(c.ctaUrgencyBetweenEmphasis1And2)}<strong style="${emphasis}">${escapeHtml(storeName)}${escapeHtml(c.ctaUrgencyAfterStoreName)}</strong>${escapeHtml(c.ctaUrgencyBetweenEmphasis2And3)}<strong style="${emphasis}">${escapeHtml(c.ctaUrgencyEmphasis3)}</strong>${escapeHtml(c.ctaUrgencyAfterEmphasis3)}
</p>`;
}

function buildCtaBoxHtml(
  bookCallUrl: string,
  installUrlWithCode: string,
  earlyAccessCode: string,
): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  const kickerStyle = `margin:0;font-family:${SYSTEM_FONT_STACK};font-size:10px;font-weight:600;line-height:1.4;color:${BIZMIS_MUTED_FG_HEX};letter-spacing:0.14em;text-transform:uppercase;`;
  const primaryLinkStyle = `display:inline-block;padding:14px 28px;font-family:${SYSTEM_FONT_STACK};font-size:13px;font-weight:600;color:${FOREGROUND_HEX};text-decoration:none;border-radius:12px;`;
  const secondaryLinkStyle = `font-family:${SYSTEM_FONT_STACK};font-size:11px;font-weight:500;color:${BIZMIS_MUTED_FG_HEX};text-decoration:underline;`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px dashed ${BIZMIS_BORDER_HEX};border-radius:14px;">
<tr>
<td style="padding:22px 28px 10px 28px;" align="center">
<p style="${kickerStyle}">${escapeHtml(c.ctaScheduleKicker)}</p>
</td>
</tr>
<tr>
<td style="padding:0 28px 20px 28px;" align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
<tr>
<td align="center" bgcolor="${BIZMIS_PRIMARY_HEX}" style="border-radius:12px;">
<a href="${escapeAttr(bookCallUrl)}" target="_blank" rel="noopener noreferrer" style="${primaryLinkStyle}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
<tr valign="middle" align="center">
<td width="${CALENDAR_ICON_SIZE_PX}" height="${CTA_BUTTON_INNER_LINE_HEIGHT_PX}" style="padding:0 10px 0 0;width:${CALENDAR_ICON_SIZE_PX}px;height:${CTA_BUTTON_INNER_LINE_HEIGHT_PX}px;vertical-align:middle;line-height:${CTA_BUTTON_INNER_LINE_HEIGHT_PX}px;mso-line-height-rule:exactly;font-size:0;" aria-hidden="true" valign="middle">
<img src="${escapeAttr(CALENDAR_ICON_DATA_URI)}" alt="" width="${CALENDAR_ICON_SIZE_PX}" height="${CALENDAR_ICON_SIZE_PX}" style="display:block;width:${CALENDAR_ICON_SIZE_PX}px;height:${CALENDAR_ICON_SIZE_PX}px;border:0;margin:0;" />
</td>
<td style="padding:0;vertical-align:middle;font-family:${SYSTEM_FONT_STACK};font-size:13px;font-weight:600;line-height:${CTA_BUTTON_INNER_LINE_HEIGHT_PX}px;mso-line-height-rule:exactly;color:${FOREGROUND_HEX};white-space:nowrap;" valign="middle">${escapeHtml(c.ctaPrimaryButtonLabel)}</td>
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
<a href="${escapeAttr(installUrlWithCode)}" target="_blank" rel="noopener noreferrer" style="${secondaryLinkStyle}">
${escapeHtml(c.ctaSecondaryInstallLinkLabel)}
</a>
</td>
</tr>
<tr>
<td style="padding:0 28px 20px 28px;" align="center">
<p style="margin:0;font-family:${SYSTEM_FONT_STACK};font-size:9px;color:${MUTED_LIGHT_HEX};letter-spacing:0.02em;">
${escapeHtml(c.couponLabel)}
<span style="color:${BIZMIS_MUTED_FG_HEX};font-size:10px;letter-spacing:0.04em;">&nbsp;${escapeHtml(earlyAccessCode)}</span>
</p>
</td>
</tr>
</table>`;
}

/**
 * Signature under the mockup: "Cheers," on its own line, then a row with
 * the orange Bizmis mark on the left (link + `?ref=<lead id>`), vertically
 * centered against only the name + founder lines on the right (not
 * aligned with Cheers). Table layout for email clients (no flexbox).
 */
function buildSignatureHtml(baseUrl: string, bizmisInviteSiteUrl: string): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  const logoUrl = absUrl(baseUrl, SIGNATURE_BIZMIS_LOGO_PATH);
  const closingStyle = `font-family:${SYSTEM_FONT_STACK};font-size:14px;line-height:1.5;color:${FOREGROUND_HEX};`;
  const nameStyle = `font-family:${SYSTEM_FONT_STACK};font-size:15px;font-weight:600;line-height:1.4;color:${FOREGROUND_HEX};`;
  const roleStyle = `font-family:${SYSTEM_FONT_STACK};font-size:13px;line-height:1.5;color:${BIZMIS_MUTED_FG_HEX};`;
  const roleBizmisStyle = `color:${BIZMIS_PRIMARY_HEX};font-weight:600;`;
  return `<p style="margin:0;${closingStyle}">${escapeHtml(c.signatureClosing)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:${SIGNATURE_AFTER_CLOSING_GAP_PX}px 0 0 0;">
<tr>
<td valign="middle" style="padding:0 ${SIGNATURE_LOGO_TEXT_GAP_PX}px 0 0;vertical-align:middle;">
<a href="${escapeAttr(bizmisInviteSiteUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;border:0;line-height:0;font-size:0;">
<img src="${escapeAttr(logoUrl)}" alt="Bizmis" width="${SIGNATURE_BIZMIS_LOGO_DISPLAY_PX}" height="${SIGNATURE_BIZMIS_LOGO_DISPLAY_PX}" style="display:block;width:${SIGNATURE_BIZMIS_LOGO_DISPLAY_PX}px;height:${SIGNATURE_BIZMIS_LOGO_DISPLAY_PX}px;border:0;" />
</a>
</td>
<td valign="top" style="padding:0;vertical-align:top;">
<p style="margin:0;${nameStyle}">${escapeHtml(c.signatureName)}</p>
<p style="margin:2px 0 0 0;${roleStyle}">${escapeHtml(c.signatureRoleBeforeBizmis)}<span style="${roleBizmisStyle}">${escapeHtml(c.signatureRoleBizmisWord)}</span></p>
</td>
</tr>
</table>`;
}

// Plain text rendering.

function renderPlainText(lead: LeadEarlyAccessData, utmCampaign: string): string {
  const { shopifyAppUrl, storeCap, bookACallUrl } = EARLY_ACCESS_TERMS;
  const c = EARLY_ACCESS_EMAIL_COPY;
  const leadHandle = encodeURIComponent(lead.id);
  const utmTail = buildOutboundUtmTail(lead.id, utmCampaign);
  const bookCallUrl = `${bookACallUrl}?ref=${leadHandle}&${utmTail}`;
  const installUrlWithCode = `${shopifyAppUrl}?ref=${leadHandle}&code=${encodeURIComponent(lead.couponCode)}&${utmTail}`;
  const bizmisInviteSiteUrl = `${buildInviteBizmisSiteUrl(lead.id)}&${utmTail}`;
  const contactFirst = earlyAccessGreetingFirstName(lead.leadContactName);
  const salutation = contactFirst
    ? `${c.greetingDear} ${contactFirst},`
    : `${c.greetingDear} ${lead.storeName}${c.greetingStoreTeamSuffix}`;
  const pitch = buildInviteLeadParagraphPlainText();

  const titleLine = `${lead.storeName} ${c.inviteTitleBrandLeadSeparator} ${c.inviteTitleBrandLead} ${c.inviteTitleEyebrowSeparator} ${c.inviteTitleEyebrow.toUpperCase()}`;
  return [
    titleLine,
    "",
    salutation,
    "",
    pitch,
    "",
    buildCtaUrgencyPlainText(lead.storeName, storeCap),
    "",
    `${c.couponLabel} ${lead.couponCode}`,
    `${c.ctaPrimaryButtonLabel}: ${bookCallUrl}`,
    `${c.ctaSecondaryInstallLinkLabel}: ${installUrlWithCode}`,
    "",
    c.signatureClosing,
    "",
    c.signatureName,
    `${c.signatureRoleBeforeBizmis}${c.signatureRoleBizmisWord}`,
    "",
    `Questions? Just reply to this email (${c.contactEmail}).`,
    "",
    bizmisInviteSiteUrl,
    `${INVITE_UNSUBSCRIBE_LABEL}: ${INSTANTLY_UNSUBSCRIBE_MERGE_TAG}`,
  ].join("\n");
}

// Safety linter.

type ForbiddenRule = { pattern: RegExp; label: string };

const FORBIDDEN_TAGS: ForbiddenRule[] = [
  { pattern: /<script[\s>]/i, label: "<script> tag" },
  { pattern: /<form[\s>]/i, label: "<form> tag" },
  { pattern: /<svg[\s>]/i, label: "<svg> tag" },
  { pattern: /<style[\s>]/i, label: "<style> tag (outside MSO conditional)" },
  { pattern: /\sclass\s*=\s*["']/i, label: "class= attribute" },
  { pattern: /\son[a-z]+\s*=\s*["']/i, label: "on* event handler attribute" },
];

const FORBIDDEN_CSS: ForbiddenRule[] = [
  { pattern: /position\s*:\s*(absolute|relative|fixed)/i, label: "CSS position" },
  { pattern: /(^|[\s;"'{])transform\s*:/i, label: "CSS transform" },
  { pattern: /-webkit-mask-image\s*:/i, label: "CSS -webkit-mask-image" },
  { pattern: /(^|[\s;"'{])mask-image\s*:/i, label: "CSS mask-image" },
  { pattern: /mix-blend-mode\s*:/i, label: "CSS mix-blend-mode" },
  { pattern: /backdrop-filter\s*:/i, label: "CSS backdrop-filter" },
  { pattern: /clip-path\s*:/i, label: "CSS clip-path" },
  { pattern: /[\s;:]calc\s*\(/i, label: "CSS calc()" },
  { pattern: /var\s*\(\s*--/i, label: "CSS variable (var(--...))" },
  { pattern: /margin\s*:\s*-/i, label: "negative margin" },
];

function assertEmailSafe(html: string, htmlSizeBytes: number): string[] {
  const warnings: string[] = [];
  const errors: string[] = [];

  const withoutMsoConditionals = html.replace(
    /<!--\[if[\s\S]*?<!\[endif\]-->/gi,
    "",
  );

  for (const rule of FORBIDDEN_TAGS) {
    if (rule.pattern.test(withoutMsoConditionals)) {
      errors.push(`Forbidden: ${rule.label}`);
    }
  }
  for (const rule of FORBIDDEN_CSS) {
    if (rule.pattern.test(withoutMsoConditionals)) {
      errors.push(`Forbidden: ${rule.label}`);
    }
  }

  if (htmlSizeBytes > SAFE_EMAIL_MAX_BYTES) {
    errors.push(
      `HTML is ${(htmlSizeBytes / 1024).toFixed(1)} KB, over Gmail's ${(SAFE_EMAIL_MAX_BYTES / 1024).toFixed(0)} KB clip threshold`,
    );
  } else if (htmlSizeBytes > SAFE_EMAIL_WARN_BYTES) {
    warnings.push(
      `HTML is ${(htmlSizeBytes / 1024).toFixed(1)} KB, approaching Gmail's ${(SAFE_EMAIL_MAX_BYTES / 1024).toFixed(0)} KB clip threshold`,
    );
  }

  if (errors.length > 0) {
    throw new Error(
      `Gmail-safe email build failed:\n  - ${errors.join("\n  - ")}`,
    );
  }

  return warnings;
}

// Utilities.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}

function ensureHex(value: string): string {
  const v = value?.trim() ?? "";
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v;
  return BIZMIS_PRIMARY_HEX;
}

/**
 * Store-name accent used across the Gmail-safe invite (inline heading,
 * pitch paragraph). Resolution order:
 *
 *   1. Lead `textColor` (brand accent from the site for leads whose
 *      navbar background is white/too light for text), when present
 *      and dark enough to read on the white email card.
 *   2. Lead `primaryColor`, when dark enough to read.
 *   3. Readable dark-green fallback, so the store name never disappears
 *      on white for leads with only very pale palette overrides.
 */
export function resolveStoreAccentForEmail(lead: LeadEarlyAccessData): string {
  const textBased = ensureHex(resolveStoreNameTextColor(lead));
  if (relativeLuminance(textBased) <= STORE_ACCENT_MAX_LUMINANCE) return textBased;
  const primary = ensureHex(lead.primaryColor);
  if (relativeLuminance(primary) <= STORE_ACCENT_MAX_LUMINANCE) return primary;
  return LINK_SUCCESS_GREEN_HEX;
}

const STORE_ACCENT_MAX_LUMINANCE = 0.82;

function relativeLuminance(hex: string): number {
  const match = /^#([0-9A-Fa-f]{6})$/.exec(hex);
  if (!match) return 0;
  const r = parseInt(match[1].slice(0, 2), 16) / 255;
  const g = parseInt(match[1].slice(2, 4), 16) / 255;
  const b = parseInt(match[1].slice(4, 6), 16) / 255;
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
