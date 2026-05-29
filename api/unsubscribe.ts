import type { VercelRequest, VercelResponse } from "@vercel/node";

const INSTANTLY_BASE = "https://api.instantly.ai/api/v2";
const ATTIO_BASE = "https://api.attio.com/v2";
const REF_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TIMEOUT_MS = 15_000;

type UnsubscribeResult =
  | { success: true }
  | { success: false; error: string };

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
  if (!ref || !REF_PATTERN.test(ref)) {
    res.status(400).json({ success: false, error: "Invalid or missing ref parameter" });
    return;
  }

  const instantlyApiKey = process.env.INSTANTLY_API_KEY;
  const instantlyCampaignId = process.env.INSTANTLY_EA_CAMPAIGN_ID;
  const attioApiKey = process.env.ATTIO_API_KEY;
  const attioUnsubStageId = process.env.ATTIO_DEAL_STAGE_LOST_UNSUBSCRIBED;

  if (!instantlyApiKey || !instantlyCampaignId || !attioApiKey || !attioUnsubStageId) {
    res.status(500).json({ success: false, error: "Server configuration error" });
    return;
  }

  try {
    const result = await processUnsubscribe(
      ref,
      instantlyApiKey,
      instantlyCampaignId,
      attioApiKey,
      attioUnsubStageId,
    );
    res.status(result.success ? 200 : 422).json(result);
  } catch {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

// Core logic.

async function processUnsubscribe(
  ref: string,
  instantlyApiKey: string,
  campaignId: string,
  attioApiKey: string,
  unsubStageId: string,
): Promise<UnsubscribeResult> {
  const lead = await findInstantlyLeadByHandle(ref, instantlyApiKey, campaignId);
  if (lead) {
    await deleteInstantlyLead(lead.id, instantlyApiKey);
  }

  const dealId = await findAttioDealByHandle(ref, attioApiKey);
  if (dealId) {
    await moveAttioDeadToUnsubscribed(dealId, unsubStageId, attioApiKey);
    await appendAttioSyncLog(ref, dealId, attioApiKey);
  }

  return { success: true };
}

// Instantly helpers.

interface InstantlyLead {
  id: string;
  email: string;
}

async function findInstantlyLeadByHandle(
  handle: string,
  apiKey: string,
  campaignId: string,
): Promise<InstantlyLead | null> {
  const resp = await fetch(`${INSTANTLY_BASE}/leads/list`, {
    method: "POST",
    headers: instantlyHeaders(apiKey),
    body: JSON.stringify({ campaign_id: campaignId, search: handle, limit: 50 }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!resp.ok) return null;

  const data = await resp.json();
  const items: any[] = data.items ?? [];
  for (const item of items) {
    const vars = item.custom_variables ?? {};
    if (vars.lead_handle === handle && item.campaign === campaignId) {
      return { id: item.id, email: item.email ?? "" };
    }
  }
  return null;
}

async function deleteInstantlyLead(leadId: string, apiKey: string): Promise<void> {
  await fetch(`${INSTANTLY_BASE}/leads/${leadId}`, {
    method: "DELETE",
    headers: instantlyHeaders(apiKey),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

function instantlyHeaders(apiKey: string): Record<string, string> {
  return { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
}

// Attio helpers.

async function findAttioDealByHandle(
  handle: string,
  apiKey: string,
): Promise<string | null> {
  const companiesResp = await fetch(`${ATTIO_BASE}/objects/companies/records/query`, {
    method: "POST",
    headers: attioHeaders(apiKey),
    body: JSON.stringify({ filter: { name: { $contains: handle } }, limit: 5 }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!companiesResp.ok) return null;

  const companies = (await companiesResp.json()).data ?? [];
  for (const company of companies) {
    const companyId = company.id?.record_id;
    if (!companyId) continue;

    const dealsResp = await fetch(`${ATTIO_BASE}/objects/deals/records/query`, {
      method: "POST",
      headers: attioHeaders(apiKey),
      body: JSON.stringify({
        filter: { associated_company: { target_record_id: { $eq: companyId } } },
        limit: 1,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!dealsResp.ok) continue;

    const deals = (await dealsResp.json()).data ?? [];
    if (deals.length > 0) return deals[0].id?.record_id ?? null;
  }

  return null;
}

async function moveAttioDeadToUnsubscribed(
  dealId: string,
  stageId: string,
  apiKey: string,
): Promise<void> {
  await fetch(`${ATTIO_BASE}/objects/deals/records/${dealId}`, {
    method: "PATCH",
    headers: attioHeaders(apiKey),
    body: JSON.stringify({ data: { values: { stage: [{ status: stageId }] } } }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

async function appendAttioSyncLog(
  handle: string,
  dealId: string,
  apiKey: string,
): Promise<void> {
  const ts = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  const summary = [
    "UNSUBSCRIBE",
    "",
    "EVIDENCE",
    `- handle: ${handle}`,
    `- action: recipient clicked unsubscribe link`,
    "",
    "SOURCE: bizmis.ai/api/unsubscribe",
  ].join("\n");

  await fetch(`${ATTIO_BASE}/objects/pipeline_event_log/records`, {
    method: "POST",
    headers: attioHeaders(apiKey),
    body: JSON.stringify({
      data: {
        values: {
          name: [{ value: `[${ts}] ${handle} — unsubscribe (self_service)` }],
          event_timestamp: [{ value: ts }],
          synced_at: [{ value: ts }],
          payload_summary: [{ value: summary }],
          related_deal: [{ target_record_id: dealId, target_object: "deals" }],
        },
      },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

function attioHeaders(apiKey: string): Record<string, string> {
  return { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
}
