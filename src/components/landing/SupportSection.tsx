import { BookIcon, CareIcon, ClockIcon, HeadsetIcon } from "./AnimatedIcons";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";
import { ClayTile } from "./clay";
import FeatureCard from "./FeatureCard";
import BenefitIntro, { useScenePlay } from "./pillar/BenefitIntro";
import type { PinState } from "./pillar/BenefitIntro";
import { LIVE_MS, SupportLive } from "./PillarMoments";
import SupportStore, { DEMO_MS } from "./support/SupportStore";

type Clock = { t: number; rewinding: boolean; replay: number };

/**
 * The support moment: a store page with the real widget, cycling through the
 * classic landing's cases (one per loop, rewinding in between): the shopper
 * types the question in the widget's composer and sends it, the agent works
 * the store (tool on its laser), then answers out loud, with captions.
 */
const SupportChat = ({ clock }: { clock?: Clock }) => (
  <SupportStore agent="support-yusuke" clock={clock}>
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
 * Customer Support: its chapter opener (index 02, the headset, "Customer
 * Support", "Fewer tickets. Happier customers.", BenefitIntro), then one
 * screen that reads cause → effect → why: the store with the widget
 * answering a shopper; shoppers' questions answered live by voice (none
 * becomes a ticket), drawn in marker straight on the panel; then the lead
 * and the three capabilities as cards. Layout: .bzs-* in film-landing.css.
 *
 * On desktop the whole section is one pinned screen (BenefitIntro) and the
 * scroll drives both animations on one clock (useScenePlay: forward plays,
 * back rewinds, at rest it plays on, holds, rewinds and replays; each replay
 * plays the store's next case). Phones stack it and each runs its own loop.
 */
const CAPABILITY_ICONS = [ClockIcon, BookIcon, CareIcon];

/** One clock for the store and the drawing: the store's case; the drawing spreads over most of it (a touch under 1x) and holds its end. */
const SCENE_MS = Math.max(DEMO_MS, LIVE_MS);
const LIVE_RATE = Math.min(1, LIVE_MS / (SCENE_MS * 0.85));

const SupportBody = ({ pin }: { pin: PinState }) => {
  const s = useMessages().landing.support;
  const scene = useScenePlay(pin, SCENE_MS);
  const clock = pin.pinned ? scene : undefined;
  return (
    <div className="bzl-wrap">
      <div className={cn("bzs-grid", pin.pinned && "is-pinned")}>
        <Reveal delay={120} className="bzs-store">
          <SupportChat clock={clock && { ...clock, t: Math.min(DEMO_MS, clock.t) }} />
        </Reveal>
        {/* the result: questions answered live, a free marker drawing beside the store */}
        <Reveal delay={260} className="bzs-result">
          <SupportLive
            className="bzs-live"
            t={clock ? Math.min(LIVE_MS, clock.t * LIVE_RATE) : undefined}
            rewinding={clock?.rewinding}
          />
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
  );
};

const SupportSection = () => {
  const messages = useMessages();
  const s = messages.landing.support;
  const promise = `${s.title} ${s.titleTail}`;
  return (
    <section className="bzl-band bzl-pillar p-support bzp-section">
      <BenefitIntro
        index="02"
        icon={<HeadsetIcon />}
        name={messages.benefits.support.badge}
        promise={promise}
        area={s.area}
        motif="support"
        outcome={[s.title, s.titleTail]}
        run={1.7}
      >
        {(pin) => <SupportBody pin={pin} />}
      </BenefitIntro>
    </section>
  );
};

export default SupportSection;
