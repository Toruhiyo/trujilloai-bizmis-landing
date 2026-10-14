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
import Reveal from "./Reveal";
import { phaseAt, useRewindLoop } from "./useRewindLoop";

// Same order as messages.setup.dataCards (as on the classic landing).
const ICONS = [FaGlobe, FaTag, FaPercent, FaShieldAlt, FaUsers, FaBox];

type Line = { d: string; dur: number; delay: number };
type Phase = "idle" | "cursor" | "press" | "syncing" | "done";

/** The timeline, in ms from the moment the section is in view. */
const CURSOR_AT = 400;
const PRESS_AT = 1300;
const SYNC_AT = 1500;
const CARD_EVERY = 160;
/** The charge-up clip (scripts/setup-charge-anim.py): 92 frames at 24 fps. */
const CHARGE_MS = 3830;
/** After the charge, the sparks keep flowing a while before the rewind. */
const FLOW_MS = 600;
const CHARGE = {
  poster: "/landing/setup/charge-poster.webp",
  webm: "/landing/setup/charge.webm",
  // Safari only plays transparent video as HEVC with alpha
  hevc: "/landing/setup/charge.mov",
};
const isSafari = () =>
  typeof navigator !== "undefined" && /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);

/**
 * Setup on /v2: one click and the store is wired to the agent, right away. When
 * the section comes into view a cursor clicks the Install button, the store's
 * data cards sync in a quick ripple (each one's wire draws to the agent as it
 * ticks), and the agent (Will, full figure, in a rendered anime-style charge-up:
 * squeezed eyes, gritted teeth, a shout on the burst) charges up with it while
 * round sparks of energy travel every wire, card → agent. Then it all rewinds
 * (the clip scrubs backwards too) and plays again (useRewindLoop). The wires are
 * drawn from the real positions of the cards and the agent, so they always land.
 * Reduced motion shows the end state.
 */
