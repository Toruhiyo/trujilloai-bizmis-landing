import React from "react";
import { Zap, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionBadge from "./SectionBadge";

const Integration = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-orange-50/10 via-background to-amber-50/15 border-t border-orange-200/20">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <SectionBadge icon={Zap} text="Integration Options" />
            <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
              Choose Your Integration Path
            </h2>
            <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
              Choose the integration that works best for your store setup.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Shopify Integration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-100/30 to-amber-100/40 rounded-3xl p-8 border-2 border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 group">
                <div className="absolute -top-4 left-8 bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Recommended
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-foreground">
                      Shopify App Store
                    </h3>
                    <p className="text-orange-600">One-click installation</p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Install Bizmis directly from the Shopify App Store. One-click
                  setup, no coding required.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    "1-click install",
                    "Catalog and store data auto-synced",
                    "Ready instantly",
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center text-muted-foreground"
                    >
                      <div className="w-2 h-2 bg-orange-600 rounded-full mr-3" />
                      <span className="font-body">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50/50 rounded-2xl p-6 mb-6">
                  <div className="text-center text-orange-600/60 text-sm">
                    [Shopify app store integration mockup]
                  </div>
                </div>

                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  Get it on Shopify
                </Button>
              </div>
            </div>

            {/* Custom Integration */}
            <div className="bg-gradient-to-br from-amber-100/30 to-orange-100/30 rounded-3xl p-8 border border-orange-200/30 hover:border-orange-300/40 transition-all duration-300 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-heading font-bold text-foreground">
                    Custom Website
                  </h3>
                  <p className="text-orange-600">Tailored integration</p>
                </div>
              </div>

              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                Tailored integration for your unique website. We assess and
                customize everything to fit perfectly.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  "Tailor-made setup",
                  "Custom assessment",
                  "Schedule a discovery call",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center text-muted-foreground"
                  >
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-3" />
                    <span className="font-body">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50/50 rounded-2xl p-6 mb-6">
                <div className="text-center text-orange-600/60 text-sm">
                  [Custom integration process diagram]
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
              >
                Schedule a Call
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integration;
