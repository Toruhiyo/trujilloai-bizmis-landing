import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { FaShopify } from "react-icons/fa";
import type { MouseEvent } from "react";
import { useState, useEffect } from "react";
import { scrollToTop, scrollToSection } from "@/lib/utils/scroll";
import { useNavigate, useLocation } from "react-router-dom";
import { BIZMIS_SHOPIFY_APP_LISTING_URL, openBizmisShopifyAppListing } from "@/lib/bizmisUrls";
import Logo from "./Logo";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInHero, setIsInHero] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") {
      setIsInHero(false);
      return;
    }

    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const scrolled = window.scrollY > heroHeight - 100;
      setIsInHero(!scrolled);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const navItems = [
    { label: "Features", href: "#benefits" },
    { label: "Setup", href: "#setup" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQs", href: "/faqs" },
  ];

  const handleShopifyInstallNavClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisShopifyAppListing();
  };

  const handleNavigation = (href: string) => {
    if (href.startsWith("#")) {
      if (location.pathname !== "/") {
        navigate("/" + href);
      } else {
        scrollToSection(href);
      }
    } else {
      navigate(href);
      window.scrollTo(0, 0);
    }
    setIsMenuOpen(false);
  };

  // The nav adopts its scrolled "white chrome" styling whenever the user is
  // out of the hero OR the mobile menu is open. The drawer is rendered as a
  // sibling (not a child) of the nav so both can independently apply
  // backdrop-filter — nested backdrop-filter doesn't work per CSS spec.
  const showWhiteChrome = !isInHero || isMenuOpen;
  return (
    <>
      <nav
        className={`w-full z-50 transition-all duration-300 ${
          showWhiteChrome
            ? "fixed top-0 bg-white/80 backdrop-blur-xl backdrop-saturate-150 border-b border-border shadow-soft"
            : "absolute top-0"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-12 sm:h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Logo
                variant={showWhiteChrome ? "default" : "white"}
                showText={true}
                onClick={() => {
                  if (location.pathname !== "/") {
                    navigate("/");
                  } else {
                    scrollToTop();
                    // Clear the URL hash to remove section paths like /#setup
                    window.history.pushState({}, "", window.location.pathname);
                  }
                }}
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavigation(item.href)}
                  className={`font-medium transition-colors duration-300 hover:opacity-80 ${
                    showWhiteChrome
                      ? "text-foreground hover:text-primary"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-4">
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
              <Button
                variant={showWhiteChrome ? "default" : "outline"}
                asChild
                className={`font-medium text-base transition-all duration-300 inline-flex items-center gap-2 [&_svg]:pointer-events-auto ${
                  showWhiteChrome
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
                  Install Now
                </a>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className={`transition-colors duration-300 h-8 w-8 sm:h-10 sm:w-10 ${
                  showWhiteChrome
                    ? "text-foreground hover:bg-accent"
                    : "text-white hover:bg-white/10"
                }`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                  className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-3 mt-2 border-t border-primary/15">
                {/* TODO: DO NOT REMOVE - Sign In button temporarily commented out
                <Button variant="ghost" className="w-full font-medium">
                  Sign In
                </Button>
                */}
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
                    Install Now
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
