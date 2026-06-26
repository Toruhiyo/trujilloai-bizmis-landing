import PricingComponent from "@/components/Pricing";
import Footer from "@/components/Footer";
import PublicPageLayout from "@/components/PublicPageLayout";
import Seo from "@/components/Seo";

const Pricing = () => {
  return (
    <PublicPageLayout className="bg-gradient-to-br from-accent/40 via-background to-muted/80">
      <Seo
        title="Bizmis Pricing — Plans for Shopify Stores"
        description="Simple Bizmis pricing for Shopify stores of any size. Pick a plan, install in one click, and start selling with a voice-first store clerk."
        path="/pricing"
      />
      <PricingComponent />
      <Footer />
    </PublicPageLayout>
  );
};

export default Pricing;
