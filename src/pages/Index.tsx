import { useEffect } from "react";
import Hero from "@/components/Hero";
import ValueShowcase from "@/components/ValueShowcase";
import Integration from "@/components/Integration";
import Pricing from "@/components/Pricing";
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
      "integration",
      "pricing",
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
      <ValueShowcase />
      <Integration />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
