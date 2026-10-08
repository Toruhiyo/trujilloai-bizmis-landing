import type { CSSProperties } from "react";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Bar heights of the speaking wave, in px.
const BARS = [6, 12, 18, 10, 22, 14, 8, 16, 24, 12, 18, 9, 14, 20, 11, 7, 15, 10];

/**
 * Bizmis answering out loud. Shoppers may type, but Bizmis replies by voice,
 * so its side of a conversation is a speaking wave, never a paragraph of text.
 * The words stay available to screen readers.
 */
const VoiceReply = ({
  transcript,
  seconds,
  compact = false,
  className,
}: {
  /** What the agent says (read to screen readers only). */
  transcript: string;
  seconds?: number;
  compact?: boolean;
  className?: string;
}) => (
  <div
    className={cn(
      "flex w-fit items-center gap-2.5 rounded-full bg-[var(--bzl-orange-wash)] text-[var(--bzl-orange-dark)] ring-1 ring-[color-mix(in_oklab,var(--bzl-orange)_25%,transparent)]",
      compact ? "px-2.5 py-1.5" : "px-3.5 py-2.5",
      className
    )}
  >
    <Volume2 className={cn("flex-shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} aria-hidden="true" />
    <span className="flex items-center gap-[3px]" aria-hidden="true">
      {(compact ? BARS.slice(0, 11) : BARS).map((h, i) => (
        <i
          key={i}
          className="bzl-voice-bar w-[3px] rounded-full bg-[var(--bzl-orange-strong)]"
          style={{ height: compact ? Math.round(h * 0.6) : h, "--bzl-delay": `${(i % 6) * 110}ms` } as CSSProperties}
        />
      ))}
    </span>
    {seconds !== undefined && (
      <span className={cn("font-semibold tabular-nums", compact ? "text-[11px]" : "text-xs")} aria-hidden="true">
        0:{String(seconds).padStart(2, "0")}
      </span>
    )}
    <span className="sr-only">{transcript}</span>
  </div>
);

export default VoiceReply;
