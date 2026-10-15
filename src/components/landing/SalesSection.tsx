import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { SalesProtoProvider } from "./sales/proto";
import SalesC from "./sales/SalesC";
import SalesJourney from "./sales/SalesJourney";
import SalesSpine from "./sales/SalesSpine";
import SalesStack from "./sales/SalesStack";
import "@/styles/landing-sales.css";

/**
 * Boost Sales: "Shoppers Find it. Trust it. Buy it." The title opens the
 * pillar big and docks as its sticky header (PillarIntro); each part lights
 * its funnel stage (discovery, decision, checkout), shown on a device with
 * the real Bizmis widget and, beside it, that stage improving across the
 * whole store's traffic; the pillar ends on all three improving at once,
 * the funnel pouring its orders into the bag. Copy in `landing.sales` (the
 * classic landing keeps `benefits.sales`).
 *
 * How the three parts are grouped is being prototyped (?grp=):
 * 1 (default) the stage (SalesC): one pinned screen, device beside funnel;
 * 2 the funnel as the spine (SalesSpine): each device pops out of its stage;
 * 3 the journey path (SalesJourney): three columns on one self-drawing line;
 * 4 stacking cards (SalesStack): one card per part, stacking as you scroll.
 * Also (any grouping, see sales/proto.tsx): ?case=one (one agent, one
 * shopper's journey), ?visits=1..3 (the dots read as visits), ?win=1..3
 * (the win against the loss, at scale).
 */
const GROUPINGS = { "2": SalesSpine, "3": SalesJourney, "4": SalesStack } as const;

const SalesSection = () => {
  const q = new URLSearchParams(useLocation().search);
  const grp = q.get("grp") ?? "1";
  const Grouping = GROUPINGS[grp as keyof typeof GROUPINGS] ?? SalesC;
  const one = q.get("case") === "one";
  const visits = Number(q.get("visits")) || 0;
  const win = Number(q.get("win")) || 0;
  const proto = useMemo(() => ({ one, visits, win }), [one, visits, win]);
  return (
    <SalesProtoProvider value={proto}>
      <Grouping key={`${grp}-${one}`} />
    </SalesProtoProvider>
  );
};

export default SalesSection;
