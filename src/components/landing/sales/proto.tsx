import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useMessages } from "@/i18n/LocaleProvider";

/**
 * The section's prototype switches, read from the URL by SalesSection:
 * - `one` (?case=one): the store's ONE agent (amber) and ONE shopper's
 *   journey across the three parts: the gift search, then comparing the
 *   three found, then buying the one picked (copy: `landing.sales.caseOne`).
 * - `visits` (?visits=1..3): how the funnel shows its dots are store visits:
 *   1 a handwritten "visitors" label and arrow into the mouth, 2 visitor
 *   glyphs that turn into dots as they enter, 3 a hand tally of visits at
 *   the mouth. 0: none.
 * - `win` (?win=1..3): how it shows the win against the loss at scale:
 *   1 the lost pile up in heaps under the leaks while the bag fills up,
 *   2 hand tallies of "lost" and "sold", 3 a "before" bag beside the
 *   growing "after" one. 0: none.
 */
export type SalesProto = { one: boolean; visits: number; win: number };

const ProtoContext = createContext<SalesProto>({ one: false, visits: 0, win: 0 });

export const SalesProtoProvider = ({ value, children }: { value: SalesProto; children: ReactNode }) => (
  <ProtoContext.Provider value={value}>{children}</ProtoContext.Provider>
);

export const useSalesProto = () => useContext(ProtoContext);

/** `landing.sales`, with the one-shopper copy swapped in when ?case=one. */
export const useSalesCopy = () => {
  const s = useMessages().landing.sales;
  const { one } = useSalesProto();
  return useMemo(() => (one ? { ...s, ...s.caseOne } : s), [s, one]);
};

/** The agent working each stage (its head render): one per mockup, or the store's one agent. */
export const useStageHeads = () => (useSalesProto().one ? ["amber", "amber", "amber"] : ["amber", "mia", "luca"]);
