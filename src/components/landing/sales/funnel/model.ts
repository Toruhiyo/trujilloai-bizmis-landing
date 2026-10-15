/**
 * The at-scale funnel's (illustrative) model, one story across the pillar:
 * the store starts as ONE bad funnel (every stage leaking badly). Beat 01
 * fixes discovery; beat 02 keeps that fix and fixes decision; beat 03 keeps
 * both and fixes checkout; the payoff is all three fixed. Stages not fixed
 * yet keep performing poorly. Even fixed, a stage still loses some shoppers
 * and the funnel still narrows: better, never lossless. Shapes only: no
 * figure from it is ever printed, and none is a claim.
 *
 * Everything here is in the funnel's own units (x: 0 → 1 across the stage
 * box, heights: fractions of the mouth), so the drawing only scales it.
 * The shoppers are a deterministic stream: shopper `i` enters at a fixed
 * time and lane, and its fate at each stage is fixed by that stage's pass
 * rate at the moment it would reach the stage's leak. So any moment of the
 * timeline is drawn from `t` alone, forwards or backwards (the rewind).
 */

/** A stage's pass rate without Bizmis: a big leak. */
export const BAD = [0.28, 0.28, 0.3];
/** With Bizmis: the leak sealed, only a few still lost; never lossless. */
export const GOOD = [0.94, 0.93, 0.94];

/** The pass rate of stage `g`, `k` (0 → 1) of the way fixed. */
export const rate = (g: number, k: number) => BAD[g] + (GOOD[g] - BAD[g]) * k;

/**
 * The shape (x as fractions of the funnel's run, from the mouth to the
 * spout's end; heights as fractions of the mouth's half-height): one funnel
 * of three chambers side by side, then the spout. Each chamber narrows from
 * its entry to its exit; how much is how well it works: a bad stage chokes
 * its exit, a fixed one opens it up (the next chambers' entries follow).
 * Always converging (exit < entry), never fully open.
 */
export const CHAMBERS: [number, number][] = [
  [0, 0.3],
  [0.3, 0.6],
  [0.6, 0.88],
];
export const SPOUT: [number, number] = [0.88, 1];
/**
 * A chamber's exit as a share of its entry: choked (bad) → opened up (fixed).
 * A stage's own shape: only its own fix changes it. Upstream fixes only scale
 * it as a whole (its entry is the previous exit), close to the extra traffic
 * they send it, so it reads "same stage, more shoppers", never "worse".
 */
const EXIT_BAD = [0.38, 0.38, 0.4];
const EXIT_GOOD = [0.8, 0.8, 0.8];
/** The spout's half-height, as a share of the last chamber's exit. */
const SPOUT_K = 0.8;
/** Where each chamber's leak (the gap in its floor) sits, along the chamber. */
export const LEAK_AT = 0.64;

/** The half-heights at the mouth and at each chamber's exit, each stage `k` (0 → 1) fixed. */
export const boundsFor = (k: number[]) => {
  const b = [1];
  for (let g = 0; g < 3; g++) b.push(b[g] * (EXIT_BAD[g] + (EXIT_GOOD[g] - EXIT_BAD[g]) * (k[g] ?? 0)));
  return b;
};

/** The funnel's half-height (fraction of the mouth's) at `u` along its run, for `bounds`: only ever shrinks. */
export const halfAtU = (u: number, b: number[]) => {
  for (let i = 0; i < 3; i++) {
    const [lo, hi] = CHAMBERS[i];
    if (u <= hi) return b[i] + (b[i + 1] - b[i]) * (Math.max(0, u - lo) / (hi - lo));
  }
  // the shoulder into the spout, then the spout
  const k = Math.min(1, (u - SPOUT[0]) / 0.03);
  return b[3] * (1 - (1 - SPOUT_K) * k * k * (3 - 2 * k));
};

