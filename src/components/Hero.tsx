import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, PlayCircle, X } from "lucide-react";
import { FaShopify } from "react-icons/fa";
import { usePostHog } from "posthog-js/react";
import {
  BIZMIS_BOOK_A_CALL_GENERAL_URL,
  BIZMIS_DEMO_STORE_URL,
  BIZMIS_SHOPIFY_APP_LISTING_URL,
  openBizmisDemoStore,
  openBizmisShopifyAppListing,
} from "@/lib/bizmisUrls";
import { HERO_FILM } from "@/lib/film";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";
import HeroAgent from "./HeroAgent";
import FilmPlayer from "./film/FilmPlayer";
import type { FilmEvent, FilmPlayerHandle } from "./film/FilmPlayer";
import { useLocaleHref, useMessages } from "@/i18n/LocaleProvider";

/** Frosted warm glass, as on the film player's controls. */
const GLASS =
  "border border-white/40 bg-[hsl(24_70%_30%/0.22)] backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_12px_40px_-12px_hsl(25_95%_25%/0.45)]";

/** The reveal from the loop to the film (and back), in ms. */
const IRIS_MS = 950;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * The /v2 hero (BIZ-423): the Bizmis agent, in a hero-sized version of the
 * real widget, invites the visitor to watch the film. It says hello, says it
 * helps every shopper find it, trust it and buy it (the subtitle's words light
 * up as it says them), then beckons and asks them to press play; the widget's
 * composer is the play button.
 *
 * The copy sits in one glass card (eyebrow, title, subtitle), the CTAs outside
 * it. Play turns the whole hero into the film, opening from the play button
 * as a widening circle with a glowing edge while the stage blurs and pushes
 * back. Close (✕, Escape, or a click outside the hero) runs it back; play
 * again resumes where it stopped.
 */
