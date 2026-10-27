import { FileSearch, PackageSearch, Search, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import type { Messages } from "@/i18n/messages/en";
import { cn } from "@/lib/utils";
import BizmisWidget, { Captions, SentMessage, captionLength, captionVoice } from "../BizmisWidget";
import { ClayTile } from "../clay";
import { BrowserFrame } from "../devices";
import { span, typed } from "../useRewindLoop";
import { STORE_URL } from "../visuals";

/**
 * The Support section's device: a store's product page with the real Bizmis
 * widget (the live 3D avatar, its render as the fallback), playing one
 * support case as the widget plays it: the shopper types the question in
 * the composer and sends it (it floats above the card), the agent works the
 * store (the tool on its laser), then answers out loud: the speaking pulse,
 * the lips, and the words as captions at the page's foot. Never a text reply
 * from the agent. A desktop browser (on phones too, scaled down).
 *
 * Purely a frame of its clock (`t`, ms along the case's timeline,
 * supportCase): the section drives it by the scroll, with the at-scale
 * drawing beside it, so it rewinds as it played. `replay` picks the case
 * (each replay, the next one).
 */

/** The widget's tool on its laser, for each support case. */
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
const TYPE_AT = 700; // the shopper starts typing
const TYPE_MAX = 1500; // typing never takes longer than this
const SEND_GAP = 260; // a beat before they hit send
const SENT_MS = 2400; // the sent message floats above the card, then away
const WORK_MS = 1400; // the agent works the store
const MS_PER_WORD = 270;
const END_REST = 600;

type Cases = Messages["supportDemo"]["cases"];
export type CaseKey = keyof Cases;

/** A case's words (the quote without its quotation marks) and its timeline. */
export const supportCase = (cases: Cases, key: CaseKey) => {
  const c = cases[key];
  const quote = c.quote.replace(/^["“«]\s*|\s*["”»]$/g, "");
  const msPerChar = Math.min(32, TYPE_MAX / Math.max(1, quote.length));
  const sendAt = TYPE_AT + quote.length * msPerChar + SEND_GAP;
  const speakAt = sendAt + WORK_MS;
  const speechEnd = speakAt + captionLength(c.response, MS_PER_WORD);
  return { key, quote, response: c.response, msPerChar, sendAt, speakAt, speechEnd, duration: speechEnd + END_REST };
};
export type SupportCase = ReturnType<typeof supportCase>;

/** The product page behind the widget: a big product tile, its lines, the add-to-cart. */
const Page = ({ addToCart }: { addToCart: string }) => (
    <div aria-hidden="true" className="absolute inset-0">
      <div className="flex h-[64px] items-center gap-4 border-b border-[#f3ece4] px-10">
        <span className="h-7 w-7 rounded-lg bg-[#e6dccf]" />
        <span className="bzl-tile-line h-3 w-24" />
        <span className="ml-10 flex gap-6">
          <span className="bzl-tile-line w-14" />
          <span className="bzl-tile-line w-12" />
          <span className="bzl-tile-line w-16" />
        </span>
        <span className="ml-auto flex h-9 w-56 items-center gap-2 rounded-full bg-[#f6f0e9] px-3 text-[#b5a797]">
          <Search className="h-4 w-4" />
          <span className="bzl-tile-line w-24" />
        </span>
      </div>
      <div className="absolute left-10 top-[104px] w-[380px]">
        <ClayTile shape="egg" tint="blush" />
      </div>
      <div className="absolute left-[460px] top-[118px] w-[330px] space-y-3.5">
        <div className="bzl-tile-line h-4 w-4/5" />
        <div className="bzl-tile-line w-2/5" />
        <div className="h-5 w-20 rounded-md bg-[#d9d4cc]" />
        <div className="space-y-2.5 pt-3">
          <div className="bzl-tile-line w-full" />
          <div className="bzl-tile-line w-11/12" />
          <div className="bzl-tile-line w-3/4" />
        </div>
        <div className="!mt-7 grid h-11 place-items-center rounded-xl bg-[hsl(var(--primary))] text-[15px] font-semibold text-white">
          {addToCart}
        </div>
      </div>
    </div>
  );

const SupportStore = ({
  c,
  t,
  active = true,
  className,
}: {
  /** The case playing (supportCase). */
  c: SupportCase;
  /** ms along its timeline. */
  t: number;
  /** On screen and playing: the live avatar draws (kept mounted, paused otherwise). */
  active?: boolean;
  className?: string;
}) => {
  const m = useMessages();

  const typing = t >= TYPE_AT - 200 && t < c.sendAt;
  const draft = typing ? typed(c.quote, t, TYPE_AT, c.msPerChar) : undefined;
  const press = span(t, c.sendAt - 140, c.sendAt + 60);
  const sent = span(t, c.sendAt, c.sendAt + SENT_MS);
  const working = t >= c.sendAt + 150 && t < c.speakAt;
  const speaking = t >= c.speakAt;
  // the voice: exactly while words are being said (the pulse, the lips)
  const voice = captionVoice(c.response, t - c.speakAt, MS_PER_WORD);
  const tool = TOOLS[c.key];
  const above = sent > 0 && sent < 1 ? <SentMessage text={c.quote} k={sent} /> : undefined;
  const caption = speaking && (
    <Captions
      text={c.response}
      at={t - c.speakAt}
      msPerWord={MS_PER_WORD}
      className="bzs-cap"
    />
  );

  return (
    <div className={cn("bzs-device", className)}>
      <BrowserFrame url={STORE_URL}>
        <Page addToCart={m.landing.sales.cart.add} />
        {/* the agent's words, as the widget's captions at the page's foot */}
        {caption && <div className="absolute bottom-6 left-0 flex w-[820px] justify-center px-6">{caption}</div>}
        <div className="bzs-widget absolute bottom-6 right-6 z-10">
          <BizmisWidget
            agent="support-yusuke"
            live="yusuke"
            paused={!active}
            state={working ? "working" : speaking ? "speaking" : "idle"}
            talking={voice}
            tool={tool}
            placeholder={m.landing.support.placeholder}
            draft={draft}
            press={press}
            above={above}
          />
        </div>
      </BrowserFrame>
    </div>
  );
};

export default SupportStore;
