import { useEffect, useMemo } from "react";
import {
  INSTANTLY_TEMPLATE_LEAD,
  INSTANTLY_TEMPLATE_TOKENS,
} from "@/data/leads/instantlyTemplate";
import {
  SAFE_EMAIL_DEFAULT_BASE_URL,
  buildLeadEarlyAccessEmailHtmlSafe,
} from "@/lib/leadEarlyAccessEmailHtmlSafe";

/**
 * Headless endpoint consumed by `scripts/generate-instantly-template.mjs`.
 *
 * Builds the Gmail-safe invite HTML against a synthetic lead whose fields
 * carry unique placeholder tokens (see `INSTANTLY_TEMPLATE_TOKENS`) and
 * exposes the raw HTML on `window.__bizmisExportedSafeHtml` for Playwright
 * to read. The tokens are later swapped for Instantly merge tags (e.g.
 * `{{firstName}}`) by the generator script.
 *
 * The page also renders the HTML as text inside a <pre> so humans can
 * sanity-check the output while iterating in the browser.
 */
const INSTANTLY_EXPORT_WINDOW_KEY = "__bizmisExportedSafeHtml" as const;

declare global {
  interface Window {
    [INSTANTLY_EXPORT_WINDOW_KEY]?: string;
  }
}

const InstantlyExportPage = () => {
  const { html, htmlSizeBytes, warnings } = useMemo(
    () =>
      buildLeadEarlyAccessEmailHtmlSafe(INSTANTLY_TEMPLATE_LEAD, {
        baseUrl: SAFE_EMAIL_DEFAULT_BASE_URL,
        utmCampaign: INSTANTLY_TEMPLATE_TOKENS.utmCampaign,
      }),
    [],
  );

  useEffect(() => {
    window[INSTANTLY_EXPORT_WINDOW_KEY] = html;
    return () => {
      delete window[INSTANTLY_EXPORT_WINDOW_KEY];
    };
  }, [html]);

  return (
    <div style={{ padding: "16px", fontFamily: "ui-monospace, monospace" }}>
      <h1 style={{ fontSize: "14px", margin: "0 0 8px 0" }}>
        Instantly template export ({htmlSizeBytes} bytes)
      </h1>
      {warnings.length > 0 && (
        <pre style={{ color: "#b91c1c", whiteSpace: "pre-wrap", fontSize: "12px" }}>
          {warnings.map((w) => `\u26A0 ${w}`).join("\n")}
        </pre>
      )}
      <pre
        data-instantly-export-html
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
        {html}
      </pre>
    </div>
  );
};

export default InstantlyExportPage;
export { INSTANTLY_EXPORT_WINDOW_KEY };
