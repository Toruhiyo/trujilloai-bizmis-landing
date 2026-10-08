import { useMessages } from "@/i18n/LocaleProvider";
import Reveal from "./Reveal";
import SessionReplay from "./SessionReplay";

/** Store Insights — "Learn. Tune. Grow.", with the classic landing's conversation replays. */
const InsightsSection = () => {
  const ins = useMessages().benefits.insights;
  return (
    <section className="bzl-section">
      <div className="bzl-wrap grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="bzl-kicker">{ins.badge}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="bzl-statement-sm mt-4">{ins.title}</h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="bzl-lead mt-5 max-w-lg">{ins.lead}</p>
          </Reveal>
          <ul className="mt-8 space-y-5">
            {ins.features.map((f, i) => (
              <Reveal as="li" key={f.title} delay={220 + i * 90}>
                <div className="border-l-2 border-[var(--bzl-orange)] pl-5">
                  <h3 className="font-bold tracking-[-0.02em] text-[var(--bzl-fg)]">{f.title}</h3>
                  <p className="mt-1 text-[var(--bzl-muted)]">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
        <Reveal delay={120}>
          <SessionReplay />
        </Reveal>
      </div>
    </section>
  );
};

export default InsightsSection;
