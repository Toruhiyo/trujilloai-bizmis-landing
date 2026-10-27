import { memo, useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUp, AudioLines, Navigation, ShoppingCart, Volume2, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import AgentImage from "./AgentImage";
import LiveAvatar from "./LiveAvatar";
import type { AgentName } from "./AgentImage";

/**
 * A still-life of the real Bizmis storefront widget (trujilloai-bizmis-widget,
 * DesktopLiteChat "card" layout): the glass card, the waist-up avatar on its
 * stage, the Volume toggle top-right, and the composer pill with its typed
 * placeholder and single call button. States mirror the widget's own:
 * speaking (glow + two expanding rings), working (an orbiting "laser" carrying
 * the tool's icon), and a live call (the call button becomes the grey hang-up).
 * The speaking pulse follows the voice (`talking`): on while words are said,
 * fading out in the pauses between lines.
 * Above the card, as in the widget: the "Taking you to" banner with its
 * countdown, and the shopper's sent message floating away. Nothing here is UI
 * the real widget doesn't have.
 */

export type WidgetState = "idle" | "speaking" | "working" | "call";

/** The true Bizmis primary (#F9A353), as the real widget themes it. */
const ORANGE = "hsl(var(--primary))";

/** The widget's typed placeholder: one character every 24 ms. */
const Typewriter = ({ text }: { text: string }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const t = window.setInterval(
      () => setN((v) => (v >= text.length ? v : v + 1)),
      24,
    );
    return () => window.clearInterval(t);
  }, [text]);
  return <>{text.slice(0, n)}</>;
};

/**
 * What the composer shows: the typed placeholder, or (with `draft` set) what
 * the shopper is typing, with the caret. An empty draft is a focused, empty
 * bar (caret only).
 */
const ComposerText = ({ placeholder, draft }: { placeholder: string; draft?: string }) =>
  draft === undefined ? (
    <span className="text-neutral-400">
      <Typewriter text={placeholder} />
    </span>
  ) : (
    <span className="text-neutral-800">
      {draft}
      <span className="bzw-caret" aria-hidden="true" />
    </span>
  );

/**
 * The composer's button, as the real ChatInputBar swaps it: the call button
 * while the bar is empty, the send arrow once there's a draft. `press` (0..1)
 * squeezes it as it's tapped.
 */
const ComposerButton = ({ draft, press = 0 }: { draft?: string; press?: number }) => (
  <span
    aria-hidden="true"
    className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-white shadow-sm"
    style={{
      background: ORANGE,
      transform: press ? `scale(${(1 - 0.16 * Math.sin(Math.PI * press)).toFixed(3)})` : undefined,
    }}
  >
    {draft ? (
      <ArrowUp className="h-4 w-4" strokeWidth={2.75} />
    ) : (
      <AudioLines className="h-3.5 w-3.5" strokeWidth={2.5} />
    )}
  </span>
);

/** The composer pill's border: the accent while the shopper types in it. */
const composerBorder = (draft?: string) =>
  draft !== undefined ? "border-[color:hsl(var(--primary)/0.55)]" : "border-black/10";

