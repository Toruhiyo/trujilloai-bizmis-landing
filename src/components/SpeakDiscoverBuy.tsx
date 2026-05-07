import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  Fragment,
} from "react";
import { FaShoppingBag, FaChevronRight } from "react-icons/fa";
import confetti from "canvas-confetti";
import CustomerVoiceCard, {
  ShopperShortCaption,
  SHOPPER_MESSAGE_DRIFT_IN_MS,
  SHOPPER_CAPTION_WORD_INTRA_DRIFT_OFFSET_MS,
} from "./CustomerVoiceCard";
import ReceiptCheckIcon from "./ReceiptCheckIcon";
import Waveform from "./Waveform";
import { SHOPPER_CASES, ShopperCase } from "@/data/shopper-cases";
import { bizmisConfettiColors } from "@/lib/colors";

const INTERSECTION_THRESHOLD = 0.3;
const TRANSITION_MS = 500;
const AVATAR_ENTRANCE_DELAY_MS = 200;
const AVATAR_ENTRANCE_DURATION_MS = 1200;

const CUSTOMER_MESSAGE_OFFSET_MS = 250;
/** Pause after shopper caption karaoke completes before the first product phase. */
const CAPTION_END_TO_PRODUCTS_DELAY_MS = 800;
const TAG_BASE_DELAY_MS = 0;
const TAG_PER_CARD_DELAY_MS = 120;
const TAG_ANIMATION_MS = 420;
const PROMOTE_ANIMATION_MS = 700;
const GLOW_ANIMATION_MS = 1100;
const PRODUCT_ANIMATION_MS = 600;

const RECEIPT_CARD_ANIMATION_MS = 700;
const RECEIPT_TITLE_DELAY_MS = 850;
const RECEIPT_PRODUCT_DELAY_MS = 1000;
const RECEIPT_BREAKDOWN_DELAY_MS = 1150;
const RECEIPT_DELIVERY_DELAY_MS = 1300;
const RECEIPT_ROW_DURATION_MS = 400;

const BRIDGE_WAVEFORM_ACTIVE_OPACITY = 0.55;
const BRIDGE_WAVEFORM_INACTIVE_OPACITY = 0.18;
const BRIDGE_WAVE_FADE_IN_MS = 700;
const BRIDGE_WAVE_FADE_OUT_MS = 580;

const DESKTOP_ROW_GAP_REM = 1;
const MOBILE_ROW_GAP_REM = 0.5;
/** Mobile single-stage cross-fade: leaving element fades out fully before
 *  the next element starts fading in, so caption/products/receipt never
 *  overlap visually. */
const MOBILE_STAGE_FADE_OUT_MS = 280;
const MOBILE_STAGE_FADE_IN_MS = 360;
const MOBILE_STAGE_FADE_IN_DELAY_MS = MOBILE_STAGE_FADE_OUT_MS + 80;
const ADD_TO_CART_TRANSITION_MS = 850;
const ADD_TO_CART_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";
/** Burst once the recommended card has nearly reached center so origin stays aligned. */
const CONFETTI_FIRE_DELAY_MS = Math.round(ADD_TO_CART_TRANSITION_MS * 0.82);
/** Pause after the burst before the order-confirmed receipt appears */
const CONFETTI_TO_RECEIPT_GAP_MS = 1700;
const ADD_TO_CART_PHASE_MS =
  CONFETTI_FIRE_DELAY_MS + CONFETTI_TO_RECEIPT_GAP_MS;
const CONFETTI_Z_INDEX = 60;

const STEPS = [
  { num: 1, label: "Discover & Recommend" },
  { num: 2, label: "Compare Products" },
  { num: 3, label: "Seal the Deal" },
];

/** Maps each mockup phase to the demo step (0-based index) it belongs to so
 *  the step rail can highlight in sync with the active stage. */
const PHASE_TO_STEP: Record<Phase, number> = {
  idle: 0,
  "customer-in": 0,
  speaking: 0,
  "product-1": 1,
  "product-2": 1,
  "product-3": 1,
  recommended: 1,
  "add-to-cart": 2,
  confirmed: 2,
  "audio-off": 2,
  "fade-out": 2,
};
const STEP_HIGHLIGHT_TRANSITION_MS = 450;

type Phase =
  | "idle"
  | "customer-in"
  | "speaking"
  | "product-1"
  | "product-2"
  | "product-3"
  | "recommended"
  | "add-to-cart"
  | "confirmed"
  | "audio-off"
  | "fade-out";

