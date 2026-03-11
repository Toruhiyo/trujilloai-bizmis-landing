import { useEffect, useRef, useState } from "react";
import {
  FaMicrophone,
  FaCheck,
  FaStar,
  FaShoppingBag,
  FaChevronRight,
} from "react-icons/fa";

const WAVEFORM_BARS = 24;
const ANIMATION_STAGGER_MS = 150;
const INTERSECTION_THRESHOLD = 0.3;
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
      { threshold: INTERSECTION_THRESHOLD }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="w-full max-w-6xl mx-auto px-4">
      {/* Minimal step flow: 1 → 2 → 3 */}
      <div className="w-full mb-6 flex items-center justify-center">
        <div className="flex items-center gap-2 sm:gap-4 text-[#FD912A]/65 text-xs sm:text-sm font-medium">
          {STEPS.map((step, idx) => (
            <span key={step.num} className="flex items-center gap-1.5 sm:gap-2">
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FD912A]/65 text-white text-[10px] sm:text-xs font-semibold flex items-center justify-center">
                {step.num}
              </span>
              <span>{step.label}</span>
              {idx < STEPS.length - 1 && (
                <FaChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#FD912A]/60 ml-0.5" aria-hidden />
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6">
        {/* Column 1: customer card */}
        <div className="relative z-10 flex-1 flex flex-col items-center w-full max-w-[14rem]">
          <div
            className={`w-full transition-all ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: isVisible ? `${ENTRANCE_CUSTOMER_MS}ms` : "0ms",
              transitionDuration: `${ENTRANCE_DURATION_MS}ms`,
            }}
          >
            <div
              className="relative overflow-hidden rounded-3xl border border-[#FD912A]/15 shadow-lg w-full aspect-[3/4] mx-auto bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/images/benefit-1-driven-sales-pipeline-customer.png')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col justify-end h-full">
                {/* Mic (small) + waveform in one row */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-[#FD912A]/20 animate-ping [animation-duration:2s]" />
                    <div className="relative w-9 h-9 bg-gradient-to-br from-[#FD912A] to-[#FD912A]/80 rounded-full flex items-center justify-center shadow-md">
                      <FaMicrophone className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-[2px] h-8 flex-1 min-w-0">
                    {Array.from({ length: WAVEFORM_BARS }).map((_, i) => {
                      const baseHeight = [
                        28, 42, 55, 38, 62, 48, 70, 30, 58, 45, 65, 35,
                        50, 68, 40, 55, 32, 60, 44, 72, 36, 52, 46, 64,
                      ][i % WAVEFORM_BARS];
                      return (
                        <div
                          key={i}
                          className="flex-1 min-w-[2px] max-w-[3px] rounded-full bg-[#FD912A]/80"
                          style={{
                            height: `${baseHeight}%`,
                            animation: isVisible
                              ? `waveform-pulse 1.2s ease-in-out ${i * 0.05}s infinite alternate`
                              : "none",
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
                <p className="text-sm text-white/90 italic font-body drop-shadow-sm">
                  "Looking for a birthday gift."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: recommendation scene */}
        <div className="relative z-10 flex-[1.4] flex flex-col items-center w-full max-w-full overflow-visible">
          <div
            className={`relative w-full flex flex-col items-center transition-all ease-out min-h-[380px] sm:min-h-[460px] overflow-visible ${
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
              <div className="absolute -inset-10 rounded-full bg-[#FD912A]/10 blur-2xl animate-pulse" />
              <div className="absolute -inset-20 rounded-full bg-[#FD912A]/5 blur-3xl animate-pulse [animation-delay:0.5s]" />
            </div>
            <img
              src="/images/benefit-1-driven-sales-pipeline-2.png"
              alt="Bizmis assistant"
              className="relative w-[26rem] h-[26rem] sm:w-[30rem] sm:h-[30rem] lg:w-[34rem] lg:h-[34rem] object-contain object-top drop-shadow-2xl opacity-90"
            />
          </div>

          {/* Recommendation cards — z-20 so they sit clearly in front of avatar */}
          <div className="relative z-20 flex flex-col sm:flex-row items-center sm:items-end gap-4 w-full justify-center pt-52 sm:pt-56 lg:pt-72 overflow-visible">
            {PRODUCTS.map((product, idx) => (
              <div
                key={product.name}
                className={`relative transition-all duration-700 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-6 scale-95"
                } ${
                  product.highlighted
                    ? "sm:-mt-4"
                    : ""
                }`}
                style={{
                  transitionDelay: isVisible ? `${ENTRANCE_CENTER_MS + ENTRANCE_PRODUCT_OFFSET_MS + idx * ENTRANCE_PRODUCT_STAGGER_MS}ms` : "0ms",
                  transitionDuration: `${ENTRANCE_DURATION_MS}ms`,
                }}
              >
                <div
                  className={`relative rounded-2xl border transition-all duration-300 hover:scale-105 ${
                    product.highlighted
                      ? "bg-white border-[#FD912A]/40 shadow-[0_16px_48px_-8px_rgba(253,145,42,0.55),0_40px_80px_-20px_rgba(0,0,0,0.35)] w-44 sm:w-48"
                      : "bg-white/95 border-[#FD912A]/25 shadow-[0_12px_36px_-4px_rgba(0,0,0,0.28),0_32px_64px_-12px_rgba(253,145,42,0.28)] w-36 sm:w-40"
                  }`}
                >
                  {/* Product image */}
                  <div
                    className={`relative overflow-hidden rounded-t-2xl ${
                      product.highlighted ? "h-32" : "h-24"
                    } bg-[#FDF7E2]/50`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Label badge */}
                    <div
                      className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        product.highlighted
                          ? "bg-[#FD912A] text-white"
                          : "bg-white/80 text-[#FD912A] border border-[#FD912A]/20"
                      }`}
                    >
                      {product.label}
                    </div>
                  </div>

                  {/* Product info */}
                  <div className="p-3">
                    <h4
                      className={`font-heading font-semibold text-sm leading-tight mb-1 ${
                        product.highlighted
                          ? "text-foreground"
                          : "text-foreground/70"
                      }`}
                    >
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-bold text-base ${
                          product.highlighted
                            ? "text-[#FD912A]"
                            : "text-foreground/60"
                        }`}
                      >
                        {product.price}
                      </span>
                      {product.highlighted && (
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className="w-2.5 h-2.5 text-[#FD912A]"
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
        <div className="relative z-10 flex-1 flex flex-col items-center w-full max-w-[14rem]">
          <div
            className={`w-full transition-all ease-out lg:mt-[-1.5rem] ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: isVisible ? `${ENTRANCE_CENTER_MS + ENTRANCE_PRODUCT_OFFSET_MS + (PRODUCTS.length - 1) * ENTRANCE_PRODUCT_STAGGER_MS + ENTRANCE_RECEIPT_AFTER_LAST_PRODUCT_MS}ms` : "0ms",
              transitionDuration: `${ENTRANCE_DURATION_MS}ms`,
            }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#FD912A]/15 shadow-lg p-5 w-full text-center aspect-[3/4] flex flex-col justify-center min-h-0">
            {/* Success icon */}
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute -inset-2 rounded-full bg-[#FD912A]/10 animate-pulse [animation-duration:2.5s]" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-[#FD912A] to-[#FD912A]/80 rounded-full flex items-center justify-center shadow-md">
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
            <div className="bg-[#FDF7E2]/60 rounded-xl p-2.5 mb-3 border border-[#FD912A]/10">
              <div className="flex items-center justify-between text-[10px] mb-1.5">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">$89.00</span>
              </div>
              <div className="flex items-center justify-between text-[10px] mb-1.5">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-muted-foreground">Free</span>
              </div>
              <div className="h-px bg-[#FD912A]/10 my-1.5" />
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-[#FD912A]">$89.00</span>
              </div>
            </div>

            {/* Delivery estimate */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
              <FaShoppingBag className="w-2.5 h-2.5 text-[#FD912A]" />
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
