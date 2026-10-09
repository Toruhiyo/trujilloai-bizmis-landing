import { useMessages } from "@/i18n/LocaleProvider";
import FeatureCard from "./FeatureCard";
import {
  ChartIcon,
  IconTile,
  IdeaIcon,
  ReplayIcon,
  TagIcon,
} from "./AnimatedIcons";
import Reveal from "./Reveal";
import SessionReplay from "./SessionReplay";

const ICONS = [ReplayIcon, TagIcon, ChartIcon];

/** Store Insights — "Learn. Tune. Grow.", with the classic landing's conversation replays. */
const InsightsSection = () => {
  const ins = useMessages().benefits.insights;
  return (
    <section className="bzl-section bzl-screen">
      <div className="bzl-wrap">
        <div className="bzl-panel bzl-grain t-sand grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 lg:p-[clamp(1.5rem,3svh,3rem)]">
          <div>
            <Reveal>
              <p className="bzl-kicker inline-flex items-center gap-2.5">
                <IconTile icon={IdeaIcon} size="sm" />
                {ins.badge}
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="bzl-statement-sm mt-4">{ins.title}</h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="bzl-lead mt-[2.2svh] max-w-lg">{ins.lead}</p>
            </Reveal>
            <ul className="mt-[3.2svh] grid max-w-lg items-start gap-2.5">
              {ins.features.map((f, i) => (
                <Reveal as="li" key={f.title} delay={220 + i * 90}>
                  <FeatureCard icon={ICONS[i]} title={f.title} body={f.body} />
                </Reveal>
              ))}
            </ul>
          </div>
          <Reveal delay={120}>
            <SessionReplay />
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default InsightsSection;
