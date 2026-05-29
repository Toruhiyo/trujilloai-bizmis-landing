import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHmac, timingSafeEqual } from "node:crypto";

const INSTANTLY_BASE = "https://api.instantly.ai/api/v2";
const ATTIO_BASE = "https://api.attio.com/v2";
const REF_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HMAC_HEX_LENGTH = 16;
const TIMEOUT_MS = 15_000;

type UnsubscribeResult =
  | { success: true }
  | { success: false; error: string };

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

  const requiredEnv = {
    UNSUBSCRIBE_HMAC_SECRET: process.env.UNSUBSCRIBE_HMAC_SECRET,
    INSTANTLY_API_KEY: process.env.INSTANTLY_API_KEY,
    INSTANTLY_EA_CAMPAIGN_ID: process.env.INSTANTLY_EA_CAMPAIGN_ID,
    ATTIO_API_KEY: process.env.ATTIO_API_KEY,
    ATTIO_DEAL_STAGE_LOST_UNSUBSCRIBED: process.env.ATTIO_DEAL_STAGE_LOST_UNSUBSCRIBED,
  };
  const missingEnv = Object.entries(requiredEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingEnv.length > 0) {
    console.error(`Missing required env vars: ${missingEnv.join(", ")}`);
    res.status(500).json({ success: false, error: "Server configuration error" });
    return;
  }

  const hmacSecret = requiredEnv.UNSUBSCRIBE_HMAC_SECRET as string;
  const instantlyApiKey = requiredEnv.INSTANTLY_API_KEY as string;
  const instantlyCampaignId = requiredEnv.INSTANTLY_EA_CAMPAIGN_ID as string;
  const attioApiKey = requiredEnv.ATTIO_API_KEY as string;
  const attioUnsubStageId = requiredEnv.ATTIO_DEAL_STAGE_LOST_UNSUBSCRIBED as string;

  if (!sig || !verifySig(ref, sig, hmacSecret)) {
    res.status(403).json({ success: false, error: "Invalid unsubscribe link" });
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

  const domain = lead ? extractDomain(lead.website) : "";
  const dealId = await findAttioDeal(domain, lead?.companyName ?? "", ref, attioApiKey);
  if (dealId) {
    await moveAttioDealToUnsubscribed(dealId, unsubStageId, attioApiKey);
    await appendAttioSyncLog(ref, dealId, attioApiKey);
  } else {
    console.error(`Unsubscribe: no Attio deal resolved for handle="${ref}" domain="${domain}"`);
  }

  return { success: true };
}

// Instantly helpers.

interface InstantlyLead {
  id: string;
  email: string;
  website: string;
  companyName: string;
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
      return {
        id: item.id,
        email: item.email ?? "",
        website: item.website ?? "",
        companyName: item.company_name ?? "",
      };
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

function extractDomain(website: string): string {
  return website
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

async function findAttioDeal(
  domain: string,
  companyName: string,
  handle: string,
  apiKey: string,
): Promise<string | null> {
  const nameGuess = companyName || handle.replace(/-/g, " ");
  const companyId =
    (domain ? await findAttioCompanyByDomain(domain, apiKey) : null) ??
    (nameGuess ? await findAttioCompanyByName(nameGuess, apiKey) : null);
  if (!companyId) {
    console.error(
      `Unsubscribe: no Attio company for handle="${handle}" domain="${domain}" name="${nameGuess}"`,
    );
    return null;
  }
  return findAttioDealForCompany(companyId, apiKey);
}

async function findAttioCompanyByDomain(domain: string, apiKey: string): Promise<string | null> {
  const resp = await queryAttioCompanies({ domains: { $eq: domain } }, apiKey);
  return resp[0]?.id?.record_id ?? null;
}

async function findAttioCompanyByName(name: string, apiKey: string): Promise<string | null> {
  const resp = await queryAttioCompanies({ name: { $contains: name } }, apiKey);
  return resp[0]?.id?.record_id ?? null;
}

async function queryAttioCompanies(filter: unknown, apiKey: string): Promise<any[]> {
  const resp = await fetch(`${ATTIO_BASE}/objects/companies/records/query`, {
    method: "POST",
    headers: attioHeaders(apiKey),
    body: JSON.stringify({ filter, limit: 1 }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!resp.ok) {
    console.error(`Unsubscribe: Attio company query failed (${resp.status})`);
    return [];
  }
  return (await resp.json()).data ?? [];
}

async function findAttioDealForCompany(companyId: string, apiKey: string): Promise<string | null> {
  const resp = await fetch(`${ATTIO_BASE}/objects/deals/records/query`, {
    method: "POST",
    headers: attioHeaders(apiKey),
    body: JSON.stringify({
      filter: { associated_company: { target_record_id: { $eq: companyId } } },
      limit: 1,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!resp.ok) {
    console.error(`Unsubscribe: Attio deal query failed (${resp.status})`);
    return null;
  }
  const deals = (await resp.json()).data ?? [];
  return deals[0]?.id?.record_id ?? null;
}

async function moveAttioDealToUnsubscribed(
  dealId: string,
  stageId: string,
  apiKey: string,
): Promise<void> {
  const resp = await fetch(`${ATTIO_BASE}/objects/deals/records/${dealId}`, {
    method: "PATCH",
    headers: attioHeaders(apiKey),
    body: JSON.stringify({ data: { values: { stage: [{ status: stageId }] } } }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!resp.ok) {
    console.error(`Unsubscribe: Attio stage move failed for deal ${dealId} (${resp.status})`);
  }
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
