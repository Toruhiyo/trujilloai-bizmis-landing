import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { scrollToTop, scrollToSection } from "@/lib/utils/scroll";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInHero, setIsInHero] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const scrolled = window.scrollY > heroHeight - 100;
      setIsInHero(!scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Features", href: "#benefits" },
    { label: "Setup", href: "#setup" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <nav
      className={`w-full z-50 transition-all duration-300 ${
        isInHero
          ? "absolute top-0"
          : "fixed top-0 bg-white/95 backdrop-blur-sm border-b border-border shadow-soft"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-12 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => {
                scrollToTop();
                // Clear the URL hash to remove section paths like /#setup
                window.history.pushState({}, "", window.location.pathname);
              }}
              className={`text-xl sm:text-2xl font-heading font-black transition-colors duration-300 hover:opacity-80 cursor-pointer ${
                isInHero ? "text-white" : "text-orange-600"
              }`}
            >
              Bizmis
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className={`font-medium transition-colors duration-300 hover:opacity-80 ${
                  isInHero
                    ? "text-white/90 hover:text-white"
                    : "text-foreground hover:text-orange-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              className={`font-medium transition-colors duration-300 ${
                isInHero
                  ? "text-white/90 hover:text-white hover:bg-white/10"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              Sign In
            </Button>
            <Button
              variant={isInHero ? "outline" : "default"}
              className={`font-medium transition-all duration-300 ${
                isInHero
                  ? "bg-white text-foreground border-white hover:bg-white/90"
                  : ""
              }`}
            >
              Get Started Free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className={`transition-colors duration-300 h-8 w-8 sm:h-10 sm:w-10 ${
                isInHero
                  ? "text-white hover:bg-white/10"
                  : "text-foreground hover:bg-accent"
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className={`md:hidden absolute top-12 sm:top-16 left-0 right-0 border-b shadow-soft transition-colors duration-300 ${
              isInHero
                ? "bg-white/95 backdrop-blur-sm border-white/20"
                : "bg-white border-border"
            }`}
          >
            <div className="px-4 sm:px-6 py-4 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    scrollToSection(item.href);
                    setIsMenuOpen(false);
                  }}
                  className="block text-foreground hover:text-orange-600 font-medium transition-colors w-full text-left"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 space-y-2">
                <Button variant="ghost" className="w-full font-medium">
                  Sign In
                </Button>
                <Button variant="default" className="w-full font-medium">
                  Get Started Free
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
