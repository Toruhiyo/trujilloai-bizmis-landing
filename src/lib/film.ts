/**
 * The ad-1 film shown in the landing hero (and later on /watch?ref=).
 *
 * `src` is an HLS ladder (4K, 1440p, 1080p, 720p, 480p, 360p) built from the
 * 4K master by scripts/encode-film-hls.sh. Locally it's served from
 * public/film/hls (a gitignored link to tmp/film-hls); in production
 * VITE_FILM_SRC points at the hosted master.m3u8.
 * The ambient loop is a muted montage of the agent at work (built by
 * scripts/make-hero-film-loop.sh), small enough to ship with the
 * site.
 */
/**
 * The film-led hero ships dark: on in dev, and in a build only with
 * VITE_HERO_FILM=1 (set it once the final film is hosted). Until then
 * production keeps the previous hero, which also lives at /v1.
 */
export const HERO_FILM_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_HERO_FILM === "1";

export const HERO_FILM = {
  id: "ad-1",
  src: import.meta.env.VITE_FILM_SRC ?? "/film/hls/ad-1/master.m3u8",
  /** Fallback until the film's metadata loads (seconds). */
  durationSeconds: 161,
  loop: {
    webm: "/film/ad-1-loop.webm",
    mp4: "/film/ad-1-loop.mp4",
    poster: "/film/ad-1-loop-poster.jpg",
  },
  /**
   * Where the film's own "Install now" button sits on its closing frame, as
   * fractions of the frame. On that frame the area becomes a real link.
   */
  endFrameCta: { left: 0.37, top: 0.43, width: 0.26, height: 0.23 },
} as const;
