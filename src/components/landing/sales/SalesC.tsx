import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { TrendIcon } from "../AnimatedIcons";
import PillarIntro from "../PillarIntro";
import { buyTimeline } from "./BuyMockup";
import { findTimeline } from "./FindMockup";
import FunnelScale from "./funnel/FunnelScale";
import { useActivePanel, useMedia, usePinProgress, useScene } from "./hooks";
import SalesPayoff from "./SalesPayoff";
import SalesTitle, { SalesHeading } from "./SalesTitle";
import { Device, PanelCopy, Sentinel } from "./shared";
import { trustTimeline } from "./TrustMockup";

/** Find, trust, buy, then the payoff. */
const STEPS = 4;
/** The docked bar's ground: the band's orange, frosted. */
const BAR = "color-mix(in oklab, #ef8632 88%, transparent)";

/**
 * Variant C, "the stage": bold Bizmis orange. It opens on the pillar's
 * name, huge ("Boost Sales", PillarIntro), with "Shoppers Find it. Trust
 * it. Buy it." under it; both dock as the section's sticky bar as you
 * scroll, the name as its label, the part being shown lit. Under it, one pinned screen: on the left, the
 * part's funnel stage and benefit over the at-scale funnel (the whole
 * store's shoppers, that stage improving); on the right, the one
 * conversation on its device: find, trust, buy. The funnel is one story:
 * it starts bad, each beat fixes its own stage on top of the ones before,
 * the moment its agent solves it in the mockup (each beat's mockup and
 * funnel share one clock). Each beat plays from its start the moment it
 * becomes the active one, and loops with a rewind.
 * Then the payoff: all three stages improving together, the funnel's
 * stream turning golden and its bag overflowing with orders. Without the room to pin (phones, short
 * screens), the moments stack under the docked title instead, each with
 * its own funnel.
 */
const SalesC = () => {
  const pin = useMedia("(min-width: 1024px) and (min-height: 640px)");
  return pin ? <Pinned /> : <Stacked />;
};

const TIMELINES = [findTimeline, trustTimeline, buyTimeline];

/**
 * A beat's one clock: its mockup and its funnel both run on it (same
 * duration, same rewind), so the pair plays and rewinds as one. Its
 * sentinel goes over the beat; `play: false` holds it at the start.
 */
const useBeat = (i: number, play?: boolean) => {
  const s = useMessages().landing.sales;
  const tl = TIMELINES[i](s);
  const scene = useScene(tl.duration, play);
  return { ...scene, duration: tl.duration, fixAt: tl.fixAt };
};

/** The supporting line under the pillar's name on arrival: every part lit. */
const BigLine = () => <SalesTitle active="all" layout="big" as="span" />;

const Pinned = () => {
  const m = useMessages();
  const s = m.landing.sales;
  const name = m.benefits.sales.badge;
  const [track, progress] = usePinProgress<HTMLDivElement>();
  const step = Math.min(STEPS - 1, Math.floor(progress * STEPS));
  const payoff = step === 3;
  const lit = payoff ? "all" : step;
  const beats = [useBeat(0, step === 0), useBeat(1, step === 1), useBeat(2, step === 2)];
  const f = Math.min(step, 2);

  return (
    <section id="benefits" className="sl sl-c is-pinned bzl-band bzl-pillar p-sales">
      <SalesHeading as="p" />
      <PillarIntro
        name={name}
        icon={<TrendIcon />}
        line={<BigLine />}
        lineClassName="sl-big"
        accent={BAR}
        docked={<SalesTitle active={lit} layout="line" as="p" className="sl-c-title" />}
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
                  {/* the active beat's funnel, on the same clock as its mockup */}
                  <FunnelScale
                    focus={f}
                    t={beats[f].t}
                    duration={beats[f].duration}
                    fixAt={beats[f].fixAt}
                    className="sl-c-funnel"
                  />
                </div>
              </div>
              <div className="sl-c-shows">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn("sl-c-show", step === i && "is-on", step > i && "is-past")}
                    aria-hidden={step !== i}
                  >
                    <Sentinel ref={beats[i].sentinel} off={beats[i].off} />
                    <Device index={i} clock={beats[i]} active={step === i} />
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
  const m = useMessages();
  const s = m.landing.sales;
  const name = m.benefits.sales.badge;
  const { active, setRef } = useActivePanel(0.55);
  const lit = active >= 3 ? "all" : active;
  const beats = [useBeat(0), useBeat(1), useBeat(2)];
  return (
    <section id="benefits" className="sl sl-c is-stacked bzl-band bzl-pillar p-sales">
      <SalesHeading as="p" />
      <PillarIntro
        name={name}
        icon={<TrendIcon />}
        line={<BigLine />}
        lineClassName="sl-big"
        accent={BAR}
        docked={<SalesTitle active={lit} layout="line" as="p" className="sl-bar-title" />}
      >
        <div className="bzl-wrap sl-c-list">
          {s.panels.map((p, i) => (
            <div key={p.title} ref={setRef(i)} className="sl-c-item relative">
              <Sentinel ref={beats[i].sentinel} off={beats[i].off} />
              <PanelCopy index={i} kicker={s.stages[i]} title={p.title} body={p.body} className="sl-c-copy is-on" />
              <Device index={i} clock={beats[i]} />
              <FunnelScale
                focus={i}
                t={beats[i].t}
                duration={beats[i].duration}
                fixAt={beats[i].fixAt}
                className="sl-c-funnel"
              />
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
