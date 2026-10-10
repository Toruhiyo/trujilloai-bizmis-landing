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
 * The /v2 hero, video first (BIZ-423). A silent loop fills it: a store (a
 * desktop browser; a phone on phones) with the real Bizmis widget at work in
 * its corner, in the film's three beats: it finds the shopper the right
 * products, takes them to one and clears their doubts, and puts it in the cart
 * with an add-on. It plays for as long as the visitor stays; its first frame
 * shows at once, so a slow connection still gets a finished hero.
 *
 * The copy sits in one glass card over the mockup, and the subtitle's "Find
 * it, Trust it, Buy it" lights up with the beat on screen. The mockup is the
 * play control: hovering it brings up the play button, a click turns the
 * whole hero into the film, opening from the play button as a widening circle
 * with a glowing edge while the orange scene blurs and pushes back. Close
 * (✕, Escape, or a click outside the hero) runs it back into the loop; play
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

  const openFilm = (e: MouseEvent<HTMLElement>, from: "scene") => {
    const box = hero.current?.getBoundingClientRect();
    if (!box) return;
    // the iris opens from the play button (shown over the mockup)
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
        "group flex items-center gap-3 [&_svg]:pointer-events-auto",
        big ? "h-16 px-6 text-lg" : "h-12 flex-1 px-4 text-base",
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

  // the subtitle's Find it / Trust it / Buy it light up with the loop's three beats (24 fps frames)
  const [beat, setBeat] = useState(0);
  const onLoopTime = useCallback((t: number) => {
    const f = t * 24;
    setBeat(f >= 34 && f < 164 ? 1 : f >= 164 && f < 244 ? 2 : f >= 244 && f < 302 ? 3 : 0);
  }, []);
  const beatWord = (n: number, text: string) => (
    <span
      className={cn(
        "relative font-semibold text-white transition-[color,text-shadow] duration-300",
        beat === n && "text-[hsl(40_100%_88%)] [text-shadow:0_0_18px_hsl(35_100%_70%/0.9)]",
      )}
    >
      {text}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 -bottom-0.5 h-[3px] origin-left rounded-full bg-white/90 transition-transform duration-500",
          beat === n ? "scale-x-100" : "scale-x-0",
        )}
      />
    </span>
  );

  return (
    <section
      id="hero"
      ref={hero}
      className="relative h-[100svh] min-h-[600px] overflow-hidden studio-lighting-base"
    >
      {/* what shows before the loop's first frame arrives */}
      <div className="absolute inset-0 studio-radial-light" />
      <div className="absolute inset-0 studio-ambient-overlay" />

      {/* the loop: a store with the widget at work. It pushes back and blurs as the film opens */}
      <div
        className={cn(
          "absolute inset-0 transition-[transform,filter] duration-[950ms] ease-[cubic-bezier(.65,0,.35,1)]",
          filmOpen && "scale-[1.08] blur-[14px] brightness-110",
        )}
      >
        <HeroLoop
          sources={HERO_LOOP.wide}
          paused={irisOpen}
          onTime={onLoopTime}
          className="absolute inset-0 hidden lg:block"
          mediaClassName="object-cover object-[50%_45%]"
        />
        <HeroLoop
          sources={HERO_LOOP.tall}
          paused={irisOpen}
          onTime={onLoopTime}
          className="absolute inset-0 lg:hidden"
          mediaClassName="object-cover object-[50%_100%]"
        />
        {/* the mockup is the play control: hovering it brings up the play button, a click plays the film */}
        <button
          type="button"
          onClick={(e) => openFilm(e, "scene")}
          aria-label={messages.film.watch}
          className="group/scene absolute inset-x-0 bottom-0 top-[30%] cursor-pointer focus-visible:outline-none lg:top-[6%]"
        >
          <span
            data-play
            className={cn(
              GLASS,
              "absolute left-1/2 top-[42%] flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white transition-all duration-300 lg:top-[44%] lg:h-24 lg:w-24",
              "scale-90 opacity-0 group-hover/scene:scale-100 group-hover/scene:opacity-100 group-focus-visible/scene:scale-100 group-focus-visible/scene:opacity-100 group-focus-visible/scene:ring-4 group-focus-visible/scene:ring-white/60",
              "[@media(hover:none)]:scale-100 [@media(hover:none)]:opacity-90",
            )}
          >
            <Play className="ml-1 h-8 w-8 fill-current drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)] lg:h-10 lg:w-10" aria-hidden="true" />
          </span>
        </button>
      </div>

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

      {/* the copy: one glass card over the mockup (bottom-left on desktop, under the nav on phones), the CTAs beside it */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-[4.25rem] z-10 transition-all duration-500 lg:bottom-[clamp(1.5rem,4svh,3rem)] lg:top-auto",
          filmOpen && "translate-y-3 opacity-0",
        )}
      >
        <div className="container mx-auto flex flex-col gap-3 px-3 sm:px-6 lg:flex-row lg:items-end lg:gap-6">
          {/* eyebrow, title, subtitle: nothing else in the card */}
          <div
            className={cn(
              "pointer-events-auto w-full rounded-[26px] border border-white/45 p-4 text-white sm:p-5 lg:max-w-[min(34rem,42vw)] lg:rounded-[30px] lg:p-7",
              "bg-[linear-gradient(150deg,hsl(28_85%_52%/0.55),hsl(24_80%_40%/0.42))] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_30px_80px_-30px_hsl(24_90%_25%/0.65)] backdrop-blur-2xl backdrop-saturate-150",
            )}
          >
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
            <h1 className="mt-2.5 font-heading text-[clamp(1.75rem,7.6vw,2.4rem)] font-bold leading-[1.04] tracking-[-0.025em] lg:mt-3.5 lg:text-[clamp(2.4rem,min(3.6vw,6.6svh),3.75rem)]">
              {messages.hero.titleLine1} <span className="lg:block">{messages.hero.titleLine2}</span>
            </h1>
            <p className="mt-1.5 font-heading text-[0.95rem] font-medium text-white/85 lg:mt-2.5 lg:text-[clamp(1.05rem,1.4vw,1.35rem)]">
              {messages.hero.subtitleLead} {beatWord(1, messages.hero.subtitleFind)},{" "}
              {beatWord(2, messages.hero.subtitleTrust)}
              {messages.hero.subtitleConnector} {beatWord(3, messages.hero.subtitleBuy)}
            </p>
          </div>
          {/* the CTAs, outside the card */}
          <div className="pointer-events-auto flex flex-col gap-2 lg:pb-1">
            <div className="flex w-full lg:hidden">{installButton(false)}</div>
            <div className="hidden lg:flex">{installButton(true)}</div>
            <div className="hidden w-fit flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-white/35 bg-[hsl(24_80%_40%/0.5)] px-4 py-1.5 text-sm text-white shadow-[0_12px_30px_-14px_hsl(24_90%_25%/0.6)] backdrop-blur-xl lg:flex">
              <a href={BIZMIS_DEMO_STORE_URL} target="_blank" rel="noopener noreferrer" onClick={handleViewDemoClick} className="inline-flex items-center gap-1.5 font-semibold hover:underline">
                <PlayCircle className="h-4 w-4" aria-hidden="true" />
                {messages.common.liveDemo}
              </a>
              <span className="text-white/60" aria-hidden="true">
                ·
              </span>
              <span className="text-white/90">
                {messages.hero.ratherTalk}{" "}
                <a href={BIZMIS_BOOK_A_CALL_GENERAL_URL} target="_blank" rel="noopener noreferrer" onClick={handleBookACallClick} className="font-semibold text-white underline underline-offset-2">
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
