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
import { HERO_FILM, HERO_LOOP } from "@/lib/film";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";
import HeroLoop from "./HeroLoop";
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
 * The /v2 hero, video first (BIZ-423). A silent loop fills it: the real Bizmis
 * widget, big, with its agent at work (it hears a shopper, searches, talks
 * with captions, recommends, adds to the cart), and it keeps playing for as
 * long as the visitor stays. The copy is short and sits over it; the loop's
 * first frame shows at once, so a slow connection still gets a finished hero.
 *
 * Play (the round button, or a click on the scene) turns the whole hero into
 * the film: it opens from the play button as a widening circle with a glowing
 * edge while the orange scene blurs and pushes back, so the jump from the
 * brand's orange to the film's own colours reads as a move into the film.
 * Close (✕, Escape, or a click outside the hero) runs it back into the loop;
 * play again resumes where it stopped.
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

  const openFilm = (e: MouseEvent<HTMLElement>, from: "play_button" | "scene") => {
    const box = hero.current?.getBoundingClientRect();
    if (!box) return;
    const target = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = from === "play_button" ? target.left + target.width / 2 - box.left : e.clientX - box.left;
    const cy = from === "play_button" ? target.top + target.height / 2 - box.top : e.clientY - box.top;
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
  // the film closed itself (click-off, Escape) or the ✕ asked it to: run the iris back
  const onFilmClosed = useCallback(() => {
    setFilmOpen(false);
    runIris(0, () => setIrisOpen(false));
  }, [runIris]);

  const playButton = (big: boolean) => (
    <button
      type="button"
      onClick={(e) => openFilm(e, "play_button")}
      aria-label={messages.film.watch}
      className={cn(
        GLASS,
        "flex flex-shrink-0 items-center justify-center rounded-full text-white transition-all duration-300 hover:scale-105 hover:bg-[hsl(24_70%_30%/0.34)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60",
        big ? "h-[4.5rem] w-[4.5rem]" : "h-14 w-14",
      )}
    >
      <Play className={cn("fill-current drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]", big ? "ml-1 h-7 w-7" : "ml-0.5 h-6 w-6")} aria-hidden="true" />
    </button>
  );

  const installButton = (big: boolean) => (
    <Button
      variant="hero"
      size="xl"
      asChild
      className={cn(
        "group flex items-center gap-3 [&_svg]:pointer-events-auto",
        big ? "h-[4.5rem] px-7 text-lg" : "h-14 flex-1 px-4 text-base",
      )}
    >
      <a href={BIZMIS_SHOPIFY_APP_LISTING_URL} target="_blank" rel="noopener noreferrer" onClick={(e) => handleShopifyInstallClick(e)}>
        <FaShopify className={cn("text-primary", big ? "!h-8 !w-8" : "!h-6 !w-6")} />
        <span className="flex-1 text-left">
          <span className="block font-semibold">{messages.common.installNow}</span>
          {big && <span className="block text-sm font-normal opacity-80">{messages.hero.installSubline}</span>}
        </span>
        <ArrowRight className="!h-5 !w-5 transition-transform group-hover:translate-x-1" />
      </a>
    </Button>
  );

  return (
    <section
      id="hero"
      ref={hero}
      className="relative h-[100svh] min-h-[560px] overflow-hidden studio-lighting-base"
    >
      {/* what shows before the loop's first frame arrives */}
      <div className="absolute inset-0 studio-radial-light" />
      <div className="absolute inset-0 studio-ambient-overlay" />

      {/* the loop: it pushes back and blurs as the film opens */}
      <div
        className={cn(
          "absolute inset-0 transition-[transform,filter] duration-[950ms] ease-[cubic-bezier(.65,0,.35,1)]",
          filmOpen && "scale-[1.08] blur-[14px] brightness-110",
        )}
      >
        <HeroLoop
          sources={HERO_LOOP.wide}
          paused={irisOpen}
          className="absolute inset-0 hidden lg:block"
          mediaClassName="object-cover object-[50%_35%]"
        />
        <HeroLoop
          sources={HERO_LOOP.tall}
          paused={irisOpen}
          className="absolute inset-0 lg:hidden"
          mediaClassName="object-cover object-[50%_30%]"
        />
        {/* the scene itself plays the film when clicked (the widget's side of the frame) */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={(e) => openFilm(e, "scene")}
          className="absolute inset-x-0 top-[12%] bottom-[34%] cursor-pointer lg:bottom-[24%]"
        />
      </div>

      {/* grain, as on the rest of the landing */}
      <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full mix-blend-overlay" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <filter id="hero-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.50" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-noise)" opacity="0.32" />
      </svg>

      <div className={cn("relative z-20 transition-opacity duration-500", filmOpen && "pointer-events-none opacity-0")}>
        <Navbar />
      </div>

      {/* the copy: a lower third over a soft scrim; the loop does the showing */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[46%] bg-[linear-gradient(to_top,hsl(24_85%_38%/0.62),hsl(26_90%_45%/0.28)_45%,transparent)] transition-opacity duration-500 lg:h-[40%]",
          filmOpen && "opacity-0",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-10 transition-all duration-500",
          filmOpen && "translate-y-4 opacity-0",
        )}
      >
        <div className="container mx-auto flex flex-col gap-4 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:pb-[clamp(1.75rem,5svh,3.5rem)]">
          <div className="pointer-events-auto min-w-0">
            <a
              href={href("/early-access")}
              onClick={handleEarlyAccessClick}
              className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.1] px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm transition-colors hover:bg-white/[0.16] hover:text-white sm:text-sm"
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
                <span className="text-white/80 lg:hidden">{messages.hero.badgeDetailShort}</span>
                <span className="hidden text-white/80 lg:inline">{messages.hero.badgeDetailLong}</span>
              </span>
              <ArrowRight className="h-3 w-3 text-white/55 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
            <h1 className="mt-2.5 font-heading text-[clamp(2rem,8.6vw,2.75rem)] font-bold leading-[1.02] tracking-[-0.025em] text-white drop-shadow-[0_2px_24px_rgba(120,45,0,0.35)] lg:mt-3 lg:text-[clamp(2.75rem,min(4.6vw,8.5svh),5rem)]">
              {messages.hero.titleLine1} <span className="lg:block">{messages.hero.titleLine2}</span>
            </h1>
            <p className="mt-1.5 font-heading text-[0.95rem] font-medium text-white/85 lg:mt-2 lg:text-[clamp(1.1rem,1.6vw,1.5rem)]">
              {messages.hero.subtitleLead}{" "}
              <span className="font-semibold text-white">{messages.hero.subtitleFind}</span>,{" "}
              <span className="font-semibold text-white">{messages.hero.subtitleTrust}</span>
              {messages.hero.subtitleConnector}{" "}
              <span className="font-semibold text-white">{messages.hero.subtitleBuy}</span>
            </p>
          </div>
          <div className="pointer-events-auto flex flex-shrink-0 flex-col gap-2 lg:items-end">
            <div className="flex items-center gap-3">
              <div className="flex flex-1 lg:hidden">{installButton(false)}</div>
              <div className="hidden lg:flex">{installButton(true)}</div>
              <span className="lg:hidden">{playButton(false)}</span>
              <span className="hidden lg:inline-flex">{playButton(true)}</span>
            </div>
            <div className="hidden flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/80 lg:flex">
              <a href={BIZMIS_DEMO_STORE_URL} target="_blank" rel="noopener noreferrer" onClick={handleViewDemoClick} className="inline-flex items-center gap-1.5 text-white/90 underline-offset-2 hover:text-white hover:underline">
                <PlayCircle className="h-4 w-4" aria-hidden="true" />
                {messages.common.liveDemo}
              </a>
              <span className="text-white/50" aria-hidden="true">
                ·
              </span>
              <span>
                {messages.hero.ratherTalk}{" "}
                <a href={BIZMIS_BOOK_A_CALL_GENERAL_URL} target="_blank" rel="noopener noreferrer" onClick={handleBookACallClick} className="text-white/90 underline underline-offset-2 hover:text-white">
                  {messages.common.bookACall}
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* the film: the whole hero is the player, revealed through the iris */}
      <div ref={irisBox} className={cn("absolute inset-0 z-30", !irisOpen && "invisible")}>
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
