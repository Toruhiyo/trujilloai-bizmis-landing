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
  EARLY_ACCESS_TRIAL_USAGE_MINUTES_LIMIT,
  buildCtaMixedUrgencyPlainText,
  buildEarlyAccessPreheader,
  buildEarlyAccessSalutationPlainText,
  earlyAccessGreetingFirstName,
} from "@/data/leadEarlyAccessCopy";
import { EARLY_ACCESS_TERMS, resolveStoreNameTextColor } from "@/data/leads/_schema";
import {
  BIZMIS_BORDER_HEX,
  BIZMIS_MUTED_FG_HEX,
  BIZMIS_PRIMARY_HEX,
  BIZMIS_WARM_BG_HEX,
} from "@/lib/bizmisBrandColors";

export const SAFE_EMAIL_DEFAULT_BASE_URL = "https://www.bizmis.ai" as const;
export const SAFE_EMAIL_MAX_BYTES = 102_000;
export const SAFE_EMAIL_WARN_BYTES = 60_000;

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
const CTA_BG_HEX = "#32281B";

const SYSTEM_FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,Helvetica,sans-serif";

const LINK_SUCCESS_GREEN_HEX = "#108849";

export type BuildSafeEmailOptions = {
  /**
   * Base URL used for absolute image src values. Leave empty ("") to emit
   * relative URLs (admin iframe preview against the dev server). Pass the
   * production origin (default "https://www.bizmis.ai") for outbound copy.
   */
  baseUrl?: string;
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
  const html = renderSafeHtml(lead, baseUrl);
  const htmlSizeBytes = new TextEncoder().encode(html).byteLength;
  const warnings = assertEmailSafe(html, htmlSizeBytes);
  const plainText = renderPlainText(lead);
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

// HTML rendering.

function renderSafeHtml(lead: LeadEarlyAccessData, baseUrl: string): string {
  const { storeCap, shopifyAppUrl } = EARLY_ACCESS_TERMS;
  const copy = EARLY_ACCESS_EMAIL_COPY;

  const storeName = escapeHtml(lead.storeName);
  const storeAccent = resolveStoreAccentForEmail(lead);
  const leadHandle = encodeURIComponent(lead.id);
  const earlyAccessCode = lead.couponCode;
  const topProductTitle = lead.salesProducts[lead.salesRecommendedIndex].title;

  const combinedMockupUrl = absUrl(baseUrl, `/invite-cards/leads/${lead.id}/email/mockup.png`);

  const installUrlWithCode = `${shopifyAppUrl}?ref=${leadHandle}&code=${encodeURIComponent(earlyAccessCode)}`;

  const salutationText = escapeHtml(buildEarlyAccessSalutationPlainText(lead.storeName, lead.leadContactName));

  const pitchHtml = buildPitchParagraphHtml(storeName);
  const ctaUrgencyHtml = buildCtaUrgencyHtml();
  const ctaBoxHtml = buildCtaBoxHtml(installUrlWithCode, earlyAccessCode);

  const preheader = escapeHtml(buildEarlyAccessPreheader(lead.storeName, storeCap));

  const combinedImageHtml = buildCenteredImage({
    src: combinedMockupUrl,
    alt: `Mockup of Bizmis on the ${lead.storeName} Shopify storefront: a voice clerk guides a shopper through the catalog and recommends ${topProductTitle}, with a phone showing Bizmis answering a customer support question grounded in store policies and product details`,
    widthPx: COMBINED_MOCKUP_DISPLAY_WIDTH_PX,
    heightPx: COMBINED_MOCKUP_DISPLAY_HEIGHT_PX,
    borderRadiusPx: 0,
    fullWidth: true,
  });

  const titleHtml = buildEarlyAccessTitleHtml(storeName, storeAccent);

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
<td style="padding:24px 32px 0 32px;">
${ctaUrgencyHtml}
</td>
</tr>

<tr>
<td style="padding:14px 32px 0 32px;" align="center">
${ctaBoxHtml}
</td>
</tr>

<tr>
<td style="padding:28px 0 4px 0;line-height:0;font-size:0;" align="center">
${combinedImageHtml}
</td>
</tr>

<tr>
<td style="padding:28px 40px 32px 40px;text-align:center;border-top:1px solid #EBE6DF;">
<p style="margin:0 0 10px 0;font-family:${SYSTEM_FONT_STACK};font-size:10px;line-height:1.55;color:${MUTED_LIGHT_HEX};">
Questions? Just reply to this email (<a href="mailto:${escapeHtml(copy.contactEmail)}" style="color:${BIZMIS_MUTED_FG_HEX};text-decoration:none;">${escapeHtml(copy.contactEmail)}</a>).
</p>
<a href="https://bizmis.ai" target="_blank" rel="noopener noreferrer" style="font-family:${SYSTEM_FONT_STACK};font-size:10px;font-weight:500;color:${BIZMIS_MUTED_FG_HEX};text-decoration:none;">bizmis.ai</a>
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
 * the lead's resolved accent, `bizmis` in Bizmis primary, and the
 * eyebrow in the same subtle tone as the × / · separators. Wraps naturally if the store
 * name is long enough to exceed the card's content width.
 */
function buildEarlyAccessTitleHtml(storeName: string, storeAccent: string): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  const baseTextStyle =
    `font-family:${SYSTEM_FONT_STACK};font-size:22px;font-weight:700;line-height:1.3;letter-spacing:-0.005em;`;
  const separatorStyle = `${baseTextStyle}font-weight:400;color:${MUTED_SUBTLE_HEX};`;
  const eyebrowStyle =
    `font-family:${SYSTEM_FONT_STACK};font-size:14px;font-weight:600;line-height:1.3;letter-spacing:0.2em;text-transform:uppercase;color:${MUTED_SUBTLE_HEX};vertical-align:0.08em;`;
  return `<p style="margin:0;text-align:center;${baseTextStyle}">
<span style="color:${storeAccent};">${storeName}</span>
<span style="${separatorStyle}">&nbsp;${escapeHtml(c.inviteTitleBrandLeadSeparator)}&nbsp;</span>
<span style="color:${BIZMIS_PRIMARY_HEX};">${escapeHtml(c.inviteTitleBrandLead)}</span>
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

function buildPitchParagraphHtml(storeName: string): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  const fgStyle = `font-family:${SYSTEM_FONT_STACK};font-size:15px;line-height:1.72;color:${FOREGROUND_HEX};`;
  return `<p style="margin:0;${fgStyle}">
${escapeHtml(c.inviteSentenceLeadNamedBeforeBizmis)}${escapeHtml(c.inviteSentenceBizmisWord)}${escapeHtml(c.inviteSentenceAfterFirstBizmis)}${storeName}${escapeHtml(c.inviteSentenceAfterStorePreValue)}<strong style="font-weight:600;">${escapeHtml(c.inviteSentenceValueDriveSales)}</strong>${escapeHtml(c.inviteSentenceValueJoiner)}<strong style="font-weight:600;">${escapeHtml(c.inviteSentenceValueEaseSupport)}</strong>${escapeHtml(c.inviteSentenceAfterStorePostValue)}
</p>`;
}

/**
 * Muted italic tagline matching the rich invite's soft CTA tone:
 * single muted foreground color, italic throughout, no Bizmis primary
 * highlight. Key phrases ("one-click setup", "at no cost*", "shape
 * the product's roadmap") stay italic but bump to 600 weight.
 */
function buildCtaUrgencyHtml(): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  const taglineStyle = `font-family:${SYSTEM_FONT_STACK};font-size:14px;font-weight:400;font-style:italic;line-height:1.6;color:${BIZMIS_MUTED_FG_HEX};`;
  const emphasis = "font-weight:600;";
  return `<p style="margin:0;${taglineStyle}">
${escapeHtml(c.ctaMixedUrgencyLead)}${escapeHtml(c.ctaMixedUrgencyBizmisWord)}${escapeHtml(c.ctaMixedUrgencyAfterBizmis)}<strong style="${emphasis}">${escapeHtml(c.ctaMixedUrgencyOneClickSetup)}</strong>${escapeHtml(c.ctaMixedUrgencyBetweenSetupAndCost)}<strong style="${emphasis}">${escapeHtml(c.ctaMixedUrgencyNoCost)}</strong>${escapeHtml(c.ctaMixedUrgencyBeforeRoadmap)}<strong style="${emphasis}">${escapeHtml(c.ctaMixedUrgencyRoadmapPhrase)}</strong>${escapeHtml(c.ctaMixedUrgencyAfterRoadmap)}
</p>`;
}

function buildCtaBoxHtml(installUrlWithCode: string, earlyAccessCode: string): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  const footnote = `* Up to ${EARLY_ACCESS_TRIAL_USAGE_MINUTES_LIMIT} minutes of included usage.`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px dashed ${BIZMIS_BORDER_HEX};border-radius:14px;">
<tr>
<td style="padding:22px 28px 14px 28px;" align="center">
<p style="margin:0;font-family:${SYSTEM_FONT_STACK};font-size:9px;color:${MUTED_LIGHT_HEX};letter-spacing:0.02em;">
${escapeHtml(c.couponLabel)}
<span style="color:${BIZMIS_MUTED_FG_HEX};font-size:10px;letter-spacing:0.04em;">&nbsp;${escapeHtml(earlyAccessCode)}</span>
</p>
</td>
</tr>
<tr>
<td style="padding:0 28px 22px 28px;" align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
<tr>
<td align="center" bgcolor="${CTA_BG_HEX}" style="border-radius:12px;">
<a href="${escapeAttr(installUrlWithCode)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;font-family:${SYSTEM_FONT_STACK};font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">
${escapeHtml(c.ctaMixedButtonLabel)}
</a>
</td>
</tr>
</table>
</td>
</tr>
</table>
<p style="margin:10px 0 0 0;font-family:${SYSTEM_FONT_STACK};font-size:8px;line-height:1.4;color:${MUTED_SUBTLE_HEX};text-align:center;">
${escapeHtml(footnote)}
</p>`;
}

// Plain text rendering.

function renderPlainText(lead: LeadEarlyAccessData): string {
  const { shopifyAppUrl } = EARLY_ACCESS_TERMS;
  const c = EARLY_ACCESS_EMAIL_COPY;
  const leadHandle = encodeURIComponent(lead.id);
  const installUrlWithCode = `${shopifyAppUrl}?ref=${leadHandle}&code=${encodeURIComponent(lead.couponCode)}`;
  const contactFirst = earlyAccessGreetingFirstName(lead.leadContactName);
  const salutation = contactFirst
    ? `${c.greetingDear} ${contactFirst},`
    : `${c.greetingDear} ${lead.storeName}${c.greetingStoreTeamSuffix}`;
  const pitch = [
    c.inviteSentenceLeadNamedBeforeBizmis,
    c.inviteSentenceBizmisWord,
    c.inviteSentenceAfterFirstBizmis,
    lead.storeName,
    c.inviteSentenceAfterStorePreValue,
    c.inviteSentenceValueDriveSales,
    c.inviteSentenceValueJoiner,
    c.inviteSentenceValueEaseSupport,
    c.inviteSentenceAfterStorePostValue,
  ].join("");

  const titleLine = `${lead.storeName} ${c.inviteTitleBrandLeadSeparator} ${c.inviteTitleBrandLead} ${c.inviteTitleEyebrowSeparator} ${c.inviteTitleEyebrow.toUpperCase()}`;
  return [
    titleLine,
    "",
    salutation,
    "",
    pitch,
    "",
    `${c.couponLabel} ${lead.couponCode}`,
    buildCtaMixedUrgencyPlainText(),
    `${c.ctaMixedButtonLabel}: ${installUrlWithCode}`,
    `* Up to ${EARLY_ACCESS_TRIAL_USAGE_MINUTES_LIMIT} minutes of included usage.`,
    "",
    `Questions? Just reply to this email (${c.contactEmail}).`,
    "",
    "bizmis.ai",
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
function resolveStoreAccentForEmail(lead: LeadEarlyAccessData): string {
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
