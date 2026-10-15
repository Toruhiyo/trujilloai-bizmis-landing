import type { ReactNode } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import FeatureCard from "./FeatureCard";
import { ChartIcon, IdeaIcon, ReplayIcon, TagIcon } from "./AnimatedIcons";
import BenefitIntro from "./pillar/BenefitIntro";
import { InsightsClarity } from "./PillarMoments";
import Reveal from "./Reveal";
import SessionReplay from "./SessionReplay";
import OutcomeHead from "./openers/OutcomeHead";
import { useStruct } from "./openers/StructContext";

const ICONS = [ReplayIcon, TagIcon, ChartIcon];

/**
 * The structure options (?struct=A|C, structs.css), as Support's: A, one
 * screen (the head, lead and features beside the session replay, the one
 * visual); C, an opener (the outcome huge over the noise sorting into a
 * rising chart), then the content screen.
 */
const InsightsStruct = ({ struct }: { struct: "A" | "C" }) => {
  const ins = useMessages().landing.insights;
  const feats = (
    <ul className="st-caps">
      {ins.features.map((f, i) => (
        <Reveal as="li" key={f.title} delay={160 + i * 90}>
          <FeatureCard icon={ICONS[i]} title={f.title} body={f.body} />
        </Reveal>
      ))}
    </ul>
  );
  const content = (head: ReactNode) => (
    <div className="bzl-wrap st-grid">
      <div className="st-copy">
        {head}
        <Reveal delay={80} className="st-leadbox">
          <p className="bzl-lead st-lead">{ins.lead}</p>
        </Reveal>
        {feats}
      </div>
      <Reveal delay={120} className="st-visual st-replay">
        <SessionReplay />
      </Reveal>
    </div>
  );
  if (struct === "A")
    return (
      <section className="bzl-band bzl-pillar p-insights st-screen st-a">
        {content(<OutcomeHead area={ins.area} icon={<IdeaIcon />} lead={ins.title} tail={ins.titleTail} />)}
      </section>
    );
  return (
    <section className="bzl-band bzl-pillar p-insights st-c so-insights">
      <div className="st-opener">
        <OutcomeHead area={ins.area} icon={<IdeaIcon />} lead={ins.title} tail={ins.titleTail} size="xl" center />
        <Reveal delay={200} className="st-feel">
          <InsightsClarity />
        </Reveal>
      </div>
      <div className="so-content st-screen">{content(<OutcomeHead area={ins.area} icon={<IdeaIcon />} as="p" />)}</div>
    </section>
  );
};

/**
 * Store Insights: "Store Insights", huge, with its promise "See what sells.
 * Fix what doesn't." under it (BenefitIntro / PillarIntro), which docks as
 * the section's sticky bar as you scroll; then, under the bar, one screen in
 * the Insights colours (honey and gold): the lead, noise that sorts itself
 * into a rising chart, the three features as cards, and the classic
 * landing's conversation replays.
 */
const InsightsSection = () => {
  const messages = useMessages();
  const struct = useStruct();
  if (struct === "A" || struct === "C") return <InsightsStruct struct={struct} />;
  const ins = messages.landing.insights;
  const promise = `${ins.title} ${ins.titleTail}`;
  return (
    <section className="bzl-band bzl-pillar p-insights bzp-section">
      <BenefitIntro
        index="03"
        icon={<IdeaIcon />}
        name={messages.benefits.insights.badge}
        promise={promise}
        outcome={[ins.title, ins.titleTail]}
        moment={<InsightsClarity />}
      >
        <div className="bzl-wrap">
          <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <Reveal>
                <p className="bzl-lead max-w-md">{ins.lead}</p>
              </Reveal>
              <Reveal delay={80}>
                <InsightsClarity className="mt-[2.6svh] max-w-lg" />
              </Reveal>
              <ul className="mt-[2.2svh] grid max-w-lg items-start gap-2">
                {ins.features.map((f, i) => (
                  <Reveal as="li" key={f.title} delay={160 + i * 90}>
                    <FeatureCard icon={ICONS[i]} title={f.title} body={f.body} />
                  </Reveal>
                ))}
              </ul>
            </div>
            <Reveal delay={120} className="relative">
              <SessionReplay />
            </Reveal>
          </div>
        </div>
      </BenefitIntro>
    </section>
  );
};

export default InsightsSection;
