import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import Reveal, { useInView } from "./Reveal";
import BizmisWidget, { Captions } from "./BizmisWidget";
import { ClayCard, StoreWindow } from "./clay";
import TypicalChatbot from "./TypicalChatbot";
import type { ClayShape } from "./clay";

const GRID: {
  shape: ClayShape;
  tint: "sage" | "sand" | "stone" | "blush" | "warm";
}[] = [
  { shape: "capsule", tint: "sage" },
  { shape: "sphere", tint: "sand" },
  { shape: "cube", tint: "warm" },
  { shape: "dome", tint: "blush" },
  { shape: "torus", tint: "stone" },
  { shape: "cone", tint: "sage" },
  { shape: "slab", tint: "sand" },
  { shape: "lens", tint: "warm" },
];

/**
 * "Chatbot", set as obsolete tech: an old terminal's pixel font, letters
 * knocked off their baseline like a failing sign, one dead letter flickering.
 * Once the sales agent wins, the word slumps further, greys out and is struck.
 */
const ChatbotWord = ({ text, beaten }: { text: string; beaten: boolean }) => (
  <span
    className={cn("bzl-obsolete relative inline-block", beaten && "is-beaten")}
  >
    <span className="sr-only">{text}</span>
    <span aria-hidden="true">
      {[...text].map((ch, i) => (
        <span
          key={i}
          className="bzl-obsolete-ch"
          style={{ "--i": i, "--n": text.length } as CSSProperties}
        >
          {ch}
        </span>
      ))}
    </span>
    <span aria-hidden="true" className="bzl-obsolete-strike" />
  </span>
);

/** Patience left after each reply, and the shopper's face at that point. */
const PATIENCE = [
  { left: 72, face: "😐" },
  { left: 50, face: "😑" },
  { left: 32, face: "😒" },
  { left: 14, face: "😩" },
  { left: 0, face: "💨" },
] as const;

/**
 * The shopper's patience, top-left of the store: drains with every chatbot
 * reply, the face sours and the caption escalates until they're gone.
 */
