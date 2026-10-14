import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { FaShopify } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useMessages } from "@/i18n/LocaleProvider";
import { CLAY, TINT } from "../clay";
import { useStageScale } from "./hooks";
import { CHARGE_MS, NEW_AT, NEW_PRICE, NEW_PRODUCT, PRICE_AT, STOCK_AT } from "./data";
import type { Product, StoreState } from "./data";

const CHARGE = {
  poster: "/landing/setup/charge-poster.webp",
  webm: "/landing/setup/charge.webm",
  // Safari only plays transparent video as HEVC with alpha
  hevc: "/landing/setup/charge.mov",
};
const isSafari = () =>
  typeof navigator !== "undefined" &&
  /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent);

/**
 * Will, full figure, in the rendered anime charge-up (squeezed eyes, gritted
 * teeth, a shout on the burst). Off: a dark silhouette, waiting. On: himself.
 * Every time `charge` grows he charges up again; every time `hit` grows a
 * quick flash of light lands on him (a store change arriving).
 */
export const ChargeAvatar = ({
  on,
  charge = 0,
  hit = 0,
  className,
}: {
  on: boolean;
  charge?: number;
  hit?: number;
  className?: string;
}) => {
  const m = useMessages();
  const video = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [charging, setCharging] = useState(false);
  useEffect(() => setSrc(isSafari() ? CHARGE.hevc : CHARGE.webm), []);
  useEffect(() => {
    if (!charge) return;
    const v = video.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => undefined);
    }
    setCharging(true);
    const t = window.setTimeout(() => setCharging(false), CHARGE_MS);
    return () => window.clearTimeout(t);
  }, [charge]);
  return (
    <div className={cn("bzs-agent relative aspect-[720/1200]", on ? "is-on" : "is-off", className)}>
      <span aria-hidden="true" className="bzs-aura" />
      <span aria-hidden="true" className="bzs-aura is-wide" />
      <span aria-hidden="true" className="bzs-floor" />
      <video
        ref={video}
        key={src ?? "poster"}
        aria-label={m.landing.agentAlt}
        muted
        playsInline
        preload="auto"
        poster={CHARGE.poster}
        className={cn("bzs-agent-video absolute inset-0 h-full w-full object-contain", charging && "is-charging")}
      >
        {src && <source src={src} type={src.endsWith(".mov") ? 'video/mp4; codecs="hvc1"' : "video/webm"} />}
      </video>
      {hit > 0 && <span key={hit} aria-hidden="true" className="bzs-hit" />}
    </div>
  );
};

/**
 * A fixed-size canvas (laid out at w × h, in its own coordinates, so wires
 * and sparks can be placed exactly), scaled to fit the width it's given and
 * at most `maxH` px tall.
 */
