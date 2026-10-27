import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type Hls from "hls.js";

import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import {
  Captions,
  Check,
  Loader2,
  Maximize2,
  Mic,
  Minimize2,
  Pause,
  Play,
  Settings2,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "@/styles/film-player.css";

/** The bitrate auto quality assumes for a rendition, at most this many times its average. */
const PEAK_OVER_AVERAGE = 2.5;

/**
 * Hero film player (Clay-style controls, Framer-style states), in frosted
 * glass: a glass play button over the loop, a glass bezel around the screen,
 * and a glass control bar inside the frame.
 *
 * - idle:    a short muted ambient loop plays behind the "Watch the film"
 *            pill. Nothing of the film is downloaded beyond its metadata.
 * - playing: the film plays in place with sound; the control bar (scrub,
 *            volume, time, fullscreen) hides while the pointer rests.
 * - paused:  the film holds its frame (pause button or a click on the film).
 * - ended:   the film holds its closing frame, "Install now", and a real
 *            bordered button is drawn around that title, in place.
 *
 * Clicking anywhere outside the player while the film is open returns it to
 * the ambient loop; the play button then resumes where it stopped.
 *
 * `bare`: the hero's own loop stands in for the ambient one. The player then
 * has no loop or idle button of its own: the hero starts it through the ref
 * (`play()`, from its play CTA) and hears back through `onClose` when the
 * viewer clicks off or presses Escape, so it can go back to its loop.
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
  quality: string;
  auto: string;
  exitFullscreen: string;
  seek: string;
  region: string;
  /** The CC button. */
  captions: string;
  /** The tag on a narrator caption. */
  narrator: string;
}

/** A WebVTT caption track for the film (the narrator's voice-over: the other voices are captioned in the picture). */
export interface FilmCaptions {
  src: string;
  lang: string;
}

interface Cue {
  start: number;
  end: number;
  text: string;
  /** The <v> voice of the cue, if any (e.g. "Narrator"). */
  voice?: string;
}

const vttTime = (t: string) => {
  const parts = t.trim().split(":").map(Number);
  return parts.reduce((acc, n) => acc * 60 + n, 0);
};

/** A small WebVTT reader: timings, the <v> voice, text without tags (the player lays out its own lines). */
const parseVtt = (vtt: string): Cue[] =>
  vtt
    .replace(/\r/g, "")
    .split(/\n\n+/)
    .flatMap((block) => {
      const lines = block.split("\n");
      const at = lines.findIndex((l) => l.includes("-->"));
      if (at === -1) return [];
      const [from, to] = lines[at].split("-->");
      const raw = lines.slice(at + 1).join(" ");
      const voice = raw.match(/<v(?:\.[^\s>]+)*\s+([^>]+)>/)?.[1]?.trim();
      const text = raw.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      return text ? [{ start: vttTime(from), end: vttTime(to.trim().split(/\s/)[0]), text, voice }] : [];
    });

const CAPTIONS_KEY = "bizmis.film.captions";
const readCaptionsPref = () => {
  try {
    return window.localStorage.getItem(CAPTIONS_KEY) === "on";
  } catch {
    return false;
  }
};

export interface FilmPlayerProps {
  /** An MP4, or an HLS master playlist (.m3u8) for adaptive quality. */
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
  /** No ambient loop or idle play button: the parent opens and closes it (see `FilmPlayerHandle`). */
  bare?: boolean;
  /** The film went back to idle (click-off or Escape). */
  onClose?: () => void;
  /** Fill the parent edge to edge (no bezel, the film letterboxed on black): the hero becomes the player. */
  fill?: boolean;
  /** Closed captions (the CC button shows only with a track). */
  captions?: FilmCaptions;
}

