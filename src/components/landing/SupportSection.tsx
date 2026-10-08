import { useEffect, useState } from "react";
import { FileSearch, PackageSearch, Truck } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import Reveal, { useInView } from "./Reveal";
import { SentMessage } from "./BizmisWidget";
import { StoreWithWidget } from "./visuals";
import { ClayTile } from "./clay";

// Each case plays the real widget's sequence: the shopper's message, the
// agent working (tool on its laser), then speaking with captions.
const STEP_MS = [1600, 1700, 3600];
// The widget's tool icon for each support case.
const TOOLS = {
  returnPolicy: FileSearch,
  orderTracking: PackageSearch,
  shippingTime: Truck,
  changeAddress: PackageSearch,
  cancelOrder: PackageSearch,
  warranty: FileSearch,
  startReturn: PackageSearch,
} as const;

/**
 * A support moment cycling through the classic landing's cases, as the real
 * widget plays it: the shopper's message floats above the card, the agent
 * works the store (tool on its laser), then answers out loud — rings behind
 * the avatar and the words as captions at the page's foot.
 */
const SupportChat = () => {
  const messages = useMessages();
  const keys = Object.keys(messages.supportDemo.cases) as (keyof typeof messages.supportDemo.cases)[];
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const [pos, setPos] = useState({ i: 0, step: 0 });
  useEffect(() => {
    if (!inView || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(
      () => setPos((p) => (p.step < 2 ? { ...p, step: p.step + 1 } : { i: (p.i + 1) % keys.length, step: 0 })),
      STEP_MS[pos.step]
    );
    return () => window.clearTimeout(t);
  }, [inView, pos, keys.length]);
  const key = keys[pos.i];
  const c = messages.supportDemo.cases[key];
  const state = pos.step === 0 ? "idle" : pos.step === 1 ? "working" : "speaking";
  return (
    <div ref={ref}>
      <StoreWithWidget
        agent="support-yusuke"
        state={state}
        tool={TOOLS[key]}
        above={pos.step === 0 ? <SentMessage text={c.quote.replace(/^"|"$/g, "")} /> : undefined}
        caption={pos.step === 2 ? c.response : undefined}
      >
        <div className="grid grid-cols-[1fr_1fr] gap-5 p-5 pb-16 pr-[17%] sm:p-7 sm:pb-20 sm:pr-[19%]">
          <ClayTile shape="egg" tint="blush" />
          <div className="space-y-2.5 pt-1">
            <div className="bzl-tile-line w-4/5" />
            <div className="bzl-tile-line w-2/5" />
            <div className="h-4 w-14 rounded-md bg-[#d9d4cc]" />
            <div className="bzl-tile-line w-full" />
            <div className="bzl-tile-line w-3/4" />
            <div className="mt-3 h-8 rounded-xl bg-[var(--bzl-fg)]/85" />
          </div>
        </div>
      </StoreWithWidget>
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
