/**
 * A stand-in for "posthog-js/react" that keeps PostHog (about 60 KB gzipped,
 * plus its recorder, surveys and web-vitals add-ons) off the page's critical
 * path. vite.config.ts aliases "posthog-js/react" to this file, so the app's
 * `PostHogProvider` and `usePostHog()` calls stay exactly as written.
 *
 * - The real posthog-js is imported and initialised once the page has loaded,
 *   painted its largest element and the main thread is idle, or at the
 *   visitor's first interaction, whichever comes first (or as soon as the tab
 *   is hidden).
 * - Until then `usePostHog()` returns a stable proxy that queues every call
 *   (capture, register, identify, ...) and replays it, in order, on the real
 *   client once it's up. After that the proxy forwards calls directly.
 * - Nothing is lost or misdated by the wait:
 *   - the page view carries the time the page started, not the time PostHog
 *     came up, and a queued capture carries the time it was called, so a
 *     click made before the load still comes after its page view;
 *   - pages visited (client-side route changes) before the load each get their
 *     page view, at their own time, not only the page PostHog woke up on;
 *   - if the visitor leaves before PostHog is up (a quick bounce, or a plain
 *     link to another page), the page view and the queued captures go out in
 *     one beacon to PostHog's capture API on `pagehide`, under the same
 *     visitor and session ids the real client then picks up (bootstrap).
 */
import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import type { CaptureResult, PostHog, PostHogConfig, Properties } from "posthog-js";

type Call = { name: string; args: unknown[]; t: number };
type Page = { href: string; path: string; key: string; title?: string; t: number };

let real: PostHog | null = null;
let started = false;
const queue: Call[] = [];

const now = () => Date.now();
const pathOf = (l: Location) => l.pathname + l.search;
/** The page views PostHog hasn't seen yet: this page, then any route changes before it loads. */
const pages: Page[] =
  typeof window === "undefined"
    ? []
    : [{ href: location.href, path: location.pathname, key: pathOf(location), title: document.title, t: now() }];

if (typeof window !== "undefined") {
  // client-side route changes before PostHog is up (posthog-js watches them itself once loaded)
  const note = () => {
    if (real) return;
    if (pages[pages.length - 1]?.key === pathOf(location)) return; // same page (a hash or state change)
    pages.push({ href: location.href, path: location.pathname, key: pathOf(location), t: now() });
  };
  for (const name of ["pushState", "replaceState"] as const) {
    const original = history[name];
    history[name] = function (this: History, ...args: Parameters<History["pushState"]>) {
      const result = original.apply(this, args);
      note();
      return result;
    } as History["pushState"];
  }
  window.addEventListener("popstate", note);
}

/** Every method call on the proxy goes to the real client, or waits for it. */
const client = new Proxy({} as PostHog, {
  get(_target, prop) {
    if (real) {
      const value = (real as unknown as Record<PropertyKey, unknown>)[prop];
      return typeof value === "function" ? value.bind(real) : value;
    }
    if (typeof prop !== "string" || prop === "then") return undefined;
    return (...args: unknown[]) => {
      queue.push({ name: prop, args, t: now() });
    };
  },
});

