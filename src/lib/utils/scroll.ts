import { holdSnap } from "@/lib/scrollSteps";

// Extend Window interface to include our custom property
declare global {
  interface Window {
    isProgrammaticScroll?: boolean;
    lastProgrammaticScrollTime?: number;
  }
}

const SECTION_SCROLL_GAP_PX = 8;
const FALLBACK_NAVBAR_HEIGHT_PX = 64;

/**
 * The screen's height for scroll maths: the small viewport, the height `svh`
 * is (documentElement.clientHeight). It holds still while a phone's browser
 * bar slides in and out on a scroll (iOS Safari, Android Chrome), where
 * innerHeight follows the bar and fires a resize: a clock or a docked bar
 * placed by innerHeight jumped when the bar moved, while the pinned screens
 * (sized in svh) stayed put. Elsewhere it is innerHeight.
 */
export const viewportHeight = (): number =>
  document.documentElement.clientHeight || window.innerHeight;

export const getSectionScrollOffset = (): number => {
  const nav = document.getElementById("site-navbar");
  const navHeight =
    nav?.getBoundingClientRect().height ?? FALLBACK_NAVBAR_HEIGHT_PX;

  return navHeight + SECTION_SCROLL_GAP_PX;
};

export const scrollToTop = (behavior: ScrollBehavior = "smooth"): void => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior,
  });
};

/**
 * Where a section's pinned screen sits stuck, as a page scroll position: the
 * first sticky element in it (the section itself or a descendant, e.g. the v2
 * landing's pinned stages), measured where it would sit in the flow, less its
 * sticky `top`. Scrolling there lands the section exactly as it looks once
 * pinned, with nothing left to scroll. Null when the section has no sticky part.
 */
const pinnedLanding = (element: HTMLElement): number | null => {
  const candidates = [element, ...Array.from(element.querySelectorAll<HTMLElement>("*")).slice(0, 400)];
  const pin = candidates.find((el) => getComputedStyle(el).position === "sticky");
  if (!pin) return null;
  const stickyTop = parseFloat(getComputedStyle(pin).top) || 0;
  // measure it un-stuck, synchronously (no frame is painted in between)
  const prev = pin.style.position;
  pin.style.position = "relative";
  const flowTop = pin.getBoundingClientRect().top + window.scrollY;
  pin.style.position = prev;
  return flowTop - stickyTop;
};

export const scrollToElement = (
  elementId: string,
  behavior: ScrollBehavior = "smooth"
): void => {
  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  const offset = getSectionScrollOffset();
  // a pinned section lands as it looks pinned; anything else just under the nav
  const pinned = pinnedLanding(element);
  // (a pinned landing rounded up: Safari drops a scroll's fraction of a pixel, which left it short of the pin)
  const top =
    pinned !== null
      ? Math.ceil(pinned)
      : element.getBoundingClientRect().top + window.scrollY - offset;

  // (?scroll=steps: the soft snap set aside while it travels, so it lands where it's sent)
  holdSnap();
  window.scrollTo({ top: Math.max(0, top), behavior });
};

export const scrollToSection = (
  sectionId: string,
  updateUrl: boolean = true,
  behavior: ScrollBehavior = "smooth"
): void => {
  const cleanSectionId = sectionId.replace("#", "");

  // Set programmatic scroll flag and timestamp to prevent URL override during scroll
  window.isProgrammaticScroll = true;
  window.lastProgrammaticScrollTime = Date.now();

  if (updateUrl) {
    const newUrl = `${window.location.pathname}#${cleanSectionId}`;
    window.history.pushState({ section: cleanSectionId }, "", newUrl);
  }

  // Clear the flag after scroll animation completes
  const scrollDuration = behavior === "smooth" ? 2000 : 300;
  setTimeout(() => {
    window.isProgrammaticScroll = false;
  }, scrollDuration);

  scrollToElement(cleanSectionId, behavior);
};

const scrollToHashWhenReady = (
  hash: string,
  behavior: ScrollBehavior = "smooth"
): void => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollToSection(hash, false, behavior);
    });
  });
};

export const setupScrollToSectionOnLoad = (): (() => void) => {
  const handleInitialScroll = () => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        scrollToHashWhenReady(hash);
      }, 150);
    }
  };

  const handleHashChange = () => {
    const hash = window.location.hash;
    if (hash) {
      scrollToHashWhenReady(hash);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", handleInitialScroll);
  } else {
    handleInitialScroll();
  }

  window.addEventListener("hashchange", handleHashChange);

  return () => {
    document.removeEventListener("DOMContentLoaded", handleInitialScroll);
    window.removeEventListener("hashchange", handleHashChange);
  };
};

