import { useEffect, useState } from "react";
import { CalendarDays, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages } from "@/i18n/LocaleProvider";
import { ChargeAvatar, Cursor, InstallButton, LiveBadge, Stage, SyncedNow } from "./shared";
import { CHANGES } from "./data";
import { useMedia, useReducedMotion, useScript, useTicker, useViewport, useViewportHeight } from "./hooks";

/**
 * Concept 3, "Split second". Two cards side by side, both reading "Ready
 * in". Other tools: a setup checklist creeping through the days (train the
 * bot, upload FAQs, map the catalog, test), the counter climbing to 14 days.
 * Bizmis: one click and it reads 0 s, the agent charges up and goes live
 * while the other side is still on day 2. Then the other side's whole
 * checklist is crossed out (you skip all of it), and Bizmis keeps an
 * always-on sync pulse, each beat a store change synced just now.
 */

/** the day each step of a typical setup is done by */
const DAYS = [2, 5, 9, 14];
const STEP_MS = 950;
const STEPS_AT = 300;
const OPEN = { cursor: 450, press: 1150, live: 1320 };
const STRIKE_AT = STEPS_AT + DAYS.length * STEP_MS + 350;
/** one heartbeat = one change synced */
const BEAT = 2600;

type Layout = {
  W: number;
  H: number;
  others: { x: number; y: number; w: number; h: number };
  bizmis: { x: number; y: number; w: number; h: number };
  avatar: { x: number; y: number; w: number };
  ecg: { x: number; y: number; w: number };
};

const DESKTOP: Layout = {
  W: 1120,
  H: 460,
  others: { x: 0, y: 20, w: 500, h: 420 },
  bizmis: { x: 540, y: 0, w: 580, h: 460 },
  avatar: { x: 905, y: 70, w: 200 },
  ecg: { x: 32, y: 334, w: 330 },
};

const MOBILE: Layout = {
  W: 360,
  H: 860,
  others: { x: 0, y: 0, w: 360, h: 372 },
  bizmis: { x: 0, y: 396, w: 360, h: 464 },
  avatar: { x: 216, y: 490, w: 136 },
  ecg: { x: 20, y: 330, w: 320 },
};

/** an ECG trace, `beats` heartbeats across `w` px, 60 px tall */
const ecgPath = (w: number, beats = 3) => {
  const seg = w / beats;
  let d = "M0 34";
  for (let b = 0; b < beats; b++) {
    const x = b * seg;
    const p = (f: number) => (x + seg * f).toFixed(1);
    d += ` L${p(0.32)} 34 L${p(0.38)} 28 L${p(0.44)} 34 L${p(0.5)} 34 L${p(0.55)} 6 L${p(0.6)} 54 L${p(0.65)} 34 L${p(0.74)} 34 L${p(0.8)} 30 L${p(0.86)} 34 L${p(1)} 34`;
  }
  return d;
};

type Phase = "idle" | "cursor" | "press" | "live";

