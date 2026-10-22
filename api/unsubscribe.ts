import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHmac, timingSafeEqual } from "node:crypto";

// Self-hosted unsubscribe for the cold email links (?ref=<handle>&sig=<hmac>).
//
// 2026-10-22 rewrite: Instantly first, Attio optional and last. The old version looked the
// Company up in Attio before touching Instantly and returned success on every path, so a
// renamed Company or a slow Attio left the lead in Instantly while the page said "you're
// unsubscribed" (58 of 60 known opt-outs were still in the campaign). Now:
//   1. find every Instantly lead whose lead_handle variable equals the ref, workspace-wide
//      (so any campaign is covered, not only Early Access);
//   2. add each email to the Instantly blocklist (this is what guarantees no further email),
//      then delete the lead;
//   3. return an error when nothing matched or the blocklist write failed, so the person is
//      told to reply instead of being told it worked;
//   4. if Attio is still configured, move the Deal to Lost — Unsubscribed. Failures there are
//      logged and never change the answer. Attio is being retired (cut-over 2026-11-20).

export const config = { maxDuration: 60 };

const INSTANTLY_BASE = "https://api.instantly.ai/api/v2";
const ATTIO_BASE = "https://api.attio.com/v2";
const REF_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HMAC_HEX_LENGTH = 16;
const TIMEOUT_MS = 20_000;
const STOP_WORDS = new Set(["the", "and", "co", "shop", "store", "inc", "llc", "ltd", "usa", "com"]);

const NOT_FOUND_ERROR =
  "We couldn't find your address on our list. Reply to the email with \"unsubscribe\", or write to hello@bizmis.ai, and we'll remove you by hand.";
const BLOCK_FAILED_ERROR =
  "We couldn't complete your unsubscribe right now. Please try again in a minute, or reply to the email with \"unsubscribe\".";

type UnsubscribeResult =
  | { success: true }
  | { success: false; error: string; status: number };

export function computeUnsubscribeSig(ref: string, secret: string): string {
  return createHmac("sha256", secret).update(ref).digest("hex").slice(0, HMAC_HEX_LENGTH);
}

