import { cn } from "@/lib/utils";

/**
 * The film's clay products. Each image is a shape on a cream ground;
 * multiplied over a tinted tile, the ground takes the tile's colour, the way
 * the film tints its catalog.
 */
export const CLAY = {
  sphere: "/landing/clay/sphere.jpg",
  capsule: "/landing/clay/capsule.jpg",
  cube: "/landing/clay/rounded-cube.jpg",
  cone: "/landing/clay/cone.jpg",
  torus: "/landing/clay/torus.jpg",
  cylinder: "/landing/clay/cylinder.jpg",
  slab: "/landing/clay/slab.jpg",
  dome: "/landing/clay/dome.jpg",
  egg: "/landing/clay/egg.jpg",
  box: "/landing/clay/tall-box.jpg",
  frustum: "/landing/clay/truncated-cone.jpg",
  lens: "/landing/clay/lens.jpg",
} as const;

export type ClayShape = keyof typeof CLAY;

/** Tile tints sampled from the film's catalog. */
export const TINT = {
  stone: "#e4dfd6",
  sand: "#e8dcc8",
  blush: "#e8d5d0",
  sage: "#d5ddd4",
  warm: "#e3e0db",
  orange: "#f5c391",
} as const;

export const ClayTile = ({
  shape,
  tint = "stone",
  picked = false,
  className,
}: {
  shape: ClayShape;
  tint?: keyof typeof TINT;
  picked?: boolean;
  className?: string;
}) => (
  <div
    className={cn("bzl-tile", picked && "is-picked", className)}
    style={{ background: TINT[picked ? "orange" : tint] }}
  >
    <img src={CLAY[shape]} alt="" loading="lazy" draggable={false} />
  </div>
);

/** A product card: tile plus the film's grey placeholder lines. */
export const ClayCard = ({
  shape,
  tint,
  picked,
  className,
}: {
  shape: ClayShape;
  tint?: keyof typeof TINT;
  picked?: boolean;
  className?: string;
}) => (
  <div className={cn("space-y-2", className)}>
    <ClayTile shape={shape} tint={tint} picked={picked} />
    <div className="bzl-tile-line w-3/4" />
    <div className="bzl-tile-line w-1/3" />
  </div>
);

/** The film's "Your store" browser window. */
export const StoreWindow = ({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={cn("bzl-window", className)}>
    <div className="bzl-window-bar">
      <span className="bzl-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M4 10h16v10H4zM3 10l2-6h14l2 6M9 20v-5h6v5" strokeLinejoin="round" />
      </svg>
      {label}
      <svg viewBox="0 0 24 24" className="ml-auto h-4 w-4 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M3 4h2l2.4 11h11L21 7H6" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx="9" cy="19.5" r="1.3" />
        <circle cx="17" cy="19.5" r="1.3" />
      </svg>
    </div>
    {children}
  </div>
);