/** A UUIDv7 (the id format posthog-js uses for visitors and sessions). */
function uuidv7(ms = now()): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  for (let i = 5, t = ms; i >= 0; i--, t = Math.floor(t / 256)) b[i] = t % 256;
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const SESSION_IDLE_MS = 30 * 60 * 1000; // posthog-js's default session_idle_timeout_seconds
const IDS_KEY = "bizmis_ph_ids";
/** A value posthog-js (or this file) stored: localStorage, else (with `cookie`) the cookie of that name. */
const readRaw = (key: string, cookie = false): string | null => {
  try {
    const stored = localStorage.getItem(key);
    if (stored || !cookie) return stored;
    const hit = document.cookie.split("; ").find((c) => c.startsWith(key + "="));
    return hit ? decodeURIComponent(hit.slice(key.length + 1)) : null;
  } catch {
    return null;
  }
};
const readJson = (key: string, cookie = false): Record<string, unknown> | null => {
  try {
    const parsed: unknown = JSON.parse(readRaw(key, cookie) ?? "null");
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};

type Ids = { distinctId: string; deviceId: string; sessionId: string; fromPostHog: boolean; freshSession: boolean };
let ids: Ids | null = null;
/**
 * The visitor and session ids to use before posthog-js is up: the ones it
 * persisted (a returning visitor), else the ones a beacon on an earlier page
 * used, else new ones. The same ids are handed to posthog-js as its bootstrap.
 */
function resolveIds(apiKey: string): Ids {
  if (ids) return ids;
  const ph = readJson(`ph_${apiKey}_posthog`, true);
  const ours = readJson(IDS_KEY);
  let distinctId = typeof ph?.distinct_id === "string" ? ph.distinct_id : null;
  let deviceId = typeof ph?.$device_id === "string" ? ph.$device_id : distinctId;
  let sessionId: string | null = null;
  const sesid = ph?.$sesid;
  if (Array.isArray(sesid) && typeof sesid[1] === "string" && now() - Number(sesid[0]) < SESSION_IDLE_MS) sessionId = sesid[1];
  const fromPostHog = !!distinctId;
  if (!distinctId && typeof ours?.d === "string") {
    distinctId = ours.d;
    deviceId = ours.d;
    if (typeof ours.s === "string" && now() - Number(ours.t) < SESSION_IDLE_MS) sessionId = ours.s;
  }
  const freshSession = !sessionId;
  distinctId ??= uuidv7(pages[0]?.t);
  ids = {
    distinctId,
    deviceId: deviceId ?? distinctId,
    sessionId: sessionId ?? uuidv7(pages[0]?.t),
    fromPostHog,
    freshSession,
  };
  return ids;
}

/** Fixes the page views posthog-js sends right after it loads (see the file's header). */
let pageOverride: Page | null = null;
let autoPending = false; // posthog-js's own page view on init is still to come
let autoPage: Page | undefined; // ...for this page (none: it was sent in a beacon already)
const fixPageviews = (ev: CaptureResult | null): CaptureResult | null => {
  if (!ev || ev.event !== "$pageview") return ev;
  if (pageOverride) {
    const p = pageOverride;
    ev.properties = { ...ev.properties, $current_url: p.href, $pathname: p.path, title: p.title };
    if (!p.title) delete ev.properties.title;
    ev.timestamp = new Date(p.t);
    return ev;
  }
  if (autoPending) {
    // the page view posthog-js captures on init, for the page it woke up on
    autoPending = false;
    if (!autoPage) return null; // already sent in a beacon (the page came back from the back/forward cache)
    ev.timestamp = new Date(autoPage.t);
  }
  return ev;
};

function load(apiKey: string, options?: Partial<PostHogConfig>) {
  if (started) return;
  started = true;
  import("posthog-js")
    .then(({ default: posthog }) => {
      const { distinctId, sessionId, fromPostHog, freshSession } = resolveIds(apiKey);
      const before = options?.before_send;
      const bootstrap = { ...options?.bootstrap };
      if (!fromPostHog) bootstrap.distinctID ??= distinctId;
      if (freshSession || !fromPostHog) bootstrap.sessionID ??= sessionId;
      autoPending = true;
      autoPage = pages[pages.length - 1];
      posthog.init(apiKey, {
        ...options,
        bootstrap,
        before_send: [fixPageviews, ...(before ? (Array.isArray(before) ? before : [before]) : [])],
      });
      real = posthog;
      if (!options?.disable_session_recording) shipRecordingEarly(posthog);
      try {
        localStorage.removeItem(IDS_KEY);
      } catch {
        /* storage unavailable */
      }
      // the earlier pages' views and the queued calls, in the order they happened
      // (the current page's view is posthog-js's own, captured just after init)
      const earlier = pages.slice(0, -1);
      const timeline = [
        ...earlier.map((p) => ({ t: p.t, run: () => posthog.capture("$pageview", { $current_url: p.href }, { timestamp: new Date(p.t) }), page: p })),
        // (super properties first: a page view or click before them is still theirs)
        ...queue.splice(0).map((c) => ({ t: /^register/.test(c.name) ? -Infinity : c.t, run: () => replay(posthog, c), page: null })),
      ].sort((a, b) => a.t - b.t);
      for (const item of timeline) {
        pageOverride = item.page;
        try {
          item.run();
        } finally {
          pageOverride = null;
        }
      }
    })
    .catch(() => {
      started = false;
    });
}

/**
 * posthog-js holds a new recording in memory until the visitor first interacts, and a
 * visitor who only reads or watches has it all sent as they leave: the page's whole first
 * snapshot (60 to 200 KB here) in one unload beacon. Over the browser's ~64 KB budget for
 * those it is refused (the recording is lost); under it, it can use the budget up so the
 * beacons after it are refused. Once the page is on screen and recording, this lets the
 * recording upload as it goes (posthog-js's public override), so the snapshot leaves
 * within seconds as an ordinary request and the leave carries only the last moments.
 * Nothing else changes: it records what it did before, and a tab that is never shown
 * stays held, as before.
 */
function shipRecordingEarly(posthog: PostHog) {
  let tries = 0;
  const release = () => {
    if (document.visibilityState !== "visible") {
      document.addEventListener("visibilitychange", release, { once: true });
      return;
    }
    // the recorder script loads after init; until it has started there is nothing to release
    if (posthog.sessionRecordingStarted()) posthog.startSessionRecording({ url_trigger: true });
    else if (++tries < 30) window.setTimeout(release, 1000);
  };
  release();
}

function replay(posthog: PostHog, { name, args, t }: Call) {
  const fn = (posthog as unknown as Record<string, unknown>)[name];
  if (typeof fn !== "function") return;
  if (name === "capture") {
    // capture(event, properties, options): keep the time it was called
    const [event, properties, opts] = args as [string, Properties | undefined, Record<string, unknown> | undefined];
    fn.call(posthog, event, properties, { timestamp: new Date(t), ...opts });
  } else fn.apply(posthog, args);
}

// --- leaving before PostHog is up ------------------------------------------

function uaProps(): Properties {
  const ua = navigator.userAgent;
  const os = /iPhone|iPad|iPod/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X/.test(ua)
          ? "Mac OS X"
          : /CrOS/.test(ua)
            ? "Chrome OS"
            : /Linux/.test(ua)
              ? "Linux"
              : undefined;
  const browser = /Edg\//.test(ua)
    ? "Microsoft Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /SamsungBrowser/.test(ua)
        ? "Samsung Internet"
        : /Firefox|FxiOS/.test(ua)
          ? "Firefox"
          : /Chrome|CriOS/.test(ua)
            ? "Chrome"
            : /Safari/.test(ua)
              ? "Safari"
              : undefined;
  const device = /iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua)) ? "Tablet" : /Mobi|iPhone|iPod/.test(ua) ? "Mobile" : "Desktop";
  return { $os: os, $browser: browser, $device_type: device, $raw_user_agent: ua };
}

