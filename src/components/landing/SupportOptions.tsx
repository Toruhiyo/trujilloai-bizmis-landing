import { useRef } from "react";
import type { ReactNode } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { RewindMark } from "./RewindSign";
import { span } from "./useRewindLoop";
import { useNow } from "./sales/hooks";
import {
  Ask,
  Flip,
  Hand,
  Sparkle,
  SupportDay,
  Ticket,
  clamp01,
  drawn,
  easeBack,
  easeIn,
  easeInOut,
  easeOut,
  f,
  hand,
  hump,
  loop,
  mix,
  spring,
  useProbeWidths,
  writing,
} from "./PillarMoments";
import type { DrawOption } from "./drawOptions";

/**
 * Customer Support's drawings: the clock (2) by default, the other options
 * by ?support=1|3, the one shipped before them (PillarMoments' SupportDay)
 * by ?support=old. All
 * three tell ONE benefit to the merchant at scale: the support inbox kept
 * light round the clock. Questions keep coming round the clock; until the fix
 * (`fixAt`, as the device starts answering) they pile up in the inbox as
 * tickets; then the agent (the Support mockup's, its head in a marker ring)
 * answers the backlog and every new question before it gets there, out loud. In the Sales funnel's marker, all in the band's
 * marker ink (the Bizmis primary). The label: the loss written, struck at
 * the fix, then the win written and ticked. Every frame comes from `t`, so
 * the scroll's rewind runs it backwards.
 *
 * 1 Sky: a sun and a moon going over the inbox, day, night, day, night; the
 *   voice a dome over the inbox that catches the questions as they come.
 * 2 Clock (the default, also with no parameter): a clock in the corner, its
 *   hands racing round the hours; the shoppers' questions drift in from the
 *   edges and pile up in the inbox, well over its rim; the agent (its head
 *   render on its own) lands on their way, answers the backlog in a few big
 *   gestures and catches the new ones, all but the rare one that needs the
 *   merchant, so the inbox stays low with those few. Once it's done it goes
 *   on in real time: the hands drifting round, a question now and then,
 *   caught. "Questions pile up" struck, "Only the few that need you".
 * 3 Morning: one night of questions under the moon; the voice a wave over the
 *   inbox; the sun comes up on it empty.
 */

const DW = 560;
const DH = 280;
const STAMP = 360;
const REVEAL = 600;

type Copy = { label: string; problem: string; solution: string };
/** A drawing's frame: `t` along the scene, the fix at `F`, its "after" `W` long, and `now`, real time (ms) for what keeps going once it's done. */
type DrawProps = { t: number; F: number; W: number; kept: boolean; inbox: string; now: number };

/**
 * The scene's timeline for a case whose agent answers at `fixAt` and that
 * lasts `duration` (ms): a short "after" (the backlog answered, a few more
 * caught), then a beat to read the win; the drawing never makes a case wait.
 */
export const supportClockTimes = (fixAt: number, duration: number) => {
  const win = Math.min(3800, Math.max(2600, duration - fixAt - 400));
  return { fixAt, win, end: fixAt + win + 500 };
};

/** Stamped on at `at`, as a Sales seal: big, then springing to size, squashing a little as it lands. */
const stampAt = (t: number, at: number) => {
  const q = (t - at) / STAMP;
  const s = q > 0 ? (q < 1 ? 1.6 - 0.6 * spring(q) : 1) : 0;
  const sq = q > 0.25 && q < 1.6 ? 0.2 * Math.exp(-3.5 * (q - 0.25)) * Math.cos(6 * (q - 0.25)) : 0;
  return { q, s, sq };
};

/** The agent: the Support mockup's own (yusuke), its head render on its own (no ring, no disc). */
const AGENT_HEAD = "/landing/heads/yusuke.png";

/** The agent's head, stamped on at `at`; it nods along while it talks (0 → 1). */
const AgentHead = ({ x, y, r = 24, t, at, talk = 0 }: { x: number; y: number; r?: number; t: number; at: number; talk?: number }) => {
  const { q, s, sq } = stampAt(t, at);
  if (s <= 0) return null;
  const nod = talk * Math.sin(t / 110) * 4;
  return (
    <g opacity={f(clamp01(q * 3))} transform={`translate(${f(x)} ${f(y)}) rotate(${f(-4 + nod)}) scale(${f(s * (1 + sq))} ${f(s * (1 - sq))})`}>
      <image href={AGENT_HEAD} x={-r * 1.15} y={-r * 1.15} width={r * 2.3} height={r * 2.3} preserveAspectRatio="xMidYMid meet" />
    </g>
  );
};

