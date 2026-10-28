import { useEffect } from "react";
import { useLocation } from "react-router-dom";
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
// how Setup and Customize are set apart: the sheet; ?sep=3 band, ?sep=0 neither (SectionSep)
import "@/styles/section-sep.css";
// fixes for phones on their side, tall portrait tablets and the like (loaded last: it overrides the sections' own files)
import "@/styles/landing-responsive.css";
// big screens (wider than 1440): the whole page grows with the screen (rem-based)
import "@/styles/big-screen.css";
import { useSep } from "@/components/landing/SectionSep";
// the pillar openers' designs under comparison (?open=1..6, pillar/OpenerContext)
import {
  OpenerContext,
  PillarAreaContext,
} from "@/components/landing/pillar/OpenerContext";
import type { Opener } from "@/components/landing/pillar/OpenerContext";

/**
 * The opener shown without ?open: "0", the pillars' big scroll-away names and
 * docked bars (PillarIntro); ?open=1..6 shows the opener designs under
 * comparison (pillar/OpenerDesign, pillar-openers.css).
 */
const DEFAULT_OPEN: Opener = "5"; // the chapter opener (chosen 2026-10-16); ?open=0 shows the previous big-name opener

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
  // the opener design: ?open=1..6, else DEFAULT_OPEN
  const openParam =
    new URLSearchParams(useLocation().search).get("open") ?? DEFAULT_OPEN;
  const open = /^[0-6]$/.test(openParam) ? (openParam as Opener) : DEFAULT_OPEN;
  // Setup's and Customize's surfaces: the sheet ("2"); ?sep=3 band, ?sep=0 neither
  const sep = useSep();

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

  // the page's palette, "Bizmis Mono" (palette-options.css)
  return (
    <OpenerContext.Provider value={open}>
      <div
        className="bzl min-h-screen"
        data-palette="1"
        data-look="film"
        data-open={open}
        data-sep={sep === "none" ? undefined : sep}
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
    </OpenerContext.Provider>
  );
};

export default FilmLanding;
