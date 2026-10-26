import { createContext, useContext } from "react";

/**
 * The pillar openers' design (FilmLanding.tsx, ?open=1..6; "0" without it,
 * the page as it is: the NAME huge). The options are static designs where
 * the OUTCOME is the hero and the area a small label (pillar/OpenerDesign,
 * pillar-openers.css); the scroll morphs each into the docked bar (PillarIntro).
 */
export type Opener = "0" | "1" | "2" | "3" | "4" | "5" | "6";

export const OpenerContext = createContext<Opener>("0");

export const useOpener = () => useContext(OpenerContext);

/**
 * A pillar's small area label ("Sales") when its PillarIntro call doesn't
 * pass one: Boost Sales gets it from FilmLanding, so the Sales files stay as
 * they are.
 */
export const PillarAreaContext = createContext<string | undefined>(undefined);
