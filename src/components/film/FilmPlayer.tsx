import { useCallback, useEffect, useRef, useState } from "react";
import type {
  KeyboardEvent,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import {
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { FaShopify } from "react-icons/fa";
import { cn } from "@/lib/utils";

/**
 * Hero film player (Clay-style controls, Framer-style states), dressed in the
 * landing's own button language: a white "Watch the film" pill, and a white
 * control dock with orange icons that floats across the bottom edge of the
 * screen, half on the film and half on the hero stage.
 *
 * - idle:    a short muted ambient loop plays behind the "Watch the film"
 *            pill. Nothing of the film is downloaded beyond its metadata.
 * - playing: the film plays in place with sound; the dock (scrub, volume,
 *            time, fullscreen, CTA) hides while the pointer rests.
 * - paused:  the film holds its frame (pause button or a click on the film).
 * - ended:   the film holds its closing frame — the "Install now" CTA — and
 *            that area of the frame becomes a real link.
 *
 * Clicking anywhere outside the player while the film is open returns it to
 * the ambient loop; the play button then resumes where it stopped.
 */

type Phase = "idle" | "playing" | "paused" | "ended";

export type FilmEvent =
  | "film_started"
  | "film_resumed"
  | "film_paused"
  | "film_progress"
  | "film_completed"
  | "film_replayed";

export interface FilmPlayerLabels {
  watch: string;
  replay: string;
  play: string;
  pause: string;
  mute: string;
  unmute: string;
  enterFullscreen: string;
  exitFullscreen: string;
  seek: string;
  region: string;
}

export interface FilmPlayerProps {
  src: string;
  loop: { webm: string; mp4: string; poster: string };
  durationSeconds: number;
  /** The film's on-frame CTA on its closing frame, as fractions of the frame. */
  endFrameCta: { left: number; top: number; width: number; height: number };
  labels: FilmPlayerLabels;
  cta: {
    label: string;
    href: string;
    onClick: (
      e: MouseEvent<HTMLAnchorElement>,
      location: "film_controls" | "film_end_frame"
    ) => void;
  };
  onEvent?: (event: FilmEvent, props?: Record<string, unknown>) => void;
  className?: string;
}

const CONTROLS_IDLE_MS = 2500;

/**
 * Frosted warm glass for every control. The light tint keeps white icons
 * legible over the film's white frames as well as over the orange stage.
 */
const GLASS =
  "border border-white/40 bg-[hsl(24_70%_30%/0.28)] backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(255,255,255,0.08),0_12px_40px_-12px_hsl(25_95%_25%/0.45)]";
const SEEK_STEP_S = 5;
const QUARTILES = [25, 50, 75];

const formatTime = (s: number) => {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

type WebkitVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

const FilmPlayer = ({
  src,
  loop,
  durationSeconds,
  endFrameCta,
  labels,
  cta,
  onEvent,
  className,
}: FilmPlayerProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number>();
  const startedRef = useRef(false);
  const quartilesRef = useRef(new Set<number>());
  const scrubbingRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds);
  const [buffered, setBuffered] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [waiting, setWaiting] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsAwake, setControlsAwake] = useState(true);
  const [hover, setHover] = useState<{ x: number; t: number } | null>(null);

  const emit = useCallback(
    (event: FilmEvent, props?: Record<string, unknown>) => onEvent?.(event, props),
    [onEvent]
  );

  // Controls stay up unless the film is playing and the pointer rests.
  const wakeControls = useCallback(() => {
    setControlsAwake(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(
      () => !scrubbingRef.current && setControlsAwake(false),
      CONTROLS_IDLE_MS
    );
  }, []);
  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  const play = useCallback(() => {
    const film = filmRef.current;
    if (!film) return;
    film.play().catch(() => setPhase("paused"));
    setPhase("playing");
    loopRef.current?.pause();
    emit(startedRef.current ? "film_resumed" : "film_started", {
      at_seconds: Math.round(film.currentTime),
    });
    startedRef.current = true;
    wakeControls();
  }, [emit, wakeControls]);

  const pauseInPlace = useCallback(() => {
    filmRef.current?.pause();
    setPhase("paused");
    emit("film_paused", { reason: "control", at_seconds: Math.round(time) });
  }, [emit, time]);

  const backToLoop = useCallback(() => {
    filmRef.current?.pause();
    setPhase("idle");
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      loopRef.current?.play().catch(() => undefined);
    }
    emit("film_paused", { reason: "click_off", at_seconds: Math.round(time) });
  }, [emit, time]);

  const replay = useCallback(() => {
    const film = filmRef.current;
    if (!film) return;
    film.currentTime = 0;
    quartilesRef.current.clear();
    emit("film_replayed");
    film.play().catch(() => setPhase("paused"));
    setPhase("playing");
    wakeControls();
  }, [emit, wakeControls]);

  const togglePlay = useCallback(() => {
    if (phase === "playing") pauseInPlace();
    else if (phase === "ended") replay();
    else play();
  }, [phase, pauseInPlace, play, replay]);

  // Start the ambient loop from code: React sets `muted` as a property, not
  // the attribute, so `autoPlay` alone can be blocked. Reduced-motion
  // visitors get its poster only.
  useEffect(() => {
    const ambient = loopRef.current;
    if (!ambient) return;
    ambient.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ambient.pause();
      return;
    }
    // Only while on screen: no decoding for visitors who scrolled past.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && phaseRef.current === "idle") {
        ambient.play().catch(() => undefined);
      } else {
        ambient.pause();
      }
    });
    observer.observe(ambient);
    return () => observer.disconnect();
  }, []);

  // Film element events.
  useEffect(() => {
    const film = filmRef.current;
    if (!film) return;
    const onTime = () => {
      setTime(film.currentTime);
      const d = film.duration || durationSeconds;
      const pct = (film.currentTime / d) * 100;
      for (const q of QUARTILES) {
        if (pct >= q && !quartilesRef.current.has(q)) {
          quartilesRef.current.add(q);
          emit("film_progress", { percent: q });
        }
      }
    };
    const onMeta = () => Number.isFinite(film.duration) && setDuration(film.duration);
    const onProgress = () => {
      if (film.buffered.length) setBuffered(film.buffered.end(film.buffered.length - 1));
    };
    const onEnded = () => {
      setPhase("ended");
      setControlsAwake(true);
      emit("film_completed");
    };
    const onWaiting = () => setWaiting(true);
    const onPlaying = () => setWaiting(false);
    const onVolume = () => {
      setMuted(film.muted);
      setVolume(film.volume);
    };
    film.addEventListener("timeupdate", onTime);
    film.addEventListener("loadedmetadata", onMeta);
    film.addEventListener("progress", onProgress);
    film.addEventListener("ended", onEnded);
    film.addEventListener("waiting", onWaiting);
    film.addEventListener("playing", onPlaying);
    film.addEventListener("canplay", onPlaying);
    film.addEventListener("volumechange", onVolume);
    return () => {
      film.removeEventListener("timeupdate", onTime);
      film.removeEventListener("loadedmetadata", onMeta);
      film.removeEventListener("progress", onProgress);
      film.removeEventListener("ended", onEnded);
      film.removeEventListener("waiting", onWaiting);
      film.removeEventListener("playing", onPlaying);
      film.removeEventListener("canplay", onPlaying);
      film.removeEventListener("volumechange", onVolume);
    };
  }, [durationSeconds, emit]);

  // Click-off: anywhere outside the player sends an open film back to the loop.
  useEffect(() => {
    if (phase === "idle") return;
    const onDown = (e: PointerEvent) => {
      if (document.fullscreenElement) return;
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) backToLoop();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [phase, backToLoop]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    const root = rootRef.current;
    const film = filmRef.current as WebkitVideo | null;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    } else if (root?.requestFullscreen) {
      root.requestFullscreen().catch(() => undefined);
    } else {
      film?.webkitEnterFullscreen?.(); // iOS Safari: only the <video> can go fullscreen
    }
  };

  const toggleMute = () => {
    const film = filmRef.current;
    if (!film) return;
    film.muted = !film.muted;
    if (!film.muted && film.volume === 0) film.volume = 1;
  };

  const setFilmVolume = (v: number) => {
    const film = filmRef.current;
    if (!film) return;
    film.volume = v;
    film.muted = v === 0;
  };

  // Timeline: hover tooltip + pointer scrubbing.
  const fractionAt = (clientX: number) => {
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  };
  const seekTo = (t: number) => {
    const film = filmRef.current;
    if (!film) return;
    film.currentTime = Math.min(Math.max(0, t), duration);
    setTime(film.currentTime);
    if (phase === "ended" && film.currentTime < duration) setPhase("paused");
  };
  const onTimelineDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    scrubbingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    seekTo(fractionAt(e.clientX) * duration);
  };
  const onTimelineMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const f = fractionAt(e.clientX);
    setHover({ x: f, t: f * duration });
    if (scrubbingRef.current) seekTo(f * duration);
  };
  const onTimelineUp = () => {
    scrubbingRef.current = false;
    wakeControls();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLInputElement) return;
    switch (e.key) {
      case " ":
      case "k":
        e.preventDefault();
        togglePlay();
        break;
      case "m":
        toggleMute();
        break;
      case "f":
        toggleFullscreen();
        break;
      case "ArrowLeft":
        e.preventDefault();
        seekTo(time - SEEK_STEP_S);
        break;
      case "ArrowRight":
        e.preventDefault();
        seekTo(time + SEEK_STEP_S);
        break;
    }
    wakeControls();
  };

  const open = phase !== "idle";
  const showControls = open && (phase !== "playing" || controlsAwake);
  const progress = duration ? (time / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;
  const dockButton =
    "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-colors hover:bg-white/15 sm:h-11 sm:w-11";

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label={labels.region}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerMove={open ? wakeControls : undefined}
      data-phase={phase}
      className={cn(
        "group/film relative w-full outline-none select-none",
        fullscreen && "flex h-full items-center justify-center studio-lighting-base p-4 pb-28 sm:p-8 sm:pb-32",
        phase === "playing" && !showControls && "cursor-none",
        className
      )}
    >
      {/* The screen, set in a frosted glass bezel. */}
      <div
        className={cn(
          "rounded-[22px] border border-white/50 bg-white/15 p-1.5 backdrop-blur-xl sm:rounded-[38px] sm:p-2.5",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_30px_90px_-25px_hsl(25_95%_38%/0.55),0_10px_30px_-12px_hsl(25_95%_30%/0.3)]",
          "group-focus-visible/film:ring-4 group-focus-visible/film:ring-white/70",
          fullscreen && "w-[min(100%,calc((100vh-10rem)*16/9))]"
        )}
      >
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-white sm:rounded-[28px]">
        {/* The film. Only its metadata loads until the visitor presses play. */}
        <video
          ref={filmRef}
          src={src}
          preload="metadata"
          playsInline
          onClick={togglePlay}
          className="absolute inset-0 h-full w-full object-contain"
        />

        {/* Ambient loop (idle state). */}
        <video
          ref={loopRef}
          poster={loop.poster}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            open ? "pointer-events-none opacity-0" : "opacity-100"
          )}
        >
          <source src={loop.webm} type="video/webm" />
          <source src={loop.mp4} type="video/mp4" />
        </video>

        {/* Idle: a glass play button, nothing else. */}
        {!open && (
          <button
            type="button"
            onClick={play}
            aria-label={labels.watch}
            className="group/play absolute inset-0 flex items-center justify-center focus-visible:outline-none"
          >
            <span
              className={cn(
                GLASS,
                "flex h-16 w-16 items-center justify-center rounded-full text-white transition-all duration-300 group-hover/play:scale-110 group-hover/play:bg-[hsl(24_70%_30%/0.38)] group-focus-visible/play:ring-4 group-focus-visible/play:ring-white/60 sm:h-24 sm:w-24"
              )}
            >
              <Play
                className="ml-1 h-7 w-7 fill-current drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)] sm:ml-1.5 sm:h-10 sm:w-10"
                aria-hidden="true"
              />
            </span>
          </button>
        )}

        {/* Paused / buffering indicator in the middle of the frame. */}
        {phase === "paused" && (
          <button
            type="button"
            onClick={play}
            aria-label={labels.play}
            className={cn(GLASS, "absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white transition-transform hover:scale-110 sm:h-20 sm:w-20")}
          >
            <Play className="ml-1 h-6 w-6 fill-current drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)] sm:h-8 sm:w-8" aria-hidden="true" />
          </button>
        )}
        {phase === "playing" && waiting && (
          <Loader2
            className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-spin text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
            aria-hidden="true"
          />
        )}

        {/* Ended: the film's own "Install now" becomes a link. */}
        {phase === "ended" && (
          <a
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => cta.onClick(e, "film_end_frame")}
            aria-label={cta.label}
            style={{
              left: `${endFrameCta.left * 100}%`,
              top: `${endFrameCta.top * 100}%`,
              width: `${endFrameCta.width * 100}%`,
              height: `${endFrameCta.height * 100}%`,
            }}
            className="absolute rounded-3xl ring-primary/0 transition-all duration-300 hover:bg-primary/[0.06] hover:ring-2 hover:ring-primary/40"
          />
        )}
      </div>
      </div>

      {/* The dock: floats across the screen's bottom edge (inside it in fullscreen). */}
      {open && (
        <div
          className={cn(
            "absolute left-1/2 z-10 flex w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2 items-center gap-1 rounded-2xl p-1 transition-all duration-300 sm:gap-1.5 sm:p-1.5",
            GLASS,
            fullscreen ? "bottom-6 sm:bottom-10" : "bottom-0 translate-y-1/2",
            showControls ? "opacity-100" : "pointer-events-none opacity-0 sm:translate-y-[60%]"
          )}
        >
          <button
            type="button"
            onClick={togglePlay}
            aria-label={
              phase === "playing" ? labels.pause : phase === "ended" ? labels.replay : labels.play
            }
            className={dockButton}
          >
            {phase === "playing" ? (
              <Pause className="h-5 w-5 fill-current" aria-hidden="true" />
            ) : phase === "ended" ? (
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
            )}
          </button>

          <div className="group/volume hidden items-center sm:flex">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? labels.unmute : labels.mute}
              className={dockButton}
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Volume2 className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => setFilmVolume(Number(e.target.value))}
              aria-label={labels.mute}
              className="hidden w-0 cursor-pointer accent-white opacity-0 transition-all duration-300 group-hover/volume:mr-2 group-hover/volume:w-16 group-hover/volume:opacity-100 md:block"
            />
          </div>

          {/* Timeline */}
          <div className="flex min-w-0 flex-1 items-center gap-2.5 px-1 sm:px-2">
            <span className="hidden text-xs font-medium tabular-nums text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)] sm:block sm:text-sm">
              {formatTime(time)}
            </span>
            <div
              ref={timelineRef}
              role="slider"
              tabIndex={-1}
              aria-label={labels.seek}
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(time)}
              aria-valuetext={`${formatTime(time)} / ${formatTime(duration)}`}
              onPointerDown={onTimelineDown}
              onPointerMove={onTimelineMove}
              onPointerUp={onTimelineUp}
              onPointerLeave={() => setHover(null)}
              className="group/timeline relative h-6 min-w-0 flex-1 cursor-pointer touch-none"
            >
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/25 transition-[height] group-hover/timeline:h-2">
                <div className="absolute inset-y-0 left-0 bg-white/25" style={{ width: `${bufferedPct}%` }} />
                <div className="absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: `${progress}%` }} />
              </div>
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.3)] opacity-0 transition-opacity group-hover/timeline:opacity-100"
                style={{ left: `${progress}%` }}
              />
              {hover && (
                <div
                  className={cn(GLASS, "pointer-events-none absolute -top-10 -translate-x-1/2 rounded-lg px-2 py-0.5 text-xs font-semibold tabular-nums text-white")}
                  style={{ left: `${hover.x * 100}%` }}
                >
                  {formatTime(hover.t)}
                </div>
              )}
            </div>
            <span className="hidden text-xs font-medium tabular-nums text-white/70 drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)] sm:block sm:text-sm">
              {formatTime(duration)}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? labels.exitFullscreen : labels.enterFullscreen}
            className={dockButton}
          >
            {fullscreen ? (
              <Minimize2 className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          <a
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => cta.onClick(e, "film_controls")}
            className="flex h-9 flex-shrink-0 items-center gap-1.5 rounded-xl border border-white/60 bg-white/85 px-3 font-heading text-sm font-semibold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md transition-colors hover:bg-white sm:h-11 sm:gap-2 sm:px-5 sm:text-base"
          >
            <FaShopify className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            {cta.label}
          </a>
        </div>
      )}
    </div>
  );
};

export default FilmPlayer;