/** Its voice going out: three arcs off (x, y) toward `dir` (radians), beating while `on` (0 → 1). */
const Voice = ({ x, y, r0, dir, on, t, spread = 0.42 }: { x: number; y: number; r0: number; dir: number; on: number; t: number; spread?: number }) => {
  if (on <= 0) return null;
  return (
    <g>
      {[0, 1, 2].map((j) => {
        const beat = 0.5 + 0.5 * Math.sin(t / 70 - j * 1.2);
        const r = r0 + j * 8 + 2 * beat;
        const s = spread - j * 0.06;
        const pt = (a: number) => `${f(x + Math.cos(a) * r)} ${f(y + Math.sin(a) * r)}`;
        return (
          <path
            key={j}
            className={j === 1 ? "mk-mid" : "mk-thin"}
            d={`M${pt(dir - s)} A${f(r)} ${f(r)} 0 0 1 ${pt(dir + s)}`}
            opacity={f(on * (0.5 + 0.5 * beat))}
          />
        );
      })}
    </g>
  );
};

/** Answered: a check popping up off (x, y) and fading (k: 0 → 1). */
const Pop = ({ x, y, k, size = 1 }: { x: number; y: number; k: number; size?: number }) => {
  if (k <= 0 || k >= 1) return null;
  return (
    <g transform={`translate(${f(x)} ${f(y - 26 * easeOut(k))}) scale(${f(size * spring(clamp01(k * 2.2)))})`} opacity={f(1 - span(k, 0.55, 1))}>
      <path className="mk-main" d="M-9 0 L-3 6 L10 -8" />
    </g>
  );
};

/** How much it talks at `t`: on around each moment in `at`. */
const talking = (t: number, at: number[]) =>
  at.reduce((m, a) => Math.max(m, span(t, a - 160, a) * (1 - span(t, a + 260, a + 420))), 0);
/** The voice's arcs: on just before each moment in `at`, off just after. */
const voicing = (t: number, at: number[]) =>
  at.reduce((m, a) => Math.max(m, span(t, a - 220, a - 60) * (1 - span(t, a + 200, a + 380))), 0);

const quad = (a: readonly number[], c: readonly number[], b: readonly number[], k: number) =>
  [mix(mix(a[0], c[0], k), mix(c[0], b[0], k), k), mix(mix(a[1], c[1], k), mix(c[1], b[1], k), k)] as const;
/** A question's arc from (sx, sy) to `end`, lifting over the way (u: 0 → 1). */
const arc = (sx: number, sy: number, end: readonly number[], u: number, lift = 50) =>
  quad([sx, sy], [(sx + end[0]) / 2, Math.min(sy, end[1]) - lift], end, u);

/** Evenly spread `n` moments over [a, b]. */
const spread = (n: number, a: number, b: number) => (i: number) => a + (n > 1 ? (i * (b - a)) / (n - 1) : 0);

/** The sun, its rays turning slowly; `rise` (0 → 1) draws its rays out. */
const Sun = ({ t, rise = 1 }: { t: number; rise?: number }) => (
  <g>
    <path className="mk-mid" d={loop(0, 0, 15, 2)} />
    {rise > 0 &&
      Array.from({ length: 8 }, (_, k) => {
        const a = (k / 8) * Math.PI * 2 + t / 2400;
        const r1 = 22 + 7 * rise;
        return <path key={k} className="mk-thin" d={`M${f(Math.cos(a) * 22)} ${f(Math.sin(a) * 22)} L${f(Math.cos(a) * r1)} ${f(Math.sin(a) * r1)}`} />;
      })}
  </g>
);
/** The moon, a crescent. */
const Moon = ({ s = 1 }: { s?: number }) => <path className="mk-mid" transform={`scale(${s})`} d="M6 -17 A18 18 0 1 0 14 12 A14 14 0 1 1 6 -17 Z" />;

/** The night's stars, `k` (0 → 1) how dark it is. */
const Stars = ({ k, at }: { k: number; at: readonly (readonly number[])[] }) => (
  <>
    {at.map(([x, y], i) => (
      <Sparkle key={i} x={x} y={y} k={k > 0 ? clamp01(k * 1.4 - i * 0.12) : 0} size={i % 2 ? 5 : 7} spin={i * 30} />
    ))}
  </>
);

/** The label: the loss, struck at the fix, then the win (the Sales funnel's), fitted to the drawing's width. */
const Label = ({ t, F, copy }: { t: number; F: number; copy: Copy }) => {
  const [widths, probes] = useProbeWidths([copy.problem, copy.solution].join("|"));
  return (
    <>
      <g ref={probes} visibility="hidden">
        <text className="mk-hand is-label">{copy.problem}</text>
        <text className="mk-hand is-label">{copy.solution}</text>
      </g>
      <Flip
        x={DW / 2}
        y={44}
        room={DW - 24}
        problem={copy.problem}
        solution={copy.solution}
        wp={widths[0] ?? copy.problem.length * 12}
        ws={widths[1] ?? copy.solution.length * 12}
        t={t}
        writeAt={300}
        strikeAt={F + 260}
      />
    </>
  );
};

/* ── The support inbox: an open tray, its name, and its pile ──────────────── */

