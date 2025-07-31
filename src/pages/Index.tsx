import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BizmisFeatures from "@/components/BizmisFeatures";
import BizmisIntegration from "@/components/BizmisIntegration";
import BizmisPricing from "@/components/BizmisPricing";
import BizmisCTA from "@/components/BizmisCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <BizmisFeatures />
      <BizmisIntegration />
      <BizmisPricing />
      <BizmisCTA />
      <Footer />
    </div>
  );
};

export default Index;
