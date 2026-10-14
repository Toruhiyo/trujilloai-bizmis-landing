import { forwardRef } from "react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import BuyMockup from "./BuyMockup";
import FindMockup from "./FindMockup";
import TrustMockup from "./TrustMockup";

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
export type MockupProps = { play?: boolean; clock?: Clock };

/** The three moments, in title order: find it, trust it, buy it. */
const MOCKUPS: ComponentType<MockupProps>[] = [
  FindMockup,
  TrustMockup,
  BuyMockup,
];

/** Each device's box: sized so it never outgrows the screen under the nav. */
const DEVICE_CLASS = ["sl-dev-find", "sl-dev-trust", "sl-dev-buy"];

/** A mockup in its device box. */
export const Device = ({
  index,
  play,
  clock,
  className,
}: {
  index: number;
  play?: boolean;
  clock?: Clock;
  className?: string;
}) => {
  const Mockup = MOCKUPS[index];
  return (
    <div className={cn("sl-dev", DEVICE_CLASS[index], className)}>
      <Mockup play={play} clock={clock} />
    </div>
  );
};

/** A sub-benefit's words: its short merchant-side title and one line. */
export const PanelCopy = ({
  title,
  body,
  index,
  kicker,
  className,
  as: Tag = "h3",
}: {
  title: string;
  body: string;
  index?: number;
  /** A word over the title (its funnel stage), after the number if there is one. */
  kicker?: string;
  className?: string;
  as?: "h3" | "p";
}) => (
  <div className={cn("sl-copy", className)}>
    {kicker !== undefined ? (
      <span className="sl-copy-kicker">
        {index !== undefined && (
          <span className="sl-copy-kicker-num" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        {kicker}
      </span>
    ) : (
      index !== undefined && (
        <span className="sl-copy-num" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
      )
    )}
    <Tag className="sl-copy-title">{title}</Tag>
    <p className="sl-copy-body">{body}</p>
  </div>
);
