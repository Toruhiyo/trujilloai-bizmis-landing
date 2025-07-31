import Navbar from "@/components/Navbar";
import BizmisHero from "@/components/BizmisHero";
import BizmisFeatures from "@/components/BizmisFeatures";
import BizmisIntegration from "@/components/BizmisIntegration";
import BizmisCTA from "@/components/BizmisCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <BizmisHero />
      <BizmisFeatures />
      <BizmisIntegration />
      <BizmisCTA />
      <Footer />
    </div>
  );
};

export default Index;
