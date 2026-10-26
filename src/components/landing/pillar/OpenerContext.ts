import { createContext, useContext } from "react";
import { useLocation } from "react-router-dom";

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

/**
 * The opener + morph style under comparison (?dock=a|b|c; "0" without it,
 * the chapter opener with its pieces flying into the bar). Applies to the
 * opener designs (?open=1..6, the page's default 5):
 *
 *   a  Calm       the opener a centred block (a marker kicker, the outcome),
 *                 scaling and sliding up as one into the bar's place; the
 *                 bar's ground grows from a pill behind it
 *   b  Editorial  left-aligned: the chapter number in marker with the area's
 *                 name and a hairline, the outcome under them; the number
 *                 stays in the bar ("02 · Customer Support | …")
 *   c  Curtain    centred: the number and the area's name (a marker swoosh
 *                 under it), the outcome; the band's colour (a soft tint on
 *                 white) wipes up behind the title and lifts into the bar
 *                 with it, uncovering the content
 */
export type DockStyle = "0" | "a" | "b" | "c";

export const useDockStyle = (): DockStyle => {
  const q = new URLSearchParams(useLocation().search).get("dock");
  return q === "a" || q === "b" || q === "c" ? q : "0";
};
