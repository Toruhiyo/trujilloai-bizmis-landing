import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ValueSections from "@/components/ValueSections";
import Integration from "@/components/Integration";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <ValueSections />
      <Integration />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
