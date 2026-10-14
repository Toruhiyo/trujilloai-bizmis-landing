import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { TrendIcon } from "../AnimatedIcons";
import PillarChip from "../PillarChip";
import PillarIntro from "../PillarIntro";
import FunnelScale from "./funnel/FunnelScale";
import { useActivePanel, useMedia, usePinProgress } from "./hooks";
import SalesPayoff from "./SalesPayoff";
import SalesTitle, { SalesHeading } from "./SalesTitle";
import { Device, PanelCopy } from "./shared";

/** Find, trust, buy, then the payoff. */
const STEPS = 4;
/** The docked bar's ground: the band's orange, frosted. */
const BAR = "color-mix(in oklab, #ef8632 88%, transparent)";

/**
 * Variant C, "the stage": bold Bizmis orange. It opens on the title, big
 * ("Shoppers Find it. Trust it. Buy it.", PillarIntro), which docks as the
 * section's sticky header as you scroll, a bar under each part filling as
 * you go through its moment. Under it, one pinned screen: on the left, the
 * part's funnel stage and benefit over the at-scale funnel (the whole
 * store's shoppers, that stage improving); on the right, the one
 * conversation on its device: find, trust, buy. Each beat plays from its
 * start the moment it becomes the active one, and loops with a rewind.
 * Then the payoff: all three stages improving together, the funnel pouring
 * its orders into the day's sales. Without the room to pin (phones, short
 * screens), the moments stack under the docked title instead, each with
 * its own funnel.
 */
const SalesC = () => {
  const pin = useMedia("(min-width: 1024px) and (min-height: 640px)");
  return pin ? <Pinned /> : <Stacked />;
};

/** The big title (PillarIntro's `title`): every part lit. */
const BigTitle = () => <SalesTitle active="all" layout="big" as="span" />;

const Chip = () => {
  const m = useMessages();
  return <PillarChip icon={TrendIcon} label={m.benefits.sales.badge} />;
};

const Pinned = () => {
  const s = useMessages().landing.sales;
  const [track, progress] = usePinProgress<HTMLDivElement>();
  const step = Math.min(STEPS - 1, Math.floor(progress * STEPS));
  const payoff = step === 3;
  const lit = payoff ? "all" : step;
  // how far through its own quarter each part's bar is
  const fill = (i: number) => Math.min(1, Math.max(0, progress * STEPS - i));

  return (
    <section id="benefits" className="sl sl-c is-pinned bzl-band bzl-pillar p-sales">
      <SalesHeading />
      <PillarIntro
        as="div"
        chip={<Chip />}
        title={<BigTitle />}
        titleClassName="sl-big"
        accent={BAR}
        docked={<SalesTitle active={lit} layout="line" as="p" fills={[0, 1, 2].map(fill)} className="sl-c-title" />}
      >
        <div ref={track} className="sl-c-track">
          <div className="sl-c-pin">
            <div className={cn("bzl-wrap sl-c-frame sl-c-body", payoff && "is-payoff")}>
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
                <div className="sl-c-funnel-slot">
                  {/* a new stage starts its funnel over */}
                  <FunnelScale key={Math.min(step, 2)} focus={Math.min(step, 2)} play={!payoff} className="sl-c-funnel" />
                </div>
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
                <div className={cn("sl-c-show is-payoff", payoff && "is-on")} aria-hidden={!payoff}>
                  <SalesPayoff play={payoff} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PillarIntro>
    </section>
  );
};

const Stacked = () => {
  const s = useMessages().landing.sales;
  const { active, setRef } = useActivePanel(0.55);
  const lit = active >= 3 ? "all" : active;
  return (
    <section id="benefits" className="sl sl-c is-stacked bzl-band bzl-pillar p-sales">
      <SalesHeading />
      <PillarIntro
        as="div"
        chip={<Chip />}
        title={<BigTitle />}
        titleClassName="sl-big"
        accent={BAR}
        docked={<SalesTitle active={lit} layout="line" as="p" className="sl-bar-title" />}
      >
        <div className="bzl-wrap sl-c-list">
          {s.panels.map((p, i) => (
            <div key={p.title} ref={setRef(i)} className="sl-c-item">
              <PanelCopy index={i} kicker={s.stages[i]} title={p.title} body={p.body} className="sl-c-copy is-on" />
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
            <SalesPayoff />
          </div>
        </div>
      </PillarIntro>
    </section>
  );
};

export default SalesC;
