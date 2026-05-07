import type { MouseEvent } from "react";
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
import { BIZMIS_SHOPIFY_APP_LISTING_URL, openBizmisShopifyAppListing } from "@/lib/bizmisUrls";
import SectionBadge from "./SectionBadge";
import Xarrow from "react-xarrows";

// Constants for connector styling
const CONNECTOR_ANIMATION_DURATION = 0.5;
const CONNECTOR_Z_INDEX = -1;
const CONNECTOR_COLOR = "rgba(253, 145, 42, 0.25)";

// Per-tier connector geometry — desktop curves looked over-bowed at mobile
// widths because the inflection offset and stroke were fixed in pixels.
type ConnectorTier = {
  /** Bow strength (Xarrow `curveness`). */
  curveness: number;
  /** Horizontal offset of the first control point, in pixels. */
  inflectionOffsetX: number;
  /** Connector line stroke width, in pixels. */
  strokeWidth: number;
  /** Moving shiny dot stroke width, in pixels. */
  dotStrokeWidth: number;
};
const CONNECTOR_TIERS = {
  mobile: {
    curveness: 0.35,
    inflectionOffsetX: 18,
    strokeWidth: 2,
    dotStrokeWidth: 1.5,
  },
  tablet: {
    curveness: 0.38,
    inflectionOffsetX: 60,
    strokeWidth: 3,
    dotStrokeWidth: 2.25,
  },
  desktop: {
    curveness: 0.4,
    inflectionOffsetX: 100,
    strokeWidth: 4,
    dotStrokeWidth: 3,
  },
} satisfies Record<string, ConnectorTier>;
const CONNECTOR_TABLET_BREAKPOINT_PX = 640;
const CONNECTOR_DESKTOP_BREAKPOINT_PX = 1024;

