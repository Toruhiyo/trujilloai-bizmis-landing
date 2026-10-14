import { useLocation } from "react-router-dom";
import SalesA from "./sales/SalesA";
import SalesC from "./sales/SalesC";
import "@/styles/landing-sales.css";

/**
 * Boost Sales: "Shoppers Find it. Trust it. Buy it." The title opens the
 * pillar big and docks as its sticky header (PillarIntro); each part lights
 * its funnel stage (discovery, decision, checkout), shown on a device with
 * the real Bizmis widget and, beside it, that stage improving across the
 * whole store's traffic; the pillar ends on all three improving at once,
 * the funnel pouring its orders into the day's sales. Copy in
 * `landing.sales` (the classic landing keeps `benefits.sales`).
 *
 * The stage (C, one pinned screen in bold orange) is the layout; ?sales=a
 * keeps the sticky rail reachable.
 */
const VARIANTS = { a: SalesA, c: SalesC } as const;

const SalesSection = () => {
  const { search } = useLocation();
  const key = new URLSearchParams(search).get("sales")?.toLowerCase();
  const Variant = VARIANTS[key as keyof typeof VARIANTS] ?? SalesC;
  return <Variant />;
};

export default SalesSection;
