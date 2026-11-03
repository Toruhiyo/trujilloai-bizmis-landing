import { lazy, Suspense, useEffect, useState } from "react";
import Hero from "@/components/Hero";
import Seo from "@/components/Seo";
// The sections' own styles (their components import them too), in the order the page always had
// them, ahead of the page's own files below, which override them: the sections' code is its own
// chunk (FilmLandingSections) and comes after the hero's first paint, their styles stay here.
import "@/styles/beat-copy.css";
import "@/styles/pillar-intro.css";
import "@/styles/pillar-openers.css";
import "@/styles/pillar-docks.css";
import "@/styles/rewind-analog.css";
import "@/styles/landing-sales.css";
import "@/styles/rewind-sign.css";
import "@/styles/end-cta.css";
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
// touch screens: the stepped mode's bar and idle cue (lib/scrollSteps; nothing with a mouse)
import "@/styles/scroll-steps.css";

// Below the hero: Boost Sales, Support, Insights, Setup, Customize, the end card and the footer.
// They mount once the hero has painted (their chunk, then their images, come after it), so the
// hero's first paint waits only for its own code and has the connection to itself.
const loadSections = () => import("./FilmLandingSections");
const Sections = lazy(loadSections);
const Footer = lazy(() => loadSections().then((m) => ({ default: m.FilmFooter })));

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
  // the sections, from the frame after the hero's first paint (a timer too: no frames in a background tab)
  const [below, setBelow] = useState(false);
  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setBelow(true));
    });
    const timer = window.setTimeout(() => setBelow(true), 1000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

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
        {below && (
          <Suspense fallback={null}>
            <Sections />
          </Suspense>
        )}
      </main>
      {below && (
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      )}
    </div>
  );
};

export default FilmLanding;
