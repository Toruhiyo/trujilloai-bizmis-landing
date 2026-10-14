import type { CSSProperties } from "react";
import { Search } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { span, typed } from "../useRewindLoop";
import BizmisWidget, { Captions, MobileWidget, NavBanner, SentMessage, captionLength } from "../BizmisWidget";
import { CLAY, TINT } from "../clay";
import type { ClayShape } from "../clay";
import { BrowserFrame, PhoneFrame } from "../devices";
import { STORE_URL } from "../visuals";
import type { Messages } from "@/i18n/messages/en";
import { bump, easeInOut, useMedia, useScene } from "./hooks";
import { Sentinel } from "./shared";
import type { MockupProps } from "./shared";

/** The store's catalog: fifteen clay products (shape, tile tint). */
const CATALOG: [ClayShape, keyof typeof TINT][] = [
  ["capsule", "sage"],
  ["cube", "warm"],
  ["torus", "blush"],
  ["cone", "stone"],
  ["egg", "sand"],
  ["cylinder", "stone"],
  ["sphere", "sand"],
  ["slab", "sage"],
  ["dome", "warm"],
  ["box", "blush"],
  ["lens", "stone"],
  ["frustum", "warm"],
  ["sphere", "blush"],
  ["capsule", "stone"],
  ["torus", "sand"],
];

type Box = { left: number; top: number; width: number };
/** Where each product sits in the grid, and where the agent's picks land (best first). */
type Layout = { items: number[]; picks: number[]; grid: (n: number) => Box; pick: (slot: number) => Box; heading: { left: number; top: number } };

/** The 1180 pt desktop page: five columns, left of the widget. */
const DESKTOP: Layout = (() => {
  const X0 = 40;
  const Y0 = 42;
  const COLS = 5;
  const TILE = 130;
  const GAP = 18;
  const ROW = TILE + 40;
  const W = COLS * TILE + (COLS - 1) * GAP;
  const PICK = 226;
  const PGAP = (W - 3 * PICK) / 2;
  return {
    items: CATALOG.map((_, i) => i),
    picks: [6, 2, 13],
    grid: (n) => ({ left: X0 + (n % COLS) * (TILE + GAP), top: Y0 + Math.floor(n / COLS) * ROW, width: TILE }),
    pick: (k) => ({ left: X0 + k * (PICK + PGAP), top: 96, width: PICK }),
    heading: { left: X0, top: 40 },
  };
})();

/** The 390 pt phone page: two columns, the picks in a row on top. */
const PHONE: Layout = (() => {
  const TILE = 171;
  const PICK = 112;
  return {
    items: [6, 0, 2, 4, 13, 9],
    picks: [6, 2, 13],
    grid: (n) => ({ left: 16 + (n % 2) * (TILE + 16), top: 64 + Math.floor(n / 2) * (TILE + 40), width: TILE }),
    pick: (k) => ({ left: 16 + k * (PICK + 11), top: 102, width: PICK }),
    heading: { left: 16, top: 64 },
  };
})();

/** The scene's timeline (ms): typing, send, the search, the catalog narrowing, the answer. */
const T = { type: 450, send: 1650, work: 1950, narrow: 3700, speak: 4650 };
const MS_PER_WORD = 300;

/**
 * The scene's length, and when its funnel stage gets fixed: as the catalog
 * narrows to the three that fit (shared with the beat's funnel, one clock).
 */
export const findTimeline = (s: Messages["landing"]["sales"]) => ({
  duration: T.speak + captionLength(s.findCaption, MS_PER_WORD) + 500,
  fixAt: T.narrow + 300,
});

/**
 * "They find it", on a desktop store (a phone on small screens): the shopper
 * types their ask in the Bizmis widget's bar and sends it, the agent searches
 * the catalog (its search tool on the laser, the "Taking you to" banner),
 * fifteen products narrow down to three candidates with the best one picked,
 * and the agent says so out loud (captions). Everything follows the scene's
 * time `t` (its own useScene, or its beat's shared clock), so it rewinds as
 * it played. The agent wears the
 * Bizmis outfit (the live 3D avatar on desktop, its render as the fallback).
 */
