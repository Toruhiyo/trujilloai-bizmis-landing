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
  | { kind: "arrow"; d: string; head: string };
export type Arranged = {
  fnW: number;
  fnH: number;
  fnLeft: number;
  fnTop: number;
  beats: { x: number; y: number; w: number; h: number; origin: string; copy: CSSProperties; link: Link }[];
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

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
 * ?beat=9b: the opener over its stage's label, the funnel as wide as the
 * room left of the device, the device in its own column on the right; a
 * marker arrow arches from the device over onto the opener.
 */
export const arrangeOpener = (W: number, H: number, aspect: number, visits?: string): Arranged => {
  const pad = 12;
  const gy = clamp(H * 0.035, 16, 30);
  const colGap = clamp(W * 0.04, 32, 72);
  const devCol = clamp(W * 0.32, 300, 480);
  const rest = W - devCol - colGap;
  const ow = Math.min(rest, clamp(W * 0.4, 380, 620));
  const fs = Math.min(clamp(Math.min(W * 0.026, H * 0.048), 26, 40), ow / 17);
  // kicker and up to two lines
  const openerH = 44 + fs * 2.3;
  const fnW = Math.min(rest, (H - 2 * pad - openerH - gy) * aspect);
  const fnH = fnW / aspect;
  // the opener and the funnel as one block, centred in the stage's height
  const top0 = Math.max(pad, (H - (openerH + gy * 0.3 + fnH)) / 2);
  const fnTop = top0 + openerH + gy * 0.3;
  const fnLeft = (rest - fnW) / 2;
  const an = funnelAnchors(fnW, fnH, [1, 1, 1], visits);
  const foot = fnTop - 4;
  const beats = [0, 1, 2].map((i) => {
    const A = DEVICE_ASPECT[i];
    // as tall as leaves the arrow its room above
    const room = clamp(H * 0.16, 80, 130);
    const w = Math.min(devCol, (H - 2 * pad - room) * A, i === 1 ? 360 : Infinity);
    const h = w / A;
    const x = rest + colGap + (devCol - w) / 2;
    const y = Math.max(pad + room, (H - h) / 2);
    const ch = an.chambers[i];
    const left = clamp(fnLeft + ch.xc - ow / 2, 0, rest - ow);
    // the arrow: up out of the device's top, over, down onto the opener (its one line's top)
    const s: Pt = [x + w * 0.3, y - 14];
    const e: Pt = [fnLeft + ch.xc, foot - (44 + fs * 1.15) - 12];
    const over = Math.max(pad, Math.min(s[1], e[1]) - clamp(H * 0.08, 44, 80));
    const hw = clamp(W * 0.007, 7, 11);
    return {
      x,
      y,
      w,
      h,
      origin: `${e[0] - x}px ${e[1] - y}px`,
      copy: { left, width: ow, bottom: H - foot, ["--bch-fs" as string]: `${fs}px` },
      link: {
        kind: "arrow" as const,
        d: `M${s[0]} ${s[1]} C ${s[0]} ${over}, ${e[0]} ${over}, ${e[0]} ${e[1]}`,
        head: `M${e[0] - hw} ${e[1] - hw * 1.3} L ${e[0]} ${e[1]} L ${e[0] + hw} ${e[1] - hw * 1.3}`,
      },
    };
  });
  return { fnW, fnH, fnLeft, fnTop, beats };
};
