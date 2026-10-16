import { createContext, useContext } from "react";

/**
 * Which look the beats' loss → win words take (?beat=1..6, read by
 * SalesSection; 0: today's struck headline with the win handwritten under it).
 * 1 ledger, 2 before/after cards, 3 marker annotation, 4 speech bubble,
 * 5 headline swap, 6 stage card.
 */
export const BEAT_STYLES = [0, 1, 2, 3, 4, 5, 6] as const;

const BeatStyleContext = createContext(0);

export const BeatStyleProvider = BeatStyleContext.Provider;

export const useBeatStyle = () => useContext(BeatStyleContext);

/** ?beat=N from the URL (0 when absent or unknown). */
export const readBeatStyle = () => {
  if (typeof window === "undefined") return 0;
  const n = Number(new URLSearchParams(window.location.search).get("beat"));
  return (BEAT_STYLES as readonly number[]).includes(n) ? n : 0;
};
