import type { CSSProperties } from "react";
import { Check, Feather, PackageCheck, Ruler, X } from "lucide-react";
import { localeTag, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { Captions, MobileWidget, SentMessage } from "../BizmisWidget";
import { ClayTile } from "../clay";
import type { ClayShape, TINT } from "../clay";
import { PhoneFrame } from "../devices";
import { STORE_URL } from "../visuals";
import { useBeats, useOnScreen } from "./hooks";

/** idle, the shopper asks, the agent weighs all four, one gets picked. */
const BEATS = [1100, 1700, 2600, 4800];

/** What the agent checks on each product: weight, the shopper's size, stock. */
const SPECS = [Feather, Ruler, PackageCheck];

const PRODUCTS: {
  shape: ClayShape;
  tint: keyof typeof TINT;
  price: number;
  fits: [boolean, boolean, boolean];
}[] = [
  { shape: "capsule", tint: "sage", price: 42, fits: [false, true, true] },
  { shape: "sphere", tint: "sand", price: 48, fits: [true, true, true] },
  { shape: "cube", tint: "warm", price: 39, fits: [true, false, true] },
  { shape: "egg", tint: "blush", price: 56, fits: [false, true, false] },
];
const BEST = 1;

/**
 * "They trust it", on a phone: the shopper asks which one to get, the agent
 * weighs four products on what matters to them (weight, their size, stock;
 * each gets a tick or a cross), and one is picked as the best match, said
 * out loud in the widget's captions. The real mobile widget bar, with the
 * avatar's head in its circle.
 */
const TrustMockup = ({ play }: { play?: boolean }) => {
  const m = useMessages();
  const s = m.landing.sales;
  const locale = useLocale();
  const [ref, onScreen] = useOnScreen<HTMLDivElement>(0.4);
  const beat = useBeats(BEATS, play ?? onScreen);
  const asked = beat >= 1;
  const comparing = beat === 2;
  const picked = beat === 3;
  const money = new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency: s.pulse.currency,
    maximumFractionDigits: 0,
  });

  return (
    <div ref={ref} className="sl-trust">
      <PhoneFrame url={STORE_URL} className="w-full">
        {/* the store's page heading */}
        <div aria-hidden="true" className="space-y-2 px-5 pt-4">
          <div className="bzl-tile-line h-3.5 w-1/2" />
          <div className="bzl-tile-line w-1/4" />
        </div>
        <div className="grid grid-cols-2 gap-3 px-4 pt-4">
          {PRODUCTS.map((p, i) => {
            const best = i === BEST;
            return (
              <div
                key={i}
                className={cn(
                  "sl-trust-card relative rounded-2xl p-2.5",
                  comparing && "is-scan",
                  (comparing || picked) && "is-marked",
                  picked && (best ? "is-best" : "is-out"),
                )}
                style={{ "--i": i } as CSSProperties}
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
                    return (
                      <li key={k} className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 flex-shrink-0 text-[#b3a497]" strokeWidth={2} />
                        <span className="bzl-tile-line h-[6px] flex-1" />
                        <span
                          className={cn(
                            "sl-trust-mark grid h-4 w-4 flex-shrink-0 place-items-center rounded-full",
                            ok ? "is-ok" : "is-no",
                          )}
                          style={{ "--k": k } as CSSProperties}
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
                  <span className="sl-trust-badge" aria-hidden={!picked}>
                    <Check className="h-3 w-3" strokeWidth={3} />
                    {s.bestMatch}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <MobileWidget
          head="mia"
          speaking={picked}
          working={comparing}
          placeholder={m.landing.widget.placeholder}
          above={
            picked ? (
              <div className="flex justify-center">
                <Captions text={s.compareCaption} className="text-[13px]" />
              </div>
            ) : asked ? (
              <SentMessage text={s.compareQuery} />
            ) : undefined
          }
        />
      </PhoneFrame>
    </div>
  );
};

export default TrustMockup;
