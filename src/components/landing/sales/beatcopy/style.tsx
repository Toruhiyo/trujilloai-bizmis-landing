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
 * The words on the funnel, ?beat=7a..7e (or 17..21; ?beat=7 is 7a): the
 * whole loss → win (6c's look) stands on the funnel as its stage's label,
 * the funnel drawing no labels of its own, so the change happens in one
 * place. 7a medium over the chamber, 7b big over the chamber, 7c compact
 * over the chamber, 7d a centred banner over the whole funnel, 7e beside
 * the device (SalesSpine's layout). The same words arranged around the
 * funnel, ?beat=8a..8d (or 22..25; ?beat=8 is 8a): 8a device / funnel /
 * words stacked, 8b words / funnel / device stacked, 8c device | funnel
 * over words, 8d funnel over words | device (sales/arrange). ?beat=9a..9c
 * (26..28; ?beat=9 is 9a, the default 9b): the words are the opener
 * alone ("Buyers with a full cart…") and the sentence ends in the funnel's
 * own label, as it is ("Abandon the cart" struck, then "Buy it ✓"). 9a
 * the opener over its stage, the device above; 9b the same, the device in
 * a column on the right (sales/arrange); 9c 6c's layout, the opener in a
 * column on the left.
 */
export const BEAT_STYLES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28] as const;

/** The headline swaps: ?beat=5a → 7 … ?beat=5e → 11. */
export const SWAPS = ["a", "b", "c", "d", "e"] as const;
export type SwapLook = (typeof SWAPS)[number];
export const SWAP_FROM = 7;

/** The polished highlighters: ?beat=6a → 12 … ?beat=6e → 16. */
export const HLS = ["a", "b", "c", "d", "e"] as const;
export type HLLook = (typeof HLS)[number];
export const HL_FROM = 12;

/** The words on the funnel: ?beat=7a → 17 … ?beat=7e → 21. */
export const ENDS_LOOKS = ["a", "b", "c", "d", "e"] as const;
export type EndsLook = (typeof ENDS_LOOKS)[number];
export const ENDS_FROM = 17;
/** Which words-on-the-funnel look `look` is, if it's one. */
export const endsLook = (look: number): EndsLook | null =>
  look >= ENDS_FROM && look < ENDS_FROM + ENDS_LOOKS.length ? ENDS_LOOKS[look - ENDS_FROM] : null;

/** The words arranged around the funnel: ?beat=8a → 22 … ?beat=8d → 25. */
export const ARR_LOOKS = ["a", "b", "c", "d"] as const;
export type ArrLook = (typeof ARR_LOOKS)[number];
export const ARR_FROM = 22;
/** Which arrangement `look` is, if it's one. */
export const arrLook = (look: number): ArrLook | null =>
  look >= ARR_FROM && look < ARR_FROM + ARR_LOOKS.length ? ARR_LOOKS[look - ARR_FROM] : null;

/** The opener alone, ending in the funnel's label: ?beat=9a → 26 … ?beat=9c → 28. */
export const OPENER_LOOKS = ["a", "b", "c"] as const;
export type OpenerLook = (typeof OPENER_LOOKS)[number];
export const OPENER_FROM = 26;
/** Which opener layout `look` is, if it's one. */
export const openerLook = (look: number): OpenerLook | null =>
  look >= OPENER_FROM && look < OPENER_FROM + OPENER_LOOKS.length ? OPENER_LOOKS[look - OPENER_FROM] : null;

/** The look with no ?beat: 9b, the opener ending in the funnel's label, the device in its own column (chosen 2026-10-26); ?beat=0 shows the old struck headline. */
export const DEFAULT_BEAT = OPENER_FROM + OPENER_LOOKS.indexOf("b");

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
  if (raw === "7") return ENDS_FROM;
  if (raw === "8") return ARR_FROM;
  if (raw === "9") return OPENER_FROM;
  const op = /^9([a-c])$/.exec(raw);
  if (op) return OPENER_FROM + OPENER_LOOKS.indexOf(op[1] as OpenerLook);
  const arr = /^8([a-d])$/.exec(raw);
  if (arr) return ARR_FROM + ARR_LOOKS.indexOf(arr[1] as ArrLook);
  const ends = /^7([a-e])$/.exec(raw);
  if (ends) return ENDS_FROM + ENDS_LOOKS.indexOf(ends[1] as EndsLook);
  const hl = /^6([a-e])$/.exec(raw);
  if (hl) return HL_FROM + HLS.indexOf(hl[1] as HLLook);
  const n = Number(raw);
  return (BEAT_STYLES as readonly number[]).includes(n) ? n : 0;
};