type Tray = { x: number; y: number; w: number; h: number };
/** Ticket `k` on the pile: the higher, the more it leans and slides off true. */
const slotOf = (tray: Tray, k: number) => ({
  x: tray.x + tray.w / 2 + hand(k, 1) * 8 + (k > 2 ? (k - 2) * (k % 2 ? 9 : -8) : 0),
  y: tray.y + tray.h - 8 - k * 12.5,
  tilt: hand(k, 2) * 4 + (k > 2 ? (k % 2 ? 1 : -1) * (k - 2) * 3.2 : 0),
});

/**
 * The inbox: each question before the fix a ticket on its pile (landing at
 * `landAt`), straining the tray as it overflows; after the fix, answered off
 * the top one after another (`drainAt`, flying to the voice at `to`).
 */
const Inbox = ({
  tray,
  t,
  kept,
  inbox,
  n,
  landAt,
  drainAt,
  drain,
  to,
  keep = 0,
  slot = (k: number) => slotOf(tray, k),
  pops = true,
}: {
  tray: Tray;
  t: number;
  kept: boolean;
  inbox: string;
  n: number;
  landAt: (i: number) => number;
  drainAt: (i: number) => number;
  drain: number;
  to: readonly number[];
  /** The bottom tickets that stay: the few that need the merchant. */
  keep?: number;
  slot?: (k: number) => { x: number; y: number; tilt: number };
  /** A check for each ticket answered (else the caller draws its own). */
  pops?: boolean;
}) => {
  const drawIn = kept ? 1 : easeOut(span(t, 0, REVEAL));
  const full = Math.min(Math.max(4, keep + 3), n - 1);
  const strain = span(t, landAt(full), landAt(full) + 200) * (1 - span(t, drainAt(full), drainAt(full) + drain));
  const shake = strain * Math.sin(t / 45) * 1.6;
  const { x: ex, y: ey, w: tw, h: th } = tray;
  return (
    <>
      <path
        className="mk-main"
        transform={`translate(${f(shake)} 0)`}
        d={`M${ex - 6} ${ey} L${ex} ${ey + th - 8} Q${ex + 1} ${ey + th} ${ex + 10} ${ey + th} H${ex + tw - 10} Q${ex + tw - 1} ${ey + th} ${ex + tw} ${ey + th - 8} L${ex + tw + 6} ${ey}`}
        {...drawn(drawIn)}
      />
      <Hand k={kept ? 1 : writing(inbox, t, 280)} x={ex + tw / 2} y={ey + th + 28} textAnchor="middle" className="is-small">
        {inbox}
      </Hand>
      {strain > 0 && (
        <g opacity={f(strain)}>
          <path className="mk-thin" d={`M${ex - 22} ${ey + 4} q-6 10 0 20`} />
          <path className="mk-thin" d={`M${ex + tw + 22} ${ey + 4} q6 10 0 20`} />
        </g>
      )}
      {Array.from({ length: n }, (_, i) => {
        const land = span(t, landAt(i) - 120, landAt(i) + 220);
        if (land <= 0) return null;
        const s0 = slot(i);
        const d = i < keep ? 0 : easeInOut(span(t, drainAt(i), drainAt(i) + drain));
        if (d >= 1) return null;
        const x = mix(s0.x + shake, to[0], d);
        const y = mix(s0.y - 14 * (1 - easeBack(land)), to[1], d) - 24 * hump(d);
        return <Ticket key={i} x={x} y={y} tilt={s0.tilt * (1 - d)} s={Math.min(1, land * 2) * (1 - 0.75 * d)} />;
      })}
      {Array.from({ length: n }, (_, k) => !pops || k < keep ? null : (
        <Pop key={`d${k}`} x={to[0] + (k % 2 ? 30 : -30)} y={to[1] - 22} k={span(t, drainAt(k) + drain - 40, drainAt(k) + drain + 720)} />
      ))}
    </>
  );
};

/** A sky body's place along an arc (k: 0 → 1, rising on the left, setting on the right). */
const skyAt = (cx: number, cy: number, rx: number, ry: number, k: number) => {
  const a = Math.PI + k * Math.PI;
  return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry };
};

/* ── 1 Sky: day, night, day, night over the inbox; the voice a dome over it ── */

const SK_TRAY = { x: 190, y: 212, w: 180, h: 36 };
const SK_MARK = { x: 280, y: 180 };
const SK_DOME = 64;
const SK_LOSS = 8;
const SK_WIN = 6;
const SK_FROM_LOSS = [[30, 110], [530, 120], [60, 196], [506, 200], [20, 150], [540, 160], [40, 236], [524, 240]] as const;
const SK_FROM_WIN = [[36, 118], [528, 112], [24, 170], [536, 176], [60, 96], [500, 100]] as const;
const SK_STARS = [[96, 120], [470, 128], [512, 196], [58, 176], [372, 100], [190, 104]] as const;
const SK_SKY = { x: 280, y: 330, rx: 236, ry: 244 };

