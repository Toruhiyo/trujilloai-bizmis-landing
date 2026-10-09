import { useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A benefit as a card: icon and title up front, the body only on demand.
 * Hovering (mouse) or keyboard focus reveals it; a click or tap pins it open
 * or shut. The body opens smoothly below the title.
 */
const FeatureCard = ({
  icon: Icon,
  title,
  front,
  body,
  badge,
  className,
}: {
  icon: LucideIcon;
  title: string;
  /** A short line under the title while closed (e.g. a tagline). */
  front?: ReactNode;
  body: string;
  badge?: ReactNode;
  className?: string;
}) => {
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hover || pinned;

  return (
    <button
      type="button"
      aria-expanded={open}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
      // keyboard focus only: a tap also focuses, and must stay a pure toggle
      onFocus={(e) =>
        e.currentTarget.matches(":focus-visible") && setHover(true)
      }
      onBlur={() => setHover(false)}
      onClick={() => setPinned((p) => !p)}
      className={cn(
        "group relative flex w-full flex-col rounded-[20px] p-4 text-left ring-1 transition-[background-color,box-shadow,transform] duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bzl-orange)] sm:p-5",
        "bg-white",
        open
          ? "-translate-y-0.5 ring-[color-mix(in_oklab,var(--bzl-orange)_28%,transparent)] shadow-[0_22px_44px_-28px_rgba(236,119,9,0.45)]"
          : "ring-[var(--bzl-border)] shadow-[0_16px_38px_-30px_rgba(28,24,20,0.35)] hover:-translate-y-0.5",
        className,
      )}
      style={{ transitionTimingFunction: "var(--bzl-ease)" }}
    >
      <span className="flex w-full items-center gap-3">
        <span
          className={cn(
            "grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl transition-colors duration-500",
            open
              ? "bg-[var(--bzl-orange-strong)] text-white"
              : "bg-[var(--bzl-orange-wash)] text-[var(--bzl-orange-strong)]",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <span
          className={cn(
            "flex min-w-0 flex-1 flex-wrap items-center gap-2 text-[17px] font-bold leading-tight tracking-[-0.02em] transition-colors duration-500",
            open ? "text-[var(--bzl-orange-dark)]" : "text-[var(--bzl-fg)]",
          )}
        >
          {title}
          {badge}
        </span>
      </span>
      {front && (
        <span className="mt-3 text-[15px] leading-relaxed text-[var(--bzl-muted)]">
          {front}
        </span>
      )}
      {/* the body opens smoothly below (0fr → 1fr) */}
      <span
        className="grid transition-[grid-template-rows,opacity] duration-500"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transitionTimingFunction: "var(--bzl-ease)",
        }}
      >
        <span className="overflow-hidden">
          <span className="block pt-3 text-[15px] leading-relaxed text-[var(--bzl-ink-2)]">
            {body}
          </span>
        </span>
      </span>
    </button>
  );
};

export default FeatureCard;
