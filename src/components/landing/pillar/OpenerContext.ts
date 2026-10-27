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
 * The opener + morph style (?dock=a|b|c; the page's default is a, ?dock=0
 * the older chapter opener with its pieces flying into the bar). Applies to
 * the opener designs (?open=1..6, the page's default 5):
 *
 *   a  Calm       centred: the icon in its disc and the area's name in small
 *                 capitals over the outcome; the bar's ground grows from a pill
 *   b  Editorial  left-aligned: the chapter number in marker, the area's name
 *                 and a hairline over the outcome; the bar on the same left edge
 *   c  Curtain    centred: the number and the area's name (a marker swoosh
 *                 under it) over the outcome; the band's colour rises behind
 *                 the title and lifts into the bar with it
 *
 * In each the bar is the opener's lockup shrunk into place (the same mark,
 * name and outcome, set the same way), and the opener holds first, most of
 * a screen of scroll (pillar/useDockMorph: the outcome grows a few %, a: its
 * words light up one by one, each on its own beat; b: the hairline draws,
 * c: the swoosh draws and the colour rises), its final state held before
 * the morph.
 */
export type DockStyle = "0" | "a" | "b" | "c";

export const useDockStyle = (): DockStyle => {
  const q = new URLSearchParams(useLocation().search).get("dock");
  return q === "0" || q === "b" || q === "c" ? q : "a";
};
