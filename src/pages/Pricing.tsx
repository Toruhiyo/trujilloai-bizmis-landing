import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PricingComponent from "@/components/Pricing";
import Footer from "@/components/Footer";

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-orange-50/20">
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            <div className="w-px h-6 bg-border"></div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
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
