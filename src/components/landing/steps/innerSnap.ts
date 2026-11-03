import { useEffect } from "react";
import type { RefObject } from "react";
import { useScrollSteps } from "@/lib/scrollSteps";
import { useReducedMotion } from "../sales/hooks";
import { settlePageBy } from "./settleSnap";

/** A smaller swipe isn't handed on to the page (px). */
const HAND_ON = 40;
/** A scroll counts as settled after this long without moving (ms), where `scrollend` isn't there. */
const SETTLE = 140;

/**
 * The page's touch snap (steps/settleSnap) for a box that scrolls inside it
 * (Store Insights' replay transcript), item by item: once a swipe in it has
 * settled, it eases onto the nearest item's top the way it went (within half
 * its height, else the nearest), or onto either end. A swipe that pushed it
 * against an end, with finger travel left over, hands that on to the page
 * (which then settles as after its own swipe), so there's no dead stretch
 * where a swipe moves nothing. Touch screens only (lib/scrollSteps), never
 * with reduced motion; nothing listens to a wheel or the box being scrolled
 * by its own playback.
 */
export const useInnerSnap = (ref: RefObject<HTMLElement | null>) => {
  const flags = useScrollSteps();
  const reduced = useReducedMotion();
  const on = flags.snap && !reduced;
  useEffect(() => {
    const el = ref.current;
    if (!on || !el) return;
    let startTop = 0;
    let startPage = 0;
    let fingerFrom = 0;
    let fingerAt = 0;
    let touching = false;
    let pending = false;
    let easing = false;
    let timer = 0;
    let raf = 0;

    const max = () => Math.max(0, el.scrollHeight - el.clientHeight);
    const stops = () => {
      const top = max();
      const pad = parseFloat(getComputedStyle(el).paddingTop) || 0;
      const list = [...el.children].map((c) => Math.round(Math.min(top, Math.max(0, (c as HTMLElement).offsetTop - pad))));
      return [...new Set([0, top, ...list])].sort((a, b) => a - b);
    };
    const cancel = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      easing = false;
      window.clearTimeout(timer);
    };
    const ease = (to: number) => {
      const from = el.scrollTop;
      const dist = to - from;
      if (Math.abs(dist) < 2) return;
      const dur = Math.min(520, 200 + Math.abs(dist) * 0.5);
      const t0 = performance.now();
      easing = true;
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        el.scrollTop = from + dist * (1 - (1 - k) ** 3);
        if (k < 1) raf = requestAnimationFrame(step);
        else {
          raf = 0;
          requestAnimationFrame(() => (easing = false));
        }
      };
      raf = requestAnimationFrame(step);
    };
    const settle = () => {
      window.clearTimeout(timer);
      if (!pending || touching || easing) return;
      pending = false;
      const end = el.scrollTop;
      const delta = end - startTop;
      if (Math.abs(delta) < 6 || max() <= 1) return;
      const dir = Math.sign(delta);
      const all = stops();
      const ahead = dir > 0 ? all.find((s) => s >= end) : [...all].reverse().find((s) => s <= end);
      const near = all.reduce((a, b) => (Math.abs(b - end) < Math.abs(a - end) ? b : a));
      ease(ahead !== undefined && Math.abs(ahead - end) <= el.clientHeight * 0.5 ? ahead : near);
    };

    const onStart = (e: TouchEvent) => {
      cancel();
      touching = true;
      pending = false;
      startTop = el.scrollTop;
      startPage = window.scrollY;
      fingerFrom = fingerAt = e.touches[0]?.clientY ?? 0;
    };
    const onMove = (e: TouchEvent) => {
      fingerAt = e.touches[0]?.clientY ?? fingerAt;
    };
    const onEnd = () => {
      touching = false;
      const pushed = fingerFrom - fingerAt;
      const moved = el.scrollTop - startTop;
      const dir = Math.sign(pushed);
      const atEnd = dir > 0 ? el.scrollTop >= max() - 1 : dir < 0 && el.scrollTop <= 1;
      const left = pushed - moved;
      // pushed against an end with travel to spare, and the page didn't take it: the page moves on
      if (atEnd && Math.abs(left) >= HAND_ON && Math.sign(left) === dir && Math.abs(window.scrollY - startPage) < 2) {
        settlePageBy(left);
      }
      pending = true;
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, SETTLE);
    };
    const onScroll = () => {
      if (easing || touching || !pending) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, SETTLE);
    };
    const opts = { passive: true } as const;
    el.addEventListener("touchstart", onStart, opts);
    el.addEventListener("touchmove", onMove, opts);
    el.addEventListener("touchend", onEnd, opts);
    el.addEventListener("touchcancel", onEnd, opts);
    el.addEventListener("scroll", onScroll, opts);
    el.addEventListener("scrollend", settle);
    el.addEventListener("wheel", cancel, opts);
    return () => {
      cancel();
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", settle);
      el.removeEventListener("wheel", cancel);
    };
  }, [on, ref]);
};
