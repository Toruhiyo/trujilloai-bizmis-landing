import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import {
  Clock,
  FileSearch,
  Globe,
  MessageCircle,
  Pause,
  Phone,
  Play,
  Search,
  ShoppingCart,
  User,
  Volume2,
  X,
  Check,
} from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { formatDuration, timeStringToSeconds } from "@/lib/utils/time";
import {
  saleGiftSessionReplayData,
  saleLoyalCustomerSessionReplayData,
  supportFailedRequestSessionReplayData,
  supportPolicyQuestionSessionReplayData,
} from "@/data/session-replays";
import type { SessionReplayData } from "@/data/session-replays";

/**
 * The classic landing's conversation replays (TabbedSessionReplay +
 * SessionReplayCard + ConversationAudioPlayer), adapted to the film's style.
 * A replay is a recorded voice call: the call audio plays with its event
 * markers, and the transcript is all there at once (it's a recording, not a
 * live chat), its lines lighting up as the audio reaches them.
 */

const SESSIONS: { id: string; data: SessionReplayData }[] = [
  { id: "sale", data: saleGiftSessionReplayData },
  { id: "sale-loyal", data: saleLoyalCustomerSessionReplayData },
  { id: "support-success", data: supportPolicyQuestionSessionReplayData },
  { id: "support-failed", data: supportFailedRequestSessionReplayData },
];

const WAVE = [
  30, 45, 60, 35, 50, 40, 65, 25, 55, 70, 35, 45, 30, 60, 40, 50, 35, 45, 55,
  40, 60, 35, 50, 45, 40, 55, 30, 65, 40, 50, 35, 45, 60, 30, 55, 40, 50, 35,
  45, 60,
];

const GIFT_RESULTS = [
  {
    name: "Cozy Candle Set",
    description: "Scented • €35",
    image: "/images/benefit-3-session-replay-cozy-candle-set.png",
  },
  {
    name: "Artisan Candles",
    description: "Natural Wax • €28",
    image: "/images/benefit-3-session-replay-candles.png",
  },
  {
    name: "Insulated Mug",
    description: "Ceramic • €18",
    image: "/images/benefit-3-session-replay-insulated-mug.png",
  },
];
const COFFEE_RESULTS = [
  {
    name: "French Press",
    description: "Borosilicate • €45",
    image: "/images/benefit-3-session-replay-french-press.png",
  },
  {
    name: "Copper Travel Mug",
    description: "Insulated • €32",
    image: "/images/benefit-3-session-replay-insulated-travel-mug.png",
  },
  {
    name: "Ethiopian Beans",
    description: "Premium Roast • €25",
    image: "/images/benefit-3-session-replay-ethiopian-beans.png",
  },
];

