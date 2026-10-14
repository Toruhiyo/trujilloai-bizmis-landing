/**
 * The at-scale funnel's (illustrative) model: of every shopper who visits,
 * how many find a fit (discovery), how many of those decide (decision) and
 * how many of those carts become orders (checkout), without Bizmis and with
 * it. Shapes only: no figure from it is ever printed, and none is a claim.
 *
 * The shoppers are a deterministic stream: shopper `i` arrives at a fixed
 * time, at a fixed speed, and its fate at each stage is fixed by the stage's
 * rate at the moment it gets there. So any moment of the timeline can be
 * drawn from `t` alone, forwards or backwards (the rewind).
 */
export const BASE = [0.45, 0.4, 0.5];
export const BOOST = [0.9, 0.86, 0.92];

/** The pass rate of stage `g` with Bizmis `k` (0 → 1) of the way in. */
export const rate = (g: number, k: number) => BASE[g] + (BOOST[g] - BASE[g]) * k;

/** How many of the visitors are left after each stage: [visits, fit, decided, ordered]. */
export const flows = (k: number[]) => {
  const out = [1];
  for (let g = 0; g < 3; g++) out.push(out[g] * rate(g, k[g] ?? 0));
  return out;
};

/** Where the three stages end (fractions of the width), and the orders bag. */
export const GATES = [0.25, 0.5, 0.74];
export const BAG = 0.93;

/** Shoppers per second, how long before 0 the stream starts (so it's full at 0), seconds to cross the width. */
const RATE = 5.2;
const WARM = 4.4;
const CROSS = 3.7;
/** How long a stage takes to improve (ms). */
export const RAMP = 900;
/** How long an order takes to pour from the bag into the sales (s, payoff only). */
export const POUR = 0.62;

const ease = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

/**
 * When each stage starts improving (ms on the timeline): in a beat only its
 * own stage (`focus` 0–2) does, in the payoff (3) all three, one after another.
 */
export const startsFor = (focus: number) =>
  focus >= 3 ? [1100, 1650, 2200] : [0, 1, 2].map((g) => (g === focus ? 1500 : Infinity));

/** How far stage improvements are at `t` (ms): 0 → 1 each. */
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
  /** Hop phase, size jitter. */
  phase: number;
  size: number;
  /** The stage it leaves at (0–2), or 3 if it orders. */
  out: number;
  /** When it reaches each stage's end and the bag (s). */
  gate: number[];
  bag: number;
};

/** The stream for a timeline of `duration` ms with the given improvement starts. */
export const makeShoppers = (duration: number, starts: number[]): Shopper[] => {
  const n = Math.ceil((WARM + duration / 1000 + 1) * RATE);
  const list: Shopper[] = [];
  for (let i = 0; i < n; i++) {
    const at = i / RATE - WARM + (rand(i, 1) - 0.5) * 0.08;
    const v = (1 / CROSS) * (0.86 + rand(i, 2) * 0.28);
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
      lane: (rand(i, 3) * 2 - 1) * 0.9,
      phase: rand(i, 4),
      size: rand(i, 5),
      out,
      gate,
      bag: at + BAG / v,
    });
  }
  return list;
};

/** Order values the payoff adds up as they land (any of them, in turn). */
const AMOUNTS = [64, 118, 89, 42, 76, 135, 58, 97, 71, 104];

/** The orders landing in the sales (payoff): when (s) and how much, in order. */
export const landings = (shoppers: Shopper[]) =>
  shoppers
    .map((s, i) => ({ at: s.bag + POUR, amount: AMOUNTS[i % AMOUNTS.length], out: s.out }))
    .filter((l) => l.out === 3 && l.at >= 0)
    .sort((a, b) => a.at - b.at);

/** The agent working each stage: the real Bizmis head renders, one per mockup. */
export const STAGE_HEADS = ["amber", "mia", "luca"];
