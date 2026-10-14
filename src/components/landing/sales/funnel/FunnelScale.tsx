import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import FunnelFlow from "./FunnelFlow";

/**
 * The at-scale view beside a beat's one conversation: the whole store's
 * shoppers flowing through the funnel (FunnelFlow), the stages before this
 * beat already fixed, its own stage (`focus` 0–2) in the spotlight, fixed
 * at `fixAt`: the moment the agent solves it in the mockup beside it. It
 * has no clock of its own: the beat's clock (`t`, `duration`) drives it
 * and its mockup together, so the pair plays and rewinds as one.
 */
const FunnelScale = ({
  focus,
  t,
  duration,
  fixAt,
  className,
}: {
  focus: number;
  t: number;
  duration: number;
  fixAt: number;
  className?: string;
}) => {
  const f = useMessages().landing.sales.funnel;
  return (
    <div className={cn("sl-fn relative", className)} data-focus={focus}>
      <span className="sl-fn-eyebrow">{f.eyebrow}</span>
      <FunnelFlow t={t} duration={duration} focus={focus} fixAt={fixAt} copy={f} />
    </div>
  );
};

export default FunnelScale;
