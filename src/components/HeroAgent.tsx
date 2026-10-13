import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Play, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages } from "@/i18n/LocaleProvider";
import AgentImage from "./landing/AgentImage";
import LiveAvatar from "./landing/LiveAvatar";

/**
 * The hero's agent (BIZ-423): the real Bizmis widget's card, hero-sized and
 * finished a step further (deeper glass, a warm light on the stage), with the
 * live 3D avatar in the Bizmis shirt. It talks to the visitor in the widget's
 * captions, voice-style, never in chat bubbles: it says hello, says what it
 * does (each of "find it", "trust it", "buy it" lights the hero subtitle's
 * word as it is spoken), then beckons and asks them to press play. The
 * composer is the play button: its call button became a pulsing play.
 *
 * Sized in em: the parent sets the font size, so the card (18em wide, as the
 * real 288px card at 16px) is drawn at its real size and the avatar canvas
 * stays sharp, never scaled up.
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
/** Without WebGL (or on a slow load) the agent speaks over the still render. */
const LIVE_WAIT_MS = 6000;

type Step = { line: Word[]; gesture?: string; invite?: boolean };

const HeroAgent = forwardRef<
  HTMLButtonElement,
  {
    /** Hold the agent still and quiet (the film is open). */
    paused?: boolean;
    /** The beat of the word being spoken: 1 find it, 2 trust it, 3 buy it, 0 none. */
    onBeat?: (beat: number) => void;
    onPlay: (event: MouseEvent<HTMLButtonElement>) => void;
    className?: string;
  }
>(({ paused = false, onBeat, onPlay, className }, playRef) => {
  const messages = useMessages();
  const steps = useMemo<Step[]>(
    () => [
      { line: parseLine(messages.hero.agentHello), gesture: "waving" },
      { line: parseLine(messages.hero.agentPitch) },
      { line: parseLine(messages.hero.agentInvite), gesture: "beckon", invite: true },
    ],
    [messages],
  );
  const still = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // where the agent is: the step, and how many of its words are spoken
  const [at, setAt] = useState({ step: still ? 2 : 0, word: still ? Infinity : 0 });
  const [gesture, setGesture] = useState<{ name: string; key: number } | null>(null);
  const cycle = useRef(0);
  // start talking once the live avatar is up (its greeting wave is the first hello)
  const [live, setLive] = useState(false);
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setWaited(true), LIVE_WAIT_MS);
    return () => window.clearTimeout(t);
  }, []);
  const ready = live || waited;

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
  const speaking = !paused && !still && Number.isFinite(at.word) && at.word <= line.length;
  const current = speaking ? line[at.word - 1] : undefined;
  const beat = current?.beat ?? 0;
  useEffect(() => onBeat?.(beat), [beat, onBeat]);
  const inviting = Boolean(invite);

  return (
    <div className={cn("bzw relative w-[18em]", className)}>
      {/* the widget's captions, floating above the card as its overlays do: spoken words solid, the current one bold and glowing */}
      <p
        aria-live="off"
        className={cn(
          "bzw-caption absolute bottom-full left-1/2 z-20 mb-[0.9em] w-max max-w-[min(24em,calc(100vw-2rem))] -translate-x-1/2 rounded-[1.1em] px-[1em] py-[0.4em] text-center text-[0.95em] font-medium leading-snug text-[#171717] transition-opacity duration-300",
          at.word === 0 && "opacity-0",
        )}
      >
        <span className="sr-only">{line.map((w) => w.text).join(" ")}</span>
        <span aria-hidden="true">
          {line.map((w, k) => (
            <span
              key={`${at.step}-${k}`}
              className={cn("relative", k < at.word - 1 ? "opacity-100" : k === at.word - 1 ? "font-bold" : "opacity-40")}
            >
              {k === at.word - 1 && <span className="bzw-word-glow absolute inset-x-[-0.3em] inset-y-[-0.2em] -z-10 rounded-full" />}
              {w.text}
              {k < line.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      </p>
      <div className="bzw-card bza-card relative h-[18.5em] rounded-[1.25em] border">
        {/* Volume toggle, top-right, as on the real card */}
        <span
          aria-hidden="true"
          className="absolute right-[0.5em] top-[0.5em] z-10 grid h-[2em] w-[2em] place-items-center rounded-full border border-[#f28c38]/30 bg-[#f28c38]/[0.14] text-[#f28c38]"
        >
          <Volume2 className="h-[1em] w-[1em]" />
        </span>

        {/* The stage: a warm light behind the avatar, the speaking glow and rings */}
        <div className="bza-stage relative h-[14.375em] overflow-visible rounded-t-[1.25em]">
          <span aria-hidden="true" className="bza-light pointer-events-none absolute inset-0 rounded-t-[1.25em]" />
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
              speaking={speaking}
              gesture={paused ? null : gesture}
              onLiveChange={setLive}
              fallback={
                <AgentImage
                  name="support-yusuke"
                  alt=""
                  sizes="(min-width: 1024px) 26vw, 60vw"
                  className="absolute bottom-0 left-1/2 h-[97%] w-auto -translate-x-1/2"
                />
              }
            />
          </div>
        </div>

        {/* The composer is the play button: its placeholder asks, its call button plays */}
        <div className="px-[0.75em] pb-[0.75em] pt-[0.25em]">
          <button
            ref={playRef}
            type="button"
            onClick={onPlay}
            aria-label={messages.film.watch}
            className="group/play flex h-[2.75em] w-full items-center rounded-[1em] border border-black/10 bg-white/70 py-[0.375em] pl-[1em] pr-[0.375em] text-left transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
          >
            <span className="min-w-0 flex-1 truncate text-[0.875em] text-neutral-500">{messages.hero.agentPlaceholder}</span>
            <span
              data-play
              className={cn(
                "relative grid h-[2em] w-[2em] flex-shrink-0 place-items-center rounded-full bg-[#f28c38] text-white shadow-sm transition-transform duration-300 group-hover/play:scale-110",
                inviting && "bza-invite",
              )}
            >
              <span aria-hidden="true" className="bza-play-ring absolute inset-0 rounded-full" />
              <Play className="ml-[0.1em] h-[0.95em] w-[0.95em] fill-current" aria-hidden="true" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});
HeroAgent.displayName = "HeroAgent";

export default HeroAgent;
