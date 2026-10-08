import { lazy, Suspense, useEffect } from "react";
import HeroV1 from "@/components/v1/HeroV1";
import { HERO_FILM_ENABLED } from "@/lib/film";
import Benefits from "@/components/Benefits";
import Setup from "@/components/Setup";
import Customization from "@/components/Customization";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import {
  setupScrollToSectionOnLoad,
  setupScrollToUrlUpdater,
} from "@/lib/utils/scroll";
import { useMessages } from "@/i18n/LocaleProvider";

/** The landing as it was before the film-led redesign (also served at /v1). */
const ClassicIndex = () => {
  const messages = useMessages();

  useEffect(() => {
    const sectionIds = [
      "hero",
      "benefits",
      "benefit-1",
      "benefit-2",
      "benefit-3",
      "setup",
      "customization",
    ];

    const cleanupScrollToSection = setupScrollToSectionOnLoad();
    const cleanupUrlUpdater = setupScrollToUrlUpdater(sectionIds);

    return () => {
      cleanupScrollToSection();
      cleanupUrlUpdater();
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Seo
        title={messages.seo.home.title}
        description={messages.seo.home.description}
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Bizmis",
          description: messages.seo.home.jsonLdDescription,
          url: "https://www.bizmis.ai",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", availability: "https://schema.org/PreOrder" },
          publisher: {
            "@type": "Organization",
            name: "Bizmis",
            url: "https://www.bizmis.ai",
            logo: "https://bizmis.ai/favicon.svg",
            sameAs: ["https://twitter.com/bizmis_ai"],
          },
        }}
      />
      <HeroV1 />
      <Benefits />
      <Setup />
      <Customization />
      <CTA />
      <Footer />
    </div>
  );
};

// Its own chunk (components + scoped CSS): the classic landing never loads it.
const FilmLanding = lazy(() => import("./FilmLanding"));

/**
 * "/" — the film-led landing when HERO_FILM_ENABLED (dev, or VITE_HERO_FILM=1),
 * otherwise the classic landing, untouched.
 */
const Index = () =>
  HERO_FILM_ENABLED ? (
    <Suspense fallback={<div className="min-h-screen studio-lighting-base" />}>
      <FilmLanding />
    </Suspense>
  ) : (
    <ClassicIndex />
  );

export default Index;
