/**
 * Building blocks shared by the Shopify App Store listing slides (2026-11 retake).
 *
 * Landing v2's look (2026-11-04): its section head (pill eyebrow, Inter 800 title in
 * the warm ink, muted lead), Inter throughout, white feature cards on a cream disc,
 * and the April deck's half-wave bands around a typeset exchange. Screenshots
 * sit in a plain rounded card: no fake browser bar, because the listing rules ask to
 * leave browser windows out of the images.
 */
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import type { LucideIcon } from "lucide-react";
import {
  HALF_WAVE_BAR_COUNT,
  halfWaveBarHeightPercent,
  halfWaveBarOpacity,
} from "./slideWaveformHeights";

/** Landing v2's ink and muted text (film-landing.css --bzl-fg, --bzl-muted). */
export const INK = "#3b2416";
export const MUTED = "#75695e";
const INTER = { fontFamily: "Inter, sans-serif" };

/**
 * Landing v2's section head (SectionHead, film-landing.css .bzl-shead): a centred
 * white pill (line icon on a cream disc, the area's name), the title in Inter 800
 * with tight tracking, and the muted lead under it.
 */
export const LandingHead = ({
  Icon,
  eyebrow,
  title,
  lead,
}: {
  Icon: LucideIcon;
  eyebrow: string;
  title: ReactNode;
  lead: ReactNode;
}) => (
  <div className="flex flex-col items-center gap-4 text-center" style={INTER}>
    <p
      className="inline-flex items-center gap-[0.6em] whitespace-nowrap rounded-full bg-white py-[0.38em] pl-[0.38em] pr-[1.15em] text-[1.2rem] font-bold leading-[1.1] tracking-[-0.02em]"
      style={{ color: INK, boxShadow: "inset 0 0 0 1px rgb(59 36 22 / 0.09)" }}
    >
      <span className="grid aspect-square w-[2.3em] place-items-center rounded-full bg-[#fff3e7] text-primary">
        <Icon className="h-[56%] w-[56%]" strokeWidth={2} />
      </span>
      {eyebrow}
    </p>
    <h2 className="m-0 text-[4.6rem] font-extrabold leading-none tracking-[-0.05em]" style={{ color: INK }}>
      {title}
    </h2>
    <p className="m-0 max-w-[78rem] text-[1.45rem] leading-[1.45] tracking-[-0.005em]" style={{ color: MUTED }}>
      {lead}
    </p>
  </div>
);

export const Chip = ({ Icon, children }: { Icon: IconType; children: ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary-dark backdrop-blur-md" style={INTER}>
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
      <span className="inline-flex flex-wrap items-center gap-1.5 text-xs" style={{ ...INTER, color: MUTED }}>
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
  <p className="max-w-[86%] self-end text-right text-xl leading-snug" style={{ ...INTER, color: `${INK}8c` }}>
    {children}
  </p>
);

/** What the Bizmis sales agent says: left-aligned, bold. */
export const AgentLine = ({ children }: { children: ReactNode }) => (
  <p className="max-w-[92%] self-start text-[1.3rem] font-bold leading-relaxed tracking-[-0.01em]" style={{ ...INTER, color: `${INK}d9` }}>
    {children}
  </p>
);

export const Accent = ({ children }: { children: ReactNode }) => (
  <strong className="font-extrabold text-primary-dark/85">{children}</strong>
);

export const Strong = ({ children }: { children: ReactNode }) => (
  <strong className="font-semibold" style={{ color: INK }}>{children}</strong>
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
  <div
    className="flex items-start gap-4 rounded-2xl bg-white px-5 py-4 shadow-[0_10px_30px_-16px_rgba(59,36,22,0.25)]"
    style={{ ...INTER, boxShadow: "inset 0 0 0 1px rgb(59 36 22 / 0.07), 0 10px 30px -16px rgb(59 36 22 / 0.25)" }}
  >
    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff3e7]">
      <Icon className="h-4 w-4 text-primary" aria-hidden />
    </span>
    <div className="flex flex-col gap-0.5">
      <span className="text-[1.05rem] font-bold tracking-[-0.01em]" style={{ color: INK }}>
        {title}
      </span>
      <span className="text-sm leading-snug" style={{ color: MUTED }}>
        {children}
      </span>
    </div>
  </div>
);
