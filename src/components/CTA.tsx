import { Button } from "@/components/ui/button";
import { Play, MessageCircle } from "lucide-react";
import { FaShopify } from "react-icons/fa";
import { scrollToSection } from "@/lib/utils/scroll";
import TestimonialCarousel from "./TestimonialCarousel";

// Shopify App Store URL - replace with actual URL when available
const SHOPIFY_APP_STORE_URL = "https://apps.shopify.com/bizmis";

const FinalCTA = () => {
  const handleDemoClick = () => {
    // First try to scroll to demo section
    const demoElement = document.getElementById("demo");
    if (demoElement) {
      scrollToSection("demo");
    } else {
      // Fallback: could open demo modal or navigate to demo page
      console.log("Demo section not found - implement modal fallback");
    }
  };

  const handleShopifyInstall = () => {
    window.open(SHOPIFY_APP_STORE_URL, "_self");
  };

  const handleTalkToSales = () => {
    window.location.href = "/contact";
  };

  const handleFAQClick = () => {
    window.location.href = "/faqs";
  };

  return (
    <section
      id="final-cta"
      aria-labelledby="final-cta-title"
      className="py-20 lg:py-24 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(25 95% 53%), hsl(25 95% 40%))",
      }}
    >
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column: Main Content */}
            <div className="lg:order-1 order-2">
              <h2
                id="final-cta-title"
                className="text-4xl lg:text-5xl xl:text-6xl font-heading font-bold text-white leading-tight mb-6"
              >
                Install on Shopify in 1 click. Start selling today.
              </h2>

              <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed">
                Bizmis greets visitors, answers their questions, and guides them
                to checkout—fully synced with your Shopify products, discounts,
                and orders.
              </p>

              {/* Feature bullets */}
              <ul className="space-y-3 mb-10">
                <li className="flex items-start gap-3 text-white/90">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-lg">Greets and qualifies shoppers</span>
                </li>
                <li className="flex items-start gap-3 text-white/90">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-lg">
                    Explains differences & recommends
                  </span>
                </li>
                <li className="flex items-start gap-3 text-white/90">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-lg">
                    Handles support and reduces tickets
                  </span>
                </li>
              </ul>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Button
                  onClick={handleShopifyInstall}
                  aria-label="Install Bizmis on Shopify — Free for 14 days"
                  className="bg-white text-orange-600 hover:bg-white/95 hover:shadow-lg focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-orange-600 text-lg px-8 py-4 h-auto group transition-all duration-200"
                  size="xl"
                >
                  <FaShopify
                    className="w-6 h-6 mr-3 text-orange-600"
                    aria-hidden="true"
                  />
                  Install on Shopify — Free for 14 days
                </Button>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleDemoClick}
                    aria-label="Watch 60-second demo video"
                    className="bg-transparent border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-orange-600 px-6 py-3 h-auto transition-all duration-200 flex items-center justify-center"
                  >
                    <Play className="w-5 h-5 mr-2" aria-hidden="true" />
                    Watch 60-sec demo
                  </Button>

                  <Button
                    onClick={handleTalkToSales}
                    aria-label="Talk to sales team"
                    className="bg-transparent border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-orange-600 px-6 py-3 h-auto transition-all duration-200 hidden md:flex items-center justify-center"
                  >
                    <MessageCircle
                      className="w-5 h-5 mr-2"
                      aria-hidden="true"
                    />
                    Talk to sales
                  </Button>
                </div>
              </div>

              {/* Microline */}
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                Cancel anytime • GDPR-ready • Built for Shopify
              </p>

              {/* FAQ Link */}
              <button
                onClick={handleFAQClick}
                className="text-white/80 hover:text-white underline decoration-white/50 hover:decoration-white text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-orange-600 rounded px-1"
              >
                What counts as a conversation?
              </button>
            </div>

            {/* Right Column: Proof Card */}
            <div className="lg:order-2 order-1 flex justify-center lg:justify-end">
              <TestimonialCarousel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