const SkyDrawing = ({ t, F, W, kept, inbox }: DrawProps) => {
  const FLY = 800;
  const lossAt = spread(SK_LOSS, 300, Math.max(400, F - FLY - 80));
  const landAt = (i: number) => lossAt(i) + FLY;
  const DRAIN = 380;
  const drainAt = (k: number) => F + 420 + (SK_LOSS - 1 - k) * 140;
  const winAt = spread(SK_WIN, F + 1500, F + W - 700);
  const TO = 600;
  const hitOf = (i: number) => {
    const [sx, sy] = SK_FROM_WIN[i];
    const a = Math.atan2(sy - SK_MARK.y, sx - SK_MARK.x);
    return [SK_MARK.x + Math.cos(a) * SK_DOME, SK_MARK.y + Math.sin(a) * SK_DOME] as const;
  };
  const reach = [...Array.from({ length: SK_LOSS }, (_, k) => drainAt(k) + DRAIN), ...Array.from({ length: SK_WIN }, (_, i) => winAt(i) + TO)];
  const talk = talking(t, reach);
  // the sky: a day, a night (the fix lands in it), a day, and the night it ends on (the moon held high)
  const segs = [
    [0, F * 0.45, "sun"],
    [F * 0.45, F + W * 0.35, "moon"],
    [F + W * 0.35, F + W * 0.7, "sun"],
    [F + W * 0.7, F + W, "moon"],
  ] as const;
  const night = Math.max(
    span(t, segs[1][0] - 150, segs[1][0] + 250) * (1 - span(t, segs[1][1] - 250, segs[1][1] + 150)),
    span(t, segs[3][0] - 150, segs[3][0] + 250),
  );
  const dome = (j: number) => easeOut(span(t, F + 120 + j * 110, F + 560 + j * 110));
  return (
    <>
      {/* the sky going round */}
      {segs.map(([a, b, kind], n) => {
        const last = n === segs.length - 1;
        if (t < a || (!last && t > b)) return null;
        const k = span(t, a, b) * (last ? 0.5 : 1);
        const on = Math.min(1, k * 12, last ? 1 : (1 - k) * 12);
        const p = skyAt(SK_SKY.x, SK_SKY.y, SK_SKY.rx, SK_SKY.ry, k);
        return (
          <g key={n} opacity={f(on)} transform={`translate(${f(p.x)} ${f(p.y)})`}>
            {kind === "sun" ? <Sun t={t} /> : <Moon />}
          </g>
        );
      })}
      <Stars k={night} at={SK_STARS} />
      <Inbox tray={SK_TRAY} t={t} kept={kept} inbox={inbox} n={SK_LOSS} landAt={landAt} drainAt={drainAt} drain={DRAIN} to={[SK_MARK.x, SK_MARK.y]} />

      {/* the questions: before, into the inbox; after, caught by the voice's dome */}
      {Array.from({ length: SK_LOSS }, (_, i) => {
        const at = lossAt(i);
        if (t < at || t > landAt(i) + 60) return null;
        const [sx, sy] = SK_FROM_LOSS[i];
        const s0 = slotOf(SK_TRAY, i);
        const u = easeInOut(span(t, at + 120, landAt(i)));
        const [x, y] = arc(sx, sy, [s0.x, s0.y - 12], u);
        return <Ask key={`a${i}`} x={x} y={y} s={spring(span(t, at, at + 300)) * (1 - easeIn(span(u, 0.82, 1)))} />;
      })}
      {Array.from({ length: SK_WIN }, (_, i) => {
        const at = winAt(i);
        const end = at + TO;
        if (t < at || t > end + 60) return null;
        const [sx, sy] = SK_FROM_WIN[i];
        const [x, y] = arc(sx, sy, hitOf(i), easeInOut(span(t, at + 120, end)), 30);
        return <Ask key={`w${i}`} x={x} y={y} s={spring(span(t, at, at + 300)) * (1 - easeIn(span(t, end - 140, end)))} />;
      })}
      {Array.from({ length: SK_WIN }, (_, i) => {
        const [hx, hy] = hitOf(i);
        return <Pop key={`p${i}`} x={hx} y={hy} k={span(t, winAt(i) + TO - 40, winAt(i) + TO + 720)} />;
      })}

      {/* the voice over the inbox: a dome of sound */}
      {[0, 1, 2].map((j) => {
        const k = dome(j);
        if (k <= 0) return null;
        const r = 34 + j * 15 + 1.6 * Math.sin(t / 90 - j) * talk;
        const pt = (a: number) => `${f(SK_MARK.x + Math.cos(a) * r)} ${f(SK_MARK.y + Math.sin(a) * r)}`;
        return <path key={`o${j}`} className={j === 1 ? "mk-mid" : "mk-thin"} d={`M${pt(Math.PI + 0.12)} A${f(r)} ${f(r)} 0 0 1 ${pt(Math.PI * 2 - 0.12)}`} {...drawn(k)} />;
      })}
      <AgentHead x={SK_MARK.x} y={SK_MARK.y} t={t} at={F} talk={talk} />
      <Sparkle x={SK_TRAY.x - 14} y={SK_TRAY.y - 14} k={span(t, F + W - 300, F + W + 200)} size={8} />
      <Sparkle x={SK_TRAY.x + SK_TRAY.w + 16} y={SK_TRAY.y - 4} k={span(t, F + W - 150, F + W + 350)} size={6} spin={20} />
    </>
  );
};

