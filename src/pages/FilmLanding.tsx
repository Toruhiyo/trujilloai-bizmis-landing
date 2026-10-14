import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
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
import {
  setupScrollToSectionOnLoad,
  setupScrollToUrlUpdater,
} from "@/lib/utils/scroll";
import { useMessages } from "@/i18n/LocaleProvider";
import "@/styles/film-landing.css";
import "@/styles/palette-options.css";
// the film look, the page's only look (keyed on data-look="film")
import "@/styles/look-film.css";
// how sections open and are told apart: the opener systems (data-open, ?open=1..6)
import "@/styles/openers.css";
import PillarStrip from "@/components/landing/openers/PillarStrip";

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
  // the opener system (openers.css): ?open=1..6, 1 by default
  const openParam = new URLSearchParams(useLocation().search).get("open") ?? "1";
  const open = /^[1-6]$/.test(openParam) ? openParam : "1";

  // Lets the film landing's scoped CSS reach the shared navbar (outside .bzl),
  // e.g. the handwritten "Early Access" link, without touching other pages.
  useEffect(() => {
    document.documentElement.classList.add("bzl-page");
    return () => document.documentElement.classList.remove("bzl-page");
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
    <div className="bzl min-h-screen" data-palette="1" data-look="film" data-open={open}>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Caveat:wght@600;700&family=VT323&display=swap"
        />
      </Helmet>
      <Seo
        title={messages.seo.home.title}
        description={messages.seo.home.description}
        path={path}
        // Kept out of search while it lives at /v2, so it never competes with /.
        noIndex={path !== "/"}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Bizmis",
          description: messages.seo.home.jsonLdDescription,
          url: "https://www.bizmis.ai",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/PreOrder",
          },
          publisher: {
            "@type": "Organization",
            name: "Bizmis",
            url: "https://www.bizmis.ai",
            logo: "https://bizmis.ai/favicon.svg",
            sameAs: ["https://twitter.com/bizmis_ai"],
          },
        }}
      />
      <Hero />
      {/* "This isn't a chatbot" (SwitchSection) is hidden: the hero covers it now */}
      {/* system 6 gathers the three benefits under one sticky segmented header */}
      {open === "6" ? (
        <PillarStrip>
          <SalesSection />
          <SupportSection />
          <InsightsSection />
        </PillarStrip>
      ) : (
        <>
          <SalesSection />
          <SupportSection />
          <InsightsSection />
        </>
      )}
      <SetupSection />
      <CustomizeSection />
      <EndCard />
      <FilmFooter />
    </div>
  );
};

export default FilmLanding;
