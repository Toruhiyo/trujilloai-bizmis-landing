import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { HeadsetIcon, IdeaIcon, TrendIcon } from "../AnimatedIcons";

/**
 * Opener system 6, "one pillar strip": the three benefits (Sales, Support,
 * Insights) under ONE sticky segmented header, "Boost Sales | Customer
 * Support | Store Insights". The segment of the benefit being read is lit,
 * with a primary bar filling as you read through it; the sections are told
 * apart by the header changing state rather than by full-screen openers. A
 * segment scrolls to its benefit. The strip lives only over the three
 * benefits (it's sticky inside this wrapper), and its height replaces the
 * pillars' own docked bars (openers.css).
 */
const PillarStrip = ({ children }: { children: ReactNode }) => {
  const m = useMessages();
  const items = [
    { label: m.benefits.sales.badge, Icon: TrendIcon },
    { label: m.benefits.support.badge, Icon: HeadsetIcon },
    { label: m.benefits.insights.badge, Icon: IdeaIcon },
  ];
  const wrap = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ active: 0, fill: [0, 0, 0] });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const w = wrap.current;
      const s = strip.current;
      if (!w || !s) return;
      w.style.setProperty("--op-strip-h", `${s.offsetHeight}px`);
      const line = s.getBoundingClientRect().bottom;
      const sections = Array.from(w.querySelectorAll<HTMLElement>(":scope > section"));
      let active = 0;
      const fill = sections.map((sec, i) => {
        const r = sec.getBoundingClientRect();
        if (r.top <= line + 1) active = i;
        return Math.min(1, Math.max(0, (line - r.top) / Math.max(1, r.height - (window.innerHeight - line))));
      });
      setState((p) =>
        p.active === active && p.fill.every((v, i) => Math.abs(v - (fill[i] ?? 0)) < 0.004)
          ? p
          : { active, fill: [fill[0] ?? 0, fill[1] ?? 0, fill[2] ?? 0] },
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const go = (i: number) => {
    const sec = wrap.current?.querySelectorAll<HTMLElement>(":scope > section")[i];
    if (!sec) return;
    const top = sec.getBoundingClientRect().top + window.scrollY - (strip.current?.getBoundingClientRect().bottom ?? 0) + 2;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div ref={wrap} className="op-pillars">
      <div ref={strip} className="op-strip">
        <nav className="op-strip-inner" aria-label={items.map((x) => x.label).join(", ")}>
          {items.map(({ label, Icon }, i) => (
            <button
              key={label}
              type="button"
              onClick={() => go(i)}
              aria-current={state.active === i ? "true" : undefined}
              className={cn("op-seg", state.active === i && "is-on", state.active > i && "is-done")}
            >
              <span className="op-seg-icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="op-seg-label">{label}</span>
              <span className="op-seg-bar" aria-hidden="true" style={{ transform: `scaleX(${state.fill[i].toFixed(3)})` }} />
            </button>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
};

export default PillarStrip;