/* ── 2 Clock (the default): questions from everywhere; the agent clears the pile and keeps it low ── */

const CL = { x: 74, y: 120, r: 44 }; // time passing, on its own in the corner
const CL_TRAY = { x: 404, y: 206, w: 124, h: 38 };
const CL_HEAD = { x: 282, y: 150 };
const CL_R = 30;
const CL_LOSS = 8; // before the agent: every question a ticket, the pile well over the tray's rim
const CL_KEEP = 1; // the one at the bottom that needs the merchant: it stays
/** The backlog, answered in a few big gestures, top down: the tickets of each one. */
const CL_BATCHES = [[7, 6, 5], [4, 3, 2], [1]];
const CL_BATCH_GAP = 420;
const CL_WIN = 3; // after: the new ones, caught on their way...
const CL_RARE = 1; // ...but the rare one that needs the merchant, which goes on to the inbox
const CL_AMBIENT = 1900; // once it's done: a question every so often, caught (real time, so it never stops)
/** Where the shoppers' questions drift in from: off the left and bottom edges (never out of the clock). */
const CL_FROM = [[-16, 214], [150, 300], [-16, 258], [236, 300], [-16, 176], [90, 300], [-16, 236], [196, 300]] as const;
/** Ticket `k` on the pile, swaying from side to side the higher it gets. */
const clSlot = (k: number) => ({
  x: CL_TRAY.x + CL_TRAY.w / 2 + hand(k, 1) * 6 + Math.sin(k * 1.9) * Math.min(k, 6) * 2.4,
  y: CL_TRAY.y + CL_TRAY.h - 8 - k * 12,
  tilt: hand(k, 2) * 3 + Math.sin(k * 2.3) * Math.min(k, 8) * 1.3,
});
/** Where the agent catches a question from (sx, sy): on its side, toward where it came from. */
const clHit = (sx: number, sy: number) => {
  const a = Math.atan2(sy - CL_HEAD.y, sx - CL_HEAD.x);
  return [CL_HEAD.x + Math.cos(a) * (CL_R + 22), CL_HEAD.y + Math.sin(a) * (CL_R + 22), a] as const;
};

