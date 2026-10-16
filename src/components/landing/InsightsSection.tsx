import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import FeatureCard from "./FeatureCard";
import { ChartIcon, IdeaIcon, ReplayIcon, TagIcon } from "./AnimatedIcons";
import BenefitIntro, { useScenePlay } from "./pillar/BenefitIntro";
import type { PinState } from "./pillar/BenefitIntro";
import { CLARITY_MS, InsightsClarity } from "./PillarMoments";
import Reveal from "./Reveal";
import SessionReplay from "./SessionReplay";

const ICONS = [ReplayIcon, TagIcon, ChartIcon];

/**
 * Store Insights: its chapter opener (index 03, the bulb, "Store Insights",
 * "See what sells. Fix what doesn't.", BenefitIntro), then one screen: the
 * lead, noise that sorts itself into a rising chart, the classic landing's
 * conversation replays, and the three features as cards.
 *
 * On desktop the section is one pinned screen and the scroll drives the
 * chart moment (useScenePlay: forward plays, back rewinds, at rest it plays
 * on, holds, rewinds and replays). The replays stay the visitor's to play
 * (real call audio). Phones stack it and the chart runs its own loop.
 * Layout: .bzi-* in film-landing.css.
 */
const InsightsBody = ({ pin }: { pin: PinState }) => {
  const ins = useMessages().landing.insights;
  const scene = useScenePlay(pin, CLARITY_MS);
  return (
    <div className="bzl-wrap">
      <div className={cn("bzi-grid", pin.pinned && "is-pinned")}>
        <Reveal className="bzi-lead">
          <p className="bzl-lead max-w-md">{ins.lead}</p>
        </Reveal>
        <Reveal delay={80} className="bzi-chart">
          <InsightsClarity
            className="bzi-clarity"
            t={pin.pinned ? scene.t : undefined}
            rewinding={scene.rewinding}
          />
        </Reveal>
        <ul className="bzi-feats">
          {ins.features.map((f, i) => (
            <Reveal as="li" key={f.title} delay={160 + i * 90}>
              <FeatureCard icon={ICONS[i]} title={f.title} body={f.body} />
            </Reveal>
          ))}
        </ul>
        <Reveal delay={120} className="bzi-replay">
          <SessionReplay />
        </Reveal>
      </div>
    </div>
  );
};

const InsightsSection = () => {
  const messages = useMessages();
  const ins = messages.landing.insights;
  const promise = `${ins.title} ${ins.titleTail}`;
  return (
    <section className="bzl-band bzl-pillar p-insights bzp-section">
      <BenefitIntro
        index="03"
        icon={<IdeaIcon />}
        name={messages.benefits.insights.badge}
        promise={promise}
        area={ins.area}
        motif="insights"
        outcome={[ins.title, ins.titleTail]}
        run={1.2}
      >
        {(pin) => <InsightsBody pin={pin} />}
      </BenefitIntro>
    </section>
  );
};

export default InsightsSection;
