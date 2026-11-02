/**
 * True only under the visual regression suite (tests/visual), which sets
 * `window.__BIZMIS_VR__` before the app loads. The landing's ambient
 * real-time loops (useNow: the visits stream, the Sales bar's climb, the
 * Support clock, the Insights rays) then hold still on a fixed moment, so a
 * screenshot shows the same picture every run. Never set for visitors: one
 * property read at load, nothing else.
 */
export const VISUAL_TEST =
  typeof window !== "undefined" && (window as Window & { __BIZMIS_VR__?: boolean }).__BIZMIS_VR__ === true;

/** The moment (ms) the ambient loops hold on under the visual suite: well into the stream, so it's full. */
export const VISUAL_TEST_NOW = 20_000;
