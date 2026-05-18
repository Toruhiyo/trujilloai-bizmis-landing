import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PricingComponent from "@/components/Pricing";
import Footer from "@/components/Footer";

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/40 via-background to-muted/80">
      <Seo
        title="Bizmis Pricing — Plans for Shopify Stores"
        description="Simple Bizmis pricing for Shopify stores of any size. Pick a plan, install in one click, and start selling with a voice-first store clerk."
        path="/pricing"
      />
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:gap-2 sm:text-base"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to Home
            </button>
            <div className="h-5 w-px bg-border sm:h-6" />
            <h1 className="font-heading text-lg font-bold text-foreground sm:text-2xl">
              Pricing
            </h1>
          </div>
        </div>
      </div>

      <PricingComponent />
      <Footer />
    </div>
  );
};

export default Pricing;
