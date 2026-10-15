import { createContext, useContext } from "react";

/**
 * How a pillar's opener hands over to its content (FilmLanding.tsx, ?open=1..5;
 * "0" without it, the page as it is: the NAME huge, scrolling away, the
 * docked bar sliding in). The options all open on the OUTCOME, big ("Boost
 * Sales", "Fewer tickets. Happier customers."), the area a small label
 * ("Sales", "Support"), and differ in the LAYOUT and the TRANSITION
 * (PillarIntro, pillar-transitions.css):
 *
 *   1  Shrink to dock   the outcome, pinned, shrinks and rises into the docked bar while
 *                       the content comes up under it
 *   2  Slide aside      the outcome slides into a left rail and stays there as the
 *                       section's side title; the content enters on the right (phones: 1)
 *   3  Curtain          the opener stays put; the content rises over it as a sheet with
 *                       a rounded top, the bar docking as the sheet reaches it
 *   4  Zoom through     the outcome scales up past the viewer and fades; the content
 *                       is there behind it
 *   5  Split            the opener parts like two doors, the content between; the
 *                       halves' words become the docked bar
 */
export type Opener = "0" | "1" | "2" | "3" | "4" | "5";

export const OpenerContext = createContext<Opener>("0");

export const useOpener = () => useContext(OpenerContext);

/**
 * A pillar's small area label ("Sales") when its PillarIntro call doesn't
 * pass one: Boost Sales gets it from FilmLanding, so the Sales files stay as
 * they are.
 */
export const PillarAreaContext = createContext<string | undefined>(undefined);
