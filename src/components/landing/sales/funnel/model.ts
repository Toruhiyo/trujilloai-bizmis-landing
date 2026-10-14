/**
 * The at-scale funnel's (illustrative) model, one story across the pillar:
 * the store starts as ONE bad funnel (every stage leaking badly). Beat 01
 * fixes discovery; beat 02 keeps that fix and fixes decision; beat 03 keeps
 * both and fixes checkout; the payoff is all three fixed. Stages not fixed
 * yet keep performing poorly. Even fixed, a stage still loses some shoppers
 * and the funnel still narrows: better, never lossless. Shapes only: no
 * figure from it is ever printed, and none is a claim.
 *
 * The shoppers are a deterministic stream: shopper `i` arrives at a fixed
 * time, at a fixed speed, and its fate at each stage is fixed by the stage's
 * rate at the moment it gets there. So any moment of the timeline can be
 * drawn from `t` alone, forwards or backwards (the rewind).
 */
/** A stage without Bizmis: big leaks. */
export const BAD = [0.32, 0.3, 0.34];
/** A stage with Bizmis: far better, never lossless. */
export const GOOD = [0.84, 0.8, 0.86];

/** The pass rate of stage `g`, `k` (0 → 1) of the way fixed. */
export const rate = (g: number, k: number) => BAD[g] + (GOOD[g] - BAD[g]) * k;

/** How many of the visitors are left after each stage: [visits, fit, decided, ordered]. */
export const flows = (k: number[]) => {
  const out = [1];
  for (let g = 0; g < 3; g++) out.push(out[g] * rate(g, k[g] ?? 0));
  return out;
};

/** Where each stage starts and ends (fractions of the width), and where orders leave for the sales. */
export const STAGES: [number, number][] = [
  [0.02, 0.26],
  [0.26, 0.5],
  [0.5, 0.74],
];
export const GATES = STAGES.map(([, b]) => b);
export const END = 0.76;

/** Shoppers per second, how long before 0 the stream starts (so it's full at 0), seconds to cross the width. */
const RATE = 6.6;
const WARM = 3.6;
const CROSS = 3.1;
/** How long a stage takes to be fixed (ms). */
export const RAMP = 1000;

const ease = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

/**
 * When each stage gets fixed (ms on the timeline). A beat (`focus` 0–2): the
 * stages before it are fixed already, its own gets fixed at `fixAt`, the
 * ones after it stay bad. The payoff (3): from the bad funnel, all three
 * fixed one after another.
 */
export const startsFor = (focus: number, fixAt = 1500) =>
  focus >= 3
    ? [1000, 1600, 2200]
    : [0, 1, 2].map((g) => (g < focus ? -Infinity : g === focus ? fixAt : Infinity));

/** How far each stage's fix is at `t` (ms): 0 → 1. */
export const ksAt = (t: number, starts: number[]) => starts.map((s) => ease((t - s) / RAMP));

/** A stable 0..1 random number for (i, j). */
export const rand = (i: number, j: number) => {
  let s = (i * 374761393 + j * 668265263 + 1442695041) >>> 0;
  s = Math.imul(s ^ (s >>> 13), 1274126177);
  s = Math.imul(s ^ (s >>> 16), 2246822519);
  s ^= s >>> 13;
  return (s >>> 0) / 4294967296;
};

export type Shopper = {
  /** Arrival (s on the timeline; negative = already on its way at 0). */
  at: number;
  /** Speed, in widths per second. */
  v: number;
  /** Lane across the stream, -1..1. */
  lane: number;
  phase: number;
  size: number;
  /** The stage it's lost at (0–2), or 3 if it buys. */
  out: number;
  /** When it reaches each stage's end, and the sales (s). */
  gate: number[];
  sold: number;
};

/** The stream for a timeline of `duration` ms with the given fix starts. */
export const makeShoppers = (duration: number, starts: number[]): Shopper[] => {
  const n = Math.ceil((WARM + duration / 1000 + 1) * RATE);
  const list: Shopper[] = [];
  for (let i = 0; i < n; i++) {
    const at = i / RATE - WARM + (rand(i, 1) - 0.5) * 0.1;
    const v = (1 / CROSS) * (0.88 + rand(i, 2) * 0.24);
    const gate = GATES.map((g) => at + g / v);
    let out = 3;
    for (let g = 0; g < 3; g++) {
      const k = ksAt(gate[g] * 1000, starts)[g];
      if (rand(i, 10 + g) >= rate(g, k)) {
        out = g;
        break;
      }
    }
    list.push({
      at,
      v,
      lane: (rand(i, 3) * 2 - 1) * 0.85,
      phase: rand(i, 4),
      size: rand(i, 5),
      out,
      gate,
      sold: at + END / v,
    });
  }
  return list;
};

/** The agent working each stage: the real Bizmis head renders, one per mockup. */
export const STAGE_HEADS = ["amber", "mia", "luca"];

/** The true Bizmis primary (hsl(var(--primary)) = #F9A353), for the canvas, which can't read CSS variables. */
export const PRIMARY = "#F9A353";
