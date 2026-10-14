import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { TrendIcon } from "../AnimatedIcons";
import PillarChip from "../PillarChip";
import { useActivePanel, useMedia, usePinProgress } from "./hooks";
import SalesPulse from "./SalesPulse";
import SalesTitle, { SalesHeading } from "./SalesTitle";
import { Device, PanelCopy } from "./shared";

/** Find, trust, buy, then the payoff. */
const STEPS = 4;

/**
 * Variant C, "the stage": bold Bizmis orange, one pinned screen. The title
 * sits on top with a bar under each part filling as you scroll; below it the
 * moment's words on the left and its device on the right change in place,
 * find, trust, buy, and then the payoff, the day's sales surging with every
 * part lit. Without the room to pin (phones, short screens), the moments
 * stack under a sticky title instead.
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
  const lit = step >= 3 ? "all" : step;
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
            <div className={cn("sl-c-body", step === 3 && "is-payoff")}>
              <div className="sl-c-words">
                {s.panels.map((p, i) => (
                  <PanelCopy
                    key={p.title}
                    index={i}
                    title={p.title}
                    body={p.body}
                    className={cn("sl-c-copy", step === i && "is-on")}
                  />
                ))}
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
                <div className={cn("sl-c-show is-payoff", step === 3 && "is-on")}>
                  {step === 3 && <SalesPulse />}
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
            <PanelCopy index={i} title={p.title} body={p.body} className="sl-c-copy is-on" />
            <Device index={i} />
          </div>
        ))}
        <div ref={setRef(3)} className="sl-c-item is-payoff">
          <SalesPulse />
        </div>
      </div>
    </section>
  );
};

export default SalesC;
