import { useEffect } from "react";
import Hero from "@/components/Hero";
import Seo from "@/components/Seo";
import SalesSection from "@/components/landing/SalesSection";
import SupportSection from "@/components/landing/SupportSection";
import InsightsSection from "@/components/landing/InsightsSection";
import SetupSection from "@/components/landing/SetupSection";
import CustomizeSection from "@/components/landing/CustomizeSection";
import EndCard from "@/components/landing/EndCard";
import FilmFooter from "@/components/landing/FilmFooter";
import LandingSummary from "@/components/landing/LandingSummary";
import {
  setupScrollToSectionOnLoad,
  setupScrollToUrlUpdater,
} from "@/lib/utils/scroll";
import { useMessages } from "@/i18n/LocaleProvider";
import "@/styles/film-landing.css";
import "@/styles/palette-options.css";
// the film look, the page's only look (keyed on data-look="film")
import "@/styles/look-film.css";
// how Setup and Customize are set apart: each on its own sheet
import "@/styles/section-sep.css";
// fixes for phones on their side, tall portrait tablets and the like (loaded last: it overrides the sections' own files)
import "@/styles/landing-responsive.css";
// big screens (wider than 1440): the whole page grows with the screen (rem-based)
import "@/styles/big-screen.css";
// Boost Sales' small area label in its opener and docked pill (PillarIntro)
import { PillarAreaContext } from "@/components/landing/pillar/PillarArea";

interface FilmLandingProps {
  /** The route it's served on: "/" once it's the default, "/v2" until then. */
  path?: "/" | "/v2";
}

/**
 * The film-led landing: the classic landing's structure and message (pitch,
 * sales, support, insights, setup, personalization, install) told in the ad-1
 * film's visual language (white canvas, Inter, clay products, real avatars,
 * orange). Built from its own components and scoped styles (.bzl) so the
 * classic landing at /v1 stays exactly as it was.
 */
const FilmLanding = ({ path = "/" }: FilmLandingProps) => {
  const messages = useMessages();

  // Lets the film landing's scoped CSS reach the shared navbar (outside .bzl),
  // e.g. the handwritten "Early Access" link, without touching other pages.
  useEffect(() => {
    document.documentElement.classList.add("bzl-page");
    return () => document.documentElement.classList.remove("bzl-page");
  }, []);

  // The navbar's real height (48px on phones, 64px from 640px, whatever it's scaled to on big
  // screens), published as --bzl-nav-real for what sticks right under it: the pillars' docked bars
  // and pinned screens (landing-responsive.css), which otherwise assume a height by breakpoint.
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>("nav");
    const root = document.documentElement;
    if (!nav || typeof ResizeObserver === "undefined") return;
    // (clientHeight: the bar, not the hairline it gains once the page scrolls)
    const set = () => nav.clientHeight > 0 && root.style.setProperty("--bzl-nav-real", `${nav.clientHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(nav);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--bzl-nav-real");
    };
  }, []);

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

  // the page's palette, "Bizmis Mono" (palette-options.css); Setup's and Customize's sheets (section-sep.css)
  return (
    <div
      className="bzl min-h-screen"
      data-palette="1"
      data-look="film"
      data-sep="2"
    >
      <Seo
        page="home"
        path={path}
        // Kept out of search while it lives at /v2, so it never competes with /.
        noIndex={path !== "/"}
      />
      {/* the page's main landmark; display: contents, so the layout doesn't see it */}
      <main className="contents">
        <Hero />
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
      </main>
      <FilmFooter />
    </div>
  );
};

export default FilmLanding;
