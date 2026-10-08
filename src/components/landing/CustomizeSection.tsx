import { useMessages } from "@/i18n/LocaleProvider";
import Reveal from "./Reveal";

// The agents from the film's store reel, each in its store's own shirt.
const AGENTS = ["electronics", "clothing", "books", "gaming", "home", "skincare", "auto", "wine"];

/** "Make it truly yours": every store's agent looks (and sounds) like the brand. */
const CustomizeSection = () => {
  const messages = useMessages();
  const m = messages.customization;
  return (
    <section className="bzl-section">
      <div className="bzl-wrap grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="bzl-kicker">{m.badge}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="bzl-statement-sm mt-4">
              {m.titleLead} <span className="text-[var(--bzl-orange-strong)]">{m.titleHighlight}</span>
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="bzl-lead mt-5 max-w-lg">{m.lead}</p>
          </Reveal>
          <div className="mt-10 space-y-6">
            {[m.avatar, m.voiceCloning].map((f, i) => (
              <Reveal key={f.title} delay={220 + i * 100}>
                <div className="border-l-2 border-[var(--bzl-orange)] pl-5">
                  <h3 className="text-lg font-bold tracking-[-0.02em] text-[var(--bzl-fg)]">{f.title}</h3>
                  <p className="mt-1 text-[var(--bzl-muted)]">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {AGENTS.map((name, i) => (
            <Reveal key={name} delay={i * 70}>
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--bzl-card)] shadow-[0_14px_30px_-18px_rgba(28,24,20,0.35)] transition-transform duration-500 hover:-translate-y-1">
                <img
                  src={`/landing/avatars/${name}.jpg`}
                  alt=""
                  loading="lazy"
                  className="h-full w-full scale-[1.18] object-cover object-[50%_62%]"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomizeSection;
