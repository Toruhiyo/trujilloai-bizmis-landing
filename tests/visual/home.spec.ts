import type { Page } from "playwright/test";
import { en } from "../../src/i18n/messages/en";
import {
  expect,
  expectNoHorizontalOverflow,
  expectOneH1,
  expectPrerenderMatches,
  open,
  pageText,
  scrollToY,
  shot,
  test,
} from "./support";

/**
 * The landing ("/", and the Spanish and French home pages), walked top to
 * bottom through the states that matter in each scroll-driven section: each
 * Boost Sales beat on its hold (its fix shown), the payoff, Customer Support
 * and Store Insights midway and on their final state, Setup midway and at its
 * end, Customize, the end card and the footer. Where a section pins (a tall
 * track with a sticky screen) the scroll goes to a place on its track, the
 * way the section itself measures it (sales/hooks usePinProgress); where it
 * stacks (phones on their side), to a place in its own way through the screen.
 */

type Place = { y: number; pin?: string } | null;
type State = { name: string; at: (page: Page) => Promise<Place> };

/** The scroll that puts a pinned track at `progress` (0 → 1), as usePinProgress reads it; null if it doesn't pin here. */
const onTrack = (selector: string, progress: number) => (page: Page) =>
  page.evaluate(
    ([selector, progress]) => {
      const track = document.querySelector<HTMLElement>(selector);
      const pin = track?.firstElementChild as HTMLElement | null;
      if (!track || !pin || getComputedStyle(pin).position !== "sticky") return null;
      const r = track.getBoundingClientRect();
      const travel = r.height - pin.offsetHeight;
      if (travel <= 0) return null;
      const top = parseFloat(getComputedStyle(pin).top) || 0;
      return { y: r.top + scrollY - top + progress * travel, pin: selector };
    },
    [selector, progress] as const,
  );

/** The scroll that puts an element at `p` of its way through the screen, as sales/hooks useScrollThrough reads it. */
const through = (selector: string, index: number, from: number, to: number, p: number) => (page: Page) =>
  page.evaluate(
    ([selector, index, from, to, p]) => {
      const el = document.querySelectorAll<HTMLElement>(selector)[index];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const vh = innerHeight;
      // top on screen for p: a = top - vh*from, b = bottom - vh*to, p = -a / (b - a)
      const topOnScreen = vh * from - p * (r.height - vh * (to - from));
      return { y: r.top + scrollY - topOnScreen };
    },
    [selector, index, from, to, p] as const,
  );

/** An element's top at the top of the screen. */
const topOf = (selector: string) => (page: Page) =>
  page.evaluate((selector) => {
    const el = document.querySelector(selector);
    return el ? { y: el.getBoundingClientRect().top + scrollY } : null;
  }, selector);

/** Where a section is `part` (0 → 1) of the way from its top on screen to its bottom on screen (a section that doesn't pin). */
const along = (selector: string, part: number) => (page: Page) =>
  page.evaluate(
    ([selector, part]) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const top = r.top + scrollY;
      return { y: top + part * Math.max(0, r.height - innerHeight) };
    },
    [selector, part] as const,
  );

/** The first of these that applies here. */
const first = (...ways: ((page: Page) => Promise<Place>)[]) => async (page: Page) => {
  for (const way of ways) {
    const place = await way(page);
    if (place) return place;
  }
  return null;
};

// Boost Sales (sales/SalesSpine): three beats of one stretch each, then the payoff's 1.5; a beat's
// timeline runs from 3.5% to 67.5% of its stretch and then holds its fixed state.
const SALES_SPAN = 4.5;
const beat = (i: number) =>
  first(onTrack(".sl-g2-track", (i + 0.85) / SALES_SPAN), through(".sl-g2-item", i, 0.8, 0.75, 0.85));

