import { forwardRef } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { HeadCircle } from "../../BizmisWidget";
import { useStageHeads } from "../proto";

/**
 * The agent at work on a funnel stage: its real head render (the one from
 * that stage's mockup), the plug in the stage's leak. Placed by its parent
 * (left / top / transform).
 */
const AgentPin = forwardRef<
  HTMLSpanElement,
  {
    stage: number;
    size?: number;
    className?: string;
    style?: CSSProperties;
  }
>(({ stage, size = 30, className, style }, ref) => {
  const heads = useStageHeads();
  return (
    <span ref={ref} aria-hidden="true" style={style} className={cn("sl-fn-pin", className)}>
      <HeadCircle head={heads[stage]} size={size} />
    </span>
  );
});
AgentPin.displayName = "AgentPin";

export default AgentPin;
