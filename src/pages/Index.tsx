import { useEffect } from "react";
import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import Setup from "@/components/Setup";
import Customization from "@/components/Customization";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import {
  setupScrollToSectionOnLoad,
  setupScrollToUrlUpdater,
} from "@/lib/utils/scroll";

const Index = () => {
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
