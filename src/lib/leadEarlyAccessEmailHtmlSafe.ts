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
  splitSecondaryLinkEmphasis,
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

/**
 * Self-hosted unsubscribe URL. Instantly's `{{unsubscribe}}` merge tag
 * resolves to an empty `href=""` when the template is uploaded via API
 * (it only works through their rich-text editor). We use our own Vercel
 * API route instead, passing the lead handle via `ref=` so the handler
 * can look up the lead in Instantly and Attio.
 *
 * The `List-Unsubscribe` SMTP header is still handled by Instantly's
 * campaign-level setting (separate from the visible in-body link).
 */
export function buildUnsubscribeUrl(leadId: string, unsubSig?: string): string {
  const base = `${SAFE_EMAIL_DEFAULT_BASE_URL}/unsubscribe?ref=${encodeURIComponent(leadId)}`;
  return unsubSig ? `${base}&sig=${encodeURIComponent(unsubSig)}` : base;
}

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
const COMBINED_MOCKUP_INTRINSIC_HEIGHT_PX = 688;
const COMBINED_MOCKUP_DISPLAY_HEIGHT_PX = Math.round(
  (COMBINED_MOCKUP_DISPLAY_WIDTH_PX * COMBINED_MOCKUP_INTRINSIC_HEIGHT_PX) /
    COMBINED_MOCKUP_INTRINSIC_WIDTH_PX,
);

const FOREGROUND_HEX = "#32281B";
const MUTED_LIGHT_HEX = "#B5A48E";
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
  /**
   * HMAC signature for the self-hosted unsubscribe link. Appended as
   * `&sig=<value>` to the unsubscribe URL. For Instantly sends this
   * is a placeholder token swapped for `{{unsub_sig}}` by the generator.
   */
  unsubSig?: string;
  /**
   * Which single layout to render (ignored when `instantlyDualVariant`):
   *   - "gmail"   — image-first hero card (default; the rich Gmail experience).
   *   - "allmail" — text-first universal layout (headline + pitch + CTA carry
   *     the value; the hero image sits lower as an enhancement). Safe when the
   *     client blocks remote images by default (Outlook / corporate gateways).
   */
  variant?: SafeEmailVariant;
  /**
   * When true, emit BOTH variants wrapped in an Instantly Liquid conditional
   * keyed on the per-lead `mail_provider` field:
   *   {% if mail_provider == "google" %}<gmail>{% else %}<allmail>{% endif %}
   * Instantly evaluates the Liquid at send time, so the recipient receives only
   * their one branch (the 102 KB Gmail clip limit applies to that single
   * branch, which is asserted individually). Used by the Instantly export route.
   *
   * Image-first is gated to CONFIRMED Gmail only; everything else — Microsoft,
   * other/gateway, unknown, AND any missing/empty value — falls through to the
   * text-first all-mail variant, which renders safely in every client (Gmail
   * included). `mail_provider` is backfilled on all leads + set on every new
   * one, so the fallback is rarely hit; when it is, text-first is the safe
   * degradation rather than a broken image.
   */
  instantlyDualVariant?: boolean;
};

export type SafeEmailVariant = "gmail" | "allmail";

/**
 * Liquid condition selecting the Gmail (image-first) branch — true only for
 * confirmed Google recipients. Everything else (Microsoft, other, unknown,
 * missing, empty) falls through to the text-first all-mail default.
 */
const INSTANTLY_GMAIL_LIQUID_CONDITION = 'mail_provider == "google"';

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
  const unsubSig = options.unsubSig?.trim() || "";
  const encoder = new TextEncoder();
  const plainText = renderPlainText(lead, utmCampaign, unsubSig);

  if (options.instantlyDualVariant) {
    // Single shared document shell; only the inner card differs. The Liquid
    // conditional wraps the two cards INSIDE the centering <td> (see
    // renderDocument) so Instantly's body sanitizer can't strip it.
    const gmailCard = renderCard(lead, baseUrl, utmCampaign, unsubSig, "gmail");
    const allmailCard = renderCard(lead, baseUrl, utmCampaign, unsubSig, "allmail");

    // Validate each rendered branch independently — Instantly sends only one per
    // recipient, so each must fit Gmail's clip budget on its own.
    const gmail = minifyEmailHtml(renderDocument(lead, gmailCard));
    const allmail = minifyEmailHtml(renderDocument(lead, allmailCard));
    const gmailBytes = encoder.encode(gmail).byteLength;
    const allmailBytes = encoder.encode(allmail).byteLength;
    const warnings = [
      ...assertEmailSafe(gmail, gmailBytes).map((w) => `[gmail] ${w}`),
      ...assertEmailSafe(allmail, allmailBytes).map((w) => `[allmail] ${w}`),
    ];

    const liquidCard =
      `{% if ${INSTANTLY_GMAIL_LIQUID_CONDITION} %}${gmailCard}` +
      `{% else %}${allmailCard}{% endif %}`;
    const html = minifyEmailHtml(renderDocument(lead, liquidCard));
    // The sent email is a single branch; report the larger branch as the size.
    return { html, plainText, htmlSizeBytes: Math.max(gmailBytes, allmailBytes), warnings };
  }

  const variant = options.variant ?? "gmail";
  const html = minifyEmailHtml(renderSafeHtml(lead, baseUrl, utmCampaign, unsubSig, variant));
  const htmlSizeBytes = encoder.encode(html).byteLength;
  const warnings = assertEmailSafe(html, htmlSizeBytes);
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

