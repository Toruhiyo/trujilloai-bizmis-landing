import { useMemo } from "react";
import { useMessages } from "@/i18n/LocaleProvider";

/**
 * `landing.sales`, as the section tells it: one shopper's journey with the
 * store's one agent, the gift search, then comparing the three found, then
 * buying the one picked (`caseOne` overrides the beats' lines).
 */
export const useSalesCopy = () => {
  const s = useMessages().landing.sales;
  return useMemo(() => ({ ...s, ...s.caseOne }), [s]);
};
