import type { ComponentType } from "react";
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

/** The payoff's words: its title alone. */
export const PanelCopy = ({ title, className }: { title: string; className?: string }) => (
  <div className={cn("sl-copy", className)}>
    <h3 className="sl-copy-title">{title}</h3>
  </div>
);
