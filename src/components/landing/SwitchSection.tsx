import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { MessageCircle } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import Reveal, { useInView } from "./Reveal";
import BizmisWidget, { Captions } from "./BizmisWidget";
import { ClayCard, StoreWindow } from "./clay";
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
];

/** A typical chatbot, for the comparison: launcher + text panel. Not Bizmis. */
const TypicalChatbot = ({
  greeting,
  reply,
}: {
  greeting: string;
  reply: string;
}) => (
  <div className="w-[230px]">
    <div className="overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-lg">
      <div className="flex items-center gap-2 bg-neutral-700 px-3 py-2.5 text-xs font-semibold text-white">
        <MessageCircle className="h-3.5 w-3.5" />
        Chat
      </div>
      <div className="space-y-2 p-3 text-[11px] leading-snug text-neutral-700">
        <p className="w-fit rounded-lg bg-neutral-100 px-2.5 py-1.5">
          {greeting}
        </p>
        <p className="w-fit rounded-lg bg-neutral-100 px-2.5 py-1.5">{reply}</p>
        {["FAQ", "Shipping", "Returns"].map((l) => (
          <p
            key={l}
            className="w-fit rounded-md border border-neutral-300 px-2 py-1 text-neutral-500 underline"
          >
            {l}
          </p>
        ))}
        <div className="mt-1 h-7 rounded-md border border-neutral-300" />
      </div>
    </div>
    <span className="ml-auto mt-3 grid h-12 w-12 place-items-center rounded-full bg-neutral-700 text-white shadow-lg">
      <MessageCircle className="h-5 w-5" />
    </span>
  </div>
);

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

/**
 * "This isn't a chatbot." — the film's Chatbot ⟷ Sales agent switch, big and
 * colour-led: chatbot is a cold grey world (the store drains to greyscale,
 * a text chat panel in the corner); sales agent floods the section with the
 * Bizmis orange and the real widget speaks, captions at the page's foot.
 * It flips to the agent on its own once seen; visitors can flip it back.
 */
const SwitchSection = () => {
  const messages = useMessages();
  const m = messages.landing.switch;
  const [ref, inView] = useInView<HTMLElement>(0.4);
  const [agent, setAgent] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!inView || touched) return;
    const t = window.setTimeout(() => setAgent(true), 1600);
    return () => window.clearTimeout(t);
  }, [inView, touched]);

  const flip = () => {
    setTouched(true);
    setAgent((a) => !a);
  };

  const corner = agent ? (
    <BizmisWidget
      agent="greet-amber"
      state="speaking"
      placeholder={messages.landing.widget.placeholder}
    />
  ) : (
    <TypicalChatbot greeting={m.chatbotMessage} reply={m.chatbotReply} />
  );

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
            style={{ color: agent ? "#fff" : undefined }}
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
                agent ? "text-white" : "text-[var(--bzl-faint)]",
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
              agent ? "text-white/75" : "text-[var(--bzl-faint)]",
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
          <StoreWindow label={messages.landing.yourStore}>
            <div
              className={cn(
                "transition-[filter] duration-500",
                agent ? "grayscale-0" : "grayscale",
              )}
            >
              <div className="grid grid-cols-3 gap-4 p-5 pb-24 sm:gap-6 sm:p-8 sm:pb-28 md:pr-[330px]">
                {GRID.map((g) => (
                  <ClayCard key={g.shape} shape={g.shape} tint={g.tint} />
                ))}
              </div>
            </div>
            {/* The real widget's captions sit at the foot of the page. */}
            {agent && (
              <div className="absolute inset-x-0 bottom-5 hidden justify-center px-4 md:flex md:pr-[330px]">
                <Captions
                  text={m.agentMessage}
                  className="text-sm sm:text-lg"
                />
              </div>
            )}
          </StoreWindow>

          {/* The corner: a chatbot, or Bizmis */}
          <div
            key={agent ? "agent" : "bot"}
            className="bzl-corner absolute bottom-6 right-4 hidden md:block lg:right-6"
          >
            {corner}
          </div>
          <div className="absolute bottom-3 right-3 origin-bottom-right scale-[0.6] md:hidden">
            {corner}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p
            className="bzl-lead mx-auto mt-12 max-w-2xl transition-colors duration-500"
            style={{ color: agent ? "rgba(255,255,255,0.9)" : undefined }}
          >
            {messages.hero.pitchLong}
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default SwitchSection;
