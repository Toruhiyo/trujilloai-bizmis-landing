import { useEffect } from "react";
import Hero from "@/components/Hero";
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

const Index = () => {
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
      <Hero />
      <Benefits />
      <Setup />
      <Customization />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
