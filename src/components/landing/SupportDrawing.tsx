import { useId, useRef } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { RewindMark } from "./RewindSign";
import { span } from "./useRewindLoop";
import { useNow } from "./sales/hooks";
import {
  Ask,
  Flip,
  Hand,
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

/**
 * Customer Support's drawing: ONE benefit to the merchant at scale, the
 * support inbox kept light round the clock. A clock in the corner, its
 * hands racing round the hours; the shoppers' questions drift in from the
 * edges and pile up in the inbox as tickets, well over its rim. Then a new
 * day (`fixAt`, as the device starts answering): the clock whirls on and the
 * old pile goes by itself (it sinks and fades; nobody answers it), and the
 * agent (the Support mockup's, in the widget's head circle) lands on the
 * questions' way and catches the new ones out loud, all but the rare one
 * that needs the merchant, so the inbox stays nearly empty. Once it's done
 * it goes on in real time: the hands drifting round, a question now and
 * then, caught. In the Sales funnel's marker, all in the band's marker ink
 * (the Bizmis primary). The label: "Questions pile up" written, struck at
 * the fix, then "Only the few that need you" written and ticked. Every frame
 * comes from `t`, so the scroll's rewind runs it backwards.
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
  return { fixAt, win, end: fixAt + win + 1200 };
};

/** Stamped on at `at`, as a Sales seal: big, then springing to size, squashing a little as it lands. */
const stampAt = (t: number, at: number) => {
  const q = (t - at) / STAMP;
  const s = q > 0 ? (q < 1 ? 1.6 - 0.6 * spring(q) : 1) : 0;
  const sq = q > 0.25 && q < 1.6 ? 0.2 * Math.exp(-3.5 * (q - 0.25)) * Math.cos(6 * (q - 0.25)) : 0;
  return { q, s, sq };
};

/** The agent: the Support mockup's own (yusuke), in the widget's head circle. */
const AGENT_HEAD = "/landing/heads/yusuke.webp";

/**
 * The agent's head as the Bizmis widget shows it (BizmisWidget's HeadCircle):
 * crisp UI, not marker. A white disc with a soft shadow, the head render
 * filling it, the brand's thin ring on its rim; while it talks (0 → 1) the
 * widget's speaking pulse, a breathing glow and rings going out of the
 * circle, on `clock` (real time where there is one, so it never stutters).
 * Stamped on at `at` (popping to size); the head nods along inside it.
 */
const AgentHead = ({ x, y, r = 24, t, at, talk = 0, clock }: { x: number; y: number; r?: number; t: number; at: number; talk?: number; clock?: number }) => {
  const id = useId().replace(/:/g, "");
  const { q, s } = stampAt(t, at);
  if (s <= 0) return null;
  const c = clock || t;
  const nod = talk * Math.sin(t / 110) * 4;
  const ring = "hsl(var(--primary))";
  return (
    <g className="bzs-head" opacity={f(clamp01(q * 3))} transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`}>
      <defs>
        <filter id={`${id}s`} x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy={f(r * 0.2)} stdDeviation={f(r * 0.24)} floodColor="#3b2416" floodOpacity="0.16" />
        </filter>
        <clipPath id={`${id}c`}>
          <circle cx={0} cy={0} r={r} />
        </clipPath>
        <radialGradient id={`${id}g`}>
          <stop offset="0%" stopColor={ring} stopOpacity="0.3" />
          <stop offset="60%" stopColor={ring} stopOpacity="0.14" />
          <stop offset="100%" stopColor={ring} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* the speaking pulse: the glow breathing, three rings going out of the circle */}
      {talk > 0 && (
        <g opacity={f(talk)}>
          <circle cx={0} cy={0} r={f(r * (1.4 + 0.08 * Math.sin(c / 175)))} fill={`url(#${id}g)`} style={{ stroke: "none" }} />
          {[0, 1, 2].map((j) => {
            const k = (c / 1500 + j / 3) % 1;
            const e = 1 - (1 - k) ** 2.4;
            return <circle key={j} cx={0} cy={0} r={f(r * (1 + 0.32 * e))} style={{ fill: "none", stroke: ring, strokeWidth: 1.4 }} opacity={f(0.8 * (1 - k))} />;
          })}
        </g>
      )}
      <circle cx={0} cy={0} r={r} filter={`url(#${id}s)`} style={{ fill: "#fff", stroke: "none" }} />
      <g clipPath={`url(#${id}c)`}>
        <image href={AGENT_HEAD} x={-r} y={-r} width={r * 2} height={r * 2} transform={`rotate(${f(nod)} 0 ${f(r * 0.6)})`} preserveAspectRatio="xMidYMid slice" />
      </g>
      {/* the brand's thin ring on the rim, breathing a little while it talks */}
      <circle
        cx={0}
        cy={0}
        r={f(r + 0.75 + talk * 0.6 * (0.5 + 0.5 * Math.sin(c / 110)))}
        style={{ fill: "none", stroke: ring, strokeWidth: 1.5 }}
        opacity={f(0.55 + 0.4 * talk)}
      />
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
  gone = 0,
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
  /** The pile going away on its own (0 → 1): its tickets sink into the tray and fade, no one answering them. */
  gone?: number;
}) => {
  const drawIn = kept ? 1 : easeOut(span(t, 0, REVEAL));
  const full = Math.min(Math.max(4, keep + 3), n - 1);
  const strain = span(t, landAt(full), landAt(full) + 200) * (1 - span(t, drainAt(full), drainAt(full) + drain)) * (1 - gone);
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
        // going away on its own: the higher ones first, each sinking into the tray as it fades
        const g = easeIn(clamp01(gone * 1.6 - (i / Math.max(1, n - 1)) * 0.6));
        if (g >= 1) return null;
        return (
          <g key={i} opacity={f(1 - g)}>
            <Ticket x={x} y={y + 34 * g} tilt={s0.tilt * (1 - d) * (1 - g)} s={Math.min(1, land * 2) * (1 - 0.75 * d)} />
          </g>
        );
      })}
      {Array.from({ length: n }, (_, k) => !pops || k < keep ? null : (
        <Pop key={`d${k}`} x={to[0] + (k % 2 ? 30 : -30)} y={to[1] - 22} k={span(t, drainAt(k) + drain - 40, drainAt(k) + drain + 720)} />
      ))}
    </>
  );
};