/** Shoppers per second, seconds before 0 the stream starts (so it's full at 0). */
const RATE = 26;
/** The lanes across the stream (top → floor), and the order shoppers take them in. */
const LANES = [-0.84, -0.56, -0.28, 0, 0.28, 0.56, 0.84];
const LANE_ORDER = [0, 4, 1, 5, 2, 6, 3];
const WARM = 6;
/** Seconds to cross the run. */
const CROSS = 3.2;
/** How long a lost shopper's slide to the leak takes, at most (fraction of a chamber). */
export const PEEL = 0.7;
/** A fall from the leak to the floor of the box (s). */
export const FALL = 1.35;
/** A buyer's hop from the spout into the bag (s). */
export const HOP = 0.42;

/** How long a stage's leak takes to seal once its agent lands (ms): a snap, the change is instant. */
export const RAMP = 90;
/** The agent's drop onto the leak (ms), ending as it lands. */
export const DROP = 380;

const ease = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

/**
 * When each stage's agent lands on its leak (ms on the timeline). A beat
 * (`focus` 0–2): the stages before it are fixed already, its own lands at
 * `fixAt`, the ones after it stay bad. The payoff (3): from the bad funnel,
 * all three land one after another, each given a moment to be seen.
 */
export const startsFor = (focus: number, fixAt = 1500) =>
  focus >= 3
    ? [1300, 2900, 4500]
    : [0, 1, 2].map((g) => (g < focus ? -Infinity : g === focus ? fixAt : Infinity));

/** How far each stage's fix is at `t` (ms): 0 → 1, over RAMP from the landing. */
export const ksAt = (t: number, starts: number[]) => starts.map((s) => ease((t - s) / RAMP));

/** A stable 0..1 random number for (i, j). */
export const rand = (i: number, j: number) => {
  let s = (i * 374761393 + j * 668265263 + 1442695041) >>> 0;
  s = Math.imul(s ^ (s >>> 13), 1274126177);
  s = Math.imul(s ^ (s >>> 16), 2246822519);
  s ^= s >>> 13;
  return (s >>> 0) / 4294967296;
};

/** Where (u) a shopper is `s` seconds after entering at speed factor `v`; > 1 is past the spout. */
export const uAt = (s: number, v: number) => Math.max(0, (s * v) / CROSS);
/** When (s after entering) a shopper at speed `v` reaches `u`. */
export const sAt = (u: number, v: number) => (u * CROSS) / v;

/** Where a chamber's leak is (u). */
export const leakU = (g: number) => CHAMBERS[g][0] + (CHAMBERS[g][1] - CHAMBERS[g][0]) * LEAK_AT;

export type Shopper = {
  /** When it enters at the mouth (s on the timeline; negative = already on its way at 0). */
  at: number;
  /** Speed factor (≈ 1). */
  v: number;
  /** Lane across the stream, -1..1 (top → floor). */
  lane: number;
  /** Where across the leak it drops, -1..1, if lost. */
  spread: number;
  /** The stage it's lost at (0–2), or 3 if it buys. */
  out: number;
  /** When it reaches the leak it's lost at (s), or the spout's end (a buyer). */
  exit: number;
};

/** The stream for a timeline of `duration` ms with the given landing times. */
export const makeShoppers = (duration: number, starts: number[]): Shopper[] => {
  const n = Math.ceil((WARM + duration / 1000 + 1) * RATE);
  const list: Shopper[] = [];
  for (let i = 0; i < n; i++) {
    const at = i / RATE - WARM + (rand(i, 1) - 0.5) * 0.04;
    const v = 0.985 + rand(i, 2) * 0.03;
    // calm lanes, taken in turn: an orderly stream that tightens as the funnel narrows
    const lane = LANES[LANE_ORDER[i % LANES.length]];
    let out = 3;
    let exit = at + sAt(1, v);
    for (let g = 0; g < 3; g++) {
      const when = at + sAt(leakU(g), v);
      const k = ksAt(when * 1000, starts)[g];
      if (rand(i, 10 + g) >= rate(g, k)) {
        out = g;
        exit = when;
        break;
      }
    }
    list.push({ at, v, lane, spread: rand(i, 5) * 2 - 1, out, exit });
  }
  return list;
};

/** The agent working each stage: the real Bizmis head renders, one per mockup. */
export const STAGE_HEADS = ["amber", "mia", "luca"];
