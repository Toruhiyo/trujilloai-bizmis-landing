import { useId, type CSSProperties } from "react";
import { ArrowRight, TrendingUp, ShoppingCart, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeadPilotInviteData } from "@/data/leadPilotInviteTypes";
import { PILOT_INVITE_TERMS } from "@/data/leadPilotInviteTypes";

const HERO_AVATAR = "/images/hero-avatar-1.png";
const BIZMIS_LOGO_WHITE = "/images/bizmis-logo-white-transparent.png";

/* ------------------------------------------------------------------ */
/*  Noise grain (reusable SVG filter, Bizmis brand texture)           */
/* ------------------------------------------------------------------ */

function Grain({ opacity = 0.38, className }: { opacity?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full mix-blend-overlay", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <filter id={`g-${id}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#g-${id})`} opacity={opacity} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Bold cross SVG – thick, edgy, no rounding                         */
/* ------------------------------------------------------------------ */

function BoldCross({ size = 40, className, style }: { size?: number; className?: string; style?: CSSProperties }) {
  const t = size * 0.28;
  const half = (size - t) / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden
    >
      <path d={`M${half},0 h${t} v${half} h${half} v${t} h-${half} v${half} h-${t} v-${half} h-${half} v-${t} h${half}z`} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Paint-clash header background with SVG wave boundary              */
/* ------------------------------------------------------------------ */

function PaintClash({ lead }: { lead: LeadPilotInviteData }) {
  const sec = lead.secondaryColor ?? lead.primaryColor;
  const storeGradient = `linear-gradient(135deg, ${sec} 0%, ${lead.primaryColor} 50%, ${lead.primaryColor} 100%)`;

  return (
    <>
      <div className="absolute inset-0" style={{ background: storeGradient }} />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 600 220"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="bizmis-paint" x1="1" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="hsl(35 95% 72%)" />
            <stop offset="40%" stopColor="hsl(29 93% 58%)" />
            <stop offset="100%" stopColor="hsl(25 90% 46%)" />
          </linearGradient>
        </defs>
        <path
          d="M340,0 C310,40 290,80 310,120 C330,160 300,200 280,220 L600,220 L600,0 Z"
          fill="url(#bizmis-paint)"
        />
        <path
          d="M360,0 C330,50 320,90 335,130 C350,165 325,195 310,220 L600,220 L600,0 Z"
          fill="url(#bizmis-paint)"
          opacity="0.5"
        />
      </svg>

      <Grain opacity={0.45} className="z-[2]" />
      <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-b from-black/5 via-transparent to-black/15" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Pilot term pills — Bizmis-branded, urgency-driven                 */
/* ------------------------------------------------------------------ */

function PilotTermsPills({ className }: { className?: string }) {
  const { pilotDays, shopperCap, storeCap } = PILOT_INVITE_TERMS;
  const pill =
    "inline-flex items-center rounded-full bg-gradient-to-r from-primary via-primary to-[hsl(25_90%_48%)] px-3 py-1.5 font-body text-[0.6rem] font-bold uppercase tracking-[0.1em] text-primary-foreground shadow-[0_2px_10px_hsl(29_93%_45%_/_0.3)]";
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      <span className={pill}>100% free for {pilotDays} days</span>
      <span className={pill}>{shopperCap.toLocaleString()} shoppers</span>
      <span className={cn(pill, "!from-[hsl(25_90%_38%)] !via-[hsl(25_90%_38%)] !to-[hsl(25_85%_30%)] shadow-[0_2px_10px_hsl(25_85%_30%_/_0.4)]")}>
        only {storeCap} spots
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product + Avatar montage — avatar dominates                       */
/* ------------------------------------------------------------------ */

function ProductAvatarMontage({ lead }: { lead: LeadPilotInviteData }) {
  const products = [lead.productAImagePath, lead.productBImagePath, lead.productCImagePath];

  const tileBg = (idx: number): CSSProperties => ({
    background: `linear-gradient(180deg, white 0%, color-mix(in srgb, ${lead.primaryColor} ${5 + idx * 2}%, white) 100%)`,
  });

  return (
    <div className="relative flex items-end gap-3">
      <div className="flex flex-col gap-2">
        {products.map((src, i) => (
          <div
            key={i}
            className="flex h-[4.2rem] w-[4.2rem] items-center justify-center overflow-hidden rounded-xl shadow-[0_6px_20px_-4px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] sm:h-[4.8rem] sm:w-[4.8rem]"
            style={tileBg(i)}
          >
            <img src={src} alt="" className="h-full w-full object-contain p-1.5" />
          </div>
        ))}
      </div>

      <div className="relative -mb-1 flex-1">
        <img
          src={HERO_AVATAR}
          alt=""
          className="mx-auto h-[16rem] w-auto object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:h-[18rem] md:h-[20rem]"
        />
        <div className="absolute bottom-0 left-1/2 h-[14px] w-[55%] -translate-x-1/2 rounded-[50%] bg-black/10 blur-md" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Value proposition block                                           */
/* ------------------------------------------------------------------ */

const VALUE_BENEFITS = [
  { Icon: TrendingUp, text: "Convert more browsers into confident buyers" },
  { Icon: ShoppingCart, text: "Increase average order value with smart upsells" },
  { Icon: Clock, text: "Save hours on support while earning loyal customers" },
] as const;

function ValuePropBlock() {
  return (
    <div className="space-y-2.5">
      <p className="font-heading text-sm font-bold text-foreground">
        Boost profits, selling the human way.
      </p>
      <div className="space-y-1.5">
        {VALUE_BENEFITS.map(({ Icon, text }) => (
          <div key={text} className="flex items-start gap-2.5">
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="font-body text-[0.8rem] leading-snug text-muted-foreground">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Physical coupon ticket                                            */
/* ------------------------------------------------------------------ */

function CouponTicket({ code, className }: { code: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-primary/20 bg-[#FFF7ED]", className)}>
      <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-primary via-primary to-[hsl(25_90%_48%)]" />
      <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-b from-primary via-primary to-[hsl(25_90%_48%)]" />
      <div className="absolute inset-x-3 top-0 h-px border-t-2 border-dashed border-primary/30" />
      <div className="absolute inset-x-3 bottom-0 h-px border-b-2 border-dashed border-primary/30" />
      <div className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-card" />
      <div className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-card" />

      <div className="px-8 py-5 text-center">
        <p className="font-body text-[0.6rem] font-bold uppercase tracking-[0.15em] text-primary-dark">
          Your exclusive free pilot code
        </p>
        <p className="mt-1.5 font-heading text-[1.4rem] font-extrabold tracking-[0.06em] text-foreground md:text-[1.6rem]">
          {code}
        </p>
        <p className="mt-1 font-body text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-primary">
          100% free &mdash; no credit card required
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Default invite body copy — urgency + roadmap influence            */
/* ------------------------------------------------------------------ */

function DefaultInviteBody({ lead }: { lead: LeadPilotInviteData }) {
  const { storeCap } = PILOT_INVITE_TERMS;
  return (
    <div className="space-y-3">
      <p className="font-body text-[0.82rem] leading-relaxed text-muted-foreground">
        Bizmis is a voice-powered sales clerk that knows your catalog inside out. Not a chatbot &mdash;
        a natural, human-like shopping assistant that converts browsers into confident buyers.
      </p>
      <p className="font-body text-[0.82rem] font-semibold leading-relaxed text-foreground">
        As a founding pilot store, you&apos;ll directly shape our product roadmap.
        Build the voice commerce tool that fits{" "}
        <span className="text-primary">{lead.storeName}</span>&apos;s customers and brand.
      </p>
      <p className="font-body text-[0.75rem] font-bold uppercase tracking-wide text-primary-dark">
        Only {storeCap} spots available &mdash; first come, first served.
      </p>
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
  return (
    <article
      className={cn(
        "w-full max-w-[36rem] overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_28px_70px_-16px_rgba(0,0,0,0.2)]",
        className,
      )}
    >
      {/* ---- PAINT-CLASH HEADER ---- */}
      <div className="relative h-[13.5rem] overflow-hidden md:h-[14.5rem]">
        <PaintClash lead={lead} />

        <img
          src={lead.logoImagePath}
          alt=""
          className="absolute left-5 top-5 z-10 h-10 max-w-[min(9rem,36vw)] object-contain object-left drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] md:left-7 md:top-6 md:h-12"
        />

        <div className="absolute right-4 top-4 z-10 flex items-center gap-2 md:right-6 md:top-5">
          <img
            src={BIZMIS_LOGO_WHITE}
            alt=""
            className="h-8 w-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] md:h-10"
          />
          <span
            className="font-heading text-xl font-extrabold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] md:text-2xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            bizmis
          </span>
        </div>

        <BoldCross
          size={44}
          className="absolute left-1/2 top-[52%] z-20 -translate-x-1/2 -translate-y-1/2 text-white md:top-[50%]"
          style={{
            filter: "drop-shadow(0 3px 14px rgba(0,0,0,0.55)) drop-shadow(0 0 28px rgba(0,0,0,0.25))",
          }}
        />
      </div>

      {/* ---- BODY ---- */}
      <div className="relative space-y-5 px-6 pb-7 pt-5 md:px-8 md:pb-8 md:pt-6">
        <Grain opacity={0.12} className="z-0" />

        {/* Headline */}
        <div className="relative z-10">
          <h2 className="font-heading text-[1.35rem] font-extrabold leading-[1.15] tracking-tight text-foreground md:text-[1.55rem]">
            Team{" "}
            <span className="text-primary">{lead.storeName}</span>
            , you&apos;re invited to a{" "}
            <span className="whitespace-nowrap">
              <span className="underline decoration-primary decoration-2 underline-offset-2">free</span> exclusive
            </span>{" "}
            Bizmis pilot.
          </h2>
        </div>

        <PilotTermsPills className="relative z-10" />

        <div className="relative z-10">
          <ProductAvatarMontage lead={lead} />
        </div>

        <div className="relative z-10">
          <ValuePropBlock />
        </div>

        <div className="relative z-10">
          {lead.content.trim().length > 0 ? (
            <div
              className="font-body text-sm leading-relaxed text-foreground [&_a]:text-primary [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: lead.content }}
            />
          ) : (
            <DefaultInviteBody lead={lead} />
          )}
        </div>

        <div className="relative z-10">
          <CouponTicket code={lead.couponCode} />
        </div>

        <div className="relative z-10 text-center">
          <a
            href={PILOT_INVITE_TERMS.shopifyAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary via-primary to-[hsl(25_90%_48%)] px-8 py-3.5 font-body text-sm font-bold text-primary-foreground shadow-[0_4px_16px_hsl(29_93%_45%_/_0.35)] transition-all hover:shadow-[0_6px_24px_hsl(29_93%_45%_/_0.45)]"
          >
            Claim Your Free Pilot
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <p className="relative z-10 text-center font-body text-xs text-muted-foreground">
          Questions? Just reply to this email.
        </p>
      </div>
    </article>
  );
};

export default LeadPilotInviteCard;
