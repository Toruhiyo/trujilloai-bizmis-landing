import { useState } from "react";
import { cn } from "@/lib/utils";
import manifest from "./agents-manifest.json";

const BASE = "/landing/agents";
const WIDTHS = [360, 720, 1080];

export type AgentName = keyof typeof manifest;

/**
 * A real Bizmis avatar render (scripts/render-landing-avatars.py), served
 * responsively: AVIF → WebP → PNG, at 360/720/1080 px, so every screen and
 * connection gets the smallest file that still looks sharp. A tiny blurred
 * silhouette shows instantly and fades out once the real image has loaded,
 * and the box keeps the render's aspect ratio so nothing shifts.
 */
const AgentImage = ({
  name,
  alt,
  sizes,
  eager = false,
  className,
  imgClassName,
}: {
  name: AgentName;
  alt: string;
  /** CSS width the image is shown at, e.g. "(min-width: 1024px) 420px, 60vw". */
  sizes: string;
  eager?: boolean;
  className?: string;
  imgClassName?: string;
}) => {
  const [loaded, setLoaded] = useState(false);
  // an avatar not rendered yet (missing from the manifest) gets a square placeholder instead of crashing the page
  const [w, h] = manifest[name] ?? [1, 1];
  const set = (ext: string) =>
    WIDTHS.map((width) => `${BASE}/${name}-${width}.${ext} ${width}w`).join(
      ", ",
    );
  return (
    <div
      className={cn("relative", className)}
      style={{ aspectRatio: `${w} / ${h}` }}
    >
      <img
        src={`${BASE}/${name}-lqip.webp`}
        alt=""
        aria-hidden="true"
        className={cn(
          "absolute inset-0 h-full w-full scale-[1.03] object-contain blur-xl transition-opacity duration-700",
          loaded ? "opacity-0" : "opacity-100",
        )}
      />
      <picture>
        <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
        <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
        <img
          src={`${BASE}/${name}-360.png`}
          alt={alt}
          width={w}
          height={h}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            "relative h-full w-full object-contain transition-opacity duration-700",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      </picture>
    </div>
  );
};

export default AgentImage;