export const Stage = ({
  w,
  h,
  maxH = Infinity,
  maxScale,
  className,
  children,
}: {
  w: number;
  h: number;
  maxH?: number;
  maxScale?: number;
  className?: string;
  children: ReactNode;
}) => {
  const [ref, scale] = useStageScale(w, h, maxH, maxScale);
  return (
    <div ref={ref} className={cn("relative w-full", className)} style={{ height: scale ? h * scale : h }}>
      <div
        className="absolute left-1/2 top-0 origin-top"
        style={{
          width: w,
          height: h,
          transform: `translateX(-50%) scale(${scale || 1})`,
          visibility: scale ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** The pointer that glides in and clicks Install. */
export const Cursor = ({ className, style }: { className?: string; style?: CSSProperties }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("bzs-cursor", className)} style={style}>
    <path
      d="M4 2l15 9-6.5 1.6L16 20l-3 1.4-3.5-7.4L4 18z"
      fill="#1c1814"
      stroke="#fff"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * The Install button (Shopify's bag on Bizmis orange). `pressed` squeezes it;
 * with `ring` a shockwave leaves it as it goes live.
 */
export const InstallButton = ({
  pressed,
  ring,
  big,
  className,
}: {
  pressed?: boolean;
  ring?: boolean;
  big?: boolean;
  className?: string;
}) => {
  const m = useMessages();
  return (
    <span className={cn("bzs-install", pressed && "is-pressed", big && "is-big", className)}>
      {ring && <span aria-hidden="true" className="bzs-shock" />}
      {ring && <span aria-hidden="true" className="bzs-shock is-late" />}
      <FaShopify className="bzs-install-icon" aria-hidden="true" />
      {m.landing.setup.install}
    </span>
  );
};

/**
 * A spark of energy flying once along an SVG path `d` (stage coordinates),
 * then gone. Re-key it to fire again.
 */
export const Spark = ({
  d,
  dur = 900,
  delay = 0,
  small,
}: {
  d: string;
  dur?: number;
  delay?: number;
  small?: boolean;
}) => (
  <>
    {/* a comet: the spark and two fading embers just behind it */}
    {[0, 1, 2].map((k) => (
      <span
        key={k}
        aria-hidden="true"
        className={cn("bzs-spark", small && "is-small", k > 0 && `is-trail-${k}`)}
        style={
          {
            offsetPath: `path("${d}")`,
            "--dur": `${dur}ms`,
            "--delay": `${delay + k * 55}ms`,
          } as CSSProperties
        }
      />
    ))}
  </>
);

/** A product card: clay tile, its name line and its price, with the live changes on it. */
export const ProductCard = ({
  p,
  i,
  s,
  size,
  lit,
}: {
  p: Product;
  i: number;
  s: StoreState;
  size: number;
  /** Just changed: a warm ring for a moment. */
  lit?: boolean;
}) => {
  const m = useMessages();
  const c = m.landing.setup.changes;
  const isNew = i === NEW_AT && s.product;
  const prod = isNew ? NEW_PRODUCT : p;
  const soldOut = i === STOCK_AT && s.stock;
  const repriced = i === PRICE_AT && s.price;
  return (
    <div className={cn("bzs-card", lit && "is-lit")} style={{ width: size }}>
      <div
        className="bzs-card-tile bzl-tile"
        style={{ background: TINT[prod.tint], width: size, height: size }}
      >
        <img key={prod.shape} src={CLAY[prod.shape]} alt="" loading="lazy" draggable={false} className={isNew ? "bzs-pop" : undefined} />
        {soldOut && <span className="bzs-soldout">{c.stock}</span>}
        {isNew && <span className="bzs-new">{c.product}</span>}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="bzl-tile-line" style={{ width: size * 0.45 }} />
        <span className="bzs-price">
          {repriced && <s className="bzs-price-old">${p.price}</s>}
          <span key={repriced ? "new" : "old"} className={repriced ? "bzs-price-new" : undefined}>
            ${repriced ? NEW_PRICE : prod.price}
          </span>
        </span>
      </div>
    </div>
  );
};

/** "Synced just now", with a sync mark that turns once whenever `tick` grows. */
export const SyncedNow = ({ tick, className }: { tick: number; className?: string }) => {
  const m = useMessages();
  return (
    <span className={cn("bzs-synced", className)}>
      <svg key={tick} viewBox="0 0 16 16" aria-hidden="true" className={cn("bzs-synced-icon", tick > 0 && "is-turning")}>
        <path
          d="M13.5 6.5A5.6 5.6 0 0 0 3.2 4.6M2.5 9.5a5.6 5.6 0 0 0 10.3 1.9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path d="M3 1.8v3.2h3.2M13 14.2V11H9.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {m.landing.setup.syncedNow}
    </span>
  );
};

/** The pulsing "Live" status dot and label. */
export const LiveBadge = ({ className }: { className?: string }) => {
  const m = useMessages();
  return (
    <span className={cn("bzs-live", className)}>
      <i aria-hidden="true" />
      {m.landing.setup.live}
    </span>
  );
};
