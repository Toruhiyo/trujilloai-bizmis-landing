import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * The typical store chatbot, as the ad-1 film draws it (its launcher mark,
 * header, quick-reply chips, grey bubbles, "Was this helpful?" row), but live:
 * visitors can type or tap a chip, and it answers the way these bots do —
 * a pause, then a wall of policy text, links, and no help choosing or buying.
 * Purely scripted; nothing typed leaves the page.
 */

type Intent =
  "product" | "track" | "returns" | "contact" | "human" | "confused" | "thanks";
type Msg = {
  id: number;
  from: "user" | "bot";
  text: string;
  links?: string[];
  rate?: boolean;
};

// Loose, multilingual keyword match (en / es / fr / it / ca).
const INTENTS: [Exclude<Intent, "product" | "confused" | "thanks">, RegExp][] =
  [
    [
      "human",
      /\b(human|person|agent|someone|real|humano|persona|agente|humain|conseiller|umano|operatore|humà)/i,
    ],
    [
      "returns",
      /(return|refund|exchange|devol|reembols|cambi|retour|rembours|\bres[oi]\b|rimbors)/i,
    ],
    [
      "track",
      /(track|where is my|tracking|seguir|seguimiento|seguiment|suivi|traccia|shipped|envío|enviament)/i,
    ],
    [
      "contact",
      /(contact|e-?mail|phone|call|teléfono|telèfon|téléphone|telefono|contatt)/i,
    ],
  ];

/** The ad-1 chatbot mark: a speech bubble with two eyes. */
const Mark = ({ className }: { className?: string }) => (
  <svg viewBox="-0.9 0.55 24 24" aria-hidden="true" className={className}>
    <path
      fill="currentColor"
      d="M5.4 3.4h11.4a3.8 3.8 0 0 1 3.8 3.8v7.1a3.8 3.8 0 0 1-3.8 3.8h-4.7L8 21.7v-3.6H5.4a3.8 3.8 0 0 1-3.8-3.8V7.2a3.8 3.8 0 0 1 3.8-3.8z"
    />
    <circle cx="8.7" cy="10.8" r="1.45" fill="#3a3a3a" />
    <circle cx="14.1" cy="10.8" r="1.45" fill="#3a3a3a" />
  </svg>
);

