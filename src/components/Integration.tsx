import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Settings } from "lucide-react";

const Integration = () => {
  return (
    <section
      id="integration"
      className="py-20 bg-white relative overflow-hidden"
    >
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
            Integration Options
          </h2>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
            Choose the integration that works best for your store setup.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Shopify Integration */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/50 rounded-full -translate-y-16 translate-x-16" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-gray-900">
                  Shopify App Store
                </h3>
              </div>

              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                Install Bizmis directly from the Shopify App Store. One-click
                setup, no coding required.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  <span className="font-body">1-click install</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  <span className="font-body">
                    Catalog and store data auto-synced
                  </span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  <span className="font-body">Ready instantly</span>
                </div>
              </div>

              <Button variant="warm" size="lg" className="group">
                Get it on Shopify
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Custom Website */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/50 rounded-full -translate-y-16 translate-x-16" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-gray-900">
                  Custom Website Integration
                </h3>
              </div>

              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                Tailored integration for your unique website. We assess and
                customize everything to fit perfectly.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                  <span className="font-body">Tailor-made setup</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                  <span className="font-body">Custom assessment</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                  <span className="font-body">Schedule a discovery call</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="lg"
                className="group border-purple-200 text-purple-700 hover:bg-purple-50 font-body"
              >
                Schedule a Call
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integration;
