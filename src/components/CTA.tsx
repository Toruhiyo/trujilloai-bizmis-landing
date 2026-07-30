import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { FaShopify } from "react-icons/fa";
import { usePostHog } from "posthog-js/react";
import type { MouseEvent } from "react";
import {
  BIZMIS_BOOK_A_CALL_GENERAL_URL,
  BIZMIS_SHOPIFY_APP_LISTING_URL,
  openBizmisShopifyAppListing,
} from "@/lib/bizmisUrls";
import EarlyAccessCard from "./EarlyAccessCard";
import { useMessages } from "@/i18n/LocaleProvider";

const FinalCTA = () => {
  const posthog = usePostHog();
  const messages = useMessages();

  const handleInstallOnShopifyClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisShopifyAppListing();
    posthog.capture("cta_clicked", {
      cta_type: "shopify_app_listing",
      location: "final_cta",
    });
  };

  const handleBookACall = () => {
    posthog.capture("cta_clicked", {
      cta_type: "book_a_call",
      location: "final_cta",
    });
  };

  return (
    <section
      id="final-cta"
      aria-labelledby="final-cta-title"
      className="py-12 sm:py-20 lg:py-24 relative overflow-hidden studio-lighting-base flex flex-col"
    >
      <div className="absolute inset-0 studio-radial-light" />
      <div className="absolute inset-0 studio-horizon-shadow" />
      <div className="absolute inset-0 studio-horizon-meniscus-left" />
      <div className="absolute inset-0 studio-horizon-meniscus-right" />
      <div className="absolute inset-0 studio-floor-shadow" />
      <div className="absolute inset-0 studio-ambient-overlay" />

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-[1] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="cta-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.50"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#cta-noise)"
          opacity="0.40"
        />
      </svg>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Column: Main Content */}
            <div className="lg:order-1 order-2">
              <h2
                id="final-cta-title"
                className="text-[28px] xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold text-white leading-tight mb-3 sm:mb-6"
              >
                {messages.finalCta.title}
              </h2>

              <p className="text-base sm:text-xl lg:text-2xl text-white/90 mb-5 sm:mb-8 leading-relaxed">
                {messages.finalCta.lead}
              </p>

              {/* Feature bullets */}
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-10">
                {messages.finalCta.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-2.5 sm:gap-3 text-white/90"
                  >
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                    <span className="text-sm sm:text-lg">{bullet}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                <Button
                  asChild
                  aria-label={messages.finalCta.installAria}
                  className="inline-flex w-full min-w-0 justify-center bg-white text-primary hover:bg-white/95 hover:shadow-lg focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-primary text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 h-auto group transition-all duration-200 sm:w-auto [&>svg]:!w-5 [&>svg]:!h-5 sm:[&>svg]:!w-6 sm:[&>svg]:!h-6 [&>svg]:!mr-2.5 sm:[&>svg]:!mr-3 [&_svg]:pointer-events-auto"
                  size="xl"
                >
                  <a
                    href={BIZMIS_SHOPIFY_APP_LISTING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full min-w-0 items-center justify-center gap-2"
                    onClick={handleInstallOnShopifyClick}
                  >
                    <FaShopify className="text-primary" aria-hidden="true" />
                    {messages.common.installOnShopify}
                  </a>
                </Button>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    aria-label={messages.finalCta.bookCallAria}
                    className="bg-transparent border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-primary px-6 py-3 h-auto transition-all duration-200 flex items-center justify-center [&_svg]:pointer-events-auto"
                  >
                    <a
                      href={BIZMIS_BOOK_A_CALL_GENERAL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleBookACall}
                    >
                      <Calendar className="w-5 h-5 mr-2" aria-hidden="true" />
                      {messages.common.bookACall}
                    </a>
                  </Button>
                </div>
              </div>

              {/* Microline */}
              <p className="text-white/70 text-xs sm:text-sm mb-4 leading-relaxed">
                {messages.finalCta.cancelAnytime} •{" "}
                <a
                  href="/privacy"
                  className="underline hover:text-white transition-colors"
                >
                  {messages.finalCta.gdprReady}
                </a>{" "}
                • {messages.finalCta.builtForShopify}
              </p>
            </div>

            {/* Right Column: Proof Card */}
            <div className="lg:order-2 order-1 flex justify-center lg:justify-end">
              <EarlyAccessCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
