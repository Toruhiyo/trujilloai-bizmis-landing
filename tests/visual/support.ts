import { expect, test as base, type Page } from "playwright/test";

/**
 * How the suite makes the site hold still:
 *
 * - Time is Playwright's fake clock, paused from the first script on and moved
 *   on one frame at a time (advance). Every time-driven loop on the landing
 *   (the scenes' scroll clocks and their play-on-at-rest, the carousel's
 *   autoplay, the hero's entrance) runs on requestAnimationFrame,
 *   setTimeout/setInterval, performance.now or Date, so it only moves when a
 *   test moves the clock, and by the same amount every run.
 * - The ambient real-time loops (the visits stream, the Sales bar's climb, the
 *   Support clock, the Insights rays) hold on one moment: the site's only test
 *   switch, window.__BIZMIS_VR__ (src/lib/visualTest.ts), inert for visitors.
 * - Math.random is seeded; fonts and images load up front.
 * - CSS animations and transitions: each capture finishes them (finite) or
 *   puts them back to their start (infinite), `animations: "disabled"`; one
 *   capture per shot (shot), as a capture changes what the page does next.
 * - No WebGL: the live 3D avatars take the site's own fallback, their still
 *   renders (posters), as they do on a device without hardware WebGL.
 * - Only the site's own origin is reachable: analytics (PostHog, Google
 *   Analytics) and the CDN (the film, the 3D models) are cut, so a video never
 *   plays and nothing remote changes a picture.
 */

/** The fake clock's start: a fixed instant, so anything showing a date or time is the same every run. */
export const FROZEN_AT = new Date("2026-06-15T12:00:00Z");

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost"]);

/** Console errors any page may log under these conditions: a request to a cut host fails. */
const isCutHostNoise = (text: string, url: string) => {
  if (/^Failed to load resource: net::ERR_FAILED/.test(text) && url && !LOCAL_HOSTS.has(new URL(url).hostname)) return true;
  return false;
};

type Problems = { list: string[]; allow: RegExp[] };

