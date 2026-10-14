import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { TrendIcon } from "../AnimatedIcons";
import PillarChip from "../PillarChip";
import { useActivePanel } from "./hooks";
import SalesPulse from "./SalesPulse";
import SalesTitle, { SalesHeading } from "./SalesTitle";
import { Device, PanelCopy } from "./shared";

/**
 * Variant A, "the rail": an editorial split. On the left, the title stands
 * stacked and sticky the whole way down, the part being shown lit, with that
 * moment's benefit under it. On the right, big devices scroll past, one per
 * moment, and then the payoff: the day's sales surging, every part lit.
 * On phones the title rides a slim sticky bar and each device gets its own
 * words.
 */
const SalesA = () => {
  const m = useMessages();
  const s = m.landing.sales;
  const { active, setRef } = useActivePanel();
  const lit = active >= 3 ? "all" : active;

  return (
    <section id="benefits" className="sl sl-a bzl-band bzl-pillar p-sales">
      <SalesHeading />
      {/* phones and tablets: the title on a slim sticky bar */}
      <div className="bzl-wrap lg:hidden">
        <PillarChip icon={TrendIcon} label={m.benefits.sales.badge} />
      </div>
      <div className="sl-bar lg:hidden">
        <div className="bzl-wrap">
          <SalesTitle active={lit} layout="line" as="p" />
        </div>
      </div>

      <div className="bzl-wrap sl-a-grid">
        <aside className="sl-a-rail hidden lg:flex">
          <PillarChip icon={TrendIcon} label={m.benefits.sales.badge} />
          <SalesTitle active={lit} layout="stack" as="p" className="mt-7" />
          <div className="sl-a-subs" aria-hidden="true">
            {s.panels.map((p, i) => (
              <PanelCopy
                key={p.title}
                as="p"
                title={p.title}
                body={p.body}
                className={cn("sl-a-sub", active === i && "is-on")}
              />
            ))}
          </div>
        </aside>

        <div className="sl-a-stage">
          {s.panels.map((p, i) => (
            <div key={p.title} ref={setRef(i)} className="sl-a-panel">
              {/* the words for screen readers and small screens (the rail shows them on desktop) */}
              <PanelCopy title={p.title} body={p.body} className="sl-a-panel-copy" />
              <Device index={i} />
            </div>
          ))}
          <div ref={setRef(3)} className="sl-a-panel is-payoff">
            <SalesPulse />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SalesA;
