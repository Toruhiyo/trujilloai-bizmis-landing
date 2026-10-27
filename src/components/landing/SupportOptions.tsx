import { useRef } from "react";
import type { ReactNode } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { RewindMark } from "./RewindSign";
import { span } from "./useRewindLoop";
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
 * Customer Support's drawing options (?support=1|2|3), for Oriol to pick
 * from; 0 is the drawing the page ships (PillarMoments' SupportDay). All
 * three tell ONE benefit to the merchant at scale: the support inbox stays
 * clear, day and night. Questions keep coming round the clock; until the fix
 * (`fixAt`, as the device starts answering) they pile up in the inbox as
 * tickets; then Bizmis' voice (a round voice button with a waveform, as on
 * the widget; no figure drawn) answers the backlog and every new question
 * before it gets there. In the Sales funnel's marker, all in the band's
 * marker ink (the Bizmis primary). The label: the loss written, struck at
 * the fix, then the win written and ticked. Every frame comes from `t`, so
 * the scroll's rewind runs it backwards.
 *
 * 1 Sky: a sun and a moon going over the inbox, day, night, day, night; the
 *   voice a dome over the inbox that catches the questions as they come.
 * 2 Clock: a day-and-night clock (a sun and a moon on its dial, the one it's
 *   in showing over it) sending questions to the inbox; the voice on their
 *   way answers them.
 * 3 Morning: one night of questions under the moon; the voice a wave over the
 *   inbox; the sun comes up on it empty.
 */

const DW = 560;
const DH = 280;
const STAMP = 360;
const REVEAL = 600;

type Copy = { label: string; problem: string; solution: string };
type DrawProps = { t: number; F: number; W: number; kept: boolean; inbox: string };

/** Stamped on at `at`, as a Sales seal: big, then springing to size, squashing a little as it lands. */
const stampAt = (t: number, at: number) => {
  const q = (t - at) / STAMP;
  const s = q > 0 ? (q < 1 ? 1.6 - 0.6 * spring(q) : 1) : 0;
  const sq = q > 0.25 && q < 1.6 ? 0.2 * Math.exp(-3.5 * (q - 0.25)) * Math.cos(6 * (q - 0.25)) : 0;
  return { q, s, sq };
};

