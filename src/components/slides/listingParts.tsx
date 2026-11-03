/**
 * Building blocks shared by the Shopify App Store listing slides (2026-11 retake).
 *
 * Same visual system as the April deck: orange eyebrow, heading-font title, muted
 * lead, half-wave bands around a typeset exchange, soft primary stains. Screenshots
 * sit in a plain rounded card: no fake browser bar, because the listing rules ask to
 * leave browser windows out of the images.
 */
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  HALF_WAVE_BAR_COUNT,
  halfWaveBarHeightPercent,
  halfWaveBarOpacity,
} from "./slideWaveformHeights";

export const Eyebrow = ({ Icon, children }: { Icon: IconType; children: ReactNode }) => (
  <div className="inline-flex items-center gap-2">
    <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
    <span className="text-sm font-body font-semibold uppercase tracking-widest text-primary">
      {children}
    </span>
  </div>
);

export const SlideTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-5xl font-heading font-bold leading-[1.12] text-foreground">{children}</h2>
);

export const SlideLead = ({ children }: { children: ReactNode }) => (
  <p className="max-w-[54ch] text-lg font-body leading-relaxed text-muted-foreground">{children}</p>
);

export const TitleBlock = ({
  Icon,
  eyebrow,
  title,
  lead,
}: {
  Icon: IconType;
  eyebrow: ReactNode;
  title: ReactNode;
  lead: ReactNode;
}) => (
  <div className="flex flex-col gap-3">
    <Eyebrow Icon={Icon}>{eyebrow}</Eyebrow>
    <SlideTitle>{title}</SlideTitle>
    <SlideLead>{lead}</SlideLead>
  </div>
);

export const Chip = ({ Icon, children }: { Icon: IconType; children: ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-4 py-2 text-sm font-heading font-semibold text-primary-dark backdrop-blur-md">
    <Icon className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
    {children}
  </span>
);

/** A chip followed by the small "remembered" notes the agent keeps, as on the April slides. */
export const ToolChip = ({
  Icon,
  label,
  NoteIcon,
  notes,
}: {
  Icon: IconType;
  label: string;
  NoteIcon?: IconType;
  notes?: readonly string[];
}) => (
  <div className="flex flex-wrap items-center gap-2 self-start">
    <Chip Icon={Icon}>{label}</Chip>
    {notes && notes.length > 0 && (
      <span className="inline-flex flex-wrap items-center gap-1.5 text-xs font-body text-muted-foreground">
        {NoteIcon && <NoteIcon className="h-3 w-3 shrink-0 text-primary/50" aria-hidden />}
        {notes.map((note, i) => (
          <span key={note} className="inline-flex items-center gap-1.5">
            {i > 0 && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />}
            {note}
          </span>
        ))}
      </span>
    )}
  </div>
);

/** What the shopper says: right-aligned, lighter. */
export const ShopperLine = ({ children }: { children: ReactNode }) => (
  <p className="max-w-[86%] self-end text-right font-body text-xl leading-snug text-foreground/55">
    {children}
  </p>
);

/** What the Bizmis sales agent says: left-aligned, bold. */
export const AgentLine = ({ children }: { children: ReactNode }) => (
  <p className="max-w-[90%] self-start font-heading text-[1.3rem] font-bold leading-relaxed text-foreground/80">
    {children}
  </p>
);

export const Accent = ({ children }: { children: ReactNode }) => (
  <strong className="font-extrabold text-primary-dark/85">{children}</strong>
);

export const Strong = ({ children }: { children: ReactNode }) => (
  <strong className="font-semibold text-foreground">{children}</strong>
);

const HalfWave = ({ flip = false }: { flip?: boolean }) => (
  <div
    className={`pointer-events-none flex h-12 w-full shrink-0 items-end gap-[2px] ${flip ? "scale-y-[-1]" : ""}`}
    aria-hidden
  >
    {Array.from({ length: HALF_WAVE_BAR_COUNT }).map((_, i) => (
      <div
        key={i}
        className="min-w-[2px] max-w-[6px] flex-1 rounded-full bg-primary/10"
        style={{
          height: `${halfWaveBarHeightPercent(i, flip ? "bottom" : "top")}%`,
          opacity: halfWaveBarOpacity(i),
        }}
      />
    ))}
  </div>
);

/** A typeset exchange between two half-wave bands, on a soft primary glow. */
export const Exchange = ({ children }: { children: ReactNode }) => (
  <div className="relative flex min-h-0 w-full min-w-0 flex-col overflow-visible">
    <HalfWave />
    <div className="relative flex min-h-0 flex-1 flex-col justify-center py-5">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[95%] min-h-[200px] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.16] blur-[60px]"
        aria-hidden
      />
      <div className="relative z-10 flex flex-col gap-5">{children}</div>
    </div>
    <HalfWave flip />
  </div>
);

/**
 * A screenshot in a rounded card; `position` picks which part of the image stays in view.
 * The caller sets the card's own positioning (`relative` or `absolute`) in `className`.
 */
export const ShotCard = ({
  src,
  alt,
  className = "",
  position = "top",
}: {
  src: string;
  alt: string;
  className?: string;
  position?: string;
}) => (
  <div
    className={`overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_40px_-8px_rgba(0,0,0,0.15)] ${className}`}
  >
    <img
      src={src}
      alt={alt}
      className="block h-full w-full object-cover"
      style={{ objectPosition: position }}
    />
  </div>
);

export const Stains = () => (
  <>
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[120%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.09] blur-[80px]"
      aria-hidden
    />
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.10] blur-[50px]"
      aria-hidden
    />
  </>
);

export const FeatureCard = ({
  Icon,
  title,
  children,
}: {
  Icon: IconType;
  title: string;
  children: ReactNode;
}) => (
  <div className="flex items-start gap-4 rounded-2xl border border-black/[0.06] bg-white/70 px-5 py-4 backdrop-blur-md">
    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
      <Icon className="h-4 w-4 text-primary" aria-hidden />
    </span>
    <div className="flex flex-col gap-0.5">
      <span className="text-base font-heading font-bold text-foreground">{title}</span>
      <span className="text-sm font-body leading-snug text-muted-foreground">{children}</span>
    </div>
  </div>
);
