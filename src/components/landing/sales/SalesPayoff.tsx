import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import FunnelFlow from "./funnel/FunnelFlow";
import { useScene } from "./hooks";
import { Sentinel } from "./shared";

/** The payoff's timeline: the bad funnel, the three stages fixed in turn, the sales piling up, the finale. */
const DURATION = 8600;

/**
 * The pillar's payoff, in the funnel's own language and without a single
 * figure: the one bad funnel (every stage grey and leaking, a trickle of
 * sales), then discovery, decision and checkout fixed one after another,
 * each turning warm as its agent plugs its leak and its pill flips to the
 * solution. Sales pour into the Sales box, each one a ✓ with a pop, until
 * a shower of them overflows it. Still some losses, still a funnel: better,
 * not magic. A rewind loop (useScene; `play: false` holds
 * it at the start). Reduced motion shows the finished, golden funnel.
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