export const setupScrollToUrlUpdater = (sectionIds: string[]): (() => void) => {
  // Completely disable automatic URL updating
  // Only manual navigation (clicking links, typing URLs) should change the hash

  // Return a no-op cleanup function
  return () => {
    // No cleanup needed since we're not setting up any observers
  };
};

/** A jump with no smooth scroll, whatever the page's CSS says. */
const jumpTo = (top: number): void => {
  holdSnap();
  window.scrollTo({ top: Math.max(0, Math.round(top)), left: 0, behavior: "instant" as ScrollBehavior });
};

/** Calls `stop` the first time the visitor scrolls the page themselves (a touch, the wheel, a key). */
const onVisitorScroll = (stop: () => void): (() => void) => {
  const events = ["touchstart", "wheel", "keydown", "pointerdown"] as const;
  const handler = () => stop();
  events.forEach((e) => window.addEventListener(e, handler, { passive: true, capture: true }));
  return () => events.forEach((e) => window.removeEventListener(e, handler, { capture: true }));
};

const RESTORE_PREFIX = "bzl-scroll:";
/** This history entry's name (React Router's key for it; it survives a reload). */
const entryKey = (): string =>
  `${RESTORE_PREFIX}${window.location.pathname}|${(window.history.state as { key?: string } | null)?.key ?? "-"}`;
let landedBefore = false;

/**
 * The landing keeps its place in its history entry: back from another page
 * (Pricing, FAQs) or on a reload it comes back where it was, not at the top.
 * The browser can't do it there: the sections mount after the hero's first
 * paint (FilmLanding), so when it tries the page is one screen tall and it
 * lands on the top. Here the scroll is noted per entry (sessionStorage) and,
 * on a way back (`pop`: React Router's POP; the first mount in a document:
 * a reload or a back/forward load), put back once the page is tall enough,
 * unless the visitor scrolls first. A link to a section (#setup) wins.
 */
export const setupLandingScrollRestore = (pop: boolean): (() => void) => {
  const first = !landedBefore;
  landedBefore = true;
  const history = window.history;
  // this entry's scroll is ours: the browser's attempt (too early) would only fight it
  history.scrollRestoration = "manual";

  const store = (key: string, y: number) => {
    try {
      window.sessionStorage.setItem(key, String(Math.round(y)));
    } catch {
      // (storage blocked: the page simply starts at the top)
    }
  };
  // Noting it costs nothing per scroll: a scroll only arms a timer, and the place is read and written
  // once the scroll has paused (at most every 250 ms), before a click can take the page elsewhere (its
  // capture), and when the page is hidden or left. (Read on every scroll event, the entry's key alone,
  // history.state, deserialized each time, cost about 1.7 ms a frame on a mid-range phone.)
  const landing = window.location.pathname;
  let timer = 0;
  const flush = () => {
    window.clearTimeout(timer);
    timer = 0;
    // (only while the landing is the page: after a link, the scroll is the next page's)
    if (window.location.pathname === landing) store(entryKey(), window.scrollY);
  };
  const note = () => {
    if (!timer) timer = window.setTimeout(flush, 250);
  };
  const onHidden = () => {
    if (document.visibilityState === "hidden") flush();
  };
  window.addEventListener("scroll", note, { passive: true });
  window.addEventListener("click", flush, { capture: true });
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", onHidden);

  // the way back: put the noted place back as soon as the page reaches it
  let raf = 0;
  let stopWatching = () => {};
  const navType = (performance.getEntriesByType?.("navigation")[0] as PerformanceNavigationTiming | undefined)?.type;
  const back = first ? navType === "reload" || navType === "back_forward" : pop;
  let saved = 0;
  try {
    saved = Number(window.sessionStorage.getItem(entryKey())) || 0;
  } catch {
    saved = 0;
  }
  if (back && saved > 0 && !window.location.hash) {
    let tries = 0;
    let held = 0;
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      stopWatching();
    };
    stopWatching = onVisitorScroll(stop);
    const attempt = () => {
      raf = 0;
      const room = document.documentElement.scrollHeight - viewportHeight();
      jumpTo(Math.min(saved, room));
      // (until it's tall enough, then held a few frames while the sections settle their sizes)
      tries += 1;
      if (room >= saved - 1) held += 1;
      if (held ? held < 4 : tries < 120) raf = requestAnimationFrame(attempt);
      else stop();
    };
    raf = requestAnimationFrame(attempt);
  }

  return () => {
    window.removeEventListener("scroll", note);
    window.removeEventListener("click", flush, { capture: true });
    window.removeEventListener("pagehide", flush);
    document.removeEventListener("visibilitychange", onHidden);
    flush();
    cancelAnimationFrame(raf);
    stopWatching();
    // (the next page's entry, by now the current one, scrolls the browser's way)
    history.scrollRestoration = "auto";
  };
};

