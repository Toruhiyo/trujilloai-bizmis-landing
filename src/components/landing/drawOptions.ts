import { useState } from "react";

/**
 * Which drawing a pillar shows while Oriol picks one: `?support=1|2|3` for
 * Customer Support, `?insights=1|2|3` for Store Insights. 0 (no parameter, or
 * anything else) is the drawing the page ships today. Read once, on mount.
 */
export type DrawOption = 0 | 1 | 2 | 3;

export const useDrawOption = (param: "support" | "insights"): DrawOption => {
  const [v] = useState<DrawOption>(() => {
    if (typeof window === "undefined") return 0;
    const n = Number(new URLSearchParams(window.location.search).get(param));
    return n === 1 || n === 2 || n === 3 ? n : 0;
  });
  return v;
};
