import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { SalesProtoProvider } from "./sales/proto";
import SalesSpine from "./sales/SalesSpine";
import "@/styles/landing-sales.css";

/**
 * Boost Sales: "Shoppers Find it. Trust it. Buy it." The title opens the
 * pillar big and docks as its sticky header (PillarIntro). The marker funnel
 * of the whole store's visits is the section's spine (SalesSpine): as you
 * scroll, each part's one conversation pops out of its own stage on a device
 * (find on desktop, trust on a phone, buy on a tablet), the same agent
 * sealing each stage's leak, and the pillar ends on all three fixed, the
 * orders pouring into the bag. Copy in `landing.sales` (the classic landing
 * keeps `benefits.sales`). Prototype switches (sales/proto.tsx): ?win=4..6
 * (a metric moving the right way), ?copy=flip (each beat's problem struck
 * through, then its fix).
 */
const SalesSection = () => {
  const q = new URLSearchParams(useLocation().search);
  const win = Number(q.get("win")) || 0;
  const flip = q.get("copy") === "flip";
  const proto = useMemo(() => ({ win, flip }), [win, flip]);
  return (
    <SalesProtoProvider value={proto}>
      <SalesSpine />
    </SalesProtoProvider>
  );
};

export default SalesSection;
