import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";

const BizmisIntegration = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-heading font-bold text-gray-900 mb-6">
              Ready out of the box
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bizmis installs from the Shopify App Store. No setup needed.
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-8 lg:p-12 border border-primary/20">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-heading font-bold text-gray-900">
                    Instant Setup
                  </h3>
                  
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">
                        Instantly connects to your catalog, inventory, and store policies
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">
                        Starts working the moment it's installed
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">
                        No training, no configuration — just results
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-center lg:text-right">
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full mx-auto lg:mx-0 lg:ml-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">🛍️</span>
                  </div>
                  <h4 className="font-heading font-semibold text-gray-900 mb-2">
                    Shopify Integration
                  </h4>
                  <p className="text-sm text-gray-600">
                    One-click installation
                  </p>
                </div>

                <Button 
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-xl shadow-lg group"
                >
                  Install from App Store
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BizmisIntegration;