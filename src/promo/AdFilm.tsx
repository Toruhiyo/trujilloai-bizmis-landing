import { useEffect } from "react";

// `?widget=local` loads a local widget build (public/promo/widget-local, copied
// from trujilloai-bizmis-widget/dist) for film features not yet on the CDN.
const LOCAL_WIDGET = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("widget") === "local";
const WIDGET_SCRIPT = LOCAL_WIDGET ? "/promo/widget-local/avatar-widget.js" : "https://cdn.bizmis.ai/widget/avatar-widget.js";
const WIDGET_STYLE = LOCAL_WIDGET ? "/promo/widget-local/avatar-widget-style.css" : "https://cdn.bizmis.ai/widget/avatar-widget-style.css";
// The local build also plays its own animations GLB (film-only clips like
// `beckon`); the widget defaults to the CDN copy. Absolute on purpose: the
// widget resolves relative paths against rootUrl (the CDN).
const LOCAL_ANIMATIONS_URL = "/promo/widget-local/assets/models/avatar-animations.glb";
// The v2 landing's type: Inter (400-800) for everything, Caveat for the handwritten lines.
// Must match index.html's link byte for byte (loadStylesheet dedupes by href).
const INTER_STYLE = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Caveat:wght@600;700&display=swap";
const FILM_STYLES = [
  INTER_STYLE,
  "/promo/promo-host.css",
  "/promo/promo-ad-tokens.css",
  "/promo/promo-ad.css",
  WIDGET_STYLE,
];

type FilmAssets = {
  clips: Record<string, string>;
  clay: Record<string, string>;
  pitchLead: string;
  stamp: string;
};

type AvatarApi = {
  init?: (config: Record<string, unknown>) => void;
  destroy?: (containerId: string) => void;
};

type PromoWidgetMount = {
  isMobile?: boolean;
  viewportHostSelector?: string;
};

declare global {
  interface Window {
    AvatarVoicechat?: AvatarApi;
    __promoFilmBooted?: boolean;
    __promoMountWidget?: (options?: PromoWidgetMount) => void;
    __promoSayPatched?: boolean;
  }
}

export function isAdFilmRequest(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get("marketing") === "ad-1" || params.get("promo_video") === "opening";
}

function applyFilmDocumentState() {
  const params = new URLSearchParams(window.location.search);
  const root = document.documentElement;
  const part = (params.get("part") || "full").trim().toLowerCase();
  root.classList.add("js", "is-promo-opening");
  root.classList.remove("is-promo-cover");
  root.classList.toggle("is-promo-clip", Boolean(params.get("clip")));
  root.classList.toggle(
    "is-promo-greyscale",
    params.get("promo_video") === "mock" || params.get("promo_video") === "unattended",
  );
  root.style.setProperty("--ad-warmth", part === "pitch" ? "1" : "0");
  try {
    sessionStorage.removeItem("bizmis-session");
    localStorage.removeItem("bizmis-session");
  } catch {
    /* private mode */
  }
}

function loadStylesheet(href: string): Promise<void> {
  const existing = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
  if (existing) return Promise.resolve();
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

function mountMarkup(html: string) {
  const holder = document.createElement("div");
  holder.innerHTML = html;
  while (holder.firstChild) document.body.appendChild(holder.firstChild);
}

function ensureWidgetHost() {
  if (document.getElementById("bizmis-avatar-embed")) return;
  const host = document.createElement("div");
  host.id = "bizmis-avatar-embed";
  host.className = "bizmis-avatar-widget-root";
  host.style.cssText = "position: fixed; z-index: 9999; bottom: 20px; right: 20px;";
  document.body.appendChild(host);
}

function mountWidget(options: PromoWidgetMount = {}) {
  const api = window.AvatarVoicechat;
  if (!api || typeof api.init !== "function") return;
  api.destroy?.("bizmis-avatar-embed");
  // The clerk's lines are captioned, in sync with its voice.
  try {
    localStorage.setItem("bizmis-subtitles", "true");
  } catch {
    /* storage blocked: captions keep the widget default */
  }
  api.init({
    containerId: "bizmis-avatar-embed",
    rootUrl: "https://cdn.bizmis.ai/widget",
    ...(LOCAL_WIDGET ? { avatarAnimationsUrl: new URL(LOCAL_ANIMATIONS_URL, window.location.origin).href } : {}),
    apiUrl: "https://api.trujillo.ai",
    websocketUrl: "wss://api.trujillo.ai",
    language: "en",
    showTryMeBanner: false,
    enableAcceptTerms: true,
    termsAndConditionsUrl: "https://bizmis.ai/terms",
    layout: "card",
    alignment: "right",
    anchor: "bottom-right",
    mobileAlignment: "center",
    mobileAnchor: "bottom-center",
    themeMode: "light",
    themePalette: "default",
    viewportHostSelector: options.viewportHostSelector || "[data-promo-canvas]",
    autoOpen: false,
    zIndex: 9999,
    isMobile: options.isMobile === true,
    viewportHostSelector: options.viewportHostSelector,
    // Hidden steering messages and simulated tool activity for the film.
    // See docs/agent-steering.md.
    debug: true,
  });
}

function startWidget() {
  window.__promoMountWidget = mountWidget;
  mountWidget();
}

async function bootFilm() {
  if (window.__promoFilmBooted) return;
  window.__promoFilmBooted = true;
  applyFilmDocumentState();
  await Promise.all(FILM_STYLES.map(loadStylesheet));
  const [markup, assets] = await Promise.all([
    fetch("/promo/film-markup.html").then((response) => {
      if (!response.ok) throw new Error("Film markup failed to load");
      return response.text();
    }),
    fetch("/promo/film-assets.json").then((response) => {
      if (!response.ok) throw new Error("Film asset map failed to load");
      return response.json() as Promise<FilmAssets>;
    }),
  ]);
  const root = document.documentElement;
  root.setAttribute("data-promo-bizmis-stamp", assets.stamp);
  root.setAttribute("data-promo-pitch-lead", assets.pitchLead);
  root.setAttribute("data-promo-clips", JSON.stringify(assets.clips));
  root.setAttribute("data-promo-clay", JSON.stringify(assets.clay));
  mountMarkup(markup);
  ensureWidgetHost();
  await loadScript("/promo/promo-clock.js");
  await loadScript(WIDGET_SCRIPT);
  await loadScript("/promo/film-engine.js");
  startWidget();
}

const AdFilm = () => {
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      bootFilm().catch((error: unknown) => {
        window.__promoFilmBooted = false;
        console.error(error);
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);
  return null;
};

export default AdFilm;
