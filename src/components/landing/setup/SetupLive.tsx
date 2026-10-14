import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMessages } from "@/i18n/LocaleProvider";
import { StoreWindow } from "../clay";
import { HeadCircle } from "../BizmisWidget";
import { ChargeAvatar, Cursor, InstallButton, LiveBadge, ProductCard, Spark, Stage, SyncedNow } from "./shared";
import { CATALOG, CHANGES, NEW_AT, PRICE_AT, STOCK_AT, curve, curveV, storeAfter } from "./data";
import { useMedia, useReducedMotion, useScript, useViewport, useViewportHeight } from "./hooks";

/**
 * Concept 1, "Click → Live". A store with its Bizmis widget off and the agent
 * a dark silhouette beside it. A cursor clicks Install, and in that same
 * instant the widget is on, the agent lights up and charges, and the store
 * is linked to him for good. Then the heartbeat: the store keeps changing (a
 * new price, a sold-out product, a new arrival, a returns banner) and each
 * change flies down the link into the agent as a spark ("Synced just now"),
 * on a loop. The agent recharges at the top of every loop.
 */

type Layout = {
  W: number;
  H: number;
  win: { x: number; y: number; w: number; h: number };
  /** the product grid, inside the window */
  grid: { x: number; y: number; cols: number; tile: number; gap: number; rowGap: number; count: number };
  banner: { y: number; h: number };
  head: { x: number; y: number; size: number };
  agent: { x: number; y: number; w: number };
  button: { x: number; y: number };
  status: { x: number; y: number };
  /** where the link leaves the store, and where it lands on the agent */
  out: { x: number; y: number };
  chest: { x: number; y: number };
  vertical: boolean;
};

const DESKTOP: Layout = {
  W: 1120,
  H: 520,
  win: { x: 0, y: 20, w: 640, h: 480 },
  grid: { x: 93, y: 136, cols: 4, tile: 100, gap: 18, rowGap: 24, count: 8 },
  banner: { y: 44, h: 36 },
  head: { x: 562, y: 410, size: 62 },
  agent: { x: 862, y: 72, w: 240 },
  button: { x: 752, y: 262 },
  status: { x: 752, y: 250 },
  out: { x: 644, y: 330 },
  chest: { x: 982, y: 292 },
  vertical: false,
};

const MOBILE: Layout = {
  W: 360,
  H: 690,
  win: { x: 0, y: 0, w: 360, h: 404 },
  grid: { x: 26, y: 92, cols: 3, tile: 92, gap: 16, rowGap: 22, count: 6 },
  banner: { y: 44, h: 34 },
  head: { x: 298, y: 372, size: 50 },
  agent: { x: 196, y: 426, w: 150 },
  button: { x: 180, y: 530 },
  status: { x: 96, y: 540 },
  out: { x: 180, y: 408 },
  chest: { x: 271, y: 564 },
  vertical: true,
};

const tileCenter = (L: Layout, i: number) => {
  const g = L.grid;
  const col = i % g.cols;
  const row = Math.floor(i / g.cols);
  return {
    x: L.win.x + g.x + col * (g.tile + g.gap) + g.tile / 2,
    y: L.win.y + g.y + row * (g.tile + 30 + g.rowGap) + g.tile / 2,
  };
};

/** Where each change happens on the page. */
const changeAt = (L: Layout, k: number) => {
  const c = CHANGES[k];
  if (c === "policy") return { x: L.win.x + L.win.w / 2, y: L.win.y + L.banner.y + L.banner.h / 2 };
  return tileCenter(L, c === "price" ? PRICE_AT : c === "stock" ? STOCK_AT : NEW_AT);
};

const OPEN = { cursor: 400, press: 1250, live: 1420 };
/** each change, then a breath; then the store settles back and he recharges */
const EVERY = 2800;
const FLIGHT = 1100;

type Phase = "idle" | "cursor" | "press" | "live";