const SetupSection = () => {
  const messages = useMessages();
  const setup = messages.setup;
  const copy = messages.landing.setup;
  const ref = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const target = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [button, setButton] = useState({ x: 0, y: 0 });
  const video = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => setSrc(isSafari() ? CHARGE.hevc : CHARGE.webm), []);

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

  const n = setup.dataCards.length;
  const doneAt = SYNC_AT + 200 + n * CARD_EVERY + 150;
  // the clip follows the timeline: it plays on the burst, and scrubs back on the rewind
  const lastT = useRef(0);
  const onFrame = useCallback(
    (t: number, rewinding: boolean) => {
      const v = video.current;
      const prev = lastT.current;
      lastT.current = t;
      if (!v) return;
      if (rewinding || t < doneAt) {
        if (!v.paused) v.pause();
        const at = Math.max(0, Math.min(CHARGE_MS, t - doneAt)) / 1000;
        if (Math.abs(v.currentTime - at) > 0.04) v.currentTime = at;
      } else if (prev < doneAt && t >= doneAt) {
        v.currentTime = 0;
        v.play().catch(() => undefined);
      }
    },
    [doneAt],
  );
  const loop = useRewindLoop(ref, { duration: doneAt + CHARGE_MS + FLOW_MS, rewind: 1100, threshold: 0.3, onFrame });
  const phase = phaseAt<Phase>(loop.t, [
    ["idle", 0],
    ["cursor", CURSOR_AT],
    ["press", PRESS_AT],
    ["syncing", SYNC_AT],
    ["done", doneAt],
  ]);
  const synced = Math.max(0, Math.min(n, Math.floor((loop.t - SYNC_AT - 200) / CARD_EVERY) + 1));
  const charging = !loop.rewinding && loop.t >= doneAt && loop.t < doneAt + CHARGE_MS;

  useEffect(() => {
    if (!loop.active) return;
    const t = window.setTimeout(measure, 900);
    return () => window.clearTimeout(t);
  }, [loop.active, measure]);

  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

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
              {/* marker line art (as the Sales funnel): flat primary strokes, solid dots for the energy */}
              <g className="bzl-setup-wires">
                {lines.map((l, i) =>
                  l.d ? (
                    <g key={i}>
                      <path
                        id={`setup-wire-${i}`}
                        d={l.d}
                        pathLength={1000}
                        fill="none"
                        className={cn("bzl-setup-wire", synced > i ? "bzl-wire" : "opacity-0")}
                      />
                      {/* the energy: solid marker dots travelling card → agent, two per wire */}
                      {phase === "done" &&
                        [0, 0.5].map((offset) => (
                          <g key={offset}>
                            <circle r={1} className="bzl-setup-spark">
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
            <Reveal className="relative z-10 w-full max-w-[min(20rem,52%)] rounded-[26px] border border-[color-mix(in_oklab,hsl(var(--primary))_22%,transparent)] bg-white/75 p-3 shadow-[0_30px_70px_-40px_rgba(249,163,83,0.45)] backdrop-blur-md sm:p-4">
              <p className="flex items-center justify-center gap-2 pb-3 pt-1 text-sm font-semibold text-[hsl(var(--primary))] sm:text-base">
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
                        "group relative flex h-[clamp(2.4rem,5.4svh,3.5rem)] items-center gap-3 overflow-hidden rounded-2xl px-3.5 shadow-[0_4px_20px_-4px_rgba(28,24,20,0.06),0_2px_8px_-2px_rgba(249,163,83,0.1)] transition-[background-color,opacity,transform] duration-500",
                        on ? "bg-[color-mix(in_oklab,hsl(var(--primary))_11%,#fff)] opacity-100" : "bg-white/70 opacity-60",
                      )}
                    >
                      {/* the classic cards' Shopify watermark */}
                      <FaShopify
                        aria-hidden="true"
                        className="absolute -right-1 top-1/2 h-10 w-10 -translate-y-1/2 text-[hsl(var(--primary))] opacity-[0.12]"
                      />
                      <Icon className="relative h-[1.05rem] w-[1.05rem] flex-shrink-0 text-[color-mix(in_oklab,hsl(var(--primary))_75%,transparent)]" />
                      <span className="relative min-w-0 flex-1 truncate text-[15px] font-semibold tracking-[-0.01em] text-[var(--bzl-fg)] sm:text-base">
                        {card.title}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "relative grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-[hsl(var(--primary))] text-white transition-[opacity,transform] duration-300",
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
                  "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_14px_30px_-12px_rgba(249,163,83,0.6)] transition-[transform,background-color,color] duration-200 sm:text-base",
                  phase === "press" ? "scale-90" : "scale-100",
                  phase === "syncing" || phase === "done"
                    ? "bg-white text-[hsl(var(--primary))] ring-1 ring-[color-mix(in_oklab,hsl(var(--primary))_35%,transparent)]"
                    : "bg-[hsl(var(--primary))] text-white",
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
                  className="absolute inset-x-[-25%] bottom-[-3%] h-[10%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(249,163,83,0.3),transparent)]"
                />
                {/* the charge-up, anime style (a rendered clip: squeezed eyes, gritted teeth, a shout on the burst) */}
                <video
                  ref={video}
                  key={src ?? "poster"}
                  aria-label={messages.landing.agentAlt}
                  muted
                  playsInline
                  preload="auto"
                  poster={CHARGE.poster}
                  className={cn("absolute inset-0 h-full w-full object-contain", charging && "bzl-charge-rim")}
                >
                  {src && <source src={src} type={src.endsWith(".mov") ? 'video/mp4; codecs="hvc1"' : "video/webm"} />}
                </video>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal className="mt-[3.5svh] text-center">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-semibold text-[var(--bzl-ink-2)]">
            {[
              { Icon: FaBolt, label: setup.badges.oneClick },
              { Icon: FaSync, label: setup.badges.alwaysSynced },
              { Icon: FaShoppingCart, label: copy.readyNow },
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
