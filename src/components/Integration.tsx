import React, { useState, useEffect } from "react";
import { Zap, ShoppingBag, Tag, Users, Percent, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionBadge from "./SectionBadge";
import Xarrow from "react-xarrows";

const Integration = () => {
  // State for forcing re-renders - separate key for each connector
  const [renderKeys, setRenderKeys] = useState([0, 0, 0, 0, 0]);

  // Constants for connector styling
  const CONNECTOR_STROKE_WIDTH = 4;
  const CONNECTOR_CURVENESS = 0.8;
  const CONNECTOR_ANIMATION_DURATION = 0.5;
  const CONNECTOR_Z_INDEX = -1;
  const CONNECTOR_COLOR = "#ea580c";

  // Constants for shiny dots
  const SHINY_DOT_STROKE_WIDTH = 3;
  const SHINY_DOT_COLOR = "#ffffff";
  const SHINY_DOT_ANIMATION_DURATION = 2;

  // Constants for re-rendering
  const MIN_RERENDER_INTERVAL_MS = 2000; // 2 seconds
  const MAX_RERENDER_INTERVAL_MS = 4000; // 4 seconds

  const shopifyDataCards = [
    {
      icon: ShoppingBag,
      title: "Store Website",
      description: "Vision, mission and core values",
    },
    {
      icon: Tag,
      title: "Products Catalog",
      description: "Collections, inventory, purchase orders",
    },
    {
      icon: Percent,
      title: "Discounts",
      description: "All current promotions",
    },
    {
      icon: Users,
      title: "Customers",
      description: "Who you're selling to",
    },
    {
      icon: Package,
      title: "Orders",
      description: "Customer order history",
    },
  ];

  // Effect to force re-renders at random intervals for each connector
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    const scheduleNextRender = (connectorIndex: number) => {
      const randomInterval =
        Math.random() * (MAX_RERENDER_INTERVAL_MS - MIN_RERENDER_INTERVAL_MS) +
        MIN_RERENDER_INTERVAL_MS;

      const timeout = setTimeout(() => {
        setRenderKeys((prev) => {
          const newKeys = [...prev];
          newKeys[connectorIndex] += 1;
          return newKeys;
        });
        scheduleNextRender(connectorIndex); // Schedule the next render for this connector
      }, randomInterval);

      timeouts.push(timeout);
    };

    // Start independent re-rendering for each connector
    shopifyDataCards.forEach((_, index) => {
      scheduleNextRender(index);
    });

    return () => {
      // Cleanup all timeouts
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  return (
    <section className="py-24 bg-gradient-to-r from-orange-50/5 via-background to-amber-50/8 border-t border-orange-200/20">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <SectionBadge icon={Zap} text="Seamless Integration" />
            <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
              One-Click Setup, Instant Selling
            </h2>
            <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
              Install the Bizmis Shopify app and start selling immediately. No
              setup required - we automatically access all your store data to
              provide seamless customer support.
            </p>
          </div>

          {/* Data Flow Visualization */}
          <div className="relative mb-16 overflow-visible">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
              {/* Shopify Data Cards - Stacked Vertically */}
              <div className="flex-1 max-w-md">
                <div className="space-y-4">
                  {shopifyDataCards.map((card, index) => (
                    <div
                      key={index}
                      id={`card-${index}`}
                      className="relative bg-gradient-to-br from-orange-100/30 to-amber-100/40 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30 hover:scale-105 transition-all duration-300 group"
                      style={{
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-orange-600">
                          <card.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold text-foreground text-lg">
                            {card.title}
                          </h3>
                          <p className="text-sm text-muted-foreground font-body">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Avatar Image with Aura */}
              <div className="relative flex items-center justify-center">
                {/* Animated Aura/Halo - Circular */}
                <div className="absolute w-96 h-96 bg-gradient-to-r from-orange-400/20 via-orange-500/30 to-amber-400/20 rounded-full blur-xl animate-pulse"></div>
                <div
                  className="absolute w-80 h-80 bg-gradient-to-r from-orange-300/15 via-orange-400/25 to-amber-300/15 rounded-full blur-lg animate-ping"
                  style={{ animationDuration: "3s" }}
                ></div>
                <div
                  className="absolute w-72 h-72 bg-gradient-to-r from-orange-200/10 via-orange-300/20 to-amber-200/10 rounded-full blur-md animate-pulse"
                  style={{ animationDuration: "2s" }}
                ></div>

                {/* Avatar Image */}
                <img
                  id="avatar-target"
                  src="/images/setup-avatar.png"
                  alt="Bizmis Storemate"
                  className="h-[48rem] w-auto relative z-10"
                />
              </div>
            </div>

            {/* Curved Connectors using react-xarrows */}
            <div className="hidden lg:block">
              {shopifyDataCards.map((_, index) => (
                <Xarrow
                  key={`connector-${renderKeys[index]}-${index}`}
                  start={`card-${index}`}
                  end="avatar-target"
                  color={CONNECTOR_COLOR}
                  strokeWidth={CONNECTOR_STROKE_WIDTH}
                  curveness={CONNECTOR_CURVENESS}
                  showHead={false}
                  path="smooth"
                  startAnchor="right"
                  endAnchor="middle"
                  animateDrawing={CONNECTOR_ANIMATION_DURATION}
                  zIndex={CONNECTOR_Z_INDEX}
                />
              ))}
            </div>

            {/* Moving Shiny Dots */}
            <div className="hidden lg:block">
              {shopifyDataCards.map((_, index) => (
                <Xarrow
                  key={`dot-${renderKeys[index]}-${index}`}
                  start={`card-${index}`}
                  end="avatar-target"
                  color={SHINY_DOT_COLOR}
                  strokeWidth={SHINY_DOT_STROKE_WIDTH}
                  curveness={CONNECTOR_CURVENESS}
                  showHead={false}
                  path="smooth"
                  startAnchor="right"
                  endAnchor="middle"
                  zIndex={CONNECTOR_Z_INDEX}
                  animateDrawing={SHINY_DOT_ANIMATION_DURATION}
                />
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 rounded-3xl p-8 border border-orange-200/30">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
                Hassle-Free Setup
              </h3>
              <p className="text-muted-foreground text-lg">
                Your Bizmis storemate automatically knows everything about your
                business
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  title: "Instant Access",
                  description: "All your store data automatically synced",
                },
                {
                  title: "Zero Configuration",
                  description: "No manual setup or data entry required",
                },
                {
                  title: "Ready to Sell",
                  description: "Start providing customer support immediately",
                },
              ].map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-orange-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <div className="w-3 h-3 bg-orange-600 rounded-full" />
                  </div>
                  <h4 className="font-heading font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-muted-foreground font-body">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg">
                Install Bizmis App
              </Button>
              <p className="text-sm text-muted-foreground mt-3 font-body">
                Available on Shopify App Store • One-click installation
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integration;
