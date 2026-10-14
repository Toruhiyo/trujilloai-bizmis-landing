import { useEffect, useState } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { HeadsetIcon, IdeaIcon, PlugIcon, ShirtIcon, TrendIcon } from "../AnimatedIcons";

/**
 * Opener approach 3, "side index": a slim progress index fixed to the left
 * edge (desktop), one dot per section; the current one grows into its icon
 * and its name shows beside it (all names show on hover), so you always know
 * where you are. It appears once the hero is passed and leaves at the end
 * card. A dot scrolls to its section. openers.css styles it (.sx-*).
 */
const SideIndex = () => {
  const m = useMessages();
  const items = [
    { Icon: TrendIcon, label: m.benefits.sales.badge, sel: ".p-sales" },
    { Icon: HeadsetIcon, label: m.benefits.support.badge, sel: ".p-support" },
    { Icon: IdeaIcon, label: m.benefits.insights.badge, sel: ".p-insights" },
    { Icon: PlugIcon, label: m.landing.setup.title, sel: "#setup" },
    { Icon: ShirtIcon, label: m.customization.badge, sel: "#setup + section" },
  ];
  const [state, setState] = useState({ active: -1, shown: false });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let active = -1;
      items.forEach((it, i) => {
        const el = document.querySelector(it.sel);
        if (el && el.getBoundingClientRect().top <= line) active = i;
      });
      const last = document.querySelector(items[items.length - 1].sel);
      const shown = active >= 0 && !!last && last.getBoundingClientRect().bottom > line;
      setState((p) => (p.active === active && p.shown === shown ? p : { active, shown }));
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
    // the sections are static
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (sel: string) => {
    const el = document.querySelector<HTMLElement>(sel);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "smooth" });
  };

  return (
    <nav className={cn("sx", state.shown && "is-shown")} aria-label={items.map((x) => x.label).join(", ")}>
      <ol className="sx-list">
        {items.map(({ Icon, label, sel }, i) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => go(sel)}
              aria-current={state.active === i ? "true" : undefined}
              className={cn("sx-item", state.active === i && "is-on", state.active > i && "is-done")}
            >
              <span className="sx-dot" aria-hidden="true">
                <Icon />
              </span>
              <span className="sx-label">{label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default SideIndex;
