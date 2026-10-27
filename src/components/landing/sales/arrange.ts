import type { CSSProperties } from "react";
import { funnelAnchors } from "./funnel/FunnelFlow";
import { DEVICE_ASPECT } from "./SalesShell";
import type { ArrLook } from "./beatcopy/style";

/*
 * ?beat=8a..8d: the beat's three pieces (its device, the funnel, its words
 * standing in for the funnel's label) arranged around the funnel instead of
 * hung over it (SalesSpine's own layout):
 *
 * a · a stack on one axis: the device above the funnel, the words below it
 * b · a stack on one axis: the words above the funnel, the device below it,
 *     hanging from the stage's floor (where its leak and its agent are)
 * c · two columns: the device left; the funnel and the words under it right
 * d · two columns, mirrored: the funnel and its words left, the device right
 *
 * Stacks join the device to its chamber with the zoom cone, columns with a
 * marker arrow arching over the funnel onto the chamber. The payoff keeps SalesSpine's layout.
 */

type Pt = [number, number];
export type Link =
  /** The cone: the stage's edge and the device's edge, each [x0, x1, y]. */
  | { kind: "cone"; stage: number[]; device: number[] }
  /** A marker arrow from the device to its chamber: the stroke and its head. */
  | { kind: "arrow"; d: string; head: string }
  /**
   * ?beat=9b: the chamber lit from inside (the funnel draws that) and a hand-drawn marker arrow
   * from under its floor to the device: `d` its line, `head` its two strokes.
   */
  | { kind: "lens"; d: string; head: string };
