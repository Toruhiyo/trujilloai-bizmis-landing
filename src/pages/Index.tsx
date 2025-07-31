import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SalesConversion from "@/components/SalesConversion";
import CustomerSupport from "@/components/CustomerSupport";
import StoreInsights from "@/components/StoreInsights";
import Integration from "@/components/Integration";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <SalesConversion />
      <CustomerSupport />
      <StoreInsights />
      <Integration />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
