/**
 * The ad-1 film shown in the landing hero (and later on /watch?ref=).
 *
 * `src` is an HLS ladder (4K, 1440p, 1080p, 720p, 480p, 360p) built from the
 * 4K master by scripts/encode-film-hls.sh and published to the product CDN
 * (cdn.bizmis.ai, S3 + CloudFront) by scripts/publish-film-hls.sh under a
 * versioned prefix (media/film/<film>/<cut>/), so a new cut never collides with
 * a cached one. VITE_FILM_SRC overrides it (e.g. a local ladder).
 * The ambient loop is a muted montage of the agent at work (built by
 * scripts/make-hero-film-loop.sh), small enough to ship with the
 * site.
 */
/**
 * The film-led landing is the official "/" (also previewed at /v2). A build
 * with VITE_HERO_FILM=0 falls back to the classic landing, which also lives
 * at /v1.
 */
export const HERO_FILM_ENABLED = import.meta.env.VITE_HERO_FILM !== "0";

export const HERO_FILM = {
  id: "ad-1",
  src:
    import.meta.env.VITE_FILM_SRC ??
    "https://cdn.bizmis.ai/media/film/ad-1/v36/master.m3u8",
  /** Fallback until the film's metadata loads (seconds). */
  durationSeconds: 127,
  loop: {
    webm: "/film/ad-1-loop.webm",
    mp4: "/film/ad-1-loop.mp4",
    poster: "/film/ad-1-loop-poster.jpg",
  },
  /**
   * The film's closing "Install now" (the Shopify bag and the title), as
   * fractions of the frame, measured on the v34 cut's last frame (ink bounds
   * 1150,842 → 2694,1042 of 3840x2160). When the film ends, a real bordered
   * button is drawn around exactly this, so the title becomes a button in place.
   */
  endFrameCta: { left: 0.2995, top: 0.3898, width: 0.4021, height: 0.0926 },
} as const;