const Hero = () => {
  const posthog = usePostHog();
  const messages = useMessages();
  const href = useLocaleHref();
  const hero = useRef<HTMLElement>(null);
  const irisBox = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const film = useRef<FilmPlayerHandle>(null);
  const iris = useRef({ r: 0, cx: 0, cy: 0, frame: 0 });
  const [filmOpen, setFilmOpen] = useState(false);
  const [irisOpen, setIrisOpen] = useState(false); // the film layer is (partly) visible

  const handleBookACallClick = () => {
    posthog.capture("cta_clicked", { cta_type: "book_a_call", location: "hero" });
  };
  const handleShopifyInstallClick = (e: MouseEvent<HTMLAnchorElement>, location = "hero") => {
    e.preventDefault();
    openBizmisShopifyAppListing();
    posthog.capture("cta_clicked", { cta_type: "get_started", location });
  };
  const handleViewDemoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisDemoStore();
    posthog.capture("cta_clicked", { cta_type: "view_demo", location: "hero" });
  };
  const handleEarlyAccessClick = () => {
    posthog.capture("cta_clicked", { cta_type: "early_access", location: "hero" });
  };
  const handleFilmEvent = useCallback(
    (event: FilmEvent, props?: Record<string, unknown>) => {
      posthog.capture(event, { film_id: HERO_FILM.id, location: "hero", ...props });
    },
    [posthog],
  );

  // the iris: a soft-edged circle (and a warm glow riding its edge) from the play button
  const paintIris = useCallback(() => {
    const el = irisBox.current;
    if (!el) return;
    const { r, cx, cy } = iris.current;
    el.style.setProperty("--r", `${r}px`);
    el.style.setProperty("--cx", `${cx}px`);
    el.style.setProperty("--cy", `${cy}px`);
    // the glow on the edge is strongest early on and gone once the film fills the hero
    const far = Math.hypot(el.clientWidth, el.clientHeight);
    if (glow.current) glow.current.style.opacity = String(Math.max(0, Math.min(1, 1.6 * (1 - r / far))));
  }, []);
  const runIris = useCallback(
    (to: number, done?: () => void) => {
      cancelAnimationFrame(iris.current.frame);
      const from = iris.current.r;
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const t0 = performance.now();
      const step = (now: number) => {
        const t = still ? 1 : Math.min(1, (now - t0) / IRIS_MS);
        iris.current.r = from + (to - from) * easeInOut(t);
        paintIris();
        if (t < 1) iris.current.frame = requestAnimationFrame(step);
        else done?.();
      };
      iris.current.frame = requestAnimationFrame(step);
    },
    [paintIris],
  );
  useEffect(() => () => cancelAnimationFrame(iris.current.frame), []);

  const openFilm = (e: MouseEvent<HTMLElement>, from: "agent" | "hero") => {
    const box = hero.current?.getBoundingClientRect();
    if (!box) return;
    // the iris opens from the play button
    const btn = (e.currentTarget as HTMLElement).querySelector("[data-play]") ?? e.currentTarget;
    const target = btn.getBoundingClientRect();
    const cx = target.left + target.width / 2 - box.left;
    const cy = target.top + target.height / 2 - box.top;
    const far = Math.max(Math.hypot(cx, cy), Math.hypot(box.width - cx, cy), Math.hypot(cx, box.height - cy), Math.hypot(box.width - cx, box.height - cy));
    iris.current = { ...iris.current, cx, cy };
    posthog.capture("cta_clicked", { cta_type: "watch_film", location: "hero", from });
    setFilmOpen(true);
    setIrisOpen(true);
    film.current?.play(); // in the click itself, so the film may start with sound
    // on a phone the 16:9 film would be a strip across a portrait screen: go fullscreen
    if (window.matchMedia("(max-width: 1023px) and (pointer: coarse)").matches) film.current?.fullscreen();
    runIris(far + 160);
  };
  // any click on the hero plays the film, except on its links, buttons and the nav
  const onHeroClick = (e: MouseEvent<HTMLElement>) => {
    if (filmOpen || irisOpen) return;
    const el = e.target as HTMLElement;
    if (el.closest("a, button, input, nav, header, [data-film-layer]")) return;
    openFilm(e, "hero");
  };
  // the film closed itself (click-off, Escape) or the ✕ asked it to: run the iris back
  const onFilmClosed = useCallback(() => {
    setFilmOpen(false);
    runIris(0, () => setIrisOpen(false));
  }, [runIris]);

  const installButton = (big: boolean) => (
    <Button
      variant="hero"
      size="xl"
      asChild
      className={cn(
        "bzh-install group flex items-center gap-3 [&_svg]:pointer-events-auto",
        big ? "h-[4.75rem] gap-4 px-7 text-lg" : "h-14 flex-1 px-5 text-base",
      )}
    >
      <a href={BIZMIS_SHOPIFY_APP_LISTING_URL} target="_blank" rel="noopener noreferrer" onClick={(e) => handleShopifyInstallClick(e)}>
        <FaShopify className={cn("text-primary", big ? "!h-8 !w-8" : "!h-6 !w-6")} />
        <span className="flex-1 text-left">
          <span className="block font-semibold">{messages.common.installNow}</span>
          {big && <span className="block text-sm font-normal opacity-80">{messages.landing.installSubline}</span>}
        </span>
        <ArrowRight className="!h-5 !w-5 transition-transform group-hover:translate-x-1" />
      </a>
    </Button>
  );

  // the play button calls out while the agent points at it
  const [inviting, setInviting] = useState(false);
  const strong = (text: string) => <span className="font-semibold text-white">{text}</span>;

  return (
    <section
      id="hero"
      ref={hero}
      onClick={onHeroClick}
      className={cn("relative h-[100svh] min-h-[600px] overflow-hidden studio-lighting-base", !filmOpen && "cursor-pointer")}
    >
      {/* the studio stage */}
      <div className="absolute inset-0 studio-radial-light" />
      <div className="absolute inset-0 studio-ambient-overlay" />

      {/* grain, as on the rest of the landing */}
      <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full mix-blend-overlay" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <filter id="hero-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.50" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-noise)" opacity="0.28" />
      </svg>

      <div className={cn("relative z-20 transition-opacity duration-500", filmOpen && "pointer-events-none opacity-0")}>
        <Navbar />
      </div>

      {/* the stage: any store's landing, desktop, as a glass browser window, mostly see-through, whose
          hero section carries the copy and the CTAs, with the Bizmis widget embedded bottom-right and play
          at the centre. It pushes back and blurs as the film opens */}
      <div
        className={cn(
          "absolute inset-0 z-10 transition-[transform,filter] duration-[950ms] ease-[cubic-bezier(.65,0,.35,1)]",
          filmOpen && "pointer-events-none scale-[1.08] blur-[14px] brightness-110",
        )}
      >
        <div
          className={cn(
            "absolute inset-x-2 bottom-2 top-[4.25rem] rounded-[1em] border border-white/45 bg-white/[0.07] text-[min(3.2vw,1.7svh)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_40px_100px_-50px_hsl(24_90%_25%/0.55)]",
            "lg:inset-x-auto lg:bottom-[2.5svh] lg:left-1/2 lg:top-[4.75rem] lg:w-[min(96vw,1560px)] lg:-translate-x-1/2 lg:text-[clamp(14px,min(1.2vw,2.2svh),22px)]",
          )}
        >
          {/* the browser's bar and the store's header, only sketched */}
          <div aria-hidden="true" className="flex h-[2.4em] items-center rounded-t-[1em] border-b border-white/30 bg-white/[0.14] px-[1em]">
            <span className="flex gap-[0.4em]">
              {[0, 1, 2].map((k) => (
                <span key={k} className="h-[0.6em] w-[0.6em] rounded-full bg-white/55" />
              ))}
            </span>
            <span className="mx-auto rounded-full bg-white/25 px-[1.2em] py-[0.2em] text-[0.75em] font-medium text-white/80">yourstore.com</span>
            <span className="w-[2.6em]" />
          </div>
          <div aria-hidden="true" className="flex h-[3.2em] items-center gap-[1.5em] border-b border-white/20 px-[1.6em]">
            <span className="h-[1.1em] w-[5em] rounded-full bg-white/35" />
            <span className="ml-auto hidden gap-[1.2em] lg:flex">
              {[0, 1, 2, 3].map((k) => (
                <span key={k} className="h-[0.55em] w-[3.2em] rounded-full bg-white/25" />
              ))}
            </span>
            <span className="ml-auto flex gap-[0.8em] lg:ml-[2em]">
              <span className="h-[1.1em] w-[1.1em] rounded-full border-2 border-white/35" />
              <span className="h-[1.1em] w-[1.1em] rounded-[0.3em] border-2 border-white/35" />
            </span>
          </div>
          {/* the store's landing: its hero section is the copy and the CTAs, with play at its centre */}
          <div className="absolute inset-x-0 bottom-[20em] top-[5.6em] flex flex-col px-[1.4em] pt-[1.4em] lg:bottom-[2em] lg:justify-center lg:px-[3.6em] lg:pt-0">
            <div className="flex w-full flex-col items-center gap-3 text-center text-white [text-shadow:0_1px_16px_hsl(24_90%_35%/0.35)] lg:w-[min(40rem,40vw)] lg:items-start lg:gap-5 lg:text-left">
              <div>
                  <a
                    href={href("/early-access")}
                    onClick={handleEarlyAccessClick}
                    className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.12] px-3 py-1 text-xs text-white/90 transition-colors hover:bg-white/[0.2] hover:text-white sm:text-sm"
                  >
                    <span className="relative flex h-1.5 w-1.5 flex-shrink-0" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-50" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white/80" />
                    </span>
                    <span className="font-medium">
                      <span className="bzl-hand text-white">{messages.hero.badgeLabel}</span>
                      <span className="text-white/50" aria-hidden="true">
                        {" "}·{" "}
                      </span>
                      <span className="text-white/85 lg:hidden">{messages.hero.badgeDetailShort}</span>
                      <span className="hidden text-white/85 lg:inline">{messages.hero.badgeDetailLong}</span>
                    </span>
                    <ArrowRight className="h-3 w-3 text-white/60 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </a>
                  <h1 className="mt-2.5 text-balance font-heading text-[clamp(1.75rem,7.6vw,2.4rem)] font-bold leading-[1.04] tracking-[-0.025em] lg:mt-3.5 lg:text-[clamp(2.6rem,min(4.3vw,7.6svh),4.75rem)]">
                    {messages.hero.titleLine1} <span className="lg:block">{messages.hero.titleLine2}</span>
                  </h1>
                  <p className="mt-1.5 text-balance font-heading text-[0.95rem] font-medium text-white/85 lg:mt-2.5 lg:text-[clamp(1.1rem,1.55vw,1.5rem)]">
                    {messages.hero.subtitleLead} {strong(messages.hero.subtitleFind)},{" "}
                    {strong(messages.hero.subtitleTrust)}
                    {messages.hero.subtitleConnector} {strong(messages.hero.subtitleBuy)}
                  </p>
              </div>
              <div className="flex w-full flex-col items-center gap-2 [text-shadow:none] lg:w-auto lg:items-start lg:gap-0">
                <div className="flex w-full lg:hidden">{installButton(false)}</div>
                <div className="hidden lg:flex">{installButton(true)}</div>
                {/* the secondary ways in: quieter, and a clear step away from the install */}
                <div className="bzh-secondary hidden flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-white/75 [text-shadow:0_1px_10px_hsl(24_90%_30%/0.45)] lg:mt-6 lg:flex">
                  <a href={BIZMIS_DEMO_STORE_URL} target="_blank" rel="noopener noreferrer" onClick={handleViewDemoClick} className="inline-flex items-center gap-1.5 font-medium hover:underline">
                    <PlayCircle className="h-4 w-4" aria-hidden="true" />
                    {messages.common.liveDemo}
                  </a>
                  <span className="text-white/60" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-white/90">
                    {messages.hero.ratherTalk}{" "}
                    <a href={BIZMIS_BOOK_A_CALL_GENERAL_URL} target="_blank" rel="noopener noreferrer" onClick={handleBookACallClick} className="font-medium underline underline-offset-2">
                      {messages.common.bookACall}
                    </a>
                  </span>
                </div>
              </div>
            </div>

            {/* play: the agent points the visitor to it */}
            <button
              type="button"
              onClick={(e) => openFilm(e, "agent")}
              aria-label={messages.film.watch}
              className="group/play m-auto rounded-full focus-visible:outline-none lg:absolute lg:left-1/2 lg:top-1/2 lg:m-0 lg:-translate-x-1/2 lg:-translate-y-1/2"
            >
              <span
                data-play
                className={cn(
                  GLASS,
                  "relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full text-white transition-transform duration-500 group-hover/play:scale-110 group-focus-visible/play:ring-4 group-focus-visible/play:ring-white/60 lg:h-28 lg:w-28",
                  inviting && "bza-invite scale-110",
                )}
              >
                <span aria-hidden="true" className="bza-play-ring absolute inset-0 rounded-full" />
                <Play className="ml-1.5 h-7 w-7 fill-current drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)] lg:h-12 lg:w-12" aria-hidden="true" />
              </span>
            </button>
          </div>

          {/* the Bizmis widget, embedded bottom-right, and its captions (bottom centre of the page; on
              phones the real widget shows none) */}
          <HeroAgent
            paused={irisOpen}
            onInvite={setInviting}
            cardClassName="absolute bottom-[1.2em] left-1/2 -translate-x-1/2 lg:bottom-[2em] lg:left-auto lg:right-[2.4em] lg:translate-x-0"
            captionClassName="absolute bottom-[2.2em] left-1/2 hidden -translate-x-1/2 text-[1.15em] lg:block"
          />
        </div>
      </div>

      {/* the film: the whole hero is the player, revealed through the iris */}
      <div ref={irisBox} data-film-layer className={cn("absolute inset-0 z-30 cursor-auto", !irisOpen && "invisible")}>
        <div
          aria-hidden={!filmOpen}
          className="absolute inset-0 bg-black"
          style={{
            WebkitMaskImage: "radial-gradient(circle at var(--cx) var(--cy), #000 calc(var(--r) - 90px), transparent var(--r))",
            maskImage: "radial-gradient(circle at var(--cx) var(--cy), #000 calc(var(--r) - 90px), transparent var(--r))",
          }}
        >
          <FilmPlayer
            ref={film}
            bare
            fill
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
            onClose={onFilmClosed}
            className="h-full"
          />
          <button
            type="button"
            onClick={() => film.current?.close()}
            aria-label={messages.film.close}
            className={cn(
              GLASS,
              "absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full text-white transition-opacity hover:bg-[hsl(24_70%_30%/0.4)] sm:right-6 sm:top-6",
              filmOpen ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {/* a warm glow riding the iris' edge: the orange hands over to the film */}
        <div
          ref={glow}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at var(--cx) var(--cy), transparent calc(var(--r) - 140px), hsl(32 100% 82% / 0.75) calc(var(--r) - 50px), hsl(30 100% 70% / 0.35) calc(var(--r) - 10px), transparent var(--r))",
          }}
        />
      </div>
    </section>
  );
};

export default Hero;