const ClockDrawing = ({ t, F, W, kept, inbox, now }: DrawProps) => {
  const drawIn = kept ? 1 : easeOut(span(t, 0, REVEAL));
  const FLY = 950;
  const TO = 600;
  const lossAt = spread(CL_LOSS, 280, Math.max(380, F - FLY - 60));
  const landAt = (i: number) => lossAt(i) + FLY;
  const DRAIN = 380;
  const batchAt = (b: number) => F + 300 + b * CL_BATCH_GAP;
  const drainAt = (k: number) => {
    const b = CL_BATCHES.findIndex((ks) => ks.includes(k));
    return b < 0 ? Infinity : batchAt(b) + CL_BATCHES[b].indexOf(k) * 50;
  };
  const winAt = spread(CL_WIN, F + 300 + CL_BATCHES.length * CL_BATCH_GAP + 200, F + W - 700);
  const rare = clSlot(CL_KEEP);
  const rareLand = winAt(CL_RARE) + FLY;
  const rareIn = span(t, rareLand - 120, rareLand + 220);
  const done = t >= F + W;
  // the clock, time-lapse (the hour hand round once before the agent and once after, the minute hand racing), and always drifting on in real time
  const hours = span(t, 300, F) + span(t, F, F + W) + now / 24000;
  const hourA = hours * Math.PI * 2 - Math.PI / 2;
  const minA = hours * 8 * Math.PI * 2 - Math.PI / 2;
  // once it's done: a question now and then, from an edge, caught
  const amb = Math.floor(now / CL_AMBIENT);
  const ambK = (now % CL_AMBIENT) / CL_AMBIENT;
  const ambFrom = CL_FROM[(amb * 3) % CL_FROM.length];
  const ambHit = clHit(ambFrom[0], ambFrom[1]);
  const answers = [
    ...CL_BATCHES.map((_, b) => batchAt(b) + DRAIN),
    ...Array.from({ length: CL_WIN }, (_, i) => i).filter((i) => i !== CL_RARE).map((i) => winAt(i) + TO),
  ];
  const ambTalk = done ? span(ambK, 0.4, 0.48) * (1 - span(ambK, 0.62, 0.72)) : 0;
  const talk = Math.max(talking(t, answers), ambTalk);
  // a question's way: past the agent's spot, on to `end` (u: 0 → 1, 0.5 at the agent)
  const route = (sx: number, sy: number, end: readonly number[], u: number) => {
    const c1 = [(sx + CL_HEAD.x) / 2, Math.min(sy, CL_HEAD.y) - 40];
    if (u <= 0.5) return quad([sx, sy], c1, [CL_HEAD.x, CL_HEAD.y], u * 2);
    const c2 = [CL_HEAD.x + (CL_HEAD.x - c1[0]) * 0.55, CL_HEAD.y + (CL_HEAD.y - c1[1]) * 0.55];
    return quad([CL_HEAD.x, CL_HEAD.y], c2, end, (u - 0.5) * 2);
  };
  return (
    <>
      {/* the clock, its hands racing round the hours */}
      <path className="mk-main" d={loop(CL.x, CL.y, CL.r, 4)} {...drawn(drawIn)} />
      {[0, 1, 2, 3].map((k) => {
        const a = (k / 4) * Math.PI * 2;
        return (
          <path
            key={k}
            className="mk-thin"
            opacity={f(drawIn)}
            d={`M${f(CL.x + Math.cos(a) * (CL.r - 13))} ${f(CL.y + Math.sin(a) * (CL.r - 13))} L${f(CL.x + Math.cos(a) * (CL.r - 7))} ${f(CL.y + Math.sin(a) * (CL.r - 7))}`}
          />
        );
      })}
      <path className="mk-main" opacity={f(drawIn)} d={`M${CL.x} ${CL.y} L${f(CL.x + Math.cos(hourA) * (CL.r - 24))} ${f(CL.y + Math.sin(hourA) * (CL.r - 24))}`} />
      <path className="mk-mid" opacity={f(drawIn)} d={`M${CL.x} ${CL.y} L${f(CL.x + Math.cos(minA) * (CL.r - 14))} ${f(CL.y + Math.sin(minA) * (CL.r - 14))}`} />
      <circle className="mk-dot" cx={CL.x} cy={CL.y} r={3.8} opacity={f(drawIn)} />

      {/* the inbox: piling up until the agent lands, then answered down to the few that need the merchant */}
      <Inbox
        tray={CL_TRAY}
        t={t}
        kept={kept}
        inbox={inbox}
        n={CL_LOSS}
        landAt={landAt}
        drainAt={drainAt}
        drain={DRAIN}
        to={[CL_HEAD.x + CL_R, CL_HEAD.y]}
        keep={CL_KEEP}
        slot={clSlot}
        pops={false}
      />
      {rareIn > 0 && <Ticket x={rare.x} y={rare.y - 14 * (1 - easeBack(rareIn))} tilt={rare.tilt} s={Math.min(1, rareIn * 2)} />}
      {/* a big check for each gesture that answers a batch of the backlog */}
      {CL_BATCHES.map((_, b) => (
        <Pop key={`b${b}`} x={CL_HEAD.x + 8 + (b % 2 ? -26 : 26)} y={CL_HEAD.y - CL_R - 16} k={span(t, batchAt(b) + DRAIN - 40, batchAt(b) + DRAIN + 760)} size={1.5} />
      ))}
      <Voice x={CL_HEAD.x} y={CL_HEAD.y} r0={CL_R + 8} dir={0.15} on={voicing(t, CL_BATCHES.map((_, b) => batchAt(b) + DRAIN))} t={t} />

      {/* the shoppers' questions, drifting in from the edges: before, on to the inbox; after, caught by the agent (all but the rare one) */}
      {Array.from({ length: CL_LOSS }, (_, i) => {
        const at = lossAt(i);
        if (t < at || t > landAt(i) + 60) return null;
        const [sx, sy] = CL_FROM[i % CL_FROM.length];
        const s0 = clSlot(i);
        const u = easeInOut(span(t, at, landAt(i)));
        const [x, y] = route(sx, sy, [s0.x, s0.y - 12], u);
        return <Ask key={`a${i}`} x={x} y={y} s={spring(span(t, at + 80, at + 380)) * (1 - easeIn(span(u, 0.82, 1)))} />;
      })}
      {Array.from({ length: CL_WIN }, (_, i) => {
        const at = winAt(i);
        const isRare = i === CL_RARE;
        const end = at + (isRare ? FLY : TO);
        if (t < at || t > end + 60) return null;
        const [sx, sy] = CL_FROM[(CL_LOSS + i) % CL_FROM.length];
        const [hx, hy] = clHit(sx, sy);
        const [x, y] = isRare ? route(sx, sy, [rare.x, rare.y - 12], easeInOut(span(t, at, end))) : arc(sx, sy, [hx, hy], easeInOut(span(t, at, end)), 30);
        return <Ask key={`w${i}`} x={x} y={y} s={spring(span(t, at + 80, at + 380)) * (1 - easeIn(span(t, end - 140, end)))} />;
      })}
      {Array.from({ length: CL_WIN }, (_, i) => {
        if (i === CL_RARE) return null;
        const [sx, sy] = CL_FROM[(CL_LOSS + i) % CL_FROM.length];
        const [hx, hy, a] = clHit(sx, sy);
        const at = winAt(i) + TO;
        return (
          <g key={`p${i}`}>
            <Voice x={CL_HEAD.x} y={CL_HEAD.y} r0={CL_R + 8} dir={a} on={voicing(t, [at])} t={t} spread={0.36} />
            <Pop x={hx} y={hy - 12} k={span(t, at - 40, at + 720)} />
          </g>
        );
      })}
      {/* once it's done, it goes on: now and then a question drifts in and is caught */}
      {done && (
        <g>
          {ambK < 0.46 && (
            <Ask
              x={arc(ambFrom[0], ambFrom[1], [ambHit[0], ambHit[1]], easeInOut(ambK / 0.46), 30)[0]}
              y={arc(ambFrom[0], ambFrom[1], [ambHit[0], ambHit[1]], easeInOut(ambK / 0.46), 30)[1]}
              s={spring(span(ambK, 0.02, 0.18)) * (1 - easeIn(span(ambK, 0.38, 0.46)))}
            />
          )}
          <Voice x={CL_HEAD.x} y={CL_HEAD.y} r0={CL_R + 8} dir={ambHit[2]} on={span(ambK, 0.36, 0.44) * (1 - span(ambK, 0.56, 0.66))} t={now} spread={0.36} />
          <Pop x={ambHit[0]} y={ambHit[1] - 12} k={span(ambK, 0.45, 0.85)} />
        </g>
      )}
      <AgentHead x={CL_HEAD.x} y={CL_HEAD.y} r={CL_R} t={t} at={F} talk={talk} />
    </>
  );
};