function verifySig(ref: string, sig: string, secret: string): boolean {
  const expected = computeUnsubscribeSig(ref, secret);
  if (sig.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  const ref = (req.body?.ref ?? "").trim().toLowerCase();
  const sig = (req.body?.sig ?? "").trim().toLowerCase();
  if (!ref || !REF_PATTERN.test(ref)) {
    res.status(400).json({ success: false, error: "Invalid or missing ref parameter" });
    return;
  }

  const hmacSecret = process.env.UNSUBSCRIBE_HMAC_SECRET;
  const instantlyApiKey = process.env.INSTANTLY_API_KEY;
  if (!hmacSecret || !instantlyApiKey) {
    console.error("Unsubscribe: missing UNSUBSCRIBE_HMAC_SECRET or INSTANTLY_API_KEY");
    res.status(500).json({ success: false, error: "Server configuration error" });
    return;
  }

  if (!sig || !verifySig(ref, sig, hmacSecret)) {
    res.status(403).json({ success: false, error: "Invalid unsubscribe link" });
    return;
  }

  try {
    const result = await processUnsubscribe(ref, instantlyApiKey);
    if ("error" in result) {
      res.status(result.status).json({ success: false, error: result.error });
    } else {
      res.status(200).json({ success: true });
    }
  } catch (err) {
    console.error(`Unsubscribe: unexpected failure for handle="${ref}"`, err);
    res.status(500).json({ success: false, error: BLOCK_FAILED_ERROR });
  }
}

// Core logic.

export async function processUnsubscribe(
  ref: string,
  instantlyApiKey: string,
): Promise<UnsubscribeResult> {
  const leads = await findInstantlyLeads(ref, instantlyApiKey);
  if (leads.length === 0) {
    console.error(`Unsubscribe: no Instantly lead with lead_handle="${ref}"`);
    return { success: false, error: NOT_FOUND_ERROR, status: 404 };
  }

  const emails = [...new Set(leads.map((lead) => lead.email.toLowerCase()).filter(Boolean))];
  for (const email of emails) {
    if (!(await blocklistEmail(email, instantlyApiKey))) {
      return { success: false, error: BLOCK_FAILED_ERROR, status: 502 };
    }
  }

  // The blocklist already stops every future email; deleting is cleanup, so a failed delete
  // is logged and does not turn the answer into an error.
  for (const lead of leads) {
    await deleteInstantlyLead(lead.id, instantlyApiKey);
  }

  await updateAttioIfConfigured(ref, leads[0]);
  return { success: true };
}

// Instantly helpers.

interface InstantlyLead {
  id: string;
  email: string;
  domain: string;
}

function leadHandleOf(item: any): string {
  return item?.payload?.lead_handle ?? item?.custom_variables?.lead_handle ?? "";
}

function extractDomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

// Instantly's search matches text in the lead's name, email and company, not custom
// variables, so search with a few renderings of the handle and keep only exact
// lead_handle matches. Measured on 40 leads: the handle with spaces or as-is finds 36;
// the longest words cover brand names with punctuation ("Pam's Touch" -> "touch").
export function searchTermsFor(ref: string): string[] {
  const words = ref.split("-").filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
  const longest = [...words].sort((a, b) => b.length - a.length).slice(0, 2);
  return [...new Set([ref.replace(/-/g, " "), ref, ...longest])];
}

export async function findInstantlyLeads(ref: string, apiKey: string): Promise<InstantlyLead[]> {
  const results = await Promise.all(
    searchTermsFor(ref).map((term) => listInstantlyLeads(term, apiKey)),
  );
  const byId = new Map<string, InstantlyLead>();
  for (const item of results.flat()) {
    if (leadHandleOf(item) !== ref || !item.id) continue;
    byId.set(item.id, {
      id: item.id,
      email: item.email ?? "",
      domain: extractDomain(item.company_domain || item.website || ""),
    });
  }
  return [...byId.values()];
}

async function listInstantlyLeads(search: string, apiKey: string): Promise<any[]> {
  try {
    const resp = await fetch(`${INSTANTLY_BASE}/leads/list`, {
      method: "POST",
      headers: instantlyHeaders(apiKey),
      body: JSON.stringify({ search, limit: 100 }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!resp.ok) {
      console.error(`Unsubscribe: Instantly leads/list failed (${resp.status}) for "${search}"`);
      return [];
    }
    return (await resp.json()).items ?? [];
  } catch (err) {
    console.error(`Unsubscribe: Instantly leads/list threw for "${search}"`, err);
    return [];
  }
}

async function blocklistEmail(email: string, apiKey: string): Promise<boolean> {
  const resp = await fetch(`${INSTANTLY_BASE}/block-lists-entries`, {
    method: "POST",
    headers: instantlyHeaders(apiKey),
    body: JSON.stringify({ bl_value: email }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (resp.ok) return true;
  const body = await resp.text();
  // Already blocklisted counts as done.
  if (resp.status === 409 || /already|exist/i.test(body)) return true;
  console.error(`Unsubscribe: blocklist failed (${resp.status}): ${body.slice(0, 200)}`);
  return false;
}

async function deleteInstantlyLead(leadId: string, apiKey: string): Promise<void> {
  try {
    const resp = await fetch(`${INSTANTLY_BASE}/leads/${leadId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!resp.ok) {
      console.error(`Unsubscribe: Instantly lead delete failed for ${leadId} (${resp.status})`);
    }
  } catch (err) {
    console.error(`Unsubscribe: Instantly lead delete threw for ${leadId}`, err);
  }
}

function instantlyHeaders(apiKey: string): Record<string, string> {
  return { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
}

// Attio (optional, last). Removed entirely once Attio is retired.

async function updateAttioIfConfigured(ref: string, lead: InstantlyLead): Promise<void> {
  const apiKey = process.env.ATTIO_API_KEY;
  const stageId = process.env.ATTIO_DEAL_STAGE_LOST_UNSUBSCRIBED;
  if (!apiKey || !stageId) return;
  try {
    const domain = lead.domain || lead.email.split("@")[1] || "";
    if (!domain) return;
    const companyId = await findAttioCompanyByDomain(domain, apiKey);
    if (!companyId) return;
    const dealId = await findAttioDealForCompany(companyId, apiKey);
    if (!dealId) return;
    await attioFetch(`/objects/deals/records/${dealId}`, apiKey, "PATCH", {
      data: { values: { stage: [{ status: stageId }] } },
    });
    const ts = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    await attioFetch("/objects/pipeline_event_log/records", apiKey, "POST", {
      data: {
        values: {
          name: [{ value: `[${ts}] ${lead.email} — unsubscribe (self_service, ${ref})` }],
          event_timestamp: [{ value: ts }],
          synced_at: [{ value: ts }],
          lead_email: [{ value: lead.email }],
          payload_summary: [
            {
              value: [
                "UNSUBSCRIBE",
                "",
                "EVIDENCE",
                `- handle: ${ref}`,
                "- action: recipient confirmed on bizmis.ai/unsubscribe",
                "- instantly: email blocklisted, lead deleted",
                "",
                "SOURCE: bizmis.ai/api/unsubscribe",
              ].join("\n"),
            },
          ],
          related_deal: [{ target_record_id: dealId, target_object: "deals" }],
        },
      },
    });
  } catch (err) {
    console.error(`Unsubscribe: Attio update skipped for handle="${ref}"`, err);
  }
}

async function findAttioCompanyByDomain(domain: string, apiKey: string): Promise<string | null> {
  const data = await attioFetch("/objects/companies/records/query", apiKey, "POST", {
    filter: { domains: { domain: { $eq: domain } } },
    limit: 1,
  });
  return data?.data?.[0]?.id?.record_id ?? null;
}

async function findAttioDealForCompany(companyId: string, apiKey: string): Promise<string | null> {
  const data = await attioFetch("/objects/deals/records/query", apiKey, "POST", {
    filter: { associated_company: { target_record_id: { $eq: companyId } } },
    limit: 1,
  });
  return data?.data?.[0]?.id?.record_id ?? null;
}

async function attioFetch(path: string, apiKey: string, method: string, body: unknown): Promise<any> {
  const resp = await fetch(`${ATTIO_BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!resp.ok) {
    console.error(`Unsubscribe: Attio ${method} ${path} failed (${resp.status})`);
    return null;
  }
  return resp.json();
}
