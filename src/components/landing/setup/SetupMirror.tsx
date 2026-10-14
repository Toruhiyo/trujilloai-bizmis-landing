import { useEffect, useRef, useState } from "react";
import { FaShopify } from "react-icons/fa";
import { Home, Inbox, Package, Percent, Plus, Settings, ShieldCheck, Tag, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages } from "@/i18n/LocaleProvider";
import { CLAY, TINT } from "../clay";
import type { ClayShape } from "../clay";
import { HeadCircle } from "../BizmisWidget";
import {
  ChargeAvatar,
  Cursor,
  InstallButton,
  LiveBadge,
  Spark,
  Stage,
  SyncedNow,
} from "./shared";
import { curveV } from "./data";
import { useMedia, useReducedMotion, useScript, useViewport, useViewportHeight } from "./hooks";

/**
 * Concept 2, "Mirror". The Shopify admin on one side, what the agent knows on
 * the other, row for row. One click links them: every row shows up on the
 * agent's side at once (not one by one, all of it, right away). Then you keep
 * running your store: a cursor edits a price, marks a product sold out, adds
 * a new one, changes the returns policy, and each edit crosses the link as a
 * spark and lands on the agent's side the same second. Forever, on a loop.
 */

type Row = { shape: ClayShape; tint: keyof typeof TINT; price: number; stock: number };
const ROWS: Row[] = [
  { shape: "sphere", tint: "sand", price: 48, stock: 24 },
  { shape: "torus", tint: "blush", price: 36, stock: 12 },
  { shape: "capsule", tint: "sage", price: 29, stock: 40 },
];
const NEW_ROW: Row = { shape: "lens", tint: "warm", price: 38, stock: 20 };

/** The edits, in loop order: which row each touches (3 = the new product, 4 = the policy). */
type Edit = "price" | "stock" | "product" | "policy";
const EDITS: Edit[] = ["price", "stock", "product", "policy"];
const EDIT_ROW: Record<Edit, number> = { price: 0, stock: 1, product: 3, policy: 4 };

type Layout = {
  W: number;
  H: number;
  admin: { x: number; y: number; w: number; h: number };
  agentCard: { x: number; y: number; w: number; h: number };
  /** row tops, relative to each card (5 slots: 3 products, the new one, the policy) */
  rowsY: number[];
  agentRowsY: number[];
  rowH: number;
  side: number;
  /** the agent's rows: left and width, inside his card */
  agentRows: { x: number; w: number };
  avatar: { x: number; y: number; w: number };
  button: { x: number; y: number };
  synced: { x: number; y: number };
  vertical: boolean;
};

const DESKTOP: Layout = {
  W: 1120,
  H: 460,
  admin: { x: 0, y: 10, w: 450, h: 440 },
  agentCard: { x: 670, y: 10, w: 450, h: 440 },
  rowsY: [76, 140, 204, 268, 362],
  agentRowsY: [76, 140, 204, 268, 362],
  rowH: 56,
  side: 52,
  agentRows: { x: 18, w: 250 },
  avatar: { x: 940, y: 150, w: 172 },
  button: { x: 560, y: 245 },
  synced: { x: 560, y: 432 },
  vertical: false,
};

const MOBILE: Layout = {
  W: 360,
  H: 880,
  admin: { x: 0, y: 0, w: 360, h: 388 },
  agentCard: { x: 0, y: 486, w: 360, h: 394 },
  rowsY: [62, 120, 178, 236, 316],
  agentRowsY: [62, 120, 178, 236, 316],
  rowH: 50,
  side: 40,
  agentRows: { x: 10, w: 238 },
  avatar: { x: 248, y: 680, w: 112 },
  button: { x: 180, y: 437 },
  synced: { x: 180, y: 437 },
  vertical: true,
};

const OPEN = { cursor: 400, press: 1250, live: 1420 };
const EVERY = 3200;
/** the cursor reaches the field, the edit commits, the spark crosses */
const AT_FIELD = 650;
const COMMIT = 1150;
const FLIGHT = 650;

type Phase = "idle" | "cursor" | "press" | "live";

const Thumb = ({ r, size }: { r: Row; size: number }) => (
  <span className="relative flex-shrink-0 overflow-hidden rounded-[10px]" style={{ width: size, height: size, background: TINT[r.tint] }}>
    <img src={CLAY[r.shape]} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover mix-blend-multiply" />
  </span>
);