/* ── 3 Morning: a night of questions, the sun up on an empty inbox ─────────── */

const MO_GROUND = 238;
const MO_TRAY = { x: 196, y: 198, w: 168, h: 40 };
const MO_MARK = { x: 280, y: 150 };
const MO_WAVE = [150, 410]; // the voice's wave over the inbox, from x to x
const MO_LOSS = 7;
const MO_WIN = 6;
const MO_FROM = [[40, 92], [520, 100], [120, 76], [440, 78], [24, 140], [540, 150], [200, 70], [360, 72]] as const;
const MO_STARS = [[80, 96], [480, 92], [520, 170], [40, 180], [160, 120], [410, 120]] as const;

const MorningDrawing = ({ t, F, W, kept, inbox }: DrawProps) => {
  const drawIn = kept ? 1 : easeOut(span(t, 0, REVEAL));
  const FLY = 820;
  const lossAt = spread(MO_LOSS, 300, Math.max(400, F - FLY - 80));
  const landAt = (i: number) => lossAt(i) + FLY;
  const DRAIN = 380;
  const drainAt = (k: number) => F + 420 + (MO_LOSS - 1 - k) * 140;
  const winAt = spread(MO_WIN, F + 1400, F + W * 0.78);
  const TO = 560;
  const waveY = MO_MARK.y + 2;
  const hitX = (i: number) => mix(MO_WAVE[0] + 16, MO_WAVE[1] - 16, ((i * 3) % MO_WIN) / (MO_WIN - 1));
  const reach = [...Array.from({ length: MO_LOSS }, (_, k) => drainAt(k) + DRAIN), ...Array.from({ length: MO_WIN }, (_, i) => winAt(i) + TO)];
  const talk = talking(t, reach);
  // the night: the moon across the sky; then the morning: the sun up on the right, the stars out
  const moonK = span(t, 0, F + W * 0.8);
  const moon = skyAt(280, 300, 230, 220, mix(0.08, 0.92, moonK));
  const dawn = span(t, F + W * 0.78, F + W);
  const sunY = mix(MO_GROUND + 18, 112, easeOut(dawn));
  const night = 1 - dawn;
  const wave = easeOut(span(t, F + 150, F + 650));
  // the wave: calm, a ripple running along it while it talks
  const wavePath = () => {
    const [x0, x1] = MO_WAVE;
    const n = 26;
    let d = "";
    for (let k = 0; k <= n; k++) {
      const x = mix(x0, x1, k / n);
      const fade = Math.sin((Math.PI * k) / n);
      const y = waveY + fade * (2.5 + 9 * talk) * Math.sin(k * 1.25 - t / 70);
      d += `${k ? " L" : "M"}${f(x)} ${f(y)}`;
    }
    return d;
  };
  return (
    <>
      <defs>
        <clipPath id="mo-sky">
          <rect x={0} y={0} width={DW} height={MO_GROUND - 3} />
        </clipPath>
      </defs>
      {night > 0 && (
        <g opacity={f(night * Math.min(1, moonK * 12))} transform={`translate(${f(moon.x)} ${f(moon.y)})`}>
          <Moon />
        </g>
      )}
      <Stars k={night * (kept ? 1 : span(t, 200, 700))} at={MO_STARS} />
      {dawn > 0 && (
        <g clipPath="url(#mo-sky)">
          <g transform={`translate(468 ${f(sunY)})`}>
            <Sun t={t} rise={span(dawn, 0.45, 1)} />
          </g>
        </g>
      )}
      {/* the horizon, either side of the inbox (it stands in the gap, its name clear under it) */}
      <path className="mk-mid" d={`M30 ${MO_GROUND} H${MO_TRAY.x - 22} M${MO_TRAY.x + MO_TRAY.w + 22} ${MO_GROUND} H530`} {...drawn(drawIn)} />
      <Inbox tray={MO_TRAY} t={t} kept={kept} inbox={inbox} n={MO_LOSS} landAt={landAt} drainAt={drainAt} drain={DRAIN} to={[MO_MARK.x, MO_MARK.y]} />

      {/* the night's questions: before, into the inbox; after, answered at the wave */}
      {Array.from({ length: MO_LOSS }, (_, i) => {
        const at = lossAt(i);
        if (t < at || t > landAt(i) + 60) return null;
        const [sx, sy] = MO_FROM[i];
        const s0 = slotOf(MO_TRAY, i);
        const u = easeInOut(span(t, at + 120, landAt(i)));
        const [x, y] = arc(sx, sy, [s0.x, s0.y - 12], u, 30);
        return <Ask key={`a${i}`} x={x} y={y} s={spring(span(t, at, at + 300)) * (1 - easeIn(span(u, 0.82, 1)))} />;
      })}
      {Array.from({ length: MO_WIN }, (_, i) => {
        const at = winAt(i);
        const end = at + TO;
        if (t < at || t > end + 60) return null;
        const [sx, sy] = MO_FROM[(i + 2) % MO_FROM.length];
        const [x, y] = arc(sx, sy, [hitX(i), waveY - 14], easeInOut(span(t, at + 120, end)), 20);
        return <Ask key={`w${i}`} x={x} y={y} s={spring(span(t, at, at + 300)) * (1 - easeIn(span(t, end - 140, end)))} />;
      })}
      {Array.from({ length: MO_WIN }, (_, i) => (
        <Pop key={`p${i}`} x={hitX(i)} y={waveY - 18} k={span(t, winAt(i) + TO - 40, winAt(i) + TO + 720)} />
      ))}

      {/* the voice: a wave over the inbox, from its button */}
      {wave > 0 && <path className="mk-mid" d={wavePath()} {...drawn(wave)} />}
      <AgentHead x={MO_MARK.x} y={MO_MARK.y} t={t} at={F} talk={talk} />
      <Sparkle x={MO_TRAY.x - 14} y={MO_TRAY.y - 12} k={span(t, F + W - 250, F + W + 250)} size={8} />
      <Sparkle x={MO_TRAY.x + MO_TRAY.w + 16} y={MO_TRAY.y - 2} k={span(t, F + W - 100, F + W + 400)} size={6} spin={20} />
    </>
  );
};

