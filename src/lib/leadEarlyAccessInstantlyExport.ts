import type { LeadEarlyAccessData } from "@/data/leads/_schema";
import { earlyAccessFirstNameMergeValue } from "@/data/leadEarlyAccessCopy";
import { resolveStoreAccentForEmail } from "@/lib/leadEarlyAccessEmailHtmlSafe";

/**
 * Per-lead merge values consumed by every `{{...}}` tag in
 * `email-templates/invite-card.instantly.html`.
 *
 * Keys match the Instantly merge tag names verbatim. When the template
 * adds / removes / renames a per-lead merge tag, update this type and
 * the `buildInstantlyMergeFields` projection below — the route that
 * exposes values for export will then emit the new shape automatically,
 * and every generated `email-templates/leads/<id>.json` will follow.
 *
 * Per-batch merge tags (currently just `{{utm_campaign}}`) are NOT part
 * of this projection: their value is the same across every recipient in
 * a batch and belongs in the Instantly campaign config, not in per-lead
 * JSON.
 */
export type InstantlyMergeFields = {
  lead_handle: string;
  lead_brand: string;
  firstName: string;
  access_code: string;
  store_accent_color: string;
  /** Attio company record_id — demo link `ref` for demo-session linking (BIZ-165). */
  company_record_id: string;
};

export const INSTANTLY_MERGE_FIELD_KEYS: readonly (keyof InstantlyMergeFields)[] = [
  "lead_handle",
  "lead_brand",
  "firstName",
  "access_code",
  "store_accent_color",
  "company_record_id",
];

export function buildInstantlyMergeFields(lead: LeadEarlyAccessData): InstantlyMergeFields {
  return {
    lead_handle: lead.id,
    lead_brand: lead.storeName,
    firstName: earlyAccessFirstNameMergeValue(lead.storeName, lead.leadContactName),
    access_code: lead.couponCode,
    store_accent_color: resolveStoreAccentForEmail(lead),
    company_record_id: lead.companyRecordId ?? "",
  };
}
