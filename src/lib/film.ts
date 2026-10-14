/**
 * The ad-1 film shown in the landing hero (and later on /watch?ref=).
 *
 * `src` is an HLS ladder (4K, 1440p, 1080p, 720p, 480p, 360p) built from the
 * 4K master by scripts/encode-film-hls.sh and hosted on the ops CDN
 * (go.bizmis.ai, S3 + CloudFront; bizmis-operations/scripts/marketing/upload_film_hls.py)
 * under a versioned prefix (invite-cards/_film/<film>/<cut>/), so a new cut never
 * collides with a cached one. Not on Vercel Blob: the free plan's quotas blocked the
 * store twice (2026-10). VITE_FILM_SRC overrides it (e.g. a local ladder).
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
    "https://go.bizmis.ai/invite-cards/_film/ad-1/v33/master.m3u8",
  /** Fallback until the film's metadata loads (seconds). */
  durationSeconds: 127,
  loop: {
    webm: "/film/ad-1-loop.webm",
    mp4: "/film/ad-1-loop.mp4",
    poster: "/film/ad-1-loop-poster.jpg",
  },
  /**
   * Where the film's own "Install now" button sits on its closing frame, as
   * fractions of the frame. On that frame the area becomes a real link.
   */
  endFrameCta: { left: 0.285, top: 0.37, width: 0.43, height: 0.13 },
} as const;

