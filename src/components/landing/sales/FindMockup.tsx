import type { CSSProperties } from "react";
import { Search } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import BizmisWidget, { Captions, NavBanner, SentMessage } from "../BizmisWidget";
import { CLAY, TINT } from "../clay";
import type { ClayShape } from "../clay";
import { BrowserFrame } from "../devices";
import { STORE_URL } from "../visuals";
import { useBeats, useOnScreen } from "./hooks";

/** idle, the shopper asks, the agent searches, the catalog narrows to three. */
const BEATS = [1300, 1700, 2100, 5200];

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
/** The three that fit the shopper's ask, best first. */
const PICKS = [6, 2, 13];

// Layout on the 1180 pt page: the grid, left of the widget card.
const X0 = 40;
const Y0 = 96;
const COLS = 5;
const TILE = 140;
const GAP_X = 18;
const ROW_H = TILE + 40;
const GRID_W = COLS * TILE + (COLS - 1) * GAP_X;
const PICK = 244;
const PICK_GAP = (GRID_W - 3 * PICK) / 2;

/**
 * "They find it", on a desktop store: the shopper asks the Bizmis widget out
 * loud, the agent searches the catalog (its search tool on the laser, the
 * "Taking you to" banner), and fifteen products narrow down to three
 * candidates, the best one picked. The agent wears the Bizmis outfit (the
 * live 3D avatar, with its render as the fallback).
 */
const FindMockup = ({ play }: { play?: boolean }) => {
  const m = useMessages();
  const s = m.landing.sales;
  const [ref, onScreen] = useOnScreen<HTMLDivElement>(0.4);
  const beat = useBeats(BEATS, play ?? onScreen);
  const asked = beat >= 1;
  const working = beat === 2;
  const narrowed = beat === 3;

  return (
    <div ref={ref} className="sl-find">
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

        {/* the catalog: a grid that narrows to the agent's three picks */}
        <div aria-hidden="true" className="absolute inset-0 top-[64px]">
          <div
            className={cn(
              "sl-find-heading absolute flex items-center gap-3 transition-opacity duration-500",
              narrowed ? "opacity-100" : "opacity-0",
            )}
            style={{ left: X0, top: 34 }}
          >
            <span className="bzl-tile-line h-3.5 w-40" />
            <span className="rounded-full bg-[var(--bzl-orange-wash)] px-2.5 py-0.5 text-xs font-semibold text-[var(--bzl-orange-dark)]">
              3
            </span>
          </div>
          {CATALOG.map(([shape, tint], i) => {
            const slot = PICKS.indexOf(i);
            const kept = slot >= 0;
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const grid = {
              left: X0 + col * (TILE + GAP_X),
              top: Y0 - 54 + row * ROW_H,
              width: TILE,
            };
            const picked = {
              left: X0 + slot * (PICK + PICK_GAP),
              top: Y0 + 24,
              width: PICK,
            };
            const pos = narrowed && kept ? picked : grid;
            return (
              <div
                key={i}
                className={cn(
                  "sl-find-item absolute",
                  working && "is-scan",
                  narrowed && !kept && "is-out",
                  narrowed && slot === 0 && "is-best",
                )}
                style={
                  {
                    ...pos,
                    "--i": i,
                    "--slot": Math.max(slot, 0),
                  } as CSSProperties
                }
              >
                <div
                  className="sl-find-tile bzl-tile"
                  style={{ background: TINT[tint] }}
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

        {/* the agent's words, as the widget's captions at the page's foot */}
        {narrowed && (
          <div className="absolute bottom-6 left-0 flex w-[856px] justify-center">
            <Captions text={s.findCaption} className="text-base" />
          </div>
        )}

        <div className="absolute bottom-6 right-6 z-10">
          <BizmisWidget
            agent="greet-amber"
            live="amber"
            state={working ? "working" : narrowed ? "speaking" : "idle"}
            tool={Search}
            placeholder={m.landing.widget.placeholder}
            above={
              asked && !narrowed ? (
                <>
                  <SentMessage text={s.findQuery} />
                  {working && (
                    <NavBanner
                      heading={m.landing.widget.takingYouTo}
                      target={m.landing.widget.searchResults}
                    />
                  )}
                </>
              ) : undefined
            }
          />
        </div>
      </BrowserFrame>
    </div>
  );
};

export default FindMockup;
