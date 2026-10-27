import { useState } from "react";

/**
 * Which drawing a pillar shows: `?support=` for Customer Support, `?insights=`
 * for Store Insights. "default" (no parameter, or anything unknown) is the
 * one Oriol picked; 1, 2 and 3 are the options he picked from; "old" is the
 * drawing the page shipped before them. Read once, on mount.
 */
export type DrawOption = "default" | "1" | "2" | "3" | "old";

export const useDrawOption = (param: "support" | "insights"): DrawOption => {
  const [v] = useState<DrawOption>(() => {
    if (typeof window === "undefined") return "default";
    const q = new URLSearchParams(window.location.search).get(param);
    return q === "1" || q === "2" || q === "3" || q === "old" ? q : "default";
  });
  return v;
};