/** "Taking you to …" / "Adding to cart …" with its countdown ring. */
export const NavBanner = ({
  heading,
  target,
  cart = false,
  seconds = 3,
  progress,
}: {
  heading: string;
  target: string;
  cart?: boolean;
  seconds?: number;
  /** 0..1 through the countdown, for a timeline that drives it (else it ticks on its own). */
  progress?: number;
}) => {
  const [ticking, setLeft] = useState(seconds);
  const left =
    progress === undefined ? ticking : Math.max(1, Math.ceil(seconds * (1 - Math.min(1, Math.max(0, progress)))));
  const ring = progress === undefined ? left / seconds : 1 - Math.min(1, Math.max(0, progress));
  const timed = progress !== undefined;
  useEffect(() => {
    if (timed) return;
    setLeft(seconds);
    const t = window.setInterval(
      () => setLeft((v) => (v <= 1 ? seconds : v - 1)),
      1000,
    );
    return () => window.clearInterval(t);
  }, [seconds, timed]);
  const Icon = cart ? ShoppingCart : Navigation;
  const r = 10.5;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="flex items-center gap-2 rounded-2xl border px-2.5 py-2 backdrop-blur-md"
      style={{
        borderColor: `color-mix(in oklab, ${ORANGE} 30%, transparent)`,
        background: `linear-gradient(135deg, color-mix(in oklab, ${ORANGE} 16%, transparent) 0%, color-mix(in oklab, ${ORANGE} 5%, transparent) 55%, color-mix(in oklab, ${ORANGE} 10%, transparent) 100%)`,
        boxShadow: "0 12px 28px -16px rgb(28 24 20 / 0.3)",
      }}
    >
      <span
        className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full"
        style={{
          background: `color-mix(in oklab, ${ORANGE} 14%, transparent)`,
          color: ORANGE,
        }}
      >
        <Icon className="h-3 w-3" strokeWidth={2.25} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block text-[0.5625rem] font-semibold uppercase tracking-wider opacity-90"
          style={{ color: ORANGE }}
        >
          {heading}
        </span>
        <span className="block truncate text-xs font-semibold text-[#171717]">
          {target}
        </span>
      </span>
      <span className="relative grid h-[1.625rem] w-[1.625rem] flex-shrink-0 place-items-center">
        <svg viewBox="0 0 26 26" className="absolute inset-0 -rotate-90">
          <circle
            cx="13"
            cy="13"
            r={r}
            fill="none"
            stroke={ORANGE}
            strokeOpacity="0.25"
            strokeWidth="2.5"
          />
          <circle
            cx="13"
            cy="13"
            r={r}
            fill="none"
            stroke={ORANGE}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - ring)}
            style={progress === undefined ? { transition: "stroke-dashoffset 1s linear" } : undefined}
          />
        </svg>
        <span className="text-[0.625rem] font-semibold" style={{ color: ORANGE }}>
          {left}
        </span>
      </span>
    </div>
  );
};

/**
 * The shopper's sent message, as the widget shows it: above the card, then
 * floating away. With `k` (0..1 through its life) a timeline drives it, in
 * the widget's own curve (in by 12%, held to 55%, then up and out), so it
 * can play backwards too.
 */
export const SentMessage = ({ text, k, className }: { text: string; k?: number; className?: string }) => {
  let style: CSSProperties = { background: ORANGE };
  if (k !== undefined) {
    const opacity = k <= 0 || k >= 1 ? 0 : k < 0.12 ? k / 0.12 : k < 0.55 ? 1 : 1 - (k - 0.55) / 0.45;
    const y = k < 0.12 ? 8 * (1 - Math.max(0, k) / 0.12) : k < 0.55 ? 0 : -14 * ((Math.min(1, k) - 0.55) / 0.45);
    style = { ...style, opacity, transform: `translateY(${y.toFixed(2)}px)` };
  }
  return (
    <p
      key={text}
      className={cn(
        k === undefined && "bzw-sent",
        "ml-auto w-fit max-w-[85%] rounded-2xl px-3.5 py-2 text-sm text-white shadow-sm",
        className,
      )}
      style={style}
    >
      {text}
    </p>
  );
};

/** The avatar on its stage: memoised, so a timeline re-rendering the widget every frame leaves the 3D alone. */
const AvatarStage = memo(
  ({
    agent,
    live,
    shirtColor,
    talking,
    paused,
  }: {
    agent: AgentName;
    live?: string;
    shirtColor: string;
    talking: boolean;
    paused?: boolean;
  }) => {
    const still = (
      <AgentImage
        name={agent}
        alt=""
        sizes="160px"
        className="absolute bottom-0 left-1/2 h-[14rem] w-auto -translate-x-1/2"
      />
    );
    return live ? (
      <div className="absolute inset-0">
        <LiveAvatar model={live} shirtColor={shirtColor} speaking={talking} fallback={still} paused={paused} />
      </div>
    ) : (
      still
    );
  },
);
AvatarStage.displayName = "AvatarStage";

