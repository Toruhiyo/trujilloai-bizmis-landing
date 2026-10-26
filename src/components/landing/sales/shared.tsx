import type { ComponentType, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import BuyMockup from "./BuyMockup";
import type { Clock, MockupProps } from "./scene";
import FindMockup from "./FindMockup";
import TrustMockup from "./TrustMockup";

export { Sentinel } from "./scene";
export type { Clock, MockupProps } from "./scene";

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
  active = true,
  className,
}: {
  index: number;
  play?: boolean;
  clock?: Clock;
  active?: boolean;
  className?: string;
}) => {
  const Mockup = MOCKUPS[index];
  return (
    <div className={cn("sl-dev", DEVICE_CLASS[index], className)}>
      <Mockup play={play} clock={clock} active={active} />
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
  style,
  as: Tag = "h3",
}: {
  title: string;
  /** Its one line (none: the title alone). */
  body?: string;
  index?: number;
  /** A word over the title (its funnel stage), after the number if there is one. */
  kicker?: string;
  className?: string;
  style?: CSSProperties;
  as?: "h3" | "p";
}) => (
  <div className={cn("sl-copy", className)} style={style}>
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
    {body && <p className="sl-copy-body">{body}</p>}
  </div>
);
