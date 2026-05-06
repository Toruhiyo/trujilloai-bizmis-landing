import { useEffect, useRef, useState } from "react";
import {
  FaCheck,
  FaStar,
  FaShoppingBag,
  FaChevronRight,
  FaMicrophone,
} from "react-icons/fa";
import CustomerVoiceCard from "./CustomerVoiceCard";
import Waveform from "./Waveform";

const INTERSECTION_THRESHOLD = 0.3;
const WAVEFORM_BARS = 32;
const BRIDGE_WAVEFORM_TALKING_OPACITY = 0.2;
const BRIDGE_WAVEFORM_SILENT_OPACITY = 0.2;
const AVATAR_WAVEFORM_ROW_OPACITY = 0.48;
const MOBILE_CUSTOMER_QUOTE = '"Looking for a birthday gift."';
const MOBILE_ORDER_PILL_LABEL = "Order Confirmed · French Press Kit · $89";
const WAVEFORM_HEIGHTS = [
  32, 52, 68, 42, 72, 48, 62, 36, 56, 74, 40, 60, 44, 70, 50, 64, 34, 58, 46,
  68, 38, 54, 48, 66, 30, 56, 42, 72, 46, 62, 36, 58,
];
const ENTRANCE_DURATION_MS = 1400;
const ENTRANCE_CUSTOMER_MS = 0;
const ENTRANCE_CENTER_MS = 650;
const ENTRANCE_PRODUCT_OFFSET_MS = 450;
const ENTRANCE_PRODUCT_STAGGER_MS = 320;
const ENTRANCE_RECEIPT_AFTER_LAST_PRODUCT_MS = 320;

const STEPS = [
  { num: 1, label: "Discover & Recommend" },
  { num: 2, label: "Compare Products" },
  { num: 3, label: "Seal the Deal" },
];

const PRODUCTS = [
  {
    name: "Cozy Candle Set",
    price: "$48",
    label: "Popular Choice",
    image: "/images/benefit-3-session-replay-cozy-candle-set.png",
    highlighted: false,
  },
  {
    name: "French Press Kit",
    price: "$89",
    label: "Best Match",
    image: "/images/benefit-3-session-replay-french-press.png",
    highlighted: true,
  },
  {
    name: "Ethiopian Beans",
    price: "$32",
    label: "Great Value",
    image: "/images/benefit-3-session-replay-ethiopian-beans.png",
    highlighted: false,
  },
];