export interface FilmPlayerHandle {
  /** Start or resume the film (call it from the click that asked for it). */
  play: () => void;
  /** Pause and return to idle. */
  close: () => void;
  /** Go fullscreen (phones: the film fills the screen when turned). Call it from a click. */
  fullscreen: () => void;
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

/** 2160 → "4K", 1440 → "1440p", … */
const qualityLabel = (height: number) => (height >= 2160 ? "4K" : `${height}p`);

const FilmPlayer = forwardRef<FilmPlayerHandle, FilmPlayerProps>(({
  src,
  loop,
  durationSeconds,
  endFrameCta,
  labels,
  cta,
  onEvent,
  className,
  bare = false,
  onClose,
  fill = false,
  captions,
}, ref) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  // where the picture actually sits inside the <video> (object-contain letterboxes it), in px
  const [picture, setPicture] = useState({ left: 0, top: 0, width: 0, height: 0 });
  useEffect(() => {
    const film = filmRef.current;
    if (!film) return;
    const measure = () => {
      const w = film.clientWidth;
      const h = film.clientHeight;
      const aspect = film.videoWidth && film.videoHeight ? film.videoWidth / film.videoHeight : 16 / 9;
      const pw = Math.min(w, h * aspect);
      const ph = pw / aspect;
      setPicture({ left: (w - pw) / 2, top: (h - ph) / 2, width: pw, height: ph });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(film);
    film.addEventListener("loadedmetadata", measure);
    return () => {
      ro.disconnect();
      film.removeEventListener("loadedmetadata", measure);
    };
  }, []);
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
  // Only show the spinner for a real stall, not every brief "waiting" blip.
  const [stalled, setStalled] = useState(false);
  useEffect(() => {
    if (!waiting) return setStalled(false);
    const t = window.setTimeout(() => setStalled(true), 250);
    return () => window.clearTimeout(t);
  }, [waiting]);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsAwake, setControlsAwake] = useState(true);
  const [hover, setHover] = useState<{ x: number; t: number } | null>(null);

  // Closed captions: off by default, the viewer's choice remembered. The track is
  // fetched on the first use and drawn by the player (not the browser's ::cue), in
  // the film's own caption pill.
  const [ccOn, setCcOn] = useState(false);
  useEffect(() => setCcOn(readCaptionsPref()), []);
  const [cues, setCues] = useState<Cue[] | null>(null);
  const [cueIndex, setCueIndex] = useState(-1);
  const cuesFetch = useRef<Promise<void> | null>(null);
  useEffect(() => {
    if (!ccOn || !captions || cuesFetch.current) return;
    cuesFetch.current = fetch(captions.src)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`captions ${r.status}`))))
      .then((vtt) => setCues(parseVtt(vtt)))
      .catch(() => {
        cuesFetch.current = null; // try again on the next toggle
      });
  }, [ccOn, captions]);
  const toggleCaptions = useCallback(() => {
    setCcOn((on) => {
      try {
        window.localStorage.setItem(CAPTIONS_KEY, on ? "off" : "on");
      } catch {
        // private mode: the choice lasts for this visit
      }
      return !on;
    });
  }, []);

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

  // HLS goes through hls.js, loaded on the first press of play so visitors who
  // never watch don't download it. It sizes the stream to the player and
  // offers the quality menu; browsers without MediaSource (old iOS) fall back
  // to their native HLS.
  const isHls = src.endsWith(".m3u8");
  const hlsRef = useRef<Hls | null>(null);
  const sourceReady = useRef<Promise<void> | null>(null);
  const [levels, setLevels] = useState<number[]>([]); // rendition heights, hls.js order
  const [level, setLevel] = useState(-1); // -1 = auto
  const [playingHeight, setPlayingHeight] = useState<number | null>(null);
  const [qualityOpen, setQualityOpen] = useState(false);

  // Auto quality never streams more pixels than the picture shows: the cap is
  // the smallest rendition covering the picture at the screen's pixel density
  // plus headroom (so 4K only on big, sharp screens or in fullscreen). The
  // picture, not the <video> box: a phone held upright in fullscreen is a tall
  // box, but the 16:9 film in it is a strip as wide as the screen (it asked
  // for 4K there). Recomputed on resize; a quality picked by hand from the menu
  // is never capped. It caps the first chunks too (hls.js starts under the cap).
  const capToPlayer = useCallback(() => {
    const hls = hlsRef.current;
    const film = filmRef.current;
    if (!hls || !film || !hls.levels.length) return;
    // 25% headroom keeps the film's small UI text crisp.
    const scale = Math.min(window.devicePixelRatio || 1, 2) * 1.25;
    const top = hls.levels[hls.levels.length - 1];
    const aspect = top.width && top.height ? top.width / top.height : 16 / 9;
    const pictureW = Math.min(film.clientWidth, film.clientHeight * aspect);
    const needW = pictureW * scale;
    const needH = (pictureW / aspect) * scale;
    const fit = hls.levels.findIndex((l) => l.width >= needW && l.height >= needH);
    hls.autoLevelCapping = fit === -1 ? hls.levels.length - 1 : fit;
  }, []);
  useEffect(() => {
    const film = filmRef.current;
    if (!film) return;
    const observer = new ResizeObserver(() => capToPlayer());
    observer.observe(film);
    return () => observer.disconnect();
  }, [capToPlayer]);

  const ensureSource = useCallback(() => {
    if (!isHls) return Promise.resolve();
    sourceReady.current ??= import("hls.js").then(({ default: HlsJs }) => {
      const film = filmRef.current;
      if (!film) return;
      if (!HlsJs.isSupported()) {
        film.src = src; // native HLS
        return;
      }
      // Buffer only ~20 s ahead (40 s at most): viewers who stop early never
      // download the rest of the film. Auto quality starts from a broadband
      // guess (3 Mbps, not hls.js's 0.5).
      const hls = new HlsJs({
        maxBufferLength: 20,
        maxMaxBufferLength: 40,
        abrEwmaDefaultEstimate: 3_000_000,
      });
      hlsRef.current = hls;
      hls.on(HlsJs.Events.LEVEL_SWITCHED, (_e, data) => setPlayingHeight(hls.levels[data.level]?.height ?? null));
      return new Promise<void>((resolve) => {
        hls.once(HlsJs.Events.MANIFEST_PARSED, () => {
          // The ladder's BANDWIDTH is its peak, 3-4x its average (short busy
          // shots spike), and hls.js judges a rendition by that peak until its
          // buffer is deep: a normal connection never got past 720p. Cap the
          // peak it assumes at 2.5x the average.
          for (const l of hls.levels) {
            const avg = l.averageBitrate;
            if (avg && l.bitrate > avg * PEAK_OVER_AVERAGE) (l as { bitrate: number }).bitrate = Math.round(avg * PEAK_OVER_AVERAGE);
          }
          setLevels(hls.levels.map((l) => l.height));
          capToPlayer();
          resolve();
        });
        hls.loadSource(src);
        hls.attachMedia(film);
      });
    });
    return sourceReady.current;
  }, [capToPlayer, isHls, src]);
  useEffect(() => () => hlsRef.current?.destroy(), []);

  // nextLevel, not currentLevel: playback carries on through what's already
  // buffered and the next chunks arrive in the new quality — no stall, no
  // lost position.
  const qualityButtonRef = useRef<HTMLButtonElement>(null);
  const qualityMenuRef = useRef<HTMLUListElement>(null);
  const closeQuality = useCallback((refocus: boolean) => {
    setQualityOpen(false);
    if (refocus) qualityButtonRef.current?.focus({ preventScroll: true });
  }, []);
  const chooseLevel = (index: number) => {
    if (hlsRef.current) hlsRef.current.nextLevel = index;
    setLevel(index);
    closeQuality(true);
  };
  // The open menu: focus on the chosen quality; arrows, Home/End move, Escape and Tab
  // close it; a press anywhere else closes it too.
  useEffect(() => {
    if (!qualityOpen) return;
    qualityMenuRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus({ preventScroll: true });
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!qualityMenuRef.current?.contains(t) && !qualityButtonRef.current?.contains(t)) closeQuality(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [qualityOpen, closeQuality]);
  const onQualityMenuKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const items = [...(qualityMenuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? [])];
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    const go = (i: number) => items[(i + items.length) % items.length]?.focus({ preventScroll: true });
    switch (e.key) {
      case "ArrowDown":
        go(at + 1);
        break;
      case "ArrowUp":
        go(at - 1);
        break;
      case "Home":
        go(0);
        break;
      case "End":
        go(items.length - 1);
        break;
      case "Escape":
        closeQuality(true);
        break;
      case "Tab":
        closeQuality(false);
        return;
      case " ":
      case "Enter":
        e.stopPropagation(); // the button's own click picks it, not the player's play/pause key
        return;
      default:
        return;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  const play = useCallback(() => {
    const film = filmRef.current;
    if (!film) return;
    ensureSource().then(() => film.play().catch(() => setPhase("paused")));
    setPhase("playing");
    loopRef.current?.pause();
    emit(startedRef.current ? "film_resumed" : "film_started", {
      at_seconds: Math.round(film.currentTime),
    });
    startedRef.current = true;
    wakeControls();
  }, [emit, ensureSource, wakeControls]);

  const pauseInPlace = useCallback(() => {
    filmRef.current?.pause();
    setPhase("paused");
    emit("film_paused", { reason: "control", at_seconds: Math.round(time) });
  }, [emit, time]);

  const backToLoop = useCallback(
    (reason: "click_off" | "escape" = "click_off") => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
      filmRef.current?.pause();
      setPhase("idle");
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        loopRef.current?.play().catch(() => undefined);
      }
      emit("film_paused", { reason, at_seconds: Math.round(time) });
      onClose?.();
    },
    [emit, onClose, time],
  );

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

  useImperativeHandle(
    ref,
    () => ({
      play: () => {
        if (phaseRef.current === "ended") replay();
        else play();
        rootRef.current?.focus({ preventScroll: true });
      },
      close: () => {
        if (phaseRef.current !== "idle") backToLoop("escape");
      },
      fullscreen: () => {
        const root = rootRef.current;
        const video = filmRef.current as WebkitVideo | null;
        if (document.fullscreenElement) return;
        if (root?.requestFullscreen) root.requestFullscreen().catch(() => undefined);
        else video?.webkitEnterFullscreen?.(); // iOS Safari: only the <video> can go fullscreen
      },
    }),
    [play, replay, backToLoop],
  );

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

  // The cue on screen, read every frame (timeupdate only fires ~4 times a second).
  useEffect(() => {
    const film = filmRef.current;
    if (!film || !ccOn || !cues || phase === "idle") return setCueIndex(-1);
    let raf = 0;
    const tick = () => {
      const t = film.currentTime;
      setCueIndex(cues.findIndex((c) => t >= c.start && t < c.end));
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [ccOn, cues, phase]);

  // iPhone fullscreen is the system player, where our captions can't be drawn:
  // hand it the same cues as a native track while it lasts.
  useEffect(() => {
    const film = filmRef.current;
    if (!film || !captions) return;
    let track: TextTrack | null = null;
    const onBegin = () => {
      if (!ccOn || !cues?.length) return;
      if (!track) {
        track = film.addTextTrack("captions", labels.narrator, captions.lang);
        for (const c of cues) track.addCue(new VTTCue(c.start, c.end, c.text));
      }
      track.mode = "showing";
    };
    const onEnd = () => {
      if (track) track.mode = "disabled";
    };
    film.addEventListener("webkitbeginfullscreen", onBegin);
    film.addEventListener("webkitendfullscreen", onEnd);
    return () => {
      film.removeEventListener("webkitbeginfullscreen", onBegin);
      film.removeEventListener("webkitendfullscreen", onEnd);
      onEnd();
    };
  }, [captions, ccOn, cues, labels.narrator]);

  // Click-off: anywhere outside the player sends an open film back to the loop.
  useEffect(() => {
    if (phase === "idle") return;
    const onDown = (e: PointerEvent) => {
      if (document.fullscreenElement) return;
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) backToLoop();
    };
    const onEsc = (e: globalThis.KeyboardEvent) => {
      if (bare && e.key === "Escape" && !document.fullscreenElement) backToLoop("escape");
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [phase, backToLoop, bare]);

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
      case "c":
        if (captions) toggleCaptions();
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
  const showControls = open && (phase !== "playing" || controlsAwake || qualityOpen);
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
        (fullscreen || fill) && "h-full bg-black",
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
          (fullscreen || fill) && "h-full rounded-none border-0 bg-black p-0 shadow-none backdrop-blur-none sm:rounded-none sm:p-0"
        )}
      >
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-2xl bg-white sm:rounded-[28px]",
          (fullscreen || fill) && "aspect-auto h-full rounded-none bg-black sm:rounded-none"
        )}
      >
        {/* The film. Only its metadata loads until the visitor presses play. */}
        <video
          ref={filmRef}
          src={isHls ? undefined : src}
          preload="metadata"
          playsInline
          onClick={togglePlay}
          className="absolute inset-0 h-full w-full object-contain"
        />

        {/* Ambient loop (idle state); a bare player leaves the loop to its host. */}
        {!bare && (
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
        )}

        {/* Idle: a glass play button, nothing else. */}
        {!open && !bare && (
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
        {/* Buffering. Centred by its wrapper so the spinner's own transform is
            free for the rotation (animate-spin overwrites transform), and kept
            mounted — fading in/out — so the rotation never restarts. */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300",
            phase === "playing" && stalled ? "opacity-100" : "opacity-0"
          )}
        >
          <Loader2 className="h-10 w-10 animate-spin text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]" />
        </div>

        {/* Ended: the film's own "Install now" becomes a button in place: a bordered frame drawn
            around the title (the type is the film's own pixels, so nothing shifts) */}
        {phase === "ended" && picture.width > 0 && (
          <a
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => cta.onClick(e, "film_end_frame")}
            aria-label={cta.label}
            style={{
              left: picture.left + (endFrameCta.left - 0.026) * picture.width,
              top: picture.top + (endFrameCta.top - 0.04) * picture.height,
              width: (endFrameCta.width + 0.052) * picture.width,
              height: (endFrameCta.height + 0.08) * picture.height,
              borderRadius: 0.22 * (endFrameCta.height + 0.08) * picture.height,
            }}
            className="bzf-end-cta absolute"
          />
        )}

        {/* Closed captions: the narrator only (the shopper and the agent are captioned in the
            picture, and never speak over the narrator). The film's own caption pill, tagged
            "Narrator". Under the picture when the letterbox has room (portrait phones), else
            low in the frame, lifted over the control bar while it shows. */}
        {captions && ccOn && open && picture.width > 0 && (() => {
          const cue = cueIndex >= 0 ? cues?.[cueIndex] : undefined;
          const fontSize = Math.min(34, Math.max(12.5, picture.width * 0.0142));
          const pillHeight = fontSize * 2;
          const below = picture.top; // the letterbox under the picture (it's centred)
          const controlsTop = picture.width < 640 ? 62 : 88; // the control bar's top, plus a gap
          const inLetterbox = below >= pillHeight * 2.6 + 12;
          const style: CSSProperties = inLetterbox
            ? { top: picture.top + picture.height + 12 }
            : { bottom: Math.max(below + picture.height * 0.03, showControls ? controlsTop : 0) };
          return (
            <div
              aria-hidden={!cue}
              className="pointer-events-none absolute z-[5] flex justify-center transition-[bottom] duration-300 ease-out"
              style={{ left: picture.left + picture.width * 0.05, width: picture.width * 0.9, ...style }}
            >
              {cue && (
                <p
                  key={cueIndex}
                  lang={captions.lang}
                  className="bzf-cc"
                  style={{ fontSize }}
                >
                  {cue.voice && (
                    <span className="bzf-cc__tag">
                      <Mic aria-hidden="true" className="bzf-cc__mic" strokeWidth={2.5} />
                      {/^narrator$/i.test(cue.voice) ? labels.narrator : cue.voice}
                    </span>
                  )}
                  <span className="bzf-cc__text">{cue.text}</span>
                </p>
              )}
            </div>
          );
        })()}

        {/* Controls, inside the frame; they hide while the pointer rests. The install comes
            at the end, on the film's own closing title. */}
        {open && (
          <div className="absolute inset-x-2 bottom-2 z-10 flex items-center gap-2 sm:inset-x-4 sm:bottom-4 sm:gap-3">
            <div
              className={cn(
                GLASS,
                "flex min-w-0 flex-1 items-center gap-1 rounded-2xl p-1 transition-opacity duration-300 sm:gap-1.5 sm:p-1.5",
                showControls ? "opacity-100" : "pointer-events-none opacity-0"
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

              {captions && (
                <button
                  type="button"
                  onClick={toggleCaptions}
                  aria-label={labels.captions}
                  aria-pressed={ccOn}
                  title={labels.captions}
                  className={cn(dockButton, "relative")}
                >
                  <Captions className="h-5 w-5" aria-hidden="true" />
                  {/* on: a primary bar under the icon */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute bottom-1 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-primary transition-opacity duration-200 sm:bottom-1.5",
                      ccOn ? "opacity-100" : "opacity-0"
                    )}
                  />
                </button>
              )}

              {levels.length > 1 && (
                <div className="relative">
                  <button
                    ref={qualityButtonRef}
                    type="button"
                    onClick={() => setQualityOpen((o) => !o)}
                    aria-label={labels.quality}
                    aria-haspopup="menu"
                    aria-expanded={qualityOpen}
                    className={cn(dockButton, "w-auto gap-1.5 px-2 sm:w-auto sm:px-3", qualityOpen && "bg-white/15")}
                  >
                    <Settings2 className="h-5 w-5" aria-hidden="true" />
                    <span className="hidden text-xs font-semibold tabular-nums sm:inline">
                      {level === -1 ? `${labels.auto}${playingHeight ? ` · ${qualityLabel(playingHeight)}` : ""}` : qualityLabel(levels[level])}
                    </span>
                  </button>
                  {qualityOpen && (
                    <ul
                      ref={qualityMenuRef}
                      role="menu"
                      aria-label={labels.quality}
                      onKeyDown={onQualityMenuKey}
                      className={cn(GLASS, "bzf-quality absolute bottom-full right-0 mb-2 min-w-[11rem] overflow-hidden rounded-xl p-1 text-sm text-white")}
                    >
                      {[-1, ...levels.map((_, i) => i).sort((a, b) => levels[b] - levels[a])].map((i) => {
                        const chosen = level === i;
                        return (
                          <li key={i} role="none">
                            <button
                              type="button"
                              role="menuitemradio"
                              aria-checked={chosen}
                              onClick={() => chooseLevel(i)}
                              className="bzf-quality__item flex w-full items-center gap-2 rounded-lg py-1.5 pl-2 pr-3 text-left outline-none"
                            >
                              <Check
                                aria-hidden="true"
                                strokeWidth={3}
                                className={cn("h-4 w-4 flex-shrink-0", chosen ? "opacity-100" : "opacity-0")}
                              />
                              <span className="flex-1">
                                {i === -1 ? labels.auto : qualityLabel(levels[i])}
                                {i === -1 && chosen && playingHeight && (
                                  <span className="ml-1.5 font-normal tabular-nums text-white/75">{qualityLabel(playingHeight)}</span>
                                )}
                              </span>
                              {i !== -1 && levels[i] >= 2160 && <span className="text-[10px] font-bold opacity-80">UHD</span>}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

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
            </div>

          </div>
        )}
      </div>
      </div>
    </div>
  );
});
FilmPlayer.displayName = "FilmPlayer";

export default FilmPlayer;
