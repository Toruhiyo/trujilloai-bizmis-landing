import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { useScene } from "../hooks";
import { Sentinel } from "../shared";
import FunnelFlow from "./FunnelFlow";

/** A beat's funnel: the leaks for a breath, its stage improving, then the fuller flow. */
const DURATION = 6800;

/**
 * The at-scale view beside a beat's one conversation: the whole store's
 * shoppers flowing through the funnel (FunnelFlow), and the beat's own stage
 * (`focus` 0–2) improving: its leak plugged by the agent, more shoppers on to
 * the orders. A rewind loop (useScene): from the start whenever it comes
 * into view (`play: false` holds it at the start), then backwards, fast, and
 * again. Reduced motion shows the improved funnel, still.
 */
const FunnelScale = ({ focus, play, className }: { focus: number; play?: boolean; className?: string }) => {
  const f = useMessages().landing.sales.funnel;
  const { t, sentinel, off } = useScene(DURATION, play, { hold: 1800, threshold: 0.4 });
  return (
    <div className={cn("sl-fn relative", className)} data-focus={focus}>
      <Sentinel ref={sentinel} off={off} />
      <span className="sl-fn-eyebrow">{f.eyebrow}</span>
      <FunnelFlow t={t} duration={DURATION} focus={focus} labels={f.steps} />
    </div>
  );
};

export default FunnelScale;
