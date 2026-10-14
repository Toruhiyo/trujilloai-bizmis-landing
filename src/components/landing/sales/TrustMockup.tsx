import type { CSSProperties } from "react";
import { Check, Feather, ShieldCheck, ShoppingCart, Star, X } from "lucide-react";
import { localeTag, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { span, typed } from "../useRewindLoop";
import { Captions, MobileWidget, SentMessage, captionLength } from "../BizmisWidget";
import { ClayTile } from "../clay";
import type { ClayShape, TINT } from "../clay";
import { PhoneFrame } from "../devices";
import { STORE_URL } from "../visuals";
import { bump, easeOutBack, useScene } from "./hooks";
import { Sentinel } from "./shared";

/** The scene's timeline (ms): typing, send, weighing the four (one card every `card`), the pick, the answer. */
const T = { type: 350, send: 1300, compare: 1650, card: 560, pick: 4050, speak: 4150 };
const MS_PER_WORD = 280;

/** What the agent weighs on each product: weight, reviews, warranty. */
const SPECS = [Feather, Star, ShieldCheck];

const PRODUCTS: {
  shape: ClayShape;
  tint: keyof typeof TINT;
  price: number;
  fits: [boolean, boolean, boolean];
}[] = [
  { shape: "capsule", tint: "sage", price: 42, fits: [false, true, true] },
  { shape: "sphere", tint: "sand", price: 48, fits: [true, true, true] },
  { shape: "cube", tint: "warm", price: 39, fits: [true, false, true] },
  { shape: "egg", tint: "blush", price: 56, fits: [false, false, true] },
];
const BEST = 1;

/**
 * "They trust it" (the decision), on a phone: the shopper asks which one to
 * get, the agent weighs four products like an expert would (weight, reviews,
 * warranty; each gets a tick or a cross), backs the best match out loud in
 * the widget's captions, and the shopper decides: it goes in the cart. The
 * real mobile widget bar, with the avatar's head in its circle; the shopper
 * types the question in it. Follows the scene's time (useScene), so it
 * rewinds as it played.
 */
const TrustMockup = ({ play }: { play?: boolean }) => {
  const m = useMessages();
  const s = m.landing.sales;
  const locale = useLocale();
  const speakLen = captionLength(s.compareCaption, MS_PER_WORD);
  const decideAt = T.speak + speakLen - 900;
  const { t, sentinel, off } = useScene(T.speak + speakLen + 400, play);
  const typing = t >= T.type - 200 && t < T.send;
  const draft = typing ? typed(s.compareQuery, t, T.type, 32) : undefined;
  const press = span(t, T.send - 170, T.send + 60);
  const sent = span(t, T.send, T.compare + 1500);
  const comparing = t >= T.compare && t < T.pick;
  const pick = span(t, T.pick, T.pick + 450);
  const picked = t >= T.pick;
  const speaking = t >= T.speak;
  const decided = span(t, decideAt, decideAt + 420);
  const money = new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency: s.pulse.currency,
    maximumFractionDigits: 0,
  });

  return (
    <div className="sl-trust relative">
      <Sentinel ref={sentinel} off={off} />
      <PhoneFrame url={STORE_URL} className="w-full">
        {/* the store's page heading */}
        <div aria-hidden="true" className="space-y-2 px-5 pt-4">
          <div className="bzl-tile-line h-3.5 w-1/2" />
          <div className="bzl-tile-line w-1/4" />
        </div>
        <div className="grid grid-cols-2 gap-3 px-4 pt-4">
          {PRODUCTS.map((p, i) => {
            const best = i === BEST;
            const at = T.compare + i * T.card;
            const scan = bump(t, at, 700);
            const lift = best ? easeOutBack(pick) : pick;
            return (
              <div
                key={i}
                className={cn("sl-trust-card relative rounded-2xl p-2.5", best && picked && "is-best")}
                style={
                  {
                    opacity: best ? 1 : 1 - 0.6 * pick,
                    transform: `scale(${best ? 1 + 0.04 * lift : 1 - 0.03 * pick})`,
                    boxShadow: best && picked
                      ? `0 0 0 ${2 * pick}px var(--bzl-orange), 0 18px 34px -18px rgb(236 119 9 / ${0.65 * pick})`
                      : scan > 0
                        ? `0 0 0 2px rgb(242 140 56 / ${0.55 * scan})`
                        : undefined,
                  } as CSSProperties
                }
              >
                <ClayTile
                  shape={p.shape}
                  tint={picked && best ? "orange" : p.tint}
                  className="w-full"
                />
                <div className="mt-2 flex items-center gap-2" aria-hidden="true">
                  <span className="bzl-tile-line h-2.5 flex-1" />
                  <span className="text-[13px] font-semibold tabular-nums text-[var(--bzl-fg)]">
                    {money.format(p.price)}
                  </span>
                </div>
                <ul className="mt-2.5 space-y-1.5" aria-hidden="true">
                  {SPECS.map((Icon, k) => {
                    const ok = p.fits[k];
                    const mark = easeOutBack(span(t, at + 220 + k * 110, at + 520 + k * 110));
                    return (
                      <li key={k} className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 flex-shrink-0 text-[#b3a497]" strokeWidth={2} />
                        <span className="bzl-tile-line h-[6px] flex-1" />
                        <span
                          className={cn(
                            "sl-trust-mark grid h-4 w-4 flex-shrink-0 place-items-center rounded-full",
                            ok ? "is-ok" : "is-no",
                          )}
                          style={{ opacity: Math.min(1, mark * 2), transform: `scale(${0.4 + 0.6 * mark})` }}
                        >
                          {ok ? (
                            <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                          ) : (
                            <X className="h-2.5 w-2.5" strokeWidth={3.5} />
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {best && (
                  <span
                    className="sl-trust-badge"
                    aria-hidden={!picked}
                    style={(() => {
                      const k = easeOutBack(span(t, T.pick + 150, T.pick + 500));
                      return { opacity: Math.min(1, k * 2), scale: `${0.6 + 0.4 * k}` };
                    })()}
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                    {s.bestMatch}
                  </span>
                )}
                {best && (
                  <span
                    className="sl-trust-added"
                    aria-hidden={decided === 0}
                    style={(() => {
                      const k = easeOutBack(decided);
                      return { opacity: Math.min(1, k * 2), scale: `${0.7 + 0.3 * k}`, translate: `-50% ${6 * (1 - k)}px` };
                    })()}
                  >
                    <ShoppingCart className="h-3 w-3" strokeWidth={2.5} />
                    {s.decided}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <MobileWidget
          head="mia"
          speaking={speaking && t < T.speak + speakLen - 2 * MS_PER_WORD}
          working={comparing}
          placeholder={m.landing.widget.placeholder}
          draft={draft}
          press={press}
          above={
            speaking ? (
              <div className="flex justify-center">
                <Captions
                  text={s.compareCaption}
                  at={t - T.speak}
                  msPerWord={MS_PER_WORD}
                  className="sl-cap sl-cap-phone"
                />
              </div>
            ) : sent > 0 && sent < 1 ? (
              <SentMessage text={s.compareQuery} k={sent} className="sl-sent" />
            ) : undefined
          }
        />
      </PhoneFrame>
    </div>
  );
};

export default TrustMockup;