/**
 * The visitor is leaving and posthog-js never loaded: send this page's view
 * and the queued captures to PostHog's capture API ourselves, in one beacon.
 */
function beacon(apiKey: string, host: string) {
  if (real || !host) return;
  if (!pages.length && !queue.some((c) => c.name === "capture")) return;
  // a visitor who opted out (posthog-js keeps it as "0") gets nothing sent
  if (readRaw(`__ph_opt_in_out_${apiKey}`, true) === "0") return;
  const { distinctId, deviceId, sessionId } = resolveIds(apiKey);
  const supers: Properties = {};
  for (const c of queue) if (c.name === "register" && c.args[0] && typeof c.args[0] === "object") Object.assign(supers, c.args[0]);
  const referrer = document.referrer;
  let referringDomain = "$direct";
  try {
    if (referrer) referringDomain = new URL(referrer).host;
  } catch {
    /* keep $direct */
  }
  const campaign: Properties = {};
  const params = new URLSearchParams(location.search);
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"]) {
    const v = params.get(k);
    if (v) campaign[k] = v;
  }
  const base: Properties = {
    token: apiKey,
    distinct_id: distinctId,
    $device_id: deviceId,
    $session_id: sessionId,
    $lib: "web",
    $host: location.host,
    $referrer: referrer || "$direct",
    $referring_domain: referringDomain,
    $screen_height: screen.height,
    $screen_width: screen.width,
    $viewport_height: innerHeight,
    $viewport_width: innerWidth,
    $process_person_profile: false,
    bizmis_beacon: true, // sent by this file, not by posthog-js
    ...uaProps(),
    ...campaign,
    ...supers,
  };
  const batch: Record<string, unknown>[] = [];
  for (const p of pages)
    batch.push({
      uuid: uuidv7(p.t),
      event: "$pageview",
      timestamp: new Date(p.t).toISOString(),
      properties: { ...base, $current_url: p.href, $pathname: p.path, ...(p.title ? { title: p.title } : {}) },
    });
  for (const c of queue) {
    if (c.name !== "capture" || typeof c.args[0] !== "string") continue;
    const props = (c.args[1] ?? {}) as Properties;
    batch.push({
      uuid: uuidv7(c.t),
      event: c.args[0],
      timestamp: new Date(c.t).toISOString(),
      properties: { ...base, $current_url: location.href, $pathname: location.pathname, ...props },
    });
  }
  const body = new Blob([JSON.stringify({ api_key: apiKey, batch })], { type: "text/plain" });
  let sent = false;
  try {
    sent = navigator.sendBeacon(`${host.replace(/\/$/, "")}/batch/`, body);
  } catch {
    sent = false;
  }
  if (!sent) return;
  queue.length = 0;
  pages.length = 0;
  // the next page (or a return visit) continues as the same visitor and session
  try {
    if (!ids?.fromPostHog) localStorage.setItem(IDS_KEY, JSON.stringify({ d: distinctId, s: sessionId, t: now() }));
  } catch {
    /* storage unavailable */
  }
}

