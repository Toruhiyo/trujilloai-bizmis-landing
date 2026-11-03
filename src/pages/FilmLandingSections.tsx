import { useEffect } from "react";
import { useNavigationType } from "react-router";
import SalesSection from "@/components/landing/SalesSection";
import SupportSection from "@/components/landing/SupportSection";
import InsightsSection from "@/components/landing/InsightsSection";
import SetupSection from "@/components/landing/SetupSection";
import CustomizeSection from "@/components/landing/CustomizeSection";
import EndCard from "@/components/landing/EndCard";
import FilmFooter from "@/components/landing/FilmFooter";
import LandingSummary from "@/components/landing/LandingSummary";
import { IdleCue } from "@/components/landing/steps/steps";
import {
  setupKeepPlaceOnResize,
  setupLandingScrollRestore,
  setupScrollToSectionOnLoad,
  setupScrollToUrlUpdater,
} from "@/lib/utils/scroll";
import { useMessages } from "@/i18n/LocaleProvider";
// Boost Sales' small area label in its opener and docked pill (PillarIntro)
import { PillarAreaContext } from "@/components/landing/pillar/PillarArea";

/**
 * Everything in the film landing's main landmark after the hero, in its own chunk: the hero
 * (FilmLanding) paints as soon as its own code is here, and this follows. Its
 * styles stay with the page (FilmLanding.tsx imports them, in their order), so
 * the cascade is the one it always was.
 */
const FilmLandingSections = () => {
  const messages = useMessages();
  const navigation = useNavigationType();

  // (here, not in FilmLanding: a link to #setup needs the sections on the page to scroll to)
  useEffect(() => {
    const cleanupScrollToSection = setupScrollToSectionOnLoad();
    const cleanupUrlUpdater = setupScrollToUrlUpdater([
      "hero",
      "benefits",
      "setup",
    ]);
    return () => {
      cleanupScrollToSection();
      cleanupUrlUpdater();
    };
  }, []);

  // its place: back where it was on a way back (another page's back button, a reload), and kept
  // through a change of the screen's width (a phone turned on its side), as the sections re-lay out
  useEffect(() => {
    const cleanupRestore = setupLandingScrollRestore(navigation === "POP");
    const cleanupKeepPlace = setupKeepPlaceOnResize();
    return () => {
      cleanupRestore();
      cleanupKeepPlace();
    };
    // (once, as the sections mount: the way they were reached)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The page's CSS loops (the hero's play ring and spinner, the pillars' icons, the widget's pulses, the
  // end card's running light...) hold still while their section is well off screen (bzl-off, film-landing.css):
  // a running animation costs a style pass every frame wherever it is, and a dozen of them kept the page
  // restyling at 60 fps even at rest. Half a screen of margin, so one is always running before it shows.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const sections = [...document.querySelectorAll<HTMLElement>(".bzl section")].filter(
      (el) => !el.parentElement?.closest("section"),
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle("bzl-off", !e.isIntersecting);
      },
      { rootMargin: "50% 0px" },
    );
    sections.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      sections.forEach((el) => el.classList.remove("bzl-off"));
    };
  }, []);

  return (
    <>
      {/* what Bizmis is, in a sentence (visually hidden: the hero shows it in pictures) */}
      <LandingSummary part="definition" />
      {/* "This isn't a chatbot" (SwitchSection) is hidden: the hero covers it now */}
      {/* Boost Sales' small area label, for the transitions (the Sales files stay as they are) */}
      <PillarAreaContext.Provider value={messages.landing.salesArea}>
        <SalesSection />
      </PillarAreaContext.Provider>
      {/* the funnel's stages in words (visually hidden: the page draws their endings) */}
      <LandingSummary part="funnel" />
      <SupportSection />
      <InsightsSection />
      <SetupSection />
      <CustomizeSection />
      <EndCard />
      {/* ?scroll=steps: the idle "scroll on" chevron (nothing without the flag) */}
      <IdleCue />
    </>
  );
};

/** The landing's footer (outside the page's main landmark), from the same chunk. */
export { FilmFooter };

export default FilmLandingSections;
