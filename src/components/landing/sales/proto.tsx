import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useMessages } from "@/i18n/LocaleProvider";

/**
 * The section's prototype switches, read from the URL by SalesSection:
 * - `win` (?win=4..6): a metric merchants know, moving the right way as the
 *   stages get fixed (direction only, never a figure): 4 a marker analytics
 *   card (conversion rate, orders, abandoned checkouts), 5 a conversion
 *   gauge, 6 an "orders today" sparkline with a before/after strip at the
 *   payoff. 0: none.
 * - `flip` (?copy=flip): each beat's words are its problem, struck through
 *   at the fix, then the fix written in (`landing.sales.flip`).
 */
export type SalesProto = { win: number; flip: boolean };

const ProtoContext = createContext<SalesProto>({ win: 0, flip: false });

export const SalesProtoProvider = ({ value, children }: { value: SalesProto; children: ReactNode }) => (
  <ProtoContext.Provider value={value}>{children}</ProtoContext.Provider>
);

export const useSalesProto = () => useContext(ProtoContext);

/**
 * `landing.sales`, as the section tells it: one shopper's journey with the
 * store's one agent, the gift search, then comparing the three found, then
 * buying the one picked (`caseOne` overrides the beats' lines).
 */
export const useSalesCopy = () => {
  const s = useMessages().landing.sales;
  return useMemo(() => ({ ...s, ...s.caseOne }), [s]);
};
