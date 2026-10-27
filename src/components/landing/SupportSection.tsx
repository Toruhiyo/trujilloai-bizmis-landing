import { useEffect, useMemo, useRef, useState } from "react";
import { HeadsetIcon } from "./AnimatedIcons";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";
import BenefitIntro, { PIN_QUERY, useScenePlay } from "./pillar/BenefitIntro";
import type { PinState } from "./pillar/BenefitIntro";
import { supportDayTimes } from "./PillarMoments";
import { useDrawOption } from "./drawOptions";
import { SupportDrawing } from "./SupportOptions";
import { useMedia, useScrollPlay, useScrollThrough } from "./sales/hooks";
import RewindScreen from "./sales/RewindScreen";
import SupportStore, { supportCase } from "./support/SupportStore";
import type { CaseKey } from "./support/SupportStore";

/**
 * Customer Support: its chapter opener (index 02, the headset, "Customer
 * Support", "Fewer tickets. Happier customers.", BenefitIntro), then one
 * screen built like a Boost Sales beat: on the left the lead over the
 * merchant's benefit at scale, drawn in marker straight on the band (a day
 * and a night of the whole store's questions, piling up as tickets until
 * the agent lands, then each one answered right away by voice, SupportDay),
 * on the right one shopper's case on a device (SupportStore). Layout: .bzs-*
 * in film-landing.css.
 *
 * One clock for the device and the drawing, the scroll's (as Sales'
 * useScrollPlay): forward plays, back rewinds to the scroll, at rest it
 * plays on at 1x, holds the end, rewinds and replays (the device's screen
 * going analog while it rewinds, RewindScreen; the drawing's marker ◀◀);
 * each replay plays the store's next case. The agent lands in the drawing
 * as it starts answering on the device. Pinned on every screen tall enough
 * (SUPPORT_PIN: desktops side by side; phones and tablets stacked, the
 * stack fits one screen), the section's track (BenefitIntro's useScenePlay
 * and runFor: 0.2 screens of scroll a second of the scene, then 0.6 of a
 * screen holding its end); short screens (a phone on its side), stacked:
 * its own scroll through the screen.
 */

/** Where Customer Support pins: wherever the screen is tall enough for its stack (phones included). */
const SUPPORT_PIN = "(min-height: 600px)";

/** Short screens, not pinned: of the stacked body's scroll through the screen, a short lead-in, then the timeline, then a hold on its end. */
const LEAD = 0.05;
const RUN = 0.6;

/** The store's cases, and the scene's length: as long as the longest case, or its drawing. */
const useCases = () => {
  const all = useMessages().supportDemo.cases;
  const cases = useMemo(() => (Object.keys(all) as CaseKey[]).map((k) => supportCase(all, k)), [all]);
  const duration = useMemo(
    () => Math.max(...cases.map((c) => Math.max(c.duration, supportDayTimes(c.speakAt, c.duration).end))),
    [cases],
  );
  return { cases, duration };
};

/** Counts the times `t` came back to its start after reaching its end (`duration`): the case to play. */
const useReplays = (t: number, duration: number) => {
  const [n, setN] = useState(0);
  const reached = useRef(false);
  useEffect(() => {
    if (t >= duration - 1) reached.current = true;
    else if (t <= 0 && reached.current) {
      reached.current = false;
      setN((v) => v + 1);
    }
  }, [t, duration]);
  return n;
};

/**
 * True for a moment whenever `t` goes backwards while `on` (as sales/hooks'
 * useRewinding), but not on the frame the clock comes on: a clock picked up
 * mid-scroll (a fast scroll into the section) starts where the scroll is,
 * which is no rewind.
 */
const useRewindingOn = (t: number, on: boolean, linger = 420) => {
  const last = useRef(t);
  const was = useRef(on);
  const timer = useRef(0);
  const [back, setBack] = useState(false);
  useEffect(() => {
    if (on && was.current && t < last.current - 1) {
      setBack(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setBack(false), linger);
    }
    last.current = t;
    was.current = on;
  }, [t, on, linger]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return back;
};

const SupportBody = ({ pin }: { pin: PinState }) => {
  const m = useMessages();
  const s = m.landing.support;
  const { cases, duration } = useCases();
  // side by side (desktop) or stacked (pinned on phones and tablets too)
  const wide = useMedia(PIN_QUERY);
  const scene = useScenePlay(pin, duration);
  // stacked: the body's own way through the screen sets the clock, from when it's clear of the docking opener
  const [body, p] = useScrollThrough<HTMLDivElement>(0.33, 0.64);
  const through = !pin.pinned && p > 0 && p < 1;
  const own = useScrollPlay(Math.min(1, Math.max(0, (p - LEAD) / RUN)) * duration, duration, through);
  // (kept on the timeline: a clock picked up mid-scroll can read a hair under its start for a frame)
  const t = Math.min(duration, Math.max(0, pin.pinned ? scene.t : own));
  const active = pin.pinned ? pin.active : through;
  const rewinding = useRewindingOn(t, active);
  const c = cases[useReplays(t, duration) % cases.length];
  const day = supportDayTimes(c.speakAt, c.duration);
  // the drawing: none, the one Oriol picked (the clock); ?support=1|2|3 the options, "old" the one before
  const option = useDrawOption("support");
  return (
    <div className="bzl-wrap">
      {/* ph-no-capture: the session recorder would log every animated frame of it */}
      <div ref={body} className={cn("bzs-grid ph-no-capture", pin.pinned && wide && "is-pinned")}>
        <Reveal className="bzs-lead">
          <p className="bzl-lead">{s.lead}</p>
        </Reveal>
        {/* the merchant's side, at scale: the store's day and night of questions */}
        <Reveal delay={80} className="bzs-day">
          <SupportDrawing option={option} className="bzs-drawing" t={t} fixAt={day.fixAt} win={day.win} rewinding={rewinding} />
        </Reveal>
        {/* one shopper's case, on the same clock */}
        <Reveal delay={160} className="bzs-store">
          <RewindScreen on={rewinding}>
            <SupportStore c={c} t={Math.min(t, c.duration)} active={active} />
          </RewindScreen>
        </Reveal>
      </div>
    </div>
  );
};

const SupportSection = () => {
  const messages = useMessages();
  const s = messages.landing.support;
  const promise = `${s.title} ${s.titleTail}`;
  const { duration } = useCases();
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
        duration={duration}
        pinQuery={SUPPORT_PIN}
      >
        {(pin) => <SupportBody pin={pin} />}
      </BenefitIntro>
    </section>
  );
};

export default SupportSection;
