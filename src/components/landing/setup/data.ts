import type { ClayShape, TINT } from "../clay";

/* Shared data and geometry for the One-Click Setup concepts (kept apart from
   the components so fast refresh keeps working). */

/** The charge-up clip (scripts/setup-charge-anim.py): 92 frames at 24 fps. */
export const CHARGE_MS = 3830;

/** A smooth S-curve from (x1, y1) to (x2, y2), leaving and arriving level. */
export const curve = (x1: number, y1: number, x2: number, y2: number, bend = 0.5) => {
  const dx = x2 - x1;
  return `M${x1} ${y1} C${x1 + dx * bend} ${y1}, ${x2 - dx * bend} ${y2}, ${x2} ${y2}`;
};

/** The same, leaving and arriving vertically. */
export const curveV = (x1: number, y1: number, x2: number, y2: number, bend = 0.5) => {
  const dy = y2 - y1;
  return `M${x1} ${y1} C${x1} ${y1 + dy * bend}, ${x2} ${y2 - dy * bend}, ${x2} ${y2}`;
};

/* ── The store: clay products, as the film draws its catalog ── */

export type Product = { shape: ClayShape; tint: keyof typeof TINT; price: number };

export const CATALOG: Product[] = [
  { shape: "sphere", tint: "sand", price: 48 },
  { shape: "torus", tint: "blush", price: 36 },
  { shape: "capsule", tint: "sage", price: 29 },
  { shape: "cone", tint: "stone", price: 54 },
  { shape: "cube", tint: "warm", price: 42 },
  { shape: "egg", tint: "sand", price: 32 },
  { shape: "dome", tint: "blush", price: 58 },
  { shape: "cylinder", tint: "stone", price: 24 },
];

/** The store's changes, in the order they happen on a loop. */
export type Change = "price" | "stock" | "product" | "policy";
export const CHANGES: Change[] = ["price", "stock", "product", "policy"];

/** Which product each change touches, and what it becomes. */
export const PRICE_AT = 0;
export const NEW_PRICE = 42;
export const STOCK_AT = 2;
export const NEW_AT = 5;
export const NEW_PRODUCT: Product = { shape: "lens", tint: "warm", price: 38 };

/** The store as it is after the first `n` changes. */
export const storeAfter = (n: number) => ({
  price: n > 0,
  stock: n > 1,
  product: n > 2,
  policy: n > 3,
});
export type StoreState = ReturnType<typeof storeAfter>;

