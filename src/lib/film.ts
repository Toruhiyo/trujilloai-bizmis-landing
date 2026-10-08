/**
 * The ad-1 film shown in the landing hero (and later on /watch?ref=).
 *
 * `src` is a plain MP4 for now: a 1080p sample of an older cut, kept out of
 * git under public/film/. The final film will be served from a streaming
 * host (Mux HLS); point VITE_FILM_SRC at it without touching the player.
 * The ambient loop is a short muted excerpt, small enough to ship with the
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
  src: import.meta.env.VITE_FILM_SRC ?? "/film/ad-1-sample-1080p.mp4",
  /** Fallback until the film's metadata loads (seconds). */
  durationSeconds: 161,
  loop: {
    webm: "/film/ad-1-loop-stores.webm",
    mp4: "/film/ad-1-loop-stores.mp4",
    poster: "/film/ad-1-loop-stores-poster.jpg",
  },
  /**
   * Where the film's own "Install now" button sits on its closing frame, as
   * fractions of the frame. On that frame the area becomes a real link.
   */
  endFrameCta: { left: 0.37, top: 0.43, width: 0.26, height: 0.23 },
} as const;
