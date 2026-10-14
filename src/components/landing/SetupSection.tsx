import { useLocation } from "react-router-dom";
import { FaBolt, FaSync } from "react-icons/fa";
import { useMessages } from "@/i18n/LocaleProvider";
import Reveal from "./Reveal";
import SetupLive from "./setup/SetupLive";
import SetupMirror from "./setup/SetupMirror";
import SetupSplit from "./setup/SetupSplit";
import "@/styles/landing-setup.css";

/**
 * One-Click Setup on /v2. Two things to get across: one click and the agent
 * is selling right away (not in minutes, now), and it stays in sync with the
 * store for good. Copy in `landing.setup` (the classic landing keeps
 * `messages.setup`).
 *
 * Three concepts are on trial, picked with ?setup=: 1 (default, "Click →
 * Live": the click switches the store's agent on, then store changes keep
 * flying into him), 2 ("Mirror": the Shopify admin and what the agent knows,
 * linked by the click; every edit shows up on his side at once) and 3 ("Split
 * second": days of setup elsewhere, crossed out, against one click and 0 s,
 * then an always-on sync pulse).
 */
const CONCEPTS = { "1": SetupLive, "2": SetupMirror, "3": SetupSplit } as const;

const SetupSection = () => {
  const messages = useMessages();
  const copy = messages.landing.setup;
  const { search } = useLocation();
  const key = new URLSearchParams(search).get("setup") ?? "1";
  const Concept = CONCEPTS[key as keyof typeof CONCEPTS] ?? SetupLive;

  return (
    <section
      id="setup"
      className="bzl-section bzl-screen relative overflow-hidden bg-[linear-gradient(180deg,#fff,#fff8f0_45%,#fff)]"
    >
      {/* the classic landing's warm glow around the section's edges */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-48 top-[10%] h-[45%] w-96 rounded-[50%] bg-[rgba(249,163,83,0.28)] blur-[80px]" />
        <div className="absolute -right-48 bottom-[8%] h-[45%] w-96 rounded-[50%] bg-[rgba(249,163,83,0.26)] blur-[80px]" />
        <div className="absolute -top-40 left-[20%] h-56 w-[60%] rounded-[50%] bg-[rgba(249,163,83,0.18)] blur-[80px]" />
      </div>

      <div className="bzl-wrap relative">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="bzl-kicker">{messages.setup.badge}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="bzl-statement-sm mt-3">{copy.title}</h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="bzl-lead mx-auto mt-[2svh] max-w-2xl">{copy.lead}</p>
          </Reveal>
        </div>

        <Concept key={key} />

        <Reveal className="mt-[3.5svh] text-center">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {[
              { Icon: FaBolt, label: copy.instant },
              { Icon: FaSync, label: copy.alwaysSynced },
            ].map(({ Icon, label }) => (
              <span key={label} className="bzs-chip">
                <Icon className="h-3.5 w-3.5 text-[var(--bzl-orange-strong)]" />
                {label}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default SetupSection;
