import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { TrendIcon } from "../AnimatedIcons";
import PillarChip from "../PillarChip";
import FunnelScale from "./funnel/FunnelScale";
import { useActivePanel, useMedia, usePinProgress } from "./hooks";
import SalesPulse from "./SalesPulse";
import SalesTitle, { SalesHeading } from "./SalesTitle";
import { Device, PanelCopy } from "./shared";

/** Find, trust, buy, then the payoff. */
const STEPS = 4;

/**
 * Variant C, "the stage": bold Bizmis orange, one pinned screen. The title
 * sits on top with a bar under each part filling as you scroll; below it,
 * on the left, the part's funnel stage and benefit over the at-scale funnel
 * (the whole store's shoppers, that stage plugged by Bizmis), and on the
 * right the one conversation on its device: find, trust, buy, and then the
 * payoff, the day's sales surging beside the whole funnel plugged. Without
 * the room to pin (phones, short screens), the moments stack under a sticky
 * title instead, each with its own funnel.
 */
const SalesC = () => {
  const pin = useMedia("(min-width: 1024px) and (min-height: 640px)");
  return pin ? <Pinned /> : <Stacked />;
};

const Pinned = () => {
  const m = useMessages();
  const s = m.landing.sales;
  const [track, progress] = usePinProgress<HTMLDivElement>();
  const step = Math.min(STEPS - 1, Math.floor(progress * STEPS));
  const payoff = step === 3;
  const lit = payoff ? "all" : step;
  // how far through its own quarter each part's bar is
  const fill = (i: number) => Math.min(1, Math.max(0, progress * STEPS - i));

  return (
    <section id="benefits" className="sl sl-c is-pinned bzl-band bzl-pillar p-sales">
      <SalesHeading />
      <div ref={track} className="sl-c-track">
        <div className="sl-c-pin">
          <div className="bzl-wrap sl-c-frame">
            <header className="sl-c-head">
              <PillarChip icon={TrendIcon} label={m.benefits.sales.badge} />
              <SalesTitle
                active={lit}
                layout="line"
                as="p"
                fills={[0, 1, 2].map(fill)}
                className="sl-c-title"
              />
            </header>
            <div className={cn("sl-c-body", payoff && "is-payoff")}>
              <div className="sl-c-side">
                <div className="sl-c-words">
                  {s.panels.map((p, i) => (
                    <PanelCopy
                      key={p.title}
                      index={i}
                      kicker={s.stages[i]}
                      title={p.title}
                      body={p.body}
                      className={cn("sl-c-copy", step === i && "is-on")}
                    />
                  ))}
                  <PanelCopy
                    kicker={s.payoff.kicker}
                    title={s.payoff.title}
                    body={s.payoff.body}
                    className={cn("sl-c-copy", payoff && "is-on")}
                  />
                </div>
                <FunnelScale focus={step} className="sl-c-funnel" />
              </div>
              <div className="sl-c-shows">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn("sl-c-show", step === i && "is-on", step > i && "is-past")}
                    aria-hidden={step !== i}
                  >
                    <Device index={i} play={step === i} />
                  </div>
                ))}
                <div className={cn("sl-c-show is-payoff", payoff && "is-on")}>
                  {payoff && <SalesPulse />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Stacked = () => {
  const m = useMessages();
  const s = m.landing.sales;
  const { active, setRef } = useActivePanel(0.55);
  const lit = active >= 3 ? "all" : active;
  return (
    <section id="benefits" className="sl sl-c is-stacked bzl-band bzl-pillar p-sales">
      <SalesHeading />
      <div className="bzl-wrap">
        <PillarChip icon={TrendIcon} label={m.benefits.sales.badge} />
      </div>
      <div className="sl-bar">
        <div className="bzl-wrap">
          <SalesTitle active={lit} layout="line" as="p" />
        </div>
      </div>
      <div className="bzl-wrap sl-c-list">
        {s.panels.map((p, i) => (
          <div key={p.title} ref={setRef(i)} className="sl-c-item">
            <PanelCopy
              index={i}
              kicker={s.stages[i]}
              title={p.title}
              body={p.body}
              className="sl-c-copy is-on"
            />
            <Device index={i} />
            <FunnelScale focus={i} className="sl-c-funnel" />
          </div>
        ))}
        <div ref={setRef(3)} className="sl-c-item is-payoff">
          <PanelCopy
            kicker={s.payoff.kicker}
            title={s.payoff.title}
            body={s.payoff.body}
            className="sl-c-copy is-on"
          />
          <SalesPulse />
          <FunnelScale focus={3} className="sl-c-funnel" />
        </div>
      </div>
    </section>
  );
};

export default SalesC;
