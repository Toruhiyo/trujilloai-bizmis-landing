import { Button } from "@/components/ui/button";
import { Menu, PlayCircle, X } from "lucide-react";
import { FaShopify } from "react-icons/fa";
import type { MouseEvent } from "react";
import { useState, useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import { scrollToTop, scrollToSection } from "@/lib/utils/scroll";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BIZMIS_DEMO_STORE_URL,
  BIZMIS_SHOPIFY_APP_LISTING_URL,
  openBizmisDemoStore,
  openBizmisShopifyAppListing,
} from "@/lib/bizmisUrls";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLocaleHref, useMessages } from "@/i18n/LocaleProvider";

const HERO_SCROLL_OFFSET_PX = 100;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInHero, setIsInHero] = useState(true);
  const [heroNavTheme, setHeroNavTheme] = useState<"dark" | "light">("dark");
  const navigate = useNavigate();
  const location = useLocation();
  const posthog = usePostHog();
  const localeHref = useLocaleHref();
  const messages = useMessages();

  useEffect(() => {
    setIsMenuOpen(false);
    setIsInHero(Boolean(document.getElementById("hero")));

    let rafId = 0;

    const updateHeroNav = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const hero = document.getElementById("hero");
        if (!hero) {
          setIsInHero(false);
          return;
        }

        setHeroNavTheme(hero.dataset.navTheme === "light" ? "light" : "dark");
        setIsInHero(
          hero.getBoundingClientRect().bottom > HERO_SCROLL_OFFSET_PX
        );
      });
    };

    updateHeroNav();

    const hero = document.getElementById("hero");
    const resizeObserver =
      hero && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateHeroNav)
        : null;
    resizeObserver?.observe(hero as Element);

    window.addEventListener("scroll", updateHeroNav, { passive: true });
    window.addEventListener("resize", updateHeroNav);
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", updateHeroNav);
      window.removeEventListener("resize", updateHeroNav);
    };
  }, [location.pathname]);

  const navItems = [
    { label: messages.nav.earlyAccess, href: "/early-access" },
    { label: messages.nav.benefits, href: "#benefits" },
    { label: messages.nav.setup, href: "#setup" },
    { label: messages.nav.pricing, href: "/pricing" },
    { label: messages.nav.faqs, href: "/faqs" },
  ] as const;

  const isActiveRoute = (href: string) =>
    !href.startsWith("#") && location.pathname === localeHref(href);

  // Fixed white bar when past #hero or when the mobile menu is open.
  const showWhiteChrome = !isInHero || isMenuOpen;
  // Light #hero backgrounds use foreground nav chrome while still transparent.
  const useForegroundNavChrome =
    showWhiteChrome || (isInHero && heroNavTheme === "light");

  const navLinkClassName = (href: string) => {
    const isActive = isActiveRoute(href);

    if (useForegroundNavChrome) {
      return isActive
        ? "text-primary font-semibold"
        : "text-foreground hover:text-primary";
    }

    return isActive
      ? "text-white font-semibold"
      : "text-white/90 hover:text-white";
  };

  const handleShopifyInstallNavClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    posthog.capture("cta_clicked", {
      cta_type: "shopify_app_listing",
      location: "navbar",
    });
    openBizmisShopifyAppListing();
  };

  const handleViewDemoNavClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisDemoStore();
    posthog.capture("cta_clicked", {
      cta_type: "view_demo",
      location: "navbar",
    });
  };

  const handleNavigation = (href: string) => {
    if (href.startsWith("#")) {
      if (location.pathname !== localeHref("/")) {
        navigate({ pathname: localeHref("/"), hash: href.slice(1) });
      } else {
        scrollToSection(href);
      }
    } else {
      navigate(localeHref(href));
      window.scrollTo(0, 0);
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav
        id="site-navbar"
        className={`w-full z-50 transition-all duration-300 ${
          showWhiteChrome
            ? "fixed top-0 bg-white/80 backdrop-blur-xl backdrop-saturate-150 border-b border-border shadow-soft"
            : "absolute top-0"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="relative flex items-center h-12 sm:h-16">
            {/* Logo */}
            <div className="relative z-10 flex items-center">
              <Logo
                variant={useForegroundNavChrome ? "default" : "white"}
                showText={true}
                onClick={() => {
                  if (location.pathname !== localeHref("/")) {
                    navigate(localeHref("/"));
                  } else {
                    scrollToTop();
                    // Clear the URL hash to remove section paths like /#setup
                    window.history.pushState({}, "", window.location.pathname);
                  }
                }}
              />
            </div>

            {/* Desktop Navigation — viewport-centered regardless of CTA width */}
            <div className="pointer-events-none absolute inset-x-0 hidden md:flex items-center justify-center">
              <div className="pointer-events-auto flex items-center space-x-8">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavigation(item.href)}
                    className={`font-medium transition-colors duration-300 hover:opacity-80 ${navLinkClassName(item.href)}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="relative z-10 ml-auto hidden md:flex items-center gap-6">
              {/* TODO: DO NOT REMOVE - Sign In button temporarily commented out
              <Button
                variant="ghost"
                className={`font-medium transition-colors duration-300 ${
                  showWhiteChrome
                    ? "text-foreground hover:bg-accent"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                Sign In
              </Button>
              */}
              <LanguageSwitcher theme={useForegroundNavChrome ? "light" : "dark"} />
              <a
                href={BIZMIS_DEMO_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleViewDemoNavClick}
                className={`inline-flex items-center gap-1.5 font-medium transition-colors duration-300 hover:opacity-80 ${
                  useForegroundNavChrome
                    ? "text-foreground hover:text-primary"
                    : "text-white/90 hover:text-white"
                }`}
              >
                <PlayCircle className="h-4 w-4" aria-hidden="true" />
                {messages.common.liveDemo}
              </a>
              <Button
                variant={useForegroundNavChrome ? "default" : "outline"}
                asChild
                className={`font-medium text-base transition-all duration-300 inline-flex items-center gap-2 [&_svg]:pointer-events-auto ${
                  useForegroundNavChrome
                    ? ""
                    : "bg-transparent text-white border border-white hover:bg-white/10 [&_svg]:text-white"
                }`}
              >
                <a
                  href={BIZMIS_SHOPIFY_APP_LISTING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleShopifyInstallNavClick}
                >
                  <FaShopify className="h-5 w-5" />
                  {messages.common.installNow}
                </a>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="relative z-10 ml-auto flex items-center gap-2 md:hidden">
              <LanguageSwitcher theme={useForegroundNavChrome ? "light" : "dark"} />
              <Button
                variant="ghost"
                size="icon"
                className={`transition-colors duration-300 h-8 w-8 sm:h-10 sm:w-10 ${
                  useForegroundNavChrome
                    ? "text-foreground hover:bg-accent"
                    : "text-white hover:bg-white/10"
                }`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? messages.nav.closeMenu : messages.nav.openMenu}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu drawer — rendered as a sibling of the <nav> (not a child)
          so it can apply its own backdrop-filter without being trapped inside
          the nav's filter context. */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-12 sm:top-16 left-0 right-0 z-50 px-3 pb-3">
          <div className="isolate rounded-b-2xl border border-primary/15 bg-gradient-to-b from-background/75 via-[#FDF7E2]/45 to-background/75 backdrop-blur-2xl backdrop-saturate-200 shadow-[0_18px_36px_-18px_rgba(0,0,0,0.22)] overflow-hidden">
            <div className="px-3 sm:px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.href)}
                  className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary ${
                    isActiveRoute(item.href)
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-3 mt-2 border-t border-primary/15 space-y-3">
                {/* TODO: DO NOT REMOVE - Sign In button temporarily commented out
                <Button variant="ghost" className="w-full font-medium">
                  Sign In
                </Button>
                */}
                <a
                  href={BIZMIS_DEMO_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleViewDemoNavClick}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <PlayCircle className="h-4 w-4" aria-hidden="true" />
                  {messages.common.liveDemo}
                </a>
                <Button
                  variant="default"
                  asChild
                  className="w-full font-medium text-base [&_svg]:pointer-events-auto"
                >
                  <a
                    href={BIZMIS_SHOPIFY_APP_LISTING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2"
                    onClick={handleShopifyInstallNavClick}
                  >
                    <FaShopify className="h-5 w-5" />
                    {messages.common.installNow}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
