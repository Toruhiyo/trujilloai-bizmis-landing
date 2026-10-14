import { createContext, useContext } from "react";

/**
 * The page's opener approach (FilmLanding.tsx): "0" is the default, the
 * pillars' big scroll-away titles with their docked bars (PillarIntro) and
 * Setup / Personalization with their own centred headers; "1".."5" are the
 * one-screen approaches under comparison (?open=1..5, openers.css).
 */
export const OpenerContext = createContext<string>("0");

export const useOpener = () => useContext(OpenerContext);