/* ── The clock: questions from everywhere; a new day; the agent keeps the inbox nearly empty ── */

const CL = { x: 74, y: 120, r: 44 }; // time passing, on its own in the corner
const CL_TRAY = { x: 404, y: 206, w: 124, h: 38 };
const CL_HEAD = { x: 282, y: 150 };
const CL_R = 30;
const CL_LOSS = 8; // before the agent: every question a ticket, the pile well over the tray's rim
const CL_RESET = 700; // the scene change, ending as the agent lands: the clock whirls into a new day, the old pile goes by itself
const CL_WIN = 4; // after: the new ones, caught on their way...
const CL_RARE = 2; // ...but the rare one that needs the merchant, which goes on to the inbox
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
  const resetAt = F - CL_RESET;
  const lossAt = spread(CL_LOSS, 280, Math.max(380, resetAt - FLY - 60));
  const landAt = (i: number) => lossAt(i) + FLY;
  const gone = easeInOut(span(t, resetAt + 100, F));
  const winAt = spread(CL_WIN, F + 400, F + W - 800);
  const rare = clSlot(0);
  const rareLand = winAt(CL_RARE) + FLY;
  const rareIn = span(t, rareLand - 120, rareLand + 220);
  const done = t >= F + W;
  // the clock, time-lapse: the hour hand round once, a whirl into the new day as the agent lands, round once more; always drifting on in real time
  const hours = span(t, 300, resetAt) + easeInOut(span(t, resetAt, F)) * 1.5 + span(t, F, F + W) + now / 24000;
  const hourA = hours * Math.PI * 2 - Math.PI / 2;
  const minA = hours * 8 * Math.PI * 2 - Math.PI / 2;
  // once it's done: a question now and then, from an edge, caught
  const amb = Math.floor(now / CL_AMBIENT);
  const ambK = (now % CL_AMBIENT) / CL_AMBIENT;
  const ambFrom = CL_FROM[(amb * 3) % CL_FROM.length];
  const ambHit = clHit(ambFrom[0], ambFrom[1]);
  const answers = Array.from({ length: CL_WIN }, (_, i) => i).filter((i) => i !== CL_RARE).map((i) => winAt(i) + TO);
  const ambTalk = done ? span(ambK, 0.4, 0.48) * (1 - span(ambK, 0.62, 0.72)) : 0;
  const talk = Math.max(talking(t, answers), ambTalk);
  // a question's way: past the agent's spot, on to `end` (u: 0 → 1, 0.5 at the agent)
  const route = (sx: number, sy: number, end: readonly number[], u: number) => {
    const c1 = [(sx + CL_HEAD.x) / 2, Math.min(sy, CL_HEAD.y) - 40];
    if (u <= 0.5) return quad([sx, sy], c1, [CL_HEAD.x, CL_HEAD.y], u * 2);
    const c2 = [CL_HEAD.x + (CL_HEAD.x - c1[0]) * 0.55, CL_HEAD.y + (CL_HEAD.y - c1[1]) * 0.55];
    return quad([CL_HEAD.x, CL_HEAD.y], c2, end, (u - 0.5) * 2);
  };
  const ambPos = arc(ambFrom[0], ambFrom[1], [ambHit[0], ambHit[1]], easeInOut(clamp01(ambK / 0.46)), 30);
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

      {/* the inbox: piling up; at the new day the old pile goes by itself (nobody answers it); after, only the rare one lands */}
      <Inbox
        tray={CL_TRAY}
        t={t}
        kept={kept}
        inbox={inbox}
        n={CL_LOSS}
        landAt={landAt}
        drainAt={() => 1e9}
        drain={400}
        to={[CL_HEAD.x, CL_HEAD.y]}
        keep={CL_LOSS}
        slot={clSlot}
        pops={false}
        gone={gone}
      />
      {rareIn > 0 && <Ticket x={rare.x} y={rare.y - 14 * (1 - easeBack(rareIn))} tilt={rare.tilt} s={Math.min(1, rareIn * 2)} />}

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
            <Voice x={CL_HEAD.x} y={CL_HEAD.y} r0={CL_R + 10} dir={a} on={voicing(t, [at])} t={t} spread={0.36} />
            <Pop x={hx} y={hy - 12} k={span(t, at - 40, at + 720)} />
          </g>
        );
      })}
      {/* once it's done, it goes on: now and then a question drifts in and is caught */}
      {done && (
        <g>
          {ambK < 0.46 && <Ask x={ambPos[0]} y={ambPos[1]} s={spring(span(ambK, 0.02, 0.18)) * (1 - easeIn(span(ambK, 0.38, 0.46)))} />}
          <Voice x={CL_HEAD.x} y={CL_HEAD.y} r0={CL_R + 10} dir={ambHit[2]} on={span(ambK, 0.36, 0.44) * (1 - span(ambK, 0.56, 0.66))} t={now} spread={0.36} />
          <Pop x={ambHit[0]} y={ambHit[1] - 12} k={span(ambK, 0.45, 0.85)} />
        </g>
      )}
      <AgentHead x={CL_HEAD.x} y={CL_HEAD.y} r={CL_R} t={t} at={F} talk={talk} clock={now} />
    </>
  );
};

/**
 * Customer Support's drawing on its section's clock (`t` ms along the
 * scene, the fix at `fixAt`, its "after" `win` long, supportClockTimes).
 * ◀◀ while it rewinds.
 */
export const SupportDrawing = ({
  className,
  t,
  fixAt,
  win,
  rewinding = false,
  active = true,
}: {
  className?: string;
  t: number;
  fixAt: number;
  win: number;
  rewinding?: boolean;
  /** On screen: what keeps going in real time once it's done runs. */
  active?: boolean;
}) => {
  const support = useMessages().landing.support;
  const now = useNow(active);
  // drawn in once; from then on the scenery stays, so a replay never starts blank
  const played = useRef(false);
  if (t >= REVEAL) played.current = true;
  const copy = support.options.clock;
  return (
    <div role="img" aria-label={copy.label} className={cn("bzl-day bzl-mk", className)}>
      <svg viewBox={`0 0 ${DW} ${DH}`} aria-hidden="true">
        <ClockDrawing t={t} F={fixAt} W={win} kept={played.current} inbox={support.day.inbox} now={now} />
        <Label t={t} F={fixAt} copy={copy} />
      </svg>
      <RewindMark on={rewinding} />
    </div>
  );
};
