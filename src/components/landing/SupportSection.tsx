import { BookIcon, CareIcon, ClockIcon, HeadsetIcon } from "./AnimatedIcons";
import { useMessages } from "@/i18n/LocaleProvider";
import Reveal from "./Reveal";
import { ClayTile } from "./clay";
import FeatureCard from "./FeatureCard";
import BenefitIntro from "./pillar/BenefitIntro";
import { SupportRelief } from "./PillarMoments";
import SupportStore from "./support/SupportStore";
import OutcomeHead from "./openers/OutcomeHead";
import { useStruct } from "./openers/StructContext";

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
 * Customer Support: its section header (index 02, the headset, "Customer
 * Support", "Fewer tickets. Happier customers.", BenefitIntro), then one
 * screen that reads cause → effect → why: the store with the widget
 * answering a shopper; the support inbox emptying itself, drawn in marker
 * straight on the panel; then the lead and the three capabilities as cards.
 * Layout: .bzs-* in film-landing.css.
 */
const CAPABILITY_ICONS = [ClockIcon, BookIcon, CareIcon];

/**
 * The structure options (?struct=A|C, structs.css): the area a small label,
 * the outcome the big line. A: one screen, the head, lead and capabilities
 * beside the store (the one visual). C: an opener (the outcome huge over the
 * inbox emptying), then the content screen. (B merges Support and Insights:
 * ProofSection.)
 */
const SupportStruct = ({ struct }: { struct: "A" | "C" }) => {
  const s = useMessages().landing.support;
  const caps = (
    <div className="st-caps">
      {s.capabilities.map((c, i) => (
        <Reveal key={c.title} delay={160 + i * 90}>
          <FeatureCard icon={CAPABILITY_ICONS[i]} title={c.title} body={c.body} />
        </Reveal>
      ))}
    </div>
  );
  if (struct === "A")
    return (
      <section className="bzl-band bzl-pillar p-support st-screen st-a">
        <div className="bzl-wrap st-grid">
          <div className="st-copy">
            <OutcomeHead area={s.area} icon={<HeadsetIcon />} lead={s.title} tail={s.titleTail} />
            <Reveal delay={80} className="st-leadbox">
              <p className="bzl-lead st-lead">{s.lead}</p>
            </Reveal>
            {caps}
          </div>
          <Reveal delay={120} className="st-visual st-store">
            <SupportChat />
          </Reveal>
        </div>
      </section>
    );
  return (
    <section className="bzl-band bzl-pillar p-support st-c so-support">
      <div className="st-opener">
        <OutcomeHead area={s.area} icon={<HeadsetIcon />} lead={s.title} tail={s.titleTail} size="xl" center />
        <Reveal delay={200} className="st-feel">
          <SupportRelief />
        </Reveal>
      </div>
      <div className="so-content st-screen">
        <div className="bzl-wrap st-grid">
          <div className="st-copy">
            <OutcomeHead area={s.area} icon={<HeadsetIcon />} as="p" />
            <Reveal delay={80} className="st-leadbox">
              <p className="bzl-lead st-lead">{s.lead}</p>
            </Reveal>
            {caps}
          </div>
          <Reveal delay={120} className="st-visual st-store">
            <SupportChat />
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const SupportSection = () => {
  const messages = useMessages();
  const struct = useStruct();
  if (struct === "A" || struct === "C") return <SupportStruct struct={struct} />;
  const s = messages.landing.support;
  const promise = `${s.title} ${s.titleTail}`;
  return (
    <section className="bzl-band bzl-pillar p-support bzp-section">
      <BenefitIntro
        index="02"
        icon={<HeadsetIcon />}
        name={messages.benefits.support.badge}
        promise={promise}
        outcome={[s.title, s.titleTail]}
        moment={<SupportRelief />}
      >
        <div className="bzl-wrap">
          <div className="bzs-grid">
            <Reveal delay={120} className="bzs-store">
              <SupportChat />
            </Reveal>
            {/* the result: the inbox emptying, a free marker drawing beside the store */}
            <Reveal delay={260} className="bzs-result">
              <SupportRelief className="bzs-relief" />
            </Reveal>
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