const Thumb = ({ down }: { down?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={cn("h-3.5 w-3.5", down && "rotate-180")}
  >
    <path
      d="M7.5 10.5v9H4.8a.8.8 0 0 1-.8-.8v-7.4a.8.8 0 0 1 .8-.8h2.7zm0 0 3.6-6.2c.4-.7 1.3-1 2-.6.6.3.9 1 .8 1.7l-.6 3.6h5.1a1.6 1.6 0 0 1 1.6 1.9l-1.2 6.6a2 2 0 0 1-2 1.7H7.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const TypicalChatbot = ({
  className,
  onInteract,
  onReply,
}: {
  className?: string;
  onInteract?: () => void;
  /** Each bot reply, with the seconds it would take a shopper to read it. */
  onReply?: (readSeconds: number) => void;
}) => {
  const sw = useMessages().landing.switch;
  const bot = sw.bot;
  // "+38 s of reading", floating up off each reply
  const [chip, setChip] = useState<{ id: number; s: number } | null>(null);
  const [open, setOpen] = useState(true);
  const [log, setLog] = useState<Msg[]>(() => [
    { id: 0, from: "bot", text: bot.greeting },
  ]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [rated, setRated] = useState<Set<number>>(new Set());
  const nextId = useRef(1);
  const unknownCount = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number>();

  // The greeting follows the page language.
  useEffect(() => {
    setLog([{ id: 0, from: "bot", text: bot.greeting }]);
  }, [bot.greeting]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [log, typing]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reply = (intent: Intent) => {
    const answer: Record<Intent, Omit<Msg, "id" | "from">> = {
      product: { text: bot.product, links: bot.productLinks, rate: true },
      track: { text: bot.track, links: bot.trackLinks, rate: true },
      returns: { text: bot.returns, links: bot.returnsLinks, rate: true },
      contact: { text: bot.contact, links: bot.contactLinks, rate: true },
      human: { text: bot.human },
      confused: { text: bot.confused },
      thanks: { text: bot.thanks },
    };
    setTyping(true);
    window.clearTimeout(timer.current);
    // Long enough to feel the wait; the wall of text then lands all at once.
    timer.current = window.setTimeout(
      () => {
        setTyping(false);
        const id = nextId.current++;
        setLog((l) => [...l, { id, from: "bot", ...answer[intent] }]);
        // at a skimming 200 words a minute
        const words = answer[intent].text.split(/\s+/).length;
        const secs = Math.max(3, Math.round((words / 200) * 60));
        setChip({ id, s: secs });
        onReply?.(secs);
      },
      1300 + Math.random() * 700,
    );
  };

  const ask = (text: string, intent?: Intent) => {
    const t = text.trim();
    if (!t || typing) return;
    onInteract?.();
    setLog((l) => [...l, { id: nextId.current++, from: "user", text: t }]);
    const matched = intent ?? INTENTS.find(([, re]) => re.test(t))?.[0];
    if (matched) return reply(matched);
    // Anything else: the wall of text, then "didn't understand", in turns.
    reply(unknownCount.current++ % 2 === 0 ? "product" : "confused");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(draft);
    setDraft("");
  };

  const rate = (id: number) => {
    if (rated.has(id)) return;
    setRated((r) => new Set(r).add(id));
    onInteract?.();
    reply("thanks");
  };

  const chipIntents: Intent[] = ["track", "returns", "contact"];

  return (
    <div
      className={cn(
        "flex flex-col items-end font-[Inter,system-ui,sans-serif] text-[#5a5a5a]",
        className,
      )}
    >
      {chip && (
        <span
          key={chip.id}
          aria-hidden="true"
          className="bzl-read-chip pointer-events-none absolute -top-2 left-5 z-10 rounded-full bg-[#3a3a3a] px-2.5 py-1 text-[12px] font-semibold text-white shadow-[0_8px_18px_-8px_rgba(0,0,0,0.5)]"
        >
          {sw.patience.reading.replace("{s}", String(chip.s))}
        </span>
      )}
      {open ? (
        <div className="flex h-full w-full flex-col overflow-hidden rounded-[18px] border border-[#e6e6e6] bg-white shadow-[0_18px_50px_rgba(32,36,44,0.16)]">
          {/* header */}
          <div className="flex items-center justify-between gap-3 border-b border-[#e6e6e6] px-3.5 py-3">
            <span className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#3a3a3a] text-white">
                <Mark className="h-5 w-5" />
              </span>
              <span className="text-base font-semibold text-[#5a5a5a]">
                {bot.title}
              </span>
            </span>
            <button
              type="button"
              aria-label={bot.close}
              onClick={() => setOpen(false)}
              className="grid h-7 w-7 place-items-center rounded-md text-[#5a5a5a]/50 hover:text-[#5a5a5a]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* log */}
          <div
            ref={logRef}
            aria-live="polite"
            className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3.5 py-3 text-[13px] leading-[1.45]"
          >
            {log.map((m) =>
              m.from === "user" ? (
                <p
                  key={m.id}
                  className="max-w-[85%] self-end rounded-[14px_14px_4px_14px] bg-[#3a3a3a] px-2.5 py-1.5 text-white"
                >
                  {m.text}
                </p>
              ) : (
                <div
                  key={m.id}
                  className="max-w-full self-start rounded-[4px_14px_14px_14px] bg-[#f2f2f2] px-2.5 py-2"
                >
                  <p>{m.text}</p>
                  {m.links && (
                    <span className="mt-1.5 flex flex-col items-start gap-0.5">
                      {m.links.map((l) => (
                        <span
                          key={l}
                          className="text-[12.5px] underline underline-offset-2"
                        >
                          {l}
                        </span>
                      ))}
                    </span>
                  )}
                  {m.rate && (
                    <span className="mt-2 flex items-center gap-2 border-t border-black/[0.07] pt-1.5 text-[12px] text-[#8e8e8e]">
                      <span className="mr-auto">{bot.helpful}</span>
                      {[false, true].map((down) => (
                        <button
                          key={String(down)}
                          type="button"
                          aria-label={down ? "👎" : "👍"}
                          disabled={rated.has(m.id)}
                          onClick={() => rate(m.id)}
                          className="grid h-6 w-6 place-items-center rounded-full bg-black/[0.04] text-[#5a5a5a]/70 hover:bg-black/[0.08] disabled:opacity-50"
                        >
                          <Thumb down={down} />
                        </button>
                      ))}
                    </span>
                  )}
                </div>
              ),
            )}
            {typing && (
              <p
                className="flex w-fit gap-1 rounded-[4px_12px_12px_12px] bg-[#f2f2f2] px-2.5 py-2"
                aria-hidden="true"
              >
                {[0, 140, 280].map((d) => (
                  <i
                    key={d}
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5a5a5a]/40"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </p>
            )}
          </div>

          {/* chips */}
          <div className="flex flex-wrap gap-1.5 px-3.5 pb-2">
            {bot.chips.map((c, i) => (
              <button
                key={c}
                type="button"
                onClick={() => ask(c, chipIntents[i])}
                className="rounded-full border border-[#e6e6e6] px-2.5 py-1 text-[12px] hover:bg-[#f7f7f7]"
              >
                {c}
              </button>
            ))}
          </div>

          {/* composer */}
          <form
            onSubmit={submit}
            className="flex items-center gap-2 border-t border-[#e6e6e6] px-3.5 py-2.5"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onFocus={onInteract}
              placeholder={bot.placeholder}
              aria-label={bot.placeholder}
              maxLength={200}
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#3a3a3a] outline-none placeholder:text-[#8e8e8e]"
            />
            <button
              type="submit"
              aria-label={bot.send}
              className="grid h-7 w-7 place-items-center text-[#5a5a5a] disabled:opacity-40"
              disabled={!draft.trim() || typing}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          aria-label={bot.open}
          onClick={() => setOpen(true)}
          className="mt-auto grid h-14 w-14 place-items-center rounded-full bg-[#3a3a3a] text-white shadow-[0_12px_28px_rgba(28,28,28,0.22)]"
        >
          <Mark className="h-7 w-7" />
        </button>
      )}
    </div>
  );
};

export default TypicalChatbot;
