import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { TrendIcon } from "../AnimatedIcons";
import PillarChip from "../PillarChip";
import { useActivePanel } from "./hooks";
import SalesPulse from "./SalesPulse";
import SalesTitle, { SalesHeading } from "./SalesTitle";
import { Device, PanelCopy } from "./shared";

/**
 * Variant B, "the spotlight": centred and calm. It opens on the feeling (the
 * day's sales surging), then the title pins itself in a frosted bar under the
 * nav, one line, with a marker swiping under the part being shown. Each
 * moment is a wide white stage: its number, title and line across the top,
 * the device big and centred below.
 */
const SalesB = () => {
  const m = useMessages();
  const s = m.landing.sales;
  const { active, setRef } = useActivePanel(0.55);
  // the opener reads the whole line; each stage lights its own part
  const lit = active === 0 ? "all" : active - 1;

  return (
    <section id="benefits" className="sl sl-b bzl-band bzl-pillar p-sales">
      <SalesHeading />
      <div className="bzl-wrap flex justify-center pt-[clamp(4rem,9vw,7rem)]">
        <PillarChip icon={TrendIcon} label={m.benefits.sales.badge} />
      </div>

      <div className="sl-b-bar">
        <div className="bzl-wrap">
          <SalesTitle active={lit} layout="line" as="p" />
          <div className="sl-b-steps" aria-hidden="true">
            {s.titleParts.map((part, i) => (
              <span
                key={part}
                className={cn("sl-b-step", (lit === "all" || lit >= i) && "is-on")}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bzl-wrap">
        <div ref={setRef(0)} className="sl-b-opener">
          <SalesPulse />
        </div>
        <div className="sl-b-stages">
          {s.panels.map((p, i) => (
            <article key={p.title} ref={setRef(i + 1)} className="sl-b-stage">
              <PanelCopy index={i} title={p.title} body={p.body} className="sl-b-copy" />
              <Device index={i} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SalesB;
