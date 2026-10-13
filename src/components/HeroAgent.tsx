import { useEffect, useMemo, useRef, useState } from "react";
import { AudioLines, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages } from "@/i18n/LocaleProvider";
import AgentImage from "./landing/AgentImage";
import LiveAvatar from "./landing/LiveAvatar";

/**
 * The hero's agent (BIZ-423): the real Bizmis widget's card, as it sits on a
 * store (trujilloai-bizmis-widget DesktopLiteChat "card" layout: Volume toggle,
 * the avatar stage with its speaking glow and rings, the composer with its
 * typed placeholder and call button), with the live 3D avatar in the Bizmis
 * shirt. It talks to the visitor in the widget's captions, never in chat
 * bubbles: hello, what it does (each of "find it", "trust it", "buy it" lights
 * the hero subtitle's word as it is spoken), then it presents the play button
 * at the centre of the hero and asks them to press it.
 *
 * Renders the card and the captions as siblings, each placed by its className
 * in the parent (the store page): on the real widget the captions are a pill
 * at the bottom centre of the page, not part of the card. Sized in em: the
 * card is 18em wide (the real 288px at 16px), drawn at its real size so the
 * avatar canvas stays sharp.
 */

type Word = { text: string; beat: number };

/** "I help [1:find it], …" → words, each with the beat (0 = none) it lights. */
const parseLine = (line: string): Word[] => {
  const words: Word[] = [];
  for (const m of line.matchAll(/\[(\d):([^\]]+)\](\S*)|(\S+)/g)) {
    if (m[4]) {
      words.push({ text: m[4], beat: 0 });
      continue;
    }
    const part = m[2].split(" ");
    part.forEach((text, k) => words.push({ text: k === part.length - 1 ? text + m[3] : text, beat: Number(m[1]) }));
  }
  return words;
};

/** Speech pace, and how long each line stays up after its last word. */
const MS_PER_WORD = 300;
const HOLD_MS = 1300;
/** After "press play": the invite rests on screen before the agent starts over. */
const INVITE_REST_MS = 6000;
const START_DELAY_MS = 500;
/** A load slower than this and the agent starts over the still render anyway. */
const LIVE_WAIT_MS = 15000;
/** The real widget's rotating composer placeholders, typed one character every 24 ms. */
const PLACEHOLDERS = [
  "Help me find the right product.",
  "Compare the best options for me.",
  "Will this fit or work for my needs?",
  "Can you answer a shopping question?",
];

const Placeholder = () => {
  const [at, setAt] = useState({ i: 0, n: 0 });
  useEffect(() => {
    const text = PLACEHOLDERS[at.i];
    const t = window.setTimeout(
      () => setAt(at.n < text.length ? { ...at, n: at.n + 1 } : { i: (at.i + 1) % PLACEHOLDERS.length, n: 0 }),
      at.n < text.length ? 24 : 3600,
    );
    return () => window.clearTimeout(t);
  }, [at]);
  return <>{PLACEHOLDERS[at.i].slice(0, at.n)}</>;
};

type Step = { line: Word[]; gesture?: string; invite?: boolean };

