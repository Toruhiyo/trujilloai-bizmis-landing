import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const scrolled = window.scrollY > heroHeight - 100;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "Integration", href: "#integration" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-sm border-b border-border shadow-soft' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className={`text-2xl font-heading font-bold transition-colors duration-300 ${
              isScrolled ? 'text-primary' : 'text-white'
            }`}>
              Bizmis
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`font-medium transition-colors duration-300 ${
                  isScrolled 
                    ? 'text-foreground hover:text-primary' 
                    : 'text-white/90 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className={`font-medium transition-colors duration-300 ${
                isScrolled 
                  ? 'text-foreground hover:bg-accent' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Sign In
            </Button>
            <Button 
              variant={isScrolled ? "default" : "outline"} 
              className={`font-medium transition-all duration-300 ${
                isScrolled 
                  ? '' 
                  : 'bg-white text-foreground border-white hover:bg-white/90'
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
              className={`transition-colors duration-300 ${
                isScrolled 
                  ? 'text-foreground hover:bg-accent' 
                  : 'text-white hover:bg-white/10'
              }`}
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
          <div className={`md:hidden absolute top-16 left-0 right-0 border-b shadow-soft transition-colors duration-300 ${
            isScrolled 
              ? 'bg-white border-border' 
              : 'bg-white/95 backdrop-blur-sm border-white/20'
          }`}>
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