const STATES: State[] = [
  { name: "01-hero", at: async () => ({ y: 0 }) },
  { name: "02-sales-opener", at: topOf("#benefits") },
  { name: "03-sales-match-needs", at: beat(0) },
  { name: "04-sales-clear-doubts", at: beat(1) },
  { name: "05-sales-win-sales", at: beat(2) },
  { name: "06-sales-payoff", at: first(onTrack(".sl-g2-track", 0.995), through(".sl-g2-item", 3, 0.8, 0.85, 0.9)) },
  { name: "07-support-opener", at: topOf(".p-support") },
  { name: "08-support-mid", at: first(onTrack(".p-support .bzp-track", 0.45), along(".p-support", 0.5)) },
  { name: "09-support-end", at: first(onTrack(".p-support .bzp-track", 0.97), along(".p-support", 1)) },
  { name: "10-insights-opener", at: topOf(".p-insights") },
  { name: "11-insights-mid", at: first(onTrack(".p-insights .bzp-track", 0.45), along(".p-insights", 0.5)) },
  { name: "12-insights-end", at: first(onTrack(".p-insights .bzp-track", 0.97), along(".p-insights", 1)) },
  { name: "13-setup-mid", at: first(onTrack("#setup", 0.45), along("#setup", 0.5)) },
  { name: "14-setup-end", at: first(onTrack("#setup", 0.97), along("#setup", 1)) },
  { name: "15-customize", at: topOf(".bzl-customize") },
  { name: "16-end-card", at: topOf(".bzl-endcard") },
  { name: "17-footer", at: async (page) => ({ y: await page.evaluate(() => document.scrollingElement!.scrollHeight) }) },
];

/**
 * The scroll-driven scenes' shots: under heavy load a scene's clock can land a frame apart from the
 * baseline's (Setup measures its wires after a CSS transition, which runs in real time), which moves
 * up to ~400 pixels of a drawing. 1000 visibly changed pixels (a 32x32 patch) still fail them: a cut
 * glow, a mockup spilling out or a missing piece is far more. Everything else allows 250.
 */
const ANIMATED = /sales-(match|clear|win|payoff)|support-(mid|end)|insights-(mid|end)|setup-(mid|end)/;
const ANIMATED_MAX_DIFF = 1000;

/** The other languages' home pages: the states whose copy differs most, on a desktop and a phone. */
const LOCALE_STATES = new Set(["01-hero", "03-sales-match-needs", "06-sales-payoff", "09-support-end", "12-insights-end", "14-setup-end", "15-customize", "16-end-card"]);
const LOCALE_PROJECTS = new Set(["desktop-1440x900", "phone-390x844"]);

/** A pinned screen fits the viewport: on screen whole, and its content not running past it. */
const expectPinFits = async (page: Page, selector: string, where: string) => {
  const fit = await page.evaluate((selector) => {
    const pin = document.querySelector(selector)?.firstElementChild as HTMLElement;
    const r = pin.getBoundingClientRect();
    return {
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      vh: innerHeight,
      overflow: pin.scrollHeight - pin.clientHeight,
    };
  }, selector);
  expect.soft(fit.top, `${where}: pinned screen starts on screen`).toBeGreaterThanOrEqual(-1);
  expect.soft(fit.bottom, `${where}: pinned screen ends on screen`).toBeLessThanOrEqual(fit.vh + 1);
  expect.soft(fit.overflow, `${where}: pinned screen's content fits in it`).toBeLessThanOrEqual(1);
};

for (const [prefix, label] of [["", "en"], ["/es", "es"], ["/fr", "fr"]] as const) {
  test(`home ${label}`, async ({ frozen: page }, info) => {
    const path = prefix || "/";
    if (prefix) test.skip(!LOCALE_PROJECTS.has(info.project.name), "other languages: desktop and phone only");

    const response = await open(page, path);
    expect(response?.status(), "status").toBe(200);
    await expectOneH1(page);

    if (!prefix) {
      const text = await pageText(page);
      for (const key of [
        `${en.hero.titleLine1} ${en.hero.titleLine2}`,
        en.benefits.sales.badge,
        en.benefits.support.badge,
        en.benefits.insights.badge,
      ]) {
        expect.soft(text, "key text on the page").toContain(key);
      }
    }
    if (info.project.name === "desktop-1440x900") await expectPrerenderMatches(page, path);

    for (const state of STATES) {
      if (prefix && !LOCALE_STATES.has(state.name)) continue;
      const place = await state.at(page);
      expect.soft(place, `${state.name}: the section is on the page`).not.toBeNull();
      if (!place) continue;
      await scrollToY(page, place.y);
      await expectNoHorizontalOverflow(page, state.name);
      if (place.pin) await expectPinFits(page, place.pin, state.name);
      await shot(page, `${label}-${state.name}.png`, ANIMATED.test(state.name) ? { maxDiffPixels: ANIMATED_MAX_DIFF } : {});
    }
  });
}
