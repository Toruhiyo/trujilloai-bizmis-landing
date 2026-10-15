import { useRef } from "react";
import type { ReactNode } from "react";
import { ArrowUp, AudioLines, FileSearch, PackageSearch, Truck, Volume2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import AgentImage from "../AgentImage";
import type { AgentName } from "../AgentImage";
import { StoreWindow } from "../clay";
import { span, typed, useRewindLoop } from "../useRewindLoop";
import { RewindIcon } from "../RewindSign";

/**
 * The Support section's store mockup: a store page with the real Bizmis
 * widget (DesktopLiteChat "card" layout) in its corner, playing one support
 * case per loop, as the widget plays it: the shopper types the question in
 * the composer (fast, a character every ~30 ms), sends it (it floats above
 * the card), the agent works the store (the tool on its laser), then answers
 * out loud: rings behind the avatar and the words as captions at the page's
 * foot. Never a text reply from the agent.
 *
 * Driven by useRewindLoop: it starts from the beginning when it comes into
 * view, holds on the answer, rewinds (the captions un-speak, the message
 * drops back into the composer and un-types) and plays the next case. Every
 * frame is derived from the loop's time, so the rewind is the same timeline
 * running backwards. Leaving the view resets it to the first case.
 *
 * A copy of visuals.tsx's StoreWithWidget + BizmisWidget's card, made
 * time-driven (those stay as they are for the other sections).
 */

/** The true Bizmis primary (hsl(var(--primary))), as the real widget paints its UI. */
const ORANGE = "#F9A353";

// The widget's tool icon for each support case.
const TOOLS: Record<string, LucideIcon> = {
  returnPolicy: FileSearch,
  orderTracking: PackageSearch,
  shippingTime: Truck,
  changeAddress: PackageSearch,
  cancelOrder: PackageSearch,
  warranty: FileSearch,
  startReturn: PackageSearch,
};

/* ── One case's timeline (ms) ── */
const TYPE_AT = 450; // the shopper starts typing
const TYPE_MAX = 1700; // typing never takes longer than this
const SEND_GAP = 300; // a beat before they hit send
const SENT_MS = 2600; // the sent message floats above the card, then away
const WORK_MS = 1750; // the agent works the store
const SPEECH_MAX = 4700; // the answer's whole speech fits in this
const WORDS_PER_LINE = 8; // captions show one line (≤ 8 words) at a time
const LINE_HOLD = 2; // each finished line holds this many word-beats
const DEMO_MS = TYPE_AT + TYPE_MAX + SEND_GAP + WORK_MS + SPEECH_MAX + 500;

type Line = { words: string[]; at: number };

const timeline = (quote: string, response: string) => {
  const msPerChar = Math.min(32, TYPE_MAX / Math.max(1, quote.length));
  const sendAt = TYPE_AT + quote.length * msPerChar + SEND_GAP;
  const speakAt = sendAt + WORK_MS;
  const words = response.split(/\s+/).filter(Boolean);
  const lines: string[][] = [];
  for (let k = 0; k < words.length; k += WORDS_PER_LINE) lines.push(words.slice(k, k + WORDS_PER_LINE));
  const beats = words.length + LINE_HOLD * (lines.length - 1);
  const msPerWord = Math.min(320, SPEECH_MAX / Math.max(1, beats));
  let at = speakAt;
  const timed: Line[] = lines.map((w) => {
    const line = { words: w, at };
    at += (w.length + LINE_HOLD) * msPerWord;
    return line;
  });
  const speechEnd = speakAt + words.length * msPerWord + LINE_HOLD * (lines.length - 1) * msPerWord;
  return { msPerChar, sendAt, speakAt, speechEnd, msPerWord, lines: timed };
};

/** The captions at `t`: the current line, spoken words solid, the current one bold and glowing. */
const TimedCaptions = ({ text, lines, msPerWord, t }: { text: string; lines: Line[]; msPerWord: number; t: number }) => {
  let line = lines[0];
  for (const l of lines) if (t >= l.at) line = l;
  if (!line) return null;
  const i = Math.floor((t - line.at) / msPerWord) + 1; // words spoken so far, the last one being said
  return (
    <p className="bzw-caption w-fit max-w-[46rem] rounded-3xl px-4 py-1 text-center text-[11px] font-medium leading-snug text-[#171717] sm:text-sm">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {line.words.map((w, k) => (
          <span
            key={k}
            className={cn("relative", k < i - 1 ? "opacity-100" : k === i - 1 ? "font-bold" : "opacity-50")}
          >
            {k === i - 1 && (
              <span className="bzw-word-glow absolute inset-x-[-0.3em] inset-y-[-0.2em] -z-10 rounded-full" />
            )}
            {w}
            {k < line.words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </p>
  );
};

/** The shopper's sent message above the card: in, a beat, then floating away (k: 0 → 1). */
const Sent = ({ text, k }: { text: string; k: number }) => {
  // the widget's own curve: in by 12%, held to 55%, then up and out
  const opacity = k < 0.12 ? k / 0.12 : k < 0.55 ? 1 : 1 - (k - 0.55) / 0.45;
  const y = k < 0.12 ? 8 * (1 - k / 0.12) : k < 0.55 ? 0 : -14 * ((k - 0.55) / 0.45);
  return (
    <p
      className="ml-auto w-fit max-w-[85%] rounded-2xl px-3.5 py-2 text-sm text-white shadow-sm"
      style={{ background: ORANGE, opacity, transform: `translateY(${y.toFixed(2)}px)` }}
    >
      {text}
    </p>
  );
};

type CardState = "idle" | "working" | "speaking";

/** The widget's card (BizmisWidget's card layout), with the composer showing what the shopper types. */
const WidgetCard = ({
  agent,
  state,
  tool: Tool,
  draft,
  typing,
  press,
  placeholder,
  above,
}: {
  agent: AgentName;
  state: CardState;
  tool?: LucideIcon;
  /** What the shopper has typed so far. */
  draft: string;
  /** The caret is in the bar (typing, or about to). */
  typing: boolean;
  /** 0..1, the send button's press. */
  press: number;
  placeholder: string;
  above?: ReactNode;
}) => (
  <div className="bzw relative w-[288px]">
    {above && (
      <div className="absolute bottom-full left-0 right-0 z-20 mb-2.5 flex flex-col gap-2.5">{above}</div>
    )}
    <div className="bzw-card relative h-[296px] rounded-xl border">
      <span
        className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full border"
        style={{
          borderColor: `color-mix(in oklab, ${ORANGE} 30%, transparent)`,
          background: `color-mix(in oklab, ${ORANGE} 14%, transparent)`,
          color: ORANGE,
        }}
        aria-hidden="true"
      >
        <Volume2 className="h-4 w-4" />
      </span>

      <div className="relative h-[230px] overflow-visible">
        {state === "speaking" && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2"
          >
            <span className="bzw-glow absolute left-1/2 top-1/2 h-[198px] w-[198px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
            <span className="bzw-ring absolute left-1/2 top-1/2 h-[144px] w-[144px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2" />
            <span className="bzw-ring absolute left-1/2 top-1/2 h-[144px] w-[144px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 [animation-delay:1.1s]" />
          </span>
        )}
        {state === "working" && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[44%] h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2"
          >
            <span className="bzw-spinner absolute inset-0">
              <span className="bzw-laser absolute inset-0 rounded-full" />
              {Tool && (
                <span
                  className="absolute left-1/2 top-0 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow"
                  style={{ color: ORANGE }}
                >
                  <span className="bzw-upright grid place-items-center">
                    <Tool className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </span>
                </span>
              )}
            </span>
          </span>
        )}
        <AgentImage
          name={agent}
          alt=""
          sizes="160px"
          className="absolute bottom-0 left-1/2 h-[224px] w-auto -translate-x-1/2"
        />
      </div>

      {/* Composer: the shopper's words as they type them, else the placeholder */}
      <div className="px-3 pb-3 pt-1">
        <div
          className={cn(
            "flex h-[44px] items-center rounded-2xl border bg-white/60 py-1.5 pl-4 pr-1.5 transition-colors duration-200",
            typing ? "border-[color:color-mix(in_oklab,#F9A353_45%,transparent)]" : "border-black/10",
          )}
        >
          <span className="min-w-0 flex-1 truncate text-sm" data-testid="support-composer">
            {draft ? (
              <span className="text-neutral-800">{draft}</span>
            ) : (
              !typing && <span className="text-neutral-400">{placeholder}</span>
            )}
            {typing && <span className="bzs-caret" aria-hidden="true" />}
          </span>
          <span
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-white shadow-sm"
            style={{ background: ORANGE, transform: `scale(${(1 - 0.14 * Math.sin(Math.PI * press)).toFixed(3)})` }}
          >
            {draft ? (
              <ArrowUp className="h-4 w-4" strokeWidth={2.75} />
            ) : (
              <AudioLines className="h-3.5 w-3.5" strokeWidth={2.5} />
            )}
          </span>
        </div>
      </div>
    </div>
  </div>
);

/**
 * The store page with the support demo playing in the widget. `children` is
 * the store's own page content.
 */
const SupportStore = ({ agent, children }: { agent: AgentName; children: ReactNode }) => {
  const m = useMessages();
  const cases = m.supportDemo.cases;
  const keys = Object.keys(cases) as (keyof typeof cases)[];
  const ref = useRef<HTMLDivElement>(null);
  const loop = useRewindLoop(ref, {
    duration: DEMO_MS,
    rewind: 1300,
    rest: 450,
    threshold: 0.4,
    tick: 0,
  });
  const t = loop.t;
  // one case per loop, from the first every time it comes into view
  const key = keys[Math.max(0, loop.cycle - 1) % keys.length];
  const c = cases[key];
  const quote = c.quote.replace(/^["“«]|["”»]$/g, "");
  const tl = timeline(quote, c.response);

  const draft = t < tl.sendAt ? typed(quote, t, TYPE_AT, tl.msPerChar) : "";
  const typing = t >= TYPE_AT - 200 && t < tl.sendAt;
  const press = span(t, tl.sendAt - 140, tl.sendAt + 60);
  const sentK = span(t, tl.sendAt, tl.sendAt + SENT_MS);
  const state: CardState =
    t < tl.sendAt + 150 ? "idle" : t < tl.speakAt ? "working" : t < tl.speechEnd + 250 ? "speaking" : "idle";
  const speaking = t >= tl.speakAt;

  return (
    <div ref={ref}>
      <StoreWindow label={m.landing.yourStore}>
        {children}
        {speaking && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center px-4 pr-[38%] sm:pr-[34%]">
            <TimedCaptions text={c.response} lines={tl.lines} msPerWord={tl.msPerWord} t={t} />
          </div>
        )}
        <div className="absolute bottom-3 right-3 z-10 origin-bottom-right scale-[0.5] sm:scale-[0.62]">
          <WidgetCard
            agent={agent}
            state={state}
            tool={TOOLS[key]}
            draft={draft}
            typing={typing}
            press={press}
            placeholder={m.landing.widget.placeholder}
            above={sentK > 0 && sentK < 1 ? <Sent text={quote} k={sentK} /> : undefined}
          />
        </div>
        {/* ◀◀ while the case rewinds */}
        <RewindIcon on={loop.rewinding} />
      </StoreWindow>
    </div>
  );
};

export default SupportStore;
