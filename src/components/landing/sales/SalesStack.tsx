import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import FunnelScale from "./funnel/FunnelScale";
import { useReducedMotion } from "./hooks";
import SalesPayoff from "./SalesPayoff";
import { SalesShell, useBeat } from "./SalesShell";
import { Device, PanelCopy, Sentinel } from "./shared";

/**
 * Grouping 4, "stacking cards" (?grp=4): each part is one big card (its
 * words, its funnel stage, its device) that slides up over the one before
 * and sticks, the earlier cards settling back under it like a deck (their
 * tops peeking above). The card on top plays its beat (device and funnel
 * on one clock); the deck ends on the payoff card, the whole funnel fixed.
 * A card taller than the screen (phones) sticks by its bottom instead, so
 * all of it is read before the next one covers it.
 */
const CARDS = 4;
/** How much of each earlier card's top peeks above the next (px). */
const PEEK = 14;

const SalesStack = () => {
  const s = useMessages().landing.sales;
  const reduced = useReducedMotion();
  const refs = useRef<(HTMLElement | null)[]>([]);
  const probe = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [tops, setTops] = useState<(number | null)[]>(Array(CARDS).fill(null));
  const [cover, setCover] = useState<number[]>(Array(CARDS).fill(0));
  const setRef = useCallback((i: number) => (el: HTMLElement | null) => void (refs.current[i] = el), []);
  const beats = [useBeat(0, active === 0), useBeat(1, active === 1), useBeat(2, active === 2)];

  useEffect(() => {
    let frame = 0;
    /** Each card's sticky top: under the bar, a step lower per card; a card taller than the room sticks by its bottom. */
    const fit = () => {
      const vh = window.innerHeight;
      const base = probe.current ? parseFloat(getComputedStyle(probe.current).top) || 0 : 0;
      const next = refs.current.map((el, i) => {
        if (!el) return null;
        const t = base + i * PEEK;
        const h = el.offsetHeight;
        return Math.round(t + h > vh - 12 ? Math.min(t, vh - h - 16) : t);
      });
      setTops((prev) => (next.every((v, i) => v === prev[i]) ? prev : next));
    };
    const check = () => {
      frame = 0;
      fit();
      const vh = window.innerHeight;
      const r = refs.current.map((el) => el?.getBoundingClientRect());
      let a = 0;
      r.forEach((b, i) => {
        if (b && b.top < vh * 0.5) a = i;
      });
      setActive(a);
      // how far the next card has come over each one: 0 (just entering) → 1 (stuck on top of it)
      const k = r.map((_, i) => {
        const nb = r[i + 1];
        const el = refs.current[i + 1];
        if (!nb || !el) return 0;
        const top = parseFloat(el.style.top) || 0;
        return Math.min(1, Math.max(0, (vh - nb.top) / Math.max(1, vh - top)));
      });
      setCover((prev) => (k.every((v, i) => Math.abs(v - prev[i]) < 0.004) ? prev : k));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    const onResize = () => {
      fit();
      onScroll();
    };
    fit();
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    refs.current.forEach((el) => el && ro?.observe(el));
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const cardStyle = (i: number) =>
    ({
      "--i": i,
      zIndex: i + 1,
      top: tops[i] ?? undefined,
      "--cover": reduced ? 0 : cover[i],
    }) as CSSProperties;

  return (
    <SalesShell lit={active >= 3 ? "all" : active} className="sl-g4">
      <div className="bzl-wrap sl-g4-deck">
        <span ref={probe} className="sl-g4-probe" aria-hidden="true" />
        {[0, 1, 2].map((i) => (
          <article
            key={i}
            ref={setRef(i)}
            className={cn("sl-g4-card", `is-${i}`, active === i && "is-on")}
            style={cardStyle(i)}
          >
            <div className="sl-g4-inner">
              <Sentinel ref={beats[i].sentinel} off={beats[i].off} />
              <div className="sl-g4-side">
                <PanelCopy index={i} kicker={s.stages[i]} title={s.panels[i].title} body={s.panels[i].body} className="sl-g4-copy" />
                <FunnelScale
                  focus={i}
                  t={beats[i].t}
                  duration={beats[i].duration}
                  fixAt={beats[i].fixAt}
                  className="sl-g4-fn"
                />
              </div>
              <div className="sl-g4-dev">
                <Device index={i} clock={beats[i]} active={active === i} />
              </div>
            </div>
          </article>
        ))}
        <article
          ref={setRef(3)}
          className={cn("sl-g4-card is-payoff", active === 3 && "is-on")}
          style={cardStyle(3)}
        >
          <div className="sl-g4-inner">
            <PanelCopy kicker={s.payoff.kicker} title={s.payoff.title} body={s.payoff.body} className="sl-g4-copy" />
            <SalesPayoff play={active === 3} className="sl-g4-pay" />
          </div>
        </article>
      </div>
    </SalesShell>
  );
};

export default SalesStack;