function renderSafeHtml(
  lead: LeadEarlyAccessData,
  baseUrl: string,
  utmCampaign: string,
  unsubSig: string,
  variant: SafeEmailVariant,
): string {
  return renderDocument(lead, renderCard(lead, baseUrl, utmCampaign, unsubSig, variant));
}

/**
 * Wrap card content (a single `<table>` card, or a Liquid `{% if %}` choosing
 * between two cards) in the shared email document shell. The shell — DOCTYPE,
 * <head>, <body>, the outer background table and its centering <td> — is
 * identical for every variant. Keeping it shared is essential for the Instantly
 * dual-variant template: the Liquid conditional must sit INSIDE the centering
 * <td>, not around whole documents. Instantly's API HTML-sanitizes the body on
 * save and discards anything outside <body> (and foster-parents stray text
 * placed directly inside <table>) — both of which silently strip the Liquid.
 * Inside a <td> the conditional survives.
 */
function renderDocument(lead: LeadEarlyAccessData, innerCardHtml: string): string {
  const copy = EARLY_ACCESS_EMAIL_COPY;
  const { storeCap } = EARLY_ACCESS_TERMS;
  const preheader = escapeHtml(buildEarlyAccessPreheader(lead.storeName, storeCap));

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
<!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${CARD_MAX_WIDTH_PX}" align="center"><tr><td><![endif]-->
${innerCardHtml}
<!--[if mso]></td></tr></table><![endif]-->
</td>
</tr>
</table>

</body>
</html>`;
}

/**
 * Render the white invite card (`<table>…</table>`) for one variant — the only
 * part that differs between Gmail (image-first) and all-mail (text-first).
 */
function renderCard(
  lead: LeadEarlyAccessData,
  baseUrl: string,
  utmCampaign: string,
  unsubSig: string,
  variant: SafeEmailVariant,
): string {
  const { storeCap, shopifyAppUrl, bookACallUrl, demoPath } = EARLY_ACCESS_TERMS;
  const copy = EARLY_ACCESS_EMAIL_COPY;

  const storeName = escapeHtml(lead.storeName);
  const leadHandle = encodeURIComponent(lead.id);
  // BIZ-165: the demo link carries the Attio company record_id (not the handle)
  // so demo sessions can be linked back to the deal; fall back to the handle for
  // leads onboarded before companyRecordId existed.
  const demoRef = encodeURIComponent(lead.companyRecordId || lead.id);
  const earlyAccessCode = lead.couponCode;

  const combinedMockupUrl = absUrl(baseUrl, `/invite-cards/${lead.id}/email/mockup.png`);

  const utmTail = buildOutboundUtmTail(lead.id, utmCampaign);
  // BIZ-127: primary CTA → the live demo storefront (code rides in the query for
  // the demo→install redemption, BIZ-134). The direct install link + visible
  // early-access code are kept as a secondary option; book-a-call is one text line.
  const demoUrl = `${absUrl(baseUrl, demoPath)}?ref=${demoRef}&code=${encodeURIComponent(earlyAccessCode)}&${utmTail}`;
  const installUrlWithCode = `${shopifyAppUrl}?ref=${leadHandle}&code=${encodeURIComponent(earlyAccessCode)}&${utmTail}`;
  const bookCallUrl = `${bookACallUrl}?ref=${leadHandle}&${utmTail}`;
  const bizmisInviteSiteUrl = `${buildInviteBizmisSiteUrl(lead.id)}&${utmTail}`;
  const unsubscribeUrl = buildUnsubscribeUrl(lead.id, unsubSig || undefined);

  const salutationText = escapeHtml(buildEarlyAccessSalutationPlainText(lead.storeName, lead.leadContactName));

  const pitchHtml = buildPitchParagraphHtml(storeName);
  const ctaUrgencyHtml = buildCtaUrgencyHtml(storeName, storeCap);
  const ctaBoxHtml = buildCtaBoxHtml(demoUrl, installUrlWithCode, bookCallUrl, earlyAccessCode, variant);

  const altText = `Mockup of Bizmis on the ${lead.storeName} Shopify storefront`;

  const combinedImageHtml = buildCenteredImage({
    src: combinedMockupUrl,
    alt: altText,
    widthPx: COMBINED_MOCKUP_DISPLAY_WIDTH_PX,
    heightPx: COMBINED_MOCKUP_DISPLAY_HEIGHT_PX,
    borderRadiusPx: 0,
    fullWidth: true,
  });

  const signatureHtml = buildSignatureHtml(baseUrl, bizmisInviteSiteUrl);

  // ── Rows (assembled in a variant-specific order below) ──────────────────────
  // Gmail: edge-to-edge hero image (renders inline by default in Gmail).
  const imageRow = `<tr>
<td style="padding:0 0 4px 0;line-height:0;font-size:0;" align="center">
${combinedImageHtml}
</td>
</tr>`;

  // #1 All-mail: a solid branded band — a table-cell bgcolor, which Outlook
  // honors — gives a real visual anchor that survives image-blocking AND Word.
  const bandRow = `<tr>
<td bgcolor="${FOREGROUND_HEX}" align="center" style="background-color:${FOREGROUND_HEX};padding:26px 32px;">
${buildTitleBandHtml(storeName)}
</td>
</tr>`;

  // #2/#3 All-mail: NO framing box (a bordered/bg container made Outlook render a
  // giant empty placeholder). The descriptive text sits ABOVE the image, flanked
  // by down arrows pointing to it. The <img> carries no alt (text is above), no
  // border/bg, and NO fixed height — so a blocked image collapses to a small icon
  // instead of reserving a tall box; when it loads, height:auto scales it.
  const previewW = CARD_MAX_WIDTH_PX - 64; // within the 32px side padding
  const allmailImageRow = `<tr>
<td style="padding:26px 32px 0 32px;" align="center">
<p style="margin:0 0 8px 0;font-family:${SYSTEM_FONT_STACK};font-size:11px;line-height:1.5;color:${MUTED_LIGHT_HEX};">&#8595;&nbsp;&nbsp;${escapeHtml(altText)}&nbsp;&nbsp;&#8595;</p>
<img src="${escapeAttr(combinedMockupUrl)}" alt="" width="${previewW}" style="display:block;width:100%;max-width:${previewW}px;height:auto;border:0;margin:0 auto;" />
</td>
</tr>`;

  const salutationRow = (topPad: number) => `<tr>
<td style="padding:${topPad}px 32px 0 32px;">
<p style="margin:0;font-family:${SYSTEM_FONT_STACK};font-size:11px;line-height:1.6;color:${BIZMIS_MUTED_FG_HEX};letter-spacing:0.01em;">
${salutationText}
</p>
</td>
</tr>`;

  const pitchRow = `<tr>
<td style="padding:14px 32px 0 32px;">
${pitchHtml}
</td>
</tr>`;

  const urgencyRow = `<tr>
<td style="padding:14px 32px 0 32px;">
${ctaUrgencyHtml}
</td>
</tr>`;

  const ctaRow = `<tr>
<td style="padding:24px 32px 0 32px;" align="center">
${ctaBoxHtml}
</td>
</tr>`;

  const signatureRow = `<tr>
<td style="padding:28px 32px ${SIGNATURE_BEFORE_FOOTER_GAP_PX}px 32px;">
${signatureHtml}
</td>
</tr>`;

  const footerRow = `<tr>
<td style="padding:28px 40px 32px 40px;text-align:center;border-top:1px solid #EBE6DF;">
<p style="margin:0 0 10px 0;font-family:${SYSTEM_FONT_STACK};font-size:10px;line-height:1.55;color:${MUTED_LIGHT_HEX};">
Questions? Just reply to this email (<a href="mailto:${escapeHtml(copy.contactEmail)}" style="color:${BIZMIS_MUTED_FG_HEX};text-decoration:none;">${escapeHtml(copy.contactEmail)}</a>).
</p>
<a href="${escapeAttr(bizmisInviteSiteUrl)}" target="_blank" rel="noopener noreferrer" style="font-family:${SYSTEM_FONT_STACK};font-size:10px;font-weight:500;color:${BIZMIS_MUTED_FG_HEX};text-decoration:none;">bizmis.ai</a>
<span style="font-family:${SYSTEM_FONT_STACK};font-size:10px;color:${MUTED_LIGHT_HEX};">&nbsp;&middot;&nbsp;</span>
<a href="${escapeAttr(unsubscribeUrl)}" style="font-family:${SYSTEM_FONT_STACK};font-size:10px;font-weight:400;color:${BIZMIS_MUTED_FG_HEX};text-decoration:underline;">${escapeHtml(INVITE_UNSUBSCRIBE_LABEL)}</a>
</td>
</tr>`;

  // Gmail: image-first hero (renders inline by default). All-mail: branded band +
  // pitch + CTA stand alone when the hero image is blocked (Outlook/gateways);
  // the framed image follows as an enhancement.
  const innerRows = variant === "gmail"
    ? imageRow + salutationRow(8) + pitchRow + urgencyRow + ctaRow + signatureRow + footerRow
    : bandRow + salutationRow(18) + pitchRow + urgencyRow + ctaRow + allmailImageRow + signatureRow + footerRow;

  // #5 All-mail: flat (square) card — Outlook squares corners anyway, so make it
  // deliberate rather than degraded. Gmail keeps the rounded card.
  const cardRadius = variant === "gmail" ? 16 : 0;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${CARD_MAX_WIDTH_PX}" style="max-width:${CARD_MAX_WIDTH_PX}px;width:100%;background-color:#ffffff;border:1px solid ${BIZMIS_BORDER_HEX};border-radius:${cardRadius}px;overflow:hidden;">
${innerRows}
</table>`;
}