// Constants for shiny dots
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
  const handleShopifyInstallClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisShopifyAppListing();
  };

  // State for forcing re-renders - separate key for each connector
  const [renderKeys, setRenderKeys] = useState([0, 0, 0, 0, 0]);

  // State for heartbeat avatar effect
  const [avatarOpacity, setAvatarOpacity] = useState(1);

  // Active connector tier — driven by viewport width so curves and stroke
  // scale with the layout (compact on phones, bolder on desktop).
  const [connectorTier, setConnectorTier] = useState<ConnectorTier>(
    CONNECTOR_TIERS.desktop,
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const pickTier = (): ConnectorTier => {
      const width = window.innerWidth;
      if (width < CONNECTOR_TABLET_BREAKPOINT_PX) return CONNECTOR_TIERS.mobile;
      if (width < CONNECTOR_DESKTOP_BREAKPOINT_PX) return CONNECTOR_TIERS.tablet;
      return CONNECTOR_TIERS.desktop;
    };
    const apply = () => setConnectorTier(pickTier());
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

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
        className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-[#FDF7E2]/[0.05] via-background/40 to-[#FDF7E2]/[0.08] border-t border-primary/20 relative overflow-visible"
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

        <div className="container mx-auto px-4 sm:px-6 overflow-visible">
          <div className="max-w-7xl mx-auto overflow-visible">
            {/* Header */}
            <div className="text-center mb-10 sm:mb-12 lg:mb-16">
              <SectionBadge icon={FaShopify} text="Plug and Play" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
                One-Click Setup, Instant Selling & Support
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground font-body max-w-3xl mx-auto px-2">
                Install the Bizmis Shopify app and start selling and supporting
                customers immediately.
              </p>
            </div>

            {/* Integration diagram */}
            <div className="relative mb-12">
              <div className="flex flex-row items-center justify-between gap-3 xs:gap-4 sm:gap-10 lg:gap-24">
                {/* Shopify Data Cards - always vertical stack, side-by-side with avatar */}
                <div className="flex-1 min-w-0 max-w-[58%] xs:max-w-[60%] sm:max-w-md">
                  <div className="rounded-xl sm:rounded-2xl border border-primary/20 p-2.5 xs:p-3 sm:p-5 lg:p-6">
                    <div className="text-center mb-3 xs:mb-4 sm:mb-5 lg:mb-6">
                      <div className="inline-flex items-center gap-1.5 sm:gap-2 text-primary/85">
                        <FaShopify className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                        <span className="text-[12px] xs:text-sm sm:text-base lg:text-lg font-heading font-semibold leading-tight">
                          Your Shopify Store Data
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 xs:space-y-2 sm:space-y-3 lg:space-y-4">
                    {shopifyDataCards.map((card, index) => (
                      <div
                        key={index}
                        id={`card-${index}`}
                        className="group relative bg-primary/10 backdrop-blur-sm rounded-lg sm:rounded-2xl p-1.5 xs:p-2.5 sm:p-4 lg:p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_2px_8px_-2px_rgba(253,145,42,0.06)] hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                      >
                        {/* Shopify Icon Watermark — hidden on the most compact tier
                            so the simplified cards stay clean (icon + title only). */}
                        <div className="hidden xs:block absolute xs:bottom-[calc(50%-2rem)] sm:bottom-[calc(50%-2.5rem)] right-0 opacity-10 group-hover:opacity-15 transition-opacity duration-300">
                          <FaShopify className="xs:w-11 xs:h-11 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-primary" />
                        </div>

                        <div className="flex items-center gap-1.5 xs:gap-2.5 sm:gap-3 lg:gap-4 relative z-10">
                          <div className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-transparent rounded-md sm:rounded-xl flex items-center justify-center shrink-0">
                            <card.icon className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary/60 group-hover:text-primary/85 transition-colors duration-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading font-semibold text-foreground text-[11px] xs:text-[13px] sm:text-base lg:text-lg leading-tight sm:leading-snug xs:mb-0.5 lg:mb-1 truncate sm:whitespace-normal">
                              {card.title}
                            </h3>
                            <p className="hidden xs:block xs:text-[11px] sm:text-xs lg:text-sm leading-snug text-muted-foreground font-body line-clamp-1 sm:line-clamp-none">
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
                  className="relative flex shrink-0 items-center justify-center max-w-full"
                  style={{ minHeight: "clamp(10rem, 32vh, 48rem)" }}
                >
                  {/* Aura — centered, expands/retracts in sync with orange avatar */}
                  {(() => {
                    const pulse = 1 - avatarOpacity;
                    return (
                      <>
                        <div
                          className="absolute rounded-full pointer-events-none w-[10rem] h-[10rem] xs:w-[12rem] xs:h-[12rem] sm:w-[22rem] sm:h-[22rem] lg:w-[28rem] lg:h-[28rem]"
                          style={{
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
                          className="absolute rounded-full pointer-events-none w-[14rem] h-[14rem] xs:w-[16rem] xs:h-[16rem] sm:w-[30rem] sm:h-[30rem] lg:w-[38rem] lg:h-[38rem]"
                          style={{
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

                  {/* Avatar Images with Heartbeat Effect — smaller on mobile, full size at lg+ */}
                  <div id="avatar-target" className="relative z-10 max-w-full">
                    {/* Orange avatar always visible behind */}
                    <img
                      src="/images/setup-avatar-orange.png"
                      alt="Bizmis Storemate Orange"
                      className="h-[12rem] xs:h-[14rem] sm:h-[24rem] lg:h-[36rem] w-auto max-w-full object-contain"
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
                      className="h-[12rem] xs:h-[14rem] sm:h-[24rem] lg:h-[36rem] w-auto max-w-full object-contain absolute top-0 left-0"
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
              <div>
                {shopifyDataCards.map((_, index) => (
                  <Xarrow
                    key={`connector-${renderKeys[index]}-${index}-${connectorTier.inflectionOffsetX}`}
                    start={`card-${index}`}
                    end="avatar-target"
                    color={CONNECTOR_COLOR}
                    strokeWidth={connectorTier.strokeWidth}
                    curveness={connectorTier.curveness}
                    showHead={false}
                    path="smooth"
                    startAnchor="right"
                    endAnchor="middle"
                    animateDrawing={CONNECTOR_ANIMATION_DURATION}
                    zIndex={CONNECTOR_Z_INDEX}
                    _cpx1Offset={connectorTier.inflectionOffsetX}
                    _cpx2Offset={-connectorTier.inflectionOffsetX}
                  />
                ))}
              </div>

              {/* Moving Shiny Dots */}
              <div>
                {shopifyDataCards.map((_, index) => (
                  <Xarrow
                    key={`dot-${renderKeys[index]}-${index}-${connectorTier.inflectionOffsetX}`}
                    start={`card-${index}`}
                    end="avatar-target"
                    color={SHINY_DOT_COLOR}
                    strokeWidth={connectorTier.dotStrokeWidth}
                    curveness={connectorTier.curveness}
                    showHead={false}
                    path="smooth"
                    startAnchor="right"
                    endAnchor="middle"
                    zIndex={CONNECTOR_Z_INDEX}
                    animateDrawing={SHINY_DOT_ANIMATION_DURATION}
                    _cpx1Offset={connectorTier.inflectionOffsetX}
                    _cpx2Offset={-connectorTier.inflectionOffsetX}
                  />
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
              <Button asChild className="bg-foreground hover:bg-foreground/90 text-white px-8 py-3 text-lg [&_svg]:pointer-events-auto">
                <a
                  href={BIZMIS_SHOPIFY_APP_LISTING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                  onClick={handleShopifyInstallClick}
                >
                  <FaShopify className="h-5 w-5" />
                  Install Bizmis on Shopify
                </a>
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