/**
 * The landing keeps its place when the screen changes width: a phone turned
 * on its side (or back), a tablet's split view, a resized window. The
 * sections re-lay out for the new screen (Boost Sales pins or stacks, the
 * pinned tracks are as long as the screen is tall), so the same scroll
 * position would land in another section. When the width changes, the
 * section that was at the screen's middle and how far through it are taken
 * from the page as it stood before, and the page is put back there (a few
 * times, while the sections settle into their new layout), unless the
 * visitor scrolls first. A change of height alone (a phone's browser bar)
 * changes nothing.
 *
 * Nothing is measured while the page scrolls: the sections' places are
 * measured when their sizes change (a ResizeObserver), and the scroll is read
 * once it pauses; a scroll only arms a timer.
 */
export const setupKeepPlaceOnResize = (): (() => void) => {
  const root = document.documentElement;
  const page = document.querySelector(".bzl");
  const blocks = () =>
    Array.from(document.querySelectorAll(".bzl section, .bzl footer")).filter(
      (el) => !el.parentElement?.closest(".bzl section, .bzl footer"),
    );
  // the page as it stood: the sections' places in it (page px), the screen, the scroll
  let geo: { tops: number[]; heights: number[]; w: number; vh: number } | null = null;
  let y = window.scrollY;
  // (the section by its place in the page: a section can swap its element for the new layout, as Boost Sales does)
  let anchor: { i: number; f: number } | null = null;
  let timer = 0;
  let timers: number[] = [];
  let busy = false;
  let stopWatching = () => {};

  const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => measure());
  let watched: Element[] = [];
  function measure() {
    if (busy) return;
    const all = blocks();
    if (observer && (all.length !== watched.length || all.some((el, i) => el !== watched[i]))) {
      watched.forEach((el) => observer.unobserve(el));
      all.forEach((el) => observer.observe(el));
      watched = all;
    }
    y = window.scrollY;
    const boxes = all.map((el) => el.getBoundingClientRect());
    geo = {
      tops: boxes.map((r) => r.top + y),
      heights: boxes.map((r) => r.height),
      w: root.clientWidth,
      vh: viewportHeight(),
    };
  }
  const put = () => {
    const el = anchor && blocks()[anchor.i];
    if (!anchor || !el) return;
    const r = el.getBoundingClientRect();
    jumpTo(window.scrollY + r.top + anchor.f * r.height - viewportHeight() / 2);
  };
  const settle = () => {
    timers.forEach((t) => window.clearTimeout(t));
    timers = [];
    busy = false;
    stopWatching();
    measure();
  };
  const onScroll = () => {
    if (!timer)
      timer = window.setTimeout(() => {
        timer = 0;
        if (!busy) y = window.scrollY;
      }, 150);
  };
  const onResize = () => {
    if (busy) {
      // turning on: the place taken when it started stands
      timers.forEach((t) => window.clearTimeout(t));
    } else {
      if (!geo || geo.w === root.clientWidth) return;
      // the section at the middle of the screen as it was, and how far through it
      const mid = y + geo.vh / 2;
      const i = geo.tops.findIndex((top, k) => geo!.heights[k] > 0 && top <= mid && top + geo!.heights[k] > mid);
      if (i < 0) return;
      anchor = { i, f: (mid - geo.tops[i]) / geo.heights[i] };
      busy = true;
      stopWatching = onVisitorScroll(settle);
    }
    // now, then as the sections re-render for the new screen and settle their sizes
    put();
    timers = [16, 120, 300, 600].map((ms, k, all) =>
      window.setTimeout(() => {
        put();
        if (k === all.length - 1) settle();
      }, ms),
    );
  };

  measure();
  // (the page itself too: the footer mounts a moment after the sections)
  if (page) observer?.observe(page);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
    observer?.disconnect();
    window.clearTimeout(timer);
    timers.forEach((t) => window.clearTimeout(t));
    stopWatching();
  };
};
