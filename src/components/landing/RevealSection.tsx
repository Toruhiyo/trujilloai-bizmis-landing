import { useMessages } from "@/i18n/LocaleProvider";
import Reveal from "./Reveal";
import { LoopVideo } from "./clay";

/** "Meet Bizmis. Your store salesperson → salesagent." — the film's reveal. */
const RevealSection = () => {
  const m = useMessages().landing.reveal;
  return (
    <section className="bzl-section">
      <div className="bzl-wrap grid items-center gap-10 md:grid-cols-[1.25fr_0.75fr]">
        <div>
          <Reveal>
            <p className="bzl-kicker">{m.kicker}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="bzl-statement mt-4 text-[clamp(2.75rem,7.4vw,6.5rem)] leading-[1.02]">
              {m.lineLead}
              <br />
              <span className="bzl-swap" aria-hidden="true">
                <span className="bzl-strike">{m.struck}</span>
                <span className="bzl-replace">{m.replacement}</span>
              </span>
              {/* Screen readers get the final wording only. */}
              <span className="sr-only">{m.replacement}</span>
            </h2>
          </Reveal>
          <Reveal delay={220}>
            <p className="bzl-lead mt-8 max-w-xl">{m.lead}</p>
          </Reveal>
        </div>

        <Reveal delay={150} className="mx-auto w-full max-w-[420px]">
          <LoopVideo name="/landing/avatar/agent-wave" className="aspect-[660/780] w-full object-contain" />
        </Reveal>
      </div>
    </section>
  );
};

export default RevealSection;