export const test = base.extend<{ problems: Problems; frozen: Page }>({
  // (Playwright reads a fixture's first parameter as a pattern, so it stays an empty one)
  // eslint-disable-next-line no-empty-pattern
  problems: async ({}, provide) => {
    await provide({ list: [], allow: [] });
  },
  /** A page that holds still (see above), with its errors collected in `problems`. */
  frozen: async ({ page, context, problems }, provide) => {
    await context.route("**/*", (route) => {
      const host = new URL(route.request().url()).hostname;
      return LOCAL_HOSTS.has(host) ? route.continue() : route.abort();
    });
    await context.addInitScript(() => {
      // the site's one test switch (src/lib/visualTest.ts): its ambient real-time loops hold still
      (window as unknown as { __BIZMIS_VR__: boolean }).__BIZMIS_VR__ = true;
      // Math.random from a fixed seed (mulberry32), so anything scattered at random (the visits' dots) lands the same every run
      let seed = 0x2f6b9a1d;
      Math.random = () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      // DOM changes counted, so a test can wait until the page has caught up (settle)
      (window as unknown as { __vrMutations: number }).__vrMutations = 0;
      new MutationObserver((records) => {
        (window as unknown as { __vrMutations: number }).__vrMutations += records.length;
      }).observe(document, { childList: true, subtree: true, attributes: true, characterData: true });
      // every font the stylesheets declare loads up front, so no layout is measured before its font
      // is in and redone later at some moment that depends on the network
      document.addEventListener("DOMContentLoaded", () => document.fonts.forEach((f) => void f.load().catch(() => undefined)));
      // every image loads up front (lazy ones too), so what's on screen never waits on the browser's lazy-load distance
      new MutationObserver((records) => {
        for (const r of records)
          for (const n of r.addedNodes) {
            if (n instanceof HTMLImageElement) n.loading = "eager";
            else if (n instanceof Element) n.querySelectorAll("img[loading=lazy]").forEach((i) => ((i as HTMLImageElement).loading = "eager"));
          }
      }).observe(document, { childList: true, subtree: true });
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (/webgl/i.test(type)) return null;
        return (getContext as (...a: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof getContext;
    });
    page.on("pageerror", (e) => problems.list.push(`page error: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      const url = m.location().url;
      if (isCutHostNoise(m.text(), url)) return;
      problems.list.push(`console error: ${m.text().split("\n")[0]}${url ? ` (${url})` : ""}`);
    });
    trackRequests(page);
    await page.clock.install({ time: FROZEN_AT });
    await page.clock.pauseAt(new Date(FROZEN_AT.getTime() + 1000));
    // The fake clock's performance.now (and the frame times it hands to requestAnimationFrame) starts
    // a millisecond or two off from run to run; counted from its first reading instead, every run
    // sees the same times. (Added after the clock, so it wraps the clock's own functions.)
    await page.addInitScript(() => {
      const now = performance.now.bind(performance);
      const origin = now();
      performance.now = () => now() - origin;
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb: FrameRequestCallback) => raf((t: number) => cb(t - origin));
    });
    await provide(page);
    const unexpected = problems.list.filter((p) => !problems.allow.some((re) => re.test(p)));
    expect(unexpected, "page and console errors").toEqual([]);
  },
});

export { expect };

/** Waits (real time) until no request is in flight and the images on screen are in, for `quiet` ms. */
export const networkIdle = async (page: Page, quiet = 200, max = 10_000) => {
  const start = Date.now();
  let lastBusy = Date.now();
  while (Date.now() - start < max) {
    const loading = await page.evaluate(
      () =>
        [...document.images].filter((img) => {
          if (img.complete) return false;
          const r = img.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
        }).length,
    );
    const pending = (page as Page & { __vrPending?: number }).__vrPending ?? 0;
    if (loading || pending) lastBusy = Date.now();
    else if (Date.now() - lastBusy >= quiet) return;
    await page.waitForTimeout(40);
  }
};

/** Counts the page's requests in flight (for networkIdle). */
export const trackRequests = (page: Page) => {
  const p = page as Page & { __vrPending?: number };
  p.__vrPending = 0;
  const done = () => (p.__vrPending = Math.max(0, (p.__vrPending ?? 0) - 1));
  page.on("request", () => (p.__vrPending = (p.__vrPending ?? 0) + 1));
  page.on("requestfinished", done);
  page.on("requestfailed", done);
};

/**
 * Moves the fake clock on by `ms`, one frame (16 ms) at a time. After each frame the browser renders
 * once for real (delivering the intersection and resize observers that frame's layout set off) and
 * the page runs what that queued (React committing it): so an observer's news always lands before
 * the same fake frame, however busy the machine is, and every run takes the same path.
 */
export const advance = async (page: Page, ms: number) => {
  for (let t = 0; t < ms; t += 16) {
    await page.clock.runFor(Math.min(16, ms - t));
    await realFrames(page, 1);
  }
};

/**
 * Waits for the browser to render `n` real frames (requestAnimationFrame is the fake clock's, so an
 * intersection observer's first delivery stands in for a frame), then for React's queued work (a
 * macrotask after it).
 */
export const realFrames = (page: Page, n = 2) =>
  page.evaluate(async (n) => {
    // one probe for good (a new observer reports on it at the next frame); adding it is the only DOM change made here
    const w = window as unknown as { __vrProbe?: HTMLElement };
    if (!w.__vrProbe) {
      w.__vrProbe = document.createElement("div");
      w.__vrProbe.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none;";
      document.documentElement.appendChild(w.__vrProbe);
    }
    const probe = w.__vrProbe;
    for (let i = 0; i < n; i++) {
      await new Promise<void>((resolve) => {
        const io = new IntersectionObserver(() => {
          io.disconnect();
          resolve();
        });
        io.observe(probe);
      });
    }
    await new Promise<void>((resolve) => {
      const ch = new MessageChannel();
      ch.port1.onmessage = () => resolve();
      ch.port2.postMessage(0);
    });
  }, n);

/**
 * Waits (real time) until the page stops changing the DOM for `ms`. With the
 * clock paused nothing runs on its own, so what still changes the DOM is the
 * page catching up on real events (scroll and intersection callbacks, React
 * committing them, loads): waiting it out makes the next clock step start
 * from the same state however busy the machine is.
 */
export const domQuiet = async (page: Page, ms = 150, max = 10_000) => {
  await realFrames(page);
  const start = Date.now();
  let last = -1;
  let since = Date.now();
  while (Date.now() - start < max) {
    const n = await page.evaluate(() => (window as unknown as { __vrMutations?: number }).__vrMutations ?? 0);
    if (n !== last) {
      last = n;
      since = Date.now();
    } else if (Date.now() - since >= ms) return;
    await page.waitForTimeout(30);
  }
};

/**
 * Lets the page catch up with a scroll or a load, the same way every time:
 * real time until it is idle (no request in flight, no DOM change), then the
 * fake clock forward by a fixed step for what the page does on its clocks
 * (each step runs ~6 frames), and idle again.
 */
export const settle = async (page: Page, steps = 2) => {
  for (let i = 0; i < steps; i++) {
    await networkIdle(page);
    await domQuiet(page);
    await advance(page, 100);
  }
  await networkIdle(page);
  await page.evaluate(() => document.fonts.ready);
  await domQuiet(page);
};

/** Opens a path frozen and settled: fonts in, first paint done, the page's start-up timers run. */
export const open = async (page: Page, path: string) => {
  const response = await page.goto(path, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.evaluate(async () => {
    await Promise.all([...document.fonts].map((f) => f.load().catch(() => undefined)));
    await document.fonts.ready;
  });
  await networkIdle(page, 400);
  await domQuiet(page, 300);
  // start-up timers (the hero's entrance, deferred loads), then settle
  await advance(page, 3000);
  await settle(page, 3);
  return response;
};

export const scrollToY = async (page: Page, y: number) => {
  await page.evaluate((y) => window.scrollTo(0, Math.max(0, Math.round(y))), y);
  await settle(page);
};

/** The page can't scroll sideways. */
export const expectNoHorizontalOverflow = async (page: Page, where: string) => {
  const o = await page.evaluate(() => ({
    scroll: document.scrollingElement!.scrollWidth,
    view: document.documentElement.clientWidth,
  }));
  expect.soft(o.scroll, `horizontal overflow at ${where} (page is ${o.scroll}px wide in a ${o.view}px viewport)`).toBeLessThanOrEqual(o.view);
};

/** Every page has one h1. */
export const expectOneH1 = async (page: Page) => {
  expect.soft(await page.locator("h1").count(), "number of h1 on the page").toBe(1);
};

/** The page's text (rendered or hidden, as a crawler and a screen reader get it), whitespace collapsed. */
export const pageText = (page: Page) =>
  page.evaluate(() => (document.body.textContent ?? "").replace(/\s+/g, " "));

const decode = (s: string) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

/**
 * The route's prerendered HTML (fetched raw, no JavaScript) says what the
 * running page says: the same title, the same canonical (none on the 404)
 * and the page's main heading.
 */
export const expectPrerenderMatches = async (page: Page, path: string) => {
  const res = await page.request.get(path, { failOnStatusCode: false });
  const raw = await res.text();
  const live = await page.evaluate(() => ({
    title: document.title,
    canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null,
    h1: (document.querySelector("h1")?.textContent ?? "").replace(/\s+/g, " ").trim(),
  }));
  const rawTitle = decode(raw.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim();
  const rawCanonical = raw.match(/<link[^>]+rel="canonical"[^>]*>/i)?.[0].match(/href="([^"]+)"/)?.[1] ?? null;
  const rawText = decode(raw.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
  expect.soft(rawTitle, `${path}: prerendered <title>`).not.toBe("");
  expect.soft(rawTitle, `${path}: prerendered <title> is the running page's`).toBe(live.title);
  expect.soft(rawCanonical, `${path}: prerendered canonical is the running page's`).toBe(live.canonical);
  if (live.canonical) expect.soft(live.canonical, `${path}: canonical`).toMatch(/^https:\/\/www\.bizmis\.ai\//);
  expect.soft(live.h1, `${path}: the page has a main heading`).not.toBe("");
  // (spacing aside: a heading's lines may be split by a <br> or a block in one and a space in the other)
  const squash = (t: string) => t.replace(/\s+/g, "");
  expect.soft(squash(rawText), `${path}: prerendered HTML holds the main heading ("${live.h1}")`).toContain(squash(live.h1));
};

/**
 * One screenshot, compared with its baseline. Always exactly one capture (toHaveScreenshot takes as
 * many as it needs to see the page hold still, a different number when updating than when comparing):
 * a capture with animations disabled finishes the page's CSS transitions, which the page reacts to,
 * so the number of captures has to be the same in every run for the next state to be the same.
 */
export const shot = async (page: Page, name: string, options: { fullPage?: boolean; maxDiffPixels?: number } = {}) => {
  const image = await page.screenshot({ animations: "disabled", caret: "hide", scale: "css", fullPage: options.fullPage });
  const strict = Boolean(process.env.VR_STRICT);
  expect.soft(image).toMatchSnapshot(name, options.maxDiffPixels && !strict ? { maxDiffPixels: options.maxDiffPixels } : {});
  await settle(page, 1);
};
