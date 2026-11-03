import { useRef } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { IdeaIcon } from "./AnimatedIcons";
import BenefitIntro, { PIN_QUERY, PinTrack } from "./pillar/BenefitIntro";
import type { PinState } from "./pillar/BenefitIntro";
import { CLARITY_MS, InsightsDrawing } from "./InsightsDrawing";
import Reveal from "./Reveal";
import SessionReplay from "./SessionReplay";
import { useMedia } from "./sales/hooks";
import { useScenePlayHold } from "./sceneClock";
import { useStepsReport } from "./steps/steps";

/**
 * Store Insights: its chapter opener (index 03, the bulb, "Store Insights",
 * "See what sells. Fix what doesn't.", BenefitIntro), then one screen: the
 * lead over the marker drawing (a crowd of abandoned carts, a magnifier
 * finding why, InsightsDrawing), beside the classic landing's conversation
 * replays, the replay's card as tall as the screen.
 *
 * On desktop the section is one pinned screen and the scroll drives the
 * drawing (useScenePlayHold: forward plays, back rewinds, at rest it plays
 * on, holds 1.5 s (HOLD), rewinds and replays; the track 0.2 screens a second of it,
 * then 0.6 of a screen holding its end, BenefitIntro runFor). The replays
 * stay the visitor's to play (real call audio). Phones and tablets stack
 * it: the lead and the drawing pin on their own (SUB_PIN, the same clock and
 * hold), then the replays follow; on short screens the drawing runs its own
 * loop. Layout: .bzi-* in film-landing.css.
 */
const SUB_PIN = "(min-height: 600px)";

/**
 * Where the whole screen pins: desktops (PIN_QUERY, side by side), and tall
 * portrait tablets (TABLET_TALL), where the lead, the chart and the replay's
 * card stack in the one pinned screen (landing-responsive.css), instead of the
 * chart pinning on its own over a mostly empty screen and the card after it.
 */
const TABLET_TALL = "(min-width: 700px) and (min-height: 900px) and (max-aspect-ratio: 4/5)";
const INSIGHTS_PIN = `${PIN_QUERY}, ${TABLET_TALL}`;

/**
 * At rest on the drawing's end (the reason found), how long it holds before
 * it rewinds and finds the next one (ms): as short as Customer Support's, the
 * lens' rays pulsing meanwhile so it never sits frozen.
 */
const HOLD = 1500;

/** Stacked: the lead and the chart, pinned on their own track, the scroll driving the chart. */
const StackedChart = ({ pin, lead }: { pin: PinState; lead: string }) => {
  const scene = useScenePlayHold(pin, CLARITY_MS, HOLD);
  const box = useRef<HTMLDivElement>(null);
  // ?scroll=steps: the drawing's progress under the docked pill
  useStepsReport(box, { count: 1, index: 0, fill: scene.t / CLARITY_MS, active: pin.pinned && pin.active });
  return (
    <div ref={box} className="bzi-grid">
      <Reveal className="bzi-lead">
        <p className="bzl-lead bzl-pillar-lead">{lead}</p>
      </Reveal>
      <Reveal delay={80} className="bzi-chart">
        <InsightsDrawing className="bzi-clarity mx-auto" t={scene.t} replay={scene.replay} rewinding={scene.rewinding} active={pin.pinned && pin.active} />
      </Reveal>
    </div>
  );
};

const InsightsBody = ({ pin }: { pin: PinState }) => {
  const ins = useMessages().landing.insights;
  const scene = useScenePlayHold(pin, CLARITY_MS, HOLD);
  const tall = useMedia(SUB_PIN);
  const box = useRef<HTMLDivElement>(null);
  useStepsReport(box, { count: 1, index: 0, fill: scene.t / CLARITY_MS, active: pin.pinned && pin.active });
  if (!pin.pinned && tall)
    return (
      <div className="bzl-wrap">
        <PinTrack duration={CLARITY_MS} sub>
          {(sub) => <StackedChart pin={sub} lead={ins.lead} />}
        </PinTrack>
        <div className="bzi-grid">
          <Reveal className="bzi-replay">
            <SessionReplay fill={false} />
          </Reveal>
        </div>
      </div>
    );
  return (
    <div ref={box} className="bzl-wrap">
      <div className={cn("bzi-grid", pin.pinned && "is-pinned")}>
        <Reveal className="bzi-lead">
          <p className="bzl-lead bzl-pillar-lead">{ins.lead}</p>
        </Reveal>
        <Reveal delay={80} className="bzi-chart">
          <InsightsDrawing
            className="bzi-clarity"
            t={pin.pinned ? scene.t : undefined}
            replay={pin.pinned ? scene.replay : undefined}
            rewinding={scene.rewinding}
            active={pin.pinned && pin.active}
          />
        </Reveal>
        <Reveal delay={120} className="bzi-replay">
          <SessionReplay fill={pin.pinned} />
        </Reveal>
      </div>
    </div>
  );
};

const InsightsSection = () => {
  const messages = useMessages();
  const ins = messages.landing.insights;
  const promise = `${ins.title} ${ins.titleTail}`;
  return (
    <section className="bzl-band bzl-pillar p-insights bzp-section">
      <BenefitIntro
        icon={<IdeaIcon />}
        name={messages.benefits.insights.badge}
        promise={promise}
        area={ins.area}
        outcome={[ins.title, ins.titleTail]}
        duration={CLARITY_MS}
        pinQuery={INSIGHTS_PIN}
      >
        {(pin) => <InsightsBody pin={pin} />}
      </BenefitIntro>
    </section>
  );
};

export default InsightsSection;
