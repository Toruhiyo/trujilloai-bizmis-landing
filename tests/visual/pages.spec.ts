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
  settle,
  shot,
  test,
} from "./support";

/**
 * The site's other pages: the first screen and the whole page (the long legal
 * texts: their first and last screens), on a desktop and a phone; pricing and
 * the 404 on every viewport.
 */

type PageCase = {
  name: string;
  path: string;
  status?: number;
  /** Long pages: the first and last screens instead of the whole page. */
  long?: boolean;
  /** Text the page must hold. */
  text?: string[];
  /** On every viewport, not only desktop and phone. */
  everywhere?: boolean;
  /** Errors this page is known to log (keep this list short, and say why). */
  knownErrors?: RegExp[];
  /** The number of h1 if it isn't one (only a frozen page that can't change). */
  h1?: number;
};

const PAGES: PageCase[] = [
  {
    name: "pricing",
    path: "/pricing",
    everywhere: true,
    text: [en.pricing.free.name, en.pricing.plans.starter.name, en.pricing.plans.growth.name, en.pricing.plans.scale.name, en.pricing.enterprise.name],
  },
  { name: "faqs", path: "/faqs" },
  { name: "early-access", path: "/early-access" },
  { name: "contact", path: "/contact" },
  { name: "privacy", path: "/privacy", long: true },
  { name: "terms", path: "/terms", long: true },
  {
    name: "not-found",
    path: "/this-page-does-not-exist",
    status: 404,
    everywhere: true,
    text: [en.notFound.headline],
    // the 404 itself: the document's status, and the page logging the missing route on purpose (NotFound.tsx)
    knownErrors: [/the server responded with a status of 404/, /404 Error: User attempted to access non-existent route/],
  },
  {
    name: "v1",
    path: "/v1",
    // The classic landing stays exactly as it was (no changes there): its react-xarrows arrows throw
    // on their SVG animations' endEvent (live on www.bizmis.ai/v1 too), and it has three h1.
    knownErrors: [/page error: Cannot read properties of null \(reading 'style'\)/],
    h1: 3,
  },
];

const BOTH = new Set(["desktop-1440x900", "phone-390x844"]);

/** Scrolls through the page once, so whatever reveals itself on the way in is shown, then back to the top. */
const walk = async (page: Page) => {
  const { height, vh } = await page.evaluate(() => ({ height: document.scrollingElement!.scrollHeight, vh: innerHeight }));
  for (let y = 0; y < height; y += vh * 0.8) await scrollToY(page, y);
  await scrollToY(page, height);
  await scrollToY(page, 0);
};

for (const c of PAGES) {
  test(`page ${c.name}`, async ({ frozen: page, problems }, info) => {
    test.skip(!c.everywhere && !BOTH.has(info.project.name), "desktop and phone only");
    problems.allow.push(...(c.knownErrors ?? []));

    const response = await open(page, c.path);
    expect(response?.status(), "status").toBe(c.status ?? 200);
    if (c.h1 === undefined) await expectOneH1(page);
    else expect.soft(await page.locator("h1").count(), "number of h1 (known)").toBe(c.h1);
    if (c.text) {
      const text = await pageText(page);
      for (const t of c.text) expect.soft(text, "key text on the page").toContain(t);
    }
    if (info.project.name === "desktop-1440x900") await expectPrerenderMatches(page, c.path);

    await walk(page);
    await expectNoHorizontalOverflow(page, "top");
    await shot(page, `${c.name}-top.png`);
    if (c.long) {
      await scrollToY(page, await page.evaluate(() => document.scrollingElement!.scrollHeight));
      await expectNoHorizontalOverflow(page, "bottom");
      await shot(page, `${c.name}-bottom.png`);
    } else {
      await settle(page);
      await shot(page, `${c.name}-full.png`, { fullPage: true });
    }
  });
}
