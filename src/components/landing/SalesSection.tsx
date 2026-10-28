import SalesSpine from "./sales/SalesSpine";
import "@/styles/landing-sales.css";

/**
 * Boost Sales: "Match needs. Clear doubts. Win sales." The title opens the
 * pillar big and docks as its sticky pill (PillarIntro). The marker funnel
 * of the whole store's visits is the section's spine (SalesSpine): as you
 * scroll, each part's one conversation plays on its own device (find on
 * desktop, trust on a phone, buy on a tablet), the beat's opener ending in
 * its stage's label in the funnel, the same agent sealing each stage's
 * leak, and the pillar ends on all three fixed, the Sales column filling
 * up. Copy in `landing.sales` (the classic landing keeps `benefits.sales`).
 */
const SalesSection = () => <SalesSpine />;

export default SalesSection;