const PHASE_DURATIONS: Record<Phase, number> = {
  idle: 900,
  "customer-in": 1450,
  speaking: 1600,
  "product-1": 520,
  "product-2": 520,
  "product-3": 820,
  recommended: 1950,
  "add-to-cart": ADD_TO_CART_PHASE_MS,
  confirmed: 3500,
  "audio-off": 920,
  "fade-out": 820,
};

const PHASE_ORDER: Phase[] = [
  "idle",
  "customer-in",
  "speaking",
  "product-1",
  "product-2",
  "product-3",
  "recommended",
  "add-to-cart",
  "confirmed",
  "audio-off",
  "fade-out",
];

const CART_BADGE_ANIMATION_MS = 500;

const productPhase = (i: number): Phase =>
  ["product-1", "product-2", "product-3"][i] as Phase;

const fireBizmisConfetti = (origin: { x: number; y: number }) => {
  const colors = bizmisConfettiColors();
  /** Omnidirectional burst from `origin`: spread 360° covers angle ± 180° so
   *  particles radiate outward evenly instead of the default upward cone. */
  const radialBase = {
    origin,
    colors,
    zIndex: CONFETTI_Z_INDEX,
    angle: 90,
    spread: 360,
    drift: 0,
  };
  confetti({
    ...radialBase,
    particleCount: 100,
    startVelocity: 20,
    gravity: 0.0,
    scalar: 1,
    ticks: 125,
    decay: 0.9,
  });
  confetti({
    ...radialBase,
    particleCount: 60,
    startVelocity: 23,
    gravity: 0.0,
    scalar: 0.72,
    ticks: 138,
    decay: 0.9,
  });
};

