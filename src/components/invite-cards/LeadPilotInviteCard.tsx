import { useId } from "react";
import { TrendingUp, Headphones, BarChart3, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeadPilotInviteData } from "@/data/leadPilotInviteTypes";
import { PILOT_INVITE_TERMS, resolveLogoColorOverlay, resolveStoreNameTextColor } from "@/data/leadPilotInviteTypes";

const BIZMIS_LOGO_WHITE = "/images/bizmis-logo-white-transparent.png";

/* ------------------------------------------------------------------ */
/*  Subtle grain overlay                                              */
/* ------------------------------------------------------------------ */

function Grain({ opacity = 0.38, className }: { opacity?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={cn("pointer-events-none absolute inset-0 h-full w-full mix-blend-overlay", className)} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <filter id={`g-${id}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#g-${id})`} opacity={opacity} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Store logo — optional solid-color overlay (mask) for contrast     */
/* ------------------------------------------------------------------ */

function StoreLogo({ lead, className }: { lead: LeadPilotInviteData; className?: string }) {
  const overlay = resolveLogoColorOverlay(lead);
  const src = lead.logoImagePath;

  if (!overlay) {
    return <img src={src} alt="" className={cn("h-10 max-w-[11rem] object-contain object-left md:h-12", className)} />;
  }

  return (
    <div
      className={cn("h-10 w-[11rem] md:h-12", className)}
      style={{
        backgroundColor: overlay,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "left center",
        maskPosition: "left center",
      }}
      aria-hidden
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Split co-branded banner: store left | diagonal | bizmis right     */
/* ------------------------------------------------------------------ */

function SplitBanner({ lead }: { lead: LeadPilotInviteData }) {
  const sec = lead.secondaryColor ?? lead.primaryColor;
  const storeGradient = `linear-gradient(135deg, ${sec} 0%, ${lead.primaryColor} 100%)`;

  return (
    <div className="relative h-20 overflow-hidden md:h-24">
      {/* Store half */}
      <div className="absolute inset-0" style={{ background: storeGradient }} />

      {/* Bizmis half with diagonal cut */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="bizmis-banner" x1="1" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary-light))" />
            <stop offset="50%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary-dark))" />
          </linearGradient>
        </defs>
        <path d="M340,0 L300,100 L600,100 L600,0 Z" fill="url(#bizmis-banner)" />
      </svg>

      <Grain opacity={0.3} className="z-[2]" />

      {/* Store logo */}
      <div className="absolute left-5 top-1/2 z-10 -translate-y-1/2 md:left-7">
        <StoreLogo lead={lead} className="drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]" />
      </div>

      {/* × icon at the diagonal seam */}
      <div
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 font-heading text-2xl font-black leading-none text-white md:text-3xl"
        style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.25))" }}
        aria-hidden
      >
        &#x2716;
      </div>

      {/* Bizmis lockup */}
      <a
        href="https://bizmis.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-5 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2 md:right-7"
      >
        <img src={BIZMIS_LOGO_WHITE} alt="" className="h-8 w-auto drop-shadow-[0_1px_6px_rgba(0,0,0,0.3)] md:h-9" />
        <span
          className="font-heading text-lg font-extrabold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.3)] md:text-xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          bizmis
        </span>
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated waveform for the storefront demo                         */
/* ------------------------------------------------------------------ */

const WAVEFORM_DELAYS = [0, 0.12, 0.24, 0.1, 0.2];

function DemoWaveform({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-[2px]", className)} aria-hidden>
      {WAVEFORM_DELAYS.map((delay, i) => (
        <div
          key={i}
          className={cn("w-[2px] rounded-full", light ? "bg-white/70" : "bg-primary")}
          style={{
            height: "10px",
            animation: "invite-waveform-bar 0.8s ease-in-out infinite",
            animationDelay: `${delay}s`,
            transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Storefront demo mockup — the hero visual                          */
/* ------------------------------------------------------------------ */

function StorefrontDemo({ lead }: { lead: LeadPilotInviteData }) {
  const productImages = [lead.productAImagePath, lead.productBImagePath, lead.productCImagePath];

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)]">
      {/* Browser chrome */}
      <div className="flex items-center justify-between border-b border-border/30 bg-[#f8f8f8] px-3 py-1.5">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1" aria-hidden>
            <div className="h-[7px] w-[7px] rounded-full bg-[#FF5F57]" />
            <div className="h-[7px] w-[7px] rounded-full bg-[#FEBC2E]" />
            <div className="h-[7px] w-[7px] rounded-full bg-[#28C840]" />
          </div>
          <span className="font-body text-[0.6rem] text-foreground/50">{lead.storeDomain}</span>
        </div>
        <span className="font-body text-[0.55rem] font-medium text-primary/80">Voice shopping assistant</span>
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-2 gap-3 p-3 md:gap-4 md:p-4">
        {/* Left: voice interaction */}
        <div className="flex flex-col gap-2.5">
          {/* Shopper prompt bubble */}
          <div className="rounded-lg rounded-bl-sm bg-foreground/[0.04] px-2.5 py-2">
            <p className="font-body text-[0.65rem] leading-relaxed text-foreground/70">
              {lead.demoShopperPrompt}
            </p>
          </div>

          {/* Voice state pill with waveform */}
          <div className="flex">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span className="font-body text-[0.55rem] font-semibold text-primary">Listening</span>
              <DemoWaveform />
            </div>
          </div>

          {/* Bizmis reply bubble */}
          <div className="rounded-lg rounded-tl-sm bg-primary/[0.06] px-2.5 py-2 ring-1 ring-primary/10">
            <p className="mb-0.5 font-heading text-[0.5rem] font-bold text-primary">bizmis</p>
            <p className="font-body text-[0.65rem] leading-relaxed text-foreground/70">
              {lead.demoBizmisReply}
            </p>
          </div>
        </div>

        {/* Right: product recommendations */}
        <div className="flex flex-col gap-2">
          {lead.demoProducts.map((product, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg p-1.5 ring-1 ring-border/40">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-1">
                <img src={productImages[i]} alt="" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-body text-[0.6rem] font-semibold text-foreground/80">{product.title}</p>
                <p className="font-body text-[0.55rem] text-foreground/50">{product.price}</p>
                <span className="mt-0.5 inline-block rounded-full bg-primary/[0.08] px-1.5 py-px font-body text-[0.5rem] font-medium text-primary">
                  {product.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with Bizmis widget anchor */}
      <div className="flex items-center justify-between border-t border-border/20 bg-[#fafafa] px-3 py-2">
        {lead.demoFooterLine ? (
          <p className="font-body text-[0.55rem] italic text-foreground/40">{lead.demoFooterLine}</p>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-1.5 rounded-full bg-foreground px-2.5 py-1 shadow-sm">
          <img src={BIZMIS_LOGO_WHITE} alt="" className="h-3 w-3 object-contain" />
          <DemoWaveform light />
          <span className="font-body text-[0.5rem] font-medium text-white">Ask by voice</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Outcome strip: Sell more · Support faster · Learn from sessions   */
/* ------------------------------------------------------------------ */

const OUTCOMES = [
  { Icon: TrendingUp, label: "Sell more" },
  { Icon: Headphones, label: "Support faster" },
  { Icon: BarChart3, label: "Learn from sessions" },
] as const;

function OutcomeStrip({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap justify-center gap-x-5 gap-y-1", className)}>
      {OUTCOMES.map(({ Icon, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={2} aria-hidden />
          <span className="font-body text-xs font-medium text-foreground/70">{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main card                                                         */
/* ------------------------------------------------------------------ */

export interface LeadPilotInviteCardProps {
  lead: LeadPilotInviteData;
  className?: string;
}

const LeadPilotInviteCard = ({ lead, className }: LeadPilotInviteCardProps) => {
  const { pilotDays, storeCap, shopifyAppUrl } = PILOT_INVITE_TERMS;
  const storeTextColor = resolveStoreNameTextColor(lead);

  return (
    <article
      className={cn(
        "w-full max-w-[34rem] overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_24px_60px_-16px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      {/* ---- SPLIT BANNER ---- */}
      <SplitBanner lead={lead} />

      {/* ---- BODY ---- */}
      <div className="space-y-4 px-6 pb-6 pt-5 md:px-8">
        {/* Eyebrow */}
        <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Private pilot invite for{" "}
          <span style={{ color: storeTextColor }}>{lead.storeName}</span>
        </p>

        {/* Headline */}
        <h2 className="font-heading text-xl font-bold leading-snug tracking-tight text-foreground md:text-[1.4rem]">
          Bring a voice-first store clerk to your Shopify store.
        </h2>

        {/* Subline */}
        <p className="font-body text-[0.82rem] leading-relaxed text-muted-foreground">
          Greets shoppers, recommends products, answers support questions, and helps more visitors buy.
        </p>

        {/* Micro-badges */}
        <div className="flex flex-wrap gap-2">
          {[
            `${pilotDays}-day founding pilot`,
            "No commitment",
            `${storeCap} stores only`,
          ].map((text) => (
            <span
              key={text}
              className="inline-flex rounded-full border border-border px-3 py-1 font-body text-[0.65rem] font-medium text-foreground/70"
            >
              {text}
            </span>
          ))}
        </div>

        {/* Primary CTA */}
        <div className="text-center">
          <a
            href={shopifyAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 font-body text-sm font-semibold text-white shadow-sm transition-colors hover:bg-foreground/90"
          >
            Reserve pilot spot
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </a>
        </div>

        {/* Storefront demo mockup */}
        <StorefrontDemo lead={lead} />

        {/* Outcome strip */}
        <OutcomeStrip />

        {/* Micro-copy */}
        <p className="text-center font-body text-xs leading-relaxed text-muted-foreground">
          Founding pilot stores get direct access to us and real roadmap input.
        </p>

        {/* Footer */}
        <div className="space-y-0.5 pt-1 text-center">
          <p className="font-body text-[0.7rem] text-muted-foreground/60">
            Questions? Just reply to this email.
          </p>
          <a
            href="https://bizmis.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-[0.6rem] text-muted-foreground/40 hover:underline"
          >
            bizmis.ai
          </a>
        </div>
      </div>
    </article>
  );
};

export default LeadPilotInviteCard;
