import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { AudioLines, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages } from "@/i18n/LocaleProvider";
import AgentImage from "./landing/AgentImage";
import LiveAvatar from "./landing/LiveAvatar";
import "@/styles/hero-agent.css";

/**
 * The hero's agent (BIZ-423): the real Bizmis widget's card, as it sits on a
 * store (trujilloai-bizmis-widget DesktopLiteChat "card" layout: Volume toggle,
 * the avatar stage with its speaking glow and rings, the composer with its
 * typed placeholder and call button), with the live 3D avatar in the Bizmis
 * shirt. It says hello once, then takes turns: one line on what it does, and
 * the invite, spoken while it points at the play button (the pointing clip's
 * jabs land on "Press play"). It talks in the widget's captions, never in
 * chat bubbles.
 *
 * Renders the card and the captions as siblings, each placed by its className
 * in the parent (the store page): on the real widget the captions are a pill
 * at the bottom centre of the page, not part of the card. Sized in em: the
 * card is 18em wide (the real 288px at 16px), drawn at its real size so the
 * avatar canvas stays sharp.
 */

const words = (line: string) => line.split(/\s+/);

/** Speech pace, and how long each line stays up after its last word. */
const MS_PER_WORD = 300;
const HOLD_MS = 1300;
/** After "press play": the invite rests on screen before the agent points again. */
const INVITE_REST_MS = 5000;
/** The gesture toward play: the shared clip pointing to the avatar's right, the visitor's left, where play is. */
const POINT_AT_PLAY = "pointing_right";
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

/**
 * The invite rides the pointing clip (3 s, jabs at ~0.72 / 1.14 / 1.56 s): the
 * gesture starts first and "Press play" lands on the first jabs, a word every
 * 420 ms, so the agent talks while it points.
 */
const POINT_LEAD_MS = 600;
const POINT_WORD_MS = 420;

type Step = { line: string[]; gesture?: string; invite?: boolean; msPerWord?: number; leadMs?: number };

const HeroAgent = ({
  paused = false,
  onInvite,
  cardClassName,
  captionClassName,
}: {
  /** Hold the agent still and quiet (the film is open). */
  paused?: boolean;
  /** True while the agent asks for the play button (it can call out). */
  onInvite?: (inviting: boolean) => void;
  cardClassName?: string;
  captionClassName?: string;
}) => {
  const messages = useMessages();
  const steps = useMemo<Step[]>(
    () => [
      { line: words(messages.hero.agentHello), gesture: "waving" },
      { line: words(messages.hero.agentPitch) },
      {
        line: words(messages.hero.agentInvite),
        gesture: POINT_AT_PLAY,
        invite: true,
        msPerWord: POINT_WORD_MS,
        leadMs: POINT_LEAD_MS,
      },
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
    const run = (step: number, word: number, delay: number, led = false) => {
      timer = window.setTimeout(() => {
        const s = steps[step];
        if (word < s.line.length) {
          // the first hello rides the avatar's own greeting wave
          if (word === 0 && !led && s.gesture && cycle.current > 0) {
            setGesture({ name: s.gesture, key: Date.now() });
            // the gesture leads, so its beats land on the first words
            if (s.leadMs) return run(step, 0, s.leadMs, true);
          }
          setAt({ step, word: word + 1 });
          return run(step, word + 1, s.msPerWord ?? MS_PER_WORD);
        }
        setAt({ step, word: Infinity });
        // the hello is said once; after it, what it does and the invite take turns
        const next = step === steps.length - 1 ? 1 : step + 1;
        cycle.current += 1;
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
  const inviting = Boolean(invite) && started && !paused;
  useEffect(() => onInvite?.(inviting), [inviting, onInvite]);

  // The captions never wrap: a line wider than the page shrinks to fit instead
  // (a transform, so the pill keeps its place; Tailwind's translate composes it)
  const captionRef = useRef<HTMLParagraphElement>(null);
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const el = captionRef.current;
    if (!el) return;
    const measure = () => {
      const box = (el.offsetParent as HTMLElement | null)?.clientWidth ?? window.innerWidth;
      setFit(Math.min(1, ((box - 32) / el.offsetWidth) * 0.97));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [at.step, messages]);

  return (
    <>
      <div className={cn("bzw bza w-[18em]", cardClassName)}>
        <div className="bzw-card relative h-[18.5em] rounded-[0.75em] border">
          {/* Volume toggle, top-right */}
          <span
            aria-hidden="true"
            className="absolute right-[0.5em] top-[0.5em] z-10 grid h-[2em] w-[2em] place-items-center rounded-full border border-primary/30 bg-primary/[0.14] text-primary"
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
                // the Bizmis orange (the landing's --primary), not the film's deeper orange
                shirtColor="#F9A353"
                expression="default"
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
              <span className="grid h-[2em] w-[2em] place-items-center rounded-full bg-primary text-white shadow-sm">
                <AudioLines className="h-[0.875em] w-[0.875em]" strokeWidth={2.5} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The widget's captions: spoken words solid, the current one bold and glowing */}
      <p
        ref={captionRef}
        style={{ "--tw-scale-x": fit, "--tw-scale-y": fit } as CSSProperties}
        className={cn(
          "bzw bza bzw-caption w-max origin-bottom whitespace-nowrap rounded-[1.5em] px-[1em] py-[0.25em] text-center font-medium leading-snug text-[#171717] transition-opacity duration-300",
          !started && "opacity-0",
          captionClassName,
        )}
      >
        <span className="sr-only">{line.join(" ")}</span>
        <span aria-hidden="true">
          {line.map((w, k) => (
            <span
              key={`${at.step}-${k}`}
              className={cn("relative", k < at.word - 1 ? "opacity-100" : k === at.word - 1 ? "font-bold" : "opacity-50")}
            >
              {k === at.word - 1 && <span className="bzw-word-glow absolute inset-x-[-0.3em] inset-y-[-0.2em] -z-10 rounded-full" />}
              {w}
              {k < line.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      </p>
    </>
  );
};

export default HeroAgent;
