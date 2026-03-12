import { useState, useEffect } from "react";
import {
  FaGlobe,
  FaTag,
  FaUsers,
  FaPercent,
  FaBox,
  FaSync,
  FaBolt,
  FaShoppingCart,
  FaShopify,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import SectionBadge from "./SectionBadge";
import Xarrow from "react-xarrows";

// Constants for connector styling
const CONNECTOR_STROKE_WIDTH = 4;
const CONNECTOR_CURVENESS = 0.4;
const CONNECTOR_ANIMATION_DURATION = 0.5;
const CONNECTOR_Z_INDEX = -1;
const CONNECTOR_COLOR = "rgba(253, 145, 42, 0.25)";
const CONNECTOR_INFLECTION_OFFSET_X = 100;

// Constants for shiny dots
const SHINY_DOT_STROKE_WIDTH = 3;
const SHINY_DOT_COLOR = "rgba(255, 255, 255, 0.4)";
const SHINY_DOT_ANIMATION_DURATION = 2;

// Constants for re-rendering
const MIN_RERENDER_INTERVAL_MS = 2000; // 2 seconds
const MAX_RERENDER_INTERVAL_MS = 4000; // 4 seconds

// Constants for heartbeat avatar effect
const HEARTBEAT_PULSE_DURATION_MS = 2000; // 4s for slower heartbeat
const HEARTBEAT_FADE_DURATION_MS = 600; // Duration of each heartbeat fade

const shopifyDataCards = [
  {
    icon: FaGlobe,
    title: "Store Website",
    description: "Vision, mission and core values",
  },
  {
    icon: FaTag,
    title: "Products Catalog",
    description: "Collections, inventory, purchase orders",
  },
  {
    icon: FaPercent,
    title: "Discounts",
    description: "All current promotions",
  },
  {
    icon: FaUsers,
    title: "Customers",
    description: "Customer sales and support records",
  },
  {
    icon: FaBox,
    title: "Orders",
    description: "Customer order history",
  },
];

const Setup = () => {
  // State for forcing re-renders - separate key for each connector
  const [renderKeys, setRenderKeys] = useState([0, 0, 0, 0, 0]);

  // State for heartbeat avatar effect
  const [avatarOpacity, setAvatarOpacity] = useState(1);

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

  // Effect for heartbeat avatar animation
  useEffect(() => {
    let avatarInterval: NodeJS.Timeout;

    const createHeartbeatEffect = () => {
      avatarInterval = setInterval(() => {
        // Create single heartbeat pattern: fade to 0, then back to 1
        setAvatarOpacity(0);

        setTimeout(() => {
          setAvatarOpacity(1);
        }, HEARTBEAT_FADE_DURATION_MS);
      }, HEARTBEAT_PULSE_DURATION_MS);
    };

    createHeartbeatEffect();

    return () => {
      if (avatarInterval) {
        clearInterval(avatarInterval);
      }
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes clickIn {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
          100% { transform: scale(1) rotate(360deg); opacity: 1; }
        }
        
        @keyframes explodeOut {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          50% { transform: translate(var(--tx), var(--ty)) scale(1.5); opacity: 0.8; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }

        /* Ensure aura elements can extend beyond container boundaries */
        #setup .relative {
          overflow: visible !important;
        }
        
        /* Allow aura elements to render outside their containers */
        #setup .absolute {
          overflow: visible !important;
        }
      `}</style>

      <section
        id="setup"
        className="py-24 bg-gradient-to-r from-[#FDF7E2]/[0.05] via-background/40 to-[#FDF7E2]/[0.08] border-t border-primary/20 relative overflow-visible"
      >
        {/* Perimeter glow — strongest at outer edge, fading inward */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Top edge */}
          <div className="absolute -top-56 left-[3%] w-[50%] h-64 bg-primary/30 rounded-[50%] blur-[70px]"></div>
          <div className="absolute -top-56 right-[3%] w-[50%] h-64 bg-primary/25 rounded-[50%] blur-[70px]"></div>

          {/* Bottom edge */}
          <div className="absolute -bottom-56 left-[3%] w-[50%] h-64 bg-primary/30 rounded-[50%] blur-[70px]"></div>
          <div className="absolute -bottom-56 right-[3%] w-[50%] h-64 bg-primary/25 rounded-[50%] blur-[70px]"></div>

          {/* Left edge */}
          <div className="absolute top-[5%] -left-64 w-96 h-[38%] bg-primary/30 rounded-[50%] blur-[70px]"></div>
          <div className="absolute bottom-[5%] -left-64 w-96 h-[38%] bg-primary/25 rounded-[50%] blur-[70px]"></div>

          {/* Right edge */}
          <div className="absolute top-[5%] -right-64 w-96 h-[38%] bg-primary/30 rounded-[50%] blur-[70px]"></div>
          <div className="absolute bottom-[5%] -right-64 w-96 h-[38%] bg-primary/25 rounded-[50%] blur-[70px]"></div>

          {/* Corner reinforcements */}
          <div className="absolute -top-48 -left-48 w-[28rem] h-72 bg-primary/[0.28] rounded-[50%] blur-[60px]"></div>
          <div className="absolute -top-48 -right-48 w-[28rem] h-72 bg-primary/[0.28] rounded-[50%] blur-[60px]"></div>
          <div className="absolute -bottom-48 -left-48 w-[28rem] h-72 bg-primary/[0.28] rounded-[50%] blur-[60px]"></div>
          <div className="absolute -bottom-48 -right-48 w-[28rem] h-72 bg-primary/[0.28] rounded-[50%] blur-[60px]"></div>
        </div>

        <div className="container mx-auto px-6 overflow-visible">
          <div className="max-w-7xl mx-auto overflow-visible">
            {/* Header */}
            <div className="text-center mb-16">
              <SectionBadge icon={FaShopify} text="Plug and Play" />
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
                One-Click Setup, Instant Selling & Support
              </h2>
              <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
                Install the Bizmis Shopify app and start selling and supporting
                customers immediately.
              </p>
            </div>

            {/* Integration diagram */}
            <div className="relative mb-12">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
                {/* Shopify Data Cards - Stacked Vertically */}
                <div className="flex-1 max-w-md">
                  <div className="rounded-2xl border border-primary/20 p-6">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 text-primary/60">
                        <FaShopify className="w-5 h-5" />
                        <span className="text-lg font-heading font-semibold">
                          Your Shopify Store Data
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                    {shopifyDataCards.map((card, index) => (
                      <div
                        key={index}
                        id={`card-${index}`}
                        className="group relative bg-primary/10 backdrop-blur-sm rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_2px_8px_-2px_rgba(253,145,42,0.06)] hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                      >
                        {/* Shopify Icon Watermark */}
                        <div className="absolute bottom-[calc(50%-2.5rem)] right-0 opacity-10 group-hover:opacity-15 transition-opacity duration-300">
                          <FaShopify className="w-20 h-20 text-primary" />
                        </div>

                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-14 h-14 bg-transparent rounded-xl flex items-center justify-center shrink-0">
                            <card.icon className="w-6 h-6 text-primary/40 group-hover:text-primary/70 transition-colors duration-300" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-heading font-semibold text-foreground text-lg mb-1">
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
                </div>

                {/* Avatar Image with Aura */}
                <div
                  className="relative flex items-center justify-center max-w-full"
                  style={{ minHeight: "clamp(24rem, 50vh, 48rem)" }}
                >
                  {/* Aura — centered, expands/retracts in sync with orange avatar */}
                  {(() => {
                    const pulse = 1 - avatarOpacity;
                    return (
                      <>
                        <div
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            width: "28rem",
                            height: "28rem",
                            left: "50%",
                            top: "50%",
                            transform: `translate(-50%, -50%) scale(${0.5 + pulse * 0.5})`,
                            background:
                              "radial-gradient(circle, rgba(253,145,42,0.5) 0%, rgba(253,145,42,0.2) 40%, transparent 70%)",
                            opacity: pulse,
                            transition: `opacity ${HEARTBEAT_FADE_DURATION_MS}ms ease-in-out, transform ${HEARTBEAT_FADE_DURATION_MS}ms ease-in-out`,
                            zIndex: 1,
                          }}
                        />
                        <div
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            width: "38rem",
                            height: "38rem",
                            left: "50%",
                            top: "50%",
                            transform: `translate(-50%, -50%) scale(${0.4 + pulse * 0.6})`,
                            background:
                              "radial-gradient(circle, rgba(253,145,42,0.3) 0%, rgba(253,145,42,0.1) 50%, transparent 75%)",
                            opacity: pulse * 0.7,
                            transition: `opacity ${HEARTBEAT_FADE_DURATION_MS}ms ease-in-out, transform ${HEARTBEAT_FADE_DURATION_MS}ms ease-in-out`,
                            zIndex: 1,
                          }}
                        />
                      </>
                    );
                  })()}

                  {/* Avatar Images with Heartbeat Effect — scale-90 below lg; full size at lg+ */}
                  <div id="avatar-target" className="relative z-10 max-w-full scale-90 lg:scale-100">
                    {/* Orange avatar always visible behind */}
                    <img
                      src="/images/setup-avatar-orange.png"
                      alt="Bizmis Storemate Orange"
                      className="h-[36rem] w-auto max-w-full object-contain"
                      style={{ aspectRatio: "auto" }}
                      onError={(e) =>
                        console.error(
                          "Failed to load setup-avatar-orange.png:",
                          e
                        )
                      }
                    />
                    {/* Regular avatar with heartbeat opacity effect */}
                    <img
                      src="/images/setup-avatar.png"
                      alt="Bizmis Storemate"
                      className="h-[36rem] w-auto max-w-full object-contain absolute top-0 left-0"
                      style={{
                        opacity: avatarOpacity,
                        transition: `opacity ${HEARTBEAT_FADE_DURATION_MS}ms ease-in-out`,
                        aspectRatio: "auto",
                      }}
                      onError={(e) =>
                        console.error("Failed to load setup-avatar.png:", e)
                      }
                    />
                  </div>
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
                    _cpx1Offset={CONNECTOR_INFLECTION_OFFSET_X}
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
                    _cpx1Offset={CONNECTOR_INFLECTION_OFFSET_X}
                  />
                ))}
              </div>

              {/* Mobile Connectors - Start from each side of cards and go to avatar */}
              <div className="lg:hidden relative">
                {shopifyDataCards.map((_, index) => (
                  <div key={`mobile-connector-${renderKeys[index]}-${index}`}>
                    {/* Left side connector */}
                    <Xarrow
                      start={`card-${index}`}
                      end="avatar-target"
                      color={CONNECTOR_COLOR}
                      strokeWidth={CONNECTOR_STROKE_WIDTH}
                      curveness={0.2}
                      showHead={false}
                      path="smooth"
                      startAnchor="left"
                      endAnchor="middle"
                      animateDrawing={CONNECTOR_ANIMATION_DURATION}
                      zIndex={CONNECTOR_Z_INDEX}
                    />
                    {/* Right side connector */}
                    <Xarrow
                      start={`card-${index}`}
                      end="avatar-target"
                      color={CONNECTOR_COLOR}
                      strokeWidth={CONNECTOR_STROKE_WIDTH}
                      curveness={0.2}
                      showHead={false}
                      path="smooth"
                      startAnchor="right"
                      endAnchor="middle"
                      animateDrawing={CONNECTOR_ANIMATION_DURATION}
                      zIndex={CONNECTOR_Z_INDEX}
                    />
                  </div>
                ))}
              </div>

              {/* Mobile Shiny Dots */}
              <div className="lg:hidden relative">
                {shopifyDataCards.map((_, index) => (
                  <div key={`mobile-dot-${renderKeys[index]}-${index}`}>
                    {/* Left side shiny dot */}
                    <Xarrow
                      start={`card-${index}`}
                      end="avatar-target"
                      color={SHINY_DOT_COLOR}
                      strokeWidth={SHINY_DOT_STROKE_WIDTH}
                      curveness={0.2}
                      showHead={false}
                      path="smooth"
                      startAnchor="left"
                      endAnchor="middle"
                      zIndex={CONNECTOR_Z_INDEX}
                      animateDrawing={SHINY_DOT_ANIMATION_DURATION}
                    />
                    {/* Right side shiny dot */}
                    <Xarrow
                      start={`card-${index}`}
                      end="avatar-target"
                      color={SHINY_DOT_COLOR}
                      strokeWidth={SHINY_DOT_STROKE_WIDTH}
                      curveness={0.2}
                      showHead={false}
                      path="smooth"
                      startAnchor="right"
                      endAnchor="middle"
                      zIndex={CONNECTOR_Z_INDEX}
                      animateDrawing={SHINY_DOT_ANIMATION_DURATION}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Trust badges — lightweight reassurance, footnotes of the diagram */}
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 py-4 mb-8 opacity-60">
              {[
                { icon: FaBolt, label: "One-click setup" },
                { icon: FaSync, label: "Always synced" },
                { icon: FaShoppingCart, label: "Ready in minutes" },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-4 md:gap-6">
                  {i > 0 && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground/85 shrink-0"
                      aria-hidden
                    />
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground/85">
                    <badge.icon className="h-4 w-4 shrink-0 text-muted-foreground/85" />
                    <span className="text-sm font-medium">{badge.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button className="bg-foreground hover:bg-foreground/90 text-white px-8 py-3 text-lg inline-flex items-center gap-2">
                <FaShopify className="h-5 w-5" />
                Install Bizmis on Shopify
              </Button>
              <p className="text-sm text-muted-foreground mt-3 font-body opacity-60">
                Start selling and supporting customers now.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Setup;
