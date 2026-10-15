import { Rewind } from "lucide-react";
import { cn } from "@/lib/utils";
import "@/styles/rewind-sign.css";

/**
 * The rewind sign (◀◀), shown only while a loop rewinds (useRewindLoop's
 * `rewinding`), so a looping animation running backwards reads as a rewind,
 * not a glitch. Two hands, as the page draws:
 *
 * - RewindMark: in marker, for the marker moments (PillarMoments): two
 *   outlined triangles, thick round strokes in the moment's ink, drawn in as
 *   the rewind starts. It sits in its parent's bottom-right corner (the
 *   parent is positioned).
 * - RewindIcon: a clean UI sign, for the device and widget mockups: the
 *   icon in a frosted ink disc, centred over the mockup, like a player's.
 */
export const RewindMark = ({ on, className }: { on: boolean; className?: string }) => (
  <svg
    className={cn("bzl-rw-mark", on && "is-on", className)}
    viewBox="0 0 64 36"
    aria-hidden="true"
  >
    <path d="M29.5 5.2 L6.4 17.6 L29.8 30.6 Z" pathLength={1} />
    <path d="M56.6 4.8 L33.6 18.1 L57 30.2 Z" pathLength={1} />
  </svg>
);

export const RewindIcon = ({ on, className }: { on: boolean; className?: string }) => (
  <span className={cn("bzl-rw-icon", on && "is-on", className)} aria-hidden="true">
    <Rewind className="h-[45%] w-[45%] fill-current" strokeWidth={1.5} />
  </span>
);
