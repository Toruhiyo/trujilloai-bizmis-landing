import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaBolt,
  FaBox,
  FaCheck,
  FaGlobe,
  FaPercent,
  FaShieldAlt,
  FaShopify,
  FaShoppingCart,
  FaSync,
  FaTag,
  FaUsers,
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useMessages } from "@/i18n/LocaleProvider";
import AgentImage from "./AgentImage";
import LiveAvatar from "./LiveAvatar";
import Reveal, { useInView } from "./Reveal";

// Same order as messages.setup.dataCards (as on the classic landing).
const ICONS = [FaGlobe, FaTag, FaPercent, FaShieldAlt, FaUsers, FaBox];

type Line = { d: string; dur: number; delay: number };
type Phase = "idle" | "cursor" | "press" | "syncing" | "done";

/** The opening, in ms from the moment the section is in view. */
const CURSOR_AT = 400;
const PRESS_AT = 1300;
const SYNC_AT = 1550;
const CARD_EVERY = 360;
/** After the opening, the agent charges up again every so often. */
const RECHARGE_EVERY = 10000;
const CHARGE_MS = 2400;

/**
 * Setup on /v2: one click and the store is wired to the agent. When the
 * section comes into view a cursor clicks the Install button, the button turns
 * into "Syncing your store", the store's data cards sync one by one (each one's
 * wire draws to the agent as it ticks), and once the last one lands the agent
 * (the live 3D Will, full figure) charges up with it. After that, round sparks
 * of energy keep travelling every wire, card → agent, and the agent recharges
 * every few seconds. The wires are drawn from the real positions of the cards
 * and the agent, so they always land. Reduced motion shows the end state.
 */
