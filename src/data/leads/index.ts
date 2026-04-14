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
import jackery from "./jackery.json";
import mactools from "./mactools.json";
import emotiva from "./emotiva.json";
import magnaflow from "./magnaflow.json";
import burrow from "./burrow.json";
import uswatersystems from "./uswatersystems.json";
import jdmenginezone from "./jdmenginezone.json";
import liveu from "./liveu.json";
import floyd from "./floyd.json";
import bulova from "./bulova.json";
import urotuning from "./urotuning.json";
import positivegrid from "./positivegrid.json";
import thehomesecuritysuperstore from "./thehomesecuritysuperstore.json";
import pura from "./pura.json";
import speedengineering from "./speedengineering.json";
import gorjana from "./gorjana.json";
import crownandcaliber from "./crownandcaliber.json";
import schoolhouse from "./schoolhouse.json";

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
  jackery,
  mactools,
  emotiva,
  magnaflow,
  burrow,
  uswatersystems,
  jdmenginezone,
  liveu,
  floyd,
  bulova,
  urotuning,
  positivegrid,
  thehomesecuritysuperstore,
  pura,
  speedengineering,
  gorjana,
  crownandcaliber,
  schoolhouse,
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