const PatienceMeter = ({ replies }: { replies: number }) => {
  const p = useMessages().landing.switch.patience;
  const step = Math.min(replies, PATIENCE.length) - 1;
  const { left, face } = PATIENCE[step];
  return (
    <div className="bzl-corner absolute left-3 top-[52px] z-10 w-[min(290px,calc(100%-24px))] rounded-2xl border border-[#e6e6e6] bg-white/90 px-3.5 py-3 font-[Inter,system-ui,sans-serif] shadow-[0_12px_30px_-14px_rgba(32,36,44,0.35)] backdrop-blur sm:left-4">
      <div className="flex items-center gap-2.5">
        <span
          key={face}
          aria-hidden="true"
          className="bzl-pop text-[2rem] leading-none"
        >
          {face}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#8e8e93]">
            {p.label}
          </p>
          <div
            className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#ececee]"
            role="meter"
            aria-label={p.label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={left}
          >
            <div
              className="h-full rounded-full transition-[width,background-color] duration-700"
              style={{
                width: `${left}%`,
                background:
                  left > 45 ? "#8e8e93" : left > 20 ? "#c0843f" : "#c4453c",
              }}
            />
          </div>
        </div>
      </div>
      <p
        key={step}
        className="bzl-pop mt-2 text-[13px] font-medium leading-snug text-[#5a5a5a]"
      >
        {p.stages[step]}
      </p>
    </div>
  );
};

/** Patience gone: the shopper left the store. The only way out is the sales agent. */
const ShopperLeft = ({ onTry }: { onTry: () => void }) => {
  const p = useMessages().landing.switch.patience;
  return (
    <div className="bzl-corner absolute inset-x-0 bottom-0 top-[44px] z-[15] grid place-items-center bg-[rgba(214,214,218,0.72)] px-4 pb-[52%] font-[Inter,system-ui,sans-serif] backdrop-blur-[2px] sm:pb-0 sm:pr-[360px]">
      <div className="text-center">
        <p aria-hidden="true" className="text-5xl">
          👋
        </p>
        <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#2a2a2a]">
          {p.leftTitle}
        </p>
        <p className="mt-1 text-[15px] text-[#6e6e73]">{p.leftBody}</p>
        <button
          type="button"
          onClick={onTry}
          className="mt-5 rounded-full bg-[var(--bzl-orange-strong)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_26px_-12px_rgba(236,119,9,0.8)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
        >
          {p.cta} →
        </button>
      </div>
    </div>
  );
};

/**
 * "This isn't a chatbot." — the film's Chatbot ⟷ Sales agent switch, big and
 * colour-led: chatbot is a cold grey world (the store drains to greyscale and
 * the film's typical chatbot sits in the corner — live, so visitors can try
 * how useless it is); sales agent floods the section with the Bizmis orange
 * and the real widget speaks, captions at the page's foot. Like a real store,
 * the page keeps its own layout and the chat floats over it. It flips to the
 * agent on its own once seen, unless the visitor is busy with the chatbot.
 */
const SwitchSection = () => {
  const messages = useMessages();
  const m = messages.landing.switch;
  const [ref, inView] = useInView<HTMLElement>(0.4);
  const [agent, setAgent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [hovering, setHovering] = useState(false);
  // The live avatar's mouth follows the captions: talking per line, still between.
  const [talking, setTalking] = useState(true);

  useEffect(() => {
    if (!inView || touched || hovering) return;
    const t = window.setTimeout(() => setAgent(true), 4500);
    return () => window.clearTimeout(t);
  }, [inView, touched, hovering]);

  // How many walls of text the shopper has sat through; patience drains with each.
  const [replies, setReplies] = useState(0);

  const flip = () => {
    setTouched(true);
    setReplies(0);
    setAgent((a) => !a);
  };

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-4 py-[clamp(4rem,9vw,7rem)] sm:px-6"
    >
      {/* The two worlds; the switch cuts between them. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(160deg,#ececee,#d8d8dc)]"
      />
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 studio-lighting-base transition-opacity duration-500",
          agent ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="absolute inset-0 studio-radial-light" />
      </div>

      <div className="bzl-wrap relative text-center">
        <Reveal>
          <h2
            className="bzl-statement transition-colors duration-500"
            style={{ color: agent ? "#fff" : "#2a2a2a" }}
          >
            {messages.hero.pitchLead}
          </h2>
        </Reveal>

        {/* The switch, at the film's scale */}
        <Reveal delay={120}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[clamp(1.75rem,4.6vw,4rem)] font-bold tracking-[-0.03em]">
            <button
              type="button"
              onClick={() => agent && flip()}
              className="transition-colors duration-500"
            >
              <ChatbotWord text={m.chatbot} beaten={agent} />
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={agent}
              aria-label={m.toggleAria}
              onClick={flip}
              className={cn(
                "relative h-[1.3em] w-[2.6em] flex-shrink-0 rounded-full transition-colors duration-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60",
                agent
                  ? "bg-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                  : "bg-[#c8c8cd]",
              )}
            >
              <span
                className={cn(
                  "absolute top-[0.1em] h-[1.1em] w-[1.1em] rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.22)] transition-all duration-500",
                  agent
                    ? "left-[1.4em] bg-[var(--bzl-orange-strong)] ring-[0.12em] ring-white"
                    : "left-[0.1em] bg-white",
                )}
                style={{ transitionTimingFunction: "var(--bzl-spring)" }}
              />
            </button>
            <button
              type="button"
              onClick={() => !agent && flip()}
              className={cn(
                "transition-colors duration-500",
                agent ? "text-white" : "text-[#9c9ca1]",
              )}
            >
              {m.agent}
            </button>
          </div>
        </Reveal>

        {/* What the shopper does: lost with a chatbot, buying with the agent. */}
        <Reveal delay={200}>
          <p
            className={cn(
              "mt-8 text-xs font-semibold uppercase tracking-[0.18em] transition-colors duration-500",
              agent ? "text-white/75" : "text-[#8e8e93]",
            )}
          >
            {m.shopper}
          </p>
          <p
            key={agent ? "agent" : "bot"}
            className={cn(
              "bzl-pop mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[clamp(1.25rem,2.4vw,1.9rem)] font-bold tracking-[-0.025em]",
              agent ? "text-white" : "text-[#8d8d93]",
            )}
          >
            {(agent ? m.agentOutcome : m.chatbotOutcome).map((p, i) => (
              <span key={p} className="flex items-center gap-4">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      agent ? "bg-white/60" : "bg-[#b4b4b9]",
                    )}
                  />
                )}
                {p}
              </span>
            ))}
          </p>
        </Reveal>

        {/* The same store, two worlds */}
        <Reveal
          delay={260}
          className="relative mx-auto mt-14 max-w-[980px] text-left"
        >
          <div
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => setHovering(false)}
          >
            <StoreWindow label={messages.landing.yourStore}>
              <div
                className={cn(
                  "transition-[filter] duration-500",
                  agent ? "grayscale-0" : "grayscale",
                )}
              >
                <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 sm:gap-6 sm:p-8">
                  {GRID.map((g) => (
                    <ClayCard key={g.shape} shape={g.shape} tint={g.tint} />
                  ))}
                </div>
              </div>

              {agent ? (
                <>
                  {/* The real widget's captions sit at the foot of the page. */}
                  <div className="absolute inset-x-0 bottom-5 hidden justify-center px-4 pr-[34%] sm:flex">
                    <Captions
                      text={m.agentMessage}
                      className="text-sm lg:text-lg"
                      onSpeaking={setTalking}
                    />
                  </div>
                  <div className="bzl-corner absolute bottom-3 right-3 z-10 origin-bottom-right scale-[0.62] sm:bottom-4 sm:right-4 sm:scale-[0.78] lg:scale-[0.9]">
                    <BizmisWidget
                      agent="greet-amber"
                      live="amber"
                      talking={talking}
                      state="speaking"
                      placeholder={messages.landing.widget.placeholder}
                    />
                  </div>
                </>
              ) : (
                <>
                  {replies > 0 && <PatienceMeter replies={replies} />}
                  {replies >= PATIENCE.length && <ShopperLeft onTry={flip} />}
                  <TypicalChatbot
                    onInteract={() => setTouched(true)}
                    onReply={() => setReplies((r) => r + 1)}
                    className="bzl-corner absolute bottom-3 right-3 z-20 h-[min(460px,calc(100%-64px))] w-[min(340px,calc(100%-24px))] sm:bottom-4 sm:right-4"
                  />
                </>
              )}
            </StoreWindow>
          </div>

          {/* A nudge to try the chatbot */}
          {!agent && (
            <p
              aria-hidden="true"
              className="bzl-script pointer-events-none absolute -top-12 right-2 hidden -rotate-3 items-end gap-1 text-[1.7rem] leading-none sm:flex"
              style={{ color: "#77777c" }}
            >
              {m.bot.hint}
              <svg
                viewBox="0 0 40 40"
                className="h-9 w-9 translate-y-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M6 6c14 2 24 12 26 26" />
                <path d="M24 28l8 5 3-9" strokeLinejoin="round" />
              </svg>
            </p>
          )}
        </Reveal>

        <Reveal delay={120}>
          <p
            className="bzl-lead mx-auto mt-12 max-w-2xl transition-colors duration-500"
            style={{ color: agent ? "rgba(255,255,255,0.9)" : "#6e6e73" }}
          >
            {messages.hero.pitchLong}
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default SwitchSection;
