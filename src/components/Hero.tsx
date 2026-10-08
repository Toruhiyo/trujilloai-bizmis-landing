import { useCallback } from "react";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";
import { FaShopify } from "react-icons/fa";
import { usePostHog } from "posthog-js/react";
import {
  BIZMIS_BOOK_A_CALL_GENERAL_URL,
  BIZMIS_DEMO_STORE_URL,
  BIZMIS_SHOPIFY_APP_LISTING_URL,
  openBizmisCustomIntegrationCall,
  openBizmisDemoStore,
  openBizmisShopifyAppListing,
} from "@/lib/bizmisUrls";
import { HERO_FILM } from "@/lib/film";
import Navbar from "./Navbar";
import FilmPlayer from "./film/FilmPlayer";
import type { FilmEvent } from "./film/FilmPlayer";
import { useLocaleHref, useMessages } from "@/i18n/LocaleProvider";

/**
 * Film-led hero: a compact headline over the studio lighting, the ad-1 film
 * as the dominant element, and the CTAs under it. The previous side-by-side hero
 * lives on at /v1 (components/v1/HeroV1.tsx).
 */
const Hero = () => {
  const posthog = usePostHog();
  const messages = useMessages();
  const href = useLocaleHref();

  const handleCustomWebsitesClick = () => {
    posthog.capture("cta_clicked", {
      cta_type: "custom_websites",
      location: "hero",
    });
    openBizmisCustomIntegrationCall();
  };

  const handleBookACallClick = () => {
    posthog.capture("cta_clicked", {
      cta_type: "book_a_call",
      location: "hero",
    });
  };

  const handleShopifyInstallClick = (
    e: MouseEvent<HTMLAnchorElement>,
    location = "hero"
  ) => {
    e.preventDefault();
    openBizmisShopifyAppListing();
    posthog.capture("cta_clicked", {
      cta_type: "get_started",
      location,
    });
  };

  const handleViewDemoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisDemoStore();
    posthog.capture("cta_clicked", {
      cta_type: "view_demo",
      location: "hero",
    });
  };

  const handleEarlyAccessClick = () => {
    posthog.capture("cta_clicked", {
      cta_type: "early_access",
      location: "hero",
    });
  };

  const handleFilmEvent = useCallback(
    (event: FilmEvent, props?: Record<string, unknown>) => {
      posthog.capture(event, { film_id: HERO_FILM.id, location: "hero", ...props });
    },
    [posthog]
  );

  return (
    <section
      id="hero"
      className="relative studio-lighting-base flex flex-col overflow-hidden"
    >
      {/* 3D Studio Lighting System */}
      <div className="absolute inset-0 studio-radial-light" />
      <div className="absolute inset-0 film-stage-horizon" />
      <div className="absolute inset-0 film-stage-meniscus" />
      <div className="absolute inset-0 studio-ambient-overlay" />

      {/* Noise grain overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-[1] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="hero-noise">
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
          filter="url(#hero-noise)"
          opacity="0.40"
        />
      </svg>

      <Navbar />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-24 sm:pt-32 lg:pt-[clamp(6rem,13vh,8rem)] pb-16 sm:pb-24">
        {/* Headline */}
        <div className="mx-auto max-w-6xl text-center">
          <a
            href={href("/early-access")}
            onClick={handleEarlyAccessClick}
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-white/[0.10] hover:text-white sm:px-3.5 sm:text-sm"
          >
            <span
              className="relative flex h-1.5 w-1.5 flex-shrink-0"
              aria-hidden="true"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white/80" />
            </span>
            <span className="font-medium">
              <span className="text-white/90">{messages.hero.badgeLabel}</span>
              <span className="text-white/45" aria-hidden="true">
                {" "}
                ·{" "}
              </span>
              <span className="text-white/70 sm:hidden">{messages.hero.badgeDetailShort}</span>
              <span className="hidden text-white/70 sm:inline">{messages.hero.badgeDetailLong}</span>
            </span>
            <ArrowRight
              className="h-3 w-3 text-white/45 transition-transform group-hover:translate-x-0.5 group-hover:text-white/65 sm:h-3.5 sm:w-3.5"
              aria-hidden="true"
            />
          </a>

          <h1 className="mt-5 text-4xl xs:text-5xl sm:text-6xl lg:text-[clamp(3.25rem,4.6vw,4.5rem)] font-heading font-bold text-white leading-[1.05]">
            {messages.hero.titleLine1}{" "}
            <span className="block lg:inline">{messages.hero.titleLine2}</span>
          </h1>
          <p className="mt-3 text-lg xs:text-xl sm:text-2xl xl:text-3xl font-heading font-medium text-white/75">
            {messages.hero.subtitleLead}{" "}
            <span className="font-semibold text-white">{messages.hero.subtitleFind}</span>,{" "}
            <span className="font-semibold text-white">{messages.hero.subtitleTrust}</span>
            {messages.hero.subtitleConnector}{" "}
            <span className="font-semibold text-white">{messages.hero.subtitleBuy}</span>
          </p>
        </div>

        {/* The film, standing on the studio floor like the v1 avatar did */}
        <div className="relative mx-auto mt-10 max-w-[1200px] sm:mt-12">
          <div
            aria-hidden="true"
            className="absolute -bottom-8 left-1/2 h-16 w-[108%] -translate-x-1/2 bg-[radial-gradient(closest-side,hsl(25_95%_38%/0.45),hsl(25_95%_45%/0.18)_55%,transparent)] sm:-bottom-12 sm:h-24"
          />
          <FilmPlayer
            src={HERO_FILM.src}
            loop={HERO_FILM.loop}
            durationSeconds={HERO_FILM.durationSeconds}
            endFrameCta={HERO_FILM.endFrameCta}
            labels={messages.film}
            cta={{
              label: messages.common.installNow,
              href: BIZMIS_SHOPIFY_APP_LISTING_URL,
              onClick: (e, location) => handleShopifyInstallClick(e, location),
            }}
            onEvent={handleFilmEvent}
          />
        </div>

        {/* CTA section, under the film */}
        <div className="mx-auto mt-12 max-w-4xl text-center sm:mt-16">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Button
              variant="hero"
              size="xl"
              asChild
              className="group flex w-full max-w-md items-center gap-3 h-14 px-6 text-lg sm:w-auto sm:h-16 sm:px-7 [&_svg]:pointer-events-auto"
            >
              <a
                href={BIZMIS_SHOPIFY_APP_LISTING_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleShopifyInstallClick(e)}
              >
                <FaShopify className="!w-7 !h-7 text-primary" />
                <span className="font-semibold">{messages.common.installNow}</span>
                <ArrowRight className="!w-5 !h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 w-full max-w-md border-white/40 bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-xl px-6 text-base text-white hover:bg-white/20 hover:text-white sm:w-auto sm:h-16 sm:text-lg [&_svg]:pointer-events-auto"
            >
              <a
                href={BIZMIS_DEMO_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleViewDemoClick}
              >
                <PlayCircle className="!h-5 !w-5" aria-hidden="true" />
                {messages.common.liveDemo}
              </a>
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-white/70 sm:text-sm">
            <span>
              {messages.hero.ratherTalk}{" "}
              <a
                href={BIZMIS_BOOK_A_CALL_GENERAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleBookACallClick}
                className="text-white/80 hover:text-white underline underline-offset-2 transition-colors"
              >
                {messages.common.bookACall}
              </a>
            </span>
            <span className="text-white/45" aria-hidden="true">
              ·
            </span>
            <span>
              {messages.hero.alsoAvailableFor}{" "}
              <button
                onClick={handleCustomWebsitesClick}
                className="text-white/80 hover:text-white underline underline-offset-2 transition-colors"
              >
                {messages.hero.customWebsites}
              </button>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
