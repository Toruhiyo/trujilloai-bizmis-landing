import { useLocation } from "react-router-dom";
import SalesA from "./sales/SalesA";
import SalesC from "./sales/SalesC";
import "@/styles/landing-sales.css";

/**
 * Boost Sales: "Shoppers Find it. Trust it. Buy it." The title stays on
 * screen through the whole pillar and each part lights its funnel stage
 * (discovery, decision, checkout), shown on a device with the real Bizmis
 * widget and, beside it, what that does across the whole store's traffic;
 * the pillar ends on its feeling, the day's sales surging. Copy in
 * `landing.sales` (the classic landing keeps `benefits.sales`).
 *
 * The stage (C, one pinned screen in bold orange) is the layout; ?sales=a
 * keeps the sticky rail reachable. The at-scale funnel has three concepts on
 * trial, picked with ?funnel=1|2|3 (see sales/funnel).
 */
const VARIANTS = { a: SalesA, c: SalesC } as const;

const SalesSection = () => {
  const { search } = useLocation();
  const key = new URLSearchParams(search).get("sales")?.toLowerCase();
  const Variant = VARIANTS[key as keyof typeof VARIANTS] ?? SalesC;
  return <Variant />;
};

export default SalesSection;
