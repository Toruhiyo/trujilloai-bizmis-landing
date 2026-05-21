#!/usr/bin/env python3
"""bizmis_deploy_lead.py — Phase C: deploy a fully-built invite card lead.

Runs all deployment steps after Phase A (card build) and Phase B (avatar gen) are done.

Steps per lead:
  C1  Generate mockup PNG (npm run generate:email-compositions -- <handle>)
  C2  Ensure src/data/leads/index.ts import + RAW_LEADS entry
  C3  Upload public/invite-cards/leads/<handle>/email/mockup.png to Vercel Blob
  C4  Verify https://www.bizmis.ai/invite-cards/leads/<handle>/email/mockup.png → 200
  C5  Create Attio render config note on Company (supersede if exists)
  C6  Find or create Attio Person for contact email
  C7  Find or create Attio Deal (Cold Outreach) on Company
  C8  Enroll in Instantly EA campaign (skip_if_in_campaign)
  C9  Append Sync Log entry (pipeline_event_log)

Outputs a JSON report per lead to stdout.

Requirements in .env (or environment):
  BLOB_READ_WRITE_TOKEN   — Vercel Blob token (already present)
  ATTIO_API_KEY           — Attio API key with scopes:
                              Read/Write: People, Companies, Deals, Notes,
                              pipeline_event_log object
  INSTANTLY_API_KEY       — Instantly v2 API key (from Instantly dashboard)
                            OR leave unset to fall back to MCP proxy call

Usage:
  ./scripts/bizmis_deploy_lead.py gymshark bodega nanoleaf
  ./scripts/bizmis_deploy_lead.py gymshark --dry-run
  ./scripts/bizmis_deploy_lead.py gymshark --skip-mockup  # if mockup already generated
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
import vercel_blob

# ── Paths & constants ──────────────────────────────────────────────────────────

LANDING_ROOT = Path(__file__).parent.parent.resolve()

ATTIO_BASE = "https://api.attio.com/v2"
INSTANTLY_BASE = "https://api.instantly.ai/api/v2"
INSTANTLY_MCP_URL = "https://mcp.instantly.ai/mcp"
INSTANTLY_MCP_TOKEN = "NGU5NWMyYzYtZDNiMy00MTBhLWJlMTYtMmZmODQ5M2QxYmQzOk5JS3dieUVzYUFlQQ=="

INSTANTLY_EA_CAMPAIGN_ID = "1116511c-2959-4fa3-acf4-9dfd2716eed2"
ATTIO_OWNER_ID = "2e4677f1-07f2-4e35-8d68-c20a4e69cc6f"
ATTIO_DEAL_STAGE_COLD_OUTREACH = "334f83c6-beb0-4f25-9f17-a438ae69f24e"
ATTIO_EVENT_TYPE_LEAD_QUEUED = "b37d5fce-4ba0-4943-9804-8bf248eb187b"

HTTP_TIMEOUT = 30

# ── .env loader ────────────────────────────────────────────────────────────────

def _load_env() -> None:
    env_path = LANDING_ROOT / ".env"
    if not env_path.exists():
        return
    for raw in env_path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        k = k.strip()
        v = v.strip().strip("'\"")
        if k not in os.environ:
            os.environ[k] = v


# ── Attio helpers ──────────────────────────────────────────────────────────────

def _attio_hdrs(token: str) -> dict:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def attio_find_company(token: str, domain: str) -> dict | None:
    r = requests.post(
        f"{ATTIO_BASE}/objects/companies/records/query",
        headers=_attio_hdrs(token),
        json={"filter": {"domains": {"$eq": domain}}, "limit": 1},
        timeout=HTTP_TIMEOUT,
    )
    r.raise_for_status()
    data = r.json().get("data", [])
    return data[0] if data else None


def attio_find_person_by_email(token: str, email: str) -> dict | None:
    r = requests.post(
        f"{ATTIO_BASE}/objects/people/records/query",
        headers=_attio_hdrs(token),
        json={"filter": {"email_addresses": {"$eq": email}}, "limit": 1},
        timeout=HTTP_TIMEOUT,
    )
    r.raise_for_status()
    data = r.json().get("data", [])
    return data[0] if data else None


def attio_create_person(
    token: str, first_name: str, last_name: str | None, email: str, company_id: str
) -> dict:
    name_obj = {
        "first_name": first_name,
        "last_name": last_name or "",
        "full_name": f"{first_name} {last_name}".strip() if last_name else first_name,
    }
    r = requests.post(
        f"{ATTIO_BASE}/objects/people/records",
        headers=_attio_hdrs(token),
        json={
            "data": {
                "values": {
                    "name": [name_obj],
                    "email_addresses": [{"email_address": email}],
                    "company": [{"target_record_id": company_id, "target_object": "companies"}],
                }
            }
        },
        timeout=HTTP_TIMEOUT,
    )
    r.raise_for_status()
    return r.json()


def attio_find_deal(token: str, company_id: str) -> dict | None:
    r = requests.post(
        f"{ATTIO_BASE}/objects/deals/records/query",
        headers=_attio_hdrs(token),
        json={
            "filter": {
                "$and": [
                    {"associated_company": {"$eq": company_id}},
                    {"stage": {"$eq": ATTIO_DEAL_STAGE_COLD_OUTREACH}},
                ]
            },
            "limit": 1,
        },
        timeout=HTTP_TIMEOUT,
    )
    r.raise_for_status()
    data = r.json().get("data", [])
    return data[0] if data else None


def attio_create_deal(token: str, name: str, company_id: str, person_id: str) -> dict:
    r = requests.post(
        f"{ATTIO_BASE}/objects/deals/records",
        headers=_attio_hdrs(token),
        json={
            "data": {
                "values": {
                    "name": [{"value": name}],
                    "stage": [{"status_id": ATTIO_DEAL_STAGE_COLD_OUTREACH}],
                    "owner": [
                        {
                            "referenced_actor_type": "workspace-member",
                            "referenced_actor_id": ATTIO_OWNER_ID,
                        }
                    ],
                    "associated_people": [
                        {"target_record_id": person_id, "target_object": "people"}
                    ],
                    "associated_company": [
                        {"target_record_id": company_id, "target_object": "companies"}
                    ],
                    "source_campaign": [{"value": "bizmis-early-access"}],
                }
            }
        },
        timeout=HTTP_TIMEOUT,
    )
    r.raise_for_status()
    return r.json()


def attio_list_notes(token: str, company_id: str) -> list[dict]:
    r = requests.get(
        f"{ATTIO_BASE}/notes",
        headers=_attio_hdrs(token),
        params={"parent_record_object": "companies", "parent_record_id": company_id, "limit": 50},
        timeout=HTTP_TIMEOUT,
    )
    r.raise_for_status()
    return r.json().get("data", [])


def attio_create_note(token: str, company_id: str, title: str, content: str) -> dict:
    r = requests.post(
        f"{ATTIO_BASE}/notes",
        headers=_attio_hdrs(token),
        json={
            "data": {
                "parent_object": "companies",
                "parent_record_id": company_id,
                "title": title,
                "content_plaintext": content,
            }
        },
        timeout=HTTP_TIMEOUT,
    )
    r.raise_for_status()
    return r.json()


def attio_create_sync_log(
    token: str,
    email: str,
    handle: str,
    person_id: str,
    payload_summary: str,
) -> dict:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    r = requests.post(
        f"{ATTIO_BASE}/objects/pipeline_event_log/records",
        headers=_attio_hdrs(token),
        json={
            "data": {
                "values": {
                    "name": [{"value": f"[{ts}] {email} — lead_queued (stage_1_onboard, {handle})"}],
                    "event_type": [{"option": ATTIO_EVENT_TYPE_LEAD_QUEUED}],
                    "event_timestamp": [{"value": ts}],
                    "synced_at": [{"value": ts}],
                    "lead_email": [{"value": email}],
                    "payload_summary": [{"value": payload_summary}],
                    "related_person": [{"target_record_id": person_id, "target_object": "people"}],
                }
            }
        },
        timeout=HTTP_TIMEOUT,
    )
    r.raise_for_status()
    return r.json()


# ── Instantly helpers ──────────────────────────────────────────────────────────

def instantly_enroll(api_key: str | None, leads: list[dict]) -> dict:
    """Enroll leads via Instantly REST API (if api_key set) or MCP proxy HTTP."""
    payload = {
        "campaign_id": INSTANTLY_EA_CAMPAIGN_ID,
        "skip_if_in_campaign": True,
        "leads": leads,
    }

    if api_key:
        r = requests.post(
            f"{INSTANTLY_BASE}/leads/add-bulk",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=payload,
            timeout=60,
        )
        r.raise_for_status()
        return r.json()

    # Fallback: call MCP proxy via JSON-RPC HTTP
    r = requests.post(
        INSTANTLY_MCP_URL,
        headers={
            "Authorization": f"Bearer {INSTANTLY_MCP_TOKEN}",
            "Content-Type": "application/json",
        },
        json={
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": "add_leads_to_campaign_or_list_bulk",
                "arguments": {"params": payload},
            },
        },
        timeout=60,
    )
    r.raise_for_status()
    rpc = r.json()
    if "error" in rpc:
        raise RuntimeError(f"MCP proxy error: {rpc['error']}")
    # MCP result content is a list of content blocks; first is text with JSON
    content = rpc.get("result", {}).get("content", [{}])
    text = content[0].get("text", "{}") if content else "{}"
    return json.loads(text) if text.startswith("{") else {"raw": text}


# ── index.ts helper ────────────────────────────────────────────────────────────

def _to_camel(handle: str) -> str:
    """gymshark → gymshark, upscale-audio → upscaleAudio, jdm_engine → jdmEngine"""
    return re.sub(r"[-_](.)", lambda m: m.group(1).upper(), handle)


def ensure_index_ts(handle: str) -> str:
    """Ensure handle is imported and in RAW_LEADS. Returns 'added' or 'exists'."""
    index_path = LANDING_ROOT / "src/data/leads/index.ts"
    src = index_path.read_text()
    camel = _to_camel(handle)
    import_line = f'import {camel} from "./{handle}.json";'

    if import_line in src and re.search(rf"\b{camel}\b", src.split("const RAW_LEADS")[1]):
        return "exists"

    if import_line not in src:
        # Insert before the blank line before `const RAW_LEADS`
        src = re.sub(
            r"(\nimport \w+ from \".+\.json\";\n)(\nconst RAW_LEADS)",
            rf"\1{import_line}\n\2",
            src,
        )

    # Add to RAW_LEADS array before closing ];
    if re.search(rf"\b{camel}\b", src.split("const RAW_LEADS")[1]) is None:
        src = re.sub(r"(\];)", f"  {camel},\n]];", src, count=1)
        # fix double ]] artifact
        src = src.replace("]];", "];")

    index_path.write_text(src)
    return "added"


# ── Mockup generation ──────────────────────────────────────────────────────────

def generate_mockup(handle: str) -> None:
    proc = subprocess.run(
        ["npm", "run", "generate:email-compositions", "--", handle],
        cwd=LANDING_ROOT,
        capture_output=True,
        text=True,
        timeout=120,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"mockup generation failed (exit {proc.returncode}): {proc.stderr[:400]}")
    mockup = LANDING_ROOT / f"public/invite-cards/leads/{handle}/email/mockup.png"
    if not mockup.exists():
        raise RuntimeError("mockup generation succeeded but file not found")


# ── Per-lead Phase C ───────────────────────────────────────────────────────────

def deploy_lead(
    handle: str,
    *,
    attio_token: str,
    blob_token: str,
    instantly_key: str | None,
    dry_run: bool = False,
    skip_mockup: bool = False,
) -> dict:
    result: dict = {"handle": handle, "status": "FAILED", "steps": {}, "artifacts": {}, "errors": []}

    # ── Load lead JSON ─────────────────────────────────────────────────────────
    json_path = LANDING_ROOT / f"src/data/leads/{handle}.json"
    if not json_path.exists():
        result["errors"].append(f"lead JSON not found: {json_path}")
        return result
    lead = json.loads(json_path.read_text())

    contact_email = lead.get("leadContactEmail")
    if not contact_email:
        result["errors"].append(
            "leadContactEmail missing from lead JSON — add it before running deploy"
        )
        return result

    # ── C1: Mockup ────────────────────────────────────────────────────────────
    mockup_path = LANDING_ROOT / f"public/invite-cards/leads/{handle}/email/mockup.png"
    if skip_mockup or mockup_path.exists():
        result["steps"]["C1_mockup"] = "skip (exists)"
    else:
        if not dry_run:
            generate_mockup(handle)
        result["steps"]["C1_mockup"] = "generated" if not dry_run else "dry-run"
    result["artifacts"]["mockup_local"] = str(mockup_path)

    # ── C2: index.ts ──────────────────────────────────────────────────────────
    if not dry_run:
        result["steps"]["C2_index_ts"] = ensure_index_ts(handle)
    else:
        result["steps"]["C2_index_ts"] = "dry-run"

    # ── C3: Blob upload ────────────────────────────────────────────────────────
    blob_url = f"https://www.bizmis.ai/invite-cards/leads/{handle}/email/mockup.png"
    if not dry_run:
        remote = f"invite-cards/leads/{handle}/email/mockup.png"
        for attempt in range(1, 4):
            try:
                with open(mockup_path, "rb") as f:
                    res = vercel_blob.put(remote, f.read(), {"allowOverwrite": "true", "token": blob_token})
                result["steps"]["C3_blob"] = "uploaded"
                result["artifacts"]["blob_url"] = res.get("url", blob_url)
                break
            except Exception as exc:
                if attempt == 3:
                    result["errors"].append(f"blob upload failed: {exc}")
                    return result
                time.sleep(2 ** attempt)
    else:
        result["steps"]["C3_blob"] = "dry-run"
        result["artifacts"]["blob_url"] = blob_url

    # ── C4: Verify live URL ────────────────────────────────────────────────────
    if not dry_run:
        for attempt in range(2):
            try:
                r = requests.head(blob_url, allow_redirects=True, timeout=15)
                if r.status_code == 200:
                    result["steps"]["C4_live_url"] = "200"
                    break
            except Exception:
                pass
            if attempt == 0:
                time.sleep(10)
        else:
            result["errors"].append(f"live URL not 200: {blob_url}")
            return result
    else:
        result["steps"]["C4_live_url"] = "dry-run"

    # ── Attio: find company ────────────────────────────────────────────────────
    company = attio_find_company(attio_token, lead["storeDomain"])
    if not company:
        result["errors"].append(f"Attio Company not found for domain {lead['storeDomain']}")
        return result
    company_id = company["id"]["record_id"]
    result["artifacts"]["attio_company_id"] = company_id

    # ── C5: Render config note ─────────────────────────────────────────────────
    if not dry_run:
        note_title = f"Render config — {handle}"
        existing = [n for n in attio_list_notes(attio_token, company_id) if n.get("title") == note_title]
        note_content = json.dumps(lead, indent=2, ensure_ascii=False)
        note = attio_create_note(attio_token, company_id, note_title, note_content)
        note_id = note["data"]["id"]["note_id"]
        if existing:
            result["steps"]["C5_note"] = f"superseded (new={note_id})"
        else:
            result["steps"]["C5_note"] = f"created:{note_id}"
        result["artifacts"]["attio_note_id"] = note_id
    else:
        result["steps"]["C5_note"] = "dry-run"

    # ── C6: Person ────────────────────────────────────────────────────────────
    person = attio_find_person_by_email(attio_token, contact_email)
    if person:
        person_id = person["id"]["record_id"]
        result["steps"]["C6_person"] = f"exists:{person_id}"
    elif not dry_run:
        created = attio_create_person(
            attio_token,
            lead.get("leadContactName") or "",
            lead.get("leadContactLastName"),
            contact_email,
            company_id,
        )
        person_id = created["data"]["id"]["record_id"]
        result["steps"]["C6_person"] = f"created:{person_id}"
    else:
        person_id = "dry-run"
        result["steps"]["C6_person"] = "dry-run"
    result["artifacts"]["attio_person_id"] = person_id

    # ── C7: Deal ──────────────────────────────────────────────────────────────
    deal = attio_find_deal(attio_token, company_id)
    if deal:
        deal_id = deal["id"]["record_id"]
        result["steps"]["C7_deal"] = f"exists:{deal_id}"
    elif not dry_run:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        created = attio_create_deal(
            attio_token,
            f"{lead['storeName']} — Cold Outreach {today}",
            company_id,
            person_id,
        )
        deal_id = created["data"]["id"]["record_id"]
        result["steps"]["C7_deal"] = f"created:{deal_id}"
    else:
        deal_id = "dry-run"
        result["steps"]["C7_deal"] = "dry-run"
    result["artifacts"]["attio_deal_id"] = deal_id

    # ── C8: Instantly enrollment ───────────────────────────────────────────────
    if not dry_run:
        accent = lead.get("textColor") or lead.get("logoColorOverlay") or "#000000"
        instantly_lead = {
            "email": contact_email,
            "first_name": lead.get("leadContactName"),
            "last_name": lead.get("leadContactLastName"),
            "company_name": lead["storeName"],
            "website": f"https://{lead['storeDomain']}",
            "custom_variables": {
                "lead_brand": lead["storeName"],
                "lead_handle": handle,
                "access_code": f"BIZMIS-EARLY-ACCESS-{handle.upper()}",
                "store_accent_color": accent,
                "utm_campaign": "bizmis-early-access",
            },
        }
        # Remove None values from top-level
        instantly_lead = {k: v for k, v in instantly_lead.items() if v is not None}
        enroll_result = instantly_enroll(instantly_key, [instantly_lead])
        created_leads = enroll_result.get("created_leads", [])
        duplicated = enroll_result.get("duplicated_leads", 0)
        if duplicated:
            result["steps"]["C8_instantly"] = "already_in_campaign"
            instantly_lead_id = None
        elif created_leads:
            instantly_lead_id = created_leads[0].get("id")
            result["steps"]["C8_instantly"] = f"enrolled:{instantly_lead_id}"
        else:
            instantly_lead_id = None
            result["steps"]["C8_instantly"] = f"unknown:{enroll_result}"
        result["artifacts"]["instantly_lead_id"] = instantly_lead_id
    else:
        result["steps"]["C8_instantly"] = "dry-run"

    # ── C9: Sync Log ──────────────────────────────────────────────────────────
    if not dry_run:
        summary_lines = [
            "LEAD_QUEUED",
            "",
            "EVIDENCE",
            f"- handle: {handle}",
            f"- contact: {contact_email}",
            f"- instantly_lead_id: {result['artifacts'].get('instantly_lead_id')}",
            "",
            "STATE CHANGES WRITTEN",
            f"- note: {result['artifacts'].get('attio_note_id')}",
            f"- person: {result['artifacts'].get('attio_person_id')}",
            f"- deal: {result['artifacts'].get('attio_deal_id')}",
            f"- mockup: {blob_url}",
            f"- instantly: {result['steps'].get('C8_instantly')}",
        ]
        sync = attio_create_sync_log(
            attio_token,
            contact_email,
            handle,
            person_id,
            "\n".join(summary_lines),
        )
        log_id = sync["data"]["id"]["record_id"]
        result["steps"]["C9_sync_log"] = f"created:{log_id}"
        result["artifacts"]["sync_log_id"] = log_id
    else:
        result["steps"]["C9_sync_log"] = "dry-run"

    result["status"] = "READY"
    return result


# ── CLI ────────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("handles", nargs="+", help="Lead handle(s) to deploy (e.g. gymshark bodega)")
    parser.add_argument("--dry-run", action="store_true", help="Validate only, no writes")
    parser.add_argument("--skip-mockup", action="store_true", help="Skip mockup generation (use existing)")
    args = parser.parse_args()

    _load_env()

    attio_token = os.environ.get("ATTIO_API_KEY")
    blob_token = os.environ.get("BLOB_READ_WRITE_TOKEN")
    instantly_key = os.environ.get("INSTANTLY_API_KEY")  # optional; falls back to MCP proxy

    missing = []
    if not attio_token:
        missing.append("ATTIO_API_KEY (create at Attio → Settings → Developers with People/Companies/Deals/Notes/pipeline_event_log scopes)")
    if not blob_token:
        missing.append("BLOB_READ_WRITE_TOKEN")
    if missing:
        print("ERROR: missing env vars:", file=sys.stderr)
        for m in missing:
            print(f"  {m}", file=sys.stderr)
        sys.exit(1)

    results = []
    for handle in args.handles:
        print(f"[{handle}] deploying...", file=sys.stderr)
        r = deploy_lead(
            handle,
            attio_token=attio_token,
            blob_token=blob_token,
            instantly_key=instantly_key,
            dry_run=args.dry_run,
            skip_mockup=args.skip_mockup,
        )
        results.append(r)
        status_icon = "✓" if r["status"] == "READY" else "✗"
        print(f"[{handle}] {status_icon} {r['status']} — {r['steps']}", file=sys.stderr)

    print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