const FindMockup = ({ play, clock }: MockupProps) => {
  const m = useMessages();
  const s = m.landing.sales;
  const phone = useMedia("(max-width: 639px)");
  const speakLen = captionLength(s.findCaption, MS_PER_WORD);
  // its own loop, unless its beat's clock drives it (with the funnel beside it)
  const own = useScene(findTimeline(s).duration, clock ? false : play);
  const t = clock ? clock.t : own.t;
  const sentinel = clock ? undefined : <Sentinel ref={own.sentinel} off={own.off} />;
  const L = phone ? PHONE : DESKTOP;

  const typing = t >= T.type - 200 && t < T.send;
  const draft = typing ? typed(s.findQuery, t, T.type, 30) : undefined;
  const press = span(t, T.send - 170, T.send + 60);
  const sent = span(t, T.send, T.narrow + 200);
  const working = t >= T.work && t < T.speak;
  const banner = t >= T.work + 150 && t < T.narrow + 150;
  const speaking = t >= T.speak;
  const heading = span(t, T.narrow + 700, T.narrow + 1000);
  const best = span(t, T.narrow + 1000, T.narrow + 1300);

  const above = (
    <>
      {sent > 0 && sent < 1 && <SentMessage text={s.findQuery} k={sent} />}
      {banner && (
        <NavBanner
          heading={m.landing.widget.takingYouTo}
          target={m.landing.widget.searchResults}
          progress={span(t, T.work + 150, T.narrow + 150)}
        />
      )}
    </>
  );
  const caption = speaking && (
    <Captions
      text={s.findCaption}
      at={t - T.speak}
      msPerWord={MS_PER_WORD}
      className={cn("sl-cap", phone ? "sl-cap-phone" : "sl-cap-find")}
    />
  );

  const catalog = (
    <div aria-hidden="true" className="absolute inset-0">
      <div
        className="absolute flex items-center gap-3"
        style={{ ...L.heading, opacity: heading }}
      >
        <span className="bzl-tile-line h-3.5 w-40" />
        <span className="rounded-full bg-[hsl(var(--primary))] px-2.5 py-0.5 text-xs font-semibold text-white">
          3
        </span>
      </div>
      {L.items.map((i, n) => {
        const [shape, tint] = CATALOG[i];
        const slot = L.picks.indexOf(i);
        const from = L.grid(n);
        let style: CSSProperties = from;
        if (slot >= 0) {
          const k = easeInOut(span(t, T.narrow + slot * 80, T.narrow + 900 + slot * 80));
          const to = L.pick(slot);
          style = {
            left: from.left + (to.left - from.left) * k,
            top: from.top + (to.top - from.top) * k,
            width: from.width + (to.width - from.width) * k,
          };
        } else {
          const o = span(t, T.narrow + n * 14, T.narrow + 320 + n * 14);
          style = { ...from, opacity: 1 - o, transform: `scale(${1 - 0.14 * o})` };
        }
        const scan = bump(t, T.work + 250 + n * (phone ? 160 : 75), 700);
        const ring = slot === 0 ? best : 0;
        return (
          <div key={i} className="absolute" style={style}>
            <div
              className="bzl-tile sl-find-tile"
              style={{
                background: TINT[tint],
                boxShadow:
                  ring > 0
                    ? `0 0 0 ${3 * ring}px hsl(var(--primary)), 0 22px 44px -18px hsl(var(--primary) / ${0.75 * ring})`
                    : scan > 0
                      ? `0 0 0 3px hsl(var(--primary) / ${0.6 * scan}), 0 12px 26px -12px hsl(var(--primary) / ${0.6 * scan})`
                      : undefined,
              }}
            >
              <img src={CLAY[shape]} alt="" loading="lazy" draggable={false} />
            </div>
            <div className="mt-2.5 space-y-1.5">
              <div className="bzl-tile-line w-3/4" />
              <div className="bzl-tile-line w-1/3" />
            </div>
          </div>
        );
      })}
    </div>
  );

  if (phone)
    return (
      <div className="sl-find relative">
        {sentinel}
        <PhoneFrame url={STORE_URL} className="w-full">
          <div
            aria-hidden="true"
            className="flex h-[48px] items-center gap-3 border-b border-[#f3ece4] px-4"
          >
            <span className="h-6 w-6 rounded-lg bg-[#e6dccf]" />
            <span className="bzl-tile-line h-3 w-20" />
            <span className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-[#f6f0e9] text-[#b5a797]">
              <Search className="h-4 w-4" />
            </span>
          </div>
          {catalog}
          <MobileWidget
            head="amber"
            speaking={speaking}
            working={working}
            placeholder={m.landing.widget.placeholder}
            draft={draft}
            press={press}
            above={
              <>
                {above}
                {caption && <div className="flex justify-center">{caption}</div>}
              </>
            }
          />
        </PhoneFrame>
      </div>
    );

  return (
    <div className="sl-find relative">
      {sentinel}
      <BrowserFrame url={STORE_URL}>
        {/* the store's own header */}
        <div
          aria-hidden="true"
          className="flex h-[64px] items-center gap-4 border-b border-[#f3ece4] px-10"
        >
          <span className="h-7 w-7 rounded-lg bg-[#e6dccf]" />
          <span className="bzl-tile-line h-3 w-24" />
          <span className="ml-10 flex gap-6">
            <span className="bzl-tile-line w-14" />
            <span className="bzl-tile-line w-12" />
            <span className="bzl-tile-line w-16" />
          </span>
          <span className="ml-auto flex h-9 w-56 items-center gap-2 rounded-full bg-[#f6f0e9] px-3 text-[#b5a797]">
            <Search className="h-4 w-4" />
            <span className="bzl-tile-line w-24" />
          </span>
        </div>

        <div className="absolute inset-0 top-[64px]">{catalog}</div>

        {/* the agent's words, as the widget's captions at the page's foot */}
        {caption && (
          <div className="absolute bottom-6 left-0 flex w-[800px] justify-center px-6">{caption}</div>
        )}

        <div className="sl-find-widget absolute bottom-6 right-6 z-10">
          <BizmisWidget
            agent="greet-amber"
            live="amber"
            state={working ? "working" : speaking ? "speaking" : "idle"}
            talking={speaking && t < T.speak + speakLen - 2 * MS_PER_WORD}
            tool={Search}
            placeholder={m.landing.widget.placeholder}
            draft={draft}
            press={press}
            above={above}
          />
        </div>
      </BrowserFrame>
    </div>
  );
};

export default FindMockup;
