import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import FunnelFlow from "./funnel/FunnelFlow";
import { ksAt, startsFor } from "./funnel/model";
import Metrics from "./Metrics";

/** The payoff's timeline: the bad funnel, the three stages fixed in turn, the sales piling up, the finale. */
export const PAYOFF_DURATION = 11200;

/**
 * The pillar's payoff, in the funnel's own language and without a single
 * figure: the one bad funnel (every chamber choked and leaking, a trickle
 * of orders), then discovery, decision and checkout fixed one after another,
 * each stamped by the agent, its exit opening up and its waterfall of lost
 * visits drying to a trickle, until the stream into the bag is thick and
 * the ring of ticks round it fills in. Still some losses, still a funnel:
 * better, not magic. Its fixes follow `t` (the section maps its scroll onto
 * it); the visits keep flowing in real time. Over it (stacked; the pinned
 * stage sets it beside the funnel itself), the merchant's metric card:
 * conversion rate and orders turning up, abandoned carts down, a notch at
 * each fix, on the same clock. Direction only, never a figure.
 */
const SalesPayoff = ({ t, rewind, className }: { t: number; rewind?: boolean; className?: string }) => {
  const s = useMessages().landing.sales;
  return (
    <div className={cn("sl-pay relative", className)}>
      <Metrics
        variant={4}
        k={ksAt(t, startsFor(3)).map((v) => Math.min(1, v))}
        focus={3}
        className="sl-g2-met is-card sl-pay-card"
      />
      <div className="sl-fn sl-pay-box">
        <FunnelFlow t={t} duration={PAYOFF_DURATION} focus={3} copy={s.funnel} rewind={rewind} />
      </div>
    </div>
  );
};

export default SalesPayoff;
