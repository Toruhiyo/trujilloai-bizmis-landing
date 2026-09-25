import { useEffect } from "react";

const WIDGET_SCRIPT = "https://cdn.bizmis.ai/widget/avatar-widget.js";
const WIDGET_STYLE = "https://cdn.bizmis.ai/widget/avatar-widget-style.css";
const FILM_STYLES = [
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
};

declare global {
  interface Window {
    AvatarVoicechat?: AvatarApi;
    __promoFilmBooted?: boolean;
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

function startWidget() {
  const api = window.AvatarVoicechat;
  if (!api || typeof api.init !== "function") return;
  api.init({
    containerId: "bizmis-avatar-embed",
    rootUrl: "https://cdn.bizmis.ai/widget",
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
    themeMode: "auto",
    themePalette: "default",
    autoOpen: false,
    zIndex: 9999,
  });
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
