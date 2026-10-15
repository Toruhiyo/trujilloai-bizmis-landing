import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import FunnelFlow from "./funnel/FunnelFlow";
import { useScene } from "./hooks";
import { Sentinel } from "./scene";

/** The payoff's timeline: the bad funnel, the three stages fixed in turn, the sales piling up, the finale. */
export const PAYOFF_DURATION = 10400;
const DURATION = PAYOFF_DURATION;

/**
 * The pillar's payoff, in the funnel's own language and without a single
 * figure: the one bad funnel (every chamber choked and leaking, a trickle
 * of orders), then discovery, decision and checkout fixed one after another
 * in quick succession, each stamped by its agent, its exit opening up and
 * its waterfall of lost shoppers thinning to a trickle, until the stream
 * into the bag is thick and the ring of ticks round it fills in. Still
 * some losses, still a funnel: better, not magic. A rewind loop (useScene;
 * `play: false` holds it at the start). Reduced motion shows the finished
 * funnel.
 */
const SalesPayoff = ({ play, className }: { play?: boolean; className?: string }) => {
  const s = useMessages().landing.sales;
  const { t, sentinel, off } = useScene(DURATION, play, { threshold: 0.35 });
  return (
    <div className={cn("sl-pay relative", className)}>
      <Sentinel ref={sentinel} off={off} />
      <div className="sl-fn sl-pay-box">
        <FunnelFlow t={t} duration={DURATION} focus={3} copy={s.funnel} />
      </div>
    </div>
  );
};

export default SalesPayoff;
