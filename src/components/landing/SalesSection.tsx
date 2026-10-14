import { useLocation } from "react-router-dom";
import SalesA from "./sales/SalesA";
import SalesB from "./sales/SalesB";
import SalesC from "./sales/SalesC";
import "@/styles/landing-sales.css";

/**
 * Boost Sales: "Shoppers Find it. Trust it. Buy it." The title stays on
 * screen through the whole pillar and each moment lights its part, shown on
 * a device with the real Bizmis widget; the pillar ends (or opens) on its
 * feeling, the day's sales surging. Copy in `landing.sales` (the classic
 * landing keeps `benefits.sales`).
 *
 * Three layouts are on trial, picked with ?sales=: a (default, the sticky
 * rail), b (the spotlight: centred stages under a pinned title bar) and c
 * (the stage: one pinned screen in bold orange).
 */
const VARIANTS = { a: SalesA, b: SalesB, c: SalesC } as const;

const SalesSection = () => {
  const { search } = useLocation();
  const key = new URLSearchParams(search).get("sales")?.toLowerCase();
  const Variant = VARIANTS[key as keyof typeof VARIANTS] ?? SalesA;
  return <Variant />;
};

export default SalesSection;
