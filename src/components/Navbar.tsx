import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isInHero, setIsInHero] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;

      // Check if scrolled from top (even slightly)
      const scrolled = scrollY > 10;
      setIsScrolled(scrolled);

      // Check if still in hero section
      const inHero = scrollY < heroHeight - 100;
      setIsInHero(inHero);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "Integration", href: "#integration" },
    { label: "Pricing", href: "#pricing" },
  ];

  const getNavbarClasses = () => {
    if (!isScrolled) {
      return "bg-transparent";
    }

    if (isInHero) {
      return "bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg";
    }

    return "bg-white/95 backdrop-blur-sm border-b border-border shadow-soft";
  };

  const getTextColor = () => {
    if (!isScrolled) {
      return "text-white";
    }

    if (isInHero) {
      return "text-white";
    }

    return "text-primary";
  };

  const getLinkColor = () => {
    if (!isScrolled) {
      return "text-white/90 hover:text-white";
    }

    if (isInHero) {
      return "text-white/90 hover:text-white";
    }

    return "text-foreground hover:text-primary";
  };

  const getButtonVariant = () => {
    if (!isScrolled) {
      return "outline";
    }

    if (isInHero) {
      return "outline";
    }

    return "default";
  };

  const getButtonClasses = () => {
    if (!isScrolled) {
      return "bg-white text-foreground border-white hover:bg-white/90";
    }

    if (isInHero) {
      return "bg-white/20 text-white border-white/30 hover:bg-white/30";
    }

    return "";
  };

  const getGhostButtonClasses = () => {
    if (!isScrolled) {
      return "text-white/90 hover:text-white hover:bg-white/10";
    }

    if (isInHero) {
      return "text-white/90 hover:text-white hover:bg-white/20";
    }

    return "text-foreground hover:bg-accent";
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${getNavbarClasses()}`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span
              className={`text-2xl font-heading font-bold transition-colors duration-300 ${getTextColor()}`}
            >
              Bizmis
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`font-medium transition-colors duration-300 ${getLinkColor()}`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              className={`font-medium transition-colors duration-300 ${getGhostButtonClasses()}`}
            >
              Sign In
            </Button>
            <Button
              variant={getButtonVariant()}
              className={`font-medium transition-all duration-300 ${getButtonClasses()}`}
            >
              Get Started Free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className={`transition-colors duration-300 ${getGhostButtonClasses()}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className={`md:hidden absolute top-16 left-0 right-0 border-b shadow-soft transition-colors duration-300 ${
              isScrolled
                ? isInHero
                  ? "bg-white/20 backdrop-blur-md border-white/20"
                  : "bg-white border-border"
                : "bg-white/95 backdrop-blur-sm border-white/20"
            }`}
          >
            <div className="px-6 py-4 space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block text-foreground hover:text-primary font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
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
