import { useMessages } from "@/i18n/LocaleProvider";
import FeatureCard from "./FeatureCard";
import { ChartIcon, IdeaIcon, ReplayIcon, TagIcon } from "./AnimatedIcons";
import PillarChip from "./PillarChip";
import { InsightsClarity } from "./PillarMoments";
import Reveal from "./Reveal";
import SessionReplay from "./SessionReplay";

const ICONS = [ReplayIcon, TagIcon, ChartIcon];

/**
 * Store Insights: "Know what shoppers want. Fix what costs you sales.", with
 * the classic landing's conversation replays. One band in the Insights
 * colours (honey and gold). Its feel-it moment is noise that sorts itself
 * into a rising chart; the three features are cards, the detail on demand.
 */
const InsightsSection = () => {
  const messages = useMessages();
  const ins = messages.landing.insights;
  return (
    <section className="bzl-section bzl-screen bzl-band bzl-pillar p-insights">
      <div className="bzl-wrap">
        <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <Reveal>
              <PillarChip icon={IdeaIcon} label={messages.benefits.insights.badge} />
            </Reveal>
            <Reveal delay={80}>
              <h2 className="bzl-statement-sm mt-[clamp(1rem,2.6svh,1.5rem)]">
                {ins.title}
                <br />
                <span className="bzl-tail">{ins.titleTail}</span>
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="bzl-lead mt-[1.6svh] max-w-md">{ins.lead}</p>
            </Reveal>
            <Reveal delay={200}>
              <InsightsClarity className="mt-[2.6svh] max-w-lg" />
            </Reveal>
            <ul className="mt-[2.2svh] grid max-w-lg items-start gap-2">
              {ins.features.map((f, i) => (
                <Reveal as="li" key={f.title} delay={280 + i * 90}>
                  <FeatureCard
                    icon={ICONS[i]}
                    title={f.title}
                    body={f.body}
                  />
                </Reveal>
              ))}
            </ul>
          </div>
          <Reveal delay={120} className="relative">
            <SessionReplay />
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default InsightsSection;