const BizmisWidget = ({
  agent,
  state = "idle",
  tool,
  placeholder = "Help me find the right product.",
  draft,
  press,
  above,
  live,
  paused,
  talking,
  shirtColor = "#F9A353",
  className,
  style,
}: {
  agent: AgentName;
  state?: WidgetState;
  /**
   * The real widget's live 3D avatar (its CDN model name, e.g. "amber"), in
   * place of the static render — which stays as the fallback and placeholder.
   */
  live?: string;
  /** The live avatar kept but not drawing (a mockup that isn't the one playing). */
  paused?: boolean;
  /**
   * The voice: lips moving (live avatar) and the speaking pulse (glow +
   * rings), e.g. from the captions' timing (captionVoice). Defaults to the
   * speaking state.
   */
  talking?: boolean;
  /** The live avatar's shirt (default: the Bizmis outfit's orange). */
  shirtColor?: string;
  /** Icon at the tip of the working laser (the tool being used). */
  tool?: LucideIcon;
  placeholder?: string;
  /** What the shopper is typing in the composer (caret shown); undefined shows the placeholder. */
  draft?: string;
  /** 0..1, the send button being tapped. */
  press?: number;
  /** The widget's overlay stack above the card (banner, sent message). */
  above?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) => {
  const Tool = tool;
  const voice = talking ?? state === "speaking";
  return (
    <div className={cn("bzw relative w-[18rem]", className)} style={style}>
      {above && (
        <div className="absolute bottom-full left-0 right-0 z-20 mb-2.5 flex flex-col gap-2.5">
          {above}
        </div>
      )}

      <div className="bzw-card relative h-[18.5rem] rounded-xl border">
        {/* Volume toggle, top-right (always visible on the real card) */}
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

        {/* Avatar stage */}
        <div className="relative h-[14.375rem] overflow-visible">
          {(state === "speaking" || talking !== undefined) && state !== "working" && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
              style={{ opacity: voice ? 1 : 0 }}
            >
              <span className="bzw-glow absolute left-1/2 top-1/2 h-[12.375rem] w-[12.375rem] -translate-x-1/2 -translate-y-1/2 rounded-full" />
              <span className="bzw-ring absolute left-1/2 top-1/2 h-[9rem] w-[9rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-2" />
              <span className="bzw-ring absolute left-1/2 top-1/2 h-[9rem] w-[9rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 [animation-delay:1.1s]" />
            </span>
          )}
          {state === "working" && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[44%] h-[12.5rem] w-[12.5rem] -translate-x-1/2 -translate-y-1/2"
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
          <AvatarStage
            agent={agent}
            live={live}
            shirtColor={shirtColor}
            talking={voice}
            paused={paused}
          />
        </div>

        {/* Composer */}
        <div className="px-3 pb-3 pt-1">
          <div
            className={cn(
              "flex h-[2.75rem] items-center rounded-2xl border bg-white/60 py-1.5 pl-4 pr-1.5 transition-colors duration-200",
              composerBorder(draft),
            )}
          >
            <span className="bzw-composer min-w-0 flex-1 truncate text-sm">
              {state === "call" ? (
                ""
              ) : (
                <ComposerText placeholder={placeholder} draft={draft} />
              )}
            </span>
            {state === "call" ? (
              <span
                className="grid h-8 w-8 place-items-center rounded-full"
                style={{
                  background: "hsl(0 0% 3.9% / 0.12)",
                  color: "hsl(0 0% 3.9% / 0.62)",
                }}
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </span>
            ) : (
              <ComposerButton draft={draft} press={press} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BizmisWidget;

/** Up to 8 words per caption chunk, breaking at sentence ends where it can (so "This one." stands alone). */
export const captionChunks = (text: string, max = 8) => {
  const sentences = text.split(/(?<=[.!?…])\s+/).map((x) => x.split(/\s+/).filter(Boolean));
  const chunks: string[][] = [];
  let cur: string[] = [];
  for (const words of sentences) {
    if (cur.length && cur.length + words.length > max) {
      chunks.push(cur);
      cur = [];
    }
    if (words.length > max) {
      // a long sentence: even pieces of at most `max`
      const n = Math.ceil(words.length / max);
      const size = Math.ceil(words.length / n);
      for (let k = 0; k < words.length; k += size) chunks.push(words.slice(k, k + size));
    } else cur = cur.concat(words);
  }
  if (cur.length) chunks.push(cur);
  return chunks;
};

/** Words held after a chunk is fully spoken, before the next one. */
const CAPTION_HOLD = 2;

/** How long `text` takes to say as captions (ms): every chunk, with its hold. */
export const captionLength = (text: string, msPerWord = 320) =>
  captionChunks(text).reduce((sum, c) => sum + (c.length + CAPTION_HOLD + 1) * msPerWord, 0);

/** True while a word is being said `at` ms into the captions (not in the pauses between lines): drives the speaking pulse and the lips. */
export const captionVoice = (text: string, at: number, msPerWord = 320) => {
  if (at < 0) return false;
  const chunks = captionChunks(text);
  if (at >= captionLength(text, msPerWord)) return false;
  const pos = captionAt(chunks, at, msPerWord);
  return pos.word <= (chunks[pos.chunk]?.length ?? 0);
};

/** Where the captions are `at` ms in: which chunk, and how many of its words are out (the last one being said). */
const captionAt = (chunks: string[][], at: number, msPerWord: number) => {
  let rest = Math.max(0, at);
  for (let c = 0; c < chunks.length; c++) {
    const len = (chunks[c].length + CAPTION_HOLD + 1) * msPerWord;
    if (rest < len || c === chunks.length - 1)
      return { chunk: c, word: Math.min(chunks[c].length + CAPTION_HOLD, Math.floor(rest / msPerWord) + 1) };
    rest -= len;
  }
  return { chunk: 0, word: 0 };
};

/**
 * The widget's captions: a glass pill at the bottom centre of the page, one
 * chunk (≤ 8 words, split at sentence ends) at a time, spoken words solid
 * with the current one bold and glowing, upcoming words faded — timed like
 * speech, then the next chunk. On its own it loops; given `at` (ms since it
 * started speaking) a timeline drives it instead: it plays once, rests on
 * the last line, and plays backwards when the timeline does.
 */
export const Captions = ({
  text,
  msPerWord = 320,
  at,
  className,
  onSpeaking,
}: {
  text: string;
  msPerWord?: number;
  /** ms since the line started, from a timeline (see useRewindLoop). */
  at?: number;
  className?: string;
  /** True while a line is being spoken, false in the pause after it. */
  onSpeaking?: (speaking: boolean) => void;
}) => {
  const chunks = captionChunks(text);
  const [self, setPos] = useState({ chunk: 0, word: 0 });
  useEffect(() => {
    if (at !== undefined) return;
    setPos({ chunk: 0, word: 0 });
    const t = window.setInterval(
      () =>
        setPos((p) => {
          const len = chunks[p.chunk].length;
          if (p.word < len + CAPTION_HOLD) return { ...p, word: p.word + 1 }; // hold the finished line briefly
          return { chunk: (p.chunk + 1) % chunks.length, word: 0 };
        }),
      msPerWord,
    );
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, msPerWord, at === undefined]);
  const pos = at === undefined ? self : captionAt(chunks, at, msPerWord);
  const words = chunks[pos.chunk] ?? [];
  const i = pos.word;
  const speaking = i <= words.length;
  useEffect(() => {
    onSpeaking?.(speaking);
  }, [speaking, onSpeaking]);
  return (
    <p
      className={cn(
        "bzw-caption w-fit max-w-[46rem] rounded-3xl px-4 py-1 text-center font-medium leading-snug text-[#171717]",
        className,
      )}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, k) => (
          <span
            key={`${pos.chunk}-${k}`}
            className={cn(
              "relative transition-opacity duration-200",
              k < i - 1
                ? "opacity-100"
                : k === i - 1
                  ? "font-bold"
                  : "opacity-50",
            )}
          >
            {k === i - 1 && (
              <span className="bzw-word-glow absolute inset-x-[-0.3em] inset-y-[-0.2em] -z-10 rounded-full" />
            )}
            {w}
            {k < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </p>
  );
};

/**
 * The preset avatars' head renders, as the widget's head circle shows them:
 * only the face with the hair, framed to fill the circle
 * (scripts/render-landing-heads.py; the same images as the app's CDN heads).
 */
const HEAD_CDN = "/landing/heads";

/**
 * The live head's spill room around the circle (fraction of its size, each
 * side): as in the real widget the circle is a backdrop, not a mask, so hair
 * and ears may overhang it; only below its equator is the head cut to the
 * circle (the neck ends at its rim instead of hanging under it).
 */
const HEAD_SPILL = 0.35;

/**
 * The speaking pulse around a small head, made to be seen (the voice is the
 * point): a breathing glow, three rings expanding out of the circle and the
 * widget's own ring breathing on its rim, in the Bizmis primary. Stays
 * mounted and fades with `on`, so pauses between lines read as silence.
 */
const HeadPulse = ({ on, size }: { on: boolean; size: number }) => (
  <span
    aria-hidden="true"
    className={cn("bzw-hpulse", on && "is-on", size < 60 && "is-small")}
  >
    <span className="bzw-hpulse-glow" />
    <span className="bzw-hpulse-ring" />
    <span className="bzw-hpulse-ring" />
    <span className="bzw-hpulse-ring" />
    <span className="bzw-hpulse-rim" />
  </span>
);

/**
 * The widget's head circle (AvatarHeadCircle): the avatar's head on a faint
 * disc. The speaking pulse (HeadPulse) plays around it while it speaks;
 * while it works, the activity laser orbits the circle. With `live`, the
 * real 3D avatar, HEAD body group only (LiveAvatar headOnly: face, hair and
 * head accessories, no shoulders or shirt), blinking and moving its lips
 * while it `speaking`, as the real widget's bar does; the preset's head
 * render shows until it's drawn, or instead of it (no WebGL, reduced
 * motion). Only mount `live` where it plays: each one is a canvas.
 */
export const HeadCircle = ({
  head,
  size,
  speaking = false,
  working = false,
  live = false,
  paused = false,
  className,
}: {
  /** The preset avatar id, e.g. "mia" (also its live model's name). */
  head: string;
  size: number;
  speaking?: boolean;
  working?: boolean;
  /** The live 3D head instead of the still. */
  live?: boolean;
  /** The live head kept but not drawing. */
  paused?: boolean;
  className?: string;
}) => {
  const [drawn, setDrawn] = useState(false);
  const showLive = live && drawn;
  const pad = Math.round(size * HEAD_SPILL);
  const outer = size + 2 * pad;
  const r = size / 2;
  // everything above the circle's centre line, plus the circle itself
  const spillMask = `radial-gradient(circle at 50% 50%, #000 ${r - 0.25}px, transparent ${r + 0.5}px), linear-gradient(#000, #000)`;
  return (
    <span
      className={cn("relative block flex-shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <HeadPulse on={speaking && !working} size={size} />
      {working && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[0.3125rem]"
        >
          <span className="bzw-spinner absolute inset-0">
            <span className="bzw-laser absolute inset-0 rounded-full" />
          </span>
        </span>
      )}
      <span
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{ background: `color-mix(in oklab, ${ORANGE} 12%, #f4efe9)` }}
      >
        <img
          src={`${HEAD_CDN}/${head}.webp`}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full"
          style={{ opacity: showLive ? 0 : 1, transition: "opacity 0.4s ease" }}
        />
      </span>
      {live && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: -pad,
            top: -pad,
            width: outer,
            height: outer,
            WebkitMaskImage: spillMask,
            maskImage: spillMask,
            WebkitMaskSize: `100% 100%, 100% ${pad + r}px`,
            maskSize: `100% 100%, 100% ${pad + r}px`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "0 0, 0 0",
            maskPosition: "0 0, 0 0",
          }}
        >
          <span className="absolute" style={{ left: pad, top: pad, width: size, height: size }}>
            <LiveAvatar
              model={head}
              shirtColor="#F9A353"
              expression="default"
              greet={false}
              headOnly
              speaking={speaking}
              onStatus={(st) => setDrawn(st === "live")}
              fallback={null}
              paused={paused}
            />
          </span>
        </span>
      )}
    </span>
  );
};

/** The widget's Volume toggle (voice on): accent ring, soft accent fill. */
const AudioToggle = () => (
  <span
    aria-hidden="true"
    className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border"
    style={{
      borderColor: `color-mix(in oklab, ${ORANGE} 30%, transparent)`,
      background: `color-mix(in oklab, ${ORANGE} 14%, transparent)`,
      color: ORANGE,
    }}
  >
    <Volume2 className="h-4 w-4" />
  </span>
);

/**
 * The real widget on a phone (trujilloai-bizmis-widget MobileLiteChat, "bar"
 * layout): a floating glass bar at the foot of the screen with its drag
 * handle, the avatar's head in a 42px circle (a ring pulses while it speaks),
 * the Volume toggle, the typed placeholder and the call button. Banners and
 * captions stack above it, as on the real thing.
 */
export const MobileWidget = ({
  head,
  speaking = false,
  working = false,
  placeholder = "Help me find the right product.",
  draft,
  press,
  live = false,
  paused = false,
  above,
}: {
  /** The preset avatar id, e.g. "mia". */
  head: string;
  /** The agent's voice is audible: lips and the speaking pulse around the head. */
  speaking?: boolean;
  working?: boolean;
  /** The live 3D head in the circle (mount it only where it plays). */
  live?: boolean;
  /** The live head kept but not drawing. */
  paused?: boolean;
  placeholder?: string;
  /** What the shopper is typing (caret shown); undefined shows the placeholder. */
  draft?: string;
  /** 0..1, the send button being tapped. */
  press?: number;
  above?: ReactNode;
}) => (
  <div className="bzw absolute inset-x-3 bottom-3 z-20">
    {above && (
      <div className="absolute bottom-full left-0 right-0 mb-2 flex flex-col items-stretch gap-2">
        {above}
      </div>
    )}
    <div className="bzw-card relative rounded-3xl border pt-4">
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1.5 h-1 w-8 -translate-x-1/2 rounded-full bg-black/15"
      />
      <div className="flex items-center gap-1.5 px-2 pb-2">
        <HeadCircle head={head} size={42} speaking={speaking} working={working} live={live} paused={paused} />
        <AudioToggle />
        <span className="bzw-composer min-w-0 flex-1 truncate px-1 text-sm">
          <ComposerText placeholder={placeholder} draft={draft} />
        </span>
        <ComposerButton draft={draft} press={press} />
      </div>
    </div>
  </div>
);

/**
 * The real widget's desktop "bar" layout (DesktopLiteChat, layout "bar"): a
 * glass pill centred on the page's bottom edge, the 88px head capping its
 * left end (overhanging the pill by the same amount top, bottom and left),
 * the Volume toggle, the typed placeholder and the call button. The overlay
 * stack (banners, the shopper's sent message) sits above it, right-aligned
 * and at most 22rem wide, as on the real thing. Lay it out in a box that is
 * as wide as the bar should be.
 */
export const BarWidget = ({
  head,
  speaking = false,
  working = false,
  placeholder = "Help me find the right product.",
  draft,
  press,
  live = false,
  paused = false,
  above,
  className,
}: {
  head: string;
  /** The agent's voice is audible: lips and the speaking pulse around the head. */
  speaking?: boolean;
  working?: boolean;
  /** The live 3D head capping the bar (mount it only where it plays). */
  live?: boolean;
  /** The live head kept but not drawing. */
  paused?: boolean;
  placeholder?: string;
  /** What the shopper is typing (caret shown); undefined shows the placeholder. */
  draft?: string;
  /** 0..1, the send button being tapped. */
  press?: number;
  above?: ReactNode;
  className?: string;
}) => (
  <div className={cn("bzw relative flex flex-col items-stretch gap-2.5", className)}>
    {above && (
      <div className="ml-auto flex w-full max-w-[22rem] flex-col gap-2.5">
        {above}
      </div>
    )}
    <div
      className={cn(
        "bzw-card bzw-bar relative flex items-center gap-1.5 rounded-full border px-2 py-1.5",
        draft !== undefined && "is-typing",
      )}
    >
      <HeadCircle
        head={head}
        size={88}
        speaking={speaking}
        working={working}
        live={live}
        paused={paused}
        className="relative z-10 -my-[1.625rem] -ml-[1.5625rem]"
      />
      <AudioToggle />
      <span className="bzw-composer min-w-0 flex-1 truncate px-2 py-2 text-sm leading-5">
        <ComposerText placeholder={placeholder} draft={draft} />
      </span>
      <ComposerButton draft={draft} press={press} />
    </div>
  </div>
);
