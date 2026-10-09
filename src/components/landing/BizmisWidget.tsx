import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { AudioLines, Navigation, ShoppingCart, Volume2, X } from "lucide-react";
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
 * Above the card, as in the widget: the "Taking you to" banner with its
 * countdown, and the shopper's sent message floating away. Nothing here is UI
 * the real widget doesn't have.
 */

export type WidgetState = "idle" | "speaking" | "working" | "call";

const ORANGE = "#f28c38";

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

/** "Taking you to …" / "Adding to cart …" with its countdown ring. */
export const NavBanner = ({
  heading,
  target,
  cart = false,
  seconds = 3,
}: {
  heading: string;
  target: string;
  cart?: boolean;
  seconds?: number;
}) => {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    const t = window.setInterval(
      () => setLeft((v) => (v <= 1 ? seconds : v - 1)),
      1000,
    );
    return () => window.clearInterval(t);
  }, [seconds]);
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
          className="block text-[9px] font-semibold uppercase tracking-wider opacity-90"
          style={{ color: ORANGE }}
        >
          {heading}
        </span>
        <span className="block truncate text-xs font-semibold text-[#171717]">
          {target}
        </span>
      </span>
      <span className="relative grid h-[26px] w-[26px] flex-shrink-0 place-items-center">
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
            strokeDashoffset={c * (1 - left / seconds)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <span className="text-[10px] font-semibold" style={{ color: ORANGE }}>
          {left}
        </span>
      </span>
    </div>
  );
};

/** The shopper's sent message, as the widget shows it: above the card, then floating away. */
export const SentMessage = ({ text }: { text: string }) => (
  <p
    key={text}
    className="bzw-sent ml-auto w-fit max-w-[85%] rounded-2xl px-3.5 py-2 text-sm text-white shadow-sm"
    style={{ background: ORANGE }}
  >
    {text}
  </p>
);

const BizmisWidget = ({
  agent,
  state = "idle",
  tool,
  placeholder = "Help me find the right product.",
  above,
  live,
  talking,
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
  /** Mouth moving (live avatar only); defaults to the speaking state. */
  talking?: boolean;
  /** Icon at the tip of the working laser (the tool being used). */
  tool?: LucideIcon;
  placeholder?: string;
  /** The widget's overlay stack above the card (banner, sent message). */
  above?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) => {
  const Tool = tool;
  const still = (
    <AgentImage
      name={agent}
      alt=""
      sizes="160px"
      className="absolute bottom-0 left-1/2 h-[224px] w-auto -translate-x-1/2"
    />
  );
  return (
    <div className={cn("bzw relative w-[288px]", className)} style={style}>
      {above && (
        <div className="absolute bottom-full left-0 right-0 z-20 mb-2.5 flex flex-col gap-2.5">
          {above}
        </div>
      )}

      <div className="bzw-card relative h-[296px] rounded-xl border">
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
          {live ? (
            <div className="absolute inset-0">
              <LiveAvatar
                model={live}
                speaking={talking ?? state === "speaking"}
                fallback={still}
              />
            </div>
          ) : (
            still
          )}
        </div>

        {/* Composer */}
        <div className="px-3 pb-3 pt-1">
          <div className="flex h-[44px] items-center rounded-2xl border border-black/10 bg-white/60 py-1.5 pl-4 pr-1.5">
            <span className="min-w-0 flex-1 truncate text-sm text-neutral-400">
              {state === "call" ? "" : <Typewriter text={placeholder} />}
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
              <span
                className="grid h-8 w-8 place-items-center rounded-full text-white shadow-sm"
                style={{ background: ORANGE }}
              >
                <AudioLines className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BizmisWidget;

/**
 * The widget's captions: a glass pill at the bottom centre of the page, one
 * chunk (≤ 8 words) at a time, spoken words solid with the current one bold
 * and glowing, upcoming words faded — timed like speech, then the next chunk.
 */
export const Captions = ({
  text,
  msPerWord = 320,
  className,
  onSpeaking,
}: {
  text: string;
  msPerWord?: number;
  className?: string;
  /** True while a line is being spoken, false in the pause after it. */
  onSpeaking?: (speaking: boolean) => void;
}) => {
  const all = text.split(/\s+/);
  const chunks: string[][] = [];
  for (let k = 0; k < all.length; k += 8) chunks.push(all.slice(k, k + 8));
  const [pos, setPos] = useState({ chunk: 0, word: 0 });
  useEffect(() => {
    setPos({ chunk: 0, word: 0 });
    const t = window.setInterval(
      () =>
        setPos((p) => {
          const len = chunks[p.chunk].length;
          if (p.word < len + 2) return { ...p, word: p.word + 1 }; // hold the finished line briefly
          return { chunk: (p.chunk + 1) % chunks.length, word: 0 };
        }),
      msPerWord,
    );
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, msPerWord]);
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
 * The real widget on a phone (trujilloai-bizmis-widget MobileLiteChat, "bar"
 * layout): a floating glass bar at the foot of the screen with its drag
 * handle, the avatar's head in a circle (a ring pulses while it speaks), the
 * Volume toggle, the typed placeholder and the call button. Banners and
 * captions stack above it, as on the real thing.
 */
export const MobileWidget = ({
  agent,
  speaking = false,
  placeholder = "Help me find the right product.",
  above,
}: {
  agent: AgentName;
  speaking?: boolean;
  placeholder?: string;
  above?: ReactNode;
}) => (
  <div className="bzw absolute inset-x-2 bottom-2 z-20">
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
        <span className="relative h-[42px] w-[42px] flex-shrink-0">
          {speaking && (
            <span
              aria-hidden="true"
              className="bzw-ring-mobile absolute inset-0 rounded-full border-2"
              style={{ borderColor: ORANGE }}
            />
          )}
          <span
            className="absolute inset-0 overflow-hidden rounded-full"
            style={{ background: `color-mix(in oklab, ${ORANGE} 16%, #fff)` }}
          >
            <AgentImage
              name={agent}
              alt=""
              sizes="80px"
              className="absolute left-1/2 top-[-14%] w-[135%] -translate-x-1/2"
            />
          </span>
        </span>
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
        <span className="min-w-0 flex-1 truncate px-1 text-sm text-neutral-400">
          <Typewriter text={placeholder} />
        </span>
        <span
          className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-white shadow-sm"
          style={{ background: ORANGE }}
        >
          <AudioLines className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
      </div>
    </div>
  </div>
);
