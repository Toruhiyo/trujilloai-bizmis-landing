import { BookIcon, CareIcon, ClockIcon, HeadsetIcon } from "./AnimatedIcons";
import { useMessages } from "@/i18n/LocaleProvider";
import Reveal from "./Reveal";
import { ClayTile } from "./clay";
import FeatureCard from "./FeatureCard";
import BenefitIntro from "./pillar/BenefitIntro";
import { SupportRelief } from "./PillarMoments";
import SupportStore from "./support/SupportStore";

/**
 * The support moment: a store page with the real widget, cycling through the
 * classic landing's cases (one per loop, rewinding in between): the shopper
 * types the question in the widget's composer and sends it, the agent works
 * the store (tool on its laser), then answers out loud, with captions.
 */
const SupportChat = () => (
  <SupportStore agent="support-yusuke">
    <div className="grid grid-cols-[1fr_1fr] gap-5 p-5 pb-16 sm:p-7 sm:pb-20">
      <ClayTile shape="egg" tint="blush" />
      <div className="space-y-2.5 pt-1">
        <div className="bzl-tile-line w-4/5" />
        <div className="bzl-tile-line w-2/5" />
        <div className="h-4 w-14 rounded-md bg-[#d9d4cc]" />
        <div className="bzl-tile-line w-full" />
        <div className="bzl-tile-line w-3/4" />
        <div className="mt-3 h-8 rounded-xl bg-[color-mix(in_oklab,var(--bzl-fg)_85%,transparent)]" />
      </div>
    </div>
  </SupportStore>
);

/**
 * Customer Support: "Customer Support", huge, with its promise "Fewer
 * tickets. Happier customers." under it (BenefitIntro / PillarIntro), which
 * docks as the section's sticky bar as you scroll; then, under the bar, one
 * screen in two columns, mirrored from Insights (the demo on the left on
 * desktop):
 * - the stage: the store with the widget answering a shopper, and the
 *   support inbox emptying itself as its result, a card laid over the
 *   store's top corner (under it on phones), so the two read as cause and
 *   effect;
 * - beside it, one compact column: the lead, then the three capabilities as
 *   cards, centred on the stage.
 * On phones: the lead, the stage, the capabilities. Layout: .bzs-* in
 * film-landing.css.
 */
const CAPABILITY_ICONS = [ClockIcon, BookIcon, CareIcon];

const SupportSection = () => {
  const messages = useMessages();
  const s = messages.landing.support;
  const promise = `${s.title} ${s.titleTail}`;
  return (
    <section className="bzl-band bzl-pillar p-support bzp-section">
      <BenefitIntro icon={<HeadsetIcon />} name={messages.benefits.support.badge} promise={promise}>
        <div className="bzl-wrap">
          <div className="bzs-grid">
            <div className="bzs-stage">
              <Reveal delay={120} className="bzs-store">
                <SupportChat />
              </Reveal>
              <Reveal delay={260} className="bzs-result">
                <SupportRelief className="bzs-relief" />
              </Reveal>
            </div>
            <Reveal className="bzs-lead">
              <p className="bzl-lead">{s.lead}</p>
            </Reveal>
            {/* its three capabilities, as cards: title up front, the detail on demand */}
            <div className="bzs-caps">
              {s.capabilities.map((c, i) => (
                <Reveal key={c.title} delay={160 + i * 90}>
                  <FeatureCard icon={CAPABILITY_ICONS[i]} title={c.title} body={c.body} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </BenefitIntro>
    </section>
  );
};

export default SupportSection;
