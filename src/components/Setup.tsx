import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Tag,
  Users,
  Percent,
  Package,
  RefreshCw,
  Puzzle,
  ShoppingCart,
} from "lucide-react";
import { SiShopify } from "react-icons/si";
import { Button } from "@/components/ui/button";
import SectionBadge from "./SectionBadge";
import Xarrow from "react-xarrows";

// Constants for connector styling
const CONNECTOR_STROKE_WIDTH = 4;
const CONNECTOR_CURVENESS = 0.8;
const CONNECTOR_ANIMATION_DURATION = 0.5;
const CONNECTOR_Z_INDEX = -1;
const CONNECTOR_COLOR = "#FD912A";

// Constants for shiny dots
const SHINY_DOT_STROKE_WIDTH = 3;
const SHINY_DOT_COLOR = "#ffffff";
const SHINY_DOT_ANIMATION_DURATION = 2;

// Constants for re-rendering
const MIN_RERENDER_INTERVAL_MS = 2000; // 2 seconds
const MAX_RERENDER_INTERVAL_MS = 4000; // 4 seconds

// Constants for heartbeat avatar effect
const HEARTBEAT_PULSE_DURATION_MS = 2000; // 4s for slower heartbeat
const HEARTBEAT_FADE_DURATION_MS = 600; // Duration of each heartbeat fade

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
    description: "Your Shopify customer records",
  },
  {
    icon: Package,
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
        className="py-24 bg-gradient-to-r from-[#FDF7E2]/5 via-background to-[#FDF7E2]/8 border-t border-[#FD912A]/20 relative overflow-visible"
      >
        <div className="container mx-auto px-6 overflow-visible">
          <div className="max-w-7xl mx-auto overflow-visible">
            {/* Header */}
            <div className="text-center mb-16">
              <SectionBadge icon={SiShopify} text="Plug and Play" />
              <h2 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
                One-Click Setup, Instant Selling
              </h2>
              <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
                Install the Bizmis Shopify app and start selling and supporting
                customers immediately. Zero manual setup required - Bizmis
                automatically syncs with your store data and begins generating
                sales from day one.
              </p>
            </div>

            {/* Data Flow Visualization */}
            <div className="relative mb-16">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
                {/* Shopify Data Cards - Stacked Vertically */}
                <div className="flex-1 max-w-md">
                  {/* Shopify Store Title Centered with Cards */}
                  <div className="text-center mb-6">
                    {/* <div className="text-sm text-muted-foreground font-body mb-2">
                    Seamlessly Integrated with
                  </div> */}
                    <div className="inline-flex items-center gap-2">
                      <SiShopify className="w-5 h-5 text-[#FD912A]" />
                      <span className="text-lg font-heading font-semibold text-foreground">
                        Your Shopify Store Data
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {shopifyDataCards.map((card, index) => (
                      <div
                        key={index}
                        id={`card-${index}`}
                        className="relative bg-[#FDF7E2]/40 backdrop-blur-sm rounded-2xl p-6 border border-[#FD912A]/30 hover:scale-105 transition-all duration-300 group overflow-hidden"
                        style={{
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        {/* Shopify Icon Watermark */}
                        <div className="absolute bottom-[calc(50%-2.5rem)] right-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                          <SiShopify className="w-20 h-20 text-[#FD912A]" />
                        </div>

                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-[#FD912A]">
                            <card.icon className="w-6 h-6" />
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

                {/* Avatar Image with Aura */}
                <div
                  className="relative flex items-center justify-center max-w-full"
                  style={{ minHeight: "clamp(24rem, 50vh, 48rem)" }}
                >
                  {/* Animated Aura/Halo - Circular - Positioned absolutely outside container */}
                  <div
                    className="absolute w-40 h-40 sm:w-56 h-56 md:w-72 h-72 lg:w-80 h-80 bg-[#FD912A]/50 rounded-full blur-xl animate-pulse pointer-events-none"
                    style={{
                      zIndex: 1,
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      margin: "0",
                      position: "absolute",
                      boxShadow:
                        "0 0 40px rgba(253, 145, 42, 0.3), 0 0 80px rgba(253, 145, 42, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1)",
                      opacity: avatarOpacity,
                      transition: `opacity ${HEARTBEAT_FADE_DURATION_MS}ms ease-in-out`,
                    }}
                  ></div>
                  <div
                    className="absolute w-32 h-32 sm:w-48 h-48 md:w-64 h-64 lg:w-72 h-72 bg-[#FD912A]/45 rounded-full blur-lg animate-ping pointer-events-none"
                    style={{
                      animationDuration: "3s",
                      zIndex: 1,
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      margin: "0",
                      position: "absolute",
                      boxShadow:
                        "0 0 30px rgba(253, 145, 42, 0.4), 0 0 60px rgba(253, 145, 42, 0.25), inset 0 0 15px rgba(255, 255, 255, 0.15)",
                      opacity: avatarOpacity,
                      transition: `opacity ${HEARTBEAT_FADE_DURATION_MS}ms ease-in-out`,
                    }}
                  ></div>
                  <div
                    className="absolute w-24 h-24 sm:w-40 h-40 md:w-56 h-56 lg:w-64 h-64 bg-[#FD912A]/40 rounded-full blur-md animate-pulse pointer-events-none"
                    style={{
                      animationDuration: "2s",
                      zIndex: 1,
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      margin: "0",
                      position: "absolute",
                      boxShadow:
                        "0 0 20px rgba(253, 145, 42, 0.5), 0 0 40px rgba(253, 145, 42, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.2)",
                      opacity: avatarOpacity,
                      transition: `opacity ${HEARTBEAT_FADE_DURATION_MS}ms ease-in-out`,
                    }}
                  ></div>

                  {/* Avatar Images with Heartbeat Effect */}
                  <div id="avatar-target" className="relative z-10 max-w-full">
                    {/* Orange avatar always visible behind */}
                    <img
                      src="/images/setup-avatar-orange.png"
                      alt="Bizmis Storemate Orange"
                      className="h-[clamp(24rem,50vh,48rem)] w-auto max-w-full object-contain"
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
                      className="h-[clamp(24rem,50vh,48rem)] w-auto max-w-full object-contain absolute top-0 left-0"
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

            {/* Big Visual Cards Section */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  icon: Puzzle,
                  title: "Zero Configuration",
                  subtitle: "Works instantly",
                },
                {
                  icon: RefreshCw,
                  title: "Always Synced",
                  subtitle: "Real-time data",
                },
                {
                  icon: ShoppingCart,
                  title: "Ready to Sell",
                  subtitle: "Start immediately",
                },
              ].map((card, index) => (
                <div key={index} className="group">
                  <div
                    className="relative bg-[#FDF7E2]/40 backdrop-blur-sm rounded-3xl p-8 border border-[#FD912A]/30 hover:border-[#FD912A]/50 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl overflow-hidden"
                    style={{
                      animationDelay: `${index * 200}ms`,
                    }}
                  >
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-[#FD912A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    {/* Icon container with enhanced animations */}
                    <div className="relative">
                      <div className="w-20 h-20 bg-[#FD912A] rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        {/* Particles for shopping cart */}
                        {index === 2 && (
                          /* Shopping cart with energetic explosion from icon center */
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {/* Particles exploding from the icon center */}
                            <div
                              className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/90 rounded-full animate-ping"
                              style={{
                                animationDelay: "0s",
                                animationDuration: "0.8s",
                                transform:
                                  "translate(-50%, -50%) translate(25px, -20px)",
                              }}
                            ></div>
                            <div
                              className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white/80 rounded-full animate-ping"
                              style={{
                                animationDelay: "0.1s",
                                animationDuration: "0.8s",
                                transform:
                                  "translate(-50%, -50%) translate(30px, 15px)",
                              }}
                            ></div>
                            <div
                              className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/100 rounded-full animate-ping"
                              style={{
                                animationDelay: "0.2s",
                                animationDuration: "0.8s",
                                transform:
                                  "translate(-50%, -50%) translate(-15px, -25px)",
                              }}
                            ></div>
                            <div
                              className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-white/70 rounded-full animate-ping"
                              style={{
                                animationDelay: "0.15s",
                                animationDuration: "0.8s",
                                transform:
                                  "translate(-50%, -50%) translate(35px, -8px)",
                              }}
                            ></div>
                            <div
                              className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white/60 rounded-full animate-ping"
                              style={{
                                animationDelay: "0.25s",
                                animationDuration: "0.8s",
                                transform:
                                  "translate(-50%, -50%) translate(-20px, 20px)",
                              }}
                            ></div>
                            <div
                              className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/80 rounded-full animate-ping"
                              style={{
                                animationDelay: "0.3s",
                                animationDuration: "0.8s",
                                transform:
                                  "translate(-50%, -50%) translate(20px, 30px)",
                              }}
                            ></div>
                          </div>
                        )}
                        {/* Icon glow effect */}
                        <div className="absolute inset-0 bg-[#FD912A] rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                        <card.icon
                          className={`w-10 h-10 text-white relative z-10 transition-all duration-500 ${
                            index === 0
                              ? "group-hover:scale-110 group-hover:animate-pulse" // Puzzle clicking animation
                              : index === 1
                              ? "group-hover:animate-spin" // Sync spinning animation
                              : "group-hover:scale-110 group-hover:animate-bounce" // Shopping cart bounce with confetti
                          }`}
                          style={{
                            animationDuration: index === 1 ? "1.5s" : undefined,
                          }}
                        />
                      </div>
                    </div>

                    {/* Text with staggered animations */}
                    <h4 className="font-heading font-bold text-foreground text-2xl mb-2 group-hover:text-[#FD912A] transition-colors duration-300">
                      {card.title}
                    </h4>
                    <p className="text-muted-foreground font-body text-lg group-hover:text-[#FD912A] transition-colors duration-300">
                      {card.subtitle}
                    </p>

                    {/* Bottom glow line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FD912A]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button className="bg-[#FD912A] hover:bg-[#FD912A]/85 text-white px-8 py-3 text-lg">
                Install Bizmis App
              </Button>
              <p className="text-sm text-muted-foreground mt-3 font-body">
                Available on Shopify App Store • One-click installation
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Setup;
