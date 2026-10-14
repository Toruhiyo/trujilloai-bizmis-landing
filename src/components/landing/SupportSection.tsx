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
 * screen in the Support colours (coral and terracotta), laid out mirrored
 * from Insights (the widget on the left on desktop): the lead, the inbox
 * that empties itself, and the three capabilities as cards.
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
          <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div className="lg:order-2">
              <Reveal>
                <p className="bzl-lead max-w-md">{s.lead}</p>
              </Reveal>
              <Reveal delay={80}>
                <SupportRelief className="mt-[2.6svh] max-w-lg" />
              </Reveal>
              {/* its three capabilities, as cards: title up front, the detail on demand */}
              <div className="mt-[2.2svh] grid max-w-lg items-start gap-2">
                {s.capabilities.map((c, i) => (
                  <Reveal key={c.title} delay={160 + i * 90}>
                    <FeatureCard icon={CAPABILITY_ICONS[i]} title={c.title} body={c.body} />
                  </Reveal>
                ))}
              </div>
            </div>
            <Reveal
              delay={120}
              className="relative mx-auto w-full max-w-[min(560px,calc((100svh-12rem)*1.25))] lg:order-1"
            >
              <SupportChat />
            </Reveal>
          </div>
        </div>
      </BenefitIntro>
    </section>
  );
};

export default SupportSection;