const SetupMirror = () => {
  const m = useMessages();
  const copy = m.landing.setup;
  const mobile = !useMedia("(min-width: 768px)");
  const reduced = useReducedMotion();
  const vh = useViewportHeight();
  const L = mobile ? MOBILE : DESKTOP;
  const { ref, on, seen } = useViewport<HTMLDivElement>(0.3);

  const [phase, setPhase] = useState<Phase>("idle");
  /** edits committed in the admin, and edits that have reached the agent */
  const [made, setMade] = useState(0);
  const [known, setKnown] = useState(0);
  const [editing, setEditing] = useState<number | null>(null);
  const [landed, setLanded] = useState<number | null>(null);
  const [cursorAt, setCursorAt] = useState<{ x: number; y: number } | null>(null);
  const [resetting, setResetting] = useState(false);
  const [charge, setCharge] = useState(0);
  const [hit, setHit] = useState(0);
  const [tick, setTick] = useState(0);
  const [spark, setSpark] = useState<{ key: number; d: string } | null>(null);

  useScript(seen, [
    [OPEN.cursor, () => setPhase("cursor")],
    [OPEN.press, () => setPhase("press")],
    [
      OPEN.live,
      () => {
        setPhase("live");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setMade(EDITS.length);
          setKnown(EDITS.length);
          return;
        }
        setCharge((c) => c + 1);
        setTick((t) => t + 1);
      },
    ],
  ]);
  const live = phase === "live";

  // where an edit happens in the admin (its field), and its row on each side, in stage coordinates
  const field = (k: number) => {
    const e = EDITS[k];
    const y = L.admin.y + L.rowsY[EDIT_ROW[e]] + L.rowH / 2;
    const right = L.admin.x + L.admin.w - 22;
    if (e === "price") return { x: right - 20, y };
    if (e === "stock") return { x: right - (mobile ? 92 : 112), y };
    if (e === "product") return { x: L.admin.x + L.side + 40, y };
    return { x: L.admin.x + L.side + 120, y };
  };
  const rowOut = (i: number) => ({ x: L.admin.x + L.admin.w, y: L.admin.y + L.rowsY[i] + L.rowH / 2 });
  const rowIn = (i: number) => ({ x: L.agentCard.x + L.agentRows.x, y: L.agentCard.y + L.agentRowsY[i] + L.rowH / 2 });
  const wire = (i: number) => {
    const a = rowOut(i);
    const b = rowIn(i);
    return `M${a.x} ${a.y} L${b.x} ${b.y}`;
  };
  const cable = curveV(L.W / 2, L.admin.y + L.admin.h, L.W / 2, L.agentCard.y, 0.5);
  const sparkPath = (k: number) => {
    const i = EDIT_ROW[EDITS[k]];
    const f = field(k);
    if (!L.vertical) return `M${f.x} ${f.y} L${rowIn(i).x + 30} ${rowIn(i).y}`;
    const b = rowIn(i);
    return curveV(f.x, f.y, b.x + 60, b.y, 0.5);
  };

  // the loop: you edit, it knows
  const step = useRef(0);
  useEffect(() => {
    if (!live || !on || reduced) return;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const beat = () => {
      const k = step.current % (EDITS.length + 1);
      step.current += 1;
      if (k < EDITS.length) {
        setCursorAt(field(k));
        later(AT_FIELD, () => setEditing(k));
        later(COMMIT, () => {
          setMade(k + 1);
          setEditing(null);
          setSpark({ key: step.current, d: sparkPath(k) });
        });
        later(COMMIT + FLIGHT, () => {
          setKnown(k + 1);
          setLanded(k);
          setHit((h) => h + 1);
          setTick((t) => t + 1);
        });
        later(COMMIT + FLIGHT + 900, () => setLanded(null));
        later(EVERY, beat);
      } else {
        setCursorAt(null);
        setResetting(true);
        later(450, () => {
          setMade(0);
          setKnown(0);
          setResetting(false);
          setCharge((c) => c + 1);
        });
        later(2600, beat);
      }
    };
    later(step.current === 0 ? 2400 : 900, beat);
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, on, reduced, mobile]);

  const names = [...copy.products, copy.newProduct];
  /** a side's rows, after the first `n` edits */
  const rowsAfter = (n: number) => {
    const rows = ROWS.map((r) => ({ ...r }));
    if (n > 0) rows[0].price = 42;
    if (n > 1) rows[1].stock = 0;
    return { rows, added: n > 2, policy: n > 3 ? copy.returns60 : copy.returns30 };
  };
  const admin = rowsAfter(made);
  const mind = rowsAfter(known);
  const editRow = editing === null ? -1 : EDIT_ROW[EDITS[editing]];
  const landedRow = landed === null ? -1 : EDIT_ROW[EDITS[landed]];
  const editField = editing === null ? null : EDITS[editing];
  const maxH = mobile ? Infinity : Math.max(340, vh - 400);

  /** one product row, on either side (a plain function, so its animations don't restart on every render) */
  const productRow = (r: Row, i: number, side: "admin" | "agent", w: number) => {
    const isEdit = side === "admin" && editRow === i;
    const isLanded = side === "agent" && landedRow === i;
    const sold = r.stock === 0;
    // on phones the agent's rows sit beside him: tighter, the stock as a bare number
    const compact = mobile && side === "agent";
    return (
      <div
        className={cn(
          "bzs-row absolute flex items-center gap-3 rounded-2xl px-2.5",
          side === "agent" && "is-agent",
          compact && "gap-2 px-2",
          isLanded && "is-landed",
        )}
        style={{ top: (side === "admin" ? L.rowsY : L.agentRowsY)[i], height: L.rowH, width: w }}
      >
        <Thumb r={r} size={L.rowH - (compact ? 18 : 14)} />
        <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[var(--bzl-fg)]">{names[i]}</span>
        <span
          className={cn(
            "bzs-field flex items-center gap-1.5 text-[13px] font-semibold tabular-nums",
            sold ? "text-[var(--bzl-orange-dark)]" : "text-[var(--bzl-muted)]",
            isEdit && editField === "stock" && "is-editing",
          )}
        >
          {sold ? (
            <span key="sold" className="bzs-tag">{copy.changes.stock}</span>
          ) : (
            <>
              {!compact && <Package className="h-3.5 w-3.5" aria-hidden="true" />}
              {r.stock}
            </>
          )}
        </span>
        <span
          className={cn(
            "bzs-field min-w-[3.2em] text-right text-[15px] font-bold tabular-nums text-[var(--bzl-fg)]",
            isEdit && editField === "price" && "is-editing",
          )}
        >
          <span key={r.price} className={r.price !== ROWS[i]?.price ? "bzs-price-new" : undefined}>
            ${r.price}
          </span>
        </span>
      </div>
    );
  };

  const policyRow = (text: string, side: "admin" | "agent", w: number) => {
    const isEdit = side === "admin" && editField === "policy";
    const isLanded = side === "agent" && landedRow === 4;
    return (
      <div
        className={cn("bzs-row absolute flex items-center gap-3 rounded-2xl px-3", side === "agent" && "is-agent", isLanded && "is-landed")}
        style={{ top: (side === "admin" ? L.rowsY : L.agentRowsY)[4], height: L.rowH, width: w }}
      >
        <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-[10px] bg-[var(--bzl-orange-wash)] text-[var(--bzl-orange-strong)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className={cn("bzs-field truncate text-[14px] font-semibold text-[var(--bzl-fg)]", isEdit && "is-editing")}>
          <span key={text} className={text === copy.returns60 ? "bzs-price-new" : undefined}>
            {text}
          </span>
        </span>
      </div>
    );
  };

  const adminMainW = L.admin.w - L.side - 20;

  return (
    <div ref={ref} className="mx-auto mt-[4svh] max-w-6xl">
      <Stage w={L.W} h={L.H} maxH={maxH}>
        {/* the link: one wire per row, mirror to mirror (a single cable on phones) */}
        <svg aria-hidden="true" className="absolute inset-0 overflow-visible" width={L.W} height={L.H}>
          {L.vertical ? (
            <>
              <path d={cable} pathLength={1000} stroke="rgb(242 140 56 / 0.6)" strokeWidth={3.5} className={cn("bzs-wire", live && "is-on")} />
              {live && <path d={cable} pathLength={1000} stroke="#fff3e3" strokeWidth={3} className="bzs-beat" style={{ ["--dur" as string]: "1.6s" }} />}
            </>
          ) : (
            [0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <path
                  d={wire(i)}
                  pathLength={1000}
                  stroke="rgb(242 140 56 / 0.55)"
                  strokeWidth={3}
                  className={cn("bzs-wire", live && (i < 3 || i === 4 || mind.added) && "is-on")}
                />
                {live && (i < 3 || i === 4 || mind.added) && (
                  <path
                    d={wire(i)}
                    pathLength={1000}
                    stroke="#fff3e3"
                    strokeWidth={2.5}
                    className="bzs-beat"
                    style={{ ["--dur" as string]: `${2.2 + i * 0.23}s`, ["--delay" as string]: `${-i * 0.7}s` }}
                  />
                )}
              </g>
            ))
          )}
        </svg>

        {/* the Shopify admin */}
        <div
          className={cn("bzl-window absolute", resetting && "bzs-resetting")}
          style={{ left: L.admin.x, top: L.admin.y, width: L.admin.w, height: L.admin.h }}
        >
          <div className="bzl-window-bar">
            <span className="bzl-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <FaShopify className="h-4 w-4 text-[#5e8e3e]" aria-hidden="true" />
            {copy.admin}
          </div>
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 top-[45px] flex flex-col items-center gap-4 border-r border-[var(--bzl-border)] bg-[#fbf7f2] pt-5 text-[var(--bzl-faint)]"
            style={{ width: L.side }}
          >
            {[Home, Inbox, Tag, Users, Percent, Settings].map((Icon, i) => (
              <span key={i} className={cn("grid h-7 w-7 place-items-center rounded-lg", i === 2 && "bg-white text-[var(--bzl-fg)] shadow-sm")}>
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
          <div className="absolute" style={{ left: L.side + 10, top: 0, width: adminMainW }}>
            {admin.rows.map((r, i) => (
              <div key={i}>{productRow(r, i, "admin", adminMainW)}</div>
            ))}
            {admin.added ? (
              productRow(NEW_ROW, 3, "admin", adminMainW)
            ) : (
              <div
                className={cn(
                  "absolute flex items-center gap-2 rounded-2xl border-2 border-dashed border-[var(--bzl-border-strong)] px-3 text-[var(--bzl-faint)]",
                  editField === "product" && "is-editing bzs-field",
                )}
                style={{ top: L.rowsY[3], height: L.rowH, width: adminMainW }}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span className="bzl-tile-line w-20" />
              </div>
            )}
            <span className="absolute h-px bg-[var(--bzl-border)]" style={{ top: L.rowsY[4] - 16, width: adminMainW }} />
            {policyRow(admin.policy, "admin", adminMainW)}
          </div>
        </div>

        {/* what the agent knows: the same rows, the moment they change */}
        <div
          className={cn("bzs-mind absolute rounded-[22px]", live ? "is-on" : "is-off", resetting && "bzs-resetting")}
          style={{ left: L.agentCard.x, top: L.agentCard.y, width: L.agentCard.w, height: L.agentCard.h }}
        >
          <div className="flex h-[45px] items-center gap-2.5 border-b border-white/70 px-4 text-[13px] font-semibold text-[var(--bzl-fg)]">
            <HeadCircle head="will" size={26} />
            {copy.agent}
            <span className={cn("ml-auto transition-opacity duration-300", live ? "opacity-100" : "opacity-0")}>
              <LiveBadge className="!px-2.5 !py-1 !text-[12px]" />
            </span>
          </div>
          <div className="absolute inset-0" style={{ left: L.agentRows.x }}>
            {mind.rows.map((r, i) => (
              <div key={i} className={cn("bzs-mind-row", live && "is-in")} style={{ ["--i" as string]: i }}>
                {productRow(r, i, "agent", L.agentRows.w)}
              </div>
            ))}
            {mind.added && productRow(NEW_ROW, 3, "agent", L.agentRows.w)}
            <div className={cn("bzs-mind-row", live && "is-in")} style={{ ["--i" as string]: 4 }}>
              {policyRow(mind.policy, "agent", L.agentRows.w)}
            </div>
          </div>
        </div>

        {/* the agent himself, beside what he knows */}
        <div className="absolute z-[6]" style={{ left: L.avatar.x, top: L.avatar.y, width: L.avatar.w }}>
          <ChargeAvatar on={live} charge={charge} hit={hit} />
        </div>

        {/* one click makes the link */}
        <div
          className={cn(
            "absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-[opacity,transform] duration-300",
            live && "pointer-events-none scale-110 opacity-0",
          )}
          style={{ left: L.button.x, top: L.button.y }}
        >
          <InstallButton pressed={phase === "press"} big={!mobile} />
          <Cursor
            className={cn(
              phase === "idle" && "translate-x-[90px] translate-y-[70px] opacity-0",
              (phase === "cursor" || phase === "press") && "opacity-100",
              phase === "press" && "scale-90",
              live && "opacity-0",
            )}
            style={{ left: "55%", top: "45%" }}
          />
        </div>
        {live && !reduced && (
          <div className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: L.button.x, top: L.button.y }}>
            <InstallButton ring big={!mobile} className="opacity-0" />
          </div>
        )}

        {/* synced just now, under the link */}
        <div
          className={cn(
            "absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-1.5 shadow-[0_8px_20px_-12px_rgba(28,24,20,0.35)] transition-opacity duration-500",
            live ? "opacity-100 delay-300" : "opacity-0",
          )}
          style={{ left: L.synced.x, top: L.synced.y }}
        >
          <SyncedNow tick={tick} />
        </div>

        {/* your cursor, making the edits */}
        {live && !reduced && (
          <Cursor
            className={cn(cursorAt ? "opacity-100" : "opacity-0")}
            style={{
              left: 0,
              top: 0,
              transform: cursorAt ? `translate(${cursorAt.x - 4}px, ${cursorAt.y - 2}px)` : `translate(${L.button.x}px, ${L.button.y + 40}px)`,
            }}
          />
        )}

        {spark && !reduced && <Spark key={spark.key} d={spark.d} dur={FLIGHT} small />}
      </Stage>
    </div>
  );
};

export default SetupMirror;
