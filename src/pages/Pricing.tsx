import PricingComponent from "@/components/Pricing";
import SitePage from "@/components/site/SitePage";
import Seo from "@/components/Seo";
import { useMessages } from "@/i18n/LocaleProvider";

const Pricing = () => {
  const messages = useMessages();

  return (
    <SitePage>
      <Seo
        title={messages.seo.pricing.title}
        description={messages.seo.pricing.description}
        path="/pricing"
      />
      <PricingComponent />
    </SitePage>
  );
};

export default Pricing;