const SetupSplit = () => {
  const m = useMessages();
  const copy = m.landing.setup;
  const mobile = !useMedia("(min-width: 768px)");
  const reduced = useReducedMotion();
  const vh = useViewportHeight();
  const L = mobile ? MOBILE : DESKTOP;
  const { ref, on, seen } = useViewport<HTMLDivElement>(0.3);

  const [phase, setPhase] = useState<Phase>("idle");
  /** steps of the other tools' setup done so far (-1: not started) */
  const [done, setDone] = useState(-1);
  const [struck, setStruck] = useState(false);
  const [charge, setCharge] = useState(0);
  const [hit, setHit] = useState(0);
  const [tick, setTick] = useState(0);
  const [event, setEvent] = useState<number | null>(null);

  useScript(seen, [
    [STEPS_AT, () => setDone(0)],
    ...DAYS.map((_, i) => [STEPS_AT + (i + 1) * STEP_MS, () => setDone(i + 1)] as [number, () => void]),
    [OPEN.cursor, () => setPhase("cursor")],
    [OPEN.press, () => setPhase("press")],
    [
      OPEN.live,
      () => {
        setPhase("live");
        setCharge((c) => c + 1);
      },
    ],
    [
      STRIKE_AT,
      () => {
        // (reduced motion lands here directly: the outcome, all at once)
        setPhase("live");
        setDone(DAYS.length);
        setStruck(true);
      },
    ],
  ].sort((a, b) => (a[0] as number) - (b[0] as number)) as [number, () => void][]);

  const live = phase === "live";
  // the pulse: every heartbeat a change syncs; every fourth, he charges up again
  useTicker(live && on && !reduced, BEAT, (n) => {
    setEvent((n - 1) % CHANGES.length);
    setTick((t) => t + 1);
    setHit((h) => h + 1);
    if (n % CHANGES.length === 0) setCharge((c) => c + 1);
  });
  useEffect(() => {
    if (live && reduced) setEvent(null);
  }, [live, reduced]);

  const days = done <= 0 ? 0 : DAYS[Math.min(done, DAYS.length) - 1];
  const maxH = mobile ? Infinity : Math.max(340, vh - 400);
  const eventLabel = (k: number) => {
    const c = CHANGES[k];
    return c === "product" ? `${copy.changes.product}: ${copy.newProduct}` : copy.changes[c];
  };

  return (
    <div ref={ref} className="mx-auto mt-[4svh] max-w-6xl">
      <Stage w={L.W} h={L.H} maxH={maxH}>
        {/* other tools: days of setup */}
        <div
          className={cn("bzs-others absolute rounded-[24px] p-7", struck && "is-struck", mobile && "p-6")}
          style={{ left: L.others.x, top: L.others.y, width: L.others.w, height: L.others.h }}
        >
          <p className="text-[15px] font-semibold text-[var(--bzl-faint)]">{copy.others}</p>
          <p className="mt-4 text-[14px] font-semibold uppercase tracking-[0.12em] text-[var(--bzl-faint)]">{copy.readyIn}</p>
          <p className="mt-1 flex items-baseline gap-2 text-[var(--bzl-muted)]">
            <span className={cn("bzs-strike text-[60px] font-bold leading-none tracking-[-0.04em] tabular-nums", struck && "is-struck")} style={{ ["--d" as string]: "760ms" }}>
              <span key={days} className={days ? "bzs-pop inline-block" : "inline-block"}>
                {days || "–"}
              </span>
            </span>
            <span className="text-[22px] font-semibold">{copy.days}</span>
          </p>
          <ul className="mt-7 grid gap-3.5">
            {copy.steps.map((label, i) => {
              const state = done > i ? "done" : done === i ? "doing" : "todo";
              return (
                <li key={label} className={cn("bzs-step flex items-center gap-3", `is-${state}`)}>
                  <span className="bzs-step-mark grid h-6 w-6 flex-shrink-0 place-items-center rounded-full">
                    {state === "done" && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
                  </span>
                  <span
                    className={cn("bzs-strike text-[17px] font-semibold", struck && "is-struck")}
                    style={{ ["--d" as string]: `${i * 170}ms` }}
                  >
                    {label}
                  </span>
                  <span className="ml-auto flex items-center gap-1.5 text-[13px] font-semibold tabular-nums text-[var(--bzl-faint)]">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {DAYS[i]}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="absolute inset-x-7 bottom-7 h-1.5 overflow-hidden rounded-full bg-[#ece4da]">
            <div
              className="h-full rounded-full bg-[#cdbfae] transition-[width] ease-linear"
              style={{ width: `${(Math.max(0, done) / DAYS.length) * 100}%`, transitionDuration: `${STEP_MS}ms` }}
            />
          </div>
        </div>

        {/* Bizmis: one click, 0 s, and always in sync */}
        <div
          className={cn("bzs-bizmis absolute rounded-[26px]", live && "is-live")}
          style={{ left: L.bizmis.x, top: L.bizmis.y, width: L.bizmis.w, height: L.bizmis.h }}
        >
          <div className={cn("absolute left-8 top-8", mobile && "left-6 top-6")}>
            <p className="text-[15px] font-bold text-[var(--bzl-orange-dark)]">Bizmis</p>
            <p className="mt-4 text-[14px] font-semibold uppercase tracking-[0.12em] text-[var(--bzl-orange-dark)]/80">{copy.readyIn}</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span
                className={cn(
                  "bzs-zero text-[60px] font-bold leading-none tracking-[-0.04em] tabular-nums",
                  live ? "is-live text-[var(--bzl-orange-strong)]" : "text-[var(--bzl-faint)]",
                )}
              >
                {live ? 0 : "–"}
              </span>
              <span className={cn("text-[22px] font-semibold", live ? "text-[var(--bzl-orange-strong)]" : "text-[var(--bzl-faint)]")}>s</span>
            </p>
            <div className="relative mt-7 h-[52px]">
              <span className={cn("absolute left-0 top-0 transition-[opacity,transform] duration-300", live && "pointer-events-none scale-110 opacity-0")}>
                <InstallButton pressed={phase === "press"} />
                <Cursor
                  className={cn(
                    phase === "idle" && "translate-x-[80px] translate-y-[60px] opacity-0",
                    (phase === "cursor" || phase === "press") && "opacity-100",
                    phase === "press" && "scale-90",
                    live && "opacity-0",
                  )}
                  style={{ left: "55%", top: "45%" }}
                />
              </span>
              {live && !reduced && (
                <span className="pointer-events-none absolute left-0 top-0">
                  <InstallButton ring className="opacity-0" />
                </span>
              )}
              <span className={cn("absolute left-0 top-1 transition-[opacity,transform] duration-500", live ? "scale-100 opacity-100" : "scale-75 opacity-0")}>
                <LiveBadge className="!text-[18px]" />
              </span>
            </div>
          </div>

          {/* the pulse: always on, one beat per change */}
          <div className="absolute" style={{ left: L.ecg.x, top: L.ecg.y, width: L.ecg.w }}>
            <div className="mb-2 flex h-[30px] items-center gap-3">
              <SyncedNow tick={tick} className={cn("transition-opacity duration-500", live ? "opacity-100" : "opacity-0")} />
              {event !== null && (
                <span key={tick} className="bzs-event">
                  <Check className="h-3 w-3 text-[var(--bzl-orange-strong)]" strokeWidth={3} aria-hidden="true" />
                  {eventLabel(event)}
                </span>
              )}
            </div>
            <svg aria-hidden="true" width={L.ecg.w} height={60} viewBox={`0 0 ${L.ecg.w} 60`} className="overflow-visible">
              <path d={ecgPath(L.ecg.w)} className="bzs-ecg" stroke={live ? "rgb(242 140 56 / 0.3)" : "#e7ddd1"} strokeWidth={2.5} />
              {live && (
                <>
                  <path d={ecgPath(L.ecg.w)} pathLength={2000} className="bzs-ecg bzs-ecg-run" stroke="rgb(249 146 52 / 0.45)" strokeWidth={8} style={{ filter: "blur(4px)", ["--dur" as string]: `${BEAT * 3}ms` }} />
                  <path d={ecgPath(L.ecg.w)} pathLength={2000} className="bzs-ecg bzs-ecg-run" stroke="var(--bzl-orange-strong)" strokeWidth={3} style={{ ["--dur" as string]: `${BEAT * 3}ms` }} />
                </>
              )}
            </svg>
          </div>
        </div>

        <div className="absolute z-[6]" style={{ left: L.avatar.x, top: L.avatar.y, width: L.avatar.w }}>
          <ChargeAvatar on={live} charge={charge} hit={hit} />
        </div>
      </Stage>
    </div>
  );
};

export default SetupSplit;