const DRAWINGS: Record<Exclude<DrawOption, "old">, { key: "sky" | "clock" | "morning"; Drawing: (p: DrawProps) => ReactNode }> = {
  default: { key: "clock", Drawing: ClockDrawing },
  1: { key: "sky", Drawing: SkyDrawing },
  2: { key: "clock", Drawing: ClockDrawing },
  3: { key: "morning", Drawing: MorningDrawing },
};

/**
 * Customer Support's drawing on its section's clock (`t` ms along the
 * scene, the fix at `fixAt`, its "after" `win` long, as SupportDay's), the
 * option picked by ?support= (none: the clock; "old": SupportDay). ◀◀ while
 * it rewinds.
 */
export const SupportDrawing = ({
  option,
  className,
  t,
  fixAt,
  win,
  rewinding = false,
  active = true,
}: {
  option: DrawOption;
  className?: string;
  t: number;
  fixAt: number;
  win: number;
  rewinding?: boolean;
  /** On screen: what keeps going in real time once it's done runs. */
  active?: boolean;
}) => {
  const support = useMessages().landing.support;
  const now = useNow(active && option !== "old");
  // drawn in once; from then on the scenery stays, so a replay never starts blank
  const played = useRef(false);
  if (t >= REVEAL) played.current = true;
  if (option === "old") return <SupportDay className={className} t={t} fixAt={fixAt} win={win} rewinding={rewinding} />;
  // (guarded: an unknown option falls back to the default drawing)
  const { key, Drawing } = DRAWINGS[option] ?? DRAWINGS.default;
  const copy = support.options[key];
  return (
    <div role="img" aria-label={copy.label} className={cn("bzl-day bzl-mk", className)}>
      <svg viewBox={`0 0 ${DW} ${DH}`} aria-hidden="true">
        <Drawing t={t} F={fixAt} W={win} kept={played.current} inbox={support.day.inbox} now={now} />
        <Label t={t} F={fixAt} copy={copy} />
      </svg>
      <RewindMark on={rewinding} />
    </div>
  );
};
