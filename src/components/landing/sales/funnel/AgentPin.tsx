import { forwardRef } from "react";
import type { CSSProperties } from "react";
import { Scale, Search, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

/** The store's one agent: the same head at every stage. */
export const AGENT = "amber";

/**
 * Its pose at each stage (the renders give one face; the pose carries the
 * mood): searching, the head cocked one way; comparing, mirrored, weighing
 * it up; the sale, the waving render, beaming. Image, crop (zoom, focus) and
 * a tilt.
 */
const POSES: { src: string; zoom: number; x: number; y: number; tilt: number; flip?: boolean }[] = [
  { src: `/landing/heads/${AGENT}.png`, zoom: 1.18, x: 50, y: 4, tilt: -9 },
  { src: `/landing/heads/${AGENT}.png`, zoom: 1.18, x: 50, y: 4, tilt: 7, flip: true },
  { src: `/landing/agents/greet-${AGENT}-360.webp`, zoom: 2.05, x: 52, y: 2, tilt: 0 },
];

/** Each stage's action, worn as a badge on the agent's stamp: search, compare, cart. */
const ACTIONS = [Search, Scale, ShoppingCart];

/**
 * The agent at work on a funnel stage: its head, in that stage's pose,
 * stamped on the stage's leak, with the stage's action as a badge. Placed by
 * its parent (left / top / transform).
 */
const AgentPin = forwardRef<
  HTMLSpanElement,
  {
    stage: number;
    size?: number;
    /** The action badge's opacity (it lands just after the head). */
    badge?: number;
    className?: string;
    style?: CSSProperties;
  }
>(({ stage, size = 30, badge = 1, className, style }, ref) => {
  const p = POSES[stage];
  const Icon = ACTIONS[stage];
  const b = Math.round(size * 0.56);
  return (
    <span ref={ref} aria-hidden="true" style={style} className={cn("sl-fn-pin", className)}>
      <span
        className="sl-fn-head"
        style={{ width: size, height: size, rotate: `${p.tilt}deg` }}
      >
        <img
          src={p.src}
          alt=""
          draggable={false}
          style={{
            width: `${p.zoom * 100}%`,
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: `translateX(-50%)${p.flip ? " scaleX(-1)" : ""}`,
          }}
        />
      </span>
      <span
        className="sl-fn-badge"
        style={{ width: b, height: b, opacity: badge, transform: `scale(${0.5 + 0.5 * badge})` }}
      >
        <Icon strokeWidth={2.8} />
      </span>
    </span>
  );
});
AgentPin.displayName = "AgentPin";

export default AgentPin;