const HeroAgent = ({
  paused = false,
  onBeat,
  onInvite,
  cardClassName,
  captionClassName,
}: {
  /** Hold the agent still and quiet (the film is open). */
  paused?: boolean;
  /** The beat of the word being spoken: 1 find it, 2 trust it, 3 buy it, 0 none. */
  onBeat?: (beat: number) => void;
  /** True while the agent asks for the play button (it can call out). */
  onInvite?: (inviting: boolean) => void;
  cardClassName?: string;
  captionClassName?: string;
}) => {
  const messages = useMessages();
  const steps = useMemo<Step[]>(
    () => [
      { line: parseLine(messages.hero.agentHello), gesture: "waving" },
      { line: parseLine(messages.hero.agentPitch) },
      { line: parseLine(messages.hero.agentInvite), gesture: "presenting_left", invite: true },
    ],
    [messages],
  );
  const still = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // where the agent is: the step, and how many of its words are spoken
  const [at, setAt] = useState({ step: still ? 2 : 0, word: still ? Infinity : 0 });
  const [gesture, setGesture] = useState<{ name: string; key: number } | null>(null);
  const cycle = useRef(0);
  // start talking once the live avatar is up (its greeting wave is the first
  // hello), or at once when only the still render will show
  const [avatar, setAvatar] = useState<"loading" | "live" | "still">("loading");
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setWaited(true), LIVE_WAIT_MS);
    return () => window.clearTimeout(t);
  }, []);
  const ready = avatar !== "loading" || waited;

  useEffect(() => {
    if (paused || still || !ready) return;
    let timer = 0;
    // one word per tick; a finished line holds, then the next step starts
    const run = (step: number, word: number, delay: number) => {
      timer = window.setTimeout(() => {
        const s = steps[step];
        if (word < s.line.length) {
          // the first hello rides the avatar's own greeting wave
          if (word === 0 && s.gesture && !(step === 0 && cycle.current === 0)) {
            setGesture({ name: s.gesture, key: Date.now() });
          }
          setAt({ step, word: word + 1 });
          return run(step, word + 1, MS_PER_WORD);
        }
        setAt({ step, word: Infinity });
        const next = (step + 1) % steps.length;
        if (next === 0) cycle.current += 1;
        run(next, 0, s.invite ? INVITE_REST_MS : HOLD_MS);
      }, delay);
    };
    run(at.step, Number.isFinite(at.word) ? at.word : 0, START_DELAY_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, still, ready, steps]);

  const { line, invite } = steps[at.step];
  const started = at.word > 0;
  const speaking = !paused && !still && Number.isFinite(at.word) && at.word <= line.length;
  const beat = speaking ? (line[at.word - 1]?.beat ?? 0) : 0;
  useEffect(() => onBeat?.(beat), [beat, onBeat]);
  const inviting = Boolean(invite) && started && !paused;
  useEffect(() => onInvite?.(inviting), [inviting, onInvite]);

  return (
    <>
      <div className={cn("bzw w-[18em]", cardClassName)}>
        <div className="bzw-card relative h-[18.5em] rounded-[0.75em] border">
          {/* Volume toggle, top-right */}
          <span
            aria-hidden="true"
            className="absolute right-[0.5em] top-[0.5em] z-10 grid h-[2em] w-[2em] place-items-center rounded-full border border-[#f28c38]/30 bg-[#f28c38]/[0.14] text-[#f28c38]"
          >
            <Volume2 className="h-[1em] w-[1em]" />
          </span>

          {/* The avatar stage, with the speaking glow and rings */}
          <div className="relative h-[14.375em] overflow-visible">
            {speaking && (
              <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[44%]">
                <span className="bzw-glow absolute left-1/2 top-1/2 h-[12.4em] w-[12.4em] rounded-full" />
                <span className="bzw-ring absolute left-1/2 top-1/2 h-[9em] w-[9em] rounded-full border-2" />
                <span className="bzw-ring absolute left-1/2 top-1/2 h-[9em] w-[9em] rounded-full border-2 [animation-delay:1.1s]" />
              </span>
            )}
            <div className="absolute inset-0">
              <LiveAvatar
                model="yusuke"
                expression="default"
                // Yusuke's resting eyes are closed arcs: a blink would erase them
                blinks={false}
                speaking={speaking}
                gesture={paused ? null : gesture}
                onStatus={setAvatar}
                fallback={
                  <AgentImage
                    name="support-yusuke"
                    alt=""
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="absolute bottom-0 left-1/2 h-[97%] w-auto -translate-x-1/2"
                  />
                }
              />
            </div>
          </div>

          {/* Composer: typed placeholder and the call button */}
          <div aria-hidden="true" className="px-[0.75em] pb-[0.75em] pt-[0.25em]">
            <div className="flex h-[2.75em] items-center rounded-[1em] border border-black/10 bg-white/60 py-[0.375em] pl-[1em] pr-[0.375em]">
              <span className="min-w-0 flex-1 truncate text-[0.875em] text-neutral-400">
                <Placeholder />
              </span>
              <span className="grid h-[2em] w-[2em] place-items-center rounded-full bg-[#f28c38] text-white shadow-sm">
                <AudioLines className="h-[0.875em] w-[0.875em]" strokeWidth={2.5} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The widget's captions: spoken words solid, the current one bold and glowing */}
      <p
        className={cn(
          "bzw bzw-caption w-max max-w-[min(30em,calc(100vw-2rem))] rounded-[1.5em] px-[1em] py-[0.25em] text-center font-medium leading-snug text-[#171717] transition-opacity duration-300",
          !started && "opacity-0",
          captionClassName,
        )}
      >
        <span className="sr-only">{line.map((w) => w.text).join(" ")}</span>
        <span aria-hidden="true">
          {line.map((w, k) => (
            <span
              key={`${at.step}-${k}`}
              className={cn("relative", k < at.word - 1 ? "opacity-100" : k === at.word - 1 ? "font-bold" : "opacity-50")}
            >
              {k === at.word - 1 && <span className="bzw-word-glow absolute inset-x-[-0.3em] inset-y-[-0.2em] -z-10 rounded-full" />}
              {w.text}
              {k < line.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      </p>
    </>
  );
};

export default HeroAgent;
