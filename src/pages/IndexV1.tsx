import { useEffect } from "react";
import HeroV1 from "@/components/v1/HeroV1";
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

/**
 * The landing as it was before the film-led hero (archived at /v1).
 * Only the hero is frozen here; the sections below are shared with the
 * live landing — copy one into components/v1/ before redesigning it if
 * /v1 should keep the old version. Lazy-loaded and noindex, so it costs
 * the live landing nothing and never competes with it in search.
 */
const IndexV1 = () => {
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
        path="/v1"
        noIndex
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

export default IndexV1;