const SetupLive = () => {
  const m = useMessages();
  const copy = m.landing.setup;
  const mobile = !useMedia("(min-width: 768px)");
  const reduced = useReducedMotion();
  const vh = useViewportHeight();
  const L = mobile ? MOBILE : DESKTOP;
  const { ref, on, seen } = useViewport<HTMLDivElement>(0.35);

  const [phase, setPhase] = useState<Phase>("idle");
  const [n, setN] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const [resetting, setResetting] = useState(false);
  const [charge, setCharge] = useState(0);
  const [hit, setHit] = useState(0);
  const [tick, setTick] = useState(0);
  const [event, setEvent] = useState<number | null>(null);
  const [spark, setSpark] = useState<{ key: number; d: string } | null>(null);

  useScript(seen, [
    [OPEN.cursor, () => setPhase("cursor")],
    [OPEN.press, () => setPhase("press")],
    [
      OPEN.live,
      () => {
        setPhase("live");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setN(CHANGES.length);
          return;
        }
        setCharge((c) => c + 1);
      },
    ],
  ]);

  const live = phase === "live";
  const link = L.vertical
    ? curveV(L.out.x, L.out.y, L.chest.x, L.chest.y, 0.55)
    : curve(L.out.x, L.out.y, L.chest.x, L.chest.y, 0.5);
  const sparkPath = (k: number) => {
    const p = changeAt(L, k);
    const toEdge = L.vertical ? curveV(p.x, p.y, L.out.x, L.out.y, 0.6) : curve(p.x, p.y, L.out.x, L.out.y, 0.6);
    return toEdge + " " + link.replace(/^M[^C]+/, "");
  };

  // the heartbeat: one change every few seconds, while on screen
  const step = useRef(0);
  const layout = useRef(L);
  layout.current = L;
  useEffect(() => {
    if (!live || !on || reduced) return;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const beat = () => {
      const k = step.current % (CHANGES.length + 1);
      step.current += 1;
      if (k < CHANGES.length) {
        setN(k + 1);
        setLit(k);
        setSpark({ key: step.current, d: sparkPath(k) });
        later(FLIGHT, () => {
          setHit((h) => h + 1);
          setTick((t) => t + 1);
          setEvent(k);
          setLit(null);
        });
        later(EVERY, beat);
      } else {
        // the store settles back, quietly, and he charges up for the next round
        setResetting(true);
        later(450, () => {
          setN(0);
          setEvent(null);
          setResetting(false);
          setCharge((c) => c + 1);
        });
        later(2400, beat);
      }
    };
    later(step.current === 0 ? 2600 : 900, beat);
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, on, reduced, mobile]);

  const s = storeAfter(n);
  const g = L.grid;
  const litIndex = lit === null ? -1 : CHANGES[lit] === "price" ? PRICE_AT : CHANGES[lit] === "stock" ? STOCK_AT : CHANGES[lit] === "product" ? NEW_AT : -1;
  const eventLabel = (k: number) => {
    const c = CHANGES[k];
    return c === "product" ? `${copy.changes.product}: ${copy.newProduct}` : copy.changes[c];
  };
  const maxH = mobile ? Infinity : Math.max(340, vh - 400);

  return (
    <div ref={ref} className="mx-auto mt-[4svh] max-w-6xl">
      <Stage w={L.W} h={L.H} maxH={maxH}>
        {/* the link: drawn the instant it goes live, a heartbeat always travelling it */}
        <svg aria-hidden="true" className="absolute inset-0 overflow-visible" width={L.W} height={L.H}>
          <defs>
            <linearGradient id="bzs1-link" gradientUnits="userSpaceOnUse" x1={L.out.x} y1={L.out.y} x2={L.chest.x} y2={L.chest.y}>
              <stop offset="0" stopColor="rgb(249 163 83 / 0.5)" />
              <stop offset="1" stopColor="rgb(242 140 56 / 0.75)" />
            </linearGradient>
          </defs>
          <path d={link} pathLength={1000} stroke="url(#bzs1-link)" strokeWidth={3.5} className={cn("bzs-wire", live && "is-on")} />
          {live && (
            <>
              <path d={link} pathLength={1000} stroke="rgb(249 146 52 / 0.35)" strokeWidth={9} className="bzs-beat" style={{ filter: "blur(4px)" }} />
              <path d={link} pathLength={1000} stroke="#fff3e3" strokeWidth={3} className="bzs-beat" />
            </>
          )}
        </svg>

        {/* the store */}
        <div
          className={cn("absolute transition-opacity", resetting && "bzs-resetting")}
          style={{ left: L.win.x, top: L.win.y, width: L.win.w, height: L.win.h }}
        >
          <StoreWindow label={m.landing.yourStore} className="h-full">
            {/* the announcement bar: where a new policy shows up */}
            <div
              className={cn(
                "flex items-center justify-center gap-3 border-b border-[var(--bzl-border)] text-[13px] font-semibold transition-colors duration-500",
                s.policy ? "bg-[color-mix(in_oklab,var(--bzl-orange)_16%,#fff)] text-[var(--bzl-orange-dark)]" : "bg-[#fbf7f2]",
              )}
              style={{ height: L.banner.h }}
            >
              {s.policy ? (
                <span key="policy" className="bzs-pop">
                  {copy.changes.policy}
                </span>
              ) : (
                <>
                  <span className="bzl-tile-line w-24" />
                  <span className="bzl-tile-line w-10" />
                </>
              )}
            </div>
            {!L.vertical && (
              <div aria-hidden="true" className="flex h-[46px] items-center gap-3 px-10">
                <span className="h-6 w-6 rounded-md bg-[#e6dccf]" />
                <span className="bzl-tile-line h-2.5 w-20" />
                <span className="ml-auto flex gap-4">
                  <span className="bzl-tile-line w-10" />
                  <span className="bzl-tile-line w-12" />
                  <span className="bzl-tile-line w-9" />
                </span>
              </div>
            )}
            <div aria-hidden="true" className="absolute" style={{ left: g.x, top: g.y }}>
              <div
                className="grid"
                style={{ gridTemplateColumns: `repeat(${g.cols}, ${g.tile}px)`, columnGap: g.gap, rowGap: g.rowGap }}
              >
                {CATALOG.slice(0, g.count).map((p, i) => (
                  <ProductCard key={i} p={p} i={i} s={s} size={g.tile} lit={litIndex === i} />
                ))}
              </div>
            </div>
          </StoreWindow>
        </div>

        {/* the store's Bizmis widget: off (an empty slot) → on (the agent, speaking) */}
        <div
          className="absolute z-10"
          style={{ left: L.head.x, top: L.head.y, width: L.head.size, height: L.head.size }}
        >
          <span
            className={cn(
              "absolute inset-0 rounded-full border-2 border-dashed border-[var(--bzl-border-strong)] bg-white/70 transition-opacity duration-300",
              live && "opacity-0",
            )}
          />
          <span className={cn("absolute inset-0 transition-[opacity,transform] duration-300", live ? "scale-100 opacity-100" : "scale-50 opacity-0")}>
            <HeadCircle head="will" size={L.head.size} speaking={live} className="shadow-[0_10px_24px_-10px_rgba(28,24,20,0.45)] rounded-full" />
          </span>
        </div>

        {/* the agent */}
        <div className="absolute z-[5]" style={{ left: L.agent.x, top: L.agent.y, width: L.agent.w }}>
          <ChargeAvatar on={live} charge={charge} hit={hit} />
        </div>

        {/* one click */}
        <div
          aria-hidden={live}
          className={cn(
            "absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-[opacity,transform] duration-300",
            phase === "idle" && "opacity-100",
            live && "pointer-events-none scale-110 opacity-0",
          )}
          style={{ left: L.button.x, top: L.button.y }}
        >
          <InstallButton big={!mobile} pressed={phase === "press"} />
          <Cursor
            className={cn(
              phase === "idle" && "translate-x-[90px] translate-y-[70px] opacity-0",
              (phase === "cursor" || phase === "press") && "translate-x-0 translate-y-0 opacity-100",
              phase === "press" && "scale-90",
              live && "translate-x-[40px] translate-y-[50px] opacity-0",
            )}
            style={{ left: "55%", top: "45%" }}
          />
        </div>
        {/* the shockwave, left behind as the button turns into the status */}
        {live && !reduced && (
          <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: L.button.x, top: L.button.y }}>
            <InstallButton big={!mobile} ring className="opacity-0" />
          </div>
        )}

        {/* the status: live, and synced just now (the change that just landed pops above) */}
        <div
          className={cn(
            "absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2.5 transition-[opacity,transform] duration-500",
            live ? "scale-100 opacity-100" : "scale-75 opacity-0",
          )}
          style={{ left: L.status.x, top: L.status.y }}
        >
          <span className="flex h-[30px] items-end">
            {event !== null && (
              <span key={tick} className="bzs-event">
                <svg viewBox="0 0 12 12" aria-hidden="true" className="h-3 w-3 text-[var(--bzl-orange-strong)]">
                  <path d="M2.5 6.5l2.3 2.2L9.5 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {eventLabel(event)}
              </span>
            )}
          </span>
          <LiveBadge className={mobile ? "" : "!text-[19px]"} />
          <SyncedNow tick={tick} />
        </div>

        {spark && !reduced && <Spark key={spark.key} d={spark.d} dur={FLIGHT} />}
      </Stage>
    </div>
  );
};

export default SetupLive;
