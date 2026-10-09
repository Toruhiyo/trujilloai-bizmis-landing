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
    location = "hero",
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
      posthog.capture(event, {
        film_id: HERO_FILM.id,
        location: "hero",
        ...props,
      });
    },
    [posthog],
  );

  return (
    <section
      id="hero"
      className="relative studio-lighting-base flex h-[100svh] min-h-[540px] flex-col overflow-hidden"
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

      {/* One screen tall at any size: headline and CTAs keep their height, the
          film takes the rest (sized as 16:9 within it via container units). */}
      <div className="relative z-10 container mx-auto flex min-h-0 w-full flex-1 flex-col justify-center px-4 sm:px-6 pt-[clamp(4.25rem,9vh,6rem)] pb-[clamp(0.75rem,2.5vh,2rem)]">
        {/* Headline */}
        <div className="mx-auto max-w-6xl flex-none text-center">
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
              <span className="bzl-hand text-white">
                {messages.hero.badgeLabel}
              </span>
              <span className="text-white/45" aria-hidden="true">
                {" "}
                ·{" "}
              </span>
              <span className="text-white/70 sm:hidden">
                {messages.hero.badgeDetailShort}
              </span>
              <span className="hidden text-white/70 sm:inline">
                {messages.hero.badgeDetailLong}
              </span>
            </span>
            <ArrowRight
              className="h-3 w-3 text-white/45 transition-transform group-hover:translate-x-0.5 group-hover:text-white/65 sm:h-3.5 sm:w-3.5"
              aria-hidden="true"
            />
          </a>

          <h1 className="mt-[clamp(0.75rem,2vh,1.25rem)] text-[clamp(2rem,min(9vw,5.4vh),3.75rem)] lg:text-[clamp(2.5rem,min(4.6vw,7vh),4.5rem)] font-heading font-bold text-white leading-[1.05]">
            {messages.hero.titleLine1}{" "}
            <span className="block lg:inline">{messages.hero.titleLine2}</span>
          </h1>
          <p className="mt-[clamp(0.25rem,1vh,0.75rem)] text-[clamp(1rem,min(4.6vw,2.7vh),1.5rem)] xl:text-[clamp(1.25rem,3vh,1.875rem)] font-heading font-medium text-white/75">
            {messages.hero.subtitleLead}{" "}
            <span className="font-semibold text-white">
              {messages.hero.subtitleFind}
            </span>
            ,{" "}
            <span className="font-semibold text-white">
              {messages.hero.subtitleTrust}
            </span>
            {messages.hero.subtitleConnector}{" "}
            <span className="font-semibold text-white">
              {messages.hero.subtitleBuy}
            </span>
          </p>
        </div>

        {/* The film, standing on the studio floor like the v1 avatar did */}
        <div className="mt-[clamp(0.75rem,2.5vh,2rem)] flex min-h-0 flex-1 items-center justify-center [container-type:size] max-h-[min(calc((100vw-2rem-1.25rem)*9/16+1.25rem),695px)] sm:max-h-[min(calc((100vw-3rem-1.25rem)*9/16+1.25rem),695px)]">
          {/* max-h: never taller than the film itself, so on tall narrow screens
              the spare height goes to the margins instead of around the film. */}
          <div className="relative w-[min(100cqw,calc((100cqh-1.25rem)*16/9+1.25rem),1200px)]">
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
                onClick: (e, location) =>
                  handleShopifyInstallClick(e, location),
              }}
              onEvent={handleFilmEvent}
            />
          </div>
        </div>

        {/* CTA section, under the film */}
        <div className="mx-auto mt-[clamp(0.75rem,2.5vh,2rem)] w-full max-w-4xl flex-none text-center">
          <div className="flex items-stretch justify-center gap-2.5 sm:gap-4">
            <Button
              variant="hero"
              size="xl"
              asChild
              className="group flex flex-1 items-center gap-2 h-12 px-4 text-base sm:flex-none sm:gap-3 sm:h-[clamp(3rem,6.5vh,4rem)] sm:px-7 sm:text-lg [&_svg]:pointer-events-auto"
            >
              <a
                href={BIZMIS_SHOPIFY_APP_LISTING_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleShopifyInstallClick(e)}
              >
                <FaShopify className="!w-6 !h-6 sm:!w-7 sm:!h-7 text-primary" />
                <span className="font-semibold">
                  {messages.common.installNow}
                </span>
                <ArrowRight className="!w-5 !h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 flex-1 sm:flex-none sm:h-[clamp(3rem,6.5vh,4rem)] border-white/40 bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-xl px-4 text-base text-white hover:bg-white/20 hover:text-white sm:px-6 sm:text-lg [&_svg]:pointer-events-auto"
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

          <div className="mt-[clamp(0.5rem,1.5vh,1rem)] flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[11px] text-white/70 sm:text-sm">
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