const SpeakDiscoverBuy = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: INTERSECTION_THRESHOLD },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="w-full max-w-6xl mx-auto px-4">
      {/* Minimal step flow: 1 → 2 → 3 */}
      <div className="w-full mb-6 flex items-center justify-center">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:gap-4 text-primary text-[11px] sm:text-sm font-medium">
          {STEPS.map((step, idx) => (
            <span key={step.num} className="flex items-center gap-1.5 sm:gap-2">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-light text-white text-[10px] sm:text-xs font-semibold flex items-center justify-center">
                {step.num}
              </span>
              <span>{step.label}</span>
              {idx < STEPS.length - 1 && (
                <FaChevronRight
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary/60 ml-0.5"
                  aria-hidden
                />
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Mobile layout: same spatial story as desktop (avatar centered, products
          overlapping its lower half) but compact and without the customer/receipt
          cards. The customer line sits as plain italic text next to the avatar's
          head; "Seal the Deal" collapses into a one-line pill below. */}
      <div className="lg:hidden flex flex-col items-center gap-3">
        {/* Scene wrapper: avatar (z-0) is overlapped by product cards (z-20),
            and the customer quote floats on the left at head level (z-10). */}
        <div className="relative w-full">
          <div className="absolute inset-x-0 top-0 flex justify-center pointer-events-none z-0">
            <div className="relative">
              <div
                className="absolute inset-4 rounded-full bg-primary/25 blur-2xl animate-pulse"
                aria-hidden
              />
              <img
                src="/images/benefit-1-driven-sales-pipeline-2.png"
                alt="Bizmis assistant"
                className={`relative w-[14rem] h-[14rem] xs:w-[16rem] xs:h-[16rem] sm:w-[18rem] sm:h-[18rem] object-contain object-top drop-shadow-xl transition-all ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3"
                }`}
                style={{
                  transitionDelay: isVisible
                    ? `${ENTRANCE_CENTER_MS}ms`
                    : "0ms",
                  transitionDuration: `${ENTRANCE_DURATION_MS}ms`,
                }}
              />
              {/* Mic pulse — kept above products (z-30) at avatar's chest level
                  so the talking cue stays visible despite the product overlap. */}
              <div
                className="absolute left-1/2 -translate-x-1/2 bottom-[7rem] xs:bottom-[8rem] sm:bottom-[9rem] w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md z-30"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transition: `opacity 800ms ease-in-out`,
                  transitionDelay: isVisible
                    ? `${ENTRANCE_CENTER_MS + 400}ms`
                    : "0ms",
                }}
                aria-hidden
              >
                <FaMicrophone className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          {/* Customer quote — plain italic text, no bubble, head level */}
          <p
            className={`absolute left-1 xs:left-2 top-[2.5rem] xs:top-[3rem] sm:top-[4rem] z-10 max-w-[6.5rem] xs:max-w-[8rem] sm:max-w-[10rem] text-[11px] xs:text-xs sm:text-sm italic text-foreground/75 leading-snug transition-all ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
            style={{
              transitionDelay: isVisible ? `${ENTRANCE_CUSTOMER_MS}ms` : "0ms",
              transitionDuration: `${ENTRANCE_DURATION_MS}ms`,
            }}
          >
            {MOBILE_CUSTOMER_QUOTE}
          </p>

          {/* Product cards — pushed down so they overlap the avatar's lower body */}
          <div className="relative z-20 flex flex-row items-end gap-2 w-full justify-center pt-[10rem] xs:pt-[11.5rem] sm:pt-[13rem]">
            {PRODUCTS.map((product, idx) => (
              <div
                key={product.name}
                className={`relative transition-all duration-700 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-4 scale-95"
                } ${product.highlighted ? "-mt-2" : ""}`}
                style={{
                  transitionDelay: isVisible
                    ? `${ENTRANCE_CENTER_MS + ENTRANCE_PRODUCT_OFFSET_MS + idx * ENTRANCE_PRODUCT_STAGGER_MS}ms`
                    : "0ms",
                  transitionDuration: `${ENTRANCE_DURATION_MS}ms`,
                }}
              >
                <div
                  className={`relative rounded-xl border ${
                    product.highlighted
                      ? "bg-white border-primary/40 shadow-[0_8px_24px_-4px_rgba(253,145,42,0.45)] w-[5.5rem] xs:w-24"
                      : "bg-white/95 border-primary/25 shadow-[0_6px_18px_-2px_rgba(0,0,0,0.18)] w-[4.75rem] xs:w-[5.25rem]"
                  }`}
                >
                  <div
                    className={`relative overflow-hidden rounded-t-xl ${
                      product.highlighted ? "h-12 xs:h-14" : "h-10 xs:h-12"
                    } bg-[#FDF7E2]/50`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute top-1 left-1 text-[7px] font-semibold px-1 py-0.5 rounded-full ${
                        product.highlighted
                          ? "bg-primary text-white"
                          : "bg-white/85 text-primary border border-primary/20"
                      }`}
                    >
                      {product.label}
                    </div>
                  </div>
                  <div className="p-1.5">
                    <h4
                      className={`font-heading font-semibold text-[9px] leading-tight mb-0.5 ${
                        product.highlighted
                          ? "text-foreground"
                          : "text-foreground/70"
                      }`}
                    >
                      {product.name}
                    </h4>
                    <span
                      className={`font-bold text-[10px] ${
                        product.highlighted
                          ? "text-primary"
                          : "text-foreground/60"
                      }`}
                    >
                      {product.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compact Order Confirmed pill */}
        <div
          className={`flex items-center gap-2 bg-white/95 rounded-full border border-primary/20 shadow-md px-3 py-1.5 transition-all ease-out ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
          }`}
          style={{
            transitionDelay: isVisible
              ? `${ENTRANCE_CENTER_MS + ENTRANCE_PRODUCT_OFFSET_MS + (PRODUCTS.length - 1) * ENTRANCE_PRODUCT_STAGGER_MS + ENTRANCE_RECEIPT_AFTER_LAST_PRODUCT_MS}ms`
              : "0ms",
            transitionDuration: `${ENTRANCE_DURATION_MS}ms`,
          }}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm shrink-0">
            <FaCheck className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-[11px] xs:text-xs font-medium text-foreground whitespace-nowrap">
            {MOBILE_ORDER_PILL_LABEL}
          </span>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex relative items-center justify-center gap-6">
        {/* Bridging waveform — connects the customer card (left) to the order card
            (right) and passes behind the avatar. Width is constrained so the wave
            never touches the side cards; the bar width matches the benefit-2 wave
            (Waveform defaults). Desktop only: on mobile the layout is vertical so a
            horizontal bridge would not make spatial sense. */}
        <div
          className="hidden lg:flex absolute inset-x-0 top-1/2 -translate-y-1/2 z-0 pointer-events-none items-center mx-auto w-full max-w-[30rem] xl:max-w-[36rem]"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: `opacity 1000ms ease-in-out`,
            transitionDelay: isVisible
              ? `${ENTRANCE_CENTER_MS + 200}ms`
              : "0ms",
          }}
          aria-hidden
        >
          <Waveform
            animating={isVisible}
            barClassName="bg-primary"
            className="h-16 xl:h-20"
            talkingOpacity={BRIDGE_WAVEFORM_TALKING_OPACITY}
            silentOpacity={BRIDGE_WAVEFORM_SILENT_OPACITY}
          />
        </div>

        {/* Column 1: customer card */}
        <div className="relative z-10 flex-1 flex flex-col items-center w-full max-w-[12rem] sm:max-w-[14rem]">
          <CustomerVoiceCard
            imageUrl="/images/benefit-1-driven-sales-pipeline-customer.png"
            quote='"Looking for a birthday gift."'
            isVisible={isVisible}
            transitionDelayMs={ENTRANCE_CUSTOMER_MS}
            transitionDurationMs={ENTRANCE_DURATION_MS}
          />
        </div>

        {/* Column 2: recommendation scene */}
        <div className="relative z-10 flex-[1.4] flex flex-col items-center w-full max-w-full overflow-visible">
          <div
            className={`relative w-full flex flex-col items-center transition-all ease-out min-h-[300px] sm:min-h-[460px] overflow-visible ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: isVisible ? `${ENTRANCE_CENTER_MS}ms` : "0ms",
              transitionDuration: `${ENTRANCE_DURATION_MS}ms`,
            }}
          >
            {/* Avatar behind cards — z-0 so cards can sit in front */}
            <div className="absolute inset-0 flex items-start justify-center pt-0 pointer-events-none z-0">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="absolute -inset-10 rounded-full bg-primary/34 blur-2xl animate-pulse" />
                <div className="absolute -inset-24 rounded-full bg-primary/22 blur-3xl animate-pulse [animation-delay:0.5s]" />
              </div>
              {/* Halo: soft white (background) core with a hint of primary from beneath. */}
              <div
                className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[24rem] xl:w-[28rem] h-[11rem] xl:h-[13rem] rounded-full pointer-events-none"
                style={{
                  background: [
                    "radial-gradient(ellipse, hsl(var(--background) / 0.78) 0%, hsl(var(--background) / 0.42) 50%, transparent 84%)",
                    "radial-gradient(ellipse, hsl(var(--primary) / 0.42) 0%, hsl(var(--primary) / 0.14) 44%, transparent 72%)",
                  ].join(", "),
                }}
                aria-hidden
              />
              <img
                src="/images/benefit-1-driven-sales-pipeline-2.png"
                alt="Bizmis assistant"
                className="relative w-[18rem] h-[18rem] sm:w-[26rem] sm:h-[26rem] md:w-[30rem] md:h-[30rem] lg:w-[34rem] lg:h-[34rem] object-contain object-top drop-shadow-2xl"
              />

              {/* Voice waveform — overlapping avatar, matches Benefit 2 language */}
              <div
                className="absolute bottom-[3.25rem] sm:bottom-[4.5rem] md:bottom-[5.5rem] lg:bottom-[7rem] left-1/2 -translate-x-1/2 z-30 pointer-events-none"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transition: `opacity 800ms ease-in-out`,
                  transitionDelay: isVisible
                    ? `${ENTRANCE_CENTER_MS + 400}ms`
                    : "0ms",
                }}
              >
                <div className="bg-white/70 backdrop-blur-md rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg border border-primary/15 flex items-center gap-2 min-w-[8.5rem] sm:min-w-[11rem] md:min-w-[13rem] lg:min-w-[15rem]">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping [animation-duration:2s]" />
                    <div className="relative w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-sm">
                      <FaMicrophone className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-[1.5px] h-7 flex-1 min-w-0"
                    style={{ opacity: AVATAR_WAVEFORM_ROW_OPACITY }}
                  >
                    {Array.from({ length: WAVEFORM_BARS }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 min-w-[1.5px] rounded-full bg-primary"
                        style={{
                          height: `${WAVEFORM_HEIGHTS[i % WAVEFORM_BARS]}%`,
                          animation: isVisible
                            ? `waveform-pulse 1.2s ease-in-out ${i * 0.04}s infinite alternate`
                            : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation cards — z-20 so they sit clearly in front of avatar */}
            <div className="relative z-20 flex flex-row items-end gap-2 sm:gap-3 md:gap-4 w-full justify-center pt-36 sm:pt-56 md:pt-60 lg:pt-72 overflow-visible">
              {PRODUCTS.map((product, idx) => (
                <div
                  key={product.name}
                  className={`relative transition-all duration-700 ease-out ${
                    isVisible
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-6 scale-95"
                  } ${product.highlighted ? "-mt-3 sm:-mt-4" : ""}`}
                  style={{
                    transitionDelay: isVisible
                      ? `${ENTRANCE_CENTER_MS + ENTRANCE_PRODUCT_OFFSET_MS + idx * ENTRANCE_PRODUCT_STAGGER_MS}ms`
                      : "0ms",
                    transitionDuration: `${ENTRANCE_DURATION_MS}ms`,
                  }}
                >
                  <div
                    className={`relative rounded-2xl border transition-all duration-300 hover:scale-105 ${
                      product.highlighted
                        ? "bg-white border-primary/40 shadow-[0_16px_48px_-8px_rgba(253,145,42,0.55),0_40px_80px_-20px_rgba(0,0,0,0.35)] w-28 sm:w-44 md:w-48"
                        : "bg-white/95 border-primary/25 shadow-[0_12px_36px_-4px_rgba(0,0,0,0.28),0_32px_64px_-12px_rgba(253,145,42,0.28)] w-24 sm:w-36 md:w-40"
                    }`}
                  >
                    {/* Product image */}
                    <div
                      className={`relative overflow-hidden rounded-t-2xl ${
                        product.highlighted ? "h-20 sm:h-32" : "h-16 sm:h-24"
                      } bg-[#FDF7E2]/50`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Label badge */}
                      <div
                        className={`absolute top-1.5 left-1.5 sm:top-2 sm:left-2 text-[8px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          product.highlighted
                            ? "bg-primary text-white"
                            : "bg-white/80 text-primary border border-primary/20"
                        }`}
                      >
                        {product.label}
                      </div>
                    </div>

                    {/* Product info */}
                    <div className="p-2 sm:p-3">
                      <h4
                        className={`font-heading font-semibold text-[11px] sm:text-sm leading-tight mb-0.5 sm:mb-1 ${
                          product.highlighted
                            ? "text-foreground"
                            : "text-foreground/70"
                        }`}
                      >
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`font-bold text-xs sm:text-base ${
                            product.highlighted
                              ? "text-primary"
                              : "text-foreground/60"
                          }`}
                        >
                          {product.price}
                        </span>
                        {product.highlighted && (
                          <div className="hidden sm:flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className="w-2.5 h-2.5 text-primary"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: success card */}
        <div className="relative z-10 flex-1 flex flex-col items-center w-full max-w-[18rem] sm:max-w-[14rem]">
          <div
            className={`w-full transition-all ease-out lg:mt-[-1.5rem] ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: isVisible
                ? `${ENTRANCE_CENTER_MS + ENTRANCE_PRODUCT_OFFSET_MS + (PRODUCTS.length - 1) * ENTRANCE_PRODUCT_STAGGER_MS + ENTRANCE_RECEIPT_AFTER_LAST_PRODUCT_MS}ms`
                : "0ms",
              transitionDuration: `${ENTRANCE_DURATION_MS}ms`,
            }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-primary/15 shadow-lg p-4 sm:p-5 w-full text-center sm:aspect-[3/4] flex flex-col justify-center min-h-0">
              {/* Success icon */}
              <div className="relative w-12 h-12 mx-auto mb-3">
                <div className="absolute -inset-2 rounded-full bg-primary/10 animate-pulse [animation-duration:2.5s]" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
                  <FaCheck className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Confirmation content */}
              <h4 className="text-base font-heading font-bold text-foreground mb-0.5">
                Order Confirmed
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                French Press Kit — $89
              </p>

              {/* Mini receipt */}
              <div className="bg-[#FDF7E2]/60 rounded-xl p-2.5 mb-3 border border-primary/10">
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">$89.00</span>
                </div>
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-muted-foreground">
                    Free
                  </span>
                </div>
                <div className="h-px bg-primary/10 my-1.5" />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">$89.00</span>
                </div>
              </div>

              {/* Delivery estimate */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                <FaShoppingBag className="w-2.5 h-2.5 text-primary" />
                <span>Delivery in 2–3 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakDiscoverBuy;
