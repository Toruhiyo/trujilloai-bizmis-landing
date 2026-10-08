import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import Reveal, { useInView } from "./Reveal";
import AgentImage from "./AgentImage";
import { ClayCard, StoreWindow } from "./clay";

/**
 * "This isn't a chatbot." — the classic landing's pitch, shown with a live
 * Typical chatbot ⟷ Sales agent toggle. It flips to the agent on its own
 * once seen; visitors can flip it back.
 */
const SwitchSection = () => {
  const messages = useMessages();
  const m = messages.landing.switch;
  const [ref, inView] = useInView<HTMLDivElement>(0.45);
  const [agent, setAgent] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!inView || touched) return;
    const t = window.setTimeout(() => setAgent(true), 1100);
    return () => window.clearTimeout(t);
  }, [inView, touched]);

  const flip = () => {
    setTouched(true);
    setAgent((a) => !a);
  };

  return (
    <section className="bzl-section">
      <div className="bzl-wrap grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <Reveal>
            <h2 className="bzl-statement-sm max-w-lg">{messages.hero.pitchLead}</h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="bzl-lead mt-5 max-w-lg">{messages.hero.pitchLong}</p>
          </Reveal>

          <Reveal delay={200} className="mt-10">
            <div className="flex items-center gap-4 text-[0.9375rem] font-semibold">
              <span className={cn("transition-colors duration-300", agent ? "text-[var(--bzl-faint)]" : "text-[var(--bzl-fg)]")}>
                {m.chatbot}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={agent}
                aria-label={m.toggleAria}
                onClick={flip}
                className="bzl-toggle focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--bzl-orange)]/40"
              />
              <span className={cn("transition-colors duration-300", agent ? "text-[var(--bzl-orange-dark)]" : "text-[var(--bzl-faint)]")}>
                {m.agent}
              </span>
            </div>
            <ul className="mt-6 space-y-2.5">
              {(agent ? m.agentPoints : m.chatbotPoints).map((p) => (
                <li key={p} className="flex items-center gap-3 text-[var(--bzl-muted)]">
                  {agent ? (
                    <Check className="h-4 w-4 text-[var(--bzl-orange-strong)]" strokeWidth={3} />
                  ) : (
                    <X className="h-4 w-4 text-[var(--bzl-faint)]" strokeWidth={3} />
                  )}
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <div ref={ref} className="relative">
            <StoreWindow label={messages.landing.yourStore}>
              <div className="relative grid grid-cols-3 gap-4 p-5 pb-12 sm:gap-5 sm:p-7 sm:pb-16">
                <ClayCard shape="capsule" tint="sage" />
                <ClayCard shape="sphere" tint="sand" />
                <ClayCard shape="cube" tint="stone" />
              </div>
            </StoreWindow>
            {/* The corner widget: a text box, or the agent. */}
            <div className="absolute -bottom-6 -right-4 w-[40%] max-w-[230px] sm:-right-8">
              <div
                className={cn(
                  "rounded-2xl border border-[#e5e5ea] bg-white p-3 shadow-[0_16px_40px_-14px_rgba(29,29,31,0.35)] transition-all duration-500",
                  agent ? "pointer-events-none translate-y-3 opacity-0" : "opacity-100"
                )}
              >
                <p className="text-[11px] font-semibold text-[var(--bzl-faint)]">Chat</p>
                <p className="mt-2 rounded-xl bg-[var(--bzl-card)] px-3 py-2 text-xs text-[var(--bzl-fg)]">{m.chatbotMessage}</p>
                <p className="mt-1.5 rounded-xl bg-[var(--bzl-card)] px-3 py-2 text-xs text-[var(--bzl-muted)]">{m.chatbotReply}</p>
                <div className="mt-2 h-7 rounded-lg border border-[#e5e5ea]" />
              </div>
              <div
                className={cn(
                  "absolute inset-x-0 bottom-0 overflow-hidden rounded-2xl border border-[#e5e5ea] bg-white shadow-[0_16px_40px_-14px_rgba(242,140,56,0.55)] transition-all duration-700",
                  agent ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"
                )}
                style={{ transitionTimingFunction: "var(--bzl-spring)" }}
              >
                <div className="aspect-[4/3] overflow-hidden bg-[linear-gradient(180deg,#fff7ee,#fff)]">
                  <AgentImage name="greet-amber" alt={m.agent} sizes="230px" className="mx-auto w-[78%] translate-y-[6%]" />
                </div>
                <p className="border-t border-[#e5e5ea] px-3 py-2 text-xs text-[var(--bzl-fg)]">{m.agentMessage}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default SwitchSection;
