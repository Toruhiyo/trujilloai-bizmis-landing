import { forwardRef } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { HeadCircle } from "../../BizmisWidget";
import { STAGE_HEADS } from "./model";

/**
 * The agent at work on a funnel stage: its real head render (the one from
 * that stage's mockup) pinned where the shoppers would leak out. Placed by
 * its parent (left / top), shown while that stage has Bizmis on.
 */
const AgentPin = forwardRef<
  HTMLSpanElement,
  {
    stage: number;
    on: boolean;
    focus?: boolean;
    size?: number;
    className?: string;
    style?: CSSProperties;
  }
>(({ stage, on, focus, size = 30, className, style }, ref) => (
  <span
    ref={ref}
    aria-hidden="true"
    style={style}
    className={cn("sl-fn-pin", on && "is-on", focus && "is-focus", className)}
  >
    <HeadCircle head={STAGE_HEADS[stage]} size={size} speaking={on && focus} />
  </span>
));
AgentPin.displayName = "AgentPin";

export default AgentPin;