const fmt = (t: number) =>
  `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

/** The recorded call: play/pause, waveform with event markers, playhead. */
const CallAudio = ({
  data,
  onTime,
}: {
  data: SessionReplayData;
  onTime: (t: number, playing: boolean) => void;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(data.durationSeconds || 78);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const meta = () => Number.isFinite(a.duration) && setDuration(a.duration);
    const tick = () => {
      setTime(a.currentTime);
      onTime(a.currentTime, !a.paused);
    };
    const end = () => {
      setPlaying(false);
      setTime(0);
      onTime(0, false);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("loadedmetadata", meta);
    a.addEventListener("timeupdate", tick);
    a.addEventListener("ended", end);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("loadedmetadata", meta);
      a.removeEventListener("timeupdate", tick);
      a.removeEventListener("ended", end);
    };
  }, [onTime]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => undefined);
    else a.pause();
  };

  const seek = (e: ReactMouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a) return;
    const r = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - r.left) / r.width) * duration;
    setTime(a.currentTime);
    onTime(a.currentTime, !a.paused);
  };

  const progress = duration ? time / duration : 0;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[var(--bzl-card)] p-3 sm:p-4">
      <audio ref={audioRef} src={data.audioUrl} preload="metadata" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-[linear-gradient(180deg,var(--bzl-orange),var(--bzl-orange-strong))] text-white shadow-[0_8px_18px_-8px_rgba(236,119,9,0.7)]"
      >
        {playing ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="ml-0.5 h-4 w-4 fill-current" />
        )}
      </button>
      <div className="relative h-12 flex-1 cursor-pointer" onClick={seek}>
        <div className="pointer-events-none absolute inset-0 flex items-center gap-[3px] px-1">
          {WAVE.map((h, i) => (
            <i
              key={i}
              className="flex-1 rounded-full bg-[var(--bzl-orange-strong)] transition-opacity duration-300"
              style={{
                height: `${h}%`,
                opacity: i <= progress * WAVE.length ? 0.9 : 0.22,
              }}
            />
          ))}
        </div>
        {data.conversationMarks
          .filter((m) => m.type === "event")
          .map((m) => {
            const label = m.label.toLowerCase();
            const Icon = label.includes("policy")
              ? FileSearch
              : label.includes("search")
                ? Search
                : ShoppingCart;
            return (
              <span
                key={m.time}
                className="pointer-events-none absolute top-0 h-full w-px bg-[var(--bzl-orange-dark)]"
                style={{ left: `${(m.time / duration) * 100}%` }}
              >
                <span className="absolute -left-2.5 -top-2 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-[var(--bzl-orange-dark)] text-white">
                  <Icon className="h-2.5 w-2.5" />
                </span>
              </span>
            );
          })}
        <span
          className="pointer-events-none absolute top-0 h-full w-0.5 bg-[var(--bzl-fg)]"
          style={{ left: `${progress * 100}%` }}
        />
      </div>
      <span className="hidden text-xs font-medium tabular-nums text-[var(--bzl-muted)] sm:block">
        {fmt(time)} / {fmt(duration)}
      </span>
    </div>
  );
};

const ReplayCard = ({ data }: { data: SessionReplayData }) => {
  const m = useMessages().sessionReplay;
  const [focused, setFocused] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const coffee = data.conversations.some((c) =>
    /coffee|french press|subscription|beans/i.test(c.content),
  );

  const onTime = useCallback(
    (t: number, playing: boolean) => {
      if (!playing) return setFocused(null);
      let id: string | null = null;
      for (const c of data.conversations) {
        if (timeStringToSeconds(c.time) <= t) id = c.id;
        else break;
      }
      if (id && id !== focused) {
        setFocused(id);
        const el = refs.current[id];
        const list = listRef.current;
        if (el && list)
          list.scrollTo({
            top: el.offsetTop - list.clientHeight / 2 + el.clientHeight / 2,
            behavior: "smooth",
          });
      }
    },
    [data.conversations, focused],
  );

  const ring = (id: string) =>
    focused === id
      ? "ring-2 ring-[var(--bzl-orange)] shadow-[0_10px_30px_-12px_rgba(236,119,9,0.6)]"
      : "";

  return (
    <div className="bzl-window p-5 sm:p-7">
      <div
        className={cn(
          "mb-5 h-1 rounded-full",
          data.success
            ? "bg-[linear-gradient(90deg,var(--bzl-orange),transparent)]"
            : "bg-[linear-gradient(90deg,#c9c9ce,transparent)]",
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-tight tracking-[-0.02em] text-[var(--bzl-fg)]">
            {data.title}
          </h3>
          <p
            className={cn(
              "mt-1 text-xs font-bold uppercase tracking-wider",
              data.success
                ? "text-[var(--bzl-orange-dark)]"
                : "text-[var(--bzl-faint)]",
            )}
          >
            {data.success ? `✓ ${m.successful}` : `⚠ ${m.unresolved}`}
          </p>
        </div>
        <span className="rounded-full border border-[var(--bzl-border)] px-3 py-1 text-xs font-semibold text-[var(--bzl-ink-2)]">
          {data.category}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-[var(--bzl-border)] pb-4 text-xs text-[var(--bzl-muted)]">
        <span className="flex items-center gap-1.5 font-medium">
          <User className="h-3 w-3" />
          {data.customer.name || m.anonymousCustomer}
          {data.customer.isLoyal && (
            <span className="rounded-full bg-[var(--bzl-orange-wash)] px-1.5 py-0.5 font-semibold text-[var(--bzl-orange-dark)]">
              {m.vip}
            </span>
          )}
        </span>
        <span className="flex items-center gap-1.5">
          <Globe className="h-3 w-3" />
          {data.language}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {formatDuration(data.durationSeconds)}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="h-3 w-3" />
          {data.messageCount}
        </span>
      </div>

      <div className="mt-4">
        <CallAudio key={data.audioUrl} data={data} onTime={onTime} />
      </div>

      <div className="relative mt-4">
        <div
          ref={listRef}
          className="relative max-h-[min(22rem,max(9rem,calc(100svh-33rem)))] space-y-3 overflow-y-auto pb-10 pr-1"
        >
          {data.conversations.map((c) => (
            <div key={c.id} ref={(el) => (refs.current[c.id] = el)}>
              {c.type === "event" ? (
                <div
                  className={cn(
                    "rounded-2xl border border-[var(--bzl-border)] bg-[#fffaf4] p-3.5 transition-all duration-500",
                    ring(c.id),
                  )}
                >
                  <p className="flex items-center gap-2 text-sm font-semibold text-[var(--bzl-fg)]">
                    {c.content === "Policy Lookup" ? (
                      <FileSearch className="h-4 w-4 text-[var(--bzl-orange-dark)]" />
                    ) : c.content === "Add to Cart" ? (
                      <ShoppingCart className="h-4 w-4 text-[var(--bzl-orange-dark)]" />
                    ) : (
                      <Search className="h-4 w-4 text-[var(--bzl-orange-dark)]" />
                    )}
                    {c.content}
                    <span className="ml-auto text-xs font-normal text-[var(--bzl-faint)]">
                      {c.time}
                    </span>
                  </p>
                  {c.content === "Product Search" && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {(coffee ? COFFEE_RESULTS : GIFT_RESULTS).map((p) => (
                        <div
                          key={p.name}
                          className="rounded-xl bg-white p-2 ring-1 ring-[var(--bzl-border)]"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            loading="lazy"
                            className="aspect-[4/3] w-full rounded-lg object-cover"
                          />
                          <p className="mt-1.5 truncate text-[11px] font-semibold text-[var(--bzl-fg)]">
                            {p.name}
                          </p>
                          <p className="truncate text-[10px] text-[var(--bzl-muted)]">
                            {p.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {c.content === "Policy Lookup" && (
                    <p className="mt-2 text-xs text-[var(--bzl-muted)]">
                      Shipping coverage · Rural Alaska · Not serviceable
                    </p>
                  )}
                  {c.content === "Add to Cart" && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--bzl-orange-dark)]">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      Item added to cart
                    </p>
                  )}
                </div>
              ) : (
                <div
                  className={cn(
                    "flex items-end gap-2",
                    c.type === "customer" ? "justify-end" : "justify-start",
                  )}
                >
                  {c.type === "agent" && (
                    <img
                      src="/landing/agents/support-yusuke-360.webp"
                      alt=""
                      className="h-7 w-7 flex-shrink-0 rounded-full bg-[var(--bzl-orange-wash)] object-cover object-[50%_12%]"
                    />
                  )}
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm transition-all duration-500",
                      c.type === "agent"
                        ? "rounded-bl-md bg-[var(--bzl-orange-wash)] text-[var(--bzl-fg)]"
                        : "rounded-br-md bg-[var(--bzl-card)] text-[var(--bzl-fg)]",
                      ring(c.id),
                    )}
                  >
                    {c.type === "agent" && (
                      <Volume2
                        className="mb-0.5 mr-1.5 inline h-3.5 w-3.5 text-[var(--bzl-orange-dark)]"
                        aria-hidden="true"
                      />
                    )}
                    {c.content}
                    <span className="mt-0.5 block text-[10px] text-[var(--bzl-faint)]">
                      {c.time}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="flex flex-col items-center pt-4 text-center">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--bzl-orange-wash)] text-[var(--bzl-orange-dark)]">
              <Phone className="h-4 w-4" />
            </span>
            <p className="mt-2 text-xs text-[var(--bzl-muted)]">
              {formatDuration(data.durationSeconds)}
            </p>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white to-transparent"
        />
      </div>
      <p className="mt-2 text-center text-[11px] text-[var(--bzl-faint)]">
        {m.transcriptNote}
      </p>
    </div>
  );
};

const SessionReplay = () => {
  const m = useMessages().sessionReplay;
  const tips: Record<string, string> = {
    sale: m.tabTooltips.sale,
    "sale-loyal": m.tabTooltips.saleLoyal,
    "support-success": m.tabTooltips.supportSuccess,
    "support-failed": m.tabTooltips.supportFailed,
  };
  const [active, setActive] = useState(SESSIONS[0].id);
  const data = SESSIONS.find((s) => s.id === active)?.data ?? SESSIONS[0].data;
  return (
    <div className="w-full min-w-0">
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1" role="tablist">
        {SESSIONS.map((s) => {
          const on = s.id === active;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={on}
              title={tips[s.id]}
              onClick={() => setActive(s.id)}
              className={cn(
                "relative flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-300",
                on
                  ? "bg-white text-[var(--bzl-orange-dark)] shadow-[0_8px_22px_-10px_rgba(236,119,9,0.55)] ring-1 ring-[color-mix(in_oklab,var(--bzl-orange)_40%,transparent)]"
                  : "text-[var(--bzl-muted)] hover:text-[var(--bzl-fg)]",
              )}
            >
              {s.data.category === "Sale"
                ? m.categories.sale
                : m.categories.support}
              {s.data.success ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : (
                <X className="h-3.5 w-3.5" strokeWidth={3} />
              )}
              {s.data.customer.name && (
                <span className="rounded-full bg-[var(--bzl-orange-wash)] px-1.5 text-[10px] text-[var(--bzl-orange-dark)]">
                  {m.vip}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <ReplayCard key={active} data={data} />
    </div>
  );
};

export default SessionReplay;