// ---------------------------------------------------------------------------

const INTERACTIONS = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

/** After the load event and an idle moment, or at the first interaction. */
function whenCalm(run: () => void) {
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    INTERACTIONS.forEach((e) => window.removeEventListener(e, go, true));
    document.removeEventListener("visibilitychange", hidden);
    run();
  };
  // a hidden tab paints nothing: load now (on a phone the page may be dropped while in the background)
  const hidden = () => {
    if (document.visibilityState === "hidden") go();
  };
  INTERACTIONS.forEach((e) => window.addEventListener(e, go, { capture: true, passive: true, once: true }));
  document.addEventListener("visibilitychange", hidden);
  const idle = () => {
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback;
    if (ric) ric(go, { timeout: 4000 });
    else window.setTimeout(go, 1500);
  };
  // the load event can come before the page's largest paint (the app is a module script, its images lazy):
  // wait for that paint too, at most 3 s, so the analytics never land in front of it
  const painted = () => {
    let fired = false;
    let po: PerformanceObserver | null = null;
    const next = () => {
      if (fired) return;
      fired = true;
      po?.disconnect();
      idle();
    };
    try {
      po = new PerformanceObserver((list) => {
        if (list.getEntries().length) window.setTimeout(next, 800);
      });
      po.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      next();
      return;
    }
    window.setTimeout(next, 3000);
  };
  if (document.readyState === "complete") painted();
  else window.addEventListener("load", painted, { once: true });
}

const PostHogContext = createContext<{ client: PostHog }>({ client });

export const PostHogProvider = ({
  apiKey,
  options,
  children,
}: {
  apiKey?: string;
  options?: Partial<PostHogConfig>;
  client?: PostHog;
  children?: ReactNode;
}) => {
  useEffect(() => {
    if (!apiKey) return;
    whenCalm(() => load(apiKey, options));
    const leave = () => beacon(apiKey, options?.api_host ?? "");
    window.addEventListener("pagehide", leave);
    return () => window.removeEventListener("pagehide", leave);
    // (options are read once, like the real provider)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);
  return <PostHogContext.Provider value={{ client }}>{children}</PostHogContext.Provider>;
};

export const usePostHog = (): PostHog => useContext(PostHogContext).client;
