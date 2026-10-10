import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface HeroLoopSources {
  poster: string;
  /** Rungs by height (e.g. 720, 1080), each with an MP4 and a WebM. */
  rungs: { height: number; mp4: string; webm: string }[];
  /** The loop's own aspect (width / height), to pick the rung from the box it fills. */
  aspect: number;
}

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/** The rung for this visitor, or null to show only the still. */
function pickRung(sources: HeroLoopSources, box: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const net = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (net?.saveData || net?.effectiveType === "slow-2g" || net?.effectiveType === "2g") return null;
  const rungs = [...sources.rungs].sort((a, b) => a.height - b.height);
  if (net?.effectiveType === "3g") return rungs[0];
  // the height the loop is drawn at (object-fit: cover), at the screen's density
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const drawn = Math.max(box.clientHeight, box.clientWidth / sources.aspect) * dpr;
  return rungs.find((r) => r.height >= drawn * 0.85) ?? rungs[rungs.length - 1];
}

/**
 * The hero's silent animation (BIZ-423). The still (the loop's first frame)
 * shows at once, so slow connections see a finished hero; the video fades in
 * over it once it is actually playing. The rung follows the connection and the
 * size it's drawn at; reduced motion and data saver keep the still. It only
 * plays while on screen, and holds while `paused` (the film is open).
 */
const HeroLoop = ({
  sources,
  paused = false,
  className,
  mediaClassName,
  onTime,
}: {
  sources: HeroLoopSources;
  paused?: boolean;
  className?: string;
  /** object-fit / object-position for the still and the video */
  mediaClassName?: string;
  /** the loop's playback position (s), every frame while it plays: lets the page sync to it */
  onTime?: (seconds: number) => void;
}) => {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [rung, setRung] = useState<HeroLoopSources["rungs"][number] | null>(null);
  const [shown, setShown] = useState(false);
  const visible = useRef(true);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // a loop that isn't shown (the other layout's) loads nothing
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const pick = () => setRung((now) => (el.clientWidth === 0 ? null : now ?? pickRung(sources, el)));
    pick();
    window.addEventListener("resize", pick);
    return () => window.removeEventListener("resize", pick);
  }, [sources]);

  // report the playback position every frame while it plays
  const onTimeRef = useRef(onTime);
  onTimeRef.current = onTime;
  useEffect(() => {
    const v = video.current;
    if (!v || !rung) return;
    let frame = 0;
    const tick = () => {
      if (!v.paused) onTimeRef.current?.(v.currentTime);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [rung]);

  // play only while on screen and while the film is closed
  useEffect(() => {
    const v = video.current;
    if (!v || !rung) return;
    v.muted = true; // as a property: React's `muted` attribute alone can block autoplay
    const sync = () => {
      if (visible.current && !pausedRef.current) v.play().catch(() => undefined);
      else v.pause();
    };
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
      sync();
    });
    io.observe(v);
    sync();
    return () => io.disconnect();
  }, [rung]);

  useEffect(() => {
    const v = video.current;
    if (!v || !rung) return;
    if (paused) v.pause();
    else if (visible.current) v.play().catch(() => undefined);
  }, [paused, rung]);

  return (
    <div ref={box} aria-hidden="true" className={cn("pointer-events-none overflow-hidden", className)}>
      <img
        src={sources.poster}
        alt=""
        decoding="async"
        fetchPriority="high"
        className={cn("absolute inset-0 h-full w-full", mediaClassName)}
      />
      {rung && (
        <video
          ref={video}
          key={rung.height}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          poster={sources.poster}
          onPlaying={() => setShown(true)}
          className={cn(
            "absolute inset-0 h-full w-full transition-opacity duration-700",
            mediaClassName,
            shown ? "opacity-100" : "opacity-0",
          )}
        >
          <source src={rung.webm} type="video/webm" />
          <source src={rung.mp4} type="video/mp4" />
        </video>
      )}
    </div>
  );
};

export default HeroLoop;
