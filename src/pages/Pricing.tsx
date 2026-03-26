import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PricingComponent from "@/components/Pricing";
import Footer from "@/components/Footer";

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/40 via-background to-muted/80">
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to Home
            </button>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-heading text-2xl font-bold text-foreground">
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
