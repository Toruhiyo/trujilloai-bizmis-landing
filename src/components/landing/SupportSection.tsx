import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import AgentImage from "./AgentImage";
import VoiceReply from "./VoiceReply";
import Reveal, { useInView } from "./Reveal";
import { StoreWindow } from "./clay";

const CASE_MS = 4200;

/**
 * A support conversation cycling through the classic landing's cases: the
 * shopper types, Bizmis checks the store and answers out loud.
 */
const SupportChat = () => {
  const messages = useMessages();
  const cases = Object.values(messages.supportDemo.cases);
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!inView || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % cases.length), CASE_MS);
    return () => window.clearInterval(t);
  }, [inView, cases.length]);
  const c = cases[i];
  return (
    <div ref={ref}>
      <StoreWindow label={messages.landing.yourStore}>
        <div className="grid grid-cols-[96px_1fr] gap-4 p-5 sm:grid-cols-[140px_1fr] sm:gap-6 sm:p-7">
          <div className="self-end overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#fff7ee,#fff)]">
            <AgentImage name="support-yusuke" alt="" sizes="140px" className="mx-auto w-[92%] translate-y-[6%]" />
          </div>
          {/* key: each case re-mounts, so its three steps play in again */}
          <div key={i} className="min-h-[13rem] space-y-3 sm:min-h-[12rem]">
            <p className="bzl-bubble bzl-bubble-shopper w-fit animate-[bzl-pop_0.5s_var(--bzl-ease)_both]">{c.quote}</p>
            <p className="flex w-fit animate-[bzl-pop_0.5s_var(--bzl-ease)_0.6s_both] items-center gap-1.5 rounded-full bg-[var(--bzl-orange-wash)] px-3 py-1 text-xs font-semibold text-[var(--bzl-orange-dark)]">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
              {c.action}
            </p>
            <VoiceReply transcript={c.response} seconds={5} className="animate-[bzl-pop_0.5s_var(--bzl-ease)_1.1s_both]" />
          </div>
        </div>
        <div className="flex justify-center gap-1.5 pb-4" aria-hidden="true">
          {cases.map((_, k) => (
            <i key={k} className={cn("h-1.5 rounded-full transition-all duration-500", k === i ? "w-5 bg-[var(--bzl-orange)]" : "w-1.5 bg-[#dcdce0]")} />
          ))}
        </div>
      </StoreWindow>
    </div>
  );
};

/** Customer Support — "Save hours on support. Earn loyal customers." */
const SupportSection = () => {
  const s = useMessages().benefits.support;
  return (
    <section className="bzl-section bg-[linear-gradient(180deg,#fff,#fbfaf8_25%,#fbfaf8_75%,#fff)]">
      <div className="bzl-wrap">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <p className="bzl-kicker">{s.badge}</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="bzl-statement-sm mt-4">
                {s.titleLine1}
                <br />
                <span className="bzl-tail">{s.titleLine2}</span>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="bzl-lead mt-5 max-w-lg">{s.leadLong}</p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap gap-2">
                {[s.outcomes.saveHours, s.outcomes.betterReviews, s.outcomes.repeatSales].map((o) => (
                  <span key={o} className="rounded-full border border-[var(--bzl-border)] bg-white px-4 py-1.5 text-sm font-semibold text-[var(--bzl-ink-2)]">
                    {o}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={120} className="mx-auto w-full max-w-[560px]">
            <SupportChat />
          </Reveal>
        </div>

        <div className="mt-20 grid gap-5 md:grid-cols-3">
          {s.capabilities.map((c, i) => (
            <Reveal key={c.title} delay={i * 110}>
              <article className="h-full rounded-[var(--bzl-radius-card)] bg-white p-7 shadow-[0_18px_44px_-30px_rgba(28,24,20,0.35)] ring-1 ring-[var(--bzl-border)]">
                <p className="text-sm font-semibold text-[var(--bzl-orange-dark)]">{c.tagline}</p>
                <h3 className="mt-3 text-xl font-bold tracking-[-0.02em] text-[var(--bzl-fg)]">{c.title}</h3>
                <p className="mt-2 leading-relaxed text-[var(--bzl-muted)]">{c.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SupportSection;