/**
 * Title for the all-mail branded band (#1): `<Store> × bizmis` on a dark band,
 * with the `EARLY ACCESS INVITE` eyebrow beneath. Renders on the dark
 * `FOREGROUND_HEX` band, so the store name is white and `bizmis` keeps the brand
 * orange (which would vanish on a light band). Real text — no image — so it
 * survives both image-blocking and Outlook's Word engine. The store-name accent
 * is fixed (the per-lead accent can't be baked into a single Instantly template).
 */
function buildTitleBandHtml(storeName: string): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  const base = `font-family:${SYSTEM_FONT_STACK};font-size:22px;font-weight:700;line-height:1.3;letter-spacing:-0.005em;`;
  const sep = `${base}font-weight:400;color:${MUTED_LIGHT_HEX};`;
  const eyebrow = `font-family:${SYSTEM_FONT_STACK};font-size:13px;font-weight:600;line-height:1.3;letter-spacing:0.2em;text-transform:uppercase;color:${MUTED_LIGHT_HEX};`;
  return `<p style="margin:0;text-align:center;${base}color:#ffffff;">` +
    `${storeName}` +
    `<span style="${sep}">&nbsp;${escapeHtml(c.inviteTitleBrandLeadSeparator)}&nbsp;</span>` +
    `<span style="${base}color:${BIZMIS_PRIMARY_HEX};">${escapeHtml(c.inviteTitleBrandLead)}</span>` +
    `</p>` +
    `<p style="margin:8px 0 0 0;text-align:center;${eyebrow}">${escapeHtml(c.inviteTitleEyebrow)}</p>`;
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
${escapeHtml(c.inviteIntroBeforeBizmis)}${escapeHtml(c.inviteSentenceBizmisWord)}${escapeHtml(c.inviteIntroReachOutBeforeStore)}${escapeHtml(storeName)}${escapeHtml(c.inviteIntroReachOutAfterStore)}${escapeHtml(c.inviteIntroProductPitch)}<strong style="font-weight:600;">${escapeHtml(c.inviteSentenceValueDriveSales)}</strong>${escapeHtml(c.inviteSentenceValueJoiner)}<strong style="font-weight:600;">${escapeHtml(c.inviteSentenceValueEaseSupport)}</strong>.
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
  demoUrl: string,
  installUrlWithCode: string,
  bookCallUrl: string,
  earlyAccessCode: string,
  variant: SafeEmailVariant,
): string {
  const c = EARLY_ACCESS_EMAIL_COPY;
  // #5 All-mail flattens decoration (square, solid) so it reads as intentional
  // in Outlook rather than a degraded rounded design.
  const flat = variant === "allmail";
  const boxBorder = flat ? `1px solid ${BIZMIS_BORDER_HEX}` : `1px dashed ${BIZMIS_BORDER_HEX}`;
  const boxRadius = flat ? 0 : 14;
  const btnRadius = flat ? 0 : 12;
  const kickerStyle = `margin:0;font-family:${SYSTEM_FONT_STACK};font-size:10px;font-weight:600;line-height:1.4;color:${BIZMIS_MUTED_FG_HEX};letter-spacing:0.14em;text-transform:uppercase;`;
  const buttonLinkStyle = `font-family:${SYSTEM_FONT_STACK};font-size:13px;font-weight:600;line-height:18px;mso-line-height-rule:exactly;color:${FOREGROUND_HEX};text-decoration:none;white-space:nowrap;`;
  const secondaryLinkStyle = `font-family:${SYSTEM_FONT_STACK};font-size:11px;font-weight:500;color:${BIZMIS_MUTED_FG_HEX};text-decoration:none;`;
  const secondaryEmphasisStyle = "font-weight:700;text-decoration:underline;";
  const renderSecondaryLinkInner = (label: string, emphasis: string): string => {
    const seg = splitSecondaryLinkEmphasis(label, emphasis);
    const strong = seg.emphasis
      ? `<span style="${secondaryEmphasisStyle}">${escapeHtml(seg.emphasis)}</span>`
      : "";
    return `${escapeHtml(seg.before)}${strong}${escapeHtml(seg.after)}`;
  };
  const mutedSmall = `font-family:${SYSTEM_FONT_STACK};font-size:11px;color:${MUTED_LIGHT_HEX};`;
  // BIZ-127: primary CTA = "Try the live demo". Below it, a secondary install
  // link that keeps the visible early-access code (the install link also carries
  // the code in its query). Book-a-call is one demoted text line.
  //
  // Button: padding + bgcolor on the <td> (Outlook's Word engine honors td
  // padding but NOT padding on an <a>). No VML — Instantly strips it; td-padding
  // renders a real button in Outlook/Gmail/Apple. Square in Outlook (border-radius
  // unsupported); the all-mail variant is flat by design.
  const buttonHtml = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
<tr>
<td align="center" bgcolor="${BIZMIS_PRIMARY_HEX}" style="background-color:${BIZMIS_PRIMARY_HEX};border-radius:${btnRadius}px;padding:14px 30px;mso-padding-alt:14px 30px;">
<a href="${escapeAttr(demoUrl)}" target="_blank" rel="noopener noreferrer" style="${buttonLinkStyle}">${escapeHtml(c.ctaPrimaryButtonLabel)}</a>
</td>
</tr>
</table>`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:${boxBorder};border-radius:${boxRadius}px;">
<tr>
<td style="padding:22px 28px 10px 28px;" align="center">
<p style="${kickerStyle}">${escapeHtml(c.ctaScheduleKicker)}</p>
</td>
</tr>
<tr>
<td style="padding:0 28px 16px 28px;" align="center">
${buttonHtml}
</td>
</tr>
<tr>
<td style="padding:0 28px 6px 28px;" align="center">
<a href="${escapeAttr(installUrlWithCode)}" target="_blank" rel="noopener noreferrer" style="${secondaryLinkStyle}">${renderSecondaryLinkInner(c.ctaSecondaryInstallLinkLabel, c.ctaSecondaryInstallEmphasis)}</a>
<span style="${mutedSmall}">&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>
<a href="${escapeAttr(bookCallUrl)}" target="_blank" rel="noopener noreferrer" style="${secondaryLinkStyle}">${renderSecondaryLinkInner(c.ctaSecondaryCallLinkLabel, c.ctaSecondaryCallEmphasis)}</a>
</td>
</tr>
<tr>
<td style="padding:0 28px 20px 28px;" align="center">
<p style="margin:0;${mutedSmall}">${escapeHtml(c.couponLabel)}<span style="color:${BIZMIS_MUTED_FG_HEX};font-weight:600;">&nbsp;${escapeHtml(earlyAccessCode)}</span></p>
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
  const nameStyle = `margin:0;font-family:${SYSTEM_FONT_STACK};font-size:15px;font-weight:600;line-height:1.4;color:${FOREGROUND_HEX};`;
  const roleStyle = `margin:2px 0 0 0;font-family:${SYSTEM_FONT_STACK};font-size:13px;line-height:1.5;color:${BIZMIS_MUTED_FG_HEX};`;
  const roleBizmisStyle = `color:${BIZMIS_PRIMARY_HEX};font-weight:600;`;
  const logoPx = SIGNATURE_BIZMIS_LOGO_DISPLAY_PX;
  const gapPx = SIGNATURE_LOGO_TEXT_GAP_PX;
  const sigRowContainerStyle = `margin:${SIGNATURE_AFTER_CLOSING_GAP_PX}px 0 0 0;font-size:0;line-height:0;`;
  const logoAnchorStyle = `display:inline-block;vertical-align:middle;text-decoration:none;border:0;margin:0 ${gapPx}px 0 0;line-height:0;font-size:0;`;
  const textBlockStyle = `display:inline-block;vertical-align:middle;`;
  return `<p style="margin:0;${closingStyle}">${escapeHtml(c.signatureClosing)}</p>
<div style="${sigRowContainerStyle}"><a href="${escapeAttr(bizmisInviteSiteUrl)}" target="_blank" rel="noopener noreferrer" style="${logoAnchorStyle}"><img src="${escapeAttr(logoUrl)}" alt="Bizmis" width="${logoPx}" height="${logoPx}" border="0" style="display:block;width:${logoPx}px;height:${logoPx}px;border:0;" /></a><div style="${textBlockStyle}"><p style="${nameStyle}">${escapeHtml(c.signatureName)}</p><p style="${roleStyle}">${escapeHtml(c.signatureRoleBeforeBizmis)}<span style="${roleBizmisStyle}">${escapeHtml(c.signatureRoleBizmisWord)}</span></p></div></div>`;
}

// Plain text rendering.

function renderPlainText(lead: LeadEarlyAccessData, utmCampaign: string, unsubSig: string): string {
  const { shopifyAppUrl, storeCap, bookACallUrl, demoPath } = EARLY_ACCESS_TERMS;
  const c = EARLY_ACCESS_EMAIL_COPY;
  const leadHandle = encodeURIComponent(lead.id);
  const utmTail = buildOutboundUtmTail(lead.id, utmCampaign);
  const demoUrl = `${SAFE_EMAIL_DEFAULT_BASE_URL}${demoPath}?ref=${leadHandle}&code=${encodeURIComponent(lead.couponCode)}&${utmTail}`;
  const installUrlWithCode = `${shopifyAppUrl}?ref=${leadHandle}&code=${encodeURIComponent(lead.couponCode)}&${utmTail}`;
  const bookCallUrl = `${bookACallUrl}?ref=${leadHandle}&${utmTail}`;
  const bizmisInviteSiteUrl = `${buildInviteBizmisSiteUrl(lead.id)}&${utmTail}`;
  const contactFirst = earlyAccessGreetingFirstName(lead.leadContactName, lead.storeName);
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
    `${c.ctaPrimaryButtonLabel}: ${demoUrl}`,
    `${c.ctaSecondaryInstallLinkLabel}: ${installUrlWithCode}`,
    `${c.couponLabel} ${lead.couponCode}`,
    `${c.ctaSecondaryCallLinkLabel}: ${bookCallUrl}`,
    "",
    c.signatureClosing,
    "",
    c.signatureName,
    `${c.signatureRoleBeforeBizmis}${c.signatureRoleBizmisWord}`,
    "",
    `Questions? Just reply to this email (${c.contactEmail}).`,
    "",
    bizmisInviteSiteUrl,
    `${INVITE_UNSUBSCRIBE_LABEL}: ${buildUnsubscribeUrl(lead.id, unsubSig || undefined)}`,
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

// Minification.

/**
 * Collapse all newlines (and trailing whitespace) in the rendered HTML.
 *
 * Instantly's campaign sending engine converts literal `\n` characters
 * inside the email body to `<br>` tags, which breaks inline layouts
 * (title spans stack vertically, paragraphs get extra line breaks).
 * Their preview and test-email features do NOT do this, so the issue
 * only surfaces in actual campaign sends.
 *
 * HTML whitespace normalization already treats newlines as collapsible
 * space, and all intentional spacing in the template uses `&nbsp;`,
 * so stripping newlines is semantically safe.
 */
function minifyEmailHtml(html: string): string {
  return html.replace(/\n\s*/g, "");
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
