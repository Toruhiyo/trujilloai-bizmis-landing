import type { LeadEarlyAccessData, LeadEarlyAccessJson } from "./_schema";
import { resolveLeadProductPath } from "@/data/leadEarlyAccessProductManifest";

import molekule from "./molekule.json";
import glowforge from "./glowforge.json";
import sennheiser from "./sennheiser.json";
import sodastream from "./sodastream.json";
import peakdesign from "./peakdesign.json";
import hodinkee from "./hodinkee.json";
import sixpenny from "./sixpenny.json";
import shapermint from "./shapermint.json";
import glossier from "./glossier.json";
import theproscloset from "./theproscloset.json";
import nanoleaf from "./nanoleaf.json";
import bluetti from "./bluetti.json";

const RAW_LEADS: LeadEarlyAccessJson[] = [
  molekule,
  glowforge,
  sennheiser,
  sodastream,
  peakdesign,
  hodinkee,
  sixpenny,
  shapermint,
  glossier,
  theproscloset,
  nanoleaf,
  bluetti,
];

function couponCode(id: string): string {
  return `BIZMIS-EARLY-ACCESS-${id.toUpperCase()}`;
}

function hydrate(raw: LeadEarlyAccessJson, index: number): LeadEarlyAccessData {
  const { id } = raw;
  return {
    ...raw,
    couponCode: couponCode(id),
    orderInBatch: index + 1,
    logoImagePath: `/invite-cards/leads/${id}/logo.png`,
    clerkAvatarImagePath: `/invite-cards/leads/${id}/clerk-avatar.png`,
    productAImagePath: resolveLeadProductPath(id, "a"),
    productBImagePath: resolveLeadProductPath(id, "b"),
    productCImagePath: resolveLeadProductPath(id, "c"),
  };
}

export const LEAD_EARLY_ACCESS_INVITES: LeadEarlyAccessData[] = RAW_LEADS.map(hydrate);

const byId = new Map(LEAD_EARLY_ACCESS_INVITES.map((l) => [l.id, l]));

export function getLeadById(id: string): LeadEarlyAccessData | undefined {
  return byId.get(id);
}