/** Bizmis' voice: a round button with a waveform in it, stamped on at `at`; its bars dance while it talks (0 → 1). */
const VoiceMark = ({ x, y, r = 22, t, at, talk = 0 }: { x: number; y: number; r?: number; t: number; at: number; talk?: number }) => {
  const { q, s, sq } = stampAt(t, at);
  if (s <= 0) return null;
  return (
    <g opacity={f(clamp01(q * 3))} transform={`translate(${f(x)} ${f(y)}) scale(${f(s * (1 + sq))} ${f(s * (1 - sq))})`}>
      <path className="mk-main mk-white" d={loop(0, 0, r, 5)} />
      {[-2, -1, 0, 1, 2].map((j) => {
        const rest = [0.35, 0.6, 0.85, 0.6, 0.35][j + 2];
        const h = r * (0.28 + 0.34 * rest + 0.3 * talk * Math.abs(Math.sin(t / 85 + j * 1.3)));
        const bx = j * r * 0.3;
        return <path key={j} className="mk-thin" d={`M${f(bx)} ${f(-h / 2)} V${f(h / 2)}`} />;
      })}
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
const Pop = ({ x, y, k }: { x: number; y: number; k: number }) => {
  if (k <= 0 || k >= 1) return null;
  return (
    <g transform={`translate(${f(x)} ${f(y - 26 * easeOut(k))}) scale(${f(spring(clamp01(k * 2.2)))})`} opacity={f(1 - span(k, 0.55, 1))}>
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
}) => {
  const drawIn = kept ? 1 : easeOut(span(t, 0, REVEAL));
  const full = Math.min(4, n - 1);
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
        const s0 = slotOf(tray, i);
        const d = easeInOut(span(t, drainAt(i), drainAt(i) + drain));
        if (d >= 1) return null;
        const x = mix(s0.x + shake, to[0], d);
        const y = mix(s0.y - 14 * (1 - easeBack(land)), to[1], d) - 24 * hump(d);
        return <Ticket key={i} x={x} y={y} tilt={s0.tilt * (1 - d)} s={Math.min(1, land * 2) * (1 - 0.75 * d)} />;
      })}
      {Array.from({ length: n }, (_, k) => (
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
      <VoiceMark x={SK_MARK.x} y={SK_MARK.y} t={t} at={F} talk={talk} />
      <Sparkle x={SK_TRAY.x - 14} y={SK_TRAY.y - 14} k={span(t, F + W - 300, F + W + 200)} size={8} />
      <Sparkle x={SK_TRAY.x + SK_TRAY.w + 16} y={SK_TRAY.y - 4} k={span(t, F + W - 150, F + W + 350)} size={6} spin={20} />
    </>
  );
};

/* ── 2 Clock: questions round the clock, day and night; the voice on their way ── */

const CL = { x: 98, y: 180, r: 56 };
const CL_TRAY = { x: 404, y: 200, w: 120, h: 40 };
const CL_MARK = { x: 290, y: 160 };
const CL_LOSS = 7;
const CL_WIN = 5;

const ClockDrawing = ({ t, F, W, kept, inbox }: DrawProps) => {
  const drawIn = kept ? 1 : easeOut(span(t, 0, REVEAL));
  const FLY = 900;
  const TO = 560;
  const lossAt = spread(CL_LOSS, 350, Math.max(450, F - FLY - 60));
  const landAt = (i: number) => lossAt(i) + FLY;
  const DRAIN = 420;
  const drainAt = (k: number) => F + 360 + (CL_LOSS - 1 - k) * 160;
  const winAt = spread(CL_WIN, F + 1500, F + W - 600);
  // the clock, time-lapse: two days before the fix, two and a half after (it ends on a midnight); the top half the day, the bottom half the night
  const turnsAt = (at: number) => 2 * span(at, 300, F) + 2.5 * span(at, F, F + W);
  const angAt = (at: number) => turnsAt(at) * Math.PI * 2 - Math.PI / 2;
  const rimAt = (at: number) => {
    const a = angAt(at);
    return [CL.x + Math.cos(a) * (CL.r + 6), CL.y + Math.sin(a) * (CL.r + 6)] as const;
  };
  const ha = angAt(t);
  // over the clock, the one it's in now (the hand in the bottom half: the night), popping in at each change
  const halves = turnsAt(t) * 2 + 0.5; // half-turns since the hand last crossed into the day (at nine o'clock)
  const isNight = Math.floor(halves) % 2 === 1;
  const swap = Math.min(1, (halves - Math.floor(halves)) * 8);
  const drains = Array.from({ length: CL_LOSS }, (_, k) => drainAt(k) + DRAIN);
  const answers = Array.from({ length: CL_WIN }, (_, i) => winAt(i) + TO);
  const talk = talking(t, [...drains, ...answers]);
  const route = (sx: number, sy: number, end: readonly number[], u: number) => {
    const c1 = [(sx + CL_MARK.x) / 2, Math.min(sy, CL_MARK.y) - 52];
    if (u <= 0.5) return quad([sx, sy], c1, [CL_MARK.x, CL_MARK.y], u * 2);
    const c2 = [CL_MARK.x + (CL_MARK.x - c1[0]) * 0.55, CL_MARK.y + (CL_MARK.y - c1[1]) * 0.55];
    return quad([CL_MARK.x, CL_MARK.y], c2, end, (u - 0.5) * 2);
  };
  const hit = [CL_MARK.x - 36, CL_MARK.y - 8] as const;
  return (
    <>
      {/* the clock: a sun on its top half, a moon on its bottom, the hand turning through both */}
      <path className="mk-main" d={loop(CL.x, CL.y, CL.r, 4)} {...drawn(drawIn)} />
      <path
        className="mk-thin"
        d={`M${CL.x - CL.r + 10} ${CL.y} H${CL.x - 12} M${CL.x + 12} ${CL.y} H${CL.x + CL.r - 10}`}
        opacity={f(drawIn * 0.7)}
        style={{ strokeDasharray: "4 7" }}
      />
      <g opacity={f(drawIn)} transform={`translate(${CL.x} ${CL.y - 30}) scale(0.5)`}>
        <Sun t={t} />
      </g>
      <g opacity={f(drawIn)} transform={`translate(${CL.x} ${CL.y + 30})`}>
        <Moon s={0.58} />
      </g>
      <path className="mk-main" opacity={f(drawIn)} d={`M${CL.x} ${CL.y} L${f(CL.x + Math.cos(ha) * (CL.r - 16))} ${f(CL.y + Math.sin(ha) * (CL.r - 16))}`} />
      <circle className="mk-dot" cx={CL.x} cy={CL.y} r={4.2} opacity={f(drawIn)} />
      <g opacity={f(drawIn)} transform={`translate(${CL.x} ${CL.y - CL.r - 34}) scale(${f(spring(swap))})`}>
        {isNight ? <Moon s={0.9} /> : <Sun t={t} />}
      </g>

      <Inbox tray={CL_TRAY} t={t} kept={kept} inbox={inbox} n={CL_LOSS} landAt={landAt} drainAt={drainAt} drain={DRAIN} to={[CL_MARK.x + 24, CL_MARK.y]} />

      {/* the questions, off the clock at every hour: before, on to the inbox; after, answered at the voice */}
      {Array.from({ length: CL_LOSS }, (_, i) => {
        const at = lossAt(i);
        if (t < at || t > landAt(i) + 60) return null;
        const [sx, sy] = rimAt(at);
        const s0 = slotOf(CL_TRAY, i);
        const u = easeInOut(span(t, at + 140, landAt(i)));
        const [x, y] = route(sx, sy, [s0.x, s0.y - 12], u);
        return <Ask key={`a${i}`} x={x} y={y} s={spring(span(t, at, at + 300)) * (1 - easeIn(span(u, 0.82, 1)))} />;
      })}
      {Array.from({ length: CL_WIN }, (_, i) => {
        const at = winAt(i);
        const end = at + TO;
        if (t < at || t > end + 60) return null;
        const [sx, sy] = rimAt(at);
        const [x, y] = arc(sx, sy, hit, easeInOut(span(t, at + 140, end)), 44);
        return <Ask key={`w${i}`} x={x} y={y} s={spring(span(t, at, at + 300)) * (1 - easeIn(span(t, end - 140, end)))} />;
      })}
      {Array.from({ length: CL_WIN }, (_, i) => (
        <Pop key={`p${i}`} x={hit[0]} y={hit[1] - 12} k={span(t, winAt(i) + TO - 40, winAt(i) + TO + 720)} />
      ))}
      <Voice x={CL_MARK.x} y={CL_MARK.y} r0={30} dir={Math.PI + 0.25} on={voicing(t, answers)} t={t} />
      <Voice x={CL_MARK.x} y={CL_MARK.y} r0={30} dir={0.35} on={voicing(t, drains)} t={t} />
      <VoiceMark x={CL_MARK.x} y={CL_MARK.y} t={t} at={F} talk={talk} />
      <Sparkle x={CL_TRAY.x - 12} y={CL_TRAY.y - 14} k={span(t, F + W - 300, F + W + 200)} size={8} />
      <Sparkle x={CL_TRAY.x + CL_TRAY.w + 14} y={CL_TRAY.y - 4} k={span(t, F + W - 150, F + W + 350)} size={6} spin={20} />
    </>
  );
};

/* ── 3 Morning: a night of questions, the sun up on an empty inbox ─────────── */

const MO_GROUND = 248;
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
      <path className="mk-mid" d={`M30 ${MO_GROUND} H530`} {...drawn(drawIn)} />
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
      <VoiceMark x={MO_MARK.x} y={MO_MARK.y} t={t} at={F} talk={talk} />
      <Sparkle x={MO_TRAY.x - 14} y={MO_TRAY.y - 12} k={span(t, F + W - 250, F + W + 250)} size={8} />
      <Sparkle x={MO_TRAY.x + MO_TRAY.w + 16} y={MO_TRAY.y - 2} k={span(t, F + W - 100, F + W + 400)} size={6} spin={20} />
    </>
  );
};

