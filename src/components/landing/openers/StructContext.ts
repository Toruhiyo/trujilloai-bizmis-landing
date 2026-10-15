import { createContext, useContext } from "react";

/**
 * The page-structure option under comparison (FilmLanding.tsx, ?struct=A|B|C;
 * "" without it, the page as it is). In every option the AREA is a small label
 * ("Support") and the OUTCOME is the big line ("Fewer tickets. Happier
 * customers."); Support and Insights carry proof points, not sub-benefits.
 *
 *   A  One rhythm      Support and Insights each one screen: label, outcome, one visual,
 *                      the proof points; no opener, no sticky bar (structs.css, .st-a)
 *   B  Proof           Support and Insights merged into ONE screen, two halves, each its
 *                      label, outcome, marker moment and three proof points (ProofSection)
 *   C  Outcome-first   each opens on its outcome, huge, over its marker moment (the
 *                      feeling), then its content screen; no sticky bar (.st-c)
 *
 * D..G keep the current approach (all three pillars open with PillarIntro and
 * dock a sticky bar) with the opener redesigned so the OUTCOME is the hero and
 * the area label is small (openers/OpenerHero.tsx, opener-heroes.css):
 *
 *   D  Written         the outcome written on in marker handwriting, the area a tiny pill
 *   E  Split           the outcome big on the left, the marker moment (Sales: its icon) right
 *   F  Typed           one giant line that types itself, then shrinks into the docked bar
 *   G  Canvas          a calm full-bleed canvas, the animated icon large, the outcome under it
 */
export type Struct = "" | "A" | "B" | "C" | "D" | "E" | "F" | "G";

/** The redesigned PillarIntro openers. */
export type OpenerVariant = "D" | "E" | "F" | "G";
export const isOpenerVariant = (s: Struct): s is OpenerVariant => s === "D" || s === "E" || s === "F" || s === "G";

export const StructContext = createContext<Struct>("");

export const useStruct = () => useContext(StructContext);

/**
 * A pillar's area label ("Sales") for the redesigned openers, when its
 * PillarIntro call doesn't pass one (Boost Sales: FilmLanding provides it, so
 * the Sales files stay as they are).
 */
export const PillarAreaContext = createContext<string | undefined>(undefined);
