import type { MouseEvent } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgePercent,
  Calendar,
  Compass,
  Flame,
  Headphones,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { FaShopify } from "react-icons/fa";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { EARLY_ACCESS_STORE_CAP } from "@/data/leads/_schema";
import {
  BIZMIS_BOOK_A_CALL_URL,
  BIZMIS_DEMO_STORE_URL,
  BIZMIS_SHOPIFY_APP_LISTING_URL,
  openBizmisDemoStore,
  openBizmisShopifyAppListing,
} from "@/lib/bizmisUrls";

const BENEFITS = [
  {
    icon: Sparkles,
    title: "Free during the pilot*",
    detail:
      "Install it, claim Early Access in the app, and use your pilot credits. No commitment.",
  },
  {
    icon: Compass,
    title: "Shape the roadmap",
    detail:
      "Priority feedback straight to me. Your shoppers' questions decide what we build next.",
  },
  {
    icon: Headphones,
    title: "Priority support",
    detail: "A direct line to the founder while you get set up, and long after.",
  },
  {
    icon: BadgePercent,
    title: "Exclusive discounts",
    detail:
      "Your personal early-access code carries over to any paid plan, for keeps.",
  },
] as const;

const EarlyAccess = () => {
  const posthog = usePostHog();

  const handleInstallClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisShopifyAppListing();
    posthog.capture("cta_clicked", {
      location: "early_access",
      cta_type: "install",
    });
  };

  const handleViewDemoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openBizmisDemoStore();
    posthog.capture("cta_clicked", {
      location: "early_access",
      cta_type: "view_demo",
    });
  };

  const handleBookCallClick = () => {
    posthog.capture("cta_clicked", {
      location: "early_access",
      cta_type: "book_call",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF7E2] via-white to-[#FDF7E2]/40 flex flex-col">
      <Seo
        title="Bizmis Early Access — free pilot for 50 Shopify stores"
        description="The Bizmis early-access pilot: install free while we're in early access, get a direct line to the founder, shape the roadmap, and keep a discount when you upgrade. First 50 Shopify stores only."
        path="/early-access"
      />

      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to Home
            </a>
            <div className="w-px h-6 bg-border" aria-hidden="true" />
            <p className="text-2xl font-heading font-bold text-foreground">
              Early Access
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12 lg:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            {/* Hero: about the program, not the product */}
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide mb-6 shadow-lg shadow-primary/30">
                <Flame className="w-4 h-4" aria-hidden="true" />
                First {EARLY_ACCESS_STORE_CAP} stores only
              </div>

              <h1 className="text-4xl lg:text-6xl font-heading font-bold text-foreground mb-6 leading-[1.05]">
                Join the private
                <br className="hidden sm:block" /> Early Access program
              </h1>

              <p className="text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed">
                Only {EARLY_ACCESS_STORE_CAP} Shopify stores get this early-access
                pilot. Claim your spot, use Bizmis free while the program is
                open, and keep your early-access perks when you upgrade.
              </p>

              {/* Primary CTA: install on Shopify */}
              <div className="flex flex-col items-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-white hover:bg-primary/90 h-14 px-8 text-lg rounded-xl shadow-lg shadow-primary/30 w-full sm:w-auto [&_svg]:!w-6 [&_svg]:!h-6"
                >
                  <a
                    href={BIZMIS_SHOPIFY_APP_LISTING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleInstallClick}
                  >
                    <FaShopify className="mr-2" aria-hidden="true" />
                    Install on your store
                  </a>
                </Button>

                {/* Secondary CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-sm">
                  <a
                    href={BIZMIS_DEMO_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleViewDemoClick}
                    className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <PlayCircle className="w-4 h-4" aria-hidden="true" />
                    See the live demo
                  </a>
                  <span
                    className="hidden sm:inline text-muted-foreground/40"
                    aria-hidden="true"
                  >
                    ·
                  </span>
                  <a
                    href={BIZMIS_BOOK_A_CALL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleBookCallClick}
                    className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    Book a 30-min call with me
                  </a>
                </div>
              </div>
            </div>

            {/* Early-bird benefits: vertical cards side by side */}
            <section aria-labelledby="benefits-heading" className="mt-16 mb-14">
              <h2
                id="benefits-heading"
                className="text-2xl lg:text-3xl font-heading font-bold text-foreground text-center mb-10"
              >
                Your early-bird benefits
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {BENEFITS.map(({ icon: Icon, title, detail }) => (
                  <div
                    key={title}
                    className="group relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-primary/15 bg-white shadow-xl shadow-primary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20"
                  >
                    <div
                      className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,163,83,0.30),_transparent_43%),linear-gradient(180deg,_rgba(253,247,226,0.95),_rgba(255,255,255,0.92)_55%)]"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-[#EC7709] via-[#F9A353] to-[#FBBD84]"
                      aria-hidden="true"
                    />
                    <Icon
                      className="pointer-events-none absolute -right-8 -top-4 h-44 w-44 text-primary/[0.12] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:text-primary/20"
                      aria-hidden="true"
                    />
                    <div className="relative flex h-full flex-col p-7 pt-24">
                      <h3 className="mb-4 text-[2rem] font-heading font-extrabold leading-[0.98] tracking-[-0.05em] text-foreground lg:text-[2.15rem]">
                        {title}
                      </h3>
                      <p className="mt-auto rounded-2xl bg-white/70 p-4 text-[15px] leading-relaxed text-muted-foreground shadow-sm ring-1 ring-primary/5 backdrop-blur-sm">
                        {detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="cta-heading" className="mb-8">
              <h2
                id="cta-heading"
                className="text-2xl lg:text-3xl font-heading font-bold text-foreground text-center mb-8"
              >
                Choose your way in
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 max-w-4xl mx-auto">
                <a
                  href={BIZMIS_SHOPIFY_APP_LISTING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleInstallClick}
                  className="group relative overflow-hidden rounded-[2rem] bg-primary p-7 text-white shadow-2xl shadow-primary/25 transition-all duration-300 hover:-translate-y-1.5 hover:bg-primary/95 hover:shadow-primary/35"
                >
                  <FaShopify
                    className="absolute -right-8 -top-10 h-44 w-44 text-white/10 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
                    aria-hidden="true"
                  />
                  <div className="relative flex min-h-[15rem] flex-col">
                    <div className="mb-8 flex items-start justify-between gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
                        <FaShopify className="h-8 w-8" aria-hidden="true" />
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                        <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                        Fastest path
                      </p>
                      <h3 className="text-3xl font-heading font-extrabold leading-[0.95] tracking-[-0.04em] lg:text-4xl">
                        Install on your store
                      </h3>
                      <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
                        Claim Early Access directly from the Shopify app.
                      </p>
                    </div>
                  </div>
                </a>

                <a
                  href={BIZMIS_BOOK_A_CALL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleBookCallClick}
                  className="group relative overflow-hidden rounded-[2rem] border border-primary/15 bg-white p-7 text-foreground shadow-xl shadow-primary/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/20"
                >
                  <Calendar
                    className="absolute -right-8 -top-10 h-44 w-44 text-primary/[0.10] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:text-primary/20"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,163,83,0.24),_transparent_42%),linear-gradient(180deg,_rgba(253,247,226,0.85),_rgba(255,255,255,0.94)_58%)]"
                    aria-hidden="true"
                  />
                  <div className="relative flex min-h-[15rem] flex-col">
                    <div className="mb-8 flex items-start justify-between gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
                        <Calendar className="h-8 w-8" aria-hidden="true" />
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                        <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-primary/70">
                        Want help?
                      </p>
                      <h3 className="text-3xl font-heading font-extrabold leading-[0.95] tracking-[-0.04em] lg:text-4xl">
                        Book a 30-min call
                      </h3>
                      <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                        Get a guided walkthrough before you install.
                      </p>
                    </div>
                  </div>
                </a>
              </div>
              <div className="mt-5 flex justify-center">
                <Button variant="link" asChild className="text-muted-foreground">
                  <a
                    href={BIZMIS_DEMO_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleViewDemoClick}
                  >
                    <PlayCircle className="h-4 w-4" aria-hidden="true" />
                    See the live demo first
                  </a>
                </Button>
              </div>
            </section>

            <p className="text-center text-sm text-muted-foreground mb-4">
              Built by Oriol Trujillo, founder. Questions?{" "}
              <a
                href="mailto:hello@bizmis.ai"
                className="text-foreground font-medium hover:underline"
              >
                hello@bizmis.ai
              </a>
            </p>

            <p className="text-center text-xs text-muted-foreground">
              *Free during the pilot = a one-time 1,200 credits of live usage
              (~120 voice minutes), no renewal.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EarlyAccess;