const SetupSection = () => {
  const messages = useMessages();
  const setup = messages.setup;
  const copy = messages.landing.setup;
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const box = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const target = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [ends, setEnds] = useState({ x1: 0, x2: 1 });
  const [button, setButton] = useState({ x: 0, y: 0 });
  const [phase, setPhase] = useState<Phase>("idle");
  const [synced, setSynced] = useState(0);
  const [charge, setCharge] = useState<{ name: string; key: number } | null>(null);
  const [charging, setCharging] = useState(false);

  // wire each card to the agent's chest, from the real layout
  const measure = useCallback(() => {
    const b = box.current?.getBoundingClientRect();
    const t = target.current?.getBoundingClientRect();
    if (!b || !t) return;
    const x2 = t.left + t.width * 0.5 - b.left;
    const y2 = t.top + t.height * 0.6 - b.top; // the chest, under the shirt logo
    setSize({ w: b.width, h: b.height });
    const first = cards.current[0]?.getBoundingClientRect();
    const last = cards.current[cards.current.length - 1]?.getBoundingClientRect();
    if (first && last) {
      setEnds({ x1: first.right - b.left, x2 });
      // the Install button sits in the gap between the cards and the agent
      setButton({ x: (first.right + t.left) / 2 - b.left, y: (first.top + last.bottom) / 2 - b.top });
    }
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
          dur: prev[i]?.dur ?? 2.4 + Math.random() * 1.4,
          delay: prev[i]?.delay ?? Math.random() * 2,
        };
      }),
    );
  }, []);

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

  const chargeUp = useCallback(() => {
    setCharge({ name: "charge_up", key: Date.now() });
    setCharging(true);
    window.setTimeout(() => setCharging(false), CHARGE_MS);
  }, []);

  // the opening: cursor, click, sync card by card, charge (once, on first view)
  const started = useRef(false);
  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const n = messages.setup.dataCards.length;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSynced(n);
      setPhase("done");
      return;
    }
    const timers = [
      window.setTimeout(() => setPhase("cursor"), CURSOR_AT),
      window.setTimeout(() => setPhase("press"), PRESS_AT),
      window.setTimeout(() => setPhase("syncing"), SYNC_AT),
      ...Array.from({ length: n }, (_, i) => window.setTimeout(() => setSynced(i + 1), SYNC_AT + 300 + i * CARD_EVERY)),
      window.setTimeout(() => {
        setPhase("done");
        chargeUp();
      }, SYNC_AT + 300 + n * CARD_EVERY + 250),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [inView, chargeUp, messages.setup.dataCards.length]);

  // and recharges now and then while in view
  useEffect(() => {
    if (phase !== "done" || !inView) return;
    const t = window.setInterval(chargeUp, RECHARGE_EVERY);
    return () => window.clearInterval(t);
  }, [phase, inView, chargeUp]);

  const label = phase === "done" ? copy.synced : phase === "syncing" ? copy.syncing : copy.install;

  return (
    <section
      id="setup"
      className="bzl-section bzl-screen relative overflow-hidden bg-[linear-gradient(180deg,#fff,#fff8f0_45%,#fff)]"
    >
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
            <h2 className="bzl-statement-sm mt-3">{copy.title}</h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="bzl-lead mx-auto mt-[2svh] max-w-2xl">{copy.lead}</p>
          </Reveal>
        </div>

        <div ref={ref} className="mx-auto mt-[4svh] max-w-5xl">
          <div ref={box} className="relative flex items-center justify-between gap-6 sm:gap-12">
            {/* the wiring, behind the cards and the agent */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-visible"
              width={size.w}
              height={size.h}
              viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
            >
              <defs>
                {/* the lines rise out of the cards and dissolve into the agent */}
                <linearGradient id="setup-fade" gradientUnits="userSpaceOnUse" x1={ends.x1} x2={ends.x2} y1="0" y2="0">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset="0.08" stopColor="#fff" />
                  <stop offset="0.84" stopColor="#fff" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <mask id="setup-mask" maskUnits="userSpaceOnUse">
                  <rect width={size.w || 1} height={size.h || 1} fill="url(#setup-fade)" />
                </mask>
                {/* warmer and stronger toward the agent, as the energy gathers */}
                <linearGradient id="setup-line" gradientUnits="userSpaceOnUse" x1={ends.x1} x2={ends.x2} y1="0" y2="0">
                  <stop offset="0" stopColor="rgb(249 163 83 / 0.2)" />
                  <stop offset="1" stopColor="rgb(242 140 56 / 0.42)" />
                </linearGradient>
                <radialGradient id="setup-spark-halo">
                  <stop offset="0" stopColor="rgb(249 146 52 / 0.75)" />
                  <stop offset="1" stopColor="rgb(249 146 52 / 0)" />
                </radialGradient>
              </defs>
              <g mask="url(#setup-mask)">
                {lines.map((l, i) =>
                  l.d ? (
                    <g key={i}>
                      <path
                        id={`setup-wire-${i}`}
                        d={l.d}
                        pathLength={1000}
                        fill="none"
                        stroke="url(#setup-line)"
                        strokeWidth={2.6}
                        strokeLinecap="round"
                        className={synced > i ? "bzl-wire" : "opacity-0"}
                      />
                      {/* the energy: round sparks travelling card → agent, two per wire */}
                      {phase === "done" &&
                        [0, 0.5].map((offset) => (
                          <g key={offset}>
                            <circle r={12} fill="url(#setup-spark-halo)">
                              <animateMotion
                                dur={`${l.dur}s`}
                                begin={`${-(l.delay + offset * l.dur)}s`}
                                repeatCount="indefinite"
                              >
                                <mpath href={`#setup-wire-${i}`} />
                              </animateMotion>
                            </circle>
                            <circle r={3.6} fill="rgb(255 247 236)">
                              <animateMotion
                                dur={`${l.dur}s`}
                                begin={`${-(l.delay + offset * l.dur)}s`}
                                repeatCount="indefinite"
                              >
                                <mpath href={`#setup-wire-${i}`} />
                              </animateMotion>
                            </circle>
                          </g>
                        ))}
                    </g>
                  ) : null,
                )}
              </g>
            </svg>

            {/* Your Shopify store data, syncing card by card */}
            <Reveal className="relative z-10 w-full max-w-[min(20rem,52%)] rounded-[26px] border border-[color-mix(in_oklab,var(--bzl-orange)_22%,transparent)] bg-white/75 p-3 shadow-[0_30px_70px_-40px_rgba(236,119,9,0.45)] backdrop-blur-md sm:p-4">
              <p className="flex items-center justify-center gap-2 pb-3 pt-1 text-sm font-semibold text-[var(--bzl-orange-dark)] sm:text-base">
                <FaShopify className="h-4 w-4 sm:h-5 sm:w-5" />
                {setup.storeDataTitle}
              </p>
              <ul className="grid gap-[max(0.375rem,0.9svh)]">
                {setup.dataCards.map((card, i) => {
                  const Icon = ICONS[i];
                  const on = synced > i;
                  return (
                    <li
                      key={card.title}
                      ref={(el) => (cards.current[i] = el)}
                      className={cn(
                        "group relative flex h-[clamp(2.4rem,5.4svh,3.5rem)] items-center gap-3 overflow-hidden rounded-2xl px-3.5 shadow-[0_4px_20px_-4px_rgba(28,24,20,0.06),0_2px_8px_-2px_rgba(242,140,56,0.1)] transition-[background-color,opacity,transform] duration-500",
                        on ? "bg-[color-mix(in_oklab,var(--bzl-orange)_11%,#fff)] opacity-100" : "bg-white/70 opacity-60",
                      )}
                    >
                      {/* the classic cards' Shopify watermark */}
                      <FaShopify
                        aria-hidden="true"
                        className="absolute -right-1 top-1/2 h-10 w-10 -translate-y-1/2 text-[var(--bzl-orange)] opacity-[0.12]"
                      />
                      <Icon className="relative h-[1.05rem] w-[1.05rem] flex-shrink-0 text-[color-mix(in_oklab,var(--bzl-orange-strong)_75%,transparent)]" />
                      <span className="relative min-w-0 flex-1 truncate text-[15px] font-semibold tracking-[-0.01em] text-[var(--bzl-fg)] sm:text-base">
                        {card.title}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "relative grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-[var(--bzl-orange-strong)] text-white transition-[opacity,transform] duration-300",
                          on ? "scale-100 opacity-100" : "scale-50 opacity-0",
                        )}
                      >
                        <FaCheck className="h-2.5 w-2.5" />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Reveal>

            {/* one click: the Install button between the store and the agent, clicked by the cursor */}
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-[opacity,transform] duration-500",
                phase === "idle" && "opacity-0",
                phase === "done" && "translate-y-[-80%] opacity-0 delay-700",
              )}
              style={{ left: button.x, top: button.y }}
            >
              <span
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_14px_30px_-12px_rgba(236,119,9,0.6)] transition-[transform,background-color,color] duration-200 sm:text-base",
                  phase === "press" ? "scale-90" : "scale-100",
                  phase === "syncing" || phase === "done"
                    ? "bg-white text-[var(--bzl-orange-dark)] ring-1 ring-[color-mix(in_oklab,var(--bzl-orange)_35%,transparent)]"
                    : "bg-[var(--bzl-orange-strong)] text-white",
                )}
              >
                {phase === "syncing" ? (
                  <FaSync className="h-3.5 w-3.5 animate-spin" />
                ) : phase === "done" ? (
                  <FaCheck className="h-3.5 w-3.5" />
                ) : (
                  <FaShopify className="h-4 w-4" />
                )}
                {label}
              </span>
              {/* the cursor glides in and clicks */}
              <svg
                viewBox="0 0 24 24"
                className={cn(
                  "absolute left-1/2 top-1/2 h-6 w-6 drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)] transition-[transform,opacity] duration-700 ease-out",
                  phase === "idle" && "translate-x-16 translate-y-14 opacity-0",
                  phase === "cursor" && "translate-x-1 translate-y-1 opacity-100",
                  phase === "press" && "translate-x-1 translate-y-1 scale-90 opacity-100",
                  (phase === "syncing" || phase === "done") && "translate-x-8 translate-y-10 opacity-0",
                )}
              >
                <path d="M4 2l15 9-6.5 1.6L16 20l-3 1.4-3.5-7.4L4 18z" fill="#1c1814" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </div>

            {/* the agent, charging up as the energy lands */}
            <Reveal delay={150} className="relative z-10 mr-[4%] flex flex-shrink-0 justify-center">
              <div ref={target} className="relative aspect-[720/1199] h-[clamp(14rem,40svh,26rem)]">
                <span
                  aria-hidden="true"
                  className={cn(
                    "bzl-charge-aura absolute left-1/2 top-1/2 aspect-square w-[150%] rounded-full transition-opacity duration-700",
                    phase === "done" ? "opacity-100" : "!opacity-0",
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "bzl-charge-aura is-wide absolute left-1/2 top-1/2 aspect-square w-[200%] rounded-full transition-opacity duration-700",
                    phase === "done" ? "opacity-100" : "!opacity-0",
                  )}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-[-25%] bottom-[-3%] h-[10%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(236,119,9,0.3),transparent)]"
                />
                <div className={cn("absolute inset-0", charging && "bzl-charge-rim")}>
                  <LiveAvatar
                    model="will"
                    fullBody
                    greet={false}
                    shirtColor="#F9A353"
                    gesture={charge}
                    fallback={
                      <AgentImage
                        name="setup-will"
                        alt={messages.landing.agentAlt}
                        sizes="300px"
                        className="absolute inset-0 h-full w-full object-contain"
                      />
                    }
                  />
                </div>
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
