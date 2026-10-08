import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Hero from "@/components/Hero";
import Seo from "@/components/Seo";
import SwitchSection from "@/components/landing/SwitchSection";
import SalesSection from "@/components/landing/SalesSection";
import SupportSection from "@/components/landing/SupportSection";
import InsightsSection from "@/components/landing/InsightsSection";
import SetupSection from "@/components/landing/SetupSection";
import CustomizeSection from "@/components/landing/CustomizeSection";
import EndCard from "@/components/landing/EndCard";
import FilmFooter from "@/components/landing/FilmFooter";
import { setupScrollToSectionOnLoad, setupScrollToUrlUpdater } from "@/lib/utils/scroll";
import { useMessages } from "@/i18n/LocaleProvider";
import "@/styles/film-landing.css";

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

  useEffect(() => {
    const cleanupScrollToSection = setupScrollToSectionOnLoad();
    const cleanupUrlUpdater = setupScrollToUrlUpdater(["hero", "benefits", "setup"]);
    return () => {
      cleanupScrollToSection();
      cleanupUrlUpdater();
    };
  }, []);

  return (
    <div className="bzl min-h-screen">
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Caveat:wght@600;700&display=swap"
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
      <Hero />
      <SwitchSection />
      <SalesSection />
      <SupportSection />
      <InsightsSection />
      <SetupSection />
      <CustomizeSection />
      <EndCard />
      <FilmFooter />
    </div>
  );
};

export default FilmLanding;
