import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { FaBolt, FaBox, FaGlobe, FaPercent, FaShieldAlt, FaShopify, FaShoppingCart, FaSync, FaTag, FaUsers } from "react-icons/fa";
import { useMessages } from "@/i18n/LocaleProvider";
import AgentImage from "./AgentImage";
import Reveal, { useInView } from "./Reveal";

// Same order as messages.setup.dataCards (as on the classic landing).
const ICONS = [FaGlobe, FaTag, FaPercent, FaShieldAlt, FaUsers, FaBox];

type Line = { d: string; dur: number; delay: number };

/**
 * Setup — the classic landing's diagram, in the film's style: your Shopify
 * store data as soft orange cards, each wired to the agent by a thick, warm
 * line with light travelling along it, and the agent charging up with every
 * pulse (an orange glow and aura breathing in and out). The lines are drawn
 * from the real positions of the cards and the avatar, so they always land.
 */
const SetupSection = () => {
  const messages = useMessages();
  const setup = messages.setup;
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const box = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const target = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // wire each card to the avatar's chest, from the real layout
  const measure = useCallback(() => {
    const b = box.current?.getBoundingClientRect();
    const t = target.current?.getBoundingClientRect();
    if (!b || !t) return;
    const x2 = t.left + t.width * 0.5 - b.left;
    const y2 = t.top + t.height * 0.5 - b.top;
    setSize({ w: b.width, h: b.height });
    setLines((prev) =>
      cards.current.map((el, i) => {
        const r = el?.getBoundingClientRect();
        if (!r) return { d: "", dur: 3, delay: 0 };
        const x1 = r.right - b.left;
        const y1 = r.top + r.height / 2 - b.top;
        const dx = x2 - x1;
        return {
          d: `M${x1.toFixed(1)} ${y1.toFixed(1)} C${(x1 + dx * 0.45).toFixed(1)} ${y1.toFixed(1)}, ${(x2 - dx * 0.5).toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`,
          // keep each line's own rhythm across re-measures
          dur: prev[i]?.dur ?? 2.2 + Math.random() * 1.6,
          delay: prev[i]?.delay ?? Math.random() * 2,
        };
      })
    );
  }, []);

  // re-measure once the reveal animation has settled things into place
  useEffect(() => {
    if (!inView) return;
    const t = window.setTimeout(measure, 900);
    return () => window.clearTimeout(t);
  }, [inView, measure]);

  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <section id="setup" className="bzl-section bzl-screen relative overflow-hidden bg-[linear-gradient(180deg,#fff,#fff8f0_45%,#fff)]">
      {/* the classic landing's warm glow around the section's edges */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-48 top-[10%] h-[45%] w-96 rounded-[50%] bg-[rgba(249,163,83,0.28)] blur-[80px]" />
        <div className="absolute -right-48 bottom-[8%] h-[45%] w-96 rounded-[50%] bg-[rgba(249,163,83,0.26)] blur-[80px]" />
        <div className="absolute -top-40 left-[20%] h-56 w-[60%] rounded-[50%] bg-[rgba(249,163,83,0.18)] blur-[80px]" />
      </div>

      <div className="bzl-wrap relative">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="bzl-kicker">{setup.badge}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="bzl-statement-sm mt-3">{setup.title}</h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="bzl-lead mx-auto mt-[2svh] max-w-2xl">{setup.lead}</p>
          </Reveal>
        </div>

        <div ref={ref} className="mx-auto mt-[4svh] max-w-5xl">
          <div ref={box} className="relative flex items-center justify-between gap-6 sm:gap-12">
            {/* the wiring, behind the cards and the avatar */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-visible"
              width={size.w}
              height={size.h}
              viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
            >
              {lines.map((l, i) =>
                l.d ? (
                  <g key={i}>
                    <path
                      d={l.d}
                      pathLength={1000}
                      fill="none"
                      stroke="rgba(242,140,56,0.38)"
                      strokeWidth={5}
                      strokeLinecap="round"
                      className={inView ? "bzl-wire" : "opacity-0"}
                      style={{ "--bzl-delay": `${i * 120}ms` } as CSSProperties}
                    />
                    {inView && (
                      <path
                        d={l.d}
                        pathLength={1000}
                        fill="none"
                        stroke="rgba(255,255,255,0.95)"
                        strokeWidth={3}
                        strokeLinecap="round"
                        className="bzl-spark"
                        style={{ "--dur": `${l.dur}s`, "--bzl-delay": `${0.8 + l.delay}s` } as CSSProperties}
                      />
                    )}
                  </g>
                ) : null
              )}
            </svg>

            {/* Your Shopify store data */}
            <Reveal className="relative z-10 w-full max-w-[min(26rem,58%)] rounded-[26px] border border-[color-mix(in_oklab,var(--bzl-orange)_22%,transparent)] bg-white/75 p-3 shadow-[0_30px_70px_-40px_rgba(236,119,9,0.45)] backdrop-blur-md sm:p-4">
              <p className="flex items-center justify-center gap-2 pb-3 pt-1 text-sm font-semibold text-[var(--bzl-orange-dark)] sm:text-base">
                <FaShopify className="h-4 w-4 sm:h-5 sm:w-5" />
                {setup.storeDataTitle}
              </p>
              <ul className="grid gap-[max(0.375rem,0.9svh)]">
                {setup.dataCards.map((card, i) => {
                  const Icon = ICONS[i];
                  return (
                    <li
                      key={card.title}
                      ref={(el) => (cards.current[i] = el)}
                      className="group relative flex h-[clamp(2.4rem,5.4svh,3.5rem)] items-center gap-3 overflow-hidden rounded-2xl bg-[color-mix(in_oklab,var(--bzl-orange)_11%,#fff)] px-3.5 shadow-[0_4px_20px_-4px_rgba(28,24,20,0.06),0_2px_8px_-2px_rgba(242,140,56,0.1)] transition-transform duration-300 hover:scale-[1.02]"
                    >
                      {/* the classic cards' Shopify watermark */}
                      <FaShopify aria-hidden="true" className="absolute -right-1 top-1/2 h-10 w-10 -translate-y-1/2 text-[var(--bzl-orange)] opacity-[0.12] transition-opacity group-hover:opacity-20" />
                      <Icon className="relative h-[1.05rem] w-[1.05rem] flex-shrink-0 text-[color-mix(in_oklab,var(--bzl-orange-strong)_75%,transparent)] transition-colors group-hover:text-[var(--bzl-orange-strong)]" />
                      <span className="relative min-w-0 truncate text-[15px] font-semibold tracking-[-0.01em] text-[var(--bzl-fg)] sm:text-base">
                        {card.title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Reveal>

            {/* the agent, charging up with every pulse */}
            <Reveal delay={150} className="relative z-10 mr-[4%] flex flex-shrink-0 justify-center">
              <div ref={target} className="relative h-[clamp(14rem,40svh,26rem)]">
                <span aria-hidden="true" className="bzl-charge-aura absolute left-1/2 top-1/2 aspect-square w-[150%] rounded-full" />
                <span aria-hidden="true" className="bzl-charge-aura is-wide absolute left-1/2 top-1/2 aspect-square w-[200%] rounded-full" />
                <div aria-hidden="true" className="absolute inset-x-[-25%] bottom-[-3%] h-[10%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(236,119,9,0.3),transparent)]" />
                <AgentImage name="setup-will" alt={messages.landing.agentAlt} sizes="300px" className="relative h-full w-auto" />
                {/* the same render, glowing orange, breathing in and out */}
                <AgentImage name="setup-will" alt="" sizes="300px" className="bzl-charge-glow absolute inset-0 h-full w-auto" />
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal className="mt-[3.5svh] text-center">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-semibold text-[var(--bzl-ink-2)]">
            {[
              { Icon: FaBolt, label: setup.badges.oneClick },
              { Icon: FaSync, label: setup.badges.alwaysSynced },
              { Icon: FaShoppingCart, label: setup.badges.readyInMinutes },
            ].map(({ Icon, label }) => (
              <span key={label} className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-[var(--bzl-orange-strong)]" />
                {label}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default SetupSection;