const DRAWINGS: Record<Exclude<DrawOption, 0>, { key: "sky" | "clock" | "morning"; Drawing: (p: DrawProps) => ReactNode }> = {
  1: { key: "sky", Drawing: SkyDrawing },
  2: { key: "clock", Drawing: ClockDrawing },
  3: { key: "morning", Drawing: MorningDrawing },
};

/**
 * Customer Support's drawing on its section's clock (`t` ms along the
 * scene, the fix at `fixAt`, its "after" `win` long, as SupportDay's), the
 * option picked by ?support= (0: SupportDay). ◀◀ while it rewinds.
 */
export const SupportDrawing = ({
  option,
  className,
  t,
  fixAt,
  win,
  rewinding = false,
}: {
  option: DrawOption;
  className?: string;
  t: number;
  fixAt: number;
  win: number;
  rewinding?: boolean;
}) => {
  const support = useMessages().landing.support;
  // drawn in once; from then on the scenery stays, so a replay never starts blank
  const played = useRef(false);
  if (t >= REVEAL) played.current = true;
  if (option === 0) return <SupportDay className={className} t={t} fixAt={fixAt} win={win} rewinding={rewinding} />;
  const { key, Drawing } = DRAWINGS[option];
  const copy = support.options[key];
  return (
    <div role="img" aria-label={copy.label} className={cn("bzl-day bzl-mk", className)}>
      <svg viewBox={`0 0 ${DW} ${DH}`} aria-hidden="true">
        <Drawing t={t} F={fixAt} W={win} kept={played.current} inbox={support.day.inbox} />
        <Label t={t} F={fixAt} copy={copy} />
      </svg>
      <RewindMark on={rewinding} />
    </div>
  );
};
