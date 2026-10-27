/**
 * A stand-in for "posthog-js/react" that keeps PostHog (about 60 KB gzipped,
 * plus its recorder, surveys and web-vitals add-ons) off the page's critical
 * path. vite.config.ts aliases "posthog-js/react" to this file, so the app's
 * `PostHogProvider` and `usePostHog()` calls stay exactly as written.
 *
 * - The real posthog-js is imported and initialised once the page has loaded
 *   and the main thread is idle, or at the visitor's first interaction,
 *   whichever comes first.
 * - Until then `usePostHog()` returns a stable proxy that queues every call
 *   (capture, register, identify, ...) and replays it, in order, on the real
 *   client once it's up. After that the proxy forwards calls directly.
 */
import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import type { PostHog, PostHogConfig } from "posthog-js";

type Call = { name: string; args: unknown[] };

let real: PostHog | null = null;
let started = false;
const queue: Call[] = [];

/** Every method call on the proxy goes to the real client, or waits for it. */
const client = new Proxy({} as PostHog, {
  get(_target, prop) {
    if (real) {
      const value = (real as unknown as Record<PropertyKey, unknown>)[prop];
      return typeof value === "function" ? value.bind(real) : value;
    }
    if (typeof prop !== "string" || prop === "then") return undefined;
    return (...args: unknown[]) => {
      queue.push({ name: prop, args });
    };
  },
});

function load(apiKey: string, options?: Partial<PostHogConfig>) {
  if (started) return;
  started = true;
  import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(apiKey, options);
      real = posthog;
      for (const { name, args } of queue.splice(0)) {
        const fn = (posthog as unknown as Record<string, unknown>)[name];
        if (typeof fn === "function") fn.apply(posthog, args);
      }
    })
    .catch(() => {
      started = false;
    });
}

const INTERACTIONS = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

/** After the load event and an idle moment, or at the first interaction. */
function whenCalm(run: () => void) {
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    INTERACTIONS.forEach((e) => window.removeEventListener(e, go, true));
    run();
  };
  INTERACTIONS.forEach((e) => window.addEventListener(e, go, { capture: true, passive: true, once: true }));
  const idle = () => {
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback;
    if (ric) ric(go, { timeout: 4000 });
    else window.setTimeout(go, 1500);
  };
  if (document.readyState === "complete") idle();
  else window.addEventListener("load", idle, { once: true });
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
    // (options are read once, like the real provider)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);
  return <PostHogContext.Provider value={{ client }}>{children}</PostHogContext.Provider>;
};

export const usePostHog = (): PostHog => useContext(PostHogContext).client;
