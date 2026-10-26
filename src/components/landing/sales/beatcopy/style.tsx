import { createContext, useContext } from "react";

/**
 * Which look the beats' loss → win words take (?beat=…, read by
 * SalesSection; default 6c; 0: the old struck headline with the win handwritten under it).
 * 1 ledger, 2 before/after cards, 3 marker annotation, 4 speech bubble,
 * 5 headline swap, 6 stage card. The headline swaps with the core of each
 * loss and win highlighted (beatcopy/BeatSwap), ?beat=5a..5e (or 7..11):
 * 5a strike & swoosh, 5b split-flap, 5c big core, 5d highlighter, 5e stamp.
 * The polished highlighters (beatcopy/BeatHL), ?beat=6a..6e (or 12..16): the
 * sentence's shared opening set once and never moved, only its core changed
 * in place. 6a retract & retype, 6b paint over, 6c marker correction,
 * 6d underline marker, 6e squeeze.
 * The endings in the funnel, ?beat=7 (17): the words keep only the shared
 * opening ("Buyers ready to buy…"); its ending IS the stage's funnel label,
 * struck and rewritten there ("…hesitate and hold off" → "…commit and
 * check out"), so the change happens in one place.
 */
export const BEAT_STYLES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17] as const;

/** The headline swaps: ?beat=5a → 7 … ?beat=5e → 11. */
export const SWAPS = ["a", "b", "c", "d", "e"] as const;
export type SwapLook = (typeof SWAPS)[number];
export const SWAP_FROM = 7;

/** The polished highlighters: ?beat=6a → 12 … ?beat=6e → 16. */
export const HLS = ["a", "b", "c", "d", "e"] as const;
export type HLLook = (typeof HLS)[number];
export const HL_FROM = 12;

/** ?beat=7: the endings written in the funnel. */
export const ENDS = 17;

/** The look with no ?beat: 6c, the marker correction (chosen 2026-10-26); ?beat=0 shows the old struck headline. */
export const DEFAULT_BEAT = HL_FROM + HLS.indexOf("c");

const BeatStyleContext = createContext(DEFAULT_BEAT);

export const BeatStyleProvider = BeatStyleContext.Provider;

export const useBeatStyle = () => useContext(BeatStyleContext);

/** ?beat=N (or 5a..5e, 6a..6e) from the URL (DEFAULT_BEAT when absent, 0 when unknown). */
export const readBeatStyle = () => {
  if (typeof window === "undefined") return DEFAULT_BEAT;
  const raw = (new URLSearchParams(window.location.search).get("beat") ?? "").trim().toLowerCase();
  if (!raw) return DEFAULT_BEAT;
  const swap = /^5([a-e])$/.exec(raw);
  if (swap) return SWAP_FROM + SWAPS.indexOf(swap[1] as SwapLook);
  if (raw === "7") return ENDS;
  const hl = /^6([a-e])$/.exec(raw);
  if (hl) return HL_FROM + HLS.indexOf(hl[1] as HLLook);
  const n = Number(raw);
  return (BEAT_STYLES as readonly number[]).includes(n) ? n : 0;
};
