import { useEffect, useMemo } from "react";
import { LEAD_EARLY_ACCESS_INVITES } from "@/data/leads";
import {
  buildInstantlyMergeFields,
  type InstantlyMergeFields,
} from "@/lib/leadEarlyAccessInstantlyExport";

/**
 * Headless endpoint consumed by
 * `scripts/generate-instantly-lead-fields.mjs`.
 *
 * Computes the Instantly merge values for every real lead via the same
 * TypeScript projection (`buildInstantlyMergeFields`) and publishes the
 * full map on `window.__bizmisInstantlyLeadFields` so Playwright can
 * serialize it to one JSON file per lead. Changes to the merge-field
 * projection (new tag, renamed key, different derivation) automatically
 * flow into the generated files on the next run.
 */
const INSTANTLY_LEAD_FIELDS_WINDOW_KEY = "__bizmisInstantlyLeadFields" as const;

type LeadFieldsPayload = Record<string, InstantlyMergeFields>;

declare global {
  interface Window {
    [INSTANTLY_LEAD_FIELDS_WINDOW_KEY]?: LeadFieldsPayload;
  }
}

const InstantlyLeadFieldsPage = () => {
  const payload = useMemo<LeadFieldsPayload>(() => {
    const out: LeadFieldsPayload = {};
    for (const lead of LEAD_EARLY_ACCESS_INVITES) {
      out[lead.id] = buildInstantlyMergeFields(lead);
    }
    return out;
  }, []);

  useEffect(() => {
    window[INSTANTLY_LEAD_FIELDS_WINDOW_KEY] = payload;
    return () => {
      delete window[INSTANTLY_LEAD_FIELDS_WINDOW_KEY];
    };
  }, [payload]);

  const leadIds = Object.keys(payload).sort();

  return (
    <div style={{ padding: "16px", fontFamily: "ui-monospace, monospace" }}>
      <h1 style={{ fontSize: "14px", margin: "0 0 8px 0" }}>
        Instantly lead-fields export ({leadIds.length} leads)
      </h1>
      <pre
        data-instantly-lead-fields
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          fontSize: "11px",
          background: "#f6f6f6",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
      >
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
};

export default InstantlyLeadFieldsPage;
export { INSTANTLY_LEAD_FIELDS_WINDOW_KEY };
