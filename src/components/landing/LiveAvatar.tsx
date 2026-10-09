import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * One live 3D Bizmis avatar, rendered the way the storefront widget renders
 * it (see LiveAvatarCanvas), at zero cost until it's needed:
 *
 * - three / fiber / drei sit in a lazy chunk, fetched only once the box is
 *   within ~200px of the viewport (the GLBs are warmed in parallel).
 * - `fallback` (the static render) shows in the same box until the canvas has
 *   drawn its first real frame, then the two crossfade.
 * - No 3D at all (fallback stays) for prefers-reduced-motion, Save-Data or
 *   2g connections, no (hardware) WebGL, a failed chunk or model load, or a
 *   lost WebGL context.
 * - The render loop stops while the box is offscreen or the tab is hidden.
 *
 * Fills its parent box; the avatar stands bottom-centre, waist-up, at the
 * height of the static render (224px in the widget's 230px stage).
 */

const CDN = "https://cdn.bizmis.ai/common/avatars/models";
/** Same file and version as the widget (trujilloai-bizmis-widget avatar-ui-utils.ts). */
const ANIMATIONS_URL = `${CDN}/avatar-animations.glb?v=561`;
/** Original illustration with the selected S2-C wordmark, shared with the static shirt renders. */
const LOGO_STAMP_URL = "/landing/bizmis-shirt-stamp.png";
/**
 * Stamp size/placement in the widget's units, tuned by eye to match the static
 * renders' logo (the studio's 1.15 maps to a smaller, higher logo here).
 */
const LOGO_STAMP_SCALE = 0.92;
const LOGO_STAMP_OFFSET_Y = 0.05;
/** Figure height / box height: the static render is 224px tall in the 230px stage. */
const FIGURE_FRACTION = 224 / 230;
/** Canvas bleed beyond the box, so a hair tuft or a raised hand is never flat-cut. */
const OVERSCAN_TOP = 0.25;
const OVERSCAN_X = 0.15;
const NEAR_MARGIN = "200px";
const CROSSFADE_MS = 500;

const loadCanvas = () => import("./LiveAvatarCanvas");
const LiveAvatarCanvas = lazy(loadCanvas);

type NetworkInformationLike = { saveData?: boolean; effectiveType?: string };

function isSlowConnection(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  if (!connection) return false;
  return Boolean(connection.saveData) || connection.effectiveType === "2g" || connection.effectiveType === "slow-2g";
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

/** Hardware WebGL only: a software-rendered context would make the page janky. */
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const attrs: WebGLContextAttributes = { failIfMajorPerformanceCaveat: true };
    const gl = (canvas.getContext("webgl2", attrs) ?? canvas.getContext("webgl", attrs)) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

const warmed = new Set<string>();
/** Start the GLB downloads while the 3D chunk is still loading (CDN files are immutable, so the loader hits the HTTP cache). */
function warm(url: string) {
  if (warmed.has(url)) return;
  warmed.add(url);
  fetch(url, { mode: "cors", credentials: "same-origin" })
    .then((r) => r.arrayBuffer())
    .catch(() => warmed.delete(url));
}

class ThreeErrorBoundary extends Component<{ onError: (error: Error) => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const update = () => setReduced(mq.matches);
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() => typeof document === "undefined" || document.visibilityState !== "hidden");
  useEffect(() => {
    const update = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}

export type LiveAvatarProps = {
  /** Avatar model name on the CDN, e.g. "amber". */
  model: string;
  /** Shirt colour (default Bizmis orange). */
  shirtColor?: string;
  /** Talking clip + lip movement while true. */
  speaking?: boolean;
  /** Bizmis logo on the shirt, like the static renders (default true). */
  logo?: boolean;
  /** "smile" matches the static renders; "default" is the widget's neutral face. */
  expression?: "default" | "smile";
  /** The static render, shown until (and instead of) the live avatar. */
  fallback: ReactNode;
  className?: string;
};

const LiveAvatar = ({
  model,
  shirtColor = "#F28C38",
  speaking = false,
  logo = true,
  expression = "smile",
  fallback,
  className,
}: LiveAvatarProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  /** null until decided (when first near the viewport). */
  const [capable, setCapable] = useState<boolean | null>(null);
  const [failedFor, setFailedFor] = useState<string | null>(null);
  const [readyFor, setReadyFor] = useState<string | null>(null);

  const modelUrl = `${CDN}/${model}.glb`;
  const failed = failedFor === modelUrl;
  const ready = readyFor === modelUrl;

  // Two observers: a sticky "near" (start loading) and a live "in view" (render loop).
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNear(true);
      setInView(true);
      return;
    }
    const nearObs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          nearObs.disconnect();
        }
      },
      { rootMargin: NEAR_MARGIN }
    );
    const viewObs = new IntersectionObserver((entries) => setInView(entries[entries.length - 1].isIntersecting));
    nearObs.observe(el);
    viewObs.observe(el);
    return () => {
      nearObs.disconnect();
      viewObs.disconnect();
    };
  }, []);

  // Decide once, when it first matters (the WebGL probe isn't free).
  useEffect(() => {
    if (!near || capable !== null || reducedMotion) return;
    setCapable(!isSlowConnection() && hasWebGL());
  }, [near, capable, reducedMotion]);

  const wants3d = near && capable === true && !reducedMotion && !failed;

  useEffect(() => {
    if (!wants3d) return;
    warm(modelUrl);
    warm(ANIMATIONS_URL);
    loadCanvas().catch(() => setFailedFor(modelUrl));
  }, [wants3d, modelUrl]);

  const onReady = useCallback(() => setReadyFor(modelUrl), [modelUrl]);
  const onError = useCallback(
    (error: Error) => {
      if (import.meta.env.DEV) console.warn("[LiveAvatar] falling back to the static render:", error);
      setFailedFor(modelUrl);
      setReadyFor(null);
    },
    [modelUrl]
  );

  const live = wants3d && ready;
  // Keep drawing until the first frame lands (even just outside the viewport),
  // then only while visible.
  const active = pageVisible && (inView || !ready);

  return (
    <div ref={boxRef} className={cn("relative h-full w-full", className)}>
      <div
        className="absolute inset-0"
        style={{ opacity: live ? 0 : 1, transition: `opacity ${CROSSFADE_MS}ms ease` }}
        aria-hidden={live || undefined}
      >
        {fallback}
      </div>
      {wants3d && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            top: `${-OVERSCAN_TOP * 100}%`,
            bottom: 0,
            left: `${-OVERSCAN_X * 100}%`,
            right: `${-OVERSCAN_X * 100}%`,
            opacity: live ? 1 : 0,
            transition: `opacity ${CROSSFADE_MS}ms ease`,
          }}
        >
          <ThreeErrorBoundary key={modelUrl} onError={onError}>
            <Suspense fallback={null}>
              <LiveAvatarCanvas
                key={modelUrl}
                modelUrl={modelUrl}
                animationsUrl={ANIMATIONS_URL}
                shirtColor={shirtColor}
                stampUrl={logo ? LOGO_STAMP_URL : null}
                stampScale={LOGO_STAMP_SCALE}
                stampOffsetY={LOGO_STAMP_OFFSET_Y}
                speaking={speaking}
                expression={expression}
                active={active}
                overscanTop={OVERSCAN_TOP}
                figureFraction={FIGURE_FRACTION}
                onReady={onReady}
                onError={onError}
              />
            </Suspense>
          </ThreeErrorBoundary>
        </div>
      )}
    </div>
  );
};

export default LiveAvatar;
