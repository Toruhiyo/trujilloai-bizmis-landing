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
    title: "Free as a member*",
    detail:
      "Claim Early Access in the app and use 1,200 live credits at no cost. No subscription, no commitment.",
  },
  {
    icon: Compass,
    title: "Shape the roadmap",
    detail:
      "Your feedback gets priority. The questions your shoppers ask help decide the next features, fixes, and product decisions.",
  },
  {
    icon: Headphones,
    title: "Priority support",
    detail:
      "Get a direct line to the founder for setup questions, configuration guidance, and priority help as an Early Access member.",
  },
  {
    icon: BadgePercent,
    title: "Exclusive discounts",
    detail:
      "Your Early Access code unlocks discounted monthly intro pricing and discounted yearly pricing when you upgrade.",
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
        title="Bizmis Early Access — free for the first 50 Shopify stores"
        description="Become a Bizmis Early Access member: install free, get a direct line to the founder, shape the roadmap, and keep member discounts when you upgrade. First 50 Shopify stores only."
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
            <section className="relative isolate grid items-center gap-10 overflow-hidden rounded-[2.75rem] py-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14 lg:px-10 lg:py-12">
              <div
                className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_24%_24%,_rgba(249,163,83,0.20),_transparent_34%),radial-gradient(circle_at_78%_18%,_rgba(251,189,132,0.34),_transparent_32%),linear-gradient(135deg,_rgba(253,247,226,0.82),_rgba(255,255,255,0.28)_48%,_rgba(253,247,226,0.58))]"
                aria-hidden="true"
              />
              <div
                className="absolute right-[10%] top-16 -z-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#FBBD84]/50 to-[#EC7709]/25 blur-2xl"
                aria-hidden="true"
              />
              <div
                className="absolute bottom-8 right-[20%] -z-10 h-24 w-72 -rotate-6 rounded-full bg-primary/10 blur-3xl"
                aria-hidden="true"
              />
              <Flame
                className="absolute bottom-16 left-[42%] -z-10 h-10 w-10 rotate-12 text-primary/10"
                aria-hidden="true"
              />

              <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
                <div className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide mb-6 shadow-lg shadow-primary/30">
                  <Flame className="w-4 h-4" aria-hidden="true" />
                  First {EARLY_ACCESS_STORE_CAP} stores only
                </div>

                <h1 className="text-4xl lg:text-6xl font-heading font-bold text-foreground mb-6 leading-[1.05]">
                  Join the Early Access
                  <br className="hidden sm:block" /> program
                </h1>

                <p className="text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed">
                  Only {EARLY_ACCESS_STORE_CAP} Shopify stores can join. Install
                  Bizmis free while Early Access is open, and keep your member
                  benefits when you upgrade.
                </p>

                <div className="flex flex-col items-center gap-4 lg:items-start">
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

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 text-sm">
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
                      Book a 30-min call with the founder
                    </a>
                  </div>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-none">
                <div
                  className="absolute inset-x-8 bottom-8 h-24 rounded-full bg-primary/25 blur-3xl"
                  aria-hidden="true"
                />
                <div
                  className="absolute left-6 right-6 top-16 h-56 rounded-full bg-[#FDF7E2] blur-3xl"
                  aria-hidden="true"
                />
                <img
                  src="/images/early-access-avatar.png"
                  alt="Bizmis Early Access invitation"
                  className="relative z-10 mx-auto w-full max-w-[18rem] object-contain drop-shadow-2xl lg:max-w-[22rem]"
                />
              </div>
            </section>

            <section
              aria-labelledby="benefits-heading"
              className="relative isolate mt-16 mb-14 overflow-hidden rounded-[2.75rem] border border-primary/10 bg-white/55 px-4 py-10 shadow-2xl shadow-primary/[0.08] ring-1 ring-white/80 backdrop-blur-sm sm:px-6 lg:px-8 lg:py-12"
            >
              <div
                className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_10%,_rgba(249,163,83,0.30),_transparent_28%),radial-gradient(circle_at_84%_12%,_rgba(251,189,132,0.34),_transparent_30%),linear-gradient(180deg,_rgba(253,247,226,0.92),_rgba(255,255,255,0.72)_52%,_rgba(253,247,226,0.74))]"
                aria-hidden="true"
              />
              <div
                className="absolute left-8 top-8 -z-10 h-36 w-36 rounded-full bg-primary/15 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="absolute bottom-8 right-8 -z-10 h-40 w-64 rounded-full bg-primary/15 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="absolute inset-x-10 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                aria-hidden="true"
              />
              <div className="mx-auto mb-10 max-w-2xl text-center lg:mb-12">
                <span className="mb-4 inline-flex items-center rounded-full border border-primary/15 bg-white/85 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary shadow-sm shadow-primary/10 backdrop-blur-sm">
                  Early Access benefits
                </span>
                <h2
                  id="benefits-heading"
                  className="text-4xl font-heading font-extrabold leading-none tracking-[-0.025em] text-foreground lg:text-5xl"
                >
                  <span>You'll</span> <span>get</span>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Hover each card to see what's included with your Early Access
                  benefits.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                {BENEFITS.map(({ icon: Icon, title, detail }) => (
                  <div
                    key={title}
                    className="group lg:min-h-[21rem] lg:[perspective:1000px]"
                  >
                    <div className="relative min-h-[16rem] overflow-hidden rounded-[2rem] border border-primary/10 bg-white p-6 shadow-xl shadow-primary/[0.08] ring-1 ring-white/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/15 lg:hidden">
                      <div
                        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,163,83,0.24),_transparent_44%),linear-gradient(180deg,_rgba(253,247,226,0.92),_rgba(255,255,255,0.96)_58%)]"
                        aria-hidden="true"
                      />
                      <div
                        className="absolute left-0 top-8 h-20 w-1.5 rounded-r-full bg-gradient-to-b from-[#EC7709] via-[#F9A353] to-[#FBBD84]"
                        aria-hidden="true"
                      />
                      <Icon
                        className="pointer-events-none absolute -right-7 -top-7 h-36 w-36 text-primary/[0.08]"
                        aria-hidden="true"
                      />
                      <div className="relative flex h-full flex-col">
                        <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <h3 className="mb-4 max-w-[12rem] text-[1.9rem] font-heading font-extrabold leading-[0.98] tracking-[-0.055em] text-foreground">
                          {title}
                        </h3>
                        <p className="mt-auto rounded-2xl bg-white/75 p-4 text-[15px] leading-relaxed text-muted-foreground shadow-sm ring-1 ring-primary/5 backdrop-blur-sm">
                          {detail}
                        </p>
                      </div>
                    </div>

                    <div className="relative hidden h-full min-h-[21rem] transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] lg:block">
                      <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-primary/10 bg-white p-6 shadow-xl shadow-primary/[0.08] ring-1 ring-white/80 transition-all duration-300 [backface-visibility:hidden] group-hover:shadow-2xl group-hover:shadow-primary/20">
                        <div
                          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,163,83,0.24),_transparent_44%),linear-gradient(180deg,_rgba(253,247,226,0.92),_rgba(255,255,255,0.96)_58%)]"
                          aria-hidden="true"
                        />
                        <div
                          className="absolute left-0 top-8 h-24 w-1.5 rounded-r-full bg-gradient-to-b from-[#EC7709] via-[#F9A353] to-[#FBBD84]"
                          aria-hidden="true"
                        />
                        <Icon
                          className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 text-primary/[0.08] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:text-primary/[0.13]"
                          aria-hidden="true"
                        />
                        <div className="relative flex h-full flex-col justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
                            <Icon className="h-6 w-6" aria-hidden="true" />
                          </div>
                          <h3 className="max-w-[11rem] text-[2.05rem] font-heading font-extrabold leading-[0.94] tracking-[-0.06em] text-foreground">
                            {title}
                          </h3>
                        </div>
                      </div>

                      <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-primary p-7 text-white shadow-2xl shadow-primary/25 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <div
                          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.24),_transparent_42%),linear-gradient(180deg,_rgba(251,189,132,0.24),_rgba(236,119,9,0.10)_62%)]"
                          aria-hidden="true"
                        />
                        <Icon
                          className="pointer-events-none absolute -right-7 -top-7 h-36 w-36 text-white/10"
                          aria-hidden="true"
                        />
                        <div className="relative flex h-full flex-col justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                            <Icon className="h-6 w-6" aria-hidden="true" />
                          </div>
                          <p className="text-lg font-heading font-bold leading-relaxed text-white">
                            {detail}
                          </p>
                        </div>
                      </div>
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
                        Book a founder call
                      </h3>
                      <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                        Get a 30-minute guided walkthrough before you install.
                      </p>
                    </div>
                  </div>
                </a>
              </div>
              <div className="mt-5 flex justify-center">
                <Button
                  variant="link"
                  asChild
                  className="text-muted-foreground"
                >
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
              Built founder-led. Questions?{" "}
              <a
                href="mailto:hello@bizmis.ai"
                className="text-foreground font-medium hover:underline"
              >
                hello@bizmis.ai
              </a>
            </p>

            <p className="text-center text-xs text-muted-foreground">
              *Free for Early Access members = a one-time 1,200 credits of live
              usage (~120 voice minutes), no renewal.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EarlyAccess;
