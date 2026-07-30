import PricingComponent from "@/components/Pricing";
import Footer from "@/components/Footer";
import PublicPageLayout from "@/components/PublicPageLayout";
import Seo from "@/components/Seo";
import { useMessages } from "@/i18n/LocaleProvider";

const Pricing = () => {
  const messages = useMessages();

  return (
    <PublicPageLayout className="bg-gradient-to-br from-accent/40 via-background to-muted/80">
      <Seo
        title={messages.seo.pricing.title}
        description={messages.seo.pricing.description}
        path="/pricing"
      />
      <PricingComponent />
      <Footer />
    </PublicPageLayout>
  );
};

export default Pricing;
