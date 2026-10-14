import SalesC from "./sales/SalesC";
import "@/styles/landing-sales.css";

/**
 * Boost Sales: "Shoppers Find it. Trust it. Buy it." The title opens the
 * pillar big and docks as its sticky header (PillarIntro); each part lights
 * its funnel stage (discovery, decision, checkout), shown on a device with
 * the real Bizmis widget and, beside it, that stage improving across the
 * whole store's traffic; the pillar ends on all three improving at once,
 * the funnel pouring its orders into the bag. Copy in `landing.sales` (the
 * classic landing keeps `benefits.sales`). The layout is the stage (SalesC):
 * one pinned screen in bold orange.
 */
const SalesSection = () => <SalesC />;

export default SalesSection;
