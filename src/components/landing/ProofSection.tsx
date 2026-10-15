import { useMessages } from "@/i18n/LocaleProvider";
import { BookIcon, CareIcon, ChartIcon, ClockIcon, HeadsetIcon, IdeaIcon, ReplayIcon, TagIcon } from "./AnimatedIcons";
import type { AnimatedIcon } from "./AnimatedIcons";
import OutcomeHead from "./openers/OutcomeHead";
import { InsightsClarity, SupportRelief } from "./PillarMoments";
import Reveal from "./Reveal";

/**
 * Structure option B (?struct=B, structs.css .st-proof): Sales is the story,
 * the rest is proof. Customer Support and Store Insights share ONE screen
 * under a handwritten kicker ("And it doesn't just sell."), two halves side
 * by side (stacked on phones), each: the area as a small label, the outcome
 * big, its marker moment (the inbox emptying; the noise sorting into a
 * rising chart) and three compact proof points. No mockups here: Sales has
 * shown the widget at work.
 */
const Proofs = ({ items, icons }: { items: ReadonlyArray<{ title: string; body: string }>; icons: AnimatedIcon[] }) => (
  <ul className="st-proofs">
    {items.map((p, i) => {
      const Icon = icons[i];
      return (
        <Reveal as="li" key={p.title} delay={200 + i * 90} className="st-proof-item">
          <span className="st-proof-icon" aria-hidden="true">
            <Icon className="h-[1.1rem] w-[1.1rem]" />
          </span>
          <span className="st-proof-text">
            <b>{p.title}</b> <span>{p.body}</span>
          </span>
        </Reveal>
      );
    })}
  </ul>
);

const ProofSection = () => {
  const m = useMessages();
  const s = m.landing.support;
  const ins = m.landing.insights;
  return (
    <section className="bzl-band bzl-pillar p-support st-proof">
      <div className="bzl-wrap">
        <Reveal>
          <p className="st-proof-kicker">{m.landing.proof.kicker}</p>
        </Reveal>
        <div className="st-halves">
          <article className="st-half">
            <OutcomeHead area={s.area} icon={<HeadsetIcon />} lead={s.title} tail={s.titleTail} size="md" />
            <Reveal delay={120} className="st-half-art">
              <SupportRelief />
            </Reveal>
            <Proofs items={s.capabilities} icons={[ClockIcon, BookIcon, CareIcon]} />
          </article>
          <span className="st-divider" aria-hidden="true">
            <svg viewBox="0 0 18 300" preserveAspectRatio="none">
              <path d="M9 4 C 5 80, 13 160, 8 296" pathLength={1} />
            </svg>
          </span>
          <article className="st-half">
            <OutcomeHead area={ins.area} icon={<IdeaIcon />} lead={ins.title} tail={ins.titleTail} size="md" />
            <Reveal delay={220} className="st-half-art">
              <InsightsClarity />
            </Reveal>
            <Proofs items={ins.features} icons={[ReplayIcon, TagIcon, ChartIcon]} />
          </article>
        </div>
      </div>
    </section>
  );
};

export default ProofSection;
