import type { LeadEarlyAccessData, LeadEarlyAccessJson } from "./_schema";

/**
 * Per-lead JSON files are produced by the bizmis-skills sync script
 * (`scripts/invite-cards/sync-leads-to-landing.mjs`) and are intentionally
 * gitignored — the source of truth lives in `bizmis-skills/data/invite-cards/`.
 *
 * This loader auto-discovers whatever JSON files happen to exist locally via
 * Vite's `import.meta.glob`. Production builds run without the sibling skills
 * repo, so the array gracefully falls back to empty and the admin pages that
 * rely on it simply render no entries.
 *
 * The system template file (`__instantly-template.json`) is excluded — it's
 * embedded inline in `instantlyTemplate.ts` instead.
 */
const RAW_LEAD_MODULES = import.meta.glob<{ default: LeadEarlyAccessJson }>(
  "./*.json",
  { eager: true },
);

const MOCK_LEAD_ID = "mock-lead-invite-card";

function isLeadModulePath(path: string): boolean {
  const fileName = path.split("/").pop() ?? "";
  return !fileName.startsWith("_");
}

function defaultCouponCodeFromId(id: string): string {
  return `BIZMIS-EARLY-ACCESS-${id.toUpperCase()}`;
}

export function hydrateLead(raw: LeadEarlyAccessJson, index: number): LeadEarlyAccessData {
  const { id } = raw;
  const couponOverride = raw.couponCode?.trim();
  return {
    ...raw,
    couponCode: couponOverride && couponOverride.length > 0 ? couponOverride : defaultCouponCodeFromId(id),
    orderInBatch: index + 1,
    logoImagePath: `/invite-cards/_/${id}/logo.png`,
    salesAvatarImagePath: `/invite-cards/_/${id}/sales-avatar.png`,
    supportAvatarImagePath: `/invite-cards/_/${id}/support-avatar.png`,
    productAImagePath: `/invite-cards/_/${id}/product-a.jpg`,
    productBImagePath: `/invite-cards/_/${id}/product-b.jpg`,
    productCImagePath: `/invite-cards/_/${id}/product-c.jpg`,
  };
}

function sortLeadsForDisplay(leads: LeadEarlyAccessJson[]): LeadEarlyAccessJson[] {
  return [...leads].sort((a, b) => {
    if (a.id === MOCK_LEAD_ID) return -1;
    if (b.id === MOCK_LEAD_ID) return 1;
    return a.id.localeCompare(b.id);
  });
}

const RAW_LEADS: LeadEarlyAccessJson[] = sortLeadsForDisplay(
  Object.entries(RAW_LEAD_MODULES)
    .filter(([path]) => isLeadModulePath(path))
    .map(([, mod]) => mod.default)
    .filter((lead): lead is LeadEarlyAccessJson => Boolean(lead?.id)),
);

export const LEAD_EARLY_ACCESS_INVITES: LeadEarlyAccessData[] = RAW_LEADS.map(hydrateLead);

const byId = new Map(LEAD_EARLY_ACCESS_INVITES.map((l) => [l.id, l]));

export function getLeadById(id: string): LeadEarlyAccessData | undefined {
  return byId.get(id);
}
