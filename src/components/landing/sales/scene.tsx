import { forwardRef } from "react";

/* The pieces a beat's mockup and funnel share with SalesC. Kept apart from
   shared.tsx, which imports the mockups: importing it back from a mockup was a
   cycle that could crash the section on load. */

/**
 * The box a scene's timeline watches (useScene): it covers the scene, and
 * `off` hides it, which the loop reads as "out of view" (reset to the start).
 * The scene's root needs `position: relative`.
 */
export const Sentinel = forwardRef<HTMLSpanElement, { off?: boolean }>(({ off }, ref) => (
  <span ref={ref} hidden={off} aria-hidden="true" className="pointer-events-none absolute inset-0" />
));
Sentinel.displayName = "Sentinel";

/** A beat's clock (one useScene shared by its mockup and its funnel): ms along its timeline. */
export type Clock = { t: number };
/** What a mockup takes: its own loop gated by `play`, or its beat's shared `clock` instead. */
export type MockupProps = {
  play?: boolean;
  clock?: Clock;
  /** Its beat is the one showing: mount the live 3D heads (default true; a pinned stage passes false for the others). */
  active?: boolean;
};
