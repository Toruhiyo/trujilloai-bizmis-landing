import { createContext, useContext } from "react";

/**
 * Which look the beats' loss → win words take (?beat=…, read by
 * SalesSection; 0: today's struck headline with the win handwritten under it).
 * 1 ledger, 2 before/after cards, 3 marker annotation, 4 speech bubble,
 * 5 headline swap, 6 stage card. The headline swaps with the core of each
 * loss and win highlighted (beatcopy/BeatSwap), ?beat=5a..5e (or 7..11):
 * 5a strike & swoosh, 5b split-flap, 5c big core, 5d highlighter, 5e stamp.
 */
export const BEAT_STYLES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

/** The headline swaps: ?beat=5a → 7 … ?beat=5e → 11. */
export const SWAPS = ["a", "b", "c", "d", "e"] as const;
export type SwapLook = (typeof SWAPS)[number];
export const SWAP_FROM = 7;

const BeatStyleContext = createContext(0);

export const BeatStyleProvider = BeatStyleContext.Provider;

export const useBeatStyle = () => useContext(BeatStyleContext);

/** ?beat=N (or 5a..5e) from the URL (0 when absent or unknown). */
export const readBeatStyle = () => {
  if (typeof window === "undefined") return 0;
  const raw = (new URLSearchParams(window.location.search).get("beat") ?? "").trim().toLowerCase();
  const swap = /^5([a-e])$/.exec(raw);
  if (swap) return SWAP_FROM + SWAPS.indexOf(swap[1] as SwapLook);
  const n = Number(raw);
  return (BEAT_STYLES as readonly number[]).includes(n) ? n : 0;
};