const SpeakDiscoverBuy = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const desktopRecommendedRef = useRef<HTMLDivElement>(null);
  const mobileRecommendedRef = useRef<HTMLDivElement>(null);
  const bridgeWaveHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [isVisible, setIsVisible] = useState(false);
  const [caseIndex, setCaseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [bridgeWaveTalkingHold, setBridgeWaveTalkingHold] = useState(false);
  const [shopperCaptionPlaybackConsumed, setShopperCaptionPlaybackConsumed] =
    useState(false);

  const currentCase: ShopperCase = SHOPPER_CASES[caseIndex];
  const recommendedIndex = currentCase.products.findIndex(
    (p) => p.id === currentCase.recommendedProductId,
  );
  const recommendedProduct = currentCase.products[recommendedIndex];

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

  const advanceToNext = useCallback(() => {
    setCaseIndex((prev) => (prev + 1) % SHOPPER_CASES.length);
    setPhase("idle");
  }, []);

  const onShopperCaptionPlaybackConsumed = useCallback(() => {
    setShopperCaptionPlaybackConsumed(true);
  }, []);

  useLayoutEffect(() => {
    setShopperCaptionPlaybackConsumed(false);
  }, [caseIndex]);

  useLayoutEffect(() => {
    if (phase === "speaking") {
      setShopperCaptionPlaybackConsumed(false);
    }
  }, [phase]);

  useEffect(() => {
    if (!isVisible) return;
    if (phase === "fade-out") {
      const t = setTimeout(advanceToNext, PHASE_DURATIONS["fade-out"]);
      return () => clearTimeout(t);
    }
    if (phase === "speaking") {
      return;
    }
    const i = PHASE_ORDER.indexOf(phase);
    if (i < PHASE_ORDER.length - 1) {
      const next = PHASE_ORDER[i + 1];
      const t = setTimeout(() => setPhase(next), PHASE_DURATIONS[phase]);
      return () => clearTimeout(t);
    }
  }, [isVisible, phase, advanceToNext]);

  useEffect(() => {
    if (!isVisible || phase !== "speaking") return;
    if (!shopperCaptionPlaybackConsumed) return;
    const t = window.setTimeout(
      () => setPhase("product-1"),
      CAPTION_END_TO_PRODUCTS_DELAY_MS,
    );
    return () => clearTimeout(t);
  }, [isVisible, phase, shopperCaptionPlaybackConsumed]);

  useEffect(() => {
    return () => {
      if (bridgeWaveHoldTimerRef.current !== null) {
        clearTimeout(bridgeWaveHoldTimerRef.current);
        bridgeWaveHoldTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (phase === "audio-off") {
      setBridgeWaveTalkingHold(true);
      if (bridgeWaveHoldTimerRef.current !== null) {
        clearTimeout(bridgeWaveHoldTimerRef.current);
      }
      bridgeWaveHoldTimerRef.current = setTimeout(() => {
        bridgeWaveHoldTimerRef.current = null;
        setBridgeWaveTalkingHold(false);
      }, BRIDGE_WAVE_FADE_OUT_MS);
      return;
    }
    if (phase === "fade-out") {
      return;
    }
    setBridgeWaveTalkingHold(false);
    if (bridgeWaveHoldTimerRef.current !== null) {
      clearTimeout(bridgeWaveHoldTimerRef.current);
      bridgeWaveHoldTimerRef.current = null;
    }
  }, [phase]);

  // Bizmis-primary confetti burst the moment the recommended product centers.
  // Origin is the recommended card's on-screen center (DOM rect of whichever
  // layout is currently rendered) so confetti always erupts from the card.
  useEffect(() => {
    if (phase !== "add-to-cart") return;
    const t = setTimeout(() => {
      const node =
        desktopRecommendedRef.current ?? mobileRecommendedRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      fireBizmisConfetti({
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      });
    }, CONFETTI_FIRE_DELAY_MS);
    return () => clearTimeout(t);
  }, [phase, caseIndex]);

  const phaseIndex = PHASE_ORDER.indexOf(phase);
  const phaseAtLeast = (p: Phase) => phaseIndex >= PHASE_ORDER.indexOf(p);

  const fadingOut = phase === "fade-out";
  const customerVisible = phase !== "idle" && !fadingOut;
  const customerTextVisible = phaseAtLeast("speaking") && !fadingOut;
  const audioActive = phaseAtLeast("speaking") && !phaseAtLeast("audio-off");
  const preAudio = phase === "idle" || phase === "customer-in";
  /** Desktop bridging-wave opacity: 1 from speaking through confirmed, 0 in idle/customer-in/audio-off/fade-out. */
  const bridgeWaveOpaque =
    isVisible && !preAudio && phase !== "audio-off" && phase !== "fade-out";
  /** Mobile bridging-wave stays visible all the way through `confirmed` (parity
   *  with Benefit 2): bars keep showing as silent dots during product/receipt
   *  phases instead of fading the whole waveform out. */
  const mobileBridgeWaveOpaque =
    isVisible && phaseAtLeast("speaking") && phase !== "fade-out";
  const productVisible = (i: number) =>
    phaseAtLeast(productPhase(i)) && !fadingOut;
  const tagsVisible = phaseAtLeast("recommended") && !fadingOut;
  const recommendationActive = phaseAtLeast("recommended");
  const addToCartActive = phaseAtLeast("add-to-cart") && !fadingOut;
  const receiptVisible = phaseAtLeast("confirmed") && !fadingOut;

  /** Mobile-only: caption/products/receipt mutually exclusive in one stage. */
  const mobileCaptionStageVisible = phase === "speaking" && !fadingOut;
  const mobileProductsStageVisible =
    phaseAtLeast("product-1") && !phaseAtLeast("confirmed") && !fadingOut;
  const mobileReceiptStageVisible = receiptVisible;
  const mobileStageTransition = (visible: boolean) =>
    visible
      ? `opacity ${MOBILE_STAGE_FADE_IN_MS}ms ease ${MOBILE_STAGE_FADE_IN_DELAY_MS}ms`
      : `opacity ${MOBILE_STAGE_FADE_OUT_MS}ms ease`;

  const productLabel = (productId: string, fallback: string) =>
    productId === currentCase.recommendedProductId ? "Recommended" : fallback;

  const subtotal = recommendedProduct.price;
  const total = recommendedProduct.price;

  const tagAnimation = (idx: number) =>
    tagsVisible
      ? `product-tag-in ${TAG_ANIMATION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${
          TAG_BASE_DELAY_MS + idx * TAG_PER_CARD_DELAY_MS
        }ms both`
      : "none";

  const promoteAnimation = (promoted: boolean) =>
    promoted
      ? `product-promote ${PROMOTE_ANIMATION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both`
      : "none";

  const activeStepIdx = PHASE_TO_STEP[phase];

  return (
    <div
      ref={sectionRef}
      className="w-full max-w-6xl mx-auto px-4 overflow-visible"
    >
      {/* Step flow synced with mockup phase: grid keeps one rail row at every
          width so highlighting never changes how many lines the strip uses. */}
      <div className="w-full mb-6 flex items-center justify-center overflow-visible">
        <div
          className="grid w-full max-w-3xl mx-auto items-center gap-x-1 sm:gap-x-2 text-primary text-[11px] sm:text-sm font-medium overflow-visible"
          style={{
            gridTemplateColumns:
              "minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr)",
          }}
        >
          {STEPS.map((step, idx) => {
            const isActive = idx === activeStepIdx;
            return (
              <Fragment key={step.num}>
                <div className="flex min-w-0 justify-center overflow-visible px-0.5 sm:px-1">
                  <span className="inline-flex max-w-full justify-center">
                    <span
                      className="flex max-w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 sm:gap-x-2 origin-center text-center"
                      style={{
                        transform: isActive ? "scale(1.18)" : "scale(1)",
                        opacity: isActive ? 1 : 0.55,
                        transition: `transform ${STEP_HIGHLIGHT_TRANSITION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity ${STEP_HIGHLIGHT_TRANSITION_MS}ms ease`,
                      }}
                    >
                      <span
                        className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full text-white text-[10px] sm:text-xs font-semibold flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? "bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.18),0_4px_14px_-2px_hsl(var(--primary)/0.55)]"
                            : "bg-primary-light"
                        }`}
                      >
                        {step.num}
                      </span>
                      <span
                        className={`min-w-0 max-w-[11rem] xs:max-w-[13rem] sm:max-w-none transition-colors duration-300 ${
                          isActive
                            ? "text-primary font-semibold"
                            : "text-primary"
                        }`}
                      >
                        {step.label}
                      </span>
                    </span>
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <span
                    className="inline-flex shrink-0 items-center justify-center select-none self-center px-0.5 sm:px-1"
                    aria-hidden
                  >
                    <FaChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary/60" />
                  </span>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile layout: avatar centered + a shared "stage" below it where the
          caption, products and order receipt take turns. Each layer fades out
          fully before the next one fades in (staggered transition delay) so
          they never visually overlap. */}
      <div className="lg:hidden flex flex-col items-center w-[calc(100%+2rem)] max-w-[100vw] -mx-4 sm:w-full sm:max-w-none sm:mx-0">
        <div className="relative flex justify-center w-full">
          <div
            className="absolute inset-4 rounded-full bg-primary/25 blur-2xl animate-pulse"
            aria-hidden
          />
          {/* Mobile bridging waveform — behind the avatar, parity with Benefit 2. */}
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-0 pointer-events-none flex items-center justify-center px-6 xs:px-8 sm:px-10"
            style={{
              opacity: mobileBridgeWaveOpaque ? 1 : 0,
              transition: mobileBridgeWaveOpaque
                ? `opacity ${BRIDGE_WAVE_FADE_IN_MS}ms ease-in-out`
                : `opacity ${BRIDGE_WAVE_FADE_OUT_MS}ms ease-out`,
              transitionDelay: mobileBridgeWaveOpaque
                ? `${AVATAR_ENTRANCE_DELAY_MS + 200}ms`
                : "0ms",
            }}
            aria-hidden
          >
            <Waveform
              animating={audioActive || bridgeWaveTalkingHold}
              barClassName="bg-primary"
              className="h-12 xs:h-14"
              talkingOpacity={BRIDGE_WAVEFORM_ACTIVE_OPACITY}
              silentOpacity={BRIDGE_WAVEFORM_INACTIVE_OPACITY}
            />
          </div>
          <img
            src="/images/benefit-1-driven-sales-pipeline-2.png"
            alt="Bizmis assistant"
            className={`relative z-10 w-full max-w-[min(32rem,calc(100vw-1rem))] xs:max-w-[min(34rem,calc(100vw-1rem))] sm:max-w-[min(38rem,calc(100vw-1rem))] aspect-square object-contain object-top drop-shadow-xl transition-all ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3"
            }`}
            style={{
              transitionDelay: isVisible
                ? `${AVATAR_ENTRANCE_DELAY_MS}ms`
                : "0ms",
              transitionDuration: `${AVATAR_ENTRANCE_DURATION_MS}ms`,
            }}
          />
        </div>

        <div className="relative w-full min-w-0 max-w-full -mt-[7rem] xs:-mt-[8rem] sm:-mt-[10rem] z-20 flex items-center justify-center min-h-[7.5rem] xs:min-h-[8.5rem] sm:min-h-[9rem] px-4 overflow-visible">
          {/* Caption layer */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none px-4"
            style={{
              opacity: mobileCaptionStageVisible ? 1 : 0,
              transition: mobileStageTransition(mobileCaptionStageVisible),
            }}
          >
            <div
              key={`mobile-quote-${caseIndex}`}
              className="overflow-visible w-full max-w-[19rem] xs:max-w-[22rem] sm:max-w-[25rem] flex justify-center"
              style={{
                opacity: customerTextVisible ? 1 : 0,
                transition: `opacity ${SHOPPER_MESSAGE_DRIFT_IN_MS}ms ease-out`,
                transitionDelay: customerTextVisible
                  ? `${CUSTOMER_MESSAGE_OFFSET_MS}ms`
                  : "0ms",
              }}
            >
              <div className="relative overflow-visible px-3 py-2 flex justify-center">
                <ShopperShortCaption
                  quote={currentCase.customerQuote}
                  shown={customerTextVisible}
                  wordBaseDelayMs={
                    CUSTOMER_MESSAGE_OFFSET_MS +
                    SHOPPER_CAPTION_WORD_INTRA_DRIFT_OFFSET_MS
                  }
                  textClassName="text-[15px] xs:text-[16px] sm:text-[17px] leading-tight"
                  className="justify-center text-center"
                  onCaptionPlaybackConsumed={onShopperCaptionPlaybackConsumed}
                />
              </div>
            </div>
          </div>

          {/* Products layer */}
          {/* Bottom-aligned so cards sit on torso/waist, not over the face */}
          <div
            className="absolute inset-0 flex min-w-0 max-w-full flex-col justify-end items-center px-0 pb-3 xs:pb-4 sm:pb-5 pointer-events-none"
            style={{
              opacity: mobileProductsStageVisible ? 1 : 0,
              transition: mobileStageTransition(mobileProductsStageVisible),
            }}
          >
            {/*
              Equal-width columns + min-w-0 so three cards always fit inside
              the padded stage on narrow viewports (no horizontal clipping).
              gap-x-2 matches MOBILE_ROW_GAP_REM for add-to-cart recenter math.
            */}
            <div className="grid w-full min-w-0 max-w-full grid-cols-3 gap-x-2">
              {currentCase.products.map((product, idx) => {
                const isRecommended = idx === recommendedIndex;
                const visible = productVisible(idx);
                const promoted = recommendationActive && isRecommended;
                const dismissed = addToCartActive && !isRecommended;
                const addedToCart = addToCartActive && isRecommended;
                const showImageTag =
                  tagsVisible && !(isRecommended && addedToCart);
                const cardOpacity = dismissed ? 0 : visible ? 1 : 0;
                const recenterX = `calc(${1 - idx} * (100% + ${MOBILE_ROW_GAP_REM}rem))`;
                const cardTransform = dismissed
                  ? "translateY(14px) scale(0.85)"
                  : addedToCart
                    ? `translateX(${recenterX}) translateY(-6px) scale(1.06)`
                    : visible
                      ? "translateY(0) scale(1)"
                      : "translateY(0.75rem) scale(0.95)";
                const cardTransition = addedToCart
                  ? `transform ${ADD_TO_CART_TRANSITION_MS}ms ${ADD_TO_CART_EASE}, opacity 400ms ease`
                  : `opacity ${PRODUCT_ANIMATION_MS}ms ease, transform ${PRODUCT_ANIMATION_MS}ms ease`;
                return (
                  <div
                    key={`mobile-${currentCase.id}-${product.id}`}
                    ref={isRecommended ? mobileRecommendedRef : undefined}
                    className="relative flex min-w-0 w-full max-w-full flex-col justify-end"
                    style={{
                      opacity: cardOpacity,
                      transform: cardTransform,
                      transition: cardTransition,
                    }}
                  >
                    {promoted && (
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{
                          animation: `product-glow-ring ${GLOW_ANIMATION_MS}ms ease-out both`,
                        }}
                      />
                    )}
                    <div
                      className={`relative w-full min-w-0 max-w-full rounded-xl border transition-all duration-500 ${
                        promoted
                          ? "bg-white border-primary/40 shadow-[0_8px_24px_-4px_rgba(253,145,42,0.45)] -mt-2"
                          : "bg-white/95 border-primary/25 shadow-[0_6px_18px_-2px_rgba(0,0,0,0.18)]"
                      }`}
                      style={{ animation: promoteAnimation(promoted) }}
                    >
                      <div className="relative aspect-[5/4] w-full overflow-hidden rounded-t-xl bg-[#FDF7E2]/50">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div
                          className={`pointer-events-none absolute inset-x-0 top-0 z-[6] flex items-start gap-1 px-1 pt-0.5 ${
                            addedToCart && isRecommended ? "justify-end" : ""
                          }`}
                        >
                          {showImageTag && (
                            <div
                              className="min-w-0 flex-1 overflow-hidden pr-0.5"
                              style={{
                                opacity: 1,
                                animation: tagAnimation(idx),
                              }}
                            >
                              <span
                                className={`inline-block max-w-full truncate rounded-full px-1 py-0.5 text-[8px] xs:text-[9px] font-semibold ${
                                  isRecommended
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-white/85 text-primary border border-primary/20"
                                }`}
                              >
                                {productLabel(product.id, product.label)}
                              </span>
                            </div>
                          )}
                          {addedToCart && (
                            <div
                              className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-md"
                              style={{
                                animation: `cart-badge-in ${CART_BADGE_ANIMATION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both`,
                              }}
                              aria-hidden
                            >
                              <FaShoppingBag className="h-2 w-2 shrink-0 xs:h-2.5 xs:w-2.5" />
                              <span className="whitespace-nowrap">Added</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-1 xs:p-1.5 sm:p-2">
                        <h4
                          className={`font-heading font-semibold text-[10px] xs:text-[11px] leading-tight mb-0.5 line-clamp-2 transition-colors duration-300 ${
                            promoted ? "text-foreground" : "text-foreground/70"
                          }`}
                        >
                          {product.name}
                        </h4>
                        <span
                          className={`font-bold text-[11px] xs:text-[12px] transition-colors duration-300 ${
                            promoted ? "text-primary" : "text-foreground/60"
                          }`}
                        >
                          {product.price}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Receipt layer */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none px-3 xs:px-5"
            style={{
              opacity: mobileReceiptStageVisible ? 1 : 0,
              transition: mobileStageTransition(mobileReceiptStageVisible),
            }}
          >
            {receiptVisible && (
              <div
                key={`mobile-receipt-${caseIndex}`}
                className="flex max-w-full min-w-0 items-center gap-2 rounded-3xl border border-primary/20 bg-white/95 px-3 py-2 shadow-md xs:gap-2.5 xs:px-4"
                style={{
                  animation: `order-receipt-in ${RECEIPT_CARD_ANIMATION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both`,
                }}
              >
                <ReceiptCheckIcon size={24} pathSize={16} />
                <span
                  className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left text-[12px] font-medium text-foreground xs:text-[13px] xs:text-sm"
                  style={{
                    animation: `receipt-row-in ${RECEIPT_ROW_DURATION_MS}ms ease-out ${RECEIPT_TITLE_DELAY_MS}ms both`,
                  }}
                  title={`Order Confirmed · ${recommendedProduct.name} · ${recommendedProduct.price}`}
                >
                  {`Order Confirmed · ${recommendedProduct.name} · ${recommendedProduct.price}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex relative items-center justify-center gap-6 overflow-visible">
        {/* Bridging waveform behind avatar — switches between active/inactive
            opacity per choreography phase. This is the only audio indicator. */}
        <div
          className="hidden lg:flex absolute inset-x-0 top-1/2 -translate-y-1/2 z-0 pointer-events-none items-center mx-auto w-full max-w-[30rem] xl:max-w-[36rem]"
          style={{
            opacity: bridgeWaveOpaque ? 1 : 0,
            transition: bridgeWaveOpaque
              ? `opacity ${BRIDGE_WAVE_FADE_IN_MS}ms ease-in-out`
              : `opacity ${BRIDGE_WAVE_FADE_OUT_MS}ms ease-out`,
            transitionDelay: bridgeWaveOpaque
              ? `${AVATAR_ENTRANCE_DELAY_MS + 200}ms`
              : "0ms",
          }}
          aria-hidden
        >
          <Waveform
            animating={audioActive || bridgeWaveTalkingHold}
            barClassName="bg-primary"
            className="h-16 xl:h-20"
            talkingOpacity={BRIDGE_WAVEFORM_ACTIVE_OPACITY}
            silentOpacity={BRIDGE_WAVEFORM_INACTIVE_OPACITY}
          />
        </div>

        {/* Column 1: customer card */}
        <div className="relative z-10 flex-1 flex flex-col items-center w-full max-w-[12rem] sm:max-w-[14rem] overflow-visible">
          <div
            className="w-full"
            style={{
              opacity: customerVisible ? 1 : 0,
              transform: customerVisible
                ? "translateX(0)"
                : "translateX(-1rem)",
              transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
            }}
          >
            <CustomerVoiceCard
              key={`desktop-customer-${caseIndex}`}
              imageUrl={currentCase.customerImage}
              quote={currentCase.customerQuote}
              isVisible={customerVisible}
              quoteVisible={customerTextVisible}
              quoteEnterDelayMs={CUSTOMER_MESSAGE_OFFSET_MS}
              onCaptionPlaybackConsumed={onShopperCaptionPlaybackConsumed}
            />
          </div>
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
              transitionDelay: isVisible
                ? `${AVATAR_ENTRANCE_DELAY_MS}ms`
                : "0ms",
              transitionDuration: `${AVATAR_ENTRANCE_DURATION_MS}ms`,
            }}
          >
            {/* Avatar behind cards */}
            <div className="absolute inset-0 flex items-start justify-center pt-0 pointer-events-none z-0">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="absolute -inset-10 rounded-full bg-primary/34 blur-2xl animate-pulse" />
                <div className="absolute -inset-24 rounded-full bg-primary/22 blur-3xl animate-pulse [animation-delay:0.5s]" />
              </div>
              {/* Halo: soft white core to ease the bridging wave near the avatar silhouette. */}
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
            </div>

            {/* Recommendation cards. Uniform `gap-4` so the recenter calc is a
                single rem value across breakpoints. */}
            <div className="relative z-20 flex flex-row items-end gap-4 w-full justify-center pt-36 sm:pt-56 md:pt-60 lg:pt-72 overflow-visible">
              {currentCase.products.map((product, idx) => {
                const isRecommended = idx === recommendedIndex;
                const visible = productVisible(idx);
                const promoted = recommendationActive && isRecommended;
                const dismissed = addToCartActive && !isRecommended;
                const addedToCart = addToCartActive && isRecommended;
                const showImageTag =
                  tagsVisible && !(isRecommended && addedToCart);
                const cardOpacity = dismissed ? 0 : visible ? 1 : 0;
                const recenterX = `calc(${1 - idx} * (100% + ${DESKTOP_ROW_GAP_REM}rem))`;
                const cardTransform = dismissed
                  ? "translateY(28px) scale(0.85)"
                  : addedToCart
                    ? `translateX(${recenterX}) translateY(-12px) scale(1.06)`
                    : visible
                      ? "translateY(0) scale(1)"
                      : "translateY(1rem) scale(0.95)";
                const cardTransition = addedToCart
                  ? `transform ${ADD_TO_CART_TRANSITION_MS}ms ${ADD_TO_CART_EASE}, opacity 400ms ease`
                  : `opacity ${PRODUCT_ANIMATION_MS}ms ease, transform ${PRODUCT_ANIMATION_MS}ms ease`;
                return (
                  <div
                    key={`desktop-${currentCase.id}-${product.id}`}
                    ref={isRecommended ? desktopRecommendedRef : undefined}
                    className="relative"
                    style={{
                      opacity: cardOpacity,
                      transform: cardTransform,
                      transition: cardTransition,
                    }}
                  >
                    {promoted && (
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          animation: `product-glow-ring ${GLOW_ANIMATION_MS}ms ease-out both`,
                        }}
                      />
                    )}
                    <div
                      className={`relative rounded-2xl border transition-all duration-500 hover:scale-105 w-28 sm:w-44 md:w-48 ${
                        promoted
                          ? "bg-white border-primary/40 shadow-[0_16px_48px_-8px_rgba(253,145,42,0.55),0_40px_80px_-20px_rgba(0,0,0,0.35)] -mt-3 sm:-mt-4"
                          : "bg-white/95 border-primary/25 shadow-[0_12px_36px_-4px_rgba(0,0,0,0.28),0_32px_64px_-12px_rgba(253,145,42,0.28)]"
                      }`}
                      style={{ animation: promoteAnimation(promoted) }}
                    >
                      <div className="relative overflow-hidden rounded-t-2xl bg-[#FDF7E2]/50 h-20 sm:h-32">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div
                          className={`pointer-events-none absolute inset-x-0 top-0 z-[6] flex items-start gap-1 px-1 pt-1 sm:gap-1.5 sm:px-2 sm:pt-1.5 ${
                            addedToCart && isRecommended ? "justify-end" : ""
                          }`}
                        >
                          {showImageTag && (
                            <div
                              className="min-w-0 flex-1 overflow-hidden pr-0.5 sm:pr-1"
                              style={{
                                opacity: 1,
                                animation: tagAnimation(idx),
                              }}
                            >
                              <span
                                className={`inline-block max-w-full truncate rounded-full px-1.5 py-0.5 text-[8px] font-semibold sm:px-2 sm:py-0.5 sm:text-[10px] ${
                                  isRecommended
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-white/80 text-primary border border-primary/20"
                                }`}
                              >
                                {productLabel(product.id, product.label)}
                              </span>
                            </div>
                          )}
                          {addedToCart && (
                            <div
                              className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-white shadow-md"
                              style={{
                                animation: `cart-badge-in ${CART_BADGE_ANIMATION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both`,
                              }}
                              aria-hidden
                            >
                              <FaShoppingBag className="h-2.5 w-2.5 shrink-0" />
                              <span className="whitespace-nowrap">Added</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-2 sm:p-3">
                        <h4
                          className={`font-heading font-semibold text-[11px] sm:text-sm leading-tight mb-0.5 sm:mb-1 transition-colors duration-300 ${
                            promoted ? "text-foreground" : "text-foreground/70"
                          }`}
                        >
                          {product.name}
                        </h4>
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`font-bold text-xs sm:text-base transition-colors duration-300 ${
                              promoted ? "text-primary" : "text-foreground/60"
                            }`}
                          >
                            {product.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 3: success card */}
        <div className="relative z-10 flex-1 flex flex-col items-center w-full max-w-[18rem] sm:max-w-[14rem]">
          <div
            className="w-full lg:mt-[-1.5rem]"
            style={{
              opacity: receiptVisible ? 1 : 0,
              transition: `opacity ${TRANSITION_MS}ms ease`,
            }}
          >
            {receiptVisible && (
              <ReceiptCard
                key={`desktop-receipt-${caseIndex}`}
                productName={recommendedProduct.name}
                productPrice={recommendedProduct.price}
                deliveryEstimate={currentCase.deliveryEstimate}
                subtotal={subtotal}
                total={total}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ReceiptCardProps {
  productName: string;
  productPrice: string;
  deliveryEstimate: string;
  subtotal: string;
  total: string;
}

const ReceiptCard = ({
  productName,
  productPrice,
  deliveryEstimate,
  subtotal,
  total,
}: ReceiptCardProps) => (
  <div
    className="bg-white/80 backdrop-blur-sm rounded-3xl border border-primary/15 shadow-lg p-4 sm:p-5 w-full text-center sm:aspect-[3/4] flex flex-col justify-center min-h-0"
    style={{
      animation: `order-receipt-in ${RECEIPT_CARD_ANIMATION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both`,
    }}
  >
    <div className="mx-auto mb-3">
      <ReceiptCheckIcon />
    </div>

    <h4
      className="text-base font-heading font-bold text-foreground mb-0.5"
      style={{
        animation: `receipt-row-in ${RECEIPT_ROW_DURATION_MS}ms ease-out ${RECEIPT_TITLE_DELAY_MS}ms both`,
      }}
    >
      Order Confirmed
    </h4>
    <p
      className="text-xs text-muted-foreground mb-3"
      style={{
        animation: `receipt-row-in ${RECEIPT_ROW_DURATION_MS}ms ease-out ${RECEIPT_PRODUCT_DELAY_MS}ms both`,
      }}
    >
      {productName} - {productPrice}
    </p>

    <div
      className="bg-[#FDF7E2]/60 rounded-xl p-2.5 mb-3 border border-primary/10"
      style={{
        animation: `receipt-row-in ${RECEIPT_ROW_DURATION_MS}ms ease-out ${RECEIPT_BREAKDOWN_DELAY_MS}ms both`,
      }}
    >
      <div className="flex items-center justify-between text-[10px] mb-1.5">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{subtotal}</span>
      </div>
      <div className="flex items-center justify-between text-[10px] mb-1.5">
        <span className="text-muted-foreground">Shipping</span>
        <span className="font-medium text-muted-foreground">Free</span>
      </div>
      <div className="h-px bg-primary/10 my-1.5" />
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">Total</span>
        <span className="font-bold text-primary">{total}</span>
      </div>
    </div>

    <div
      className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground"
      style={{
        animation: `receipt-row-in ${RECEIPT_ROW_DURATION_MS}ms ease-out ${RECEIPT_DELIVERY_DELAY_MS}ms both`,
      }}
    >
      <FaShoppingBag className="w-2.5 h-2.5 text-primary" />
      <span>{deliveryEstimate}</span>
    </div>
  </div>
);

export default SpeakDiscoverBuy;