export type Arranged = {
  fnW: number;
  fnH: number;
  fnLeft: number;
  fnTop: number;
  beats: { x: number; y: number; w: number; h: number; origin: string; copy: CSSProperties; link: Link }[];
  /** The span [left, right] the words may take (9b: the funnel's column). */
  wordsRoom?: [number, number];
  /** The payoff in the same frame, if the arrangement keeps it there: its words and its metric card. */
  payoff?: { copy: CSSProperties; card: { left: number; top: number; width: number }; under?: boolean };
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const f1 = (v: number) => v.toFixed(1);

/**
 * A hand-drawn marker arrow along the cubic s → e (controls c1, c2): the
 * line with the hand's small, fixed wobble (it never boils as it draws in),
 * and an open head of two curved strokes, one a touch longer, in one go.
 * `size` is the head's length (px).
 */
const markerArrow = (s: Pt, c1: Pt, c2: Pt, e: Pt, size: number) => {
  const at = (t: number): Pt => {
    const u = 1 - t;
    return [0, 1].map(
      (k) => u * u * u * s[k] + 3 * u * u * t * c1[k] + 3 * u * t * t * c2[k] + t * t * t * e[k],
    ) as Pt;
  };
  const tan = (t: number): Pt => {
    const u = 1 - t;
    const v = [0, 1].map(
      (k) => 3 * u * u * (c1[k] - s[k]) + 6 * u * t * (c2[k] - c1[k]) + 3 * t * t * (e[k] - c2[k]),
    );
    const n = Math.hypot(v[0], v[1]) || 1;
    return [v[0] / n, v[1] / n];
  };
  const N = 28;
  const pts: string[] = [];
  for (let n = 0; n <= N; n++) {
    const t = n / N;
    const p = at(t);
    const d = tan(t);
    // the wobble: none at the ends (they land where they're meant to), a little in the middle
    const w = Math.sin(t * Math.PI) * (Math.sin(t * 9.1 + 0.7) * 1.1 + Math.sin(t * 23.3) * 0.45);
    pts.push(`${f1(p[0] - d[1] * w)} ${f1(p[1] + d[0] * w)}`);
  }
  const d = tan(1);
  const nr: Pt = [-d[1], d[0]];
  // the head: back from the tip along the line, swept out; the upper wing longer, both bowing in a little
  const wing = (side: number, len: number, spread: number): [Pt, Pt] => {
    const end: Pt = [e[0] - d[0] * len + nr[0] * spread * side, e[1] - d[1] * len + nr[1] * spread * side];
    const bow: Pt = [
      e[0] - d[0] * len * 0.45 + nr[0] * spread * side * 0.32,
      e[1] - d[1] * len * 0.45 + nr[1] * spread * side * 0.32,
    ];
    return [end, bow];
  };
  const [a, ab] = wing(-1, size, size * 0.58);
  const [b, bb] = wing(1, size * 0.92, size * 0.56);
  const head =
    `M${f1(a[0])} ${f1(a[1])} Q ${f1(ab[0])} ${f1(ab[1])} ${f1(e[0])} ${f1(e[1])}` +
    ` Q ${f1(bb[0])} ${f1(bb[1])} ${f1(b[0])} ${f1(b[1])}`;
  return { d: `M${pts.join(" L ")}`, head };
};

export const arrange = (W: number, H: number, look: ArrLook, aspect: number, visits?: string): Arranged => {
  const pad = 12;
  const gy = clamp(H * 0.035, 16, 30);
  const stack = look === "a" || look === "b";

  if (stack) {
    // the funnel a little smaller than a beat's usual, so the device keeps its size
    const fnW = Math.min(W * 0.82, clamp(H * 0.29, 160, 240) * aspect);
    const fnH = fnW / aspect;
    const fnLeft = (W - fnW) / 2;
    const an = funnelAnchors(fnW, fnH, [1, 1, 1], visits);
    // the funnel's ink starts at its mouth's lip (above it, the box's empty label row)
    const inkTop = an.mouth.top - 6;
    const wordsW = Math.min(W * 0.86, 940);
    const fs = Math.min(clamp(Math.min(W * 0.024, H * 0.045), 22, 38), wordsW / 17);
    const wordsH = 44 + fs * 3.5;
    const wordsTop = look === "a" ? H - pad - wordsH : pad;
    const fnTop = look === "a" ? wordsTop - gy * 0.4 - fnH : wordsTop + wordsH + gy * 0.6 - inkTop;
    const devTop = look === "a" ? pad + 4 : fnTop + fnH + gy * 0.6;
    const devBottom = look === "a" ? fnTop + inkTop - gy * 1.8 : H - pad;
    const beats = [0, 1, 2].map((i) => {
      const A = DEVICE_ASPECT[i];
      const w = Math.min((devBottom - devTop) * A, W * 0.6, i === 1 ? 320 : Infinity);
      const h = w / A;
      const x = (W - w) / 2;
      const y = look === "a" ? devBottom - h : devTop;
      const ch = an.chambers[i];
      const inset = Math.min(18, w * 0.06);
      // a: from the chamber's top, up to the device's foot; b: from its floor, down to the device's top
      const sy = look === "a" ? fnTop + inkTop : fnTop + ch.floor + 4;
      const dy = look === "a" ? y + h - 6 : y + 6;
      return {
        x,
        y,
        w,
        h,
        origin: `${fnLeft + ch.xc - x}px ${sy - y}px`,
        copy: { left: (W - wordsW) / 2, width: wordsW, top: wordsTop, ["--bch-fs" as string]: `${fs}px` },
        link: {
          kind: "cone" as const,
          stage: [fnLeft + ch.xa + 8, fnLeft + ch.xb - 8, sy],
          device: [x + inset, x + w - inset, dy],
        },
      };
    });
    return { fnW, fnH, fnLeft, fnTop, beats };
  }

  // the columns: the device's, and the funnel's with the words under it
  const colGap = clamp(W * 0.045, 32, 80);
  const devCol = W * 0.44;
  const rest = W - devCol - colGap;
  const restLeft = look === "c" ? devCol + colGap : 0;
  const fnW = Math.min(rest, clamp(H * 0.42, 200, 340) * aspect);
  const fnH = fnW / aspect;
  const an = funnelAnchors(fnW, fnH, [1, 1, 1], visits);
  const inkTop = an.mouth.top - 6;
  const wordsW = fnW;
  const fs = Math.min(clamp(Math.min(W * 0.022, H * 0.042), 22, 36), wordsW / 17);
  const wordsH = 44 + fs * 3.5;
  // the funnel and its words as one block, centred in the stage's height
  const block = fnH - inkTop + gy * 0.4 + wordsH;
  const fnTop = Math.max(pad, (H - block) / 2) - inkTop;
  const fnLeft = restLeft + (rest - fnW) / 2;
  const wordsTop = fnTop + fnH + gy * 0.4;
  const beats = [0, 1, 2].map((i) => {
    const A = DEVICE_ASPECT[i];
    const w = Math.min(devCol, (H - 2 * pad) * A, i === 1 ? 360 : Infinity);
    const h = w / A;
    const x = look === "c" ? (devCol - w) / 2 : restLeft + rest + colGap + (devCol - w) / 2;
    const y = (H - h) / 2;
    const ch = an.chambers[i];
    // the arrow: up out of the device's top (on the funnel's side), over the funnel's top, down onto its chamber
    const s: Pt = [look === "c" ? x + w * 0.72 : x + w * 0.28, y - 14];
    const e: Pt = [fnLeft + ch.xc, fnTop + inkTop - 14];
    const over = Math.min(s[1], e[1]) - clamp(H * 0.09, 50, 90);
    const c1: Pt = [s[0], over];
    const c2: Pt = [e[0], over];
    const hw = clamp(W * 0.007, 7, 11);
    return {
      x,
      y,
      w,
      h,
      origin: `${e[0] - x}px ${e[1] - y}px`,
      copy: { left: fnLeft, width: wordsW, top: wordsTop, ["--bch-fs" as string]: `${fs}px` },
      link: {
        kind: "arrow" as const,
        d: `M${s[0]} ${s[1]} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${e[0]} ${e[1]}`,
        head: `M${e[0] - hw} ${e[1] - hw * 1.3} L ${e[0]} ${e[1]} L ${e[0] + hw} ${e[1] - hw * 1.3}`,
      },
    };
  });
  return { fnW, fnH, fnLeft, fnTop, beats };
};

/**
 * ?beat=9b: the opener over its stage's label and the funnel, as wide as
 * the room left of the device, as one block; the device in its own column
 * on the right, level with it; the stage's chamber lit from inside
 * and an arrow from its foot, swooping under the funnel, into the device. The payoff keeps the same
 * funnel, in the same place: its words where the opener stood, its metric
 * card where the device stood.
 */
export const arrangeOpener = (W: number, H: number, aspect: number, visits?: string): Arranged => {
  // no room for a device column (phones, small tablets): the same pieces stacked
  if (W < 860) return arrangeOpenerStacked(W, H, aspect, visits);
  const pad = 12;
  const colGap = clamp(W * 0.035, 28, 64);
  const devCol = clamp(W * 0.36, 320, 560);
  const rest = W - devCol - colGap;
  const ow = Math.min(rest, clamp(W * 0.42, 380, 640));
  const fs = Math.min(clamp(Math.min(W * 0.025, H * 0.046), 26, 40), ow / 17);
  // kicker and up to two lines, then air before the label it reads into
  const openerH = 44 + fs * 2.3;
  const air = clamp(H * 0.022, 12, 24);
  const fnW = Math.min(rest, (H - 2 * pad - openerH - air) * aspect);
  const fnH = fnW / aspect;
  // the opener and the funnel as one block, centred in the stage's height
  const block = openerH + air + fnH;
  const top0 = Math.max(pad, (H - block) / 2);
  const fnTop = top0 + openerH + air;
  const fnLeft = (rest - fnW) / 2;
  const an = funnelAnchors(fnW, fnH, [1, 1, 1], visits);
  const foot = fnTop - air;
  const mid = fnTop + an.cy;
  const beats = [0, 1, 2].map((i) => {
    const A = DEVICE_ASPECT[i];
    // (room under the device for the arrow coming up into it)
    const under = clamp(H * 0.1, 56, 90);
    const w = Math.min(devCol, (H - 2 * pad - under) * A, i === 1 ? 380 : Infinity);
    const h = w / A;
    const x = rest + colGap + (devCol - w) / 2;
    // level with the funnel's run, as far as the stage lets it
    const y = clamp(mid - h / 2, pad, H - pad - under - h);
    const ch = an.chambers[i];
    const left = clamp(fnLeft + ch.xc - ow / 2, 0, rest - ow);
    // the arrow: out from under the chamber's floor, a long easy swoop under the funnel, curling up into the device's foot
    // (clear of the agent's badge on the floor)
    const lb = fnTop + ch.floor + clamp(fnH * 0.12, 26, 42);
    const s: Pt = [fnLeft + ch.xc, lb];
    const e: Pt = [x + w * 0.28, y + h + clamp(H * 0.022, 14, 22)];
    const dip = Math.min(H - 6, Math.max(s[1], e[1]) + clamp(H * 0.06, 34, 56));
    const span = e[0] - s[0];
    // the last stretch comes in straight along the head's line (up and to the right), so the head sits
    // square on the stroke, its two strokes even on either side
    const k = clamp(Math.hypot(span, dip - e[1]) * 0.28, 60, 220);
    const arrow = markerArrow(s, [s[0] + span * 0.22, dip + 10], [e[0] - 0.5 * k, e[1] + 0.87 * k], e, clamp(W * 0.013, 16, 22));
    return {
      x,
      y,
      w,
      h,
      origin: `${fnLeft + ch.xc - x}px ${mid - y}px`,
      copy: { left, width: ow, bottom: H - foot, ["--bch-fs" as string]: `${fs}px` },
      link: { kind: "lens" as const, ...arrow },
    };
  });
  const cardW = Math.min(devCol, 380);
  return {
    fnW,
    fnH,
    fnLeft,
    fnTop,
    beats,
    wordsRoom: [0, rest],
    payoff: {
      copy: { left: fnLeft, right: "auto", width: fnW, top: "auto", bottom: H - foot },
      card: { left: rest + colGap + (devCol - cardW) / 2, top: mid - (cardW * (168 / 330)) / 2, width: cardW },
    },
  };
};

/**
 * ?beat=9b on a narrow stage (phones, small tablets), pinned like the
 * desktop and driven by the scroll the same way: the opener over its
 * label, the funnel full width, the device under it, the chamber's arrow
 * pointing down into it. The payoff keeps the funnel; its metric card
 * takes the device's place.
 */
const arrangeOpenerStacked = (W: number, H: number, aspect: number, visits?: string): Arranged => {
  const pad = 10;
  const fs = clamp(W * 0.06, 19, 28);
  // kicker and up to two lines, then air before the label
  const openerH = 40 + fs * 2.3;
  const air = clamp(H * 0.016, 8, 16);
  const fnW = W;
  const fnH = fnW / Math.max(aspect, 2.3);
  const fnTop = pad + openerH + air;
  const an = funnelAnchors(fnW, fnH, [1, 1, 1], visits);
  const foot = fnTop - air;
  // the device: what's left under the funnel, less the arrow's room
  const gap = clamp(H * 0.05, 26, 44);
  const devTop = fnTop + fnH + gap;
  const room = H - pad - devTop;
  const beats = [0, 1, 2].map((i) => {
    const A = DEVICE_ASPECT[i];
    const w = Math.min(W * (A > 1 ? 1 : 0.86), room * A);
    const h = w / A;
    const x = (W - w) / 2;
    // a short device (the browser, the tablet) a little lower in the room left, the arrow longer
    const y = devTop + Math.max(0, room - h) * 0.3;
    const ch = an.chambers[i];
    // the arrow: out from under the chamber's floor, curving over to the device's top, pointing down into it
    const lb = fnTop + ch.floor + clamp(fnH * 0.16, 20, 30);
    const s: Pt = [ch.xc, lb];
    const e: Pt = [clamp(ch.xc, x + w * 0.3, x + w * 0.7), y - 14];
    const mid = (s[1] + e[1]) / 2;
    const arrow = markerArrow(s, [s[0], mid], [e[0], mid - 4], e, clamp(W * 0.035, 11, 15));
    return {
      x,
      y,
      w,
      h,
      origin: `${ch.xc - x}px ${lb - y}px`,
      copy: { left: 0, width: W, bottom: H - foot, ["--bch-fs" as string]: `${fs}px` },
      link: { kind: "lens" as const, ...arrow },
    };
  });
  const cardW = Math.min(W, 360);
  return {
    fnW,
    fnH,
    fnLeft: 0,
    fnTop,
    beats,
    wordsRoom: [0, W],
    // the payoff's words don't fit over the funnel here: under it (smaller), the metric card under them
    payoff: {
      copy: { left: 0, right: "auto", width: W, top: fnTop + fnH + gap * 0.5, bottom: "auto" },
      // (its words are the title alone: two lines)
      card: { left: (W - cardW) / 2, top: fnTop + fnH + gap * 0.5 + clamp(W * 0.27, 90, 116), width: cardW },
      under: true,
    },
  };
};
