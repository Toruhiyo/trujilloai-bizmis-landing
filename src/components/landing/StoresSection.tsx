import type { CSSProperties } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import Reveal from "./Reveal";

/** The film's store reel, in its order, with each vertical's accent colour. */
const STORES = [
  { img: "skincare", color: "#f8924a" },
  { img: "electronics", color: "#d1001a" },
  { img: "clothing", color: "#e8b800" },
  { img: "books", color: "#29573f" },
  { img: "gaming", color: "#a855f7" },
  { img: "home", color: "#7fa83a" },
  { img: "auto", color: "#e02020" },
  { img: "wine", color: "#701c33" },
];

/** "Whatever your store sells, your Bizmis agent sells it." */
const StoresSection = () => {
  const m = useMessages().landing.stores;
  const cards = STORES.map((s, i) => ({ ...s, label: m.verticals[i] }));
  return (
    <section className="bzl-section overflow-hidden px-0 sm:px-0">
      <div className="bzl-wrap px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="bzl-statement">
            {m.title}
            <br />
            <span className="text-[var(--bzl-orange-strong)]">{m.titleTail}</span>
          </h2>
        </Reveal>
      </div>

      <Reveal delay={150} className="mt-16 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="bzl-marquee py-10">
          {[...cards, ...cards].map((card, i) => (
            <figure
              key={i}
              className="w-[300px] flex-shrink-0 sm:w-[440px]"
              style={{ "--bzl-glow": card.color } as CSSProperties}
              aria-hidden={i >= cards.length}
            >
              <figcaption className="bzl-vertical-label mb-4 text-left">{card.label}</figcaption>
              <div className="bzl-window bzl-glow">
                <img
                  src={`/landing/stores/${card.img}.jpg`}
                  alt={i < cards.length ? card.label : ""}
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
              </div>
            </figure>
          ))}
        </div>
      </Reveal>
    </section>
  );
};

export default StoresSection;
