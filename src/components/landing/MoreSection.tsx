import { useMessages } from "@/i18n/LocaleProvider";
import Reveal from "./Reveal";

/** "It sells. It supports. It learns." — the three jobs, in the film's calm cards. */
const MoreSection = () => {
  const messages = useMessages();
  const { sales, support, insights } = messages.benefits;
  const cards = [
    { badge: sales.badge, title: sales.title, lead: sales.leadShort, items: sales.pillars.map((p) => p.title) },
    {
      badge: support.badge,
      title: support.titleLine1,
      lead: support.leadShort,
      items: support.capabilities.map((c) => c.title),
    },
    { badge: insights.badge, title: insights.title, lead: insights.lead, items: insights.features.map((f) => f.title) },
  ];
  return (
    <section className="bzl-section">
      <div className="bzl-wrap">
        <Reveal>
          <h2 className="bzl-statement text-center">{messages.landing.more.title}</h2>
        </Reveal>
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {cards.map((card, i) => (
            <Reveal key={card.badge} delay={i * 120}>
              <article className="flex h-full flex-col rounded-[var(--bzl-radius-card)] bg-[var(--bzl-card)] p-8 sm:p-10">
                <p className="bzl-kicker">{card.badge}</p>
                <h3 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-[-0.03em] text-[var(--bzl-fg)]">
                  {card.title}
                </h3>
                <p className="mt-4 leading-relaxed text-[var(--bzl-muted)]">{card.lead}</p>
                <ul className="mt-auto space-y-2.5 pt-8">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 font-semibold text-[var(--bzl-fg)]">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="none" stroke="var(--bzl-orange-strong)" strokeWidth="2.2" aria-hidden="true">
                        <path d="M5 12.5l4.4 4.4L19 7.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoreSection;
