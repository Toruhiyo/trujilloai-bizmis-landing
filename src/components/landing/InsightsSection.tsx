import { Play } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import Reveal, { useInView } from "./Reveal";

/** The insights dashboard: replays, auto-tagged topics, and the funnel. */
const Dashboard = () => {
  const m = useMessages();
  const r = m.sessionReplay;
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const sessions = [
    { who: r.anonymousCustomer, cat: r.categories.sale, ok: true },
    { who: r.vip, cat: r.categories.sale, ok: true },
    { who: r.customer, cat: r.categories.support, ok: true },
    { who: r.customer, cat: r.categories.support, ok: false },
  ];
  const cases = m.supportDemo.cases;
  const topics = [cases.orderTracking.action, cases.returnPolicy.action, cases.shippingTime.action, cases.warranty.action];
  const funnel = [100, 64, 41]; // illustrative bar lengths, not data
  return (
    <div ref={ref} className="bzl-window p-5 sm:p-7">
      <div className="grid gap-6 sm:grid-cols-[1.15fr_0.85fr]">
        <ul className="space-y-2.5">
          {sessions.map((s, i) => (
            <li
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-[var(--bzl-border)] bg-white px-3 py-2.5 transition-all duration-500",
                inView ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0"
              )}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-[var(--bzl-card)] text-[var(--bzl-ink-2)]">
                <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[var(--bzl-fg)]">{s.who}</span>
                <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-[#ececf0]">
                  <span className="block h-full rounded-full bg-[var(--bzl-orange)]" style={{ width: `${[78, 92, 55, 30][i]}%` }} />
                </span>
              </span>
              <span className="rounded-full bg-[var(--bzl-card)] px-2 py-0.5 text-[11px] font-semibold text-[var(--bzl-ink-2)]">{s.cat}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  s.ok ? "bg-[var(--bzl-orange-wash)] text-[var(--bzl-orange-dark)]" : "bg-[#f3f3f5] text-[var(--bzl-faint)]"
                )}
              >
                {s.ok ? r.successful : r.unresolved}
              </span>
            </li>
          ))}
        </ul>
        <div className="space-y-5">
          <div className="flex flex-wrap gap-1.5">
            {topics.map((t, i) => (
              <span
                key={t}
                className={cn(
                  "rounded-full border border-[var(--bzl-border)] px-2.5 py-1 text-xs font-semibold text-[var(--bzl-ink-2)] transition-all duration-500",
                  inView ? "scale-100 opacity-100" : "scale-90 opacity-0"
                )}
                style={{ transitionDelay: `${500 + i * 90}ms`, transitionTimingFunction: "var(--bzl-spring)" }}
              >
                # {t}
              </span>
            ))}
          </div>
          <div className="space-y-2">
            {m.salesDemo.steps.map((step, i) => (
              <div key={step}>
                <p className="text-xs font-semibold text-[var(--bzl-ink-2)]">{step}</p>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[#ececf0]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--bzl-orange),var(--bzl-orange-strong))] transition-[width] duration-1000"
                    style={{ width: inView ? `${funnel[i]}%` : "0%", transitionDelay: `${700 + i * 150}ms`, transitionTimingFunction: "var(--bzl-ease)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Store Insights — "Learn. Tune. Grow." */
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
          <Dashboard />
        </Reveal>
      </div>
    </section>
  );
};

export default InsightsSection;
