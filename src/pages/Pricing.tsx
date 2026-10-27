import PricingComponent from "@/components/Pricing";
import SitePage from "@/components/site/SitePage";
import Seo from "@/components/Seo";

const Pricing = () => (
  <SitePage>
    <Seo page="pricing" />
    <PricingComponent />
  </SitePage>
);

export default Pricing;
